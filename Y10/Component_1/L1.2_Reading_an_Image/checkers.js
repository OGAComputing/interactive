// Lesson 1.2 Reading an Image: data and marking for 1_Reading_an_Image.html (pure, no DOM).
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (reading a poster: Tasks 1–3) is open from the start; Part 2 (Photoshop: Task 4) opens with
// UNLOCK[2], shown on the deck's "One photo, two captions" task slide.
export const TASKS = [
  { key: 'jaws', kind: 'sort' },      // 1 · Worked model: Jaws (incl. encoding), then sort denotation / connotation
  { key: 'anchor', kind: 'choice' },  // 2 · Anchorage, polysemy and encoding (Jaws tagline, Barbie)
  { key: 'spider', kind: 'write' },   // 3 · Your turn: the Spider-Verse poster
  { key: 'caption', kind: 'write', part: 2 },  // 4 · Photoshop: polysemy, then two captions that anchor two meanings
  { key: 'words', kind: 'sort', level: 'support' },      // Warm-up · Match the words
  { key: 'retag', kind: 'write', level: 'challenge' },   // ★ Rewrite the meaning (Part 1, while waiting)
  { key: 'third', kind: 'write', level: 'challenge', part: 2 },  // ★ A third meaning (Part 2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'layers' };   // shown on the Part 2 task slide
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


// ── 1 · Denotation or connotation? Statements about the Jaws poster (1975) ──
// None repeats the worked model on the page. Every statement is checkable on the poster.
export const SORTS = {
  jaws: {
    bins: [['den', 'Denotation: what you can see'], ['con', 'Connotation: what it suggests']],
    items: [
      { id: 'd_title', label: 'The title JAWS is in big red capital letters', bin: 'den' },
      { id: 'd_dark', label: 'The water gets darker towards the bottom', bin: 'den' },
      { id: 'd_teeth', label: "The shark's open mouth is full of sharp teeth", bin: 'den' },
      { id: 'd_size', label: 'The swimmer is much smaller than the shark', bin: 'den' },
      { id: 'c_red', label: 'The red title hints at blood and danger', bin: 'con' },
      { id: 'c_hidden', label: 'The deep water hides threats we cannot see', bin: 'con' },
      { id: 'c_killer', label: 'The shark is a killer, not just an animal', bin: 'con' },
      { id: 'c_helpless', label: 'The swimmer is weak and helpless', bin: 'con' },
    ],
  },
  // Warm-up: the page shows the five meanings, so students sort two simple examples per word.
  words: {
    bins: [['den', 'Denotation'], ['con', 'Connotation'], ['anc', 'Anchorage'], ['poly', 'Polysemy'], ['enc', 'Encoding']],
    items: [
      { id: 'w_den_ex2', label: 'A woman is swimming at the top of the sea', bin: 'den' },
      { id: 'w_den_ex', label: 'There is a shark in the water', bin: 'den' },
      { id: 'w_con_ex2', label: 'The deep, dark water feels scary', bin: 'con' },
      { id: 'w_con_ex', label: 'The shark feels dangerous', bin: 'con' },
      { id: 'w_anc_ex2', label: 'The caption "He’s just Ken" tells us whose film it is', bin: 'anc' },
      { id: 'w_anc_ex', label: 'The tagline says "terrifying"', bin: 'anc' },
      { id: 'w_poly_ex2', label: 'A smile could mean happy, nervous or fake', bin: 'poly' },
      { id: 'w_poly_ex', label: 'A runner could be late, scared or training', bin: 'poly' },
      { id: 'w_enc_ex2', label: 'The designers made the swimmer tiny so she looks helpless', bin: 'enc' },
      { id: 'w_enc_ex', label: 'The designers chose red for the title', bin: 'enc' },
    ],
  },
};

// ── 2 · Anchorage, polysemy and encoding ──────────────────────────────────────────────
// Option lengths checked: the right answer is never the longest.
export const CHOICES = {
  anchor: {
    tagline: { q: 'The Jaws poster says "The terrifying motion picture from the terrifying No. 1 best seller." What job do these words do?', a: 'fix', opts: [
      ['fix', 'They fix the meaning: this film will scare you'],
      ['cast', 'They tell you which famous actors star in the film'],
      ['date', 'They tell you the date the film comes out in cinemas']] },
    ken: { q: 'On the Barbie poster, the caption says "She\'s everything. He\'s just Ken." What does it tell us about the two characters?', a: 'star', opts: [
      ['star', 'Barbie is the star and Ken is the sidekick'],
      ['hero', 'Ken is the hero who saves Barbie in the end'],
      ['equal', 'Barbie and Ken are equally important to the story']] },
    pink: { q: 'Which of these is a connotation of the pink on the Barbie poster?', a: 'fun', opts: [
      ['fun', 'Fun, playful and girly'],
      ['bg', 'The background is bright pink'],
      ['rating', 'The film is rated 12A in the UK']] },
    anc: { q: 'A news photo shows a crowd in the street. Its caption says "Fans celebrate the big win". Which word names the job the caption does?', a: 'anc', opts: [
      ['anc', 'Anchorage'], ['poly', 'Polysemy'], ['den', 'Denotation'], ['con', 'Connotation']] },
    enc: { q: 'The Jaws designers made the swimmer tiny and the shark huge, on purpose, so we would feel she is helpless. Which word names what they did?', a: 'enc', opts: [
      ['enc', 'Encoding'], ['anc', 'Anchorage'], ['den', 'Denotation'], ['poly', 'Polysemy']] },
    poly: { q: 'Which word means that an image can be read in more than one way?', a: 'poly', opts: [
      ['poly', 'Polysemy'], ['anch', 'Anchorage'], ['den', 'Denotation'], ['con', 'Connotation']] },
  },
};

// ── 3 and 4 · Writing (evidence for Classroom; checked for real sentences only) ──
export const WRITING = {
  spider: [
    { id: 'sv_den', prompt: 'Denotation: name two things you can see on the Spider-Verse poster.',
      starter: 'I can see… and…', minWords: 6 },
    { id: 'sv_con', prompt: 'Connotation: pick one of them. What does it suggest, and why?',
      starter: 'The … suggests … because…', minWords: 10 },
    { id: 'sv_anc', prompt: 'Anchorage: how do the words "Across the Spider-Verse" help explain why there are so many Spider-People on the poster?',
      starter: 'The words "Across the Spider-Verse" tell us…', minWords: 8 },
    { id: 'sv_enc', prompt: 'Encoding: pick one thing the designers chose on purpose. What meaning did they encode in it?',
      starter: 'The designers chose… to encode…', minWords: 10 },
  ],
  caption: [
    { id: 'cap_poly', prompt: 'Polysemy: before you add any words, write two different things your photo could mean.',
      starter: 'My photo could mean… or it could mean…', minWords: 10 },
    { id: 'cap1', prompt: 'Caption 1 (type exactly what you put on the photo)', short: true },
    { id: 'mean1', prompt: 'Anchorage: which meaning does caption 1 fix on the photo?', starter: 'Caption 1 anchors the photo to mean…', minWords: 8 },
    { id: 'cap2', prompt: 'Caption 2: change the meaning completely', short: true, differentFrom: 'cap1' },
    { id: 'mean2', prompt: 'Anchorage: which meaning does caption 2 fix on the photo?', starter: 'Caption 2 anchors it to mean…', minWords: 8, differentFrom: 'mean1' },
  ],
  // ★ Challenge: change the anchorage of a real poster, then read one image two ways.
  retag: [
    { id: 'rt_genre', prompt: 'Pick a new genre for the Jaws poster: comedy, nature documentary, romance, or your own idea', short: true },
    { id: 'rt_tag', prompt: 'Write a new tagline for the same picture that fits your genre', short: true },
    { id: 'rt_how', prompt: 'How does your tagline change the way the same image is read? Use the words denotation, connotation and anchorage.',
      starter: 'The denotation stays the same: … But my tagline anchors…', minWords: 25 },
    { id: 'rt_two', prompt: 'Give two different readings of the Spider-Verse poster. Which one do you think the producers wanted, and what on the poster tells you?',
      starter: 'One reading is… Another reading is… I think the producers wanted… because…', minWords: 30 },
  ],
  // ★ Challenge (Part 2, after Task 4): a third reading of the same photo, then choose like an editor.
  third: [
    { id: 'th_cap', prompt: 'Caption 3: a third meaning for your Task 4 photo, different from both of your captions', short: true },
    { id: 'th_mean', prompt: 'Anchorage: which meaning does caption 3 fix, and how is it different from captions 1 and 2?',
      starter: 'Caption 3 anchors the photo to mean… This is different because…', minWords: 15 },
    { id: 'th_pick', prompt: 'A newspaper wants to print your photo. Which of your three captions would it choose, and why? Think about who reads it.',
      starter: 'A newspaper would choose caption … because its readers…', minWords: 20 },
  ],
};

// The three Pexels photos for task 4 (free to use, no attribution needed).
export const PHOTOS = [
  ['running', 'Someone running down a city street at night'],
  ['stairs', 'Someone sitting on the stairs, head in hands'],
  ['window', 'A girl looking up, behind a rainy window'],
];

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
  // Lesson terms, wherever they turn up as answers
  ['denotation', 'What you can actually see or hear, with no opinions'],
  ['connotations?', 'What something suggests: the ideas and feelings it gives you'],
  ['anchorage|anchors?|anchored', "Words that fix an image's meaning, so we read it one way"],
  ['polysemy', 'When an image can be read in more than one way'],
  ['encod(?:e|es|ed|ing)', 'Putting a meaning in on purpose, through the choices you make'],
  ['decode|decoding', 'Work out the meaning that someone put in'],
  ['readings?', 'Ways of understanding what something means'],
  ['taglines?', 'A short, catchy line on a poster that sums up the film'],
  ['captions?', 'Words on or beside a picture that say what it shows'],
  ['genre', 'A type of film or story, such as horror, comedy or romance'],
  // Everyday-but-tricky words
  ['motion picture', 'An old-fashioned name for a film'],
  ['best seller', 'A book that sells a huge number of copies'],
  ['documentary', 'A film about real life and real facts'],
  ['sidekick', "The hero's helper, less important than the hero"],
  ['12A', 'UK age rating: under-12s must watch with an adult'],
  ['helpless', 'Not able to protect yourself'],
  ['threats?', 'Something that could cause harm'],
  ['layers?', 'In Photoshop: a see-through sheet; text sits on its own layer'],
  ['export', 'Save a copy as a new kind of file, such as a JPG'],
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
