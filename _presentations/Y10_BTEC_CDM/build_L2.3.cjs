// Y10 BTEC Component 1 — Lesson 2.3 Counting and Asking Audiences (spec A1: audience statistics; primary research
// through interviews, focus groups and surveys). Hub page: Y10/Component_1/L2.3_Counting_and_Asking_Audiences/.
// The deck follows the page's two parts: counting audiences with real statistics (Warm-up, Tasks 1–3, ★ What numbers
// don't say) and asking them yourself (Tasks 4–6, ★ Build a survey; unlock word FOLLOWUP).
// The page's own examples (Netflix, MrBeast, TV Choice, Roblox, Wednesday, Jay's Fortnite survey) are not worked
// through here, so the deck never gives away a task's answer; the worked models are Spotify, Minecraft and Among Us.
//
//   node build_L2.3.cjs   → L2.3_Counting_and_Asking_Audiences.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L2.3_Counting_and_Asking_Audiences.pptx');
const K = createDeck({ lesson: '2.3', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 2.3: Counting and Asking Audiences' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How can you find out how big an audience is, and what it thinks?';
const WHERE = 'Hub › Year 10 › Lesson 2.3 › Counting and Asking Audiences';

// Recap: 2.2 (secondary audience; socio-economic group), 2.1 (primary research), then a bridge into today.
const RECALL = [
  { tag: 'Lesson 2.2', q: 'Parents who buy Match of the Day magazine for their children. Primary or secondary audience?', options: ['primary', 'secondary'], a: 'Secondary: it isn\'t mainly made for them' },
  { tag: 'Lesson 2.2', q: 'A plumber. Which socio-economic group?', options: ['C1', 'C2', 'D/E'], a: 'C2: skilled trades' },
  { tag: 'Lesson 2.1', q: 'You ask your friends what they think of a film. Primary or secondary research?', options: ['primary', 'secondary'], a: 'Primary: you collected it yourself' },
  { tag: 'Bridge', q: 'How could a film company prove its film was a hit?', options: ['money from tickets', 'the director\'s opinion'], a: 'Money from tickets: a number that counts the audience. Today.' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Q1–2 look back at 2.2, Q3 at 2.1. Q4 bridges into today: take a few ideas, then move on.' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q3: primary research matters again in Part 2 today, when they interview a partner. Q4: ticket money is a box office figure, one of six kinds of audience statistic.' });

K.titleSlide({ coverLine: 'Counting and Asking Audiences', issueLine: 'Lesson 2.3  ·  Y10 BTEC Creative Media',
  standfirst: 'Count an audience with real numbers. Then ask them yourself.', puff: 'Lesson 2.3',
  img: img('minecraft_movie_2025.jpg'), imgLabel: 'A Minecraft Movie poster',
  notes: 'Cover: A Minecraft Movie, the UK and Ireland\'s top film of 2025 at the box office. In the PSA (Task 1) students back up who an audience is with research: statistics they find (secondary) and questions they ask (primary).' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary. Two halves: COUNT the audience (statistics), then ASK them (interviews, focus groups, surveys).' });

// ── Part 1: counting audiences (Warm-up, Tasks 1–3, ★ What numbers don't say) ──
K.keyTerm({ term: 'Audience statistic', definition: 'A number that counts a product\'s audience. Producers and advertisers use them to show how big an audience is.',
  example: 'A Minecraft Movie took £56.9 million at UK and Ireland cinemas in 2025: the top film of the year (BFI).',
  img: img('minecraft_movie_2025.jpg'), imgLabel: 'A Minecraft Movie poster',
  notes: 'Spec A1: audience statistics. Example on click. Why do producers care? A big number sells advertising and persuades people to try it. Each sector counts its audience in its own way: six kinds, over the next two slides.' });

K.info({ title: 'Counting what people pay for', standfirst: 'Three statistics for films, print and games.',
  points: [['Box office', 'Money taken from cinema tickets for a film.'],
    ['Circulation', 'Copies of a newspaper or magazine sold or given out, such as Metro each weekday.'],
    ['Sales', 'Copies of a game, album or book bought. Minecraft has sold more than 300 million.']],
  img: img('minecraft.jpg'), imgLabel: 'Minecraft',
  notes: 'One per click. Box office is MONEY, the others are COPIES. Circulation counts free papers too (Metro is given out free). Minecraft: Mojang, October 2023.' });

K.info({ title: 'Counting people online', standfirst: 'Three statistics for websites, streaming and social media.',
  points: [['Hits', 'Visits to a website or web page, such as BBC News.'],
    ['Subscriptions', 'People signed up to get something regularly: a streaming service or a YouTube channel.'],
    ['Followers', 'People who follow an account on social media, such as Marcus Rashford on Instagram.']],
  notes: 'One per click. A YouTube channel\'s "subscribers" are subscriptions too, even though they don\'t pay. The Warm-up on the page has these six meanings open while students sort examples.' });

K.choice({ question: 'Spotify wants to show how big its audience is. Which statistic should it use?',
  options: ['Box office', 'Circulation', 'Subscriptions', 'Hits'],
  notes: 'Answer C: people sign up to Spotify Premium every month. Follow-up: and for a film? (box office). A magazine? (circulation).' });

K.info({ title: 'Reading the numbers', standfirst: 'Three sums you\'ll need for real tables.',
  points: [['How much more?', 'Take away: Wicked: For Good £47.0m − Zootropolis 2 £30.5m = £16.5m more.'],
    ['Percentages', '95% of 8 to 14s use Google Search. In a class of 30: 30 × 95 ÷ 100 = 28.5, so about 29.'],
    ['How many times as many?', 'Divide: £56.9m ÷ £23.4m ≈ 2.4. A Minecraft Movie took about 2.4 times as much as How to Train Your Dragon.']],
  notes: `One per click; do each sum on the board. Sources: BFI 2025 box office (via the Press Association) and Ofcom Online Nation 2025.
These are the three kinds of sum in Task 2, on different rows. The page's help panel has the same three steps.` });

K.turnTalk({ lead: 'Minecraft has sold more than 300 million copies.',
  prompt: 'What does that tell you about its audience? What doesn\'t it tell you?',
  img: img('minecraft.jpg'), imgLabel: 'Minecraft',
  notes: `Tells you: a huge audience, all over the world, for a long time.
Doesn't tell you: how old they are, boys or girls, why they bought it, whether they still play. A statistic counts; it doesn't say WHO or WHY. To find that out you have to ask them: Part 2.
Early finishers do the same thinking for A Minecraft Movie in ★ What numbers don't say.` });

K.task({ title: 'Count the audience', mins: 25, where: WHERE,
  steps: ['The page opens on the Warm-up: which kind of statistic is each card?',
    'Task 1 · Which number? Task 2 · Read the numbers: three real tables.',
    'Task 3 · Find two statistics for products in your research log (it links to Lesson 2.1).',
    'Finished? Try ★ What numbers don\'t say. Tasks 4–6 open later.'],
  criteria: ['The right statistic for each sector', 'Sums from the table, not guesses', 'Every statistic with its number and its source'],
  notes: 'Warm-up is optional: its meanings are open on the page. Task 2 takes typed numbers ("£56.9m" and "56.9" both work). Task 3 is live research: each statistic needs a number, a real link (not a search page) and who made the page. The research log link opens 2.1 in a new tab. Tasks 4–6 are locked (Part 2) until the unlock word. A wrong check makes students wait.' });

// ── Part 2: asking audiences (Tasks 4–6, ★ Build a survey) ──
K.info({ title: 'Three ways to ask', standfirst: 'Primary research: ask the audience yourself.',
  points: [['Interview', 'Ask one person questions and listen to their answers in detail.'],
    ['Focus group', 'A small group try the product together, then discuss it while you ask questions.'],
    ['Survey', 'The same questions for lots of people, so you can count the answers.']],
  notes: 'Spec: personal interview, focus group, survey. One per click. Ask: which gives you the most detail? (interview) Which gives numbers for a chart? (survey) Which lets people spark ideas off each other? (focus group)' });

K.info({ title: 'Four kinds of question', standfirst: 'Worked model: a survey about Among Us.',
  points: [['Multiple choice', '"Who do you play with? A) Friends  B) Family  C) Strangers online"'],
    ['Rating scale', '"How much do you enjoy Among Us, from 1 to 5?"'],
    ['Ranking', '"Put these in order, favourite first: crewmate, impostor, ghost."'],
    ['Open-ended', '"What makes a game of Among Us fun?"']],
  img: img('among_us.jpg'), imgLabel: 'Among Us',
  notes: 'One per click. The first three give answers you can count; open-ended gives detail and reasons (best in an interview). A good survey mixes them.' });

K.info({ title: 'Follow-ups and samples', standfirst: 'Two more things a good researcher does.',
  points: [['Follow-up question', 'Asks for more about the answer someone just gave. "I play it on the bus." "Who with?"'],
    ['Sample', 'The people you choose to ask: enough of them, from the target audience, and different from each other.']],
  notes: 'One per click. Follow-ups are where interviews get interesting: plan "Why do you say that?" in advance. Sample: three best mates who all love the game will all say the same thing.' });

K.turnTalk({ lead: 'A survey asks: "Don\'t you think TikTok is a waste of time?"',
  prompt: 'What\'s wrong with this question? How would you fix it?',
  img: img('tiktok.jpg'), imgLabel: 'TikTok',
  notes: `It pushes people towards an answer ("Don't you think…", "waste of time"). Fairer: "How much time do you spend on TikTok a day?" or "What do you get out of TikTok?"
Task 5 tests a whole survey like this: students see the results come back, click the ones that are no use, then rewrite those questions.` });

K.choice({ question: 'You want to know in detail why one friend stopped watching a series. Which method?',
  options: ['Interview', 'Focus group', 'Survey'],
  notes: 'Answer A: one person, in detail, with follow-ups. A survey counts many answers; a focus group is a group discussion.' });

K.info({ title: 'Record your interview', standfirst: 'In PowerPoint, with your partner, about 2 minutes each.',
  points: [['Record', 'Insert › Audio › Record Audio… Name it, then press the red button.'],
    ['Ask', 'Your four questions, plus a follow-up when an answer is interesting.'],
    ['Save', 'Right-click the speaker icon › Save Media as… Upload it to Classroom.']],
  notes: 'Same steps as Task 6 on the page. Sit side by side, show your partner the product first, then swap so both are interviewed. Headsets with microphones if available; otherwise quiet corners.' });

K.task({ title: 'Ask the audience', mins: 30, unlock: 'followup', where: WHERE,
  steps: ['Task 4 · Which way to ask? Methods, kinds of question, follow-ups and samples.',
    'Task 5 · Test the survey: run Jay\'s survey, click the results that are no use, rewrite those questions.',
    'Task 6 · Interview a partner: plan, record 2 minutes, upload, then write up what they said.',
    'Finished? ★ Build a survey: one question of each kind.'],
  criteria: ['The right method for the job', 'Fair questions: one thing at a time', 'A follow-up when an answer is interesting'],
  notes: 'Unlock word FOLLOWUP (or "follow-up") opens Tasks 4–6 and ★ Build a survey. Teacher mode or "outwood" opens every part. Task 5: a rewrite that still breaks a rule says why under the box and makes them wait. Task 6: the recording goes to this lesson\'s Classroom assignment; the write-up is saved from the page.' });

K.plenary({ lesson: LESSON, task: 'Pick a product you use. Name one statistic that counts its audience, and write one question you\'d ask them.',
  starter: '"I could count its audience with its ___. I would ask: ___?"',
  notes: 'Exit ticket. Listen for the right statistic for the sector, and a fair question (not pushing an answer, one thing at a time).' });

K.write(OUT);
