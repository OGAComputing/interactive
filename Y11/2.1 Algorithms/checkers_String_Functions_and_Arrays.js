// Mark-scheme checks for String_Functions_and_Arrays.html (pure functions, no DOM).
//
// Each question id maps to:
//   tests    [{ inputs, expected }]  — run once per test; `expected` only colours the output
//   criteria [{ text, marks, check({ src, runs }) }]
// `src` is normSrc(student code); each run is { inputs, output, ok }.

// ── Output helpers ─────────────────────────────────────────────
// The mocked input() echoes "prompt + value" into the output, so every
// behaviour check looks only at what the program printed itself.

// An echo line is "prompt + value", where the prompt may or may not end in a
// space. A line only counts if the match doesn't split a number, so
// "Total: 50" isn't taken as a typed "0".
export function isEcho(line, value) {
  const v = String(value);
  const l = line.trimEnd();
  if (!l.endsWith(v)) return false;
  const before = l.slice(0, l.length - v.length);
  return !(/^[\d.\-]/.test(v) && /[\d.]$/.test(before));
}

// Lines the program printed, with the input echo lines removed (in order).
export function printed(run) {
  const lines = (run.output || '').split('\n');
  const keep = [];
  let k = 0;
  for (const line of lines) {
    const v = run.inputs[k];
    if (v !== undefined && isEcho(line, v)) {
      k++;
      continue;
    }
    keep.push(line);
  }
  return { lines: keep.filter(l => l.trim() !== ''), consumed: k };
}

// Lower-case the source and blank out comments and string literals, so words
// inside messages (e.g. "Enter your name") don't count as keywords.
export function normSrc(raw) {
  return raw
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/"[^"\n]*"|'[^'\n]*'/g, '""')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

export const text   = run => printed(run).lines.join('\n').toLowerCase();
export const nums   = s => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
export const ok     = run => !!run && run.ok;
export const has    = (run, needle) => ok(run) && text(run).includes(needle.toLowerCase());
export const count  = (run, re) => ok(run) ? (text(run).match(new RegExp(re.source, 'g')) || []).length : 0;
export const hasNum = (run, n) => ok(run) && nums(text(run)).some(x => Math.abs(x - n) < 1e-9);
export const consumedAll = run => ok(run) && printed(run).consumed === run.inputs.length;

// Some printed line contains `s` exactly (case-sensitive), so "HELLO WORLD"
// isn't matched by "Hello World".
export const hasExact = (run, s) => ok(run) && printed(run).lines.some(l => l.includes(s));

// Words and numbers in a line, split on anything that isn't a letter or digit.
export const tokens = line => line.split(/[^A-Za-z0-9]+/).filter(Boolean);
export const allTokens = run => printed(run).lines.flatMap(tokens);
// Some printed line contains `tok` as a whole word (case-sensitive) and none of `avoid`.
export const hasToken = (run, tok, avoid = []) => ok(run) &&
  printed(run).lines.some(l => tokens(l).includes(tok) && !avoid.some(a => l.includes(a)));
// Every one of `toks` is printed as a whole word and none of the `others` are.
export const hasOnlyTokens = (run, toks, others) => ok(run) &&
  toks.every(t => allTokens(run).includes(t)) && !others.some(o => allTokens(run).includes(o));
// Some printed word, split on spaces, is exactly `word` (trailing punctuation
// ignored), so an email address is matched whole.
export const hasWord = (run, word) => ok(run) &&
  printed(run).lines.some(l => l.split(/\s+/).map(w => w.replace(/[,;:!]+$|\.+$/, '')).includes(word));

// Position of `word` (case-sensitive, whole word) in the printed output, or -1.
export const posOf = (run, word) => {
  const m = new RegExp(`(?<![A-Za-z0-9])${word}(?![A-Za-z0-9])`).exec(printed(run).lines.join('\n'));
  return m ? m.index : -1;
};

// The single verdict printed: 'strong' or 'weak' if exactly one of them is
// printed exactly once, otherwise null (nothing, both, or one per loop pass).
export function verdict(run) {
  if (!ok(run)) return null;
  const s = count(run, /strong/), w = count(run, /weak/);
  if (s === 1 && w === 0) return 'strong';
  if (w === 1 && s === 0) return 'weak';
  return null;
}

// ── Source helpers ─────────────────────────────────────────────
export const inputs     = src => (src.match(/\binput\s*\(/g) || []).length;
export const hasIf      = src => /\bif\b/.test(src);
export const hasLoop    = src => /\bfor\b|\bwhile\b|\bdo\b/.test(src);
export const extracts   = src => /\.substring\s*\(|\.left\s*\(|\.right\s*\(/.test(src);
export const declaresArray = src => /\barray\s+\w+\s*\[/.test(src);
// Assigns to an array element (items[i] = … or items[0] = …).
export const storesByIndex = src => /\b\w+\s*\[[^\]]+\]\s*=(?!=)/.test(src);

// ── Question data ──────────────────────────────────────────────
// Given to the student in the starter program of each question that uses it.
export const TEMPS = [18, 22, 25, 19, 22, 15, 27];
export const SEATS = [
  ['booked', 'booked', 'empty', 'empty'],
  ['empty', 'booked', 'empty', 'booked'],
  ['empty', 'empty', 'empty', 'booked'],
];
export const SALES = [
  [120, 85, 140, 95],
  [60, 75, 50, 90],
  [200, 180, 210, 190],
];
export const NAMES = ['amir', 'Beth', 'CHLOE', 'dev', 'Dani', 'ellie'];
export const COMMON = ['password', 'qwertyuiop', 'letmein123', 'football', 'iloveyou'];

const UPPER_NAMES = NAMES.map(n => n.toUpperCase());
const notIn = keep => UPPER_NAMES.filter(n => !keep.includes(n));

// Name Tidy-up: some printed word spells `name` (any case) and passes `test`.
const nameWord = (run, name, test) => ok(run) &&
  allTokens(run).some(t => t.toLowerCase() === name.toLowerCase() && test(t));

// Shopping list: all four items printed, last one first.
const reversed = run => {
  const pos = [...run.inputs].reverse().map(w => posOf(run, w));
  return pos.every(p => p >= 0) && pos.every((p, i) => i === 0 || p > pos[i - 1]);
};

export const QUESTIONS = {

  // ════════════ PART A — string functions ════════════

  caseConvert: {
    tests: [
      { inputs: ['Hello World'],   expected: ['HELLO WORLD', '11'] },
      { inputs: ['pYthon IS fun'], expected: ['PYTHON IS FUN', '13'] },
    ],
    criteria: [
      { text: 'Inputs and stores the sentence', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Outputs the sentence in upper case (HELLO WORLD, PYTHON IS FUN)', marks: 1,
        check: ({ runs }) => hasExact(runs[0], 'HELLO WORLD') && hasExact(runs[1], 'PYTHON IS FUN') },
      { text: 'Outputs the sentence in lower case (hello world, python is fun)', marks: 1,
        check: ({ runs }) => hasExact(runs[0], 'hello world') && hasExact(runs[1], 'python is fun') },
      { text: 'Outputs the number of characters, including spaces (11, 13)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 11) && hasNum(runs[1], 13) },
    ],
  },

  date: {
    tests: [
      { inputs: ['04/11/2026'], expected: ['04', '11', '2026'] },
      { inputs: ['25/12/1999'], expected: ['25', '12', '1999'] },
    ],
    criteria: [
      { text: 'Inputs and stores the date', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Outputs the day: the first 2 characters (04, 25)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], '04', ['04/11']) && hasToken(runs[1], '25', ['25/12']) },
      { text: 'Outputs the month: the 4th and 5th characters (11, 12)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], '11', ['/11/']) && hasToken(runs[1], '12', ['/12/']) },
      { text: 'Outputs the year: the last 4 characters (2026, 1999)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], '2026', ['/2026']) && hasToken(runs[1], '1999', ['/1999']) },
    ],
  },

  flight: {
    tests: [
      { inputs: ['LHR-JFK'], expected: ['LHR', 'JFK'] },
      { inputs: ['man-dxb'], expected: ['MAN', 'DXB'] },
    ],
    criteria: [
      { text: 'Inputs and stores the route code', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Extracts characters from the route code', marks: 1,
        check: ({ src }) => extracts(src) },
      { text: 'Outputs the departure airport in upper case: the first 3 characters (LHR, MAN)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'LHR', ['LHR-']) && hasToken(runs[1], 'MAN', ['MAN-']) },
      { text: 'Outputs the arrival airport in upper case: the last 3 characters (JFK, DXB)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'JFK', ['-JFK']) && hasToken(runs[1], 'DXB', ['-DXB']) },
    ],
  },

  tidyName: {
    tests: [
      { inputs: ['aLAN'],  expected: 'Alan' },
      { inputs: ['GRACE'], expected: 'Grace' },
      { inputs: ['ada'],   expected: 'Ada' },
    ],
    criteria: [
      { text: 'Inputs and stores the name', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Outputs the first letter in upper case (aLAN → A…)', marks: 1,
        check: ({ runs }) => nameWord(runs[0], 'alan', t => t[0] === 'A') },
      { text: 'Outputs the rest of the name in lower case (aLAN → …lan)', marks: 1,
        check: ({ runs }) => nameWord(runs[0], 'alan', t => t.slice(1) === 'lan') },
      { text: 'Works for names of any length and case (GRACE → Grace, ada → Ada)', marks: 1,
        check: ({ runs }) => hasToken(runs[1], 'Grace') && hasToken(runs[2], 'Ada') },
    ],
  },

  // ════════════ PART B — arrays ════════════

  shopping: {
    tests: [
      { inputs: ['bread', 'milk', 'eggs', 'jam'],   expected: ['jam', 'bread'] },
      { inputs: ['apples', 'rice', 'tea', 'soup'],  expected: ['soup', 'apples'] },
    ],
    criteria: [
      { text: 'Declares an array to hold the four items', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Inputs four items and stores each one in the array', marks: 1,
        check: ({ src, runs }) => storesByIndex(src) && runs.every(consumedAll) },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Outputs all four items', marks: 1,
        check: ({ runs }) => runs.every(r => ok(r) && r.inputs.every(w => posOf(r, w) >= 0)) },
      { text: 'Outputs the items in reverse order, last item first (jam, eggs, milk, bread)', marks: 1,
        check: ({ runs }) => runs.every(r => ok(r) && reversed(r)) },
    ],
  },

  hotDays: {
    tests: [
      { inputs: ['20'], expected: '4' },
      { inputs: ['22'], expected: '2' },
      { inputs: ['30'], expected: '0' },
    ],
    criteria: [
      { text: 'Inputs and stores the temperature', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs the number of days warmer than 20 (4)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 4) },
      { text: 'Does not count days equal to the temperature entered (22 → 2)', marks: 1,
        check: ({ runs }) => hasNum(runs[1], 2) && !hasNum(runs[1], 4) },
      { text: 'Outputs 0 when no day is warmer (30)', marks: 1,
        check: ({ runs }) => hasNum(runs[2], 0) },
    ],
  },

  cinema: {
    tests: [
      { inputs: ['0', '0'], expected: 'taken' },
      { inputs: ['1', '2'], expected: 'free' },
      { inputs: ['2', '3'], expected: 'taken' },
      { inputs: ['2', '0'], expected: 'free' },
    ],
    criteria: [
      { text: 'Inputs and stores the row and the seat number', marks: 1,
        check: ({ src }) => inputs(src) >= 2 },
      { text: 'Uses both numbers entered to access the 2D array', marks: 1,
        check: ({ src }) => /\bseats\s*\[\s*[a-z_]\w*\s*,\s*[a-z_]\w*\s*\]/.test(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs "Taken" for a booked seat (row 0 seat 0, row 2 seat 3)', marks: 1,
        check: ({ runs }) => [0, 2].every(i => has(runs[i], 'taken') && !has(runs[i], 'free')) },
      { text: 'Outputs "Free" for an empty seat (row 1 seat 2, row 2 seat 0)', marks: 1,
        check: ({ runs }) => [1, 3].every(i => has(runs[i], 'free') && !has(runs[i], 'taken')) },
    ],
  },

  sales: {
    tests: [
      { inputs: ['0'], expected: '440' },
      { inputs: ['1'], expected: '275' },
      { inputs: ['2'], expected: '780' },
    ],
    criteria: [
      { text: 'Inputs and stores the shop number', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Uses the shop number and a loop counter to access the 2D array', marks: 1,
        check: ({ src }) => /\bsales\s*\[\s*[a-z_]\w*\s*,\s*[a-z_]\w*\s*\]/.test(src) },
      { text: 'Outputs the correct total for shop 0 (440)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 440) },
      { text: 'Outputs the correct total for the other shops (1 → 275, 2 → 780)', marks: 1,
        check: ({ runs }) => hasNum(runs[1], 275) && hasNum(runs[2], 780) },
    ],
  },

  // ════════════ PART C — combining skills ════════════

  nameFinder: {
    tests: [
      { inputs: ['d'], expected: ['DEV', 'DANI'] },
      { inputs: ['A'], expected: 'AMIR' },
      { inputs: ['c'], expected: 'CHLOE' },
      { inputs: ['z'], expected: 'no names' },
    ],
    criteria: [
      { text: 'Inputs and stores the letter', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Extracts the first character of each name', marks: 1,
        check: ({ src }) => extracts(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs the matching name in upper case (A → AMIR)', marks: 1,
        check: ({ runs }) => hasOnlyTokens(runs[1], ['AMIR'], notIn(['AMIR'])) },
      { text: 'Finds every match, whatever the case of the letter or the name (d → DEV and DANI, c → CHLOE)', marks: 1,
        check: ({ runs }) => hasOnlyTokens(runs[0], ['DEV', 'DANI'], notIn(['DEV', 'DANI'])) &&
          hasOnlyTokens(runs[2], ['CHLOE'], notIn(['CHLOE'])) },
      { text: 'Outputs "No names" once, only when no name starts with the letter (tested: z)', marks: 1,
        check: ({ runs }) => count(runs[3], /no names/) === 1 &&
          [0, 1, 2].every(i => ok(runs[i]) && !has(runs[i], 'no names')) },
    ],
  },

  emails: {
    tests: [
      { inputs: ['grace', 'hopper', 'alan', 'turing', 'ada', 'lovelace'],
        expected: ['ghopper@school.org', 'aturing@school.org', 'alovelace@school.org'] },
      { inputs: ['Tim', 'BERNERS', 'Mary', 'Seacole', 'KATHERINE', 'Johnson'],
        expected: ['tberners@school.org', 'mseacole@school.org', 'kjohnson@school.org'] },
    ],
    criteria: [
      { text: 'Declares an array to hold the names', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Inputs three first names and surnames and stores them in arrays', marks: 1,
        check: ({ src, runs }) => storesByIndex(src) && runs.every(consumedAll) },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Outputs an email for each member of staff (ghopper@school.org, aturing@school.org, alovelace@school.org)', marks: 1,
        check: ({ runs }) => ['ghopper', 'aturing', 'alovelace'].every(e => hasWord(runs[0], e + '@school.org')) },
      { text: 'Outputs every email in lower case, whatever case the names are typed in (Tim BERNERS → tberners@school.org)', marks: 1,
        check: ({ runs }) => ['tberners', 'mseacole', 'kjohnson'].every(e => hasWord(runs[1], e + '@school.org')) },
    ],
  },

  password: {
    tests: [
      { inputs: ['BlueTiger42'], expected: 'strong' },
      { inputs: ['abcdefgh'],    expected: 'strong' },
      { inputs: ['abc'],         expected: 'weak' },
      { inputs: ['Football'],    expected: 'weak' },
      { inputs: ['QWERTYUIOP'],  expected: 'weak' },
    ],
    criteria: [
      { text: 'Inputs and stores the password', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs "Strong" once for a long password that is not on the list (BlueTiger42)', marks: 1,
        check: ({ runs }) => verdict(runs[0]) === 'strong' },
      { text: 'Accepts a password of exactly 8 characters (abcdefgh → Strong)', marks: 1,
        check: ({ runs }) => verdict(runs[1]) === 'strong' },
      { text: 'Outputs "Weak" for a password shorter than 8 characters (abc)', marks: 1,
        check: ({ runs }) => verdict(runs[2]) === 'weak' },
      { text: 'Outputs "Weak" for a password on the list, whatever its case (Football, QWERTYUIOP)', marks: 1,
        check: ({ runs }) => verdict(runs[3]) === 'weak' && verdict(runs[4]) === 'weak' },
    ],
  },

  acronym: {
    tests: [
      { inputs: ['as', 'soon', 'as', 'possible'], expected: 'ASAP' },
      { inputs: ['Bring', 'Your', 'own', 'Device'], expected: 'BYOD' },
    ],
    criteria: [
      { text: 'Declares an array to hold the four words', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Inputs four words and stores each one in the array', marks: 1,
        check: ({ src, runs }) => storesByIndex(src) && runs.every(consumedAll) },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Extracts the first character of each word', marks: 1,
        check: ({ src }) => extracts(src) },
      { text: 'Outputs the acronym in upper case (as soon as possible → ASAP)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'ASAP') },
      { text: 'Works whatever case the words are typed in (Bring Your own Device → BYOD)', marks: 1,
        check: ({ runs }) => hasToken(runs[1], 'BYOD') },
    ],
  },
};

// Total marks available for one question.
export const maxMarks = id => QUESTIONS[id].criteria.reduce((s, c) => s + c.marks, 0);

// Mark one question: returns { earned, passed[] } (a check that throws counts as not passed).
export function markQuestion(id, rawSrc, runs) {
  const src = normSrc(rawSrc);
  let earned = 0;
  const passed = QUESTIONS[id].criteria.map(c => {
    let result = false;
    try { result = !!c.check({ src, runs }); } catch (_) { result = false; }
    if (result) earned += c.marks;
    return result;
  });
  return { earned, passed };
}
