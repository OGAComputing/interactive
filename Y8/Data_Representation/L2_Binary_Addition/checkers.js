// Binary Addition (Y8 Data Representation L2): pure checking logic, no DOM.
//
// Tasks (all scored):
//   0  Add with 4 bits     5 steps; the help fades step by step
//   1  The final carry     3 steps: the answer can be one bit longer
//   2  No help             5 additions in a row (4 bits), nothing on screen
//   3  8 bits              4 steps: add, add, pad to 8 bits and add, add and check in denary
//   4  Plenary             5 in a row: 8-bit additions and key ideas
// Lesson 1 recall and the four rules are done in the deck's starter and modelling, not here.

export const TASK_COUNT = 5;


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

// ── Conversions (Lesson 1) ──
export function toBinary(n, width = 0) {
  return n.toString(2).padStart(width, '0');
}

export function toDenary(bits) {
  return [...String(bits)].reduce((sum, b) => sum * 2 + (b === '1' ? 1 : 0), 0);
}

export const ones = n => toBinary(n).split('').filter(b => b === '1').length;

export const cleanBits = s => String(s ?? '').replace(/\s+/g, '');
export const isBits = s => /^[01]+$/.test(s);
export const cleanNumber = s => String(s ?? '').trim();

// ── Column addition ──
// Works right to left. carryIn[k] is the carry written above column k (0 = leftmost);
// final is the carry out of the leftmost column, which becomes a new bit on the left.
export function addColumns(a, b, width) {
  const A = toBinary(a, width), B = toBinary(b, width);
  const carryIn = new Array(width).fill(0);
  const cols = new Array(width);
  let c = 0;
  for (let k = width - 1; k >= 0; k--) {
    const x = +A[k], y = +B[k];
    carryIn[k] = c;
    const s = x + y + c;
    cols[k] = { x, y, c, write: s % 2, out: s >> 1 };
    c = s >> 1;
  }
  return { A, B, carryIn, cols, final: c, sum: a + b };
}

// Carries made while adding (the final carry included).
export const carryCount = (a, b, width) => {
  const r = addColumns(a, b, width);
  return r.carryIn.filter(Boolean).length + r.final;
};
// A column where 1 + 1 + carry 1 = 1, carry 1.
export const hasTriple = (a, b, width) => addColumns(a, b, width).cols.some(col => col.x + col.y + col.c === 3);

// ── Pools of [a, b] pairs ──
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
function pairs(as, bs, keep) {
  const out = [];
  for (const a of as) for (const b of bs) if (keep(a, b)) out.push([a, b]);
  return out;
}
// No pair is too easy to read off: between them, the two numbers have at least three 1s.
const busy4 = (a, b) => ones(a) + ones(b) >= 3;
const n4 = range(1, 15);
const fits4 = (a, b) => a + b <= 15;

const carry4 = pairs(n4, n4, (a, b) => busy4(a, b) && fits4(a, b) && carryCount(a, b, 4) >= 2);
const over4  = pairs(n4, n4, (a, b) => busy4(a, b) && a + b >= 16 && carryCount(a, b, 4) >= 2);

export const POOLS = {
  nocarry4:  pairs(n4, n4, (a, b) => busy4(a, b) && (a & b) === 0),            // no column has two 1s
  onecarry4: pairs(n4, n4, (a, b) => busy4(a, b) && fits4(a, b) && carryCount(a, b, 4) === 1),
  carry4,
  triple4:   pairs(n4, n4, (a, b) => busy4(a, b) && fits4(a, b) && hasTriple(a, b, 4)),
  over4,                                                                       // a final carry: the answer has 5 bits
  mixed4:    [...carry4.slice(0, over4.length), ...over4.slice(0, carry4.length)], // half with a final carry, half without
  add8:      pairs(range(20, 230), range(20, 230), (a, b) =>
               a + b <= 255 && ones(a) >= 3 && ones(b) >= 3 && carryCount(a, b, 8) >= 2 && carryCount(a, b, 8) <= 4),
  pad8:      pairs(range(32, 127), range(5, 15), (a, b) =>                     // 6–7 bits + 3–4 bits, padded to 8
               ones(a) >= 3 && ones(b) >= 2 && carryCount(a, b, 8) >= 2),
};

const pairKey = p => `${p[0]}+${p[1]}`;

function pickFrom(pool, seed) {
  const rnd = seededRandom(seed);
  return pool[Math.floor(rnd() * pool.length)];
}

// ── Ladder tasks: one question at a time; a wrong answer gives a new sum at the same step ──
// carry:      'given' = the carries are written in for you; 'write' = the student writes them
// extra:      one more answer box on the left for a final carry (left empty if there isn't one)
// lightFinal: that box is lit up
// pad:        the numbers are shown short; the student writes both as 8 bits first
// dec:        after adding, the student converts all three numbers to denary to check
// fold:       the method box is folded away
export const LADDERS = {
  0: [
    { pool: 'nocarry4',  width: 4, carry: 'given', help: 'No column has two 1s, so there are no carries. Add each column, right to left: 0 + 0 = 0, 0 + 1 = 1.' },
    { pool: 'onecarry4', width: 4, carry: 'given', help: 'One column has 1 + 1, so the carry is written in for you. Add it in when you reach its column.' },
    { pool: 'carry4',    width: 4, carry: 'write', help: 'Now you write the carries. When a column makes 2, write 0 and tap the box above the next column on the left.' },
    { pool: 'triple4',   width: 4, carry: 'write', help: 'One column here has three 1s with its carry: 1 + 1 + 1 = 1, carry 1.' },
    { pool: 'carry4',    width: 4, carry: 'write', fold: true, help: 'On your own: carries and answer, right to left. The method is folded away (you can still open it).' },
  ],
  1: [
    { pool: 'over4',  width: 4, carry: 'write', extra: true, lightFinal: true,
      help: 'The leftmost column makes a carry, but there is no column left to put it in. It becomes a new bit on the left (lit up), so the answer has 5 bits.' },
    { pool: 'over4',  width: 4, carry: 'write', extra: true,
      help: 'Same again: the final carry goes in the new box on the left.' },
    { pool: 'mixed4', width: 4, carry: 'write', extra: true,
      help: 'This one might not have a final carry. If it doesn\'t, leave the new box on the left empty.' },
  ],
  3: [
    { pool: 'add8', width: 8, carry: 'write', help: 'Same method, more columns: right to left, writing every carry above the next column.' },
    { pool: 'add8', width: 8, carry: 'write', help: 'Same again with 8 bits.' },
    { pool: 'pad8', width: 8, carry: 'write', pad: true,
      help: 'These numbers are shorter than 8 bits. Write each one as 8 bits by putting 0s on the left, then add.' },
    { pool: 'add8', width: 8, carry: 'write', dec: true,
      help: 'Add, then check: convert both numbers and your answer to denary. The first two should add up to the third.' },
  ],
};

export const STEP_COUNT = Object.fromEntries(Object.entries(LADDERS).map(([t, steps]) => [t, steps.length]));

export function ladderQuestion(task, step, seed, retry = 0) {
  const s = LADDERS[task][step];
  // A retry never repeats the sum the student just got wrong.
  const prev = retry > 0 ? ladderQuestion(task, step, seed, retry - 1).key : null;
  const [a, b] = pickFrom(POOLS[s.pool].filter(p => pairKey(p) !== prev), `${seed}|L${task}|${step}|${retry}`);
  const r = addColumns(a, b, s.width);
  return { ...s, task, step, a, b, key: `${a}+${b}`, carryIn: r.carryIn, final: r.final, sum: r.sum,
    bitsA: r.A, bitsB: r.B, answer: toBinary(r.sum % (1 << s.width), s.width) };
}

// ── Marking ──
// Each checker returns { ok, results: { part: bool } } so the page can colour each part.
// d = { carries: [..width] ('1' or ''), bits: [..width], extra: '1' or '', rowA, rowB, dec: { a, b, sum } }
export function checkAdd(q, d) {
  const results = {};
  if (q.pad) {
    for (let k = 0; k < q.width; k++) {
      results['ra' + k] = cleanBits(d.rowA?.[k]) === q.bitsA[k];
      results['rb' + k] = cleanBits(d.rowB?.[k]) === q.bitsB[k];
    }
  }
  // An empty carry box means "no carry". The rightmost column never has one.
  if (q.carry === 'write') {
    for (let k = 0; k < q.width - 1; k++) results['c' + k] = (d.carries?.[k] === '1') === (q.carryIn[k] === 1);
  }
  if (q.extra) results.x = (d.extra === '1') === (q.final === 1);
  for (let k = 0; k < q.width; k++) results['s' + k] = d.bits?.[k] === q.answer[k];
  if (q.dec) {
    results.da = cleanNumber(d.dec?.a) === String(q.a);
    results.db = cleanNumber(d.dec?.b) === String(q.b);
    results.ds = cleanNumber(d.dec?.sum) === String(q.sum);
  }
  return { ok: Object.values(results).every(Boolean), results };
}

// The answer as the student should write it: one bit longer when there is a final carry.
export const fullAnswer = (a, b, width) => {
  const r = addColumns(a, b, width);
  return (r.final ? '1' : '') + toBinary(r.sum % (1 << width), width);
};

// A typed answer in a chain. 'format' answers aren't marked wrong:
// the student is told what shape the answer needs and tries again.
export function checkTyped(q, text) {
  const t = cleanBits(text);
  // add: the answer has width bits, or one more when there is a final carry.
  // Dropping the final carry is the mistake this lesson is about: those 4 bits have the wrong value, so it's marked wrong.
  if (!isBits(t) || t.length < q.width || t.length > q.width + 1) return 'format';
  return toDenary(t) === q.a + q.b ? 'ok' : 'wrong';
}

export function formatHint(q) {
  return `Type the answer in bits (1s and 0s): ${q.width} bits, or ${q.width + 1} if there is a final carry.`;
}

// Wait after a wrong answer (wrong answers in a row on this task: 1, 2, 3+), so guessing is slow.
export function cooldownSeconds(wrongInARow) {
  return [5, 10, 15][Math.min(Math.max(wrongInARow, 1), 3) - 1];
}

// ── Working shown after an answer ──
export function columnWorking(x, y, c) {
  const s = x + y + c;
  const sum = `${[x, y, ...(c ? [c] : [])].join(' + ')} = ${s}`;
  return s >= 2 ? `${sum}: write ${s % 2}, carry 1.` : `${sum}: write ${s}, no carry.`;
}

export function addWorking(a, b, width) {
  const r = addColumns(a, b, width);
  const steps = [];
  for (let k = width - 1; k >= 0; k--) {
    const col = r.cols[k];
    const name = k === width - 1 ? 'Right column' : 'Next';
    steps.push(`${name}: ${columnWorking(col.x, col.y, col.c).replace(/\.$/, '')}`);
  }
  const ans = fullAnswer(a, b, width);
  const fin = r.final ? ' The final carry becomes a new bit on the left.' : '';
  return `${steps.join('. ')}.${fin} Answer: ${ans} (${a} + ${b} = ${a + b}).`;
}

export function padWorking(q) {
  return `${toBinary(q.a)} as 8 bits is ${q.bitsA}, and ${toBinary(q.b)} is ${q.bitsB}. ${addWorking(q.a, q.b, 8)}`;
}

export function workingFor(q) {
  if (q.pad) return padWorking(q);
  return addWorking(q.a, q.b, q.width);
}

// ── Checkpoint chains ──
// MCQ item: { id, q, opts: [[key, text] ×4], a: correctKey, why }.

export const NOHELP_LENGTH = 5;

export const PLENARY_LENGTH = 5;
export const PLENARY_POOL = [
  { id: 'lq', q: 'How do I add two binary numbers?', a: 'a', opts: [
    ['a', 'Add columns right to left, carrying 1s'],
    ['b', 'Add columns left to right, never carrying'],
    ['c', 'Write one number straight after the other'],
    ['d', 'Add every digit as if they were denary']],
    why: 'Add each column right to left. A column that makes 2 or 3 carries 1 into the next column on the left.' },
  { id: 'final', q: 'What is 1111 + 0001?', a: 'c', opts: [
    ['a', '0000'],
    ['b', '1112'],
    ['c', '10000'],
    ['d', '11110']],
    why: 'Every column carries, and the final carry becomes a new bit on the left: 10000 (15 + 1 = 16).' },
  { id: 'nine', q: 'Two 8-bit numbers are added. How many bits can the answer have?', a: 'b', opts: [
    ['a', 'Always exactly 8 bits'],
    ['b', 'Up to 9 bits'],
    ['c', 'Up to 16 bits'],
    ['d', 'Only 7 bits or fewer']],
    why: 'A final carry from the leftmost column becomes a new bit, so the answer can be one bit longer: 9 bits.' },
  { id: 'lineup', q: 'You are adding 1101 + 11. What do you do with 11 first?', a: 'a', opts: [
    ['a', 'Write it as 0011, 0s on the left'],
    ['b', 'Write it as 1100, 0s on the right'],
    ['c', 'Add it to the two leftmost bits'],
    ['d', 'Leave it out until the very end']],
    why: 'Pad the shorter number with 0s on the left so the columns line up: 1101 + 0011.' },
  { id: 'triple', q: 'A column has 1 + 1 and a carry of 1. What do you write?', a: 'd', opts: [
    ['a', 'Write 3, no carry'],
    ['b', 'Write 0, carry 1'],
    ['c', 'Write 1, carry 2'],
    ['d', 'Write 1, carry 1']],
    why: '1 + 1 + 1 = 3, which is 11 in binary: write 1 and carry 1.' },
  { id: 'check', q: 'Which denary sum checks that 0110 + 0011 = 1001?', a: 'b', opts: [
    ['a', '6 + 3 = 10'],
    ['b', '6 + 3 = 9'],
    ['c', '4 + 2 = 6'],
    ['d', '6 + 4 = 9']],
    why: '0110 = 6, 0011 = 3 and 1001 = 9. 6 + 3 = 9, so the addition is right.' },
];

export const plenaryQuestion = id => PLENARY_POOL.find(q => q.id === id);

export function optionOrder(item, seed, attempt) {
  return shuffled(item.opts.map(o => o[0]), seededRandom(`${seed}|${item.id}|${attempt}`));
}

// Task 3: 5 additions with 4 bits, all different: 3 with carries, 2 with a final carry.
export function drawNoHelp(seed, attempt) {
  const rnd = seededRandom(`${seed}|nohelp|${attempt}`);
  const inner = shuffled([...POOLS.carry4, ...POOLS.triple4], rnd);
  const picked = [];
  for (const p of inner) if (picked.length < 3 && !picked.some(q => pairKey(q) === pairKey(p))) picked.push(p);
  const over = shuffled(POOLS.over4, rnd).slice(0, 2);
  return shuffled([...picked, ...over].map(([a, b]) => ({ type: 'add', a, b, width: 4 })), rnd);
}

// Task 5 plenary: 3 key-idea questions and 2 eight-bit additions, shuffled.
export function drawPlenary(seed, attempt) {
  const rnd = seededRandom(`${seed}|plenary|${attempt}`);
  const mcq = shuffled(PLENARY_POOL.map(q => q.id), rnd).slice(0, 3).map(id => ({ type: 'mcq', id, pool: 'plenary' }));
  const adds = shuffled(POOLS.add8, rnd).slice(0, 2).map(([a, b]) => ({ type: 'add', a, b, width: 8 }));
  return shuffled([...mcq, ...adds], rnd);
}

// ── Extension game: Carry Rush ──
// Not scored for Classroom. Sums get bigger as the run goes on (by sum number, not score,
// so a class challenge code gives everyone the same sums in the same order).

// Levels 2–3 carry with 1 + 1 only; 1 + 1 + 1 comes in at Level 4.
const plain = (a, b) => !hasTriple(a, b, 4);
export const GAME_POOLS = {
  carry2: [...POOLS.onecarry4, ...carry4.filter(([a, b]) => plain(a, b))],
  over2:  over4.filter(([a, b]) => plain(a, b)),
  add6:  pairs(range(8, 63), range(8, 63), (a, b) =>
           a + b <= 63 && ones(a) >= 2 && ones(b) >= 2 && carryCount(a, b, 6) >= 2),
  over8: pairs(range(129, 250), range(129, 250), (a, b) =>
           a + b >= 256 && ones(a) >= 3 && ones(b) >= 3 && carryCount(a, b, 8) <= 5),
};
const gamePool = name => POOLS[name] ?? GAME_POOLS[name];

// from: the first sum (0-based) at this level. Each sum picks one of the level's pools at random.
export const GAME_LEVELS = [
  { from: 0,  name: 'Level 1', width: 4, pools: ['nocarry4'],              time: 45, base: 100 },  // no carries
  { from: 5,  name: 'Level 2', width: 4, pools: ['carry2'],                time: 40, base: 100 },  // 1 + 1 = 0, carry 1
  { from: 12, name: 'Level 3', width: 4, pools: ['carry2', 'over2'],       time: 40, base: 120 },  // + a final carry
  { from: 20, name: 'Level 4', width: 4, pools: ['triple4', 'over4'],      time: 40, base: 140 },  // 1 + 1 + 1 = 1, carry 1
  { from: 28, name: 'Level 5', width: 6, pools: ['add6'],                  time: 45, base: 160 },
  { from: 36, name: 'Level 6', width: 8, pools: ['add8'],                  time: 60, base: 200 },
  { from: 46, name: 'Level 7', width: 8, pools: ['add8', 'over8'],         time: 55, base: 250 },
];

export const GAME_LIVES = 3;

export function gameLevel(i) {
  let lvl = GAME_LEVELS[0];
  for (const l of GAME_LEVELS) if (i >= l.from) lvl = l;
  return lvl;
}

// Seconds for sum i: the level's time, and at the last level it shrinks by 3 s every 5 sums, never below 25.
export function gameTime(i) {
  const lvl = gameLevel(i);
  if (lvl !== GAME_LEVELS.at(-1)) return lvl.time;
  return Math.max(25, lvl.time - 3 * Math.floor((i - lvl.from) / 5));
}

function rawSum(seed, i, salt = 0) {
  const lvl = gameLevel(i);
  const rnd = seededRandom(`${seed}|rush|${i}|${salt}`);
  const pool = gamePool(lvl.pools[Math.floor(rnd() * lvl.pools.length)]);
  const [a, b] = pool[Math.floor(rnd() * pool.length)];
  return { i, a, b, width: lvl.width, level: lvl.name };
}

// Sum i of a run. The same seed (a class code) always gives the same sum; never the same sum twice running.
export function gameSum(seed, i) {
  const prev = i > 0 ? rawSum(seed, i - 1) : null;
  for (let salt = 0; ; salt++) {
    const s = rawSum(seed, i, salt);
    if (!prev || s.a !== prev.a || s.b !== prev.b) return s;
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
  [0, 'Trainee'], [1000, 'Adder'], [3000, 'Carry Cadet'], [6000, 'Column Captain'],
  [12000, 'Binary Boss'], [25000, 'Overflow Legend'], [50000, 'Carry Champion'],
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
  ['overflow', '🚀 Overflow',       'Get a sum with a final carry right'],
  ['eight',    '🧮 Eight Columns',  'Reach the 8-bit sums (Level 6)'],
  ['speed',    '🏎 Lightning',      '5 sums right in under 5 seconds each, in one run'],
  ['perfect',  '💎 Flawless 20',    'The first 20 sums all right'],
  ['score10k', '🏛 10,000 Club',    '10,000+ points in one run'],
];

// run = { played, maxStreak, fast, perfect, overflow, score }: the badges this run earned.
export function runBadges(run) {
  return {
    first: true,
    streak5: run.maxStreak >= 5,
    streak10: run.maxStreak >= 10,
    overflow: run.overflow > 0,
    eight: run.played > GAME_LEVELS.find(l => l.width === 8).from,
    speed: run.fast >= 5,
    perfect: run.played >= 20 && run.perfect,
    score10k: run.score >= 10000,
  };
}

// A class challenge code: letters and digits only, upper case, at most 8.
export const cleanCode = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

// ── Hover definitions ──
// [pattern, meaning]: the page dotted-underlines these words in task text and shows the meaning on hover, focus or tap.
// Longer phrases first, so "final carry" wins over "carry". Meanings: plain words, 80 characters at most.
export const GLOSSARY = [
  ['final carry', 'A carry out of the leftmost column. It becomes a new bit on the left.'],
  ['carry|carries|carrying', 'A 1 moved into the next column on the left, when a column adds up to 2 or more.'],
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
export const NO_GLOSS = ['lq'];
