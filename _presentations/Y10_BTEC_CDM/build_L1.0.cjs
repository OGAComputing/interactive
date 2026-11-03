// Y10 BTEC Component 1 — Lesson 1.0 Course Introduction: the single-first class's first lesson only.
// Hub page: Y10/Component_1/L1.0_Course_Introduction/ (a baseline, completion-scored).
// No live-PSA details: no theme, client, audience or dates from the live brief.
//
//   node build_L1.0.cjs   → L1.0_Course_Introduction.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1.0_Course_Introduction.pptx');
const K = createDeck({ lesson: '1.0', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 1.0: Course Introduction' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'What is this course, and how is Component 1 assessed?';

// Different recall questions from 1.1's, as this class sees 1.1 straight after.
const RECALL = [
  { tag: 'C3 mock', q: "The client's instructions for your FIZZIKAL cover are called the…", options: ['brief', 'masthead', 'mood board'], a: 'Brief: what to make, and who it is for' },
  { tag: 'C3 mock', q: 'Which design principle makes the most important thing on a page the biggest?', options: ['hierarchy', 'alignment', 'white space'], a: 'Hierarchy' },
  { tag: 'C3 mock', q: "One thing to improve on your FIZZIKAL cover? E.g. 'clearer cover lines'.", a: 'Any real improvement, with a reason' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Bridge from the Component 3 mock (the FIZZIKAL magazine cover). Choices or an example in each question.' });
K.recallAnswers({ questions: RECALL, notes: 'Tick or fix. Q3: take two or three answers aloud.' });

K.titleSlide({ coverLine: 'Welcome to Creative Media', issueLine: 'Lesson 1.0  ·  Y10 BTEC Creative Media', standfirst: 'Films, games, magazines, apps: this course is about how they are made, and who for.',
  puff: 'Start here', img: img('spiderverse_2023.jpg'), imgLabel: 'Spider-Verse poster (2023)',
  notes: 'This class only: the double-first class starts at Lesson 1.1. Next lesson for this class is 1.1 Media Everywhere.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'The topic question runs through all of Component 1.' });

K.keyTerm({ term: 'Media product', definition: 'Anything made to reach an audience through sound, moving pictures, print or a screen.',
  example: 'A Fortnite season, a Smash Hits cover from 1989, a Radio 1 breakfast show: all media products.', img: img('fortnite.jpg'), imgLabel: 'Fortnite screenshot',
  notes: 'Ask for examples from their last 24 hours before revealing the example line.' });

K.info({ title: 'Three components', standfirst: 'The BTEC Tech Award in Creative Media Production has three parts. You need all three.',
  points: [['Component 1 · Exploring Media Products', 'How real media products are made for their audiences. Now until the spring.'],
    ['Component 2 · Developing Digital Media Production Skills', 'Hands-on skills in one sector: video, print or interactive.'],
    ['Component 3 · Create a Media Product in Response to a Brief', 'Make your own product for a client. Set and marked by Pearson.']],
  notes: 'From the specification: C1 and C2 are internally assessed (36 guided hours each); C3 is external and synoptic (48 hours). They did a C3-style mock with FIZZIKAL.' });

K.info({ title: 'Component 1: what you will learn', standfirst: 'Real media products you know, and some made before you were born.',
  points: [['Three sectors', 'Audio / moving image, print and interactive.'],
    ['Products, audiences, purposes', 'Who makes media, who it is for, and why.'],
    ['Making meaning', 'Genre, narrative, representation, and the techniques that create them.'],
    ['Then and now', 'Products from before 2000 and from 2000 onwards.']],
  img: img('minecraft.jpg'), imgLabel: 'Minecraft village screenshot',
  notes: 'Learning outcomes A (investigate media products) and B (how products create meaning and engage audiences).' });

K.info({ title: 'How Component 1 is assessed', standfirst: 'One piece of assessed work, done in lessons, after we have learned everything it needs.',
  points: [['A Pearson-set assignment', 'Pearson writes the task. You complete it in class, under supervision, in the spring term.'],
    ['Two tasks', 'Task 1: research media products, their purposes and audiences. Task 2: explain how products create meaning.'],
    ['Your choices, your work', 'You choose your own products. All the work must be yours: no AI tools, no copying.'],
    ['Marked here, checked by Pearson', 'Your teacher marks it, and Pearson checks a sample of the marking.']],
  notes: 'General description only (spec + sample PSA). Do NOT mention the live assignment\'s theme, client, audience or dates. Practice comes first: every lesson until Christmas builds the knowledge the tasks need.' });

K.turnTalk({ prompt: 'Which media product could you not live without for a week? Why that one?', img: img('tiktok.jpg'), imgLabel: 'TikTok feed (App Store screenshot)',
  notes: 'Warm-up for the baseline: they will write their favourites on the hub. Listen for the sectors they name.' });

K.task({ title: 'Baseline: where are you starting?', mins: 25, where: 'Hub › Year 10 › Lesson 1.0 › Welcome to Creative Media',
  steps: ['Open Welcome to Creative Media on the hub.', 'Task 1: your media: one product of each kind, and what you want to make.', 'Task 2: read the A Minecraft Movie poster: four questions, full sentences.', 'Save: it goes to your teacher. There are no wrong answers.'],
  criteria: ['Real product names', 'Full sentences', 'Two clues from the poster'],
  notes: 'Completion-scored (100% when finished): a baseline, not a test. Compare with their 1.2 and later writing.' });

K.plenary({ lesson: LESSON, task: 'Tell your partner one thing Component 1 will make you do, and one question you still have.',
  starter: '"In Component 1 I will… I still want to know…"',
  notes: 'Collect two or three questions. Next lesson: 1.1 Media Everywhere.' });

K.write(OUT);
