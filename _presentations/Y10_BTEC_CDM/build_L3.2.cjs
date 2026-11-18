// Y10 BTEC Component 1 — Lesson 3.2 Why We Watch (spec A1: audience uses and gratifications: information,
// entertainment, escapism, personal identity, social interaction).
// Hub page: Y10/Component_1/L3.2_Why_We_Watch/.
// The deck follows the page's three parts: the five needs (Warm-up, Tasks 1–2, ★ Spot the slip); one product,
// many needs (Task 3, ★ One product, two needs; unlock word GRATIFY); and the Photoshop task, two thumbnails
// promising two needs (Task 4, ★ A third promise; unlock word THUMBNAIL).
// The page's own examples (Newsround, Planet Earth III, Paddington in Peru, the Eras Tour film, Animal Crossing,
// Wordle, the Sidemen, The Traitors, Taskmaster, Wicked, Among Us) are not worked through here, so the deck never
// gives away a task's answer; Part 1 starts from five people's
// reasons for opening YouTube, then the worked model is Mario Kart World (one game, five needs); Stardew Valley
// and Strictly in Part 2. The Photoshop before-and-after is made by make_thumb_example.py.
//
//   node build_L3.2.cjs   → L3.2_Why_We_Watch.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L3.2_Why_We_Watch.pptx');
const K = createDeck({ lesson: '3.2', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 3.2: Why We Watch' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'Why do we choose the media we use, and how can one product meet different needs?';
const WHERE = 'Hub › Year 10 › Lesson 3.2 › Why We Watch';

// Recap: four earlier lessons, one question each: 3.1 and 2.3 (recent), 1.3 and 1.2 (a while ago).
// Four options each, and no question names its answer or a word from that answer's definition (Nick, 2026-11-17).
const RECALL = [
  { tag: 'Lesson 3.1', q: 'Duolingo shows your streak and reminds you before it breaks. Which kind of audience involvement?', options: ['passive', 'interactive features', 'online voting', 'consumer-generated content'], a: 'Interactive features: the app responds to you' },
  { tag: 'Lesson 2.3', q: 'BBC News wants to show how many people read its website. Which audience statistic?', options: ['circulation', 'followers', 'hits', 'sales'], a: 'Hits: visits to a website or page' },
  { tag: 'Lesson 1.3', q: 'Disney owns Pixar, Marvel and Star Wars. Which kind of producer is Disney?', options: ['public service broadcaster', 'independent', 'community media', 'media conglomerate'], a: 'Media conglomerate: one giant company, many businesses' },
  { tag: 'Lesson 1.2', q: '"A woman swims; a huge shark rises below her." Which is this sentence about the Jaws poster?', options: ['denotation', 'connotation', 'anchorage', 'polysemy'], a: 'Denotation: it only says what you can see' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'One question from each of four earlier lessons: Q1 looks back at 3.1, Q2 at 2.3, Q3 at 1.3 and Q4 at 1.2, so two come from a while ago. Each has four options; no notes.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q1: liking or streaks = the product responds to you (interactive features); voting changes what happens; consumer-generated content is made by the audience. Q2: circulation counts copies of papers and magazines; hits count website visits. Q3: Disney owns lots of media businesses. Q4: no "suggests" or "feels", just what is on the poster, so it is denotation. The connotation would be "danger is coming".' });

K.titleSlide({ coverLine: 'Why We Watch', issueLine: 'Lesson 3.2  ·  Y10 BTEC Creative Media',
  standfirst: 'Nobody makes you watch, play or listen. So why do you?', puff: 'Lesson 3.2',
  img: img('planet_earth_iii_thumb.jpg'), imgLabel: 'Planet Earth III trailer thumbnail · BBC Earth',
  notes: 'Cover: the Planet Earth III trailer thumbnail. Students will remake this picture in Photoshop at the end of the lesson, twice, so it promises two different reasons to click. Three parts today: the five needs, one product with many needs, then the Photoshop task.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Three parts: the five needs, one product with many needs, then making two thumbnails that promise different needs.' });

// ── Part 1: the five needs (Warm-up, Tasks 1–2, ★ Spot the slip) ──
// Concrete first (Y10/CLAUDE.md: abstract terms need a worked model): five real reasons, then the five needs,
// then the theory's name, then one game meeting all five needs for five players (Nick, 2026-11-17).
K.info({ title: 'Why did they open YouTube?', standfirst: 'Five people, five reasons. Which ones are alike, and which are different?',
  points: [['Amir', '"To learn how to do a skin fade."'],
    ['Jess', '"It\'s funny. I just want a laugh."'],
    ['Kai', '"To forget about my maths test for a bit."'],
    ['Priya', '"I watch gaming creators who are like me."'],
    ['Leo', '"So I can talk about it with my mates at school."']],
  notes: 'One per click. Before any labels: ask the class what each person GETS from YouTube. Then ask: the last time YOU opened YouTube, why? Their reasons will be like these. Everyone chose YouTube; nobody made them. The reasons are what differ.' });

K.info({ title: 'Five needs', standfirst: 'Each reason is a need that the product meets.',
  points: [['Information', 'Finding something out: Amir and his skin fade.'],
    ['Entertainment', 'Fun, a laugh, a good time: Jess.'],
    ['Escapism', 'Getting away from real life and its worries for a while: Kai.'],
    ['Personal identity', 'Showing or finding who you are, people like you: Priya.'],
    ['Social interaction', 'Something to share, play or talk about with others: Leo.']],
  notes: 'One per click: name each need, then point back to the person. Entertainment and escapism feel close: entertainment is about the fun; escapism is about getting AWAY from something (stress, boredom, a test). These five are the Warm-up\'s five boxes, and the definitions stay open on the page.' });

const sIsys0 = K.keyTerm({ term: 'Uses and gratifications', say: 'gra-ti-fi-KAY-shuns',
  definition: 'The theory behind the five needs: the audience is active. People choose media to meet their own needs. The need it meets is their gratification: their reward.',
  example: 'Stardew Valley: one player farms to relax after school, another to share a farm with friends online. Same game, different rewards.',
  img: img('stardew_valley.png'), imgLabel: 'Stardew Valley · ConcernedApe',
  notes: 'Spec A1: audience uses and gratifications. Now the label goes on what they have just seen. "Uses" = what people use media for; "gratifications" = what they get out of it. Example on click: like Amir, Jess, Kai, Priya and Leo, nobody makes a Stardew Valley player open it; each chooses it for their own reward. Ben comes back in the Part 2 hinge question.' });
K.isys(sIsys0, { term: "Uses and gratifications", fact: "the audience is active", say: "Uses and gratifications says the audience is active: people choose media to meet their needs." });
K.isys(sIsys0, { term: "Gratification", fact: "their reward", say: "The need a product meets is their gratification: their reward." });

K.info({ title: 'One game, five needs', standfirst: 'Five players, one Mario Kart World. The need belongs to the player, not the game.',
  points: [['Information', 'Mo checks the kart stats to find the fastest set-up.'],
    ['Entertainment', 'Ella laughs when a blue shell wrecks the last lap.'],
    ['Escapism', 'Sam races Rainbow Road to forget a bad day.'],
    ['Personal identity', 'Zak always picks Bowser: "I\'m a Bowser main."'],
    ['Social interaction', 'Four mates on one sofa, shouting at each other.']],
  img: img('mario_kart_world.png'), imgLabel: 'Mario Kart World · Nintendo',
  notes: 'The worked model: one product, all five needs. One per click; before each reveal, read the person\'s line and ask which need it is. The point to land: you can\'t tell the need from the product, only from the person\'s reason. That is how Task 1 works: wait for the clue that tells you WHY.' });

K.choice({ question: 'Aisha streams KPop Demon Hunters songs on repeat and dresses as Rumi on non-uniform day, so everyone knows she\'s a fan. Which need?',
  options: ['Personal identity', 'Entertainment', 'Information'],
  notes: 'Answer A: dressing up so people know she\'s a fan shows who she is. She may also enjoy the songs (entertainment), but the clue that decides it is "so everyone knows". ' });

K.turnTalk({ lead: 'Think of one thing you watched, played or listened to yesterday.',
  prompt: 'Which of the five needs did it meet for you? How do you know?',
  notes: `Take three or four answers and push for the reason: "I watched it because…". Expect lots of entertainment; ask whether any were escapism (to get away from something) or social interaction (to talk about it or play with someone).
This is Task 2: they classify two products from their Lesson 3.1 media diary.` });

K.task({ title: 'Why are they watching?', mins: 15, where: WHERE,
  steps: ['The page opens on the Warm-up: which need does each card meet? The five meanings are open.',
    'Task 1 · Why are they watching? Four people, clue by clue. Guess early for more stars.',
    'Task 2 · Classify my diary: two products from your 3.1 diary, and the need each one met.',
    'Finished? ★ Spot the slip: Kai\'s three mistakes. Tasks 3 and 4 open later.'],
  criteria: ['The need comes from the person\'s reason, not the product', 'A need word in every diary answer', 'A reason with "because"'],
  notes: 'Warm-up is optional. Task 1: a wrong guess shows the next clue and makes them wait 10 s, so guessing early is a real risk. Task 2 links to the 3.1 diary (it opens in a new tab); anyone without a diary uses two products from yesterday. Tasks 3 and 4 are locked until the Part 2 and Part 3 words.' });

// ── Part 2: one product, many needs (Task 3, ★ One product, two needs) ──
K.info({ title: 'Same product, different needs', standfirst: 'Different people, and different situations, change the need.',
  points: [['Different people', 'Strictly: Gran watches for the dancing and the sparkle (entertainment); a dancer watches to learn the steps (information).'],
    ['Different situations', 'Watching Strictly alone is entertainment; watching with the family, arguing about the scores, is social interaction.'],
    ['Producers plan for it', 'The BBC adds the Strictly app vote and It Takes Two, so the show meets even more needs.']],
  img: img('strictly_title.jpg'), imgLabel: 'Strictly Come Dancing · BBC',
  notes: 'One per click. Point 2 links back to 3.1: where, when and who with can change the need. Point 3 links to producers (1.3): more needs met = a bigger audience. Task 3 asks about eight people like these.' });

K.choice({ question: 'Ben usually plays Stardew Valley alone to relax. Tonight he plays online with two friends, building one farm together. Which need tonight?',
  options: ['Social interaction', 'Escapism', 'Information'],
  notes: 'Answer A. Usually it is escapism (alone, to relax); tonight the situation (who with) changes it. Some Task 3 questions name two people or two situations: read which one the question asks about.' });

K.turnTalk({ lead: 'Pick a product you love.',
  prompt: 'Could it meet a different need for someone else? Who, and which need?',
  notes: `Listen for a named person and a named need: "For my little brother, Minecraft is social interaction because he plays with his friends, but for me it's escapism."
Early finishers write this up in ★ One product, two needs.` });

K.task({ title: 'Same product, different needs', mins: 10, unlock: 'gratify', where: WHERE,
  steps: ['Task 3 · Same product, different needs: eight questions about real people.',
    'Read who each question is about: some name two people.',
    'Finished? ★ One product, two needs: write about one of your diary products.'],
  criteria: ['The need for THAT person, in THAT situation', 'All eight right first time for gold'],
  notes: 'Unlock word GRATIFY opens Task 3 and ★ One product, two needs. Teacher mode or "outwood" opens every part. Every question offers all five needs, in a different order for each student. A wrong check makes them wait 10 s.' });

// ── Part 3: two thumbnails, two needs (Task 4, ★ A third promise) ──
K.info({ title: 'A thumbnail makes a promise', standfirst: 'The small picture that sells a video before you click. Producers design it to promise a need.',
  points: [['Colour', 'Adjustment layers change colour and light without spoiling the photo: Layer › New Adjustment Layer.'],
    ['A cut-out', 'Part of another picture on its own: select it with the Object Selection Tool (W), then add a layer mask, which hides the rest.'],
    ['A title', 'Two to four big words with the Type Tool (T), outlined with Layer › Layer Style › Stroke.']],
  img: img('paddington_in_peru_thumb.jpg'), imgLabel: 'Starting picture, option 2 · StudioCanal',
  notes: `One per click. Demo each in Photoshop on one of the two starting pictures (Planet Earth III or Paddington in Peru) as you go (2–3 minutes each):
1. Layer › New Adjustment Layer › Vibrance, then Gradient Map: watch the mood change. A layer mask on an adjustment layer is white: the change shows everywhere.
2. File › Place Embedded… a Photo Bank picture; Object Selection Tool around the subject; Layer › Layer Mask › Reveal Selection; Ctrl + T to resize. Black on a mask hides, white shows.
3. Type Tool, click, type; Character panel for font and size; Layer Style › Stroke for the outline.` });

K.compare({ title: 'Before and after',
  a: { name: 'Before', img: img('thumb_example_before.jpg'), imgLabel: 'The Traitors still · BBC' },
  b: { name: 'After', img: img('thumb_example_after.jpg'), imgLabel: 'The same still, edited' },
  rows: [['Colour', 'Warm wood, natural light', 'Darker, purple shadows, more contrast'],
    ['Cut-out', 'None', 'A suspicious face from the Photo Bank'],
    ['Title', 'None', '"WHO\'S THE TRAITOR?" asks you to guess'],
    ['Promises', 'Nothing yet', 'Social interaction: guess along together']],
  notes: 'One row per click. Made for this lesson on a different picture from theirs. Every choice serves the one need: the question in the title invites you to guess, the cut-out face is someone suspecting, "Guess together" says who with. Ask: what would you change to make it promise escapism instead? (soft, dreamy colours; a calm title; no reacting face).' });

K.info({ title: 'Tag lines: Planet Earth III', standfirst: 'Don’t spend long on the words: pick one, then get into Photoshop.', reveal: false,
  points: [['Information', 'How Do Rays Fly?  ·  Ocean Secrets Revealed  ·  Wild Facts Inside'],
    ['Entertainment', 'Nature’s Wildest Jumps!  ·  WAIT FOR IT…  ·  You Won’t Believe This!'],
    ['Escapism', 'Escape to the Wild  ·  Lose Yourself at Sea  ·  Breathe. Drift. Dream.'],
    ['Personal identity', 'For True Nature Fans  ·  Made for Ocean Lovers  ·  Wild at Heart'],
    ['Social interaction', 'Watch It Together  ·  Tag Your Ocean Buddy  ·  Who’s Watching Tonight?']],
  notes: 'Option 1 of the two starting pictures. The same tag lines are on the page in Task 4.' });

K.info({ title: 'Tag lines: Paddington in Peru', standfirst: 'Don’t spend long on the words: pick one, then get into Photoshop.', reveal: false,
  points: [['Information', 'Meet the Cast  ·  How Paddington Was Made  ·  Behind the Scenes in Peru'],
    ['Entertainment', 'Marmalade Mayhem!  ·  Chaos in the Jungle!  ·  The Funniest Bear Is Back!'],
    ['Escapism', 'Escape to Peru  ·  Into the Jungle  ·  Adventure Awaits'],
    ['Personal identity', 'For Real Paddington Fans  ·  Be More Paddington  ·  Kind Is Cool'],
    ['Social interaction', 'A Family Day Out  ·  Bring the Whole Family  ·  Who’s Coming With You?']],
  notes: 'Option 2. The same tag lines are on the page in Task 4. The point of the task is the Photoshop skills and matching the look to the need, not copywriting: students pick a line in seconds. Anyone who wants to write their own can, in two to four words.' });

K.task({ title: 'Two thumbnails, two needs', mins: 25, unlock: 'thumbnail', where: WHERE,
  steps: ['Open Planet Earth III or Paddington in Peru from the Drive folder\'s Images. Pick a need.',
    'Add two or more adjustment layers, a cut-out from Photo Bank › Cut-outs, and a tag line.',
    'Export thumbnail 1 as a JPG; screenshot the Layers panel. Remake it for a new need: thumbnail 2.',
    'Upload both, then answer Task 4. Finished? ★ A third promise.'],
  criteria: ['Two thumbnails, two different needs', 'Adjustment layers, a cut-out and a title in each', 'Each answer names the need and the tools'],
  notes: 'Unlock word THUMBNAIL opens Task 4 and ★ A third promise. The full steps, with menu paths, are on the page, plus a "Which look promises which need?" help panel. Photopea (free, in the browser) works at home with nearly the same menus. Students upload two JPGs and two Layers-panel screenshots to Classroom.' });

K.plenary({ lesson: LESSON, task: 'Hold up one of your thumbnails (or describe it). Which need does it promise, and who would it make click?',
  starter: '"My thumbnail promises ___ to people who ___, because I used ___."',
  notes: 'Exit ticket. Listen for a need word, a type of viewer, and one technique (colour, cut-out or title) linked to the need.' });

K.write(OUT);
