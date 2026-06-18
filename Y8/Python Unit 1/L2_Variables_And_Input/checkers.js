// Validation logic for 1_Variables_And_Input_PRIMM.html — Variables, =, input() and joining text with +.
// Checks are formative (they confirm the SHAPE of the construct), and every Modify/Make
// run is also executed in Pyodide so it must not error. Checks are written to be
// name-agnostic where possible: they key off variables that are assigned from input().

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
  // Mod 1 — join the name variable with extra text: a print using + at least twice, with name in it.
  mod1(raw) {
    const ok = printArgs(raw).some(a => /\bname\b/.test(a) && plusCount(a) >= 2);
    if (!ok)
      return { pass: false, msg: '❌ Update your greeting print() so it joins the name variable with extra text using + at least twice — e.g. print(greeting + name + "! Welcome.").' };
    return { pass: true, msg: '✅ Nice — your greeting now joins more than two pieces together with +.' };
  },

  // Mod 2 — a second question: two input() calls and at least two print() lines.
  mod2(raw) {
    const n = inputCount(raw);
    if (n < 2)
      return { pass: false, msg: `❌ Add a SECOND input() stored in a new variable — you have ${n} input() ${n === 1 ? 'line' : 'lines'} so far, you need 2.` };
    if (printArgs(raw).length < 2)
      return { pass: false, msg: '❌ Add a print() that shows your new variable, joined to some text with +.' };
    return { pass: true, msg: '✅ Two questions asked — your program now reads two things from the user!' };
  },

  // Mod 3 — reuse a variable: the SAME input variable appears in two different print() lines.
  mod3(raw) {
    const args = printArgs(raw);
    const reused = inputVars(raw).some(v => args.filter(a => word(v).test(a)).length >= 2);
    if (!reused)
      return { pass: false, msg: '❌ Use the SAME variable in TWO different print() lines — print it more than once in different places in your program.' };
    return { pass: true, msg: '✅ You used one variable in two places — a variable can be reused as many times as you like!' };
  },

  // Mod 4 — combine: ONE print() that joins two different input variables with +.
  mod4(raw) {
    const args = printArgs(raw);
    const vars = inputVars(raw);
    const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
    if (!combined)
      return { pass: false, msg: '❌ Write ONE print() that joins BOTH of your input variables together in a single sentence using +.' };
    return { pass: true, msg: '✅ Brilliant — one sentence built from two different variables. That is the heart of programming with variables!' };
  },
};

// Mock inputs fed to runPython() for each Modify check (extra answers are harmless).
export const MOD_INPUTS = {
  mod1: ['Alex', 'blue', '12'],
  mod2: ['Alex', 'blue', '12'],
  mod3: ['Alex', 'blue', '12'],
  mod4: ['Alex', 'blue', '12'],
};

// ── Make ────────────────────────────────────────────────────────────────────
// Canteen order printer — tested with food="pasta" and drink="juice".

export function validateMake(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const n = inputCount(raw);
  if (n < 2)
    return { pass: false, msg: `❌ Use input() twice — once for the food and once for the drink. You have ${n} so far.` };
  const args = printArgs(raw);
  if (args.length < 2)
    return { pass: false, msg: '❌ Print at least two lines — an order summary needs more than one line of output.' };
  const vars = inputVars(raw);
  const joinsBox = args.some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
  if (!joinsBox)
    return { pass: false, msg: '❌ Use + in a print() to join a variable into a sentence — e.g. print("Food: " + food).' };
  const bothShown = vars.filter(v => args.some(a => word(v).test(a))).length >= 2;
  if (!bothShown)
    return { pass: false, msg: '❌ Make sure both of your variables (food and drink) appear somewhere in a print().' };
  return { pass: true, msg: '✅ Order printed — your program asks for both items and displays them. Excellent work!' };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Open-ended: any school-themed program with 3+ inputs and structured output.

export function validateExt(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program above first, then click Check.' };
  const n = inputCount(raw);
  if (n < 3)
    return { pass: false, msg: `❌ The extension needs at least 3 input() questions — you have ${n} so far.` };
  const args = printArgs(raw);
  const vars = inputVars(raw);
  const joiningPrints = args.filter(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a))).length;
  if (joiningPrints < 2)
    return { pass: false, msg: `❌ Use + in at least two different print() lines — you have ${joiningPrints} so far.` };
  const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
  if (!combined)
    return { pass: false, msg: '❌ In at least one print(), join two or more of your answers together in the same sentence using +.' };
  return { pass: true, msg: '✅ Brilliant — three questions, structured output, and multiple variables joined together. A proper program!' };
}
