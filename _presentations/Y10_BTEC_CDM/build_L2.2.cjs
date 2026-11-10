// Y10 BTEC Component 1 — Lesson 2.2 Who Is It For? (spec A1 audience interpretation: defining primary and secondary
// audiences, e.g. gender, age, socio-economic groupings, lifestyle profiles). Hub page: Y10/Component_1/L2.2_Who_Is_It_For/.
// The deck follows the page's two parts: who the audience is (primary and secondary; age, gender, socio-economic group:
// Warm-up + Tasks 1–2) and lifestyle profiles after the football-fans worked model (Tasks 3–5).
// Products used on the page (Beano, Smash Hits, Vogue, Countdown, Radio 1, Fortnite) are not worked through here,
// so the deck never gives away a task's answer; the worked models are Match of the Day magazine and football fans.
//
//   node build_L2.2.cjs   → L2.2_Who_Is_It_For.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L2.2_Who_Is_It_For.pptx');
const K = createDeck({ lesson: '2.2', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 2.2: Who Is It For?' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'Who is a media product made for, and how can you tell?';
const WHERE = 'Hub › Year 10 › Lesson 2.2 › Who Is It For?';

// Recap: 2.1 (survey; check before you trust), 1.3 (purpose), then a bridge into today's question.
const RECALL = [
  { tag: 'Lesson 2.1', q: 'You ask 20 classmates which streaming service they use. Survey or interview?', options: ['survey', 'interview'], a: 'Survey: the same questions to lots of people' },
  { tag: 'Lesson 2.1', q: 'A Wikipedia page with no references. Trust it, or check it first?', options: ['trust it', 'check it first'], a: 'Check it first: fact-check it in a second source' },
  { tag: 'Lesson 1.3', q: 'Beano wants to make you laugh. Which purpose is that?', options: ['inform', 'entertain', 'persuade'], a: 'To entertain' },
  { tag: 'Bridge', q: 'Who do you think Match of the Day magazine is made for?', options: ['children', 'adults', 'everyone'], a: 'Mostly children who love football. How can we tell? Today.' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Q1–2 look back at 2.1, Q3 at 1.3. Q4 bridges into today: don\'t settle the answer yet, just collect hands for each option.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q4: ask two students WHY they chose their answer. Whatever they point at (the free cards, the jokes, the price) is evidence about the audience. Today: reading that evidence to say exactly who a product is for.' });

K.titleSlide({ coverLine: 'Who Is It For?', issueLine: 'Lesson 2.2  ·  Y10 BTEC Creative Media',
  standfirst: 'Every media product is made for someone. Read the evidence and say exactly who.', puff: 'Lesson 2.2',
  img: img('motd_mag.jpg'), imgLabel: 'Match of the Day magazine cover',
  notes: 'Cover: Match of the Day magazine, which we take apart in a few slides. In the PSA (Task 1) students define the audience of each product they choose: primary and secondary, with age, gender, socio-economic group and a lifestyle profile. Moderators reward audiences backed by evidence from the product.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary.' });

// ── Part 1: who is in the audience? (Warm-up, Tasks 1–2, ★ Two audiences) ──
K.info({ title: 'Two audiences', standfirst: 'Every product has a main audience, and usually a second one.',
  points: [['Primary audience', 'The main group a product is made for. Also called the target audience.'],
    ['Secondary audience', 'Other people it appeals to as well, though it isn\'t mainly made for them.']],
  img: img('motd_mag.jpg'), imgLabel: 'Match of the Day magazine cover',
  notes: `Spec A1: defining primary and secondary audiences. One per click.
Not the same "primary" as primary research last lesson: here it means MAIN.
Example to say: Match of the Day magazine is made for children who love football (primary). Parents and grandparents who buy it, and flick through it, are a secondary audience. Why do producers care? A secondary audience means more sales, more money.` });

K.info({ title: 'Describing an audience', standfirst: 'Three things to say about any audience.',
  points: [['Age', 'An age range: 8 to 12, or 16 to 34. Not just "young".'],
    ['Gender', 'Mostly male, mostly female, or a mix. Say "mostly", not "only".'],
    ['Socio-economic group', 'The kind of jobs they do, and so how much money they have to spend.']],
  notes: 'One per click. Spec: gender, age, socio-economic groupings. Push for ranges and "mostly": very few products have no fans of the other gender. Socio-economic group is the new one: next slide.' });

K.info({ title: 'Socio-economic groups', standfirst: 'People sorted by their job. Advertisers join them into ABC1 and C2DE.',
  points: [['A/B', 'Senior managers and professionals: lawyers, head teachers, architects.'],
    ['C1', 'Office, admin and supervisor jobs: bank clerks, call-centre staff.'],
    ['C2', 'Skilled trades: plumbers, mechanics, hairdressers.'],
    ['D/E', 'Manual jobs (packing, cleaning), and people on a state pension or not working.']],
  notes: `The NRS social grades, simplified (A and B, and D and E, are joined). Moderator-praised Component 1 work uses them: "aimed at C1 and above because it is expensive".
ABC1 = A, B and C1 together; C2DE = C2, D and E. Clues to a product's group: what it costs, and what its adverts sell. Free or cheap → all groups.
The same boxes are on hub Task 1, so students can look back.` });

K.choice({ question: 'Aisha is a head teacher. Which socio-economic group is she in?',
  options: ['A/B: managers, professionals', 'C1: office and admin', 'C2: skilled trades', 'D/E: manual, not working'],
  notes: 'Answer A: a senior professional who runs a school. Quick follow-up: and a plumber? (C2). A receptionist? (C1).' });

K.annotate({ title: 'Read the evidence: who is it for?', img: img('motd_mag.jpg'), imgLabel: 'Match of the Day magazine cover', pillar: 'info', tall: true,
  marks: [{ at: [0.22, 0.12], label: 'Masthead', note: 'BBC Match of the Day: for people who love football' },
    { at: [0.8, 0.08], label: 'Free gift', note: '10 Premier League cards to collect: children' },
    { at: [0.2, 0.47], label: 'Cover lines', note: '"Brain-bustin\' quizzes": puzzles for children' },
    { at: [0.6, 0.87], label: 'Language', note: '"Nah, no way bro": talks like a young fan' },
    { at: [0.88, 0.93], label: 'Price', note: '£4.99, in supermarkets: all groups' }],
  prompt: 'Age · gender · socio-economic group: what does each clue tell you?',
  notes: `Worked model: each clue is evidence for one part of the audience. One per click; ask "what does this tell us?" before revealing each note.
Put it together: primary audience = children and young teens, boys and girls who love football (the Fran Kirby line shows women's football too), all socio-economic groups. Secondary: parents and grandparents who buy it.
This is exactly what hub Task 2 asks: four real products, clue by clue.` });

K.task({ title: 'Who\'s in the audience?', mins: 15, where: WHERE,
  steps: ['The page opens on the Warm-up: is each fact about age, gender or socio-economic group?',
    'Task 1 · Who\'s in the audience? Primary or secondary, then which group each job is in.',
    'Task 2 · Who\'s it for? Read each clue and name the audience. Guess early for more stars.',
    'Finished? Try ★ Two audiences. Tasks 3–5 open later.'],
  criteria: ['Age as a range; "mostly", not "only"', 'Match the job to its group', 'Every answer backed by a clue'],
  notes: 'Warm-up is optional: its meanings are open on the page. Tasks 3–5 are locked (Part 2) until the unlock word on a later task slide. A wrong check or guess makes students wait. Early finishers do ★ Two audiences: Spider-Verse\'s primary and secondary audience, and why Sony wants both. Dotted words on the page show their meaning on hover or tap.' });

// ── Part 2: lifestyle profiles (Tasks 3–5, ★ Stranger Things) ──
K.keyTerm({ term: 'Lifestyle profile', definition: 'A description of how one typical member of the primary audience lives: their interests, attitudes, values and behaviour.',
  example: 'Jordan, 34, a football fan: goes to every home game, and thinks the manager should be sacked.',
  img: img('motd_mag.jpg'), imgLabel: 'Match of the Day magazine cover',
  notes: 'Spec A1: lifestyle profiles. Age, gender and group say WHO; a lifestyle profile says HOW THEY LIVE. Producers and advertisers use it to decide what to make and where to advertise. Example on click. We\'ll build Jordan\'s profile together next: football fans are a neutral audience, so we can focus on the four words.' });

K.info({ title: 'The four parts: a football fan', standfirst: 'Worked model: Jordan, 34, a typical football fan.',
  points: [['Interests', 'What they like doing or knowing about: EA FC, football shirts, transfer news.'],
    ['Attitudes', 'What they think or feel about things: thinks their team\'s manager should be sacked.'],
    ['Values', 'What matters most to them: belonging. The club is like a family.'],
    ['Behaviour', 'What they actually do: goes to every home game, checks scores on the BBC Sport app.']],
  notes: `One per click. Ask the class for a second example of each before revealing the next.
Tests to say aloud: an interest is a topic or hobby. An attitude is an opinion ("thinks…", "feels…"). A value is a big idea that matters most: loyalty, family, fairness. Behaviour is something you could watch them do, or count.
These four examples are on the page's Task 3 too; the cards students sort there are all new.` });

K.turnTalk({ lead: 'An attitude is an opinion about one thing. A value is the big idea behind it.',
  prompt: '"Real fans never leave before the final whistle." Attitude or value? What\'s the value behind it?',
  notes: 'It\'s an attitude (an opinion about leaving early); the value behind it is loyalty. Attitudes and values are the pair students mix up most: listen for "it\'s what they think" (attitude) vs "it\'s what matters most" (value).' });

K.choice({ question: '"Wears the club scarf to school on match days." Which part of the lifestyle profile is this?',
  options: ['Interests', 'Attitudes', 'Values', 'Behaviour'],
  notes: 'Answer D: something you could watch them do. If anyone says C (loyalty): that\'s the value BEHIND the behaviour. Good: say both.' });

K.task({ title: 'Profile the audience', mins: 25, unlock: 'superfan', where: WHERE,
  steps: ['Task 3 · A football fan: sort the facts about Jordan into interests, attitudes, values and behaviour.',
    'Task 4 · Profile the audience: read each evidence file, then build the cards for Radio 1 and Fortnite.',
    'Task 5 · Meet the audience: write a lifestyle profile of one typical member, one box per part.',
    'Finished? ★ Stranger Things: one more profile, on your own.'],
  criteria: ['Every field backed by the evidence', 'Interest, attitude, value, behaviour: not mixed up', 'Each box uses its word'],
  notes: 'Unlock word SUPERFAN opens Tasks 3–5 and ★ Stranger Things (it stays open after a refresh). Teacher mode or "outwood" opens every part. Task 4: each lifestyle statement is right in only one field, so a student who mixes up attitude and value goes red there; a wrong field makes them wait. Task 5 is writing for Classroom: each box must use its word (interest, attitude, value, behaviour). The page has a model answer in its help panel.' });

K.plenary({ lesson: LESSON, task: 'Name a product you use every week. Who is its primary audience, and what is one clue that tells you?',
  starter: '"The primary audience of ___ is ___, aged ___. I can tell because ___."',
  notes: 'Exit ticket. Listen for a range, "mostly", a socio-economic group and a real clue from the product, not just "people who like it".' });

K.write(OUT);
