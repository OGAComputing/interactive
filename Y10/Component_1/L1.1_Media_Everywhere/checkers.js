// Lesson 1.1 Media Everywhere: data and marking for 1_Media_Everywhere.html (pure, no DOM).
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (sectors and eras: the Media Board) is open from the start; Part 2 (The Lion King, then and now)
// opens with UNLOCK[2], shown on the deck's "Then and now" task slide after the two clips.
export const TASKS = [
  { key: 'board', kind: 'sort' },    // 1 · The Media Board
  { key: 'then', kind: 'choice', part: 2 },   // 2 · Then and now: watch
  { key: 'compare', kind: 'write', part: 2 }, // 3 · Then and now: write
  { key: 'day', kind: 'write', part: 2 },     // 4 · My media day
  { key: 'snap', kind: 'sort', level: 'support' },        // Warm-up · Sector snap
  { key: 'tricky', kind: 'choice', level: 'challenge' },  // ★ Tricky cases
  { key: 'remake', kind: 'write', level: 'challenge', part: 2 }, // ★ Remake it
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'simba' };   // shown on the Part 2 task slide
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


// ── 1 · The Media Board: 21 real products by sector and era ──────────────────
// Era = when the product in the picture first came out: before 2000 is historical,
// 2000 onwards is contemporary (spec A1). Avoid brands whose name spans both eras
// (Beano, Match of the Day on TV) unless the card says which one it is.
export const BINS = [
  ['ami-pre', 'Audio / moving image · before 2000'], ['ami-post', 'Audio / moving image · 2000 onwards'],
  ['print-pre', 'Print · before 2000'], ['print-post', 'Print · 2000 onwards'],
  ['int-pre', 'Interactive · before 2000'], ['int-post', 'Interactive · 2000 onwards'],
];
export const PRODUCTS = [
  { id: 'jaws', label: 'Jaws (film)', bin: 'ami-pre', note: '1975', img: 'jaws', credit: 'Universal Pictures' },
  { id: 'toystory', label: 'Toy Story (the first film)', bin: 'ami-pre', note: '1995', img: 'toystory', credit: 'Disney / Pixar' },
  { id: 'lionking', label: 'The Lion King (cartoon original)', bin: 'ami-pre', note: '1994', img: 'lionking', credit: 'Disney' },
  { id: 'stranger', label: 'Stranger Things (TV series)', bin: 'ami-post', note: '2016', img: 'stranger', credit: 'Netflix' },
  { id: 'spiderverse', label: 'Spider-Man: Across the Spider-Verse (film)', bin: 'ami-post', note: '2023', img: 'spiderverse', credit: 'Sony Pictures' },
  { id: 'mrbeast', label: 'A MrBeast YouTube video', bin: 'ami-post', note: '2021', img: 'mrbeast', credit: 'MrBeast / YouTube' },
  { id: 'radio1', label: 'Radio 1 Weekend Breakfast (radio show)', bin: 'ami-post', note: '2026 show', img: 'radio1', credit: 'BBC' },
  { id: 'smashhits', label: 'Smash Hits (pop magazine)', bin: 'print-pre', note: '1989', img: 'smashhits', credit: 'EMAP, via magazinecollectors.co.uk' },
  { id: 'mirror', label: 'Sunday Mirror front page: "Golden Boys!"', bin: 'print-pre', note: '1966', img: 'mirror', credit: 'Mirror Group, via mirror.co.uk' },
  { id: 'argos', label: 'Argos catalogue', bin: 'print-pre', note: '1990', img: 'argos', credit: 'Argos, via issuu.com' },
  { id: 'motd', label: 'Match of the Day magazine', bin: 'print-post', note: '2026', img: 'motd', credit: 'Immediate Media / BBC' },
  { id: 'lionesses', label: 'Newspaper front pages: Lionesses win Euro 2025', bin: 'print-post', note: '2025', img: 'lionesses', credit: 'Metro and i, via BBC News' },
  { id: 'billboard', label: "McDonald's McCrispy billboard", bin: 'print-post', note: '2025', img: 'billboard', credit: "McDonald's, via storyblok.com" },
  { id: 'pacman', label: 'Pac-Man (arcade game)', bin: 'int-pre', note: '1980', img: 'pacman', credit: 'Namco, via Wikimedia Commons' },
  { id: 'pokemon', label: 'Pokémon Red (Game Boy)', bin: 'int-pre', note: '1996 (UK 1999)', img: 'pokemon', credit: 'Nintendo / Game Freak, via Wikipedia' },
  { id: 'tetris', label: 'Tetris (Game Boy)', bin: 'int-pre', note: '1989', img: 'tetris', credit: 'Nintendo, via Wikipedia' },
  { id: 'spacejam', label: 'The Space Jam website', bin: 'int-pre', note: '1996, still online', img: 'spacejam', credit: 'Warner Bros., spacejam.com/1996' },
  { id: 'minecraft', label: 'Minecraft', bin: 'int-post', note: '2011', img: 'minecraft', credit: 'Mojang, via Reddit' },
  { id: 'fortnite', label: 'Fortnite', bin: 'int-post', note: '2017', img: 'fortnite', credit: 'Epic Games, via xboxachievements.com' },
  { id: 'roblox', label: 'Roblox', bin: 'int-post', note: '2006', img: 'roblox', credit: 'Roblox Corporation, via esports.gg' },
  { id: 'tiktok', label: 'TikTok (app)', bin: 'int-post', note: '2016', img: 'tiktok', credit: 'TikTok, App Store screenshot' },
];
// Warm-up: six of the clearest products, sector only (no era), with big pictures.
// Ids differ from the board's, so the two sorts keep separate answers.
export const SNAP = ['mrbeast', 'radio1', 'motd', 'mirror', 'minecraft', 'tiktok'].map(id => {
  const p = PRODUCTS.find(x => x.id === id);
  return { id: 'snap_' + id, label: p.label, bin: p.bin.split('-')[0], img: p.img, credit: p.credit };
});
export const SORTS = {
  board: { bins: BINS, items: PRODUCTS },
  snap: { bins: [['ami', 'Audio / moving image'], ['print', 'Print'], ['int', 'Interactive']], items: SNAP },
};

// ── 2 · Then and now: The Lion King, hand-drawn (1994) and computer-generated (2019) ──
// Clips in Y10/media.md. Questions rest on well-known facts about the two films, not on details inside the clips.
export const CHOICES = {
  then: {
    sector: { q: 'Both trailers belong to which media sector?', a: 'ami', opts: [
      ['ami', 'Audio / moving image'], ['print', 'Print, like a newspaper'], ['int', 'Interactive, like a game']] },
    historical: { q: 'Which trailer is a historical media product?', a: 'lk94', opts: [
      ['lk94', 'The Lion King (1994)'], ['lk19', 'The Lion King (2019)'], ['both', 'Both of them'], ['neither', 'Neither of them']] },
    made94: { q: 'How was the 1994 film made?', a: 'drawn', opts: [
      ['drawn', 'Drawn by hand, frame by frame'], ['cgi', 'On a computer, to look like real animals'], ['live', 'Filmed with real lions in Africa']] },
    made19: { q: 'How was the 2019 film made?', a: 'cgi', opts: [
      ['cgi', 'By computer, to look real'], ['drawn', 'Drawn by hand, like the 1994 film'], ['live', 'Filmed with real lions in Africa']] },
    same: { q: 'What stayed the same in both films?', a: 'story', opts: [
      ['story', 'The story and characters'], ['look', 'How the animals look on screen'], ['tech', 'The technology used to make it']] },
    where94: { q: 'In 1994, where would most people have seen The Lion King trailer?', a: 'cinema', opts: [
      ['cinema', 'At the cinema or on TV'], ['yt', 'On YouTube or TikTok'], ['app', 'In a streaming app like Netflix']] },
    online19: { q: "The 2019 trailer was released online. Why does that help the film's producer?", a: 'share', opts: [
      ['share', 'Fans can watch and share it anywhere'], ['fewer', 'It means fewer people go to the cinema'], ['free', 'Online trailers cost nothing at all to make']] },
  },
  // ★ Challenge: products where the sector or era isn't obvious.
  tricky: {
    setin: { q: 'Stranger Things is set in 1983 but was made in 2016. Is it historical or contemporary?', a: 'made', opts: [
      ['made', 'Contemporary: it was made in 2016'], ['set', 'Historical: the story is set in 1983'], ['both', 'Both: it depends on the episode']] },
    beano: { q: 'The Beano comic started in 1938. Is this week\'s issue historical or contemporary?', a: 'now', opts: [
      ['now', 'Contemporary: this issue was made now'], ['brand', 'Historical: the Beano brand began in 1938'], ['neither', 'Neither: comics are not media products']] },
    remake: { q: 'Disney remade The Little Mermaid (1989) in 2023. The 2023 film is…', a: 'cont', opts: [
      ['cont', 'A contemporary product'], ['hist', 'A historical product, as it is a remake'], ['none', 'Not a new media product']] },
    cross: { q: 'Which of these lives in more than one sector?', a: 'mc', opts: [
      ['mc', 'Minecraft: game, film and books'], ['pac', 'The original 1980 Pac-Man arcade game'], ['paper', 'One newspaper front page from 1966']] },
  },
};

// ── 3 and 4 · Writing (evidence for Classroom; checked for real sentences only) ──
export const WRITING = {
  compare: [
    { id: 'diff', prompt: 'Give one difference between the 1994 trailer and the 2019 trailer. Say what you noticed in each.',
      starter: 'The 1994 trailer… whereas the 2019 trailer…', minWords: 10 },
    { id: 'why', prompt: 'Why do you think the two trailers look so different? Think about the technology in 1994 and in 2019.',
      starter: 'I think they look different because…', minWords: 8 },
  ],
  day: [
    { id: 'day_ami', prompt: 'An audio / moving image product you watched or listened to in the last 24 hours', short: true },
    { id: 'day_print', prompt: 'A print product you saw in the last week (a poster, a magazine, a packet, a newspaper…)', short: true },
    { id: 'day_int', prompt: 'An interactive product you used in the last 24 hours', short: true },
    { id: 'day_most', prompt: 'Which of your three do you use most, and why?', starter: 'I use … the most because…', minWords: 8 },
  ],
  // ★ Challenge: think like a producer.
  remake: [
    { id: 'rm_pick', prompt: 'Pick one historical product from the Media Board', short: true },
    { id: 'rm_today', prompt: 'If it were made today, what would change? Think about the technology, where people would find it, and who it would be for.',
      starter: 'If … were made today, it would… because…', minWords: 25 },
    { id: 'rm_why', prompt: 'Why might a company remake an old product (like The Lion King in 2019) instead of making something new?',
      starter: 'A company might remake an old product because…', minWords: 15 },
  ],
};

// No reveal or spot tasks in this lesson (the engine imports both).
export const REVEALS = {};
export const SPOTS = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
// Include the lesson's spec terms wherever they turn up as answer options, plus everyday-but-tricky words
// (shareholders, poverty, box office); leave out words students know (entertain, volunteers, streaming).
export const GLOSSARY = [
  // Lesson terms
  ['sectors?', 'One of the three kinds of media: audio/moving image, print or interactive'],
  ['historical', 'In this course: a media product first made before 2000'],
  ['contemporary', 'In this course: a media product made in 2000 or later'],
  ['eras?', 'A period of time, such as "before 2000"'],
  ['producers?', 'The company or person who makes a media product'],
  ['CGI|computer-generated', 'Pictures made on a computer, often to look real'],
  ['remakes?|remade', 'A new version of an old film, show or game'],
  // Everyday-but-tricky words
  ['catalogue', 'A printed book of everything a shop sells'],
  ['billboards?', 'A giant poster beside a road, used for adverts'],
  ['arcade', 'Coin-operated video game machines, found in arcades'],
  ['frame by frame', 'One still picture at a time: many in a row make it move'],
  ['studio', 'A company that makes films'],
  ['brand', 'The name a company puts on its products so people know them'],
  ['issue', "One copy of a magazine or comic, such as this week's"],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking (from the template) ─────────────────────────────────────────────────────────────────
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
