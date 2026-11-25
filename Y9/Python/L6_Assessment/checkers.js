// Question bank + marking logic for 1_Python_Assessment.html — the Y9 Python end-of-unit
// assessment (Lesson 6, Station Zero Chapter 6 "Systems Check"). Not PRIMM: this lesson
// MEASURES. See Knowledge Base/project_y9_python_mtp.md, Lesson 6.
//
// Built on the Y8 Unit 1 assessment (Y8/Python Unit 1/L6_Assessment), version 4: the marking
// helpers below are copied from it, and so is what four sittings of it taught about difficulty
// (see "Lesson 6" in project_y8_python_unit1_mtp.md):
//   • Weighted toward READING, TRACING and SPOT-AND-FIX (about 70%), with small code tasks.
//   • Every section starts with questions students can click (low scorers answered those but
//     left typed code untouched), then a GUIDED 1-mark code task with a 💡 How to do it box,
//     and ends with a 2-mark "Write it" task: the easy marks for writing code.
//   • No trap questions (self-joins, missing spaces, predicting print("city")): every question
//     tests one idea from the lessons. Recognition beats prediction for the shakiest ideas.
//   • Trace boxes come first and forgive capitals and quotes on text; the printed lines are
//     labelled "1st printed", "2nd printed" (not "line 1", which half read as the program's).
//   • Every code task that starts from code has a worked example from a DIFFERENT program.
//   • What a code task prints is marked on letters and numbers only (loose), with a "no marks
//     lost" note and "Nearly: …" for a line a letter or two out. A program that prints the same
//     thing whatever is typed is told to use the variables. The bonus stays word for word.
//   • The one longer program (section 7) starts from step comments, never a blank editor.
//   • One-try MCQ/trace/branch answers lock at once; options and versions come from a saved
//     seed; opts[0] is always the right answer here, and it isn't the longest on half or more.
//   • One section per lesson topic so L7 (SRT) can route. Item ids are prefixed by section:
//     e_ errors · v_ sequence · s_ selection · w_ while · f_ for · d_ functions · p_ program ·
//     x_ bonus.
//
// A "run" is what runPython() resolved with, plus the inputs it was given (and, for turtle
// tasks, the drawing it made):  { inputs: string[], ok: boolean, output: string, drawing? }

import { polygonsIn, paths } from '../L4_For_Loops/checkers.js';

// ── Shared helpers ───────────────────────────────────────────────────────────

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (if, +, input, int, ==) can't trigger false positives.
export function normalise(code) {
  let s = code.replace(/#[^\n]*/g, '');
  s = s.replace(/"""[\s\S]*?"""/g, '""').replace(/'''[\s\S]*?'''/g, "''");
  s = s.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
  return s;
}

const count = (raw, re) => (normalise(raw).match(re) || []).length;
const inputCount = raw => count(raw, /\binput\s*\(/g);
const intCount   = raw => count(raw, /\b(?:int|float)\s*\(/g);

// Collapse runs of spaces and trim, for comparing printed lines.
export const squash = s => String(s).replace(/\s+/g, ' ').trim();
const same = (a, b) => squash(a).toLowerCase() === squash(b).toLowerCase();

// Looser still, for marking what a code task prints: only the letters and numbers have to
// match, so capitals, spaces and punctuation are all forgiven ("helloSam", "It is fun,").
// A space between two digits still counts, so 1 2 is not 12.
export const loose = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/(?<!\d) | (?!\d)/g, '');
const close = (a, b) => loose(a) === loose(b);

// Letters added, dropped or changed to turn one string into the other.
export function editDistance(a, b) {
  let prev = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// The lines the program PRINTED. runPython echoes each mocked input() as
// "prompt + answer" on its own line; those echo lines are dropped by matching each
// answer, in order, against the end of the next line that ends with it.
export function printedLines(run) {
  const lines = (run?.output || '').replace(/\n$/, '').split('\n');
  const answers = [...(run?.inputs || [])];
  const out = [];
  for (const line of lines) {
    if (answers.length && line.trimEnd().endsWith(answers[0])) { answers.shift(); continue; }
    out.push(line);
  }
  return out.filter(l => l.trim());
}

// Every number in the printed lines, as JS numbers ("8.0" → 8).
export const printedNumbers = run =>
  printedLines(run).flatMap(l => (l.match(/-?\d+(?:\.\d+)?/g) || []).map(Number));

// Python's own error name from a failed run's output, e.g. "NameError".
export function errorName(run) {
  const m = (run?.output || '').match(/\b([A-Z][A-Za-z]*Error)\b/);
  return m ? m[1] : null;
}

const firstFailed = runs => runs.find(r => !r.ok);
const crashMsg = runs => {
  const f = firstFailed(runs);
  const typed = f.inputs.length ? ` when ${f.inputs.join(' and ')} ${f.inputs.length > 1 ? 'are' : 'is'} typed` : '';
  const name = errorName(f) || 'error';
  return `Python stops with ${/^[AEIOU]/i.test(name) ? 'an' : 'a'} ${name}${typed}. Read the last line of the error.`;
};

// ── Seeded randomness (per-student order and versions, stable on reload) ─────

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A small stable number per item id, so each item gets its own shuffle from one seed.
export const hashId = id => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// The version of an item this student gets (items without versions are their own version).
export function variantOf(item, seed) {
  if (!item.variants) return item;
  return { ...item, ...item.variants[(seed + hashId(item.id)) % item.variants.length] };
}

// Option display order for one student: a permutation of the option indexes.
export const optionOrder = (id, n, seed) => shuffle([...Array(n).keys()], mulberry32(seed + hashId(id)));

// ── Selection structure (from the L5 checkers) ───────────────────────────────

const codeLines = raw => normalise(raw).split('\n').filter(l => l.trim());
const indentOf  = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const COMPARISON = /==|!=|<=|>=|<|>/;
const isIfLine   = l => /^\s*if\b.*:\s*$/.test(l);
const isElseLine = l => /^\s*else\s*:\s*$/.test(l);

// The if lines that have an else lined up underneath them.
export function ifElseLines(raw) {
  const lines = codeLines(raw);
  const out = [];
  lines.forEach((l, i) => {
    if (!isIfLine(l)) return;
    const ind = indentOf(l);
    for (let j = i + 1; j < lines.length; j++) {
      if (indentOf(lines[j]) < ind) break;
      if (indentOf(lines[j]) === ind) {
        if (isElseLine(lines[j])) out.push(l);
        break;
      }
    }
  });
  return out;
}

// A run's printed lines with the typed name masked and every number replaced by #, so two
// runs that took the same branch match even when their messages repeat the answers or a
// worked-out number ("Sorry Leo, come back in 3 years" ≈ "Sorry Mia, come back in 1 years").
const branchKey = (run, name) => printedLines(run)
  .map(l => squash(name ? l.split(name).join('<name>') : l).toLowerCase().replace(/-?\d+(?:\.\d+)?/g, '#'))
  .join('\n');

// ── Trace marking (typed answers) ────────────────────────────────────────────

const QUOTED = /^(["'])(.*)\1$/;
const NUMERIC = /^-?\d+(?:\.\d+)?$/;

// "What is in the box at the end?" Text may be written with or without quotes, and in any
// case (the trace tests what is stored, not how to write it; 20 students lost a mark for
// "tom"); a number written in quotes is still wrong.
export function checkTraceValue(expected, typed) {
  const t = String(typed ?? '').trim();
  if (!t) return { ok: false, msg: 'Not answered.' };
  const q = t.match(QUOTED);
  if (expected.type === 'str') {
    return (q ? q[2] : t).toLowerCase() === expected.value.toLowerCase() ? { ok: true } : { ok: false, msg: 'Not the right text.' };
  }
  const inner = q ? q[2] : t;
  if (!NUMERIC.test(inner) || Number(inner) !== expected.value) return { ok: false, msg: 'Not the right number.' };
  if (q) return { ok: false, msg: 'Right value, but it is a number, so no quotes.' };
  return { ok: true };
}

// "What is printed?" Case and extra spaces are forgiven; a missing or extra space
// between words is not (that is the + misconception being tested).
export function checkTraceOutput(expected, typed) {
  const t = squash(typed ?? '');
  if (!t) return { ok: false, msg: 'Not answered.' };
  if (same(t, expected)) return { ok: true };
  const q = t.match(QUOTED);
  if (q && same(q[2], expected)) return { ok: false, msg: 'print() never shows the quotes.' };
  if (t.replace(/ /g, '').toLowerCase() === squash(expected).replace(/ /g, '').toLowerCase()) {
    return { ok: false, msg: 'Check the spaces: + joins text exactly as it is.' };
  }
  return { ok: false, msg: 'Not what is printed.' };
}

// How a stored value is written in code: text in quotes, numbers without.
export const showValue = v => v.type === 'str' ? `"${v.value}"` : String(v.value);

// ── Sort marking ─────────────────────────────────────────────────────────────

// placements: { cardId: binId }. One mark for every two cards in the right group.
export function markSort(item, placements) {
  const results = {};
  for (const c of item.cards) results[c.id] = placements[c.id] === c.bin;
  const placed = item.cards.every(c => placements[c.id]);
  const right = item.cards.filter(c => results[c.id]).length;
  return { results, placed, right, pts: Math.floor(right / 2) };
}

// ── Code-task marking ────────────────────────────────────────────────────────

// A requirement test: for every test run, the program prints exactly these lines and nothing
// else (capitals, spaces and punctuation forgiven). expect(inputs) gives the lines for one run.
// The test carries expect with it, so evalReqs can say what is nearly right.
const printsExactly = expect => Object.assign((raw, runs) => allOk(runs) && runs.every(r => {
  const want = expect(r.inputs), got = printedLines(r);
  return got.length === want.length && want.every((w, i) => close(got[i], w));
}), { expect });
// Attach the wanted lines to a test that checks them its own way. some: other lines may be printed too.
const withText = (expect, test, some = false) => Object.assign(test, { expect, some });

const quote = s => `"${squash(s)}"`;

// A check on the printed text failed, but the program ran: say which line is nearly right
// (a letter or two out, same numbers), or what extra line it prints, so a typo doesn't
// look like a wrong idea. Students lost marks for "I like cat too!" and "I likecattoo".
export function textNudge(test, runs) {
  if (!test?.expect) return '';
  for (const r of runs) {
    const want = test.expect(r.inputs), got = printedLines(r);
    const missing = want.filter(w => !got.some(g => close(g, w)));
    for (const w of missing) {
      const near = got.find(g => loose(g).replace(/\D/g, '') === loose(w).replace(/\D/g, '')
        && editDistance(loose(g), loose(w)) <= Math.max(2, Math.floor(loose(w).length / 6)));
      if (near) return ` Nearly: it printed ${quote(near)} where it should print ${quote(w)}. Check the spelling.`;
    }
    if (missing.length || test.some) continue;
    const extra = got.find(g => !want.some(w => close(g, w)));
    if (extra) return ` Nearly: it also prints ${quote(extra)}, which it shouldn't.`;
    if (got.length === want.length && !want.every((w, i) => close(got[i], w))) return ' The right lines are printed, but in the wrong order.';
  }
  return '';
}

// A printed line word by word against the line it should be: [{ w, kind: 'ok'|'extra'|'missing' }].
// Words match as in the marking (capitals and punctuation forgiven), so "over the speed limit"
// against "over the limit" marks only "speed" as extra.
export function wordDiff(got, want) {
  const a = squash(got).split(' ').filter(Boolean), b = squash(want).split(' ').filter(Boolean);
  const eq = (x, y) => loose(x) === loose(y);
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      L[i][j] = eq(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && eq(a[i], b[j])) { out.push({ w: a[i], kind: 'ok' }); i++; j++; }
    else if (i < a.length && (j >= b.length || L[i + 1][j] >= L[i][j + 1])) out.push({ w: a[i++], kind: 'extra' });
    else out.push({ w: b[j++], kind: 'missing' });
  }
  return out;
}

// For a failed text requirement: the printed line that is nearly a wanted one (at least half
// its words match), so the page can show which words are wrong. null when no line is close.
function lineDiff(test, runs) {
  if (!test?.expect || !allOk(runs)) return null;
  for (const r of runs) {
    const want = test.expect(r.inputs), got = printedLines(r).filter(g => !want.some(w => close(g, w)));
    for (const w of want.filter(w => !printedLines(r).some(g => close(g, w)))) {
      const scored = got.map(g => ({ g, words: wordDiff(g, w) }))
        .map(x => ({ ...x, n: x.words.filter(d => d.kind === 'ok').length }));
      const best = scored.sort((x, y) => y.n - x.n)[0];
      if (best && best.n * 2 >= squash(w).split(' ').length)
        return { typed: r.inputs, got: squash(best.g), want: squash(w), words: best.words };
    }
  }
  return null;
}

// Every check passed, but a printed line only matched with the capitals, spaces or
// punctuation forgiven: a gentle note, no mark lost.
function looseTip(item, runs) {
  const exact = (a, b) => squash(a) === squash(b);
  const off = item.reqs.some(q => q.test.expect && runs.some(r => {
    const got = printedLines(r);
    return q.test.expect(r.inputs).some(w => got.some(g => close(g, w)) && !got.some(g => exact(g, w)));
  }));
  return off ? ' (No marks lost, but some capitals, spaces or punctuation are not quite the same as the task.)' : '';
}

// Different answers were typed but the program printed exactly the same thing: the answer was
// typed into the code (print(5 + 3), print("13")) instead of worked out from the variables.
export const sameEveryRun = runs => runs.length > 1 && new Set(runs.map(r => r.inputs.join('|'))).size > 1
  && new Set(runs.map(r => printedLines(r).join('\n'))).size === 1;
const SAME_MSG = ' Your program printed the same thing whatever was typed. It is checked with other answers too, so work the answer out from the variables that hold what was typed.';

// Every code item (fix-it, warm-up, write task, extension) has a requirement list:
// one mark per requirement met.
// The message names the first requirement still missing — never how to meet it.
export function evalReqs(item, raw, runs) {
  const results = item.reqs.map(r => !!r.test(raw, runs));
  const pts = results.filter(Boolean).length;
  const bad = results.findIndex(r => !r);
  let msg = results.length === 1 ? 'The requirement is met.' : `All ${results.length} requirements met.`;
  if (bad >= 0) {
    msg = `Requirement ${bad + 1} is not met yet.`;
    if (firstFailed(runs)) msg += ' ' + crashMsg(runs);
    else if (sameEveryRun(runs)) msg += SAME_MSG;
    else msg += textNudge(item.reqs[bad].test, runs) || (item.extraMsg?.(raw, runs, results) || '');
  } else {
    msg += looseTip(item, runs) || (item.tipMsg?.(raw, runs) || '');
  }
  // diffs[i]: a nearly-right printed line for each failed text requirement (see lineDiff).
  const diffs = item.reqs.map((r, i) => results[i] ? null : lineDiff(r.test, runs));
  return { results, pts, msg, diffs };
}

export const evalCode = evalReqs;

// ── Structure tests (on the code with comments and string contents blanked) ──

const allOk = runs => runs.length > 0 && runs.every(r => r.ok);
const has = (raw, re) => re.test(normalise(raw));
export const usesElif  = raw => has(raw, /^\s*elif\b.*:\s*$/m);
export const usesWhile = raw => has(raw, /^\s*while\b.*:\s*$/m);
export const usesFor   = raw => has(raw, /^\s*for\s+\w+\s+in\s+range\s*\(.*\)\s*:\s*$/m);
const strCount = raw => count(raw, /\bstr\s*\(/g);

// The functions the code defines (no parameters in this unit), and whether each is called on
// an unindented line BELOW its def (a call above it is a NameError; one inside another def or
// loop also counts as long as the program reaches it, which the output tests check).
export function definedFunctions(raw) {
  return [...normalise(raw).matchAll(/^def\s+(\w+)\s*\(\s*\)\s*:/gm)].map(m => m[1]);
}
export function calledAfterDef(raw, name) {
  const lines = normalise(raw).split('\n');
  const at = lines.findIndex(l => new RegExp(`^def\\s+${name}\\s*\\(`).test(l));
  if (at < 0) return false;
  return lines.slice(at + 1).some(l => new RegExp(`(^|[^\\w.])${name}\\s*\\(\\s*\\)`).test(l) && !/^\s*def\b/.test(l));
}
const callCount = (raw, name) => normalise(raw).split('\n')
  .filter(l => !/^\s*def\b/.test(l))
  .reduce((n, l) => n + (l.match(new RegExp(`(^|[^\\w.])${name}\\s*\\(\\s*\\)`, 'g')) || []).length, 0);

// Turtle: the regular polygons a run drew, and whether it drew one n-sided shape and nothing else.
export const drewOnly = (run, n) => {
  const ps = paths(run?.drawing), polys = polygonsIn(run?.drawing);
  return ps.length === 1 && polys.length === 1 && polys[0].n === n;
};

// ── Sections ─────────────────────────────────────────────────────────────────
// story: the one line of Station Zero framing on each section's heading (Chapter map: "framing
// only"). Each room is the one that taught the topic, as in L7's topic → room table.

export const SECTIONS = [
  { id: 'errors',    n: '1', label: 'Errors',                    lesson: 'Lessons 1–5', room: 'WARDEN Core',
    story: 'WARDEN runs its diagnostics first. Read the errors it finds.' },
  { id: 'sequence',  n: '2', label: 'Variables, input & casting', lesson: 'Lessons 1–3', room: 'Life Support',
    story: 'Life Support asks, stores and converts. Check every step.' },
  { id: 'selection', n: '3', label: 'Selection',                 lesson: 'Lesson 2',    room: 'Sensor Ops',
    story: 'The sensors must make the right call at every boundary.' },
  { id: 'while',     n: '4', label: 'while loops',               lesson: 'Lesson 3',    room: 'Airlock',
    story: 'The airlock keypad must keep asking, and must know when to stop.' },
  { id: 'for',       n: '5', label: 'for loops & turtle',        lesson: 'Lesson 4',    room: 'Navigation',
    story: 'The beacon must repeat its signal exactly.' },
  { id: 'functions', n: '6', label: 'Functions',                 lesson: 'Lesson 5',    room: 'Drone Bay',
    story: 'The drone only runs the commands it is given, in the order it is given them.' },
  { id: 'program',   n: '7', label: 'Write a program',           lesson: 'Lessons 1–5', room: 'Docking control',
    story: 'One last program before the rescue ship can dock.' },
  { id: 'ext',       n: '★', label: 'Bonus',                     lesson: 'Bonus', bonus: true, room: 'Spare systems',
    story: 'Spare power. Only if every other system has passed.' },
];

// ── The questions ────────────────────────────────────────────────────────────
// kinds: mcq (1 mark) · trace (1 per box / printed line) · branch (1 per row)
//        fix and reqs (run + check, 1 per requirement). A fix item has a Reset button and
//        starts from broken code; a reqs item with resettable: true does too.

const runFor = (runs, ...inputs) => runs.find(r => r.inputs.join('|') === inputs.join('|'));
const turtleStart = 'import turtle\nt = turtle.Turtle()\n';

export const ITEMS = [
  // ── 1 · Errors (the debugging recipe, every lesson) ── 5 marks
  { id: 'e_line', section: 'errors', kind: 'mcq', pts: 1,
    q: 'This program should print the fuel level. Python shows the error below. <strong>Which line has the bug?</strong>',
    code: 'fuel = 40\nprint("Fuel check")\nprint("Fuel: " + str(fule))',
    error: 'Traceback (most recent call last):\n  File "main.py", line 3, in <module>\n    print("Fuel: " + str(fule))\nNameError: name \'fule\' is not defined',
    opts: ['Line 3', 'Line 1', 'Line 2', 'All of them'],
    why: 'Read the last line of the error first, then find the line number it gives: line 3. fule is a spelling mistake for fuel.' },
  { id: 'e_name', section: 'errors', kind: 'mcq', pts: 1,
    q: 'Why does Python say <code>Score</code> is not defined?',
    code: 'score = 10\nprint(Score)',
    error: 'Traceback (most recent call last):\n  File "main.py", line 2, in <module>\n    print(Score)\nNameError: name \'Score\' is not defined',
    opts: ['Capital letters matter in a name','print() cannot show a number alone', 'score needs quotes round it on line 1', 'Line 2 runs before line 1 has run'],
    why: 'Capital letters count in Python: Score and score are two different names, and only score was made.' },
  { id: 'e_kind', section: 'errors', kind: 'mcq', pts: 1,
    q: 'This program should let a 13-year-old in. When <strong>13</strong> is typed it prints nothing, and there is <strong>no error message</strong>. What kind of error is this?',
    code: 'age = int(input("Age? "))\nif age > 13:\n    print("Welcome")',
    opts: ['A logic error', 'A syntax error', 'A NameError', 'A TypeError'],
    why: 'Python ran every line with no error message, but the program does the wrong thing. A logic error runs, but wrong output comes out: here > should be >=. (A syntax error breaks the language rules, so nothing runs at all.)' },
  { id: 'e_fix', section: 'errors', kind: 'fix',
    title: 'Fix it: the welcome message',
    goal: 'This program should ask for a name and then print e.g. <code>Welcome aboard, Sam</code> but it stops with a NameError. Fix it.',
    howto: { text: 'Read the last line of the error. A variable must be spelt <strong>exactly</strong> the same every time, capital letters too. For example:',
             code: 'colour = input("Colour? ")\nprint("You picked " + colour)' },
    starter: 'name = input("What is your name? ")\nprint("Welcome aboard, " + Name)',
    tests: [['Sam'], ['Priya']],
    testNote: 'Checked by running it with Sam and then Priya.',
    reqs: [
      { text: 'Print <code>Welcome aboard, Sam</code> when Sam is typed, and the same for any name',
        test: printsExactly(([n]) => [`Welcome aboard, ${n}`]) },
    ] },
  { id: 'e_colon', section: 'errors', kind: 'fix',
    title: 'Fix it: the scanner',
    goal: 'This program should print the four lines below, but it stops with a SyntaxError. Fix it (don\'t delete anything).',
    howto: { text: 'A line that starts <code>if</code>, <code>elif</code>, <code>else</code>, <code>while</code>, <code>for</code> or <code>def</code> must end with a colon. For example:',
             code: 'while count < 3:\n    print(count)' },
    starter: 'print("Starting the scan")\nfor i in range(2)\n    print("Scanning...")\nprint("Scan complete")',
    tests: [[]],
    reqs: [
      { text: 'Print exactly these lines and nothing else: <code>Starting the scan</code>, then <code>Scanning...</code> twice, then <code>Scan complete</code>',
        test: printsExactly(() => ['Starting the scan', 'Scanning...', 'Scanning...', 'Scan complete']) },
    ] },

  // ── 2 · Variables, input & casting (L1–L3) ── 9 marks
  // Only reassignment, never a self-join (9% in the Y8 first sitting); boxes first.
  { id: 'v_trace', section: 'sequence', kind: 'trace',
    q: 'Play computer: run this program in your head, line by line.',
    variants: [
      { lines: ['song = "Jump"', 'singer = "Mo"', 'print(singer + " sings " + song)', 'song = "Fly"', 'print(singer + " sings " + song)'],
        vars: [{ name: 'song', type: 'str', value: 'Fly' }, { name: 'singer', type: 'str', value: 'Mo' }],
        output: ['Mo sings Jump', 'Mo sings Fly'] },
      { lines: ['game = "chess"', 'player = "Kai"', 'print(player + " plays " + game)', 'game = "darts"', 'print(player + " plays " + game)'],
        vars: [{ name: 'game', type: 'str', value: 'darts' }, { name: 'player', type: 'str', value: 'Kai' }],
        output: ['Kai plays chess', 'Kai plays darts'] },
      { lines: ['sport = "tennis"', 'coach = "Bo"', 'print(coach + " teaches " + sport)', 'sport = "golf"', 'print(coach + " teaches " + sport)'],
        vars: [{ name: 'sport', type: 'str', value: 'golf' }, { name: 'coach', type: 'str', value: 'Bo' }],
        output: ['Bo teaches tennis', 'Bo teaches golf'] },
    ] },
  { id: 'v_pick', section: 'sequence', kind: 'mcq', pts: 1,
    q: 'Type <strong>5</strong> and this program prints <strong>55</strong>, not 10. Which <strong>line 1</strong> makes it print <strong>10</strong>?',
    code: 'num = input("Pick a number: ")\nprint(num * 2)',
    opts: ['num = int(input("Pick a number: "))', 'num = input(int("Pick a number: "))', 'num = int("Pick a number: ")', 'num = input("Pick a number: ") * 2'],
    why: 'int() goes round the whole input(...), so the answer typed becomes a number before it is stored. Then num * 2 does maths.' },
  // Students typed the numbers into their code in the Y8 third sitting: this asks for the line
  // that works whatever is typed.
  { id: 'v_total', section: 'sequence', kind: 'mcq', pts: 1,
    variants: [
      { q: 'The user types <strong>4</strong>, then <strong>5</strong>. The last line must print their total, <strong>9</strong>, and still be right when other numbers are typed. Which line is it?',
        opts: ['print(int(a) + int(b))', 'print(int(4) + int(5))', 'print(int(a + b))', 'print(a + b)'] },
      { q: 'The user types <strong>2</strong>, then <strong>6</strong>. The last line must print their total, <strong>8</strong>, and still be right when other numbers are typed. Which line is it?',
        opts: ['print(int(a) + int(b))', 'print(int(2) + int(6))', 'print(int(a + b))', 'print(a + b)'] },
      { q: 'The user types <strong>3</strong>, then <strong>7</strong>. The last line must print their total, <strong>10</strong>, and still be right when other numbers are typed. Which line is it?',
        opts: ['print(int(a) + int(b))', 'print(int(3) + int(7))', 'print(int(a + b))', 'print(a + b)'] },
    ],
    code: 'a = input("First number? ")\nb = input("Second number? ")',
    why: 'a and b hold whatever was typed, so using them works for any numbers; typing the numbers in only works for one pair. Each needs int() before + adds them: int(a + b) joins them first.' },
  // str() was taught in L3 (the attempts counter). Guided, with the line's shape in the How-to.
  { id: 'v_str', section: 'sequence', kind: 'fix',
    title: 'Fix it: the tries counter',
    goal: 'This program should print <code>Tries: 3</code> but it stops with a TypeError. Fix line 2 so it joins the number onto the text. Keep using the variable <code>tries</code>',
    howto: { text: '<code>+</code> can only join text to text. <code>str( )</code> turns a number into text first. For example:',
             code: 'lives = 5\nprint("Lives: " + str(lives))' },
    starter: 'tries = 3\nprint("Tries: " + tries)',
    tests: [[]],
    reqs: [
      { text: 'Print <code>Tries: 3</code> by joining <code>str(tries)</code> onto the text',
        test: (raw, runs) => strCount(raw) >= 1 && /\bprint\s*\([^\n]*\btries\b/.test(normalise(raw))
          && printsExactly(() => ['Tries: 3'])(raw, runs) },
    ] },
  { id: 'v_write', section: 'sequence', kind: 'reqs', resettable: true,
    title: 'Write it: next year',
    goal: 'This line asks for an age. Add to the program so it prints how old the user will be <strong>next year</strong>.',
    howto: { text: 'Make the answer a number with <code>int( )</code>, then do the maths with the <strong>variable</strong>, not a number you typed in: it must work for any age. For example, this doubles any score typed:',
             code: 'score = int(input("Score? "))\nprint("Double is", score * 2)' },
    samples: [[['How old are you? ', '13'], ['Next year you will be 14']]],
    starter: 'age = input("How old are you? ")\n',
    tests: [['13'], ['8']],
    testNote: 'Checked by running it with 13 and then 8. Your message can use your own words.',
    reqs: [
      { text: 'Turn the answer into a whole number with <code>int()</code>',
        test: raw => intCount(raw) >= 1 },
      { text: 'Print the age next year (<strong>14</strong> when 13 is typed), with no error',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedNumbers(r).includes(Number(r.inputs[0]) + 1)) },
    ] },

  // ── 3 · Selection: elif, order of conditions, boundaries (L2) ── 9 marks
  { id: 's_pick', section: 'selection', kind: 'mcq', pts: 1,
    q: 'This program should print <strong>Hot</strong> at 25 or more, <strong>Warm</strong> from 15 to 24, and <strong>Cold</strong> below 15. Which line goes in the gap?',
    code: 'temp = int(input("Temperature? "))\nif temp >= 25:\n    print("Hot")\n_______\n    print("Warm")\nelse:\n    print("Cold")',
    opts: ['elif temp >= 15:', 'else temp >= 15:', 'elif temp >= 15', 'if else temp >= 15:'],
    why: 'elif means "else, if": it has its own test, lines up with the if, and ends with a colon.' },
  // Rows: [typed, index of the message that prints]. The 4th choice (two messages) is the
  // "elif runs too" misconception.
  { id: 's_branch', section: 'selection', kind: 'branch',
    q: 'For each answer the user types, what does the program print?',
    variants: [
      { code: 'temp = int(input("Temperature? "))\nif temp >= 25:\n    print("Hot")\nelif temp >= 15:\n    print("Warm")\nelse:\n    print("Cold")\nprint("Have a nice day")',
        msgs: ['Hot', 'Warm', 'Cold'], after: 'Have a nice day', rows: [['30', 0], ['15', 1], ['14', 2]] },
      { code: 'score = int(input("Score? "))\nif score >= 80:\n    print("Gold")\nelif score >= 50:\n    print("Silver")\nelse:\n    print("Bronze")\nprint("Well played")',
        msgs: ['Gold', 'Silver', 'Bronze'], after: 'Well played', rows: [['80', 0], ['65', 1], ['49', 2]] },
      { code: 'speed = int(input("Speed? "))\nif speed > 70:\n    print("Too fast")\nelif speed > 60:\n    print("Slow down")\nelse:\n    print("OK")\nprint("Drive safely")',
        msgs: ['Too fast', 'Slow down', 'OK'], after: 'Drive safely', rows: [['71', 0], ['70', 1], ['60', 2]] },
    ] },
  { id: 's_order', section: 'selection', kind: 'mcq', pts: 1,
    q: 'The user types <strong>90</strong>. What is printed?',
    code: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\nelif score >= 80:\n    print("Distinction")',
    opts: ['Pass: only the first True test runs', 'Distinction: 90 is 80 or more', 'Pass, then Distinction: both are True', 'Nothing: 90 is above both tests'],
    why: 'Python checks the tests from the top and runs only the FIRST one that is True. 90 >= 50 is True, so it prints Pass and skips the elif. The order of the tests matters.' },
  { id: 's_guide', section: 'selection', kind: 'reqs', resettable: true,
    title: 'Write it: add an elif',
    goal: 'This program prints <strong>Pass</strong> for 50 or more and <strong>Try again</strong> for anything lower. Add an <code>elif</code> so a score from <strong>40 to 49</strong> prints <strong>Nearly</strong>',
    howto: { text: '<code>elif</code> goes between the <code>if</code> and the <code>else</code>, lined up with them, with its own test and a colon. The line it runs goes under it, indented. For example:',
             code: 'if age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teen")\nelse:\n    print("Child")' },
    starter: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")\n',
    tests: [['70'], ['50'], ['45'], ['40'], ['39']],
    testNote: 'Checked by running it with 70, 50, 45, 40 and 39.',
    // The mark is for the elif and its band, so any message there counts (the Y8 add-the-else lesson).
    reqs: [
      { text: 'Use an <code>elif</code> so 40 to 49 prints <code>Nearly</code> (or a message of your own), while 50 or more still prints <code>Pass</code> and under 40 <code>Try again</code>',
        test: (raw, runs) => {
          if (!usesElif(raw) || !allOk(runs) || runs.some(r => printedLines(r).length !== 1)) return false;
          const msg = n => printedLines(runFor(runs, n))[0];
          return ['70', '50'].every(n => close(msg(n), 'Pass')) && close(msg('39'), 'Try again')
            && !close(msg('45'), 'Pass') && !close(msg('45'), 'Try again') && close(msg('45'), msg('40'));
        } },
    ] },
  { id: 's_fix', section: 'selection', kind: 'fix',
    title: 'Fix it: the thermostat',
    goal: '30 or more should print only <code>Hot</code>, 15 to 29 <code>Warm</code>, and under 15 <code>Cold</code>. But typing 35 prints Hot <strong>and</strong> Warm. There is no error message. Fix it.',
    howto: { text: 'In one <code>if</code> / <code>elif</code> / <code>else</code>, only the first True test runs. A second <code>if</code> starts a new, separate question. For example:',
             code: 'if mark >= 70:\n    print("Grade A")\nelif mark >= 50:\n    print("Grade B")\nelse:\n    print("Grade C")' },
    starter: 'temp = int(input("Temperature? "))\nif temp >= 30:\n    print("Hot")\nif temp >= 15:\n    print("Warm")\nelse:\n    print("Cold")',
    tests: [['35'], ['30'], ['20'], ['15'], ['5']],
    testNote: 'Checked by running it with 35, 30, 20, 15 and 5.',
    reqs: [
      { text: 'Print only <code>Hot</code> for 30 or more, <code>Warm</code> for 15 to 29, and <code>Cold</code> under 15',
        test: printsExactly(([t]) => [+t >= 30 ? 'Hot' : +t >= 15 ? 'Warm' : 'Cold']) },
    ] },
  { id: 's_write', section: 'selection', kind: 'reqs', resettable: true,
    title: 'Write it: the medal',
    goal: 'Finish the program. <strong>100 or more</strong> points prints <code>Gold</code>, <strong>50 to 99</strong> prints <code>Silver</code>, and <strong>under 50</strong> prints <code>Bronze</code>',
    howto: { text: 'Start with the highest band. Each test is a comparison on the <strong>variable</strong>, ending with a colon; <code>else:</code> catches everything left. For example:',
             code: 'if age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teen")\nelse:\n    print("Child")' },
    starter: 'points = int(input("Points? "))\n',
    tests: [['120'], ['100'], ['99'], ['50'], ['49']],
    testNote: 'Checked by running it with 120, 100, 99, 50 and 49.',
    reqs: [
      { text: 'Use <code>if</code>, <code>elif</code> and <code>else</code>',
        test: raw => usesElif(raw) && has(raw, /^\s*if\b.*:\s*$/m) && has(raw, /^\s*else\s*:\s*$/m) },
      { text: 'Print the right medal, and only that one, for every score',
        test: printsExactly(([p]) => [+p >= 100 ? 'Gold' : +p >= 50 ? 'Silver' : 'Bronze']) },
    ] },

  // ── 4 · while loops (L3) ── 9 marks
  { id: 'w_runs', section: 'while', kind: 'mcq', pts: 1,
    q: 'How many times does this program print <strong>Beep</strong>?',
    variants: [
      { code: 'count = 1\nwhile count <= 3:\n    print("Beep")\n    count = count + 1', opts: ['3', '4', '2', 'It never stops'] },
      { code: 'count = 0\nwhile count < 4:\n    print("Beep")\n    count = count + 1', opts: ['4', '5', '3', 'It never stops'] },
      { code: 'count = 1\nwhile count < 5:\n    print("Beep")\n    count = count + 1', opts: ['4', '5', '3', 'It never stops'] },
    ],
    why: 'The test is checked at the top, each time round. Count the values of count that pass the test: the loop stops as soon as the test is False.' },
  { id: 'w_trace', section: 'while', kind: 'trace',
    q: 'Play computer: run this program in your head. Go round the loop until the test is False.',
    variants: [
      { lines: ['lives = 2', 'while lives > 0:', '    print(lives)', '    lives = lives - 1', 'print("Game over")'],
        vars: [{ name: 'lives', type: 'int', value: 0 }], output: ['2', '1', 'Game over'] },
      { lines: ['count = 3', 'while count > 1:', '    print(count)', '    count = count - 1', 'print("Go!")'],
        vars: [{ name: 'count', type: 'int', value: 1 }], output: ['3', '2', 'Go!'] },
      { lines: ['n = 1', 'while n < 3:', '    print(n)', '    n = n + 1', 'print("Done")'],
        vars: [{ name: 'n', type: 'int', value: 3 }], output: ['1', '2', 'Done'] },
    ] },
  { id: 'w_forever', section: 'while', kind: 'mcq', pts: 1,
    q: 'The user types <strong>1111</strong>. What happens?',
    code: 'pin = input("PIN? ")\nwhile pin != "1234":\n    print("Wrong PIN")\nprint("Unlocked")',
    opts: ['Wrong PIN for ever: pin never changes', 'Wrong PIN once: then the loop ends', 'It asks again: the loop asks for the PIN', 'Unlocked: the test is checked only once'],
    why: 'Nothing inside the loop changes pin, so the test stays True and the loop never ends: an infinite loop.' },
  { id: 'w_fix', section: 'while', kind: 'fix',
    title: 'Fix it: ask again',
    goal: 'This keypad should keep saying <code>Wrong PIN</code> and asking again until 1234 is typed, then print <code>Unlocked</code> but at the moment a wrong PIN loops for ever. Add the missing line.',
    howto: { text: 'Something inside the loop must change the variable in the test, or the loop never ends. Ask again at the bottom of the loop, indented. For example:',
             code: 'answer = input("Ready? ")\nwhile answer != "yes":\n    print("Say yes when you are ready")\n    answer = input("Ready? ")' },
    starter: 'pin = input("PIN? ")\nwhile pin != "1234":\n    print("Wrong PIN")\nprint("Unlocked")',
    tests: [['1111', '2222', '1234'], ['1234']],
    testNote: 'Checked by typing 1111, 2222, then 1234, and then 1234 straight away. (A loop that never ends is stopped after a few seconds.)',
    reqs: [
      { text: 'Print <code>Wrong PIN</code> once for each wrong PIN, asking again each time, then <code>Unlocked</code>',
        test: printsExactly(ins => [...ins.slice(0, -1).map(() => 'Wrong PIN'), 'Unlocked']) },
    ] },
  { id: 'w_write', section: 'while', kind: 'reqs', resettable: true,
    title: 'Write it: the countdown',
    goal: 'Use a <code>while</code> loop to count down from the number typed to 1, then print <code>Lift off!</code>',
    howto: { text: 'The 4 steps: ① set up the variable ② write the test ③ indent the body ④ change the variable inside. This example counts <strong>up</strong> from 1 to 3:',
             code: 'n = 1\nwhile n <= 3:\n    print(n)\n    n = n + 1' },
    samples: [[['Count down from? ', '3'], ['3'], ['2'], ['1'], ['Lift off!']]],
    starter: 'start = int(input("Count down from? "))\n',
    tests: [['3'], ['5'], ['1']],
    testNote: 'Checked by running it with 3, 5 and 1.',
    reqs: [
      { text: 'Use a <code>while</code> loop',
        test: raw => usesWhile(raw) },
      { text: 'Print every number from the one typed down to 1, one per line, then <code>Lift off!</code>',
        test: printsExactly(([s]) => [...Array(+s).keys()].map(i => String(+s - i)).concat('Lift off!')) },
    ] },

  // ── 5 · for loops & turtle (L4) ── 8 marks
  // The MTP's "which loop is appropriate and why?" item.
  { id: 'f_which', section: 'for', kind: 'mcq', pts: 1,
    q: 'A game asks for the password again and again until it is typed correctly. Which loop fits best, and why?',
    opts: ['while: nobody knows how many tries it takes', 'for: it repeats a fixed number of times', 'while: a for loop can never use input()', 'for: range() stops when the answer is right'],
    why: 'Use for when you know how many times to repeat, and while when it repeats until something happens.' },
  { id: 'f_range', section: 'for', kind: 'mcq', pts: 1,
    q: 'What does this program print? (Each number goes on its own line.)',
    variants: [
      { code: 'for i in range(4):\n    print(i)', opts: ['0 1 2 3', '1 2 3 4', '0 1 2 3 4', '4'] },
      { code: 'for i in range(3):\n    print(i)', opts: ['0 1 2', '1 2 3', '0 1 2 3', '3'] },
      { code: 'for i in range(5):\n    print(i)', opts: ['0 1 2 3 4', '1 2 3 4 5', '0 1 2 3 4 5', '5'] },
    ],
    why: 'range(n) counts from 0 and stops BEFORE n, so the loop runs n times.' },
  { id: 'f_shape', section: 'for', kind: 'mcq', pts: 1,
    q: 'What does the turtle draw?',
    variants: [
      { code: turtleStart + 'for i in range(3):\n    t.forward(100)\n    t.left(120)', opts: ['A triangle', 'A square', 'A hexagon', 'A straight line'] },
      { code: turtleStart + 'for i in range(6):\n    t.forward(80)\n    t.left(60)', opts: ['A hexagon', 'A triangle', 'A square', 'A straight line'] },
      { code: turtleStart + 'for i in range(4):\n    t.forward(100)\n    t.left(90)', opts: ['A square', 'A triangle', 'A hexagon', 'A straight line'] },
    ],
    why: 'The loop runs once per side: range() gives the number of sides, and each turn is 360 ÷ that number.' },
  { id: 'f_angle', section: 'for', kind: 'mcq', pts: 1,
    variants: [
      { q: 'To draw a regular <strong>octagon</strong> (8 sides), how far must the turtle turn after each side?', opts: ['45', '60', '90', '135'] },
      { q: 'To draw a regular <strong>decagon</strong> (10 sides), how far must the turtle turn after each side?', opts: ['36', '30', '45', '144'] },
      { q: 'To draw a regular <strong>nonagon</strong> (9 sides), how far must the turtle turn after each side?', opts: ['40', '30', '45', '140'] },
    ],
    why: 'To get back to the start, the turtle turns a full 360° altogether, so each turn is 360 ÷ the number of sides.' },
  { id: 'f_guide', section: 'for', kind: 'reqs', resettable: true,
    title: 'Write it: five times',
    goal: 'This program prints <strong>Ping</strong> 3 times. Change it so it prints <strong>Ping</strong> 5 times. Keep the <code>for</code> loop.',
    howto: { text: 'The number in <code>range( )</code> is how many times the loop runs. For example, this prints Hi 2 times:',
             code: 'for i in range(2):\n    print("Hi")' },
    starter: 'for i in range(3):\n    print("Ping")',
    tests: [[]],
    reqs: [
      { text: 'Print <code>Ping</code> exactly 5 times, using the <code>for</code> loop',
        test: (raw, runs) => usesFor(raw) && count(raw, /\bprint\s*\(/g) === 1 && printsExactly(() => Array(5).fill('Ping'))(raw, runs) },
    ] },
  { id: 'f_fix', section: 'for', kind: 'fix', turtle: true,
    title: 'Fix it: the square',
    goal: 'This program should draw a square, but the turtle draws a straight line. There is no error message. Fix it.',
    howto: { text: 'Every line that should repeat must be indented under the <code>for</code> line. For example, both prints here run each time round:',
             code: 'for i in range(2):\n    print("Step")\n    print("Turn")' },
    starter: turtleStart + 'for i in range(4):\n    t.forward(100)\nt.left(90)',
    tests: [[]],
    testNote: 'Checked by looking at what the turtle draws.',
    reqs: [
      { text: 'Draw a square, and nothing else',
        test: (raw, runs) => allOk(runs) && drewOnly(runs[0], 4) },
    ] },
  { id: 'f_write', section: 'for', kind: 'reqs', resettable: true, turtle: true,
    title: 'Write it: a pentagon',
    goal: 'Use a <code>for</code> loop to draw a regular <strong>pentagon</strong> (5 equal sides). Any size.',
    howto: { text: 'One time round the loop for each side: move forward, then turn. This example draws a triangle (3 sides, turning 120 each time):',
             code: 'for i in range(3):\n    t.forward(100)\n    t.left(120)' },
    starter: turtleStart + '# Draw a pentagon with a for loop\n',
    tests: [[]],
    testNote: 'Checked by looking at what the turtle draws.',
    reqs: [
      { text: 'Use a <code>for</code> loop with <code>range()</code>',
        test: raw => usesFor(raw) },
      { text: 'Draw a regular pentagon, and nothing else',
        test: (raw, runs) => allOk(runs) && drewOnly(runs[0], 5) },
    ] },

  // ── 6 · Functions (L5) ── 9 marks
  { id: 'd_def', section: 'functions', kind: 'mcq', pts: 1,
    q: 'This is the whole program. What happens when it runs?',
    code: 'def beep():\n    print("Beep")',
    opts: ['Nothing: def stores it but does not run it', 'Beep, once: def runs the code inside it', 'Beep, twice: once to save it, once to run it', 'A NameError: beep is used before it exists'],
    why: 'def only DEFINES the function: Python learns the name but does not run it. Nothing runs until the function is called.' },
  { id: 'd_call', section: 'functions', kind: 'mcq', pts: 1,
    q: 'Which line <strong>runs</strong> (calls) the function <code>beep</code>?',
    code: 'def beep():\n    print("Beep")',
    opts: ['beep()', 'def beep():', 'print(beep)', 'run beep'],
    why: 'A call is the name followed by round brackets, on its own line. def beep(): only defines it.' },
  { id: 'd_trace', section: 'functions', kind: 'trace',
    q: 'Play computer: what does this program print, in order?',
    variants: [
      { lines: ['def greet():', '    print("Hi")', 'print("Start")', 'greet()', 'print("End")'], vars: [], output: ['Start', 'Hi', 'End'] },
      { lines: ['def alarm():', '    print("Beep")', 'print("Ready")', 'alarm()', 'alarm()'], vars: [], output: ['Ready', 'Beep', 'Beep'] },
      { lines: ['def cheer():', '    print("Hooray")', 'cheer()', 'print("Done")', 'cheer()'], vars: [], output: ['Hooray', 'Done', 'Hooray'] },
    ] },
  { id: 'd_fix', section: 'functions', kind: 'fix',
    title: 'Fix it: define before you call',
    goal: 'This program should print the two lines below, but it stops with a NameError. Fix it (don\'t delete anything).',
    howto: { text: 'Python runs from the top, so it must read the <code>def</code> before the call. Put the call underneath the function. For example:',
             code: 'def menu():\n    print("1. Play")\n\nmenu()' },
    starter: 'say_hello()\n\ndef say_hello():\n    print("Hello there")\n    print("Nice to meet you")',
    tests: [[]],
    reqs: [
      { text: 'Print exactly <code>Hello there</code> then <code>Nice to meet you</code>, by calling <code>say_hello()</code>',
        test: (raw, runs) => calledAfterDef(raw, 'say_hello') && printsExactly(() => ['Hello there', 'Nice to meet you'])(raw, runs) },
    ] },
  { id: 'd_guide', section: 'functions', kind: 'reqs', resettable: true,
    title: 'Write it: call it twice',
    goal: 'This program prints nothing, because the function is never called. Add to it so it prints <code>Hip hip hooray!</code> <strong>twice</strong>, by calling <code>cheer()</code>',
    howto: { text: 'A call is the name and round brackets, with no indent, underneath the def. Each call runs the function once more. For example:',
             code: 'def beep():\n    print("Beep")\n\nbeep()' },
    starter: 'def cheer():\n    print("Hip hip hooray!")\n',
    tests: [[]],
    reqs: [
      { text: 'Print <code>Hip hip hooray!</code> twice by calling <code>cheer()</code> (only one <code>print</code> in the program)',
        test: (raw, runs) => callCount(raw, 'cheer') >= 1 && calledAfterDef(raw, 'cheer') && count(raw, /\bprint\s*\(/g) === 1
          && printsExactly(() => ['Hip hip hooray!', 'Hip hip hooray!'])(raw, runs) },
    ] },
  { id: 'd_write', section: 'functions', kind: 'reqs', resettable: true,
    title: 'Write it: your own function',
    goal: 'Define a function called <code>goodbye</code> that prints <code>See you soon</code> and then call it',
    howto: { text: '<code>def</code>, the name, round brackets and a colon; the lines inside are indented. Call it underneath, with no indent. For example:',
             code: 'def menu():\n    print("1. Play")\n    print("2. Quit")\n\nmenu()' },
    starter: '# Define goodbye, then call it\n',
    tests: [[]],
    reqs: [
      { text: 'Define a function called <code>goodbye</code> with <code>def</code>',
        test: raw => definedFunctions(raw).includes('goodbye') },
      { text: 'Call it, so the program prints <code>See you soon</code> (and nothing else)',
        test: (raw, runs) => calledAfterDef(raw, 'goodbye') && printsExactly(() => ['See you soon'])(raw, runs) },
    ] },

  // ── 7 · Write a program (L1–L5) ── 5 marks. Step comments, never a blank editor (Y8: 27%
  // from blank). One requirement per step, each its own mark.
  { id: 'p_till', section: 'program', kind: 'reqs', resettable: true, title: 'Write it: the cinema till',
    goal: 'Write a program for the cinema till. The comments in the editor give you the steps: write the code for each one under it. Here are two sample runs (yellow = typed by the customer):',
    samples: [
      [['Welcome to the cinema!'], ['How many tickets? ', '2'], ['Ticket'], ['Ticket']],
      [['Welcome to the cinema!'], ['How many tickets? ', '5'], ['Ticket'], ['Ticket'], ['Ticket'], ['Ticket'], ['Ticket'], ['Group discount!']],
    ],
    starter: '# Cinema till\n# Step 1: define a function called welcome that prints a welcome message\n\n# Step 2: call welcome\n\n# Step 3: ask how many tickets, as a whole number\n\n# Step 4: use a for loop to print Ticket once for each ticket\n\n# Step 5: if it is 5 or more tickets, print Group discount!\n',
    tests: [['2'], ['5'], ['1'], ['6']],
    testNote: 'Checked by running it with 2, 5, 1 and 6. The welcome message can use your own words.',
    reqs: [
      { text: 'Define a function with <code>def</code> and call it, so a welcome message is printed first',
        test: (raw, runs) => allOk(runs) && definedFunctions(raw).some(n => calledAfterDef(raw, n))
          && runs.every(r => { const l = printedLines(r)[0]; return l && !close(l, 'Ticket') && !/discount/i.test(l); }) },
      { text: 'Ask how many tickets with <code>input()</code>, and make it a whole number with <code>int()</code>',
        test: raw => inputCount(raw) >= 1 && intCount(raw) >= 1 },
      { text: 'Use a <code>for</code> loop with <code>range()</code>',
        test: raw => usesFor(raw) },
      { text: 'Print <code>Ticket</code> once for each ticket (2 lines of Ticket when 2 is typed)',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedLines(r).filter(l => close(l, 'Ticket')).length === +r.inputs[0]) },
      { text: '5 or more tickets prints <code>Group discount!</code> and fewer than 5 does not',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedLines(r).some(l => close(l, 'Group discount!')) === (+r.inputs[0] >= 5)) },
    ] },

  // ── ★ Bonus (not in the grade) ── 3 bonus marks: while + if/elif, word for word.
  { id: 'x_guess', section: 'ext', kind: 'reqs', bonus: true, title: 'Copy the machine: the guessing game',
    goal: 'The secret number is <strong>7</strong>. All that is left of this game is two sample runs. Write a program that behaves <strong>exactly</strong> the same way.',
    samples: [
      [['Guess: ', '3'], ['Too low'], ['Guess: ', '9'], ['Too high'], ['Guess: ', '7'], ['Correct! You took 3 guesses']],
      [['Guess: ', '6'], ['Too low'], ['Guess: ', '7'], ['Correct! You took 2 guesses']],
    ],
    starter: '# Guessing game\n',
    tests: [['3', '9', '7'], ['8', '1', '2', '7'], ['6', '7']],
    testNote: 'Checked with 3, 9, 7; then 8, 1, 2, 7; then 6, 7. The printed lines must match word for word.',
    reqs: [
      { text: 'Keep asking with <code>input()</code> in a <code>while</code> loop until 7 is guessed, with no errors',
        test: (raw, runs) => usesWhile(raw) && inputCount(raw) >= 1 && allOk(runs) },
      { text: 'After each wrong guess, print exactly <code>Too low</code> or <code>Too high</code>',
        test: (raw, runs) => allOk(runs) && runs.every(r => {
          const want = r.inputs.slice(0, -1).map(g => +g < 7 ? 'Too low' : 'Too high');
          const got = printedLines(r).filter(l => /^too (low|high)/i.test(squash(l)));
          return got.length === want.length && want.every((w, i) => same(got[i].replace(/[.!]+\s*$/, ''), w));
        }) },
      { text: 'Finish with exactly <code>Correct! You took N guesses</code> (with the right N)',
        test: (raw, runs) => allOk(runs) && runs.every(r => {
          const ls = printedLines(r);
          return ls.length && same(ls[ls.length - 1], `Correct! You took ${r.inputs.length} guesses`);
        }) },
    ] },
];

export const itemById = id => ITEMS.find(i => i.id === id);
// Retired questions (none yet) stay in ITEMS for L7 and are left out here; see the Y8 page.
export const LIVE_ITEMS = ITEMS.filter(i => !i.retired);
// Saved with every attempt, so L7 knows which version a student sat. Bump it when the
// questions change, as the Y8 assessment did.
export const VERSION = 1;

// Marks available for an item (for this student's version).
export function itemMax(item, seed = 0) {
  const v = variantOf(item, seed);
  if (v.kind === 'trace') return v.vars.length + v.output.length;
  if (v.kind === 'branch') return v.rows.length;
  if (v.reqs) return v.reqs.length;
  return v.pts;
}

// Branch rows: the four printed outcomes a row can choose from (index 0..3). With an
// if / elif / else (msgs), the 4th is two messages: the "elif runs too" mistake.
export const branchChoices = v => v.msgs
  ? [...v.msgs.map(m => `${m}, then ${v.after}`), `${v.msgs[0]} and ${v.msgs[1]}, then ${v.after}`]
  : [`${v.a}, then ${v.after}`, `${v.b}, then ${v.after}`, `${v.a} only`, `${v.b} only`];
export const branchAnswer = row => (typeof row[1] === 'number' ? row[1] : row[1] === 'a' ? 0 : 1);

// Section and overall totals. points: { itemId: best marks so far }.
export function summarise(points, seed = 0) {
  const sections = {};
  for (const s of SECTIONS) sections[s.id] = { earned: 0, max: 0 };
  for (const it of LIVE_ITEMS) {
    sections[it.section].max += itemMax(it, seed);
    sections[it.section].earned += points[it.id] || 0;
  }
  const core = SECTIONS.filter(s => !s.bonus);
  const earned = core.reduce((t, s) => t + sections[s.id].earned, 0);
  const max = core.reduce((t, s) => t + sections[s.id].max, 0);
  return { sections, earned, max, pct: max ? Math.round(earned / max * 100) : 0, bonus: sections.ext.earned };
}

// ═════════════════════════════════════════════════════════════════════════════
// Station Zero — the closing report (MTP Chapter map, L6; Decisions 2026-11-25).
// The score NEVER changes the story. The report is an inventory of what the student's own
// choices (L1–L5, localStorage / Drive 'sz_choices') have left them, then the breach: the
// crisis that L7's repairs settle, using the tools the surviving crew give them.
// The predicates are copied from The Drone's story script (L5); keep them in step with it.
// ═════════════════════════════════════════════════════════════════════════════

// Keep only what a choice can look like (the Drive copy is a file the student could edit).
export function cleanChoices(raw) {
  const out = { _at: {} };
  if (!raw || typeof raw !== 'object') return out;
  const at = raw._at && typeof raw._at === 'object' ? raw._at : {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === '_at' || !/^[a-z]\w{0,19}$/.test(k) || typeof v !== 'string' || !/^[a-z][a-z0-9_]{0,19}$/.test(v)) continue;
    out[k] = v;
    out._at[k] = Number.isFinite(at[k]) ? at[k] : 0;
  }
  return out;
}
// For each choice, the one made most recently wins (as the chapters' pull()).
export function mergeChoices(local, remote) {
  const a = cleanChoices(local), b = cleanChoices(remote), out = { ...a, _at: { ...a._at } };
  for (const k of Object.keys(b._at)) {
    if (!(k in a._at) || b._at[k] > a._at[k]) { out[k] = b[k]; out._at[k] = b._at[k]; }
  }
  return out;
}

// ── L2 Proximity
const shield = c => c.shield === 'pod3' ? 'pod3' : 'pod5';
const X = c => shield(c) === 'pod5' ? { pod: 3, name: 'Chen' } : { pod: 5, name: 'Patel' };
const SAVED = c => shield(c) === 'pod5' ? { pod: 5, name: 'Patel' } : { pod: 3, name: 'Chen' };
const lockdown = c => c.lockdown === 'sensors' ? 'sensors' : 'cryo';
const power = c => c.power === 'sensors' || c.power === 'pods' ? c.power : lockdown(c) === 'cryo' ? 'sensors' : 'pods';
const xDead = c => !!c.shield && c.lockdown !== 'cryo' && c.power !== 'pods';
const sensorsLost2 = c => lockdown(c) === 'cryo' && power(c) === 'pods';
// ── L3 Locked In
const injured3 = c => c.heat === 'cryo' && c.seals !== 'warden';
const heatersOut = c => c.heat === 'fast' && c.seals !== 'warden';
const wardenSeals = c => c.seals === 'warden' || (!c.seals && !c.heat && !c.airlock);
// ── L4 Distress Signal
const signal = c => c.signal === 'mayday' ? 'mayday' : 'quarantine';
const flare = c => c.flare === 'warning' || c.flare === 'medical' ? c.flare : signal(c) === 'mayday' ? 'warning' : 'medical';
const fuel = c => c.fuel === 'pods' ? 'pods' : 'orbit';
const fast = c => c.fuel ? c.signal === 'mayday' || c.flare === 'medical' : signal(c) === 'mayday' || flare(c) === 'medical';
const prepared = c => c.signal === 'mayday' ? c.flare === 'warning' : signal(c) === 'quarantine' || flare(c) === 'warning';
const lands4 = c => !!c.fuel && !fast(c);
const savedDead = c => lands4(c) && fuel(c) === 'orbit' && !xDead(c);
const savedHurt = c => lands4(c) && fuel(c) === 'orbit' && xDead(c);
const clipped = c => lands4(c) && fuel(c) === 'pods';
// ── L5 The Drone
const wake = c => c.wake === 'under' ? 'under' : 'awake';
const drone = c => c.drone === 'scout' ? 'scout' : 'guard';
const better = c => wake(c) === 'awake' && drone(c) === 'guard' ? 'camera' : 'pod1';
const priority = c => c.priority === 'pod1' || c.priority === 'camera' ? c.priority : better(c);
const okDanger = c => c.wake === 'under' ? c.priority !== 'pod1'
  : c.wake === 'awake' ? c.drone !== 'guard' && c.priority !== 'pod1' : false;
const okaforDead = c => okDanger(c) && !savedDead(c);
const okaforHurt = c => okDanger(c) && savedDead(c);
const nestKnown = c => drone(c) === 'scout' || priority(c) === 'camera';

// Where the story stands after L5, for this report and for L7.
//   crew: { okafor, chen, patel } each 'alive' | 'injured' | 'dead'; you: 'ok' | 'injured'.
export function stationState(choices) {
  const c = cleanChoices(choices);
  const crew = { okafor: 'alive', chen: 'alive', patel: 'alive' };
  const key = m => m.name.toLowerCase();
  if (xDead(c)) crew[key(X(c))] = 'dead';
  if (savedDead(c)) crew[key(SAVED(c))] = 'dead';
  else if (savedHurt(c)) crew[key(SAVED(c))] = 'injured';
  if (okaforDead(c)) crew.okafor = 'dead';
  else if (okaforHurt(c)) crew.okafor = 'injured';
  const alive = 1 + Object.values(crew).filter(s => s !== 'dead').length;   // + you; Hale is gone
  return {
    crew, alive,
    you: injured3(c) || clipped(c) ? 'injured' : 'ok',
    okaforAwake: wake(c) === 'awake' && crew.okafor !== 'dead',
    wardenSeals: wardenSeals(c),
    nestKnown: nestKnown(c),
    sensors: sensorsLost2(c) || clipped(c) ? 'damaged' : 'online',
    heatersOut: heatersOut(c),
    shipFast: fast(c),
    shipPrepared: prepared(c),
  };
}

const LEVEL = { alive: 'ok', injured: 'warn', dead: 'danger' };
const WORD = { alive: 'Alive', injured: 'Injured', dead: 'Lost' };

// The inventory: readout rows { label, value, level: 'ok' | 'warn' | 'danger' }.
export function inventoryRows(st) {
  const crewRow = (name, role, s, extra = '') => ({ label: `${name} · ${role}`, value: WORD[s] + (s !== 'dead' ? extra : ''), level: LEVEL[s] });
  return [
    { label: 'Crew alive', value: `${st.alive} of 5`, level: st.alive < 4 ? 'danger' : 'ok' },
    crewRow('Okafor', 'Commander', st.crew.okafor, st.okaforAwake ? ' · awake' : ' · in cryo'),
    crewRow('Chen', 'Medic', st.crew.chen, ' · in cryo'),
    crewRow('Patel', 'Pilot', st.crew.patel, ' · in cryo'),
    { label: 'You', value: st.you === 'injured' ? 'Injured' : 'OK', level: st.you === 'injured' ? 'warn' : 'ok' },
    { label: 'Airlock seals', value: st.wardenSeals ? 'WARDEN' : 'Manual override', level: st.wardenSeals ? 'ok' : 'warn' },
    { label: 'Nest location', value: st.nestKnown ? 'Maintenance' : 'Unknown', level: st.nestKnown ? 'ok' : 'warn' },
    { label: 'Sensors', value: st.sensors === 'online' ? 'Online' : 'Damaged', level: st.sensors === 'online' ? 'ok' : 'warn' },
    { label: 'Cryo heaters', value: st.heatersOut ? 'Burnt out' : 'Working', level: st.heatersOut ? 'danger' : 'ok' },
    { label: 'Rescue ship', value: `${st.shipFast ? 'ETA 1 day' : 'ETA 3 days'} · ${st.shipPrepared ? 'containment ready' : 'not warned'}`,
      level: st.shipFast && st.shipPrepared ? 'ok' : 'warn' },
  ];
}

// The breach (L6's cliffhanger). Three problems, each with the crew member whose skill fixes it
// in L7. A living crew member (injured counts: they can still talk you through it) is the full
// fix; without them, L7 falls back to a weaker one. "You" are hurt in the jolt on every path.
export const BREACH_PROBLEMS = [
  { id: 'storm',  problem: 'Orbit failing: the station is falling into the storm', who: 'patel',  role: 'Pilot',
    fix: 'Patel can steer the station out of the storm.', fallback: 'WARDEN\'s autopilot is slow and rough.' },
  { id: 'wound',  problem: 'You are hurt: thrown against a bulkhead',             who: 'chen',   role: 'Medic',
    fix: 'Chen can patch you up.',                         fallback: 'The med kit will only slow the bleeding.' },
  { id: 'clamps', problem: 'Docking clamps hijacked: it is trying to reach the ship', who: 'okafor', role: 'Commander',
    fix: 'Okafor\'s command codes can take the clamps back.', fallback: 'Without the codes, you will have to cut the power by hand.' },
];
export function breachTools(st) {
  return BREACH_PROBLEMS.map(p => ({ ...p, name: p.who[0].toUpperCase() + p.who.slice(1), ready: st.crew[p.who] !== 'dead' }));
}
