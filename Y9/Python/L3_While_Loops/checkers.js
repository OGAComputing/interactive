// Validation logic for 1_Locked_In_PRIMM.html — Y9 Python L3 "Locked In" (Station Zero,
// Chapter 3). One new concept: the while loop (condition-controlled iteration), plus != and,
// from Modification 2, str() to print the attempts counter.
//
// The airlock-keypad program students start from (STARTER_CODE in the HTML), used for Predict,
// Run and Investigate:
//   code = input("Enter airlock code: ")
//   while code != "4271":
//       print("ACCESS DENIED")
//       code = input("Enter airlock code: ")
//   print("Airlock open")
//
// Checks are BEHAVIOUR-BASED (see the MTP: "Behaviour-based checkers from L2 onwards"): Modify,
// Make and the extension run the student's program once per test in MOD_TESTS / MAKE_TESTS /
// EXT_TESTS and judge what it printed, so any correct shape passes. Every test is run with
// onInputsExhausted: 'error', so a loop that asks too many times stops with EOFError at once.
//
// Each check's tests come from a bank (MOD_TEST_BANK / MAKE_TEST_BANK / EXT_TEST_BANK). Each
// ⚡ Check picks one set (pickFrom in the HTML), so the "typed for you" codes change. In the
// Modify bank, CODE stands for the student's airlock code (Modification 1's choice): fillCode()
// swaps it in before the tests run.

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (input, print, while, numbers) can't trigger false positives.
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
const liveLines  = raw => raw.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');   // commented-out lines don't count
const indentOf   = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const leadOf     = line => line.match(/^[ \t]*/)[0];   // the exact whitespace — Python won't match a Tab with 4 spaces

// Where each answer's echo line is in the output. The runner echoes one "prompt + answer" line
// per input(); the first line at or after the last one found that ends in the answer is its echo.
function echoLines(output, inputs = []) {
  const lines = String(output || '').split('\n');
  const at = [];
  let from = 0;
  for (const v of inputs) {
    const i = lines.findIndex((l, k) => k >= from && !at.includes(k) && l.trimEnd().endsWith(String(v)));
    if (i === -1) continue;
    at.push(i);
    from = i + 1;
  }
  return { lines, at };
}

// What the program printed itself, with the echoed prompt lines dropped, so a prompt such as
// "Guess the code to unlock: " can never count as the program printing Unlocked.
export function ownOutput(output, inputs = []) {
  const { lines, at } = echoLines(output, inputs);
  return lines.filter((l, k) => !at.includes(k) && l.trim()).join('\n');
}

// How many of the answers the program asked for (and so used), in order.
export const askedCount = (output, inputs = []) => echoLines(output, inputs).at.length;

// The first line the program printed, for "it printed …" hints (or a note that it printed nothing).
function saidLine(text) {
  const l = String(text || '').split('\n').find(s => s.trim());
  return l ? `it printed "${l.trim().slice(0, 60)}"` : 'it printed nothing';
}

const lineCount = (text, re) => String(text || '').split('\n').filter(l => re.test(l)).length;
const DENIED = /access\s*denied/i;
const OPEN   = /airlock\s*open/i;
export const deniedCount = output => lineCount(output, DENIED);

// Run stage: which of the two runs this output counts as. 'first' = the right code straight
// away (no ACCESS DENIED); 'three' = at least three wrong codes before the right one.
export function runKind(output) {
  if (!OPEN.test(String(output || ''))) return null;
  const n = deniedCount(output);
  return n === 0 ? 'first' : n >= 3 ? 'three' : null;
}

// The codes typed into a run, read off the echoed prompt lines ("Enter airlock code: 1234").
export function typedCodes(output) {
  return String(output || '').split('\n')
    .map(l => l.match(/code[^:\n]*:\s*(\S+)\s*$/i)).filter(Boolean).map(m => m[1]);
}

// choice = the student's Station Zero choice; outs = what each test printed (echo lines removed);
// tests = the answers each test typed; asked = how many answers each test's run asked for.
// A hint or passMsg may be a function (choice, outs, raw, tests, asked). show = which test's run
// the HTML steps through: the failing requirement's, else the first.
function evalReqs(check, raw, outs, choice, tests, asked) {
  const results = check.reqs.map(r => !!r.test(raw, outs, choice, tests, asked));
  const pass = results.every(Boolean);
  const bad = check.reqs[results.findIndex(r => !r)];
  const msg = pass ? check.passMsg : bad.hint;
  const show = pass ? 0 : typeof bad.show === 'function' ? bad.show(outs, choice, tests, asked) : (bad.show || 0);
  return { results, pass, msg: typeof msg === 'function' ? msg(choice, outs, raw, tests, asked) : msg, show };
}

function evalTests(check, tests, raw, outputs, choice) {
  const outs  = tests.map((t, i) => ownOutput((outputs || [])[i], t));
  const asked = tests.map((t, i) => askedCount((outputs || [])[i], t));
  return evalReqs(check, raw, outs, choice, tests, asked);
}

// Index of the first test in `idx` whose output fails `ok`, else the first of `idx`.
const firstFail = (outs, idx, ok) => idx.find(i => !ok(outs[i] || '', i)) ?? idx[0];
const say = t => t.join(', then ');

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML),
// ticked/crossed live and required before that step's "Check answer" will pass.
// test(raw, ctx): ctx.breaks / ctx.fixes = Break it presses / break→fix→run cycles at this
// step; ctx.lastRun = { code, ok } of the last Investigate run.

const hasLine = (raw, re) => re.test(normalise(liveLines(raw)));
const LOOP_LINE = (kw, op) => new RegExp(`^[ \\t]*${kw}\\s+code\\s*${op}\\s*(?:""|'')\\s*:`, 'm');
const WHILE_NE = LOOP_LINE('while', '!=');
const WHILE_EQ = LOOP_LINE('while', '==');
const IF_NE    = LOOP_LINE('if', '!=');
const ANY_WHILE = /^[ \t]*while\b/m;

// print("Airlock open") — read from the raw code, since normalise() empties strings.
const OPEN_LINE = /^([ \t]*)print\s*\(\s*(["'])airlock open\2\s*\)/im;
const openIndent = raw => { const m = liveLines(raw).match(OPEN_LINE); return m ? m[1].length : null; };

// Step 2: where print("Airlock open") sits next to the loop body. open / body are raw lines
// (body = the first line inside the loop, print("ACCESS DENIED") in the starter); above = it
// has been moved above the while line. null if either line has gone.
function openGeometry(raw) {
  const lines = raw.split('\n').filter(l => l.trim() && !/^\s*#/.test(l));
  const openIdx = lines.findIndex(l => OPEN_LINE.test(l));
  const loopIdx = lines.findIndex(l => /^\s*(?:while|if)\b/.test(l));
  if (openIdx === -1 || loopIdx === -1 || loopIdx + 1 >= lines.length) return null;
  return { open: lines[openIdx], body: lines[loopIdx + 1], above: openIdx < loopIdx };
}

// The lines inside the first while loop (indented more than the while line, until the first
// line that isn't), and the lines after it. null if there is no while loop.
function loopParts(raw) {
  const lines = raw.split('\n');
  const w = lines.findIndex(l => !/^\s*#/.test(l) && /^\s*while\b/.test(l));
  if (w === -1) return null;
  const base = indentOf(lines[w]);
  const body = [];
  let k = w + 1;
  for (; k < lines.length; k++) {
    const l = lines[k];
    if (!l.trim() || /^\s*#/.test(l)) { body.push(''); continue; }
    if (indentOf(l) <= base) break;
    body.push(l);
  }
  return { w, body, after: lines.slice(k), lines };
}
// code = … input( … — the line that asks for the code again.
const ASK_RE = /^\s*code\s*=.*\binput\s*\(/;

// The standard bug step: Break it deletes the line inside the loop that asks for the code
// again, so code never changes and the loop never ends (the airlock cycles forever). The
// runner stops it after 4 s with InfiniteLoopError — the "emergency override". The fix is to
// put the line back INSIDE the loop; deleting anything else can't fix it.
export const IBUG_ASK_LINE = '    code = input("Enter airlock code: ")';
export const hasFixedLine = raw => { const p = loopParts(raw); return !!p && p.body.some(l => ASK_RE.test(l)); };
export const hasBugLine   = raw => !!loopParts(raw) && !hasFixedLine(raw);
export const isBugFixed   = raw => hasFixedLine(raw) && hasLine(raw, WHILE_NE);
// Nothing is planted as an extra line here (the bug is a deleted line), so there is never a
// demo line to strip when the step ends.
export const isBugPairLine = () => false;

// "😈 Break it": puts != back on the while line (step 3 changed it to ==, and with == a wrong
// first code skips the loop, so the bug wouldn't show), then deletes every line inside the loop
// that asks for the code again. Already broken → left alone, so it is safe to mash. lineNo =
// the line that was deleted (or would be), for the "line N" label. With no loop at all, the
// starter program goes back in, broken.
export function breakCode(raw) {
  const p = loopParts(raw.replace(/\s+$/, ''));
  if (!p) {
    return { code: ['code = input("Enter airlock code: ")', 'while code != "4271":', '    print("ACCESS DENIED")',
      'print("Airlock open")'].join('\n') + '\n', lineNo: 4 };
  }
  const lines = p.lines.slice();
  lines[p.w] = lines[p.w].replace(/^(\s*while\s+code\s*)==/, '$1!=');
  const askAt = p.body.findIndex(l => ASK_RE.test(l));
  const lineNo = askAt === -1 ? p.w + 3 : p.w + 2 + askAt;
  const kept = lines.filter((l, k) => !(k > p.w && k <= p.w + p.body.length && ASK_RE.test(l)));
  return { code: kept.join('\n') + '\n', lineNo };
}

const fixedAndRun = (raw, ctx) =>
  isBugFixed(raw) && !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();

function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to delete the line that asks again.';
  const p = loopParts(raw);
  if (!p) return 'The while loop has gone. Press 😈 Break it to bring the program back, then fix it.';
  if (!hasLine(raw, WHILE_NE)) return 'Line 2 should read while code != "4271":';
  if (p.after.some(l => ASK_RE.test(l)))
    return 'Nearly! That line is after the loop, so it never runs while the loop repeats. Indent it so it lines up with print("ACCESS DENIED")';
  if (!hasFixedLine(raw))
    return 'Inside the loop, under print("ACCESS DENIED"), add the line code = input("Enter airlock code: ") indented the same amount';
  return 'Now press ▶ Run code to check your fix works: type a wrong code, then 4271.';
}

export const INV_CHECKS = {
  // Step 1 — while becomes if: it asks again only once, then opens whatever was typed.
  inv1: {
    reqs: [
      {
        hint: 'On line 2, change while to if, so it reads if code != "4271":',
        test: raw => hasLine(raw, IF_NE) && !hasLine(raw, ANY_WHILE),
      },
    ],
  },
  // Step 2 — back to while, then indent print("Airlock open") into the loop, so it runs on
  // every pass (even after a wrong code). Indentation is where students get stuck, so the hints
  // name the exact problem, as in L2's step 2.
  inv2: {
    reqs: [
      { hint: 'On line 2, change if back to while, so it reads while code != "4271":', test: raw => hasLine(raw, WHILE_NE) },
      {
        hint: raw => {
          if (openIndent(raw) === null) return 'The Airlock open line has gone. Press ↺ Reset to original, then try again';
          const g = openGeometry(raw);
          if (!g || g.above) return 'Keep print("Airlock open") as the last line. Press ↺ Reset to original, then try again';
          const have = indentOf(g.open), want = indentOf(g.body);
          if (have === 0) return 'Click at the very start of line 5, just before print("Airlock open"), and press Tab once';
          if (have === want) return 'Line 5 mixes a Tab character with spaces, which Python can\'t match up. Delete the gap at the start of the line and press Tab once';
          if (have < want) return `Line 5 has ${have} space${have === 1 ? '' : 's'} in front; line 4 has ${want}. They must match exactly: click at the start of line 5 and add ${want - have} more`;
          return `Line 5 has ${have} spaces in front; line 4 has ${want}. Too many: click at the start of line 5 and press Shift+Tab to take 4 away`;
        },
        test: raw => { const g = openGeometry(raw); return !!g && !g.above && indentOf(g.open) > 0 && leadOf(g.open) === leadOf(g.body); },
        wrong: raw => { const g = openGeometry(raw); return !!g && !g.above && indentOf(g.open) > 0 && leadOf(g.open) !== leadOf(g.body); },
      },
    ],
  },
  // Step 3 — Airlock open back to the left edge, then != → ==: now the loop repeats while the
  // code IS 4271, and a wrong code lets you straight through.
  inv3: {
    reqs: [
      { hint: 'Move line 5 back to the left edge, with no spaces in front of print("Airlock open")', test: raw => openIndent(raw) === 0 },
      {
        hint: raw => hasLine(raw, WHILE_NE)
          ? 'On line 2, change != to == so it reads while code == "4271":'
          : 'Line 2 should read while code == "4271":',
        test: raw => hasLine(raw, WHILE_EQ),
      },
    ],
  },
  // Step 4 — the standard bug step: Break it (an infinite loop), then fix it.
  inv4: {
    reqs: [
      { hint: 'Press 😈 Break it to delete the line that asks again.', test: (raw, ctx) => ctx.breaks >= 1 },
      { hint: fixHint, test: (raw, ctx) => ctx.breaks >= 1 && fixedAndRun(raw, ctx) },
    ],
  },
};

// Runs every req for Investigate step n (1-based). ctx fields default to "nothing done".
// A req may also have wrong(raw, ctx): true when the student has made a definite MISTAKE on
// that bullet (not just "not done yet"). The page shows those as live red crosses, and
// wrongMsg is the first such bullet's hint, so the live coach names the mistake first.
export function evalInv(n, raw, ctx = {}) {
  const c = { breaks: 0, fixes: 0, lastRun: null, ...ctx };
  const reqs = INV_CHECKS['inv' + n]?.reqs || [];
  const results = reqs.map(r => !!r.test(raw, c));
  const wrongs = reqs.map((r, i) => !results[i] && !!r.wrong?.(raw, c));
  const resolve = i => { const h = i === -1 ? null : reqs[i].hint; return typeof h === 'function' ? h(raw, c) : h; };
  const bad = results.findIndex(r => !r);
  return { results, wrongs, pass: bad === -1, msg: resolve(bad), wrongMsg: resolve(wrongs.findIndex(Boolean)) };
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from STARTER_CODE again. Every check runs the program once per test below.

// Modification 1 is a Station Zero choice: whose code opens the airlock. The student picks
// first; the requirement then wants THAT code on the while line.
export const AIRLOCK_CODES = { warden: '9013', override: '0000' };

// The code the student's loop waits for: the text in the first `while … != "…"` line. Later
// modifications test with it, so a student who skipped Modification 1 isn't stuck.
export function codeIn(raw) {
  const m = liveLines(raw).match(/^[ \t]*while\s+\w+\s*!=\s*(["'])([^"'\n]*)\1/m);
  return m ? m[2] : null;
}

// Swap CODE in a test set for the airlock code.
export const fillCode = (set, code) => set.map(t => t.map(v => (v === 'CODE' ? code : v)));

// Each entry is a list of test sets; a set is one run per test, in the order the checks expect.
//   mod1: the new code straight away; then 4271 (no longer right), a wrong code, the new code
//   mod2: wrong codes then the code (2–4 of them); the code straight away
//   mod3: three wrong codes then the code; the code straight away
//   mod4: the code, two low pressures, then 100 or more; the code, 99, 100; the code, 100
export const MOD_TEST_BANK = {
  mod1: ['1234', '5555', '8080', '2468', '1111', '7777', '3141'].map(w => [['CODE'], ['4271', w, 'CODE']]),
  mod2: [
    [['1234', '5555', 'CODE'], ['CODE']], [['2468', '1357', '8080', 'CODE'], ['CODE']],
    [['4321', '9999', 'CODE'], ['CODE']], [['1111', '2222', '3333', '4444', 'CODE'], ['CODE']],
    [['0101', '7070', 'CODE'], ['CODE']], [['3141', '2718', '1618', 'CODE'], ['CODE']],
  ],
  mod3: [
    ['1234', '5555', '8080'], ['2468', '1357', '4321'], ['1111', '2222', '3333'],
    ['0101', '7070', '9090'], ['3141', '2718', '1618'], ['6060', '4040', '2020'],
  ].map(ws => [[...ws, 'CODE'], ['CODE']]),
  mod4: [['40', '85', '100'], ['12', '60', '130'], ['0', '98', '250'], ['55', '70', '101'], ['20', '90', '180'], ['33', '66', '111']]
    .map(([a, b, ok]) => [['CODE', a, b, ok], ['CODE', '99', '100'], ['CODE', '100']]),
};
export const MOD_TESTS = Object.fromEntries(Object.entries(MOD_TEST_BANK).map(([k, bank]) => [k, bank[0]]));

// "Tries: 3" — a line about tries/attempts/guesses that names the right number.
const COUNT_WORD = /tr(?:y|ies)|attempt|guess/i;
const countLine = (text, n) => String(text || '').split('\n').some(l => COUNT_WORD.test(l) && new RegExp(`(^|\\D)${n}(\\D|$)`).test(l));
const triesSaid = text => String(text || '').split('\n').find(l => COUNT_WORD.test(l));
// The k-th ACCESS DENIED line names k (its try number).
const deniedNumbered = text => {
  const ls = String(text || '').split('\n').filter(l => DENIED.test(l));
  return ls.length > 0 && ls.every((l, k) => new RegExp(`(^|\\D)${k + 1}(\\D|$)`).test(l));
};
const TOO_LOW = /too\s*low/i;
const PRESSURE_OK = /pressure\s*ok/i;

export const MOD_CHECKS = {
  // Mod 1 — trivial: change the code on the while line to the chosen one.
  mod1: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => AIRLOCK_CODES[c]
          ? `❌ With ${tests[0][0]} typed, the airlock should open straight away, but ${saidLine(outs[0])}. On line 2, change "4271" to "${AIRLOCK_CODES[c]}" (keep the quotes).`
          : '❌ Make your choice above first.',
        test: (raw, outs) => OPEN.test(outs[0]) && !DENIED.test(outs[0]),
      },
      {
        hint: (c, outs, raw, tests) => `❌ With ${say(tests[1])} typed, the old code 4271 and ${tests[1][1]} should both be denied before ${tests[1][2]} opens the airlock, but ${deniedCount(outs[1])} ACCESS DENIED line${deniedCount(outs[1]) === 1 ? ' was' : 's were'} printed.`,
        test: (raw, outs) => deniedCount(outs[1]) === 2 && OPEN.test(outs[1]),
        show: 1,
      },
    ],
    passMsg: c => c === 'override'
      ? '✅ Override set: only 0000 opens the airlock now, and WARDEN’s code is gone.'
      : '✅ WARDEN’s code set: only 9013 opens the airlock now.',
  },

  // Mod 2 — the attempts counter, printed with str() (its code is given).
  mod2: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => {
          const n = tests[0].length, said = triesSaid(outs[0]);
          return said
            ? `❌ With ${say(tests[0])} typed, that's ${n} tries, but your program printed "${said.trim()}". Check attempts starts at 1, and goes up by 1 inside the loop, after the new input().`
            : `❌ With ${say(tests[0])} typed, the program should end by printing Tries: ${n}. Add the last line: print("Tries: " + str(attempts))`;
        },
        test: (raw, outs, c, tests) => countLine(outs[0], tests[0].length),
      },
      {
        hint: (c, outs, raw, tests) => `❌ With the right code (${tests[1][0]}) typed first time, that's 1 try, so it should print Tries: 1, but ${triesSaid(outs[1]) ? `it printed "${triesSaid(outs[1]).trim()}"` : 'nothing about tries was printed'}. Does attempts start at 1, above the loop?`,
        test: (raw, outs) => countLine(outs[1], 1),
        show: 1,
      },
      {
        hint: '❌ Keep print("Airlock open") at the end, after the loop.',
        test: (raw, outs) => outs.every(o => OPEN.test(o)),
      },
    ],
    passMsg: '✅ Counted: attempts goes up once each time the loop asks again, and str() turns it into text so + can join it.',
  },

  // Mod 3 — no code given: each ACCESS DENIED line says which try it was.
  mod3: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => {
          const ls = outs[0].split('\n').filter(l => DENIED.test(l));
          if (!ls.length) return `❌ With ${say(tests[0])} typed, ACCESS DENIED should print 3 times, but it didn't print at all.`;
          return `❌ With ${say(tests[0])} typed, the ACCESS DENIED lines should say try 1, try 2 and try 3, but they said: ${ls.map(l => '"' + l.trim().slice(0, 40) + '"').join(', ')}. Join str(attempts) onto the message inside the loop.`;
        },
        test: (raw, outs) => deniedCount(outs[0]) === 3 && deniedNumbered(outs[0]),
      },
      {
        hint: (c, outs, raw, tests) => `❌ The last line must still print the total: with ${say(tests[0])} typed, Tries: ${tests[0].length}.`,
        test: (raw, outs, c, tests) => countLine(outs[0].split('\n').filter(l => !DENIED.test(l)).join('\n'), tests[0].length),
      },
      {
        hint: (c, outs, raw, tests) => `❌ With the right code (${tests[1][0]}) typed first time, nothing should be denied, but ${saidLine(outs[1])}.`,
        test: (raw, outs) => deniedCount(outs[1]) === 0 && OPEN.test(outs[1]),
        show: 1,
      },
    ],
    passMsg: '✅ Every ACCESS DENIED line now says which try it was.',
  },

  // Mod 4 — a numeric validation loop at the bottom (no code given).
  mod4: {
    reqs: [
      {
        hint: '❌ At the bottom, ask for the pressure with input(), and turn the answer into a whole number with int()',
        test: raw => inputCount(raw) >= 3 && castCount(raw) >= 1,
      },
      {
        hint: (c, outs, raw, tests, asked) => {
          const i = firstFail(outs, [0, 1], (o, k) => lineCount(o, TOO_LOW) === 2 - k && asked[k] === tests[k].length);
          const t = tests[i], want = i === 0 ? 2 : 1;
          if (asked[i] < t.length) return `❌ With ${say(t)} typed, the program stopped asking before ${t[t.length - 1]} was typed. A pressure under 100 must print Too low and ask again.`;
          return `❌ With ${say(t)} typed, Too low should print ${want === 1 ? 'once' : 'twice'} (for each pressure under 100), but it printed ${lineCount(outs[i], TOO_LOW)} time${lineCount(outs[i], TOO_LOW) === 1 ? '' : 's'}.`;
        },
        test: (raw, outs, c, tests, asked) => lineCount(outs[0], TOO_LOW) === 2 && lineCount(outs[1], TOO_LOW) === 1
          && asked[0] === tests[0].length && asked[1] === tests[1].length,
        show: (outs, c, tests, asked) => firstFail(outs, [0, 1], (o, k) => lineCount(o, TOO_LOW) === 2 - k && asked[k] === tests[k].length),
      },
      {
        hint: (c, outs, raw, tests) => {
          const i = firstFail(outs, [2, 0, 1], o => PRESSURE_OK.test(o));
          return PRESSURE_OK.test(outs[i])
            ? `❌ With ${say(tests[2])} typed, 100 is enough, so it should print Pressure OK and no Too low, but ${saidLine(outs[2].split('\n').slice(-2).join('\n'))}.`
            : `❌ With ${say(tests[i])} typed, the program should end with Pressure OK.`;
        },
        test: (raw, outs) => outs.every(o => PRESSURE_OK.test(o)) && lineCount(outs[2], TOO_LOW) === 0,
        show: outs => firstFail(outs, [2, 0, 1], (o, k) => PRESSURE_OK.test(o) && (k !== 2 || lineCount(o, TOO_LOW) === 0)),
      },
    ],
    passMsg: '✅ Pressure checked: the loop keeps asking while it’s under 100, so 99 is too low and 100 is enough.',
  },
};

// tests = the set from MOD_TEST_BANK[checkKey] the check ran, with CODE filled in;
// outputs = what each of its tests printed, in order.
export function evalMod(checkKey, raw, outputs = [], choice, tests) {
  const t = tests || fillCode(MOD_TESTS[checkKey], AIRLOCK_CODES[choice] || codeIn(raw) || '4271');
  return evalTests(MOD_CHECKS[checkKey], t, raw, outputs, choice);
}

// ── Make — crack the backup lock (a guessing game) ───────────────────────────
// The lock opens on 62. The program keeps asking until 62 is typed, then says Unlocked and how
// many guesses it took. The wrong guesses change from set to set; so does how many there are.
export const LOCK_NUMBER = '62';
export const MAKE_TEST_BANK = [
  [['15', '80', '62'], ['62'], ['50', '70', '61', '63', '62']],
  [['99', '1', '62'], ['62'], ['10', '20', '30', '40', '62']],
  [['40', '75', '62'], ['62'], ['63', '61', '5', '95', '62']],
  [['70', '30', '62'], ['62'], ['12', '88', '60', '64', '62']],
  [['26', '91', '62'], ['62'], ['33', '77', '44', '66', '62']],
  [['55', '65', '62'], ['62'], ['2', '98', '50', '72', '62']],
];
export const MAKE_TESTS = MAKE_TEST_BANK[0];

// Make is the second Station Zero choice: who holds the airlock seals. The student picks first,
// and the last req wants the line for THAT choice, printed on every run (at the end).
export const SEALS_CHOICES = { warden: 'SEALS: WARDEN', override: 'SEALS: OVERRIDE' };
const SEALS_RE = { warden: /seals[^\w\n]*warden/i, override: /seals[^\w\n]*override/i };
const UNLOCK = /unlock/i;

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Ask for a guess with input(), and turn the answer into a whole number with int()',
      test: raw => inputCount(raw) >= 1 && castCount(raw) >= 1,
    },
    {
      hint: '❌ Use a while loop to keep asking.',
      test: raw => ANY_WHILE.test(normalise(raw)),
    },
    {
      hint: (c, outs, raw, tests, asked) => {
        const i = firstFail(outs, [0, 2], (o, k) => asked[k] === tests[k].length && lineCount(o, UNLOCK) <= 1);
        if (asked[i] < tests[i].length)
          return `❌ With ${say(tests[i])} typed, your program stopped asking after ${asked[i]} guess${asked[i] === 1 ? '' : 'es'}. A wrong guess must ask again, until 62 is typed.`;
        return `❌ With ${say(tests[i])} typed, your program said Unlocked more than once. Only 62 unlocks it, so Unlocked goes after the loop.`;
      },
      test: (raw, outs, c, tests, asked) => [0, 2].every(k => asked[k] === tests[k].length && lineCount(outs[k], UNLOCK) <= 1),
      show: (outs, c, tests, asked) => firstFail(outs, [0, 2], (o, k) => asked[k] === tests[k].length && lineCount(o, UNLOCK) <= 1),
    },
    {
      hint: (c, outs, raw, tests) => {
        const i = firstFail(outs, [0, 1, 2], o => UNLOCK.test(o));
        return `❌ With ${say(tests[i])} typed, the program should print a message with Unlocked in it once 62 is typed, but ${saidLine(outs[i].split('\n').slice(-2).join('\n'))}.`;
      },
      test: (raw, outs) => outs.every(o => UNLOCK.test(o)),
      show: outs => firstFail(outs, [0, 1, 2], o => UNLOCK.test(o)),
    },
    {
      hint: (c, outs, raw, tests) => {
        const i = firstFail(outs, [0, 1, 2], (o, k) => countLine(o, tests[k].length));
        const n = tests[i].length;
        return `❌ With ${say(tests[i])} typed, that's ${n} guess${n === 1 ? '' : 'es'}, so a line should say so (e.g. Unlocked in ${n} guess${n === 1 ? '' : 'es'}), but ${triesSaid(outs[i]) ? `it said "${triesSaid(outs[i]).trim()}"` : 'no line mentions the guesses'}.`;
      },
      test: (raw, outs, c, tests) => outs.every((o, k) => countLine(o, tests[k].length)),
      show: (outs, c, tests) => firstFail(outs, [0, 1, 2], (o, k) => countLine(o, tests[k].length)),
    },
    {
      hint: c => SEALS_CHOICES[c]
        ? `❌ Add one more line at the very end that prints ${SEALS_CHOICES[c]} — not indented, so it prints once the lock is open.`
        : '❌ Make your call above, then add the line it asks for.',
      test: (raw, outs, c) => !!SEALS_RE[c] && outs.every(o => lineCount(o, SEALS_RE[c]) === 1),
      show: (outs, c) => Math.max(0, outs.findIndex(o => lineCount(o, SEALS_RE[c] || /$^/) !== 1)),
    },
  ],
  passMsg: c => c === 'override'
    ? '✅ Lock cracked: it keeps asking until 62, and counts every guess — and the seals stay on your override.'
    : '✅ Lock cracked: it keeps asking until 62, and counts every guess — and WARDEN takes the seals.',
};

// outputs = what each test printed; choice = the student's Make choice (SEALS_CHOICES key);
// tests = the MAKE_TEST_BANK set the check ran (default: the first).
export function evalMake(raw, outputs = [], choice, tests = MAKE_TESTS) {
  return evalTests(MAKE_CHECK, tests, raw, outputs, choice);
}

// ── Extension — Too high / Too low ───────────────────────────────────────────
// if/elif INSIDE the loop: the unit's first nesting, placed last on purpose (MTP).
// Each wrong guess prints exactly one hint, in order: Too high above 62, Too low below it.
// The first set's guesses change; 63 and 61 (either side of 62) are in every set.
export const EXT_TEST_BANK = [['80', '10'], ['95', '30'], ['70', '5'], ['99', '1'], ['64', '40'], ['75', '20']]
  .map(([hi, lo]) => [[hi, lo, '62'], ['63', '61', '62']]);
export const EXT_TESTS = EXT_TEST_BANK[0];

const HINT = /too\s*(high|low)/i;
function hintsRight(out, guesses) {
  const got = String(out || '').split('\n').map(l => l.match(HINT)).filter(Boolean).map(m => m[1].toLowerCase());
  const want = guesses.filter(g => g !== LOCK_NUMBER).map(g => (Number(g) > 62 ? 'high' : 'low'));
  return got.length === want.length && got.every((h, i) => h === want[i]);
}

export const EXT_CHECK = {
  reqs: [
    {
      hint: (c, outs, raw, tests) => {
        const i = firstFail(outs, [0, 1], (o, k) => hintsRight(o, tests[k]));
        const want = tests[i].filter(g => g !== LOCK_NUMBER).map(g => `${g}: Too ${Number(g) > 62 ? 'high' : 'low'}`).join(', ');
        return `❌ With ${say(tests[i])} typed, each wrong guess should print one hint (${want}), but ${saidLine(outs[i])}. Use if / elif inside the loop to compare the guess with 62.`;
      },
      test: (raw, outs, c, tests) => outs.every((o, k) => hintsRight(o, tests[k])),
      show: (outs, c, tests) => firstFail(outs, [0, 1], (o, k) => hintsRight(o, tests[k])),
    },
    {
      hint: (c, outs, raw, tests) => `❌ It must still unlock and count: with ${say(tests[0])} typed, Unlocked and the number of guesses (3).`,
      test: (raw, outs, c, tests) => outs.every((o, k) => UNLOCK.test(o) && countLine(o, tests[k].length)),
    },
  ],
  passMsg: '🌟 Too high, too low, unlocked: a loop with a decision inside it. Outstanding!',
};

export function evalExt(raw, outputs = [], tests = EXT_TESTS) {
  return evalTests(EXT_CHECK, tests, raw, outputs);
}
