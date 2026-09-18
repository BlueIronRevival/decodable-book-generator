// ===== Password hashing and session tokens =====
//
// This file runs on the server only. Nothing here is ever sent to the browser,
// which is the whole point: the password check happens somewhere the visitor
// does not control.
//
// The password is never stored, in this repo or anywhere else — only a PBKDF2
// hash of it, in the ADMIN_PASSWORD_HASH environment variable. Generate one
// with `node tools/hash-password.mjs`.
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

// OWASP's floor for PBKDF2-HMAC-SHA256 (2023). Raising it is safe: the
// iteration count is recorded in each hash, so old hashes keep verifying.
export const PBKDF2_ITERATIONS = 210000;
const KEY_BYTES = 32;
const SALT_BYTES = 16;

/** `pbkdf2$sha256$<iterations>$<salt b64>$<hash b64>` */
export function hashPassword(password, iterations = PBKDF2_ITERATIONS) {
  const salt = randomBytes(SALT_BYTES);
  const hash = pbkdf2Sync(password, salt, iterations, KEY_BYTES, 'sha256');
  return `pbkdf2$sha256$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * Compare a candidate password against a stored hash. Always uses a
 * constant-time comparison so the time taken does not leak how much of the
 * hash matched.
 */
export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;

  const parts = stored.split('$');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') return false;

  const iterations = Number.parseInt(parts[2], 10);
  if (!Number.isInteger(iterations) || iterations < 1) return false;

  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[3], 'base64');
    expected = Buffer.from(parts[4], 'base64');
  } catch {
    return false;
  }
  if (!salt.length || !expected.length) return false;

  const actual = pbkdf2Sync(password, salt, iterations, expected.length, 'sha256');
  return timingSafeEqual(actual, expected);
}

// ===== Session tokens =====
//
// A compact HMAC-signed token: `<payload>.<signature>`, both base64url. The
// browser holds it and sends it back; the server trusts it only because it can
// re-derive the signature with AUTH_SECRET, which never leaves the server.
// There is no encryption here — the payload is readable, it just cannot be
// forged or altered.

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payloadB64, secret) {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export function issueToken({ username, displayName, minutes }, secret) {
  const now = Date.now();
  const payload = b64url(JSON.stringify({
    sub: username,
    name: displayName,
    iat: now,
    exp: now + minutes * 60 * 1000
  }));
  return { token: `${payload}.${sign(payload, secret)}`, expires: now + minutes * 60 * 1000 };
}

/** Returns the payload for a valid unexpired token, or null. Never throws. */
export function readToken(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) return null;

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = Buffer.from(sign(payloadB64, secret));
  const supplied = Buffer.from(signature);
  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false.
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}

/** Pull a bearer token out of an Authorization header. */
export function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer (.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}
