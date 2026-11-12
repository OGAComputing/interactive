// Lesson 2.3 Counting and Asking Audiences: data and marking for 1_Counting_and_Asking_Audiences.html (pure, no DOM).
// Spec A1 "Audience interpretation": audience statistics, e.g. box office figures, circulation, sales, hits,
// subscriptions, followers. Spec A1 "Researching media products": primary sources, e.g. interviews, surveys.
// Teacher guide (p.14): personal interview, focus group or survey; follow-up questions; recording the interview;
// survey question types (multiple choice, rating scale, ranking, open-ended); the survey sample.
// Real figures: BFI 2025 UK and Ireland box office (via the Press Association, 5 Feb 2026); Ofcom Online Nation
// 2025 (10 Dec 2025); ABC 2025 magazine circulation (via Press Gazette, 20 Feb 2026); MrBeast 500 million
// subscribers (12 June 2026); Minecraft 300 million copies sold (Mojang, Minecraft Live, October 2023).
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (counting: audience statistics) is open from the start; Part 2 (asking: interviews, focus groups,
// surveys) opens with UNLOCK[2].
export const TASKS = [
  { key: 'which', kind: 'choice' },                                // 1 · Which number? The six kinds of statistic
  { key: 'read', kind: 'numbers' },                                // 2 · Read the numbers: BFI, Ofcom, ABC tables
  { key: 'find', kind: 'hunt' },                                   // 3 · Find two statistics (live research)
  { key: 'how', kind: 'choice', part: 2 },                         // 4 · Which way to ask? Methods, question types, sample
  { key: 'jay', kind: 'pilot', part: 2 },                          // 5 · Test the survey: run Jay's Fortnite survey, spot the useless results, rewrite them
  { key: 'talk', kind: 'write', part: 2 },                         // 6 · Interview a partner: plan, record, report
  { key: 'warm', kind: 'sort', level: 'support' },                 // Warm-up · Which kind of number?
  { key: 'dont', kind: 'write', level: 'challenge' },              // ★ What the numbers don't say (Part 1, while waiting)
  { key: 'survey', kind: 'write', level: 'challenge', part: 2 },   // ★ Build a survey (Part 2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'followup' };   // shown on the Part 2 task slide ("follow-up" works too)
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// ── Warm-up sort: the page shows what each statistic counts; students sort examples (two each) ──
export const SORTS = {
  warm: {
    bins: [['box', 'Box office'], ['circ', 'Circulation'], ['sales', 'Sales'], ['hits', 'Hits'], ['subs', 'Subscriptions'], ['foll', 'Followers']],
    items: [
      { id: 'w_mcmovie', label: 'Money taken by A Minecraft Movie at cinemas', bin: 'box' },
      { id: 'w_wicked', label: 'Money paid for tickets to see Wicked: For Good', bin: 'box' },
      { id: 'w_beano', label: 'Copies of the Beano sold each week', bin: 'circ' },
      { id: 'w_metro', label: 'Copies of the Metro newspaper given out each day', bin: 'circ' },
      { id: 'w_eafc', label: 'Copies of EA Sports FC 26 bought in its first week', bin: 'sales' },
      { id: 'w_mcgame', label: 'Copies of the Minecraft game bought since 2011', bin: 'sales' },
      { id: 'w_bitesize', label: 'Visits to the BBC Bitesize website', bin: 'hits' },
      { id: 'w_sport', label: 'Times a BBC Sport web page was opened', bin: 'hits' },
      { id: 'w_netflix', label: 'People paying for Netflix every month', bin: 'subs' },
      { id: 'w_beast', label: 'People signed up to the MrBeast YouTube channel', bin: 'subs' },
      { id: 'w_motd', label: 'People who follow Match of the Day on TikTok', bin: 'foll' },
      { id: 'w_lions', label: 'People who follow the Lionesses on Instagram', bin: 'foll' },
    ],
  },
};

// ── 1 · Which number? (Part 1) and 4 · Which way to ask? (Part 2) ──
// Option lengths checked: the right answer is the longest in under half the questions (checkers.test.js).
const KIND = [['box', 'A box office figure'], ['circ', 'A circulation figure'], ['subs', 'A subscriptions figure'], ['hits', 'A hits figure']];
const METHOD = [['int', 'An interview'], ['fg', 'A focus group'], ['sur', 'A survey'], ['obs', 'An observation']];
const QTYPE = [['mc', 'Multiple choice'], ['rate', 'Rating scale'], ['rank', 'Ranking'], ['open', 'Open-ended']];
export const CHOICES = {
  which: {
    stat: { q: 'What is an audience statistic?', a: 'num', opts: [
      ['num', 'A number that counts an audience'], ['rev', 'A critic\'s review of a product'],
      ['crew', 'A list of the people who made it'], ['guess', 'A guess at who a product is for']] },
    box: { q: 'A Minecraft Movie took £56.9 million at UK and Ireland cinemas in 2025. Which kind of statistic is that?', a: 'box', opts: KIND },
    circ: { q: 'TV Choice magazine sold about 850,000 copies a week in 2025. Which kind of statistic is that?', a: 'circ', opts: [
      ['circ', 'A circulation figure'], ['sales', 'A sales figure for a game'], ['foll', 'A followers figure'], ['box', 'A box office figure']] },
    subs: { q: 'MrBeast\'s YouTube channel passed 500 million subscribers in June 2026. What has each subscriber done?', a: 'sign', opts: [
      ['sign', 'Signed up to get his new videos'], ['paid', 'Paid to watch one of his videos'],
      ['visit', 'Visited his website just once'], ['ticket', 'Bought a ticket to see him live']] },
    hits: { q: 'Which statistic best shows how popular a news website is?', a: 'hits', opts: [
      ['hits', 'Hits: visits to its pages'], ['box', 'Box office: tickets sold'], ['circ', 'Circulation: copies sold'], ['sales', 'Sales: games bought']] },
    sales: { q: 'Which statistic best shows how many people bought a new video game?', a: 'sales', opts: [
      ['sales', 'Sales'], ['circ', 'Circulation'], ['box', 'Box office'], ['hits', 'Hits']] },
    foll: { q: 'Which statistic best shows how big a TikTok creator\'s audience is?', a: 'foll', opts: [
      ['foll', 'Their followers'], ['box', 'Their box office'], ['circ', 'Their circulation'], ['sales', 'Their game sales']] },
    limit: { q: 'What can\'t an audience statistic tell you on its own?', a: 'why', opts: [
      ['why', 'Why people chose the product'], ['many', 'How many people used it'],
      ['grew', 'Whether it grew since last year'], ['more', 'Which product had more people']] },
  },
  how: {
    int: { q: 'You sit with one person, ask them questions about Stranger Things and listen carefully to each answer. This is…', a: 'int', opts: METHOD },
    fg: { q: 'Six Year 9s watch the A Minecraft Movie trailer together, then talk about it while you ask them questions. This is…', a: 'fg', opts: METHOD },
    sur: { q: 'You want quick answers from 50 Year 7s that you can count and turn into a chart. Which is best?', a: 'sur', opts: METHOD },
    rate: { q: '"On a scale of 1 to 5, how much do you like Roblox?" What kind of question is this?', a: 'rate', opts: QTYPE },
    rank: { q: '"Put these in order, favourite first: YouTube, TikTok, Snapchat." What kind of question is this?', a: 'rank', opts: QTYPE },
    open: { q: '"What do you like most about Wednesday?" What kind of question is this?', a: 'open', opts: QTYPE },
    mc: { q: '"Where do you watch it most? A) On a TV  B) On a phone  C) On a laptop" What kind of question is this?', a: 'mc', opts: QTYPE },
    fol: { q: 'Your partner says: "I only watch it with my sister." Which is the best follow-up question?', a: 'why', opts: [
      ['why', 'What do you like about that?'], ['shows', 'Do you like any other TV shows?'],
      ['bed', 'What time do you go to bed?'], ['fam', 'How many people live in your house?']] },
    samp: { q: 'Your survey is about a game made for 11 to 14-year-olds. Which is the best sample?', a: 'mix', opts: [
      ['mix', '20 students from Years 7, 8 and 9'], ['mates', 'Your 3 best friends in Year 10'],
      ['bus', 'Any 20 people at the bus stop'], ['staff', 'Your teachers in the staff room']] },
  },
};

// ── 2 · Read the numbers: three real tables, then questions answered from them ──
export const NUMBERS = {
  read: {
    tables: [
      { id: 'tA', title: 'Table A: top films at UK and Ireland cinemas, 2025', sector: 'Audio/moving image · box office figures', img: 'mcmovie',
        head: ['Rank', 'Film', 'Box office'],
        rows: [['1', 'A Minecraft Movie', '£56.9m'], ['2', 'Wicked: For Good', '£47.0m'], ['5', 'Lilo and Stitch', '£37.6m'],
          ['7', 'Zootropolis 2', '£30.5m'], ['8', 'Superman', '£28.1m'], ['11', 'How to Train Your Dragon', '£23.4m']],
        source: 'BFI (British Film Institute) figures for 2025, reported by the Press Association, 5 February 2026' },
      { id: 'tB', title: 'Table B: what children aged 8 to 14 use online, 2025', sector: 'Interactive · how many use each one',
        head: ['App or website', 'Children aged 8 to 14 who use it'],
        rows: [['YouTube', '96%'], ['Google Search', '95%'], ['WhatsApp', '63%'], ['TikTok', '58%']],
        source: 'Ofcom, Online Nation 2025, 10 December 2025' },
      { id: 'tC', title: 'Table C: four products, four kinds of number', sector: 'Print and interactive · circulation, subscriptions, sales', img: 'mrbeast',
        head: ['Product', 'What is counted', 'Number'],
        rows: [['TV Choice (magazine)', 'Circulation: copies sold each week, 2025', '850,169'],
          ['The Week Junior (magazine)', 'Circulation: copies sold each week, 2025', 'just under 40,000'],
          ['MrBeast (YouTube channel)', 'Subscriptions, 12 June 2026', '500 million'],
          ['Minecraft (video game)', 'Sales: copies sold, October 2023', '300 million']],
        source: 'ABC figures for 2025, reported by Press Gazette, 20 February 2026 · YouTube, June 2026 · Mojang, October 2023' },
    ],
    qs: [
      { id: 'n_mc', q: 'Table A: how much did A Minecraft Movie take at UK and Ireland cinemas in 2025?', a: 56.9, tol: 0.05, before: '£', unit: 'million' },
      { id: 'n_gap', q: 'Table A: how much more did A Minecraft Movie take than Lilo and Stitch?', a: 19.3, tol: 0.15, before: '£', unit: 'million' },
      { id: 'n_not', q: 'What does Table A NOT tell you about these films?', a: 'age', opts: [
        ['age', 'How old the people watching were'], ['most', 'Which of these films took the most'],
        ['sup', 'How much Superman took in 2025'], ['gap', 'How far Wicked was behind Minecraft']] },
      { id: 'n_tt', q: 'Table B: out of every 100 children aged 8 to 14, about how many use TikTok?', a: 58, unit: 'children' },
      { id: 'n_class', q: 'Table B: a class has 30 children aged 8 to 14. About how many of them use WhatsApp?', a: 19, tol: 1, unit: 'children' },
      { id: 'n_ad', q: 'A new game for 8 to 14-year-olds needs a video advert. From Table B, where would it reach the most of them?', a: 'yt', opts: [
        ['yt', 'On YouTube, used by 96%'], ['tt', 'On TikTok, used by 58%'], ['wa', 'On WhatsApp, used by 63%'], ['tv', 'In TV Choice magazine']] },
      { id: 'n_times', q: 'Table C: TV Choice sells about how many times as many copies as The Week Junior?', a: 21, tol: 2, unit: 'times as many' },
      { id: 'n_beast', q: 'Table C: MrBeast passed 400 million subscribers about a year before. How many more did he gain in that year?', a: 100, unit: 'million' },
      { id: 'n_watch', q: 'What does MrBeast\'s 500 million NOT tell you?', a: 'watch', opts: [
        ['watch', 'How many watch every new video'], ['pop', 'That his channel is very popular'],
        ['subs', 'How many people subscribe to it'], ['yt', 'That the channel is on YouTube']] },
    ],
  },
};

// ── 3 · Find two statistics: live research on products from their 2.1 research log ──
const STAT_WORDS = [['box office', 'circulation', 'sales', 'hits', 'subscriptions', 'subscribers', 'followers']];
export const HUNTS = {
  find: {
    note: { prompt: 'What does this number tell you about the product\'s audience?', starter: 'This … figure shows that…', words: STAT_WORDS, minWords: 8 },
    rows: [
      { id: 'h1', label: 'Statistic 1', pick: 'Which product? (one from your research log)', q: 'The statistic: the number, and what it counts (with the date if the page gives one)', number: true },
      { id: 'h2', label: 'Statistic 2', pick: 'Which product? (a different one from your research log)', q: 'The statistic: the number, and what it counts (with the date if the page gives one)', number: true },
    ],
  },
};

export const SPOTS = {};

// ── 5 · Test the survey (Part 2): Jay tried the survey on 20 students. Three results are no use: rewrite those lines ──
// Each slip's rules say what a working rewrite needs; its `again` results show once it does.
const SCALE = '\\b(1|one)\\b[^?]*\\b(5|five|10|ten)\\b';
export const PILOTS = {
  jay: {
    by: 'Jay\'s survey plan (an imaginary Year 10 student) · Fortnite, for 12 to 16-year-olds',
    run: '▶ Test it on 20 students',
    lines: [
      { id: 'j_age', text: '1. How old are you? (12–13 / 14–15 / 16)',
        result: { title: '20 answers', bars: [['12–13', 7], ['14–15', 8], ['16', 5]] } },
      { id: 'j_best', text: '2. Don\'t you agree that Fortnite is the best game ever made?',
        result: { title: '20 answers', bars: [['Yes', 18], ['No', 2]] },
        slip: {
          prompt: 'Rewrite question 2 so it doesn\'t push people towards an answer.',
          rules: [
            { not: 'don\'?t you|do you not|wouldn\'?t you|agree', msg: 'It still asks people to agree with Jay. Ask what they think instead.' },
            { not: '\\b(best|greatest|amazing|awesome|worst)\\b', msg: '"Best" tells people what to think. Leave Jay\'s opinion out.' },
            { must: 'fortnite|\\bit\\b', msg: 'Say what the question is about: Fortnite.' },
            { must: '\\?', msg: 'A question needs a question mark.' },
          ],
          again: [
            { when: SCALE, show: { title: '20 answers: how much they like it', bars: [['1', 2], ['2', 3], ['3', 5], ['4', 6], ['5', 4]] } },
            { show: { title: 'Some of the 20 answers', quotes: ['It\'s fun with my mates but I\'m bored of it now', 'It\'s my favourite game', 'It\'s alright', 'Too many sweaty players'] } },
          ],
        } },
      { id: 'j_where', text: '3. Where do you usually play: at home, at a friend\'s house or somewhere else?',
        result: { title: '20 answers', bars: [['At home', 14], ['A friend\'s house', 4], ['Somewhere else', 2]] } },
      { id: 'j_two', text: '4. How often do you play and who do you play with?',
        result: { title: 'Some of the 20 answers', quotes: ['Every day', 'My brother', 'Loads, with my mates', 'Not much', 'Online', 'Weekends, on my own'] },
        slip: {
          prompt: 'Rewrite question 4 as two separate questions.',
          rules: [
            { must: '\\?[^?]*\\?', msg: 'Write two questions, each with its own question mark.' },
            { must: 'how often|how much|how many|when', msg: 'Keep a question about how often they play.' },
            { must: '\\bwho\\b', msg: 'Keep a question about who they play with.' },
            { not: '(how often|how much|how many|when)[^?]*\\bwho\\b|\\bwho\\b[^?]*(how often|how much|how many|when)', msg: 'Each question should ask one thing: end the "how often" question before you ask "who".' },
          ],
          again: [{ show: [
            { title: 'How often? 20 answers', bars: [['Every day', 5], ['Most days', 6], ['Weekends', 6], ['Hardly ever', 3]] },
            { title: 'Who with? 20 answers', bars: [['Friends online', 9], ['On my own', 6], ['Family', 3], ['Friends in the room', 2]] },
          ] }],
        } },
      { id: 'j_rank', text: '5. Put these in order, favourite first: Battle Royale, LEGO Fortnite, Fortnite Festival.',
        result: { title: 'Ranked first by the 20', bars: [['Battle Royale', 11], ['LEGO Fortnite', 5], ['Fortnite Festival', 4]] } },
      { id: 'j_start', text: '6. What made you start playing Fortnite?',
        result: { title: 'Some of the 20 answers', quotes: ['My cousin showed me', 'Everyone in my class was playing it', 'A streamer I watch plays it', 'It\'s free, so I just tried it'] } },
      { id: 'j_who', text: 'Who I\'ll ask for the real survey: my three best mates, because they all love Fortnite.',
        result: { title: 'Jay\'s three best mates', people: ['Leo, 15 · plays every day · loves it', 'Sam, 15 · plays every day · loves it', 'Kai, 15 · plays every day · loves it'] },
        slip: {
          prompt: 'Rewrite Jay\'s sample: who should Jay ask for the real survey?',
          rules: [
            { must: '\\b([1-9]\\d+|ten|fifteen|twenty|thirty|forty|fifty|hundred)\\s+(people|students|pupils|players|teenagers|teens|young people|kids|boys|girls|of)\\b', msg: 'Say how many people: at least 10, e.g. "20 students".' },
            { must: '\\b1[2-6]\\b|year\\s*(7|8|9|10|11)|twelve|sixteen', msg: 'Say their ages: Fortnite\'s target audience here is 12 to 16.' },
            { not: 'best mates|best friends|my mates|my friends', msg: 'Not just Jay\'s friends: they all think the same.' },
            { must: 'some|different|mix|range|both|don\'?t|do not|not all|boys and girls|girls and boys|whether', msg: 'Say how they\'ll be different from each other, e.g. some play a lot and some don\'t.' },
          ],
          again: [{ show: [
            { title: 'Who answered', bars: [['Aged 12–13', 7], ['Aged 14–15', 8], ['Aged 16', 5]] },
            { title: 'How much they play', bars: [['Every day', 6], ['Sometimes', 8], ['Not any more', 6]] },
          ] }],
        } },
    ],
  },
};

// ── Writing ──
// 6 · Interview a partner: four questions before, then what they said and what it shows (after recording).
// ★ What the numbers don't say (Part 1) · ★ Build a survey (Part 2).
export const WRITING = {
  talk: [
    { id: 't_prod', group: 'Before: plan your questions', prompt: 'Which product will your partner talk about? Pick one from your research log, and show it to them first.', short: true },
    { id: 't_use', prompt: 'Question 1: an open-ended question about how they use it.', ask: 'Where? When? Who with?', starter: 'Where do you usually…? / Who do you … with?', minWords: 5, words: [['where', 'when', 'who', 'how']] },
    { id: 't_feel', prompt: 'Question 2: an open-ended question about how it makes them feel.', starter: 'How does … make you feel?', minWords: 5, words: [['feel', 'think', 'like']], differentFrom: 't_use' },
    { id: 't_rate', prompt: 'Question 3: a rating-scale question.', starter: 'On a scale of 1 to 5, how much…', minWords: 6, words: [['scale', 'rate']] },
    { id: 't_more', prompt: 'Question 4: a follow-up question you could ask after any answer.', starter: 'Why do you say that? / Can you tell me more about…?', minWords: 4, words: [['why', 'more', 'example']] },
    { id: 't_said', group: 'After: what did they say?', prompt: 'Write down the two most interesting things your partner said.', starter: 'In the interview, my partner said…', minWords: 14, words: [['interview']] },
    { id: 't_shows', prompt: 'What does their answer tell you about the product\'s audience?', starter: 'This suggests that the audience…', minWords: 10, words: [['audience']] },
    { id: 't_next', prompt: 'Next time you want answers from 30 people. Which way of asking would you use, and who would be in your sample?', starter: 'I would use a … because… My sample would be…', minWords: 14, words: [['survey', 'focus group'], ['sample']] },
  ],
  dont: [
    { id: 'd_tells', prompt: 'What does A Minecraft Movie\'s box office figure tell you about its audience?',
      ask: 'How big is the audience? A cinema ticket costs about £8, so £56.9 million is about 7 million tickets. It\'s rated PG and based on a game: who might go to see it together?',
      starter: 'Its box office figure of £56.9 million shows that about … people…, so its audience is…', minWords: 14, words: [['box office'], ['million']] },
    { id: 'd_not', prompt: 'What doesn\'t it tell you?', ask: 'Does £56.9 million tell you their age? Boys or girls? Why they went, or if they enjoyed it?', starter: 'It doesn\'t tell you…', minWords: 8, words: [['age', 'gender', 'socio-economic', 'why', 'enjoy']] },
    { id: 'd_more', prompt: 'Which other statistic or research would help you find out who watched it? Where could you look?',
      ask: 'Think of the Ofcom table in Task 2, or asking people yourself, as you will in Part 2.', starter: 'I could look for… on…', minWords: 10,
      words: [['followers', 'subscriptions', 'subscribers', 'sales', 'hits', 'survey', 'interview', 'Ofcom', 'BFI']] },
  ],
  survey: [
    { id: 's_prod', group: 'Your survey', prompt: 'Which product is your survey about, and who is it for?', starter: 'My survey is about … for…', minWords: 6 },
    { id: 's_mc', prompt: 'A multiple-choice question (with its answers).', starter: 'Which … do you …? A) …  B) …  C) …', minWords: 6 },
    { id: 's_rate', prompt: 'A rating-scale question.', starter: 'On a scale of 1 to 5…', minWords: 6, words: [['scale', 'rate']] },
    { id: 's_rank', prompt: 'A ranking question.', starter: 'Put these in order, favourite first: …', minWords: 6, words: [['order', 'rank']] },
    { id: 's_open', prompt: 'An open-ended question.', starter: 'Why do you…? / What do you think about…?', minWords: 5, words: [['why', 'how', 'what']] },
    { id: 's_sample', group: 'Your sample', prompt: 'Who will answer it? Say how many people, and how you\'ll make sure they are different from each other.', starter: 'My sample will be…', minWords: 12, words: [['sample']] },
  ],
};

export const REVEALS = {};
export const SPECTRUMS = {};
export const PROFILES = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
export const GLOSSARY = [
  // Lesson terms
  ['audience statistics?', 'A number that counts a product\'s audience, like tickets sold or followers'],
  ['statistics?', 'A fact given as a number, such as 58% or £56.9 million'],
  ['box office', 'The money a film makes from cinema tickets'],
  ['circulation', 'How many copies of a newspaper or magazine are sold or given out'],
  ['hits', 'How many times a website or web page is visited'],
  ['subscriptions?', 'Signing up to get something regularly, like Netflix or a YouTube channel'],
  ['subscribers?|subscribe', 'People signed up to get something regularly, like a YouTube channel'],
  ['followers', 'People who follow an account on social media to see its posts'],
  ['interviews?', 'Asking one person questions and listening to their answers in detail'],
  ['focus group', 'A small group who try a product, then discuss it while you ask questions'],
  ['surveys?', 'The same set of questions asked to lots of people, so the answers can be counted'],
  ['observation', 'Watching what people do, without asking them questions'],
  ['multiple.choice', 'A question with a few answers to pick from'],
  ['rating.scale', 'A question answered with a number on a scale, like 1 (not at all) to 5 (a lot)'],
  ['ranking', 'A question where people put things in order, favourite first'],
  ['open-ended', 'A question people answer in their own words, like "Why…?"'],
  ['follow-up', 'A question that asks for more about the answer someone just gave'],
  ['sample', 'The people you choose to answer your survey or interview'],
  ['research log', 'Your record of what you found, where you found it and when'],
  // Everyday-but-tricky words
  ['BFI', 'The British Film Institute: it collects the UK\'s official film figures'],
  ['Ofcom', 'The UK body that checks TV, radio and the internet, and researches who uses them'],
  ['ABC', 'Audit Bureau of Circulations: it checks how many copies magazines really sell'],
  ['Press Gazette', 'A news website about newspapers, magazines and journalism'],
  ['Press Association', 'A news agency: it sends news stories to newspapers and websites'],
  ['per cent', 'Out of every 100: 58% means 58 in every 100'],
  ['copies', 'Single printed issues (or bought downloads) of a product'],
  ['sector', 'A part of the media: audio/moving image, print or interactive'],
  ['creator', 'Someone who makes and posts their own videos or posts online'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking ─────────────────────────────────────────────────────────────────
// Each returns { questionId: true/false } so the page can colour every question.
export function markReveal(taskKey, given) {
  return Object.fromEntries(REVEALS[taskKey].rounds.map(r => [r.id, given[r.id] === r.a]));
}
// Stars for solving a round after seeing `shown` clues: 3 on the first clue, 2 on the second, then 1.
export const starsFor = shown => Math.max(1, 4 - shown);

export function markSpotFlags(taskKey, given) {
  return Object.fromEntries(SPOTS[taskKey].parts.map(p => [p.id, !!given[p.id] === !!p.fix]));
}
export function markSpot(taskKey, given) {
  const res = markSpotFlags(taskKey, given);
  for (const p of SPOTS[taskKey].parts) if (p.fix) res[p.id + '_fix'] = given[p.id + '_fix'] === p.fix.a;
  return res;
}

export function markChoices(taskKey, given) {
  return Object.fromEntries(Object.entries(CHOICES[taskKey]).map(([id, c]) => [id, given[id] === c.a]));
}

export function markSort(taskKey, given) {
  return Object.fromEntries(SORTS[taskKey].items.map(it => [it.id, given[it.id] === it.bin]));
}

export function markWriting(taskKey, given) {
  return Object.fromEntries(WRITING[taskKey].map(w => [w.id, markWriteQ(w, given)]));
}
// One writing question: a real sentence (or name), not a copy of another answer, with a word from each bank.
export function markWriteQ(w, given) {
  const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords);
  const differs = !w.differentFrom || squash(given[w.id]) !== squash(given[w.differentFrom]);
  const worded = (w.words || []).every(bank => bank.some(x => usesWord(given[w.id], x)));
  return real && differs && worded;
}
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function markSpectrum(taskKey, given) {
  const sp = SPECTRUMS[taskKey];
  const res = Object.fromEntries(sp.items.map(it => [it.id, it.ok.includes(given[it.id])]));
  for (const w of sp.why || []) res[w.id] = markWriteQ(w, given);
  return res;
}

export function markPilotFlags(taskKey, given) {
  return Object.fromEntries(PILOTS[taskKey].lines.map(l => [l.id, !!given[l.id] === !!l.slip]));
}
export function markPilot(taskKey, given) {
  const res = markPilotFlags(taskKey, given);
  for (const l of PILOTS[taskKey].lines) if (l.slip) res[l.id + '_re'] = !pilotProblem(l, given[l.id + '_re'] ?? l.text);
  return res;
}
// What's still wrong with a rewritten line ('' when it works).
export function pilotProblem(line, text) {
  const t = String(text ?? '');
  if (squash(t) === squash(line.text)) return 'This is still the original: change it.';
  if (!isRealSentence(t, 4)) return 'Write it out in full.';
  for (const r of line.slip.rules) {
    const hit = new RegExp(r.must ?? r.not, 'i').test(t);
    if (r.must ? !hit : hit) return r.msg;
  }
  return '';
}
// The new results a working rewrite gets when it runs again.
export function pilotAgain(line, text) {
  const a = line.slip.again.find(x => !x.when || new RegExp(x.when, 'i').test(String(text ?? '')));
  return a ? [].concat(a.show) : [];
}

export function markNumbers(taskKey, given) {
  return Object.fromEntries(NUMBERS[taskKey].qs.map(q => [q.id, q.opts ? given[q.id] === q.a
    : Math.abs(parseNumber(given[q.id]) - q.a) <= (q.tol || 0)]));
}
// The first number in what was typed, ignoring £, %, spaces and thousands commas ("£56.9m" → 56.9); NaN if none.
export function parseNumber(text) {
  const m = String(text ?? '').replace(/(\d),(?=\d{3}\b)/g, '$1').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}

export function markProfile(taskKey, given) {
  const pr = PROFILES[taskKey], res = {};
  for (const c of pr.cards) for (const f of c.fields) res[f.id] = f.ok.includes(given[f.id]);
  for (const w of pr.why || []) res[w.id] = markWriteQ(w, given);
  return res;
}

export function markHunt(taskKey, given) {
  const hunt = HUNTS[taskKey], res = {}, seen = new Set();
  for (const r of hunt.rows) {
    const g = f => given[`${r.id}_${f}`], note = r.note || hunt.note;
    if (r.pick) res[r.id + '_prod'] = isRealName(g('prod'));
    res[r.id + '_fact'] = r.accept ? factMatches(g('fact'), r.accept)
      : isRealSentence(g('fact'), r.minWords || 5) && (!r.number || /\d/.test(g('fact') || ''));
    if (!r.primary) {
      const u = linkKey(g('url'));
      res[r.id + '_url'] = isRealUrl(g('url')) && !seen.has(u);
      seen.add(u);
    }
    res[r.id + '_who'] = isRealName(g('who'));
    if (note) {
      const words = (r.primary && note.primaryWords) || note.words || [];
      res[r.id + '_note'] = isRealSentence(g('note'), note.minWords || 8) && words.every(bank => bank.some(x => usesWord(g('note'), x)));
    }
  }
  return res;
}

// The answers that are writing, links or names: they go red when missing but never cost gold or time.
export function softIds(task) {
  if (task.kind === 'spectrum') return new Set((SPECTRUMS[task.key].why || []).map(w => w.id));
  if (task.kind === 'profile') return new Set((PROFILES[task.key].why || []).map(w => w.id));
  if (task.kind === 'hunt') return new Set(HUNTS[task.key].rows.flatMap(r =>
    ['_prod', '_url', '_who', '_note', ...(r.accept ? [] : ['_fact'])].map(f => r.id + f)));
  return new Set();
}

// A fact matches if any accepted answer appears in it, ignoring case, spaces and punctuation ("Hawkins, Indiana").
export function factMatches(text, accept) {
  const t = squash(text);
  return !!t && accept.some(a => t.includes(squash(a)));
}

// A real web address copied from the address bar: no spaces, a proper domain, and not a search results page.
export function isRealUrl(text) {
  const u = parseUrl(text);
  return !!u && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(u.hostname) && !isSearchLink(text);
}
// A Google, Bing, DuckDuckGo or Yahoo results page: the search, not the source.
export function isSearchLink(text) {
  const u = parseUrl(text);
  return !!u && /(^|\.)(google|bing|duckduckgo|yahoo|ecosia)\./i.test(u.hostname) && (/^\/search/i.test(u.pathname) || u.searchParams.has('q'));
}
function parseUrl(text) {
  const t = String(text || '').trim();
  if (!t || /\s/.test(t)) return null;
  try { return new URL(/^https?:\/\//i.test(t) ? t : 'https://' + t); } catch { return null; }
}
// Two links are the same page if they match without http(s)://, www. and a trailing slash.
const linkKey = t => String(t || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

// Does the text use this word or phrase in any form? Each word of 3+ letters must appear as the start
// of a word ("generating a profit" uses "generate profit"; "accessibility" uses "accessible").
export function usesWord(text, phrase) {
  const words = String(text || '').toLowerCase().split(/[^a-z]+/);
  return phrase.toLowerCase().split(/[^a-z]+/).filter(x => x.length >= 3)
    .every(x => words.some(w => w.startsWith(x.slice(0, Math.max(4, Math.min(x.length - 3, 5))))));
}

// A name such as "EA FC 25" or "Metro": at least two letters, not one key held down.
export function isRealName(text) {
  const t = String(text || '').trim();
  return (t.match(/[a-z]/gi) || []).length >= 2 && new Set(t.toLowerCase().replace(/\s/g, '')).size >= 2;
}

export function allCorrect(result) {
  const v = Object.values(result);
  return v.length > 0 && v.every(Boolean);
}

// A real answer, not "asdf asdf asdf": enough words, mostly different, mostly made of letters.
export function isRealSentence(text, minWords = 4) {
  const words = String(text || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
  if (words.length < minWords) return false;
  if (new Set(words).size < Math.ceil(words.length * 0.6)) return false;
  if (words.some(w => w.length > 25)) return false;
  return words.filter(w => /[aeiouy]/.test(w)).length >= Math.ceil(words.length * 0.8);
}

// A wrong check costs 10 s, every time: enough to stop guessing, not so long it punishes (Nick, 2026-11-12).
export function cooldownSeconds() {
  return 10;
}

// House scoring: 80 for finishing every task, 20 more for getting them right first time.
export function calcScore(completed, firstAttempt) {
  const idx = coreTasks(), n = idx.length;
  const done = idx.filter(i => completed[i]).length;
  const mastered = idx.filter(i => completed[i] && firstAttempt[i]).length;
  return Math.round(done / n * 80 + mastered / n * 20);
}

// Optional tasks (level: 'support' or 'challenge') never count towards the score, gold or "all done",
// so nobody loses marks for skipping a Warm-up or a Challenge. They still send their evidence.
const coreTasks = () => TASKS.map((t, i) => (t.level ? -1 : i)).filter(i => i >= 0);
export const coreDone = completed => coreTasks().every(i => completed[i]);
export const coreGold = firstAttempt => coreTasks().every(i => firstAttempt[i]);

// ── Per-student order (seeded, so neighbours see different orders) ──────────
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed).toUpperCase()) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (!s) s = 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
