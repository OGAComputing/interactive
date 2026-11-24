// Y10 BTEC Component 1 — Lesson 4.1 Spot the Genre (spec B1: genre: identification of generic characteristics,
// e.g. iconography of film genres, conventions of national newspapers, components of a web page).
// Hub page: Y10/Component_1/L4.1_Spot_the_Genre/.
// The deck follows the page's two parts: genre and iconography (Warm-up, Task 1 three trailers, Task 2 find the
// iconography, ★ Spot the slip), then conventions across the sectors (Task 3 name it from its conventions, Task 4
// describe a genre, ★ Breaking a convention; unlock word MASTHEAD).
// The page's own examples (the Dune, Superman and How to Train Your Dragon clips; the Five Nights at Freddy's still
// and the Mandalorian poster; EastEnders, The Simpsons, The Chase, the 1966 Sunday Mirror, BBC Sport and F1 25;
// Beetlejuice Beetlejuice and Despicable Me) are not worked through here, so no slide gives a task's answer away.
// Worked models: Harry Potter (iconography), Bake Off (conventions), a 1945 Daily Mirror and the 1938 New York Times
// (tabloid and broadsheet). Five Nights at Freddy's appears once, as a poster: one genre in two sectors.
//
//   node build_L4.1.cjs   → L4.1_Spot_the_Genre.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L4.1_Spot_the_Genre.pptx');
const K = createDeck({ lesson: '4.1', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 4.1: Spot the Genre' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How can you tell a product\'s genre straight away?';
const WHERE = 'Hub › Year 10 › Lesson 4.1 › Spot the Genre';

// Recap: four earlier lessons, one question each: 3.3 and 3.2 (recent), 2.2 and 2.1 (a while ago).
// Four options each, all real terms from that lesson, and no question names its answer or a word from its definition.
const RECALL = [
  { tag: 'Lesson 3.3', q: 'A viewer of a new Nike advert: "Love the music, but those trainers cost far too much." Which?', options: ['preferred reading', 'negotiated reading', 'oppositional reading', 'passive audience'], a: 'Negotiated reading: they accept part of it, but not all' },
  { tag: 'Lesson 3.2', q: 'Lily watches a YouTube video before she makes pancakes for the first time. Which need?', options: ['information', 'escapism', 'personal identity', 'social interaction'], a: 'Information: she learns how to do it' },
  { tag: 'Lesson 2.2', q: 'A doctor and a lawyer. Which socio-economic group?', options: ['AB', 'C1', 'C2', 'DE'], a: 'AB: higher and middle managers and professionals' },
  { tag: 'Lesson 2.1', q: 'You read a Wikipedia page about the Euros. Which kind of research?', options: ['primary research', 'secondary research', 'a reference', 'a screen recording'], a: 'Secondary research: someone else found it out first' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'One question from each of four earlier lessons: Q1 looks back at 3.3, Q2 at 3.2, Q3 at 2.2 and Q4 at 2.1, so two come from a while ago. Each has four options; no notes. If the Unit A check showed weak terms, swap one in here.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q1: the "but" is the clue for negotiated. Q2: learning how to do something is information, not entertainment. Q3: AB is professionals and managers; C1 office and supervisory jobs; C2 skilled manual; DE semi-skilled, unskilled and not working. Q4: Wikipedia is someone else\'s research, so it is secondary; primary would be asking people yourself.' });

K.titleSlide({ coverLine: 'Spot the Genre', issueLine: 'Lesson 4.1  ·  Y10 BTEC Creative Media',
  standfirst: 'Three seconds of a trailer and you know what kind of film it is. How?', puff: 'Lesson 4.1',
  img: img('dune_part_two_2024.jpg'), imgLabel: 'Dune: Part Two poster (2024) · Warner Bros. / Legendary',
  notes: 'Learning Aim B starts today: how products are made to mean something. Two parts: genre and the things that show it (iconography), then the conventions every genre has, in films, TV, newspapers, websites and games. Students watch the Dune: Part Two trailer clip in Task 1.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary.' });

// ── Part 1: genre and iconography (Warm-up, Task 1, Task 2, ★ Spot the slip) ──
// Concrete first (README 2026-11-17): students name genres from what they see, then the words.
K.info({ title: 'Name it in one second', standfirst: 'What kind of film has…', points: [
  ['A cowboy hat', 'a horse, a sheriff\'s badge and a dusty street with a saloon?'],
  ['A stadium', 'a team in kit, a coach shouting and one last match to win?'],
  ['A dark wood', 'a full moon, a howl and a torch that keeps flickering?']],
  notes: 'One per click. Before each reveal, read it and ask: what kind of film? Hands up as fast as they can (western, sports film, horror). Then ask: how did you know so fast? You have never seen this film. Something you SAW told you. That is today\'s lesson.' });

const sGenre = K.keyTerm({ term: 'Genre', say: 'ZHON-ruh',
  definition: 'A type of product. Every sector has genres: horror and sci-fi films, soap operas and quiz shows, racing and platform games.',
  example: 'Five Nights at Freddy\'s is horror as a game (2014) and as a film (2023): one genre, two sectors.',
  img: img('five_nights_at_freddys_2023.jpg'), imgLabel: 'Five Nights at Freddy\'s poster (2023) · Universal / Blumhouse',
  notes: 'Spec B1: genre. Genre is not the sector (print, audio/moving image, interactive): a common slip, and one of the ★ Spot the slip lines. One genre can be in every sector: horror films, horror games, horror books, horror podcasts. Example on click.' });
K.isys(sGenre, { term: 'Genre', fact: 'a type of product',
  check: 'What do we call a type of product, like horror?', reverse: 'What is a genre?',
  say: 'A genre is a type of product, like horror, sitcom or racing game.' });

const sIcon = K.keyTerm({ term: 'Iconography', say: 'eye-kuh-NOG-ruh-fee',
  definition: 'Objects, costumes, settings: the things you see that tell you the genre. A cowboy hat says western; a spaceship says sci-fi.',
  example: 'Fantasy iconography: a wizard\'s hat, a castle on a mountain, an owl that carries letters, flaming torches.',
  img: img('harry_potter_philosophers_stone_2001.jpg'), imgLabel: 'Harry Potter and the Philosopher\'s Stone poster (2001) · Warner Bros.',
  notes: 'Spec B1: identification of generic characteristics, e.g. iconography of film genres. Iconography is what you can SEE and POINT AT. Go back to the three films on the last slide: the hat, the stadium, the full moon were all iconography. Example on click; the next slide marks it on the poster.' });
K.isys(sIcon, { term: 'Iconography', fact: 'objects, costumes, settings',
  check: 'What do we call the objects, costumes and settings that show the genre?', reverse: 'What is iconography?',
  say: 'Iconography is objects, costumes, settings: the things you see that tell you the genre.' });

K.annotate({ title: 'Worked model: Harry Potter', pillar: 'info', img: img('harry_potter_philosophers_stone_2001.jpg'),
  imgLabel: 'Harry Potter and the Philosopher\'s Stone poster (2001) · Warner Bros.', tall: true,
  marks: [{ at: [0.27, 0.41], label: 'Costume', note: 'A pointed wizard\'s hat → magic' },
    { at: [0.6, 0.3], label: 'Setting', note: 'Hogwarts, a castle on a mountain → a magical world' },
    { at: [0.86, 0.33], label: 'Creature', note: 'A white owl → letters delivered by magic' },
    { at: [0.16, 0.74], label: 'Object', note: 'Flaming torches → old and mysterious' }],
  prompt: 'Point at it → name it (object, costume, setting) → what genre does it say?',
  notes: 'Markers sit beside what they label. Model aloud: "I can see a pointed hat. That is a costume. A costume like that says fantasy." Do one, then let the class do the rest. This is Task 2: they place numbered pins on a film still and a poster.' });

K.choice({ question: 'A poster shows a dusty street, a sheriff\'s badge and a horse outside a saloon. What is the badge?',
  options: ['The genre', 'The sector', 'Iconography', 'The audience'], answer: 'C',
  notes: 'Answer C: an object you can point at that tells you the genre (western). The genre is western; the sector is print (a poster). Anyone who said A has mixed up the sign with what it tells you.' });

K.turnTalk({ lead: 'Think of a film, series or game you love.',
  prompt: 'What iconography tells you its genre straight away?',
  notes: `Push for objects, costumes and settings they could point at, and the genre each one says: "Lightsabers and spaceships, so it's sci-fi."
Task 1 is three trailer clips, Task 2 a still and a poster.` });

K.task({ title: 'Genre and iconography', mins: 15, where: WHERE,
  steps: ['Warm-up: which genre does each piece of iconography say? The meanings are open.',
    'Task 1 · Three trailers: watch each clip, then name its genre and the iconography in it.',
    'Task 2 · Find the iconography: pick a pin, click the picture. Seven pins.',
    'Finished? ★ Spot the slip: Mo\'s three mistakes. Tasks 3 and 4 open later.'],
  criteria: ['Watch each clip before you answer', 'Every pin on something you can point at', 'All right first time for gold'],
  notes: 'Warm-up is optional. Task 1: the three clips play in Drive (school accounts only); each iconography option could be in that genre, so only watching the clip tells them which is there. Task 2: pick a numbered pin, click the picture; the next pin is picked for them. A wrong check makes them wait 10 s. Tasks 3 and 4 are locked until the Part 2 word.' });

// ── Part 2: conventions across the sectors (Task 3, Task 4, ★ Breaking a convention) ──
const sConv = K.keyTerm({ term: 'Conventions', say: 'kun-VEN-shunz',
  definition: 'What we expect: the things a genre usually has. Iconography is one kind; the story, the sound and the layout have conventions too.',
  example: 'Bake Off: a tent, a technical challenge, judges tasting, a Star Baker, and someone leaves every week.',
  img: img('bake_off_2025.jpg'), imgLabel: 'The Great British Bake Off · Channel 4 / Love Productions',
  notes: 'Spec B1: generic codes and conventions. Iconography is what you see; conventions are everything we EXPECT, including what happens (someone leaves every week) and how it is laid out. Example on click: every Bake Off has these, and so does nearly every cooking competition.' });
K.isys(sConv, { term: 'Conventions', fact: 'what we expect',
  check: 'What are the things we expect from a genre called?', reverse: 'What are conventions?',
  say: 'Conventions are what we expect from a genre.' });

K.compare({ title: 'Newspapers: two genres',
  a: { name: 'Tabloid', img: img('daily_mirror_1925.jpg'), imgLabel: 'Daily Mirror front page, 23 April 1925 · public domain (Wikimedia Commons)' },
  b: { name: 'Broadsheet', img: img('war_of_the_worlds_nyt_1938.jpg'), imgLabel: 'The New York Times, 31 October 1938 (cropped)' },
  rows: [['Masthead', 'The name, often in a red box', 'The name in old-style letters'],
    ['Headline', 'Huge, a few words, often a pun or "!"', 'Smaller, longer, gives the facts'],
    ['Photos', 'One big photo fills the page', 'Small, or none'],
    ['Stories', 'Short and punchy', 'Long, with lots of detail']],
  notes: 'Spec B1: conventions of national newspapers. One row per click. The masthead is the name across the top of the front page; tabloids with a red one are called "red tops". Today\'s tabloids: The Sun, Daily Mirror, Daily Star; broadsheets (many now printed smaller, but written the same way): The Times, The Guardian, The Telegraph.' });

K.info({ title: 'Every sector has conventions', standfirst: 'You expect them before you even look properly.', points: [
  ['A web page', 'A logo in the top left, a navigation bar of links across the top, a search box.'],
  ['A game screen', 'Your score, your lives or health, a small map in the corner.'],
  ['A TV show', 'The same opening music, the same set and the same parts in the same order, every episode.']],
  notes: 'Spec B1: components of a web page. One per click. Ask for a real example of each from their own phones and consoles. Task 3 hides six real products and gives one convention at a time: they name the genre.' });

K.choice({ question: 'Every new Pokémon game starts with you choosing one of three starter Pokémon. What is that?',
  options: ['A sector', 'A convention', 'An audience', 'A genre'], answer: 'B',
  notes: 'Answer B: something players expect every time, so a convention of Pokémon games. Not iconography either: it\'s something that happens, not an object you can point at.' });

K.turnTalk({ lead: 'Pick a genre you know well: a type of game, show, film or video.',
  prompt: 'What do you expect from it, every single time?',
  notes: `Take three or four genres and list two conventions for each. Ask: what would happen if one was missing? (That's the ★ challenge: products that break a convention on purpose.)` });

K.task({ title: 'Name it from its conventions', mins: 20, unlock: 'masthead', where: WHERE,
  steps: ['Task 3 · Name it from its conventions: six hidden products. A new clue comes every few seconds.',
    'Guess early for more stars, but a wrong guess makes you wait longer than the next clue.',
    'Task 4 · Describe a genre: one trailer from Task 1, with genre, iconography and conventions.',
    'Finished? ★ Breaking a convention: two examples, then one of your own.'],
  criteria: ['Read the clue before you guess', 'Each Task 4 box uses its word', 'A reason with "because"'],
  notes: 'Unlock word MASTHEAD opens Tasks 3 and 4 and the ★ challenge. Teacher mode or "outwood" opens every part. Task 3: clues appear by themselves every 7 s; a wrong guess costs 10 s, so wild guessing loses. Task 4 is writing with starters and a Five Nights at Freddy\'s example; it is scored on completion and sent to Classroom.' });

K.plenary({ lesson: LESSON, task: 'Answer today\'s question for one product you know: its genre, one piece of iconography and one convention.',
  starter: '"I can tell ___ is ___ straight away because ___."',
  notes: 'Exit ticket. Listen for the three words: genre, iconography (something you can point at) and a convention (something you expect). Next lesson (4.2): genres change: sub-genres, hybrids and breaking the rules.' });

K.write(OUT);
