// Y10 BTEC Component 1 — Lesson 4.3 Telling Stories (spec B1: narrative; story and plot; linear, non-linear,
// circular, interactive, open and closed endings, single- and multi-strand; the inverted pyramid).
// Hub page: Y10/Component_1/L4.3_Telling_Stories/.
// The deck follows the page's two parts: story, plot and the structures (Warm-up, Task 1 Wicked in story order,
// Task 2 name the structure, ★ Tell it out of order), then the inverted pyramid (Task 3 the 1969 Moon landing,
// Task 4 use the words, ★ Pigs in the news; unlock word HEADLINE).
// The page's own answers are not worked through here: the structures are taught on other products (Encanto,
// Toy Story, Paddington in Peru, Stranger Things, Spider-Verse, Harry Potter, Shrek, Pokémon Red), so Task 2's
// seven (Moana 2, The Lion King, You vs. Wild, Infinity War, Lilo & Stitch, Bluey, Waterloo Road) stay unanswered.
// Wicked: who's who before Task 1 (enough to follow it without having seen the film, no order given away);
// the story in order after it, as the feedback. The Lion King opening clip is Task 2's feedback.
// Toy Story is linear on the page too (Task 4's help panel), so the deck uses it for linear only.
//
//   node build_L4.3.cjs   → L4.3_Telling_Stories.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L4.3_Telling_Stories.pptx');
const K = createDeck({ lesson: '4.3', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 4.3: Telling Stories' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do media products tell their stories?';
const WHERE = 'Hub › Year 10 › Lesson 4.3 › Telling Stories';

// Clips (Y10/media.md). Wicked's opening has no official upload (only the Shiz scenes and the trailer), so it isn't
// a clip; the Lion King ending has none either, so its clip is the opening and the slide tells the ending.
const LION_CLIP = '1AnmNPe50KNRzeT54HH8xNYVPGHCN26fM';   // "The Lion King - the opening.mp4" (47 s)
const MOON_CLIP = '19lwOrcek26U8sIX7CFelheqvcf_5jfsg';   // "Apollo 11 - one small step.mp4" (30 s), also on the page in Task 3

// Recap: four earlier lessons, one question each: 4.2 and 4.1 (recent), 2.2 and 1.3 (a while ago).
// Four options each, all real terms from that lesson, and no question names its answer or a word from its definition.
const RECALL = [
  { tag: 'Lesson 4.2', q: 'The Addams Family (2019): a family of ghouls in a spooky old house, played for laughs. Which term?', options: ['sub-genre', 'hybrid', 'subvert', 'repetition'], a: 'Hybrid: horror and comedy, two genres mixed' },
  { tag: 'Lesson 4.1', q: 'Every detective show has a crime, clues and a twist at the end. Which term?', options: ['genre', 'iconography', 'conventions', 'sector'], a: 'Conventions: what we expect from the genre' },
  { tag: 'Lesson 2.2', q: 'Match of the Day magazine is made for football-mad 7–14-year-olds. Their parents buy it. Who are the parents?', options: ['primary audience', 'secondary audience', 'lifestyle profile', 'socio-economic group'], a: 'Secondary audience: they buy it, but it isn\'t made for them' },
  { tag: 'Lesson 1.3', q: 'Netflix makes a new series so that more people pay to join Netflix. Which term?', options: ['purpose', 'motivation', 'independent', 'public service broadcaster'], a: 'Motivation: what Netflix wants (money)' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'One question from each of four earlier lessons: Q1 looks back at 4.2, Q2 at 4.1, Q3 at 2.2 and Q4 at 1.3, so two come from a while ago. Each has four options; no notes.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q1: ghouls and a spooky house from horror, jokes from comedy = two genres mixed. Q2: the things a genre usually has are its conventions; iconography is only what you can see (a magnifying glass, a trench coat). Q3: the magazine is made for the children (primary); the parents who pay are a secondary audience. Q4: money for Netflix is its motivation; the purpose is what the series does for viewers (entertain).' });

K.titleSlide({ coverLine: 'Telling Stories', issueLine: 'Lesson 4.3  ·  Y10 BTEC Creative Media',
  standfirst: 'Wicked opens with a party, because the Wicked Witch is dead. So why does the rest of the film show her as a schoolgirl?', puff: 'Lesson 4.3',
  img: img('wicked_2024.jpg'), imgLabel: 'Wicked (2024) poster · Universal Pictures',
  notes: 'Cover: Wicked. Don\'t answer the question yet: Task 1 is putting Wicked back in story order. Two parts today: how films and shows order their events (story, plot and the structures), then how news orders its facts (the inverted pyramid).' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Last lessons were genre; this one is narrative, also spec B1.' });

// ── Part 1: story, plot and the structures (Warm-up, Task 1, Task 2, ★ Tell it out of order) ──
// Concrete first (README 2026-11-17): students tell their own story out of order before the words.
K.info({ title: 'Start at the best bit', standfirst: 'You lost your phone yesterday. How do you tell your friends?',
  points: [['In order', 'I got on the bus, I went to town, I bought a drink… and then I found it in the fridge!'],
    ['Best bit first', '"I found my phone in the FRIDGE." Then: how did it get there?'],
    ['Same events', 'Nothing changes but the order you tell them in.'],
    ['Why?', 'The second way makes them want to know what happened.']],
  notes: 'One per click. Ask before point 2: how would you actually tell it? Most people jump to the fridge. Point 3 is the big idea: the events are the same, only the order changes. Films and shows do this too, and there are two words for the two orders.' });

const sStory = K.keyTerm({ term: 'Story', say: 'STOR-ee',
  definition: 'Every event, in order: even the ones we never see. From the very first thing that happens to the very last.',
  example: 'Encanto (2021): fifty years ago, Abuela flees her village and her candle becomes magic. Then the house, the family\'s gifts, and Mirabel, the one with no gift.',
  img: img('encanto_clip.jpg'), imgLabel: 'Encanto (2021) · Walt Disney Animation Studios',
  notes: 'Spec B1: story. Example on click. The story is the whole life of the events in time order, whatever the film shows first.' });
K.isys(sStory, { term: 'Story', fact: 'every event, in order', check: 'What do we call every event, in order?', reverse: 'What is the story?',
  say: 'The story is every event, in order, even the ones the film never shows.' });

const sPlot = K.keyTerm({ term: 'Plot', say: 'PLOT',
  definition: 'The order we\'re shown: the events as the product shows them. It can start anywhere in the story.',
  example: 'Encanto\'s plot opens with Abuela telling little Mirabel about the candle. Only then does it jump back fifty years to show it, then forward to Mirabel at fifteen.',
  img: img('encanto_clip.jpg'), imgLabel: 'Encanto (2021) · Walt Disney Animation Studios',
  notes: 'Spec B1: plot. Example on click. Same events as the story slide, a different order. Ask: what does Encanto show first? (Abuela and little Mirabel) What happens first in the story? (Abuela fleeing, fifty years before.) When the plot isn\'t in story order, the structure is non-linear: next slide.' });
K.isys(sPlot, { term: 'Plot', fact: 'the order we\'re shown', check: 'What do we call the order we\'re shown?', reverse: 'What is the plot?',
  say: 'The plot is the order we\'re shown: it can start anywhere in the story.' });

K.compare({ title: 'Linear or non-linear?',
  a: { name: 'Toy Story (1995)', img: img('toy_story_1995.jpg'), imgLabel: 'Toy Story (1995) poster · Pixar / Disney' },
  b: { name: 'Encanto (2021)', img: img('encanto_clip.jpg'), imgLabel: 'Encanto (2021) · Walt Disney Animation Studios' },
  rows: [['Structure', 'Linear', 'Non-linear'],
    ['The plot…', 'follows the story from start to finish', 'jumps back to fifty years before'],
    ['Story and plot', 'in the same order', 'in a different order']],
  notes: 'One row per click. Linear: the plot shows the events in story order (Woody meets Buzz, then their adventure, as it happens). Non-linear: the plot jumps about in time: a flashback, or starting at the end. Task 1 is a non-linear film.' });

K.compare({ title: 'One storyline, or several?',
  a: { name: 'Paddington in Peru (2024)', img: img('paddington_in_peru.jpg'), imgLabel: 'Paddington in Peru (2024) poster · StudioCanal' },
  b: { name: 'Stranger Things', img: img('stranger_things.jpg'), imgLabel: 'Stranger Things key art · Netflix' },
  rows: [['Structure', 'Single-strand', 'Multi-strand'],
    ['We follow…', 'Paddington and the Browns, looking for Aunt Lucy', 'the kids, the teenagers and the grown-ups, each on their own hunt'],
    ['The film or episode…', 'stays with that one storyline', 'cuts between them, until they meet']],
  notes: 'One row per click. Single-strand: one storyline. Multi-strand: several storylines, cut between. Soaps and school dramas are usually multi-strand; a short cartoon is usually single-strand.' });

K.compare({ title: 'How does it end?',
  a: { name: 'Across the Spider-Verse (2023)', img: img('spiderverse_2023.jpg'), imgLabel: 'Across the Spider-Verse (2023) poster · Sony Pictures Animation' },
  b: { name: 'Philosopher\'s Stone (2001)', img: img('harry_potter_philosophers_stone_2001.jpg'), imgLabel: 'Philosopher\'s Stone (2001) poster · Warner Bros.' },
  rows: [['Ending', 'Open ending', 'Closed ending'],
    ['At the end…', 'Miles is trapped in the wrong world. "To be continued."', 'Voldemort is beaten, the House Cup is won, Harry goes home'],
    ['The audience…', 'is left asking "what happens next?"', 'gets every question answered']],
  notes: 'One row per click. Open: questions left unanswered, often to make us come back for the next one. Closed: every problem sorted out. Ask: why would a producer choose an open ending? (a sequel; people keep talking about it)' });

K.compare({ title: 'Two more structures',
  a: { name: 'Shrek (2001)', img: img('shrek_2001.jpg'), imgLabel: 'Shrek (2001) key art · DreamWorks' },
  b: { name: 'Pokémon Red (1996)', img: img('pokemon_red_box.jpg'), imgLabel: 'Pokémon Red box art · Nintendo / Game Freak' },
  rows: [['Structure', 'Circular', 'Interactive'],
    ['How it works', 'Opens on a fairy-tale book, and closes on the same book', 'You pick your first Pokémon; your rival picks the one that beats it'],
    ['So…', 'it ends where it began', 'your choices change what happens']],
  notes: 'One row per click. Circular: the ending comes back to the beginning (the same place, the same picture, the same words). Interactive: the audience makes choices that change the story; games, and some streaming shows. Interactive is also one of the three sectors from 1.1: an interactive product, the user makes choices.' });

K.choice({ question: 'A film opens with the hero in hospital. Then it jumps back to show the morning of the accident. Which structure is it?',
  options: ['Linear', 'Circular', 'Non-linear', 'Interactive'], answer: 'C',
  notes: 'Answer C: the plot starts near the end of the story, then jumps back. A is the slip: the rest of the film may run in order, but starting at the end makes it non-linear. B would need the ending to come back to the beginning.' });

K.info({ title: 'Who\'s who in Wicked', standfirst: 'Wicked (2024) is set in the Land of Oz, long before The Wizard of Oz.',
  points: [['Elphaba', 'Born with green skin. She grows up to be the Wicked Witch of the West.'],
    ['Galinda', 'The most popular girl at Shiz University. Later she calls herself Glinda.'],
    ['The Wizard', 'Rules Oz from the Emerald City. Everyone believes he is magic.']],
  img: img('wicked_2024.jpg'), imgLabel: 'Wicked (2024) poster · Universal Pictures',
  notes: 'One per click: enough to follow Task 1 without having seen the film. Don\'t give the order of events: that is the task. Each card on the page has a time clue ("on her first day", "for weeks", "at last", "now", "once"); tell them to look for those.' });

K.task({ title: 'Story order', mins: 15, where: WHERE,
  steps: ['The page opens on the Warm-up: linear, non-linear or circular? The meanings are open.',
    'Task 1 · Story order: put Wicked\'s seven scenes in story order. Drag, or use ▲ ▼.',
    'Task 2 · Name the structure: seven real products, one structure each.',
    'Finished? ★ Tell it out of order. Tasks 3 and 4 open later.'],
  criteria: ['Story = every event, in order', 'Plot = the order we\'re shown', 'Look for the time words on each card'],
  notes: 'Warm-up is optional. Task 1: a wrong check makes them wait; if most cards are wrong the page only says how many are right. Task 2 has a picture and the facts for each product, so nobody needs to have seen them. ★ Tell it out of order: plan a non-linear plot for a linear film. Tasks 3 and 4 are locked until the Part 2 word.' });

K.info({ title: 'Wicked: the story, in order', standfirst: 'The film opens with the last event. In story order:',
  points: [['Born', 'Elphaba is born green, and her father turns away from her.'],
    ['Shiz University', 'She has to share a room with Galinda. They hate each other, then become best friends.'],
    ['The Emerald City', 'The Wizard has no magic. Elphaba flies away. The film ends here.'],
    ['Later', 'Oz has a party: the Wicked Witch is dead. The film opens here.']],
  img: img('wicked_2024.jpg'), imgLabel: 'Wicked (2024) poster · Universal Pictures',
  notes: 'One per click, as the answer to Task 1. Ask first: what does the film show first? (the party) Where does that come in the story? (at the very end) The plot opens at the end of the story: that is why the film is non-linear. Point 4 is the one most students put first, because the film shows it first: that is the difference between story and plot.' });

K.clip({ title: 'Feedback: The Lion King', from: '0:00', to: 'end', where: 'Click to play', video: LION_CLIP,
  img: img('lion_king_1994.jpg'), imgLabel: 'The Lion King (1994) · Walt Disney Pictures',
  questions: ['What happens in this first scene?', 'In the last scene, Simba\'s own cub is held up in the same place. Which structure is that?'],
  notes: 'Drive clip "The Lion King - the opening.mp4" (47 s, Y10/media.md): Rafiki holds baby Simba up at Pride Rock and the animals bow. Then tell them the ending: years later, Simba\'s own cub is held up in the same place, in the same way. After Task 2 (it is question 2 there): the ending comes back to the beginning, so it is circular. Go through any other Task 2 question the class got wrong.' });

// ── Part 2: the inverted pyramid (Task 3, Task 4, ★ Pigs in the news) ──
// Concrete first: a story everyone knows, as a story and then as news (Cinderella, not the pigs: they are the ★).
K.info({ title: 'Story or news?', standfirst: 'Cinderella, told two ways.',
  points: [['As a story', 'Once upon a time, a girl lived with her cruel stepsisters… a ball… midnight… a glass slipper…'],
    ['As news', 'PRINCE FINDS MYSTERY GIRL: the slipper fits.'],
    ['Then', 'How he found her: he tried the slipper on every girl in the land.'],
    ['Last', 'Who she is: her family, the stepsisters, the fairy godmother.']],
  notes: 'One per click. A story starts at the beginning. News starts with what happened, because a reader might stop after one line. The background, which was the START of the story, goes at the bottom. That shape has a name.' });

const sPyr = K.keyTerm({ term: 'Inverted pyramid', say: 'in-VUR-tid PIR-uh-mid',
  definition: 'Most important first. The top says what happened, who, where and when; details come next; background goes at the bottom.',
  example: 'Every Newsround story starts with what happened, in one sentence. The details come next, and the background, the part you could skip, comes last.',
  img: img('newsround.jpg'), imgLabel: 'Newsround · BBC',
  notes: 'Spec B1: the inverted pyramid. Example on click. Inverted = upside down: the wide part, the most important, is at the top. Readers can stop at any point and still have the news.' });
K.isys(sPyr, { term: 'Inverted pyramid', fact: 'most important first', check: 'What do we call a news story with the most important first?', reverse: 'How is an inverted pyramid ordered?',
  say: 'An inverted pyramid puts the most important first, so the reader gets the news straight away.' });

K.choice({ question: 'A news story about a new Minecraft update. Which goes at the top?',
  options: ['A new mob is in Minecraft from today', 'Minecraft first came out in 2011', 'The new mob lives deep in caves', 'An earlier update added the armadillo'], answer: 'A',
  notes: 'Answer A: what happened, and when. C is a detail (it goes next). B and D are background: true, but a reader could do without them, so they go at the bottom.' });

K.clip({ title: '21 July 1969', from: '0:00', to: 'end', where: 'Click to play · also on the page in Task 3', video: MOON_CLIP,
  img: img('aldrin_apollo_11.jpg'), imgLabel: 'Buzz Aldrin on the Moon, photographed by Neil Armstrong · NASA',
  questions: ['What happened, who, where and when?', 'What would the first line of the next day\'s news say?'],
  notes: 'Drive clip "Apollo 11 - one small step.mp4" (30 s, NASA, public domain): Armstrong says he is stepping off the lunar module, steps down, and says "one small step for man, one giant leap for mankind". It is the real live TV picture, grey and blurry, so say what they are looking at. Before Task 3: the class has just seen the news, so they can find the top of the story. Don\'t order the page\'s paragraphs as a class.' });

K.task({ title: 'Build the pyramid', mins: 20, unlock: 'headline', where: WHERE,
  steps: ['Task 3 · Build the pyramid: put the 1969 Moon-landing story back in order.',
    'Task 4 · Use the words: story and plot, a structure, the inverted pyramid.',
    'Finished? ★ Pigs in the news: The Three Little Pigs as a news report.'],
  criteria: ['The top: what happened, who, where and when', 'Details next; background last', 'Task 4 uses the words in each box'],
  notes: 'Unlock word HEADLINE opens Task 3, Task 4 and ★ Pigs in the news. Teacher mode or "outwood" opens every part. Task 3: any order of the two details, and of the three background paragraphs, is right. Task 4 is evidence for Classroom: each box must use its word (story and plot; a structure word; inverted pyramid).' });

K.plenary({ lesson: LESSON, task: 'Name one product whose plot is not in story order, and say which structure it uses.',
  starter: '"In ___, the story starts with ___, but the plot starts with ___, so it is ___."',
  notes: 'Exit ticket. Listen for story and plot used correctly, and a structure word with a reason. Push: why would a producer start at the end? (a hook: we want to know how it happened)' });

K.write(OUT);
