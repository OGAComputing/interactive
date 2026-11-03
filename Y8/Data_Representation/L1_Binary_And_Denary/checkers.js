// Pure answer data and checkers for 1_Binary_And_Denary.html (no DOM).
// Unit-tested in checkers.test.js.

export const TASK_COUNT = 7;

// The 8 binary headings, left to right. Each one is double the heading to its right.
export const HEADINGS = [128, 64, 32, 16, 8, 4, 2, 1];

// ── Seeded randomness (stable per student, so a reload shows the same numbers) ──
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (!s) s = 1;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
  // Seeds that differ only in their last character start close together; a few
  // warm-up rounds spread them out, so a retry really does get a new number.
  for (let i = 0; i < 4; i++) next();
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

const randInt = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

// Escalating wait after a wrong check: 10 s, 20 s, then 30 s.
export function cooldownSeconds(wrongCount) {
  return Math.min(30, 10 * Math.max(1, wrongCount));
}

// ── Conversions ───────────────────────────────────────────
export function toBinary(n, width = 8) {
  return n.toString(2).padStart(width, '0');
}

export function toDenary(bits) {
  return [...bits].reduce((sum, b) => sum * 2 + (b === '1' ? 1 : 0), 0);
}

// The headings that have a 1 under them, biggest first: '1011' → [8, 2, 1].
export function headingsUsed(bits) {
  const w = bits.length;
  return [...bits].map((b, i) => (b === '1' ? 2 ** (w - 1 - i) : 0)).filter(Boolean);
}

// "8 + 2 + 1 = 11" (the worked example shown after any binary → denary answer).
export function b2dWhy(bits) {
  const used = headingsUsed(bits);
  const n = toDenary(bits);
  if (used.length === 0) return 'There are no 1s, so the total is 0.';
  if (used.length === 1) return `Only the ${used[0]} heading has a 1, so the answer is ${n}.`;
  return `Add the headings with a 1 under them: ${used.join(' + ')} = ${n}`;
}

// "13 = 8 + 4 + 1, so 13 is 00001101" (shown after any denary → binary answer).
export function d2bWhy(n, width = 8) {
  const bits = toBinary(n, width);
  return `${n} = ${headingsUsed(bits).join(' + ')}, so ${n} in binary is ${bits}`;
}

// A typed denary answer: digits only (spaces ignored).
export function checkDenary(input, value) {
  const t = String(input ?? '').replace(/\s+/g, '');
  return /^\d+$/.test(t) && Number(t) === value;
}

// A typed binary answer: only 0s and 1s (spaces ignored), leading zeros allowed.
export function checkBinaryText(input, value) {
  const t = String(input ?? '').replace(/\s+/g, '');
  return /^[01]{1,8}$/.test(t) && toDenary(t) === value;
}

// Explain what's wrong with a typed binary answer before marking it.
export function binaryTextProblem(input) {
  const t = String(input ?? '').replace(/\s+/g, '');
  if (!t) return 'Type your answer first.';
  if (/[^01]/.test(t)) return 'Binary only uses the digits 0 and 1.';
  if (t.length > 8) return 'Use 8 bits at most (one for each heading).';
  return '';
}

// ── Task 0: starter cipher (A = 1 … Z = 26) ───────────────
export const CIPHER_WORDS = ['there', 'are', 'ten', 'types', 'of', 'people', 'that', 'understand', 'binary'];

export function encodeWord(word) {
  return [...word.toLowerCase()].map(c => c.charCodeAt(0) - 96);
}

export function checkCipher(answers) {
  const results = {};
  CIPHER_WORDS.forEach((w, i) => {
    results['w' + i] = String(answers['w' + i] ?? '').trim().toLowerCase() === w;
  });
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 1: keywords ──────────────────────────────────────
export const KEYWORDS = [
  { id: 'denary',     word: 'Denary',     def: 'The base-10 number system we use every day (digits 0 to 9).' },
  { id: 'binary',     word: 'Binary',     def: 'The base-2 number system computers use (digits 0 and 1).' },
  { id: 'bit',        word: 'Bit',        def: 'A single binary digit: one 0 or one 1.' },
  { id: 'nibble',     word: 'Nibble',     def: 'A group of 4 bits, such as 1011.' },
  { id: 'byte',       word: 'Byte',       def: 'A group of 8 bits, such as 01001101.' },
  { id: 'conversion', word: 'Conversion', def: 'Changing a value from one form into another.' },
];

// placed: { 'kw-<id>': '<word id dropped on that definition>' }
export function checkKeywords(placed) {
  const results = {};
  KEYWORDS.forEach(k => { results['kw-' + k.id] = placed['kw-' + k.id] === k.id; });
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 2: place-value headings ──────────────────────────
// The two right-hand headings (2 and 1) are given; students fill in the other six.
export const GIVEN_HEADINGS = [6, 7];

export function checkHeadings(values) {
  const results = {};
  HEADINGS.forEach((h, i) => {
    if (GIVEN_HEADINGS.includes(i)) return;
    results['h' + i] = checkDenary(values['h' + i], h);
  });
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 3: binary → denary chain, with the support fading ──
// glow  = bits under the headings, the 1-columns highlighted
// grid  = bits under the headings, no highlight
// plain = just the binary number: students line it up with the headings themselves
export const B2D_LEVELS = [
  { width: 4, mode: 'glow' },
  { width: 4, mode: 'glow' },
  { width: 4, mode: 'grid' },
  { width: 6, mode: 'grid' },
  { width: 5, mode: 'plain' },
  { width: 8, mode: 'plain' },
];
export const B2D_LENGTH = B2D_LEVELS.length;

// The number range for a width: always uses the top bit, never all 1s.
function rangeFor(width) {
  return [2 ** (width - 1) + 1, 2 ** width - 2];
}

// One question. A wrong answer keeps the position and gives a new number (retry + 1).
export function b2dQuestion(seed, attempt, pos, retry = 0) {
  const lvl = B2D_LEVELS[pos];
  const rnd = seededRandom(`${seed}|b2d|${attempt}|${pos}|${retry}`);
  const [lo, hi] = rangeFor(lvl.width);
  const value = randInt(rnd, lo, hi);
  return { ...lvl, value, bits: toBinary(value, lvl.width) };
}

// ── Task 4: "Does it fit?" guided denary → binary ─────────
export const GUIDED_POOLS = [
  [11, 13, 19, 21, 26],
  [37, 41, 45, 50, 53],
];
export const GUIDED_LENGTH = GUIDED_POOLS.length;

export function guidedNumber(seed, attempt, pos) {
  const pool = GUIDED_POOLS[pos];
  return pool[Math.floor(seededRandom(`${seed}|guided|${attempt}|${pos}`)() * pool.length)];
}

// One step per heading: does the heading fit into what is left?
export function fitSteps(n) {
  let left = n;
  return HEADINGS.map(h => {
    const fits = h <= left;
    const step = { heading: h, before: left, fits, after: fits ? left - h : left };
    left = step.after;
    return step;
  });
}

export function fitWhy(step) {
  return step.fits
    ? `${step.heading} fits into ${step.before}. Write a 1, then ${step.before} − ${step.heading} = ${step.after} left.`
    : `${step.heading} is bigger than ${step.before}, so it does not fit. Write a 0.`;
}

// ── Task 5: denary → binary chain (toggle the 8 bits) ─────
export const D2B_RANGES = [[3, 15], [5, 15], [17, 31], [33, 63], [65, 200]];
export const D2B_LENGTH = D2B_RANGES.length;

export function d2bQuestion(seed, attempt, pos, retry = 0) {
  const [lo, hi] = D2B_RANGES[pos];
  const rnd = seededRandom(`${seed}|d2b|${attempt}|${pos}|${retry}`);
  return { value: randInt(rnd, lo, hi) };
}

// bits: array of 8 '0' | '1' strings, left to right under HEADINGS.
export function checkBits(bits, value) {
  return bits.length === 8 && bits.every(b => b === '0' || b === '1') && toDenary(bits.join('')) === value;
}

// ── Task 6: plenary, mixed, in a row ──────────────────────
// Alternates binary → denary and denary → binary, getting bigger, like the slide plenary.
export const FINAL_PLAN = [
  { type: 'b2d', width: 4 },
  { type: 'd2b', range: [6, 15] },
  { type: 'b2d', width: 5 },
  { type: 'd2b', range: [17, 31] },
  { type: 'b2d', width: 6 },
  { type: 'd2b', range: [33, 63] },
];
export const FINAL_LENGTH = FINAL_PLAN.length;

export function finalQuestion(seed, attempt, pos) {
  const p = FINAL_PLAN[pos];
  const rnd = seededRandom(`${seed}|final|${attempt}|${pos}`);
  if (p.type === 'b2d') {
    const [lo, hi] = rangeFor(p.width);
    const value = randInt(rnd, lo, hi);
    return { type: 'b2d', value, bits: toBinary(value, p.width) };
  }
  return { type: 'd2b', value: randInt(rnd, p.range[0], p.range[1]) };
}

export function checkFinal(q, input) {
  return q.type === 'b2d' ? checkDenary(input, q.value) : checkBinaryText(input, q.value);
}
