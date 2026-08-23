// ===== Decodable Word Lists =====
const WORD_DATA = {
  // CVC Words - Short Vowels
  'cvc-a': {
    label: 'CVC Words — Short A',
    words: ['cat', 'sat', 'hat', 'mat', 'bat', 'rat', 'fat', 'pat', 'jam', 'cam'],
    sentences: [
      'The cat sat on the mat.',
      'Pat has a fat rat.',
      'The bat hit the hat.',
      'Jam is on the mat.',
      'Sam has a fat cat.'
    ]
  },
  'cvc-e': {
    label: 'CVC Words — Short E',
    words: ['bed', 'red', 'fed', 'led', 'peg', 'leg', 'men', 'pen', 'ten', 'hen'],
    sentences: [
      'The hen sat on the bed.',
      'Ben has a red pen.',
      'Fed is in the red bed.',
      'The men led the pen.',
      'Leg is on the peg.'
    ]
  },
  'cvc-i': {
    label: 'CVC Words — Short I',
    words: ['sit', 'pit', 'bit', 'fit', 'hit', 'kit', 'lid', 'pin', 'win', 'fin'],
    sentences: [
      'The kit sat in the pit.',
      'Pin can fit in the tin.',
      'Win the bit, win the pit.',
      'Hit the lid with the pin.',
      'Fin can sit in the tin.'
    ]
  },
  'cvc-o': {
    label: 'CVC Words — Short O',
    words: ['hot', 'dot', 'pot', 'not', 'top', 'cop', 'log', 'fog', 'hog', 'bog'],
    sentences: [
      'The pot is on the top.',
      'Dot the log with fog.',
      'The cop has a hot dog.',
      'Not the hog on the log.',
      'Fog is on the bog.'
    ]
  },
  'cvc-u': {
    label: 'CVC Words — Short U',
    words: ['cup', 'fun', 'sun', 'run', 'gun', 'hut', 'nut', 'but', 'mud', 'bud'],
    sentences: [
      'The sun is in the cup.',
      'Run to the hut with mud.',
      'Fun is in the sun.',
      'Nut is in the cup.',
      'Bud has a big mug.'
    ]
  },

  // CVCe Words - Long Vowels (Magic e)
  'cvce-a': {
    label: 'CVCe Words — Long A',
    words: ['cake', 'make', 'like', 'bike', 'hike', 'rake', 'lake', 'tape', 'pipe', 'cube'],
    sentences: [
      'Like cake on the bike.',
      'Make a cake in the lake.',
      'The bike has a cake.',
      'Hike the lake with a rake.',
      'Tape is on the bike.'
    ]
  },
  'cvce-e': {
    label: 'CVCe Words — Long E',
    words: ['hope', 'rope', 'cope', 'mope', 'lobe', 'robe', 'haze', 'maze', 'cage', 'page'],
    sentences: [
      'Hope has a rope.',
      'The cage has a page.',
      'Rope is on the maze.',
      'The robe has a cage.',
      'Cope with the haze.'
    ]
  },
  'cvce-i': {
    label: 'CVCe Words — Long I',
    words: ['time', 'dime', 'lime', 'mime', 'fine', 'line', 'mine', 'pine', 'nine', 'wine'],
    sentences: [
      'A dime is fine in time.',
      'Nine lines of lime.',
      'Mine is in the pine.',
      'The mime has a fine time.',
      'Wine is in the lime.'
    ]
  },
  'cvce-o': {
    label: 'CVCe Words — Long O',
    words: ['home', 'rope', 'tube', 'cube', 'dome', 'lone', 'bone', 'cone', 'tone', 'zone'],
    sentences: [
      'Home has a lone cone.',
      'The dome has a bone.',
      'Tube is on the zone.',
      'A cone is in the home.',
      'Tone is on the dome.'
    ]
  },
  'cvce-u': {
    label: 'CVCe Words — Long U',
    words: ['cube', 'tube', 'mute', 'rude', 'cute', 'lute', 'fume', 'gume', 'dune', 'bune'],
    sentences: [
      'The cube is mute and cute.',
      'A tube has a rude tune.',
      'Lute is on the dune.',
      'Mute the fume with a cube.',
      'Rude is on the lute.'
    ]
  },

  // Digraphs
  'digraph-sh': {
    label: 'Digraphs — sh',
    words: ['ship', 'shop', 'shell', 'wish', 'fish', 'dish', 'rush', 'mesh', 'push', 'lash'],
    sentences: [
      'The fish is in the ship.',
      'Wish for a dish of fish.',
      'Push the shop with a shell.',
      'The rush is on the mesh.',
      'Lash is on the ship.'
    ]
  },
  'digraph-ch': {
    label: 'Digraphs — ch',
    words: ['chip', 'chop', 'chin', 'chat', 'chip', 'rich', 'inch', 'much', 'such', 'itch'],
    sentences: [
      'Chop the chip on the chin.',
      'Chat with a rich inch.',
      'Much of such chip.',
      'The itch is on the chin.',
      'Chip is in the chat.'
    ]
  },
  'digraph-th': {
    label: 'Digraphs — th',
    words: ['this', 'that', 'then', 'them', 'with', 'bath', 'math', 'path', 'moth', 'cloth'],
    sentences: [
      'This is that then.',
      'With them is a bath.',
      'The math is on the path.',
      'Moth is in the cloth.',
      'That bath is with math.'
    ]
  },

  // Consonant Blends
  'blend-bl': {
    label: 'Blends — bl',
    words: ['black', 'block', 'blow', 'blame', 'blade', 'blaze', 'blew', 'blend', 'bliss', 'blind'],
    sentences: [
      'Black is a big block.',
      'Blow the black blade.',
      'The blaze is on the blend.',
      'Bliss is in the black.',
      'Blind has a black block.'
    ]
  },
  'blend-cl': {
    label: 'Blends — cl',
    words: ['clock', 'clean', 'clap', 'climb', 'clip', 'clot', 'club', 'cluck', 'clump', 'clung'],
    sentences: [
      'Clean the clock with a clap.',
      'Climb the clip on the club.',
      'The clot is on the cluck.',
      'Clump is in the clock.',
      'Clap the clean clock.'
    ]
  },
  'blend-fl': {
    label: 'Blends — fl',
    words: ['flag', 'flat', 'flip', 'flap', 'flaw', 'flew', 'flock', 'fling', 'flint', 'fluff'],
    sentences: [
      'The flag is on the flat.',
      'Flip the flap with a flaw.',
      'Flew is on the flock.',
      'Fling the flint with fluff.',
      'Flap is in the flag.'
    ]
  },
  'blend-pl': {
    label: 'Blends — pl',
    words: ['play', 'plan', 'plate', 'plant', 'place', 'plain', 'plash', 'plash', 'plank', 'plume'],
    sentences: [
      'Play on the plan with a plate.',
      'Plant the place on the plain.',
      'A plank is in the plume.',
      'Plan the play with a plate.',
      'Place the plant on the plain.'
    ]
  },
  'blend-tr': {
    label: 'Blends — tr',
    words: ['trap', 'tram', 'trim', 'trip', 'tree', 'trot', 'tray', 'troop', 'track', 'truck'],
    sentences: [
      'The trap is on the tram.',
      'Trim the trip on the tree.',
      'Trot in the tray with a troop.',
      'Track the truck with a trap.',
      'Trip is in the tram.'
    ]
  },
  'blend-dr': {
    label: 'Blends — dr',
    words: ['draw', 'dress', 'dream', 'drop', 'drive', 'drum', 'drip', 'dread', 'dried', 'drain'],
    sentences: [
      'Draw the dress on the dream.',
      'Drop the drum with a drip.',
      'Drive the dried drain.',
      'Dread is on the drum.',
      'The draw is in the dress.'
    ]
  },
  'blend-pr': {
    label: 'Blends — pr',
    words: ['press', 'pretzel', 'prime', 'print', 'prize', 'pride', 'prism', 'probe', 'prose', 'prone'],
    sentences: [
      'Press the print for a prize.',
      'Prime the pride with a prism.',
      'Probe the prose on the prone.',
      'The prize is in the press.',
      'Print the prime with pride.'
    ]
  },
  'blend-br': {
    label: 'Blends — br',
    words: ['bring', 'bread', 'break', 'braid', 'brain', 'brave', 'braid', 'brand', 'brass', 'breathe'],
    sentences: [
      'Bring the bread with a break.',
      'Braid the brain with a brave brand.',
      'Brass is on the breath.',
      'The brave bread is in the braid.',
      'Break the brass with a brain.'
    ]
  }
};

// ===== Book Templates =====
const BOOK_TEMPLATES = {
  'mini-book': {
    name: 'Mini Book (8 pages)',
    description: 'A classic 8-page mini book that folds and staples',
    pageCount: 8,
    layout: 'standard',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back']
  },
  'foldable': {
    name: 'Foldable Booklet (4 pages)',
    description: 'A simple 4-page foldable booklet',
    pageCount: 4,
    layout: 'foldable',
    pageOrder: ['cover', 'page1', 'page2', 'back']
  },
  'flip-book': {
    name: 'Flip Book (6 pages)',
    description: 'A flip-book with 6 pages',
    pageCount: 6,
    layout: 'standard',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'back']
  },
  'accordion': {
    name: 'Accordion Book (10 pages)',
    description: 'An accordion-style book with 10 pages',
    pageCount: 10,
    layout: 'accordion',
    pageOrder: ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'back']
  }
};

// ===== Book Titles =====
const BOOK_TITLES = {
  'cvc': 'My CVC Word Book',
  'cvvc': 'My CVVC Word Book',
  'cvce': 'My Magic e Book',
  'digraphs': 'My Digraph Book',
  'blends': 'My Blend Book',
  'short-vowels': 'My Short Vowel Book',
  'long-vowels': 'My Long Vowel Book'
};

// ===== Decorative Icons =====
const PAGE_ICONS = {
  'cover': '📚',
  'back': '🎉',
  'page1': '📖',
  'page2': '📗',
  'page3': '📘',
  'page4': '📙',
  'page5': '📕',
  'page6': '📒',
  'page7': '📓',
  'page8': '📔',
  'page9': '📑',
  'page10': '📎'
};
