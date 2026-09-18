# 📚 Decodable Book Generator

A web application for teachers to create foldable, printable decodable reading books for elementary classrooms.

## Features

- **Skill Selection**: CVC, endings, digraphs, blends, CVCe, vowel teams, r-controlled, diphthongs, two-syllable, review
- **Narrow Focus**: The second menu is rebuilt from the skill you pick
- **Editable Title**: Prefilled from the story, editable per book
- **Admin Sign-In**: Server-verified password; the editor is admins-only
- **Published Booklets**: What an admin writes, every teacher receives
- **Write Your Own Stories**: Per-skill story editor with live token preview
- **Personalisation**: Name and pronoun tokens filled in per student
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

## Admin sign-in

Generating and printing a book needs no sign-in — that is the teacher's job and
it stays open. **Writing** a book does: the story editor only appears after an
admin signs in, and what an admin publishes every teacher receives.

### How it works

The password is never in this repository and never reaches the browser. Signing
in posts the username and password to `/api/login`, a serverless function that
compares them against a **PBKDF2-SHA256 hash** (210,000 iterations, per-password
salt) held in a Netlify environment variable. On a match it returns a
short-lived **HMAC-signed token**; the browser sends that token back with every
write, and the server re-checks the signature each time.

That last part is what makes it real. Hiding the editor in the browser is only a
convenience — anyone can unhide it with DevTools. It buys them nothing, because
`netlify/functions/books.mjs` refuses every write that does not carry a valid
token. **The security boundary is the server, not the page.**

| Where | What lives there |
|-------|------------------|
| `netlify/lib/credentials.mjs` | Hashing and token signing. Server only. |
| `netlify/functions/login.mjs` | The only place a password is ever checked |
| `netlify/functions/books.mjs` | Guards every write to the shared library |
| `js/auth.js` | Holds a token. No password, no hash, no secret. |

### Setting it up

1. Generate the credentials:

   ```bash
   npm install
   npm run hash-password
   ```

   It asks for a username and password and prints four variables. The password
   is not echoed, not written to disk, and not recoverable from what it prints.

2. Paste them into Netlify -> **Site configuration** -> **Environment
   variables**:

   | Variable | Purpose |
   |----------|---------|
   | `ADMIN_USERNAME` | Who signs in. Not case sensitive. |
   | `ADMIN_DISPLAY_NAME` | Shown in the signed-in bar |
   | `ADMIN_PASSWORD_HASH` | The PBKDF2 hash. Never the password. |
   | `AUTH_SECRET` | Signs session tokens. Changing it signs everyone out. |
   | `SESSION_MINUTES` | Optional, default 240 |

3. Deploy. Until `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` are both set, sign-in
   **fails closed** — a misconfigured deploy locks everyone out rather than
   letting everyone in.

To rotate the password, run the tool again and replace both variables.

### What is and is not protected

Protected: nobody can change the published booklets without the password.
Every write is verified server-side, tokens expire, a forged or altered token is
rejected, and repeated failures from one address are locked out for 15 minutes.

Not protected: the booklets themselves are **public to read**, which is the
point — teachers are not asked to sign in. Do not put anything private in a
story. There is one shared admin account, so the password is shared: if several
people need separate logins with an audit trail, that is Netlify Identity or
Auth0, not this.

Also worth knowing: there is no rate limit on *reads*, and `SESSION_MINUTES`
controls how long a stolen token stays useful — 240 minutes by default. Shorten
it if admins work on shared machines.

## Local development

The static page works from any web server, but the API needs the Netlify CLI:

```bash
npm install -g netlify-cli
cp .env.example .env     # fill in with `npm run hash-password`
netlify dev
```

Without `netlify dev` the page still loads and the built-in books still print —
sign-in reports that the service is unreachable, which is expected.

Run the tests with:

```bash
npm test
```

They cover the password hashing, token signing and forgery, and — most
importantly — that the write endpoints refuse an absent, forged or expired
token.

## How books reach teachers

Three layers, highest priority first:

1. **Published** — written by an admin, stored on the server, the same for every
   teacher. The story editor writes here.
2. **Legacy local** — stories saved in a browser by the pre-publishing version
   of this app. Kept so nobody's work vanished; nothing writes here any more.
3. **Built-in** — `WORD_DATA` in `js/data.js`, never modified.

Published books are cached in `localStorage`, so a teacher on a dead connection
still gets the books they had last time, and the generator keeps working.

## Writing stories

Sign in as an admin first — the editor is hidden until you do.

Open **✍️ Write a story**, pick a skill and focus, and edit the title, the
back-page practice words, and the story (one sentence per page). **Publish**
sends it to the server for every teacher; **Unpublish** puts the built-in story
back for everyone. The built-in books are never overwritten.

**Export all** writes the published library to `decodable-stories.json` as a
backup. **Import** publishes a file back — it goes through the same
authenticated endpoint, so an import cannot sneak a write past the sign-in.

### Personalisation tokens

Story text and the title can contain tokens that fill in from the Student Name
and Pronouns fields. Token names use the they/them form as a mnemonic, and a
capitalised token produces a capitalised word.

| Token | he/him | she/her | they/them |
|-------|--------|---------|-----------|
| `{name}` | the Student Name field | | |
| `{they}` | he | she | they |
| `{them}` | him | her | them |
| `{their}` | his | her | their |
| `{theirs}` | his | hers | theirs |
| `{themselves}` | himself | herself | themselves |
| `{is}` | is | is | are |
| `{was}` | was | was | were |
| `{has}` | has | has | have |
| `{do}` | does | does | do |
| `{goes}` | goes | goes | go |
| `{v:run}` | runs | runs | run |

The verb tokens exist because "they" takes a plural verb. Writing
`{They} {v:run} to the mat.` gives "He runs to the mat." or "They run to the
mat." — plain substitution would produce "They runs".

`{v:...}` handles regular endings (`{v:push}` -> pushes, `{v:carry}` -> carries)
and the common irregulars (`{v:have}` -> has, `{v:go}` -> goes).

Notes:

- Leaving Pronouns blank uses **they/them**.
- `he/they` and `she/they` use the first pronoun throughout, so the grammar
  stays consistent within one book.
- An unrecognised token is printed as-is rather than silently dropped, and the
  editor warns about it — including a suggestion for likely slips like `{his}`.
- A student's name is usually not decodable at the level of their own book.
  That is normal for decodable readers, but worth knowing.

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

36 books. The "narrow skill" menu is rebuilt from the skill you pick, so every
combination the UI offers maps to a real word list.

| Skill | Narrow options |
|-------|----------------|
| CVC Words | short a, e, i, o, u |
| Inflectional Endings | -s, -ed, -ing |
| Digraphs | sh, ch, th |
| Consonant Blends | bl, cl, fl, pl, tr, dr, pr, br |
| CVCe Words (Magic e) | a, i, o, u |
| Vowel Teams | ee, ea, ai/ay, oa/ow |
| R-Controlled Vowels | ar, or, er/ir/ur |
| Diphthongs | oi/oy, ou/ow |
| Two-Syllable Words | compound words, closed syllables |
| Short Vowel Review | mixed (samples all five short-vowel lists) |
| Long Vowel Review | mixed (samples the four CVCe lists) |

There is no CVCe long-E book, because CVCe long E barely exists in English
(`these`, `eve`, `Pete`). Long E is taught as the `ee` and `ea` vowel teams
instead.

## Checking decodability

A decodable book is only decodable relative to what has been taught. Three
things in `js/data.js` make that explicit, and checkable:

| | |
|---|---|
| `SEQUENCE` | The order skills are taught, and which patterns each book introduces |
| `SIGHT_WORDS` | Words children recognise on sight — irregular (`said`) or too frequent to postpone (`the`) |
| `NAMES` | Proper nouns, which are not expected to be decodable |

Then:

```bash
npm run check-content
```

reads every story and reports any word a child could not yet sound out at that
point. A word passes if it is a sight word or name, a practice word from this or
an earlier book, a taught ending on a word that passes, a compound of two words
that pass, or a match for a spelling pattern taught by then. Anything else is
printed with the sentence it came from:

```
blend-br
  bird           sentence 3
                 "A brave bird sat on a branch."
```

That is a real example — `bird` is r-controlled, taught nine books later. It was
rewritten to `bug`. The check runs as part of `npm test`, so content cannot
regress silently.

**Adding a word to `SIGHT_WORDS` is a curriculum decision, not a typo fix.** It
asserts that children reading these books have been taught it.

### What the checker does not do

It checks spelling patterns, not pronunciation, and is deliberately generous in
three places:

- it accepts any consonant cluster, not only the blends taught so far
- it cannot see silent letters, so `crumbs` passes as a closed syllable
- it cannot tell `read` (present) from `read` (past)

It catches what actually creeps in — vowel teams, r-controlled vowels and
multisyllabic words arriving before they are taught. **It does not replace a
teacher's review pass**, and the stories have still not been checked against any
particular published scope and sequence. Yours will differ; `SEQUENCE` is the
one place to change to match it.

### Remaining content notes

- Review-book stories are now written as single narratives rather than sampled
  sentences, but their **practice word lists** are still sampled from the source
  books, so the list is broader than the story.
- The sequence teaches plural `-s` immediately after CVC. That is earlier than
  some published sequences put it, and it is deliberate: almost no natural
  sentence survives without it.

## Getting Started

Local development is covered under [Local development](#local-development)
above — the short version is `netlify dev`, because the sign-in and the shared
booklets need the API.

### Deploy to Netlify

The site is no longer purely static: it has serverless functions and secrets, so
it must be deployed from Git or the CLI. **Drag-and-drop deploys will not work**
— they cannot carry environment variables, and sign-in would fail closed.

**Via the Netlify UI (recommended)**

1. Push this repository to GitHub
2. netlify.com -> "Add new site" -> "Import an existing project"
3. Connect the repository. `netlify.toml` supplies the build settings.
4. Before the first deploy finishes, add the environment variables from
   `npm run hash-password` under **Site configuration -> Environment variables**
5. Deploy, then confirm you can sign in and publish a story

**Via the CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set ADMIN_PASSWORD_HASH '...'   # from npm run hash-password
netlify env:set AUTH_SECRET '...'
netlify deploy --prod
```

Netlify Blobs needs no setup — the store is created on first write.

### A deploy checklist

- [ ] `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` are set in Netlify
- [ ] No `.env` file is committed (`.gitignore` already excludes it)
- [ ] Signing in with the wrong password is refused
- [ ] Publishing a story shows up for a signed-out browser
- [ ] `npm test` passes

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
- **Vanilla JavaScript** - Book generation logic, no frameworks
- **Netlify Functions** - Sign-in and the shared booklet API
- **Netlify Blobs** - Storage for published booklets
- **Andika** - SIL's literacy typeface: single-storey `a` and `g`, distinct b/d/p/q

### Source layout

| File | Role |
|------|------|
| `js/data.js` | Built-in stories, word lists, `SKILLS`, `SEQUENCE`, `SIGHT_WORDS`, templates |
| `js/store.js` | `BookLibrary` — published/legacy/built-in layers, publishing, import/export |
| `netlify/functions/` | `login` and `books` — the API, and the real security boundary |
| `netlify/lib/credentials.mjs` | PBKDF2 hashing and HMAC token signing (server only) |
| `tools/hash-password.mjs` | Generates the credential environment variables |
| `tools/check-content.mjs` | Decodability checker (`npm run check-content`) |
| `js/auth.js` | `Auth` — sign-in against the API, holds the session token |
| `js/personalize.js` | Name and pronoun token substitution |
| `js/generator.js` | Page building and saddle-stitch imposition |
| `js/app.js` | Form wiring, dependent menus, status messages |
| `css/style.css` | Screen styles + `@media print` booklet layout |

Book pages are black and white in the preview as well as in print, so what the
teacher sees on screen is what comes out of the printer. Only the surrounding
app chrome (header, buttons, status messages) is coloured.

`SKILLS` in `data.js` is the single source of truth for the menus. Adding a book
means three entries: `WORD_DATA` (title, label, `practiceWords`, 10-sentence
`story`), `SKILLS` (so it appears in a menu), and `SEQUENCE` (so it is checked).
`npm test` fails if any of the three is missing.

## License

MIT License - Feel free to use in your classroom!

## Made with ❤️ for Teachers

This tool was built to help elementary teachers create personalized decodable texts for their students.
