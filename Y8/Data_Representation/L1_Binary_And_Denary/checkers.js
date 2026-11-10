// Binary and Denary (Y8 Data Representation L1): pure checking logic, no DOM.
//
// Tasks (all scored):
//   0  Binary basics     checkpoint chain: 4 in a row, one wrong restarts with a new draw
//   1  Binary → denary   4 bits, 5 steps; the help fades step by step
//   2  Denary → binary   4 bits, 5 steps; the help fades step by step
//   3  No help           6 conversions in a row (both ways, 4 bits), nothing on screen
//   4  8 bits: B → D     4 steps: build the 8 headings, then binary → denary
//   5  8 bits: D → B     3 steps: denary → binary
//   6  Plenary           5 in a row: 8-bit conversions and key ideas

export const TASK_COUNT = 7;

export const HEADINGS4 = [8, 4, 2, 1];
export const HEADINGS8 = [128, 64, 32, 16, 8, 4, 2, 1];

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

// ── Conversions ──
export function toBinary(n, width = 0) {
  return n.toString(2).padStart(width, '0');
}

// Bits as written, e.g. '1011' or '00001101'.
export function toDenary(bits) {
  return [...String(bits)].reduce((sum, b) => sum * 2 + (b === '1' ? 1 : 0), 0);
}

export const ones = n => toBinary(n).split('').filter(b => b === '1').length;

// Strip spaces, so "0110 1001" and "01101001" are both read as bits.
export const cleanBits = s => String(s ?? '').replace(/\s+/g, '');
export const isBits = s => /^[01]+$/.test(s);
export const cleanNumber = s => String(s ?? '').trim();
export const isWholeNumber = s => /^\d+$/.test(s);

// ── Number pools (no single-1 numbers like 8 or 4, which you can read off without adding) ──
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const MAX_8BIT = 120;
export const POOLS = {
  b2d4:      range(3, 15).filter(n => ones(n) >= 2),                         // 4-bit, read and add
  d2b4:      range(5, 14).filter(n => ones(n) >= 2),                         // needs at least one 0 column
  // 8-bit numbers stop at 120 (MAX_8BIT): bigger ones make the adding and taking away too hard for Y8.
  b2d8:      range(33, MAX_8BIT).filter(n => ones(n) >= 3 && ones(n) <= 5),
  d2b8:      range(20, MAX_8BIT).filter(n => ones(n) >= 3 && ones(n) <= 5),  // under 128, so the 128 column is always 0
};

function pickFrom(pool, seed) {
  const rnd = seededRandom(seed);
  return pool[Math.floor(rnd() * pool.length)];
}

// ── Ladder tasks: one question at a time; a wrong answer gives a new number at the same step ──
// show:   'headings' = headings and bits on screen; 'blank' = the student writes the headings
// light:  the headings with a 1 under them are highlighted
// guided: the student fills in "Does it fit?" and "What's left" for every heading
export const LADDERS = {
  1: [
    { kind: 'b2d', pool: 'b2d4',     width: 4, show: 'headings', light: true,  help: 'Headings and bits are written for you, and the columns with a 1 are lit up. Add up the lit headings.' },
    { kind: 'b2d', pool: 'b2d4',     width: 4, show: 'headings', light: true,  help: 'Same again: add up the lit headings.' },
    { kind: 'b2d', pool: 'b2d4',     width: 4, show: 'headings', light: false, help: 'No lights now. Find the columns with a 1 under them yourself.' },
    { kind: 'b2d', pool: 'b2d4',     width: 4, show: 'blank',    light: false, help: 'Write the headings, then copy each bit under its heading. Then add up.' },
    { kind: 'b2d', pool: 'b2d4',     width: 4, show: 'blank',    light: false, help: 'Write the headings and the bits yourself, then add up.' },
  ],
  2: [
    { kind: 'd2b', pool: 'd2b4', width: 4, show: 'headings', guided: true,  help: 'Go from the biggest heading down. Does it fit into what\'s left? Write 1 and take it away, or write 0.' },
    { kind: 'd2b', pool: 'd2b4', width: 4, show: 'headings', guided: true,  help: 'Same again: one row per heading, biggest first.' },
    { kind: 'd2b', pool: 'd2b4', width: 4, show: 'headings', guided: false, help: 'Just the bits now. Keep track of what\'s left in your head or on paper.' },
    { kind: 'd2b', pool: 'd2b4', width: 4, show: 'blank',    guided: false, help: 'Write the headings yourself first, then the bits.' },
    { kind: 'd2b', pool: 'd2b4', width: 4, show: 'blank',    guided: false, help: 'Write the headings and the bits yourself.' },
  ],
  4: [
    { kind: 'build', help: 'The headings keep doubling to the left. Drag the four new headings into place.' },
    { kind: 'b2d', pool: 'b2d8', width: 8, show: 'headings', light: false, help: 'Same method, more columns: add up the headings that have a 1 under them.' },
    { kind: 'b2d', pool: 'b2d8', width: 8, show: 'headings', light: false, help: 'Same again: add up the headings with a 1 under them.' },
    { kind: 'b2d', pool: 'b2d8', width: 8, show: 'blank',    light: false, help: 'Write all 8 headings yourself, then the bits, then add up.' },
  ],
  5: [
    { kind: 'd2b', pool: 'd2b8',      width: 8, show: 'headings', guided: false, help: 'Same method, more columns: biggest heading first. Fits? 1 and take it away. Doesn\'t fit? 0.' },
    { kind: 'd2b', pool: 'd2b8',      width: 8, show: 'headings', guided: false, help: 'This one is under 128, so the 128 column gets a 0. Every column gets a 1 or a 0.' },
    { kind: 'd2b', pool: 'd2b8',      width: 8, show: 'blank',    guided: false, help: 'Write all 8 headings yourself, then the bits. Every column gets a 1 or a 0.' },
  ],
};

export const STEP_COUNT = Object.fromEntries(Object.entries(LADDERS).map(([t, steps]) => [t, steps.length]));

export function ladderQuestion(task, step, seed, retry = 0) {
  const s = LADDERS[task][step];
  if (s.kind === 'build') return { ...s, task, step };
  // A retry never repeats the number the student just got wrong.
  const prev = retry > 0 ? ladderQuestion(task, step, seed, retry - 1).value : null;
  const value = pickFrom(POOLS[s.pool].filter(n => n !== prev), `${seed}|L${task}|${step}|${retry}`);
  // Every conversion shows all its bits (0s included).
  const bits = toBinary(value, s.width);
  return { ...s, task, step, value, bits };
}

// ── Marking ──
// Each checker returns { ok, results: { part: bool } } so the page can colour each part.

function headingResults(headings, want) {
  const r = {};
  want.forEach((h, i) => { r['h' + i] = cleanNumber(headings?.[i]) === String(h); });
  return r;
}

// Binary → denary. a = { total, headings?, bits? } (headings/bits only when show === 'blank').
export function checkB2D(q, a) {
  const want = q.width === 8 ? HEADINGS8 : HEADINGS4;
  const results = {};
  if (q.show === 'blank') {
    Object.assign(results, headingResults(a.headings, want));
    // One bit under each heading, 0s included.
    for (let i = 0; i < q.width; i++) results['b' + i] = cleanBits(a.bits?.[i]) === q.bits[i];
  }
  results.total = cleanNumber(a.total) === String(q.value);
  return { ok: Object.values(results).every(Boolean), results };
}

// Denary → binary. a = { bits: [..width], left?: [..width], headings? }.
// Every column needs a 1 or a 0 here: the method writes 0 when a heading doesn't fit.
export function checkD2B(q, a) {
  const want = q.width === 8 ? HEADINGS8 : HEADINGS4;
  const target = toBinary(q.value, q.width);
  const results = {};
  if (q.show === 'blank') Object.assign(results, headingResults(a.headings, want));
  want.forEach((_, i) => { results['b' + i] = cleanBits(a.bits?.[i]) === target[i]; });
  if (q.guided) {
    leftAfter(q.value, want).forEach((left, i) => { results['l' + i] = cleanNumber(a.left?.[i]) === String(left); });
  }
  return { ok: Object.values(results).every(Boolean), results };
}

// What's left after each heading, biggest first: 11 → [3, 3, 1, 0].
export function leftAfter(value, headings) {
  let left = value;
  return headings.map(h => { if (h <= left) left -= h; return left; });
}

// Build the 8 headings. placed = { 'h0'..'h3': value } for the four empty left-hand slots.
export const BUILD_TILES = [128, 64, 32, 16, 10, 12, 24, 100, 256];
export function checkBuild(placed) {
  const results = {};
  [128, 64, 32, 16].forEach((h, i) => { results['h' + i] = Number(placed?.['h' + i]) === h; });
  return { ok: Object.values(results).every(Boolean), results };
}

// A typed answer in a no-help question. 'format' answers aren't marked wrong:
// the student is told what shape the answer needs and tries again.
export function checkTyped(q, text) {
  if (q.type === 'b2d') {
    const t = cleanNumber(text);
    if (!isWholeNumber(t)) return 'format';
    return t === String(q.value) ? 'ok' : 'wrong';
  }
  const t = cleanBits(text);
  if (!isBits(t) || t.length !== q.width) return 'format';
  return t === toBinary(q.value, q.width) ? 'ok' : 'wrong';
}

export function formatHint(q) {
  return q.type === 'b2d'
    ? 'Type a denary number, using the digits 0–9.'
    : `Type exactly ${q.width} bits: one 1 or 0 for each heading.`;
}

// Wait after a wrong answer (wrong answers in a row on this task: 1, 2, 3+), so guessing is slow.
export function cooldownSeconds(wrongInARow) {
  return [5, 10, 15][Math.min(Math.max(wrongInARow, 1), 3) - 1];
}

// ── Working shown after a wrong answer ──
export function b2dWorking(value, width) {
  const heads = width === 8 ? HEADINGS8 : HEADINGS4;
  const bits = toBinary(value, width);
  const used = heads.filter((_, i) => bits[i] === '1');
  return `${bits} has a 1 under ${used.join(', ')}. ${used.join(' + ')} = ${value}.`;
}

export function d2bWorking(value, width) {
  const heads = width === 8 ? HEADINGS8 : HEADINGS4;
  let left = value;
  const steps = heads.map(h => {
    if (h <= left) { left -= h; return `${h} fits: 1, ${left} left`; }
    return `${h} doesn't fit: 0`;
  });
  return `${value}: ${steps.join('. ')}. So ${value} = ${toBinary(value, width)}.`;
}

export const BUILD_WORKING = 'Each heading is double the one on its right: 8 → 16 → 32 → 64 → 128.';

export function workingFor(q) {
  if (q.kind === 'build') return BUILD_WORKING;
  const kind = q.kind || q.type;
  return kind === 'b2d' ? b2dWorking(q.value, q.width) : d2bWorking(q.value, q.width);
}

// ── Checkpoint chains ──
// MCQ item: { id, q, opts: [[key, text] ×4], a: correctKey, why }.

export const BASICS_LENGTH = 4;
export const BASICS_POOL = [
  { id: 'denary', q: 'How many different digits does denary use?', a: 'c', opts: [
    ['a', 'Two digits: 0 and 1'],
    ['b', 'Eight digits: 0 to 7'],
    ['c', 'Ten digits: 0 to 9'],
    ['d', 'Sixteen digits: 0 to 15']],
    why: 'Denary is the number system we use every day. It has ten digits, 0 to 9.' },
  { id: 'binary', q: 'Which digits does binary use?', a: 'a', opts: [
    ['a', 'Only 0 and 1'],
    ['b', 'Only 1 and 2'],
    ['c', 'The digits 0 to 9'],
    ['d', 'Only 1, 2, 4 and 8']],
    why: 'Binary has only two digits, 0 and 1.' },
  { id: 'why', q: 'Why do computers use binary?', a: 'b', opts: [
    ['a', 'Binary numbers are shorter to write and read'],
    ['b', 'They are made of switches, on (1) or off (0)'],
    ['c', 'Computers can only count up to ten'],
    ['d', 'Binary was invented before denary was']],
    why: 'A computer is made of tiny switches. Each one is either on (1) or off (0).' },
  { id: 'bit', q: 'What is a bit?', a: 'd', opts: [
    ['a', 'Eight binary digits together'],
    ['b', 'Any number written in denary'],
    ['c', 'The heading above a column'],
    ['d', 'One binary digit, a 0 or a 1']],
    why: 'A bit is one binary digit: a 0 or a 1.' },
  { id: 'bits4', q: 'How many bits are in the binary number 1010?', a: 'b', opts: [
    ['a', '2 bits'],
    ['b', '4 bits'],
    ['c', '10 bits'],
    ['d', '1010 bits']],
    why: 'Each 0 or 1 is one bit. 1010 has four digits, so it has 4 bits.' },
  { id: 'next', q: 'The headings go 1, 2, 4, 8 from right to left. What is the next heading?', a: 'a', opts: [
    ['a', '16'],
    ['b', '10'],
    ['c', '12'],
    ['d', '9']],
    why: 'The headings double from right to left: 8 doubled is 16.' },
  { id: 'order', q: 'Which shows the four binary headings in the right order?', a: 'c', opts: [
    ['a', '1  2  4  8'],
    ['b', '4  3  2  1'],
    ['c', '8  4  2  1'],
    ['d', '8  6  4  2']],
    why: 'The smallest heading, 1, is on the right. They double to the left: 8 4 2 1.' },
  { id: 'zero', q: 'In 1001, what are the two 0s worth?', a: 'a', opts: [
    ['a', 'Nothing: you don\'t add those headings'],
    ['b', 'Take away the headings they sit under'],
    ['c', 'One each, so add 2 to the total'],
    ['d', 'They double the headings next to them']],
    why: 'A 0 means "don\'t add this heading". 1001 = 8 + 1 = 9.' },
];

export function drawBasics(seed, attempt) {
  return shuffled(BASICS_POOL.map(q => q.id), seededRandom(`${seed}|basics|${attempt}`)).slice(0, BASICS_LENGTH);
}

export function optionOrder(item, seed, attempt) {
  return shuffled(item.opts.map(o => o[0]), seededRandom(`${seed}|${item.id}|${attempt}`));
}

export const basicsQuestion = id => BASICS_POOL.find(q => q.id === id);

// Task 4: no help on screen. 3 each way, shuffled, all different numbers.
export const NOHELP_LENGTH = 6;
export function drawNoHelp(seed, attempt) {
  const rnd = seededRandom(`${seed}|nohelp|${attempt}`);
  const b2d = shuffled(POOLS.b2d4, rnd).slice(0, 3);
  const d2b = shuffled(POOLS.d2b4.filter(n => !b2d.includes(n)), rnd).slice(0, 3);
  return shuffled([
    ...b2d.map(value => ({ type: 'b2d', value, width: 4 })),
    ...d2b.map(value => ({ type: 'd2b', value, width: 4 })),
  ], rnd);
}

// Task 6 plenary: 3 key-idea MCQs and 2 eight-bit conversions (one each way), shuffled.
export const PLENARY_LENGTH = 5;
export const PLENARY_POOL = [
  { id: 'lq', q: 'How is a denary number represented in binary?', a: 'b', opts: [
    ['a', 'Each denary digit is turned into a 1 or a 0'],
    ['b', 'As 1s and 0s under headings that add up to it'],
    ['c', 'As the number written backwards with 0s between'],
    ['d', 'As a 1 for every unit, so 5 becomes 11111']],
    why: 'Put a 1 under each heading you need and a 0 under the rest. The headings with a 1 add up to the number.' },
  { id: 'zeros', q: '101 is padded to 8 bits: 00000101. What happens to its value?', a: 'a', opts: [
    ['a', 'It stays 5'],
    ['b', 'It becomes 500'],
    ['c', 'It becomes 101'],
    ['d', 'It becomes 0']],
    why: 'The new 0s sit under headings that are not added, so the value does not change.' },
  { id: 'max4', q: 'Which denary number is too big to write with 4 bits?', a: 'c', opts: [
    ['a', '9'],
    ['b', '12'],
    ['c', '17'],
    ['d', '15']],
    why: '4 bits give 8 + 4 + 2 + 1 = 15 at most, so 17 needs more bits.' },
  { id: 'max8', q: 'What is the biggest denary number 8 bits can hold?', a: 'd', opts: [
    ['a', '8'],
    ['b', '128'],
    ['c', '99'],
    ['d', '255']],
    why: '11111111 = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.' },
  { id: 'fit', q: 'Converting 40 to binary: you reach the 64 heading. What do you write?', a: 'a', opts: [
    ['a', '0, because 64 does not fit into 40'],
    ['b', '1, and take the 64 away from 40'],
    ['c', 'Nothing at all, and skip to the 32'],
    ['d', '40, because that is what is left']],
    why: '64 is bigger than 40, so it doesn\'t fit: write 0 and move to the next heading.' },
  { id: 'double', q: 'Why is the heading after 64 equal to 128?', a: 'b', opts: [
    ['a', 'Because 128 is the next even number'],
    ['b', 'Because each heading doubles: 64 × 2'],
    ['c', 'Because there are 128 bits in a byte'],
    ['d', 'Because 100 + 28 is a round number']],
    why: 'Binary headings double from right to left, so the one after 64 is 64 × 2 = 128.' },
];

export const plenaryQuestion = id => PLENARY_POOL.find(q => q.id === id);

export function drawPlenary(seed, attempt) {
  const rnd = seededRandom(`${seed}|plenary|${attempt}`);
  const mcq = shuffled(PLENARY_POOL.map(q => q.id), rnd).slice(0, 3).map(id => ({ type: 'mcq', id }));
  const b2d = shuffled(POOLS.b2d8, rnd)[0];
  const d2b = shuffled(POOLS.d2b8.filter(n => n !== b2d), rnd)[0];
  return shuffled([...mcq, { type: 'b2d', value: b2d, width: 8 }, { type: 'd2b', value: d2b, width: 8 }], rnd);
}

// The key a chain item is stored under, so option order is stable per item and attempt.
export const itemKey = item => item.type === 'mcq' ? item.id : `${item.type}${item.value}`;
