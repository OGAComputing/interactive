// Lesson 1.0 Course Introduction (single-first class only): data for 1_Course_Introduction.html.
// Both tasks are a baseline: completion only, never auto-marked, so finishing scores 100%.
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

export const TASKS = [
  { key: 'me', kind: 'write' },        // 1 · My media
  { key: 'baseline', kind: 'write' },  // 2 · Baseline: read a poster
];
export const TASK_COUNT = TASKS.length;

export const CHOICES = {};
export const SORTS = {};

export const WRITING = {
  me: [
    { id: 'fav_watch', prompt: 'Something you love to watch or listen to (a film, show, YouTuber, podcast, radio…)', short: true },
    { id: 'fav_read', prompt: 'Something printed you have read or noticed (a magazine, comic, poster, packet…)', short: true },
    { id: 'fav_play', prompt: 'A game, app or website you use most', short: true },
    { id: 'hope', prompt: 'What would you most like to make on this course, and why?', starter: 'I would like to make… because…', minWords: 8 },
  ],
  baseline: [
    { id: 'b_what', prompt: 'What is this product, and where would you expect to see it?', starter: 'This is… You would see it…', minWords: 8 },
    { id: 'b_who', prompt: 'Who is it made for? Give two clues from the poster that tell you.', starter: 'It is made for… I can tell because…', minWords: 12 },
    { id: 'b_detail', prompt: 'Pick one detail: a colour, a character, the way someone stands, the words. What does it make you think or feel?', starter: 'The … makes me think…', minWords: 10 },
    { id: 'b_why', prompt: 'Why did the company make this poster? What do they want you to do?', starter: 'They made it to…', minWords: 8 },
  ],
};

// ── Marking (from the template) ─────────────────────────────────────────────
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
    return [w.id, real && differs];
  }));
}
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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
