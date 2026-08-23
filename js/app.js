// ===== Main Application =====
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('bookForm');
  const previewSection = document.getElementById('previewSection');
  const bookPreview = document.getElementById('bookPreview');
  const previewBtn = document.getElementById('previewBtn');
  const printBtn = document.getElementById('printBtn');
  const printPreviewBtn = document.getElementById('printPreviewBtn');
  const resetBtn = document.getElementById('resetBtn');

  // ===== Event Listeners =====

  // Preview button — shows booklet layout in preview area
  previewBtn.addEventListener('click', () => {
    const formData = getFormData();
    if (validateForm(formData)) {
      const bookData = BookGenerator.generate(formData);
      if (bookData) {
        const printHTML = BookGenerator.generatePrintHTML(bookData);
        bookPreview.innerHTML = printHTML;
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Print button — generates book, shows preview, then opens print dialog
  printBtn.addEventListener('click', () => {
    const formData = getFormData();
    if (!validateForm(formData)) return;

    const bookData = BookGenerator.generate(formData);
    if (!bookData) {
      alert('Error generating book. Please check your selections.');
      return;
    }

    const printHTML = BookGenerator.generatePrintHTML(bookData);
    bookPreview.innerHTML = printHTML;
    previewSection.style.display = 'block';
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Open print dialog directly — no timeout needed
    // window.print() works from user gesture context
    setTimeout(() => {
      window.print();
    }, 100);
  });

  // Print from preview — opens print dialog
  printPreviewBtn.addEventListener('click', () => {
    if (!bookPreview.innerHTML.trim()) {
      alert('Please preview the book first.');
      return;
    }
    window.print();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    form.reset();
    previewSection.style.display = 'none';
    bookPreview.innerHTML = '';
  });

  // ===== Helper Functions =====

  function getFormData() {
    return {
      skillLevel: document.getElementById('skillLevel').value,
      narrowSkill: document.getElementById('narrowSkill').value,
      bookTemplate: document.getElementById('bookSelect').value,
      studentName: document.getElementById('studentName').value.trim(),
      pronouns: document.getElementById('pronouns').value
    };
  }

  function validateForm(data) {
    if (!data.skillLevel) {
      alert('Please select a skill level.');
      return false;
    }
    if (!data.narrowSkill) {
      alert('Please select a narrow skill (vowel focus).');
      return false;
    }
    if (!data.bookTemplate) {
      alert('Please select a book template.');
      return false;
    }
    if (!data.studentName) {
      alert('Please enter the student\'s name.');
      return false;
    }
    return true;
  }
});
