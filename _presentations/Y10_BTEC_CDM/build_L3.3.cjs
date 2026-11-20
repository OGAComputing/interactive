// Y10 BTEC Component 1 — Lesson 3.3 Same Text, Different Readings (spec A1: audience responses: preferred,
// negotiated and oppositional readings; audience involvement: passive audiences).
// Hub pages: Y10/Component_1/L3.3_Same_Text_Different_Readings/ (1_Unit_A_Check, then 2_Same_Text_Different_Readings).
//
// The lesson opens with the Unit A check (~25–30 min), so there is NO Recap & Recall starter: the check is the
// retrieval, and a starter on Learning Aim A terms would hand out its answers. Then the readings page (~30 min)
// in two parts: a passive audience and War of the Worlds (Warm-up, Task 1, ★ Why did the papers say panic?), then
// the three readings (Task 2 Coca-Cola sort, Task 3 Snapper writing, ★ This year's advert; unlock word TRUCKS).
// The hypodermic needle model is in Pearson's Teacher Guide but not the spec, so it is never named (Nick, 2026-11-20).
// The page's own examples (Coca-Cola's AI trucks, Snapper) are not worked through here; the worked model is
// Comic Relief, read three ways by three viewers.
//
//   node build_L3.3.cjs   → L3.3_Same_Text_Different_Readings.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L3.3_Same_Text_Different_Readings.pptx');
const K = createDeck({ lesson: '3.3', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 3.3: Same Text, Different Readings' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'Does everyone take the same message from a media product?';
const HUB = 'Hub › Year 10 › Lesson 3.3';

K.titleSlide({ coverLine: 'Same Text, Different Readings', issueLine: 'Lesson 3.3  ·  Y10 BTEC Creative Media',
  standfirst: 'One advert, a million viewers. Do they all see the same thing?', puff: 'Lesson 3.3',
  img: img('orson_welles_reporters_1938.jpg'), imgLabel: 'Orson Welles meets reporters, 31 October 1938 · public domain',
  notes: 'Two halves today: first the Unit A check (about 25–30 minutes, on your own), then a short new topic: how audiences read the same product in different ways. The cover is Orson Welles explaining himself to reporters the morning after a radio play that newspapers said caused a panic. We find out what really happened later.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Hold it until after the check.' });

// ── The Unit A check (1_Unit_A_Check.html) ──
K.task({ title: 'Unit A check', mins: 30, where: `${HUB} › Unit A Check`,
  steps: ['On your own, in silence. No notes, no other tabs.',
    'Task 1 · The terms: 15 questions. One go only. Answer them all, then click Hand in twice.',
    'Task 2 · Apply it: three short answers on The Great British Bake Off, using the word boxes.',
    'Finished? ★ Then and now. Then sit quietly until everyone is done.'],
  criteria: ['Every question answered before you hand in', 'A word from each box in every Task 2 answer', 'Full sentences'],
  notes: `About 10 minutes for Task 1 and 15 for Task 2. Task 1 is marked once: each answer goes green or red but the right option isn't shown, there is no retry and no cooldown. Go over the answers with the class afterwards (or next lesson), and note which terms were weak: they go into the 4.x Recap & Recall slots.
Task 2 has word banks but no starters, like the real assessment. Band each answer working towards / secure / strong by eye from the Classroom evidence.
Score: the terms count two thirds, the writing one third.` });

// ── Part 1: a passive audience? War of the Worlds (Warm-up, Task 1, ★ Why did the papers say panic?) ──
K.info({ title: 'Halloween, 1938', standfirst: 'American radio played War of the Worlds: a drama about Martians landing in New Jersey.',
  points: [['It sounded real', 'Dance music kept being cut off by "news bulletins" about Martians attacking.'],
    ['The next morning', 'Newspapers said thousands of terrified listeners had run from their homes.'],
    ['The big idea', 'If that was true, one radio play had put the same fear into everyone who heard it.']],
  img: img('war_of_the_worlds_nyt_1938.jpg'), imgLabel: 'The New York Times, 31 October 1938 (cropped)',
  notes: 'One per click. Read the headline aloud: "Radio Listeners in Panic, Taking War Drama as Fact". Now play both clips: would YOU have believed it?' });

// The two War of the Worlds audio clips (Y10/media.md; Nick, 2026-11-20: Part 1 didn't land without hearing it).
// Clip 1 = the opening announcement + the first bulletin cutting into the dance music; Clip 2 = the reporter at Grover's Mill.
const WOTW1 = '1vFs_eSi9inl54f0t7gudL_ssxo7Ap2PH', WOTW2 = '108NZP67okjuR4-Z_Fe_ZrSzCwGYDu44Y';   // Drive › Clips (Y10/media.md)
K.clip({ title: 'Listen: 8 pm, the start', from: '0:00', to: 'end', where: 'Click the picture to play', video: WOTW1,
  img: img('orson_welles_reporters_1938.jpg'), imgLabel: 'Orson Welles, 1938 · public domain',
  questions: ['What does the announcer say at the very start?', 'What happens to the dance music?', 'If you heard it from the start, would you believe it?'],
  notes: 'Drive clip "War of the Worlds 1 - The start.mp3" (1½ min, Y10/media.md): the CBS announcement that this is Orson Welles and the Mercury Theatre in a play, then (after a jump) dance music cut off by the first "bulletin". Q1 matters: anyone listening from 8 pm was told it was a play.' });
K.clip({ title: 'Listen: about 8:15 pm, Grover\'s Mill', from: '0:00', to: 'end', where: 'Click the picture to play', video: WOTW2,
  img: img('orson_welles_reporters_1938.jpg'), imgLabel: 'Orson Welles, 1938 · public domain',
  questions: ['What does the reporter say he can see?', 'What happens at the end of the clip?', 'You switched over at 8:12 from a comedy show. How might you react?'],
  notes: 'Drive clip "War of the Worlds 2 - Grovers Mill.mp3" (1½ min): a few seconds of studio piano, back to the "live" reporter at the farm; jump to the Martians turning on the crowd, the heat ray (about 0:37), dead air, then the studio: "some difficulty with our field transmission". Q3 is the real finding (Cantril, 1940): many listeners switched over from a comedy show on another station at about 8:12, so they missed the announcement that it was a play. Take two or three answers: some would panic, some would check another station or ring someone. Did everyone react the same way? Hold that: we test the newspapers\' story after the key term.' });

const sPassive = K.keyTerm({ term: 'Passive audience', say: 'PASS-iv',
  definition: 'Takes the message in, without questioning it. An old idea said every audience is passive: one message goes into every head, and everyone reacts the same way.',
  example: 'In 1938 the newspapers said one radio play made everyone panic, as if every listener was passive.',
  img: img('orson_welles_reporters_1938.jpg'), imgLabel: 'Orson Welles meets reporters, 1938 · public domain',
  notes: 'Spec A1 (audience involvement): passive audiences. They met passive and active in 3.1; today the idea gets bigger: some people believed ALL audiences are passive, so the media could make everyone think or do the same thing. Example on click.' });
K.isys(sPassive, { term: 'Passive audience', fact: 'takes the message in',
  check: 'What kind of audience takes the message in?', reverse: 'What does a passive audience do?',
  say: 'A passive audience takes the message in, without questioning it.' });

K.info({ title: 'What really happened', standfirst: 'Researchers later checked the newspapers\' story.',
  points: [['Not listening', 'Most people weren\'t tuned in at all: another show was on.'],
    ['Not fooled', 'Most who were listening knew it was a play.'],
    ['Not the same', 'Some were scared. Others checked another station or a newspaper, and calmed down.']],
  img: img('war_of_the_worlds_nyt_1938.jpg'), imgLabel: 'The New York Times, 31 October 1938 (cropped)',
  notes: 'One per click. The point to land: listeners did NOT all react the same way, so they were not one passive audience. The ones who checked another station were being an active audience (3.1). Why would the newspapers make it sound bigger? Leave that hanging: it is the ★ challenge.' });

K.choice({ question: 'A news report says one TikTok trend made thousands of teenagers copy it. What kind of audience does the report think teenagers are?',
  options: ['An active audience', 'A secondary audience', 'A passive audience'], answer: 'C',
  notes: 'Answer C: it says the message went in and they all copied it, so it treats them as passive. Ask: did EVERY teenager who saw it copy it? That is the War of the Worlds question again.' });

K.task({ title: 'The panic that wasn\'t', mins: 8, where: `${HUB} › Same Text, Different Readings`,
  steps: ['Open the second page. It starts on the Warm-up: passive or active? The meanings are open.',
    'Task 1 · The panic that wasn\'t: replay the clips if you need to, read the story, then seven questions.',
    'Finished? ★ Why did the papers say panic? Tasks 2 and 3 open later.'],
  criteria: ['Did everyone react the same way?', 'All seven right first time for gold'],
  notes: 'Warm-up is optional (from 3.1). Task 1 is seven questions (first Ruth, who heard the start, and Frank, who switched over at 8:12); a wrong check makes them wait 10 s. The ★ challenge has a clue box: radio was new, and advertisers were moving their money from newspapers to radio. Tasks 2 and 3 are locked until the Part 2 word.' });

// ── Part 2: three readings (Task 2 Coca-Cola sort, Task 3 Snapper, ★ This year's advert) ──
// Concrete first (README 2026-11-17): three real-sounding viewers of one product, then the names.
K.info({ title: 'Red Nose Day: three viewers', standfirst: 'Comic Relief: comedy sketches, then films asking you to give money.',
  points: [['Ella', '"Funny and moving. I texted to give £5."'],
    ['Josh', '"I loved the sketches, but I didn\'t give anything."'],
    ['Amara', '"Some films made whole countries look poor and helpless. That\'s not fair."']],
  img: img('comic_relief.jpg'), imgLabel: 'Comic Relief',
  notes: 'One per click, no labels yet. Ask: what does Comic Relief WANT viewers to think and do? (laugh, care, give money). Then: who went along with all of it? Who took part of it? Who said no? Amara\'s view is real: in 2020 Comic Relief changed its appeal films after criticism like this.' });

const sReads = K.info({ title: 'Three readings', standfirst: 'The producer puts a message in. Each viewer reads it in their own way.',
  points: [['Preferred reading', 'The producer\'s meaning: the viewer takes it the way the producer wanted. Ella.'],
    ['Negotiated reading', 'The viewer accepts some of the producer\'s meaning, but not all of it. Josh.'],
    ['Oppositional reading', 'Rejects the message: the viewer disagrees with what the producer meant. Amara.']],
  notes: 'Spec A1: audience responses: preferred, negotiated and oppositional readings. One per click; point back to each viewer. The word "reading" means how you understand a product, not just reading words. The test for negotiated: a "but…".' });
K.isys(sReads, { term: 'Preferred reading', fact: "the producer's meaning",
  check: "What is the producer's meaning called?", reverse: 'What is a preferred reading?',
  say: "A preferred reading is the producer's meaning." });
K.isys(sReads, { term: 'Oppositional reading', fact: 'rejects the message',
  check: 'Which reading rejects the message?', reverse: 'What does an oppositional reading do?',
  say: 'An oppositional reading rejects the message.' });

K.choice({ question: 'Grace watches the Wicked: For Good trailer: "The songs look amazing, but I\'m not paying £12 to see it at the cinema." Which reading?',
  options: ['Preferred', 'Negotiated', 'Oppositional'], answer: 'B',
  notes: 'Answer B: she accepts part of the message (the songs look amazing) but not all of it (go and see it at the cinema). The "but" is the clue.' });

K.turnTalk({ lead: 'Think of a Christmas advert you\'ve seen this year.',
  prompt: 'What does the brand want you to think? Who might read it differently?',
  notes: `Push for the preferred reading in one sentence ("They want us to think…"), then a named kind of viewer with a negotiated or oppositional reading.
This is the ★ challenge at the end of Part 2.` });

K.task({ title: 'Same text, different readings', mins: 15, unlock: 'trucks', where: `${HUB} › Same Text, Different Readings`,
  steps: ['Task 2 · Three readings: sort nine comments on Coca-Cola\'s AI-made Christmas advert.',
    'Task 3 · Snapper: one reading of John Lewis\'s 2023 advert in each box, then: were its viewers one passive audience?',
    'Finished? ★ This year\'s advert: your own preferred and oppositional readings.'],
  criteria: ['Three cards in each box', 'Each Task 3 box uses its reading\'s name', 'A reason with "because"'],
  notes: 'Unlock word TRUCKS opens Tasks 2 and 3 and the ★ challenge. Teacher mode or "outwood" opens every part. Task 2 is a sort (three per box; a wrong check waits 10 s). Task 3 is writing with starters and an example for the Coca-Cola trucks in the help panel; it is scored on completion and sent to Classroom.' });

K.plenary({ lesson: LESSON, task: 'Answer today\'s question using War of the Worlds or Snapper, and one of the three readings.',
  starter: '"Not everyone takes the same message, because…"',
  notes: 'Exit ticket. Listen for: listeners/viewers reacted differently, so they were not one passive audience; and one reading named with an example. Go over the Unit A check answers next lesson if there was no time today.' });

K.write(OUT);
