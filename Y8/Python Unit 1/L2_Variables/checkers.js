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
// name/greeting (the two variables introduced in Predict/Run) as well as
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

// print() argument text (strings blanked), EXCLUDING the starter code's own
// print(greeting + name + ", welcome to Python!") line. That line already joins
// two variables with + twice, so it must be excluded or it would satisfy mod4's
// reqs on its own, before the student writes anything.
function studentPrintArgs(raw) {
  const rawArgs = [];
  const rawRe = /\bprint\s*\(([^)]*)\)/g;
  let m;
  while ((m = rawRe.exec(raw))) rawArgs.push(m[1]);
  return printArgs(raw).filter((_, i) => !/welcome to Python/.test(rawArgs[i] || ''));
}

// Comments stripped but string CONTENTS left intact — unlike normalise(), this
// keeps f-string interpolation and literal values visible, needed to check what
// was actually typed inside a string (an f-string's {var} names, or catching a
// student who copy-pasted the pet = "Rex" worked example verbatim).
const stripComments = (code) => code.replace(/#[^\n]*/g, '');

// {name, value} pairs for direct string assignments, e.g. pet = "Rex" →
// { name: 'pet', value: 'Rex' }. Only used to catch a copied worked example.
function stringLiteralAssignPairs(raw) {
  const s = stripComments(raw);
  const re = /\b([A-Za-z_]\w*)\s*=\s*["']([^"'\n]*)["']/g;
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push({ name: m[1], value: m[2] });
  return out;
}

// The full text of every f-string literal (prefix + quotes), comments stripped.
function fStringLiterals(raw) {
  return stripComments(raw).match(/f["'][^"'\n]*["']/gi) || [];
}

// Distinct variable names assigned from input(), e.g. pet = input(...).
function inputVars(raw) {
  const s = normalise(raw);
  const re = /\b([A-Za-z_]\w*)\s*=\s*input\s*\(/g;
  const out = new Set();
  let m;
  while ((m = re.exec(s))) out.add(m[1]);
  return [...out];
}

// ── Modify checks ─────────────────────────────────────────────────────────────
//
// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  // Mod 1 — one new variable, printed on its own (no + required).
  mod1: {
    reqs: [
      {
        hint: '❌ Add one new variable (e.g. pet = "Rex") — pick your own name and value.',
        test(raw) {
          const vars = newVars(raw);
          if (vars.length < 1) return false;
          // pet was only ever the worked example's variable NAME — reject it if
          // it's the ONLY new variable a student has added, so everyone picks their own.
          const newPairs = stringLiteralAssignPairs(raw).filter(p => p.name !== 'name' && p.name !== 'greeting');
          const onlyCopiedName = newPairs.length > 0 && newPairs.every(p => p.name.toLowerCase() === 'pet');
          return !onlyCopiedName;
        },
      },
      {
        hint: '❌ Now print that new variable on its own — print(pet) is enough, no + needed yet.',
        test(raw) {
          const vars = newVars(raw);
          return printArgs(raw).some(a => vars.some(v => word(v).test(a)));
        },
      },
    ],
    passMsg: '✅ Nice — a new variable, stored and printed.',
  },

  // Mod 2 — a second new variable, also printed.
  mod2: {
    reqs: [
      {
        hint: '❌ Add a SECOND new variable, storing something different from your first one.',
        test: raw => newVars(raw).length >= 2,
      },
      {
        hint: '❌ Print your second new variable too — you need two new variables printed in total.',
        test(raw) {
          const vars = newVars(raw);
          const args = printArgs(raw);
          return vars.filter(v => args.some(a => word(v).test(a))).length >= 2;
        },
      },
    ],
    passMsg: '✅ Two new variables, both stored and printed!',
  },

  // Mod 3 — reassign ONE OF THE STUDENT'S OWN new variables (not name/greeting —
  // this step is about practising reassignment on a variable they made themselves)
  // a second time, with a second print of it after that.
  mod3: {
    reqs: [
      {
        hint: '❌ Pick one of your own new variables (not name) and give it a new value further down the program.',
        test(raw) {
          const s = normalise(raw);
          return newVars(raw).some(v => (s.match(new RegExp('\\b' + v + '\\s*=\\s*["\']', 'g')) || []).length >= 2);
        },
      },
      {
        hint: '❌ Print your reassigned variable again — you should end up with two prints showing two different values.',
        test(raw) {
          const s = normalise(raw);
          const args = printArgs(raw);
          return newVars(raw).some(v => {
            const assigns = (s.match(new RegExp('\\b' + v + '\\s*=\\s*["\']', 'g')) || []).length;
            const shown = args.filter(a => word(v).test(a)).length;
            return assigns >= 2 && shown >= 2;
          });
        },
      },
    ],
    passMsg: '✅ Reassigning a variable overwrites its old value — nice work spotting that again with your own variable.',
  },

  // Mod 4 — join a variable with extra text: a print using + at least twice.
  mod4: {
    reqs: [
      {
        hint: '❌ Use one of your variables inside a print().',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return studentPrintArgs(raw).some(a => vars.some(v => word(v).test(a)));
        },
      },
      {
        hint: '❌ Join your variable with extra text using + at least twice — e.g. print("My pet is called " + pet + "!").',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return studentPrintArgs(raw).some(a => plusCount(a) >= 2 && vars.some(v => word(v).test(a)));
        },
      },
    ],
    passMsg: '✅ Nice — your print() now joins more than two pieces together with +.',
  },

  // Mod 5 — reuse: the SAME variable appears in two different print() lines.
  mod5: {
    reqs: [
      {
        hint: '❌ Use the SAME variable in TWO different print() lines — print it more than once in different places in your program.',
        test(raw) {
          const args = printArgs(raw);
          const vars = [...new Set(stringVarAssigns(raw))];
          return vars.some(v => args.filter(a => word(v).test(a)).length >= 2);
        },
      },
    ],
    passMsg: '✅ You used one variable in two places — a variable can be reused as many times as you like!',
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

// No input() anywhere in this lesson — every Modify check runs with no mock inputs.
export const MOD_INPUTS = {};

// ── Make ────────────────────────────────────────────────────────────────────
// Profile card — built entirely from variables set directly in the code, no input().
// One req per req-list bullet in #req_m2_make.

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Set up at least THREE variables directly in the code (e.g. name, favourite subject, house), each holding a different piece of information.',
      test(raw) { return [...new Set(stringVarAssigns(raw))].length >= 3; },
    },
    {
      hint: '❌ Use + in a print() to join a variable into a sentence — e.g. print("Name: " + name).',
      test(raw) {
        const vars = [...new Set(stringVarAssigns(raw))];
        return printArgs(raw).some(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a)));
      },
    },
    {
      hint: '❌ Print at least two lines — a profile card needs more than one line of output.',
      test(raw) { return printArgs(raw).length >= 2; },
    },
  ],
  passMsg: '✅ Profile card printed — three or more variables, joined and displayed. Excellent work!',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension steps ─────────────────────────────────────────────────────────
// Three small steps after Make, building on the same profile-card program:
// stitch several pieces into one line with +, do the same with an f-string,
// then the open-ended capstone. Still no input() — that stays behind the
// separate, unscored Bonus round below. Same reqs/evalExt() pattern as Modify.

export const EXT_CHECKS = {
  // Ext 1 — ONE print() joining 2+ variables with text, using + at least twice.
  ext1: {
    reqs: [
      {
        hint: '❌ Write ONE print() that joins at least TWO of your variables together with text, using + at least twice — e.g. print("Name: " + name + ", House: " + house).',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return printArgs(raw).some(a => plusCount(a) >= 2 && vars.filter(v => word(v).test(a)).length >= 2);
        },
      },
    ],
    passMsg: '✅ One tidy line, several pieces joined together — that is how real programs build their output.',
  },

  // Ext 2 — the same idea, written as an f-string instead of +.
  ext2: {
    reqs: [
      {
        hint: '❌ Use an f-string to join at least TWO variables into one line — e.g. print(f"Name: {name}, House: {house}").',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return fStringLiterals(raw).some(f => vars.filter(v => word(v).test(f)).length >= 2);
        },
      },
    ],
    passMsg: '✅ f-strings are a neater way to write exactly what you just did with + — lots of programmers prefer them.',
  },

  // Ext 3 — the open-ended capstone: any card idea, 5+ variables, structured
  // and joined output. Three independent reqs, one per bullet in #req_m2ext_3.
  ext3: {
    reqs: [
      {
        hint: '❌ Set up at least 5 variables directly in the code.',
        test(raw) { return [...new Set(stringVarAssigns(raw))].length >= 5; },
      },
      {
        hint: '❌ Use + in at least two different print() lines.',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return printArgs(raw).filter(a => plusCount(a) >= 1 && vars.some(v => word(v).test(a))).length >= 2;
        },
      },
      {
        hint: '❌ In at least one print(), join two or more of your variables together in the same sentence using +.',
        test(raw) {
          const vars = [...new Set(stringVarAssigns(raw))];
          return printArgs(raw).some(a => plusCount(a) >= 1 && vars.filter(v => word(v).test(a)).length >= 2);
        },
      },
    ],
    passMsg: '✅ Brilliant — five variables, structured output, and multiple variables joined together. A proper program!',
  },
};

// Runs every req for a given Extension step against `raw` — same shape as evalMod().
export function evalExt(checkKey, raw) {
  const check = EXT_CHECKS[checkKey];
  const results = check.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// No input() in the scored Extension steps — same as every other check in this lesson.
export const EXT_INPUTS = {};

// ── Bonus round (optional, unscored) ─────────────────────────────────────────
// A deliberately small, clearly-optional preview of input() for early finishers —
// see project memory: this lesson stays input()-free for everyone else, Lesson 3
// is where input() is properly taught. These two checks never feed into scoring.

export const BONUS_CHECKS = {
  // Bonus 1 — ONE question with input(), stored and printed on its own.
  bonus1(raw) {
    const vars = inputVars(raw);
    const args = printArgs(raw);
    const ok = vars.length >= 1 && args.some(a => vars.some(v => word(v).test(a)));
    if (!ok)
      return { pass: false, msg: '❌ Ask ONE question with input(), store the answer in a new variable, and print that variable — e.g. subject = input("Favourite subject? ") then print(subject).' };
    return { pass: true, msg: '✅ That is input() in a nutshell — it hands back whatever was typed, ready to store in a variable. You will do a whole lesson on this next!' };
  },

  // Bonus 2 — a second question, combined into a sentence with + or an f-string.
  bonus2(raw) {
    const vars = inputVars(raw);
    if (vars.length < 2)
      return { pass: false, msg: `❌ Ask a SECOND question with input() and store it in a new variable — you have ${vars.length} so far.` };
    const args = printArgs(raw);
    const joinedPlus = args.some(a => plusCount(a) >= 2 && vars.some(v => word(v).test(a)));
    const joinedF    = fStringLiterals(raw).some(f => vars.some(v => word(v).test(f)));
    if (!joinedPlus && !joinedF)
      return { pass: false, msg: '❌ Combine one of your answers into a sentence — either with + (e.g. print("You like " + subject + "!")) or an f-string (e.g. print(f"You like {subject}!")).' };
    return { pass: true, msg: '🌟 Two questions and a combined sentence — that is the heart of next lesson, and you have already done it!' };
  },
};

// Mock inputs fed to runPython() for each Bonus check (extra answers are harmless).
export const BONUS_INPUTS = {
  bonus1: ['Rex'],
  bonus2: ['Rex', 'Blue'],
};
