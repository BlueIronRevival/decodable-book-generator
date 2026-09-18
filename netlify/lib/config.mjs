// ===== Server configuration =====
//
// Every secret comes from an environment variable set in the Netlify UI
// (Site configuration -> Environment variables), never from a file in this
// repo. See .env.example for the list and README.md for how to generate them.
export function readConfig() {
  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.AUTH_SECRET;
  const displayName = (process.env.ADMIN_DISPLAY_NAME || 'Administrator').trim();
  const minutes = Number.parseInt(process.env.SESSION_MINUTES || '240', 10);

  // Fail closed. A missing hash or secret must lock everyone out, never let
  // everyone in — a misconfigured deploy should be obvious and safe, not open.
  const missing = [];
  if (!passwordHash) missing.push('ADMIN_PASSWORD_HASH');
  if (!secret) missing.push('AUTH_SECRET');

  return {
    username,
    passwordHash,
    secret,
    displayName,
    minutes: Number.isInteger(minutes) && minutes > 0 ? minutes : 240,
    ok: missing.length === 0,
    missing
  };
}

export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers }
  });
