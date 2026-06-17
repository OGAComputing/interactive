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
  // Mod 1 — join the name box with extra text: a print using + at least twice, with name in it.
  mod1(raw) {
    const ok = printArgs(raw).some(a => /\bname\b/.test(a) && plusCount(a) >= 2);
    if (!ok)
      return { pass: false, msg: '❌ Update your greeting print() so it joins the name box with extra text using + at least twice — e.g. print(greeting + name + "! Welcome.").' };
    return { pass: true, msg: '✅ Nice — your greeting now joins more than two pieces together with +.' };
  },

  // Mod 2 — a second question: two input() calls and at least two print() lines.
  mod2(raw) {
    const n = inputCount(raw);
    if (n < 2)
      return { pass: false, msg: `❌ Add a SECOND input() stored in a new box — you have ${n} input() ${n === 1 ? 'line' : 'lines'} so far, you need 2.` };
    if (printArgs(raw).length < 2)
      return { pass: false, msg: '❌ Add a print() that shows your new box, joined to some text with +.' };
    return { pass: true, msg: '✅ Two questions asked — your program now reads two things from the user!' };
  },

  // Mod 3 — reuse a box: the SAME input box appears in two different print() lines.
  mod3(raw) {
    const args = printArgs(raw);
    const reused = inputVars(raw).some(v => args.filter(a => word(v).test(a)).length >= 2);
    if (!reused)
      return { pass: false, msg: '❌ Use the SAME box (e.g. name) in TWO different print() lines — for example greet them near the top and say goodbye by name at the end: print("Bye " + name + "!").' };
    return { pass: true, msg: '✅ You used one box in two places — a variable can be reused as many times as you like!' };
  },

  // Mod 4 — combine: ONE print() that joins two different input boxes with +.
  mod4(raw) {
    const args = printArgs(raw);
    const vars = inputVars(raw);
    const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
    if (!combined)
      return { pass: false, msg: '❌ Write ONE print() that joins BOTH of your input boxes together in a sentence using + — e.g. print(name + " likes " + colour).' };
    return { pass: true, msg: '✅ Brilliant — one sentence built from two different boxes. That is the heart of programming with variables!' };
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
// Tested with the answers Alex / 12.

export function validateMake(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const n = inputCount(raw);
  if (n < 2)
    return { pass: false, msg: `❌ Use input() at least twice — once for the name and once for a second question. You have ${n} so far.` };
  const args = printArgs(raw);
  if (!args.length)
    return { pass: false, msg: '❌ Your program needs at least one print() to greet the user.' };
  const vars = inputVars(raw);
  const joinsBox = args.some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
  if (!joinsBox)
    return { pass: false, msg: '❌ Use + in a print() to join some text onto one of your boxes — e.g. print("Hello " + name).' };
  const nameBox = vars.includes('name') ? 'name' : vars[0];
  const greetsByName = nameBox && args.some(a => word(nameBox).test(a));
  if (!greetsByName)
    return { pass: false, msg: "❌ Print a greeting that includes the user's name box." };
  return { pass: true, msg: '✅ Your personal greeter works — it asks questions and greets the user by name. Great job!' };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Tested with the answers Alex / 12 / blue.

export function validateExt(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  const n = inputCount(raw);
  if (n < 3)
    return { pass: false, msg: `❌ The extension needs a THIRD input() question — you have ${n} so far.` };
  const args = printArgs(raw);
  const vars = inputVars(raw);
  const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
  if (!combined)
    return { pass: false, msg: '❌ Build ONE sentence that joins two or more of your answers together with + in a single print().' };
  const nameBox = vars.includes('name') ? 'name' : vars[0];
  const nameUses = nameBox ? args.filter(a => word(nameBox).test(a)).length : 0;
  if (nameUses < 2)
    return { pass: false, msg: '❌ Use the name box at least twice in your output (e.g. greet at the start and sign off with their name at the end).' };
  return { pass: true, msg: '✅ Outstanding — three questions, a sentence built from several boxes, and the name reused. A proper interactive program!' };
}
