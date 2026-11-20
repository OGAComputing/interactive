// checkers_readings.js for 2_Same_Text_Different_Readings.html (Y10 BTEC Component 1, Lesson 3.3, spec A1:
// audience responses: preferred, negotiated and oppositional readings; audience involvement: passive audiences).
// The hypodermic needle model is only in Pearson's Teacher Guide, not the spec, so the page says "passive audience" instead
// (Nick, 2026-11-20: spec terms only).
// Built from _templates/BTEC_Y10_checkers.js (which documents every task kind's data and markup).
// Pure functions and data only (no DOM), so checkers_readings.test.js can test every answer in Vitest.
//
// The lesson's second half: the Unit A check (1_Unit_A_Check.html) takes the first 25–30 minutes, so this page is
// short (about 30 minutes; Nick, 2026-11-20). Part 1 is the old idea (a passive audience: War of the Worlds 1938);
// Part 2 is the idea that replaced it (readings: Coca-Cola's AI "Holidays Are Coming", John Lewis's Snapper).

// ── Task list ────────────────────────────────────────────────────────────
// Core kinds: choice → sort → write (no two in a row the same; one core sort, the Warm-up is a sort too).
// Spec terms, each in two core tasks: passive audience (Task 1 identify, Task 3 use);
// preferred, negotiated, oppositional (Task 2 identify, Task 3 use).
export const TASKS = [
  { key: 'panic', kind: 'choice' },                               // 1 · The panic that wasn't: War of the Worlds and a passive audience
  { key: 'reads', kind: 'sort', part: 2 },                        // 2 · Three readings: viewers' comments on Coca-Cola's AI advert
  { key: 'snapper', kind: 'write', part: 2 },                     // 3 · Snapper: three readings of one advert, and passive or active
  { key: 'warm', kind: 'sort', level: 'support' },                // Warm-up · Passive or active? (from 3.1; definitions open)
  { key: 'papers', kind: 'write', level: 'challenge' },           // ★ Why did the papers say panic? (Part 1, while waiting)
  { key: 'mine', kind: 'write', level: 'challenge', part: 2 },    // ★ This year's advert: your own readings (Part 2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Part 2 (the three readings) opens with the word on its task slide.
export const UNLOCK = { 2: 'trucks' };
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// ISYS (I Say, You Say), worded the same on the deck's key-term slides, the page's .terms boxes and the glossary.
export const ISYS = [
  ['Passive audience', 'takes the message in'],
  ['Preferred reading', "the producer's meaning"],
  ['Oppositional reading', 'rejects the message'],
];

// ── Task 1: multiple choice ──
// The first two follow the two audio clips: two listeners, two reactions (Nick, 2026-11-20: the part didn't land without
// hearing it). Frank is Cantril's (1940) finding: many listeners switched over from a comedy show on another station at
// about 8:12, so they missed the opening announcement that it was a play.
export const CHOICES = {
  panic: {
    n_ruth: { q: 'Ruth turned on her radio at 8 pm and heard Clip 1 from the very start. How was she most likely to react when the bulletins began?', a: 'play', opts: [
      ['play', 'She enjoyed it as a story: it had said it was a play'],
      ['flee', 'She ran out of the house to get away from the Martians'],
      ['police', 'She phoned the police to warn them about the explosions'],
      ['off', 'She switched off, sure the radio had broken down']] },
    n_frank: { q: 'Frank was listening to a comedy show on another station. At about 8:12 he switched over, a few minutes before Clip 2. Why might he be scared, when Ruth was not?', a: 'missed', opts: [
      ['missed', 'He missed the start, which said it was a play'],
      ['loud', 'His radio set was much louder than the one Ruth had'],
      ['version', 'His station played a scarier version of the play'],
      ['paper', 'He had read about Martians in that morning\'s paper']] },
    n_theory: { q: 'In 1938 many people believed the media puts one message into everyone\'s head, and they all react the same way. What kind of audience did they think it was?', a: 'pas', opts: [
      ['pas', 'A passive audience'], ['act', 'An active audience'],
      ['sec', 'A secondary audience'], ['pri', 'A primary audience']] },
    n_papers: { q: 'The day after War of the Worlds, newspapers said thousands of listeners ran from their homes in fear of Martians. If that were true, what would it show?', a: 'same', opts: [
      ['same', 'Everyone took in the message the same way'],
      ['chose', 'Listeners chose the play to meet their own needs'],
      ['part', 'Listeners took part, like voting on a show'],
      ['few', 'Only a small secondary audience heard it']] },
    n_found: { q: 'Researchers later found that most listeners did not panic. Many were not even tuned in, and many who were knew it was a play. What does that show?', a: 'diff', opts: [
      ['diff', 'Audiences don\'t all react to a message the same way'],
      ['right', 'Everyone who heard it believed the Martians were real'],
      ['cut', 'The radio station stopped the play before it reached the end'],
      ['none', 'Only the people who missed the whole play were safe']] },
    n_check: { q: 'Some listeners checked another station or a newspaper, and calmed down. What kind of audience were they being?', a: 'act', opts: [
      ['act', 'An active audience'], ['pas', 'A passive audience'],
      ['sec', 'A secondary audience'], ['pri', 'A primary audience']] },
    n_now: { q: 'A newspaper headline says: "Violent video games turn children violent." What does the headline believe about players?', a: 'pas', opts: [
      ['pas', 'They are a passive audience'],
      ['act', 'They are an active audience, who question it'],
      ['ug', 'They choose games to meet their own needs'],
      ['sec', 'They are only the secondary audience']] },
  },
};

// ── Sorts: { taskKey: { bins, items: [{ id, label, bin }] } } ──
export const READINGS = [['pref', 'Preferred reading'], ['neg', 'Negotiated reading'], ['opp', 'Oppositional reading']];
export const SORTS = {
  // Warm-up (from 3.1): passive or active? Definitions open above it. The last card leads into Task 1.
  warm: {
    bins: [['pas', 'Passive audience'], ['act', 'Active audience']],
    items: [
      { id: 'w_radio', label: 'Having the radio on in the kitchen while you eat breakfast', bin: 'pas' },
      { id: 'w_ads', label: 'Sitting through the adverts before a film at the cinema', bin: 'pas' },
      { id: 'w_tiktok', label: 'Letting TikTok play video after video without liking or commenting', bin: 'pas' },
      { id: 'w_vote', label: 'Voting for your favourite act on the Eurovision app', bin: 'act' },
      { id: 'w_reply', label: 'Replying under a Sidemen video to say the joke went too far', bin: 'act' },
      { id: 'w_check', label: 'Checking another website to see if a shocking news story is true', bin: 'act' },
    ],
  },
  // Task 2: imaginary viewers' comments on Coca-Cola's 2024 AI-made "Holidays Are Coming" (three per reading).
  reads: {
    bins: READINGS,
    items: [
      { id: 'r_back', label: '"The trucks are back! Now it finally feels like Christmas."', bin: 'pref' },
      { id: 'r_family', label: '"Those lights make me want a Coke with my family this Christmas."', bin: 'pref' },
      { id: 'r_kid', label: '"Same trucks and song as when I was little. Coca-Cola just is Christmas."', bin: 'pref' },
      { id: 'r_faces', label: '"I still got that Christmas feeling, but the faces looked a bit odd."', bin: 'neg' },
      { id: 'r_artists', label: '"Love the trucks and the song. I just wish real artists had made it."', bin: 'neg' },
      { id: 'r_cheap', label: '"It\'s festive, fair enough. I\'ll still buy whichever drink is cheapest."', bin: 'neg' },
      { id: 'r_money', label: '"A computer made this to save money. That isn\'t the Christmas spirit."', bin: 'opp' },
      { id: 'r_sugar', label: '"Christmas is about people, not a company selling sugary drinks."', bin: 'opp' },
      { id: 'r_jobs', label: '"This put real animators out of work. I\'m not buying Coke this year."', bin: 'opp' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
export const PASSIVE_WORDS = ['passive'];
export const SNAPPER_EVIDENCE = [
  'John Lewis\'s Christmas advert for 2023, shown on TV, YouTube and social media.',
  'A boy grows a Venus flytrap, called Snapper, to be his family\'s Christmas tree.',
  'Snapper grows huge and causes chaos, so the family put it outside. At Christmas they gather round it: it is part of the family, because the boy loves it.',
  'The advert\'s message is that Christmas traditions can change and grow.',
  'Many families wait for the John Lewis advert every November, and the papers review it.',
  'Some viewers loved how funny and odd it was. Others said it was not as moving as older John Lewis adverts, like The Man on the Moon (2015).',
];
export const WRITING = {
  // Task 3: one advert, three readings, then why its viewers weren't one passive audience.
  snapper: [
    { id: 's_pref', group: 'Preferred reading', prompt: 'What does John Lewis want viewers to take from Snapper?',
      ask: 'Who made it and why? A shop, at Christmas, with a message about traditions.',
      starter: 'The preferred reading is that …', minWords: 12, words: [['preferred']] },
    { id: 's_neg', group: 'Negotiated reading', prompt: 'Who might accept some of it, but not all? Which part, and why?',
      ask: 'Think of a viewer who likes part of it, but not the rest.',
      starter: 'A negotiated reading would be … because …', minWords: 12, words: [['negotiated']] },
    { id: 's_opp', group: 'Oppositional reading', prompt: 'Who might reject the message? Why?',
      ask: 'Think of a viewer who disagrees with what John Lewis meant, or with the advert itself.',
      starter: 'An oppositional reading would be … because …', minWords: 12, words: [['oppositional']] },
    { id: 's_passive', group: 'Passive or active?', prompt: 'Were Snapper\'s viewers a passive audience, all taking in the same message?',
      ask: 'Did everyone read it the same way?',
      starter: 'A passive audience would … , but Snapper …', minWords: 15,
      words: [PASSIVE_WORDS, ['reading', 'readings', 'different', 'same way', 'active']] },
  ],
  // ★ Part 1 challenge: why the papers made the panic sound big, and the same belief today.
  papers: [
    { id: 'p_why', prompt: 'Why might newspapers in 1938 have made the panic sound bigger than it really was?',
      ask: 'Use the clue in the box above.', starter: 'Newspapers might have … because …', minWords: 15 },
    { id: 'p_now', prompt: 'Think of a story today that blames a game, app or show for how people behave. Does it treat the audience as passive?',
      ask: 'Would every player or viewer act the same way?', starter: 'Some people say … This treats the audience as passive because …', minWords: 15,
      words: [PASSIVE_WORDS] },
  ],
  // ★ Part 2 challenge: a Christmas advert from this year, read two ways.
  mine: [
    { id: 'm_ad', group: 'Your advert', prompt: 'A Christmas advert from this year (the brand)', short: true },
    { id: 'm_pref', prompt: 'Its preferred reading', ask: 'What does the brand want you to think, feel or do?',
      starter: 'The preferred reading is …', minWords: 12, words: [['preferred']] },
    { id: 'm_opp', prompt: 'An oppositional reading, and who might have it', ask: 'Who would reject the message, and why?',
      starter: 'An oppositional reading would be … , for someone who …', minWords: 12, words: [['oppositional']] },
  ],
};

export const REVEALS = {};
export const SPOTS = {};
export const FIXES = {};
export const SPECTRUMS = {};
export const HUNTS = {};
export const PROFILES = {};
export const NUMBERS = {};
export const PILOTS = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The spec terms use the ISYS facts word for word. Meanings ≤ 80 characters.
export const GLOSSARY = [
  ['preferred readings?', "The producer's meaning: what the producer wants the audience to take from it"],
  ['negotiated readings?', "Accepting some of the producer's meaning, but not all of it"],
  ['oppositional readings?', 'Rejects the message: the audience disagrees with what the producer meant'],
  ['passive(?: audiences?)?', 'Takes the message in, without doing anything back or questioning it'],
  ['active audiences?', 'Does something with the media: votes, replies, makes or questions it'],
  ['uses and gratifications', 'A theory: the audience is active, choosing media to meet its needs'],
  ['Martians?', 'Imaginary creatures from the planet Mars'],
  ['panic(?:ked)?', 'Sudden, wild fear that stops people thinking clearly'],
  ['researchers?', 'People who study something carefully to find out what is true'],
  ['bulletins?', 'A short news report that breaks into a programme'],
  ['announcer', 'The person on the radio who says what is coming next'],
  ['exaggerated?', 'Made to sound bigger or worse than it really was'],
  ['advertisers?', 'Companies that pay to put their adverts somewhere'],
  ['generative AI', 'Software that makes new pictures, video or text when you ask it to'],
  ['animators?', 'People who make drawings or models move on screen'],
  ['festive', 'Full of the feeling of Christmas or a celebration'],
  ['Venus flytrap', 'A plant that snaps shut to catch and eat insects'],
  ['traditions?', 'Something a family or group does the same way every year'],
  ['chaos', 'A wild mess, where everything goes wrong at once'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking (copied from _templates/BTEC_Y10_checkers.js) ─────────────────────
export function markReveal(taskKey, given) {
  return Object.fromEntries(REVEALS[taskKey].rounds.map(r => [r.id, given[r.id] === r.a]));
}
export const starsFor = shown => Math.max(1, 4 - shown);

export function markSpotFlags(taskKey, given) {
  return Object.fromEntries(SPOTS[taskKey].parts.map(p => [p.id, !!given[p.id] === !!p.fix]));
}
export function markSpot(taskKey, given) {
  const res = markSpotFlags(taskKey, given);
  for (const p of SPOTS[taskKey].parts) if (p.fix) res[p.id + '_fix'] = given[p.id + '_fix'] === p.fix.a;
  return res;
}

export function markFixLines(lines, given) {
  return Object.fromEntries(lines.filter(l => given[l.id]).map(l => [l.id, given[l.id] === l.a]));
}
export const markFix = (taskKey, given) => markFixLines(FIXES[taskKey].lines, given);
export const fixLeftLines = (lines, given) => lines.filter(l => l.a !== 'keep' && !given[l.id]).length;
export const fixLeft = (taskKey, given) => fixLeftLines(FIXES[taskKey].lines, given);

// ── Guards against gaming a check (Nick, 2026-11-17) ─────────────────────────
const wordsOf = t => String(t || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
export function binCounts(items) {
  const n = {};
  for (const it of items) n[it.bin] = (n[it.bin] || 0) + 1;
  return n;
}
export function sortBlocker(sort, given) {
  if (sort.items.some(it => !given[it.id])) return sort.zones ? '📥 Place every card on the line first.' : '📥 Put every card in a box first.';
  if (!sort.bins) return '';
  const want = binCounts(sort.items);
  const off = sort.bins.some(([b]) => sort.items.filter(it => given[it.id] === b).length !== (want[b] || 0));
  return off ? '📥 Each box takes the number of cards shown on it. Move cards until every box is full.' : '';
}
export const unansweredBlocker = (ids, given) =>
  ids.some(id => !String(given[id] ?? '').trim()) ? '📥 Answer every question first.' : '';
export function overBlocker(n, slips, noun, verb = 'flagged', thing = '', undo = 'Un-flag the ones you are least sure of.') {
  if (n <= slips) return '';
  return `📥 You've ${verb} ${n}${thing}, but there ${slips === 1 ? `is only 1 ${noun}` : `are only ${slips} ${noun}s`}. ${undo}`;
}
export const tooManyWrong = (res, ids) => ids.length > 0 && ids.filter(id => res[id] === false).length * 2 > ids.length;
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
export function pilotAgain(line, text) {
  const a = line.slip.again.find(x => !x.when || new RegExp(x.when, 'i').test(String(text ?? '')));
  return a ? [].concat(a.show) : [];
}
export function markNumbers(taskKey, given) {
  return Object.fromEntries(NUMBERS[taskKey].qs.map(q => [q.id, q.opts ? given[q.id] === q.a
    : Math.abs(parseNumber(given[q.id]) - q.a) <= (q.tol || 0)]));
}
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
export function markHunt() { return {}; }
export function softIds() { return new Set(); }
export function isSearchLink() { return false; }

// Does the text use this word or phrase in any form? Each word of 3+ letters must appear as the start of a word.
export function usesWord(text, phrase) {
  const words = String(text || '').toLowerCase().split(/[^a-z]+/);
  return phrase.toLowerCase().split(/[^a-z]+/).filter(x => x.length >= 3)
    .every(x => words.some(w => w.startsWith(x.slice(0, Math.max(4, Math.min(x.length - 3, 5))))));
}
export function isRealName(text) {
  const t = String(text || '').trim();
  return (t.match(/[a-z]/gi) || []).length >= 2 && new Set(t.toLowerCase().replace(/\s/g, '')).size >= 2;
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
export function cooldownSeconds() {
  return 10;
}

// House scoring, with the assessment rule: a once task scores the share right; weight counts a task n times.
export function calcScore(completed, firstAttempt, answers = {}) {
  const idx = coreTasks(), w = i => TASKS[i].weight || 1;
  const total = idx.reduce((sum, i) => sum + w(i), 0);
  const pts = idx.filter(i => completed[i]).reduce((sum, i) =>
    sum + w(i) * (TASKS[i].once ? onceShare(TASKS[i].key, answers) * 100 : 80 + (firstAttempt[i] ? 20 : 0)), 0);
  return Math.round(pts / total);
}
export function onceShare(taskKey, given) {
  const v = Object.values(markChoices(taskKey, given));
  return v.length ? v.filter(Boolean).length / v.length : 0;
}
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
