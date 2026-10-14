// Validation logic for 1_Proximity_PRIMM.html — Y9 Python L2 "Proximity" (Station Zero,
// Chapter 2). Reactivates binary if/else from Y8 and adds one new concept: elif.
//
// The proximity-sensor program students start from (STARTER_CODE in the HTML):
//   distance = int(input("Distance to target in metres: "))
//   if distance >= 50:
//       print("All clear")
//   elif distance >= 20:
//       print("Movement detected")
//   else:
//       print("IT'S RIGHT BEHIND YOU")
//   print("Scan complete")
//
// Checks are BEHAVIOUR-BASED (see the MTP: "Behaviour-based checkers from L2 onwards"): Modify,
// Make and the extension run the student's program once per test in MOD_TESTS / MAKE_TESTS /
// EXT_TESTS and judge what it printed, so any correct shape passes — conditions in any order,
// >= 50 or > 49, < instead of >=, and so on. Boundary values are always among the tests.
// The HTML passes evalMod/evalMake/evalExt one output per test, in the same order.

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

// choice = the student's Station Zero choice; outs = what each test printed (echo lines removed).
// A hint or passMsg may be a function (choice, outs, raw). show = which test's run the HTML
// steps through: the failing requirement's, else the first.
function evalReqs(check, raw, outs, choice) {
  const results = check.reqs.map(r => !!r.test(raw, outs, choice));
  const pass = results.every(Boolean);
  const bad = check.reqs[results.findIndex(r => !r)];
  const msg = pass ? check.passMsg : bad.hint;
  const show = pass ? 0 : typeof bad.show === 'function' ? bad.show(outs, choice) : (bad.show || 0);
  return { results, pass, msg: typeof msg === 'function' ? msg(choice, outs, raw) : msg, show };
}

function evalTests(check, tests, raw, outputs, choice) {
  const outs = tests.map((t, i) => ownOutput((outputs || [])[i], t));
  return evalReqs(check, raw, outs, choice);
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
// The number in the first `if distance … N:` line (the condition Python checks first).
const firstIfNumber = raw => {
  const m = normalise(raw).match(/^[ \t]*if\s+distance\s*>=?\s*(\d+)\s*:/m);
  return m ? Number(m[1]) : null;
};

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
  // Step 1 — swap the two numbers: 20 is now checked first, so 30 prints All clear.
  inv1: {
    reqs: [
      { hint: 'On line 2, change 50 to 20, so it reads if distance >= 20:', test: raw => hasLine(raw, cond('if', '>=', 20)) },
      { hint: 'On line 4, change 20 to 50, so it reads elif distance >= 50:', test: raw => hasLine(raw, cond('elif', '>=', 50)) },
    ],
  },
  // Step 2 — numbers back, then elif → if: two separate ifs, so 85 prints two messages.
  inv2: {
    reqs: [
      { hint: 'Put the numbers back: line 2 should read if distance >= 50:', test: raw => firstIfNumber(raw) === 50 },
      {
        hint: raw => hasLine(raw, /^[ \t]*elif\b/m)
          ? 'Line 4 still says elif — change the word elif to if, so it reads if distance >= 20:'
          : 'Line 4 should read if distance >= 20: (with 20, not 50)',
        test: raw => hasLine(raw, cond('if', '>=', 20)) && !hasLine(raw, /^[ \t]*elif\b/m),
      },
    ],
  },
  // Step 3 — elif back, then >= → > on line 4: at exactly 20, 20 > 20 is False.
  inv3: {
    reqs: [
      { hint: 'Change line 4 back to elif, so it starts elif distance', test: raw => hasLine(raw, /^[ \t]*elif\s+distance\b/m) },
      {
        hint: raw => hasLine(raw, cond('elif', '>=', 20))
          ? 'On line 4, change >= to > (delete the =), so it reads elif distance > 20:'
          : 'Line 4 should read elif distance > 20:',
        test: raw => hasLine(raw, cond('elif', '>(?!=)', 20)),
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
export function evalInv(n, raw, ctx = {}) {
  const c = { breaks: 0, fixes: 0, lastRun: null, ...ctx };
  const reqs = INV_CHECKS['inv' + n]?.reqs || [];
  const results = reqs.map(r => !!r.test(raw, c));
  const bad = results.findIndex(r => !r);
  const hint = bad === -1 ? null : reqs[bad].hint;
  return { results, pass: bad === -1, msg: typeof hint === 'function' ? hint(raw, c) : hint };
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from STARTER_CODE again. Every check runs the program once per test below.

const SENSOR = {
  clear:  /all\s*clear/i,
  move:   /movement\s*detected/i,
  behind: /behind\s*you/i,
  alert:  /proximity\s*alert/i,
};
const ANY_LOCKDOWN = /lockdown/i;

// Modification 1 is a Station Zero choice: which room the sensor locks down when the target is
// close. The student picks first; the requirement then wants THAT line, inside the else.
export const LOCKDOWN_CHOICES = { cryo: 'LOCKDOWN: CRYO BAY', sensors: 'LOCKDOWN: SENSOR OPS' };
const LOCKDOWN_RE = { cryo: /lockdown[^\w\n]*cryo\s*bay/i, sensors: /lockdown[^\w\n]*sensor\s*ops/i };

export const MOD_TESTS = {
  mod1: [['5'], ['30'], ['85']],
  mod2: [['60'], ['59']],
  mod3: [['15'], ['10'], ['25'], ['20'], ['9']],
  mod4: [['5', 'y'], ['5', 'n']],   // distance 5 first, so the alert follows a lockdown
};

export const MOD_CHECKS = {
  // Mod 1 — trivial: one print line, indented inside the else (the student's chosen room).
  mod1: {
    reqs: [
      {
        hint: c => LOCKDOWN_CHOICES[c]
          ? `❌ With 5 typed, the program should print ${LOCKDOWN_CHOICES[c]}. Add print("${LOCKDOWN_CHOICES[c]}") under print("IT'S RIGHT BEHIND YOU"), indented the same amount.`
          : '❌ Make your choice above first.',
        test: (raw, outs, c) => !!LOCKDOWN_RE[c]?.test(outs[0]),
      },
      {
        hint: (c, outs) => `❌ With ${ANY_LOCKDOWN.test(outs[1]) ? 30 : 85} typed, your program locked down too. The lockdown should only happen when the target is close: indent the line so it sits inside the else, under print("IT'S RIGHT BEHIND YOU").`,
        test: (raw, outs) => !ANY_LOCKDOWN.test(outs[1]) && !ANY_LOCKDOWN.test(outs[2]),
        show: outs => (ANY_LOCKDOWN.test(outs[1]) ? 1 : 2),
      },
    ],
    passMsg: c => `✅ Lockdown set: when the target is close, the sensor locks down the ${c === 'sensors' ? 'Sensor Ops' : 'Cryo Bay'} door.`,
  },

  // Mod 2 — change a threshold, checked either side of it.
  mod2: {
    reqs: [
      {
        hint: (c, outs) => `❌ With 60 typed, the sensor should say All clear, but ${saidLine(outs[0])}. Change the number in the first condition (line 2) to 60, keeping >=`,
        test: (raw, outs) => onlyBand(outs[0], SENSOR, 'clear'),
      },
      {
        hint: (c, outs) => `❌ With 59 typed, the sensor should say Movement detected, but ${saidLine(outs[1])}. 59 is less than 60, so it isn't all clear.`,
        test: (raw, outs) => onlyBand(outs[1], SENSOR, 'move'),
        show: 1,
      },
    ],
    passMsg: '✅ Recalibrated: 60 is all clear, and 59 is movement detected.',
  },

  // Mod 3 — a new band in the right place (no code given; the hints give none either).
  mod3: {
    reqs: [
      {
        hint: (c, outs) => {
          const i = onlyBand(outs[0], SENSOR, 'alert') ? 1 : 0;
          return `❌ With ${MOD_TESTS.mod3[i][0]} typed, the sensor should say Proximity alert, but ${saidLine(outs[i])}. Add a new elif branch for distances from 10 up to 19.`;
        },
        test: (raw, outs) => onlyBand(outs[0], SENSOR, 'alert') && onlyBand(outs[1], SENSOR, 'alert'),
        show: outs => firstFail(outs, [0, 1], o => onlyBand(o, SENSOR, 'alert')),
      },
      {
        hint: (c, outs) => {
          const i = onlyBand(outs[2], SENSOR, 'move') ? 3 : 2;
          return SENSOR.alert.test(outs[i])
            ? `❌ With ${MOD_TESTS.mod3[i][0]} typed, your program printed Proximity alert, but it should still be Movement detected. Python stops at the first True condition, so the new branch must come after the Movement detected one.`
            : `❌ With ${MOD_TESTS.mod3[i][0]} typed, the sensor should still say Movement detected, but ${saidLine(outs[i])}.`;
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

// outputs = what each test in MOD_TESTS[checkKey] printed, in order.
export function evalMod(checkKey, raw, outputs = [], choice) {
  return evalTests(MOD_CHECKS[checkKey], MOD_TESTS[checkKey], raw, outputs, choice);
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
export const MAKE_TESTS = [['350'], ['200'], ['199'], ['100'], ['99'], ['50'], ['49'], ['0']];

// Make is the second Station Zero choice: where the last of the power goes. The student picks
// first, and the last req wants the line for THAT choice, printed on every run (at the end).
export const POWER_CHOICES = { sensors: 'POWER: SENSORS', pods: 'POWER: CRYO PODS' };
const POWER_RE = { sensors: /power[^\w\n]*sensors?\b/i, pods: /power[^\w\n]*(?:cryo\s*)?pods?\b/i };

// A dose band requirement: both test doses print that band's word and no other band's word.
function bandReq(word, key, idx, range) {
  const ok = o => onlyBand(o, DOSE, key);
  return {
    hint: (c, outs) => {
      const i = firstFail(outs, idx, ok);
      return `❌ A dose of ${MAKE_TESTS[i][0]} (${range}) should print a message with the word ${word} in it, and none of the other band words — but ${saidLine(outs[i])}.`;
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

// outputs = what each test in MAKE_TESTS printed; choice = the student's Make choice (POWER_CHOICES key).
export function evalMake(raw, outputs = [], choice) {
  return evalTests(MAKE_CHECK, MAKE_TESTS, raw, outputs, choice);
}

// ── Extension — scanner faults and evacuation ────────────────────────────────
const EXT_BANDS = { ...DOSE, fault: /scanner\s*fault/i, evacuate: /\bevacuate\b/i };
export const EXT_TESTS = [['-5'], ['0'], ['500'], ['900'], ['499']];

export const EXT_CHECK = {
  reqs: [
    {
      hint: (c, outs) => !onlyBand(outs[0], EXT_BANDS, 'fault')
        ? `❌ A dose below 0 is impossible: with -5 typed, the scanner should print SCANNER FAULT (and no band word), but ${saidLine(outs[0])}.`
        : `❌ A dose of 0 should still print SAFE, not SCANNER FAULT — but ${saidLine(outs[1])}. Only doses below 0 are faults.`,
      test: (raw, outs) => onlyBand(outs[0], EXT_BANDS, 'fault') && onlyBand(outs[1], EXT_BANDS, 'safe'),
      show: outs => (onlyBand(outs[0], EXT_BANDS, 'fault') ? 1 : 0),
    },
    {
      hint: (c, outs) => {
        const i = firstFail(outs, [2, 3, 4], (o, k) => onlyBand(o, EXT_BANDS, k === 4 ? 'danger' : 'evacuate'));
        return i === 4
          ? `❌ A dose of 499 should still print DANGER, not EVACUATE — but ${saidLine(outs[4])}.`
          : `❌ A dose of ${EXT_TESTS[i][0]} should print EVACUATE (and no other band word), but ${saidLine(outs[i])}. Think about where this check goes: Python stops at the first True condition.`;
      },
      test: (raw, outs) => onlyBand(outs[2], EXT_BANDS, 'evacuate') && onlyBand(outs[3], EXT_BANDS, 'evacuate') && onlyBand(outs[4], EXT_BANDS, 'danger'),
      show: outs => firstFail(outs, [2, 3, 4], (o, k) => onlyBand(o, EXT_BANDS, k === 4 ? 'danger' : 'evacuate')),
    },
  ],
  passMsg: '🌟 Faults caught and evacuations called — your scanner handles every case. Outstanding!',
};

export function evalExt(raw, outputs = []) {
  return evalTests(EXT_CHECK, EXT_TESTS, raw, outputs);
}
