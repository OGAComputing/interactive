// Y10 BTEC Component 1 — Lesson 4.2 Genres Change (spec B1: how genres change over time, e.g. development of
// sub-genres, hybrids, subverting generic conventions; repetition and difference).
// Hub page: Y10/Component_1/L4.2_Genres_Change/.
// The deck follows the page's two parts: sub-genres and hybrids (Warm-up, Task 1 inside or mixed?, Task 2 use the
// words, ★ Invent a hybrid), then subverting, repetition and difference (Task 3 repeat, add or subvert? with the
// Encanto, Horrible Histories and Untitled Goose Game clips; Task 4 then and now; ★ Photoshop: bring it up to date;
// unlock word REMAKE). Second lesson of the week 4 double, so it carries the week's Photoshop filler
// (Layers: name, order and group them; Place Embedded).
// The page's own examples (Hunger Games, Britain's Got Talent, Sonic Racing, Plants vs. Zombies, Ghosts, Kung Fu
// Panda 4; the three clips' cards; the Pokémon, Batman and Godzilla pairs) are not worked through here, so no slide
// gives a task's answer away. The clips are shown for the genre and its conventions only. Worked models: Star Wars
// (sub-genre), Ghostbusters: Frozen Empire (hybrid), Frozen (subverting), Zelda 1986 vs Tears of the Kingdom (then
// and now, the same pair as the page's help example). Godzilla (1954) is the cover only.
//
//   node build_L4.2.cjs   → L4.2_Genres_Change.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L4.2_Genres_Change.pptx');
const K = createDeck({ lesson: '4.2', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 4.2: Genres Change' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do genres change, and why do producers change them?';
const WHERE = 'Hub › Year 10 › Lesson 4.2 › Genres Change';

// Clips (Y10/media.md), on the page in Task 3.
const ENCANTO = '18xaPZfeZRfCCpeGZ2FXRsTGI0_IL6r6e';
const HORRIBLE = '1oK4Leki4BdTPArK6jldfpBnDRoy3xRfs';
const GOOSE = '1rFimJwPAKKw8UmELP_SNO4XNHzKaA_hk';

// Recap: four earlier lessons, one question each: 4.1 and 3.1 (recent), 2.3 and 1.2 (a while ago).
// Four options each, all real terms from that lesson, and no question names its answer or a word from its definition.
const RECALL = [
  { tag: 'Lesson 4.1', q: 'The lightsabers and the white stormtrooper armour in a Star Wars trailer. Which term?', options: ['genre', 'iconography', 'conventions', 'sector'], a: 'Iconography: objects, costumes, settings' },
  { tag: 'Lesson 3.1', q: 'Fans post their own cover of a Taylor Swift song on TikTok. Which kind of audience involvement?', options: ['passive', 'interactive features', 'online voting', 'consumer-generated content'], a: 'Consumer-generated content: the audience made it' },
  { tag: 'Lesson 2.3', q: 'You want to know what 200 students think of the school\'s YouTube channel, then draw a chart. Which?', options: ['interview', 'focus group', 'survey', 'rating scale'], a: 'Survey: the same questions for lots of people' },
  { tag: 'Lesson 1.2', q: 'A photo of a crying footballer, captioned "Tears of joy: England win the Euros!" What is the caption?', options: ['denotation', 'connotation', 'anchorage', 'polysemy'], a: 'Anchorage: words that fix meaning' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'One question from each of four earlier lessons: Q1 looks back at 4.1, Q2 at 3.1, Q3 at 2.3 and Q4 at 1.2, so two come from a while ago. Each has four options; no notes.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q1: things you can see and point at are iconography; the conventions are what the genre usually has. Q2: the fans made the video themselves. Q3: lots of people, numbers for a chart = survey; a rating scale is a kind of question you might put IN the survey. Q4: without the caption, the tears could be sadness (polysemy); the caption fixes the meaning.' });

K.titleSlide({ coverLine: 'Genres Change', issueLine: 'Lesson 4.2  ·  Y10 BTEC Creative Media',
  standfirst: 'In 1954 Godzilla was a man in a rubber suit. Seventy years on, he is still stomping cities. What changed, and what didn\'t?', puff: 'Lesson 4.2',
  img: img('godzilla_1954.jpg'), imgLabel: 'Godzilla (1954) poster · Toho',
  notes: 'Cover: the 1954 Godzilla poster. Don\'t analyse it now: Godzilla 1954 vs 2024 is one of the three pairs students can choose in Task 4. Two parts today: how genres split and mix (sub-genres and hybrids), then how producers keep a genre fresh (repetition, difference and subverting).' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Last lesson: every genre has iconography and conventions. Today: genres don\'t stay still.' });

// ── Part 1: sub-genres and hybrids (Warm-up, Task 1, Task 2, ★ Invent a hybrid) ──
// Concrete first (README 2026-11-17): four kinds of horror before the word.
K.info({ title: 'All horror, all different', standfirst: 'Every one of these is a horror film. So why don\'t they feel the same?',
  points: [['The dead walk', 'A town is overrun, and the survivors barricade the doors.'],
    ['Someone\'s in the house', 'A family moves in, and something already lives there.'],
    ['The toy moves', 'A doll smiles, and is never where you left it.'],
    ['Something\'s out there', 'Campers in a dark wood hear a howl.']],
  notes: 'One per click. Before each reveal ask: what kind of horror? (zombie, ghost or haunted house, killer doll, monster or werewolf). All four are horror: the conventions of horror are in all of them (danger, the dark, being trapped). But each is a smaller group with its own extra conventions. That smaller group has a name.' });

const sSub = K.keyTerm({ term: 'Sub-genre', say: 'SUB-zhon-ruh',
  definition: 'Part of a genre: a smaller group inside it. It has all the conventions of the big genre, plus some of its own.',
  example: 'Star Wars (1977) is a space opera, a sub-genre of science fiction: the spaceships of sci-fi, plus huge space battles, an evil empire and heroes across a whole galaxy.',
  img: img('star_wars_1977.jpg'), imgLabel: 'Star Wars (1977) poster · Lucasfilm',
  notes: 'Spec B1: development of sub-genres. Example on click. Zombie films, ghost stories and slashers are sub-genres of horror; sitcoms and romcoms are sub-genres of comedy; kart racers are a sub-genre of racing games (don\'t give that one: it is in Task 1). The test: is it still only ONE genre, just a more exact group of it?' });
K.isys(sSub, { term: 'Sub-genre', fact: 'part of a genre', check: 'What do we call part of a genre?',
  say: 'A sub-genre is part of a genre: a smaller group inside it, like zombie films inside horror.' });

const sHyb = K.keyTerm({ term: 'Hybrid', say: 'HIGH-brid',
  definition: 'Two genres mixed. It has the conventions and iconography of both, so it feels new.',
  example: 'Ghostbusters: Frozen Empire (2024) is a hybrid of horror and comedy: ghosts, slime and a frozen New York from horror, and the jokes of comedy.',
  img: img('ghostbusters_frozen_empire_2024.jpg'), imgLabel: 'Ghostbusters: Frozen Empire (2024) poster · Columbia / Sony',
  notes: 'Spec B1: development of hybrids. Example on click. Ask: which parts of the poster come from horror? (the ghosts, the ice, the dark sky) Which from comedy? (the faces, the old car with its siren) The test for a hybrid: can you see TWO genres\' conventions? The Warm-up is a sorting game: sub-genre or hybrid.' });
K.isys(sHyb, { term: 'Hybrid', fact: 'two genres mixed', check: 'What do we call two genres mixed?',
  say: 'A hybrid is two genres mixed, like a horror comedy.' });

K.info({ title: 'Why do genres change?', standfirst: 'Producers change a genre on purpose. Four reasons:',
  points: [['Audiences get bored', 'The same film again and again stops selling tickets.'],
    ['New technology', 'CGI, 3D games and phones make new kinds of product possible.'],
    ['Two audiences, not one', 'A hybrid can pull in fans of both genres.'],
    ['Something new gets talked about', 'A surprise gets shared, reviewed and remembered.']],
  notes: 'One per click. Link point 3 to audiences (2.2) and point 4 to producers\' aims (1.3). Ask after point 3: who would want to watch Ghostbusters? (horror fans AND comedy fans, including families who don\'t like full horror).' });

K.choice({ question: 'Lilo & Stitch (2025): a family comedy about a girl whose best friend is an alien who crash-landed in Hawaii. What is it?',
  options: ['A sub-genre of science fiction', 'A hybrid of horror and sitcom', 'A sub-genre of family comedy', 'A hybrid of comedy and science fiction'], answer: 'D',
  notes: 'Answer D: the jokes and family story of comedy, and the alien and spaceship of science fiction, so two genres mixed. C is the slip to listen for: it IS a comedy, but the alien comes from another genre. Task 1 asks this about six real products.' });

K.task({ title: 'Inside or mixed?', mins: 15, where: WHERE,
  steps: ['The page opens on the Warm-up: sub-genre or hybrid? The meanings are open.',
    'Task 1 · Inside or mixed? Six real products: a sub-genre or a hybrid, and of what?',
    'Task 2 · Use the words: one sub-genre product and one hybrid, in full sentences.',
    'Finished? ★ Invent a hybrid. Tasks 3 and 4 open later.'],
  criteria: ['One genre, narrowed down = sub-genre', 'Two genres\' conventions = hybrid', '"Sub-genre" and "hybrid" in your own sentences'],
  notes: 'Warm-up is optional. Task 1: a wrong check makes them wait 10 s. Each question offers both a sub-genre and a hybrid, so they have to decide which first. Task 2 is evidence for Classroom: each answer must use its word. ★ Invent a hybrid: two genres nobody would expect together. Tasks 3 and 4 are locked until the Part 2 word.' });

// ── Part 2: subverting, repetition and difference (Task 3, Task 4, ★ Photoshop) ──
const sSubv = K.keyTerm({ term: 'Subvert', say: 'sub-VURT',
  definition: 'Do the opposite of a convention, on purpose, to surprise the audience.',
  example: 'In Disney fairy tales a prince saves the princess with true love\'s kiss. Frozen (2013) subverts this: the prince is the villain, and Anna saves her sister.',
  img: img('frozen_2013.jpg'), imgLabel: 'Frozen (2013) poster · Walt Disney Animation Studios',
  notes: 'Spec B1: subverting generic conventions. Example on click. You can only subvert a convention the audience already expects: that is why it surprises them. Last lesson\'s ★ Breaking a convention (Beetlejuice Beetlejuice, Despicable Me) was subverting too; now it has its name.' });
K.isys(sSubv, { term: 'Subvert', fact: 'do the opposite', check: 'Which word means to do the opposite of a convention?', reverse: 'What does it mean to subvert a convention?',
  say: 'To subvert a convention is to do the opposite, on purpose.' });

K.info({ title: 'Repetition and difference', standfirst: 'Every product in a genre is a mix of the old and the new.',
  points: [['Repetition', 'It follows the conventions of its genre, so we get what we expect.'],
    ['Difference', 'It adds something new: something original that the genre hasn\'t had before.'],
    ['Too much repetition', 'Boring: "I\'ve seen this before."'],
    ['Too much difference', 'Confusing: it doesn\'t feel like the genre any more.']],
  notes: 'Spec B1: repetition and difference, the extent to which a product conforms to its genre\'s conventions and adds elements of originality. One per click. Producers balance the two. Subverting is one kind of difference with a twist: it doesn\'t just add something, it does the opposite of what we expect.' });

K.compare({ title: 'Worked model: then and now',
  a: { name: 'The Legend of Zelda (1986)', img: img('zelda_1986.jpg'), imgLabel: 'The Legend of Zelda box art · Nintendo' },
  b: { name: 'Tears of the Kingdom (2023)', img: img('zelda_totk_2023.jpg'), imgLabel: 'Tears of the Kingdom key art · Nintendo' },
  rows: [['Repetition', 'Link, a sword and shield, Hyrule, Ganon', 'Link, a sword and shield, Hyrule, Ganon'],
    ['Difference', 'A small flat map, seen from above', 'A huge 3D world with islands in the sky; build your own machines'],
    ['Subverting', 'Zelda waits to be rescued', 'Zelda saves Hyrule herself, as a dragon'],
    ['Why it changed', 'An 8-bit console in 1986', '3D, open worlds and players who want to build']],
  notes: 'One row per click. The same pair is the example in Task 4\'s help panel on the page. Row 1: the same conventions in both = repetition. Row 2: the new things = difference. Row 3: the opposite of the old convention = subverting. Row 4: genres change because technology and audiences change. Task 4 asks for the first three rows, about Pokémon, Batman or Godzilla.' });

K.clip({ title: 'Clip 1: Encanto', from: '0:00', to: 'end', where: 'Click to play · also on the page in Task 3', video: ENCANTO,
  img: img('encanto_clip.jpg'), imgLabel: 'Encanto (2021) trailer · Walt Disney Animation Studios',
  questions: ['What genre is Encanto?', 'What do you expect from a Disney animated musical?'],
  notes: 'Drive clip "Encanto - trailer clip.mp4" (52 s, Y10/media.md). Only the genre and its conventions here: songs, a hero on a journey, a villain, a happy ending (the list beside the clip on the page). Don\'t sort the Task 3 cards as a class.' });
K.clip({ title: 'Clip 2: Horrible Histories', from: '0:00', to: 'end', where: 'Click to play · also on the page in Task 3', video: HORRIBLE,
  img: img('horrible_histories_clip.jpg'), imgLabel: 'Horrible Histories · Lion Television / BBC',
  questions: ['What genre is Horrible Histories playing with?', 'What do you expect from a history programme?'],
  notes: 'Drive clip "Horrible Histories - Rattus and the Monarchs Song.mp4" (49 s): Rattus Rattus introduces, then the start of The Monarchs Song. Conventions of a history programme: true facts, a calm and serious presenter, real people and places. Ask what they expect; leave the comparison to Task 3.' });
K.clip({ title: 'Clip 3: Untitled Goose Game', from: '0:00', to: 'end', where: 'Click to play · also on the page in Task 3', video: GOOSE,
  img: img('goose_game_clip.jpg'), imgLabel: 'Untitled Goose Game · House House / Panic',
  questions: ['What genre is Untitled Goose Game?', 'What do you expect from a stealth game?'],
  notes: 'Drive clip "Untitled Goose Game - trailer clip.mp4" (44 s, no words). A stealth game: you sneak and hide so nobody sees you, you tick off goals, and you usually play a spy or a hero. Leave what the goose does to Task 3.' });

K.choice({ question: 'In most police films the hero cop is big and tough. In Zootropolis the hero cop is a small rabbit everyone says is too weak. What is that?',
  options: ['Subverting a convention', 'Repeating a convention', 'A new sub-genre', 'A new hybrid'], answer: 'A',
  notes: 'Answer A: the film does the opposite of what we expect from a police hero, on purpose. B would be a big, tough cop. C and D are about the genre itself splitting or mixing, not about one convention.' });

K.task({ title: 'Repeat, add or subvert?', mins: 20, unlock: 'remake', where: WHERE,
  steps: ['Task 3 · Watch the three clips, read each genre\'s conventions, then sort the nine cards.',
    'Task 4 · Then and now: pick Pokémon, Batman or Godzilla. Repetition, difference, subverting.',
    'The Zelda worked model is in Task 4\'s 💡 help panel.',
    'Finished? ★ Photoshop: bring it up to date.'],
  criteria: ['In the list = repetition', 'Not in the list = difference', 'The opposite of the list = subverting', 'Task 4 uses "repeats", "different" and "subverts"'],
  notes: 'Unlock word REMAKE opens Task 3, Task 4 and ★ Photoshop. Teacher mode or "outwood" opens every part. Task 3: three cards in each box; a wrong check costs 10 s. Task 4 is evidence for Classroom: each box must use its word (repetition or repeats, difference or different, subvert).' });

K.task({ title: '★ Photoshop: bring it up to date', mins: 15, where: 'Drive › Images: godzilla_1954.jpg or batman_1966.jpg',
  steps: ['Open the poster. Layers: double-click Background and name it "Old poster".',
    'File › Place Embedded… something from today (Photo Bank, Pexels). Enter to place.',
    'Name every new layer. Drag to order them. Ctrl+click them, Ctrl+G, name the group "Today".',
    'File › Export › Export As… JPG. Screenshot the Layers panel (Win+Shift+S). Upload both.'],
  criteria: ['Today\'s iconography, each on its own named layer', 'The genre\'s conventions kept', 'A group called "Today"', 'JPG + Layers screenshot on Classroom'],
  notes: 'The week\'s optional Photoshop filler for early finishers (skill: name, order and group layers; Place Embedded, met in 3.2). Demo in two minutes: rename a layer, drag one above another, Ctrl+G to group. The same steps are on the page, with two short questions to answer. Photopea works at home with nearly the same menus.' });

K.plenary({ lesson: LESSON, task: 'Name one product that is a sub-genre or a hybrid, and one convention a newer product has subverted.',
  starter: '"___ is a ___ because ___, and ___ subverts ___ by ___."',
  notes: 'Exit ticket. Listen for the words sub-genre, hybrid and subvert used about a real product, and push for the reason: which conventions, from which genre?' });

K.write(OUT);
