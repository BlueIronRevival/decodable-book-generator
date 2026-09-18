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
      'Then we all have some cake.',
      'What a fun day at the lake!'
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
      'A dime fell in the grass.',
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
      'I use a rope to get him home.'
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
      'I dash to the shed.',
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
      'My pad is not blank now.',
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
      'A flock of bats fled.',
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
      'The plan is to plant a plum pit.',
      'We plug in the lamp.',
      'We dig by the plank.',
      'We plant the plum pit.',
      'A plump plum fell: plop!',
      'I pluck the plum.',
      'Plus, I got two more.',
      'Our plan went well.',
      'Our plum plan was the best.'
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
      'A drop fell on my drum.',
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
      'A brave bug sat on a branch.',
      'The bug wants my bread.',
      'I brush the crumbs off.',
      'The crumbs fell on a brick.',
      'The bug got the crumbs.',
      'I do not brag.',
      'My cup is full to the brim.',
      'I bring the bread in.'
    ]
  },

  // --- Endings: plural and present-tense -s ---
  // Taught straight after CVC: nearly every story needs it, and a decodable
  // series that withholds -s until late cannot write natural sentences.
  'end-s': {
    title: 'Ten Hats',
    label: 'Endings — plural -s',
    practiceWords: ['bats', 'caps', 'cats', 'hats', 'hens', 'nuts', 'pans', 'pens', 'pots', 'rats'],
    story: [
      'I have ten hats.',
      'I have ten caps.',
      'My cats sit on the hats.',
      'The hens peck at the caps.',
      'Dad has pots and pans.',
      'The pots are hot.',
      'I get nuts in a pan.',
      'The rats want my nuts.',
      'The bats nap all day.',
      'My cats nap with the bats.'
    ]
  },

  // --- Vowel Teams ---
  'vt-ee': {
    title: 'The Bee in the Tree',
    label: 'Vowel Teams — ee',
    practiceWords: ['bee', 'deep', 'feed', 'feet', 'free', 'green', 'keep', 'need', 'see', 'tree'],
    story: [
      'I see a bee.',
      'The bee is in a green tree.',
      'I keep still by the tree.',
      'The bee has six feet.',
      'The bee will feed on a weed.',
      'I need to sit.',
      'The grass is deep and green.',
      'The bee is free to go.',
      'I feel the wind in the tree.',
      'I will see my bee next week.'
    ]
  },
  'vt-ea': {
    title: 'A Day at the Beach',
    label: 'Vowel Teams — ea',
    practiceWords: ['beach', 'bean', 'each', 'eat', 'heat', 'leaf', 'meal', 'read', 'sea', 'team'],
    story: [
      'Our team will eat a meal.',
      'We eat by the sea.',
      'Each of us has a bean.',
      'I read on the beach.',
      'The sun has heat.',
      'A leaf fell on my meal.',
      'I read to my team.',
      'We each get a treat.',
      'The sea is clean and green.',
      'A day at the beach is neat.'
    ]
  },
  'vt-ai': {
    title: 'Rain on the Train',
    label: 'Vowel Teams — ai and ay',
    practiceWords: ['day', 'hay', 'mail', 'main', 'play', 'rain', 'sail', 'tail', 'train', 'way'],
    story: [
      'It will rain all day.',
      'I wait for the mail.',
      'The mail is late.',
      'A train goes by in the rain.',
      'The train has a long tail.',
      'I play in the rain.',
      'My sail is wet.',
      'I put hay by the gate.',
      'The rain goes away.',
      'Now I can play all day.'
    ]
  },
  'vt-oa': {
    title: 'The Goat in the Boat',
    label: 'Vowel Teams — oa and ow',
    practiceWords: ['boat', 'coat', 'float', 'goat', 'load', 'road', 'row', 'show', 'slow', 'toad'],
    story: [
      'I have a goat.',
      'My goat is slow.',
      'We go on the road.',
      'I show my goat a boat.',
      'The goat is in the boat.',
      'I row the boat.',
      'A toad is on the road.',
      'Snow is on my coat.',
      'The boat has a big load.',
      'My slow goat and I float.'
    ]
  },

  // --- R-Controlled Vowels ---
  'r-ar': {
    title: 'The Car in the Barn',
    label: 'R-Controlled — ar',
    practiceWords: ['arm', 'art', 'barn', 'car', 'card', 'far', 'farm', 'hard', 'park', 'star'],
    story: [
      'We have a farm.',
      'A big red barn is on the farm.',
      'My car is in the barn.',
      'We park the car by the barn.',
      'The path is hard.',
      'I lift my arm.',
      'Mom made me a card.',
      'The card has art on it.',
      'I see a star.',
      'The star is far from the farm.'
    ]
  },
  'r-or': {
    title: 'The Storm',
    label: 'R-Controlled — or',
    practiceWords: ['born', 'corn', 'for', 'fork', 'horn', 'north', 'port', 'short', 'sort', 'storm'],
    story: [
      'A storm came to the farm.',
      'The corn is short.',
      'I sort the corn with a fork.',
      'A horn blows in the storm.',
      'The ship is in the port.',
      'The storm is from the north.',
      'A foal was born in the barn.',
      'I have corn for the foal.',
      'The storm is over.',
      'Now the corn can grow.'
    ]
  },
  'r-er': {
    title: 'Her Bird',
    label: 'R-Controlled — er, ir and ur',
    practiceWords: ['bird', 'burn', 'curl', 'dirt', 'fern', 'girl', 'her', 'hurt', 'stir', 'turn'],
    story: [
      'The girl has a bird.',
      'Her bird sits in a fern.',
      'The bird digs in the dirt.',
      'The girl will not hurt her bird.',
      'She will turn and look.',
      'The bird has a curl of red.',
      'The girl can stir her cup.',
      'Do not burn your hand!',
      'The bird sits on her arm.',
      'The girl and her bird turn to go.'
    ]
  },

  // --- Diphthongs ---
  'dip-oi': {
    title: 'The Coin in the Soil',
    label: 'Diphthongs — oi and oy',
    practiceWords: ['boil', 'boy', 'coil', 'coin', 'join', 'joy', 'oil', 'soil', 'toy', 'voice'],
    story: [
      'The boy has a toy.',
      'He digs in the soil.',
      'He finds a coin!',
      'The coin has soil on it.',
      'We put the coin in oil.',
      'The oil gets it clean.',
      'A coil of rope is by us.',
      'I join the boy.',
      'The boy lifts his voice with joy.',
      'What joy to find a coin!'
    ]
  },
  'dip-ou': {
    title: 'The Owl and the Mouse',
    label: 'Diphthongs — ou and ow',
    practiceWords: ['cloud', 'cow', 'down', 'found', 'house', 'mouse', 'out', 'owl', 'round', 'town'],
    story: [
      'An owl is in a tree.',
      'The owl peeks down.',
      'A mouse runs out of the house.',
      'The mouse is small and round.',
      'A cloud is over the town.',
      'A cow is out in the grass.',
      'The mouse found a nut.',
      'Then the owl found the mouse.',
      'The mouse runs down to its house.',
      'Now the owl is out of luck.'
    ]
  },

  // --- Inflectional Endings ---
  'end-ed': {
    title: 'We Packed and Played',
    label: 'Endings — -ed',
    practiceWords: ['jumped', 'landed', 'mixed', 'packed', 'planted', 'played', 'rained', 'tested', 'waited', 'wanted'],
    story: [
      'We packed a bag.',
      'We played in the park.',
      'I jumped up on a log.',
      'Then it rained.',
      'We waited in the barn.',
      'Mom mixed a treat for us.',
      'We tested it.',
      'We planted a seed.',
      'The seed landed in the soil.',
      'We wanted to stay all day.'
    ]
  },
  'end-ing': {
    title: 'Going and Growing',
    label: 'Endings — -ing',
    practiceWords: ['eating', 'going', 'growing', 'jumping', 'playing', 'raining', 'reading', 'running', 'sitting', 'waiting'],
    story: [
      'It is raining.',
      'I am sitting and reading.',
      'My dog is eating.',
      'The corn is growing.',
      'We are going to the farm.',
      'The cats are running.',
      'The boy is jumping.',
      'The girl is playing.',
      'I am waiting for the rain to stop.',
      'Then we are all going out.'
    ]
  },

  // --- Two-Syllable Words ---
  'syl-compound': {
    title: 'Sunset at the Farmhouse',
    label: 'Two Syllables — compound words',
    practiceWords: ['bedtime', 'cannot', 'cupcake', 'farmhouse', 'hilltop', 'into', 'sandbox', 'sunset', 'tiptoe', 'upon'],
    story: [
      'We go into the farmhouse.',
      'I play in the sandbox.',
      'I run to the hilltop.',
      'Mom has a cupcake for me.',
      'I cannot wait to eat it.',
      'We sit upon the grass.',
      'We see the sunset.',
      'I tiptoe into the house.',
      'Then it is bedtime.',
      'A sunset at the farmhouse is the best.'
    ]
  },
  'syl-closed': {
    title: 'The Rabbit and the Basket',
    label: 'Two Syllables — closed syllables',
    practiceWords: ['basket', 'helmet', 'kitten', 'magnet', 'mitten', 'muffin', 'napkin', 'picnic', 'rabbit', 'tablet'],
    story: [
      'We plan a picnic.',
      'I pack a basket.',
      'I put a muffin in the basket.',
      'I put a napkin in too.',
      'My kitten wants the muffin.',
      'A rabbit hops up to us.',
      'The rabbit sits by my mitten.',
      'I put on my helmet.',
      'My magnet is in the basket too.',
      'The picnic on the grass was fun.'
    ]
  }
};

// ===== Sight words =====
//
// Words a child is expected to recognise on sight rather than sound out, either
// because they are irregular (`said`, `was`) or so frequent that waiting for
// their pattern would make natural sentences impossible (`the`, `of`).
//
// This list exists so decodability can be *checked* instead of assumed. Any
// word in a story that is neither decodable by a taught pattern nor on this
// list is reported by `npm run check-content`. Dolch pre-primer through third
// grade, plus a few the stories need.
//
// Adding a word here is a curriculum decision, not a typo fix: it asserts that
// children reading these books have been taught it.
const SIGHT_WORDS = [
  'a', 'about', 'after', 'again', 'all', 'am', 'an', 'and', 'any', 'are', 'around', 'as',
  'ask', 'at', 'ate', 'away',
  'be', 'because', 'been', 'before', 'best', 'better', 'both', 'bring', 'but', 'buy', 'by',
  'call', 'came', 'can', 'come', 'could',
  'did', 'do', 'does', 'done',
  'eight', 'every',
  'fall', 'far', 'fast', 'find', 'first', 'five', 'fly', 'for', 'found', 'four', 'from', 'full',
  'gave', 'get', 'give', 'go', 'goes', 'going', 'gone', 'good', 'got', 'grow',
  'had', 'has', 'have', 'he', 'help', 'her', 'here', 'him', 'his', 'hold', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just',
  'keep', 'kind', 'know',
  'laugh', 'let', 'light', 'like', 'little', 'live', 'long', 'look', 'love',
  'made', 'make', 'many', 'may', 'me', 'more', 'most', 'much', 'must', 'my', 'myself',
  'never', 'new', 'next', 'no', 'not', 'now',
  'of', 'off', 'old', 'on', 'once', 'one', 'only', 'open', 'or', 'our', 'out', 'over', 'own',
  'pick', 'play', 'please', 'pull', 'put',
  'ran', 'read', 'right', 'round', 'run',
  'said', 'saw', 'say', 'see', 'seven', 'shall', 'she', 'show', 'sing', 'sit', 'six', 'sleep',
  'small', 'so', 'some', 'soon', 'start', 'stay', 'stop',
  'take', 'tell', 'ten', 'thank', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
  'they', 'think', 'this', 'those', 'three', 'to', 'today', 'together', 'too', 'try', 'two',
  'under', 'up', 'upon', 'us', 'use',
  'very',
  'walk', 'want', 'warm', 'was', 'wash', 'we', 'well', 'went', 'were', 'what', 'when',
  'where', 'which', 'white', 'who', 'why', 'will', 'wish', 'with', 'work', 'would', 'write',
  'yes', 'you', 'your'
];

// Character names. Proper nouns are not expected to be decodable — a child's
// own name usually is not either, which is normal for decodable readers.
const NAMES = ['Beth', 'Dad', 'Gus', 'Hope', 'June', 'Mom', 'Tim', 'Tom'];

// ===== Scope and sequence =====
//
// The order skills are taught in. A book may use any pattern taught at or
// before its own position, and nothing after it — which is exactly what
// `npm run check-content` verifies. Reordering this changes what counts as
// decodable, so it is a curriculum decision.
//
// `patterns` names the phonics elements each book introduces. The checker maps
// those names to matchers in tools/check-content.mjs.
const SEQUENCE = [
  { key: 'cvc-a', patterns: ['closed'] },
  { key: 'cvc-e', patterns: ['closed'] },
  { key: 'cvc-i', patterns: ['closed'] },
  { key: 'cvc-o', patterns: ['closed'] },
  { key: 'cvc-u', patterns: ['closed'] },
  { key: 'end-s', patterns: ['ending-s'] },
  { key: 'digraph-sh', patterns: ['digraph'] },
  { key: 'digraph-ch', patterns: ['digraph'] },
  { key: 'digraph-th', patterns: ['digraph'] },
  { key: 'blend-bl', patterns: ['blend'] },
  { key: 'blend-cl', patterns: ['blend'] },
  { key: 'blend-fl', patterns: ['blend'] },
  { key: 'blend-pl', patterns: ['blend'] },
  { key: 'blend-tr', patterns: ['blend'] },
  { key: 'blend-dr', patterns: ['blend'] },
  { key: 'blend-pr', patterns: ['blend'] },
  { key: 'blend-br', patterns: ['blend'] },
  { key: 'cvce-a', patterns: ['cvce'] },
  { key: 'cvce-i', patterns: ['cvce'] },
  { key: 'cvce-o', patterns: ['cvce'] },
  { key: 'cvce-u', patterns: ['cvce'] },
  { key: 'vt-ee', patterns: ['team-ee'] },
  { key: 'vt-ea', patterns: ['team-ea'] },
  { key: 'vt-ai', patterns: ['team-ai'] },
  { key: 'vt-oa', patterns: ['team-oa'] },
  { key: 'r-ar', patterns: ['r-ar'] },
  { key: 'r-or', patterns: ['r-or'] },
  { key: 'r-er', patterns: ['r-er'] },
  { key: 'dip-oi', patterns: ['dip-oi'] },
  { key: 'dip-ou', patterns: ['dip-ou'] },
  { key: 'end-ed', patterns: ['ending-ed'] },
  { key: 'end-ing', patterns: ['ending-ing'] },
  { key: 'syl-compound', patterns: ['compound'] },
  { key: 'syl-closed', patterns: ['two-closed'] },
  // Review books sit at the end: they may draw on everything taught.
  { key: 'review-short', patterns: [] },
  { key: 'review-long', patterns: [] }
];

// ===== Review books =====
//
// The practice word list still samples every source book, so a review covers
// all five vowels. The story is written by hand: concatenating four unrelated
// stories produced a book that was decodable but not readable — a child got
// five openings and no narrative.
function buildReviewBook(key, title, label, sourceKeys, wordsPer, story) {
  const practiceWords = [];
  sourceKeys.forEach((sourceKey) => {
    const source = WORD_DATA[sourceKey];
    if (!source) return;
    // Skip a word this book already has, so a word shared between two source
    // lists doesn't appear twice.
    const picked = source.practiceWords
      .filter((w) => !practiceWords.includes(w))
      .slice(0, wordsPer);
    practiceWords.push(...picked);
  });
  WORD_DATA[key] = { title, label, practiceWords, story };
}

buildReviewBook(
  'review-short', 'Gus and the Bug', 'Short Vowel Review — a, e, i, o, u',
  ['cvc-a', 'cvc-e', 'cvc-i', 'cvc-o', 'cvc-u'], 2,
  [
    'Gus has a red hen.',
    'The hen sat on a mat.',
    'Then a big bug ran in.',
    'The bug hid in a pot.',
    'Gus got the pot.',
    'The hen ran to her pen.',
    'Gus and the hen dig in the mud.',
    'The bug is on top of a log.',
    'Gus can not get the bug.',
    'Gus and his hen nap in the sun.'
  ]
);

buildReviewBook(
  'review-long', 'The Bike and the Lake', 'Long Vowel Review — a, i, o, u',
  ['cvce-a', 'cvce-i', 'cvce-o', 'cvce-u'], 3,
  [
    'We ride a bike to the lake.',
    'I take a cake in my pack.',
    'Nine limes are in the pack too.',
    'We sit by the lake.',
    'A mule is home by the gate.',
    'The mule has a rope.',
    'I use the rope on the gate.',
    'The cake is huge.',
    'We take a bite at the same time.',
    'What a fine day at the lake!'
  ]
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
  'vowel-teams': {
    label: 'Vowel Teams',
    narrowLabel: 'Team Focus',
    narrowPlaceholder: '-- Choose a team --',
    options: [
      { value: 'ee', label: 'ee (bee, tree)', key: 'vt-ee' },
      { value: 'ea', label: 'ea (beach, eat)', key: 'vt-ea' },
      { value: 'ai', label: 'ai / ay (rain, play)', key: 'vt-ai' },
      { value: 'oa', label: 'oa / ow (boat, show)', key: 'vt-oa' }
    ]
  },
  'r-controlled': {
    label: 'R-Controlled Vowels',
    narrowLabel: 'Vowel Focus',
    narrowPlaceholder: '-- Choose a focus --',
    options: [
      { value: 'ar', label: 'ar (car, farm)', key: 'r-ar' },
      { value: 'or', label: 'or (corn, storm)', key: 'r-or' },
      { value: 'er', label: 'er / ir / ur (her, bird, turn)', key: 'r-er' }
    ]
  },
  'diphthongs': {
    label: 'Diphthongs',
    narrowLabel: 'Diphthong Focus',
    narrowPlaceholder: '-- Choose a diphthong --',
    options: [
      { value: 'oi', label: 'oi / oy (coin, boy)', key: 'dip-oi' },
      { value: 'ou', label: 'ou / ow (house, owl)', key: 'dip-ou' }
    ]
  },
  'endings': {
    label: 'Inflectional Endings',
    narrowLabel: 'Ending Focus',
    narrowPlaceholder: '-- Choose an ending --',
    options: [
      { value: 's', label: '-s (cats, hats)', key: 'end-s' },
      { value: 'ed', label: '-ed (jumped, played)', key: 'end-ed' },
      { value: 'ing', label: '-ing (going, running)', key: 'end-ing' }
    ]
  },
  'two-syllable': {
    label: 'Two-Syllable Words',
    narrowLabel: 'Word Type',
    narrowPlaceholder: '-- Choose a type --',
    options: [
      { value: 'compound', label: 'Compound words (sunset, cupcake)', key: 'syl-compound' },
      { value: 'closed', label: 'Closed syllables (rabbit, picnic)', key: 'syl-closed' }
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
      { value: 'mixed', label: 'Mixed review (a, i, o, u)', key: 'review-long' }
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
