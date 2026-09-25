// Validation logic for 1_Casting_PRIMM.html — data types, casting with int()/float(), and
// arithmetic. Builds on Lesson 3 (input): every number here arrives from input() as TEXT.
//
// Checks are formative and accept any valid solution SHAPE (see feedback_checker_flexibility
// memory — there is always more than one way to solve a short programming task):
//   • casting may happen on the input line  — a = int(input("…"))
//     or on a later line                    — a = input("…")  then  a = int(a)
//     or inside the calculation itself      — print(int(a) + int(b))
//   • a result may be printed directly      — print(a - b)
//     or stored first                       — diff = a - b  then  print(diff)
// Modify and Make are run with fixed TEST NUMBERS (MOD_INPUTS / MAKE_INPUTS below), so
// their arithmetic requirements are confirmed from the OUTPUT the program actually printed,
// not from one expected way of writing the code. The Extension challenges are the student's
// own designs (any number of questions, in any order), so they run interactively and are
// checked on shape only.

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (+, input, print, variable-looking words) can't trigger false positives.
export function normalise(code) {
  let s = code.replace(/#[^\n]*/g, '');
  s = s.replace(/"""[\s\S]*?"""/g, '""').replace(/'''[\s\S]*?'''/g, "''");
  s = s.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
  return s;
}

export function has(code, pattern) {
  return pattern instanceof RegExp ? pattern.test(code) : code.includes(pattern);
}

// ── shared helpers ───────────────────────────────────────────────────────────

// Number of input() calls in real code (strings stripped first).
function inputCount(raw) {
  return (normalise(raw).match(/\binput\s*\(/g) || []).length;
}

// Number of int(...) / float(...) casts in real code.
function castCount(raw) {
  return (normalise(raw).match(/\b(?:int|float)\s*\(/g) || []).length;
}

function floatCount(raw) {
  return (normalise(raw).match(/\bfloat\s*\(/g) || []).length;
}

// Variables that end up holding a real number: assigned from anything containing int()/float(),
// e.g. a = int(input("…")), a = int(a), price = float(p).
function numberVars(raw) {
  const s = normalise(raw);
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=(?!=)([^\n]*)$/gm;
  const out = new Set();
  let m;
  while ((m = re.exec(s))) if (/\b(?:int|float)\s*\(/.test(m[2])) out.add(m[1]);
  return [...out];
}

// The argument text of every print( ... ) call, with strings already blanked to "".
// Allows one level of nested brackets, e.g. print((a + b) / 2) or print("x" + str(n)).
function printArgs(raw) {
  const s = normalise(raw);
  const re = /\bprint\s*\(((?:[^()]|\([^()]*\))*)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

// Non-blank code lines (comments removed, strings blanked), keeping their indentation.
function codeLines(raw) {
  return normalise(raw).split('\n').filter(l => l.trim());
}

const indentOf = (line) => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const word = (v) => new RegExp('\\b' + v + '\\b');
const COMPARISON = /==|!=|<=|>=|<|>/;

// Everything the program printed, split into "words" so a value can be matched exactly —
// "Total: 21" → ["Total", "21"]. A trailing full stop is dropped ("21." → "21").
function outTokens(output) {
  return (output || '').split(/[\s,:=()!?]+/).map(t => t.replace(/\.$/, '')).filter(Boolean);
}
function printedAny(output, values) {
  const t = outTokens(output);
  return values.some(v => t.includes(v));
}

function evalReqs(check, raw, output) {
  const results = check.reqs.map(r => !!r.test(raw, output));
  const pass = results.every(Boolean);
  const msg = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg };
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from the student's Investigate code: a and b cast to real numbers,
// print(a + b), plus the c = 5 / d = 5 demo from Predict.
//
// Each mod is a list of independent, individually-detected `reqs` — one per bullet in the
// task card (the bullet TEXT lives in the HTML). test(raw, output) gets the code and what
// it printed when run with MOD_INPUTS.
//
// Test numbers, in the order the program asks for them: a = 9, b = 5, third = 7, decimal = 2.5.
// They are chosen so no expected answer can be confused with a typed test number:
//   a + b = 14   a - b = 4   a + b + third = 21   average = 7.0   all four = 23.5
export const MOD_INPUTS = {
  mod1: ['9', '5', '7', '2.5'],
  mod2: ['9', '5', '7', '2.5'],
  mod3: ['9', '5', '7', '2.5'],
  mod4: ['9', '5', '7', '2.5'],
};
export const MOD_TEST_NOTE = 'test numbers 9, 5, 7 and 2.5';

export const MOD_CHECKS = {
  // Mod 1 — subtract. Either order is a valid "difference" (9 - 5 or 5 - 9).
  mod1: {
    reqs: [
      {
        hint: '❌ Add a print() that shows the difference between your two numbers — e.g. print(a - b). (Tested with 9 and 5, so it should print 4.)',
        test: (raw, out) => /-/.test(normalise(raw)) && printedAny(out, ['4', '-4', '4.0', '-4.0']),
      },
    ],
    passMsg: '✅ Nice — because both are cast with int(), - works like real subtraction.',
  },

  // Mod 2 — a third number, cast, then all three added together.
  mod2: {
    reqs: [
      {
        hint: '❌ Ask for a THIRD number with input() and cast it with int() — e.g. e = int(input("Enter third number: ")).',
        test: raw => inputCount(raw) >= 3 && castCount(raw) >= 3,
      },
      {
        hint: '❌ Add a print() that adds all three numbers together — e.g. print(a + b + e). (Tested with 9, 5 and 7, so it should print 21.)',
        test: (raw, out) => printedAny(out, ['21', '21.0']),
      },
    ],
    passMsg: '✅ Three numbers, all cast, one real total — that is the whole idea of casting!',
  },

  // Mod 3 — the average, using /.
  mod3: {
    reqs: [
      {
        hint: '❌ Use / to print the average of your three numbers — e.g. print((a + b + e) / 3). Don\'t forget the brackets: Python divides BEFORE it adds. (Tested with 9, 5 and 7, so it should print 7.0.)',
        test: (raw, out) => /\//.test(normalise(raw)) && printedAny(out, ['7.0']),
      },
    ],
    passMsg: '✅ Dividing the total by 3 gives the average — and / always gives a decimal answer, like 7.0.',
  },

  // Mod 4 — a NEW decimal number with float(), added into the total. Needs a 4th input()
  // so switching the third number from int() to float() doesn't count as a new number.
  mod4: {
    reqs: [
      {
        hint: '❌ Ask for a NEW decimal number using float() instead of int() — e.g. f = float(input("Enter a decimal number: ")). Don\'t just change your third number\'s cast — add a genuinely new question.',
        test: raw => inputCount(raw) >= 4 && floatCount(raw) >= 1,
      },
      {
        hint: '❌ Print the total of ALL four numbers added together, including your new decimal one. (Tested with 9, 5, 7 and 2.5, so it should print 23.5.)',
        test: (raw, out) => printedAny(out, ['23.5']),
      },
    ],
    passMsg: '✅ Excellent — Python happily adds an int and a float together, giving you a decimal answer.',
  },
};

// Runs every req for a given mod against the code and what it printed.
export function evalMod(checkKey, raw, output = '') {
  return evalReqs(MOD_CHECKS[checkKey], raw, output);
}

// ── Make ────────────────────────────────────────────────────────────────────
// A two-number calculator — run with the test numbers 8 and 2.

export const MAKE_INPUTS = ['8', '2'];

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Use input() twice — once for each number. Store each answer in its own variable.',
      test: raw => inputCount(raw) >= 2,
    },
    {
      hint: '❌ Cast BOTH numbers with int() so Python treats them as numbers, not text — e.g. num1 = int(input("First number: ")).',
      test: raw => castCount(raw) >= 2,
    },
    {
      hint: '❌ Print the SUM of your two numbers using + — e.g. print(num1 + num2). (Tested with 8 and 2, so it should print 10 — if you see 82, a number hasn\'t been cast.)',
      test: (raw, out) => /\+/.test(normalise(raw)) && printedAny(out, ['10', '10.0']),
    },
    {
      hint: '❌ Print at least one more calculation with your two numbers — try -, * or /.',
      test: (raw, out) => /[-*/]/.test(normalise(raw)) &&
        printedAny(out, ['6', '-6', '16', '4.0', '0.25', '6.0', '-6.0', '16.0', '4', '0', '64']),
    },
  ],
  passMsg: '✅ Both numbers cast and combined with real arithmetic — a proper calculator!',
};

export function evalMake(raw, output = '') {
  return evalReqs(MAKE_CHECK, raw, output);
}

// ── Extension challenges ─────────────────────────────────────────────────────
// Five challenges for fast finishers, all built up in the SAME editor (additive, like
// Modify). 1–2 stretch casting and arithmetic; 3–5 preview Lesson 5 (selection):
// comparisons give True/False → if → if/else. Shape-only checks: the student's own
// questions mean their numbers can't be predicted, so the code runs interactively.

export const EXT_CHECKS = {
  // 1 — design your own calculator.
  ext1: {
    reqs: [
      {
        hint: '❌ Ask for at least 3 numbers with input(), and cast each one with int() or float().',
        test: raw => inputCount(raw) >= 3 && castCount(raw) >= 3,
      },
      {
        hint: '❌ Use at least TWO different arithmetic operators from + - * / in your calculations.',
        test(raw) {
          const s = normalise(raw);
          return ['+', '-', '*', '/'].filter(op => s.includes(op)).length >= 2;
        },
      },
      {
        hint: '❌ Combine ALL THREE of your numbers in a single calculation — e.g. total = a + b + c.',
        test(raw) {
          const vars = numberVars(raw);
          return codeLines(raw).some(l =>
            /[-+*/]/.test(l) &&
            (vars.filter(v => word(v).test(l)).length >= 3 || (l.match(/\b(?:int|float)\s*\(/g) || []).length >= 3));
        },
      },
    ],
    passMsg: '✅ Brilliant — three real numbers, more than one operator, and one calculation that uses them all.',
  },

  // 2 — store a result in a variable, then print it inside a sentence with str().
  ext2: {
    reqs: [
      {
        hint: '❌ Store the answer to a calculation in its own variable — e.g. total = a + b + c.',
        test(raw) {
          return /^[ \t]*[A-Za-z_]\w*\s*=(?!=)[^\n]*[A-Za-z_\d)]\s*[-+*/]\s*[A-Za-z_\d(]/m.test(normalise(raw));
        },
      },
      {
        hint: '❌ Print that answer inside a sentence: join your own words to it with + and str() — e.g. print("Your total is " + str(total)).',
        test: raw => printArgs(raw).some(a => /\bstr\s*\(/.test(a) && /\+/.test(a) && /""|''/.test(a)),
      },
    ],
    passMsg: '✅ Your answer now reads like a proper sentence — str() turned the number back into text so + could join it.',
  },

  // 3 — comparisons: Python answers a yes/no question with True or False.
  ext3: {
    reqs: [
      {
        hint: '❌ Print a comparison that uses one of your numbers — e.g. print(total > 100). Python will answer True or False.',
        test: raw => printArgs(raw).some(a => COMPARISON.test(a) && /[A-Za-z_]/.test(a.replace(/\b(?:True|False)\b/g, ''))),
      },
      {
        hint: '❌ Print a second comparison that uses == ("is it equal to?") — e.g. print(a == b).',
        test: raw => printArgs(raw).some(a => /==/.test(a)),
      },
    ],
    passMsg: '✅ Spot on — a comparison is a question with a True/False answer. Next, you\'ll make your program ACT on that answer.',
  },

  // 4 — the first if: run a line only when the condition is True.
  ext4: {
    reqs: [
      {
        hint: '❌ Add an if line with a comparison, ending in a colon — e.g. if total > 100:',
        test: raw => codeLines(raw).some(l => /^\s*if\b.*:\s*$/.test(l) && COMPARISON.test(l)),
      },
      {
        hint: '❌ Indent a print() on the line straight after your if (press Tab), so it only runs when the answer is True.',
        test(raw) {
          const lines = codeLines(raw);
          return lines.some((l, i) => /^\s*if\b.*:\s*$/.test(l) && COMPARISON.test(l) &&
            lines[i + 1] && indentOf(lines[i + 1]) > indentOf(l) && /\bprint\s*\(/.test(lines[i + 1]));
        },
      },
    ],
    passMsg: '✅ Your program just made its first decision! The indented line only runs when the comparison is True.',
  },

  // 5 — if / else: exactly one of two paths always runs.
  ext5: {
    reqs: [
      {
        hint: '❌ Add else: underneath your if block — lined up exactly with the word if (no indent).',
        test(raw) {
          const lines = codeLines(raw);
          return lines.some((l, i) => /^\s*else\s*:\s*$/.test(l) &&
            lines.slice(0, i).some(p => /^\s*if\b.*:\s*$/.test(p) && indentOf(p) === indentOf(l)));
        },
      },
      {
        hint: '❌ Indent a print() on the line straight after else: — that message shows when the comparison is False.',
        test(raw) {
          const lines = codeLines(raw);
          return lines.some((l, i) => /^\s*else\s*:\s*$/.test(l) &&
            lines[i + 1] && indentOf(lines[i + 1]) > indentOf(l) && /\bprint\s*\(/.test(lines[i + 1]));
        },
      },
    ],
    passMsg: '🏆 Superb — if/else means your program ALWAYS picks one of two paths. That is exactly where next lesson starts!',
  },
};

export const EXT_STEP_COUNT = Object.keys(EXT_CHECKS).length;

export function evalExt(checkKey, raw) {
  return evalReqs(EXT_CHECKS[checkKey], raw);
}
