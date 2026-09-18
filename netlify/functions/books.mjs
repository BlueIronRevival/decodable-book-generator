// ===== /api/books =====
//
// The published booklet library: what an admin writes here, every teacher gets.
//
//   GET    /api/books        — public. Teachers read the published books.
//   PUT    /api/books/<key>  — admin only. Publish or update one book.
//   DELETE /api/books/<key>  — admin only. Unpublish, falling back to built-in.
//
// This is the real security boundary. Hiding the editor in the browser is a
// convenience; *this* is what actually stops an unauthorised person changing
// what children read. Every write is checked here, server-side, every time.
import { getStore } from '@netlify/blobs';
import { readConfig, json } from '../lib/config.mjs';
import { readToken, bearerToken } from '../lib/credentials.mjs';

const BLOB_KEY = 'published-books.json';
const MAX_STORY_LINES = 60;
const MAX_WORDS = 100;
const MAX_FIELD = 500;

const store = () => getStore({ name: 'decodable-books', consistency: 'strong' });

/** Book keys come from the URL, so constrain them tightly. */
const VALID_KEY = /^[a-z0-9][a-z0-9-]{0,39}$/;

/**
 * Accept only the fields a book may have, with the right types and sane
 * limits. An authenticated admin is still untrusted input: an account can be
 * shared, borrowed, or left signed in on a classroom machine.
 */
function sanitise(book) {
  if (!book || typeof book !== 'object') return null;

  const text = (value) => (typeof value === 'string' ? value.trim().slice(0, MAX_FIELD) : '');
  const list = (value, max) =>
    (Array.isArray(value) ? value : [])
      .map((item) => text(String(item)))
      .filter(Boolean)
      .slice(0, max);

  const clean = {
    title: text(book.title),
    label: text(book.label),
    practiceWords: list(book.practiceWords, MAX_WORDS),
    story: list(book.story, MAX_STORY_LINES)
  };

  if (!clean.title && !clean.practiceWords.length && !clean.story.length) return null;
  return clean;
}

function requireAdmin(request) {
  const settings = readConfig();
  if (!settings.ok) {
    return { ok: false, response: json({ error: 'The server is not configured for sign-in.' }, 503) };
  }

  const payload = readToken(bearerToken(request), settings.secret);
  if (!payload) {
    return { ok: false, response: json({ error: 'Sign in again — that session is not valid.' }, 401) };
  }
  return { ok: true, admin: payload };
}

async function readLibrary() {
  try {
    const found = await store().getWithMetadata(BLOB_KEY, { type: 'json', consistency: 'strong' });
    if (!found || !found.data) return { library: { books: {}, updated: null }, etag: null };
    const books = found.data.books && typeof found.data.books === 'object' ? found.data.books : {};
    return { library: { ...found.data, books }, etag: found.etag };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Read-modify-write with the blob's etag, retried on a lost race. Two admins
 * publishing different books at the same moment must not silently overwrite
 * each other — without this, last write wins and one book quietly vanishes.
 */
async function mutate(change, admin) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readLibrary();
    if (current.error) return { ok: false, response: json({ error: 'The book library could not be read.' }, 502) };

    const outcome = change(current.library.books);
    if (outcome && outcome.error) return { ok: false, response: json({ error: outcome.error }, outcome.status || 400) };

    const next = {
      format: 'decodable-book-generator/published-books',
      version: 1,
      books: current.library.books,
      updated: new Date().toISOString(),
      updatedBy: admin.sub
    };

    const options = current.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true };
    let result;
    try {
      result = await store().set(BLOB_KEY, JSON.stringify(next), options);
    } catch (err) {
      return { ok: false, response: json({ error: 'The book library could not be saved.' }, 502) };
    }

    if (result && result.modified === false) continue; // someone else wrote first
    return { ok: true, library: next };
  }

  return { ok: false, response: json({ error: 'Another admin is saving right now. Try again.' }, 409) };
}

export default async (request, context) => {
  // Named group from the route below, so no URL parsing of our own.
  const key = String((context.params && context.params.key) || '').trim();

  if (request.method === 'GET') {
    const current = await readLibrary();
    if (current.error) return json({ error: 'The book library could not be read.' }, 502);
    return json({
      books: current.library.books,
      updated: current.library.updated || null
    });
  }

  if (request.method !== 'PUT' && request.method !== 'DELETE') {
    return json({ error: 'Use GET, PUT or DELETE.' }, 405);
  }

  const gate = requireAdmin(request);
  if (!gate.ok) return gate.response;

  if (!VALID_KEY.test(key)) return json({ error: 'That is not a valid book key.' }, 400);

  if (request.method === 'DELETE') {
    const result = await mutate((books) => {
      if (!Object.prototype.hasOwnProperty.call(books, key)) {
        return { error: 'That book is not published.', status: 404 };
      }
      delete books[key];
    }, gate.admin);
    if (!result.ok) return result.response;
    return json({ ok: true, key, updated: result.library.updated });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  const clean = sanitise(body);
  if (!clean) return json({ error: 'Nothing to publish — add a title, some words, or a story.' }, 400);

  const result = await mutate((books) => { books[key] = clean; }, gate.admin);
  if (!result.ok) return result.response;
  return json({ ok: true, key, book: clean, updated: result.library.updated });
};

export const config = {
  // Two routes: the collection teachers read, and one book an admin writes.
  path: ['/api/books', '/api/books/:key']
};
