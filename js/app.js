// ===== Main Application =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  const skillSelect = document.getElementById('skillLevel');
  const narrowSelect = document.getElementById('narrowSkill');
  const narrowLabel = document.getElementById('narrowSkillLabel');
  const templateSelect = document.getElementById('bookSelect');
  const titleInput = document.getElementById('bookTitle');
  const studentInput = document.getElementById('studentName');
  const pronounSelect = document.getElementById('pronouns');
  const statusEl = document.getElementById('formStatus');
  const previewSection = document.getElementById('previewSection');
  const editor = {
    details: document.getElementById('editorDetails'),
    badge: document.getElementById('editorBadge'),
    target: document.getElementById('editorTarget'),
    chips: document.getElementById('tokenChips'),
    title: document.getElementById('editTitle'),
    words: document.getElementById('editWords'),
    story: document.getElementById('editStory'),
    storyHint: document.getElementById('editStoryHint'),
    status: document.getElementById('editorStatus'),
    importInput: document.getElementById('importInput')
  };
  const auth = {
    section: document.getElementById('authSection'),
    locked: document.getElementById('authLocked'),
    bar: document.getElementById('authBar'),
    who: document.getElementById('authWho'),
    form: document.getElementById('authForm'),
    username: document.getElementById('authUsername'),
    password: document.getElementById('authPassword'),
    status: document.getElementById('authStatus')
  };
  const editorSection = document.getElementById('editorSection');
  let lastFocusedEditorField = null;
  const bookPreview = document.getElementById('bookPreview');

  // ===== Populate the menus from the data files =====

  function buildMenus() {
    Object.entries(SKILLS).forEach(([value, skill]) => {
      skillSelect.add(new Option(skill.label, value));
    });
    Object.entries(BOOK_TEMPLATES).forEach(([value, template]) => {
      templateSelect.add(new Option(template.name, value));
    });
  }

  /**
   * Rebuild the narrow-skill menu for the selected skill. Every option shown
   * maps to a real word list, so an unusable combination cannot be chosen.
   */
  function refreshNarrowSkills() {
    const skill = SKILLS[skillSelect.value];
    narrowSelect.innerHTML = '';

    if (!skill) {
      narrowLabel.textContent = 'Narrow Skill';
      narrowSelect.add(new Option('-- Choose a skill first --', ''));
      narrowSelect.disabled = true;
      return;
    }

    narrowLabel.textContent = skill.narrowLabel;
    narrowSelect.disabled = false;
    narrowSelect.add(new Option(skill.narrowPlaceholder, ''));
    skill.options.forEach((option) => {
      narrowSelect.add(new Option(option.label, option.value));
    });

    // Only one choice: select it so the teacher doesn't have to.
    if (skill.options.length === 1) {
      narrowSelect.value = skill.options[0].value;
    }
  }

  /**
   * Put the chosen story's own title in the title box. Called whenever the
   * skill or narrow skill changes, since the old title belonged to a different
   * story; anything the teacher types afterwards is kept until they switch again.
   */
  function resetTitleToDefault() {
    const skill = SKILLS[skillSelect.value];
    const option = skill && skill.options.find((o) => o.value === narrowSelect.value);
    const data = option && BookLibrary.get(option.key);
    titleInput.value = data ? data.title : '';
    titleInput.placeholder = data ? data.title : 'Book title';
  }

  // ===== Status messages =====

  function setStatus(message, kind, note) {
    statusEl.innerHTML = '';
    if (!message) {
      statusEl.className = 'form-status';
      return;
    }
    statusEl.className = `form-status form-status-${kind}`;
    statusEl.appendChild(document.createTextNode(message));
    if (note) {
      const span = document.createElement('span');
      span.className = 'status-note';
      span.textContent = note;
      statusEl.appendChild(span);
    }
  }

  function clearStatus() {
    setStatus('', '');
  }

  // ===== Book building =====

  function getFormData() {
    return {
      skillLevel: skillSelect.value,
      narrowSkill: narrowSelect.value,
      bookTitle: titleInput.value,
      bookTemplate: templateSelect.value,
      studentName: studentInput.value.trim(),
      pronouns: pronounSelect.value
    };
  }

  /**
   * Build and render the book. Returns the book on success, null on failure —
   * and always tells the teacher which it was.
   */
  function buildAndRender() {
    const result = BookGenerator.generate(getFormData());

    if (!result.ok) {
      setStatus(result.error, 'error');
      previewSection.hidden = true;
      bookPreview.innerHTML = '';
      return null;
    }

    bookPreview.innerHTML = BookGenerator.generatePrintHTML(result);
    previewSection.hidden = false;

    const sheets = result.pages.length / 4;
    const summary =
      `"${result.bookTitle}" for ${result.studentName} — ` +
      `${result.pages.length} pages on ${sheets} double-sided sheet${sheets === 1 ? '' : 's'}, ` +
      `${result.storyUsed} story page${result.storyUsed === 1 ? '' : 's'}.`;

    // A story that doesn't match the template is a content decision the teacher
    // should see, not something to paper over.
    setStatus(summary, result.warning ? 'warn' : 'success', result.warning);
    return result;
  }

  // ===== Event listeners =====

  skillSelect.addEventListener('change', () => {
    refreshNarrowSkills();
    resetTitleToDefault();
    loadEditor();
    clearStatus();
  });

  narrowSelect.addEventListener('change', () => {
    resetTitleToDefault();
    loadEditor();
    clearStatus();
  });

  [templateSelect, studentInput, titleInput, pronounSelect].forEach((el) => {
    el.addEventListener('change', clearStatus);
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    if (buildAndRender()) {
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  document.getElementById('printBtn').addEventListener('click', () => {
    if (buildAndRender()) printBook();
  });

  document.getElementById('printPreviewBtn').addEventListener('click', () => {
    if (bookPreview.innerHTML.trim()) printBook();
    else setStatus('Preview the book first.', 'error');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    form.reset();
    refreshNarrowSkills();
    resetTitleToDefault();
    loadEditor();
    previewSection.hidden = true;
    bookPreview.innerHTML = '';
    clearStatus();
  });

  /**
   * Wait for the webfonts before printing — printing mid-load reflows the
   * pages and can push content past the fold.
   */
  function printBook() {
    const ready = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();
    ready.then(() => window.print());
  }

  // ===== Story editor =====

  const TOKEN_HELP = [
    ['{Name}', "the student's name"],
    ['{They}', 'he / she / they'],
    ['{them}', 'him / her / them'],
    ['{their}', 'his / her / their'],
    ['{theirs}', 'his / hers / theirs'],
    ['{themselves}', 'himself / herself / themselves'],
    ['{is}', 'is / are'],
    ['{was}', 'was / were'],
    ['{has}', 'has / have'],
    ['{do}', 'does / do'],
    ['{v:run}', 'runs / run — any verb after v:']
  ];

  function buildTokenChips() {
    TOKEN_HELP.forEach(([token, meaning]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'token-chip';
      chip.textContent = token;
      chip.title = meaning;
      chip.addEventListener('click', () => insertToken(token));
      editor.chips.appendChild(chip);
    });
  }

  /** Insert a token at the cursor of whichever editor field was last focused. */
  function insertToken(token) {
    const field = lastFocusedEditorField || editor.story;
    const start = field.selectionStart != null ? field.selectionStart : field.value.length;
    const end = field.selectionEnd != null ? field.selectionEnd : field.value.length;
    field.value = field.value.slice(0, start) + token + field.value.slice(end);
    const caret = start + token.length;
    field.focus();
    field.setSelectionRange(caret, caret);
    updateStoryHint();
  }

  /** Which book the editor is currently pointed at, or null. */
  function currentBookKey() {
    const skill = SKILLS[skillSelect.value];
    const option = skill && skill.options.find((o) => o.value === narrowSelect.value);
    return option ? option.key : null;
  }

  function setEditorStatus(message, kind) {
    editor.status.textContent = message || '';
    editor.status.className = message ? `form-status form-status-${kind}` : 'form-status';
  }

  /** Load the selected book into the editor fields. */
  function loadEditor() {
    const key = currentBookKey();
    const fields = [editor.title, editor.words, editor.story];

    if (!key) {
      editor.target.textContent = '— choose a skill first —';
      fields.forEach((f) => { f.value = ''; f.disabled = true; });
      editor.badge.hidden = true;
      updateStoryHint();
      return;
    }

    const book = BookLibrary.get(key);
    fields.forEach((f) => { f.disabled = false; });
    editor.target.textContent = `${book.label} (${key})`;
    editor.title.value = book.title || '';
    editor.words.value = (book.practiceWords || []).join(', ');
    editor.story.value = (book.story || []).join('\n');
    editor.badge.hidden = !BookLibrary.isCustom(key);
    setEditorStatus('', '');
    updateStoryHint();
  }

  /** Live feedback: how many pages the story fills, and any mistyped tokens. */
  function updateStoryHint() {
    const lines = editor.story.value.split('\n').map((l) => l.trim()).filter(Boolean);
    const fits = Object.values(BOOK_TEMPLATES)
      .filter((t) => t.pageOrder.filter((p) => p.startsWith('page')).length <= lines.length)
      .map((t) => t.name.replace(/ \(.*/, ''));

    let hint = `${lines.length} sentence${lines.length === 1 ? '' : 's'} = ${lines.length} story page${lines.length === 1 ? '' : 's'}.`;
    hint += fits.length ? ` Fills: ${fits.join(', ')}.` : ' Not enough for any template yet.';

    const unknown = Personalize.unknownTokens(editor.story.value + ' ' + editor.title.value);
    if (unknown.length) {
      hint += `  ⚠ Unknown token${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')} — these print as-is.`;
    }
    editor.storyHint.textContent = hint;
    editor.storyHint.classList.toggle('hint-warn', unknown.length > 0);
  }

  /**
   * Disable the editor's buttons while a request is in flight, so an impatient
   * double-click cannot fire two conflicting writes at the server.
   */
  async function whileBusy(button, label, work) {
    const buttons = Array.from(document.querySelectorAll('.editor-actions .btn'));
    const original = button.textContent;
    buttons.forEach((b) => { b.disabled = true; });
    button.textContent = label;
    try {
      return await work();
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
      button.textContent = original;
    }
  }

  /** A rejected token means the session died mid-edit — say so and show the form. */
  function handleExpiry(result) {
    if (!result.expired) return false;
    refreshAuthUI();
    setAuthStatus('That session expired. Sign in again — your text is still in the editor.', 'warn');
    return true;
  }

  async function saveStory(event) {
    const key = currentBookKey();
    if (!key) { setEditorStatus('Choose a skill and focus first.', 'error'); return; }

    const result = await whileBusy(event.currentTarget, 'Publishing...', () =>
      BookLibrary.publish(key, {
        title: editor.title.value,
        label: BookLibrary.builtIn(key) ? BookLibrary.builtIn(key).label : '',
        practiceWords: editor.words.value.split(/[,\n]|\s{1,}/).map((w) => w.trim()).filter(Boolean),
        story: editor.story.value.split('\n').map((l) => l.trim()).filter(Boolean)
      }));

    if (!result.ok) {
      if (!handleExpiry(result)) setEditorStatus(result.error, 'error');
      return;
    }
    editor.badge.hidden = false;
    setEditorStatus('Published. Every teacher gets this story the next time they load the page.', 'success');
    resetTitleToDefault();
    if (!previewSection.hidden) buildAndRender();
  }

  async function revertStory(event) {
    const key = currentBookKey();
    if (!key) return;

    const result = await whileBusy(event.currentTarget, 'Reverting...', () => BookLibrary.unpublish(key));
    if (!result.ok) {
      if (!handleExpiry(result)) setEditorStatus(result.error, 'error');
      return;
    }
    loadEditor();
    setEditorStatus(result.local
      ? 'Removed that older story from this browser. The built-in one is back.'
      : 'Unpublished. Everyone is back on the built-in story.', 'success');
    resetTitleToDefault();
    if (!previewSection.hidden) buildAndRender();
  }

  function exportLibrary() {
    if (!BookLibrary.customKeys().length) {
      setEditorStatus('No saved stories to export yet.', 'error');
      return;
    }
    const blob = new Blob([BookLibrary.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'decodable-stories.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setEditorStatus(`Exported ${BookLibrary.customKeys().length} saved book(s).`, 'success');
  }

  function importLibrary(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      setEditorStatus('Publishing the imported books...', 'warn');
      const result = await BookLibrary.importJSON(String(reader.result));
      if (!result.ok) {
        if (!handleExpiry(result)) setEditorStatus(result.error, 'error');
        return;
      }
      loadEditor();
      resetTitleToDefault();
      const skippedNote = result.skipped.length ? ` Skipped: ${result.skipped.join(', ')}.` : '';
      setEditorStatus(`Published ${result.imported.length} book(s).${skippedNote}`, 'success');
      if (!previewSection.hidden) buildAndRender();
    };
    reader.onerror = () => setEditorStatus('That file could not be read.', 'error');
    reader.readAsText(file);
  }

  [editor.title, editor.words, editor.story].forEach((field) => {
    field.addEventListener('focus', () => { lastFocusedEditorField = field; });
    field.addEventListener('input', updateStoryHint);
  });

  // ===== Admin sign-in =====
  //
  // Auth gates who may *write* a story. It does not gate reading or printing,
  // and stories already saved stay in use after signing out — the point is to
  // stop the books being rewritten, not to hide them.

  function setAuthStatus(message, kind) {
    auth.status.textContent = message || '';
    auth.status.className = message ? `form-status form-status-${kind}` : 'form-status';
  }

  /** Show either the sign-in form or the editor, never both. */
  function refreshAuthUI() {
    const signedIn = Auth.isSignedIn();
    auth.locked.hidden = signedIn;
    auth.bar.hidden = !signedIn;
    editorSection.hidden = !signedIn;
    if (signedIn) auth.who.textContent = Auth.displayName();
  }

  auth.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = auth.form.querySelector('button[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Signing in...';
    setAuthStatus('', '');

    let result;
    try {
      result = await Auth.signIn(auth.username.value, auth.password.value);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }

    // Clear the password either way, so it isn't left sitting in the field.
    auth.password.value = '';

    if (!result.ok) {
      auth.password.focus();
      setAuthStatus(result.error, 'error');
      return;
    }

    setAuthStatus('', '');
    refreshAuthUI();
    loadEditor();
    editor.details.open = true;
    if (result.warning) setEditorStatus(result.warning, 'warn');
    editorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('signOutBtn').addEventListener('click', () => {
    Auth.signOut();
    editor.details.open = false;
    auth.username.value = '';
    auth.password.value = '';
    refreshAuthUI();
    setAuthStatus('Signed out.', 'success');
  });

  document.getElementById('saveStoryBtn').addEventListener('click', saveStory);
  document.getElementById('revertStoryBtn').addEventListener('click', revertStory);
  document.getElementById('exportBtn').addEventListener('click', exportLibrary);
  document.getElementById('importBtn').addEventListener('click', () => editor.importInput.click());
  editor.importInput.addEventListener('change', () => {
    if (editor.importInput.files[0]) importLibrary(editor.importInput.files[0]);
    editor.importInput.value = '';
  });

  // ===== Init =====
  //
  // Render from the cache first so the page is usable immediately, then fetch
  // the published books and re-render if they changed. A teacher on a dead
  // connection still gets a working generator.
  const loaded = BookLibrary.load();
  const session = Auth.load();
  buildTokenChips();
  buildMenus();
  refreshNarrowSkills();
  resetTitleToDefault();
  loadEditor();
  refreshAuthUI();
  if (!loaded.ok) setEditorStatus(loaded.error, 'error');
  if (!session.ok) setAuthStatus(session.error, 'error');
  else if (session.expired) setAuthStatus('That sign-in timed out. Sign in again to keep editing.', 'warn');

  BookLibrary.refresh().then((result) => {
    if (!result.ok) {
      // Offline is not an error worth shouting about: the built-in books and
      // the cache still work. Say it once, quietly, in the editor.
      if (Auth.isSignedIn()) setEditorStatus(result.error, 'warn');
      return;
    }
    resetTitleToDefault();
    loadEditor();
    if (!previewSection.hidden) buildAndRender();
  });
});
