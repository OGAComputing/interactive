// Validation logic for 1_Proximity_PRIMM.html — Y9 Python L2 "Proximity" (Station Zero,
// Chapter 2). Reactivates binary if/else from Y8 and adds one new concept: elif.
//
// The proximity-sensor program students start from (STARTER_CODE in the HTML) is a plain
// if/else, used for Predict, Run and Investigate:
//   distance = int(input("Distance to target in metres: "))
//   if distance >= 50:
//       print("All clear")
//   else:
//       print("IT'S RIGHT BEHIND YOU")
//   print("Scan complete")
// elif first appears in Modification 2, which adds a middle band (20 to 49: Movement detected).
//
// Checks are BEHAVIOUR-BASED (see the MTP: "Behaviour-based checkers from L2 onwards"): Modify,
// Make and the extension run the student's program once per test in MOD_TESTS / MAKE_TESTS /
// EXT_TESTS and judge what it printed, so any correct shape passes — conditions in any order,
// >= 50 or > 49, < instead of >=, and so on. Boundary values are always among the tests.
// The HTML passes evalMod/evalMake/evalExt one output per test, in the same order.
//
// Each check's tests come from a bank (MOD_TEST_BANK / MAKE_TEST_BANK / EXT_TEST_BANK). Each
// ⚡ Check picks one set (pickFrom in the HTML), so students see the "typed for you" numbers
// change. Only the values in the middle of a band change: the boundary values are in every set.

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (input, print, if, numbers) can't trigger false positives.
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

// What the program printed itself. The runner echoes one "prompt + answer" line per input();
// drop the first line ending in each answer, in order, so a prompt such as
// "Is it safe? " can never count as the program printing SAFE.
export function ownOutput(output, inputs = []) {
  const lines = String(output || '').split('\n');
  let from = 0;
  for (const v of inputs) {
    const i = lines.findIndex((l, k) => k >= from && l.trimEnd().endsWith(String(v)));
    if (i === -1) continue;
    lines.splice(i, 1);
    from = i;
  }
  return lines.filter(l => l.trim()).join('\n');
}

// The number typed into the first input() of a run — the end of the echoed prompt line.
// Used by the Run stage to tick off each distance the student has tried.
export function typedNumber(output) {
  const first = String(output || '').split('\n')[0] || '';
  const m = first.match(/(-?\d+)\s*$/);
  return m ? Number(m[1]) : null;
}

// A test passes for a band when its message is printed and no other band's message is.
function onlyBand(text, bands, want) {
  return bands[want].test(text) && Object.entries(bands).every(([k, re]) => k === want || !re.test(text));
}

// The first line the program printed, for "it printed …" hints (or a note that it printed nothing).
function saidLine(text) {
  const l = String(text || '').split('\n').find(s => s.trim());
  return l ? `it printed "${l.trim().slice(0, 60)}"` : 'it printed nothing';
}

// choice = the student's Station Zero choice; outs = what each test printed (echo lines removed);
// tests = the answers each test typed. A hint or passMsg may be a function (choice, outs, raw,
// tests). show = which test's run the HTML steps through: the failing requirement's, else the first.
function evalReqs(check, raw, outs, choice, tests) {
  const results = check.reqs.map(r => !!r.test(raw, outs, choice));
  const pass = results.every(Boolean);
  const bad = check.reqs[results.findIndex(r => !r)];
  const msg = pass ? check.passMsg : bad.hint;
  const show = pass ? 0 : typeof bad.show === 'function' ? bad.show(outs, choice) : (bad.show || 0);
  return { results, pass, msg: typeof msg === 'function' ? msg(choice, outs, raw, tests) : msg, show };
}

function evalTests(check, tests, raw, outputs, choice) {
  const outs = tests.map((t, i) => ownOutput((outputs || [])[i], t));
  return evalReqs(check, raw, outs, choice, tests);
}

// Index of the first test in `idx` whose output fails `ok`, else the first of `idx`.
const firstFail = (outs, idx, ok) => idx.find(i => !ok(outs[i] || '', i)) ?? idx[0];

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML),
// ticked/crossed live and required before that step's "Check answer" will pass.
// test(raw, ctx): ctx.breaks / ctx.fixes = Break it presses / break→fix→run cycles at this
// step; ctx.lastRun = { code, ok } of the last Investigate run.

const cond = (kw, op, n) => new RegExp(`^[ \\t]*${kw}\\s+distance\\s*${op}\\s*${n}\\s*:`, 'm');
const hasLine = (raw, re) => re.test(normalise(raw));
// How far print("Scan complete") is indented (null if the line has gone). Read from the raw
// code, since normalise() empties strings.
const SCAN_LINE = /^([ \t]*)print\s*\(\s*(["'])scan complete\2\s*\)/im;
const scanIndent = raw => { const m = liveLines(raw).match(SCAN_LINE); return m ? m[1].length : null; };
const indentOf = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const leadOf   = line => line.match(/^[ \t]*/)[0];   // the exact whitespace — Python won't match a Tab with 4 spaces

// Step 2: where print("Scan complete") sits next to the else block. scan / body are raw lines
// (body = the first line inside the else, print("IT'S RIGHT BEHIND YOU") in the starter);
// above = Scan complete has been moved above the else. null if either line has gone.
function scanGeometry(raw) {
  const lines = raw.split('\n').filter(l => l.trim() && !/^\s*#/.test(l));
  const scanIdx = lines.findIndex(l => SCAN_LINE.test(l));
  const elseIdx = lines.findIndex(l => /^\s*else\s*:/.test(l));
  if (scanIdx === -1 || elseIdx === -1 || elseIdx + 1 >= lines.length) return null;
  return { scan: lines[scanIdx], body: lines[elseIdx + 1], above: scanIdx < elseIdx };
}

// The standard bug step: Break it takes int() off line 1, so distance holds TEXT and
// `distance >= 50` stops with TypeError: '>=' not supported between 'str' and 'int'.
// The fix is int() back round input() — a line can't be deleted to fix this one.
export const IBUG_LINE       = 'distance = input("Distance to target in metres: ")';
export const IBUG_FIXED_LINE = 'distance = int(input("Distance to target in metres: "))';
const UNCAST_RE   = /^[ \t]*distance\s*=\s*input\s*\(/m;
const CAST_RE     = /^[ \t]*distance\s*=\s*(?:int|float)\s*\(\s*input\s*\(/m;
const CAST_LATER  = /^[ \t]*distance\s*=\s*(?:int|float)\s*\(\s*distance\s*\)/m;   // distance = int(distance)
export const hasBugLine   = raw => { const s = normalise(liveLines(raw)); return UNCAST_RE.test(s) && !CAST_LATER.test(s); };
export const hasFixedLine = raw => { const s = normalise(liveLines(raw)); return CAST_RE.test(s) || (UNCAST_RE.test(s) && CAST_LATER.test(s)); };
export const isBugFixed   = raw => hasFixedLine(raw) && !hasBugLine(raw);
// Nothing is planted as an extra line here (the bug is made in place on line 1), so there is
// never a demo line to strip when the step ends.
export const isBugPairLine = () => false;

// A run that works without the fix: the comparisons were cast instead, e.g. int(distance) >= 50.
const hasNearMiss = raw => hasBugLine(raw) && /\b(?:int|float)\s*\(\s*distance\s*\)/.test(normalise(raw));

// "😈 Break it": takes int() (or float()) off the line that asks for the distance, in place.
// An already-broken line is left alone, so it is safe to mash; a later distance = int(distance)
// line is removed so the bug really happens; with no distance line at all, IBUG_LINE goes on top.
export function breakCode(raw) {
  const body = raw.replace(/\s+$/, '');
  let lines = body ? body.split('\n') : [];
  lines = lines.filter(l => !/^\s*distance\s*=\s*(?:int|float)\s*\(\s*distance\s*\)\s*$/.test(l));
  let i = lines.findIndex(l => !/^\s*#/.test(l) && /^\s*distance\s*=.*\binput\s*\(/.test(l));
  if (i === -1) {
    lines.unshift(IBUG_LINE);
    i = 0;
  } else {
    lines[i] = lines[i].replace(/\b(?:int|float)\s*\(\s*(input\s*\((?:[^()]|\([^()]*\))*\))\s*\)/, '$1');
  }
  return { code: lines.join('\n') + '\n', lineNo: i + 1 };
}

const fixedAndRun = (raw, ctx) =>
  isBugFixed(raw) && !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();

function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to take int() off line 1.';
  if (hasNearMiss(raw)) return 'Nearly! That runs, but turn the answer into a number once, where it comes in: put int( back round input( on line 1, with its closing )';
  if (hasBugLine(raw)) return 'Fix line 1: put int( back round input( so it reads distance = int(input("Distance to target in metres: "))';
  if (!hasFixedLine(raw)) return 'The line that asks for the distance has gone — press 😈 Break it to bring it back, then put int( round input(';
  return 'Now press ▶ Run code to check your fix works.';
}

export const INV_CHECKS = {
  // Step 1 — change the threshold: 30 >= 20 is True, so 30 now prints All clear.
  inv1: {
    reqs: [
      { hint: 'On line 2, change 50 to 20, so it reads if distance >= 20:', test: raw => hasLine(raw, cond('if', '>=', 20)) },
    ],
  },
  // Step 2 — indent print("Scan complete") into the else: 85 runs the if block, so it never
  // prints; 10 runs the else, so it does. Indentation is where students get stuck, so the one
  // change is two bullets that tick live (press Tab → lines up with line 5), and each hint
  // names the exact problem (2 spaces not 4, a Tab character mixed with spaces …).
  inv2: {
    reqs: [
      {
        hint: raw => {
          if (scanIndent(raw) === null) return 'The Scan complete line has gone. Press ↺ Reset to original, then try again';
          if (scanGeometry(raw)?.above) return 'Keep print("Scan complete") as the last line. Press ↺ Reset to original, then try again';
          return 'Click at the very start of line 6, just before print("Scan complete"), and press Tab once';
        },
        test: raw => scanIndent(raw) > 0,
      },
      {
        hint: raw => {
          const g = scanGeometry(raw);
          if (!g) return 'Keep the else: from the starting code, with print("IT\'S RIGHT BEHIND YOU") under it';
          const have = indentOf(g.scan), want = indentOf(g.body);
          if (have === 0) return 'Once line 6 has spaces in front, check it lines up with print("IT\'S RIGHT BEHIND YOU") above it';
          if (have === want) return 'Line 6 mixes a Tab character with spaces, which Python can\'t match up. Delete the gap at the start of the line and press Tab once';
          if (have < want) return `Line 6 has ${have} space${have === 1 ? '' : 's'} in front; line 5 has ${want}. They must match exactly: click at the start of line 6 and add ${want - have} more`;
          return `Line 6 has ${have} spaces in front; line 5 has ${want}. Too many: click at the start of line 6 and press Shift+Tab to take 4 away`;
        },
        test: raw => { const g = scanGeometry(raw); return !!g && !g.above && leadOf(g.scan) === leadOf(g.body); },
        // indented, but its spaces don't match the line above
        wrong: raw => { const g = scanGeometry(raw); return !!g && !g.above && indentOf(g.scan) > 0 && leadOf(g.scan) !== leadOf(g.body); },
      },
    ],
  },
  // Step 3 — line 6 back to the left edge, then >= → > on line 2: at exactly 20, 20 > 20 is False.
  inv3: {
    reqs: [
      { hint: 'Move line 6 back to the left edge, with no spaces in front of print("Scan complete")', test: raw => scanIndent(raw) === 0 },
      {
        hint: raw => hasLine(raw, cond('if', '>=', 20))
          ? 'On line 2, change >= to > (delete the =), so it reads if distance > 20:'
          : 'Line 2 should read if distance > 20:',
        test: raw => hasLine(raw, cond('if', '>(?!=)', 20)),
      },
    ],
  },
  // Step 4 — the standard bug step: Break it, then fix it with int().
  inv4: {
    reqs: [
      { hint: 'Press 😈 Break it to take int() off line 1.', test: (raw, ctx) => ctx.breaks >= 1 },
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
// Modify starts from STARTER_CODE again (the plain if/else). Every check runs the program once
// per test below.

const SENSOR = {
  clear:  /all\s*clear/i,
  move:   /movement\s*detected/i,
  behind: /behind\s*you/i,
  alert:  /proximity\s*alert/i,
};
const ANY_LOCKDOWN = /lockdown/i;
// Modification 2's middle band: Movement detected, and no lockdown.
const MIDDLE_OK = o => onlyBand(o, SENSOR, 'move') && !ANY_LOCKDOWN.test(o);

// Modification 1 is a Station Zero choice: which room the sensor locks down when the target is
// close. The student picks first; the requirement then wants THAT line, inside the else.
export const LOCKDOWN_CHOICES = { cryo: 'LOCKDOWN: CRYO BAY', sensors: 'LOCKDOWN: SENSOR OPS' };
const LOCKDOWN_RE = { cryo: /lockdown[^\w\n]*cryo\s*bay/i, sensors: /lockdown[^\w\n]*sensor\s*ops/i };

// Each entry is a list of test sets; a set is one run per test, in the order the checks expect.
//   mod1: close (under 20, so it stays in the else after Modification 2), far (50 or more)
//   mod2: far (over 50), 50, 49, a middle distance (21–48), 20, 19 — the new elif band
//   mod3: inside the new band (11–19), 10, a middle distance (21–48), 20, 9
//   mod4: a distance under 10 (so the alert follows a lockdown), then y — and again with n
export const MOD_TEST_BANK = {
  mod1: [
    [['5'], ['85']], [['12'], ['70']], [['3'], ['150']], [['17'], ['55']],
    [['8'], ['99']], [['1'], ['63']], [['14'], ['120']],
  ],
  mod2: [['85', '30'], ['70', '41'], ['150', '25'], ['55', '36'], ['99', '44'], ['63', '33']]
    .map(([far, mid]) => [[far], ['50'], ['49'], [mid], ['20'], ['19']]),
  mod3: [
    [['15'], ['10'], ['25'], ['20'], ['9']], [['12'], ['10'], ['45'], ['20'], ['9']],
    [['18'], ['10'], ['33'], ['20'], ['9']], [['11'], ['10'], ['48'], ['20'], ['9']],
    [['16'], ['10'], ['27'], ['20'], ['9']], [['13'], ['10'], ['39'], ['20'], ['9']],
  ],
  mod4: ['5', '2', '7', '0', '8', '3'].map(d => [[d, 'y'], [d, 'n']]),
};
export const MOD_TESTS = Object.fromEntries(Object.entries(MOD_TEST_BANK).map(([k, bank]) => [k, bank[0]]));

export const MOD_CHECKS = {
  // Mod 1 — trivial: one print line, indented inside the else (the student's chosen room).
  mod1: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => LOCKDOWN_CHOICES[c]
          ? `❌ With ${tests[0][0]} typed, the program should print ${LOCKDOWN_CHOICES[c]}. Add print("${LOCKDOWN_CHOICES[c]}") under print("IT'S RIGHT BEHIND YOU"), indented the same amount.`
          : '❌ Make your choice above first.',
        test: (raw, outs, c) => !!LOCKDOWN_RE[c]?.test(outs[0]),
      },
      {
        hint: (c, outs, raw, tests) => `❌ With ${tests[1][0]} typed, your program locked down too. The lockdown should only happen when the target is close: indent the line so it sits inside the else, under print("IT'S RIGHT BEHIND YOU").`,
        test: (raw, outs) => !ANY_LOCKDOWN.test(outs[1]),
        show: 1,
      },
    ],
    passMsg: c => `✅ Lockdown set: when the target is close, the sensor locks down the ${c === 'sensors' ? 'Sensor Ops' : 'Cryo Bay'} door.`,
  },

  // Mod 2 — the first elif (its code is given): a middle band, so 20 to 49 no longer locks down.
  mod2: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => {
          const i = firstFail(outs, [2, 3, 4], MIDDLE_OK);
          if (onlyBand(outs[i], SENSOR, 'move'))
            return `❌ With ${tests[i][0]} typed, your program said Movement detected, but locked down too. Keep the lockdown line in the else, under print("IT'S RIGHT BEHIND YOU")`;
          return SENSOR.behind.test(outs[i])
            ? `❌ With ${tests[i][0]} typed, the sensor should say Movement detected, but ${saidLine(outs[i])}. Add the two new lines between the All clear block and else:`
            : `❌ With ${tests[i][0]} typed, the sensor should say Movement detected, but ${saidLine(outs[i])}.`;
        },
        test: (raw, outs) => [2, 3, 4].every(i => MIDDLE_OK(outs[i] || '')),
        show: outs => firstFail(outs, [2, 3, 4], MIDDLE_OK),
      },
      {
        hint: (c, outs, raw, tests) => {
          const i = firstFail(outs, [0, 1], o => onlyBand(o, SENSOR, 'clear'));
          return `❌ With ${tests[i][0]} typed, the sensor should still say All clear, but ${saidLine(outs[i])}. The elif goes after the if block, so line 2 is still checked first.`;
        },
        test: (raw, outs) => onlyBand(outs[0], SENSOR, 'clear') && onlyBand(outs[1], SENSOR, 'clear'),
        show: outs => firstFail(outs, [0, 1], o => onlyBand(o, SENSOR, 'clear')),
      },
      {
        hint: (c, outs) => `❌ With 19 typed, the sensor should still say IT'S RIGHT BEHIND YOU, but ${saidLine(outs[5])}. The new band starts at 20, so 19 belongs to the else.`,
        test: (raw, outs) => onlyBand(outs[5], SENSOR, 'behind'),
        show: 5,
      },
    ],
    passMsg: '✅ Three bands: 50 or more is all clear, 20 to 49 is movement, and only under 20 locks down.',
  },

  // Mod 3 — a new band in the right place (no code given; the hints give none either).
  mod3: {
    reqs: [
      {
        hint: (c, outs, raw, tests) => {
          const i = onlyBand(outs[0], SENSOR, 'alert') ? 1 : 0;
          return `❌ With ${tests[i][0]} typed, the sensor should say Proximity alert, but ${saidLine(outs[i])}. Add a new elif branch for distances from 10 up to 19.`;
        },
        test: (raw, outs) => onlyBand(outs[0], SENSOR, 'alert') && onlyBand(outs[1], SENSOR, 'alert'),
        show: outs => firstFail(outs, [0, 1], o => onlyBand(o, SENSOR, 'alert')),
      },
      {
        hint: (c, outs, raw, tests) => {
          const i = onlyBand(outs[2], SENSOR, 'move') ? 3 : 2;
          return SENSOR.alert.test(outs[i])
            ? `❌ With ${tests[i][0]} typed, your program printed Proximity alert, but it should still be Movement detected. Python stops at the first True condition, so the new branch must come after the Movement detected one.`
            : `❌ With ${tests[i][0]} typed, the sensor should still say Movement detected, but ${saidLine(outs[i])}.`;
        },
        test: (raw, outs) => onlyBand(outs[2], SENSOR, 'move') && onlyBand(outs[3], SENSOR, 'move'),
        show: outs => firstFail(outs, [2, 3], o => onlyBand(o, SENSOR, 'move')),
      },
      {
        hint: (c, outs) => `❌ With 9 typed, the sensor should still say IT'S RIGHT BEHIND YOU, but ${saidLine(outs[4])}. The new band starts at 10, so 9 belongs to the else.`,
        test: (raw, outs) => onlyBand(outs[4], SENSOR, 'behind'),
        show: 4,
      },
    ],
    passMsg: '✅ New band in the right place: 10 to 19 is a proximity alert, and every other distance still works.',
  },

  // Mod 4 — a second question at the bottom, and a string comparison with ==.
  mod4: {
    reqs: [
      {
        hint: '❌ At the bottom of the program, ask a second question with input(): Send alert to the crew? (y/n)',
        test: raw => inputCount(raw) >= 2,
      },
      {
        hint: (c, outs) => `❌ When the answer is y, the program should print Alert sent, but ${saidLine(outs[0].split('\n').slice(-2).join('\n'))}. Compare the answer with "y" using == (with the quotes).`,
        test: (raw, outs) => /alert\s*sent/i.test(outs[0]) && !/cancell?ed/i.test(outs[0]),
      },
      {
        hint: '❌ When the answer is anything else (tested with n), the program should print Alert cancelled, and not Alert sent. An else under your if can do that.',
        test: (raw, outs) => /alert\s*cancell?ed/i.test(outs[1]) && !/alert\s*sent/i.test(outs[1]),
        show: 1,
      },
    ],
    passMsg: '✅ == compared the answer with "y": y sends the alert, and anything else cancels it.',
  },
};

// tests = the set from MOD_TEST_BANK[checkKey] the check ran (default: the first);
// outputs = what each of its tests printed, in order.
export function evalMod(checkKey, raw, outputs = [], choice, tests = MOD_TESTS[checkKey]) {
  return evalTests(MOD_CHECKS[checkKey], tests, raw, outputs, choice);
}

// ── Make — radiation scanner ─────────────────────────────────────────────────
// Bands: 200+ DANGER · 100–199 WARNING · 50–99 CAUTION · under 50 SAFE.
// Tested on both sides of every boundary, so any correct ordering passes.
const DOSE = {
  danger:  /\bdanger\b/i,
  warning: /\bwarning\b/i,
  caution: /\bcaution\b/i,
  safe:    /\bsafe\b/i,
};
// The first dose (well over 200) and the last (under 49) change from set to set.
export const MAKE_TEST_BANK = [['350', '0'], ['260', '12'], ['475', '31'], ['812', '7'], ['999', '45'], ['230', '20']]
  .map(([hi, lo]) => [[hi], ['200'], ['199'], ['100'], ['99'], ['50'], ['49'], [lo]]);
export const MAKE_TESTS = MAKE_TEST_BANK[0];

// Make is the second Station Zero choice: where the last of the power goes. The student picks
// first, and the last req wants the line for THAT choice, printed on every run (at the end).
export const POWER_CHOICES = { sensors: 'POWER: SENSORS', pods: 'POWER: CRYO PODS' };
const POWER_RE = { sensors: /power[^\w\n]*sensors?\b/i, pods: /power[^\w\n]*(?:cryo\s*)?pods?\b/i };

// A dose band requirement: both test doses print that band's word and no other band's word.
function bandReq(word, key, idx, range) {
  const ok = o => onlyBand(o, DOSE, key);
  return {
    hint: (c, outs, raw, tests) => {
      const i = firstFail(outs, idx, ok);
      return `❌ A dose of ${tests[i][0]} (${range}) should print a message with the word ${word} in it, and none of the other band words — but ${saidLine(outs[i])}.`;
    },
    test: (raw, outs) => idx.every(i => ok(outs[i] || '')),
    show: outs => firstFail(outs, idx, ok),
  };
}

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Ask for the dose with input(), and turn the answer into a whole number with int()',
      test: raw => inputCount(raw) >= 1 && castCount(raw) >= 1,
    },
    {
      hint: '❌ Use if, elif and else: one if for the first band, an elif for each band in the middle, and an else for the last one.',
      test: raw => {
        const s = normalise(raw);
        return /^[ \t]*if\b/m.test(s) && /^[ \t]*elif\b/m.test(s) && /^[ \t]*else\s*:/m.test(s);
      },
    },
    bandReq('DANGER',  'danger',  [0, 1], '200 or more'),
    bandReq('WARNING', 'warning', [2, 3], '100 to 199'),
    bandReq('CAUTION', 'caution', [4, 5], '50 to 99'),
    bandReq('SAFE',    'safe',    [6, 7], 'under 50'),
    {
      hint: c => POWER_CHOICES[c]
        ? `❌ Add one more line at the very end that prints ${POWER_CHOICES[c]} — not indented, so it prints for every dose.`
        : '❌ Make your call above, then add the line it asks for.',
      test: (raw, outs, c) => !!POWER_RE[c] && outs.every(o => POWER_RE[c].test(o)),
      show: (outs, c) => Math.max(0, outs.findIndex(o => !POWER_RE[c]?.test(o))),
    },
  ],
  passMsg: c => c === 'pods'
    ? '✅ Scanner working at every boundary — and the last of the power is going to the cryo pods.'
    : '✅ Scanner working at every boundary — and the last of the power is restarting the sensors.',
};

// outputs = what each test printed; choice = the student's Make choice (POWER_CHOICES key);
// tests = the MAKE_TEST_BANK set the check ran (default: the first).
export function evalMake(raw, outputs = [], choice, tests = MAKE_TESTS) {
  return evalTests(MAKE_CHECK, tests, raw, outputs, choice);
}

// ── Extension — scanner faults and evacuation ────────────────────────────────
const EXT_BANDS = { ...DOSE, fault: /scanner\s*fault/i, evacuate: /\bevacuate\b/i };
// The impossible dose (below 0) and the second evacuation dose (over 500) change from set to set.
export const EXT_TEST_BANK = [['-5', '900'], ['-1', '650'], ['-20', '1200'], ['-99', '501'], ['-3', '777'], ['-50', '2000']]
  .map(([neg, big]) => [[neg], ['0'], ['500'], [big], ['499']]);
export const EXT_TESTS = EXT_TEST_BANK[0];

export const EXT_CHECK = {
  reqs: [
    {
      hint: (c, outs, raw, tests) => !onlyBand(outs[0], EXT_BANDS, 'fault')
        ? `❌ A dose below 0 is impossible: with ${tests[0][0]} typed, the scanner should print SCANNER FAULT (and no band word), but ${saidLine(outs[0])}.`
        : `❌ A dose of 0 should still print SAFE, not SCANNER FAULT — but ${saidLine(outs[1])}. Only doses below 0 are faults.`,
      test: (raw, outs) => onlyBand(outs[0], EXT_BANDS, 'fault') && onlyBand(outs[1], EXT_BANDS, 'safe'),
      show: outs => (onlyBand(outs[0], EXT_BANDS, 'fault') ? 1 : 0),
    },
    {
      hint: (c, outs, raw, tests) => {
        const i = firstFail(outs, [2, 3, 4], (o, k) => onlyBand(o, EXT_BANDS, k === 4 ? 'danger' : 'evacuate'));
        return i === 4
          ? `❌ A dose of 499 should still print DANGER, not EVACUATE — but ${saidLine(outs[4])}.`
          : `❌ A dose of ${tests[i][0]} should print EVACUATE (and no other band word), but ${saidLine(outs[i])}. Think about where this check goes: Python stops at the first True condition.`;
      },
      test: (raw, outs) => onlyBand(outs[2], EXT_BANDS, 'evacuate') && onlyBand(outs[3], EXT_BANDS, 'evacuate') && onlyBand(outs[4], EXT_BANDS, 'danger'),
      show: outs => firstFail(outs, [2, 3, 4], (o, k) => onlyBand(o, EXT_BANDS, k === 4 ? 'danger' : 'evacuate')),
    },
  ],
  passMsg: '🌟 Faults caught and evacuations called — your scanner handles every case. Outstanding!',
};

export function evalExt(raw, outputs = [], tests = EXT_TESTS) {
  return evalTests(EXT_CHECK, tests, raw, outputs);
}
