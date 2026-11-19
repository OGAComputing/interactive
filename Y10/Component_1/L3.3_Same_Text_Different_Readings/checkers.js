// checkers.js for 1_Unit_A_Check.html (Y10 BTEC Component 1, Lesson 3.3): a light-touch check of Learning Aim A
// (lessons 1.1–3.2), done at the start of 3.3 before the readings are taught (Nick, 2026-11-19).
// Built from _templates/BTEC_Y10_checkers.js (which documents every task kind's data and markup).
// Pure functions and data only (no DOM), so checkers.test.js can test every answer in Vitest.
//
// It is an assessment, so it breaks two house rules on purpose:
// - No Warm-up tab and no help panels: the page opens on Task 1, and the writing has word banks but no starters.
// - The glossary leaves out the spec terms being tested (its meanings would give the answers away).

// ── Task list ───────────────────────────────────────────────────────────────
// Task 1 is marked once (once: true): one go, no cooldown, scored by the share right, and it counts twice (weight: 2),
// so the score is two thirds the terms and one third the writing (completion, read by the teacher).
export const TASKS = [
  { key: 'terms', kind: 'choice', once: true, weight: 2 },
  { key: 'apply', kind: 'write' },
  { key: 'then', kind: 'write', level: 'challenge' },
];
export const TASK_COUNT = TASKS.length;

// No lesson parts: the whole check is open from the start.
export const UNLOCK = {};
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// ── Task 1: the terms, one question per term group, each about a real product ──
// lesson = where the term was taught, so the teacher can see which lessons need revisiting.
// Every option is a real term from that lesson, and no question contains its answer or a word from its definition.
const T = (lesson, q, a, opts, pic = {}) => ({ lesson, q, a, opts, ...pic });
export const CHOICES = {
  terms: {
    q_era: T('1.1', 'Tetris for the Nintendo Game Boy came out in 1989. Which two terms describe it?', 'ih', [
      ['ih', 'Interactive and historical'], ['ic', 'Interactive and contemporary'],
      ['ph', 'Print and historical'], ['ac', 'Audio/moving image and contemporary']],
      { img: 'tetris', alt: 'Tetris on the Game Boy', credit: 'Nintendo, via Wikipedia' }),
    q_conn: T('1.2', 'A student writes about this poster: "Mufasa looks down at Simba, so he is a father who will pass his kingdom on." Which term is the student using?', 'con', [
      ['con', 'Connotation'], ['den', 'Denotation'], ['anc', 'Anchorage'], ['poly', 'Polysemy']],
      { img: 'lionking', alt: 'The Lion King (2019) poster: Mufasa and Simba on a rock at sunset', credit: 'Disney' }),
    q_anch: T('1.2', 'On the i\'s front page, "Queens of Europe!" sits above a photo of Chloe Kelly kissing a trophy. Without those words, it could be any trophy. Which term names what the headline does?', 'anc', [
      ['anc', 'Anchorage'], ['den', 'Denotation'], ['con', 'Connotation'], ['enc', 'Encoding']],
      { img: 'lionesses', alt: 'Metro and i front pages after the Lionesses won Euro 2025', credit: 'Metro and i, via BBC News' }),
    q_prod: T('1.3', 'Sony makes PlayStation consoles and games, Spider-Man films, and music by the artists on its record labels. What type of producer is Sony?', 'cong', [
      ['cong', 'Media conglomerate'], ['psb', 'Public service broadcaster'], ['ind', 'Independent producer'], ['comm', 'Community media']]),
    q_mot: T('1.3', 'Selling Ultimate Team packs in games like EA Sports FC 26 brings EA over a billion dollars a year. What is EA\'s main motivation?', 'profit', [
      ['profit', 'Generate profit'], ['psr', 'Public service responsibilities'], ['comm', 'Benefit a community'], ['self', 'Self-expression']]),
    q_aim: T('1.3', 'In a general election, BBC News gives each main party the same share of airtime, and its reporters never say who they would vote for. Which aim is this?', 'imp', [
      ['imp', 'Impartial'], ['acc', 'Accessible'], ['dist', 'Distinctive'], ['div', 'Diverse']]),
    q_res: T('2.1', 'To find out how many 12–15s use TikTok, you read Ofcom\'s yearly report on how children use media. Which kind of research is this?', 'sec', [
      ['sec', 'Secondary research'], ['pri', 'Primary research'], ['obs', 'Observation'], ['int', 'Interview']]),
    q_aud: T('2.2', 'CBeebies Bedtime Stories is made for children under 6, but many parents watch too, especially when a star like Dolly Parton reads. What are the parents?', 'sec', [
      ['sec', 'The secondary audience'], ['pri', 'The primary audience'], ['seg', 'The socio-economic group'], ['life', 'A lifestyle profile']]),
    q_seg: T('2.2', 'Most readers of the Financial Times are managers, bankers and business owners. Which part of an audience profile does this describe?', 'seg', [
      ['seg', 'Socio-economic group'], ['age', 'Age'], ['val', 'Values'], ['beh', 'Behaviour']]),
    q_life: T('2.2', 'Many Gran Turismo 7 players race for an hour most nights, with a steering wheel and pedals plugged into their PlayStation. Which part of their lifestyle is this?', 'beh', [
      ['beh', 'Behaviour'], ['int', 'Interests'], ['val', 'Values'], ['att', 'Attitudes']]),
    q_stat: T('2.3', 'Inside Out 2 took about $1.7 billion around the world in 2024, from people paying to see it on the big screen. Which kind of audience statistic is this?', 'box', [
      ['box', 'Box office'], ['sales', 'Sales'], ['circ', 'Circulation'], ['hits', 'Hits']]),
    q_meth: T('2.3', 'Six Year 10s sit round a table and talk about the Wicked: For Good trailer while you note down what they say. Which research method is this?', 'fg', [
      ['fg', 'A focus group'], ['int', 'An interview'], ['sur', 'A survey'], ['obs', 'An observation']]),
    q_sit: T('3.1', 'Ava watches the Doctor Who Christmas special live on her phone in her bedroom. Her gran watches it live on the living-room TV. Both watch it on their own. Which part of their situation is different?', 'where', [
      ['where', 'Where'], ['when', 'When'], ['who', 'Who with'], ['feat', 'Interactive features']]),
    q_inv: T('3.1', 'Most games on Roblox, like Grow a Garden, were made by players, not by the Roblox company. Which kind of audience involvement is this?', 'cgc', [
      ['cgc', 'Consumer-generated content'], ['vote', 'Online voting'], ['feat', 'Interactive features'], ['pass', 'A passive audience']]),
    q_need: T('3.2', 'Groups of friends watch I\'m a Celebrity on a video call and message each other all through every Bushtucker Trial. Which need does it meet for them?', 'si', [
      ['si', 'Social interaction'], ['pi', 'Personal identity'], ['esc', 'Escapism'], ['ent', 'Entertainment']]),
  },
};

// ── Task 2 (apply it) and the ★ challenge: open writing about The Great British Bake Off ──
// Assessment-light: one question per box and a word bank, but no sentence starters (the PSA has none).
// Every answer must use a word from each bank; the teacher reads them and judges working towards / secure / strong.
export const PRODUCER_TYPES = ['media conglomerate', 'public service broadcaster', 'independent producer', 'community media'];
export const PURPOSES = ['entertain', 'inform', 'educate', 'inspire', 'persuade', 'challenge', 'raise awareness'];
export const MOTIVATIONS = ['generate profit', 'raise awareness', 'benefit a community', 'self-expression', 'innovation', 'public service responsibilities'];
export const AIMS = ['high quality', 'distinctive', 'accessible', 'diverse', 'inclusive', 'impartial'];
export const NEED_WORDS = ['information', 'entertainment', 'escapism', 'personal identity', 'social interaction'];
// Situation can be named or described: "together", "on their own" and "alone" say who with.
export const SITUATION_WORDS = ['situation', 'where', 'when', 'who with', 'together', 'alone', 'on their own'];

export const EVIDENCE = [
  'Amateur bakers compete in a tent over ten weeks. One leaves each week, and the winner gets a cake stand and flowers, not money.',
  'It began on BBC Two in 2010. Since 2017 it has been on Channel 4, which is paid for by adverts, not the licence fee.',
  'It is made by Love Productions, and shown on Tuesday evenings from September to November. Every episode is also on Channel 4\'s streaming service.',
  'It is one of Channel 4\'s most-watched shows every year, watched by families, students and older viewers.',
  'While it is on, fans post photos of their own bakes and jokes about "soggy bottoms" on social media.',
  'There are spin-offs: Junior Bake Off for young bakers, and An Extra Slice, a comedy chat show. Recipes from every challenge are on the show\'s website.',
];

export const WRITING = {
  apply: [
    { id: 'a_who', group: '1 · Who made it and why?', prompt: 'Who made The Great British Bake Off, and why?',
      ask: 'Say what type of producer Channel 4 is, the show\'s purpose, and the producer\'s motivation.',
      minWords: 20, words: [PRODUCER_TYPES, PURPOSES, MOTIVATIONS] },
    { id: 'a_aud', group: '2 · Who is it for?', prompt: 'Who is its audience?',
      ask: 'Describe its primary audience and one secondary audience, using the evidence.',
      minWords: 20, words: [['primary audience'], ['secondary audience']] },
    { id: 'a_use', group: '3 · How do audiences use it?', prompt: 'How do two different audiences use it and respond to it?',
      ask: 'For each audience, say where, when or who with they watch, and which need it meets.',
      minWords: 30, words: [SITUATION_WORDS, NEED_WORDS] },
  ],
  then: [
    { id: 'c_move', prompt: 'In 2017 Bake Off moved from the BBC (paid for by the licence fee) to Channel 4 (paid for by adverts). How might the move change what the producer wants from the show?',
      ask: 'Use a motivation and an aim, and give a reason for each.', minWords: 25, words: [MOTIVATIONS, AIMS] },
  ],
};

export const REVEALS = {};
export const SORTS = {};
export const SPOTS = {};
export const FIXES = {};
export const SPECTRUMS = {};
export const HUNTS = {};
export const PROFILES = {};
export const NUMBERS = {};
export const PILOTS = {};

// ── Glossary: everyday-but-tricky words only ──
// The spec terms being tested are left out on purpose: their meanings would give the answers away.
export const GLOSSARY = [
  ['amateurs?', 'Someone who does it as a hobby, not as their job'],
  ['spin-offs?', 'A new show made from an existing one'],
  ['licence fee', 'Money each home that watches live TV pays every year to fund the BBC'],
  ['airtime', 'Time on TV or radio'],
  ['general election', 'When the whole country votes for who runs the government'],
  ['Ofcom', 'The UK\'s watchdog for TV, radio, phones and the internet'],
  ['record labels?', 'A company that records, sells and promotes music'],
  ['Bushtucker Trials?', 'I\'m a Celebrity\'s challenges, like eating bugs, to win food'],
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
