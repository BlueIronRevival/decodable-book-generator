# 📚 Decodable Book Generator

A web application for teachers to create foldable, printable decodable reading books for elementary classrooms.

## Features

- **Skill Selection**: CVC words, CVCe, digraphs, consonant blends, vowel review
- **Narrow Focus**: The second menu is rebuilt from the skill you pick
- **Editable Title**: Prefilled from the story, editable per book
- **Multiple Book Formats**: 4, 6, 8 and 12 page booklets
- **Black and White**: No colour, no tints, no borders — plain toner-cheap pages
- **Print-Ready**: Landscape sheets imposed for double-sided printing and folding

## Book anatomy

| Page | Contains |
|------|----------|
| Cover | Book title, phonics skill, student name |
| Interior pages | One line of story, with the rest of the page left open for the student to illustrate. No word lists, no boxes, no page outlines. |
| Back page | The practice word list for the skill, alphabetised |

Interior pages carry **one story sentence each**, so a book needs as many story
sentences as it has story pages. Stories are written to 10 sentences, which
exactly fills the Longer Book; shorter templates use the first N sentences and
the app warns you that the story is truncated.

## Book Templates

| Template | Sheets | Pages | Story pages | Notes |
|----------|--------|-------|-------------|-------|
| Foldable Booklet | 1 | 4 | 2 | Uses the first 2 sentences |
| Flip Book | 2 | 6 -> 8 | 4 | Padded to 8 with 2 blank pages |
| Mini Book | 2 | 8 | 6 | Uses the first 6 sentences |
| Longer Book | 3 | 12 | 10 | Fits the whole story |

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

**The story text has not been checked against a curriculum.** It is decodable
by pattern plus common sight words, but every story needs a teacher's review
pass before it goes to students. Specifically:

- **`cvce-e` contains no long-E words.** CVCe long E barely exists in English
  (`these`, `eve`, `Pete`), so the list holds long-O and long-A words and is
  labelled accordingly. It should probably be replaced with `ee`/`ea` vowel teams.
- Stories contain some words outside their own pattern (`saw`, `hid`, `crumbs`,
  `moss`) that assume earlier skills were taught. There is no declared sight-word
  list to validate against yet.
- CVC short vowels are a K-1 skill. For 2nd grade the gaps are r-controlled
  vowels, vowel teams, diphthongs, inflectional endings, and two-syllable words.
- Review-book stories are sampled from five different stories, so they read as
  unrelated sentences rather than one narrative.

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
   - **Margins**: Default -- leave this alone, see below
5. Stack the sheets in order, fold the whole stack in half along the dotted
   line, and staple the spine

### Why there is no date, URL or page number in the margin

Browsers print their own header and footer (date, page title, URL, page number)
into the **page margin box**. The stylesheet sets `@page { margin: 0 }`, which
leaves Chrome no margin box to draw them into, so they are suppressed whether or
not "Headers and footers" is ticked in the print dialog. The physical paper
margin is applied as padding on each half-page instead:

```css
@page { size: letter landscape; margin: 0; }
.sheet-body { height: 8.5in; }
.print-page-left  > .book-page { padding: 0.5in 0.4in 0.5in 0.55in; }
.print-page-right > .book-page { padding: 0.5in 0.55in 0.5in 0.4in; }
```

This is why the **Margins** setting must stay on **Default** — choosing
"Custom" overrides the zero margin and the headers come back.

### Sheet order

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
| `js/data.js` | Stories, practice word lists, `SKILLS` (drives both dropdowns), templates |
| `js/generator.js` | Page building and saddle-stitch imposition |
| `js/app.js` | Form wiring, dependent menus, status messages |
| `css/style.css` | Screen styles + `@media print` booklet layout |

Book pages are black and white in the preview as well as in print, so what the
teacher sees on screen is what comes out of the printer. Only the surrounding
app chrome (header, buttons, status messages) is coloured.

`SKILLS` in `data.js` is the single source of truth for the menus - adding a
`WORD_DATA` entry (title, label, `practiceWords`, 10-sentence `story`) plus an
entry in `SKILLS` is all it takes to add a book.

## License

MIT License - Feel free to use in your classroom!

## Made with ❤️ for Teachers

This tool was built to help elementary teachers create personalized decodable texts for their students.
