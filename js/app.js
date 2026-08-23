// ===== Main Application =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  const skillSelect = document.getElementById('skillLevel');
  const narrowSelect = document.getElementById('narrowSkill');
  const narrowLabel = document.getElementById('narrowSkillLabel');
  const templateSelect = document.getElementById('bookSelect');
  const studentInput = document.getElementById('studentName');
  const pronounSelect = document.getElementById('pronouns');
  const statusEl = document.getElementById('formStatus');
  const previewSection = document.getElementById('previewSection');
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

  // ===== Status messages =====

  function setStatus(message, kind) {
    statusEl.textContent = message || '';
    statusEl.className = message ? `form-status form-status-${kind}` : 'form-status';
  }

  function clearStatus() {
    setStatus('', '');
  }

  // ===== Book building =====

  function getFormData() {
    return {
      skillLevel: skillSelect.value,
      narrowSkill: narrowSelect.value,
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
    const sheets = result.pages.length / 2;
    setStatus(
      `"${result.bookTitle}" for ${result.studentName} — ` +
      `${result.pages.length} pages on ${sheets / 2} double-sided sheet${sheets / 2 === 1 ? '' : 's'}.`,
      'success'
    );
    return result;
  }

  // ===== Event listeners =====

  skillSelect.addEventListener('change', () => {
    refreshNarrowSkills();
    clearStatus();
  });

  [narrowSelect, templateSelect, studentInput, pronounSelect].forEach((el) => {
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

  // ===== Init =====
  buildMenus();
  refreshNarrowSkills();
});
