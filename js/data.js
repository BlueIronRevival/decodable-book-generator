// ===== Decodable Book Content =====
//
// Each entry is one book:
//   title         — story title, printed on the cover
//   label         — phonics skill, shown small on the cover (teacher-facing)
//   practiceWords — the word list printed on the BACK page for practice.
//                   Kept as a coherent set for the skill; printed alphabetically.
//   story         — connected text, ONE sentence per interior page.
//
// Interior pages show the story only — no word lists, no boxes — so a book
// needs as many story sentences as it has content pages:
//   Foldable 2 · Flip Book 4 · Mini Book 6 · Longer Book 10
// Stories are written to 10 sentences so the Longer Book fills exactly; shorter
// templates use the first N and the app warns that the story is truncated.
//
// !! The story text below still needs a teacher's review pass against your
// !! scope and sequence. It is decodable-by-pattern plus common sight words,
// !! but it has not been checked against a specific curriculum.
const WORD_DATA = {
  // --- CVC: Short Vowels ---
  'cvc-a': {
    title: 'The Cat',
    label: 'CVC Words — Short A',
    practiceWords: ['at', 'bat', 'cat', 'fat', 'hat', 'mat', 'pat', 'rat', 'sat', 'vat'],
    story: [
      'My cat is fat.',
      'My fat cat sat on a mat.',
      'A rat ran in.',
      'The rat sat in a hat.',
      'My cat saw the rat.',
      'The cat ran at the rat.',
      'The rat ran and ran.',
      'The rat hid in a vat.',
      'My cat can not get the rat.',
      'I pat my fat cat.'
    ]
  },
  'cvc-e': {
    title: 'The Red Hen',
    label: 'CVC Words — Short E',
    practiceWords: ['bed', 'fed', 'hen', 'led', 'leg', 'men', 'peg', 'pen', 'red', 'ten'],
    story: [
      'I have a red hen.',
      'My hen is in a pen.',
      'A peg is on the pen.',
      'Ten men fed my hen.',
      'The men led my hen out.',
      'My hen has one red leg.',
      'My hen ran to my bed.',
      'The hen sat on the bed.',
      'Ten men fed her again.',
      'I love my red hen.'
    ]
  },
  'cvc-i': {
    title: 'The Big Pit',
    label: 'CVC Words — Short I',
    practiceWords: ['bit', 'dig', 'fin', 'fit', 'hit', 'kit', 'lid', 'pin', 'pit', 'sit'],
    story: [
      'Tim can dig.',
      'Tim has a big kit.',
      'Tim will dig a pit.',
      'Tim dug a big pit.',
      'A pin fell in the pit.',
      'The lid fell in too.',
      'Tim can not fit in the pit.',
      'Tim sat by the pit.',
      'Tim got the pin and the lid.',
      'Now Tim can sit and rest.'
    ]
  },
  'cvc-o': {
    title: 'The Hot Pot',
    label: 'CVC Words — Short O',
    practiceWords: ['cot', 'dot', 'got', 'hop', 'hot', 'jog', 'log', 'mop', 'not', 'pot'],
    story: [
      'Tom will jog.',
      'Tom can jog a lot.',
      'Now Tom is hot.',
      'Tom sat on a log.',
      'Mom has a pot.',
      'The pot is hot too.',
      'Do not tip the pot!',
      'A dot fell on the cot.',
      'Tom got a mop.',
      'Tom can mop it up.'
    ]
  },
  'cvc-u': {
    title: 'Fun in the Sun',
    label: 'CVC Words — Short U',
    practiceWords: ['bug', 'bun', 'cup', 'cut', 'fun', 'hug', 'mud', 'run', 'sun', 'up'],
    story: [
      'The sun is up.',
      'It is fun in the sun.',
      'Gus can run and run.',
      'A bug sat on a bun.',
      'Gus got the bun.',
      'The bug ran off.',
      'Gus fell in the mud.',
      'Mud is on his cup.',
      'Mom will hug Gus.',
      'The sun and Gus had fun.'
    ]
  },

  // --- CVCe: Magic e ---
  'cvce-a': {
    title: 'Cake at the Lake',
    label: 'CVCe Words — Long A',
    practiceWords: ['bake', 'cake', 'game', 'gate', 'lake', 'make', 'name', 'rake', 'take', 'tape'],
    story: [
      'We will make a cake.',
      'We bake the cake.',
      'I tape my name on the cake.',
      'We take the cake to the lake.',
      'The gate to the lake is shut.',
      'Dad will rake by the gate.',
      'Dad can open the gate.',
      'We play a game at the lake.',
      'Then we eat the cake.',
      'What a fun day at the lake!'
    ]
  },
  'cvce-e': {
    title: 'Hope and the Rope',
    label: 'CVCe Words — Long O and Long A',
    practiceWords: ['cage', 'cope', 'haze', 'hope', 'lobe', 'maze', 'mope', 'page', 'robe', 'rope'],
    story: [
      'Hope has a long rope.',
      'Hope put on a robe.',
      'Hope ran to a maze.',
      'A haze fell on the maze.',
      'Hope did not mope.',
      'Hope read a page of a map.',
      'The page shows the way.',
      'Hope tied the rope to a gate.',
      'The rope led Hope out.',
      'Hope can cope with a maze!'
    ]
  },
  'cvce-i': {
    title: 'Nine Limes',
    label: 'CVCe Words — Long I',
    practiceWords: ['dime', 'fine', 'hide', 'line', 'lime', 'mine', 'nine', 'pine', 'ride', 'time'],
    story: [
      'I have nine limes.',
      'The limes are mine.',
      'I put them in a line.',
      'It is time for a ride.',
      'I ride to the pine tree.',
      'I hide the limes by the pine.',
      'A dime fell by my feet.',
      'I got the dime. It is fine.',
      'Now it is time to go.',
      'Nine limes and one dime are mine!'
    ]
  },
  'cvce-o': {
    title: 'The Bone at Home',
    label: 'CVCe Words — Long O',
    practiceWords: ['bone', 'cone', 'dome', 'hole', 'home', 'lone', 'nose', 'note', 'rope', 'tone'],
    story: [
      'My dog has a bone.',
      'The bone is at home.',
      'My dog dug a hole.',
      'My dog put the bone in the hole.',
      'A lone cone fell by the hole.',
      'My dog put his nose in the hole.',
      'I wrote a note for my dog.',
      'The note says the bone is his.',
      'My dog will not go home.',
      'I use a rope to lead him home.'
    ]
  },
  'cvce-u': {
    title: 'The Cute Cube',
    label: 'CVCe Words — Long U',
    practiceWords: ['cube', 'cute', 'dune', 'huge', 'June', 'mule', 'rude', 'tube', 'tune', 'use'],
    story: [
      'In June I got a cube.',
      'The cube is cute.',
      'I use the cube a lot.',
      'My mule likes the cube.',
      'My mule is huge.',
      'My mule is never rude.',
      'We go to a huge dune.',
      'I hum a tune on the dune.',
      'My mule hums the tune too.',
      'June on the dune is fun!'
    ]
  },

  // --- Digraphs ---
  'digraph-sh': {
    title: 'The Fish and the Ship',
    label: 'Digraphs — sh',
    practiceWords: ['cash', 'dish', 'fish', 'push', 'rush', 'shed', 'shell', 'ship', 'shop', 'wish'],
    story: [
      'I wish for a fish.',
      'I rush to the shop.',
      'The shop has a big fish.',
      'But I have no cash.',
      'I push my cart to the shed.',
      'In the shed is a ship.',
      'I put a shell on the ship.',
      'I put a dish on the ship.',
      'My ship is in no rush.',
      'I wish my ship had a fish!'
    ]
  },
  'digraph-ch': {
    title: 'Chop the Chips',
    label: 'Digraphs — ch',
    practiceWords: ['chat', 'check', 'chest', 'chin', 'chip', 'chop', 'inch', 'much', 'rich', 'such'],
    story: [
      'Mom will chop chips.',
      'I help. I chop one inch.',
      'A chip fell on my chin.',
      'Mom and I chat.',
      'We chat much too long.',
      'The chips are in the chest.',
      'Check the chest!',
      'The chips are gone.',
      'Such rich chips!',
      'We will chop much more.'
    ]
  },
  'digraph-th': {
    title: 'The Moth on the Path',
    label: 'Digraphs — th',
    practiceWords: ['bath', 'math', 'moth', 'path', 'that', 'them', 'then', 'thin', 'this', 'with'],
    story: [
      'A moth sat on the path.',
      'This moth is thin.',
      'Beth is with me.',
      'Beth and I look at them.',
      'Then the moth went up.',
      'That moth is fast!',
      'We run on the path.',
      'Then we go do math.',
      'After math, Beth had a bath.',
      'This was a fun day with Beth.'
    ]
  },

  // --- Consonant Blends ---
  'blend-bl': {
    title: 'The Black Block',
    label: 'Blends — bl',
    practiceWords: ['black', 'blank', 'blast', 'bled', 'blend', 'blimp', 'blink', 'block', 'blot', 'blush'],
    story: [
      'I have a black block.',
      'The block is big.',
      'I blink at the black block.',
      'I blend it with a red block.',
      'A blimp went past.',
      'The blimp is black too.',
      'A blot of ink fell on my block.',
      'My page is not blank now.',
      'The blimp gave a blast.',
      'I blink and the blimp is gone.'
    ]
  },
  'blend-cl': {
    title: 'Clean the Clock',
    label: 'Blends — cl',
    practiceWords: ['clam', 'clap', 'clean', 'cliff', 'clip', 'clock', 'club', 'cluck', 'clump', 'clung'],
    story: [
      'Our club has a clock.',
      'The clock is not clean.',
      'I clip a rag on a stick.',
      'I clean the clock.',
      'We all clap!',
      'A clam clung to the cliff.',
      'A clump of moss is on the cliff.',
      'The hens cluck at the clam.',
      'We clap for the hens.',
      'Now the clock is clean.'
    ]
  },
  'blend-fl': {
    title: 'The Flag',
    label: 'Blends — fl',
    practiceWords: ['flag', 'flap', 'flat', 'fled', 'fling', 'flint', 'flip', 'flock', 'fluff', 'flush'],
    story: [
      'We have a flag.',
      'The flag is flat.',
      'The wind will make it flap.',
      'The flag flaps in the wind.',
      'A flock of birds fled.',
      'I flip the flag over.',
      'Fluff is on the flag.',
      'I fling the fluff off.',
      'Now the flag can flap again.',
      'Our flag is not flat now.'
    ]
  },
  'blend-pl': {
    title: 'The Plan',
    label: 'Blends — pl',
    practiceWords: ['plan', 'plank', 'plant', 'plop', 'pluck', 'plug', 'plum', 'plump', 'plus', 'plush'],
    story: [
      'We have a plan.',
      'The plan is to plant a plum tree.',
      'We plug in the lamp.',
      'We dig by the plank.',
      'We plant the plum tree.',
      'A plump plum fell: plop!',
      'I pluck the plum.',
      'Plus, I got two more.',
      'Our plan went well.',
      'The plum tree was a good plan.'
    ]
  },
  'blend-tr': {
    title: 'The Truck and the Tree',
    label: 'Blends — tr',
    practiceWords: ['track', 'tram', 'trap', 'tray', 'tree', 'trim', 'trip', 'trot', 'truck', 'trunk'],
    story: [
      'My truck is by the tree.',
      'The tree has a big trunk.',
      'We go on a trip.',
      'We trot down the track.',
      'A tram is on the track too.',
      'I have a tray in my truck.',
      'We stop to trim the tree.',
      'My truck can not fit on the track.',
      'We set a trap for the bug.',
      'The trip in my truck was fun.'
    ]
  },
  'blend-dr': {
    title: 'The Drum',
    label: 'Blends — dr',
    practiceWords: ['drag', 'drank', 'draw', 'dress', 'drift', 'drill', 'drip', 'drop', 'drum', 'dry'],
    story: [
      'I have a drum.',
      'I hit the drum.',
      'A drop of rain fell.',
      'Drip, drip, drop!',
      'My dress is not dry.',
      'I drag the drum in.',
      'I draw a drum on my pad.',
      'Dad has a drill.',
      'Dad will drill and I will drum.',
      'Now my dress is dry.'
    ]
  },
  'blend-pr': {
    title: 'The Prize',
    label: 'Blends — pr',
    practiceWords: ['prank', 'prep', 'press', 'pride', 'prim', 'print', 'prize', 'probe', 'prod', 'prop'],
    story: [
      'I won a prize!',
      'I have pride in my prize.',
      'I press the pad to print.',
      'I print my prize list.',
      'I prop the list on my desk.',
      'Dad will prod me to go.',
      'We prep for the trip.',
      'I do not play a prank.',
      'My prize is a prim red box.',
      'I press my prize to me.'
    ]
  },
  'blend-br': {
    title: 'Bring the Bread',
    label: 'Blends — br',
    practiceWords: ['brag', 'branch', 'brand', 'brass', 'brave', 'bread', 'brick', 'brim', 'bring', 'brush'],
    story: [
      'I will bring the bread.',
      'The bread is in a brass pan.',
      'A brave bird sat on a branch.',
      'The bird wants my bread.',
      'I brush the crumbs off.',
      'The crumbs fell on a brick.',
      'The bird got the crumbs.',
      'I do not brag.',
      'My cup is full to the brim.',
      'I bring the bread in.'
    ]
  }
};

// ===== Review books: composed from the lists above =====
// Samples every source so a review book covers all five vowels. The story is a
// set of related sentences rather than one narrative — flagged for review.
function buildReviewBook(key, title, label, sourceKeys, wordsPer, sentencesPer) {
  const practiceWords = [];
  const story = [];
  sourceKeys.forEach((sourceKey) => {
    const source = WORD_DATA[sourceKey];
    if (!source) return;
    // Skip a word this book already has, so a word shared between two source
    // lists doesn't appear twice.
    const picked = source.practiceWords
      .filter((w) => !practiceWords.includes(w))
      .slice(0, wordsPer);
    practiceWords.push(...picked);
    story.push(...source.story.slice(0, sentencesPer));
  });
  WORD_DATA[key] = { title, label, practiceWords, story };
}

buildReviewBook(
  'review-short', 'Words I Know', 'Short Vowel Review — a, e, i, o, u',
  ['cvc-a', 'cvc-e', 'cvc-i', 'cvc-o', 'cvc-u'], 2, 2
);
buildReviewBook(
  'review-long', 'More Words I Know', 'Long Vowel Review — a, e, i, o, u',
  ['cvce-a', 'cvce-e', 'cvce-i', 'cvce-o', 'cvce-u'], 2, 2
);

// ===== Skills =====
// Single source of truth for both dropdowns. The narrow-skill menu is built
// from the selected skill's `options`, so every visible choice maps to a real
// WORD_DATA key — there is no way to select a combination that has no content.
const SKILLS = {
  'cvc': {
    label: 'CVC Words (Consonant-Vowel-Consonant)',
    narrowLabel: 'Vowel Focus',
    narrowPlaceholder: '-- Choose a vowel --',
    options: [
      { value: 'a', label: 'Short A (at, an, ap)', key: 'cvc-a' },
      { value: 'e', label: 'Short E (ed, eg, en)', key: 'cvc-e' },
      { value: 'i', label: 'Short I (it, in, ig, ip)', key: 'cvc-i' },
      { value: 'o', label: 'Short O (op, ot, on, og)', key: 'cvc-o' },
      { value: 'u', label: 'Short U (up, un, ug, ub)', key: 'cvc-u' }
    ]
  },
  'cvce': {
    label: 'CVCe Words (Magic e)',
    narrowLabel: 'Vowel Focus',
    narrowPlaceholder: '-- Choose a vowel --',
    options: [
      { value: 'a', label: 'Long A (a_e)', key: 'cvce-a' },
      { value: 'e', label: 'Long O / Long A (o_e, a_e)', key: 'cvce-e' },
      { value: 'i', label: 'Long I (i_e)', key: 'cvce-i' },
      { value: 'o', label: 'Long O (o_e)', key: 'cvce-o' },
      { value: 'u', label: 'Long U (u_e)', key: 'cvce-u' }
    ]
  },
  'digraphs': {
    label: 'Digraphs',
    narrowLabel: 'Digraph Focus',
    narrowPlaceholder: '-- Choose a digraph --',
    options: [
      { value: 'sh', label: 'sh (ship, fish)', key: 'digraph-sh' },
      { value: 'ch', label: 'ch (chip, much)', key: 'digraph-ch' },
      { value: 'th', label: 'th (this, path)', key: 'digraph-th' }
    ]
  },
  'blends': {
    label: 'Consonant Blends',
    narrowLabel: 'Blend Focus',
    narrowPlaceholder: '-- Choose a blend --',
    options: [
      { value: 'bl', label: 'bl (black, block)', key: 'blend-bl' },
      { value: 'cl', label: 'cl (clock, clap)', key: 'blend-cl' },
      { value: 'fl', label: 'fl (flag, flat)', key: 'blend-fl' },
      { value: 'pl', label: 'pl (plan, plant)', key: 'blend-pl' },
      { value: 'tr', label: 'tr (truck, tree)', key: 'blend-tr' },
      { value: 'dr', label: 'dr (drum, drop)', key: 'blend-dr' },
      { value: 'pr', label: 'pr (press, prize)', key: 'blend-pr' },
      { value: 'br', label: 'br (bring, bread)', key: 'blend-br' }
    ]
  },
  'short-vowels': {
    label: 'Short Vowel Review',
    narrowLabel: 'Review Set',
    narrowPlaceholder: '-- Choose a set --',
    options: [
      { value: 'mixed', label: 'Mixed review (a, e, i, o, u)', key: 'review-short' }
    ]
  },
  'long-vowels': {
    label: 'Long Vowel Review',
    narrowLabel: 'Review Set',
    narrowPlaceholder: '-- Choose a set --',
    options: [
      { value: 'mixed', label: 'Mixed review (a, e, i, o, u)', key: 'review-long' }
    ]
  }
};

// ===== Book Templates =====
// `pageOrder` is the reading order. Saddle-stitch imposition requires a page
// count divisible by 4, so the generator pads short templates with blank pages
// inserted before the back cover.
const BOOK_TEMPLATES = {
  'mini-book': {
    name: 'Mini Book (8 pages, 6 story pages)',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back']
  },
  'foldable': {
    name: 'Foldable Booklet (4 pages, 2 story pages)',
    pageOrder: ['cover', 'page1', 'page2', 'back']
  },
  'flip-book': {
    name: 'Flip Book (6 pages, 4 story pages)',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'back']
  },
  'accordion': {
    name: 'Longer Book (12 pages, 10 story pages)',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5',
                'page6', 'page7', 'page8', 'page9', 'page10', 'back']
  }
};

// ===== Decorative Icons =====
const PAGE_ICONS = { 'cover': '📚' };
