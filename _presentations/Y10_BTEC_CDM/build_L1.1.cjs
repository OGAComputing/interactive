// Y10 BTEC Component 1 — Lesson 1.1 Media Everywhere (first half of the week 1 double; 1.2 has its own deck).
// Hub page: Y10/Component_1/L1.1_Media_Everywhere/.
//
//   node build_L1.1.cjs   → L1.1_Media_Everywhere.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1.1_Media_Everywhere.pptx');
const K = createDeck({ lesson: '1.1', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 1.1: Media Everywhere' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'What are the three media sectors, and how has media changed since 2000?';

// Recap bridges from the Component 3 mock (the FIZZIKAL magazine cover), with choices.
const RECALL = [
  { tag: 'C3 mock', q: 'On your FIZZIKAL cover, the big brand name across the top is the…', options: ['masthead', 'cover line', 'puff'], a: 'Masthead' },
  { tag: 'C3 mock', q: 'The short lines of text around your cover image are…', options: ['cover lines', 'mastheads', 'captions'], a: "Cover lines: they tell readers what's inside" },
  { tag: 'C3 mock', q: "Who was FIZZIKAL for? Example: 'teenagers who play team sports'.", a: 'Its target audience: who every choice was for' },
  { tag: 'Bridge', q: 'Your cover was a print product. Which of these is also print?', options: ['a billboard', 'a podcast', 'a website'], a: 'A billboard (a podcast is audio, a website is interactive)' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Bridge from the Component 3 mock: they made a FIZZIKAL magazine cover, a print product. Q4 previews today: the three sectors. Choices on screen, so no bare recall.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q4 is the hook into today: print is one of three media sectors.' });

K.titleSlide({ coverLine: 'Media Everywhere', issueLine: 'Lesson 1.1  ·  Y10 BTEC Creative Media', standfirst: 'Films, games, magazines, apps: what kind of media is each one, and when was it made?', puff: 'Lesson 1.1',
  img: img('stranger_things.jpg'), imgLabel: 'Stranger Things poster (Netflix, 2016)',
  notes: 'Cover: Stranger Things (2016), a contemporary TV series set in the 1980s. Ask: is it historical or contemporary? (Contemporary: it was MADE in 2016, even though it is set in 1983.)' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary.' });

K.info({ title: 'What counts as media?', standfirst: 'A media product is anything made to reach an audience through sound, pictures, print or a screen.',
  points: [['Audio / moving image', 'You watch or listen: films, TV, music videos, radio, podcasts, YouTube.'],
    ['Print', 'Printed on paper: newspapers, magazines, comics, posters, billboards.'],
    ['Interactive', 'You make choices: games, apps, websites, social media.'],
    ['Then or now?', 'Made before 2000 = historical. Made in 2000 or later = contemporary.']],
  img: img('tiktok.jpg'), imgLabel: 'TikTok feed (App Store screenshot)',
  notes: 'The three sectors are Pearson\'s (spec A1). Contemporary = post-2000, historical = pre-2000 (spec wording). TikTok: interactive, contemporary (2016).' });

K.keyTerm({ term: 'Audio / moving image', definition: 'Products you watch or listen to: sound, moving pictures, or both.',
  example: 'A MrBeast YouTube video, Stranger Things on Netflix, a Radio 1 breakfast show.', img: img('mrbeast.jpg'), imgLabel: 'MrBeast video thumbnail',
  notes: 'Includes radio and podcasts (sound only) as well as film, TV, music videos, animation and adverts.' });
K.keyTerm({ term: 'Print', definition: 'Products printed on paper: you read and look at them.',
  example: 'Match of the Day magazine, a McDonald\'s billboard, a newspaper front page.', img: img('motd_mag.jpg'), imgLabel: 'Match of the Day magazine cover (2026)',
  notes: 'Includes newspapers, magazines, comics, brochures, posters, packaging and print adverts. Their FIZZIKAL cover was print.' });
K.keyTerm({ term: 'Interactive', definition: 'Products where the user makes choices and changes what happens next.',
  example: 'Minecraft, TikTok, a website: nothing happens until you click, tap or play.', img: img('minecraft.jpg'), imgLabel: 'Minecraft village screenshot',
  notes: 'Includes video, mobile and online games, apps, websites, interactive magazines and adverts.' });

K.compare({ title: 'One sector, 37 years apart', a: { name: 'Pac-Man · 1980', img: img('pacman_1980.png') }, b: { name: 'Fortnite · 2017', img: img('fortnite.jpg') },
  rows: [['Sector', 'Interactive', 'Interactive'], ['Where you play', 'An arcade machine', 'Console, PC or phone'], ['Who with', '', ''], ['How it looks', '', '']],
  notes: 'Worked example for the first two rows; students fill in the last two (mini whiteboards). Who with: on your own / up to 100 players online. How it looks: flat pixel maze / 3D world, skins, live events.' });

K.choice({ question: 'Pokémon Red came out in the UK in 1999. Which box does it go in?',
  options: ['Interactive · before 2000', 'Interactive · 2000 onwards', 'Print · before 2000'],
  notes: 'Hinge. Answer A: a Game Boy game (interactive), released 1996 in Japan and 1999 in the UK, so historical. B = era slip; C = thinks the box art makes it print.' });

K.turnTalk({ lead: 'The Jaws poster is print. Jaws the film is audio / moving image.',
  prompt: 'Name another product that lives in more than one sector.',
  img: img('jaws_1975.jpg'), imgLabel: 'Jaws poster (1975)',
  notes: 'Products cross sectors: a film has posters (print) and a website or game (interactive). Good answers: Minecraft (game + film + books), Stranger Things (series + posters + game). On the Media Board, sort the product in the picture.' });

K.task({ title: 'The Media Board', mins: 15, where: 'Hub › Year 10 › Lesson 1.1 › Media Everywhere',
  steps: ['Open Media Everywhere. Unsure about sectors? Do the Warm-up tab first.', 'Task 1: put all 21 real products in the right box: sector, then before or after 2000.', 'Check. Red cards are wrong: wait for the timer, then fix them.', 'Finished? Try the ★ Tricky cases tab. Tasks 2–4 open in Part 2.'],
  criteria: ['Every card in a box', 'Sector AND era right', 'Gold if right first time'],
  notes: 'Every card has its real image. Wrong checks cost 10, then 20, then 30 seconds (they survive a refresh). Years appear on the cards once the board is right. Differentiation: Warm-up (Sector snap: 6 products, sectors only, big pictures) and an era-clues hint inside Task 1; early finishers do ★ Tricky cases (set vs made, brand vs issue, remakes, products in two sectors). Tasks 2–4 are locked (Part 2): the unlock word is on the Then and now task slide, so nobody starts them before the clips. Dotted words on the page show their meaning on hover or tap. Optional tabs do not change the grade.' });

K.clip({ title: 'Then: The Lion King, 1994', from: '0:00', to: 'end', where: 'Click the poster to play', video: '1zqWkHbI_M8Z1Gn9lKEJH9mDbydIP0dw_',
  img: img('lion_king_1994.jpg'), imgLabel: 'The Lion King poster (1994)',
  questions: ['Which sector is it in?', 'How was it made: drawn or filmed?', 'Where would people have seen it in 1994?'],
  notes: 'Drive clip "Lion King Cartoon.mp4" (Y10/media.md). Watch the whole clip. Hand-drawn 2D animation: every frame drawn by an artist. Questions after watching.' });
K.clip({ title: 'Now: The Lion King, 2019', from: '0:00', to: 'end', where: 'Click the poster to play', video: '1T6jlQK6g5ACu4gGk13RtjHxaWHkKS5GT',
  img: img('lion_king_2019.jpg'), imgLabel: 'The Lion King poster (2019)',
  questions: ['What is the same as 1994?', 'What looks different?', 'Why was it released online first?'],
  notes: 'Drive clip "Lion King Digital.mp4", whole clip. Same story, studio and music, 25 years apart, but computer-generated (CGI) to look like real animals. Technology and platforms (YouTube, social media) changed the product; the story did not.' });

K.task({ title: 'Then and now', mins: 15, unlock: 'simba', where: 'Hub › Lesson 1.1 › Tasks 2–4',
  steps: ['Task 2: watch both trailers, then answer the questions.', 'Task 3: write one difference, and why you think they changed.', 'Task 4: name one product YOU used from each sector.', 'Finished? ★ Remake it, the last tab.'],
  criteria: ['Full sentences in Tasks 3 and 4', 'Real product names, not "a game"', 'Says WHY, not just what'],
  notes: 'Unlock word SIMBA: students type it on any locked tab to open Tasks 2–4 and ★ Remake it (it stays open after a refresh). A teacher signed in through Classroom, or anyone typing "outwood", gets every part. Tasks 3–4 are writing: not auto-marked, sent to Classroom as evidence. ★ Remake it is optional extended writing and does not change the grade.' });

K.plenary({ lesson: LESSON, task: 'Name the three media sectors, with one product from each. Then give one way The Lion King changed between 1994 and 2019.',
  starter: '"The three sectors are… One change since 1994 is…"',
  notes: 'Exit ticket. Next lesson: 1.2 Reading an Image (posters: denotation, connotation, anchorage, polysemy, encoding).' });

K.write(OUT);
