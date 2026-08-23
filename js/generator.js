// ===== Book Generator =====
const BookGenerator = {
  /**
   * Build a book from the form inputs.
   * Always returns an object. On failure: { ok: false, error: '...' }
   * so the caller can tell the teacher what went wrong instead of no-oping.
   */
  generate(options) {
    const { skillLevel, narrowSkill, bookTemplate, studentName, pronouns } = options;

    const skill = SKILLS[skillLevel];
    if (!skill) {
      return { ok: false, error: 'Please choose a skill.' };
    }

    const option = skill.options.find((o) => o.value === narrowSkill);
    if (!option) {
      return { ok: false, error: `Please choose a ${skill.narrowLabel.toLowerCase()} for ${skill.label}.` };
    }

    const data = WORD_DATA[option.key];
    if (!data) {
      return { ok: false, error: `No word list found for "${option.label}" (${option.key}).` };
    }

    const template = BOOK_TEMPLATES[bookTemplate];
    if (!template) {
      return { ok: false, error: 'Please choose a book template.' };
    }

    if (!studentName) {
      return { ok: false, error: 'Please enter the student\'s name.' };
    }

    // Saddle-stitch needs a page count divisible by 4; pad with blanks.
    const pageOrder = this.padToSheetMultiple(template.pageOrder);
    const contentSlots = pageOrder.filter((t) => t.startsWith('page')).length;
    const wordGroups = this.chunkEvenly(data.words, contentSlots);
    const pageSentences = this.assignSentences(data.sentences, wordGroups);

    let contentIndex = 0;
    const pages = pageOrder.map((pageType, index) => {
      if (pageType.startsWith('page')) {
        const html = this.createContentPage(
          contentIndex, wordGroups[contentIndex], pageSentences[contentIndex], data
        );
        contentIndex += 1;
        return this.wrapPage(html, pageType, `Page ${index}`, '');
      }
      if (pageType === 'cover') {
        return this.wrapPage(this.createCoverPage(data, studentName), pageType, 'Cover', 'cover');
      }
      if (pageType === 'back') {
        return this.wrapPage(this.createBackPage(studentName), pageType, 'Back Cover', 'back');
      }
      return this.wrapPage('', pageType, '', 'blank');
    });

    return {
      ok: true,
      pages,
      template,
      bookTitle: data.title,
      skillLabel: data.label,
      studentName,
      pronouns,
      skillLevel,
      narrowSkill,
      bookKey: option.key
    };
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

  /**
   * Split `items` into `buckets` contiguous groups of near-equal size.
   * Never returns an empty group — that was producing blank pages in the
   * mini-book (page 6) and the long book (pages 6-8).
   */
  chunkEvenly(items, buckets) {
    if (buckets <= 0) return [];
    if (!items.length) return Array.from({ length: buckets }, () => []);

    const source = items.slice();
    // Fewer words than pages: cycle the list so every page still has words.
    while (source.length < buckets) {
      source.push(items[source.length % items.length]);
    }

    const base = Math.floor(source.length / buckets);
    const extra = source.length % buckets;
    const groups = [];
    let cursor = 0;
    for (let b = 0; b < buckets; b++) {
      const size = base + (b < extra ? 1 : 0);
      groups.push(source.slice(cursor, cursor + size));
      cursor += size;
    }
    return groups;
  },

  /**
   * Pair each page's word group with the sentence that actually uses the most
   * of those words, preferring sentences not yet used elsewhere in the book.
   */
  assignSentences(sentences, wordGroups) {
    if (!sentences.length) return wordGroups.map(() => '');

    const used = new Set();
    return wordGroups.map((group) => {
      const groupWords = group.map((w) => w.toLowerCase());
      let bestIndex = 0;
      let bestScore = -Infinity;

      sentences.forEach((sentence, i) => {
        const tokens = sentence.toLowerCase().match(/[a-z']+/g) || [];
        let score = groupWords.filter((w) => tokens.includes(w)).length;
        if (used.has(i)) score -= 0.5; // reuse only when nothing fresh fits better
        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      });

      used.add(bestIndex);
      return sentences[bestIndex];
    });
  },

  wrapPage(content, pageType, label, extraClass) {
    return `
      <div class="book-page ${extraClass}" data-page-type="${pageType}">
        ${label ? `<div class="page-number">${label}</div>` : ''}
        ${content}
      </div>
    `;
  },

  /**
   * Cover page: story title, skill, and the student's name.
   */
  createCoverPage(data, studentName) {
    return `
      <div class="cover-decoration">${PAGE_ICONS.cover}</div>
      <div class="cover-title">${this.escapeHtml(data.title)}</div>
      <div class="cover-skill">${this.escapeHtml(data.label)}</div>
      <div class="student-name">Name: ${this.escapeHtml(studentName)}</div>
    `;
  },

  createBackPage(studentName) {
    return `
      <div class="cover-decoration">${PAGE_ICONS.back}</div>
      <h3 class="back-heading">Great Reading!</h3>
      <p class="back-line">I read my book all by myself!</p>
      <p class="back-field"><span class="field-label">Student:</span>
        <strong class="field-value">${this.escapeHtml(studentName)}</strong></p>
      <p class="back-field"><span class="field-label">Date:</span>
        <span class="write-line write-line-short"></span></p>
      <div class="back-stars">⭐⭐⭐⭐⭐</div>
      <p class="back-field"><span class="field-label">Teacher/Parent:</span>
        <span class="write-line"></span></p>
    `;
  },

  createContentPage(contentIndex, pageWords, sentence, data) {
    const highlighted = this.highlightWordsInSentence(sentence, pageWords);
    return `
      <h3>${this.escapeHtml(data.label)}</h3>
      <div class="word-list">
        ${pageWords.map((w) => `<span class="word-chip">${this.escapeHtml(w)}</span>`).join('')}
      </div>
      <div class="sentence-box"><p>${highlighted}</p></div>
      <p class="page-hint">Read the words, then read the sentence!</p>
    `;
  },

  /**
   * Bold the page's target words where they appear in the sentence.
   */
  highlightWordsInSentence(sentence, wordList) {
    if (!sentence) return '';
    const wordSet = new Set(wordList.map((w) => w.toLowerCase()));
    return this.escapeHtml(sentence).replace(/\b([A-Za-z']+)\b/g, (match) => (
      wordSet.has(match.toLowerCase()) ? `<span class="highlight">${match}</span>` : match
    ));
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
