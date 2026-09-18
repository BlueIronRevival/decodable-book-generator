// Tests for the API functions — above all, that the write endpoints refuse
// anyone without a valid token. This is the security boundary, so it is the
// thing most worth testing.
//
//   node --experimental-test-module-mocks --test tests/api.test.mjs
import { test, mock, before } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, issueToken } from '../netlify/lib/credentials.mjs';

// ===== An in-memory stand-in for Netlify Blobs =====
const blobs = new Map();
const etags = new Map();
let etagCounter = 0;

const store = {
  async get(key) { return blobs.has(key) ? JSON.parse(blobs.get(key)) : null; },
  async getWithMetadata(key) {
    if (!blobs.has(key)) return null;
    return { data: JSON.parse(blobs.get(key)), etag: etags.get(key) };
  },
  async set(key, value, options = {}) {
    if (options.onlyIfNew && blobs.has(key)) return { modified: false };
    if (options.onlyIfMatch && etags.get(key) !== options.onlyIfMatch) return { modified: false };
    blobs.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    etags.set(key, `etag-${(etagCounter += 1)}`);
    return { modified: true, etag: etags.get(key) };
  },
  async setJSON(key, value, options) { return this.set(key, JSON.stringify(value), options); },
  async delete(key) { blobs.delete(key); etags.delete(key); }
};

mock.module('@netlify/blobs', { namedExports: { getStore: () => store } });

const SECRET = 'test-secret';
const PASSWORD = 'a-really-long-test-password';

process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_DISPLAY_NAME = 'Administrator';
process.env.ADMIN_PASSWORD_HASH = hashPassword(PASSWORD, 1000);
process.env.AUTH_SECRET = SECRET;

let login;
let books;

before(async () => {
  login = (await import('../netlify/functions/login.mjs')).default;
  books = (await import('../netlify/functions/books.mjs')).default;
});

const post = (body) => new Request('https://example.test/api/login', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
});

const bookRequest = (method, key, { token, body } = {}) => new Request(
  `https://example.test/api/books${key ? '/' + key : ''}`,
  {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  }
);

const ctx = (key) => ({ ip: '198.51.100.7', params: key ? { key } : {} });
const validToken = () => issueToken({ username: 'admin', displayName: 'Administrator', minutes: 60 }, SECRET).token;

const SAMPLE = { title: 'The Cat', practiceWords: ['cat', 'bat'], story: ['A cat sat.', 'The cat ran.'] };

// ===== login =====

test('login rejects a wrong password', async () => {
  const response = await login(post({ username: 'admin', password: 'wrong' }), ctx());
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.token, undefined);
});

test('login rejects an unknown username', async () => {
  const response = await login(post({ username: 'nobody', password: PASSWORD }), ctx());
  assert.equal(response.status, 401);
});

test('login accepts the right password and returns a token', async () => {
  const response = await login(post({ username: 'ADMIN', password: PASSWORD }), ctx());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.token);
  assert.equal(body.displayName, 'Administrator');
  // The hash must never travel to the browser.
  assert.ok(!JSON.stringify(body).includes(process.env.ADMIN_PASSWORD_HASH));
});

test('login refuses anything but POST', async () => {
  const response = await login(new Request('https://example.test/api/login'), ctx());
  assert.equal(response.status, 405);
});

test('login fails closed when the server is unconfigured', async () => {
  const saved = process.env.ADMIN_PASSWORD_HASH;
  delete process.env.ADMIN_PASSWORD_HASH;
  const response = await login(post({ username: 'admin', password: PASSWORD }), ctx());
  process.env.ADMIN_PASSWORD_HASH = saved;
  assert.equal(response.status, 503);
});

// ===== books: the gate =====

test('publishing without a token is refused', async () => {
  const response = await books(bookRequest('PUT', 'cvc-a', { body: SAMPLE }), ctx('cvc-a'));
  assert.equal(response.status, 401);
  assert.equal(blobs.size, 0, 'nothing was written');
});

test('publishing with a forged token is refused', async () => {
  const forged = issueToken({ username: 'admin', displayName: 'Admin', minutes: 60 }, 'wrong-secret').token;
  const response = await books(bookRequest('PUT', 'cvc-a', { token: forged, body: SAMPLE }), ctx('cvc-a'));
  assert.equal(response.status, 401);
  assert.equal(blobs.size, 0, 'nothing was written');
});

test('publishing with an expired token is refused', async () => {
  const stale = issueToken({ username: 'admin', displayName: 'Admin', minutes: -1 }, SECRET).token;
  const response = await books(bookRequest('PUT', 'cvc-a', { token: stale, body: SAMPLE }), ctx('cvc-a'));
  assert.equal(response.status, 401);
  assert.equal(blobs.size, 0, 'nothing was written');
});

test('deleting without a token is refused', async () => {
  const response = await books(bookRequest('DELETE', 'cvc-a'), ctx('cvc-a'));
  assert.equal(response.status, 401);
});

// ===== books: the happy path =====

test('an admin can publish, and anyone can then read', async () => {
  const published = await books(bookRequest('PUT', 'cvc-a', { token: validToken(), body: SAMPLE }), ctx('cvc-a'));
  assert.equal(published.status, 200);

  // No token on the read: teachers are not signed in.
  const read = await books(bookRequest('GET'), ctx());
  assert.equal(read.status, 200);
  const body = await read.json();
  assert.equal(body.books['cvc-a'].title, 'The Cat');
  assert.deepEqual(body.books['cvc-a'].story, SAMPLE.story);
});

test('an admin can unpublish', async () => {
  await books(bookRequest('PUT', 'cvc-e', { token: validToken(), body: SAMPLE }), ctx('cvc-e'));
  const removed = await books(bookRequest('DELETE', 'cvc-e', { token: validToken() }), ctx('cvc-e'));
  assert.equal(removed.status, 200);

  const body = await (await books(bookRequest('GET'), ctx())).json();
  assert.equal(body.books['cvc-e'], undefined);
});

test('unpublishing something that was never published is a 404', async () => {
  const response = await books(bookRequest('DELETE', 'not-there', { token: validToken() }), ctx('not-there'));
  assert.equal(response.status, 404);
});

// ===== books: input is not trusted even from an admin =====

test('a bad book key is refused', async () => {
  for (const key of ['../secrets', 'UPPER', 'has space', '', 'a'.repeat(64)]) {
    const response = await books(bookRequest('PUT', key, { token: validToken(), body: SAMPLE }), ctx(key));
    assert.equal(response.status, 400, `key ${JSON.stringify(key)} should be refused`);
  }
});

test('an empty book is refused', async () => {
  const response = await books(
    bookRequest('PUT', 'cvc-i', { token: validToken(), body: { title: '  ', story: [], practiceWords: [] } }),
    ctx('cvc-i'));
  assert.equal(response.status, 400);
});

test('extra fields are stripped and long input is capped', async () => {
  await books(bookRequest('PUT', 'cvc-o', {
    token: validToken(),
    body: {
      title: 'x'.repeat(2000),
      story: new Array(500).fill('A cat sat.'),
      practiceWords: new Array(500).fill('cat'),
      isAdmin: true,
      __proto__unsafe: 'nope'
    }
  }), ctx('cvc-o'));

  const body = await (await books(bookRequest('GET'), ctx())).json();
  const saved = body.books['cvc-o'];
  assert.deepEqual(Object.keys(saved).sort(), ['label', 'practiceWords', 'story', 'title']);
  assert.equal(saved.title.length, 500);
  assert.equal(saved.story.length, 60);
  assert.equal(saved.practiceWords.length, 100);
});
