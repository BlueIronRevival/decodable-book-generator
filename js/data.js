// ===== Decodable Word Lists =====
//
// Each entry is one book's worth of content:
//   title     — the story title printed on the cover
//   label     — the phonics skill, shown as a subtitle (teacher-facing)
//   words     — the decodable word list, distributed across the content pages
//   sentences — connected text; one is chosen per content page
//
// NOTE: several of these lists still need a pedagogical pass (see README).
// Known problems: 'cvce-e' contains no long-E words, 'cvce-a' and 'cvce-o'
// mix in other vowel sounds. Content correctness is tracked separately from
// the generator logic.
const WORD_DATA = {
  // --- CVC Words: Short Vowels ---
  'cvc-a': {
    title: 'The Cat',
    label: 'CVC Words — Short A',
    words: ['cat', 'sat', 'hat', 'mat', 'bat', 'rat', 'fat', 'pat', 'jam', 'tap'],
    sentences: [
      'The cat sat on the mat.',
      'Pat has a fat cat.',
      'The cat has a hat.',
      'Jam is on the mat.',
      'The rat ran past the cat.'
    ]
  },
  'cvc-e': {
    title: 'The Red Hen',
    label: 'CVC Words — Short E',
    words: ['bed', 'red', 'fed', 'led', 'peg', 'leg', 'men', 'pen', 'ten', 'hen'],
    sentences: [
      'The hen is red.',
      'The hen sat on the bed.',
      'Ten men fed the hen.',
      'The hen led the men.',
      'The red hen is in the pen.'
    ]
  },
  'cvc-i': {
    title: 'The Big Pit',
    label: 'CVC Words — Short I',
    words: ['sit', 'pit', 'bit', 'fit', 'hit', 'kit', 'lid', 'pin', 'win', 'fin'],
    sentences: [
      'The kit is in the pit.',
      'A pin can fit in the kit.',
      'Sit and dig the pit.',
      'The lid is on the kit.',
      'Did the fin fit in the pit?'
    ]
  },
  'cvc-o': {
    title: 'The Hot Pot',
    label: 'CVC Words — Short O',
    words: ['hot', 'dot', 'pot', 'not', 'top', 'cop', 'log', 'fog', 'hog', 'bog'],
    sentences: [
      'The pot is hot.',
      'The pot is on top of the log.',
      'A hog sat on the log.',
      'Fog is on the bog.',
      'Do not tip the hot pot.'
    ]
  },
  'cvc-u': {
    title: 'Fun in the Sun',
    label: 'CVC Words — Short U',
    words: ['cup', 'fun', 'sun', 'run', 'mug', 'hut', 'nut', 'but', 'mud', 'bud'],
    sentences: [
      'The sun is up.',
      'Run to the hut in the sun.',
      'It is fun in the sun.',
      'A nut is in the cup.',
      'Bud has mud on him.'
    ]
  },

  // --- CVCe Words: Magic e ---
  'cvce-a': {
    title: 'Cake at the Lake',
    label: 'CVCe Words — Long A',
    words: ['cake', 'make', 'rake', 'lake', 'bake', 'take', 'tape', 'game', 'name', 'gate'],
    sentences: [
      'We make a cake.',
      'Take the cake to the lake.',
      'I rake by the gate.',
      'We bake and play a game.',
      'Tape your name on the cake.'
    ]
  },
  'cvce-e': {
    title: 'Hope and the Rope',
    label: 'CVCe Words — Long O and Long A',
    words: ['hope', 'rope', 'robe', 'haze', 'maze', 'cage', 'page', 'lobe', 'cope', 'mope'],
    sentences: [
      'Hope has a rope.',
      'The rope is in the maze.',
      'A page fell in the cage.',
      'Hope put on her robe.',
      'I hope the haze goes away.'
    ]
  },
  'cvce-i': {
    title: 'Nine Limes',
    label: 'CVCe Words — Long I',
    words: ['time', 'dime', 'lime', 'mime', 'fine', 'line', 'mine', 'pine', 'nine', 'ride'],
    sentences: [
      'Nine limes are mine.',
      'A dime is fine.',
      'The limes are in a line.',
      'It is time for a ride.',
      'The mime sat by the pine.'
    ]
  },
  'cvce-o': {
    title: 'The Bone at Home',
    label: 'CVCe Words — Long O',
    words: ['home', 'rope', 'dome', 'lone', 'bone', 'cone', 'tone', 'zone', 'hole', 'note'],
    sentences: [
      'The bone is at home.',
      'A lone cone is in the hole.',
      'The rope is by the dome.',
      'I wrote a note at home.',
      'The bone rolled into the zone.'
    ]
  },
  'cvce-u': {
    title: 'The Cute Cube',
    label: 'CVCe Words — Long U',
    words: ['cube', 'tube', 'mute', 'rude', 'cute', 'dune', 'tune', 'huge', 'June', 'use'],
    sentences: [
      'The cube is cute.',
      'A tube is on the dune.',
      'I use a huge cube.',
      'Do not be rude.',
      'In June we hum a tune.'
    ]
  },

  // --- Digraphs ---
  'digraph-sh': {
    title: 'The Fish and the Ship',
    label: 'Digraphs — sh',
    words: ['ship', 'shop', 'shell', 'shed', 'wish', 'fish', 'dish', 'rush', 'push', 'cash'],
    sentences: [
      'The fish is on the ship.',
      'I wish for a dish of fish.',
      'Push the cart to the shop.',
      'A shell is in the shed.',
      'We rush to the ship.'
    ]
  },
  'digraph-ch': {
    title: 'Chop the Chips',
    label: 'Digraphs — ch',
    words: ['chip', 'chop', 'chin', 'chat', 'chill', 'rich', 'inch', 'much', 'such', 'chest'],
    sentences: [
      'Chop the chips.',
      'A chip is on my chin.',
      'We chat much too long.',
      'The chest is one inch wide.',
      'Such a rich chip!'
    ]
  },
  'digraph-th': {
    title: 'The Moth on the Path',
    label: 'Digraphs — th',
    words: ['this', 'that', 'then', 'them', 'with', 'bath', 'math', 'path', 'moth', 'thin'],
    sentences: [
      'A moth is on the path.',
      'This moth is thin.',
      'I do math with them.',
      'Then we take a bath.',
      'That path is long.'
    ]
  },

  // --- Consonant Blends ---
  'blend-bl': {
    title: 'The Black Block',
    label: 'Blends — bl',
    words: ['black', 'block', 'blot', 'blast', 'bled', 'bless', 'blend', 'bliss', 'blink', 'blimp'],
    sentences: [
      'The block is black.',
      'I blink at the black blimp.',
      'Blend the black and the red.',
      'A blot is on the block.',
      'The blast was loud.'
    ]
  },
  'blend-cl': {
    title: 'Clean the Clock',
    label: 'Blends — cl',
    words: ['clock', 'clap', 'clip', 'clot', 'club', 'cluck', 'clump', 'clung', 'cliff', 'clam'],
    sentences: [
      'Clean the clock.',
      'We clap at the club.',
      'A clip is on the clock.',
      'The clam clung to the cliff.',
      'The hens cluck in a clump.'
    ]
  },
  'blend-fl': {
    title: 'The Flag',
    label: 'Blends — fl',
    words: ['flag', 'flat', 'flip', 'flap', 'flock', 'fling', 'flint', 'fluff', 'flush', 'fled'],
    sentences: [
      'The flag is flat.',
      'The flag will flap.',
      'A flock of birds fled.',
      'Flip the flat flint.',
      'Fluff is on the flag.'
    ]
  },
  'blend-pl': {
    title: 'The Plan',
    label: 'Blends — pl',
    words: ['plan', 'plant', 'plum', 'plus', 'plug', 'plop', 'plank', 'plot', 'pluck', 'plush'],
    sentences: [
      'We have a plan.',
      'The plan is to plant a plum tree.',
      'Plug in the lamp.',
      'A plum went plop on the plank.',
      'Pluck the plum from the plant.'
    ]
  },
  'blend-tr': {
    title: 'The Truck and the Tree',
    label: 'Blends — tr',
    words: ['trap', 'tram', 'trim', 'trip', 'tree', 'trot', 'tray', 'track', 'truck', 'trunk'],
    sentences: [
      'The truck is by the tree.',
      'We trot down the track.',
      'The tram is on a trip.',
      'A tray is in the truck.',
      'Trim the tree.'
    ]
  },
  'blend-dr': {
    title: 'The Drum',
    label: 'Blends — dr',
    words: ['drum', 'drop', 'drip', 'dress', 'draw', 'drag', 'drank', 'drill', 'drift', 'dry'],
    sentences: [
      'I hit the drum.',
      'A drop of rain fell.',
      'Draw a drum on the pad.',
      'The dress is dry.',
      'Drag the drum to the drill.'
    ]
  },
  'blend-pr': {
    title: 'The Prize',
    label: 'Blends — pr',
    words: ['press', 'print', 'prize', 'pride', 'prism', 'probe', 'prone', 'prop', 'prim', 'prod'],
    sentences: [
      'I won a prize.',
      'Press to print the prize list.',
      'She has pride in the prize.',
      'A prism is by the prop.',
      'Do not prod the prism.'
    ]
  },
  'blend-br': {
    title: 'Bring the Bread',
    label: 'Blends — br',
    words: ['bring', 'bread', 'brave', 'brand', 'brass', 'brick', 'branch', 'brush', 'brim', 'brag'],
    sentences: [
      'Bring the bread.',
      'The brave kid ran.',
      'A brass brick is by the brush.',
      'Brush the crumbs from the bread.',
      'Do not brag.'
    ]
  }
};

// ===== Review books: composed from the lists above =====
// Pulls the first `wordsPer` words and `sentencesPer` sentences from each source
// so a review book samples every vowel without introducing new content.
function buildReviewBook(key, title, label, sourceKeys, wordsPer, sentencesPer) {
  const words = [];
  const sentences = [];
  sourceKeys.forEach((sourceKey) => {
    const source = WORD_DATA[sourceKey];
    if (!source) return;
    // Take the first `wordsPer` words this book does not already have, so a
    // word shared between two source lists doesn't appear twice.
    const picked = source.words.filter((w) => !words.includes(w)).slice(0, wordsPer);
    words.push(...picked);
    sentences.push(...source.sentences.slice(0, sentencesPer));
  });
  WORD_DATA[key] = { title, label, words, sentences };
}

buildReviewBook(
  'review-short', 'Words I Know', 'Short Vowel Review — a, e, i, o, u',
  ['cvc-a', 'cvc-e', 'cvc-i', 'cvc-o', 'cvc-u'], 2, 1
);
buildReviewBook(
  'review-long', 'More Words I Know', 'Long Vowel Review — a, e, i, o, u',
  ['cvce-a', 'cvce-e', 'cvce-i', 'cvce-o', 'cvce-u'], 2, 1
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
    name: 'Mini Book (8 pages)',
    description: 'A classic 8-page mini book that folds and staples',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back']
  },
  'foldable': {
    name: 'Foldable Booklet (4 pages)',
    description: 'A simple 4-page foldable booklet',
    pageOrder: ['cover', 'page1', 'page2', 'back']
  },
  'flip-book': {
    name: 'Flip Book (6 pages)',
    description: 'A flip-book with 6 pages',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'back']
  },
  'accordion': {
    name: 'Longer Book (12 pages)',
    description: 'An extended book with 10 content pages',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5',
                'page6', 'page7', 'page8', 'page9', 'page10', 'back']
  }
};

// ===== Decorative Icons =====
const PAGE_ICONS = {
  'cover': '📚',
  'back': '🎉'
};
