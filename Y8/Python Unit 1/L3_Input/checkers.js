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

export const MOD_CHECKS = {
  // Mod 1 — one new question, printed on its own (no + required).
  mod1(raw) {
    const vars = newInputVars(raw);
    const args = printArgs(raw);
    const ok = vars.length >= 1 && args.some(a => vars.some(v => word(v).test(a)));
    if (!ok)
      return { pass: false, msg: '❌ Ask one new question with input() and print the answer — print(subject) is enough, no + needed yet.' };
    return { pass: true, msg: '✅ Nice — a new question, asked and printed.' };
  },

  // Mod 2 — a second new question, also printed.
  mod2(raw) {
    const vars = newInputVars(raw);
    const args = printArgs(raw);
    const shown = vars.filter(v => args.some(a => word(v).test(a)));
    if (shown.length < 2)
      return { pass: false, msg: `❌ Ask a SECOND new question and print it too — you have ${shown.length} new answer(s) printed so far, you need 2.` };
    return { pass: true, msg: '✅ Two new questions, both asked and printed!' };
  },

  // Mod 3 — join an answer with extra text: a print using + at least twice.
  mod3(raw) {
    const vars = inputVars(raw);
    const ok = printArgs(raw).some(a => plusCount(a) >= 2 && vars.some(v => word(v).test(a)));
    if (!ok)
      return { pass: false, msg: '❌ Write a print() that joins one of your answers with extra text using + at least twice — e.g. print("Your favourite subject is " + subject + "!").' };
    return { pass: true, msg: '✅ Nice — your print() now joins more than two pieces together with +.' };
  },

  // Mod 4 — reuse: the SAME answer appears in two different print() lines.
  mod4(raw) {
    const args = printArgs(raw);
    const reused = inputVars(raw).some(v => args.filter(a => word(v).test(a)).length >= 2);
    if (!reused)
      return { pass: false, msg: '❌ Use the SAME answer in TWO different print() lines — print it more than once in different places in your program.' };
    return { pass: true, msg: '✅ You used one answer in two places — a variable can be reused as many times as you like!' };
  },

  // Mod 5 — combine: ONE print() that joins two different input variables with +.
  mod5(raw) {
    const args = printArgs(raw);
    const vars = inputVars(raw);
    const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
    if (!combined)
      return { pass: false, msg: '❌ Write ONE print() that joins TWO of your different answers together in a single sentence using +.' };
    return { pass: true, msg: '✅ Brilliant — one sentence built from two different answers. That is the heart of programming with input!' };
  },
};

// Mock inputs fed to runPython() for each Modify check (extra answers are harmless).
export const MOD_INPUTS = {
  mod1: ['Alex', 'Maths', 'blue', '12'],
  mod2: ['Alex', 'Maths', 'blue', '12'],
  mod3: ['Alex', 'Maths', 'blue', '12'],
  mod4: ['Alex', 'Maths', 'blue', '12'],
  mod5: ['Alex', 'Maths', 'blue', '12'],
};

// ── Make ────────────────────────────────────────────────────────────────────
// Interactive greeting — three questions, tested with Alex / Maths / blue.

export function validateMake(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const n = inputCount(raw);
  if (n < 3)
    return { pass: false, msg: `❌ Use input() at least THREE times to ask three different questions — you have ${n} so far.` };
  const args = printArgs(raw);
  if (args.length < 2)
    return { pass: false, msg: '❌ Print at least two lines — an interactive greeting needs more than one line of output.' };
  const vars = inputVars(raw);
  const joinsBox = args.some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
  if (!joinsBox)
    return { pass: false, msg: '❌ Use + in a print() to join an answer into a sentence — e.g. print("Hi " + name + "!").' };
  const allThreeShown = vars.filter(v => args.some(a => word(v).test(a))).length >= 3;
  if (!allThreeShown)
    return { pass: false, msg: '❌ Make sure all three of your answers appear somewhere in a print().' };
  return { pass: true, msg: '✅ Greeting printed — your program asks three questions and displays them all. Excellent work!' };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Open-ended: any school-themed program with 4+ inputs and structured output.

export function validateExt(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program above first, then click Check.' };
  const n = inputCount(raw);
  if (n < 4)
    return { pass: false, msg: `❌ The extension needs at least 4 input() questions — you have ${n} so far.` };
  const args = printArgs(raw);
  const vars = inputVars(raw);
  const joiningPrints = args.filter(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a))).length;
  if (joiningPrints < 2)
    return { pass: false, msg: `❌ Use + in at least two different print() lines — you have ${joiningPrints} so far.` };
  const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
  if (!combined)
    return { pass: false, msg: '❌ In at least one print(), join two or more of your answers together in the same sentence using +.' };
  return { pass: true, msg: '✅ Brilliant — four questions, structured output, and multiple answers joined together. A proper program!' };
}
