// Lesson 1.3 Who Made It and Why?: data and marking for 1_Who_Made_It_and_Why.html (pure, no DOM).
// Spec A1 "Context of production": media producer types, purposes, motivations, aims.
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (producer types) is open from the start; Part 2 (purpose, motivation, aim) opens with UNLOCK[2].
export const TASKS = [
  { key: 'who', kind: 'reveal' },              // 1 · Mystery producer: guess the producer type clue by clue
  { key: 'slip', kind: 'spot', part: 2 },      // 2 · Worked model (McCrispy), then spot and fix Sam's slips
  { key: 'name', kind: 'choice', part: 2 },    // 3 · Name the exact word: which purpose, motivation or aim?
  { key: 'yours', kind: 'write', part: 2 },    // 4 · Your turn: one product per sector
  { key: 'kinds', kind: 'sort', level: 'support' },               // Warm-up · Four kinds of producer
  { key: 'tricky', kind: 'write', level: 'challenge', part: 2 },  // ★ Tricky cases (Part 2)
  { key: 'owns', kind: 'write', level: 'challenge' },             // ★ Who really owns it? (Part 1, while waiting)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'motive' };   // shown on the Part 2 task slide
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


// ── 1 · Mystery producer. Each round names the product and its producer from the start (showFirst),
// so students make one leap: from facts about how the producer works to its type. Clues go from
// vague to clear and never use the type's own words.
export const REVEALS = {
  who: {
    prompt: 'What type of producer is {who}?',
    showFirst: true,
    opts: [['cong', 'Media conglomerate'], ['psb', 'Public service broadcaster'], ['ind', 'Independent producer'], ['comm', 'Community media']],
    rounds: [
      { id: 'r_mc', a: 'cong', who: 'Warner Bros.', label: 'A Minecraft Movie (2025) · Warner Bros.', img: 'mcmovie', credit: 'Warner Bros. Pictures',
        note: 'Films, TV, games and DC Comics, all under one owner',
        clues: ['Warner Bros. spent about $150 million making the film.', 'Warner Bros. also makes TV shows and video games.', 'It owns DC Comics, the home of Batman and Superman, too.'] },
      { id: 'r_sony', a: 'cong', who: 'Sony', label: 'Spider-Man: Across the Spider-Verse · Sony Pictures', img: 'spiderverse', credit: 'Sony Pictures',
        note: 'Films, music, TVs and PlayStation, all one company',
        clues: ['Sony spent about $100 million making the film.', 'Sony also owns one of the biggest record labels in the world.', 'Sony makes the PlayStation and its games, too.'] },
      { id: 'r_bite', a: 'psb', who: 'the BBC', label: 'BBC Bitesize · BBC', img: 'bitesize', credit: 'BBC',
        note: 'Paid for by the TV licence: free, with no adverts',
        clues: ['The BBC makes Bitesize free for every student in the UK.', 'In the UK, the BBC shows no adverts on its channels or website.', 'It is paid for by the TV licence, and it must inform, educate and entertain everyone.'] },
      { id: 'r_c4', a: 'psb', who: 'Channel 4', label: 'Channel 4', img: 'channel4', credit: 'Channel 4',
        note: 'Owned by the public, paid for by adverts',
        clues: ['Channel 4\'s shows are free to watch on TV and on its app.', 'It earns money from adverts, but has no shareholders: the money goes back into its shows.', 'It is owned by the public and must make shows other channels wouldn\'t.'] },
      { id: 'r_stardew', a: 'ind', who: 'ConcernedApe', label: 'Stardew Valley · ConcernedApe', img: 'stardew', credit: 'ConcernedApe',
        note: 'One person, Eric Barone, made it over four years',
        clues: ['ConcernedApe is a tiny company with only a handful of people.', 'No bigger company owns it.', 'It started as one man, who did the code, the art and the music himself.'] },
      { id: 'r_among', a: 'ind', who: 'Innersloth', label: 'Among Us · Innersloth', img: 'amongus', credit: 'Innersloth',
        note: 'Three friends made it; they still run the company',
        clues: ['Innersloth is a small games studio.', 'When Among Us came out in 2018, the whole team was three people.', 'It is still owned by the friends who started it, not by a big company.'] },
      { id: 'r_rhubarb', a: 'comm', who: 'Rhubarb Radio', label: 'Rhubarb Radio · Wakefield', img: 'rhubarb', credit: 'Rhubarb Radio',
        note: 'A not-for-profit station for Wakefield and South Leeds',
        clues: ['Rhubarb Radio plays music and news on the radio and online.', 'It covers Wakefield Trinity and Ossett Town matches that national stations leave out.', 'It is not-for-profit, and it is made by and for people in Wakefield and South Leeds.'] },
    ],
  },
};

// ── 2 · Spot the slip: an imaginary student's paragraph about A Minecraft Movie, with four slips.
// Each slip is one of the mix-ups this lesson is about (producer type, purpose vs motivation, purpose vs aim).
// Fix options are kept a similar length: the right one is never the longest.
export const SPOTS = {
  slip: {
    by: 'Sam, Year 10 · A Minecraft Movie',
    parts: [
      { id: 's1', text: 'A Minecraft Movie (2025) was made by Warner Bros., which is an independent producer.', fix: { a: 'cong', opts: [
        ['cong', 'Warner Bros. is a media conglomerate'], ['psb', 'Warner Bros. is a public service broadcaster'], ['comm', 'Warner Bros. is a community producer']] } },
      { id: 's2', text: 'Warner Bros. also makes TV shows and games, and owns DC Comics.' },
      { id: 's3', text: 'The purpose of the film is to generate profit at the box office.', fix: { a: 'ent', opts: [
        ['ent', 'Its purpose is to entertain'], ['aware', 'Its purpose is to raise awareness'], ['inform', 'Its purpose is to inform']] } },
      { id: 's4', text: 'It entertains families with jokes, action and the blocky Minecraft world.' },
      { id: 's5', text: 'One aim was to entertain as many people as possible.', fix: { a: 'hq', opts: [
        ['hq', 'One aim was for it to be high quality'], ['inf', 'One aim was for it to inform people'], ['profit', 'One aim was for it to generate a profit']] } },
      { id: 's6', text: 'You can see this in the expensive effects that make the blocks look real.' },
      { id: 's7', text: 'Warner Bros. was motivated to generate profit, because millions of players already love the game.' },
      { id: 's8', text: 'Warner Bros. is paid for by the TV licence, so it has to make films for everyone.', fix: { a: 'tix', opts: [
        ['tix', 'It is paid for by tickets and streaming'], ['vol', 'It is paid for by volunteers'], ['don', 'It is paid for by donations from the public']] } },
    ],
  },
};

export const SORTS = {
  // Warm-up: the page shows what each kind of producer is, so students sort two real examples per kind.
  kinds: {
    bins: [['cong', 'Media conglomerate'], ['psb', 'Public service broadcaster'], ['ind', 'Independent producer'], ['comm', 'Community media']],
    items: [
      { id: 'k_cong_ex', label: 'Disney owns Pixar, Marvel, Star Wars and ESPN', bin: 'cong' },
      { id: 'k_cong_ex2', label: 'Sony makes films, music and PlayStation games', bin: 'cong' },
      { id: 'k_psb_ex', label: 'The BBC is paid for by the TV licence and shows no adverts', bin: 'psb' },
      { id: 'k_psb_ex2', label: 'ITV must show local news for every part of the country', bin: 'psb' },
      { id: 'k_ind_ex', label: 'Toby Fox made the game Undertale almost on his own', bin: 'ind' },
      { id: 'k_ind_ex2', label: 'Aardman, the Wallace & Gromit studio, is owned by its own staff', bin: 'ind' },
      { id: 'k_comm_ex', label: 'Hospital radio: volunteers play song requests for patients', bin: 'comm' },
      { id: 'k_comm_ex2', label: 'Student radio: run by students, for the students at their college', bin: 'comm' },
    ],
  },
};

// ── 3 · Name the exact word. Option lengths checked: the right answer is the longest in under half.
export const CHOICES = {
  name: {
    innov: { q: 'Spider-Verse mixed comic-book dots, hand drawing and 3D animation in a way no film had done before. Which motivation does that show?', a: 'innov', opts: [
      ['innov', 'Innovation'], ['profit', 'Generate profit'], ['comm', 'Benefit a community'], ['aware', 'Raise awareness']] },
    relief: { q: 'On Red Nose Day, Comic Relief shows short films about people living in poverty, so viewers know it is happening. Which motivation is that?', a: 'aware', opts: [
      ['aware', 'Raise awareness'], ['self', 'Self-expression'], ['innov', 'Innovation'], ['psr', 'Public service responsibilities']] },
    bite: { q: 'The BBC makes Bitesize free for every student, because it has a duty to inform and educate the whole country. Which motivation is that?', a: 'psr', opts: [
      ['psr', 'Public service responsibilities'], ['profit', 'Generate profit'], ['self', 'Self-expression'], ['innov', 'Innovation']] },
    local: { q: 'Rhubarb Radio covers Wakefield Trinity matches and local news that national stations leave out. Which motivation is that?', a: 'comm', opts: [
      ['comm', 'Benefit a community'], ['innov', 'Innovation'], ['self', 'Self-expression'], ['profit', 'Generate profit']] },
    barbie: { q: 'Barbie (2023) makes fun of the idea that men should be in charge of everything. Which purpose does that part of the film have?', a: 'chal', opts: [
      ['chal', 'To challenge'], ['inform', 'To inform'], ['educate', 'To educate'], ['persuade', 'To persuade']] },
    proud: { q: 'Metro\'s front page "You\'ve done us proud!" celebrated the Lionesses so girls who play football feel they could do it too. Which purpose is that?', a: 'insp', opts: [
      ['insp', 'To inspire'], ['inform', 'To inform'], ['persuade', 'To persuade'], ['entertain', 'To entertain']] },
    diverse: { q: 'Spider-Verse shows Spider-People of different races, ages and genders, from all over the world. Which aim does that show?', a: 'div', opts: [
      ['div', 'Diverse'], ['imp', 'Impartial'], ['acc', 'Accessible'], ['hq', 'High quality']] },
    c4: { q: 'Channel 4 has to make shows that stand out: ones no other channel would make. Which aim is that?', a: 'dist', opts: [
      ['dist', 'Distinctive'], ['imp', 'Impartial'], ['acc', 'Accessible'], ['hq', 'High quality']] },
  },
};

// ── 4 and ★ · Writing (evidence for Classroom; checked for real sentences only) ──
const PRODUCER_TYPES = ['media conglomerate', 'public service broadcaster', 'independent producer', 'community media'];
const PURPOSES = ['entertain', 'inform', 'educate', 'persuade', 'inspire', 'challenge'];
const MOTIVATIONS = ['generate profit', 'raise awareness', 'benefit a community', 'self-expression', 'innovation', 'public service responsibilities'];
const AIMS = ['high quality', 'distinctive', 'accessible', 'diverse', 'inclusive', 'impartial'];

export const WRITING = {
  // Each sector: the product, then one box each for purpose, motivation and aim, coloured like the deck's
  // "The words to use" slide, with the question to ask and the word bank beside it (Nick, 2026-11-06).
  yours: [
    ...[['ami', 'Audio/moving image', 'a film, TV show, YouTube channel or podcast'],
      ['print', 'Print', 'a magazine, comic, newspaper or poster'],
      ['int', 'Interactive', 'a game, app or website']].flatMap(([s, sector, eg], n, all) => {
      const prev = n ? all[n - 1][0] : null, diff = f => prev ? { differentFrom: `${prev}_${f}` } : {};
      return [
        { id: `${s}_prod`, group: sector, prompt: `A product you know (${eg}) and who made it`, short: true, ...diff('prod') },
        { id: `${s}_pur`, tone: 'pur', prompt: 'Producer and purpose', ask: 'What does the audience get from it?',
          starter: '… was made by …, which is a … . Its purpose is to … because …', minWords: 15,
          words: [PRODUCER_TYPES, PURPOSES], ...diff('pur') },
        { id: `${s}_mot`, tone: 'mot', prompt: 'Motivation', ask: 'What does the producer get from making it?',
          starter: 'The motivation of … is to … because …', minWords: 12, words: [MOTIVATIONS], ...diff('mot') },
        { id: `${s}_aim`, tone: 'aim', prompt: 'Aim', ask: 'What did the producer want it to be like?',
          starter: 'One aim was to make it … . You can see this because …', minWords: 12, words: [AIMS], ...diff('aim') },
      ];
    }),
  ],
  // ★ Part 1 challenge: producers that don't fit one box (for students waiting for Part 2).
  owns: [
    { id: 'ch_beast', prompt: 'MrBeast started on his own on YouTube. Now his show Beast Games is on Amazon Prime Video, and Amazon is a giant company. Is MrBeast still an independent producer? Give a reason for yes and a reason for no, then decide.',
      starter: 'Yes, because … But no, because … I think …', minWords: 30 },
    { id: 'ch_mojang', prompt: 'Mojang was a small Swedish studio when Minecraft came out. In 2014 Microsoft, a giant company, bought Mojang. What type of producer made Minecraft at the start, and what type makes it now? Give a reason for each.',
      starter: 'At the start, Mojang was … because … Now …', minWords: 30 },
    { id: 'ch_bbcbig', prompt: 'The BBC is huge: TV channels, radio stations, websites and iPlayer. So why is it a public service broadcaster and not a media conglomerate? Think about how it is paid for and who it has to serve.',
      starter: 'The BBC is big, but it is not a conglomerate because …', minWords: 25 },
  ],
  // ★ Part 2 challenge: purposes and motivations that don't fit neatly.
  tricky: [
    { id: 'ch_free', prompt: 'Metro is a free newspaper. How can a free paper still generate profit? Name one purpose and one motivation behind its Lionesses front page.',
      starter: 'Metro makes money by … The purpose of the front page is to … but the motivation is …', minWords: 30 },
    { id: 'ch_bbc', prompt: 'Bitesize earns the BBC no money. Why does the BBC make it, when a conglomerate like Warner Bros. probably would not? Use the words motivation and public service responsibilities.',
      starter: 'The BBC\'s motivation is … because …', minWords: 25 },
  ],
};

// ── Glossary: hover, focus or tap shows the meaning (agreed list, 2026-11-05) ──
export const GLOSSARY = [
  // Lesson terms, wherever they turn up as answers
  ['innovation', 'Doing something new that nobody has done before'],
  ['self-expression', 'Making something to show your own ideas or feelings'],
  ['public service responsibilities', 'A duty to make things that serve everyone, not just to make money'],
  ['raise awareness', 'Make more people know about a problem or cause'],
  ['generate (?:a )?profit', 'Make more money than it cost'],
  ['benefit a community', 'Help a local area or a group of people'],
  ['impartial', 'Fair to every side, without taking one'],
  ['accessible', 'Easy for everyone to get and use, including disabled people'],
  ['distinctive', 'Stands out: you can tell it apart from anything else'],
  ['diverse', 'Shows many different kinds of people'],
  ['inclusive', 'Makes everyone feel welcome and included'],
  ['persuade', 'Get someone to do or buy something'],
  ['inspire', 'Make someone feel they could do it too'],
  ['challenge', 'As a purpose: make people question an idea they take for granted'],
  ['conglomerates?', 'A giant company that owns lots of other companies'],
  ['broadcasters?', 'A company that sends out TV or radio programmes'],
  // Everyday-but-tricky words
  ['shareholders?', 'People who own part of a company and get a share of its profits'],
  ['not-for-profit', 'Any money it makes goes back into it, not to owners'],
  ['TV licence|licence fee', 'A yearly payment by UK households that pays for the BBC'],
  ['poverty', 'Not having enough money for basic things like food and heating'],
  ['duty', 'Something you must do because it\'s your job or the law'],
  ['box office', 'The money a film makes from cinema tickets'],
  ['motivated', 'Had a reason for doing something'],
  ['sectors?', 'One of the three kinds of media: audio/moving image, print or interactive'],
  ['donations?', 'Money people give for free, to help'],
  ['national stations', 'Radio stations heard across the whole country'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking (from the template) ─────────────────────────────────────────────
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
  return Object.fromEntries(WRITING[taskKey].map(w => {
    const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords);
    const differs = !w.differentFrom || squash(given[w.id]) !== squash(given[w.differentFrom]);
    const worded = (w.words || []).every(bank => bank.some(x => usesWord(given[w.id], x)));
    return [w.id, real && differs && worded];
  }));
}
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Does the text use this word or phrase in any form? Each word of 3+ letters must appear as the start
// of a word ("generating a profit" uses "generate profit"; "accessibility" uses "accessible").
export function usesWord(text, phrase) {
  const words = String(text || '').toLowerCase().split(/[^a-z]+/);
  return phrase.toLowerCase().split(/[^a-z]+/).filter(x => x.length >= 3)
    .every(x => words.some(w => w.startsWith(x.slice(0, Math.max(4, Math.min(x.length - 3, 5))))));
}

export function allCorrect(result) {
  const v = Object.values(result);
  return v.length > 0 && v.every(Boolean);
}

export function isRealSentence(text, minWords = 4) {
  const words = String(text || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
  if (words.length < minWords) return false;
  if (new Set(words).size < Math.ceil(words.length * 0.6)) return false;
  if (words.some(w => w.length > 25)) return false;
  return words.filter(w => /[aeiouy]/.test(w)).length >= Math.ceil(words.length * 0.8);
}

export function isRealName(text) {
  const t = String(text || '').trim();
  return (t.match(/[a-z]/gi) || []).length >= 2 && new Set(t.toLowerCase().replace(/\s/g, '')).size >= 2;
}

// A wrong check costs 10 s, every time: enough to stop guessing, not so long it punishes (Nick, 2026-11-12).
export function cooldownSeconds() {
  return 10;
}

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
