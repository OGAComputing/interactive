// Validation logic for 2_Life_Support_PRIMM.html — Y9 Python L1 round 2 "Life Support"
// (Station Zero, Chapter 1 part 2). Round 1 (1_Wake_Up_PRIMM.html) reactivated input() and +;
// this round adds casting: ask → store → convert → calculate → output, with int() and str().
//
// The life-support program students start from (STARTER_CODE in the HTML):
//   name = input("Enter your name: ")
//   hours = int(input("Hours until rescue: "))
//   oxygen = hours * 50
//   print("Engineer " + name + " is awake.")
//   print("Oxygen needed in litres:")
//   print(oxygen)
//
// Checks are formative and accept any valid solution SHAPE (see feedback_checker_flexibility
// memory). Modify and Make are run with fixed test answers (MOD_INPUTS / MAKE_INPUTS), so the
// arithmetic requirements are confirmed from the OUTPUT the program printed, not from one
// expected way of writing the code. Test numbers are chosen so an expected answer can never be
// confused with a typed one (the runner echoes each prompt + typed answer into the output).

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
const castCount  = raw => (normalise(raw).match(/\b(?:int|float)\s*\(/g) || []).length;
const word = v => new RegExp('\\b' + v + '\\b');
const liveLines = raw => raw.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');   // commented-out lines don't count

// Non-blank code lines (comments removed, strings blanked).
const codeLines = raw => normalise(raw).split('\n').filter(l => l.trim());

// Variables assigned from input(), with or without a cast: x = input(…), x = int(input(…)).
function inputVars(raw) {
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=\s*(?:(?:int|float)\s*\(\s*)?input\s*\(/gm;
  const out = [];
  let m;
  const s = normalise(raw);
  while ((m = re.exec(s))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

// Variables that hold a real number: assigned from anything containing int()/float(),
// or from arithmetic on another number variable (total = hours * crew * 60).
function numberVars(raw) {
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=(?!=)([^\n]*)$/gm;
  const out = new Set();
  const s = normalise(raw);
  let m;
  while ((m = re.exec(s))) {
    if (/\b(?:int|float)\s*\(/.test(m[2])) out.add(m[1]);
    else if (/[-+*/]/.test(m[2]) && [...out].some(v => word(v).test(m[2]))) out.add(m[1]);
  }
  return [...out];
}

// The argument text of every print( ... ) call, with strings already blanked to "".
// Allows one level of nested brackets, e.g. print("x" + str(n)).
function printArgs(raw) {
  const re = /\bprint\s*\(((?:[^()]|\([^()]*\))*)\)/g;
  const out = [];
  const s = normalise(raw);
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

// Everything the program printed, split into "words" so a value can be matched exactly —
// "Total oxygen: 1080 litres." → [..., "1080", "litres"]. A trailing full stop is dropped.
function outTokens(output) {
  return (output || '').split(/[\s,:=()!?]+/).map(t => t.replace(/\.$/, '')).filter(Boolean);
}
const printedAny = (output, values) => { const t = outTokens(output); return values.some(v => t.includes(v)); };
// A printed line that has words in it AND one of the values — i.e. the number is in a sentence.
const sentenceWith = (output, values) =>
  (output || '').split('\n').some(l => /[A-Za-z]{2,}/.test(l) && printedAny(l, values));

// A print() that joins its own text to a number with + and str().
const joinsWithStr = raw => printArgs(raw).some(a => /\bstr\s*\(/.test(a) && /\+/.test(a) && /""|''/.test(a));

function evalReqs(check, raw, output) {
  const results = check.reqs.map(r => !!r.test(raw, output));
  const pass = results.every(Boolean);
  const msg = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg };
}

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML),
// ticked/crossed live and required before that step's "Check answer" will pass.
// test(raw, ctx): ctx.breaks / ctx.fixes = Break it presses / break→fix→run cycles at this
// step; ctx.lastRun = { code, ok } of the last Investigate run.

// hours is a real number again: hours = int(input(…)), or hours = input(…) then int(hours).
const hoursCast = raw => {
  const s = normalise(raw);
  return /^[ \t]*hours\s*=\s*int\s*\(\s*input\s*\(/m.test(s) ||
    (/^[ \t]*hours\s*=\s*input\s*\(/m.test(s) && /\bint\s*\(\s*hours\s*\)/.test(s));
};
const hoursUncast = raw => {
  const s = normalise(raw);
  return /^[ \t]*hours\s*=\s*input\s*\(/m.test(s) && !/\bint\s*\(\s*hours\s*\)/.test(s);
};

// The standard bug-pair line, broken and fixed. Matched loosely (spacing, quote style,
// the space before the closing quote) so a correct fix typed as str( 50 ) still counts.
export const IBUG_LINE       = 'print("Oxygen per hour: " + 50)';
export const IBUG_FIXED_LINE = 'print("Oxygen per hour: " + str(50))';
const BUG_RE   = /print\s*\(\s*(["'])Oxygen per hour:\s*\1\s*\+\s*50\s*\)/i;
const FIXED_RE = /print\s*\(\s*(["'])Oxygen per hour:\s*\1\s*\+\s*str\s*\(\s*50\s*\)\s*\)/i;
export const hasBugLine    = raw => BUG_RE.test(liveLines(raw));
export const hasFixedLine  = raw => FIXED_RE.test(liveLines(raw));
export const isBugPairLine = line => BUG_RE.test(line) || FIXED_RE.test(line);
export const isBugFixed    = raw => hasFixedLine(raw) && !hasBugLine(raw);

// The student's version of the bug line — broken, fixed, or a working near-miss that
// dodges str(), e.g. print("Oxygen per hour: " + "50") or print("Oxygen per hour:", 50).
const isBugTargetLine = line => !/^\s*#/.test(line) && /\bprint\s*\(.*oxygen per hour/i.test(line);
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

// Why the "fix it" bullet is crossed — including the student who deletes the broken line
// instead of fixing it (the fix bullet only ticks while the FIXED line is present).
function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to add the broken line.';
  if (hasBugLine(raw)) return 'Fix the broken line: wrap the 50 in str() so it reads print("Oxygen per hour: " + str(50))';
  if (hasNearMiss(raw)) return 'Nearly! That line runs, but this step is practising str() — wrap the 50 in str() so it reads print("Oxygen per hour: " + str(50))';
  if (!hasFixedLine(raw)) return 'The broken line has gone — don\'t delete it, fix it! Press 😈 Break it to bring it back, then wrap the 50 in str()';
  return 'Now press ▶ Run code to check your fix works.';
}

export const INV_CHECKS = {
  // Step 1 — without int(), hours is text, so hours * 50 repeats the text 50 times.
  inv1: {
    reqs: [{
      hint: raw => hoursCast(raw)
        ? 'Line 2 still has int( in it — delete int( and the ) that closes it, so the line starts hours = input('
        : 'Line 2 should start hours = input( — keep the input( part, just take away the int( and its closing )',
      test: hoursUncast,
    }],
  },
  // Step 2 — int() back; print(hours + 1) shows + now adds (6 → 7), where text would join.
  inv2: {
    reqs: [
      {
        hint: 'Put int( back on line 2 so it starts hours = int(input( — and add the extra ) at the end of the line.',
        test: hoursCast,
      },
      {
        hint: 'At the bottom of the program, add the line print(hours + 1)',
        test: raw => /\bprint\s*\(\s*(?:hours\s*\+\s*1|1\s*\+\s*hours)\s*\)/.test(normalise(raw)),
      },
    ],
  },
  // Step 3 — the standard bug step: Break it, then fix it with str().
  inv3: {
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
// Modify starts from STARTER_CODE again. Test answers, in order: name Riley, 6 hours, 3 crew.
//   rate 60: 6 × 60 = 360      crew total: 6 × 3 × 60 = 1080  (900 if the rate went back to 50)
export const MOD_INPUTS = {
  mod1: ['Riley', '6', '3'],
  mod2: ['Riley', '6', '3'],
  mod3: ['Riley', '6', '3'],
  mod4: ['Riley', '6', '3'],
};
const CREW_TOTALS = ['1080', '1080.0', '900', '900.0'];

export const MOD_CHECKS = {
  // Mod 1 — trivial: change one number.
  mod1: {
    reqs: [{
      hint: '❌ Change 50 to 60 in the calculation on line 3 — with 6 hours it should print 360.',
      test: (raw, out) => printedAny(out, ['360', '360.0']),
    }],
    passMsg: '✅ Rate updated — 6 hours × 60 litres = 360.',
  },

  // Mod 2 — a new question, cast, printed on its own (no + needed yet).
  mod2: {
    reqs: [
      {
        hint: '❌ Add a new question after the hours question that asks how many crew are awake, wrapped in int() — e.g. crew = int(input("Crew awake: "))',
        test: raw => inputCount(raw) >= 3 && castCount(raw) >= 2,
      },
      {
        hint: '❌ Print the crew number — e.g. print(crew) on its own line.',
        // the new answer appears in a print(): at least two different input variables are printed
        test: raw => {
          const vars = inputVars(raw);
          const args = printArgs(raw).join(' ');
          return vars.filter(v => word(v).test(args)).length >= 2;
        },
      },
    ],
    passMsg: '✅ Crew counted — and cast with int(), ready for maths.',
  },

  // Mod 3 — a calculation that uses the new number.
  mod3: {
    reqs: [{
      hint: '❌ Work out the oxygen for the whole crew — hours × crew × 60 — and print it. Tested with 6 hours and 3 crew, it should print 1080. e.g. total = hours * crew * 60',
      test: (raw, out) => /\*/.test(normalise(raw)) && printedAny(out, CREW_TOTALS),
    }],
    passMsg: '✅ 6 hours × 3 crew × 60 litres = 1080 litres. Life support can plan for everyone.',
  },

  // Mod 4 — the number inside a sentence, joined with + and str().
  mod4: {
    reqs: [
      {
        hint: '❌ Join your own words to the number with + and str() — e.g. print("Total oxygen: " + str(total) + " litres")',
        test: raw => joinsWithStr(raw),
      },
      {
        hint: '❌ Your sentence needs to show the crew total (1080 when tested with 6 hours and 3 crew) — put str(total) in it, not hours or crew.',
        test: (raw, out) => sentenceWith(out, CREW_TOTALS),
      },
    ],
    passMsg: '✅ One clear sentence — str() turned the number into text so + could join it.',
  },
};

export function evalMod(checkKey, raw, output = '') {
  return evalReqs(MOD_CHECKS[checkKey], raw, output);
}

// ── Make — supply manifest ───────────────────────────────────────────────────
// The student's own questions, so only the SHAPE is checked. Run with these answers (all
// numbers, so any int() succeeds whatever order the questions come in).
export const MAKE_INPUTS = ['4', '5', '3', '2', '6', '1'];

// Lines the program printed itself — the runner echoes one "prompt + answer" line per input().
function ownOutputLines(raw, out) {
  const lines = (out || '').split('\n').filter(l => l.trim());
  return Math.max(0, lines.length - Math.min(inputCount(raw), MAKE_INPUTS.length));
}

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Use input() to ask two questions: how many you have of two different supplies — e.g. oxygen canisters, then ration packs.',
      test: raw => inputCount(raw) >= 2,
    },
    {
      hint: '❌ Turn both answers into whole numbers with int() — e.g. cans = int(input("Oxygen canisters: "))',
      test: raw => castCount(raw) >= 2,
    },
    {
      hint: '❌ Do at least one calculation with your numbers using *, /, - or + — e.g. hours = cans * 8',
      test(raw) {
        const nv = numberVars(raw);
        return codeLines(raw).some(l => {
          const usesNumber = nv.some(v => word(v).test(l)) || /\b(?:int|float)\s*\(/.test(l);
          // str(name) is just text being joined, so blank it — but keep str(a + b), which has maths inside
          const maths = /[*/-]/.test(l) || /[\w)]\s*\+\s*[\w(]/.test(l.replace(/\bstr\s*\(\s*\w+\s*\)/g, '""'));
          return usesNumber && maths;
        });
      },
    },
    {
      hint: '❌ Print a sentence that joins your words to a number with + and str() — e.g. print("Oxygen lasts " + str(hours) + " hours")',
      test: raw => joinsWithStr(raw),
    },
    {
      hint: '❌ Your manifest should print at least 3 lines of its own (not counting the questions) — e.g. a heading, how long the oxygen lasts, how long the food lasts.',
      test: (raw, out) => ownOutputLines(raw, out) >= 3,
    },
  ],
  passMsg: '✅ Manifest complete — questions, int(), a calculation and a clear printed report.',
};

export function evalMake(raw, output = '') {
  return evalReqs(MAKE_CHECK, raw, output);
}

// ── Extension — full manifest ────────────────────────────────────────────────
export const EXT_INPUTS = MAKE_INPUTS;

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Add a third supply with its own question, cast with int() — e.g. cells = int(input("Battery cells: "))',
      test: raw => inputCount(raw) >= 3 && castCount(raw) >= 3,
    },
    {
      hint: '❌ Print one line that joins at least TWO of your numbers into a sentence, using str() for each — e.g. print("Canisters: " + str(cans) + ", rations: " + str(rations))',
      test: raw => printArgs(raw).some(a => (a.match(/\bstr\s*\(/g) || []).length >= 2 && /""|''/.test(a)),
    },
  ],
  passMsg: '🌟 Full manifest — three supplies and a summary line. Outstanding!',
};

export function evalExt(raw, output = '') {
  return evalReqs(EXT_CHECK, raw, output);
}
