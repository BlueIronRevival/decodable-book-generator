// Tests for the book content and the decodability checker.
//
// The second half matters as much as the first: a checker that cannot fail
// proves nothing, so these plant violations and assert they are caught.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, checkContent, classify } from '../tools/check-content.mjs';

const data = loadData();

// ===== The shipped content =====

test('every book is decodable at its point in the sequence', () => {
  const failing = checkContent(data)
    .filter((report) => report.missing || report.problems.length)
    .map((report) => `${report.key}: ${report.problems.map((p) => p.word).join(', ')}`);
  assert.deepEqual(failing, [], `off-pattern words found:\n${failing.join('\n')}`);
});

test('every book in the menus exists, and every book is reachable', () => {
  const menuKeys = Object.values(data.SKILLS).flatMap((s) => s.options.map((o) => o.key));
  const bookKeys = Object.keys(data.WORD_DATA);
  assert.deepEqual(menuKeys.filter((k) => !data.WORD_DATA[k]), [], 'menu points at a missing book');
  assert.deepEqual(bookKeys.filter((k) => !menuKeys.includes(k)), [], 'book unreachable from the menus');
});

test('the sequence and the books agree', () => {
  const seqKeys = data.SEQUENCE.map((e) => e.key);
  assert.deepEqual(seqKeys.filter((k) => !data.WORD_DATA[k]), [], 'sequence names a missing book');
  assert.deepEqual(
    Object.keys(data.WORD_DATA).filter((k) => !seqKeys.includes(k)), [],
    'book missing from the sequence, so it is never checked');
});

test('every book fills the longest template', () => {
  // The Longer Book needs 10 story pages; a short story is silently truncated.
  for (const [key, book] of Object.entries(data.WORD_DATA)) {
    assert.equal(book.story.length, 10, `${key} has ${book.story.length} sentences, expected 10`);
    assert.ok(book.practiceWords.length >= 8, `${key} has only ${book.practiceWords.length} practice words`);
    assert.ok(book.title, `${key} has no title`);
    assert.ok(book.label, `${key} has no label`);
  }
});

test('no book repeats a practice word', () => {
  for (const [key, book] of Object.entries(data.WORD_DATA)) {
    const seen = new Set(book.practiceWords.map((w) => w.toLowerCase()));
    assert.equal(seen.size, book.practiceWords.length, `${key} repeats a practice word`);
  }
});

// ===== The checker itself =====

const scopeAt = (patterns, known = []) => ({
  sight: new Set(data.SIGHT_WORDS.map((w) => w.toLowerCase())),
  names: new Set(data.NAMES),
  known: new Set(known),
  taught: new Set(patterns)
});

test('a vowel team before it is taught is caught', () => {
  const cvcOnly = scopeAt(['closed']);
  assert.equal(classify('tree', cvcOnly).ok, false);
  assert.equal(classify('beach', cvcOnly).ok, false);
  assert.equal(classify('rain', cvcOnly).ok, false);
  // ...and accepted once it is.
  assert.equal(classify('tree', scopeAt(['closed', 'team-ee'])).ok, true);
});

test('an r-controlled vowel before it is taught is caught', () => {
  // `barn` is structurally a closed syllable, so this is the rule that would
  // be easiest to get wrong.
  assert.equal(classify('barn', scopeAt(['closed'])).ok, false);
  assert.equal(classify('bird', scopeAt(['closed'])).ok, false);
  assert.equal(classify('barn', scopeAt(['closed', 'r-ar'])).ok, true);
  // A plain closed syllable with r in the onset is not r-controlled.
  assert.equal(classify('ran', scopeAt(['closed'])).ok, true);
  assert.equal(classify('grass', scopeAt(['closed'])).ok, true);
});

test('magic e before it is taught is caught', () => {
  assert.equal(classify('late', scopeAt(['closed'])).ok, false);
  assert.equal(classify('late', scopeAt(['closed', 'cvce'])).ok, true);
});

test('a multisyllabic word before it is taught is caught', () => {
  assert.equal(classify('rabbit', scopeAt(['closed'])).ok, false);
  assert.equal(classify('rabbit', scopeAt(['closed', 'two-closed'])).ok, true);
});

test('endings are accepted only once taught, including spelling changes', () => {
  // `cats` is not a useful case: it is structurally c-a-ts, a closed syllable
  // indistinguishable from `cast`, so it passes with or without the ending.
  // `limes` is the real test — it only decodes as lime + s.
  assert.equal(classify('limes', scopeAt(['closed', 'cvce'])).ok, false);
  assert.equal(classify('limes', scopeAt(['closed', 'cvce', 'ending-s'])).ok, true);
  assert.equal(classify('stopped', scopeAt(['closed', 'ending-ed'])).ok, true, 'doubled consonant');
  assert.equal(classify('baked', scopeAt(['closed', 'cvce', 'ending-ed'])).ok, true, 'dropped e');
  assert.equal(classify('running', scopeAt(['closed', 'ending-ing'])).ok, true, 'doubled consonant');
});

test('compounds are accepted only once taught', () => {
  const words = ['sun', 'set'];
  assert.equal(classify('sunset', scopeAt(['closed'], words)).ok, false);
  assert.equal(classify('sunset', scopeAt(['closed', 'compound'], words)).ok, true);
});

test('sight words and names always pass', () => {
  assert.equal(classify('said', scopeAt([])).ok, true);
  assert.equal(classify('Gus', scopeAt([])).ok, true);
});

test('a planted off-pattern word is reported with its sentence', () => {
  // Deep-copy so the shipped data is untouched.
  const planted = JSON.parse(JSON.stringify({
    WORD_DATA: data.WORD_DATA, SEQUENCE: data.SEQUENCE,
    SIGHT_WORDS: data.SIGHT_WORDS, NAMES: data.NAMES
  }));
  planted.WORD_DATA['cvc-a'].story[0] = 'My cat saw a rainbow.';

  const report = checkContent(planted).find((r) => r.key === 'cvc-a');
  assert.ok(report.problems.length > 0, 'the planted word was not caught');
  assert.ok(report.problems.some((p) => p.word === 'rainbow'));
  assert.match(report.problems[0].sentence, /rainbow/);
});
