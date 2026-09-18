// ===== Admin sign-in =====
//
// There is no password in this file, and there never should be. The browser
// sends what was typed to /api/login over HTTPS; the server compares it against
// a PBKDF2 hash that lives only in a Netlify environment variable, and returns
// a short-lived signed token if it matches.
//
// What that token is allowed to do is decided by the server on every request,
// so tampering with anything here — flipping isSignedIn(), inventing a token —
// gets you a visible editor and nothing else. Every write to the shared library
// is rejected unless the token's signature checks out. The UI state below is a
// convenience; the security boundary is netlify/functions/books.mjs.
const Auth = {
  STORAGE_KEY: 'decodable-book-generator.session.v2',
  LOGIN_URL: '/api/login',

  /** { token, expires, displayName } while signed in, otherwise null. */
  session: null,

  /**
   * Restore a session for this tab. sessionStorage rather than localStorage: on
   * a shared classroom machine the sign-in should not outlive the browser
   * window. Storage can throw outright in private-browsing modes, so failure
   * degrades to "signed out" instead of breaking the page.
   */
  load() {
    this.session = null;
    try {
      const raw = window.sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { ok: true };

      const session = JSON.parse(raw);
      if (!session || !session.token || typeof session.expires !== 'number') {
        this.clear();
        return { ok: true };
      }

      // The server checks expiry too, and its clock is the one that counts.
      // This is only so the UI doesn't offer an editor that would be refused.
      if (Date.now() > session.expires) {
        this.clear();
        return { ok: true, expired: true };
      }

      this.session = session;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `The saved sign-in could not be read (${err.message}).` };
    }
  },

  isSignedIn() {
    return this.session !== null && Date.now() < this.session.expires;
  },

  displayName() {
    return this.session ? this.session.displayName : '';
  },

  /** Headers for an authenticated request, or nothing when signed out. */
  authHeaders() {
    return this.isSignedIn() ? { authorization: `Bearer ${this.session.token}` } : {};
  },

  async signIn(username, password) {
    if (!String(username || '').trim() || !String(password || '')) {
      return { ok: false, error: 'Enter both a username and a password.' };
    }

    let response;
    try {
      response = await fetch(this.LOGIN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch (err) {
      return {
        ok: false,
        error: 'The sign-in service could not be reached. Check your connection — and if you are running this locally, use `netlify dev` so the API is available.'
      };
    }

    let body = {};
    try {
      body = await response.json();
    } catch (err) {
      // A non-JSON reply usually means the request never reached the function.
    }

    if (!response.ok) {
      return { ok: false, error: body.error || `Sign-in failed (${response.status}).` };
    }
    if (!body.token) {
      return { ok: false, error: 'The server did not return a session. Try again.' };
    }

    this.session = {
      token: body.token,
      expires: body.expires,
      displayName: body.displayName || 'Administrator'
    };

    const stored = this.persist();
    // Failing to remember the session is not a failed sign-in — the admin is
    // signed in for this page, they may just have to do it again.
    return stored.ok ? { ok: true } : { ok: true, warning: stored.error };
  },

  signOut() {
    this.session = null;
    this.clear();
    return { ok: true };
  },

  persist() {
    try {
      window.sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: `Signed in, but this browser would not remember it (${err.message}) — you may have to sign in again.`
      };
    }
  },

  clear() {
    try {
      window.sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (err) {
      // Nothing was stored, so there is nothing to clear.
    }
  }
};
