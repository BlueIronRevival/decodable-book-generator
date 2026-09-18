// ===== POST /api/login =====
//
// The only place a password is ever checked. The browser sends a username and
// password over HTTPS; this function compares against the PBKDF2 hash in
// ADMIN_PASSWORD_HASH and, on success, returns a short-lived signed token.
//
// Nothing about the password reaches the client — not the hash, not the salt,
// not the iteration count.
import { getStore } from '@netlify/blobs';
import { readConfig, json } from '../lib/config.mjs';
import { verifyPassword, issueToken } from '../lib/credentials.mjs';

// Brute-force guard. A single shared password is the weak point of this
// design, so failed attempts from one address are capped. Best-effort only:
// an attacker with many addresses is slowed by PBKDF2's cost, not by this.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

async function readAttempts(store, key) {
  try {
    return (await store.get(key, { type: 'json', consistency: 'strong' })) || null;
  } catch {
    // The throttle must never be the reason a legitimate admin cannot log in.
    return null;
  }
}

async function writeAttempts(store, key, value) {
  try {
    if (value === null) await store.delete(key);
    else await store.setJSON(key, value);
  } catch {
    // Losing the counter degrades the throttle, not the password check.
  }
}

export default async (request, context) => {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const settings = readConfig();
  if (!settings.ok) {
    // Deliberately specific: this is a deploy mistake by the site owner, not
    // something an attacker learns anything useful from.
    return json({ error: `The server is missing ${settings.missing.join(' and ')}. Sign-in is disabled until it is set.` }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  const username = String((body && body.username) || '').trim();
  const password = String((body && body.password) || '');
  if (!username || !password) return json({ error: 'Enter both a username and a password.' }, 400);

  const ip = context.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';
  const store = getStore({ name: 'login-attempts', consistency: 'strong' });
  const record = await readAttempts(store, ip);
  const now = Date.now();

  if (record && record.until && now < record.until) {
    const minutes = Math.ceil((record.until - now) / 60000);
    return json({ error: `Too many failed attempts. Try again in ${minutes} minute(s).` }, 429);
  }

  const nameMatches = username.toLowerCase() === settings.username.toLowerCase();
  // Verify the password even when the username is wrong, so both failures cost
  // the same time and neither reveals whether the username exists.
  const passwordMatches = verifyPassword(password, settings.passwordHash);

  if (!nameMatches || !passwordMatches) {
    const fresh = record && record.first && now - record.first < WINDOW_MS
      ? { count: record.count + 1, first: record.first }
      : { count: 1, first: now };
    if (fresh.count >= MAX_ATTEMPTS) fresh.until = now + LOCKOUT_MS;
    await writeAttempts(store, ip, fresh);

    const left = MAX_ATTEMPTS - fresh.count;
    const note = left > 0 && left <= 3 ? ` ${left} attempt(s) left before a lockout.` : '';
    return json({ error: `That username and password do not match.${note}` }, 401);
  }

  await writeAttempts(store, ip, null);

  const { token, expires } = issueToken({
    username: settings.username,
    displayName: settings.displayName,
    minutes: settings.minutes
  }, settings.secret);

  return json({ token, expires, displayName: settings.displayName });
};

export const config = { path: '/api/login' };
