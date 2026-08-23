# 📚 Decodable Book Generator

A web application for teachers to create foldable, printable decodable reading books for elementary classrooms.

## Features

- **Skill Selection**: Choose from CVC words, digraphs, consonant blends, and more
- **Vowel Focus**: Narrow down to specific vowel sounds (short a, long e, etc.)
- **Multiple Book Formats**: Mini books, foldable booklets, flip books, and accordion books
- **Student Personalization**: Add student name and pronouns to each book
- **Print-Ready**: Generates clean, classroom-ready pages that can be folded and stapled

## Book Templates

| Template | Pages | Content pages | Description |
|----------|-------|---------------|-------------|
| Mini Book | 8 | 6 | Classic foldable mini book |
| Foldable Booklet | 4 | 2 | Simple 4-page booklet |
| Flip Book | 6 -> 8 | 4 | Padded to 8 with 2 blank pages |
| Longer Book | 12 | 10 | Extended book |

Saddle-stitch imposition requires a page count divisible by 4, so templates that
aren't are padded with blank pages inserted before the back cover.

## Skills Available

23 books in total. The "narrow skill" menu is rebuilt from the skill you pick,
so every combination the UI offers maps to a real word list.

| Skill | Narrow options |
|-------|----------------|
| CVC Words | short a, e, i, o, u |
| CVCe Words (Magic e) | a, e, i, o, u |
| Digraphs | sh, ch, th |
| Consonant Blends | bl, cl, fl, pl, tr, dr, pr, br |
| Short Vowel Review | mixed (samples all five short-vowel lists) |
| Long Vowel Review | mixed (samples all five CVCe lists) |

### Known content gaps

The word lists still need a proper scope-and-sequence pass against a real
curriculum:

- **`cvce-e` contains no long-E words.** CVCe long E barely exists in English
  (`these`, `eve`, `Pete`), so the list holds long-O and long-A words and is
  labelled accordingly. It should probably be replaced with `ee`/`ea` vowel teams.
- Not every word appears in a sentence, so some pages highlight nothing.
- CVC short vowels are a K-1 skill. For 2nd grade the gaps are r-controlled
  vowels, vowel teams, diphthongs, inflectional endings, and two-syllable words.
- The 12-page Longer Book gives one word per page with the current 10-word
  lists; it wants ~20 words per list.

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd decodable-book-generator
   ```

2. Open `index.html` in a web browser, or serve with a local server:
   ```bash
   # Using Python
   python3 -m http.server 8000

   # Using Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8000`

### Deploy to Netlify

**Option 1: Deploy via Netlify CLI**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 2: Deploy via Netlify UI**

1. Push this repository to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect the settings
6. Click "Deploy site"

**Option 3: Drag and Drop**

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the project folder onto the page

## Printing Instructions

1. Fill in the form with the desired skill and student info
2. Click "Preview" to see the book
3. Click "Print Book" to open the print dialog
4. In print settings:
   - **Paper Size**: Letter (8.5" x 11")
   - **Layout**: Landscape
   - **Two-sided**: On, **flip on the short edge** (if the back comes out
     upside-down, your driver labels it the other way -- use long edge)
   - **Scale**: 100% (not "Fit to page")
   - **Margins**: Default
   - **Headers/Footers**: Unchecked
5. Stack the sheets in order, fold the whole stack in half along the dotted
   line, and staple the spine

Sheets are emitted in printing order, not reading order. For an 8-page book:

```
sheet 1 front:  8 | 1        sheet 1 back:  2 | 7
sheet 2 front:  6 | 3        sheet 2 back:  4 | 5
```

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling (responsive, print-optimized)
- **Vanilla JavaScript** - Book generation logic
- **No frameworks required** - Lightweight and fast
- **Andika** - SIL's literacy typeface: single-storey `a` and `g`, distinct b/d/p/q

### Source layout

| File | Role |
|------|------|
| `js/data.js` | Word lists, `SKILLS` (drives both dropdowns), templates |
| `js/generator.js` | Pagination, sentence pairing, saddle-stitch imposition |
| `js/app.js` | Form wiring, dependent menus, status messages |
| `css/style.css` | Screen styles + `@media print` booklet layout |

`SKILLS` in `data.js` is the single source of truth for the menus - adding a
word list plus an entry there is all it takes to add a book.

## License

MIT License - Feel free to use in your classroom!

## Made with ❤️ for Teachers

This tool was built to help elementary teachers create personalized decodable texts for their students.
