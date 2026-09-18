// ===== Book Library =====
//
// Three layers, highest priority first:
//
//   1. published — written by an admin, stored on the server, the same for
//      every teacher. This is what the story editor now writes to.
//   2. legacy local — stories saved in this browser by an older version of the
//      app, before publishing existed. Kept so nobody's work disappeared; the
//      editor no longer writes here.
//   3. WORD_DATA in data.js — the built-in books, never modified.
//
// Published books are cached in localStorage so the site still works when the
// API is unreachable, and so a teacher on a flaky connection still gets the
// books they had last time.
const BookLibrary = {
  CACHE_KEY: 'decodable-book-generator.published-cache.v1',
  LEGACY_KEY: 'decodable-book-generator.custom-books.v1',
  API_URL: '/api/books',

  published: {},
  legacy: {},
  updated: null,
  /** 'server' | 'cache' | 'none' — where the current books came from. */
  source: 'none',

  /**
   * Accept only the fields a book is allowed to have, with the right types.
   * The server sanitises independently on every write; this guards against a
   * corrupted cache or a hand-edited import file.
   */
  sanitise(book) {
    if (!book || typeof book !== 'object') return null;
    const title = typeof book.title === 'string' ? book.title.trim() : '';
    const label = typeof book.label === 'string' ? book.label.trim() : '';
    const practiceWords = Array.isArray(book.practiceWords)
      ? book.practiceWords.map((w) => String(w).trim()).filter(Boolean)
      : [];
    const story = Array.isArray(book.story)
      ? book.story.map((line) => String(line).trim()).filter(Boolean)
      : [];
    if (!title && !practiceWords.length && !story.length) return null;
    return { title, label, practiceWords, story };
  },

  sanitiseAll(books) {
    const clean = {};
    Object.entries(books || {}).forEach(([key, book]) => {
      const ok = this.sanitise(book);
      if (ok) clean[key] = ok;
    });
    return clean;
  },

  /** Read whatever is on disk first, so the page can render before the fetch. */
  load() {
    this.published = {};
    this.legacy = {};
    const problems = [];

    try {
      const raw = window.localStorage.getItem(this.CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.published = this.sanitiseAll(parsed.books);
        this.updated = parsed.updated || null;
        this.source = Object.keys(this.published).length ? 'cache' : 'none';
      }
    } catch (err) {
      problems.push(`the cached books could not be read (${err.message})`);
    }

    try {
      const raw = window.localStorage.getItem(this.LEGACY_KEY);
      if (raw) this.legacy = this.sanitiseAll(JSON.parse(raw));
    } catch (err) {
      problems.push(`older saved stories could not be read (${err.message})`);
    }

    return problems.length ? { ok: false, error: `Note: ${problems.join(', ')}.` } : { ok: true };
  },

  /** Pull the published library from the server. Public — no sign-in needed. */
  async refresh() {
    let response;
    try {
      response = await fetch(this.API_URL, { headers: { accept: 'application/json' } });
    } catch (err) {
      return { ok: false, offline: true, error: 'The published books could not be loaded, so the built-in ones are being used.' };
    }

    if (!response.ok) {
      return { ok: false, offline: true, error: `The published books could not be loaded (${response.status}).` };
    }

    let body;
    try {
      body = await response.json();
    } catch (err) {
      return { ok: false, offline: true, error: 'The published books came back unreadable.' };
    }

    this.published = this.sanitiseAll(body.books);
    this.updated = body.updated || null;
    this.source = 'server';
    this.cache();
    return { ok: true, count: Object.keys(this.published).length };
  },

  cache() {
    try {
      window.localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        books: this.published,
        updated: this.updated
      }));
    } catch (err) {
      // An unwritable cache costs an offline fallback, nothing more.
    }
  },

  /** The book to actually use, resolving the three layers. */
  get(key) {
    const base = WORD_DATA[key] || {};
    const override = this.published[key] || this.legacy[key];
    if (!override) return WORD_DATA[key];
    return {
      title: override.title || base.title || '',
      label: override.label || base.label || '',
      practiceWords: override.practiceWords.length ? override.practiceWords : (base.practiceWords || []),
      story: override.story.length ? override.story : (base.story || [])
    };
  },

  builtIn(key) {
    return WORD_DATA[key];
  },

  isCustom(key) {
    return this.isPublished(key) || Object.prototype.hasOwnProperty.call(this.legacy, key);
  },

  isPublished(key) {
    return Object.prototype.hasOwnProperty.call(this.published, key);
  },

  customKeys() {
    return Object.keys(this.published);
  },

  /**
   * Send one book to the server for every teacher to receive. The server checks
   * the token and re-sanitises, so a rejection here is authoritative.
   */
  async publish(key, book) {
    const clean = this.sanitise(book);
    if (!clean) return { ok: false, error: 'Nothing to publish — add a title, some words, or a story.' };
    if (!Auth.isSignedIn()) return { ok: false, error: 'Sign in again — that session has expired.' };

    const result = await this.send('PUT', key, clean);
    if (!result.ok) return result;

    this.published[key] = result.body.book || clean;
    this.updated = result.body.updated || null;
    this.cache();
    return { ok: true };
  },

  /** Remove a published book, so everyone falls back to the built-in one. */
  async unpublish(key) {
    if (!this.isPublished(key)) {
      // A legacy local story is this browser's alone: clearing it needs no server.
      if (Object.prototype.hasOwnProperty.call(this.legacy, key)) {
        delete this.legacy[key];
        try {
          window.localStorage.setItem(this.LEGACY_KEY, JSON.stringify(this.legacy));
        } catch (err) {
          return { ok: false, error: 'That older story could not be removed from this browser.' };
        }
        return { ok: true, local: true };
      }
      return { ok: false, error: 'This book has no published changes.' };
    }
    if (!Auth.isSignedIn()) return { ok: false, error: 'Sign in again — that session has expired.' };

    const result = await this.send('DELETE', key);
    if (!result.ok) return result;

    delete this.published[key];
    this.updated = result.body.updated || null;
    this.cache();
    return { ok: true };
  },

  /** One place for the authenticated calls, so error handling stays uniform. */
  async send(method, key, payload) {
    let response;
    try {
      response = await fetch(`${this.API_URL}/${encodeURIComponent(key)}`, {
        method,
        headers: { 'content-type': 'application/json', ...Auth.authHeaders() },
        body: payload ? JSON.stringify(payload) : undefined
      });
    } catch (err) {
      return { ok: false, error: 'The server could not be reached, so nothing was saved.' };
    }

    let body = {};
    try {
      body = await response.json();
    } catch (err) {
      // Handled by the status check below.
    }

    if (response.status === 401) {
      Auth.signOut();
      return { ok: false, expired: true, error: 'That session has expired. Sign in again.' };
    }
    if (!response.ok) {
      return { ok: false, error: body.error || `The server refused that (${response.status}).` };
    }
    return { ok: true, body };
  },

  /** The published library as a JSON string, for download. */
  exportJSON() {
    return JSON.stringify({
      format: 'decodable-book-generator/custom-books',
      version: 1,
      exported: new Date().toISOString(),
      books: { ...this.legacy, ...this.published }
    }, null, 2);
  },

  /**
   * Publish every book in an exported file. Each one goes through the server,
   * so an import is exactly as restricted as a save — a signed-out browser
   * cannot use an import to sneak a write past the editor.
   */
  async importJSON(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return { ok: false, error: 'That file is not valid JSON.' };
    }

    const books = parsed && parsed.books && typeof parsed.books === 'object' ? parsed.books : parsed;
    if (!books || typeof books !== 'object') {
      return { ok: false, error: 'That file does not contain any books.' };
    }
    if (!Auth.isSignedIn()) return { ok: false, error: 'Sign in to publish an imported file.' };

    const imported = [];
    const skipped = [];

    for (const [key, book] of Object.entries(books)) {
      if (!WORD_DATA[key]) { skipped.push(`${key} (unknown skill)`); continue; }
      const result = await this.publish(key, book);
      if (result.ok) imported.push(key);
      else skipped.push(`${key} (${result.error})`);
    }

    if (!imported.length) {
      return { ok: false, error: `Nothing imported. Skipped: ${skipped.join(', ') || 'no entries'}.` };
    }
    return { ok: true, imported, skipped };
  }
};
