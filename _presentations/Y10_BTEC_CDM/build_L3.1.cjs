// Y10 BTEC Component 1 — Lesson 3.1 Where, When, Who With (spec A1: the situation in which a product is used;
// audience involvement: passive and active, interactive features, online voting, consumer-generated content).
// Hub page: Y10/Component_1/L3.1_Where_When_Who_With/.
// The deck follows the page's two parts: situation (Warm-up, Tasks 1–2, ★ Then and now) and involvement
// (Tasks 3–5, ★ Spot the slip; unlock word INVOLVED).
// The page's own examples (Mario Kart World, The Traitors, the Sidemen, Spotify, Wallace & Gromit, Strictly,
// Eurovision, Duolingo, Super Mario Maker 2) are not worked through here, so the deck never gives away a task's
// answer; the worked models are Radio 1 Breakfast, Countdown, Roblox and BBC Bitesize.
//
//   node build_L3.1.cjs   → L3.1_Where_When_Who_With.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L3.1_Where_When_Who_With.pptx');
const K = createDeck({ lesson: '3.1', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 3.1: Where, When, Who With' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do where, when and who with change how we use media, and how involved we get?';
const WHERE = 'Hub › Year 10 › Lesson 3.1 › Where, When, Who With';

// Recap: 2.3 (audience statistics), 2.2 (lifestyle profile), 1.3 (producer type), 1.1 (historical): two from week 1.
// Four options each; no question names its answer or lifts a phrase from its definition (Nick, 2026-11-17).
const RECALL = [
  { tag: 'Lesson 2.3', q: 'Nintendo wants to prove Mario Kart World is a hit. Which audience statistic should it use?', options: ['box office', 'circulation', 'sales', 'hits'], a: 'Sales: copies bought' },
  { tag: 'Lesson 2.2', q: '"Watches every Arsenal Women match on BBC iPlayer." Which part of a lifestyle profile?', options: ['interests', 'attitudes', 'values', 'behaviour'], a: 'Behaviour: what they actually do' },
  { tag: 'Lesson 1.3', q: 'Toby Fox made Undertale almost on his own. Which kind of producer?', options: ['public service broadcaster', 'conglomerate', 'independent', 'community media'], a: 'Independent producer' },
  { tag: 'Lesson 1.1', q: 'Which of these is a historical product?', options: ['Titanic (1997)', 'Finding Nemo (2003)', 'Shrek 2 (2004)', 'Frozen (2013)'], a: 'Titanic (1997): made before 2000' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'One question from each of four earlier lessons: Q1 2.3, Q2 2.2, Q3 1.3, Q4 1.1 (two from week 1). Four options each; no notes.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q1: box office is cinema tickets, circulation is papers and magazines, hits are website visits; a game counts sales. Then ask aloud: where do you watch YouTube most? Bedroom, bus, living room? The place, the time and who you are with make up a product\'s situation, the first idea today.' });

K.titleSlide({ coverLine: 'Where, When, Who With', issueLine: 'Lesson 3.1  ·  Y10 BTEC Creative Media',
  standfirst: 'The same product feels different on the bus, at Wembley or on Christmas Day.', puff: 'Lesson 3.1',
  img: img('sidemen_charity_wembley.jpg'), imgLabel: 'Sidemen Charity Match at Wembley',
  notes: 'Cover: the Sidemen Charity Match. About 90,000 people watched it in the stadium and millions more on YouTube: the same match in very different situations. Today: situation (where, when, who with), then how involved the audience gets.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Two halves: SITUATION (where, when, who with), then INVOLVEMENT (passive or active).' });

// ── Part 1: situation (Warm-up, Tasks 1–2, ★ Then and now) ──
const sIsys0 = K.keyTerm({ term: 'Situation', definition: 'Where, when, who with: the setting someone uses a media product in. It changes how they use it and how it feels.',
  example: 'Radio 1 Weekend Breakfast: live in the car with your family on Saturday morning, or on BBC Sounds on your own on Monday.',
  img: img('radio1_breakfast.jpg'), imgLabel: 'Radio 1 Weekend Breakfast',
  notes: 'Spec A1: the situation in which a product is used. Example on click. Ask: which is the same in both? (the show) Which is different? (where, when, who with). In the car, everyone hears it; on Sounds, you can skip the bits you don\'t like.' });
K.isys(sIsys0, { term: "Situation", fact: "where, when, who with", say: "Situation is where, when, who with: the setting someone uses a product in." });

K.info({ title: 'Three questions about any situation', standfirst: 'Ask all three about every product you use.',
  points: [['Where?', 'At home, on the move, in a stadium or a cinema.'],
    ['When?', 'Live as it\'s shown, later on catch-up, or on a special day.'],
    ['Who with?', 'On your own, with family or friends, or with thousands of other fans.']],
  notes: 'One per click. These are the three boxes of the Warm-up, and the help panel in Task 1 has the same three questions. "When" includes the day: a film on Christmas Day, a final on a Saturday night.' });

K.choice({ question: 'You hear Radio 1 Weekend Breakfast live on Saturday, then the same show on BBC Sounds on Monday. What has changed?',
  options: ['When you listen', 'Who made the show', 'What the show is about'],
  notes: 'Answer A: when. The show and its producer (the BBC) are the same. Follow-up: and if you listened on Monday with your mates? (who with changes too).' });

K.turnTalk({ lead: 'The same film: at the cinema with friends, or on your phone on the bus.',
  prompt: 'How does the situation change how you watch it?',
  notes: `Listen for: the big screen and sound; no pausing; sharing the laughs and jumps; talking about it afterwards. On the bus: small screen, headphones, stopping at your stop, half watching.
This is the thinking in Task 1 (real products in two situations) and in the diary in Task 2.` });

K.task({ title: 'Log your situations', mins: 20, where: WHERE,
  steps: ['The page opens on the Warm-up: is each card about where, when or who with?',
    'Task 1 · Same product, new situation: seven questions on five real products.',
    'Task 2 · My media diary: three products you used yesterday, each with its situation.',
    'Finished? Try ★ Then and now. Tasks 3–5 open later.'],
  criteria: ['Where, when, who with for every entry', 'A different product for each entry', 'What else you were doing at the time'],
  notes: 'Warm-up is optional: the three meanings are open on the page. The diary is completion-marked, but each situation needs a real sentence (10+ words). Keep the diaries: students read them to a partner in Task 5.\n★ Then and now: the Sony Walkman (1979) and Game Boy (1989) changed where people could use music and games, compared with Spotify and a Switch 2 today. Tasks 3–5 are locked (Part 2) until the unlock word.' });

// ── Part 2: involvement (Tasks 3–5, ★ Spot the slip) ──
K.keyTerm({ term: 'Audience involvement', definition: 'How much the audience takes part in a product. A passive audience takes it in; an active one takes part.',
  example: 'Countdown on in the background while you eat (passive), or playing along with the letters and numbers at home (active).',
  img: img('countdown_board.jpg'), imgLabel: 'Countdown',
  notes: 'Spec A1: audience involvement, passive and active. Example on click. Passive isn\'t "bad": sometimes you want something on in the background. Active means doing something back: choosing, talking, voting, making.' });

const sIsys1 = K.info({ title: 'Passive or active?', standfirst: 'Ask: is the audience doing anything back?',
  points: [['Passive audience', 'Takes it in without doing anything back: on in the background, or just sitting and watching.'],
    ['Active audience', 'Takes part: chooses, talks about it, votes, chats, or makes something with it.']],
  notes: 'One per click. It\'s a line, not two boxes: most people are somewhere in between. The situation matters too: alone and half asleep is more passive than shouting answers with your grandad. Task 4 puts real products on this line.' });
K.isys(sIsys1, { term: "Passive audience", fact: "takes it in", say: "A passive audience takes it in without doing anything back." });
K.isys(sIsys1, { term: "Active audience", fact: "takes part", say: "An active audience takes part." });

K.info({ title: 'Three ways to get involved', standfirst: 'Products give their audience ways to take part.',
  points: [['Interactive features', 'Parts you click, tap or choose that respond to you: liking a YouTube video brings you more like it.'],
    ['Online voting', 'The audience votes on a website or app, and the votes change what happens: the BBC Sports Personality of the Year vote.'],
    ['Consumer-generated content', 'Content the audience makes and shares through the product: most Roblox games are made by players.']],
  img: img('roblox.jpg'), imgLabel: 'Roblox',
  notes: 'Spec: interactive features, online voting, consumer-generated content (CGC). One per click. "Consumer" = the audience; "generated" = made. These are Task 3\'s three boxes.' });

K.choice({ question: 'A BBC Bitesize quiz shows your score after every question. Which kind of involvement is it?',
  options: ['Interactive features', 'Online voting', 'Consumer-generated content'],
  notes: 'Answer A: it responds to what you click. Not voting (your answers don\'t change the programme), not CGC (you didn\'t make the quiz).' });

K.turnTalk({ lead: 'The same Countdown episode: alone, half asleep after tea, or playing along with your grandad.',
  prompt: 'Which audience is more active? How did the situation make the difference?',
  notes: `Playing along: talking, racing to find the longest word, keeping score. Alone and half asleep: on, but not really watched.
Same product, different situation, different involvement: exactly what Task 5 asks when they compare diaries.` });

K.modelAnswer({ title: 'Situation and involvement in one answer', question: 'Write about one product from your diary.',
  key: ['Situation', 'Involvement', 'Difference'],
  parts: [['Situation', 'I listened to Radio 1 Weekend Breakfast on BBC Sounds on the bus, on my own, on Monday. This situation meant I only half listened.'],
    ['Involvement', 'I was a mostly passive audience, but I skipped the bits I didn\'t like, which is an interactive feature.'],
    ['Difference', 'My partner played a Roblox game with friends that one of them built, whereas I mostly just listened on my own.']],
  notes: 'The shape of Task 5: a situation sentence with the word "situation", an involvement sentence with "passive" or "active" and a kind of involvement, then the biggest difference using "whereas". Point to each colour as you read it.' });

K.task({ title: 'How involved were you?', mins: 30, unlock: 'involved', where: WHERE,
  steps: ['Task 3 · Which kind of involvement? Sort nine cards into three boxes.',
    'Task 4 · Passive or active? Put real products on the line, then explain the two ends.',
    'Task 5 · Compare diaries: read yours to a partner, then compare one product from each.',
    'Finished? ★ Spot the slip: find Sam\'s three mistakes.'],
  criteria: ['The right kind of involvement for each card', 'Passive or active, with a reason', '"Situation", "passive" or "active" in every answer'],
  notes: 'Unlock word INVOLVED opens Tasks 3–5 and ★ Spot the slip. Teacher mode or "outwood" opens every part. Task 4: clear cases go near an end; some cards accept two zones. Task 5 needs the Task 2 diary: pair students before they start. A wrong check makes students wait.' });

K.plenary({ lesson: LESSON, task: 'Pick one product you used this week. Describe its situation, and say whether you were a passive or an active audience.',
  starter: '"I used ___ at ___ with ___. I was a ___ audience because…"',
  notes: 'Exit ticket. Listen for all three parts of the situation and a reason for passive or active (doing something back, or not).' });

K.write(OUT);
