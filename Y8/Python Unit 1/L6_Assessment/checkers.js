// Question bank + marking logic for 1_Python_Assessment.html — the Y8 Python Unit 1
// end-of-unit assessment (Lesson 6). Not PRIMM: this lesson MEASURES. See the Unit 1 MTP.
//
// What the assessment is built on (lessons from the Unit 2 assessment and the units since):
//   • Weighted toward READING, TRACING and SPOT-AND-FIX, with one short write task preceded
//     by a trivial warm-up edit, so nobody starts writing from a blank page.
//   • Every lesson section ends with a small "Write it" task: one skill, a starter
//     line or comment to build on. These are the easy marks for writing code.
//   • Revised after the first sitting (class mean 37%): the questions under ~40% were made
//     fairer (no self-joining in the trace, spaces inside the quotes, quotes optional on
//     trace values, recognition instead of prediction for quotes-vs-variable and ==), and
//     the game shop starts with step comments.
//   • Revised after the second sitting (mean 47%, 54 students): the low scorers answered the
//     multiple-choice questions but skipped the code, so Casting and Selection now OPEN with a
//     guided 1-mark code task. Trace boxes forgive capital letters (like the printed lines);
//     two questions that didn't separate strong from weak students (v_order, c_str) are
//     retired: kept here, unmarked and unshown, so L7 can still use them for that sitting.
//   • Revised after the third sitting (19 Oct 2026, mean 38%, 25 students): low scorers still
//     skipped the typed tasks but answered what they could click, so Casting and Selection now
//     open with a "pick the line" question before the guided task. Students typed answers into
//     the code (print(5 + 3), print("13")) instead of using the variables, so "4, then 5"
//     (c_join, which never separated strong from weak) became "which line works whatever is
//     typed" (c_total); every code task that starts from code has a worked example, and a
//     program that prints the same thing whatever is typed is told so. The trace shows the
//     boxes first again (with the printed lines first, half read "line 1" as the program's).
//     What a code task prints is marked on its letters and numbers only (loose): capitals,
//     spaces and punctuation are forgiven ("helloSam", "It is fun,"), with a "no marks lost"
//     note, and a line a letter or two out gets "Nearly: it printed … where it should print …".
//     The trace output and the bonus extension still check the spaces exactly.
//   • One section per lesson (L1–L5), so the DIRT lesson (L7) can route students to the
//     lessons they need. Per-section scores go to Drive via Classroom.submitResults().
//   • Multiple-choice, trace and sort answers are ONE TRY: they lock when checked, show the
//     right answer, and the lock is saved at once (a refresh can't dodge it). Options are
//     shuffled per student; opts[0] is always the right answer here. Lengths are balanced
//     (the right answer is not the longest option on half the questions or more).
//   • Several items come in parallel versions (same structure, different values), picked
//     per student from a saved seed, so neighbours' screens don't match.
//   • Code tasks are judged on what the program DOES (run with several test inputs, one
//     each side of every boundary), never on one exact way of writing it. They can be
//     checked as often as needed; the best score is kept.
//   • Few coaching hints: a failed requirement is named, not solved; the worked examples show
//     the pattern in a different program. The bonus extension is
//     outside the grade, so 100% is reachable without it.
//
// A "run" is what runPython() resolved with, plus the inputs it was given:
//   { inputs: string[], ok: boolean, output: string }

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

// ── Sections ─────────────────────────────────────────────────────────────────

export const SECTIONS = [
  { id: 'output',    n: '1', label: 'Output & errors',      lesson: 'Lesson 1' },
  { id: 'variables', n: '2', label: 'Variables',            lesson: 'Lesson 2' },
  { id: 'input',     n: '3', label: 'Input',                lesson: 'Lesson 3' },
  { id: 'casting',   n: '4', label: 'Data types & casting', lesson: 'Lesson 4' },
  { id: 'selection', n: '5', label: 'Selection',            lesson: 'Lesson 5' },
  { id: 'write',     n: '6', label: 'Write a program',      lesson: 'Lessons 1–5' },
  { id: 'ext',       n: '★', label: 'Extension',            lesson: 'Bonus', bonus: true },
];

// ── The questions ────────────────────────────────────────────────────────────
// kinds: mcq (1 mark) · trace (1 per box / output line) · branch (1 per row)
//        sort (1 per 2 cards) · fix and reqs (run + check, 1 per requirement)
//        A fix item has a Reset button and starts from broken code; a reqs item may not.

const WRITE_TESTS = [['Ava', '15'], ['Ben', '12'], ['Leo', '9'], ['Mia', '11']];
const PIN_TESTS   = [['1234'], ['1233'], ['1235']];
const WARM_TESTS  = [['25'], ['24'], ['31'], ['10']];
const EXT_TESTS   = [['30', '36'], ['30', '30'], ['50', '72'], ['20', '15']];
const O_WRITE = () => ['I am learning Python', 'It is fun'];
const GREETING = /hello|hiya|hey|\bhi/i;
const runFor = (runs, ...inputs) => runs.find(r => r.inputs.join('|') === inputs.join('|'));
const allOk = runs => runs.length > 0 && runs.every(r => r.ok);

export const ITEMS = [
  // ── 1 · Output & errors (Lesson 1) ── 8 marks
  { id: 'o_print', section: 'output', kind: 'mcq', pts: 1,
    q: 'Which line prints the message <strong>Good morning</strong>?',
    opts: ['print("Good morning")', 'Print("Good morning")', 'print(Good morning)', 'print "Good morning"'],
    why: 'print is all lower case, needs round brackets, and text needs quotes.' },
  { id: 'o_lines', section: 'output', kind: 'mcq', pts: 1,
    q: 'How many lines does this program print? Count blank lines too.',
    variants: [
      { code: 'print("Ready")\nprint()\nprint("Steady")\nprint()\nprint("Go!")', opts: ['5', '3', '4', '2'] },
      { code: 'print("Top")\nprint()\nprint()\nprint("Bottom")', opts: ['4', '2', '3', '1'] },
      { code: 'print("One")\nprint("Two")\nprint()\nprint("Three")', opts: ['4', '3', '2', '5'] },
    ],
    why: 'print() with nothing inside still prints a line: an empty one.' },
  { id: 'o_errline', section: 'output', kind: 'mcq', pts: 1,
    q: 'This program should print the score. Python shows the error below. <strong>Which line has the bug?</strong>',
    code: 'print("Starting...")\nscore = 10\nprint(scroe)',
    error: 'Traceback (most recent call last):\n  File "main.py", line 3, in <module>\n    print(scroe)\nNameError: name \'scroe\' is not defined',
    opts: ['Line 3', 'Line 1', 'Line 2', 'All of them'],
    why: 'The error names the line: line 3. Read the last line of the error, then find that line number.' },
  { id: 'o_errfix', section: 'output', kind: 'mcq', pts: 1,
    q: 'Same program. Which change makes it print <strong>10</strong>?',
    code: 'print("Starting...")\nscore = 10\nprint(scroe)',
    opts: ['Spell score correctly on line 3', 'Put quotes around scroe on line 3', 'Delete line 2 from the program', 'Add a space before print on line 3'],
    why: 'scroe is a spelling mistake. Python only knows the box called score, so spell it the same way.' },
  { id: 'o_fix', section: 'output', kind: 'fix',
    title: 'Fix it: the welcome message',
    goal: 'This program should print the three lines below. It has one bug. Fix it (don\'t delete anything).',
    howto: { text: 'Text needs a double quote at the start <strong>and</strong> at the end, inside the brackets. Check every line for both. For example:',
             code: 'print("See you soon")' },
    starter: 'print("Welcome to the quiz!")\nprint("Good luck)\nprint("Question 1 is coming up")',
    tests: [[]],
    reqs: [
      { text: 'Print exactly these three lines and nothing else: <code>Welcome to the quiz!</code> then <code>Good luck</code> then <code>Question 1 is coming up</code>',
        test: printsExactly(() => ['Welcome to the quiz!', 'Good luck', 'Question 1 is coming up']) },
    ] },
  // Guided: the "How to do it" box shows the exact line, to build confidence.
  { id: 'o_copy', section: 'output', kind: 'reqs', resettable: true,
    title: 'Write it: your first line',
    goal: 'Type the line in the box below into the editor, exactly as it is. Then press ▶ Run code and ✓ Check.',
    howto: { text: 'Copy it letter for letter: <code>print</code> in lower case, round brackets, and the text inside double quotes.',
             code: 'print("Hello, world!")' },
    starter: '# Type the line under this comment\n',
    tests: [[]],
    reqs: [
      { text: 'Print exactly <code>Hello, world!</code>',
        test: printsExactly(() => ['Hello, world!']) },
    ] },
  { id: 'o_write', section: 'output', kind: 'reqs', resettable: true,
    title: 'Write it: two lines',
    goal: 'Write a program that prints the two lines below, one under the other.',
    howto: { text: 'Use one <code>print()</code> for each line, with the text inside double quotes. This example prints two different lines:',
             code: 'print("Good morning")\nprint("Time for school")' },
    samples: [[['I am learning Python'], ['It is fun']]],
    starter: '# Print two lines\n',
    tests: [[]],
    reqs: [
      { text: 'The first line printed is exactly <code>I am learning Python</code>',
        test: withText(O_WRITE, (raw, runs) => allOk(runs) && close(printedLines(runs[0])[0] || '', 'I am learning Python')) },
      { text: 'The second line printed is exactly <code>It is fun</code>, and nothing else is printed',
        test: withText(O_WRITE, (raw, runs) => allOk(runs) && printedLines(runs[0]).length === 2 && close(printedLines(runs[0])[1], 'It is fun')) },
    ] },

  // ── 2 · Variables (Lesson 2) ── 8 marks
  // The trace tests that a new value REPLACES the old one, and that a print() that ran earlier
  // used the old value. (Joining a variable onto itself was dropped: 9% in the first sitting.)
  { id: 'v_trace', section: 'variables', kind: 'trace',
    q: 'Play computer: run this program in your head, line by line.',
    variants: [
      { lines: ['pet = "cat"', 'owner = "Tom"', 'print(owner + " has a " + pet)', 'pet = "dog"', 'print(owner + " has a " + pet)'],
        vars: [{ name: 'pet', type: 'str', value: 'dog' }, { name: 'owner', type: 'str', value: 'Tom' }],
        output: ['Tom has a cat', 'Tom has a dog'] },
      { lines: ['food = "pizza"', 'chef = "Ed"', 'print(chef + " cooks " + food)', 'food = "pasta"', 'print(chef + " cooks " + food)'],
        vars: [{ name: 'food', type: 'str', value: 'pasta' }, { name: 'chef', type: 'str', value: 'Ed' }],
        output: ['Ed cooks pizza', 'Ed cooks pasta'] },
      { lines: ['drink = "tea"', 'friend = "Jo"', 'print(friend + " likes " + drink)', 'drink = "milk"', 'print(friend + " likes " + drink)'],
        vars: [{ name: 'drink', type: 'str', value: 'milk' }, { name: 'friend', type: 'str', value: 'Jo' }],
        output: ['Jo likes tea', 'Jo likes milk'] },
    ] },
  // Recognise the right line, rather than predict a trap (24% when it asked what print("city") shows).
  { id: 'v_quotes', section: 'variables', kind: 'mcq', pts: 1,
    q: '<code>city</code> holds the text Leeds. Which line uses the variable to print <strong>Leeds</strong>?',
    code: 'city = "Leeds"',
    opts: ['print(city)', 'print("city")', 'print(City)', 'print(Leeds)'],
    why: 'Without quotes, city means the box, so print(city) shows what is in it. print("city") shows the word city; City and Leeds are names Python has never seen.' },
  // Retired after the second sitting (39%, barely separated strong from weak students).
  { id: 'v_order', section: 'variables', kind: 'mcq', pts: 1, retired: true,
    q: 'Python runs a program one line at a time, starting at the top. What happens when this program runs?',
    code: 'print("Total: " + total)\ntotal = "50"',
    opts: ['A NameError on line 1', 'It prints Total: 50', 'It prints Total: total', 'A SyntaxError on line 2'],
    why: 'Python runs from the top. Line 1 uses total before line 2 has made it, so it is a NameError.' },
  { id: 'v_change', section: 'variables', kind: 'reqs', resettable: true,
    title: 'Write it: change the box',
    goal: 'This program prints <strong>cat</strong>. Change <strong>line 1 only</strong> so that it prints <strong>dog</strong>',
    howto: { text: 'Change the word inside the quotes on line 1, and keep the quotes. Leave line 2 alone: <code>print(pet)</code> prints whatever is in the box. For example, this changes a box from chips to pizza:',
             code: 'food = "pizza"\nprint(food)' },
    starter: 'pet = "cat"\nprint(pet)',
    tests: [[]],
    reqs: [
      { text: 'Print <code>dog</code>, with <code>print(pet)</code> still on line 2',
        test: withText(() => ['dog'], (raw, runs) => allOk(runs) && printedLines(runs[0]).length === 1 && close(printedLines(runs[0])[0], 'dog')
          && /\bprint\s*\(\s*pet\s*\)/.test(normalise(raw))) },
    ] },
  { id: 'v_write', section: 'variables', kind: 'reqs', resettable: true,
    title: 'Write it: a variable',
    goal: 'Make a variable called <code>colour</code> that holds the text <strong>blue</strong>. Then print what is in the box.',
    howto: { text: 'Write the name of the box, then <code>=</code>, then the text in quotes. On the next line, put the box name inside <code>print()</code> with <strong>no</strong> quotes. For example:',
             code: 'animal = "cat"\nprint(animal)' },
    starter: '# Make the variable, then print it\n',
    tests: [[]],
    reqs: [
      { text: 'Make a variable called <code>colour</code> and store the text <code>"blue"</code> in it',
        test: raw => /^\s*colour\s*=\s*(["'])blue\1\s*$/im.test(raw.replace(/#[^\n]*/g, '')) },
      { text: 'Print <code>blue</code> by using the <strong>variable</strong> (not the word in quotes)',
        test: (raw, runs) => allOk(runs) && printedLines(runs[0]).some(l => close(l, 'blue'))
          && /\bprint\s*\([^)]*\bcolour\b/.test(normalise(raw)) },
    ] },

  // ── 3 · Input (Lesson 3) ── 6 marks
  { id: 'i_prompt', section: 'input', kind: 'mcq', pts: 1,
    q: 'The user types <strong>Hull</strong>. What is stored in <code>town</code>?',
    code: 'town = input("Where do you live? ")',
    opts: ['Hull', 'Where do you live?', 'town', 'Nothing is stored'],
    why: 'The text in the brackets is only shown as a question. Only the answer the user types is stored.' },
  // The space is inside the quotes, so this tests what input() stores and what + joins, not
  // the missing-space trap (0% in the first sitting; the trap is practised in L7). The name
  // typed is in the question itself: in the second sitting a quarter wrote "Welcome name!".
  { id: 'i_trace', section: 'input', kind: 'trace',
    variants: [
      { q: 'When the program runs, the user types <strong>Sam</strong> at the <code>Name?</code> question. Type exactly what the <code>print()</code> line shows.', lines: ['name = input("Name? ")', 'print("Hello " + name + "!")'], typed: { 0: 'Sam' }, vars: [], output: ['Hello Sam!'] },
      { q: 'When the program runs, the user types <strong>Kim</strong> at the <code>Name?</code> question. Type exactly what the <code>print()</code> line shows.', lines: ['name = input("Name? ")', 'print("Welcome " + name + "!")'], typed: { 0: 'Kim' }, vars: [], output: ['Welcome Kim!'] },
      { q: 'When the program runs, the user types <strong>Raj</strong> at the <code>Name?</code> question. Type exactly what the <code>print()</code> line shows.', lines: ['name = input("Name? ")', 'print("Morning " + name + "!")'], typed: { 0: 'Raj' }, vars: [], output: ['Morning Raj!'] },
    ] },
  { id: 'i_store', section: 'input', kind: 'mcq', pts: 1,
    q: 'Which line asks for the user\'s age <strong>and stores the answer</strong>?',
    opts: ['age = input("Age? ")', 'input("Age? ") = age', 'age = "input(Age?)"', 'print(input("Age? "))'],
    why: 'input() asks the question; = stores what comes back in the box on the left.' },
  { id: 'i_fix', section: 'input', kind: 'fix',
    title: 'Fix it: the favourite animal',
    goal: 'Ask for a favourite animal, then print e.g. I like cats too! (when cat is typed). It has one bug.',
    howto: { text: 'A variable must be spelt <strong>exactly</strong> the same every time it is used. Join the box into the message, not the word that was typed, so it works whatever the user types. For example:',
             code: 'colour = input("Favourite colour? ")\nprint("I like " + colour + " too!")' },
    starter: 'animal = input("What is your favourite animal? ")\nprint("I like " + aminal + "s too!")',
    tests: [['cat'], ['owl']],
    testNote: 'Checked by running it with cat and then owl.',
    reqs: [
      { text: 'Print <code>I like cats too!</code> when <code>cat</code> is typed, and the same for any animal typed',
        test: printsExactly(([a]) => [`I like ${a}s too!`]) },
    ] },
  { id: 'i_write', section: 'input', kind: 'reqs', resettable: true,
    title: 'Write it: say hello',
    goal: 'Ask the user for their name, then say hello to them. Here is a sample run (yellow = typed by the user):',
    howto: { text: 'Put <code>input()</code> on the right of <code>=</code> so the answer is stored in a box. Then join the box onto your message with <code>+</code>, with a space inside the quotes. For example:',
             code: 'food = input("What is your favourite food? ")\nprint("I like " + food)' },
    samples: [[['What is your name? ', 'Sam'], ['Hello Sam']]],
    starter: '# Ask their name, then say hello\n',
    tests: [['Sam'], ['Priya']],
    testNote: 'Checked by running it with Sam and then Priya.',
    reqs: [
      { text: 'Ask for the name with <code>input()</code> and store the answer in a variable',
        test: raw => /\b\w+\s*=\s*input\s*\(/.test(normalise(raw)) },
      { text: 'Print a hello message that includes the name that was typed (e.g. <code>Hello Sam</code>)',
        test: (raw, runs) => allOk(runs) && runs.every(r =>
          printedLines(r).some(l => GREETING.test(l) && l.toLowerCase().includes(r.inputs[0].toLowerCase()))) },
    ],
    // "helloSam" gets the mark (2 students in the third sitting), with a note about the space.
    tipMsg: (raw, runs) => runs.some(r => printedLines(r).some(l => l.toLowerCase().replace(/[^a-z]/g, '').includes(
      'hello' + r.inputs[0].toLowerCase()) && !/hello\W+\w/i.test(l)))
      ? ' (The words run together: put a space inside the quotes, like "Hello " + name.)' : '' },

  // ── 4 · Data types & casting (Lesson 4) ── 11 marks
  // Pick the line, then type it: in the third sitting the low scorers answered what they
  // could click but left the guided code task untouched (0 of 11).
  { id: 'c_pick', section: 'casting', kind: 'mcq', pts: 1,
    q: 'Type <strong>5</strong> and this program prints <strong>55</strong>, not 10. Which <strong>line 1</strong> makes it print <strong>10</strong>?',
    code: 'num = input("Pick a number: ")\nprint(num * 2)',
    opts: ['num = int(input("Pick a number: "))', 'num = input(int("Pick a number: "))', 'num = int("Pick a number: ")', 'num = input("Pick a number: ") * 2'],
    why: 'int() goes round the whole input(...), so the answer typed becomes a number before it is stored. Then num * 2 does maths.' },
  // Guided, and early in the section: in the second sitting the low scorers answered the
  // multiple-choice questions but never reached the code below them.
  { id: 'c_guide', section: 'casting', kind: 'reqs', resettable: true,
    title: 'Write it: make it a number',
    goal: 'Type <strong>5</strong> and this program prints <strong>55</strong>, not 10, because <code>input()</code> gives back text. Change <strong>line 1 only</strong> so that typing 5 prints 10. Leave line 2, <code>print(num * 2)</code>, exactly as it is.',
    howto: { text: 'Put <code>int( )</code> around the whole <code>input(...)</code>, so the answer becomes a whole number before it is stored. Count the brackets: one more <code>)</code> at the end. For example:',
             code: 'score = int(input("Score? "))' },
    starter: 'num = input("Pick a number: ")\nprint(num * 2)',
    tests: [['5'], ['12']],
    testNote: 'Checked by running it with 5 and then 12.',
    reqs: [
      { text: 'Print double the number typed (<strong>10</strong> when 5 is typed), using <code>int()</code>',
        test: (raw, runs) => intCount(raw) >= 1 && printsExactly(([n]) => [String(Number(n) * 2)])(raw, runs) },
    ] },
  // Two num cards swapped for plain text-vs-number ones (41% in the first sitting).
  { id: 'c_sort', section: 'casting', kind: 'sort', pts: 3,
    q: 'This line ran first, so <code>num</code> holds whatever the user typed:',
    code: 'num = input("Number? ")',
    bins: [{ id: 'join', label: '🧵 Joins text' }, { id: 'maths', label: '🔢 Does maths' }, { id: 'error', label: '💥 TypeError (crashes)' }],
    cards: [
      { id: 'k1', expr: '"7" + "2"',        bin: 'join'  },
      { id: 'k2', expr: '7 + 2',            bin: 'maths' },
      { id: 'k3', expr: '"Total: " + 5',    bin: 'error' },
      { id: 'k4', expr: '"Hi " + "Sam"',    bin: 'join'  },
      { id: 'k5', expr: 'int(num) * 2',     bin: 'maths' },
      { id: 'k6', expr: '"Age: " + 12',     bin: 'error' },
    ] },
  // Retired after the third sitting (20% and 33%, separated strong from weak in neither).
  { id: 'c_join', section: 'casting', kind: 'mcq', pts: 1, retired: true,
    variants: [
      { q: 'The user types <strong>4</strong>, then <strong>5</strong>. What is printed?', opts: ['45', '9', '4 5', 'A TypeError'] },
      { q: 'The user types <strong>2</strong>, then <strong>6</strong>. What is printed?', opts: ['26', '8', '2 6', 'A TypeError'] },
      { q: 'The user types <strong>3</strong>, then <strong>7</strong>. What is printed?', opts: ['37', '10', '3 7', 'A TypeError'] },
    ],
    code: 'a = input("First number? ")\nb = input("Second number? ")\nprint(a + b)',
    why: 'input() always gives back text, and + joins text. Nothing was cast with int().' },
  // In its place: in the third sitting students typed the numbers into their code
  // (print(5 + 3), print("13")) instead of using the variables.
  { id: 'c_total', section: 'casting', kind: 'mcq', pts: 1,
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
  { id: 'c_int', section: 'casting', kind: 'mcq', pts: 1,
    q: 'Which of these is an <strong>int</strong> (a whole number)?',
    opts: ['12', '"12"', '12.5', '"twelve"'],
    why: 'An int is a whole number with no quotes. 12.5 has a decimal point, so it is a float; anything in quotes is text.' },
  // Retired after the second sitting (15%, answers spread like guesses; L7 still teaches str()).
  { id: 'c_str', section: 'casting', kind: 'mcq', pts: 1, retired: true,
    q: '<code>points</code> holds the number 10. Text and a number can\'t be joined with + until the number is turned into text. Which line prints <strong>Points: 10</strong>?',
    opts: ['print("Points: " + str(points))', 'print("Points: " + int(points))', 'print("Points: " + "points")', 'print("Points: " + points)'],
    why: 'str() turns the number into text so it can be joined with +.' },
  { id: 'c_fix', section: 'casting', kind: 'fix',
    title: 'Fix it: the fruit bowl',
    goal: 'Typing 5 and 3 should print Fruit in the bowl: 8 — but it prints 53. There is no error message. Fix it.',
    howto: { text: '<code>input()</code> gives back text, and <code>+</code> joins text. Put <code>int( )</code> round an <code>input(...)</code> to store a number instead. Keep using the variables: don\'t type 5 and 3 into the code, because it is checked with other numbers too. For example:',
             code: 'cats = int(input("How many cats? "))' },
    starter: 'apples = input("How many apples? ")\npears = input("How many pears? ")\ntotal = apples + pears\nprint("Fruit in the bowl:", total)',
    tests: [['5', '3'], ['12', '30']],
    testNote: 'Checked by running it with 5 and 3, then 12 and 30.',
    reqs: [
      { text: '<strong>Add</strong> the two numbers instead of joining them (5 and 3 should give 8, not 53)',
        test: (raw, runs) => allOk(runs) && runs.every(r => {
          const [a, b] = r.inputs, ns = printedNumbers(r);
          return ns.includes(Number(a) + Number(b)) && !ns.includes(Number(a + b));
        }) },
      { text: 'Print exactly <code>Fruit in the bowl: 8</code> when 5 and 3 are typed',
        test: withText(([a, b]) => [`Fruit in the bowl: ${Number(a) + Number(b)}`], (raw, runs) => allOk(runs) && runs.every(r =>
          printedLines(r).some(l => close(l, `Fruit in the bowl: ${Number(r.inputs[0]) + Number(r.inputs[1])}`))), true) },
    ] },
  { id: 'c_write', section: 'casting', kind: 'reqs', resettable: true,
    title: 'Write it: next year',
    goal: 'This line asks for an age. Add to the program so it prints how old the user will be <strong>next year</strong>.',
    howto: { text: 'Make the answer a number with <code>int( )</code>, then do the maths with the <strong>variable</strong>, not a number you typed in: it must work for any age. For example, this doubles any score typed:',
             code: 'score = int(input("Score? "))\nprint("Double is", score * 2)' },
    samples: [[['How old are you? ', '12'], ['Next year you will be 13']]],
    starter: 'age = input("How old are you? ")\n',
    tests: [['12'], ['7']],
    testNote: 'Checked by running it with 12 and then 7. Your message can use your own words.',
    reqs: [
      { text: 'Turn the answer into a whole number with <code>int()</code>',
        test: raw => intCount(raw) >= 1 },
      { text: 'Print the age next year (<strong>13</strong> when 12 is typed), with no error',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedNumbers(r).includes(Number(r.inputs[0]) + 1)) },
    ] },

  // ── 5 · Selection (Lesson 5) ── 12 marks
  // Pick the line, then the guided task (see c_pick and c_guide).
  { id: 's_pick', section: 'selection', kind: 'mcq', pts: 1,
    q: 'This program should print <strong>Pass</strong> when the score is 50 or more and <strong>Try again</strong> when it is lower. Which line goes in the gap?',
    code: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\n_______\n    print("Try again")',
    opts: ['else:', 'else', 'else score < 50:', 'if else:'],
    why: 'else: lines up with the if (no indent) and ends with a colon. It needs no test of its own: it runs whenever the if test is False.' },
  { id: 's_guide', section: 'selection', kind: 'reqs', resettable: true,
    title: 'Write it: add the else',
    goal: 'This program prints <strong>Pass</strong> when the score is 50 or more, but prints nothing when it is lower. Add an <code>else</code> so any score <strong>under 50</strong> prints <strong>Try again</strong>',
    howto: { text: '<code>else:</code> goes on its own line with <strong>no</strong> indent, lined up with the <code>if</code>, and ends with a colon. The line it runs goes under it, indented by 4 spaces. For example:',
             code: 'if age >= 13:\n    print("Welcome")\nelse:\n    print("Too young")' },
    starter: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\n',
    tests: [['70'], ['50'], ['49']],
    testNote: 'Checked by running it with 70, 50 and 49.',
    // The mark is for the else: in the third sitting two of the six who wrote one printed
    // "Fail" or "Try again!" and scored nothing.
    reqs: [
      { text: 'Use an <code>else</code> so that 50 or more prints <code>Pass</code> and anything lower prints <code>Try again</code> (or another message of your own)',
        test: (raw, runs) => /^else\s*:/m.test(normalise(raw)) && allOk(runs) && runs.every(r => {
          const got = printedLines(r);
          return got.length === 1 && close(got[0], 'Pass') === (Number(r.inputs[0]) >= 50);
        }) },
    ] },
  // A helper first: what an indent does, before any question that relies on it.
  { id: 's_indented', section: 'selection', kind: 'mcq', pts: 1,
    q: 'The four spaces in front of <code>print("Well done")</code> are called an <strong>indent</strong>. What do they do?',
    code: 'score = int(input("Score? "))\nif score > 10:\n    print("Well done")\nprint("Finished")',
    opts: ['Make it part of the if, so it runs only when the test is True', 'Nothing at all: they only make the code look neater on screen',
           'Make Python run that line first, before every other line', 'Turn the line into a comment, so Python always skips over it'],
    why: 'An indented line belongs to the if above it, so it only runs when the test is True. print("Finished") has no indent, so it always runs.' },
  { id: 's_branch', section: 'selection', kind: 'branch',
    q: 'For each answer the user types, what does the program print?',
    variants: [
      { code: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")\nprint("Done")',
        a: 'Pass', b: 'Try again', after: 'Done', rows: [['72', 'a'], ['50', 'a'], ['49', 'b']] },
      { code: 'lives = int(input("Lives? "))\nif lives > 0:\n    print("Keep playing")\nelse:\n    print("Game over")\nprint("Score saved")',
        a: 'Keep playing', b: 'Game over', after: 'Score saved', rows: [['3', 'a'], ['0', 'b'], ['1', 'a']] },
      { code: 'age = int(input("Age? "))\nif age < 13:\n    print("Kids menu")\nelse:\n    print("Main menu")\nprint("Enjoy!")',
        a: 'Kids menu', b: 'Main menu', after: 'Enjoy!', rows: [['12', 'a'], ['13', 'b'], ['20', 'b']] },
    ] },
  // Asked about a correct line (24% when it asked which of four lines was right).
  { id: 's_equals', section: 'selection', kind: 'mcq', pts: 1,
    q: 'What does <code>==</code> do in this line?',
    code: 'if guess == 7:',
    opts: ['Checks if guess is the same as 7', 'Stores 7 in the box called guess', 'Adds 7 on to what is in guess', 'Prints guess and 7 side by side'],
    why: 'Two equals signs compare: is guess the same as 7? One = stores a value in a box.' },
  { id: 's_indent', section: 'selection', kind: 'mcq', pts: 1,
    q: 'The user types <strong>15</strong>. What is printed?',
    code: 'age = int(input("Age? "))\nif age >= 13:\n    print("Welcome")\nelse:\n    print("Too young")\n    print("Sorry!")\nprint("Bye")',
    opts: ['Welcome, then Bye', 'Welcome, Sorry!, then Bye', 'Welcome only', 'Too young, Sorry!, then Bye'],
    why: 'Indented lines belong to their block. Sorry! is inside the else; Bye is not indented, so it always runs.' },
  { id: 's_boundary', section: 'selection', kind: 'mcq', pts: 1,
    q: 'You can join the club if you are <strong>11 or older</strong>. Which line is right?',
    opts: ['if age >= 11:', 'if age > 11:', 'if age <= 11:', 'if age == 11:'],
    why: '>= means "more than OR equal to", so 11 itself is let in. > 11 would turn an 11-year-old away.' },
  { id: 's_fix', section: 'selection', kind: 'fix',
    title: 'Fix it: the merit checker',
    goal: '60 or more should print Merit! and anything lower should print Keep practising. It has one bug.',
    howto: { text: 'The line that runs under <code>if</code> or <code>else:</code> must be indented by 4 spaces. For example:',
             code: 'if age >= 13:\n    print("Welcome")\nelse:\n    print("Too young")' },
    testNote: 'Checked by running it with 60, 59 and 85.',
    starter: 'mark = int(input("What was your mark? "))\nif mark >= 60:\nprint("Merit!")\nelse:\n    print("Keep practising")',
    tests: [['60'], ['59'], ['85']],
    reqs: [
      { text: 'Print <code>Merit!</code> for 60 or more, and <code>Keep practising</code> for anything lower (only one of them each time)',
        test: printsExactly(([m]) => [Number(m) >= 60 ? 'Merit!' : 'Keep practising']) },
    ] },
  { id: 's_write', section: 'selection', kind: 'reqs', resettable: true,
    title: 'Write it: the PIN lock',
    goal: 'Finish the program. If the PIN is <strong>1234</strong> print <code>Unlocked</code> and for any other PIN print <code>Wrong PIN</code>',
    howto: { text: 'Compare the <strong>variable</strong> with <code>==</code> (two equals signs), end the <code>if</code> line with a colon, and indent the line under it. <code>else:</code> catches every other answer. For example:',
             code: 'if guess == 7:\n    print("Correct")\nelse:\n    print("Wrong")' },
    starter: 'pin = int(input("Enter your PIN: "))\n',
    tests: PIN_TESTS,
    testNote: 'Checked by running it with 1234, 1233 and 1235.',
    reqs: [
      { text: 'Use an <code>if</code> with a comparison, and an <code>else</code>',
        test: raw => ifElseLines(raw).some(l => COMPARISON.test(l)) },
      { text: 'Print <code>Unlocked</code> for 1234 and <code>Wrong PIN</code> for any other PIN (only one message each time)',
        test: printsExactly(([p]) => [p === '1234' ? 'Unlocked' : 'Wrong PIN']) },
    ] },

  // ── 6 · Write a program (Lessons 1–5) ── 8 marks
  { id: 'w_warm', section: 'write', kind: 'reqs', resettable: true, title: 'Warm-up: change a program',
    goal: 'This program works. Change it so it meets both requirements.',
    howto: { text: '<code>&gt;=</code> lets the number itself in; <code>&gt;</code> does not. A line with <strong>no</strong> indent under the if/else runs for everyone. For example:',
             code: 'if age >= 18:\n    print("Adult ticket")\nelse:\n    print("Child ticket")\nprint("Enjoy the film!")' },
    starter: 'temp = int(input("What is the temperature? "))\nif temp > 20:\n    print("T-shirt weather!")\nelse:\n    print("Take a coat.")',
    tests: WARM_TESTS,
    testNote: 'Checked by running it with 25, 24, 31 and 10.',
    reqs: [
      { text: 'T-shirt weather starts at <strong>25 or more</strong> (25 itself is T-shirt weather; 24 is not)',
        test: (raw, runs) => {
          if (!allOk(runs)) return false;
          const k = t => branchKey(runFor(runs, t));
          return k('25') === k('31') && k('24') === k('10') && k('25') !== k('24');
        } },
      { text: 'After the if/else, print <code>Have a good day!</code> for <strong>everyone</strong>, whatever the temperature',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedLines(r).some(l => loose(l).includes('haveagoodday'))) },
    ] },
  // The starter's comments give the steps, so nobody starts from a blank page (27% from blank).
  { id: 'w_make', section: 'write', kind: 'reqs', resettable: true, title: 'Write it: the game shop',
    goal: 'A game is rated <strong>12</strong>. Write a program for the shop till. The comments in the editor give you the steps: write the code for each one under it. Here are two sample runs (yellow = typed by the customer):',
    samples: [
      [['What is your name? ', 'Ava'], ['How old are you? ', '15'], ['Ava, you can buy this game']],
      [['What is your name? ', 'Leo'], ['How old are you? ', '9'], ['Sorry Leo, come back in 3 years']],
    ],
    starter: '# Game shop till\n# Step 1: ask the customer\'s name\n\n# Step 2: ask their age, as a whole number\n\n# Step 3: if they are 12 or older, say they can buy it\n#         else, say sorry and how many years to wait\n',
    tests: WRITE_TESTS,
    testNote: 'Checked by running it with Ava 15, Ben 12, Leo 9 and Mia 11. Your messages can use your own words.',
    reqs: [
      { text: 'Ask two questions with <code>input()</code>: the name <strong>first</strong>, then the age',
        test: (raw, runs) => inputCount(raw) >= 2 && !runs.some(r => /ValueError/.test(r.output || '')) },
      { text: 'Cast the age with <code>int()</code> so Python can compare it with 12',
        test: raw => intCount(raw) >= 1 },
      { text: 'Use an <code>if</code> with a comparison, and an <code>else</code>',
        test: raw => ifElseLines(raw).some(l => COMPARISON.test(l)) },
      { text: '<strong>12 or older</strong> gets a "you can buy it" message; <strong>under 12</strong> gets a different message',
        test: (raw, runs) => {
          if (!allOk(runs)) return false;
          const k = (n, a) => branchKey(runFor(runs, n, a), n);
          const yes = k('Ben', '12');
          return yes !== '' && yes === k('Ava', '15') && yes !== k('Leo', '9') && yes !== k('Mia', '11');
        } },
      { text: 'The message includes the customer\'s <strong>name</strong>',
        test: (raw, runs) => allOk(runs) && runs.every(r => printedLines(r).some(l => l.includes(r.inputs[0]))) },
      { text: 'Under 12, the message says <strong>how many years</strong> until they can buy it (12 − their age)',
        test: (raw, runs) => allOk(runs) && ['9', '11'].every(a => {
          const r = runs.find(x => x.inputs[1] === a);
          return r && printedNumbers(r).includes(12 - Number(a));
        }) },
    ],
    extraMsg: (raw, runs) => runs.some(r => /ValueError/.test(r.output || '')) ? ' Python tried to turn the name into a number — check the order of your questions.' : '' },

  // ── ★ Extension (bonus, not in the grade) ── 4 bonus marks. The only task that needs str():
  // the fruit bowl fix prints with a comma, so int() alone fixes it.
  { id: 'x_speed', section: 'ext', kind: 'reqs', bonus: true, title: 'Copy the machine: the speed camera',
    goal: 'Someone lost the code for this speed camera. All that is left is two sample runs. Write a program that behaves <strong>exactly</strong> the same way.',
    samples: [
      [['What is the speed limit? ', '30'], ['How fast were you going? ', '36'], ['You were 6 mph over the limit'], ['Drive safely']],
      [['What is the speed limit? ', '30'], ['How fast were you going? ', '28'], ['Within the limit, thank you'], ['Drive safely']],
    ],
    starter: '# Speed camera\n',
    tests: EXT_TESTS,
    testNote: 'Checked with 30 and 36, 30 and 30, 50 and 72, then 20 and 15. The printed lines must match word for word.',
    reqs: [
      { text: 'Ask for the limit, then the speed, and cast both to whole numbers. No errors for any test',
        test: (raw, runs) => inputCount(raw) >= 2 && intCount(raw) >= 2 && allOk(runs) },
      { text: 'Over the limit, print exactly <code>You were N mph over the limit</code> (with the right N)',
        test: withText(([l, s]) => +s > +l ? [`You were ${s - l} mph over the limit`] : [], (raw, runs) => allOk(runs) && runs.filter(r => +r.inputs[1] > +r.inputs[0]).every(r =>
          printedLines(r).some(l => same(l.replace(/[.!]+\s*$/, ''), `You were ${r.inputs[1] - r.inputs[0]} mph over the limit`))), true) },
      { text: 'At or under the limit, print exactly <code>Within the limit, thank you</code> — and every run ends with <code>Drive safely</code>',
        test: withText(([l, s]) => +s > +l ? ['Drive safely'] : ['Within the limit, thank you', 'Drive safely'], (raw, runs) => allOk(runs)
          && runs.filter(r => +r.inputs[1] <= +r.inputs[0]).every(r => printedLines(r).some(l => /^within the limit,? thank you[.!]*$/i.test(squash(l))))
          && runs.every(r => { const ls = printedLines(r); return ls.length && /^drive safely[.!]*$/i.test(squash(ls[ls.length - 1])); }), true) },
      { text: 'Build the "over the limit" message by joining with <code>+</code>, using <code>str()</code> to turn the number into text',
        test: (raw, runs) => allOk(runs) && count(raw, /\bstr\s*\(/g) >= 1 && codeLines(raw).some(l => /\bprint\s*\(.*\+/.test(l)) },
    ] },
];

export const itemById = id => ITEMS.find(i => i.id === id);
// The questions the assessment shows and marks now (retired ones stay in ITEMS for L7).
export const LIVE_ITEMS = ITEMS.filter(i => !i.retired);
// Saved with every attempt, so L7 knows which version a student sat (1: 38 marks, first
// sitting; 2: the 13 Oct 2026 sitting; 3: guided casting/selection tasks, two retired, sat
// 19 Oct 2026; 4: pick-the-line questions, c_total for c_join, worked examples; 53 marks).
export const VERSION = 4;

// Marks available for an item (for this student's version).
export function itemMax(item, seed = 0) {
  const v = variantOf(item, seed);
  if (v.kind === 'trace') return v.vars.length + v.output.length;
  if (v.kind === 'branch') return v.rows.length;
  if (v.reqs) return v.reqs.length;
  return v.pts;
}

// Branch rows: the four printed outcomes a row can choose from (index 0..3).
export const branchChoices = v => [
  `${v.a}, then ${v.after}`, `${v.b}, then ${v.after}`, `${v.a} only`, `${v.b} only`,
];
export const branchAnswer = row => (row[1] === 'a' ? 0 : 1);

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
