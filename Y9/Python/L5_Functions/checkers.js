// Validation logic for 1_The_Drone_PRIMM.html — Y9 Python L5 "The Drone" (Station Zero,
// Chapter 5). One new concept: functions (procedures). def DEFINES a named block but doesn't run
// it; a call runs it; a function can be called many times.
//
// The drone program students start from (STARTER_CODE in the HTML), used for Run and Investigate:
//   def drone_status():
//       print("DRONE ONLINE")
//       print("Battery: 100%")
//
//   drone_status()
//
// Checks are BEHAVIOUR-BASED where they can be: Modify, Make and the extensions run the student's
// program once per test and judge what it printed (and, for the turtle tasks, what it drew: the
// drawing recorded by turtle-canvas.js's turtle module). Function names and print wording are
// the student's own: the checks look for a def, its calls and what they printed.
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

// The code's lines with comment-only lines blanked (so line numbers still match the editor).
const codeLines = raw => String(raw || '').replace(/\r/g, '').split('\n').map(l => (/^\s*#/.test(l) ? '' : l));
const indentOf  = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const hasLine   = (raw, re) => re.test(normalise(codeLines(raw).join('\n')));

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

// The printed lines after each answer, up to the next answer: segments[k] belongs to inputs[k].
// Blank lines are dropped. drop = a line to leave out (the Make's "Your call" line).
export function segments(output, inputs = [], drop = null) {
  const { lines, at } = echoLines(output, inputs);
  return at.map((start, k) => lines.slice(start + 1, k + 1 < at.length ? at[k + 1] : lines.length)
    .filter(l => l.trim() && !(drop && drop.test(l))));
}
// The printed lines before the first question.
const beforeAsk = (output, inputs = []) => {
  const { lines, at } = echoLines(output, inputs);
  return lines.slice(0, at.length ? at[0] : lines.length).filter(l => l.trim());
};

// ── Program structure: defs and calls ────────────────────────────────────────
// A def at the left edge: { name, params, at (0-based line), body (its indented lines) }.
const DEF_RE  = /^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*(#.*)?$/;
// A line that is just a call: name(args)
const CALL_RE = /^(\s*)([A-Za-z_]\w*)\s*\(([^()]*)\)\s*(#.*)?$/;
const BUILTINS = new Set(['print', 'input', 'int', 'str', 'float', 'len', 'range', 'exit', 'quit']);

export function defsIn(raw) {
  const lines = codeLines(raw);
  const out = [];
  lines.forEach((line, i) => {
    const m = DEF_RE.exec(line);
    if (!m) return;
    const body = [];
    for (let k = i + 1; k < lines.length; k++) {
      if (!lines[k].trim()) continue;
      if (indentOf(lines[k]) === 0) break;
      body.push(lines[k]);
    }
    out.push({ name: m[1], params: m[2].split(',').map(p => p.trim()).filter(Boolean), at: i, body });
  });
  return out;
}

// Every line that is a call to a function (not a built-in): { name, args, at, indent, inDef }.
// inDef = the name of the def it sits inside, or null (top level, which includes inside an if
// or a loop that isn't in a def).
export function callsIn(raw) {
  const lines = codeLines(raw);
  const out = [];
  let def = null;
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const ind = indentOf(line);
    const d = DEF_RE.exec(line);
    if (d) { def = d[1]; return; }
    if (ind === 0) def = null;
    const m = CALL_RE.exec(line);
    if (!m || BUILTINS.has(m[2])) return;
    out.push({ name: m[2], args: m[3].split(',').map(a => a.trim()).filter(Boolean), at: i, indent: ind, inDef: def });
  });
  return out;
}

const defOf = (raw, name) => defsIn(raw).find(d => d.name === name) || null;
// Top-level calls to `name` (not inside any def), below its def.
const callsAfterDef = (raw, name) => {
  const d = defOf(raw, name);
  return d ? callsIn(raw).filter(c => c.name === name && !c.inDef && c.at > d.at) : [];
};
export const calledAfterDef = (raw, name) => callsAfterDef(raw, name).length > 0;
const printsIn = d => d.body.filter(l => /^\s*print\s*\(/.test(l)).length;
// Finished print lines only: brackets closed and quotes paired, so a half-typed `print("` doesn't
// tick a live Investigate bullet early (and the pinned card then hide it).
const evenQuotes = t => (t.match(/"/g) || []).length % 2 === 0 && (t.match(/'/g) || []).length % 2 === 0;
const donePrintsIn = d => d.body.filter(l => /^\s*print\s*\(.*\)\s*$/.test(l) && evenQuotes(l)).length;
// The text of each print("…") in a def's body (simple string literals only).
const literalsIn = d => d.body.map(l => /^\s*print\s*\(\s*(["'])(.*)\1\s*\)\s*$/.exec(l)).filter(Boolean).map(m => m[2]);
const outLines = output => String(output || '').split('\n').map(l => l.trimEnd()).filter(l => l.trim());
const countLine = (output, text) => outLines(output).filter(l => l === text).length;

// A call at the left edge to a function that is only defined further down: Python hasn't read
// the def yet, so it's a NameError.
export function callBeforeDef(raw) {
  const defs = defsIn(raw);
  return callsIn(raw).find(c => c.indent === 0 && defs.some(d => d.name === c.name && d.at > c.at)) || null;
}

// ── Run ──────────────────────────────────────────────────────────────────────
// The Run stage's rounds only need a finished run that printed the drone's status.
export const runKind = output => (/DRONE ONLINE/.test(output || '') && /Battery/i.test(output || '') ? 'status' : 'other');

// ── Investigate ──────────────────────────────────────────────────────────────

// The bug step's function: the newest one defined (drone_dock, from step 3).
const bugTarget = raw => { const ds = defsIn(raw); return ds.length ? ds[ds.length - 1].name : 'drone_dock'; };

// The bug step: Break it puts a call to the newest function on line 1, above every def. Python
// meets the call before it has read the def: NameError. The fix moves the call below the def.
// What the bug step's text names: the student's own command (step 3 takes any name, e.g. alarm)
// and the first message it prints (null if it has no plain print("…")).
export function bugCommand(raw) {
  const name = bugTarget(raw);
  const d = defOf(raw, name);
  return { name, says: (d && literalsIn(d)[0]) || null };
}
export const hasBugLine = raw => !!callBeforeDef(raw);
export const hasFixedLine = raw => calledAfterDef(raw, bugTarget(raw));
export const isBugFixed = raw => hasFixedLine(raw) && !hasBugLine(raw);
// Nothing is planted for good (the fix keeps the moved call), so no line is stripped.
export const isBugPairLine = () => false;

export function breakCode(raw) {
  const bad = callBeforeDef(raw);
  if (bad) return { code: raw, lineNo: bad.at + 1 };   // already broken: safe to mash
  const name = bugTarget(raw);
  return { code: `${name}()\n` + raw, lineNo: 1 };
}

const ranThis = (raw, ctx) => !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();
const RUN_HINT = (again, first) => (raw, ctx) => (ranThis(raw, ctx) ? again : first);
const STARTER_NAMES = new Set(['drone_status', 'scout_ducts', 'guard_cryo']);
const newDefs = raw => defsIn(raw).filter(d => !STARTER_NAMES.has(d.name));

// Investigate starts from the drone program and each step builds on the last:
//   1 a second drone_status() call    2 a third print inside the function
//   3 a new function, defined but not called    4 the bug step (a call above its def)
export const INV_CHECKS = {
  inv1: {
    reqs: [
      { test: raw => callsAfterDef(raw, 'drone_status').filter(c => c.indent === 0).length >= 2,
        hint: 'At the bottom, add a second drone_status() call, at the left edge under the first one.',
        wrong: raw => callsIn(raw).some(c => c.name === 'drone_status' && c.inDef === 'drone_status') },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: 'Press ▶ Run code and read the output.' },
    ],
  },
  inv2: {
    reqs: [
      { test: raw => { const d = defOf(raw, 'drone_status'); return !!d && donePrintsIn(d) >= 3; },
        hint: 'Add print("Camera: ready") as the last line inside drone_status(), indented like the two prints above it.',
        wrong: raw => { const d = defOf(raw, 'drone_status'); return !!d && printsIn(d) < 3 && codeLines(raw).some((l, i) => i > d.at && /^print\s*\(/.test(l)); } },
      { test: raw => callsAfterDef(raw, 'drone_status').filter(c => c.indent === 0).length >= 2,
        hint: 'Keep both drone_status() calls at the bottom.' },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: RUN_HINT('Press ▶ Run code again: the code has changed since you last ran it.', 'Press ▶ Run code and count the lines it prints.') },
    ],
  },
  inv3: {
    reqs: [
      { test: raw => { const n = newDefs(raw); return n.some(d => donePrintsIn(d) >= 1) && !n.some(d => callsIn(raw).some(c => c.name === d.name)); },
        hint: 'At the bottom, add def drone_dock(): with print("DOCKING") indented under it. Don\'t call it.',
        wrong: raw => newDefs(raw).some(d => callsIn(raw).some(c => c.name === d.name)) },
      { test: (raw, ctx) => ranThis(raw, ctx), hint: RUN_HINT('Press ▶ Run code again: the code has changed since you last ran it.', 'Press ▶ Run code. Look for DOCKING in the output.') },
    ],
  },
  inv4: {
    reqs: [
      { test: (raw, ctx) => ctx.breaks > 0, hint: 'Press 😈 Break it first.' },
      { test: (raw, ctx) => !!ctx.ranBroken, hint: 'Run the broken program and read the red error message.' },
      { test: (raw, ctx) => ctx.fixes > 0 || (ctx.breaks > 0 && isBugFixed(raw) && ranThis(raw, ctx)),
        hint: raw => (isBugFixed(raw)
          ? `Now press ▶ Run code to check ${bugCommand(raw).says || 'its message'} prints at the end.`
          : `Move the ${bugTarget(raw)}() call from line 1 to the very bottom, below its def, then press ▶ Run code.`) },
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

// ── Turtle geometry (Modification 4 and the parameters bonus) ────────────────
// Copied from L4 (Distress Signal). A drawing's lines are grouped into PATHS: lines drawn one
// after another, each starting where the last ended. A path that gets back to where it started
// is closed, and the next line starts a new path.

const EPS = 0.6;
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS;
const segsOf = d => (d?.segs || []).filter(s => Math.hypot(s[2] - s[0], s[3] - s[1]) > 0.05);
const dirOf = s => Math.atan2(s[3] - s[1], s[2] - s[0]) * 180 / Math.PI;
const turnBetween = (a, b) => ((b - a) % 360 + 540) % 360 - 180;

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

// A closed path as a regular polygon (n equal sides and turns adding up to one full turn), with
// its centre; null if it isn't one.
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
  const cx = path.sides.reduce((a, sd) => a + sd.start[0], 0) / n;
  const cy = path.sides.reduce((a, sd) => a + sd.start[1], 0) / n;
  return { n, len: mean, turn: Math.abs(turns[0]), centre: [cx, cy] };
}

export const polygonsIn = d => paths(d).map(polygonOf).filter(Boolean);

export const SHAPE_NAMES = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
export const shapeName = n => SHAPE_NAMES[n] || `${n}-sided shape`;
const an = w => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w;

// What a drawing looks like, in a few words, for feedback ("3 squares in one place").
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
  const merged = parts.filter((w, i) => parts.indexOf(w) === i)
    .map(w => { const k = parts.filter(x => x === w).length; return k > 1 ? `${w}, ${k} times over` : w; });
  return merged.length > 1 ? merged.slice(0, -1).join(', ') + ' and ' + merged[merged.length - 1] : merged[0];
}

// How many of the drawing's n-sided shapes are in different places (centres 5+ steps apart).
export function placesOf(d, n) {
  const centres = [];
  for (const p of polygonsIn(d).filter(q => q.n === n)) {
    if (!centres.some(c => Math.hypot(c[0] - p.centre[0], c[1] - p.centre[1]) < 5)) centres.push(p.centre);
  }
  return centres.length;
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from MODIFY_STARTER: Investigate's program, drone_status() and drone_dock(), both
// called. As in Y8's functions lesson, the steps mostly CHANGE that code rather than add to it,
// so it stays at three short functions (2026-11-17):
//   1 rename drone_status to the chosen job (def and call)   2 change both its messages
//   3 call the job a second time, before docking             4 a beep() command with a loop
//     inside, called inside drone_dock()
// Every check runs the program once per test; each run = { output, drawing }.

// Modification 1 is a Station Zero choice: the drone's one job, which becomes the command's name.
export const JOBS = { scout: 'scout_ducts', guard: 'guard_cryo' };
// What the job command could print (Modification 2): a suggestion; any new messages pass.
export const JOB_LINES = {
  scout: ['Drone: into the ducts', 'Camera: recording'],
  guard: ['Drone: to the Cryo Bay', 'Guard mode: on'],
};
const ORIGINAL_LINES = ['DRONE ONLINE', 'Battery: 100%'];
const jobFor = choice => JOBS[choice] || JOBS.guard;
const otherJob = choice => (jobFor(choice) === JOBS.scout ? JOBS.guard : JOBS.scout);
const linesFor = choice => JOB_LINES[choice] || JOB_LINES.guard;
const DOCK = 'drone_dock';

const jobDef = (raw, choice) => defOf(raw, jobFor(choice));
// drone_dock() is still defined and called, and DOCKING is the last line printed.
const docksLast = (run, raw) => !!defOf(raw, DOCK) && calledAfterDef(raw, DOCK)
  && outLines(run.output).at(-1) === 'DOCKING';
// How many times the job's first line printed.
const jobRuns = (run, raw, choice) => {
  const d = jobDef(raw, choice);
  const lits = d ? literalsIn(d) : [];
  return lits.length ? countLine(run.output, lits[0]) : 0;
};
// A command with a for loop inside it, and a print inside that loop.
const loopDef = d => d.body.some(l => /^\s+for\b.*:\s*$/.test(l)) && d.body.some(l => /^\s+print\s*\(/.test(l));
const loopDefs = (raw, choice) => defsIn(raw).filter(d => d.name !== DOCK && d.name !== jobFor(choice) && loopDef(d));
const calledInDock = (raw, name) => callsIn(raw).some(c => c.name === name && c.inDef === DOCK);

export const MOD_TEST_BANK = { mod1: [[[]]], mod2: [[[]]], mod3: [[[]]], mod4: [[[]]] };
export const MOD_TESTS = Object.fromEntries(Object.entries(MOD_TEST_BANK).map(([k, bank]) => [k, bank[0]]));

export const MOD_CHECKS = {
  // Rename drone_status to the job, in the def and the call (Y8's "rename").
  mod1: {
    reqs: [
      (runs, raw, choice) => !!jobDef(raw, choice) && !defOf(raw, 'drone_status'),
      (runs, raw, choice) => runs[0].ok !== false && calledAfterDef(raw, jobFor(choice))
        && !callsIn(raw).some(c => c.name === 'drone_status'),
      (runs, raw) => docksLast(runs[0], raw),
    ],
    msgs: [
      (runs, raw, choice) => (defOf(raw, otherJob(choice))
        ? `You picked ${jobFor(choice)}, but the def says ${otherJob(choice)}. Rename it to ${jobFor(choice)}.`
        : `Rename the def on line 1: change drone_status to ${jobFor(choice)}, so it reads def ${jobFor(choice)}():`),
      (runs, raw, choice) => (callsIn(raw).some(c => c.name === 'drone_status')
        ? `The call at the bottom still says drone_status(), and that name doesn't exist any more (a NameError). Change it to ${jobFor(choice)}() too.`
        : `Call it at the bottom, at the left edge: ${jobFor(choice)}()`),
      () => 'Leave drone_dock() as it is: DOCKING should still print last.',
    ],
    pass: (runs, raw, choice) => `✅ Renamed: the def and the call both say ${jobFor(choice)}, so Python finds it. A call has to use exactly the name in the def.`,
  },
  // Change both messages inside the job command (Y8's "change the messages").
  mod2: {
    reqs: [0, 1].map(k => (runs, raw, choice) => {
      const d = jobDef(raw, choice);
      const lits = d ? literalsIn(d) : [];
      return lits.length > k && lits[k] !== ORIGINAL_LINES[k] && outLines(runs[0].output).includes(lits[k]);
    }).concat([(runs, raw) => docksLast(runs[0], raw)]),
    msgs: [
      (runs, raw, choice) => `Change the first message inside ${jobFor(choice)}(), "DRONE ONLINE", to say what the drone does, e.g. "${linesFor(choice)[0]}"`,
      (runs, raw, choice) => `Change the second message, "Battery: 100%", too, e.g. "${linesFor(choice)[1]}"`,
      () => 'Leave drone_dock() as it is: DOCKING should still print last.',
    ],
    pass: () => '✅ New messages, same call: the call didn\'t change, but what it runs did. Change a def once, and every call uses the new version.',
  },
  // Call the job a second time, before docking (a function can be called many times).
  mod3: {
    reqs: [
      (runs, raw, choice) => callsAfterDef(raw, jobFor(choice)).length >= 2 && jobRuns(runs[0], raw, choice) >= 2,
      (runs, raw) => docksLast(runs[0], raw),
    ],
    msgs: [
      (runs, raw, choice) => (callsIn(raw).some(c => c.name === jobFor(choice) && c.inDef)
        ? `A ${jobFor(choice)}() call is indented, so it sits inside a function. Put both calls at the left edge, at the bottom.`
        : `Add a second ${jobFor(choice)}() call at the bottom, at the left edge, so the drone does its job twice.`),
      () => 'DOCKING should still print last: put the second call above drone_dock().',
    ],
    pass: () => '✅ One def, two calls: the same lines ran twice. Define it once, call it as often as you like.',
  },
  // beep(): a for loop inside a function, called inside drone_dock() (one command calling another).
  mod4: {
    reqs: [
      (runs, raw, choice) => loopDefs(raw, choice).length > 0,
      (runs, raw, choice) => loopDefs(raw, choice).some(d => {
        const lits = literalsIn(d);
        return calledInDock(raw, d.name) && lits.length > 0 && countLine(runs[0].output, lits[0]) >= 3;
      }),
      (runs, raw, choice) => jobRuns(runs[0], raw, choice) >= 2 && docksLast(runs[0], raw),
    ],
    msgs: [
      (runs, raw) => (hasLine(raw, /^for\b/m)
        ? 'Your for loop is at the left edge, so it isn\'t inside the function. Indent the for line 4 spaces under def beep():, and its print 8 spaces.'
        : 'Above def drone_dock():, define beep(): with a for loop indented inside it, and a print indented under the for.'),
      (runs, raw, choice) => {
        const ds = loopDefs(raw, choice);
        if (ds.some(d => calledInDock(raw, d.name))) return 'BEEP should print 3 times every time the drone docks: the loop needs range(3).';
        if (ds.some(d => callsIn(raw).some(c => c.name === d.name && !c.inDef))) return 'beep() is called at the left edge, so it isn\'t part of docking. Move the call inside drone_dock(): indented 4 spaces, above print("DOCKING").';
        return 'Now call it inside drone_dock(): add beep() indented 4 spaces, above print("DOCKING").';
      },
      (runs, raw, choice) => `Keep the calls from before: ${jobFor(choice)}() twice, then drone_dock() last.`,
    ],
    pass: () => '✅ The drone beeps 3 times, then docks. One command can call another, and a loop inside a command runs in full every time it\'s called.',
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

// runs: [{ output, drawing, ok }], one per test, in order; tests: the answers typed in each.
const withInputs = (runs, tests) => runs.map((r, i) => ({ output: r.output || '', drawing: r.drawing || {}, ok: r.ok, inputs: (tests && tests[i]) || [] }));

export function evalMod(checkKey, raw, runs = [], choice, tests = MOD_TESTS[checkKey]) {
  const check = MOD_CHECKS[checkKey];
  if (!check) return { results: [], pass: false, msg: '', show: 0 };
  return evalTests(check, raw, withInputs(runs, tests), choice);
}

// ── Make: the cryo-pod lookup ─────────────────────────────────────────────────
// A menu function, a function for each of pods 1, 3 and 5, a question, and if / elif / else
// calling the right function. Four runs per check: pods 1, 3 and 5 in some order, and a pod that
// doesn't exist (never 0, which quits in the extension, and never 2 or 4, which a student may
// have added for Hale or for themselves).
export const VALID_PODS = ['1', '3', '5'];
export const MAKE_TEST_BANK = [
  [['1'], ['3'], ['5'], ['8']], [['5'], ['3'], ['1'], ['7']], [['3'], ['1'], ['5'], ['9']],
  [['1'], ['5'], ['3'], ['6']], [['5'], ['1'], ['3'], ['12']], [['3'], ['5'], ['1'], ['10']],
];
export const MAKE_TESTS = MAKE_TEST_BANK[0];

// The Make's "Your call" line (Station Zero choice 2): one fixed print at the end.
// The key stays pod1 (the stored choice), but the line names the med kit: an awake Okafor isn't in Pod 1.
export const PRIORITY_CHOICES = { pod1: 'PRIORITY: MED KIT', camera: 'PRIORITY: CAMERA' };
const PRIORITY_RE = { pod1: /^\s*priority\W*med\s*kit\s*$/im, camera: /^\s*priority\W*camera\s*$/im };
const ANY_PRIORITY = /^\s*priority\W/i;

const afterAsk = r => (segments(r.output, r.inputs, ANY_PRIORITY)[0] || []).join('\n');
const isValid = r => VALID_PODS.includes(String(r.inputs[0]));
const inputAt = raw => codeLines(raw).findIndex(l => /\binput\s*\(/.test(l));

export const MAKE_CHECK = {
  reqs: [
    // 1 a menu function, called before the question, that prints something
    (runs, raw) => {
      const at = inputAt(raw), defs = defsIn(raw);
      return at !== -1 && callsIn(raw).some(c => !c.inDef && c.at < at && defs.some(d => d.name === c.name && d.at < c.at))
        && runs.every(r => beforeAsk(r.output, r.inputs).length > 0);
    },
    // 2 the menu plus one function for each of pods 1, 3 and 5
    (runs, raw) => defsIn(raw).filter(d => printsIn(d) >= 1).length >= 4,
    // 3 asks which pod with input()
    (runs, raw) => hasLine(raw, /\binput\s*\(/) && runs.every(r => askedCount(r.output, r.inputs) >= 1),
    // 4 if / elif / else, with a function called inside the branches
    (runs, raw) => hasLine(raw, /^\s*if\b/m) && hasLine(raw, /^\s*elif\b/m) && hasLine(raw, /^\s*else\s*:/m)
      && callsIn(raw).filter(c => c.indent > 0 && c.name !== c.inDef && defsIn(raw).some(d => d.name === c.name)).length >= 3,
    // 5 pods 1, 3 and 5 each print something, and something different
    (runs) => {
      const outs = runs.filter(isValid).map(afterAsk);
      return outs.every(o => o.trim()) && new Set(outs).size === outs.length;
    },
    // 6 any other number prints a message of its own
    (runs) => {
      const valid = runs.filter(isValid).map(afterAsk);
      return runs.filter(r => !isValid(r)).every(r => { const o = afterAsk(r); return o.trim() && !valid.includes(o); });
    },
    // 7 the call's line, on every run
    (runs, raw, choice) => !!PRIORITY_RE[choice] && runs.every(r => PRIORITY_RE[choice].test(ownOutput(r.output, r.inputs))),
  ],
  msgs: [
    () => 'Define a menu function that prints the pod list, and call it before the question.',
    (runs, raw) => {
      const n = defsIn(raw).filter(d => printsIn(d) >= 1).length;
      return `You've defined ${n} function${n === 1 ? '' : 's'} that print${n === 1 ? 's' : ''}. You need 4: the menu, then one for each of pods 1, 3 and 5.`;
    },
    () => 'Ask which pod with input(), and store the answer in a variable.',
    () => 'Use if / elif / else on the answer, and call the right pod\'s function inside each branch (indented).',
    (runs, raw) => {
      const vs = runs.filter(isValid);
      // the commonest slip: input() gives text, but the branches compare it with a number
      const noQuotes = /==\s*\d/.test(normalise(raw)) && !/\bint\s*\(\s*input/.test(normalise(raw));
      const QUOTES = ' input() gives text, so compare with "1" in quotes, or turn the answer into a number with int().';
      const empty = vs.find(r => !afterAsk(r).trim());
      if (empty) {
        return `With ${empty.inputs[0]} typed, nothing printed after the question.` + (noQuotes
          ? QUOTES : ` Check there's a branch for pod ${empty.inputs[0]} that calls its function.`);
      }
      const a = vs.find((r, i) => vs.some((s, j) => j !== i && afterAsk(s) === afterAsk(r)));
      const b = vs.find(s => s !== a && afterAsk(s) === afterAsk(a));
      return `With ${a.inputs[0]} and ${b.inputs[0]} typed, your program printed the same thing.` + (noQuotes
        ? QUOTES : ' Each pod needs its own function and its own branch.');
    },
    (runs) => {
      const valid = runs.filter(isValid).map(afterAsk);
      const r = runs.find(x => !isValid(x) && (!afterAsk(x).trim() || valid.includes(afterAsk(x))));
      return `With ${r.inputs[0]} typed, ${afterAsk(r).trim() ? 'it printed a crew member\'s details' : 'nothing printed'}. There's no pod ${r.inputs[0]}: add an else that prints a message such as No such pod.`;
    },
    (runs, raw, choice) => (PRIORITY_CHOICES[choice]
      ? `Add the line for your call at the very end, not indented: print("${PRIORITY_CHOICES[choice]}")`
      : 'Make your call above first.'),
  ],
  pass: () => '✅ The pod lookup works: every pod gets its own function, and the menu, the question and the branches call them.',
};

export function evalMake(raw, runs = [], choice, tests = MAKE_TESTS) {
  return evalTests(MAKE_CHECK, raw, withInputs(runs, tests), choice);
}

// ── Extension: keep looking up pods until 0 ───────────────────────────────────
// One run per check, typing a few pods then 0. A loop that doesn't stop at 0 asks for more
// answers than the test has, which the page reports as its own error before this is reached.
export const EXT_TEST_BANK = [
  [['1', '5', '0']], [['3', '9', '1', '0']], [['5', '3', '0']], [['1', '7', '3', '0']], [['3', '5', '1', '0']], [['5', '8', '0']],
];
export const EXT_TESTS = EXT_TEST_BANK[0];

export const EXT_CHECK = {
  reqs: [
    (runs, raw) => hasLine(raw, /^\s*while\b/m),
    (runs) => runs.every(r => askedCount(r.output, r.inputs) === r.inputs.length),
    (runs) => runs.every(r => {
      const segs = segments(r.output, r.inputs, ANY_PRIORITY);
      const pods = r.inputs.map((v, k) => [v, (segs[k] || []).join('\n')]).filter(([v]) => VALID_PODS.includes(v));
      return pods.every(([, o]) => o.trim()) && new Set(pods.map(([, o]) => o)).size === new Set(pods.map(([v]) => v)).size;
    }),
    (runs, raw, choice) => !!PRIORITY_RE[choice] && runs.every(r => PRIORITY_RE[choice].test(ownOutput(r.output, r.inputs))),
  ],
  msgs: [
    () => 'Put the question and the if / elif / else inside a while loop that keeps going until 0 is typed.',
    (runs) => {
      const r = runs.find(x => askedCount(x.output, x.inputs) !== x.inputs.length);
      return `With ${r.inputs.join(' then ')} typed, it asked ${askedCount(r.output, r.inputs)} time(s). It should ask again after every pod, and stop once 0 is typed.`;
    },
    (runs) => `With ${runs[0].inputs.join(' then ')} typed, not every pod printed its own details. The question and the branches both go inside the loop.`,
    (runs, raw, choice) => (PRIORITY_CHOICES[choice]
      ? `Keep the line for your call at the very end, after the loop: print("${PRIORITY_CHOICES[choice]}")`
      : 'Make your call above first.'),
  ],
  pass: () => '✅ The lookup keeps going until 0: a while loop round the question, calling your functions each time.',
};

export function evalExt(raw, runs = [], choice, tests = EXT_TESTS) {
  return evalTests(EXT_CHECK, raw, withInputs(runs, tests), choice);
}

// ── ★ Bonus: a parameter (not scored) ────────────────────────────────────────
// Starts from square(size), called with 50, 100 and 150. The task: polygon(sides), where the loop
// runs range(sides) times and turns 360 / sides, called with at least two different numbers.
const paramDefs = raw => defsIn(raw).filter(d => d.params.length === 1
  && d.body.some(l => new RegExp(`^\\s+for\\b.*\\brange\\s*\\(\\s*${d.params[0]}\\s*\\)`).test(l)));
const sidesCalled = (raw, d) => [...new Set(callsIn(raw).filter(c => c.name === d.name && !c.inDef && c.at > d.at && /^\d+$/.test(c.args[0] || ''))
  .map(c => Number(c.args[0])).filter(n => n >= 3))];

export const PARAMS_CHECK = {
  reqs: [
    (runs, raw) => paramDefs(raw).length > 0,
    (runs, raw) => paramDefs(raw).some(d => sidesCalled(raw, d).length >= 2),
    (runs, raw) => paramDefs(raw).some(d => { const ns = sidesCalled(raw, d); return ns.length >= 2 && ns.every(n => polygonsIn(runs[0].drawing).some(p => p.n === n)); }),
  ],
  msgs: [
    () => 'Define polygon(sides): inside it, a for loop that runs range(sides) times.',
    () => 'Call it at least twice, with a different number of sides each time, such as polygon(5) and polygon(8)',
    (runs) => `The turtle drew ${describe(runs[0].drawing)}. Each turn is 360 / sides, so every shape joins up where it started.`,
  ],
  pass: (runs, raw) => {
    const d = paramDefs(raw).find(x => sidesCalled(raw, x).length >= 2);
    return `✅ One function, any shape: ${sidesCalled(raw, d).map(n => `${d.name}(${n}) drew ${an(shapeName(n))}`).join(', ')}.`;
  },
};

export function evalParams(raw, runs = []) {
  return evalTests(PARAMS_CHECK, raw, withInputs(runs, [[]]), undefined);
}

// ── Modification 4's checklist ───────────────────────────────────────────────
// Its 4 NEW lines are given, and each ticks on the page as soon as it's in the student's code
// (live, while they type). Only a guide: the check itself runs the program.
//   def: def beep():   for: for i in range(3): (4 spaces)   print: print("BEEP") (8 spaces, in
//   the loop)   call: beep() indented inside drone_dock()
export function mod4LinesAdded(code) {
  const lines = String(code || '').replace(/\r/g, '').split('\n');
  const bodyOf = at => {
    const body = [];
    if (at >= 0) for (let k = at + 1; k < lines.length && (!lines[k].trim() || /^\s/.test(lines[k])); k++) body.push(lines[k]);
    return body;
  };
  const at = lines.findIndex(l => /^def\s+beep\s*\(\s*\)\s*:\s*$/.test(l));
  const body = bodyOf(at);
  const fi = body.findIndex(l => /^ {4}for\s+\w+\s+in\s+range\s*\(\s*3\s*\)\s*:\s*$/.test(l));
  const dock = bodyOf(lines.findIndex(l => /^def\s+drone_dock\s*\(\s*\)\s*:\s*$/.test(l)));
  return {
    def: at >= 0,
    for: fi >= 0,
    print: fi >= 0 && body.slice(fi + 1).some(l => /^ {8}print\s*\(\s*(["'])BEEP\1\s*\)\s*$/.test(l)),
    call: dock.some(l => /^ {4}beep\s*\(\s*\)\s*$/.test(l)),
  };
}
