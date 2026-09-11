// Validation logic for 1_Variables_PRIMM.html — variables, =, reassignment and joining text with +.
// No input() anywhere in this lesson. Checks are formative (they confirm the SHAPE of the
// construct), and every Modify/Make run is also executed in Pyodide so it must not error.
// Checks are written to accept ANY valid variable names/wording a student chooses — never
// gate on one exact phrasing (see feedback_checker_flexibility memory: there is always more
// than one way to solve a short programming task).

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (+, print, variable-looking words) can't trigger false positives.
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

// Distinct variable names assigned a string literal, e.g. pet = "Rex". Includes
// name/greeting (the two variables introduced in Predict/Investigate) as well as
// any new ones a student adds — callers filter those out where "new" matters.
function stringVarAssigns(raw) {
  const s = normalise(raw);
  const re = /\b([A-Za-z_]\w*)\s*=\s*["']/g;
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

function newVars(raw) {
  return [...new Set(stringVarAssigns(raw).filter(v => v !== 'name' && v !== 'greeting'))];
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
  // Mod 1 — one new variable, printed on its own (no + required).
  mod1(raw) {
    const vars = newVars(raw);
    const args = printArgs(raw);
    const ok = vars.length >= 1 && args.some(a => vars.some(v => word(v).test(a)));
    if (!ok)
      return { pass: false, msg: '❌ Add one new variable (e.g. pet = "Rex") and print it — print(pet) is enough, no + needed yet.' };
    return { pass: true, msg: '✅ Nice — a new variable, stored and printed.' };
  },

  // Mod 2 — a second new variable, also printed.
  mod2(raw) {
    const vars = newVars(raw);
    const args = printArgs(raw);
    const shown = vars.filter(v => args.some(a => word(v).test(a)));
    if (shown.length < 2)
      return { pass: false, msg: `❌ Add a SECOND new variable and print it too — you have ${shown.length} new variable(s) printed so far, you need 2.` };
    return { pass: true, msg: '✅ Two new variables, both stored and printed!' };
  },

  // Mod 3 — reassign ONE OF THE STUDENT'S OWN new variables (not name — that was
  // already reassigned in Investigate, so carried-over code would auto-pass a
  // name-based check here) a second time, with a second print of it after that.
  mod3(raw) {
    const s = normalise(raw);
    const args = printArgs(raw);
    const reassigned = newVars(raw).some(v => {
      const assigns = (s.match(new RegExp('\\b' + v + '\\s*=\\s*["\']', 'g')) || []).length;
      const shown = args.filter(a => word(v).test(a)).length;
      return assigns >= 2 && shown >= 2;
    });
    if (!reassigned)
      return { pass: false, msg: '❌ Pick one of your own new variables (not name), reassign it to a different value further down the program, then print it again — you should see two different values.' };
    return { pass: true, msg: '✅ Reassigning a variable overwrites its old value — nice work spotting that again with your own variable.' };
  },

  // Mod 4 — join a variable with extra text: a print using + at least twice.
  mod4(raw) {
    const vars = [...new Set(stringVarAssigns(raw))];
    const ok = printArgs(raw).some(a => plusCount(a) >= 2 && vars.some(v => word(v).test(a)));
    if (!ok)
      return { pass: false, msg: '❌ Write a print() that joins one of your variables with extra text using + at least twice — e.g. print("My pet is called " + pet + "!").' };
    return { pass: true, msg: '✅ Nice — your print() now joins more than two pieces together with +.' };
  },

  // Mod 5 — reuse: the SAME variable appears in two different print() lines.
  mod5(raw) {
    const args = printArgs(raw);
    const vars = [...new Set(stringVarAssigns(raw))];
    const reused = vars.some(v => args.filter(a => word(v).test(a)).length >= 2);
    if (!reused)
      return { pass: false, msg: '❌ Use the SAME variable in TWO different print() lines — print it more than once in different places in your program.' };
    return { pass: true, msg: '✅ You used one variable in two places — a variable can be reused as many times as you like!' };
  },
};

// No input() anywhere in this lesson — every Modify check runs with no mock inputs.
export const MOD_INPUTS = {};

// ── Make ────────────────────────────────────────────────────────────────────
// Profile card — built entirely from variables set directly in the code, no input().

export function validateMake(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const vars = [...new Set(stringVarAssigns(raw))];
  if (vars.length < 3)
    return { pass: false, msg: `❌ Set up at least THREE variables directly in the code — you have ${vars.length} so far.` };
  const args = printArgs(raw);
  if (args.length < 2)
    return { pass: false, msg: '❌ Print at least two lines — a profile card needs more than one line of output.' };
  const joinsBox = args.some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
  if (!joinsBox)
    return { pass: false, msg: '❌ Use + in a print() to join a variable into a sentence — e.g. print("Name: " + name).' };
  return { pass: true, msg: '✅ Profile card printed — three or more variables, joined and displayed. Excellent work!' };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Open-ended: any card idea with 5+ variables and structured, joined output.

export function validateExt(raw) {
  if (raw.trim().length < 15)
    return { pass: false, msg: '⚠️ Write your program above first, then click Check.' };
  const vars = [...new Set(stringVarAssigns(raw))];
  if (vars.length < 5)
    return { pass: false, msg: `❌ The extension needs at least 5 variables — you have ${vars.length} so far.` };
  const args = printArgs(raw);
  const joiningPrints = args.filter(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a))).length;
  if (joiningPrints < 2)
    return { pass: false, msg: `❌ Use + in at least two different print() lines — you have ${joiningPrints} so far.` };
  const combined = args.some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
  if (!combined)
    return { pass: false, msg: '❌ In at least one print(), join two or more of your variables together in the same sentence using +.' };
  return { pass: true, msg: '✅ Brilliant — five variables, structured output, and multiple variables joined together. A proper program!' };
}
