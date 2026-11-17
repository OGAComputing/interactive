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
  return Object.fromEntries(WRITING[taskKey].map(w => {
    const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords) && ownWords(w, given[w.id]);
    const differs = !w.differentFrom || squash(given[w.id]) !== squash(given[w.differentFrom]);
    return [w.id, real && differs && !twice.has(w.id)];
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
