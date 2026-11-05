// Validation logic for 1_Distress_Signal_PRIMM.html — Y9 Python L4 "Distress Signal" (Station
// Zero, Chapter 4). One new concept: the for loop with range() (count-controlled iteration),
// drawn with turtle.
//
// The beacon program students start from (STARTER_CODE in the HTML), used for Run and
// Investigate:
//   import turtle
//   t = turtle.Turtle()
//   for i in range(4):
//       t.forward(100)
//       t.left(90)
//
// Checks are BEHAVIOUR-BASED: Modify, Make and the extension run the student's program once
// per test and judge what it DREW (the drawing recorded by turtle-canvas.js's turtle module:
// { segs: [[x1, y1, x2, y2, colour, width, step]], … }) and what it printed. So any shape of
// code that draws the right thing passes: left or right turns, any side length, a loop
// variable with any name, extra pen settings.
//
// Each check's tests come from a bank (MOD_TEST_BANK / MAKE_TEST_BANK / EXT_TEST_BANK). A test
// is the list of answers typed into input() for one run; a set is one run per test.

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings can't trigger
// false positives.
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

const liveLines = raw => raw.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');   // commented-out lines don't count
const indentOf  = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const hasLine   = (raw, re) => re.test(normalise(liveLines(raw)));
const forCount  = raw => (normalise(liveLines(raw)).match(/^[ \t]*for\s+\w+\s+in\s+range\s*\(/gm) || []).length;

// Where each answer's echo line is in the output: the runner echoes one "prompt + answer" line
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

// What the program printed itself, with the echoed prompt lines dropped.
export function ownOutput(output, inputs = []) {
  const { lines, at } = echoLines(output, inputs);
  return lines.filter((_, i) => !at.includes(i)).join('\n');
}
export const askedCount = (output, inputs = []) => echoLines(output, inputs).at.length;

// ── Turtle geometry ──────────────────────────────────────────────────────────
// A drawing's lines are grouped into PATHS: lines drawn one after another, each starting where
// the last ended. A path that gets back to where it started is closed, and the next line starts
// a new path (so range(8) with 90° draws two squares). Lines that carry straight on (two
// forward() calls in a row) count as one side.

const EPS = 0.6;   // turtle steps: how close counts as the same point
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS;
const segsOf = d => (d?.segs || []).filter(s => Math.hypot(s[2] - s[0], s[3] - s[1]) > 0.05);
const dirOf = s => Math.atan2(s[3] - s[1], s[2] - s[0]) * 180 / Math.PI;
const turnBetween = (a, b) => ((b - a) % 360 + 540) % 360 - 180;   // −180…180, anticlockwise +
const colourKey = c => String(c || '').trim().toLowerCase().replace(/\s+/g, '');
const RED = new Set(['red', '#ff0000', '#f00']);

export function paths(d) {
  const out = [];
  let cur = null;
  for (const s of segsOf(d)) {
    const a = [s[0], s[1]], b = [s[2], s[3]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), dir = dirOf(s);
    if (!cur || cur.closed || !near(cur.end, a)) { cur = { start: a, end: a, sides: [], closed: false }; out.push(cur); }
    const last = cur.sides[cur.sides.length - 1];
    if (last && Math.abs(turnBetween(last.dir, dir)) < 0.5 && last.c === s[4] && last.w === s[5]) {
      last.len += len; last.end = b;
    } else {
      cur.sides.push({ start: a, end: b, len, dir, c: s[4], w: s[5] });
    }
    cur.end = b;
    if (cur.sides.length >= 2 && near(cur.end, cur.start)) cur.closed = true;
  }
  return out;
}

// A closed path as a regular polygon: n equal sides and n equal turns that add up to one full
// turn (so a five-pointed star isn't a pentagon). null if it isn't one.
export function polygonOf(path) {
  const n = path.sides.length;
  if (!path.closed || n < 3) return null;
  const turns = path.sides.map((sd, i) => turnBetween(sd.dir, path.sides[(i + 1) % n].dir));
  const total = turns.reduce((a, b) => a + b, 0);
  const mean = path.sides.reduce((a, sd) => a + sd.len, 0) / n;
  const regular = turns.every(t => Math.abs(t - turns[0]) < 1)
    && path.sides.every(sd => Math.abs(sd.len - mean) <= Math.max(0.6, mean * 0.015))
    && Math.abs(Math.abs(total) - 360) < 2;
  if (!regular) return null;
  return {
    n, len: mean, turn: Math.abs(turns[0]),
    colours: [...new Set(path.sides.map(sd => colourKey(sd.c)))],
    width: Math.max(...path.sides.map(sd => sd.w)),
  };
}

export const polygonsIn = d => paths(d).map(polygonOf).filter(Boolean);
const polygonWith = (d, n) => polygonsIn(d).find(p => p.n === n) || null;

export const SHAPE_NAMES = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
export const shapeName = n => SHAPE_NAMES[n] || `${n}-sided shape`;
const an = w => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w;

// What a drawing looks like, in a few words, for feedback ("a square", "a straight line").
export function describe(d) {
  const ps = paths(d);
  if (!ps.length) return 'nothing (no lines were drawn)';
  const one = p => {
    const poly = polygonOf(p);
    if (poly) return an(shapeName(poly.n));
    if (p.sides.length === 1) return 'a straight line';
    if (p.closed) return `a ${p.sides.length}-sided shape with uneven sides or turns`;
    return `${p.sides.length} lines that don't join up`;
  };
  const parts = ps.map(one);
  // range(8) with 90°: the same square twice
  const merged = parts.filter((w, i) => parts.indexOf(w) === i)
    .map(w => { const k = parts.filter(x => x === w).length; return k > 1 ? `${w}, ${k} times over` : w; });
  return merged.length > 1 ? merged.slice(0, -1).join(', ') + ' and ' + merged[merged.length - 1] : merged[0];
}

// The Run stage's rounds only need a finished run that drew the beacon.
export const runKind = d => (polygonWith(d, 4) ? 'square' : segsOf(d).length ? 'other' : 'none');

// ── Investigate ──────────────────────────────────────────────────────────────

const FOR_N = n => new RegExp(`^[ \\t]*for\\s+\\w+\\s+in\\s+range\\s*\\(\\s*${n}\\s*\\)\\s*:`, 'm');
const FOR_1_4 = /^[ \t]*for\s+\w+\s+in\s+range\s*\(\s*1\s*,\s*4\s*\)\s*:/m;
const TURN_RE = n => new RegExp(`^[ \\t]+\\w+\\s*\\.\\s*(?:left|lt|right|rt)\\s*\\(\\s*${n}\\s*\\)`, 'm');
const TURN_LINE = /^\s*\w+\s*\.\s*(?:left|lt|right|rt)\s*\(/;
const PRINT_I = /^\s*print\s*\(\s*i\s*\)\s*$/;

// The first for loop: its line, and the lines indented under it (blank lines skipped).
function loopParts(raw) {
  const lines = liveLines(raw).split('\n');
  const at = lines.findIndex(l => /^\s*for\b.*:\s*$/.test(l));
  if (at === -1) return null;
  const head = indentOf(lines[at]);
  const body = [];
  let k = at + 1;
  for (; k < lines.length; k++) {
    if (!lines[k].trim()) continue;
    if (indentOf(lines[k]) <= head) break;
    body.push(lines[k]);
  }
  return { at, head, body, after: lines.slice(k).filter(l => l.trim()) };
}

// The bug step: Break it moves the turn out of the loop, to the left edge underneath it. Python
// runs it happily (no error), but the turtle draws one straight line: a logic error.
export const hasFixedLine = raw => { const p = loopParts(raw); return !!p && p.body.some(l => TURN_LINE.test(l)); };
export const hasBugLine = raw => { const p = loopParts(raw); return !!p && !hasFixedLine(raw) && p.after.some(l => TURN_LINE.test(l) && indentOf(l) === p.head); };
export const isBugFixed = raw => hasFixedLine(raw) && !hasBugLine(raw);
// Nothing is planted for good (the bug is a moved line, not an extra one), so no line is stripped.
export const isBugPairLine = () => false;

// Break it: take the turn line out of the loop and put it, unindented, just after the loop.
export function breakCode(raw) {
  const lines = raw.split('\n');
  const at = lines.findIndex(l => /^\s*for\b.*:\s*$/.test(l));
  if (at === -1) return { code: raw, lineNo: 5 };
  const head = indentOf(lines[at]);
  let end = at + 1;
  while (end < lines.length && (!lines[end].trim() || indentOf(lines[end]) > head)) end++;
  while (end > at + 1 && !lines[end - 1].trim()) end--;   // don't count trailing blank lines as the body
  const turnAt = lines.findIndex((l, i) => i > at && i < end && TURN_LINE.test(l));
  if (turnAt === -1) return { code: raw, lineNo: Math.min(end + 1, lines.length) };
  const turn = lines[turnAt].trim();
  const out = lines.filter((_, i) => i !== turnAt);
  const insertAt = end - 1;   // after the body, now one line shorter
  out.splice(insertAt, 0, ' '.repeat(head) + turn);
  return { code: out.join('\n'), lineNo: insertAt + 1 };
}

const ranThis = (raw, ctx) => !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();
const RUN_HINT = (again, first) => (raw, ctx) => (ranThis(raw, ctx) ? again : first);

// Investigate starts from the beacon program and each step builds on the last:
//   1 range(4) → range(8)    2 range(3) and a 120° turn    3 print(i) in the loop, range(1, 4)
//   4 the bug step (the turn moved out of the loop)
export const INV_CHECKS = {
  inv1: {
    reqs: [
      { test: raw => hasLine(raw, FOR_N(8)), hint: 'On line 3, change range(4) to range(8)' },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: 'Press ▶ Run code and watch the turtle.' },
    ],
  },
  inv2: {
    reqs: [
      { test: raw => hasLine(raw, FOR_N(3)), hint: 'On line 3, change range(8) to range(3)' },
      { test: raw => hasLine(raw, TURN_RE(120)), hint: 'On line 5, change the turn from 90 to 120, so it reads t.left(120)',
        wrong: raw => hasLine(raw, /^[ \t]*\w+\s*\.\s*(?:left|lt|right|rt)\s*\(/m) && !hasLine(raw, TURN_RE(120)) && !hasLine(raw, TURN_RE(90)) },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: RUN_HINT('Press ▶ Run code again: the code has changed since you last ran it.', 'Press ▶ Run code and count the sides.') },
    ],
  },
  inv3: {
    reqs: [
      { test: raw => { const p = loopParts(raw); return !!p && p.body.some(l => PRINT_I.test(l)) && indentOf(p.body.find(l => PRINT_I.test(l))) === indentOf(p.body[0]); },
        hint: 'Add print(i) as the last line of the loop, indented the same as the lines above it.',
        wrong: raw => { const p = loopParts(raw); return !!p && !p.body.some(l => PRINT_I.test(l)) && liveLines(raw).split('\n').some(l => PRINT_I.test(l)); } },
      { test: raw => hasLine(raw, FOR_1_4), hint: 'On line 3, change range(3) to range(1, 4)' },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: RUN_HINT('Press ▶ Run code again: the code has changed since you last ran it.', 'Press ▶ Run code and read the numbers it prints.') },
    ],
  },
  inv4: {
    reqs: [
      { test: (raw, ctx) => ctx.breaks > 0, hint: 'Press 😈 Break it first.' },
      { test: (raw, ctx) => !!ctx.ranBroken, hint: 'Run the broken program and look at what the turtle draws. There is no error message.' },
      { test: (raw, ctx) => ctx.fixes > 0 || (ctx.breaks > 0 && isBugFixed(raw) && ranThis(raw, ctx)),
        hint: raw => hasFixedLine(raw)
          ? 'Now press ▶ Run code to check the signal is a triangle again.'
          : 'Put the turn line back inside the loop: indent it under t.forward(100), then press ▶ Run code.' },
    ],
  },
};

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
// Modify starts from the beacon program again. Every check runs the program once per test, and
// each run = { output, drawing }.

// Modification 1 is a Station Zero choice: the signal the beacon sends. Both are a regular
// polygon with more sides than the square, so both need the same 360 ÷ sides reasoning.
export const SIGNALS = { mayday: { sides: 6, turn: 60 }, quarantine: { sides: 8, turn: 45 } };
const sidesFor = choice => (SIGNALS[choice] || SIGNALS.quarantine).sides;

export const MOD_TEST_BANK = {
  mod1: [[[]]],
  mod2: [[[]]],
  mod3: [[[]]],
  // mod4: two runs, each typing a number of sides. 3 (the fewest) is in most sets; none is 5,
  // 6 or 8, so the new shape can't be mistaken for the signals drawn above it.
  mod4: [[['7'], ['3']], [['9'], ['4']], [['10'], ['3']], [['12'], ['7']], [['3'], ['9']], [['4'], ['10']], [['3'], ['12']]],
};
export const MOD_TESTS = Object.fromEntries(Object.entries(MOD_TEST_BANK).map(([k, bank]) => [k, bank[0]]));

const allSides = d => paths(d).reduce((a, p) => a + p.sides.length, 0);
const say = t => t.join(', then ');

export const MOD_CHECKS = {
  // The chosen signal: a regular hexagon (MAYDAY) or octagon (QUARANTINE), and nothing else.
  mod1: {
    reqs: [
      (runs, raw, choice) => !!polygonWith(runs[0].drawing, sidesFor(choice)),
      (runs, raw, choice) => !!polygonWith(runs[0].drawing, sidesFor(choice)) && allSides(runs[0].drawing) === sidesFor(choice),
    ],
    msgs: [
      (runs, raw, choice) => {
        const n = sidesFor(choice);
        return `Your beacon drew ${describe(runs[0].drawing)}. ${an(shapeName(n))[0].toUpperCase() + an(shapeName(n)).slice(1)} has ${n} sides: range(${n}), and each turn is 360 ÷ ${n} = ${360 / n}`;
      },
      (runs, raw, choice) => `Your ${shapeName(sidesFor(choice))} is there, but the turtle kept going and drew more lines over it. The loop should run exactly ${sidesFor(choice)} times: range(${sidesFor(choice)})`,
    ],
    pass: (runs, raw, choice) => `✅ Signal ready: ${an(shapeName(sidesFor(choice)))}, ${sidesFor(choice)} sides with a ${360 / sidesFor(choice)}° turn after each.`,
  },
  // Colour and pen size (code given): the signal in red, 3 wide.
  mod2: {
    reqs: [
      (runs, raw, choice) => { const p = polygonWith(runs[0].drawing, sidesFor(choice)); return !!p && p.colours.every(c => RED.has(c)); },
      (runs, raw, choice) => { const p = polygonWith(runs[0].drawing, sidesFor(choice)); return !!p && p.width >= 3; },
      (runs, raw, choice) => !!polygonWith(runs[0].drawing, sidesFor(choice)),
    ],
    msgs: [
      (runs, raw, choice) => polygonWith(runs[0].drawing, sidesFor(choice))
        ? 'The signal isn\'t red yet. Put t.pencolor("red") before the for line, so it\'s set before anything is drawn.'
        : `Your ${shapeName(sidesFor(choice))} has gone: the turtle drew ${describe(runs[0].drawing)}. Keep the loop from Modification 1.`,
      () => 'The line is still thin. Add t.pensize(3) before the for line too.',
      (runs, raw, choice) => `Your ${shapeName(sidesFor(choice))} has gone: the turtle drew ${describe(runs[0].drawing)}. Keep the loop from Modification 1.`,
    ],
    pass: () => '✅ The signal is red and three times as thick. It will show up from much further away.',
  },
  // A pentagon too, with its own loop at the bottom (no code given).
  mod3: {
    reqs: [
      (runs, raw, choice) => !!polygonWith(runs[0].drawing, sidesFor(choice)),
      (runs) => !!polygonWith(runs[0].drawing, 5),
      (runs, raw) => forCount(raw) >= 2,
    ],
    msgs: [
      (runs, raw, choice) => `Keep your ${shapeName(sidesFor(choice))}: the turtle drew ${describe(runs[0].drawing)}. Add the pentagon underneath it, at the bottom.`,
      (runs) => `The turtle drew ${describe(runs[0].drawing)}, with no regular pentagon. A pentagon has 5 sides: how many times should the loop run, and what is 360 ÷ 5?`,
      () => 'Draw the pentagon with its own for loop at the bottom, not five forward() lines.',
    ],
    pass: () => '✅ Two signals now: the second loop drew a pentagon after the first had finished.',
  },
  // The number of sides comes from input() (no code given): tested with two numbers.
  mod4: {
    reqs: [
      (runs, raw) => hasLine(raw, /\bint\s*\(\s*input\s*\(/) && runs.every((r, i) => askedCount(r.output, r.inputs) >= 1),
      (runs) => runs.every(r => !!polygonWith(r.drawing, Number(r.inputs[0]))),
      (runs, raw, choice) => runs.every(r => !!polygonWith(r.drawing, sidesFor(choice)) && !!polygonWith(r.drawing, 5)),
    ],
    msgs: [
      (runs, raw) => hasLine(raw, /\binput\s*\(/)
        ? 'Turn the answer into a whole number: put int() round input(), e.g. sides = int(input("How many sides? "))'
        : 'At the bottom, ask how many sides with input(), and turn the answer into a whole number with int()',
      (runs) => {
        const r = runs.find(x => !polygonWith(x.drawing, Number(x.inputs[0])));
        return `With ${r.inputs[0]} typed, the turtle drew ${describe(r.drawing)}, with no regular ${shapeName(Number(r.inputs[0]))}. Use your variable in range(), and turn 360 / it each time.`;
      },
      (runs, raw, choice) => `Keep your ${shapeName(sidesFor(choice))} and your pentagon: add the new shape below them.`,
    ],
    pass: (runs) => `✅ The beacon draws any signal now: ${runs.map(r => `${r.inputs[0]} sides`).join(' and ')} both worked.`,
  },
};

// Which run the editor should step through: the first one the first failing requirement fails on.
function evalTests(check, raw, runs, choice) {
  const results = check.reqs.map(test => !!test(runs, raw, choice));
  const bad = results.findIndex(r => !r);
  if (bad === -1) return { results, pass: true, msg: check.pass(runs, raw, choice), show: 0 };
  const show = Math.max(0, runs.findIndex(r => !check.reqs[bad]([r], raw, choice)));
  return { results, pass: false, msg: '❌ ' + check.msgs[bad](runs, raw, choice), show };
}

// runs: [{ output, drawing }], one per test, in order; tests: the answers typed in each.
const withInputs = (runs, tests) => runs.map((r, i) => ({ output: r.output || '', drawing: r.drawing || {}, inputs: (tests && tests[i]) || [] }));

export function evalMod(checkKey, raw, runs = [], choice, tests = MOD_TESTS[checkKey]) {
  const check = MOD_CHECKS[checkKey];
  if (!check) return { results: [], pass: false, msg: '', show: 0 };
  return evalTests(check, raw, withInputs(runs, tests), choice);
}

// ── Make: the flare ───────────────────────────────────────────────────────────
// Asks for a colour, then draws a regular shape in it. Two runs per check, each typing a
// colour; one set types it with a capital letter (turtle doesn't mind).
export const MAKE_TEST_BANK = [
  [['red'], ['green']], [['orange'], ['blue']], [['Yellow'], ['purple']], [['magenta'], ['cyan']],
  [['white'], ['orange']], [['pink'], ['gold']], [['blue'], ['Red']],
];
export const MAKE_TESTS = MAKE_TEST_BANK[0];

// The Make's "Your call" line (Station Zero choice 2): one fixed print at the end.
export const FLARE_CHOICES = { warning: 'FLARE: BIOHAZARD', medical: 'FLARE: MEDICAL' };
const FLARE_RE = { warning: /^\s*flare\W*biohazard\s*$/im, medical: /^\s*flare\W*medical\s*$/im };

const inColour = (d, c) => segsOf(d).length > 0 && segsOf(d).every(s => colourKey(s[4]) === colourKey(c));

export const MAKE_CHECK = {
  reqs: [
    (runs, raw) => hasLine(raw, /\binput\s*\(/) && runs.every(r => askedCount(r.output, r.inputs) >= 1),
    (runs) => runs.every(r => inColour(r.drawing, r.inputs[0])),
    (runs, raw) => forCount(raw) >= 1,
    (runs) => runs.every(r => polygonsIn(r.drawing).length > 0),
    (runs, raw, choice) => !!FLARE_RE[choice] && runs.every(r => FLARE_RE[choice].test(ownOutput(r.output, r.inputs))),
  ],
  msgs: [
    () => 'Ask for the flare colour with input(), and store the answer in a variable.',
    (runs) => {
      const r = runs.find(x => !inColour(x.drawing, x.inputs[0]));
      return segsOf(r.drawing).length
        ? `With ${r.inputs[0]} typed, the flare wasn't drawn in ${r.inputs[0]}. Give the colour to t.pencolor() before the loop.`
        : `With ${r.inputs[0]} typed, nothing was drawn. Draw the flare with a for loop.`;
    },
    () => 'Draw the flare with a for loop: for i in range(…):',
    (runs) => `The turtle drew ${describe(runs.find(r => !polygonsIn(r.drawing).length).drawing)}. The flare must be a regular shape that joins up: the turn is 360 ÷ the number of sides.`,
    (runs, raw, choice) => FLARE_CHOICES[choice]
      ? `Add the line for your call at the very end, not indented: print("${FLARE_CHOICES[choice]}")`
      : 'Make your call above first.',
  ],
  pass: () => '✅ Flare program works: it drew the flare in whatever colour was typed.',
};

export function evalMake(raw, runs = [], choice, tests = MAKE_TESTS) {
  return evalTests(MAKE_CHECK, raw, withInputs(runs, tests), choice);
}

// ── Extension: a growing burst ────────────────────────────────────────────────
export const EXT_TEST_BANK = [[['red']], [['orange']], [['cyan']], [['gold']], [['Magenta']], [['green']]];
export const EXT_TESTS = EXT_TEST_BANK[0];

// The longest path, and whether each of its sides is longer than the one before.
const longest = d => paths(d).reduce((a, p) => (p.sides.length > (a?.sides.length || 0) ? p : a), null);
const growing = p => !!p && p.sides.length >= 36 && p.sides.every((sd, i) => i === 0 || sd.len > p.sides[i - 1].len + 0.05);

export const EXT_CHECK = {
  reqs: [
    (runs) => runs.every(r => (longest(r.drawing)?.sides.length || 0) >= 36),
    (runs) => runs.every(r => growing(paths(r.drawing).find(p => p.sides.length >= 36))),
    (runs) => runs.every(r => inColour(r.drawing, r.inputs[0])),
  ],
  msgs: [
    (runs) => `The longest run of joined-up lines has ${longest(runs[0].drawing)?.sides.length || 0} lines. Make the loop repeat at least 36 times, turning each time.`,
    () => 'Each line must be longer than the one before: make the distance grow with i, e.g. t.forward(i + 5)',
    (runs) => `Keep drawing in the colour typed (${runs[0].inputs[0]}).`,
  ],
  pass: () => '✅ The burst grows line by line: brighter and bigger with every pass of the loop.',
};

export function evalExt(raw, runs = [], tests = EXT_TESTS) {
  return evalTests(EXT_CHECK, raw, withInputs(runs, tests), undefined);
}
