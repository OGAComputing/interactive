// Y10 BTEC Component 1 — Lesson 2.1 Research Like a Pro (spec A1: researching media products, primary and secondary
// sources; media research techniques: recording research outcomes, screen recordings, research logs; teacher guide:
// reliability of secondary sources, referencing). Hub page: Y10/Component_1/L2.1_Research_Like_a_Pro/.
// The deck follows the page's three parts: primary vs secondary (Warm-up + Task 1), can you trust it? (Task 2),
// research logs, referencing, screenshots and screen recording (Tasks 3–4).
//
//   node build_L2.1.cjs   → L2.1_Research_Like_a_Pro.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L2.1_Research_Like_a_Pro.pptx');
const K = createDeck({ lesson: '2.1', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 2.1: Research Like a Pro' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do you find information about a media product that you can trust?';
const WHERE = 'Hub › Year 10 › Lesson 2.1 › Research Like a Pro';

// Recap: 1.3 (producer type, motivation), 1.1 (historical vs contemporary), then a bridge: where would you find a fact?
const RECALL = [
  { tag: 'Lesson 1.3', q: 'Rhubarb Radio is run by volunteers for Wakefield, not for profit. What kind of producer?', options: ['conglomerate', 'community media', 'independent'], a: 'Community media' },
  { tag: 'Lesson 1.3', q: '"To make money." Purpose or motivation?', options: ['purpose', 'motivation'], a: 'Motivation: the producer gets the money' },
  { tag: 'Lesson 1.1', q: 'Toy Story came out in 1995. Contemporary or historical?', options: ['contemporary', 'historical'], a: 'Historical: made before 2000' },
  { tag: 'Bridge', q: 'How would you find out how many copies Minecraft has sold?', options: ['ask your class', 'look it up online', 'guess'], a: 'Look it up, in a source you can trust' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Q1–2 look back at 1.3, Q3 at 1.1. Q4 bridges into today: some things you find out by asking people, some by looking them up. And not everything online is true.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q4: your class can tell you what THEY think of Minecraft, but not how many copies it has sold worldwide. That is already written down somewhere, but where, and can you trust it? That is today.' });

K.titleSlide({ coverLine: 'Research Like a Pro', issueLine: 'Lesson 2.1  ·  Y10 BTEC Creative Media',
  standfirst: 'Ask people yourself. Check who you can trust. Log where it all came from.', puff: 'Lesson 2.1',
  img: img('minecraft.jpg'), imgLabel: 'Minecraft screenshot',
  notes: 'Cover: Minecraft. In the PSA (Task 1) students must research their own products; moderators reward research from both primary and secondary sources, clearly referenced. Today is how to do that well. Minecraft comes back in Task 2.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary.' });

// ── Part 1: primary and secondary research (Warm-up + Task 1) ──
K.info({ title: 'Two kinds of research', standfirst: 'Ask one question: who collected the information?',
  points: [['Primary research', 'You collect it yourself, first-hand: you ask, watch or talk with people.'],
    ['Secondary research', 'Someone else already collected it: websites, articles, reviews, videos.']],
  notes: `Spec A1: primary sources (observations, discussions, interviews, surveys) and secondary sources (internet, film, TV, magazines). One per click.
Example: what Year 10s think of EA Sports FC? Only primary research can tell you: ask them. How much Barbie made at the box office? Secondary: it's already in the news.` });

K.info({ title: 'Four ways to do primary research', standfirst: 'All four: you collect it yourself.',
  points: [['Survey', 'The same questions to lots of people. 20 classmates: which streaming service?'],
    ['Interview', 'Lots of questions to one person, answers recorded. Your gran on Top of the Pops.'],
    ['Observation', 'Watch what people do and note it. Your cousin choosing Switch games.'],
    ['Discussion', 'A group talks it through; you note what each person says.']],
  notes: 'Spec examples of primary sources. One per click. The test: lots of people with the same questions = survey; one person, many questions = interview; watching, not asking = observation; a group talking together = discussion. Surveys and interviews come back in 2.3, where students write and record their own.' });

K.choice({ question: 'You read an Empire magazine review of Inside Out 2. What kind of research is this?',
  options: ['A survey', 'An interview', 'An observation', 'Secondary research'],
  notes: 'Answer D: someone else wrote it. If anyone says B ("the reviewer interviewed people"): maybe, but YOU didn\'t collect it, so for you it\'s secondary. ★ It depends on the page explores exactly this.' });

K.task({ title: 'Which research?', mins: 10, where: WHERE,
  steps: ['The page opens on the Warm-up: sort 8 research jobs into primary or secondary.',
    'Task 1 · Which research? Name the research, then pick the research that would find each answer.',
    'A wrong check makes you wait: read the question again before you check.',
    'Finished? Try ★ It depends. Tasks 2–4 open later.'],
  criteria: ['Ask: who collected it?', 'Survey, interview, observation or discussion', 'All eight right'],
  notes: 'Warm-up is optional: its meanings are open on the page. Tasks 2–4 are locked (Parts 2 and 3) until their unlock words, on later task slides. Early finishers do ★ It depends (a YouTuber\'s reaction video; your aunt\'s cinema ticket count). Dotted words on the page show their meaning on hover or tap.' });

// ── Part 2: can you trust it? (Task 2) ──
K.keyTerm({ term: 'Reliable', definition: 'A reliable source is one you can trust to be true.',
  example: 'Minecraft\'s official website says it has sold over 300 million copies, and a 2023 news article says the same.',
  img: img('minecraft.jpg'), imgLabel: 'Minecraft screenshot',
  notes: 'The teacher guide: judge secondary sources by who wrote them (official or trusted, anonymous, possible bias), fact or opinion, how up to date they are, and fact-checking. Example on click: two independent sources that agree. Next slide: the four checks.' });

K.info({ title: 'The four checks', standfirst: 'Run all four on every secondary source.',
  points: [['Who made it?', 'Official or a trusted name? Anonymous? Could they be biased: only showing the side that suits them?'],
    ['Fact or opinion?', 'A fact can be checked. An opinion is what one person thinks.'],
    ['When?', 'Up to date, or out of date?'],
    ['Can you check it?', 'Fact-check it: does a second source you trust say the same?']],
  notes: `One per click. Define the words as they appear: official (from the people who make it), anonymous (nobody knows who wrote it), biased.
AI chatbots: they can sound sure and still be wrong, and often give no source. Treat an AI answer as a claim to fact-check, never as the source.
Wikipedia: anyone can edit it, so don't quote it as your source, but follow its references to the real ones.` });

K.choice({ question: 'A 2019 news article gives the number of Roblox players. Why shouldn\'t you use it as today\'s number?',
  options: ['It is out of date', 'It is anonymous', 'It is an opinion'],
  notes: 'Answer A. It was true when it was written, so the source isn\'t "bad", but it fails the "When?" check. Find a figure from this year. The same slip is hiding in Jay\'s log (Task 3).' });

K.task({ title: 'Trust it?', mins: 12, unlock: 'detective', where: WHERE,
  steps: ['Task 2 · Trust it? Place seven Minecraft sources on the line, from Trust it to Don\'t trust it.',
    'Clear cases go at the ends. If you\'d have to check it first, it goes in the middle.',
    'Then explain two cards underneath, using a word from the box.',
    'Finished? Try ★ Who\'s behind it?'],
  criteria: ['Run the four checks on every card', 'Explain with reliable, official, anonymous…', 'Every card in a good place'],
  notes: 'Unlock word DETECTIVE: students type it on any locked tab to open Task 2 and ★ Who\'s behind it? (it stays open after a refresh). Teacher mode or "outwood" opens every part. A card at the wrong end costs a wait; the two "why" boxes only ask for a sentence. Notes appear on each card once the task is done: use them to discuss the middle cards (Wikipedia, the 2011 article, the AI answer).' });

// ── Part 3: research logs, referencing, screenshots and screen recording (Tasks 3–4) ──
K.info({ title: 'Keep a research log', standfirst: 'Every source, every time, as you find it.',
  points: [['The source', 'Who made it, and its link. Primary: who you asked.'],
    ['What you found', 'In your own words, or quoted exactly in quotation marks.'],
    ['When', 'The date you looked.']],
  notes: 'Spec A1, recording research outcomes: note taking, screen recordings, research logs. In the PSA students may use a blank research log template, nothing more. Moderators look for evidence of the research itself (screenshots of a survey, links) and a list of sources at the end.' });

K.info({ title: 'Plagiarism and references', standfirst: 'Other people\'s words need their name on them.',
  points: [['Plagiarism', 'Using someone else\'s words or work as if they were your own.'],
    ['Reference', 'Where it came from: who made it, what it is, the link and the date you looked.'],
    ['Do this', 'Your own words and a reference, or their exact words in quotation marks and a reference.']],
  notes: 'Pearson treats copied work without acknowledgement as plagiarism, which can disqualify the work. Moderators: quote extracts in quotation marks with a reference; never paste from a website word for word. Example to say aloud: pasting a Wikipedia paragraph into your notes is plagiarism, even in a log. Jay does exactly that in Task 3.' });

K.modelAnswer({ title: 'One log entry', question: 'When did Inside Out 2 come out?', key: ['Reference', 'Fact', 'Log note'],
  parts: [['Reference', 'Pixar\'s official website, pixar.com, looked at on 9 November 2026.'],
    ['Fact', 'Inside Out 2 came out in cinemas in 2024.'],
    ['Log note', 'This is secondary research. I can trust it because it is the official website of the studio that made the film.']],
  notes: 'The shape of every row in hub Task 4: the fact, the link to the page it came from, who made that page, and a log note naming the research and why it can be trusted. The page builds the references from the rows. Point out: the link is to the page itself, not to the Google search.' });

K.info({ title: 'Screenshots and screen recordings', standfirst: 'Show it, don\'t just describe it.',
  points: [['Screenshot', 'Windows + Shift + S, then drag around what you need. Paste it into your log.'],
    ['Screen recording', 'PowerPoint: Insert › Screen Recording. Show how a game, app or website moves and plays.'],
    ['Then reference it', 'Under every capture: where it came from and the date.']],
  notes: `Spec: screen recordings are a research technique, and the PSA allows screen capture/recordings as evidence. Save recordings as MP4 (Pearson's file format).
The school PCs' Snipping Tool is an old version with no video, so record with PowerPoint 2024: Insert › Screen Recording, Select Area, Record (Windows + Shift + Q stops). The video lands on the slide: right-click it › Save Media As to save the MP4. Streaming services such as Netflix block capture and record black: use the trailer on YouTube or a still instead.` });

K.choice({ question: 'You copy one sentence from a review into your log. What else does it need?',
  options: ['Quotation marks and a reference', 'Nothing: it is only one sentence', 'A few words changed around'],
  notes: 'Answer A. Changing a few words is still someone else\'s work (C); one sentence still needs its source (B).' });

K.task({ title: 'Check a log, then start yours', mins: 25, unlock: 'credit', where: WHERE,
  steps: ['Task 3 · Spot the slip: click every wrong line in Jay\'s Roblox log, check, then pick each fix.',
    'Task 4 · Your research log: find each fact online, paste the page\'s link and say who made the page.',
    'Then ask the person next to you about one of the three products: your primary research.',
    'Finished? ★ One more: a historical product and one of your own.'],
  criteria: ['Link to the page, not the search', 'Who made it, and a log note', 'Primary and secondary research'],
  notes: 'Unlock word CREDIT opens Tasks 3, 4 and ★ One more. Task 4 is live research: Stranger Things (which town?), The Beano (first issue?), Fortnite (how many players start a Battle Royale?). Only a wrong fact costs a wait; a missing link, name or note just goes red. A Google results link is caught and students are told to open the page itself. When the log is complete, the page shows their references: tell them to copy these into their own research log.' });

K.plenary({ lesson: LESSON, task: 'Name one source you used today. Is it primary or secondary, and why can you trust it?',
  starter: '"___ is ___ research. I can trust it because ___."',
  notes: 'Exit ticket. Listen for a real reason (official, up to date, a second source agrees), not just "it\'s a website".' });

K.write(OUT);
