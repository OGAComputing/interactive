// checkers.js for a page built from _templates/BTEC_Y10.html — copy it beside the page as
// checkers.js and replace the example data. Pure functions and data only (no DOM), so
// checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. kind: 'choice' (radio questions), 'sort' (cards into bins),
// 'write' (open writing: completion only, never auto-marked, always gold), 'reveal' (clue-by-clue
// rounds), 'spot' (find and fix the slips in a paragraph), 'spectrum' (cards placed on a line between
// two ends) or 'hunt' (live research: find a fact, paste its link). Vary them: no lesson should run the
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

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = {};   // e.g. { 2: 'motive' }
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


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
// Structure for longer writing (Nick, 2026-11-06): group = a heading before the question (e.g. a sector);
// tone = 'pur' | 'mot' | 'aim' colours the box like the decks; ask = the question to ask yourself;
// words = [[word, …], …] word banks shown under the starter: the answer must use one word from each bank.
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
// lines: true puts each sentence on its own line (a research log, a list of survey questions).
// Use for: the common slips (profit as a purpose, wrong producer type, leading survey questions, weak evidence).
export const SPOTS = {};

// ── Spectrum (kind 'spectrum'): place cards on a line between two ends ──
// { taskKey: { ends: [left, right], zones: [[key, label], …], items: [{ id, label, ok: [zoneKey, …], note? }], why?: [writing] } }
// Zones run left to right. A clear case accepts the one or two zones at its end; a middle case accepts a wider
// range (that's what makes it a spectrum, not a sort). why = writing questions (as in WRITING, usually with word
// banks) shown under the line: students justify their placements. A wrong place costs gold and starts the
// cooldown; a why box that isn't a real sentence goes red but is never penalised. note shows on the card once done.
// Markup: <div class="sort spectrum" data-spectrum="t5"><div class="tray"></div><div class="bins"></div></div>,
// with the usual check, reset and feedback. Clicks, keys 1–9 and drags work as in a sort.
// Use for: reliable ↔ unreliable sources, passive ↔ active audiences, preferred ↔ oppositional readings.
export const SPECTRUMS = {};

// ── Hunt (kind 'hunt'): a live research mission; each row becomes a research-log entry and a reference ──
// { taskKey: { note?: { prompt, starter, words, minWords, primaryPrompt?, primaryStarter?, primaryWords? },
//   rows: [{ id, label, sector?, img?, credit?, q, accept?: [answer, …], primary?: true, pick?: 'label', note? }] } }
// For each row students write the fact (q), paste the link to the page it came from, say who made that page,
// and write the note (why the source can be trusted). accept = accepted answers (a match anywhere, ignoring case,
// spaces and punctuation): a wrong fact costs gold and starts the cooldown. Without accept the fact must be a
// real sentence. primary: a primary-research row (what a person said; no link; uses the primary… note fields).
// pick: the student chooses the product, and pick is the label of that box. Links must be real web addresses,
// different on each row, and not a search results page. Done hunts show a reference list; the task can be saved
// again, and Try for Gold clears only the checked facts.
// Markup: <div class="hunt" data-hunt="t6"></div> with the usual check, reset and feedback.
export const HUNTS = {};

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
