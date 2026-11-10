// Lesson 2.2 Who Is It For?: data and marking for 1_Who_Is_It_For.html (pure, no DOM).
// Spec A1 "Audience interpretation": defining primary and secondary audiences, e.g. gender, age, socio-economic
// groupings, lifestyle profiles. Lifestyle terms (interests, attitudes, values, behaviour) are the spec's own
// (Component 3 A1, "Defining the target audience"). Socio-economic groups use the NRS grades, shortened to
// AB / C1 / C2 / DE (and ABC1 / C2DE), as moderator-praised Component 1 work does.
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (primary and secondary audiences; age, gender, socio-economic group) is open from the start;
// Part 2 (lifestyle profiles, after the football-fans worked model) opens with UNLOCK[2].
export const TASKS = [
  { key: 'who', kind: 'choice' },                              // 1 · Who's in the audience? Primary/secondary, socio-economic groups
  { key: 'guess', kind: 'reveal' },                            // 2 · Who's it for? Name the primary audience from clues
  { key: 'fans', kind: 'sort', part: 2 },                      // 3 · A football fan: interests, attitudes, values, behaviour
  { key: 'card', kind: 'profile', part: 2 },                   // 4 · Profile the audience: Radio 1 and Fortnite
  { key: 'meet', kind: 'write', part: 2 },                     // 5 · Meet the audience: a lifestyle profile in their own words
  { key: 'warm', kind: 'sort', level: 'support' },             // Warm-up · Age, gender or socio-economic group?
  { key: 'two', kind: 'write', level: 'challenge' },           // ★ Two audiences: Spider-Verse (Part 1, while waiting)
  { key: 'st', kind: 'profile', level: 'challenge', part: 2 }, // ★ Stranger Things (Part 2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'superfan' };   // shown on the Part 2 task slide
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// ── Sorts ──
// Warm-up: the page shows what age, gender and socio-economic group mean; students sort audience facts (two each).
// Task 3: a typical football fan's lifestyle, after the deck's worked model (whose examples are in the page's
// terms box, so these cards are all new).
export const SORTS = {
  warm: {
    bins: [['age', 'Age'], ['gen', 'Gender'], ['seg', 'Socio-economic group']],
    items: [
      { id: 'w_8to12', label: 'Most are aged 8 to 12', bin: 'age' },
      { id: 'w_20s', label: 'Most are in their twenties', bin: 'age' },
      { id: 'w_half', label: 'About half are male and half are female', bin: 'gen' },
      { id: 'w_girls', label: 'Most are girls and women', bin: 'gen' },
      { id: 'w_trades', label: 'Many are plumbers, builders and mechanics', bin: 'seg' },
      { id: 'w_bosses', label: 'Many are senior managers and lawyers', bin: 'seg' },
    ],
  },
  fans: {
    bins: [['int', 'Interests'], ['att', 'Attitudes'], ['val', 'Values'], ['beh', 'Behaviour']],
    items: [
      { id: 'f_fantasy', label: 'Fantasy football and football podcasts', bin: 'int' },
      { id: 'f_history', label: 'The history of their club and its old players', bin: 'int' },
      { id: 'f_var', label: 'Thinks VAR spoils the excitement of a goal', bin: 'att' },
      { id: 'f_tickets', label: 'Feels that match tickets cost far too much now', bin: 'att' },
      { id: 'f_loyal', label: 'Loyalty matters most: they stick with the club even when it loses', bin: 'val' },
      { id: 'f_family', label: 'Family matters most: football is time with their dad and their kids', bin: 'val' },
      { id: 'f_motd', label: 'Watches Match of the Day every Saturday night', bin: 'beh' },
      { id: 'f_shirt', label: 'Buys the new home shirt every season', bin: 'beh' },
    ],
  },
};

// ── 1 · Who's in the audience? Primary vs secondary (3), which fact is socio-economic (1), the group for a job (4),
// describing gender from a survey (1). Option lengths checked: the right answer is the longest in under half.
const SEG = [['ab', 'A/B: managers and professionals'], ['c1', 'C1: office and admin jobs'], ['c2', 'C2: skilled trades'], ['de', 'D/E: manual jobs or not working']];
export const CHOICES = {
  who: {
    def: { q: 'What is a product\'s primary audience?', a: 'main', opts: [
      ['main', 'The main group it\'s made for'], ['first', 'The first people who saw it'],
      ['all', 'Everyone who ever uses it'], ['extra', 'A smaller group it also reaches']] },
    bluey: { q: 'Bluey is made for children aged 3 to 6. Many parents watch it with them and laugh at the jokes. For Bluey, these parents are…', a: 'sec', opts: [
      ['sec', 'The secondary audience'], ['pri', 'The primary audience'], ['none', 'Not part of the audience'], ['prod', 'The producers of the show']] },
    jokes: { q: 'Why do the makers of Bluey put in jokes that only adults will get?', a: 'keep', opts: [
      ['keep', 'So parents enjoy it and keep watching'], ['adults', 'Because adults are its primary audience'],
      ['rule', 'Because its age rating says they must'], ['teach', 'To teach young children harder words']] },
    fact: { q: 'Which of these is a fact about an audience\'s socio-economic group?', a: 'job', opts: [
      ['job', 'Most work in well-paid office jobs'], ['age', 'Most of them are aged 25 to 40'],
      ['gen', 'Around two thirds are women'], ['life', 'Most of them love cooking and travel']] },
    doc: { q: 'Priya is a hospital doctor. Which socio-economic group is she in?', a: 'ab', opts: SEG },
    elec: { q: 'Dan is an electrician who rewires houses. Which socio-economic group is he in?', a: 'c2', opts: SEG },
    recep: { q: 'Sophie is a receptionist at a dentist\'s. Which socio-economic group is she in?', a: 'c1', opts: SEG },
    pens: { q: 'Ken is retired and lives on his state pension. Which socio-economic group is he in?', a: 'de', opts: SEG },
    gender: { q: 'A survey finds that 7 in 10 players of a game are boys or men. How would you describe the gender of its audience?', a: 'most', opts: [
      ['most', 'Mostly male'], ['only', 'Male only'], ['even', 'Everyone equally'], ['fem', 'Mostly female']] },
  },
};

// ── Writing ──
// ★ Two audiences (Part 1): Spider-Verse's primary and secondary audience, and why a producer wants both.
// 5 · Meet the audience: a lifestyle profile of one typical member of a primary audience, one box per part,
// each using its spec word (Y10/CLAUDE.md "Writing structure").
export const WRITING = {
  two: [
    { id: 'two_pri', group: 'Primary audience', prompt: 'Who is the primary audience of Spider-Man: Across the Spider-Verse?', ask: 'Give an age range and a gender.',
      starter: 'The primary audience is… aged… because…', minWords: 10, words: [['primary audience'], ['aged', 'age']] },
    { id: 'two_sec', group: 'Secondary audience', prompt: 'Who else watches it?', ask: 'Name a secondary audience and say what the film offers them.',
      starter: 'A secondary audience is… because…', minWords: 10, words: [['secondary audience']] },
    { id: 'two_why', group: 'Why it matters', prompt: 'Why would Sony Pictures want a secondary audience as well?',
      starter: 'A secondary audience helps the producer because…', minWords: 10, words: [['box office', 'tickets', 'profit']] },
  ],
  meet: [
    { id: 'm_prod', prompt: 'Whose audience are you describing?', ask: 'Radio 1, Fortnite, or a product you know well.', short: true },
    { id: 'm_who', group: 'Who they are', prompt: 'Describe one typical member of the primary audience.', ask: 'Give them a first name, an age, a gender and a socio-economic group.',
      starter: 'A typical member of the primary audience is…, aged…', minWords: 12, words: [['primary audience'], ['socio-economic']] },
    { id: 'm_int', group: 'Their lifestyle', prompt: 'Interests', ask: 'What do they like doing or knowing about?',
      starter: 'In their free time they are interested in…', minWords: 8, words: [['interest']] },
    { id: 'm_att', prompt: 'Attitudes', ask: 'What do they think or feel about things?', starter: 'Their attitude to… is that…', minWords: 8, words: [['attitude']] },
    { id: 'm_val', prompt: 'Values', ask: 'What matters most to them?', starter: 'They value… because…', minWords: 8, words: [['value']] },
    { id: 'm_beh', prompt: 'Behaviour', ask: 'What do they actually do: where, when and how do they use the product?',
      starter: 'Their behaviour: every week they…', minWords: 8, words: [['behaviour']] },
  ],
};

// ── 2 · Who's it for? (reveal) The product shows from the start; the clues decide its primary audience
// (age · gender · socio-economic group), so students make one leap from evidence to audience.
export const REVEALS = {
  guess: {
    showFirst: true,
    prompt: 'Who is the primary audience of {who}?',
    opts: [
      ['kids', 'Children aged 6–12 · boys and girls · all groups'],
      ['teen', 'Teenagers aged 12–17 · mostly girls · all groups'],
      ['lux', 'Adults aged 25–45 · mostly women · mostly ABC1'],
      ['old', 'Adults over 55 · men and women · mostly C2DE'],
      ['men', 'Adults aged 18–30 · mostly men · mostly C2DE'],
      ['boys', 'Children aged 8–14 · mostly boys · mostly ABC1'],
    ],
    rounds: [
      { id: 'g_beano', who: 'Beano', label: 'Beano', img: 'beano', credit: 'Beano Studios (DC Thomson), 2026', a: 'kids', clues: [
        'It is a comic, sold every week in supermarkets and newsagents.',
        'Its stories are about pranks on teachers, parents and grumpy neighbours.',
        'Dennis and Minnie the Minx both star in their own stories.',
      ], note: 'Secondary audience: parents and grandparents who read it as children. It started in 1938.' },
      { id: 'g_smash', who: 'Smash Hits', label: 'Smash Hits (May 1989)', img: 'smash', credit: 'Smash Hits, EMAP, 16 May 1989', a: 'teen', clues: [
        'In 1989 it came out every two weeks and cost 52p, so you could buy it with pocket money.',
        'Every issue printed the words to the latest chart songs, with posters of heart-throbs like Rick Astley and Jon Bon Jovi for your bedroom wall.',
        'Its cover asks Kylie Minogue, then 20, about fame, friends and "the dreaded Dumper".',
      ], note: 'In 1989 it sold nearly 800,000 copies an issue. It closed in 2006, once teenagers went online for their music news.' },
      { id: 'g_vogue', who: 'British Vogue', label: 'British Vogue (November 2026)', img: 'vogue', credit: 'British Vogue, Condé Nast, November 2026', a: 'lux', clues: [
        'It is a glossy fashion magazine that has come out every month since 1916.',
        'Its cover stars are actors, singers and models: mostly women in their 20s, 30s and 40s.',
        'Most of its adverts are for luxury brands like Chanel and Dior, whose handbags cost thousands of pounds.',
      ], note: 'Secondary audience: people who work in fashion, and younger fans who follow it on Instagram and TikTok.' },
      { id: 'g_count', who: 'Countdown', label: 'Countdown (Channel 4)', img: 'countdown', credit: 'Channel 4', a: 'old', clues: [
        'It is on Channel 4 on weekday afternoons, when most people with jobs are at work.',
        'It is a calm quiz about words and numbers, and has been on since 1982.',
        'The adverts in its breaks are often for stairlifts, funeral plans and walk-in baths.',
      ], note: 'Viewing figures (Barb) found about 3 in 4 viewers were over 55, and almost half were in group DE. It was the first programme ever shown on Channel 4, in 1982.' },
    ],
  },
};

export const SPOTS = {};
export const SPECTRUMS = {};
export const HUNTS = {};

// ── 4 · Profile the audience, and ★ Stranger Things ──
// Lifestyle fields share statements: each is right in exactly one field and a distractor in the other three,
// plus one statement that fits a different audience. So students need the meaning of each term, not just the product.
const MIX = [['mix', 'Male and female'], ['m', 'Mostly boys and men'], ['f', 'Mostly girls and women']];
const GROUPS = [['all', 'All groups, A to E'], ['abc', 'Mostly ABC1: better-paid jobs'], ['cde', 'Mostly C2DE: lower-paid jobs']];
const OTHER = { int: 'Gardening, golf and classical music', att: 'Thinks video games are a waste of time',
  val: 'Peace and quiet matter most', beh: 'Reads a printed newspaper every morning' };
const ASK = { int: 'what they like doing or knowing about', att: 'what they think or feel about things',
  val: 'what matters most to them', beh: 'what they actually do' };
const LABEL = { int: 'Interests', att: 'Attitudes', val: 'Values', beh: 'Behaviour' };
// The four lifestyle fields for a card, from its four statements { int, att, val, beh }.
const lifestyle = (pre, st) => ['int', 'att', 'val', 'beh'].map((k, n) => ({
  id: `${pre}_${k}`, ...(n ? {} : { group: 'Lifestyle of the primary audience' }), label: LABEL[k], ask: `(${ASK[k]})`,
  opts: [...Object.entries(st), ['other', OTHER[k]]], ok: [k],
}));

export const PROFILES = {
  card: {
    cards: [
      { id: 'radio1', label: 'BBC Radio 1', sector: 'Audio · radio', img: 'radio1', credit: 'BBC Radio 1', evidence: [
        'Radio 1 is free: on the radio, on the BBC Sounds app and on YouTube.',
        'The BBC aims Radio 1 at 15- to 29-year-olds.',
        'It plays new pop, dance and rap music, and puts on Big Weekend, a music festival with the biggest pop stars.',
        'Its presenters and its listeners are a mix of men and women.',
        'Plenty of listeners are over 30 (the typical listener is about 30): people who grew up with it keep listening.',
        'Listeners send messages and vote on the app, and its presenters post clips on TikTok.',
      ], fields: [
        { id: 'r_age', group: 'Primary audience', label: 'Age', ask: '(how old are most of them?)', opts: [['u12', 'Under 12'], ['yng', '15 to 29'], ['mid', '30 to 50 years old'], ['old', 'Over 60']], ok: ['yng'] },
        { id: 'r_gen', label: 'Gender', opts: MIX, ok: ['mix'] },
        { id: 'r_seg', label: 'Socio-economic group', ask: '(what does it cost?)', opts: GROUPS, ok: ['all'] },
        { id: 'r_sec', group: 'Secondary audience', label: 'Who else listens?', opts: [
          ['grew', 'Adults over 30 who grew up with it'], ['kids', 'Children under 5 at nursery'],
          ['djs', 'The presenters and DJs on the station'], ['pri', '15- to 29-year-old music fans']], ok: ['grew'] },
        ...lifestyle('r', { int: 'New music, festivals and pop stars', att: 'Thinks the newest songs are the best',
          val: 'Friends and fitting in matter most', beh: 'Listens on the bus to school or work' }),
      ] },
      { id: 'fortnite', label: 'Fortnite', sector: 'Interactive · game', img: 'fortnite', credit: 'Epic Games', evidence: [
        'Fortnite (Epic Games, 2017) is free to download on consoles, PCs and phones.',
        'Its age rating is PEGI 12, but plenty of younger children play it too.',
        'A survey of 1,000 players found that about 7 in 10 are boys or men, and most players are teenagers or young adults.',
        'It\'s free, but players spend real money on V-Bucks to unlock skins, emotes and dances.',
        'Players team up in squads and talk to each other through headsets while they play.',
        'Millions more watch streamers play it on YouTube and Twitch, and its in-game concerts have starred Ariana Grande and Eminem.',
      ], fields: [
        { id: 'f_age', group: 'Primary audience', label: 'Age', ask: '(how old are most of them?)', opts: [['u8', 'Under 8'], ['yng', '12 to 24'], ['mid', '35 to 50 years old'], ['old', 'Over 60']], ok: ['yng'] },
        { id: 'f_gen', label: 'Gender', opts: MIX, ok: ['m'] },
        { id: 'f_seg', label: 'Socio-economic group', ask: '(what does it cost?)', opts: GROUPS, ok: ['all'] },
        { id: 'f_sec', group: 'Secondary audience', label: 'Who else is in the audience?', ask: '(two answers are right: pick one)', opts: [
          ['kids', 'Children under 12 who play anyway'], ['watch', 'People who watch streamers play it'],
          ['pri', 'Players aged 12 to 24'], ['epic', 'The game designers and testers at Epic Games']], ok: ['kids', 'watch'] },
        ...lifestyle('f', { int: 'Gaming, streamers, skins and dances', att: 'Thinks games are more fun with friends',
          val: 'Teamwork and loyalty matter most', beh: 'Plays online with friends most evenings' }),
      ] },
    ],
  },
  st: {
    cards: [
      { id: 'stranger', label: 'Stranger Things', sector: 'Audio-visual · TV series', img: 'stranger', credit: 'Netflix', evidence: [
        'A Netflix series (2016–2025) set in a small American town in the 1980s.',
        'Its age rating in the UK is 15.',
        'Its heroes start as kids on bikes and grow into teenagers, fighting monsters from another world.',
        'It is full of 1980s songs, films and fashion: Kate Bush\'s 1985 song "Running Up That Hill" went to number 1 in 2022 because of it.',
        'Netflix needs a monthly subscription, but the cheapest plan costs only a few pounds.',
        'Its girls and boys are equally important heroes, and fans share theories online between seasons.',
      ], fields: [
        { id: 's_age', group: 'Primary audience', label: 'Age', ask: '(how old are most of them?)', opts: [['u10', 'Under 10'], ['yng', '15 to 34'], ['mid', '45 to 60 years old'], ['old', 'Over 70']], ok: ['yng'] },
        { id: 's_gen', label: 'Gender', opts: MIX, ok: ['mix'] },
        { id: 's_seg', label: 'Socio-economic group', ask: '(what does it cost?)', opts: GROUPS, ok: ['all'] },
        { id: 's_sec', group: 'Secondary audience', label: 'Who else watches?', opts: [
          ['grew', 'Adults who grew up in the 1980s'], ['kids', 'Children under 10'],
          ['pri', 'Viewers aged 15 to 34'], ['cast', 'The actors, writers and crew who made it']], ok: ['grew'] },
        ...lifestyle('s', { int: 'Horror, sci-fi and mysteries', att: 'Thinks 1980s style is cool',
          val: 'Loyalty to friends matters most', beh: 'Binge-watches a season in a weekend' }),
      ] },
    ],
    why: [
      { id: 'st_why', prompt: 'Why did setting it in the 1980s help Netflix win a secondary audience?',
        starter: 'The 1980s setting appeals to the secondary audience because…', minWords: 10, words: [['secondary audience']] },
    ],
  },
};

// ── Glossary: words a typical 13-year-old might not know (hover, focus or tap shows the meaning) ──
export const GLOSSARY = [
  // Lesson terms
  ['primary audiences?', 'The main group of people a media product is made for'],
  ['secondary audiences?', 'Other people it appeals to as well, though it isn\'t mainly made for them'],
  ['socio-economic groups?', 'Groups of people sorted by the kind of job they do, and so their income'],
  ['ABC1', 'Groups A, B and C1 together: managers, professionals and office jobs'],
  ['C2DE', 'Groups C2, D and E together: trades, manual jobs and people not working'],
  ['lifestyle', 'How someone lives: their interests, attitudes, values and behaviour'],
  ['interests', 'What someone likes doing or knowing about'],
  ['attitudes?', 'What someone thinks or feels about things: their opinions'],
  ['values', 'What matters most to someone: what they believe is important'],
  ['behaviour', 'What someone actually does: their habits'],
  // Everyday-but-tricky words
  ['professionals?', 'People in jobs that need years of training, like doctors and lawyers'],
  ['skilled trades?', 'Jobs that need training with your hands, like plumbing or rewiring'],
  ['manual', 'Done with your hands, like building, packing or cleaning'],
  ['state pension', 'Money the government pays each week to people old enough to retire'],
  ['retired', 'Stopped working, usually because of age'],
  ['luxury', 'Very expensive, and not something anyone needs'],
  ['glossy', 'Printed on thick, shiny paper'],
  ['subscription', 'Paying every month to keep using something'],
  ['PEGI 12', 'An age rating: the game is for players aged 12 and over'],
  ['streamers?', 'People who play games live online for others to watch'],
  ['skins', 'Outfits that change how your character looks in a game'],
  ['emotes', 'Dances and moves your character can do in a game'],
  ['V-Bucks', 'Fortnite\'s own money, bought with real money'],
  ['squads?', 'A small team of players who play together'],
  ['binge-watch(?:es|ing)?', 'Watch lots of episodes, one straight after another'],
  ['stairlifts?', 'A chair on a rail that carries someone up the stairs'],
  ['box office', 'The money a film makes from cinema tickets'],
  ['VAR', 'Video referees who check goals and fouls on a screen'],
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
    res[r.id + '_fact'] = r.accept ? factMatches(g('fact'), r.accept) : isRealSentence(g('fact'), r.minWords || 5);
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

// Wrong checks cost time, and more each time: 10 s, 20 s, then 30 s.
export function cooldownSeconds(wrongCount) {
  return Math.min(30, 10 * Math.max(1, wrongCount));
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
