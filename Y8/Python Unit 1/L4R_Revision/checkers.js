// Validation logic for 1_Revision_Quest.html — the L4R cover/revision lesson.
// Revises Lessons 1–4 ONLY (output, variables, input, data types & casting). No new
// concepts: nothing here needs if/else, loops or anything else not yet taught.
//
// Checks follow the same rules as the PRIMM lessons (see feedback_checker_flexibility):
//   • code tasks are run with fixed TEST INPUTS and judged on what the program PRINTS,
//     so any valid way of writing the code passes;
//   • every code task is run with at least two different inputs where input() is
//     involved, so hard-coding the expected answer never passes;
//   • a failure message names the concrete thing still missing.
//
// A "run" passed to the eval functions is what runPython() resolved with, plus the
// inputs it was given: { inputs: string[], ok: boolean, output: string }.

// ── Shared helpers ───────────────────────────────────────────────────────────

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

const count = (raw, re) => (normalise(raw).match(re) || []).length;
const inputCount = raw => count(raw, /\binput\s*\(/g);

// Collapse runs of spaces and trim, for comparing printed lines.
export const squash = s => String(s).replace(/\s+/g, ' ').trim();

// The lines the program PRINTED. runPython echoes each mocked input() as
// "prompt + answer" on its own line; those echo lines are dropped here by
// matching each answer, in order, against the end of the next line that ends with it.
export function printedLines(run) {
  const lines = (run?.output || '').replace(/\n$/, '').split('\n');
  const answers = [...(run?.inputs || [])];
  const out = [];
  for (const line of lines) {
    if (answers.length && line.trimEnd().endsWith(answers[0])) { answers.shift(); continue; }
    out.push(line);
  }
  return out;
}

// Every number that appears in the printed lines, as JS numbers ("8.0" → 8).
function printedNumbers(run) {
  return printedLines(run).flatMap(l => (l.match(/-?\d+(?:\.\d+)?/g) || []).map(Number));
}

// Python's own error name from a failed run's output, e.g. "NameError".
export function errorName(run) {
  const m = (run?.output || '').match(/\b([A-Z][A-Za-z]*Error)\b/);
  return m ? m[1] : null;
}

const firstFailed = runs => runs.find(r => !r.ok);

// ── Seeded randomness (per-student order, stable on reload) ──────────────────

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

// ── Level 1: Quick-fire recall (checkpoint chain) ────────────────────────────
// CHAIN_LENGTH questions in a row from the pool. A wrong answer shows why, then the
// run restarts with a fresh draw. opts[0] is always the correct answer; the page
// shuffles the options per student. Options are kept roughly the same length.

export const CHAIN_LENGTH = 6;

export const QUIZ_POOL = [
  { id: 'q_print', topic: 'Output',
    q: 'Which line prints the word <strong>Hello</strong>?',
    opts: ['print("Hello")', 'print(Hello)', 'Print("Hello")', 'print "Hello"'],
    why: 'print is all lower case, needs round brackets, and text needs quotes: print("Hello")' },
  { id: 'q_blank', topic: 'Output',
    q: 'How many lines appear in the output, counting blank ones?',
    code: 'print("Ready")\nprint("Steady")\nprint()\nprint("Go!")',
    opts: ['4', '3', '2', '1'],
    why: 'print() with nothing in the brackets still prints a line: an empty one. So there are 4 lines.' },
  { id: 'q_syntax', topic: 'Errors',
    q: 'What happens when this line runs?',
    code: 'print("Hello)',
    opts: ['A SyntaxError', 'A NameError', 'A TypeError', 'It prints Hello'],
    why: 'The closing quote is missing, so Python cannot read the line at all. That is a SyntaxError.' },
  { id: 'q_equals', topic: 'Variables',
    q: 'What does the = sign do in <code>score = 10</code>?',
    opts: ['Stores 10 in a box called score', 'Checks if score is equal to 10', 'Prints score and 10 on screen', 'Adds 10 to the old score'],
    why: 'One = means "store the value on the right in the box on the left".' },
  { id: 'q_reassign', topic: 'Variables',
    q: 'What does this program print?',
    code: 'x = 4\nx = 9\nprint(x)',
    opts: ['9', '4', '49', '13'],
    why: 'A box holds one value. x = 9 replaces the 4, so the old value is gone.' },
  { id: 'q_order', topic: 'Variables',
    q: 'What does this program print?',
    code: 'name = "Sam"\nprint(name)\nname = "Ali"\nprint(name)',
    opts: ['Sam, then Ali', 'Ali, then Ali', 'Sam, then Sam', 'A NameError'],
    why: 'Python runs top to bottom. The first print() runs before name is changed, so it shows Sam.' },
  { id: 'q_join', topic: 'Variables',
    q: 'What does this program print?',
    code: 'first = "Ice"\nsecond = "cream"\nprint(first + second)',
    opts: ['Icecream', 'Ice cream', 'first + second', 'A TypeError'],
    why: '+ joins two pieces of text exactly as they are. It never adds a space for you.' },
  { id: 'q_quotes', topic: 'Variables',
    q: 'What does this program print?',
    code: 'name = "Zara"\nprint("name")',
    opts: ['name', 'Zara', '"Zara"', 'A NameError'],
    why: 'Quotes make it text, so print("name") shows the word name, not what is in the box.' },
  { id: 'q_nameerror', topic: 'Errors',
    q: 'What happens when this program runs?',
    code: 'print(total)\ntotal = 50',
    opts: ['A NameError', 'It prints 50', 'It prints total', 'A SyntaxError'],
    why: 'Line 1 runs first, before total has been made, so Python has never heard of it: NameError.' },
  { id: 'q_inputtype', topic: 'Input',
    q: 'What type of value does <code>input()</code> always give back?',
    opts: ['Text (a string)', 'A whole number (int)', 'A decimal (float)', 'Whatever was typed'],
    why: 'input() always gives back text, even when the user types digits. Cast it to do maths.' },
  { id: 'q_prompt', topic: 'Input',
    q: 'The user types <strong>blue</strong>. What is stored in colour?',
    code: 'colour = input("Favourite colour? ")',
    opts: ['blue', 'Favourite colour?', 'Favourite colour? blue', 'Nothing at all'],
    why: 'The text in the brackets is only shown as a question. Only the answer is stored.' },
  { id: 'q_inputjoin', topic: 'Casting',
    q: 'The user types <strong>6</strong>. What is printed?',
    code: 'a = input("Number? ")\nprint(a + a)',
    opts: ['66', '12', '6 6', 'A TypeError'],
    why: 'a holds the TEXT "6", and + joins text, so "6" + "6" is 66.' },
  { id: 'q_inputcast', topic: 'Casting',
    q: 'The user types <strong>6</strong>. What is printed?',
    code: 'a = int(input("Number? "))\nprint(a + a)',
    opts: ['12', '66', '6', 'A TypeError'],
    why: 'int() turns the text "6" into the number 6, so + adds: 6 + 6 = 12.' },
  { id: 'q_typeerror', topic: 'Errors',
    q: 'What happens when this program runs?',
    code: 'age = 13\nprint("I am " + age)',
    opts: ['A TypeError', 'A SyntaxError', 'A NameError', 'It prints I am 13'],
    why: 'You cannot join text and a number with +. Python stops with a TypeError.' },
  { id: 'q_strfix', topic: 'Casting',
    q: 'age holds the number 13. Which line prints <strong>I am 13</strong>?',
    opts: ['print("I am " + str(age))', 'print("I am " + int(age))', 'print("I am " + "age")', 'print(I am + age)'],
    why: 'str() turns the number into text, so it can be joined to "I am " with +.' },
  { id: 'q_float', topic: 'Data types',
    q: 'Which of these is a <strong>float</strong>?',
    opts: ['3.5', '"3.5"', '35', '"35"'],
    why: 'A float is a number with a decimal point and no quotes. With quotes it would be text.' },
  { id: 'q_string', topic: 'Data types',
    q: 'Which of these is a <strong>string</strong>?',
    opts: ['"42"', '42', '4.2', 'int("42")'],
    why: 'Anything in quotes is a string (text), even if it looks like a number.' },
  { id: 'q_times', topic: 'Arithmetic',
    q: 'What does <code>print(7 * 2)</code> show?',
    opts: ['14', '72', '9', '7 * 2'],
    why: '* means multiply. 7 and 2 have no quotes, so they are numbers: 7 × 2 = 14.' },
  { id: 'q_divide', topic: 'Arithmetic',
    q: 'What does <code>print(10 / 4)</code> show?',
    opts: ['2.5', '2', '2.4', '10/4'],
    why: '/ means divide, and it gives a decimal answer: 10 ÷ 4 = 2.5' },
  { id: 'q_floatcast', topic: 'Casting',
    q: 'What does this program print?',
    code: 'price = float("2.5")\nprint(price * 2)',
    opts: ['5.0', '5', '2.52.5', 'A TypeError'],
    why: 'float() makes the number 2.5, and maths with a float gives a float, so Python shows 5.0' },
];

// Pick CHAIN_LENGTH different question ids for one run.
export function drawChain(rng, n = CHAIN_LENGTH) {
  return shuffle(QUIZ_POOL.map(q => q.id), rng).slice(0, n);
}

export const quizById = id => QUIZ_POOL.find(q => q.id === id);

// ── Level 2: Trace the boxes ─────────────────────────────────────────────────
// Each student is given one of three programs (seeded), so neighbours' answers differ.
// Values are written the way Python would show them in code: text in quotes, numbers
// without. That makes the trace a check on TYPES as well as values (the L4 idea).

export const TRACE_VARIANTS = [
  {
    id: 'A',
    lines: [
      ['name = input("Name? ")', 'the user types Mo'],
      ['age = input("Age? ")', 'the user types 12'],
      ['older = int(age) + 1', ''],
      ['print(name + " will be " + str(older))', ''],
      ['age = age + "0"', ''],
      ['print(age)', ''],
    ],
    vars: [
      { name: 'name',  type: 'str', value: 'Mo' },
      { name: 'age',   type: 'str', value: '120' },
      { name: 'older', type: 'int', value: 13 },
    ],
    output: ['Mo will be 13', '120'],
  },
  {
    id: 'B',
    lines: [
      ['item = input("Item? ")', 'the user types pen'],
      ['price = float(input("Price? "))', 'the user types 1.5'],
      ['count = 4', ''],
      ['total = price * count', ''],
      ['print(item + " x" + str(count))', ''],
      ['count = count + 1', ''],
      ['print(total)', ''],
    ],
    vars: [
      { name: 'item',  type: 'str',   value: 'pen' },
      { name: 'price', type: 'float', value: 1.5 },
      { name: 'count', type: 'int',   value: 5 },
      { name: 'total', type: 'float', value: 6 },
    ],
    output: ['pen x4', '6.0'],
  },
  {
    id: 'C',
    lines: [
      ['player = input("Player? ")', 'the user types Kai'],
      ['goals = int(input("Goals? "))', 'the user types 7'],
      ['goals = goals * 2', ''],
      ['team = "Reds"', ''],
      ['print(player + " scored " + str(goals) + " for the " + team)', ''],
      ['goals = 3', ''],
      ['print(goals + goals)', ''],
    ],
    vars: [
      { name: 'player', type: 'str', value: 'Kai' },
      { name: 'goals',  type: 'int', value: 3 },
      { name: 'team',   type: 'str', value: 'Reds' },
    ],
    output: ['Kai scored 14 for the Reds', '6'],
  },
];

const QUOTED = /^(["'])(.*)\1$/;
const NUMERIC = /^-?\d+(?:\.\d+)?$/;

// Check one "what is in the box at the end?" answer.
export function checkTraceValue(expected, typed) {
  const t = String(typed ?? '').trim();
  if (!t) return { ok: false, msg: 'Fill in this box.' };
  const q = t.match(QUOTED);

  if (expected.type === 'str') {
    if (q) return q[2] === expected.value
      ? { ok: true }
      : { ok: false, msg: 'Not the right text — trace each line again, top to bottom.' };
    if (t === expected.value) return { ok: false, msg: 'Right value, but this box holds TEXT — write it in quotes.' };
    return { ok: false, msg: 'Not right. Hint: this box holds text, so the answer goes in quotes.' };
  }

  // int / float
  const inner = q ? q[2] : t;
  if (!NUMERIC.test(inner)) return { ok: false, msg: 'This box holds a number — write just the number.' };
  if (Number(inner) !== expected.value) return { ok: false, msg: 'Not the right number — trace each line again, top to bottom.' };
  if (q) return { ok: false, msg: 'Right value, but this box holds a NUMBER, so no quotes.' };
  return { ok: true };
}

// Check one "what is printed?" line. print() never shows quotes, and a float prints with .0
export function checkTraceOutput(expected, typed) {
  const t = squash(typed ?? '');
  if (!t) return { ok: false, msg: 'Fill in this line.' };
  const want = squash(expected);
  if (t.toLowerCase() === want.toLowerCase()) return { ok: true };
  const q = t.match(QUOTED);
  if (q && squash(q[2]).toLowerCase() === want.toLowerCase()) {
    return { ok: false, msg: 'Nearly — but print() never shows the quotes.' };
  }
  if (/\.0$/.test(want) && t === want.slice(0, -2)) {
    return { ok: false, msg: 'Nearly — this value is a float, and Python prints a float with .0 on the end.' };
  }
  return { ok: false, msg: 'Not quite — check exactly what print() shows, spaces included.' };
}

// ── Level 3: Sort it — join, maths or error? ─────────────────────────────────
// Each card is one expression. name and age both come from input(), so they hold TEXT.

export const SORT_BINS = [
  { id: 'join',  label: '🧵 Joins text' },
  { id: 'maths', label: '🔢 Does maths' },
  { id: 'error', label: '💥 TypeError' },
];

export const SORT_CARDS = [
  { id: 's1',  expr: '"5" + "5"',            bin: 'join'  },
  { id: 's2',  expr: '5 + 5',                bin: 'maths' },
  { id: 's3',  expr: '"Score: " + 10',       bin: 'error' },
  { id: 's4',  expr: '"Score: " + str(10)',  bin: 'join'  },
  { id: 's5',  expr: 'int("4") + 6',         bin: 'maths' },
  { id: 's6',  expr: 'age + 1',              bin: 'error' },
  { id: 's7',  expr: 'int(age) + 1',         bin: 'maths' },
  { id: 's8',  expr: 'name + "!"',           bin: 'join'  },
  { id: 's9',  expr: 'float("2.5") * 2',     bin: 'maths' },
  { id: 's10', expr: '"10" + 1',             bin: 'error' },
  { id: 's11', expr: 'age + age',            bin: 'join'  },
  { id: 's12', expr: 'str(3) + str(4)',      bin: 'join'  },
];

// placements: { cardId: binId }. Returns per-card correctness and overall pass.
export function checkSort(placements) {
  const results = {};
  for (const c of SORT_CARDS) results[c.id] = placements[c.id] === c.bin;
  const placed = SORT_CARDS.every(c => placements[c.id]);
  const wrong = SORT_CARDS.filter(c => placements[c.id] && !results[c.id]).length;
  return { results, placed, wrong, pass: placed && wrong === 0 };
}

// ── Level 4: Bug hunt ────────────────────────────────────────────────────────
// One bug per program, one of each kind met in Lessons 1–4. Each is checked on what it
// prints for the test inputs, plus (where the output alone could be faked) on keeping
// the variable the program is about.

const lineIs = (run, want) => printedLines(run).some(l => squash(l).toLowerCase() === squash(want).toLowerCase());

export const BUGS = [
  {
    id: 'b1', kind: 'SyntaxError',
    title: 'The missing quote',
    goal: 'Print the two welcome lines.',
    starter: 'print("Welcome to the Python club!)\nprint("Today we revise everything.")',
    tests: [[]],
    expect: () => ['Welcome to the Python club!', 'Today we revise everything.'],
    hints: [
      'Read the LAST line of the error, then look at the line number it gives.',
      'Text needs a quote at the start AND at the end. Which line is missing one?',
      'Line 1 needs a closing " just before the ) at the end.',
    ],
  },
  {
    id: 'b2', kind: 'NameError',
    title: 'The mystery name',
    goal: 'Ask for a favourite colour, then print it back, e.g. Great choice: green',
    starter: 'colour = input("What is your favourite colour? ")\nprint("Great choice: " + color)',
    tests: [['green'], ['purple']],
    expect: ([c]) => ['Great choice: ' + c],
    hints: [
      'A NameError means Python met a name it has never seen. Which name is it?',
      'Compare the variable name on line 1 with the one on line 2, letter by letter.',
      'Line 1 makes a box called colour (with a u). Use exactly that name on line 2.',
    ],
  },
  {
    id: 'b3', kind: 'NameError',
    title: 'Too soon!',
    goal: 'Print: Your team is Tigers',
    starter: 'print("Your team is " + team)\nteam = "Tigers"',
    tests: [[]],
    expect: () => ['Your team is Tigers'],
    keepsVar: 'team',
    hints: [
      'Python runs from the top line down. What does line 1 need that does not exist yet?',
      'A box must be filled BEFORE you use it. Try changing the order of the lines.',
      'Swap the two lines, so team = "Tigers" comes first and the print() comes second.',
    ],
  },
  {
    id: 'b4', kind: 'TypeError',
    title: 'Text plus a number',
    goal: 'Ask for an age, then print how old they will be next year, e.g. Next year you will be 13',
    starter: 'age = int(input("How old are you? "))\nprint("Next year you will be " + age + 1)',
    tests: [['12'], ['14']],
    expect: ([a]) => ['Next year you will be ' + (Number(a) + 1)],
    hints: [
      'A TypeError here means text and a number are being joined with +.',
      'Work out age + 1 first, then turn the answer into text with str() before joining it.',
      'Put age + 1 inside str( ) so the whole sum becomes text before it is joined to the sentence.',
    ],
  },
  {
    id: 'b5', kind: 'No error!',
    title: 'The wrong answer',
    goal: 'Ask for two numbers, then print their total. 5 and 3 should give 8, not 53.',
    starter: 'a = input("First number: ")\nb = input("Second number: ")\ntotal = a + b\nprint(total)',
    tests: [['5', '3'], ['12', '30']],
    sum: true,
    hints: [
      'There is no error message — the program runs but gives the wrong answer. Why does 5 and 3 give 53?',
      'input() gives back text, so + joins. Cast each answer with int() so + adds.',
      'Wrap each input( ) in int( ) on lines 1 and 2, the same way you did in Lesson 4.',
    ],
  },
];

export const bugById = id => BUGS.find(b => b.id === id);

// Did the student keep using the variable in a print() (not just type the answer as text)?
const printsVar = (raw, v) => new RegExp('\\bprint\\s*\\([^\\n]*\\b' + v + '\\b').test(normalise(raw))
  && new RegExp('^[ \\t]*' + v + '\\s*=(?!=)', 'm').test(normalise(raw));

export function evalBug(id, raw, runs) {
  const bug = bugById(id);
  const failed = firstFailed(runs);
  if (failed) {
    const err = errorName(failed);
    return { pass: false, msg: err
      ? `Python still stops with a ${err}. Read the last line of the error, then fix that line.`
      : 'Python still stops with an error. Read the last line of the error, then fix that line.' };
  }
  if (bug.sum) {
    for (const r of runs) {
      const [a, b] = r.inputs;
      const joined = Number(a + b), total = Number(a) + Number(b);
      const nums = printedNumbers(r);
      if (nums.includes(joined)) return { pass: false, msg: `When ${a} and ${b} are typed it still shows ${a + b} — the answers are being joined, not added.` };
      if (!nums.includes(total)) return { pass: false, msg: `When ${a} and ${b} are typed it should print ${total}.` };
    }
    return { pass: true, msg: 'Fixed! Casting with int() makes + add instead of join.' };
  }
  for (const r of runs) {
    for (const want of bug.expect(r.inputs)) {
      if (!lineIs(r, want)) {
        const typed = r.inputs.length ? ` (when ${r.inputs.join(', ')} is typed)` : '';
        return { pass: false, msg: `It runs now, but it should print exactly: ${want}${typed}` };
      }
    }
  }
  if (bug.keepsVar && !printsVar(raw, bug.keepsVar)) {
    return { pass: false, msg: `Keep the ${bug.keepsVar} variable — fill it, then use it in your print().` };
  }
  return { pass: true, msg: 'Bug squashed!' };
}

// ── Level 5: Build it — the cinema ticket machine ────────────────────────────

export const BUILD_TESTS = [['Ava', '3'], ['Leo', '5']];
export const TICKET_PRICE = 7;

const totalFor = r => Number(r.inputs[1]) * TICKET_PRICE;
const crashedOnName = runs => runs.some(r => !r.ok && /ValueError/.test(r.output || ''));

// One entry per requirement <li> in the page's #req_build list, same order.
export const BUILD_CHECK = {
  reqs: [
    { hint: 'Ask two questions with input(): the name first, then how many tickets.',
      test: raw => inputCount(raw) >= 2 },
    { hint: 'Cast the number of tickets with int() so Python can do maths with it.',
      test: raw => /\b(?:int|float)\s*\(/.test(normalise(raw)) },
    { hint: 'Store the ticket price in its own variable, e.g. price = 7',
      test: raw => /^[ \t]*[A-Za-z_]\w*\s*=\s*7(?:\.0+)?[ \t]*$/m.test(normalise(raw)) },
    { hint: runs => crashedOnName(runs)
        ? 'Python tried to int() the name. Ask for the name FIRST, then the number of tickets.'
        : 'Print the total cost: number of tickets × the price (3 tickets should cost 21).',
      test: (raw, runs) => runs.every(r => r.ok && printedNumbers(r).includes(totalFor(r))) },
    { hint: 'Print the name and the total in one sentence, e.g. Ava, your 3 tickets cost £21',
      test: (raw, runs) => runs.every(r => r.ok && printedLines(r).some(l =>
        l.includes(r.inputs[0]) && (l.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).includes(totalFor(r))
        && squash(l).split(' ').length >= 4)) },
  ],
  passMsg: 'Ticket machine working! It gave the right total for every test customer.',
};

export function evalBuild(raw, runs) {
  const results = BUILD_CHECK.reqs.map(r => !!r.test(raw, runs));
  const pass = results.every(Boolean);
  let msg = BUILD_CHECK.passMsg;
  if (!pass) {
    const failed = firstFailed(runs);
    const i = results.findIndex(r => !r);
    const h = BUILD_CHECK.reqs[i].hint;
    msg = typeof h === 'function' ? h(runs) : h;
    if (failed && !crashedOnName(runs) && i >= 3) {
      msg = `Python stops with a ${errorName(failed) || 'error'} — fix that first (read the last line of the error).`;
    }
  }
  return { results, pass, msg };
}

// ── Extension 1: Copy the machine (write a program from a sample run) ────────

export const EXT1_TESTS = [['5', '6'], ['4', '10'], ['3', '7']];

export function evalExt1(raw, runs) {
  if (inputCount(raw) < 2) return { pass: false, msg: 'The sample run asks two questions — use input() twice.' };
  const failed = firstFailed(runs);
  if (failed) {
    return { pass: false, msg: /ValueError/.test(failed.output || '')
      ? 'Python could not turn an answer into a number. Ask for the money first, then the weeks.'
      : `Python stops with a ${errorName(failed) || 'error'} — read the last line of the error.` };
  }
  for (const r of runs) {
    const [money, weeks] = r.inputs;
    const total = Number(money) * Number(weeks);
    const re = new RegExp(`^in ${weeks} weeks you will have £ ?${total}(?:\\.0+)?\\.?$`, 'i');
    if (!printedLines(r).some(l => re.test(squash(l)))) {
      return { pass: false, msg: `With ${money} and ${weeks} typed in, the last line should be exactly: In ${weeks} weeks you will have £${total}` };
    }
  }
  return { pass: true, msg: 'Perfect copy — your program matches the sample run, even with new numbers.' };
}

// ── Extension 2: The pizza planner (four bugs in one program) ────────────────

export const EXT2_STARTER = [
  'print("=== Pizza Party Planner ===)',
  'people = input("How many people are coming? ")',
  'slices = people * 3',
  'print("You need " + slices + " slices")',
  'pizzas = slices / 8',
  'print("Order " + str(pizza) + " pizzas")',
].join('\n');

export const EXT2_TESTS = [['8'], ['4']];

export function evalExt2(raw, runs) {
  const failed = firstFailed(runs);
  if (failed) {
    return { pass: false, msg: `Next bug: Python stops with a ${errorName(failed) || 'error'}. Read the last line of the error, fix that line, then run again.` };
  }
  for (const r of runs) {
    const people = Number(r.inputs[0]);
    const slices = people * 3, pizzas = slices / 8;
    const lines = printedLines(r).map(l => squash(l).toLowerCase());
    if (!lines.includes('=== pizza party planner ===')) {
      return { pass: false, msg: 'Keep the title line: === Pizza Party Planner ===' };
    }
    const slicesLine = lines.find(l => /^you need /.test(l));
    if (!slicesLine || !new RegExp(`^you need ${slices}(?:\\.0+)? slices$`).test(slicesLine)) {
      return { pass: false, msg: `For ${people} people it should say: You need ${slices} slices${slicesLine ? ` (yours says: ${slicesLine})` : ''}` };
    }
    const orderLine = lines.find(l => /^order /.test(l));
    const m = orderLine && orderLine.match(/^order (-?\d+(?:\.\d+)?) pizzas$/);
    if (!m || Number(m[1]) !== pizzas) {
      return { pass: false, msg: `For ${people} people it should say: Order ${pizzas % 1 ? pizzas : pizzas.toFixed(1)} pizzas` };
    }
  }
  return { pass: true, msg: 'All four bugs fixed — the planner works for every party size we tried!' };
}

// ── Extension 3: Design studio badges (open-ended) ───────────────────────────
// The student's own program. Badges come from the code's shape plus one silent test
// run (every input() answered with BADGE_INPUT, so int()/float() casts still work).

export const BADGE_INPUT = '7';

// One answer per input() call, so printedLines() strips exactly the echo lines.
export const badgeInputs = raw => Array(inputCount(raw)).fill(BADGE_INPUT);

function assignedNames(raw) {
  const re = /^[ \t]*([A-Za-z_]\w*)\s*=(?!=)/gm;
  const s = normalise(raw);
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m[1]);
  return out;
}

const rhsLines = raw => normalise(raw).split('\n')
  .map(l => l.match(/^[ \t]*[A-Za-z_]\w*\s*=(?!=)(.*)$/)).filter(Boolean).map(m => m[1]);

export const BADGES = [
  { id: 'chatter',   icon: '🗣️', name: 'Chatterbox',        desc: 'Ask 3 or more questions with input()',
    test: raw => inputCount(raw) >= 3 },
  { id: 'interview', icon: '🎤', name: 'Interviewer',       desc: 'Ask 5 or more questions with input()',
    test: raw => inputCount(raw) >= 5 },
  { id: 'cruncher',  icon: '🔢', name: 'Number cruncher',   desc: 'Turn an answer into a whole number with int()',
    test: raw => /\bint\s*\(/.test(normalise(raw)) },
  { id: 'decimal',   icon: '🎯', name: 'Decimal detective', desc: 'Turn an answer into a decimal with float()',
    test: raw => /\bfloat\s*\(/.test(normalise(raw)) },
  { id: 'stitcher',  icon: '🧵', name: 'String stitcher',   desc: 'Join text and a number with + and str()',
    test: raw => /\+\s*str\s*\(|\bstr\s*\((?:[^()]|\([^()]*\))*\)\s*\+/.test(normalise(raw)) },
  { id: 'maths',     icon: '🧮', name: 'Maths master',      desc: 'Use all four of + - * / in calculations',
    // Lines with no text in them, so + used for joining strings doesn't count as maths.
    test: raw => { const s = normalise(raw).split('\n').filter(l => !/["']/.test(l)).join('\n');
      return ['+', '-', '*', '/'].every(op => s.includes(op)); } },
  { id: 'keeper',    icon: '📥', name: 'Answer keeper',     desc: 'Store the answer to a calculation in a variable',
    test: raw => rhsLines(raw).some(r => !/["']/.test(r) && /[A-Za-z_]\w*/.test(r) && /[-+*/]/.test(r)) },
  { id: 'swapper',   icon: '📦', name: 'Box swapper',       desc: 'Give a variable a new value further down',
    test: raw => { const n = assignedNames(raw); return n.some((v, i) => n.indexOf(v) !== i); } },
  { id: 'namer',     icon: '🏷️', name: 'Good names',        desc: 'Use 3+ variables, every name at least 3 letters long',
    test: raw => { const n = [...new Set(assignedNames(raw))]; return n.length >= 3 && n.every(v => v.length >= 3); } },
  { id: 'space',     icon: '🪟', name: 'Breathing space',   desc: 'Print a blank line to space out your output',
    test: raw => /\bprint\s*\(\s*(?:""|'')?\s*\)/.test(normalise(raw)) },
  { id: 'banner',    icon: '🎨', name: 'Banner maker',      desc: 'Print a line of 10+ symbols, like ==========',
    test: (raw, run) => printedLines(run).some(l => /([^\w\s])\1{9,}/.test(l)) },
  { id: 'story',     icon: '📜', name: 'Storyteller',       desc: 'Print 8 or more lines in one run',
    test: (raw, run) => printedLines(run).length >= 8 },
  { id: 'epic',      icon: '🐉', name: 'Epic',              desc: 'Print 15 or more lines in one run',
    test: (raw, run) => printedLines(run).length >= 15 },
];

export const COMPLETIONIST = { id: 'all', icon: '🏆', name: 'Completionist', desc: 'Earn every other badge' };

// The run must be a silent test run (inputs all BADGE_INPUT) that finished without an error.
export function evalBadges(raw, run) {
  if (!run?.ok) return { ok: false, earned: [] };
  const earned = BADGES.filter(b => b.test(raw, run)).map(b => b.id);
  if (earned.length === BADGES.length) earned.push(COMPLETIONIST.id);
  return { ok: true, earned };
}
