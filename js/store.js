// ===== Book Library =====
//
// WORD_DATA in data.js holds the built-in books. Anything the teacher writes in
// the story editor is stored separately in localStorage and layered on top, so
// a built-in book is never destroyed and "Revert" always has something to go
// back to.
//
// localStorage is per-browser and per-device: a teacher who uses two computers,
// or clears site data, loses their edits. Export/Import writes the whole
// library to a JSON file so it can be backed up and moved.
const BookLibrary = {
  STORAGE_KEY: 'decodable-book-generator.custom-books.v1',

  overrides: {},

  /**
   * Load saved books. Storage can throw outright in private-browsing modes, so
   * every access is guarded and failure degrades to "no custom books".
   */
  load() {
    this.overrides = {};
    try {
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { ok: true };
      const parsed = JSON.parse(raw);
      Object.entries(parsed).forEach(([key, book]) => {
        const clean = this.sanitise(book);
        if (clean) this.overrides[key] = clean;
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Saved stories could not be read (${err.message}).` };
    }
  },

  persist() {
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.overrides));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Could not save (${err.message}). Export to a file instead.` };
    }
  },

  /**
   * Accept only the fields a book is allowed to have, with the right types.
   * Imported files are untrusted input.
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

  /** The book to actually use: the teacher's version if there is one. */
  get(key) {
    const custom = this.overrides[key];
    if (!custom) return WORD_DATA[key];
    const base = WORD_DATA[key] || {};
    return {
      title: custom.title || base.title || '',
      label: custom.label || base.label || '',
      practiceWords: custom.practiceWords.length ? custom.practiceWords : (base.practiceWords || []),
      story: custom.story.length ? custom.story : (base.story || [])
    };
  },

  builtIn(key) {
    return WORD_DATA[key];
  },

  isCustom(key) {
    return Object.prototype.hasOwnProperty.call(this.overrides, key);
  },

  customKeys() {
    return Object.keys(this.overrides);
  },

  save(key, book) {
    const clean = this.sanitise(book);
    if (!clean) return { ok: false, error: 'Nothing to save — add a title, some words, or a story.' };
    this.overrides[key] = clean;
    const result = this.persist();
    return result.ok ? { ok: true } : result;
  },

  revert(key) {
    if (!this.isCustom(key)) return { ok: false, error: 'This book has no saved changes.' };
    delete this.overrides[key];
    return this.persist();
  },

  /** The whole library as a JSON string, for download. */
  exportJSON() {
    return JSON.stringify({
      format: 'decodable-book-generator/custom-books',
      version: 1,
      exported: new Date().toISOString(),
      books: this.overrides
    }, null, 2);
  },

  /**
   * Merge an exported file back in. Returns what was imported and what was
   * skipped, so the teacher is told rather than left guessing.
   */
  importJSON(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return { ok: false, error: 'That file is not valid JSON.' };
    }

    const books = parsed && parsed.books && typeof parsed.books === 'object'
      ? parsed.books
      : parsed;
    if (!books || typeof books !== 'object') {
      return { ok: false, error: 'That file does not contain any books.' };
    }

    const imported = [];
    const skipped = [];
    Object.entries(books).forEach(([key, book]) => {
      if (!WORD_DATA[key]) { skipped.push(`${key} (unknown skill)`); return; }
      const clean = this.sanitise(book);
      if (!clean) { skipped.push(`${key} (empty)`); return; }
      this.overrides[key] = clean;
      imported.push(key);
    });

    if (!imported.length) {
      return { ok: false, error: `Nothing imported. Skipped: ${skipped.join(', ') || 'no entries'}.` };
    }
    const result = this.persist();
    if (!result.ok) return result;
    return { ok: true, imported, skipped };
  }
};
