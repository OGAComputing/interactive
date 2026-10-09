// Question bank + marking logic for 1_Python_Assessment.html — the Y8 Python Unit 1
// end-of-unit assessment (Lesson 6). Not PRIMM: this lesson MEASURES. See the Unit 1 MTP.
//
// What the assessment is built on (lessons from the Unit 2 assessment and the units since):
//   • Weighted toward READING, TRACING and SPOT-AND-FIX (≈80%), with one short write task
//     (≈20%) preceded by a trivial warm-up edit, so nobody starts writing from a blank page.
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
//   • No coaching hints: a failed requirement is named, not solved. The bonus extension is
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
  return `Python stops with a ${errorName(f) || 'error'}${typed}. Read the last line of the error.`;
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

// "What is in the box at the end?" Text in quotes, numbers without — so the answer
// shows the TYPE as well as the value.
export function checkTraceValue(expected, typed) {
  const t = String(typed ?? '').trim();
  if (!t) return { ok: false, msg: 'Not answered.' };
  const q = t.match(QUOTED);
  if (expected.type === 'str') {
    if (q) return q[2] === expected.value ? { ok: true } : { ok: false, msg: 'Not the right text.' };
    if (t === expected.value) return { ok: false, msg: 'Right value, but it is text, so it needs quotes.' };
    return { ok: false, msg: 'Not the right text.' };
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

// Fix-it items: the program must print exactly these lines for every test (case and
// spacing forgiven), and nothing else.
export function evalFix(item, raw, runs) {
  if (item.mark) return item.mark(raw, runs);
  if (firstFailed(runs)) return { pts: 0, msg: crashMsg(runs) };
  for (const r of runs) {
    const want = item.expect(r.inputs);
    const got = printedLines(r);
    if (got.length !== want.length || !want.every((w, i) => same(got[i], w))) {
      const typed = r.inputs.length ? ` when ${r.inputs.join(' and ')} is typed` : '';
      return { pts: 0, msg: `It runs, but it should print exactly: ${want.join(' / ')}${typed}.` };
    }
  }
  return { pts: item.pts, msg: 'Fixed — it now prints exactly the right thing.' };
}

// Requirement-list items (warm-up, write task, extension): one mark per requirement met.
// The message names the first requirement still missing — never how to meet it.
export function evalReqs(item, raw, runs) {
  const results = item.reqs.map(r => !!r.test(raw, runs));
  const pts = results.filter(Boolean).length;
  const bad = results.findIndex(r => !r);
  let msg = `All ${results.length} requirements met.`;
  if (bad >= 0) {
    msg = `Requirement ${bad + 1} is not met yet.`;
    if (firstFailed(runs)) msg += ' ' + crashMsg(runs);
    else if (item.extraMsg) msg += item.extraMsg(raw, runs, results) || '';
  }
  return { results, pts, msg };
}

export function evalCode(item, raw, runs) {
  return item.kind === 'fix' ? evalFix(item, raw, runs) : evalReqs(item, raw, runs);
}

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
//        sort (1 per 2 cards) · fix (run + check) · reqs (1 per requirement)

const WRITE_TESTS = [['Ava', '15'], ['Ben', '12'], ['Leo', '9'], ['Mia', '11']];
const WARM_TESTS  = [['25'], ['24'], ['31'], ['10']];
const EXT_TESTS   = [['30', '36'], ['30', '30'], ['50', '72'], ['20', '15']];
const runFor = (runs, ...inputs) => runs.find(r => r.inputs.join('|') === inputs.join('|'));
const allOk = runs => runs.length > 0 && runs.every(r => r.ok);

export const ITEMS = [
  // ── 1 · Output & errors (Lesson 1) ── 5 marks
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
  { id: 'o_fix', section: 'output', kind: 'fix', pts: 1,
    title: 'Fix it: the welcome message',
    goal: 'This program should print the three lines below. It has one bug. Fix it (don\'t delete anything).',
    starter: 'print("Welcome to the quiz!")\nprint("Good luck)\nprint("Question 1 is coming up")',
    tests: [[]],
    expect: () => ['Welcome to the quiz!', 'Good luck', 'Question 1 is coming up'] },

  // ── 2 · Variables (Lesson 2) ── 6 marks
  { id: 'v_trace', section: 'variables', kind: 'trace',
    q: 'Play computer: run this program in your head, line by line.',
    variants: [
      { lines: ['pet = "cat"', 'owner = "Tom"', 'print(owner + " has a " + pet)', 'pet = "dog"', 'owner = owner + "my"', 'print(owner + " walks the " + pet)'],
        vars: [{ name: 'pet', type: 'str', value: 'dog' }, { name: 'owner', type: 'str', value: 'Tommy' }],
        output: ['Tom has a cat', 'Tommy walks the dog'] },
      { lines: ['food = "pizza"', 'chef = "Al"', 'print(chef + " cooks " + food)', 'food = "pasta"', 'chef = chef + "ex"', 'print(chef + " eats " + food)'],
        vars: [{ name: 'food', type: 'str', value: 'pasta' }, { name: 'chef', type: 'str', value: 'Alex' }],
        output: ['Al cooks pizza', 'Alex eats pasta'] },
      { lines: ['drink = "tea"', 'friend = "Jo"', 'print(friend + " likes " + drink)', 'drink = "milk"', 'friend = friend + "sh"', 'print(friend + " drinks " + drink)'],
        vars: [{ name: 'drink', type: 'str', value: 'milk' }, { name: 'friend', type: 'str', value: 'Josh' }],
        output: ['Jo likes tea', 'Josh drinks milk'] },
    ] },
  { id: 'v_quotes', section: 'variables', kind: 'mcq', pts: 1,
    q: 'What does this program print?',
    code: 'city = "Leeds"\nprint("city")',
    opts: ['city', 'Leeds', '"Leeds"', 'A NameError'],
    why: 'Quotes make it text, so print("city") shows the word city, not what is in the box.' },
  { id: 'v_order', section: 'variables', kind: 'mcq', pts: 1,
    q: 'What happens when this program runs?',
    code: 'print("Total: " + total)\ntotal = "50"',
    opts: ['A NameError on line 1', 'It prints Total: 50', 'It prints Total: total', 'A SyntaxError on line 2'],
    why: 'Python runs from the top. Line 1 uses total before line 2 has made it, so it is a NameError.' },

  // ── 3 · Input (Lesson 3) ── 4 marks
  { id: 'i_prompt', section: 'input', kind: 'mcq', pts: 1,
    q: 'The user types <strong>Hull</strong>. What is stored in <code>town</code>?',
    code: 'town = input("Where do you live? ")',
    opts: ['Hull', 'Where do you live?', 'Where do you live? Hull', 'Nothing is stored'],
    why: 'The text in the brackets is only shown as a question. Only the answer is stored.' },
  { id: 'i_trace', section: 'input', kind: 'trace',
    q: 'Type exactly what the <code>print()</code> line shows (not the question).',
    variants: [
      { lines: ['name = input("Name? ")', 'print("Hello" + name + "!")'], typed: { 0: 'Sam' }, vars: [], output: ['HelloSam!'] },
      { lines: ['name = input("Name? ")', 'print("Welcome" + name + ".")'], typed: { 0: 'Kim' }, vars: [], output: ['WelcomeKim.'] },
      { lines: ['name = input("Name? ")', 'print("Morning" + name + "!")'], typed: { 0: 'Raj' }, vars: [], output: ['MorningRaj!'] },
    ] },
  { id: 'i_store', section: 'input', kind: 'mcq', pts: 1,
    q: 'Which line asks for the user\'s age <strong>and stores the answer</strong>?',
    opts: ['age = input("Age? ")', 'input("Age? ") = age', 'age = "input(Age?)"', 'print(input("Age? "))'],
    why: 'input() asks the question; = stores what comes back in the box on the left.' },
  { id: 'i_fix', section: 'input', kind: 'fix', pts: 1,
    title: 'Fix it: the favourite animal',
    goal: 'Ask for a favourite animal, then print e.g. I like cats too! (when cat is typed). It has one bug.',
    starter: 'animal = input("What is your favourite animal? ")\nprint("I like " + aminal + "s too!")',
    tests: [['cat'], ['owl']],
    expect: ([a]) => [`I like ${a}s too!`] },

  // ── 4 · Data types & casting (Lesson 4) ── 8 marks
  { id: 'c_sort', section: 'casting', kind: 'sort', pts: 3,
    q: 'These lines ran first, so <code>num</code> holds whatever the user typed:',
    code: 'num = input("Number? ")',
    bins: [{ id: 'join', label: '🧵 Joins text' }, { id: 'maths', label: '🔢 Does maths' }, { id: 'error', label: '💥 TypeError' }],
    cards: [
      { id: 'k1', expr: '"7" + "2"',        bin: 'join'  },
      { id: 'k2', expr: '7 + 2',            bin: 'maths' },
      { id: 'k3', expr: '"Total: " + 5',    bin: 'error' },
      { id: 'k4', expr: 'num + "!"',        bin: 'join'  },
      { id: 'k5', expr: 'int(num) * 2',     bin: 'maths' },
      { id: 'k6', expr: 'num + 1',          bin: 'error' },
    ] },
  { id: 'c_join', section: 'casting', kind: 'mcq', pts: 1,
    variants: [
      { q: 'The user types <strong>4</strong>, then <strong>5</strong>. What is printed?', opts: ['45', '9', '4 5', 'A TypeError'] },
      { q: 'The user types <strong>2</strong>, then <strong>6</strong>. What is printed?', opts: ['26', '8', '2 6', 'A TypeError'] },
      { q: 'The user types <strong>3</strong>, then <strong>7</strong>. What is printed?', opts: ['37', '10', '3 7', 'A TypeError'] },
    ],
    code: 'a = input("First number? ")\nb = input("Second number? ")\nprint(a + b)',
    why: 'input() always gives back text, and + joins text. Nothing was cast with int().' },
  { id: 'c_int', section: 'casting', kind: 'mcq', pts: 1,
    q: 'Which of these is an <strong>int</strong> (a whole number)?',
    opts: ['12', '"12"', '12.0', '"twelve"'],
    why: 'An int has no quotes and no decimal point. 12.0 is a float; anything in quotes is text.' },
  { id: 'c_str', section: 'casting', kind: 'mcq', pts: 1,
    q: '<code>points</code> holds the number 10. Which line prints <strong>Points: 10</strong>?',
    opts: ['print("Points: " + str(points))', 'print("Points: " + int(points))', 'print("Points: " + "points")', 'print("Points: " + points)'],
    why: 'str() turns the number into text so it can be joined with +.' },
  { id: 'c_fix', section: 'casting', kind: 'fix', pts: 2,
    title: 'Fix it: the fruit bowl',
    goal: 'Typing 5 and 3 should print Fruit in the bowl: 8 — but it prints 53. There is no error message. Fix it.',
    starter: 'apples = input("How many apples? ")\npears = input("How many pears? ")\ntotal = apples + pears\nprint("Fruit in the bowl: " + total)',
    tests: [['5', '3'], ['12', '30']],
    note: '2 marks: 1 for adding instead of joining, 1 for the exact sentence.',
    mark(raw, runs) {
      if (firstFailed(runs)) return { pts: 0, msg: crashMsg(runs) };
      let exact = true, adds = true;
      for (const r of runs) {
        const [a, b] = r.inputs;
        const sum = Number(a) + Number(b);
        if (!printedNumbers(r).includes(sum) || printedNumbers(r).includes(Number(a + b))) adds = false;
        if (!printedLines(r).some(l => same(l, `Fruit in the bowl: ${sum}`))) exact = false;
      }
      if (adds && exact) return { pts: 2, msg: 'Fixed — it adds the numbers and prints the exact sentence.' };
      if (adds) return { pts: 1, msg: 'It adds the numbers now. For both marks, print exactly: Fruit in the bowl: 8' };
      return { pts: 0, msg: 'It still joins the numbers instead of adding them (5 and 3 should give 8).' };
    } },

  // ── 5 · Selection (Lesson 5) ── 7 marks
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
  { id: 's_equals', section: 'selection', kind: 'mcq', pts: 1,
    q: 'Which line checks if <code>guess</code> is <strong>exactly</strong> 7?',
    opts: ['if guess == 7:', 'if guess = 7:', 'if guess => 7:', 'if "guess" == 7:'],
    why: 'Two equals signs compare; one = stores. The line ends with a colon.' },
  { id: 's_indent', section: 'selection', kind: 'mcq', pts: 1,
    q: 'The user types <strong>15</strong>. What is printed?',
    code: 'age = int(input("Age? "))\nif age >= 13:\n    print("Welcome")\nelse:\n    print("Too young")\n    print("Sorry!")\nprint("Bye")',
    opts: ['Welcome, then Bye', 'Welcome, Sorry!, then Bye', 'Welcome only', 'Too young, Sorry!, then Bye'],
    why: 'Indented lines belong to their block. Sorry! is inside the else; Bye is not indented, so it always runs.' },
  { id: 's_boundary', section: 'selection', kind: 'mcq', pts: 1,
    q: 'You can join the club if you are <strong>11 or older</strong>. Which line is right?',
    opts: ['if age >= 11:', 'if age > 11:', 'if age <= 11:', 'if age == 11:'],
    why: '>= means "more than OR equal to", so 11 itself is let in. > 11 would turn an 11-year-old away.' },
  { id: 's_fix', section: 'selection', kind: 'fix', pts: 1,
    title: 'Fix it: the merit checker',
    goal: '60 or more should print Merit! and anything lower should print Keep practising. It has one bug.',
    starter: 'mark = int(input("What was your mark? "))\nif mark >= 60:\nprint("Merit!")\nelse:\n    print("Keep practising")',
    tests: [['60'], ['59'], ['85']],
    expect: ([m]) => [Number(m) >= 60 ? 'Merit!' : 'Keep practising'] },

  // ── 6 · Write a program (Lessons 1–5) ── 8 marks
  { id: 'w_warm', section: 'write', kind: 'reqs', title: 'Warm-up: change a program',
    goal: 'This program works. Change it so it meets both requirements.',
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
        test: (raw, runs) => allOk(runs) && runs.every(r => printedLines(r).some(l => /have a good day/i.test(l))) },
    ] },
  { id: 'w_make', section: 'write', kind: 'reqs', title: 'Write it: the game shop',
    goal: 'A game is rated <strong>12</strong>. Write a program for the shop till, starting from an empty editor. Here are two sample runs (yellow = typed by the customer):',
    samples: [
      [['What is your name? ', 'Ava'], ['How old are you? ', '15'], ['Ava, you can buy this game']],
      [['What is your name? ', 'Leo'], ['How old are you? ', '9'], ['Sorry Leo, come back in 3 years']],
    ],
    starter: '# Game shop till\n',
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

  // ── ★ Extension (bonus, not in the grade) ── 3 bonus marks
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
        test: (raw, runs) => allOk(runs) && runs.filter(r => +r.inputs[1] > +r.inputs[0]).every(r =>
          printedLines(r).some(l => same(l.replace(/[.!]+\s*$/, ''), `You were ${r.inputs[1] - r.inputs[0]} mph over the limit`))) },
      { text: 'At or under the limit, print exactly <code>Within the limit, thank you</code> — and every run ends with <code>Drive safely</code>',
        test: (raw, runs) => allOk(runs)
          && runs.filter(r => +r.inputs[1] <= +r.inputs[0]).every(r => printedLines(r).some(l => /^within the limit,? thank you[.!]*$/i.test(squash(l))))
          && runs.every(r => { const ls = printedLines(r); return ls.length && /^drive safely[.!]*$/i.test(squash(ls[ls.length - 1])); }) },
    ] },
];

export const itemById = id => ITEMS.find(i => i.id === id);

// Marks available for an item (for this student's version).
export function itemMax(item, seed = 0) {
  const v = variantOf(item, seed);
  if (v.kind === 'trace') return v.vars.length + v.output.length;
  if (v.kind === 'branch') return v.rows.length;
  if (v.kind === 'reqs') return v.reqs.length;
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
  for (const it of ITEMS) {
    sections[it.section].max += itemMax(it, seed);
    sections[it.section].earned += points[it.id] || 0;
  }
  const core = SECTIONS.filter(s => !s.bonus);
  const earned = core.reduce((t, s) => t + sections[s.id].earned, 0);
  const max = core.reduce((t, s) => t + sections[s.id].max, 0);
  return { sections, earned, max, pct: max ? Math.round(earned / max * 100) : 0, bonus: sections.ext.earned };
}
