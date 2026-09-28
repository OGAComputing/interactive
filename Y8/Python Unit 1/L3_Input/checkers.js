// Validation logic for 1_Input_PRIMM.html — input(), storing answers in variables and
// joining text with +. Assumes variables/print/+ are already solid from Lesson 2; this
// lesson is 100% about input(). Checks are formative (they confirm the SHAPE of the
// construct), and every Modify/Make run is also executed in Pyodide so it must not error.
// Checks are written to be name-agnostic where possible: they key off variables that are
// assigned from input(), never a hardcoded variable name (see feedback_checker_flexibility
// memory — there is always more than one way to solve a short programming task).

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

// Distinct variable names that are assigned from input(), e.g. name = input(...).
function inputVars(raw) {
  const s = normalise(raw);
  const re = /\b([A-Za-z_]\w*)\s*=\s*input\s*\(/g;
  const out = new Set();
  let m;
  while ((m = re.exec(s))) out.add(m[1]);
  return [...out];
}

// input() variables beyond the starter's `name` — i.e. ones the student added themselves.
function newInputVars(raw) {
  return inputVars(raw).filter(v => v !== 'name');
}

// subject was only ever the worked example's variable NAME (mod1's e.g. line) — reject it
// if it's the ONLY new input variable a student has added, so everyone picks their own topic
// rather than copy-pasting the example and just changing the prompt text.
function onlyCopiedSubject(raw) {
  const vars = newInputVars(raw);
  return vars.length > 0 && vars.every(v => v.toLowerCase() === 'subject');
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
//
// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  // Mod 1 — one new question, printed on its own (no + required).
  mod1: {
    reqs: [
      {
        hint: '❌ Ask one new question with input() — pick your own topic and give the variable your own name.',
        test(raw) {
          const vars = newInputVars(raw);
          if (vars.length < 1) return false;
          return !onlyCopiedSubject(raw);
        },
      },
      {
        hint: '❌ Print the answer to your new question — print(subject) is enough, no + needed yet.',
        test(raw) {
          const vars = newInputVars(raw);
          return printArgs(raw).some(a => vars.some(v => word(v).test(a)));
        },
      },
    ],
    passMsg: '✅ Nice — a new question, asked and printed.',
  },

  // Mod 2 — a second new question, also printed.
  mod2: {
    reqs: [
      {
        hint: '❌ Ask a SECOND new question with input(), storing it in a new variable.',
        test: raw => newInputVars(raw).length >= 2,
      },
      {
        hint: '❌ Print your second new answer too — you need two new answers printed in total.',
        test(raw) {
          const vars = newInputVars(raw);
          const args = printArgs(raw);
          return vars.filter(v => args.some(a => word(v).test(a))).length >= 2;
        },
      },
    ],
    passMsg: '✅ Two new questions, both asked and printed!',
  },

  // Mod 3 — join an answer with extra text: a print using + at least twice.
  mod3: {
    reqs: [
      {
        hint: '❌ Use one of your answers inside a print().',
        test(raw) {
          const vars = inputVars(raw);
          return printArgs(raw).some(a => vars.some(v => word(v).test(a)));
        },
      },
      {
        hint: '❌ Use + at least twice inside ONE print() — join your answer to text on both sides, e.g. print("Your favourite subject is " + subject + "!").',
        test(raw) {
          const vars = inputVars(raw);
          return printArgs(raw).some(a => plusCount(a) >= 2 && vars.some(v => word(v).test(a)));
        },
      },
    ],
    passMsg: '✅ Nice — your print() now joins more than two pieces together with +.',
  },

  // Mod 4 — reuse: the SAME answer appears in two different print() lines.
  mod4: {
    reqs: [
      {
        hint: '❌ Use the SAME answer in TWO different print() lines — print it more than once in different places in your program.',
        test(raw) {
          const args = printArgs(raw);
          return inputVars(raw).some(v => args.filter(a => word(v).test(a)).length >= 2);
        },
      },
    ],
    passMsg: '✅ You used one answer in two places — a variable can be reused as many times as you like!',
  },

  // Mod 5 — combine: ONE print() that joins two different input variables with +.
  mod5: {
    reqs: [
      {
        hint: '❌ Use TWO different answers inside the SAME print().',
        test(raw) {
          const vars = inputVars(raw);
          return printArgs(raw).some(a => vars.filter(v => word(v).test(a)).length >= 2);
        },
      },
      {
        hint: '❌ Join those two answers together with + so they read as one sentence.',
        test(raw) {
          const vars = inputVars(raw);
          return printArgs(raw).some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
        },
      },
    ],
    passMsg: '✅ Brilliant — one sentence built from two different answers. That is the heart of programming with input!',
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

// There are deliberately NO mock inputs (no MOD_INPUTS): every question here is one the
// student wrote themselves, so canned answers like "Maths" make no sense against their
// prompts. Modify / Make / Extension checks all run the code interactively instead —
// the student types their own answers in the output panel (see runCode in the HTML).

// input() prompts that don't end in "?" (trailing spaces are ignored).
// Purely advisory — a prompt like "Enter your name: " is perfectly valid Python, so this
// never fails a check; the HTML appends it to the pass message as a gentle nudge that the
// left-hand side of the output panel is the QUESTION and the right-hand side is the answer.
// Only looks at literal-string prompts; comments are stripped first.
export function nonQuestionPrompts(raw) {
  const code = raw.replace(/#[^\n]*/g, '');
  const re = /\binput\s*\(\s*(?:"([^"\n]*)"|'([^'\n]*)')/g;
  const out = [];
  let m;
  while ((m = re.exec(code))) {
    const text = (m[1] ?? m[2]).trim();
    if (!text.endsWith('?')) out.push(text);
  }
  return out;
}

export const QUESTION_TIP =
  '💡 Tip: the text inside input() is the question your user sees on the left — end it with a ? so it reads as a question.';

// ── Make ────────────────────────────────────────────────────────────────────
// Interactive greeting — three questions, tested with Alex / Maths / blue.

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Use input() at least THREE times to ask three different questions — check your count.',
      test: raw => inputCount(raw) >= 3,
    },
    {
      hint: '❌ Use + in a print() to join an answer into a sentence — e.g. print("Hi " + name + "!").',
      test(raw) {
        const vars = inputVars(raw);
        return printArgs(raw).some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
      },
    },
    {
      // Matches the task card's bullet 3 exactly: all three answers printed. One print()
      // or several are both fine — the card never asks for a particular number of lines.
      hint: '❌ Print all three of your answers — each one needs to appear somewhere in a print().',
      test(raw) {
        const args = printArgs(raw);
        const vars = inputVars(raw);
        return vars.filter(v => args.some(a => word(v).test(a))).length >= 3;
      },
    },
  ],
  passMsg: '✅ Greeting printed — your program asks three questions and displays them all. Excellent work!',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Open-ended: the student picks their own genre (player card, mad-libs story, postcard,
// chatbot, …) — the checks only confirm the SHAPE, never the theme or the layout. Nothing
// here cares how many print() lines there are or whether output comes before, between or
// after the questions, so a one-line mad-libs story and an interleaved chatbot both pass.

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Ask at least FIVE questions with input(), each stored in its own variable — check you have five different variable names.',
      test: raw => inputVars(raw).length >= 5,
    },
    {
      hint: '❌ Use every answer — one of your variables is never printed. Show it in a print(), or delete that question.',
      test(raw) {
        const vars = inputVars(raw);
        const args = printArgs(raw);
        return vars.length > 0 && vars.every(v => args.some(a => word(v).test(a)));
      },
    },
    {
      // Strings are blanked to "" / '' by normalise(), so a leftover pair of quotes in the
      // print() argument means the student added some words of their own around the answers.
      hint: '❌ In at least one print(), use + to join two or more of your answers together with some words of your own — e.g. print(name + " has a pet called " + pet).',
      test(raw) {
        const vars = inputVars(raw);
        return printArgs(raw).some(a =>
          plusCount(a) >= 1 &&
          /""|''/.test(a) &&
          vars.filter(v => word(v).test(a)).length >= 2);
      },
    },
  ],
  passMsg: '✅ Brilliant — five questions, every answer used, and a sentence built from more than one of them. That is a real program with your own design!',
};

export function evalExt(raw) {
  const results = EXT_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? EXT_CHECK.passMsg : EXT_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML),
// ticked live and required before that step's "Check answer" will pass. Same shape as
// L4_Data_Types_Casting/checkers.js. test(raw, ctx) — ctx describes this step so far:
//   ctx.breaks    "😈 Break it" presses at this step
//   ctx.fixes     Break it → fixed → successful run cycles at this step
//   ctx.lastRun   { code, ok } — the last Run of the Investigate editor
// A hint may be a function (raw, ctx) so it can explain WHY a bullet is crossed.

// Lines compared ignoring spacing and quote style, so print( 'x' ) matches print("x").
const squashLine = l => l.replace(/\s+/g, '').replace(/'/g, '"');
const liveLines = raw => raw.split('\n').filter(l => l.trim() && !/^\s*#/.test(l));   // commented-out lines don't count
const hasLine = (raw, target) => liveLines(raw).some(l => squashLine(l) === squashLine(target));
// The code as it stands now has been run, without an error.
const ranAsIs = (raw, ctx) => !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();

// Runs every req for Investigate step n (1-based). A step with no code change has no
// INV_CHECKS entry and always passes. ctx fields default to "nothing done yet".
export function evalInv(n, raw, ctx = {}) {
  const c = { breaks: 0, fixes: 0, lastRun: null, ...ctx };
  const reqs = INV_CHECKS['inv' + n]?.reqs || [];
  const results = reqs.map(r => !!r.test(raw, c));
  const bad = results.findIndex(r => !r);
  const hint = bad === -1 ? null : reqs[bad].hint;
  return { results, pass: bad === -1, msg: typeof hint === 'function' ? hint(raw, c) : hint };
}

// Step 3's bug: Break it turns print(greeting + name) into print(greeting + fullname) — a
// variable that was never created (NameError). The fix changes fullname back to name (or,
// equally valid, renames the input() variable to fullname). Deleting the line is NOT a
// fix — it throws away the greeting — so the fix bullet needs the line to still be there.
export const IBUG_LINE       = 'print(greeting + fullname)';
export const IBUG_FIXED_LINE = 'print(greeting + name)';
export const hasBugLine    = raw => hasLine(raw, IBUG_LINE);
export const hasFixedLine  = raw => hasLine(raw, IBUG_FIXED_LINE);
export const isBugPairLine = line => hasLine(line, IBUG_LINE);   // the fixed line is the program's own last line — keep it
const fullnameMade = raw => /^[ \t]*fullname\s*=(?!=)/m.test(normalise(raw));
export const isBugFixed    = raw => hasBugLine(raw) ? fullnameMade(raw) : hasFixedLine(raw);

function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to break the last line.';
  if (hasBugLine(raw) && !fullnameMade(raw)) return 'Fix the broken line: change fullname back to name so it reads print(greeting + name).';
  if (!isBugFixed(raw)) return 'The last line has gone — don\'t delete it, fix it! Press 😈 Break it to bring it back, then change fullname to name.';
  return 'Now press ▶ Run code (and type your name) to check your fix works.';
}

export const INV_CHECKS = {
  inv1: {
    reqs: [{
      hint: 'Change the message inside input(...) on line 1 to something different — e.g. name = input("Enter your name: ").',
      test: raw => {
        const m = liveLines(raw).join('\n').match(/^[ \t]*name\s*=\s*input\s*\(\s*(["'])(.*?)\1/m);
        return !!m && m[2].trim() !== '' && m[2].trim().toLowerCase() !== 'what is your name?';
      },
    }],
  },
  // inv2 — no code change (run it again and leave the answer blank), so no ticks.
  inv3: {
    reqs: [
      { hint: 'Press 😈 Break it to break the last line.', test: (raw, ctx) => ctx.breaks >= 1 },
      { hint: fixHint, test: (raw, ctx) => ctx.breaks >= 1 && isBugFixed(raw) && ranAsIs(raw, ctx) },
    ],
  },
};
