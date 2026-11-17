// checkers.js for Lesson 3.1 Where, When, Who With (Y10 BTEC Component 1, spec A1: situation and audience involvement).
// Built from _templates/BTEC_Y10_checkers.js. Pure functions and data only (no DOM), so
// checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. kind: 'choice' (radio questions), 'sort' (cards into bins),
// 'write' (open writing: completion only, never auto-marked, always gold), 'reveal' (clue-by-clue
// rounds), 'spot' (find and fix the slips in a paragraph), 'fix' (the harder spot: change any line to the
// right version), 'spectrum' (cards placed on a line between
// two ends), 'hunt' (live research: find a fact, paste its link), 'profile' (an audience profile card) or
// 'numbers' (questions answered from a real table of statistics). Vary them: no lesson should run the
// same kind in two tabs in a row (Y10/CLAUDE.md).
// Optional extra tabs take level: 'support' (a Warm-up for students who need a way in) or
// 'challenge' (an extension). They don't count towards the score; put them at the END of this
// list so the core tasks keep indexes 0, 1, 2…, and give their tabs class="tab support|challenge".
export const TASKS = [
  { key: 'same', kind: 'choice' },                                // 1 · Same product, new situation: where, when, who with
  { key: 'diary', kind: 'write' },                                // 2 · My media diary: three products from yesterday and their situations
  { key: 'kinds', kind: 'sort', part: 2 },                        // 3 · Which kind of involvement? Interactive features, online voting, consumer-generated content
  { key: 'line', kind: 'spectrum', part: 2 },                     // 4 · Passive or active? Real products on a line
  { key: 'compare', kind: 'write', part: 2 },                     // 5 · Compare diaries: situation and involvement, mine vs my partner's
  { key: 'warm', kind: 'sort', level: 'support' },                // Warm-up · Where, when or who with?
  { key: 'then', kind: 'write', level: 'challenge' },             // ★ Then and now: Walkman, Game Boy (Part 1, while waiting)
  { key: 'slip', kind: 'spot', level: 'challenge', part: 2 },     // ★ Spot the slip: Sam's Strictly notes (Part 2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'involved' };
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


// ── Multiple choice: { taskKey: { questionId: { q, a, opts: [[key, text], …], img?, alt?, credit? } } } ──
// img = a key in the page's IMG-DATA block: the question shows that picture beside it (alt = its description,
// credit = its source, shown under it). Use it when each question is about a different real product.
// Keep the options a similar length: the right answer must not be the longest.
export const CHOICES = {
  same: {
    s_kart: { img: 'mariokart', alt: 'Mario Kart World cover art', credit: 'Mario Kart World (2025) · Nintendo',
      q: 'Alfie plays Mario Kart World on his Switch 2 on the bus to school. At the weekend he plays it docked to the TV with three mates. What changes between the two?',
      a: 'wh', opts: [['wh', 'Where he plays, and who with'], ['ver', 'Which version of the game it is'], ['mak', 'Who made the game he plays']] },
    s_live: { img: 'traitors', alt: 'The Traitors: host Claudia Winkleman at the round table', credit: 'The Traitors · BBC One',
      q: 'Priya watches The Traitors live on BBC One on Wednesday night. Her brother watches the same episode on iPlayer the next day. Which part of the situation is different?',
      a: 'when', opts: [['when', 'When they watch it'], ['chan', 'Which channel made it'], ['what', 'What the show is about']] },
    s_spoil: { q: 'Why might watching The Traitors live be more fun than catching up the next day?',
      a: 'talk', opts: [['talk', 'You can talk about it at school without spoilers'], ['hd', 'The picture is much sharper when it is shown live'], ['long', 'The episodes are longer when shown live']] },
    s_crowd: { img: 'sidemen', alt: 'The Sidemen on the pitch at Wembley Stadium', credit: 'Sidemen Charity Match · Sidemen / Wembley Stadium',
      q: 'Some fans watched the Sidemen Charity Match in the crowd at Wembley. Millions more watched it on YouTube at home. What does the crowd get that the people at home don\'t?',
      a: 'noise', opts: [['noise', 'The noise and buzz of 90,000 other fans'], ['score', 'A different final score from the YouTube one'], ['free', 'Free tickets, because it\'s for charity']] },
    s_alone: { img: 'spotify', alt: 'The Spotify app playing a song on a phone', credit: 'Spotify · Spotify',
      q: 'Leah listens to Spotify on headphones on her walk to school. Which words best describe who she\'s with?',
      a: 'own', opts: [['own', 'On her own'], ['crowd', 'In a big crowd'], ['fam', 'With her family']] },
    s_xmas: { img: 'wallace', alt: 'Wallace & Gromit: Vengeance Most Fowl poster', credit: 'Wallace & Gromit: Vengeance Most Fowl (2024) · Aardman / BBC',
      q: 'Wallace & Gromit: Vengeance Most Fowl was first shown on BBC One on Christmas Day 2024. Why does the BBC put films like this on Christmas Day?',
      a: 'fam', opts: [['fam', 'Lots of families watch TV together that day'], ['few', 'Fewer people have a TV on at Christmas'], ['cheap', 'Films cost less to show on a bank holiday']] },
    s_mean: { q: 'In media, what does a product\'s situation mean?',
      a: 'www', opts: [['www', 'Where, when and who with it is used'], ['cost', 'How much it costs to buy or watch'], ['kind', 'What kind of product it is, like a game']] },
  },
};

// ── Sorts: { taskKey: { bins: [[key, label], …], items: [{ id, label, bin, img?, credit?, note? }] } } ──
// img = a key in the page's IMG-DATA block; credit = its source (shown under the bins);
// note = shown on the card once the task is done (e.g. the year it came out).
export const SORTS = {
  // Warm-up: situation details, two per box; the definitions are open above it.
  warm: {
    bins: [['where', 'Where'], ['when', 'When'], ['who', 'Who with']],
    items: [
      { id: 'w_bus', label: 'Playing Mario Kart World on the bus to school', bin: 'where' },
      { id: 'w_wembley', label: 'Watching the Sidemen Charity Match in Wembley Stadium', bin: 'where' },
      { id: 'w_live', label: 'Watching The Traitors live, the moment it starts on BBC One', bin: 'when' },
      { id: 'w_xmas', label: 'Watching Wallace & Gromit on Christmas Day', bin: 'when' },
      { id: 'w_party', label: 'Watching Eurovision at a party with your friends', bin: 'who' },
      { id: 'w_alone', label: 'Listening to Spotify all on your own', bin: 'who' },
    ],
  },
  // Task 3: three kinds of audience involvement, three cards each.
  kinds: {
    bins: [['feat', 'Interactive features'], ['vote', 'Online voting'], ['cgc', 'Consumer-generated content']],
    items: [
      { id: 'k_streak', label: 'Duolingo\'s streak counter, which goes up every day you do a lesson', bin: 'feat' },
      { id: 'k_wrapped', label: 'Spotify Wrapped: your own year in music, made from what you played', bin: 'feat' },
      { id: 'k_kart', label: 'Choosing your character, kart and track in Mario Kart World', bin: 'feat' },
      { id: 'k_strictly', label: 'Voting for your favourite couple on the Strictly Come Dancing app', bin: 'vote' },
      { id: 'k_euro', label: 'Voting for a country\'s song in Eurovision on the official app', bin: 'vote' },
      { id: 'k_poll', label: 'Voting in a YouTube channel\'s poll on what its next video should be', bin: 'vote' },
      { id: 'k_maker', label: 'Building your own Super Mario Maker 2 level and sharing it online', bin: 'cgc' },
      { id: 'k_bluepeter', label: 'Sending in a drawing that Blue Peter shows on the programme', bin: 'cgc' },
      { id: 'k_tiktok', label: 'Making your own TikTok video using a song from TikTok\'s sound library', bin: 'cgc' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
// short = a one-line name (a product, a caption), checked only for being a real name.
// differentFrom = another answer's id that this one must not repeat.
// Structure for longer writing (Nick, 2026-11-06): group = a heading before the question (e.g. a sector);
// tone = 'pur' | 'mot' | 'aim' colours the box like the decks; ask = the question to ask yourself;
// words = [[word, …], …] word banks shown under the starter: the answer must use one word from each bank.
const INVOLVEMENT = ['interactive features', 'online voting', 'voting', 'consumer-generated content', 'involvement'];
export const WRITING = {
  // Task 2: three diary entries, one per kind of use (they become the products students compare in Task 5).
  diary: [
    ...[['e1', 'Something you watched', 'a show, film or YouTube video'],
      ['e2', 'Something you listened to', 'music, radio or a podcast'],
      ['e3', 'Something you played or scrolled', 'a game, app or website']].flatMap(([e, group, eg], n, all) => {
      const prev = n ? all[n - 1][0] : null;
      return [
        { id: `${e}_prod`, group, prompt: `The product (${eg})`, short: true, ...(prev ? { differentFrom: `${prev}_prod` } : {}) },
        { id: `${e}_sit`, prompt: 'Its situation', ask: 'Where were you, when was it, and who were you with?',
          starter: 'I … it at/on … at about … , with … .', minWords: 10, ...(prev ? { differentFrom: `${prev}_sit` } : {}) },
        { id: `${e}_else`, prompt: 'What else were you doing at the same time?', starter: 'I was also …', minWords: 4 },
      ];
    }),
  ],
  // ★ Part 1 challenge: products that changed situations for everyone (students waiting for Part 2).
  then: [
    { id: 'ch_walk', prompt: 'Before the Sony Walkman (1979), most people played music at home on a record player or radio. How did the Walkman change where people listened, and who with? Compare it with Spotify today.',
      starter: 'Before the Walkman, … After it, … Today, Spotify …', minWords: 25 },
    { id: 'ch_gb', prompt: 'Before the Game Boy (1989), most video games were played at home on a TV or in an arcade. How did the Game Boy change the situation? Compare it with Mario Kart World on a Switch 2.',
      starter: 'Before the Game Boy, … The Game Boy meant … Now, a Switch 2 …', minWords: 25 },
    { id: 'ch_best', prompt: 'Which situation gets the most out of The Traitors: watching it live with your family, or on your own on iPlayer the next day? Give a reason for each, then decide.',
      starter: 'Live with family is better because … On your own the next day is better because … I think …', minWords: 25 },
  ],
  // Task 5: one product from each diary, then the difference; spec words in each bank.
  compare: [
    ...[['me', 'A product from your diary'], ['pa', 'A product from your partner\'s diary']].flatMap(([w, group], n) => {
      const diff = f => (n ? { differentFrom: `me_${f}` } : {});
      return [
        { id: `${w}_prod`, group, prompt: 'The product', short: true, ...diff('prod') },
        // Situation split into its three parts, then how it affected the product (Nick, 2026-11-17: one
        // fixed sentence frame was too restrictive and hid that it is where, when, who with and the effect).
        { id: `${w}_where`, prompt: 'Where?', ask: 'e.g. on the bus, in my bedroom, at a mate\'s house', short: true },
        { id: `${w}_when`, prompt: 'When?', ask: 'e.g. Saturday night, live, before school, on Christmas Day', short: true },
        { id: `${w}_who`, prompt: 'Who with?', ask: 'e.g. on my own, my family, online with friends', short: true },
        { id: `${w}_sit`, prompt: 'How did the situation affect it?', ask: 'Pick where, when or who with. What did it change: how it was used, how much attention it got, or what was fun about it?',
          starter: 'Because … , … . This situation meant …', minWords: 12, words: [['situation']], ...diff('sit') },
        { id: `${w}_inv`, prompt: 'Its audience involvement', ask: 'Passive or active? Any interactive features, voting or consumer-generated content?',
          starter: '… was a … audience because …', minWords: 15, words: [['passive', 'active'], INVOLVEMENT], ...diff('inv') },
      ];
    }),
    { id: 'cmp_diff', group: 'Compare', prompt: 'The biggest difference between the two', ask: 'Think about situation and involvement.',
      starter: 'The biggest difference is that … , whereas …', minWords: 15, words: [['situation', 'passive', 'active', 'involvement']] },
  ],
};

// ── Reveals (kind 'reveal'): clue-by-clue rounds, one at a time, no Check button ──
// { taskKey: { prompt, opts: [[key, text], …], rounds: [{ id, clues: [3+, vaguest first], a, label, img?, credit?, note? }] } }
// showFirst: true shows each round's img and label from the start, and {who} in the prompt becomes the round's who.
// Use it when the thing is easy to name and the task is to classify it ("What type of producer is {who}?"):
// clues should then be facts that decide the answer, so students make one leap, not two (Nick, 2026-11-06).
// Students guess after any clue: earlier = more stars (starsFor); a wrong guess shows the next clue, costs
// gold and starts the cooldown. Solved rounds become "case files" showing img, label, answer and note.
// Markup: <div class="reveal-game" data-reveal="t3"></div>, a feedback div and a reset button, but no check-N button.
// Use for: identifying from evidence (producer type, genre from the first shot, audience from clues).
export const REVEALS = {};

// ── Spot the slip (kind 'spot'): a paragraph with planted mistakes ──
// { taskKey: { by, parts: [{ id, text, fix?: { a, opts: [[key, text], …] } }] } }; parts with a fix are the slips.
// Stage 1: click every wrong sentence and nothing else, then Check. A wrong check marks only the flagged
// sentences (green = a slip, red = fine) and says how many slips are still hiding. Stage 2: the fixes appear as radio questions.
// Say on the page who "wrote" it (an imaginary student) and keep each fix's options a similar length.
// Markup: <div class="spot" data-spot="t4"></div> with the usual check, reset and feedback.
// lines: true puts each sentence on its own line (a research log, a list of survey questions).
// Use for: the common slips (profit as a purpose, wrong producer type, leading survey questions, weak evidence).
export const SPOTS = {
  // ★ Part 2 challenge: an imaginary student's notes on Strictly with three term slips.
  slip: {
    by: 'Sam, Year 10 · Notes on Strictly Come Dancing\'s audience',
    lines: true,
    parts: [
      { id: 'p1', text: 'Strictly Come Dancing is shown live on BBC One on Saturday nights in the autumn.' },
      { id: 'p2', text: 'Lots of families watch it together on the sofa, so its situation is very social.' },
      { id: 'p3', text: 'Viewers who vote for their favourite couple on the Strictly app are a passive audience.', fix: { a: 'act', opts: [
        ['act', 'Viewers who vote are an active audience, because they take part'],
        ['pas', 'Viewers who vote are passive, because they only press one button'],
        ['jud', 'Viewers who vote aren\'t an audience at all: they are the judges']] } },
      { id: 'p4', text: 'The app vote is an example of consumer-generated content.', fix: { a: 'vote', opts: [
        ['vote', 'The app vote is online voting: the votes decide who stays'],
        ['pas', 'The app vote is a passive audience: nobody has to watch'],
        ['sit', 'The app vote is a situation: it says where people watch']] } },
      { id: 'p5', text: 'Someone who catches up on iPlayer the next day has missed the vote, so the situation changes how involved they can be.' },
      { id: 'p6', text: 'Fans who post their own videos copying the dance routines on TikTok are making interactive features.', fix: { a: 'cgc', opts: [
        ['cgc', 'Fans\' own dance videos on TikTok are consumer-generated content'],
        ['vote', 'Fans\' own dance videos on TikTok are a kind of online voting'],
        ['pas', 'Fans\' own dance videos on TikTok make them a passive audience']] } },
      { id: 'p7', text: 'Someone half-watching while scrolling on their phone is a more passive audience.' },
    ],
  },
};

// ── Fix the slip (kind 'fix'): the harder spot the slip; swap each wrong line for the right version ──
// { taskKey: { by, lines: [{ id, text, a, opts: [[key, whole replacement line], …] }] } }
// a = the key of the right version, or 'keep' when the line is already right. Every line has exactly three
// opts, each the WHOLE line rewritten, so opening a line never shows whether it is a slip: on a slip one opt
// is the fix and two add other mistakes; on a right line all three add a mistake. The page adds "Keep it as
// it is" and highlights the words each version changes. Students click a line, pick a version (it replaces
// the line at once), then Check. Only changed lines are marked: a right change locks green; a wrong one goes
// red with the reason ("This line was right. Put it back." or "Right line, wrong fix."), and the message says
// how many slips are still hiding. A wrong check costs the cooldown. Make each wrong version a slip students
// really make, and keep a line's four versions a similar length. Always one sentence per line.
// Markup: <div class="fix" data-fix="t9"></div> with the usual check, reset and feedback.
// Use for: a later lesson that comes back to an idea first met in a 'spot' task (both kinds stay available).
// fixDataProblems(FIXES.t9.lines) in checkers.test.js catches a line without three opts or with a bad answer key.
export const FIXES = {};

// ── Spectrum (kind 'spectrum'): place cards on a line between two ends ──
// { taskKey: { ends: [left, right], zones: [[key, label], …], items: [{ id, label, ok: [zoneKey, …], note? }], why?: [writing] } }
// Zones run left to right. A clear case accepts the one or two zones at its end; a middle case accepts a wider
// range (that's what makes it a spectrum, not a sort). why = writing questions (as in WRITING, usually with word
// banks) shown under the line: students justify their placements. A wrong place costs gold and starts the
// cooldown; a why box that isn't a real sentence goes red but is never penalised. note shows on the card once done.
// Markup: <div class="sort spectrum" data-spectrum="t5"><div class="tray"></div><div class="bins"></div></div>,
// with the usual check, reset and feedback. Clicks, keys 1–9 and drags work as in a sort.
// Use for: reliable ↔ unreliable sources, passive ↔ active audiences, preferred ↔ oppositional readings.
export const SPECTRUMS = {
  line: {
    ends: ['Passive', 'Active'],
    zones: [['z1', 'Very passive'], ['z2', 'Mostly passive'], ['z3', 'In between'], ['z4', 'Mostly active'], ['z5', 'Very active']],
    items: [
      { id: 'l_homework', label: 'Spotify playing in the background while you do your homework', ok: ['z1', 'z2'],
        note: 'On, but not really listened to' },
      { id: 'l_scroll', label: 'Scrolling past TikToks without liking, commenting or following', ok: ['z1', 'z2'],
        note: 'Taking it in, giving nothing back' },
      { id: 'l_xmas', label: 'Wallace & Gromit on TV after Christmas dinner, half asleep on the sofa', ok: ['z1', 'z2'],
        note: 'The situation makes it passive' },
      { id: 'l_traitors', label: 'Watching The Traitors live with your family, shouting who you think the traitor is', ok: ['z3', 'z4'],
        note: 'Talking and guessing: more active' },
      { id: 'l_chat', label: 'Watching the Sidemen Charity Match on YouTube and typing in the live chat', ok: ['z3', 'z4'],
        note: 'Chatting while watching' },
      { id: 'l_strictly', label: 'Voting for your favourite couple on the Strictly app', ok: ['z4', 'z5'],
        note: 'Online voting changes the show' },
      { id: 'l_millionaire', label: 'Who Wants to Be a Millionaire (1998): the studio audience press buttons to "Ask the Audience"', ok: ['z4', 'z5'],
        note: 'Their vote helps the contestant' },
      { id: 'l_maker', label: 'Building your own Super Mario Maker 2 level and sharing it online', ok: ['z5'],
        note: 'Making content for others to play' },
    ],
    why: [
      { id: 'why_pas', prompt: 'The card you put nearest "Passive": why is that audience passive?',
        starter: 'The audience is passive because …', minWords: 10, words: [['passive']] },
      { id: 'why_act', prompt: 'The card you put nearest "Active": what makes that audience active? Name the kind of involvement.',
        starter: 'The audience is active because … This is …', minWords: 10, words: [['active'], ['interactive features', 'voting', 'consumer-generated content']] },
    ],
  },
};

// ── Hunt (kind 'hunt'): a live research mission; each row becomes a research-log entry and a reference ──
// { taskKey: { note?: { prompt, starter, words, minWords, primaryPrompt?, primaryStarter?, primaryWords? },
//   rows: [{ id, label, sector?, img?, credit?, q, accept?: [answer, …], primary?: true, pick?: 'label', note? }] } }
// For each row students write the fact (q), paste the link to the page it came from, say who made that page,
// and write the note (why the source can be trusted). accept = accepted answers (a match anywhere, ignoring case,
// spaces and punctuation): a wrong fact costs gold and starts the cooldown. Without accept the fact must be a
// real sentence. primary: a primary-research row (what a person said; no link; uses the primary… note fields).
// pick: the student chooses the product, and pick is the label of that box. number: true = the fact must
// contain a number (a statistic), checked softly like any fact without accept. Links must be real web addresses,
// different on each row, and not a search results page. Done hunts show a reference list; the task can be saved
// again, and Try for Gold clears only the checked facts.
// Markup: <div class="hunt" data-hunt="t6"></div> with the usual check, reset and feedback.
export const HUNTS = {};

// ── Profile (kind 'profile'): build an audience profile card for a real product, field by field ──
// { taskKey: { cards: [{ id, label, sector?, img?, credit?, evidence: [fact, …],
//   fields: [{ id, group?, label, ask?, opts: [[key, text], …], ok: [key, …] }] }], why?: [writing] } }
// The evidence file (facts about the product and its audience) is what students reason from, so every
// accepted answer must follow from it. group = a heading before the field ('Primary audience', 'Secondary
// audience', 'Lifestyle'); ok = the accepted options (more than one where the evidence allows it).
// Lifestyle fields work best with distractors from the wrong field (an attitude offered as an interest), so
// students have to know what each term means, not just what fits the product. A wrong field costs gold and
// starts the cooldown; why boxes (as in a spectrum) are soft. Markup: <div class="profile" data-profile="t7"></div>
// with the usual check, reset and feedback. Use for: audience profiles (2.2), and any "fill in the card" analysis.
export const PROFILES = {};

// ── Numbers (kind 'numbers'): real tables of audience statistics, then questions answered from them ──
// { taskKey: { tables: [{ id, title, sector?, img?, head: [col, …], rows: [[cell, …], …], source }],
//   qs: [{ id, q, a: number, tol?: number, before?: '£', unit?: 'million' } | { id, q, a: key, opts: [[key, text], …] }] } }
// A number question takes what the student types ("56.9", "£56.9m", "1,200") and accepts it within tol of a
// (default 0: exact). opts makes it a radio question instead (what the table does and doesn't tell you).
// Columns whose cells are all numbers are right-aligned. Every table needs its real source (who, report, date).
// A wrong answer costs gold and starts the cooldown. Markup: <div class="numbers" data-numbers="t8"></div> with the
// usual check, reset and feedback. Use for: box office, circulation, subscribers, survey results (2.3, 7.3).
export const NUMBERS = {};

// ── Test a survey (kind 'pilot'): run an imaginary student's survey, spot the useless results, rewrite them ──
// { taskKey: { by, run: button label, lines: [{ id, text, result, slip?: { prompt, rules: [{ must | not: regex, msg }],
//   again: [{ when?: regex, show }] } }] } }
// result / show = { title?, bars: [[label, count], …] } | { title?, quotes: [text, …] } | { title?, people: [text, …] },
// or a list of them. Stage 1: Run (free) shows each line's results; the student clicks the ones that are no use to
// the researcher (a wrong check costs time; only flagged cards go green or red). Stage 2: each slip is rewritten in a
// box that starts as the original line. Rules are tested in order (ignoring case) and the first one broken shows its
// msg under the box; a rewrite that works "runs again" and shows the first `again` whose `when` matches it. A rewrite
// that doesn't work costs time. Markup: <div class="pilot" data-pilot="t5"></div>, with the usual check, reset and
// feedback. Built for 2.3 (Jay's Fortnite survey); use for any question-writing slip (surveys, interviews).
export const PILOTS = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
// Include the lesson's spec terms wherever they turn up as answer options, plus everyday-but-tricky words
// (shareholders, poverty, box office); leave out words students know (entertain, volunteers, streaming).
export const GLOSSARY = [
  ['situation', 'Where, when and who with someone uses a media product'],
  ['passive', 'Taking it in without doing anything back'],
  ['active', 'Taking part: choosing, talking, voting or making something'],
  ['involvement|involved', 'How much the audience takes part in a product'],
  ['interactive features?', 'Parts you click, tap or choose that respond to you'],
  ['online voting', 'Voting on a website or app, and the votes change what happens'],
  ['consumer-generated content', 'Content made by the audience, not by the producer'],
  ['docked', 'A Switch slotted into its dock, so the game shows on the TV'],
  ['spoilers?', 'Finding out what happens before you\'ve seen it'],
  ['streak', 'How many days in a row you have done something'],
  ['contestant', 'Someone taking part in a quiz or game show'],
  ['routines?', 'A set of dance moves done in order'],
  ['arcade', 'A place full of coin-operated video games'],
  ['record player', 'A machine that plays music from vinyl records'],
  ['whereas', 'But on the other hand (used to compare two things)'],
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

// Fix the slip: given[lineId] = the chosen version's key (absent = kept as it is).
// Marks only the changed lines; a slip left alone isn't marked, so a check never shows where it is.
export function markFixLines(lines, given) {
  return Object.fromEntries(lines.filter(l => given[l.id]).map(l => [l.id, given[l.id] === l.a]));
}
export const markFix = (taskKey, given) => markFixLines(FIXES[taskKey].lines, given);
// How many slips haven't been changed yet.
export const fixLeftLines = (lines, given) => lines.filter(l => l.a !== 'keep' && !given[l.id]).length;
export const fixLeft = (taskKey, given) => fixLeftLines(FIXES[taskKey].lines, given);
// Data mistakes that would give the slips away or make a line impossible: [] when the lines are fine.
export function fixDataProblems(lines) {
  const out = [];
  for (const l of lines) {
    const keys = l.opts.map(o => o[0]);
    if (l.opts.length !== 3) out.push(`${l.id}: needs exactly 3 opts, has ${l.opts.length}`);
    if (new Set(keys).size !== keys.length || keys.includes('keep')) out.push(`${l.id}: opt keys must be different and not 'keep'`);
    if (l.a !== 'keep' && !keys.includes(l.a)) out.push(`${l.id}: answer '${l.a}' isn't one of its opts`);
    if (l.opts.some(o => o[1].trim() === l.text.trim())) out.push(`${l.id}: an opt is the same as the line`);
  }
  if (!lines.some(l => l.a !== 'keep')) out.push('no line is a slip');
  return out;
}

// ── Guards against gaming a check (Nick, 2026-11-17) ─────────────────────────
// Seen in 3.1: every card into the first box, check, every red card into the second, check, the rest into the
// third. That finishes a sort without reading a card. So a check can't run until the task is really attempted
// (no time lost), and a check with more than half wrong says how many, not which.
const wordsOf = t => String(t || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
// How many cards each box of a sort takes (each box shows it: "2 / 3").
export function binCounts(items) {
  const n = {};
  for (const it of items) n[it.bin] = (n[it.bin] || 0) + 1;
  return n;
}
// '' when a sort or spectrum can be checked: every card placed and, in a sort, each box holding its share.
export function sortBlocker(sort, given) {
  if (sort.items.some(it => !given[it.id])) return sort.zones ? '📥 Place every card on the line first.' : '📥 Put every card in a box first.';
  if (!sort.bins) return '';
  const want = binCounts(sort.items);
  const off = sort.bins.some(([b]) => sort.items.filter(it => given[it.id] === b).length !== (want[b] || 0));
  return off ? '📥 Each box takes the number of cards shown on it. Move cards until every box is full.' : '';
}
// '' when every question has an answer.
export const unansweredBlocker = (ids, given) =>
  ids.some(id => !String(given[id] ?? '').trim()) ? '📥 Answer every question first.' : '';
// '' unless more are flagged (or changed) than there are slips: flagging everything would show where they are.
export function overBlocker(n, slips, noun, verb = 'flagged', thing = '', undo = 'Un-flag the ones you are least sure of.') {
  if (n <= slips) return '';
  return `📥 You've ${verb} ${n}${thing}, but there ${slips === 1 ? `is only 1 ${noun}` : `are only ${slips} ${noun}s`}. ${undo}`;
}
// More than half of these marked answers wrong: the check says how many, not which.
export const tooManyWrong = (res, ids) => ids.length > 0 && ids.filter(id => res[id] === false).length * 2 > ids.length;
// Writing must be mostly the student's own words: at least half its minimum length outside any run of four
// words copied from the question, its "ask" line or its starter (pasting the question back in isn't an answer;
// reusing its key words is fine).
export function ownWords(w, text) {
  if (w.short) return true;
  const runs = new Set();
  for (const part of [w.prompt, w.ask, w.starter].join('.').split(/[.,;:?!…()"“”]+/)) {
    const ws = wordsOf(part);
    for (let k = 0; k + 4 <= ws.length; k++) runs.add(ws.slice(k, k + 4).join(' '));
  }
  const ws = wordsOf(text), copied = new Array(ws.length).fill(false);
  for (let k = 0; k + 4 <= ws.length; k++) if (runs.has(ws.slice(k, k + 4).join(' '))) copied.fill(true, k, k + 4);
  return copied.filter(c => !c).length >= Math.ceil((w.minWords || 4) / 2);
}
// The same answer pasted into two boxes of one task: the later box doesn't count.
export function pastedTwice(list, given) {
  const seen = new Set(), out = new Set();
  for (const w of list) {
    if (w.short) continue;
    const s = String(given[w.id] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!s) continue;
    if (seen.has(s)) out.add(w.id); else seen.add(s);
  }
  return out;
}

export function markChoices(taskKey, given) {
  return Object.fromEntries(Object.entries(CHOICES[taskKey]).map(([id, c]) => [id, given[id] === c.a]));
}

export function markSort(taskKey, given) {
  return Object.fromEntries(SORTS[taskKey].items.map(it => [it.id, given[it.id] === it.bin]));
}

export function markWriting(taskKey, given) {
  const twice = pastedTwice(WRITING[taskKey], given);
  return Object.fromEntries(WRITING[taskKey].map(w => [w.id, markWriteQ(w, given) && !twice.has(w.id)]));
}
// One writing question: a real sentence (or name), not a copy of another answer, with a word from each bank.
export function markWriteQ(w, given) {
  const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords) && ownWords(w, given[w.id]);
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
