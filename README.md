# 📚 Decodable Book Generator

A web application for teachers to create foldable, printable decodable reading books for elementary classrooms.

## Features

- **Skill Selection**: Choose from CVC words, digraphs, consonant blends, and more
- **Vowel Focus**: Narrow down to specific vowel sounds (short a, long e, etc.)
- **Multiple Book Formats**: Mini books, foldable booklets, flip books, and accordion books
- **Student Personalization**: Add student name and pronouns to each book
- **Print-Ready**: Generates clean, classroom-ready pages that can be folded and stapled

## Book Templates

| Template | Pages | Description |
|----------|-------|-------------|
| Mini Book | 8 | Classic foldable mini book |
| Foldable | 4 | Simple 4-page booklet |
| Flip Book | 6 | Quick flip-through book |
| Accordion | 10 | Extended accordion-style book |

## Skills Available

- **CVC Words** (Consonant-Vowel-Consonant): cat, sat, hat, etc.
- **CVCe Words** (Magic e): cake, make, like, etc.
- **Digraphs**: sh, ch, th
- **Consonant Blends**: bl, cl, fl, pl, tr, dr, pr, br
- **Short Vowel Review**
- **Long Vowel Review**

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
   - **Layout**: Portrait
   - **Margins**: Default
   - **Headers/Footers**: Unchecked
5. Print and fold along the center

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling (responsive, print-optimized)
- **Vanilla JavaScript** - Book generation logic
- **No frameworks required** - Lightweight and fast

## License

MIT License - Feel free to use in your classroom!

## Made with ❤️ for Teachers

This tool was built to help elementary teachers create personalized decodable texts for their students.
