// Tests for the server-side password and token handling.
//   npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword, verifyPassword, issueToken, readToken, bearerToken
} from '../netlify/lib/credentials.mjs';

// A low iteration count keeps the suite fast; the format is what is under test.
const FAST = 1000;
const SECRET = 'test-secret-not-a-real-one';

test('a correct password verifies', () => {
  const hash = hashPassword('correct horse battery staple', FAST);
  assert.equal(verifyPassword('correct horse battery staple', hash), true);
});

test('a wrong password does not', () => {
  const hash = hashPassword('correct horse battery staple', FAST);
  assert.equal(verifyPassword('Correct horse battery staple', hash), false);
  assert.equal(verifyPassword('', hash), false);
  assert.equal(verifyPassword('correct horse battery stapl', hash), false);
});

test('the password is not recoverable from the hash', () => {
  const password = 'correct horse battery staple';
  const hash = hashPassword(password, FAST);
  assert.ok(!hash.includes(password));
  assert.match(hash, /^pbkdf2\$sha256\$1000\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
});

test('the same password hashes differently every time', () => {
  // Distinct salts: two admins with the same password must not share a hash.
  assert.notEqual(hashPassword('same password', FAST), hashPassword('same password', FAST));
});

test('a malformed hash is rejected rather than throwing', () => {
  for (const bad of ['', 'nonsense', 'pbkdf2$sha256$abc$x$y', 'pbkdf2$md5$1000$x$y',
                     'pbkdf2$sha256$1000$$', null, undefined, 42, {}]) {
    assert.equal(verifyPassword('anything', bad), false);
  }
});

test('a freshly issued token reads back', () => {
  const { token, expires } = issueToken({ username: 'admin', displayName: 'Admin', minutes: 60 }, SECRET);
  const payload = readToken(token, SECRET);
  assert.equal(payload.sub, 'admin');
  assert.equal(payload.name, 'Admin');
  assert.ok(expires > Date.now());
});

test('a token signed with another secret is rejected', () => {
  const { token } = issueToken({ username: 'admin', displayName: 'Admin', minutes: 60 }, SECRET);
  assert.equal(readToken(token, 'a different secret'), null);
});

test('an altered payload is rejected', () => {
  const { token } = issueToken({ username: 'admin', displayName: 'Admin', minutes: 60 }, SECRET);
  const [, signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({
    sub: 'attacker', name: 'Attacker', iat: Date.now(), exp: Date.now() + 9e9
  })).toString('base64url');
  assert.equal(readToken(`${forged}.${signature}`, SECRET), null);
});

test('an expired token is rejected', () => {
  const { token } = issueToken({ username: 'admin', displayName: 'Admin', minutes: -1 }, SECRET);
  assert.equal(readToken(token, SECRET), null);
});

test('junk tokens are rejected rather than throwing', () => {
  for (const bad of ['', '.', 'a.b', 'no-dot', null, undefined, 42, {}, 'a.b.c']) {
    assert.equal(readToken(bad, SECRET), null);
  }
});

test('bearer tokens are pulled from the header, and only from Bearer', () => {
  const request = (value) => ({ headers: { get: () => value } });
  assert.equal(bearerToken(request('Bearer abc123')), 'abc123');
  assert.equal(bearerToken(request('bearer abc123')), 'abc123');
  assert.equal(bearerToken(request('Basic abc123')), null);
  assert.equal(bearerToken(request('')), null);
  assert.equal(bearerToken(request(null)), null);
});
