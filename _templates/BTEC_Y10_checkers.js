// checkers.js for a page built from _templates/BTEC_Y10.html — copy it beside the page as
// checkers.js and replace the example data. Pure functions and data only (no DOM), so
// checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. kind: 'choice' (radio questions), 'sort' (cards into bins),
// 'write' (open writing: completion only, never auto-marked, always gold), 'reveal' (clue-by-clue
// rounds) or 'spot' (find and fix the slips in a paragraph). Vary them: no lesson should run the
// same kind in two tabs in a row (Y10/CLAUDE.md).
// Optional extra tabs take level: 'support' (a Warm-up for students who need a way in) or
// 'challenge' (an extension). They don't count towards the score; put them at the END of this
// list so the core tasks keep indexes 0, 1, 2…, and give their tabs class="tab support|challenge".
export const TASKS = [
  { key: 't0', kind: 'choice' },
  { key: 't1', kind: 'sort' },
  { key: 't2', kind: 'write' },
];
export const TASK_COUNT = TASKS.length;

// ── Multiple choice: { taskKey: { questionId: { q, a, opts: [[key, text], …] } } } ──
// Keep the options a similar length: the right answer must not be the longest.
export const CHOICES = {
  t0: {
    c1: { q: 'FILL IN: question', a: 'b', opts: [['a', 'FILL IN: option'], ['b', 'FILL IN: right one'], ['c', 'FILL IN: option']] },
  },
};

// ── Sorts: { taskKey: { bins: [[key, label], …], items: [{ id, label, bin, img?, credit?, note? }] } } ──
// img = a key in the page's IMG-DATA block; credit = its source (shown under the bins);
// note = shown on the card once the task is done (e.g. the year it came out).
export const SORTS = {
  t1: {
    bins: [['x', 'FILL IN: bin X'], ['y', 'FILL IN: bin Y']],
    items: [
      { id: 'i1', label: 'FILL IN: card 1', bin: 'x' },
      { id: 'i2', label: 'FILL IN: card 2', bin: 'y' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
// short = a one-line name (a product, a caption), checked only for being a real name.
// differentFrom = another answer's id that this one must not repeat.
export const WRITING = {
  t2: [{ id: 'w1', prompt: 'FILL IN: prompt', starter: 'FILL IN: sentence starter…', minWords: 6 }],
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
// Use for: the common slips (profit as a purpose, wrong producer type, leading survey questions, weak evidence).
export const SPOTS = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
// Include the lesson's spec terms wherever they turn up as answer options, plus everyday-but-tricky words
// (shareholders, poverty, box office); leave out words students know (entertain, volunteers, streaming).
export const GLOSSARY = [];
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
  return Object.fromEntries(WRITING[taskKey].map(w => {
    const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords);
    const differs = !w.differentFrom || squash(given[w.id]) !== squash(given[w.differentFrom]);
    return [w.id, real && differs];
  }));
}
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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
