// ===== Book Generator =====
const BookGenerator = {
  /**
   * Build a book from the form inputs.
   * Always returns an object. On failure: { ok: false, error: '...' }
   * so the caller can tell the teacher what went wrong instead of no-oping.
   */
  generate(options) {
    const { skillLevel, narrowSkill, bookTemplate, studentName, pronouns, bookTitle } = options;

    const skill = SKILLS[skillLevel];
    if (!skill) {
      return { ok: false, error: 'Please choose a skill.' };
    }

    const option = skill.options.find((o) => o.value === narrowSkill);
    if (!option) {
      return { ok: false, error: `Please choose a ${skill.narrowLabel.toLowerCase()} for ${skill.label}.` };
    }

    // The teacher's saved version if there is one, otherwise the built-in book.
    const data = BookLibrary.get(option.key);
    if (!data) {
      return { ok: false, error: `No content found for "${option.label}" (${option.key}).` };
    }

    const template = BOOK_TEMPLATES[bookTemplate];
    if (!template) {
      return { ok: false, error: 'Please choose a book template.' };
    }

    if (!studentName) {
      return { ok: false, error: 'Please enter the student\'s name.' };
    }

    // Name and pronoun tokens are resolved once, here, so every page of the
    // book uses the same substitutions.
    const person = { studentName, pronouns };
    const fill = (text) => Personalize.apply(text, person);

    // The teacher can rename the book; fall back to the story's own title.
    const title = fill((bookTitle || '').trim() || data.title);
    const story = (data.story || []).map(fill);

    // Saddle-stitch needs a page count divisible by 4; pad with blanks.
    const pageOrder = this.padToSheetMultiple(template.pageOrder);
    const storySlots = pageOrder.filter((t) => t.startsWith('page')).length;

    // One story sentence per interior page. A template with more pages than the
    // story has sentences leaves the extra pages as illustration-only.
    let storyIndex = 0;
    const pages = pageOrder.map((pageType) => {
      if (pageType.startsWith('page')) {
        const sentence = story[storyIndex];
        storyIndex += 1;
        return this.wrapPage(this.createStoryPage(sentence), pageType, 'story');
      }
      if (pageType === 'cover') {
        return this.wrapPage(this.createCoverPage(title, data, studentName), pageType, 'cover');
      }
      if (pageType === 'back') {
        return this.wrapPage(this.createBackPage(data), pageType, 'back');
      }
      return this.wrapPage('', pageType, 'blank');
    });

    return {
      ok: true,
      pages,
      template,
      bookTitle: title,
      defaultTitle: data.title,
      skillLabel: data.label,
      studentName,
      pronouns,
      skillLevel,
      narrowSkill,
      bookKey: option.key,
      storySlots,
      storyUsed: Math.min(storySlots, story.length),
      storyLength: story.length,
      isCustom: BookLibrary.isCustom(option.key),
      warning: this.storyFitWarning(story, storySlots)
    };
  },

  /**
   * Tell the teacher when the chosen template doesn't match the story length,
   * rather than silently cutting the story short or leaving pages empty.
   */
  storyFitWarning(story, storySlots) {
    if (story.length > storySlots) {
      return `Only the first ${storySlots} of ${story.length} story sentences fit this template. ` +
             `Choose "${BOOK_TEMPLATES.accordion.name}" for the whole story.`;
    }
    if (story.length < storySlots) {
      const spare = storySlots - story.length;
      return `This story has ${story.length} sentences but the template has ${storySlots} story pages — ` +
             `the last ${spare} will be illustration-only.`;
    }
    return null;
  },

  /**
   * Escape user-supplied text before it goes into innerHTML.
   */
  escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  },

  /**
   * Pad a reading order out to a multiple of 4 by inserting blank pages just
   * before the back cover, so the blanks fall at the end of the book.
   */
  padToSheetMultiple(pageOrder) {
    const remainder = pageOrder.length % 4;
    if (remainder === 0) return pageOrder.slice();

    const padCount = 4 - remainder;
    const order = pageOrder.slice();
    const backIndex = order.lastIndexOf('back');
    const insertAt = backIndex === -1 ? order.length : backIndex;
    for (let i = 0; i < padCount; i++) {
      order.splice(insertAt, 0, 'blank');
    }
    return order;
  },

  wrapPage(content, pageType, extraClass) {
    return `<div class="book-page ${extraClass}" data-page-type="${pageType}">${content}</div>`;
  },

  /**
   * Cover: book title, skill, and the student's name. No decorative icon —
   * emoji are the one element that cannot render in black and white.
   */
  createCoverPage(title, data, studentName) {
    return `
      <div class="cover-title">${this.escapeHtml(title)}</div>
      <div class="cover-skill">${this.escapeHtml(data.label)}</div>
      <div class="student-name">Name: ${this.escapeHtml(studentName)}</div>
    `;
  },

  /**
   * Interior page: open space for the student to illustrate, with one line of
   * story underneath. No word lists, no boxes, no rules.
   */
  createStoryPage(sentence) {
    return `
      <div class="illustration-space"></div>
      ${sentence ? `<p class="story-text">${this.escapeHtml(sentence)}</p>` : ''}
    `;
  },

  /**
   * Back page: the practice word list for this skill, alphabetised.
   */
  createBackPage(data) {
    const words = data.practiceWords
      .slice()
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return `
      <h3 class="practice-heading">Words to Practice</h3>
      <ul class="practice-list">
        ${words.map((w) => `<li>${this.escapeHtml(w)}</li>`).join('')}
      </ul>
    `;
  },

  /**
   * Impose the book for double-sided printing.
   *
   * One physical sheet holds four book pages: two on the front, two on the
   * back. Emitted front-then-back so the browser's duplex pairing lines up.
   * For an 8-page book the printed order is:
   *
   *   sheet 1 front:  8 | 1      sheet 1 back:  2 | 7
   *   sheet 2 front:  6 | 3      sheet 2 back:  4 | 5
   *
   * Print double-sided, flipping on the SHORT edge, then fold the stack in
   * half down the fold line and staple the spine.
   */
  generatePrintHTML(bookData) {
    const pages = bookData.pages;
    const total = pages.length;
    const sheetCount = Math.ceil(total / 4);
    let html = '<div class="print-booklet">';

    for (let k = 0; k < sheetCount; k++) {
      html += this.renderSheet(
        pages[total - 1 - 2 * k], pages[2 * k], `Sheet ${k + 1} — Front`
      );
      html += this.renderSheet(
        pages[2 * k + 1], pages[total - 2 - 2 * k], `Sheet ${k + 1} — Back`
      );
    }

    html += '</div>';
    return html;
  },

  renderSheet(leftPage, rightPage, label) {
    return `
      <div class="print-sheet">
        <div class="sheet-label">${label}</div>
        <div class="sheet-body">
          <div class="print-page print-page-left">${leftPage || ''}</div>
          <div class="fold-line"></div>
          <div class="print-page print-page-right">${rightPage || ''}</div>
        </div>
      </div>
    `;
  }
};
