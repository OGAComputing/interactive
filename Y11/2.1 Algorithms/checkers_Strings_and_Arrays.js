// Mark-scheme checks for Strings_and_Arrays.html (pure functions, no DOM).
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
// inside messages (e.g. "Thanks for playing") don't count as keywords.
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

// Words and numbers in a line, split on anything that isn't a letter or digit.
export const tokens = line => line.split(/[^A-Za-z0-9]+/).filter(Boolean);
// Some printed line contains `tok` as a whole word (case-sensitive) and none of `avoid`.
export const hasToken = (run, tok, avoid = []) => ok(run) &&
  printed(run).lines.some(l => tokens(l).includes(tok) && !avoid.some(a => l.includes(a)));
// `tok` is printed as a whole word and none of the `others` are printed anywhere.
export const hasOnlyToken = (run, tok, others) => ok(run) && hasToken(run, tok) &&
  !printed(run).lines.some(l => others.some(o => tokens(l).includes(o)));
// Some printed line contains `tok` as a whole word and none of the `others` as whole words.
export const lineHasOnlyToken = (run, tok, others) => ok(run) &&
  printed(run).lines.some(l => { const t = tokens(l); return t.includes(tok) && !others.some(o => t.includes(o)); });
// Some printed line contains `word` (which may hold . or _) as a whole word and no '@'.
export const hasWord = (run, word) => ok(run) &&
  printed(run).lines.some(l => !l.includes('@') &&
    l.split(/[^A-Za-z0-9._]+/).map(w => w.replace(/\.+$/, '')).includes(word));

// ── Source helpers ─────────────────────────────────────────────
export const inputs     = src => (src.match(/\binput\s*\(/g) || []).length;
export const hasIf      = src => /\bif\b/.test(src);
export const hasLoop    = src => /\bfor\b|\bwhile\b|\bdo\b/.test(src);
export const extracts   = src => /\.substring\s*\(|\bleft\s*\(|\bright\s*\(/.test(src);
export const usesLength = src => /\.length\b/.test(src);
export const declaresArray = src => /\barray\s+\w+\s*\[/.test(src);
// Assigns to an array element (scores[i] = … or scores[0] = …).
export const storesByIndex = src => /\b\w+\s*\[[^\]]+\]\s*=(?!=)/.test(src);

// ── Questions ──────────────────────────────────────────────────
// Printing every player or every day isn't "outputting the one asked for".
const MIDDLE = [['Saka', 'Rice', 'Foden'], ['Hemp', 'Bronze', 'Toone']];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const otherDays = day => DAYS.filter(d => d !== day);

export const QUESTIONS = {

  // ════════════ PART A — substrings ════════════

  username: {
    tests: [
      { inputs: ['Grace', 'Hopper'], expected: 'HopG' },
      { inputs: ['Alan', 'Turing'],  expected: 'TurA' },
    ],
    criteria: [
      { text: 'Inputs and stores the first name and the surname', marks: 1,
        check: ({ src }) => inputs(src) >= 2 },
      { text: 'Extracts characters from a string', marks: 1,
        check: ({ src }) => extracts(src) },
      { text: 'Outputs the correct username for Grace Hopper (HopG)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'HopG') },
      { text: 'Outputs the correct username for Alan Turing (TurA)', marks: 1,
        check: ({ runs }) => hasToken(runs[1], 'TurA') },
    ],
  },

  stockCode: {
    tests: [
      { inputs: ['LDN07RED'], expected: ['LDN', '07', 'RED'] },
      { inputs: ['MAN12BLU'], expected: ['MAN', '12', 'BLU'] },
    ],
    criteria: [
      { text: 'Inputs and stores the stock code', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Outputs the warehouse: the first 3 characters (LDN, MAN)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'LDN') && hasToken(runs[1], 'MAN') },
      { text: 'Outputs the aisle: the 4th and 5th characters (07, 12)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], '07') && hasToken(runs[1], '12') },
      { text: 'Outputs the colour: the last 3 characters (RED, BLU)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'RED') && hasToken(runs[1], 'BLU') },
    ],
  },

  postcode: {
    tests: [
      { inputs: ['LS27 0LE'], expected: ['LS27', '0LE'] },
      { inputs: ['M1 1AE'],   expected: ['M1', '1AE'] },
      { inputs: ['SW1A 2AA'], expected: ['SW1A', '2AA'] },
    ],
    criteria: [
      { text: 'Inputs and stores the postcode', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Uses the length of the string', marks: 1,
        check: ({ src }) => usesLength(src) },
      { text: 'Outputs the inward code: the last 3 characters (0LE, 1AE, 2AA)', marks: 1,
        check: ({ runs }) => [['0LE', 'LS27 0LE'], ['1AE', 'M1 1AE'], ['2AA', 'SW1A 2AA']]
          .every(([code, whole], i) => hasToken(runs[i], code, [whole])) },
      // "M1 1" is what a fixed 4-character outward code gives for "M1 1AE".
      { text: 'Outputs the outward code: everything before the space, for any length (LS27, M1, SW1A)', marks: 1,
        check: ({ runs }) => [['LS27', 'LS27 0LE'], ['M1', 'M1 1AE'], ['SW1A', 'SW1A 2AA']]
          .every(([code, whole], i) => hasToken(runs[i], code, [whole, code + ' ' + whole.slice(-3, -2)])) },
    ],
  },

  middle: {
    tests: [
      { inputs: ['apple'],   expected: 'p' },
      { inputs: ['monitor'], expected: 'i' },
      { inputs: ['cat'],     expected: 'a' },
    ],
    criteria: [
      { text: 'Inputs and stores the word', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Uses the length of the word', marks: 1,
        check: ({ src }) => usesLength(src) },
      { text: 'Outputs the middle character of "apple" (p)', marks: 1,
        check: ({ runs }) => hasToken(runs[0], 'p') },
      { text: 'Outputs the middle character of words of other lengths ("monitor" → i, "cat" → a)', marks: 1,
        check: ({ runs }) => hasToken(runs[1], 'i') && hasToken(runs[2], 'a') },
    ],
  },

  // ════════════ PART B — arrays ════════════

  lineup: {
    tests: [
      { inputs: ['Kane', 'Saka', 'Rice', 'Foden', 'Pickford'], expected: ['Kane', 'Pickford'] },
      { inputs: ['Russo', 'Hemp', 'Bronze', 'Toone', 'Earps'], expected: ['Russo', 'Earps'] },
    ],
    criteria: [
      { text: 'Declares an array to hold the five players', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Inputs all five player names', marks: 1,
        check: ({ runs }) => runs.every(consumedAll) },
      { text: 'Outputs the first player entered (Kane, Russo)', marks: 1,
        check: ({ runs }) => hasOnlyToken(runs[0], 'Kane', MIDDLE[0]) && hasOnlyToken(runs[1], 'Russo', MIDDLE[1]) },
      { text: 'Outputs the last player entered (Pickford, Earps)', marks: 1,
        check: ({ runs }) => hasOnlyToken(runs[0], 'Pickford', MIDDLE[0]) && hasOnlyToken(runs[1], 'Earps', MIDDLE[1]) },
    ],
  },

  dayFinder: {
    tests: [
      { inputs: ['1'], expected: 'Monday' },
      { inputs: ['3'], expected: 'Wednesday' },
      { inputs: ['7'], expected: 'Sunday' },
    ],
    criteria: [
      { text: 'Inputs and stores the day number', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Uses the number entered to look up an element of the array', marks: 1,
        check: ({ src }) => /\bdays\s*\[\s*[a-z_]/.test(src) },
      { text: 'Outputs the correct day for 1 and 3 (Monday, Wednesday)', marks: 1,
        check: ({ runs }) => hasOnlyToken(runs[0], 'Monday', otherDays('Monday')) &&
          hasOnlyToken(runs[1], 'Wednesday', otherDays('Wednesday')) },
      { text: 'Outputs the correct day for 7, the last element (Sunday)', marks: 1,
        check: ({ runs }) => hasOnlyToken(runs[2], 'Sunday', otherDays('Sunday')) },
    ],
  },

  rainfall: {
    tests: [
      { inputs: ['2', '0', '5', '3', '1', '4', '6'],  expected: ['21', '3'] },
      { inputs: ['10', '2', '0', '0', '8', '1', '7'], expected: ['28', '4'] },
    ],
    criteria: [
      { text: 'Declares an array to hold the rainfall', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Inputs seven values and stores each one in the array', marks: 1,
        check: ({ src, runs }) => storesByIndex(src) && runs.every(consumedAll) },
      { text: 'Outputs the correct total (21, 28)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 21) && hasNum(runs[1], 28) },
      { text: 'Outputs the correct mean average (3, 4)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 3) && hasNum(runs[1], 4) },
    ],
  },

  marksGrid: {
    tests: [
      { inputs: ['0', '0'], expected: '45' },
      { inputs: ['1', '2'], expected: '71' },
      { inputs: ['2', '3'], expected: '38' },
    ],
    criteria: [
      { text: 'Inputs and stores the student number and the test number', marks: 1,
        check: ({ src }) => inputs(src) >= 2 },
      { text: 'Uses both numbers entered to access the 2D array', marks: 1,
        check: ({ src }) => /\bmarks\s*\[\s*[a-z_]\w*\s*,\s*[a-z_]\w*\s*\]/.test(src) },
      { text: 'Outputs the correct mark for student 0, test 0 (45)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 45) },
      { text: 'Outputs the correct mark for other students and tests (1, 2 → 71 and 2, 3 → 38)', marks: 1,
        check: ({ runs }) => hasNum(runs[1], 71) && hasNum(runs[2], 38) },
    ],
  },

  // ════════════ PART C — combining skills ════════════

  vowels: {
    tests: [
      { inputs: ['computer'],  expected: '3' },
      { inputs: ['education'], expected: '5' },
      { inputs: ['rhythm'],    expected: '0' },
    ],
    criteria: [
      { text: 'Inputs and stores the word', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Extracts one character at a time from the word', marks: 1,
        check: ({ src }) => extracts(src) || /\b\w+\s*\[\s*[a-z_]\w*\s*\]/.test(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs the correct number of vowels ("computer" → 3, "education" → 5)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 3) && hasNum(runs[1], 5) },
      { text: 'Outputs 0 for a word with no vowels ("rhythm")', marks: 1,
        check: ({ runs }) => hasNum(runs[2], 0) },
    ],
  },

  email: {
    // A trailing address is only read if a valid one is wrongly rejected.
    tests: [
      { inputs: ['sam@gmail.com', 'sam.jones@school.org', 'zz@school.org'], expected: 'sam.jones' },
      { inputs: ['ali@school.org', 'zz@school.org'],                        expected: 'ali' },
      { inputs: ['bob@school.org.uk', 'bob@school.co', 'bob.k@school.org', 'zz@school.org'], expected: 'bob.k' },
    ],
    criteria: [
      { text: 'Inputs and stores the email address', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Keeps asking until the address ends in @school.org (tested: @gmail.com, @school.org.uk, @school.co)', marks: 1,
        check: ({ runs }) => ok(runs[0]) && printed(runs[0]).consumed === 2 &&
          ok(runs[2]) && printed(runs[2]).consumed === 3 },
      { text: 'Accepts a valid address first time (ali@school.org)', marks: 1,
        check: ({ runs }) => ok(runs[1]) && printed(runs[1]).consumed === 1 },
      { text: 'Outputs the username: everything before the @ (sam.jones, ali, bob.k)', marks: 1,
        check: ({ runs }) => [['sam.jones', 0], ['ali', 1], ['bob.k', 2]]
          .every(([name, i]) => hasWord(runs[i], name)) },
    ],
  },

  register: {
    tests: [
      { inputs: ['Chloe'], expected: '2' },
      { inputs: ['Zane'],  expected: '7' },
      { inputs: ['Bob'],   expected: 'not found' },
    ],
    criteria: [
      { text: 'Inputs and stores the name to search for', marks: 1,
        check: ({ src }) => inputs(src) >= 1 },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs the index of a name in the array (Chloe → 2)', marks: 1,
        check: ({ runs }) => hasNum(runs[0], 2) && !has(runs[0], 'not found') },
      { text: 'Finds the last name in the array (Zane → 7)', marks: 1,
        check: ({ runs }) => hasNum(runs[1], 7) && !has(runs[1], 'not found') },
      { text: 'Outputs "Not found" once, only when the name is not in the array (tested: Bob)', marks: 1,
        check: ({ runs }) => count(runs[2], /not found/) === 1 },
    ],
  },

  longestWord: {
    tests: [
      { inputs: ['run', 'jumping', 'swimming', 'cat', 'sing'],     expected: ['swimming', '3'] },
      { inputs: ['apple', 'kiwi', 'banana', 'fig', 'grape'],       expected: ['banana', '0'] },
      { inputs: ['coding', 'reading', 'singer', 'ok', 'go'],       expected: ['reading', '2'] },
      { inputs: ['ring', 'sing', 'king', 'ping', 'wing'],          expected: ['ring', '5'] },
    ],
    criteria: [
      { text: 'Declares an array to hold the five words', marks: 1,
        check: ({ src }) => declaresArray(src) },
      { text: 'Inputs five words and stores each one in the array', marks: 1,
        check: ({ src, runs }) => storesByIndex(src) && runs.every(consumedAll) },
      { text: 'Attempts to use iteration (any loop present)', marks: 1,
        check: ({ src }) => hasLoop(src) },
      { text: 'Attempts to use selection (any if statement present)', marks: 1,
        check: ({ src }) => hasIf(src) },
      { text: 'Outputs the longest word (swimming, banana, reading)', marks: 1,
        check: ({ runs }) => [0, 1, 2].every(i => {
          const longest = runs[i].inputs.reduce((a, w) => (w.length > a.length ? w : a));
          return lineHasOnlyToken(runs[i], longest, runs[i].inputs.filter(w => w !== longest));
        }) },
      { text: 'Outputs the first of the longest words when there is a tie (ring, sing, king, ping, wing → ring)', marks: 1,
        check: ({ runs }) => lineHasOnlyToken(runs[3], 'ring', ['sing', 'king', 'ping', 'wing']) },
      { text: 'Outputs how many words end in "ing" (3, 0, 2, 5)', marks: 1,
        check: ({ runs }) => [3, 0, 2, 5].every((n, i) => hasNum(runs[i], n)) },
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
