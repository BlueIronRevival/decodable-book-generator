// ===== Book Generator =====
const BookGenerator = {
  /**
   * Generate book HTML based on form inputs
   */
  generate(options) {
    const { skillLevel, narrowSkill, bookTemplate, studentName, pronouns } = options;

    if (!skillLevel || !narrowSkill || !bookTemplate || !studentName) {
      return null;
    }

    const bookKey = this.getBookKey(skillLevel, narrowSkill);
    const data = WORD_DATA[bookKey];

    if (!data) {
      return null;
    }

    const template = BOOK_TEMPLATES[bookTemplate];
    if (!template) {
      return null;
    }

    const bookTitle = BOOK_TITLES[skillLevel] || 'My Reading Book';

    let pages = [];

    template.pageOrder.forEach((pageType, index) => {
      pages.push(this.createPage(pageType, index, template.pageOrder.length, {
        bookTitle,
        bookKey,
        data,
        studentName,
        pronouns,
        skillLevel,
        narrowSkill,
        template
      }));
    });

    return {
      pages,
      template,
      bookTitle,
      studentName,
      pronouns,
      skillLevel,
      narrowSkill,
      bookKey
    };
  },

  /**
   * Get the data key based on skill level and narrow skill
   */
  getBookKey(skillLevel, narrowSkill) {
    if (skillLevel === 'cvc') {
      return `cvc-${narrowSkill}`;
    }
    if (skillLevel === 'cvce') {
      return `cvce-${narrowSkill}`;
    }
    if (skillLevel === 'digraphs') {
      return `digraph-${narrowSkill}`;
    }
    if (skillLevel === 'blends') {
      return `blend-${narrowSkill}`;
    }
    if (skillLevel === 'short-vowels') {
      return `cvc-${narrowSkill}`;
    }
    if (skillLevel === 'long-vowels') {
      if (narrowSkill.includes('a-long')) return 'cvce-a';
      if (narrowSkill.includes('e-long')) return 'cvce-e';
      if (narrowSkill.includes('i-long')) return 'cvce-i';
      if (narrowSkill.includes('o-long')) return 'cvce-o';
      if (narrowSkill.includes('u-long')) return 'cvce-u';
    }
    return null;
  },

  /**
   * Create a single page HTML
   */
  createPage(pageType, index, totalPages, context) {
    const { bookTitle, data, studentName, pronouns, bookKey, template } = context;
    const icon = PAGE_ICONS[pageType] || '📄';

    let content = '';

    switch (pageType) {
      case 'cover':
        content = this.createCoverPage(bookTitle, studentName, pronouns, data, context);
        break;
      case 'back':
        content = this.createBackPage(studentName, context);
        break;
      default:
        content = this.createContentPage(index, totalPages, data, context);
        break;
    }

    const pageClass = pageType === 'cover' ? 'cover' : '';
    const pageLabel = pageType === 'cover' ? 'Cover' :
                      pageType === 'back' ? 'Back Cover' :
                      `Page ${index}`;

    return `
      <div class="book-page ${pageClass}" data-page-type="${pageType}">
        <div class="page-number">${pageLabel}</div>
        ${content}
      </div>
    `;
  },

  /**
   * Create cover page HTML
   */
  createCoverPage(bookTitle, studentName, pronouns, data, context) {
    const pronounText = pronouns ? ` (${pronouns})` : '';

    return `
      <div class="cover-decoration">${PAGE_ICONS.cover}</div>
      <div class="cover-title">${bookTitle}</div>
      <div class="cover-skill">${data.label}</div>
      <div class="student-name">Name: ${studentName}${pronounText}</div>
      <div style="margin-top: 16px; font-size: 1.1rem; color: #555;">
        I can read these words!
      </div>
      <div style="margin-top: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 8px;">
        <span style="font-size: 0.9rem; color: #999;">My Name:</span>
        <span style="display: inline-block; min-width: 200px; border-bottom: 2px solid #333; margin-left: 8px;"></span>
      </div>
    `;
  },

  /**
   * Create back cover page HTML
   */
  createBackPage(studentName, context) {
    return `
      <div class="cover-decoration">${PAGE_ICONS.back}</div>
      <h3 style="text-align: center; color: #4A90D9;">Great Reading!</h3>
      <p style="text-align: center; font-size: 1.1rem; margin: 12px 0;">
        I read my book all by myself!
      </p>
      <div style="text-align: center; margin-top: 16px;">
        <span style="font-size: 0.9rem; color: #999;">Student:</span>
        <span style="font-weight: 700; color: #4A90D9; font-size: 1.1rem;"> ${studentName}</span>
      </div>
      <div style="margin-top: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 8px;">
        <span style="font-size: 0.9rem; color: #999;">Date:</span>
        <span style="display: inline-block; min-width: 150px; border-bottom: 2px solid #333; margin-left: 8px;"></span>
      </div>
      <div style="margin-top: 12px; text-align: center; font-size: 2rem;">
        ⭐⭐⭐⭐⭐
      </div>
      <p style="text-align: center; font-size: 0.85rem; color: #999; margin-top: 8px;">
        Teacher/Parent Signature: ___________________
      </p>
    `;
  },

  /**
   * Create content page HTML
   */
  createContentPage(index, totalPages, data, context) {
    const wordsPerPage = Math.ceil(data.words.length / (totalPages - 2));
    const startIdx = (index - 1) * wordsPerPage;
    const endIdx = startIdx + wordsPerPage;
    const pageWords = data.words.slice(startIdx, endIdx);

    const sentenceIdx = (index - 1) % data.sentences.length;
    const sentence = data.sentences[sentenceIdx];

    const highlightedSentence = this.highlightWordsInSentence(sentence, pageWords);

    return `
      <h3>${data.label}</h3>
      <div class="word-list">
        ${pageWords.map(w => `<span class="word-chip">${w}</span>`).join('')}
      </div>
      <div class="sentence-box">
        <p>${highlightedSentence}</p>
      </div>
      <div style="margin-top: 12px; text-align: center;">
        <span style="font-size: 0.85rem; color: #999;">
          Read the words, then read the sentence!
        </span>
      </div>
    `;
  },

  /**
   * Highlight known words in a sentence
   */
  highlightWordsInSentence(sentence, wordList) {
    const wordSet = new Set(wordList.map(w => w.toLowerCase()));

    return sentence.replace(/\b(\w+)\b/g, (match) => {
      const lower = match.toLowerCase();
      if (wordSet.has(lower)) {
        return `<span class="highlight">${match}</span>`;
      }
      return match;
    });
  },

  /**
   * Generate print-ready booklet HTML — landscape, two pages per sheet,
   * split down the middle with a fold line.
   *
   * Uses saddle-stitch imposition: when the printed sheet is folded in half,
   * pages read in order (1, 2, 3...). For an 8-page book:
   *   Sheet 1: Left=8, Right=1 (cover)
   *   Sheet 2: Left=2, Right=7
   *   Sheet 3: Left=3, Right=6
   *   Sheet 4: Left=4, Right=5
   */
  generatePrintHTML(bookData) {
    const allPages = bookData.pages;
    const totalPages = allPages.length;
    const numSheets = totalPages / 2;
    const sheets = [];

    // Saddle-stitch imposition: for each sheet i (0-indexed),
    // left page = totalPages - 2*i, right page = 2*i + 1
    for (let i = 0; i < numSheets; i++) {
      const leftPageIdx = totalPages - 2 * i - 1;   // 0-indexed
      const rightPageIdx = 2 * i;                     // 0-indexed

      sheets.push({
        leftPage: allPages[leftPageIdx],
        rightPage: allPages[rightPageIdx],
        sheetIndex: i + 1
      });
    }

    let html = '<div class="print-booklet">';

    sheets.forEach((sheet) => {
      html += `<div class="print-sheet" data-sheet="${sheet.sheetIndex}">`;
      html += `<div class="print-page print-page-left">${sheet.leftPage}</div>`;
      html += `<div class="fold-line">fold</div>`;
      html += `<div class="print-page print-page-right">${sheet.rightPage}</div>`;
      html += `</div>`;
    });

    html += '</div>';
    return html;
  }
};
