// Validation logic for 1_Casting_PRIMM.html — data types, casting with int()/float(), and arithmetic.
// Checks are formative (they confirm the SHAPE of the construct), and every Modify/Make
// run is also executed in Pyodide so it must not error. Checks are written to be
// name-agnostic where possible: they key off variables that are cast from input().

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

// Distinct variable names assigned from int(input(...)) or float(input(...)), e.g.
// a = int(input("...")). kind is 'int' or 'float'.
function castVars(raw, kind) {
  const s = normalise(raw);
  const re = new RegExp('\\b([A-Za-z_]\\w*)\\s*=\\s*' + kind + '\\s*\\(\\s*input\\s*\\(', 'g');
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

// The argument text of every print( ... ) call, with strings already blanked to "".
function printArgs(raw) {
  const s = normalise(raw);
  const re = /\bprint\s*\(([^)]*)\)/g;
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

const word = (v) => new RegExp('\\b' + v + '\\b');
const plusCount = (s) => (s.match(/\+/g) || []).length;

// ── Modify checks ─────────────────────────────────────────────────────────────
// By the end of Investigate, a and b are cast with int(input(...)) and print(a + b)
// correctly adds. c and d are untouched literal ints from the Predict/Run demo.
//
// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  // Mod 1 — subtract: a print() showing the difference a - b. One requirement.
  mod1: {
    reqs: [
      {
        hint: '❌ Add a third print() that shows the difference between your two numbers: print(a - b).',
        test(raw) {
          return printArgs(raw).some(a => /a\s*-\s*b/.test(a));
        },
      },
    ],
    passMsg: '✅ Nice — because both are cast with int(), - works like real subtraction, not text.',
  },

  // Mod 2 — a third number, cast directly on one line, added into the total.
  mod2: {
    reqs: [
      {
        hint: '❌ Ask for a THIRD number, casting it in one line — e.g. e = int(input("Enter third number: ")).',
        test(raw) {
          return castVars(raw, 'int').filter(v => v !== 'a' && v !== 'b').length > 0;
        },
      },
      {
        hint: '❌ Add a print() that adds all three numbers together — e.g. print(a + b + e).',
        test(raw) {
          const casted = castVars(raw, 'int').filter(v => v !== 'a' && v !== 'b');
          if (casted.length === 0) return false;
          const newVar = casted[0];
          const args = printArgs(raw);
          return args.some(arg => plusCount(arg) >= 2 && word('a').test(arg) && word('b').test(arg) && word(newVar).test(arg));
        },
      },
    ],
    passMsg: '✅ Three numbers, three int() casts, one real total — that is the whole idea of casting!',
  },

  // Mod 3 — the average of the three numbers, using /. One requirement.
  mod3: {
    reqs: [
      {
        hint: '❌ Use / to print the average of your three numbers — e.g. print((a + b + e) / 3).',
        test(raw) {
          const casted = castVars(raw, 'int').filter(v => v !== 'a' && v !== 'b');
          const thirdVar = casted[0];
          if (!thirdVar) return false;
          const args = printArgs(raw);
          return args.some(arg => /\//.test(arg) && word('a').test(arg) && word('b').test(arg) && word(thirdVar).test(arg));
        },
      },
    ],
    passMsg: '✅ Dividing the total by 3 gives the average — / works properly because every value is a real number.',
  },

  // Mod 4 — a decimal number with float(), combined into the running total.
  // NOTE: the float-cast variable must be a genuinely NEW name, distinct from
  // any variable still cast with int() — this stops a student "passing" by
  // simply rewriting their mod2 third-number variable from int() to float()
  // instead of adding a real fourth number (the same class of copy-the-worked-
  // example loophole fixed in L2_Variables/checkers.js, here applied to the
  // cast TYPE rather than a variable's NAME/value).
  mod4: {
    reqs: [
      {
        hint: '❌ Ask for a NEW decimal number using float(input(...)) instead of int() — e.g. f = float(input("Enter a decimal number: ")). Don\'t just change your third number\'s cast — add a genuinely new one.',
        test(raw) {
          const intVars = castVars(raw, 'int').filter(v => v !== 'a' && v !== 'b');
          const floatVars = castVars(raw, 'float').filter(v => v !== 'a' && v !== 'b' && !intVars.includes(v));
          return intVars.length > 0 && floatVars.length > 0;
        },
      },
      {
        hint: '❌ Print the total of ALL your numbers added together, including your new decimal number.',
        test(raw) {
          const intVars = castVars(raw, 'int').filter(v => v !== 'a' && v !== 'b');
          const floatVars = castVars(raw, 'float').filter(v => v !== 'a' && v !== 'b' && !intVars.includes(v));
          if (intVars.length === 0 || floatVars.length === 0) return false;
          const floatVar = floatVars[0];
          const args = printArgs(raw);
          return args.some(arg => plusCount(arg) >= 3 && word('a').test(arg) && word('b').test(arg) && word(floatVar).test(arg));
        },
      },
    ],
    passMsg: '✅ Excellent — Python happily adds an int and a float together, giving you a decimal answer.',
  },
};

// Runs every req for a given mod against `raw`, returning per-bullet results
// plus the overall pass/hint the check button needs.
export function evalMod(checkKey, raw) {
  const check = MOD_CHECKS[checkKey];
  const results = check.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// Mock inputs fed to runPython() for each Modify check (extra answers are harmless).
// Order matches the input() calls that exist by each step: a, b, then e (mod2), then f (mod4).
export const MOD_INPUTS = {
  mod1: ['6', '2', '4', '2.5'],
  mod2: ['6', '2', '4', '2.5'],
  mod3: ['6', '2', '4', '2.5'],
  mod4: ['6', '2', '4', '2.5'],
};

// ── Make ────────────────────────────────────────────────────────────────────
// A two-number calculator — tested with 8 and 2. Same {reqs, passMsg} + evalX()
// shape as MOD_CHECKS/evalMod above, one entry per success-criteria bullet.

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Use input() twice — once for each number. Store each answer in its own variable.',
      test: raw => inputCount(raw) >= 2,
    },
    {
      hint: '❌ Cast BOTH numbers with int() so Python treats them as numbers, not text — e.g. num1 = int(input("First number: ")).',
      test(raw) {
        return castVars(raw, 'int').concat(castVars(raw, 'float')).length >= 2;
      },
    },
    {
      hint: '❌ Print the SUM of your two numbers using + — e.g. print(num1 + num2).',
      test(raw) {
        const casted = castVars(raw, 'int').concat(castVars(raw, 'float'));
        if (casted.length < 2) return false;
        const [v1, v2] = casted;
        return printArgs(raw).some(a => plusCount(a) >= 1 && word(v1).test(a) && word(v2).test(a));
      },
    },
    {
      hint: '❌ Print at least one more calculation with your two numbers — try -, * or /.',
      test(raw) {
        const casted = castVars(raw, 'int').concat(castVars(raw, 'float'));
        if (casted.length < 2) return false;
        const [v1, v2] = casted;
        return printArgs(raw).some(a => /[-*/]/.test(a) && word(v1).test(a) && word(v2).test(a));
      },
    },
  ],
  passMsg: '✅ Both numbers cast with int() and combined with real arithmetic — a proper calculator!',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Open-ended: any real-world calculation with 3+ cast numbers and mixed operators.
// Same {reqs, passMsg} + evalX() shape, matching the 3 bullets in the task card.

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Ask for at least 3 numbers using input(), casting each with int() or float().',
      test(raw) {
        const n = inputCount(raw);
        const casted = castVars(raw, 'int').concat(castVars(raw, 'float'));
        return n >= 3 && casted.length >= 3;
      },
    },
    {
      hint: '❌ Use at least TWO different arithmetic operators (from + - * /) across your print() lines.',
      test(raw) {
        const args = printArgs(raw);
        const opsUsed = new Set();
        args.forEach(a => ['+', '-', '*', '/'].forEach(op => { if (a.includes(op)) opsUsed.add(op); }));
        return opsUsed.size >= 2;
      },
    },
    {
      hint: '❌ In at least one print(), combine ALL THREE of your numbers together in a single calculation.',
      test(raw) {
        const casted = castVars(raw, 'int').concat(castVars(raw, 'float'));
        const args = printArgs(raw);
        return args.some(a => casted.filter(v => word(v).test(a)).length >= 3);
      },
    },
  ],
  passMsg: '✅ Brilliant — three real numbers, multiple calculations, and one combined expression. A proper calculator program!',
};

export function evalExt(raw) {
  const results = EXT_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? EXT_CHECK.passMsg : EXT_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}
