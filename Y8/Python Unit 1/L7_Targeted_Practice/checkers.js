// Targets, question pools and marking for 1_Targeted_Practice.html — the Y8 Python Unit 1
// DIRT lesson (Lesson 7). Not PRIMM: this lesson acts on the Lesson 6 assessment's feedback,
// then ends with the unit's creative Make. See the Unit 1 MTP.
//
// How the lesson works (lessons from the Unit 2 Targeted Practice and the units since):
//   • Every assessment question belongs to exactly ONE target (a skill + its misconception).
//     The plan is the 3 targets with the lowest share of marks (ties: the earlier lesson),
//     shown in lesson order so earlier ideas come first.
//   • Each target: 🔍 look back at your OWN answers (what you put, the right answer, why) →
//     ✍️ say in a sentence what you will do differently → 🧠 checkpoint: 3 in a row from a
//     pool, a wrong answer restarts with a new draw → 🛠 use it in a new program (or improve
//     your own assessment program). Each step unlocks the next.
//   • It is practice, not a test: error hints are on, and failed checks say what to change.
//   • Then 🎨 Make it: the student's own selection program, checked against their OWN test
//     plan (two tests that should take different paths), so any idea can be checked.
//
// This module imports the assessment's question bank, so ids, versions and marks always match
// what the student actually saw. If the assessment moves, update ASSESS below and the tests.

import {
  ITEMS, SECTIONS, itemById, variantOf, itemMax, normalise, squash, printedLines,
  printedNumbers, errorName, mulberry32, shuffle, hashId, ifElseLines, evalReqs,
  checkTraceValue, checkTraceOutput, showValue, branchChoices, branchAnswer, markSort,
} from '../L6_Assessment/checkers.js';

// Re-exported for the page, which shows students their own assessment answers.
export {
  ITEMS, SECTIONS, itemById, variantOf, itemMax, mulberry32, shuffle, hashId,
  checkTraceValue, checkTraceOutput, showValue, branchChoices, branchAnswer, markSort,
};

// What the fix was, for the assessment's code questions (shown when looking back).
export const FIX_NOTES = {
  o_fix: 'Line 2 was missing its closing quote. The fixed line is <code>print("Good luck")</code>',
  i_fix: 'Line 2 used <code>aminal</code>, but the box is called <code>animal</code>. A name must be spelt the same way every time.',
  c_fix: 'input() gives back text, so + joined 5 and 3 into 53. Both answers needed <code>int()</code> before they were added.',
  s_fix: 'The print() under the if had no indent, so Python stopped with an IndentationError. It needed four spaces in front.',
  o_copy: 'Copy the line exactly: <code>print("Hello, world!")</code> — lower-case print, round brackets, text in double quotes.',
  v_change: 'Only the text in the quotes on line 1 changes: <code>pet = "dog"</code>. <code>print(pet)</code> then prints the new value.',
  o_write: 'One print() for each line, with the text in quotes: <code>print("I am learning Python")</code> then <code>print("It is fun")</code>',
  v_write: '<code>colour = "blue"</code> makes the box, then <code>print(colour)</code> (no quotes) shows what is in it.',
  i_write: '<code>name = input("What is your name? ")</code> stores the answer, then <code>print("Hello " + name)</code> joins it into the message.',
  c_write: 'The answer needed <code>int()</code> to become a number, e.g. <code>age = int(input("How old are you? "))</code>, then <code>print("Next year you will be", age + 1)</code>',
  s_write: '<code>if pin == 1234:</code> (two equals signs, then a colon), an indented <code>print("Unlocked")</code>, then <code>else:</code> with an indented <code>print("Wrong PIN")</code>',
  w_warm: 'The condition needed to include 25 (<code>temp &gt;= 25</code>), and <code>print("Have a good day!")</code> needed to go at the bottom with no indent.',
  w_make: 'The ticks show which requirements your program met. You will improve this program in step 4.',
};
export const ASSESS = {
  key: 'oga_y8u1_assess_v1',                                   // its localStorage key
  title: 'Unit 1 Assessment — Python First Steps',            // its Drive results name
};

// One class sat the assessment before it was revised (38 marks). Their saved data looks the
// same, so it is spotted by never touching an item added since. They are routed on the items
// they sat, and for the questions asked differently then, their own answer isn't shown (it
// would be compared with a question they never saw).
export const FIRST_SITTING = {
  missing: ['o_copy', 'o_write', 'v_change', 'v_write', 'i_write', 'c_write', 's_indented', 's_write'],
  changed: ['v_trace', 'v_quotes', 'i_prompt', 'i_trace', 'c_sort', 'c_int', 's_equals'],
};
// The items a student sat: all of them, or the first sitting's.
export const satItems = (ids, first) => first ? ids.filter(id => !FIRST_SITTING.missing.includes(id)) : ids;

// ── Small helpers ────────────────────────────────────────────────────────────

const same = (a, b) => squash(a).toLowerCase() === squash(b).toLowerCase();
const COMPARISON = /==|!=|<=|>=|<|>/;
const count = (raw, re) => (normalise(raw).match(re) || []).length;
export const inputCount = raw => count(raw, /\binput\s*\(/g);
const firstFailed = runs => runs.find(r => !r.ok);
const allOk = runs => runs.length > 0 && runs.every(r => r.ok);
const typedPhrase = inputs => inputs.length ? `When you type ${inputs.join(' and ')}, ` : '';

// Every output line, blank ones included (for programs with no input()).
const allLines = run => (run?.output || '').replace(/\n$/, '').split('\n');

// A sentence that is really a sentence: 4+ words, 3+ different, not key-mashing.
export function realSentence(text) {
  const t = String(text || '').trim();
  if (t.length < 15) return false;
  const words = t.toLowerCase().match(/[a-z']+/g) || [];
  if (words.length < 4 || new Set(words).size < 3) return false;
  if (/(.)\1{4,}/.test(t)) return false;
  return words.filter(w => /[aeiouy]/.test(w) && w.length >= 2).length >= 3;
}

// Question number as the assessment showed it: 1.1, 2.3 … (first: the first sitting's numbers)
export function questionNumber(itemId, first = false) {
  const it = itemById(itemId);
  const sec = SECTIONS.find(s => s.id === it.section);
  const k = satItems(ITEMS.filter(i => i.section === it.section).map(i => i.id), first).indexOf(itemId);
  return sec.bonus ? `★${k + 1}` : `${sec.n}.${k + 1}`;
}

// ── Targets ──────────────────────────────────────────────────────────────────
// Every core assessment item is in exactly one target (checked by the tests).

// Selection questions: the four outcomes, with the right one first.
function branchQ(id, code, typed, a, b, after, which, why) {
  const opts = which === 'a'
    ? [`${a}, then ${after}`, `${b}, then ${after}`, `${a} only`, `${b} only`]
    : [`${b}, then ${after}`, `${a}, then ${after}`, `${b} only`, `${a} only`];
  return { id, kind: 'mcq', q: `The user types <strong>${typed}</strong>. What is printed?`, code, opts, why };
}
const TEMP  = 'temp = int(input("Temperature? "))\nif temp > 25:\n    print("Hot")\nelse:\n    print("Not hot")\nprint("Bye")';
const COINS = 'coins = int(input("Coins? "))\nif coins >= 10:\n    print("Buy the hat")\nelse:\n    print("Keep saving")\nprint("Shop closed")';
const FILM  = 'age = int(input("Age? "))\nif age < 16:\n    print("Child ticket")\nelse:\n    print("Adult ticket")\nprint("Enjoy the film")';
const GAME  = 'score = int(input("Score? "))\nif score >= 5:\n    print("Well done")\n    print("You win")\nelse:\n    print("Unlucky")\nprint("Game over")';

const NAME_ERR = (line, src, name) =>
  `Traceback (most recent call last):\n  File "main.py", line ${line}, in <module>\n    ${src}\nNameError: name '${name}' is not defined`;

export const TARGETS = [
  // ── Lesson 1 ──────────────────────────────────────────────────────────────
  { id: 'print', short: 'print()', icon: '🖨️', title: 'print() and text', lesson: 'Lesson 1',
    items: ['o_print', 'o_lines', 'o_fix', 'o_copy', 'o_write'],
    pick: 'Writing print() lines exactly right, and what print() on its own does',
    rule: [
      '<code>print</code> is all lower case and needs round brackets: <code>print( )</code>',
      'Text goes in quotes, with a quote at <strong>both</strong> ends: <code>"Hello"</code>',
      '<code>print()</code> with nothing inside prints an <strong>empty line</strong>. It still counts as a line.',
    ],
    example: { code: 'print("Ready")\nprint()\nprint("Go!")', out: 'Ready\n\nGo!' },
    pool: [
      { id: 'p1', kind: 'mcq', q: 'Which line prints <strong>Game over</strong>?',
        opts: ['print("Game over")', 'Print("Game over")', 'print(Game over)', 'print("Game over)'],
        why: 'Lower-case print, round brackets, and quotes at both ends of the text.' },
      { id: 'p2', kind: 'type', as: 'number', q: 'How many lines does this print? Count empty lines too.',
        code: 'print("A")\nprint()\nprint("B")', answer: 3,
        why: 'print() prints an empty line, so that is A, an empty line, then B: 3 lines.' },
      { id: 'p3', kind: 'type', as: 'number', q: 'How many lines does this print? Count empty lines too.',
        code: 'print()\nprint("Hi")\nprint()\nprint()', answer: 4,
        why: 'Every print() makes one line, even an empty one. There are 4 print lines.' },
      { id: 'p4', kind: 'mcq', q: 'What does this line print?', code: 'print("2 + 2")',
        opts: ['2 + 2', '4', '"2 + 2"', 'An error'],
        why: 'Anything in quotes is text, printed exactly as it is. print() never shows the quotes.' },
      { id: 'p5', kind: 'mcq', q: 'Python shows this error. Which change fixes it?', code: 'print("Hello"',
        error: 'SyntaxError: \'(\' was never closed',
        opts: ['Add a ) at the end of the line', 'Add a " at the end of the line', 'Change print to Print', 'Add a : at the end of the line'],
        why: 'The bracket opened after print was never closed. Every ( needs a ).' },
      { id: 'p6', kind: 'mcq', q: 'Python shows this error. Which change fixes it?', code: 'print("See you soon)',
        error: 'SyntaxError: unterminated string literal (detected at line 1)',
        opts: ['Add a " after soon', 'Add a ) after soon', 'Take out the brackets', 'Change print to Print'],
        why: 'The text was never closed. The quote goes straight after the last word: "See you soon"' },
      { id: 'p7', kind: 'mcq', q: 'Python says <code>NameError: name \'Print\' is not defined</code>. What is wrong?',
        opts: ['print must be lower case', 'The text needs more quotes', 'The line needs a colon', 'The line has no brackets'],
        why: 'Python only knows print in lower case. Print with a capital P is a name it has never seen.' },
    ],
    apply: { kind: 'fix', title: 'Fix the disco poster', keepBlank: true,
      goal: 'This program should print the poster below, with an <strong>empty line</strong> under the title. It has 3 bugs, and the empty line is missing. Run it, read each error, fix it, and run it again.',
      starter: 'print("SCHOOL DISCO")\nprint("Friday at 7pm"\nPrint("Tickets cost £2")\nprint("Bring a friend!)',
      tests: [[]],
      expect: () => ['SCHOOL DISCO', '', 'Friday at 7pm', 'Tickets cost £2', 'Bring a friend!'],
      diagnose: (raw, runs) => allLines(runs[0]).every(l => l.trim())
        ? 'All the text is right now. One more thing: add a print() line straight after the title to make the empty line.' : '' } },

  { id: 'errors', short: 'Errors', icon: '🐛', title: 'Reading error messages', lesson: 'Lessons 1–2',
    items: ['o_errline', 'o_errfix', 'v_order'],
    pick: 'Reading an error message to find the line and the bug',
    rule: [
      'Read the <strong>last line</strong> of the error first: it names the kind of error.',
      'Then find the <strong>line number</strong> it gives, and read that line aloud.',
      '<code>NameError</code> means Python does not know that name: it is <strong>spelt differently</strong>, or it is used <strong>before</strong> the line that makes it.',
    ],
    example: { code: 'lives = 3\nprint(lifes)', out: 'NameError: name \'lifes\' is not defined', err: true },
    pool: [
      { id: 'e1', kind: 'mcq', q: 'Which line has the bug?', code: 'name = "Zara"\nage = 13\nprint(nmae)',
        error: NAME_ERR(3, 'print(nmae)', 'nmae'), opts: ['Line 3', 'Line 1', 'Line 2', 'All of them'],
        why: 'The error says line 3, and the last line says nmae is not defined.' },
      { id: 'e2', kind: 'mcq', q: 'This program should print Zara. Which change makes it work?', code: 'name = "Zara"\nage = 13\nprint(nmae)',
        error: NAME_ERR(3, 'print(nmae)', 'nmae'),
        opts: ['Spell name correctly on line 3', 'Put quotes around nmae on line 3', 'Delete line 2 from the program', 'Add a space before print on line 3'],
        why: 'nmae is a spelling mistake. The box is called name, so spell it the same way.' },
      { id: 'e3', kind: 'mcq', q: 'What happens when this program runs?', code: 'print("Welcome " + player)\nplayer = "Kai"',
        opts: ['A NameError on line 1', 'It prints Welcome Kai', 'It prints Welcome player', 'A SyntaxError on line 2'],
        why: 'Python runs from the top. Line 1 uses player before line 2 has made it.' },
      { id: 'e4', kind: 'mcq', q: 'Python shows a long error message. Which part do you read <strong>first</strong>?',
        opts: ['The last line', 'The first line', 'The middle line', 'The longest line'],
        why: 'The last line names the error and says what went wrong. Then use its line number.' },
      { id: 'e5', kind: 'type', as: 'number', q: 'Which line number has the bug? Type the number.',
        code: 'print("Quiz time")\nscore = 0\nprint("Question 1")\nprint(Score)',
        error: NAME_ERR(4, 'print(Score)', 'Score'), answer: 4,
        why: 'The error says line 4. Score with a capital S is not the same name as score.' },
      { id: 'e6', kind: 'mcq', q: 'Why does Python say <code>NameError</code> here?', code: 'colour = "red"\nprint(colour)\nprint(color)',
        error: NAME_ERR(3, 'print(color)', 'color'),
        opts: ['color is spelt differently', 'colour needs quotes round it', 'print cannot be used twice', 'red should not have quotes'],
        why: 'The box is called colour. color (no u) is a different name that was never made.' },
      { id: 'e7', kind: 'mcq', q: 'What does a <code>NameError</code> mean?',
        opts: ['Python does not know that name', 'A bracket or a quote is missing', 'The spaces at the start are wrong', 'Text was joined to a number'],
        why: 'A missing bracket or quote is a SyntaxError, wrong spaces an IndentationError, text + number a TypeError.' },
    ],
    apply: { kind: 'fix', title: 'Fix the team sheet',
      goal: 'This program should print <code>Your team is Rovers</code> and then <code>Come on Rovers!</code>. It has 2 bugs. Keep using the variable <code>team</code> in both print lines.',
      starter: 'print("Your team is " + team)\nteam = "Rovers"\nprint("Come on " + teem + "!")',
      tests: [[]],
      expect: () => ['Your team is Rovers', 'Come on Rovers!'],
      check: raw => normalise(raw).split('\n').filter(l => /\bprint\s*\(/.test(l) && /\bteam\b/.test(l)).length >= 2
        ? '' : 'It prints the right thing, but both print lines must still use the variable team (not the word Rovers typed in).' } },

  // ── Lesson 2 ──────────────────────────────────────────────────────────────
  { id: 'variables', short: 'Variables', icon: '📦', title: 'Variables: boxes and new values', lesson: 'Lesson 2',
    items: ['v_trace', 'v_quotes', 'v_change', 'v_write'],
    pick: 'Tracing what is in each variable, and quotes vs variable names',
    rule: [
      '<code>=</code> stores the value on the right in the box on the left.',
      'Storing a new value <strong>replaces</strong> the old one. A print() that ran earlier already used the old value.',
      'With quotes it is text: <code>print("pet")</code> prints the word pet. Without quotes, <code>print(pet)</code> prints what is in the box.',
    ],
    example: { code: 'pet = "cat"\nprint(pet)\npet = "dog"\nprint("pet")\nprint(pet)', out: 'cat\npet\ndog' },
    pool: [
      { id: 'v1', kind: 'type', as: 'value', q: 'What is in <code>colour</code> at the end?', code: 'colour = "red"\ncolour = "blue"',
        answer: { type: 'str', value: 'blue' }, why: 'The second line replaces red with blue. It is text, so it is written "blue".' },
      { id: 'v2', kind: 'mcq', q: 'What does this program print?', code: 'band = "Queen"\nprint("band")',
        opts: ['band', 'Queen', '"Queen"', 'A NameError'], why: 'band is in quotes, so it is printed as the word band, not what is in the box.' },
      { id: 'v3', kind: 'type', as: 'output', q: 'What does this program print?', code: 'snack = "crisps"\nprint(snack)\nsnack = "apple"',
        answer: 'crisps', why: 'print() ran on line 2, before snack was changed on line 3.' },
      { id: 'v4', kind: 'type', as: 'value', q: 'What is in <code>name</code> at the end?', code: 'name = "Al"\nname = name + "ex"',
        answer: { type: 'str', value: 'Alex' }, why: 'name + "ex" joins Al and ex, and the answer is stored back in name.' },
      { id: 'v5', kind: 'type', as: 'value', q: 'What is in <code>score</code> at the end?', code: 'score = 5\nscore = 8',
        answer: { type: 'int', value: 8 }, why: 'The 5 is replaced by 8. It is a number, so no quotes.' },
      { id: 'v6', kind: 'type', as: 'output', q: 'What does this program print?', code: 'food = "chips"\ndrink = "cola"\nprint(food + " and " + drink)',
        answer: 'chips and cola', why: '+ joins the text exactly. The spaces come from " and ".' },
      { id: 'v7', kind: 'mcq', q: 'What does <code>=</code> do in <code>score = 10</code>?',
        opts: ['Stores 10 in the box called score', 'Checks if score is the same as 10', 'Prints score and 10 side by side', 'Turns score and 10 into text'],
        why: 'One = stores. Checking if two things are the same needs ==.' },
    ],
    apply: { kind: 'fix', title: 'Swap the pet',
      goal: 'Add <strong>one line</strong> so the program prints <code>I have a cat</code> and then <code>Now I have a dog</code>. Do not change the two print lines.',
      starter: 'pet = "cat"\nprint("I have a " + pet)\nprint("Now I have a " + pet)',
      tests: [[]],
      expect: () => ['I have a cat', 'Now I have a dog'],
      check: raw => {
        const lines = raw.split('\n').map(squash);
        const keep = ['print("I have a " + pet)', 'print("Now I have a " + pet)'].every(k => lines.includes(squash(k)));
        return keep ? '' : 'It prints the right thing, but the two print lines must stay exactly as they were. Put a new value in pet instead.';
      },
      diagnose: (raw, runs) => /dog/.test(printedLines(runs[0])[0] || '')
        ? 'The first line says dog too. The new line must go after the first print() but before the second.' : '' } },

  // ── Lesson 3 ──────────────────────────────────────────────────────────────
  { id: 'input', short: 'input()', icon: '⌨️', title: 'input(): asking and storing', lesson: 'Lesson 3',
    items: ['i_prompt', 'i_trace', 'i_store', 'i_fix', 'i_write'],
    pick: 'What input() stores, and joining an answer into a sentence',
    rule: [
      'The text in <code>input("...")</code> is only shown as the question. Only the <strong>answer</strong> is stored.',
      'Write it as <code>name = input("Name? ")</code>: the answer goes into the box on the left.',
      '<code>+</code> joins text <strong>exactly</strong>: it never adds a space. Put the space inside the quotes: <code>"Hello " + name</code>',
    ],
    example: { code: 'name = input("Name? ")\nprint("Hello" + name)\nprint("Hello " + name)', out: 'Name? Sam\nHelloSam\nHello Sam', typed: 'Sam' },
    pool: [
      { id: 'n1', kind: 'mcq', q: 'The user types <strong>Leeds</strong>. What is stored in <code>team</code>?', code: 'team = input("Which team? ")',
        opts: ['Leeds', 'Which team?', 'Which team? Leeds', 'team'], why: 'The question is only shown. Only the answer, Leeds, is stored.' },
      { id: 'n2', kind: 'type', as: 'output', q: 'The user types <strong>Ali</strong>. What does the print() line show?',
        code: 'name = input("Name? ")\nprint("Hi" + name)', answer: 'HiAli', why: '+ never adds a space. "Hi" has no space at the end, so you get HiAli.' },
      { id: 'n3', kind: 'type', as: 'output', q: 'The user types <strong>Ali</strong>. What does the print() line show?',
        code: 'name = input("Name? ")\nprint("Hi " + name + "!")', answer: 'Hi Ali!', why: 'The space is inside "Hi ", and the ! is joined straight on.' },
      { id: 'n4', kind: 'mcq', q: 'Which line asks for a colour <strong>and stores the answer</strong>?',
        opts: ['colour = input("Colour? ")', 'input("Colour? ") = colour', 'colour = "input(Colour?)"', 'print(input("Colour? "))'],
        why: 'The box goes on the left of =, and input() on the right.' },
      { id: 'n5', kind: 'type', as: 'output', q: 'The user types <strong>pizza</strong>. What does the print() line show?',
        code: 'food = input("Favourite food? ")\nprint("I love " + food + " too")', answer: 'I love pizza too',
        why: 'The spaces are inside the quotes, so the words come out with spaces.' },
      { id: 'n6', kind: 'mcq', q: 'What happens when this runs?', code: 'city = input("City? ")\nprint(City)',
        opts: ['A NameError: City is not city', 'It prints the city typed in', 'It prints the word City', 'It asks the question twice'],
        why: 'Capital letters matter. The box is city, so City is a name Python does not know.' },
      { id: 'n7', kind: 'mcq', q: 'What does the text inside <code>input("...")</code> do?',
        opts: ['It is shown as the question', 'It is stored in the variable', 'It is joined to the answer', 'It is checked against the answer'],
        why: 'It is only a prompt for the user. Only what they type is stored.' },
    ],
    apply: { kind: 'fix', title: 'Fix the colour question',
      goal: 'Typing <strong>red</strong> should print <code>Your favourite colour is red</code>. The program has 2 bugs on line 2.',
      starter: 'colour = input("What is your favourite colour? ")\nprint("Your favourite colour is" + color)',
      tests: [['red'], ['blue']],
      expect: ([c]) => [`Your favourite colour is ${c}`],
      diagnose: (raw, runs) => runs.some(r => printedLines(r).some(l => /colour is\S/i.test(l)))
        ? 'Look at the gap between is and the colour: + does not add a space.' : '' } },

  // ── Lesson 4 ──────────────────────────────────────────────────────────────
  { id: 'cast_int', short: 'int()', icon: '🔢', title: 'input() gives text: int() for maths', lesson: 'Lesson 4',
    items: ['c_join', 'c_int', 'c_fix', 'c_write'],
    pick: 'Why 5 + 3 can give 53, and using int() so Python does maths',
    rule: [
      '<code>input()</code> <strong>always</strong> gives back text (a string), even when the user types a number.',
      '<code>+</code> with text <strong>joins</strong>: <code>"5" + "3"</code> is <code>"53"</code>. There is no error, just the wrong answer.',
      'Wrap the input in <code>int()</code> to make a whole number: <code>apples = int(input("Apples? "))</code>',
    ],
    example: { code: 'a = input("A? ")\nb = int(input("B? "))\nprint(a + a)\nprint(b + b)', out: 'A? 5\nB? 5\n55\n10', typed: '5' },
    pool: [
      { id: 'ci1', kind: 'type', as: 'output', q: 'The user types <strong>2</strong>, then <strong>3</strong>. What is printed?',
        code: 'a = input("First? ")\nb = input("Second? ")\nprint(a + b)', answer: '23',
        why: 'Both answers are text, so + joins them: 23.' },
      { id: 'ci2', kind: 'type', as: 'output', q: 'The user types <strong>2</strong>, then <strong>3</strong>. What is printed?',
        code: 'a = int(input("First? "))\nb = int(input("Second? "))\nprint(a + b)', answer: '5',
        why: 'int() made both answers numbers, so + adds them: 5.' },
      { id: 'ci3', kind: 'mcq', q: 'Which of these is an <strong>int</strong> (a whole number)?',
        opts: ['7', '"7"', '7.5', '"seven"'], why: 'An int has no quotes and no decimal point.' },
      { id: 'ci4', kind: 'type', as: 'output', q: 'What does this print?', code: 'print("4" + "4")', answer: '44',
        why: 'In quotes they are text, so + joins them: 44.' },
      { id: 'ci5', kind: 'mcq', q: 'What kind of value does <code>input()</code> always give back?',
        opts: ['Text (a string)', 'A whole number (an int)', 'A decimal (a float)', 'Whatever was typed in'],
        why: 'Even when the user types 12, input() gives back the text "12".' },
      { id: 'ci6', kind: 'mcq', q: 'Which line stores the age as a number you can do maths with?',
        opts: ['age = int(input("Age? "))', 'age = input(int("Age? "))', 'age = input("Age? ")', 'age = "int(input(Age?))"'],
        why: 'int() goes around the whole input(...), so the answer is turned into a number.' },
      { id: 'ci7', kind: 'type', as: 'output', q: 'The user types <strong>6</strong>. What is printed?',
        code: 'x = int(input("Number? "))\nprint(x * 2)', answer: '12', why: 'x holds the number 6, so x * 2 is 12.' },
    ],
    apply: { kind: 'fix', title: 'Fix the points total',
      goal: 'Typing <strong>7</strong> and <strong>5</strong> should print <code>Total points: 12</code>, but it prints 75. There is no error message.',
      starter: 'round1 = input("Points in round 1? ")\nround2 = input("Points in round 2? ")\ntotal = round1 + round2\nprint("Total points: " + str(total))',
      tests: [['7', '5'], ['10', '20']],
      expect: ([a, b]) => [`Total points: ${Number(a) + Number(b)}`],
      diagnose: (raw, runs) => runs.some(r => printedLines(r).some(l => l.includes(r.inputs.join(''))))
        ? 'It still joins the two answers. input() gives back text: each answer needs to become a number before they are added.' : '' } },

  { id: 'cast_str', short: 'str()', icon: '🧵', title: 'Joining numbers into text: str()', lesson: 'Lesson 4',
    items: ['c_str', 'c_sort'],
    pick: 'Which sums join, which add, which crash, and using str()',
    rule: [
      'Text + text <strong>joins</strong>. Number + number <strong>adds</strong>.',
      'Text + number is a <code>TypeError</code>: Python will not mix them.',
      'Use <code>str()</code> to turn a number into text so it can be joined: <code>"Score: " + str(score)</code>',
    ],
    example: { code: 'score = 7\nprint("Score: " + str(score))\nprint("Next: " + str(score + 1))', out: 'Score: 7\nNext: 8' },
    pool: [
      { id: 'cs1', kind: 'mcq', q: '<code>lives</code> holds the number 3. Which line prints <strong>Lives: 3</strong>?',
        opts: ['print("Lives: " + str(lives))', 'print("Lives: " + lives)', 'print("Lives: " + int(lives))', 'print("Lives: " + "lives")'],
        why: 'str() turns 3 into text so it can be joined. "lives" in quotes would print the word lives.' },
      { id: 'cs2', kind: 'mcq', q: 'What happens?', code: 'print("Level " + 2)',
        opts: ['A TypeError', 'It prints Level 2', 'It prints Level2', 'A NameError'],
        why: '"Level " is text and 2 is a number. Text + number is a TypeError.' },
      { id: 'cs3', kind: 'type', as: 'output', q: 'What does this print?', code: 'print("Level " + str(2 + 3))', answer: 'Level 5',
        why: 'The maths inside the brackets happens first (5), then str() makes it text to join.' },
      { id: 'cs4', kind: 'type', as: 'output', q: 'What does this print?', code: 'print("Level " + str(2) + str(3))', answer: 'Level 23',
        why: 'str(2) and str(3) are both text, so + joins them: 23.' },
      { id: 'cs5', kind: 'mcq', q: '<code>num</code> came from input(). What does <code>num + "!"</code> do?', code: 'num = input("Number? ")',
        opts: ['Joins text', 'Does maths', 'Gives a TypeError', 'Gives a NameError'],
        why: 'num is text (from input) and "!" is text, so + joins them.' },
      { id: 'cs6', kind: 'mcq', q: '<code>num</code> came from input(). What does <code>num + 1</code> do?', code: 'num = input("Number? ")',
        opts: ['Gives a TypeError', 'Joins text', 'Does maths', 'Gives a NameError'],
        why: 'num is text and 1 is a number. Text + number is a TypeError.' },
      { id: 'cs7', kind: 'mcq', q: 'What does <code>str()</code> do?',
        opts: ['Turns a value into text', 'Turns text into a number', 'Prints a value on screen', 'Joins two bits of text'],
        why: 'str() makes text. int() is the one that makes a whole number.' },
      { id: 'cs8', kind: 'type', as: 'output', q: 'What does this print?', code: 'goals = 4\nprint("Goals: " + str(goals * 2))', answer: 'Goals: 8',
        why: 'goals * 2 is 8, and str() turns it into text to join.' },
    ],
    apply: { kind: 'fix', title: 'Fix the birthday message',
      goal: 'Typing <strong>12</strong> should print <code>Next year you will be 13</code>. Right now it stops with a TypeError.',
      starter: 'age = int(input("How old are you? "))\nprint("Next year you will be " + age + 1)',
      tests: [['12'], ['9']],
      expect: ([a]) => [`Next year you will be ${Number(a) + 1}`],
      diagnose: (raw, runs) => runs.some(r => printedLines(r).some(l => l.includes(r.inputs[0] + '1')))
        ? `It printed ${runs[0].inputs[0]}1: that joined the age and 1 as text. Do the maths first, then turn the answer into text.` : '' } },

  // ── Lesson 5 ──────────────────────────────────────────────────────────────
  { id: 'branches', short: 'Branches', icon: '🔀', title: 'Which branch runs?', lesson: 'Lesson 5',
    items: ['s_indented', 's_branch', 's_indent', 's_fix'],
    pick: 'Tracing if/else, and what the indent does',
    rule: [
      'If the condition is <strong>True</strong>, only the indented lines under <code>if</code> run. If it is False, only the lines under <code>else</code> run.',
      'A line with <strong>no indent</strong> after the if/else is not part of it, so it <strong>always</strong> runs.',
      'Check the number on the boundary: <code>&gt;=</code> includes it, <code>&gt;</code> and <code>&lt;</code> do not.',
    ],
    example: { code: 'age = int(input("Age? "))\nif age >= 13:\n    print("Welcome")\nelse:\n    print("Too young")\nprint("Bye")', out: 'Age? 13\nWelcome\nBye', typed: '13' },
    pool: [
      branchQ('b1', TEMP, '30', 'Hot', 'Not hot', 'Bye', 'a', '30 > 25 is True, so the if branch runs. Bye has no indent, so it always runs.'),
      branchQ('b2', TEMP, '25', 'Hot', 'Not hot', 'Bye', 'b', '25 > 25 is False (25 is not MORE than 25), so the else branch runs.'),
      branchQ('b3', COINS, '10', 'Buy the hat', 'Keep saving', 'Shop closed', 'a', '10 >= 10 is True: >= includes 10 itself.'),
      branchQ('b4', COINS, '9', 'Buy the hat', 'Keep saving', 'Shop closed', 'b', '9 >= 10 is False, so the else branch runs, then Shop closed.'),
      branchQ('b5', FILM, '16', 'Child ticket', 'Adult ticket', 'Enjoy the film', 'b', '16 < 16 is False (16 is not LESS than 16), so else runs.'),
      { id: 'b6', kind: 'mcq', q: 'The user types <strong>7</strong>. What is printed?', code: GAME,
        opts: ['Well done, You win, Game over', 'Well done, Game over', 'Well done, You win', 'Unlucky, Game over'],
        why: 'Both indented lines under the if run. Game over has no indent, so it runs too.' },
      { id: 'b7', kind: 'mcq', q: 'The user types <strong>3</strong>. What is printed?', code: GAME,
        opts: ['Unlucky, Game over', 'Unlucky', 'Unlucky, You win, Game over', 'Well done, You win, Game over'],
        why: '3 >= 5 is False, so only the else line runs, then Game over.' },
    ],
    apply: { kind: 'fix', title: 'Fix the ticket machine',
      goal: '<code>Thanks for visiting</code> should be printed for <strong>everyone</strong>, whatever the answer. There are 2 bugs: one stops the program, and one only shows when you test it.',
      starter: 'tickets = int(input("How many tickets are left? "))\nif tickets > 0:\nprint("Book now!")\nelse:\n    print("Sold out")\n    print("Thanks for visiting")',
      tests: [['5'], ['0'], ['1']],
      testNote: 'Checked with 5, 0 and 1.',
      expect: ([t]) => [Number(t) > 0 ? 'Book now!' : 'Sold out', 'Thanks for visiting'],
      diagnose: (raw, runs) => runs.some(r => Number(r.inputs[0]) > 0 && !printedLines(r).some(l => /thanks/i.test(l)))
        ? 'Thanks for visiting only shows when it is sold out. Which block is it inside? Take away its indent.' : '' } },

  { id: 'conditions', short: 'Conditions', icon: '⚖️', title: 'Writing conditions', lesson: 'Lesson 5',
    items: ['s_equals', 's_boundary', 's_write'],
    pick: 'Choosing ==, <, >, <= or >= so the boundary is right',
    rule: [
      '<code>==</code> compares. One <code>=</code> stores, so <code>if score = 10:</code> is a SyntaxError.',
      '"<strong>11 or older</strong>" / "<strong>at least 11</strong>" means <code>&gt;= 11</code>. "<strong>Over 11</strong>" means <code>&gt; 11</code>.',
      'Test the boundary number itself: it is where most bugs hide.',
    ],
    example: { code: 'age = 11\nprint(age >= 11)\nprint(age > 11)', out: 'True\nFalse' },
    pool: [
      { id: 'k1', kind: 'mcq', q: 'Free entry if you are <strong>under 5</strong>. Which line is right?',
        opts: ['if age < 5:', 'if age <= 5:', 'if age > 5:', 'if age == 5:'], why: 'Under 5 means 4 or less, so 5 itself is not let in: < 5.' },
      { id: 'k2', kind: 'mcq', q: 'You can ride if you are <strong>at least 140</strong> cm. Which line is right?',
        opts: ['if height >= 140:', 'if height > 140:', 'if height <= 140:', 'if height == 140:'], why: 'At least 140 includes 140 itself: >= 140.' },
      { id: 'k3', kind: 'mcq', q: 'A bonus if the score is <strong>more than 100</strong>. Which line is right?',
        opts: ['if score > 100:', 'if score >= 100:', 'if score < 100:', 'if score == 100:'], why: 'More than 100 does not include 100 itself: > 100.' },
      { id: 'k4', kind: 'mcq', q: 'Which line checks if <code>answer</code> is <strong>exactly</strong> 42?',
        opts: ['if answer == 42:', 'if answer = 42:', 'if answer => 42:', 'if "answer" == 42:'], why: 'Two equals signs compare. answer has no quotes because it is a variable.' },
      { id: 'k5', kind: 'mcq', q: '<code>age</code> holds 18. What is <code>age >= 18</code>?',
        opts: ['True', 'False', 'A SyntaxError', 'A TypeError'], why: '>= means more than OR equal to. 18 is equal to 18, so it is True.' },
      { id: 'k6', kind: 'mcq', q: '<code>age</code> holds 18. What is <code>age > 18</code>?',
        opts: ['False', 'True', 'A SyntaxError', 'A TypeError'], why: '> means more than. 18 is not more than 18, so it is False.' },
      { id: 'k7', kind: 'mcq', q: 'You can vote at <strong>18 or over</strong>. Which line is right?',
        opts: ['if age >= 18:', 'if age > 18:', 'if age <= 18:', 'if age == 18:'], why: '18 or over includes 18 itself: >= 18.' },
      { id: 'k8', kind: 'mcq', q: 'Why is <code>if score = 10:</code> a SyntaxError?',
        opts: ['= stores, but == compares', 'The line needs two colons', '10 should be in quotes', 'score must be in capitals'],
        why: 'An if needs a comparison. = is for storing a value; == checks if two values are the same.' },
    ],
    apply: { kind: 'fix', title: 'Fix the bus pass checker',
      goal: 'Anyone <strong>60 or over</strong> gets a free bus pass; everyone else pays the full fare. There are 2 bugs: fix the first, then test it with different ages.',
      starter: 'age = int(input("How old are you? "))\nif age = 60:\n    print("Free bus pass")\nelse:\n    print("Full fare")',
      tests: [['60'], ['59'], ['75']],
      testNote: 'Checked with 60, 59 and 75.',
      expect: ([a]) => [Number(a) >= 60 ? 'Free bus pass' : 'Full fare'],
      diagnose: (raw, runs) => {
        const got = a => (printedLines(runs.find(r => r.inputs[0] === a)) || []).join(' ');
        if (/free/i.test(got('60')) && !/free/i.test(got('75'))) return '75 should get a free pass too. == only matches exactly 60.';
        if (!/free/i.test(got('60')) && /free/i.test(got('75'))) return '60 itself should get a free pass. Which comparison includes 60?';
        return '';
      } } },

  // ── Lessons 1–5 ───────────────────────────────────────────────────────────
  { id: 'write', short: 'Whole program', icon: '✍️', title: 'Writing a whole program', lesson: 'Lessons 1–5',
    items: ['w_warm', 'w_make'],
    pick: 'Putting input, int(), if/else and print together in one program',
    rule: [
      'Plan the order: <strong>ask</strong> (input) → <strong>convert</strong> (int) → <strong>decide</strong> (if/else) → <strong>tell</strong> (print).',
      'Every <code>if</code> and <code>else</code> line ends with a colon, and the lines inside are indented.',
      'Test both paths <strong>and</strong> the boundary number before you say it works.',
    ],
    example: { code: 'name = input("Name? ")\nage = int(input("Age? "))\nif age >= 12:\n    print("Enjoy, " + name)\nelse:\n    print("Sorry, " + name)', out: 'Name? Zoe\nAge? 12\nEnjoy, Zoe', typed: 'Zoe' },
    pool: [
      { id: 'w1', kind: 'mcq', q: 'This program stops with a <code>TypeError</code> on line 2. Which change fixes it?',
        code: 'age = input("Age? ")\nif age >= 12:\n    print("OK")\nelse:\n    print("Too young")',
        opts: ['Put int( ) around the input on line 1', 'Put quotes around the 12 on line 2', 'Change >= to = on line 2', 'Indent line 4 by four spaces'],
        why: 'input() gives text, and Python cannot compare text with the number 12. int() makes it a number.' },
      { id: 'w2', kind: 'mcq', q: 'What is missing from this program?', code: 'if age >= 12:\n    print("Yes")\nelse\n    print("No")',
        opts: ['A colon after else', 'Brackets after else', 'Quotes around 12', 'An indent before else'],
        why: 'Both if and else lines end with a colon.' },
      { id: 'w3', kind: 'mcq', q: 'Under 12, the shop says how long to wait. Which line works?',
        opts: ['print("Wait " + str(12 - age) + " years")', 'print("Wait " + 12 - age + " years")', 'print("Wait " + str(age - 12) + " years")', 'print("Wait 12 - age years")'],
        why: '12 - age gives the years left (12 − 9 = 3), and str() turns it into text to join.' },
      { id: 'w4', kind: 'mcq', q: 'Which line gets a number from the user that you can compare with 12?',
        opts: ['age = int(input("Age? "))', 'age = input("Age? ")', 'age = int("Age? ")', 'int(age) = input("Age? ")'],
        why: 'input() asks, int() turns the answer into a number, and = stores it in age.' },
      { id: 'w5', kind: 'mcq', q: 'Which line runs for <strong>everyone</strong>, whatever age they type?',
        code: 'age = int(input("Age? "))\nif age >= 12:\n    print("Enjoy!")\nelse:\n    print("Sorry")\nprint("Thanks for shopping")',
        opts: ['Line 6', 'Line 3', 'Line 5', 'Line 2'], why: 'Line 6 has no indent, so it is not inside the if or the else.' },
      { id: 'w6', kind: 'mcq', q: '<code>name</code> holds Ava. Which line prints <strong>Thanks Ava!</strong>?',
        opts: ['print("Thanks " + name + "!")', 'print("Thanks name!")', 'print("Thanks" + "name" + "!")', 'print(Thanks + name + "!")'],
        why: 'name has no quotes, so its value is joined in. The space is inside "Thanks ".' },
      { id: 'w7', kind: 'mcq', q: 'The program asks for a name, then an age. In what order should the parts go?',
        opts: ['Ask name → ask age → if/else', 'if/else → ask name → ask age', 'Ask age → if/else → ask name', 'Ask name → if/else → ask age'],
        why: 'Python runs from the top, so it must have both answers before the if can use them.' },
    ],
    // Filled in per student by applyFor(): their own game shop (or warm-up) from the assessment.
    apply: null },
];

export const targetById = id => TARGETS.find(t => t.id === id);
export const CHAIN = 3;   // checkpoint questions in a row

// ── Routing: which targets each student practises ───────────────────────────

// points: { itemId: marks } from the assessment. first: they sat the first version.
export function targetScores(points = {}, first = false) {
  return TARGETS.map((t, order) => {
    const items = satItems(t.items, first);
    const max = items.reduce((s, id) => s + itemMax(itemById(id)), 0);
    const earned = items.reduce((s, id) => s + Math.min(points[id] || 0, itemMax(itemById(id))), 0);
    return { id: t.id, order, earned, max, lost: max - earned, ratio: earned / max };
  });
}

// The plan: up to `size` targets with marks lost, lowest share first (ties: the earlier
// lesson, so a student who struggled everywhere starts with the foundations), then shown in
// lesson order.
export function choosePlan(points = {}, size = 3, first = false) {
  return targetScores(points, first)
    .filter(s => s.lost > 0)
    .sort((a, b) => a.ratio - b.ratio || a.order - b.order)
    .slice(0, size)
    .sort((a, b) => a.order - b.order)
    .map(s => s.id);
}

// The assessment data this lesson works from, from either source, in one shape.
//   local: the assessment's own saved state { pts, seed, sel, sort, code, results, … }
//   drive: its submitResults payload       { points, seed?, sel?, sort?, code?, results?, … }
export function readSnapshot(raw, source) {
  if (!raw || typeof raw !== 'object') return null;
  const points = raw.pts || raw.points;
  if (!points || typeof points !== 'object') return null;
  const has = (o, k) => !!o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);
  const first = !FIRST_SITTING.missing.some(id =>
    [points, raw.sel, raw.locked, raw.checked].some(o => has(o, id)) || has(raw.code, 'ed_' + id));
  const clean = {};
  for (const it of ITEMS) if (Number.isFinite(points[it.id])) clean[it.id] = Math.max(0, Math.min(points[it.id], itemMax(it)));
  if (!Object.keys(clean).length) return null;
  return { source, first, points: clean, seed: Number.isFinite(raw.seed) ? raw.seed : null,
           sel: raw.sel || {}, sort: raw.sort || {}, code: raw.code || {}, results: raw.results || {} };
}

// ── Checkpoints ──────────────────────────────────────────────────────────────

const rngFor = (seed, key) => mulberry32((seed + hashId(key)) >>> 0);

// The questions for one attempt: fixed for (seed, attempt) so a reload shows the same ones,
// but each restart draws a new set in a new order.
export function drawCheckpoint(tid, seed, attempt) {
  const pool = targetById(tid).pool.map(q => q.id);
  return shuffle(pool, rngFor(seed, `${tid}|${attempt}`)).slice(0, CHAIN);
}
export const poolQuestion = (tid, qid) => targetById(tid).pool.find(q => q.id === qid);
export const cpOptionOrder = (tid, qid, seed, attempt) =>
  shuffle([...Array(poolQuestion(tid, qid).opts.length).keys()], rngFor(seed, `${tid}|${attempt}|${qid}`));

// Text in quotes, numbers without, so the answer shows the type (as in the assessment).
function checkValue(expected, typed) {
  const t = String(typed ?? '').trim();
  const q = t.match(/^(["'])(.*)\1$/);
  if (expected.type === 'str') {
    if (q) return q[2] === expected.value ? { ok: true } : { ok: false };
    return t === expected.value ? { ok: false, msg: 'Right word, but it is text, so it needs quotes.' } : { ok: false };
  }
  if (q) return Number(q[2]) === expected.value ? { ok: false, msg: 'Right number, but numbers have no quotes.' } : { ok: false };
  return t !== '' && Number(t) === expected.value ? { ok: true } : { ok: false };
}

// answer: the option index picked (mcq, 0 is right) or the text typed.
export function markCheckpoint(q, answer) {
  if (q.kind === 'mcq') return { ok: answer === 0 };
  const t = String(answer ?? '').trim();
  if (q.as === 'number') return { ok: t !== '' && Number(t) === q.answer };
  if (q.as === 'value') return checkValue(q.answer, t);
  if (same(t, q.answer)) return { ok: true };
  const quoted = t.match(/^(["'])(.*)\1$/);
  if (quoted && same(quoted[2], q.answer)) return { ok: false, msg: 'print() never shows the quotes.' };
  if (t.replace(/ /g, '').toLowerCase() === q.answer.replace(/ /g, '').toLowerCase()) return { ok: false, msg: 'Check the spaces: + joins text exactly as it is.' };
  return { ok: false };
}
export const rightAnswer = q => q.kind === 'mcq' ? q.opts[0]
  : q.as === 'value' ? (q.answer.type === 'str' ? `"${q.answer.value}"` : String(q.answer.value)) : String(q.answer);

// ── Use it: the code task for each target ────────────────────────────────────

// Hints for requirement lists (this is practice, so a failed requirement gets a pointer).
export const REQ_HINTS = {
  w_warm: [
    'Change the comparison so that 25 itself counts as T-shirt weather. Which one includes 25?',
    'Add a print() line at the very bottom with no indent, so it runs whichever branch ran.',
  ],
  w_make: [
    'Ask two questions: the name first, then the age.',
    'Wrap the age question in int( ) so Python can compare it with 12.',
    'Use if with a comparison, then else: lined up underneath, each ending with a colon.',
    '12 itself must be allowed to buy it (>= includes 12), and the two messages must be different.',
    'Join the name into the message, e.g. "Sorry " + name',
    'Work out the years with 12 - age, and turn the answer into text with str() to join it.',
  ],
  x_speed: [
    'Ask two questions, limit first, and wrap each one in int( ).',
    'Work out speed - limit and put it into the sentence word for word.',
    'Copy the messages word for word. Drive safely has no indent, so it is printed every time.',
    'Join the pieces of the sentence with +. A number can\'t be joined to text, so wrap speed - limit in str( ).',
  ],
};

// The write target improves the assessment program the student lost most marks on.
export function writeItemFor(points = {}) {
  const lost = id => itemMax(itemById(id)) - (points[id] || 0);
  return lost('w_make') > 0 || lost('w_warm') === 0 ? 'w_make' : 'w_warm';
}

// The code task for a target. For the write target and the ★ challenge it is an assessment
// item (requirements and tests reused); `own` is the student's assessment code, if we have it.
export function applyFor(tid, points = {}, own = {}) {
  if (tid === 'write' || tid === 'challenge') {
    const item = itemById(tid === 'write' ? writeItemFor(points) : 'x_speed');
    const mine = own['ed_' + item.id];
    const usable = typeof mine === 'string' && mine.trim() && mine.trim() !== item.starter.trim();
    return { kind: 'reqs', item, title: item.title.replace(/^(Write it|Warm-up|Copy the machine): /, ''), goal: item.goal,
             samples: item.samples, tests: item.tests, testNote: item.testNote, reqs: item.reqs, extraMsg: item.extraMsg,
             starter: usable ? mine : item.starter, own: !!usable, original: item.starter };
  }
  return { ...targetById(tid).apply, original: targetById(tid).apply.starter };
}

// runs: [{ inputs, ok, output }] — one per test. → { ok, msg, results? }
export function evalApply(task, raw, runs) {
  if (task.kind === 'reqs') {
    const r = evalReqs(task, raw, runs);
    const bad = r.results.findIndex(x => !x);
    if (bad < 0) return { ok: true, results: r.results, msg: `All ${r.results.length} requirements met.` };
    const hints = REQ_HINTS[task.item.id] || [];
    return { ok: false, results: r.results,
             msg: `${r.results.filter(Boolean).length} of ${r.results.length} requirements met. ${r.msg}${hints[bad] ? ` Tip: ${hints[bad]}` : ''}` };
  }
  const f = firstFailed(runs);
  if (f) {
    const name = errorName(f) || 'error';
    return { ok: false, msg: `${typedPhrase(f.inputs) || 'When it runs, '}Python stops with a ${name}. Read the last line of the error, find the line number, and fix that line. Stuck? Press 💡 Get help.` };
  }
  for (const r of runs) {
    const want = task.expect(r.inputs);
    const got = task.keepBlank ? allLines(r) : printedLines(r);
    if (got.length !== want.length || !want.every((w, i) => same(got[i], w))) {
      const shown = got.map(l => l.trim() ? l : '(empty line)').join(' / ') || 'nothing';
      const extra = task.diagnose?.(raw, runs) || '';
      return { ok: false, msg: `${typedPhrase(r.inputs) || 'It runs! '}It prints: ${shown}. It should print: ${want.map(l => l || '(empty line)').join(' / ')}.${extra ? ' ' + extra : ''}` };
    }
  }
  const structural = task.check?.(raw) || '';
  if (structural) return { ok: false, msg: structural };
  return { ok: true, msg: 'Fixed: it prints exactly the right thing for every test.' };
}

// ── 🎨 Make it: the student's own selection program ─────────────────────────

// The prompt text of each input() in the code, in order (for labelling the test plan).
export function inputPrompts(raw) {
  return [...normaliseKeepStrings(raw).matchAll(/\binput\s*\(\s*(?:(["'])(.*?)\1)?/g)].map(m => m[2] ?? '');
}
// Comments removed but strings kept.
const normaliseKeepStrings = raw => String(raw || '').split('\n').map(l => {
  let inS = null;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (inS) { if (c === inS) inS = null; }
    else if (c === '"' || c === "'") inS = c;
    else if (c === '#') return l.slice(0, i);
  }
  return l;
}).join('\n');

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A printed line with each typed answer masked and every number turned into #, so two runs
// that took the same path match even when their messages repeat the answers.
function pathKey(run) {
  const answers = [...run.inputs].filter(a => a.trim()).sort((a, b) => b.length - a.length);
  return printedLines(run).map(l => {
    let s = l;
    for (const a of answers) s = s.split(a).join('<ans>');
    return squash(s).toLowerCase().replace(/-?\d+(?:\.\d+)?/g, '#');
  });
}
const hasAnswerInMessage = run => printedLines(run).some(l => run.inputs.some(a => {
  const t = a.trim();
  return t && squash(l).length > t.length && new RegExp(`(^|[^A-Za-z0-9])${escRe(t)}([^A-Za-z0-9]|$)`).test(l);
}));

export const MAKE_REQS = [
  { text: 'Ask the user a question with <code>input()</code> and store the answer in a variable',
    hint: 'Start with a line like answer = input("Your question? ") — use int( ) around it if the answer is a number.',
    test: raw => /\b\w+\s*=\s*(?:(?:int|float|str)\s*\(\s*)?input\s*\(/.test(normalise(raw)) },
  { text: 'Make a decision with <code>if</code> and <code>else</code>, using a comparison (<code>==</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> or <code>&gt;=</code>)',
    hint: 'Write if, a comparison and a colon, then else: lined up underneath. Indent the lines inside each one.',
    test: raw => ifElseLines(raw).some(l => COMPARISON.test(l)) },
  { text: 'Your <strong>test plan</strong> works: Test A and Test B take <strong>different paths</strong>, so they print different messages',
    hint: 'Choose answers for Test A that make the condition True, and answers for Test B that make it False. Each path needs its own message.',
    test: (raw, runs) => allOk(runs) && runs.length === 2 && pathKey(runs[0]).join('\n') !== pathKey(runs[1]).join('\n') },
  { text: 'Use the user\'s answer inside a printed message (e.g. <code>"Hi " + name</code>)',
    hint: 'Join the variable that holds the answer into one of your print() messages with +.',
    test: (raw, runs) => allOk(runs) && runs.some(hasAnswerInMessage) },
];
export const MAKE_STRETCH = [
  { text: 'Ask <strong>two or more</strong> questions',
    hint: 'Add a second input() line before the if.',
    test: (raw, runs) => inputCount(raw) >= 2 && allOk(runs) },
  { text: 'Do a <strong>calculation</strong> with a number the user typed, and print the answer',
    hint: 'Cast an answer with int(), work something out (+ - * or /), and print it with str().',
    test: (raw, runs) => {
      if (!allOk(runs) || count(raw, /\b(?:int|float)\s*\(/g) < 1) return false;
      const literals = new Set((String(raw).match(/\d+(?:\.\d+)?/g) || []).map(Number));
      return runs.some(r => {
        const typed = new Set(r.inputs.filter(a => a.trim() !== '' && !isNaN(a)).map(Number));
        return printedNumbers(r).some(n => !typed.has(n) && !literals.has(n));
      });
    } },
  { text: 'After the if/else, print a last line that runs for <strong>everyone</strong>',
    hint: 'Add a print() at the very bottom with no indent.',
    test: (raw, runs) => {
      if (!allOk(runs) || runs.length !== 2) return false;
      const [a, b] = runs.map(pathKey);
      return a.length >= 2 && b.length >= 2 && a.join('\n') !== b.join('\n') && a[a.length - 1] === b[b.length - 1];
    } },
];

// tests: [answersA[], answersB[]] from the student's test plan; runs: one per test.
export function evalMake(raw, tests, runs) {
  const n = inputCount(raw);
  const filled = tests.length === 2 && tests.every(t => t.length >= n && t.slice(0, n).every(a => String(a).trim() !== ''));
  const core = MAKE_REQS.map((r, i) => (i >= 2 && !filled) ? false : !!r.test(raw, runs));
  const stretch = MAKE_STRETCH.map(r => filled && !!r.test(raw, runs));
  const bad = core.findIndex(x => !x);
  let msg = 'All 4 requirements met: it is a real program that makes a decision. Try a ★ stretch next.';
  if (bad >= 0) {
    msg = `Requirement ${bad + 1} is not met yet. ${MAKE_REQS[bad].hint}`;
    const f = firstFailed(runs);
    if (bad >= 2 && !filled) msg = `Fill in every answer for Test A and Test B first (your program asks ${n} question${n === 1 ? '' : 's'}).`;
    else if (f) msg = `${typedPhrase(f.inputs)}Python stops with a ${errorName(f) || 'error'}. Fix that first: press ▶ Run code to see it, and 💡 Get help if you are stuck.`;
    else if (bad === 2 && filled && tests[0].join('|') === tests[1].join('|')) msg = 'Test A and Test B use the same answers. Choose answers that go down different paths.';
  } else if (stretch.every(Boolean)) {
    msg = 'All 4 requirements and all 3 ★ stretches met. Brilliant!';
  }
  return { core, stretch, msg };
}

// Ideas to start from (the student can also use their own).
export const IDEAS = [
  { id: 'ride', icon: '🎢', title: 'Ride checker', brief: 'Ask how tall someone is. Are they tall enough for your ride?',
    sample: [['How tall are you in cm? ', '135'], ['Sorry, you need to be 140 cm. Come back next year!']] },
  { id: 'quiz', icon: '🧠', title: 'Quiz question', brief: 'Ask a question with one right answer. Tell them if they got it right.',
    sample: [['What is the capital of France? ', 'Paris'], ['Correct! Paris is right.']] },
  { id: 'dog', icon: '🐶', title: 'Dog years', brief: 'Ask a dog\'s age, work out its age in dog years, and say if it is a puppy.',
    sample: [['How old is your dog? ', '1'], ['That is 7 in dog years'], ['Still a puppy!']] },
  { id: 'van', icon: '🍦', title: 'Ice-cream van', brief: 'Ask how much money someone has. Can they afford an ice cream?',
    sample: [['How much money do you have in pence? ', '200'], ['Here is your ice cream! Your change is 50p']] },
  { id: 'wear', icon: '🌦️', title: 'What to wear', brief: 'Ask the temperature and suggest what to wear.',
    sample: [['What is the temperature? ', '8'], ['Brr! Wear a coat.']] },
  { id: 'own', icon: '💡', title: 'My own idea', brief: 'Anything that asks a question and makes a decision.', sample: null },
];

// ── Lesson score ─────────────────────────────────────────────────────────────
// Units: each planned target = checkpoint (1) + use it (1); the Make = 4 requirements.
// Done → 80%, mastered (checkpoint first time; code is always "mastered") → the last 20%.
// Extra targets, ★ stretches and the challenge are bonus, outside the %.
//   state: { plan, cp: { tid: { attempt, done } }, applied: { tid: true }, make: { core: n, stretch: n }, extra: [] }
export function lessonScore(state) {
  const plan = state.plan || [];
  const total = plan.length * 2 + MAKE_REQS.length;
  const makeCore = state.make?.core || 0;
  let done = makeCore, mastered = makeCore;
  for (const tid of plan) {
    const cp = state.cp?.[tid];
    if (cp?.done) { done++; if (!cp.attempt) mastered++; }
    if (state.applied?.[tid]) { done++; mastered++; }
  }
  const pct = Math.round(done / total * 80 + mastered / total * 20);
  const extraDone = (state.extra || []).filter(t => state.cp?.[t]?.done && state.applied?.[t]).length;
  const bonus = (state.make?.stretch || 0) + extraDone + (state.applied?.challenge ? 1 : 0);
  return { done, mastered, total, pct, bonus, complete: done === total, gold: mastered === total };
}

// A target is finished when its checkpoint is passed and its code task is done.
export const targetDone = (state, tid) => !!(state.cp?.[tid]?.done && state.applied?.[tid]);
