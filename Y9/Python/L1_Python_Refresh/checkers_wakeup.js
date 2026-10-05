// Validation logic for 1_Wake_Up_PRIMM.html — Y9 Python L1 round 1 "Wake Up"
// (Station Zero, Chapter 1). A confidence builder that reactivates Y8 input() and +:
// ask → store → join → output. No casting yet — that's round 2 (2_Life_Support_PRIMM.html).
//
// The door check-in program students start from (STARTER_CODE in the HTML):
//   name = input("Enter your name: ")
//   role = input("Enter your job: ")
//   print("CRYO BAY DOOR")
//   print("Checking in: " + role + " " + name)
//   print("Door unlocking...")
//
// Checks are formative and accept any valid solution SHAPE (see feedback_checker_flexibility
// memory). Modify and Make are run with fixed test answers, so "is the answer in the sentence"
// is confirmed from the OUTPUT. The runner echoes one "prompt + answer" line per input(), and
// each echo line holds only ONE answer — so a line holding several answers was printed by
// the student's own code.

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

const inputCount = raw => (normalise(raw).match(/\binput\s*\(/g) || []).length;
const word = v => new RegExp('\\b' + v + '\\b');
const liveLines = raw => raw.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');   // commented-out lines don't count

// Variables assigned from input(): x = input(…) (a cast is allowed but never needed here).
function inputVars(raw) {
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=\s*(?:(?:int|float|str)\s*\(\s*)?input\s*\(/gm;
  const out = [];
  let m;
  const s = normalise(raw);
  while ((m = re.exec(s))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

// The argument text of every print( ... ) call, with strings already blanked to "".
// Allows one level of nested brackets.
function printArgs(raw) {
  const re = /\bprint\s*\(((?:[^()]|\([^()]*\))*)\)/g;
  const out = [];
  const s = normalise(raw);
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

// A printed line that contains every one of the given answers.
const lineWithAll = (output, values) =>
  (output || '').split('\n').some(l => values.every(v => l.toLowerCase().includes(v.toLowerCase())));

// A print() that joins its own words ("…") to an input variable with +.
const joinsAnswer = raw => {
  const vars = inputVars(raw);
  return printArgs(raw).some(a => /\+/.test(a) && /""|''/.test(a) && vars.some(v => word(v).test(a)));
};

function evalReqs(check, raw, output) {
  const results = check.reqs.map(r => !!r.test(raw, output));
  const pass = results.every(Boolean);
  const msg = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg };
}

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML).
// test(raw, ctx): ctx.breaks / ctx.fixes = Break it presses / break→fix→run cycles at this
// step; ctx.lastRun = { code, ok } of the last Investigate run.

const ORIGINAL_PROMPT = 'Enter your job:';

// The question text inside a  role = input("…")  line, or null if there is no such line.
function rolePromptText(raw) {
  const m = liveLines(raw).match(/^[ \t]*role\s*=\s*input\s*\(\s*(["'])(.*?)\1\s*\)/m);
  return m ? m[2] : null;
}

// The standard bug-pair line, broken (capital N → NameError) and fixed. Matched loosely on
// spacing and quote style, but the variable's case is exactly what the step is about.
export const IBUG_LINE       = 'print("Access granted to " + Name)';
export const IBUG_FIXED_LINE = 'print("Access granted to " + name)';
const BUG_RE   = /print\s*\(\s*(["'])Access granted to\s*\1\s*\+\s*Name\s*\)/;
const FIXED_RE = /print\s*\(\s*(["'])Access granted to\s*\1\s*\+\s*name\s*\)/;
export const hasBugLine    = raw => BUG_RE.test(liveLines(raw));
export const hasFixedLine  = raw => FIXED_RE.test(liveLines(raw));
export const isBugPairLine = line => BUG_RE.test(line) || FIXED_RE.test(line);
export const isBugFixed    = raw => hasFixedLine(raw) && !hasBugLine(raw);

// The student's version of the bug line — broken, fixed, or a working near-miss
// (e.g. print("Access granted to " + role) or print("Access granted to", name)).
const isBugTargetLine = line => !/^\s*#/.test(line) && /\bprint\s*\(.*access granted/i.test(line);
const hasNearMiss = raw => !hasFixedLine(raw) && raw.split('\n').some(isBugTargetLine);

// "😈 Break it": turns the student's version of the line back into IBUG_LINE in place
// (appending it if there is none) and leaves an already-broken line alone — safe to mash.
export function breakCode(raw) {
  const body = raw.replace(/\s+$/, '');
  const lines = body ? body.split('\n') : [];
  let i = lines.findIndex(l => hasBugLine(l));
  if (i === -1) {
    i = lines.findIndex(isBugTargetLine);
    if (i === -1) i = lines.push('') - 1;
    lines[i] = lines[i].match(/^\s*/)[0] + IBUG_LINE;
  }
  return { code: lines.join('\n') + '\n', lineNo: i + 1 };
}

const fixedAndRun = (raw, ctx) =>
  isBugFixed(raw) && !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();

function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to add the broken line.';
  if (hasBugLine(raw)) return 'Fix the broken line: change Name to name (small n) so it matches the variable on line 1.';
  if (hasNearMiss(raw)) return 'Nearly! That line runs, but it should greet the user by name — make it print("Access granted to " + name)';
  if (!hasFixedLine(raw)) return 'The broken line has gone — don\'t delete it, fix it! Press 😈 Break it to bring it back, then change Name to name';
  return 'Now press ▶ Run code to check your fix works.';
}

export const INV_CHECKS = {
  // Step 1 — the question text is only shown, never stored.
  inv1: {
    reqs: [{
      hint: raw => rolePromptText(raw) === null
        ? 'Keep role = input( exactly as it was on line 2 — only change the words inside the quotes.'
        : 'Change the words inside the quotes on line 2 to a different question.',
      test: raw => { const p = rolePromptText(raw); return p !== null && p.trim() !== ORIGINAL_PROMPT && p.trim() !== ''; },
    }],
  },
  // Step 2 — the standard bug step: Break it, then fix the capital N.
  inv2: {
    reqs: [
      { hint: 'Press 😈 Break it to add the broken line.', test: (raw, ctx) => ctx.breaks >= 1 },
      { hint: fixHint, test: (raw, ctx) => ctx.breaks >= 1 && fixedAndRun(raw, ctx) },
    ],
  },
};

// Runs every req for Investigate step n (1-based). ctx fields default to "nothing done".
export function evalInv(n, raw, ctx = {}) {
  const c = { breaks: 0, fixes: 0, lastRun: null, ...ctx };
  const reqs = INV_CHECKS['inv' + n]?.reqs || [];
  const results = reqs.map(r => !!r.test(raw, c));
  const bad = results.findIndex(r => !r);
  const hint = bad === -1 ? null : reqs[bad].hint;
  return { results, pass: bad === -1, msg: typeof hint === 'function' ? hint(raw, c) : hint };
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from STARTER_CODE again. Test answers, in order: Riley, Engineer, pod 4.
export const MOD_INPUTS = {
  mod1: ['Riley', 'Engineer', '4'],
  mod2: ['Riley', 'Engineer', '4'],
  mod3: ['Riley', 'Engineer', '4', 'Dizzy'],
  mod4: ['Riley', 'Engineer', '4', 'Dizzy'],
};
const FEELING = 'Dizzy';   // typed into the "how are you feeling?" question

// A print() that joins its own words with + to one of the given variables.
const joinsOneOf = (raw, vars) =>
  printArgs(raw).some(a => /\+/.test(a) && /""|''/.test(a) && vars.some(v => word(v).test(a)));

// Input variables from the nth question on (n = 2 → the pod).
const joinsVarFrom = (raw, n) => joinsOneOf(raw, inputVars(raw).slice(n));

// Variables storing the answer to a question whose text mentions feeling (feel / feeling / feelings).
function feelingVars(raw) {
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=\s*input\s*\(\s*(["'])(.*?)\2\s*\)/gm;
  const out = [];
  const s = liveLines(raw);
  let m;
  while ((m = re.exec(s))) if (/feel/i.test(m[3]) && !out.includes(m[1])) out.push(m[1]);
  return out;
}

// The program printed the answer itself — its echo line ("Pod number: 4") is only ONE line holding it.
const printedAnswer = (out, answer) => (out || '').split('\n').filter(l => l.includes(answer)).length >= 2;

export const MOD_CHECKS = {
  // Mod 1 — trivial: change one message.
  mod1: {
    reqs: [{
      hint: '❌ Change the last line so it prints Cryo Bay door: OPEN',
      test: (raw, out) => /door[^\w\n]*open/i.test(out || ''),
    }],
    passMsg: '✅ Door message updated.',
  },

  // Mod 2 — a third question at the bottom, printed on its own new line underneath.
  // Everything is added BELOW the old code, so the pod variable always exists before it's used.
  mod2: {
    reqs: [
      {
        hint: '❌ At the bottom of your program, add a third question that asks for the pod number and stores it — e.g. pod = input("Pod number: ")',
        test: raw => inputCount(raw) >= 3 && inputVars(raw).length >= 3,
      },
      {
        hint: '❌ Underneath your pod question, print the pod joined to your own words with + — e.g. print("Pod: " + pod)',
        test: (raw, out) => joinsVarFrom(raw, 2) && printedAnswer(out, '4'),
      },
    ],
    passMsg: '✅ Pod number asked for and printed.',
  },

  // Mod 3 — a "how are you feeling?" question, printed underneath. The question is given,
  // but the task and hints deliberately give NO code to copy: students write both lines.
  mod3: {
    reqs: [
      {
        hint: '❌ At the bottom, add a question that asks how the user is feeling (use the word "feeling" in it), and store the answer in a new variable.',
        test: raw => feelingVars(raw).length >= 1,
      },
      {
        hint: '❌ Underneath your feeling question, print the answer joined to some words of your own with + (the check types Dizzy as the answer).',
        test: (raw, out) => joinsOneOf(raw, feelingVars(raw)) && printedAnswer(out, FEELING),
      },
    ],
    passMsg: '✅ Feeling question asked and printed — and you wrote it yourself.',
  },

  // Mod 4 — one line holding the name AND the feeling.
  // Echo lines hold only one answer each, so such a line was printed by the student's code.
  mod4: {
    reqs: [{
      hint: '❌ Make ONE printed line show the name and how they are feeling, joined with + — tested with Riley and Dizzy.',
      test: (raw, out) => lineWithAll(out, ['Riley', FEELING]),
    }],
    passMsg: '✅ Name and feeling joined into one line — check-in program complete.',
  },
};

export function evalMod(checkKey, raw, output = '') {
  return evalReqs(MOD_CHECKS[checkKey], raw, output);
}

// ── Make — crew locator ──────────────────────────────────────────────────────
// The student's own questions, so only the SHAPE is checked. Run with word answers.
export const MAKE_INPUTS = ['Ash', 'Navigation', 'Missing', 'Kai', 'Drone Bay', 'Awake'];

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Ask at least 2 questions with input() — e.g. the crew member\'s name, and the room they were last seen in.',
      test: raw => inputCount(raw) >= 2,
    },
    {
      hint: '❌ Store each answer in its own variable — e.g. name = input("Crew member: ") and room = input("Last seen in: ")',
      test: raw => inputVars(raw).length >= 2,
    },
    {
      hint: '❌ Print a sentence that joins your own words to one of the answers with + — e.g. print("Last seen in: " + room)',
      test: raw => joinsAnswer(raw),
    },
    {
      // Both answers printed by the program itself — on one line or on separate lines.
      hint: '❌ Your report should print BOTH answers — tested with Ash and Navigation.',
      test: (raw, out) => MAKE_INPUTS.slice(0, 2).every(a => printedAnswer(out, a)),
    },
  ],
  passMsg: '✅ Crew locator working — questions, variables and a clear printed report.',
};

export function evalMake(raw, output = '') {
  return evalReqs(MAKE_CHECK, raw, output);
}

// ── Extension — status report ────────────────────────────────────────────────
export const EXT_INPUTS = MAKE_INPUTS;

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Add a third question for the crew member\'s status, stored in its own variable — e.g. status = input("Status: ")',
      test: raw => inputCount(raw) >= 3 && inputVars(raw).length >= 3,
    },
    {
      hint: '❌ Print ONE line that uses all three answers — tested with Ash, Navigation and Missing, e.g. print(name + " is " + status + " in " + room)',
      test: (raw, out) => lineWithAll(out, EXT_INPUTS.slice(0, 3)),
    },
  ],
  passMsg: '🌟 Status report complete — three answers in one sentence. Outstanding!',
};

export function evalExt(raw, output = '') {
  return evalReqs(EXT_CHECK, raw, output);
}
