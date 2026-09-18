#!/usr/bin/env node
// ===== Decodability checker =====
//
//   npm run check-content
//
// Reads every story in public/js/data.js and reports words a child could not yet
// sound out at that point in the sequence. A word passes if it is:
//
//   1. on the declared SIGHT_WORDS list, or a name in NAMES
//   2. a practice word from this book or any earlier book in SEQUENCE
//   3. built from a taught ending (-s, -ed, -ing) on a word that passes
//   4. a compound of two words that pass, once compounds are taught
//   5. a match for a spelling pattern taught at or before this book
//
// Anything else is reported, with the sentence it came from.
//
// WHAT THIS DOES NOT DO. It checks spelling patterns, not pronunciation, so it
// is deliberately generous in three places: it accepts any consonant cluster
// rather than only the blends taught so far; it cannot see silent letters
// (`crumbs` passes as a closed syllable); and it cannot tell `read` (present)
// from `read` (past). It catches the errors that actually creep in — vowel
// teams, r-controlled vowels and multisyllabic words arriving before they are
// taught — and it does not replace a teacher's review pass.
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** data.js is a browser script, so read it rather than importing it. */
export function loadData(path = join(ROOT, 'public', 'js', 'data.js')) {
  const context = createContext({});
  const source = readFileSync(path, 'utf8');
  // Top-level `const` does not attach to the context, so end with an
  // expression that hands the bindings back.
  const bindings = runInContext(
    `${source}\n;({ WORD_DATA, SKILLS, SEQUENCE, SIGHT_WORDS, NAMES, BOOK_TEMPLATES })`,
    context
  );
  // Objects built inside the VM carry that realm's prototypes, so an array from
  // here is not `instanceof Array` out here and strict deep-equality against a
  // plain [] fails. It is all plain data, so copy it into this realm.
  return JSON.parse(JSON.stringify(bindings));
}

const VOWELS = 'aeiou';
const isVowel = (c) => VOWELS.includes(c);

/** The vowel clusters in a word: 'beach' -> ['ea'], 'rabbit' -> ['a', 'i']. */
function vowelGroups(word) {
  const groups = [];
  let current = '';
  for (const letter of word) {
    if (isVowel(letter)) current += letter;
    else if (current) { groups.push(current); current = ''; }
  }
  if (current) groups.push(current);
  return groups;
}

const TEAMS = {
  'team-ee': ['ee'],
  'team-ea': ['ea'],
  'team-ai': ['ai', 'ay'],
  'team-oa': ['oa', 'ow'],
  'dip-oi': ['oi', 'oy'],
  'dip-ou': ['ou', 'ow']
};

const R_CONTROLLED = { 'r-ar': ['ar'], 'r-or': ['or'], 'r-er': ['er', 'ir', 'ur'] };

/** A vowel closed by `r` in the same syllable: the `ar` of `barn`, not `ran`. */
const hasRControlled = (word) => /[aeiou]r(?![aeiou])/.test(word);

function rControlledUsed(word, taught) {
  const matches = [];
  for (const [pattern, spellings] of Object.entries(R_CONTROLLED)) {
    for (const spelling of spellings) {
      if (new RegExp(`${spelling}(?![aeiou])`).test(word)) matches.push(pattern);
    }
  }
  return matches.some((pattern) => taught.has(pattern));
}

/**
 * Does `word` match a spelling pattern taught by this point? Returns the
 * pattern name, or null.
 */
function matchesPattern(word, taught) {
  const groups = vowelGroups(word);
  if (!groups.length) return null;

  // A vowel closed by r needs r-controlled taught, even though the word is
  // structurally a closed syllable. This is the rule that catches `barn`
  // turning up in a short-vowel book.
  if (hasRControlled(word)) {
    return rControlledUsed(word, taught) ? 'r-controlled' : null;
  }

  // Magic e first: the silent e is its own vowel group, so `late` reaches here
  // with two groups and would never match the single-group rules below.
  if (groups.length === 2 && groups[1] === 'e' && groups[0].length === 1
      && /^[^aeiou]*[aeiou][^aeiou]+e$/.test(word)) {
    return taught.has('cvce') ? 'cvce' : null;
  }

  if (groups.length === 1) {
    const [group] = groups;

    if (group.length === 1) {
      // Closed syllable: one vowel with at least one consonant after it.
      if (/^[^aeiou]*[aeiou][^aeiou]+$/.test(word)) {
        return taught.has('closed') ? 'closed' : null;
      }
      // An open syllable (`go`, `me`) — accepted once anything is taught.
      if (/^[^aeiou]*[aeiou]$/.test(word)) return 'open';
      return null;
    }

    // A vowel team or diphthong.
    for (const [pattern, spellings] of Object.entries(TEAMS)) {
      if (spellings.includes(group) && taught.has(pattern)) return pattern;
    }
    return null;
  }

  // Two single-vowel syllables, both closed: rabbit, picnic, napkin.
  if (groups.length === 2 && groups.every((g) => g.length === 1)) {
    if (/[^aeiou]$/.test(word) && taught.has('two-closed')) return 'two-closed';
  }

  return null;
}

/** Undo the spelling changes an ending makes, so the base can be checked. */
function basesFor(word, taught) {
  const bases = [];
  const undouble = (stem) =>
    (/([^aeiou])\1$/.test(stem) ? [stem, stem.slice(0, -1)] : [stem]);

  if (taught.has('ending-s') && /(?:es|s)$/.test(word)) {
    if (word.endsWith('es')) bases.push(word.slice(0, -2), `${word.slice(0, -2)}e`);
    bases.push(word.slice(0, -1));
  }
  if (taught.has('ending-ed') && word.endsWith('ed')) {
    const stem = word.slice(0, -2);
    bases.push(...undouble(stem), `${stem}e`, `${stem.slice(0, -1)}y`);
  }
  if (taught.has('ending-ing') && word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    bases.push(...undouble(stem), `${stem}e`);
  }
  return bases.filter(Boolean);
}

/**
 * Classify one word. Returns { ok, reason } — reason names why it passed, or
 * what is missing when it did not.
 */
export function classify(word, { sight, names, known, taught }, depth = 0) {
  const lower = word.toLowerCase();
  if (!lower) return { ok: true, reason: 'empty' };
  if (names.has(word) || names.has(lower)) return { ok: true, reason: 'name' };
  if (sight.has(lower)) return { ok: true, reason: 'sight word' };
  if (known.has(lower)) return { ok: true, reason: 'taught word' };

  const pattern = matchesPattern(lower, taught);
  if (pattern) return { ok: true, reason: pattern };

  // Guard the recursion: endings on endings on compounds could otherwise run away.
  if (depth < 3) {
    for (const base of basesFor(lower, taught)) {
      if (classify(base, { sight, names, known, taught }, depth + 1).ok) {
        return { ok: true, reason: 'ending' };
      }
    }

    if (taught.has('compound')) {
      for (let i = 2; i <= lower.length - 2; i += 1) {
        const left = classify(lower.slice(0, i), { sight, names, known, taught }, depth + 1);
        const right = classify(lower.slice(i), { sight, names, known, taught }, depth + 1);
        if (left.ok && right.ok) return { ok: true, reason: 'compound' };
      }
    }
  }

  return { ok: false, reason: 'no taught pattern' };
}

/** Strip personalisation tokens, then split a sentence into bare words. */
function wordsIn(sentence) {
  return sentence
    .replace(/\{[^}]*\}/g, ' ')
    .split(/[^A-Za-z']+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter(Boolean);
}

export function checkContent(data = loadData()) {
  const sight = new Set(data.SIGHT_WORDS.map((w) => w.toLowerCase()));
  const names = new Set(data.NAMES);
  const known = new Set();
  const taught = new Set();
  const reports = [];

  for (const entry of data.SEQUENCE) {
    const book = data.WORD_DATA[entry.key];
    if (!book) {
      reports.push({ key: entry.key, missing: true, problems: [] });
      continue;
    }

    // This book's own patterns and words count as taught for its own story.
    entry.patterns.forEach((pattern) => taught.add(pattern));
    book.practiceWords.forEach((word) => known.add(word.toLowerCase()));

    const scope = { sight, names, known, taught };
    const problems = [];

    book.practiceWords.forEach((word) => {
      const verdict = classify(word, scope);
      if (!verdict.ok) problems.push({ word, where: 'practice word' });
    });

    book.story.forEach((sentence, index) => {
      wordsIn(sentence).forEach((word) => {
        const verdict = classify(word, scope);
        if (!verdict.ok) problems.push({ word, where: `sentence ${index + 1}`, sentence });
      });
    });

    const titleProblems = wordsIn(book.title)
      .filter((word) => !classify(word, scope).ok)
      .map((word) => ({ word, where: 'title', sentence: book.title }));

    reports.push({ key: entry.key, problems: [...problems, ...titleProblems] });
  }

  return reports;
}

// ===== CLI =====
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const reports = checkContent();
  let total = 0;

  for (const report of reports) {
    if (report.missing) {
      console.log(`\n${report.key}\n  ! in SEQUENCE but missing from WORD_DATA`);
      total += 1;
      continue;
    }
    if (!report.problems.length) continue;

    console.log(`\n${report.key}`);
    const seen = new Set();
    for (const problem of report.problems) {
      const line = `${problem.word} (${problem.where})`;
      if (seen.has(line)) continue;
      seen.add(line);
      total += 1;
      console.log(`  ${problem.word.padEnd(14)} ${problem.where}`);
      if (problem.sentence) console.log(`  ${''.padEnd(14)} "${problem.sentence}"`);
    }
  }

  if (total === 0) {
    console.log(`\nAll ${reports.length} books are decodable at their point in the sequence.`);
    console.log('This checks spelling patterns only — a teacher still reviews the content.\n');
  } else {
    console.log(`\n${total} word(s) need a decision: teach the pattern earlier, add the word`);
    console.log('to SIGHT_WORDS, or rewrite the sentence.\n');
    process.exitCode = 1;
  }
}
