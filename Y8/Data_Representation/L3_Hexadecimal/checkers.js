// Hexadecimal (Y8 Data Representation L3): pure checking logic, no DOM.
//
// Tasks (all scored):
//   0  Hex digits        4 steps of 3: denary 0–15 ↔ one hex digit; the table fades
//   1  4-bit binary → hex  4 steps: 4 bits → denary (8 4 2 1) → one hex digit (always a letter)
//   2  Binary → hex      5 steps: split 8 bits into two nibbles, convert each, join
//   3  Hex → binary      5 steps: each hex digit → denary → a 4-bit nibble, join
//   4  No help           6 conversions in a row (both ways), nothing on screen
//   5  Plenary           5 in a row: conversions and key ideas
// The hex digits and both methods are modelled from the deck first.

export const TASK_COUNT = 6;
export const HEADINGS4 = [8, 4, 2, 1];
export const HEX_DIGITS = '0123456789ABCDEF';

// ── Random numbers (seeded per student, so a reload shows the same question) ──
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed).toUpperCase()) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  // Mix the bits (MurmurHash3 finaliser), so nearby seeds give unrelated numbers.
  s ^= s >>> 16; s = Math.imul(s, 0x85ebca6b) >>> 0;
  s ^= s >>> 13; s = Math.imul(s, 0xc2b2ae35) >>> 0;
  s ^= s >>> 16;
  if (!s) s = 1;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
  for (let k = 0; k < 4; k++) next();   // warm up
  return next;
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

// ── Conversions ──
export const toBinary = (n, width = 0) => n.toString(2).padStart(width, '0');
export const toDenary = bits => [...String(bits)].reduce((sum, b) => sum * 2 + (b === '1' ? 1 : 0), 0);
export const hexDigit = n => HEX_DIGITS[n];
export const toHex = n => hexDigit(n >> 4) + hexDigit(n & 15);
export const hi = n => n >> 4;
export const lo = n => n & 15;

export const cleanBits = s => String(s ?? '').replace(/\s+/g, '');
export const cleanNumber = s => String(s ?? '').trim();
export const cleanHex = s => String(s ?? '').replace(/\s+/g, '').toUpperCase();
export const isBits = s => /^[01]+$/.test(s);
export const isHex = s => /^[0-9A-F]+$/.test(s);

// The headings with a 1 under them, added up: "8 + 2 + 1 = 11". A nibble of 0000 is 0.
export function nibbleSum(n) {
  const parts = HEADINGS4.filter(h => n & h);
  if (!parts.length) return '0';
  return parts.length === 1 ? `${parts[0]}` : `${parts.join(' + ')} = ${n}`;
}

// ── Working shown after an answer ──
export function digitWorking(n) {
  if (n < 10) return `${n} is ${n} in hex too: the digits 0–9 are the same.`;
  const run = range(10, n).map(k => `${hexDigit(k)} = ${k}`).join(', ');
  return `${n} is ${hexDigit(n)} in hex (${run}).`;
}

export function nibbleWorking(n) {
  const bits = toBinary(n, 4);
  const tail = n >= 10 ? `, and ${n} is ${hexDigit(n)} in hex` : `, which is ${n} in hex too`;
  return `${bits}: ${nibbleSum(n)}${tail}.`;
}

export function b2hWorking(n) {
  const b = toBinary(n, 8);
  const one = k => `${toBinary(k, 4)} = ${nibbleSum(k)}${k >= 10 ? ` = ${hexDigit(k)}` : ''}`;
  return `Split into ${b.slice(0, 4)} ${b.slice(4)}. ${one(hi(n))}. ${one(lo(n))}. Join: ${toHex(n)}.`;
}

export function h2bWorking(n) {
  const one = k => {
    const d = k >= 10 ? `${hexDigit(k)} = ${k}` : `${k}`;
    const parts = HEADINGS4.filter(h => k & h);
    return `${d} = ${parts.length ? parts.join(' + ') : '0'} → ${toBinary(k, 4)}`;
  };
  return `${one(hi(n))}. ${one(lo(n))}. Join: ${toBinary(n, 8)}.`;
}

// ── Pools ──
// Bytes: both nibbles non-zero, at least one of them a letter (10–15).
const letter = k => k >= 10;
const bytes = keep => range(16, 255).filter(n => lo(n) > 0 && keep(hi(n), lo(n)));
export const POOLS = {
  digitHigh: range(10, 15),
  digitAny:  range(0, 15),
  nibHigh:   range(10, 15),
  nibAny:    range(1, 15),
  oneLetter: bytes((h, l) => letter(h) !== letter(l)),     // e.g. 3A, C7
  twoLetters: bytes((h, l) => letter(h) && letter(l)),     // e.g. BE
  lowFirst:  bytes((h, l) => h < 8 && letter(l)),          // the first nibble starts with 0: 0011 1010
  smallDigit: bytes((h, l) => (h < 8 && letter(l)) || (letter(h) && l < 8)), // one nibble needs leading 0s
  anyLetter: bytes((h, l) => letter(h) || letter(l)),
};

// ── Ladder tasks: one question at a time; a wrong answer gives a new question at the same step ──
// Task 0 (digits): 3 items a step. dir 'd2h' | 'h2d' | 'mix'; table 'full' | 'a' (only A = 10) | 'none'.
// Task 1 (nibble): lit = headings with a 1 lit up; headings = the 8 4 2 1 row is shown.
// Task 2 (b2h): split 'shown' (gap and headings) | 'tap' (student taps where to split) | 'none';
//               dec = denary box per nibble; nib = hex box per nibble (then the joined answer).
// Task 3 (h2b): dec = denary box per digit; entry 'toggle' (8 tap boxes under 8 4 2 1 | 8 4 2 1) | 'typed'.
// fold: the method box is folded away.
export const LADDERS = {
  0: [
    { dir: 'd2h', table: 'full', pool: 'digitHigh', help: 'Use the table: find the denary number, then write the hex digit above it.' },
    { dir: 'h2d', table: 'full', pool: 'digitHigh', help: 'Now the other way: find the letter, then write the denary number under it.' },
    { dir: 'mix', table: 'a',    pool: 'digitHigh', help: 'Only A = 10 is shown now. Count on from it: B = 11, C = 12 …' },
    { dir: 'mix', table: 'none', pool: 'digitAny', low: true, fold: true, help: 'No table. One of these is 0–9: those digits are the same in hex.' },
  ],
  1: [
    { lit: true,  headings: true,  pool: 'nibHigh', help: 'The headings with a 1 under them are lit. Add them up, then turn 10–15 into a letter.' },
    { lit: false, headings: true,  pool: 'nibHigh', help: 'Same again: add the headings that have a 1 under them yourself.' },
    { lit: false, headings: true,  pool: 'nibHigh', help: 'Keep going: add the headings with a 1 under them, then turn the total into a letter.' },
    { lit: false, headings: false, pool: 'nibHigh', fold: true, help: 'On your own: write 8 4 2 1 above the bits on paper if it helps.' },
  ],
  2: [
    { split: 'shown', dec: true,  nib: true, pool: 'twoLetters', help: 'The 8 bits are split into two groups of 4 for you. Convert each group, then join the two digits.' },
    { split: 'shown', dec: true,  nib: true, pool: 'lowFirst',   help: 'This time the first 4 bits start with 0. Convert them the same way.' },
    { split: 'tap',   dec: false, nib: true, pool: 'anyLetter',  help: 'Now you split it: tap the gap that splits the 8 bits into two groups of 4. Then convert each group.' },
    { split: 'none',  dec: false, nib: false, pool: 'anyLetter', help: 'Just the answer: split, convert and join in your head or on paper.' },
    { split: 'none',  dec: false, nib: false, pool: 'oneLetter', fold: true, help: 'On your own. The method is folded away (you can still open it).' },
  ],
  3: [
    { dec: true,  entry: 'toggle', pool: 'twoLetters', help: 'Turn each hex digit into denary, then write it as 4 bits under 8 4 2 1.' },
    { dec: true,  entry: 'toggle', pool: 'smallDigit', help: 'One digit here is small, so its 4 bits start with 0s. Every hex digit gets all 4 bits.' },
    { dec: false, entry: 'toggle', pool: 'anyLetter',  help: 'No denary boxes now: work each digit out in your head, then set the 4 bits.' },
    { dec: false, entry: 'typed',  pool: 'smallDigit', help: 'Type all 8 bits: 4 for the first digit, then 4 for the second, leading 0s included.' },
    { dec: false, entry: 'typed',  pool: 'anyLetter', fold: true, help: 'On your own. The method is folded away (you can still open it).' },
  ],
};

export const STEP_COUNT = Object.fromEntries(Object.entries(LADDERS).map(([t, steps]) => [t, steps.length]));

function digitItems(s, rnd) {
  const vals = shuffled(POOLS[s.pool], rnd);
  let picked;
  if (s.low) {
    // one 0–9 and two letters, shuffled
    const small = vals.find(v => v < 10), big = vals.filter(v => v >= 10).slice(0, 2);
    picked = shuffled([small, ...big], rnd);
  } else picked = vals.slice(0, 3);
  const dirs = s.dir === 'mix' ? shuffled(['d2h', 'h2d', rnd() < 0.5 ? 'd2h' : 'h2d'], rnd) : [s.dir, s.dir, s.dir];
  return picked.map((n, k) => ({ n, dir: dirs[k], answer: dirs[k] === 'd2h' ? hexDigit(n) : String(n) }));
}

export function ladderQuestion(task, step, seed, retry = 0) {
  const s = LADDERS[task][step];
  const rnd = seededRandom(`${seed}|L${task}|${step}|${retry}`);
  // A retry never repeats the question the student just got wrong.
  const prev = retry > 0 ? ladderQuestion(task, step, seed, retry - 1).key : null;
  if (+task === 0) {
    for (let t = 0; ; t++) {
      const items = digitItems(s, t ? seededRandom(`${seed}|L0|${step}|${retry}|${t}`) : rnd);
      const key = items.map(i => i.dir + i.n).join(',');
      if (key !== prev) return { ...s, task: 0, step, items, key };
    }
  }
  const pool = POOLS[s.pool].filter(n => String(n) !== prev);
  const n = pick(pool, rnd);
  return { ...s, task: +task, step, n, key: String(n),
    bits: toBinary(n, +task === 1 ? 4 : 8), hex: +task === 1 ? hexDigit(n) : toHex(n) };
}

// The split gap the student must tap: gap k sits after bit k (1–7). The right one is 4.
export const SPLIT_GAP = 4;

// ── Marking ──
// Each checker returns { ok, results: { part: bool } } so the page can colour each part.
// d = { items: [], dec: { l, r, n }, nib: { l, r }, hex, ans, split, bits: [..8], typed }
export function checkLadder(q, d) {
  const results = {};
  const num = (v, want) => cleanNumber(v) === String(want);
  const hx = (v, want) => cleanHex(v) === want;
  if (q.task === 0) {
    q.items.forEach((it, k) => {
      results['i' + k] = it.dir === 'd2h' ? hx(d.items?.[k], it.answer) : num(d.items?.[k], it.answer);
    });
  }
  if (q.task === 1) {
    results.d = num(d.dec?.n, q.n);
    results.h = hx(d.hex, hexDigit(q.n));
  }
  if (q.task === 2) {
    if (q.split === 'tap') results.split = +d.split === SPLIT_GAP;
    if (q.dec) { results.dl = num(d.dec?.l, hi(q.n)); results.dr = num(d.dec?.r, lo(q.n)); }
    if (q.nib) { results.hl = hx(d.nib?.l, hexDigit(hi(q.n))); results.hr = hx(d.nib?.r, hexDigit(lo(q.n))); }
    results.ans = hx(d.ans, toHex(q.n));
  }
  if (q.task === 3) {
    if (q.dec) { results.dl = num(d.dec?.l, hi(q.n)); results.dr = num(d.dec?.r, lo(q.n)); }
    const want = toBinary(q.n, 8);
    if (q.entry === 'toggle') for (let k = 0; k < 8; k++) results['b' + k] = d.bits?.[k] === want[k];
    else results.typed = cleanBits(d.typed) === want;
  }
  return { ok: Object.values(results).every(Boolean), results };
}

// Answers in the wrong shape aren't marked wrong: the student is told the shape and tries again.
// Returns a hint, or '' when every box has a well-formed answer.
export function shapeHint(q, d) {
  const blank = v => String(v ?? '').trim() === '';
  const hexOk = (v, len) => isHex(cleanHex(v)) && cleanHex(v).length === len;
  const numOk = v => /^\d{1,2}$/.test(cleanNumber(v));
  const ones = 'Each hex digit is one character: 0–9 or A–F.';
  if (q.task === 0) {
    if (q.items.some((_, k) => blank(d.items?.[k]))) return 'Fill in every box first.';
    if (q.items.some((it, k) => it.dir === 'd2h' && !hexOk(d.items[k], 1))) return `${ones} 10–15 each become one letter.`;
    if (q.items.some((it, k) => it.dir === 'h2d' && !numOk(d.items[k]))) return 'Write the denary value as a number, like 12.';
  }
  if (q.task === 1) {
    if (blank(d.dec?.n) || blank(d.hex)) return 'Fill in both boxes first.';
    if (!numOk(d.dec.n)) return 'Write the denary value as a number, like 12.';
    if (!hexOk(d.hex, 1)) return `${ones} 10–15 each become one letter.`;
  }
  if (q.task === 2) {
    if (q.split === 'tap' && !d.split) return 'Tap the gap where the 8 bits split into two groups of 4.';
    const boxes = [...(q.dec ? [d.dec?.l, d.dec?.r] : []), ...(q.nib ? [d.nib?.l, d.nib?.r] : []), d.ans];
    if (boxes.some(blank)) return 'Fill in every box first.';
    if (q.dec && ![d.dec.l, d.dec.r].every(numOk)) return 'Write each group\'s denary value as a number, like 12.';
    if (q.nib && ![d.nib.l, d.nib.r].every(v => hexOk(v, 1))) return `${ones} 10–15 each become one letter.`;
    if (!hexOk(d.ans, 2)) return 'The answer is two hex digits, one for each group of 4 bits, like B5.';
  }
  if (q.task === 3) {
    if (q.dec && (blank(d.dec?.l) || blank(d.dec?.r))) return 'Fill in both denary boxes first.';
    if (q.dec && ![d.dec.l, d.dec.r].every(numOk)) return 'Write each digit\'s denary value as a number, like 12.';
    if (q.entry === 'toggle' && Array.from({ length: 8 }, (_, k) => d.bits?.[k]).some(v => v !== '0' && v !== '1'))
      return 'Set all 8 bits: tap each box to make it 0 or 1.';
    if (q.entry === 'typed') {
      const t = cleanBits(d.typed);
      if (!isBits(t) || t.length !== 8) return 'Type 8 bits (1s and 0s): 4 for each hex digit, leading 0s included.';
    }
  }
  return '';
}

export function workingFor(q) {
  if (q.task === 0) return q.items.map(it => digitWorking(it.n)).join(' ');
  if (q.task === 1) return nibbleWorking(q.n);
  if (q.task === 2) return b2hWorking(q.n);
  return h2bWorking(q.n);
}

// Wait after a wrong answer (wrong answers in a row on this task: 1, 2, 3+), so guessing is slow.
export function cooldownSeconds(wrongInARow) {
  return [5, 10, 15][Math.min(Math.max(wrongInARow, 1), 3) - 1];
}

// ── Typed conversions (chains and Hex Rush) ──
// item = { type: 'b2h' | 'h2b' | 'nib2h' | 'h2nib', n }
export function itemAnswer(item) {
  if (item.type === 'b2h') return toHex(item.n);
  if (item.type === 'h2b') return toBinary(item.n, 8);
  if (item.type === 'nib2h') return hexDigit(item.n);
  return toBinary(item.n, 4);
}
export function itemShown(item) {
  if (item.type === 'b2h') return toBinary(item.n, 8);
  if (item.type === 'h2b') return toHex(item.n);
  if (item.type === 'nib2h') return toBinary(item.n, 4);
  return hexDigit(item.n);
}
export const toHexType = t => t === 'b2h' || t === 'nib2h';

// 'ok' | 'wrong' | 'format'. A wrongly shaped answer (115 for B5, or 111010 for 00111010) isn't marked wrong.
export function checkTyped(item, text) {
  const want = itemAnswer(item);
  if (toHexType(item.type)) {
    const t = cleanHex(text);
    if (!isHex(t) || t.length !== want.length) return 'format';
    return t === want ? 'ok' : 'wrong';
  }
  const t = cleanBits(text);
  if (!isBits(t) || t.length !== want.length) return 'format';
  return t === want ? 'ok' : 'wrong';
}

export function formatHint(item) {
  if (item.type === 'b2h') return 'Type two hex digits, one for each group of 4 bits (0–9 or A–F), like B5.';
  if (item.type === 'nib2h') return 'Type one hex digit: 0–9 or A–F.';
  if (item.type === 'h2b') return 'Type 8 bits (1s and 0s): 4 for each hex digit, leading 0s included.';
  return 'Type 4 bits (1s and 0s), leading 0s included.';
}

export function itemWorking(item) {
  if (item.type === 'b2h') return b2hWorking(item.n);
  if (item.type === 'h2b') return h2bWorking(item.n);
  if (item.type === 'nib2h') return nibbleWorking(item.n);
  const n = item.n, parts = HEADINGS4.filter(h => n & h);
  return `${n >= 10 ? `${hexDigit(n)} = ${n} = ` : `${n} = `}${parts.length ? parts.join(' + ') : '0'} → ${toBinary(n, 4)}.`;
}

// ── Checkpoint chains ──
// MCQ item: { id, q, opts: [[key, text] ×4], a: correctKey, why }.
export const NOHELP_LENGTH = 6;
export const PLENARY_LENGTH = 5;

export const PLENARY_POOL = [
  { id: 'lq', q: 'How do I turn 8 bits into hex?', a: 'a', opts: [
    ['a', 'Split into two halves, convert each'],
    ['b', 'Add all 8 bits, then divide by 16'],
    ['c', 'Turn each bit into its own hex digit'],
    ['d', 'Read the bits backwards as letters']],
    why: 'Split the 8 bits into two groups of 4, turn each into one hex digit using 8 4 2 1, then join them.' },
  { id: 'four', q: 'How many bits does one hex digit stand for?', a: 'b', opts: [
    ['a', '2 bits'], ['b', '4 bits'], ['c', '8 bits'], ['d', '16 bits']],
    why: 'One hex digit stands for exactly 4 bits: 0000 (0) up to 1111 (F = 15).' },
  { id: 'why', q: 'Why do people write binary as hex?', a: 'c', opts: [
    ['a', 'The computer stores hex, not binary'],
    ['b', 'Hex numbers use up less memory'],
    ['c', 'It is shorter, so easier to read'],
    ['d', 'Hex can hold bigger numbers']],
    why: 'Hex is a shorter way to write binary, so people can read and remember it. The computer still stores binary.' },
  { id: 'two', q: 'How many hex digits do 8 bits make?', a: 'a', opts: [
    ['a', '2'], ['b', '4'], ['c', '8'], ['d', '16']],
    why: '8 bits split into two groups of 4, and each group of 4 is one hex digit: 2 digits.' },
  { id: 'f', q: 'What is the hex digit F in denary?', a: 'd', opts: [
    ['a', '6'], ['b', '16'], ['c', '10'], ['d', '15']],
    why: 'A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.' },
  { id: 'lead', q: 'What is the hex digit 3 written as 4 bits?', a: 'c', opts: [
    ['a', '11'], ['b', '1100'], ['c', '0011'], ['d', '0003']],
    why: '3 = 2 + 1, so 0011. Every hex digit is written with all 4 bits, so the 0s on the left stay.' },
  { id: 'after9', q: 'Which hex digit comes straight after 9?', a: 'b', opts: [
    ['a', '10'], ['b', 'A'], ['c', 'G'], ['d', '0']],
    why: 'After 9, hex uses letters: A = 10. "10" would be two digits.' },
];

export const plenaryQuestion = id => PLENARY_POOL.find(q => q.id === id);

export function optionOrder(item, seed, attempt) {
  return shuffled(item.opts.map(o => o[0]), seededRandom(`${seed}|${item.id}|${attempt}`));
}

// Task 4: 6 conversions, 3 each way, all different numbers, shuffled.
export function drawNoHelp(seed, attempt) {
  const rnd = seededRandom(`${seed}|nohelp|${attempt}`);
  const nums = shuffled(POOLS.anyLetter, rnd).slice(0, 6);
  const types = ['b2h', 'b2h', 'b2h', 'h2b', 'h2b', 'h2b'];
  return shuffled(nums.map((n, k) => ({ type: types[k], n })), rnd);
}

// Task 5 plenary: 3 key-idea questions and 2 conversions (one each way), shuffled.
export function drawPlenary(seed, attempt) {
  const rnd = seededRandom(`${seed}|plenary|${attempt}`);
  const mcq = shuffled(PLENARY_POOL.map(q => q.id), rnd).slice(0, 3).map(id => ({ type: 'mcq', id, pool: 'plenary' }));
  const [a, b] = shuffled(POOLS.anyLetter, rnd);
  return shuffled([...mcq, { type: 'b2h', n: a }, { type: 'h2b', n: b }], rnd);
}

// ── Extension game: Hex Rush ──
// Not scored for Classroom. Questions get harder as the run goes on (by question number, not score,
// so a class challenge code gives everyone the same questions in the same order).
export const GAME_LEVELS = [
  { from: 0,  name: 'Level 1', types: ['nib2h'],        pool: 'nibAny',    time: 20, base: 100 },  // nibble → one digit
  { from: 6,  name: 'Level 2', types: ['h2nib'],        pool: 'nibAny',    time: 25, base: 120 },  // one digit → nibble
  { from: 12, name: 'Level 3', types: ['b2h'],          pool: 'anyLetter', time: 35, base: 150 },
  { from: 20, name: 'Level 4', types: ['h2b'],          pool: 'anyLetter', time: 40, base: 180 },
  { from: 28, name: 'Level 5', types: ['b2h', 'h2b'],   pool: 'anyLetter', time: 35, base: 220 },
];
export const GAME_LIVES = 3;

export function gameLevel(i) {
  let lvl = GAME_LEVELS[0];
  for (const l of GAME_LEVELS) if (i >= l.from) lvl = l;
  return lvl;
}

// Seconds for question i: the level's time, and at the last level it shrinks by 3 s every 5 questions, never below 20.
export function gameTime(i) {
  const lvl = gameLevel(i);
  if (lvl !== GAME_LEVELS.at(-1)) return lvl.time;
  return Math.max(20, lvl.time - 3 * Math.floor((i - lvl.from) / 5));
}

function rawQ(seed, i, salt = 0) {
  const lvl = gameLevel(i);
  const rnd = seededRandom(`${seed}|rush|${i}|${salt}`);
  const type = pick(lvl.types, rnd);
  return { i, type, n: pick(POOLS[lvl.pool], rnd), level: lvl.name };
}

// Question i of a run. The same seed (a class code) always gives the same question; never the same one twice running.
export function gameQuestion(seed, i) {
  const prev = i > 0 ? rawQ(seed, i - 1) : null;
  for (let salt = 0; ; salt++) {
    const q = rawQ(seed, i, salt);
    if (!prev || q.n !== prev.n || q.type !== prev.type) return q;
  }
}

// Streak multiplier: x1, then x2 from 3 in a row, x3 from 6, x4 from 10.
export function multiplier(streak) {
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

// A right answer: the level's base points plus a speed bonus (up to the base again,
// in proportion to the time left), times the streak multiplier.
export function gamePoints(i, secondsLeft, limit, streak) {
  const { base } = gameLevel(i);
  const speed = Math.round(base * Math.max(0, Math.min(1, secondsLeft / limit)));
  return (base + speed) * multiplier(streak);
}

export const RANKS = [
  [0, 'Trainee'], [1000, 'Bit Cruncher'], [3000, 'Digit Spotter'], [6000, 'Hex Hacker'],
  [12000, 'Hex Ninja'], [25000, 'Hex Legend'], [50000, 'Base Boss'],
];

export function rankFor(score) {
  let r = RANKS[0][1];
  for (const [min, name] of RANKS) if (score >= min) r = name;
  return r;
}

export const GAME_BADGES = [
  ['first',    '🎖 First Run',      'Finish a run'],
  ['streak5',  '🔥 On a Roll',      '5 right in a row'],
  ['streak10', '⚡ Unstoppable',    '10 right in a row'],
  ['bytes',    '🧩 Full Byte',      'Reach the 8-bit questions (Level 3)'],
  ['mixed',    '🔀 Both Ways',      'Reach the mixed questions (Level 5)'],
  ['speed',    '🏎 Lightning',      '5 right in under 5 seconds each, in one run'],
  ['perfect',  '💎 Flawless 20',    'The first 20 questions all right'],
  ['score10k', '🏛 10,000 Club',    '10,000+ points in one run'],
];

// run = { played, maxStreak, fast, perfect, score }: the badges this run earned.
export function runBadges(run) {
  return {
    first: true,
    streak5: run.maxStreak >= 5,
    streak10: run.maxStreak >= 10,
    bytes: run.played > GAME_LEVELS[2].from,
    mixed: run.played > GAME_LEVELS[4].from,
    speed: run.fast >= 5,
    perfect: run.played >= 20 && run.perfect,
    score10k: run.score >= 10000,
  };
}

// A class challenge code: letters and digits only, upper case, at most 8.
export const cleanCode = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

// ── Hover definitions ──
// [pattern, meaning]: the page dotted-underlines these words in task text and shows the meaning on hover, focus or tap.
// Longer words first. Meanings: plain words, 80 characters at most.
export const GLOSSARY = [
  ['hexadecimal|hex', 'A number system with sixteen digits: 0–9, then A–F for 10 to 15.'],
  ['binary', 'A number system with only two digits, 0 and 1. Computers use it.'],
  ['denary', 'The number system we use every day, with ten digits, 0 to 9.'],
  ['bits?', 'One binary digit: a 0 or a 1.'],
  ['headings?', 'The number written above a column. It tells you what that column is worth.'],
  ['convert', 'Change a number from one number system into another.'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}
// Questions that test what a word means, or that its meaning would answer: no definitions on these cards.
export const NO_GLOSS = ['lq', 'four', 'two', 'why', 'f', 'after9', 'lead'];
