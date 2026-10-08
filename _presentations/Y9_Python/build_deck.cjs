// Y9 Python — Lesson 1 (Python Refresh) deck, Station Zero theme.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_deck.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L1_Python_Refresh.pptx beside this file. Slide types come from sz_slides.cjs,
// drawing parts from sz_kit.cjs. Slides 13–15 are one-off diagrams drawn here.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1_Python_Refresh.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 1: Python Refresh',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 1' });
const { P, HEAD, MONO, M, newSlide, addIcon, text, box, arrow, pyRuns, codePanel, terminal, varBox } = K;

const LESSON_Q = 'How do we ask for, store and calculate with what a user types?';

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (first lesson of the unit, so: basic Y8 Python)
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'Y8 · LESSON 1', q: 'What does print() do?', type: 'mcq',
    opts: ['Shows text on the screen', 'Asks the user to type', 'Saves text into a file'],
    a: 'A — it shows text on the screen', why: 'input() is the one that asks the user' },
  { pill: 'Y8 · LESSON 2', q: 'What does this print?', type: 'mcq',
    code: ['score = 5', 'score = 9', 'print(score)'], opts: ['5', '9', '14'],
    a: 'B — 9', why: 'the new value replaces the old one' },
  { pill: 'Y8 · LESSON 1', q: 'This line crashes. What is missing?', type: 'write',
    code: ['print("Hello)'], a: 'A closing quote mark', why: 'print("Hello")', whyMono: true },
  { pill: 'Y8 · LESSON 2', q: 'Write exactly what this prints.', type: 'write',
    code: ['name = "Sam"', 'print("Hi " + name)'], a: 'Hi Sam', why: 'the space is inside the quotes', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
It's a year since they last wrote Python. Most of it is stored but hard to recall, so they retrieve it before anything is re-taught.
Q1–2 are multiple choice (everyone can commit to an answer). Q3–4 need a written answer: a word for Q3, the exact output for Q4.
Ask for a confidence rating 1–3 next to each answer — confident-but-wrong answers are the ones most worth correcting (hypercorrection).` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident (3) and wrong" on each — spend time on those.
Q3: a missing closing quote is a SyntaxError — we'll see what that error looks like on the debugging slide.
Q4: the space comes from inside the quotes, "Hi ". Without it you'd get HiSam.
Note any question most of the class missed — that's the evidence for whether the unit needs another reactivation lesson.` });

// ════════════════════════════════════════════════════════════════════════════
//  3–4. Title, questions
// ════════════════════════════════════════════════════════════════════════════
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 1  ·  PYTHON REFRESH', title: 'Station Zero', subtitle: 'Chapter 1 — Wake Up',
  status: ['SOFTWARE ....... WIPED', 'DOORS .......... SEALED', 'CREW AWAKE ..... 1 OF 5',
    [{ text: 'POD 2 .......... ' }, { text: 'OPEN', color: P.gold, bold: true }], [{ text: '> _' }]],
  notes: `Tell the premise — don't put it on screen (redundancy effect):
"You wake from cryosleep on Station Zero, a research station orbiting an uncharted planet. A solar storm has wiped the station's software and every door is locked. The rest of the crew are still frozen in their pods — except Pod 2, Engineer Hale's. It's empty. You're the only engineer awake, and you'll have to rebuild each system in Python to survive."
Keep it to under a minute. Tone it down if the class finds it too intense.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit (selection, loops, functions are coming).
Lesson question = today. Nothing here is brand new — it's everything from Year 8 Unit 1, joined into one program.
We come back to this question in the plenary.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  PART 1 — Wake Up (slides 5–11)
// ════════════════════════════════════════════════════════════════════════════
const P1 = 'Part 1 — Wake Up';

R.labelledLinesSlide(K, {
  section: P1, title: 'Ask → store → join → output',
  lines: [
    { code: 'name = input("Name? ")',
      labels: [{ n: 2, text: 'Store', from: 0, to: 6 }, { n: 1, text: 'Ask', from: 7, to: 22 }],
      results: [{ n: 1, terminal: [[{ text: 'Name? ' }, { text: 'Riley', color: P.str, bold: true }]] },
        { n: 2, var: { name: 'name', type: 'str', value: '"Riley"', size: 26 } }] },
    { code: 'print("Hi " + name)',
      labels: [{ n: 4, text: 'Output', from: 0, to: 5 }, { n: 3, text: 'Join', from: 6, to: 18 }],
      results: [{ n: 3, var: { type: 'str', value: '"Hi Riley"' } }, { n: 4, terminal: ['Hi Riley'] }] },
  ],
  notes: `Four sub-goals — say them every time you live-code today: ASK, STORE, JOIN, OUTPUT.
Point at each bracket as you talk, then at the matching numbered result on the right. Don't read the slide.
Line 1 runs right to left: input() asks first (1), then = stores the answer in name (2). That's why 2 sits left of 1.
Line 2: + joins "Hi " and what's stored in name (3), then print() shows it (4).
The orange box is how the activity's memory panel shows a string (str) — the same colours they'll see later.
LIVE CODE (optional, 2 min): type the two lines in the IDE and run it with a student's name.`,
});

R.pairSlide(K, {
  section: P1, title: 'Quotes: the word, or what’s stored?',
  memory: { name: 'name', type: 'str', value: '"Riley"' },
  rows: [
    { code: 'print("name")', out: 'name', note: [{ text: 'In quotes', options: { bold: true, color: P.str } },
      { text: ' → printed exactly as written' }] },
    { code: 'print(name)', out: 'Riley', note: [{ text: 'No quotes', options: { bold: true, color: P.gold } },
      { text: ' → prints what’s stored inside' }] },
  ],
  notes: `Discriminating example: the two lines differ by one pair of quotes.
Cover the outputs, ask "what does each print?", then reveal.
This is Predict question 2 territory in the activity (line 3 "only prints").`,
});

const PREDICT_CODE = ['room = input("Which room? ")', 'level = input("Which level? ")', 'print("Scanning...")',
  'print(room + " on level " + level)'];
R.predictSlide(K, {
  section: P1, code: PREDICT_CODE, inputs: [['1st', 'Medbay'], ['2nd', '3']],
  prompt: [{ text: 'On your whiteboard: ', options: { bold: true, color: P.gold } },
    { text: 'write the exact last line this program prints.' }],
  notes: `Silent, 2 minutes, then 3-2-1 show boards.
Look for: "room on level level" (printed the variable names), and missing spaces "Medbayon level3".
Don't reveal yet — next slide.`,
});

R.predictRevealSlide(K, {
  section: P1, code: PREDICT_CODE, hl: [4],
  output: [[{ text: 'Which room? ' }, { text: 'Medbay', color: P.str }], [{ text: 'Which level? ' }, { text: '3', color: P.str }],
    'Scanning...', [{ text: 'Medbay on level 3', color: P.gold, bold: true }]],
  mistakes: [
    { head: '✗  room on level level', headColor: P.red, text: 'No quotes → Python prints what’s stored, not the name' },
    { head: '" on level "', text: 'The spaces come from inside the quotes' },
  ],
  notes: `Line 4 → the highlighted output. Ask a student who wrote the wrong version to explain the fix.
Two common mistakes: printing the variable NAMES, and losing the spaces.`,
});

R.debugRecipeSlide(K, {
  section: P1,
  error: ['  File "main.py", line 3', '    print("Scanning...)', '          ^',
    [{ text: 'SyntaxError: ', color: P.red, bold: true }, { text: 'unterminated string literal', color: P.red }]],
  marks: [{ n: 1, line: 3, col: 41 }, { n: 2, line: 0, col: 24 }, { n: 3, line: 1, col: 23 }],
  fix: 'print("Scanning...")',
  notes: `Keep this slide handy — flip back to it during Investigate in both activities.
Model the recipe out loud on this error (it's Recap question 3):
1. Read the LAST line first — SyntaxError: the string never ends.
2. Find the line number — line 3.
3. Read line 3 aloud, quote by quote — "open quote, Scanning dot dot dot, close bracket"… no closing quote.
4. Compare to what you meant — add the closing quote.
Error messages are information, not a telling-off.`,
});

R.chapterSlide(K, {
  section: P1, kicker: 'CHAPTER 1  ·  PART 1', title: 'Wake Up', activity: 'Wake Up', time: '≈20 MIN', logLabel: 'CRYO BAY',
  log: ['Every pod is frosted', 'over — except Pod 2.', '', 'Open. Empty.', 'Cracked from the inside.'],
  note: [{ text: 'Modification 1 is your call. ', options: { bold: true, color: P.gold } },
    { text: 'It changes the story, not your score.' }],
  notes: `Students open "Wake Up — Input Refresh" from Google Classroom (Y9 › Python › Lesson 1).
It runs the full PRIMM cycle by itself: Predict (3 questions) → Run → Investigate (2 steps; Break it plants a NameError) → Modify (4 steps; step 1 is the door choice) → Make (crew locator).
Circulate. During Investigate, point students back to the debugging recipe before they press Get help.
Fast finishers: the Make extension (a third question and one line using all three answers).`,
});

R.errorFeedbackSlide(K, {
  section: P1, title: 'Capitals matter',
  code: ['name = input("Enter your name: ")', 'print("Access granted to " + Name)'], hl: [2],
  error: [[{ text: 'NameError: ', color: P.red, bold: true },
    { text: "name 'Name' is not defined. Did you mean: 'name'?", color: P.red }]],
  memory: { name: 'name', type: 'str', value: '"Riley"' },
  takeaway: [{ text: 'Name', options: { fontFace: MONO, color: P.red, bold: true } },
    { text: '  and  ' }, { text: 'name', options: { fontFace: MONO, color: P.ok, bold: true } },
    { text: '  are two different names. Python only knows the one you stored.' }],
  notes: `Whole-class feedback after Wake Up — this was the planted bug in Investigate.
Ask: "Which line did Python point to? Which word was wrong?" Then: "Why didn't deleting the line count as fixing it?"
The memory box only has a variable called name (lower case).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  PART 2 — Life Support (slides 12–18)
// ════════════════════════════════════════════════════════════════════════════
const P2 = 'Part 2 — Life Support';

R.turnTalkSlide(K, {
  section: P2, title: 'Join or add?', codes: ['print("5" + "5")', 'print(5 + 5)'],
  prompt: 'what does each one print — and why are they different?',
  notes: `Attempt before explanation — even a wrong guess makes the next slide stick better.
Take two or three answers. Don't confirm yet.`,
});

// 13. + joins text, adds numbers (one-off diagram)
{
  const s = newSlide('SZ_DARK', P2, '+ joins text, adds numbers');
  const rows = [
    { a: ['str', '"5"'], b: ['str', '"5"'], r: ['str', '"55"'], note: 'join' },
    { a: ['int', '5'], b: ['int', '5'], r: ['int', '10'], note: 'add' },
    { a: ['str', '"5"'], b: ['int', '5'], err: true },
  ];
  rows.forEach((r, i) => {
    const y = 1.95 + i * 1.55;
    varBox(s, { x: M, y, w: 1.9, type: r.a[0], value: r.a[1] });
    text(s, '+', { x: M + 1.95, y, w: 0.6, h: 0.95, fontSize: 36, bold: true, align: 'center', valign: 'middle', fontFace: MONO });
    varBox(s, { x: M + 2.6, y, w: 1.9, type: r.b[0], value: r.b[1] });
    arrow(s, M + 4.65, y + 0.47, M + 5.55, y + 0.47, r.err ? P.red : P.gold);
    if (r.err) {
      terminal(s, [[{ text: 'TypeError', color: P.red, bold: true }]], { x: M + 5.7, y, w: 2.6, size: 22, h: 0.95 });
      text(s, 'can’t mix text and numbers', { x: M + 8.6, y, w: 3.5, h: 0.95, fontSize: 22, color: P.off, valign: 'middle' });
    } else {
      varBox(s, { x: M + 5.7, y, w: 2.6, type: r.r[0], value: r.r[1] });
      text(s, r.note, { x: M + 8.6, y, w: 3.5, h: 0.95, fontSize: 26, bold: true, fontFace: HEAD,
        color: r.a[0] === 'str' ? P.str : P.int, valign: 'middle' });
    }
  });
  addIcon(s, 'info');
  s.addNotes(`Reveal of the Turn & Talk. The label on each box is its data type: str (text, orange) or int (whole number, blue).
Same + sign, different job — Python decides by the TYPE of the two values.
Mixing them crashes: TypeError. Remember this — it's the planted bug in Life Support.`);
}

// 14. input() gives text → int() / str() convert (one-off diagram)
{
  const s = newSlide('SZ_DARK', P2, 'input() gives text — so convert it');
  const y1 = 2.25, y2 = 4.75;
  text(s, 'TEXT → NUMBER', { x: M, y: y1 - 0.6, w: 4, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  terminal(s, [[{ text: 'Hours? ' }, { text: '6', color: P.str, bold: true }]], { x: M, y: y1, w: 2.4, size: 22, h: 0.95 });
  arrow(s, M + 2.5, y1 + 0.47, M + 3.05, y1 + 0.47);
  varBox(s, { x: M + 3.15, y: y1, w: 2.0, type: 'str', value: '"6"' });
  arrow(s, M + 5.25, y1 + 0.47, M + 6.75, y1 + 0.47, P.gold);
  s.addText(pyRuns('int()', 22), { isTextBox: true, x: M + 5.25, y: y1 - 0.45, w: 1.5, h: 0.4, margin: 0, align: 'center' });
  varBox(s, { x: M + 6.85, y: y1, w: 2.0, type: 'int', value: '6' });
  text(s, 'now you can do maths', { x: M + 9.1, y: y1, w: 3.0, h: 0.95, fontSize: 22, valign: 'middle' });

  text(s, 'NUMBER → TEXT', { x: M, y: y2 - 0.6, w: 4, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  varBox(s, { x: M + 3.15, y: y2, w: 2.0, type: 'int', value: '300' });
  arrow(s, M + 5.25, y2 + 0.47, M + 6.75, y2 + 0.47, P.gold);
  s.addText(pyRuns('str()', 22), { isTextBox: true, x: M + 5.25, y: y2 - 0.45, w: 1.5, h: 0.4, margin: 0, align: 'center' });
  varBox(s, { x: M + 6.85, y: y2, w: 2.0, type: 'str', value: '"300"' });
  text(s, 'now + can join it', { x: M + 9.1, y: y2, w: 3.0, h: 0.95, fontSize: 22, valign: 'middle' });
  addIcon(s, 'info');
  s.addNotes(`input() ALWAYS gives back text, even when the user types a number. "6" in quotes, orange.
int() converts text to a whole number so you can calculate. str() converts a number back to text so + can join it into a sentence.
str() is the new one for some — Year 8 only used int().
Ask: what would int("six") do? (ValueError — they'll try it in Investigate.)`);
}

// 15. The whole recipe — three whole lines, sub-goals beside each line
{
  const s = newSlide('SZ_DARK', P2, 'The whole recipe');
  const lines = ['hours = int(input("Hours until rescue: "))', 'oxygen = hours * 50', 'print("Oxygen: " + str(oxygen))'];
  const cp = codePanel(s, lines, { x: M, y: 1.75, w: 7.9, size: 22, lh: 0.95 });
  const labels = [
    [['Ask', P.gold], ['  ·  ', P.dim], ['Convert', P.gold], ['  ·  ', P.dim], ['Store', P.gold]],
    [['Calculate', P.gold]],
    [['Output', P.gold], ['  —  str() to join', P.muted]],
  ];
  labels.forEach((l, i) => {
    arrow(s, M + 8.0, cp.ys[i], M + 8.55, cp.ys[i], P.dim);
    text(s, l.map(([t, c]) => ({ text: t, options: { color: c, bold: c === P.gold } })),
      { x: M + 8.7, y: cp.ys[i] - 0.4, w: 3.45, h: 0.8, fontSize: 22, valign: 'middle', fontFace: HEAD });
  });
  box(s, { x: M, y: 5.25, w: 12.13, h: 1.1, fill: P.panel, r: 0.08 });
  text(s, [{ text: 'Line 1 runs inside-out: ', options: { bold: true, color: P.gold } },
    { text: 'input() first, then int(), then = stores it.' }],
    { x: M + 0.4, y: 5.25, w: 11.3, h: 1.1, fontSize: 22, valign: 'middle' });
  addIcon(s, 'info');
  s.addNotes(`Recipe: ASK → STORE → CONVERT → CALCULATE → OUTPUT. These are the Life Support starter lines, near enough.
Line 1 does three jobs. Trace it inside-out with your finger: input() asks, int() converts, = stores.
LIVE CODE (optional): type it, run with 6, then delete int( ) and run again — the output shows 6 repeated 50 times. Ask why. (They'll meet this in Investigate step 1, so you can leave it as a teaser instead.)`);
}

const TRACE_CODE = ['battery = int(input("Battery %: "))', 'battery = battery - 15', 'print("Power left: " + str(battery) + "%")'];
const TRACE_TABLE = (rows) => ({ cols: ['Line', 'battery', 'Output'], colW: [1.4, 2.6, 8.13], rows });
R.traceSlide(K, {
  section: P2, code: TRACE_CODE, typed: '80', table: TRACE_TABLE([['1', '', ''], ['2', '', ''], ['3', '', '']]),
  notes: `Copy the table onto whiteboards. Fill it in line by line: what is in battery after each line, and what's printed.
Line 2 overwrites battery — the old value is gone (like Recap Q2).
Watch for: battery = "80" (forgot int() converts), and 80 in the last row (forgot the overwrite).`,
});
R.traceSlide(K, {
  section: P2, code: TRACE_CODE, table: TRACE_TABLE([['1', '80', ''], ['2', '65', ''], ['3', '', 'Power left: 65%']]),
  reveal: { hl: [3], side: [{ text: 'Without ', options: { color: P.off } }, { text: 'str()', options: { fontFace: MONO, color: P.fn, bold: true } },
    { text: '\nTypeError', options: { fontFace: MONO, color: P.red, bold: true } }] },
  notes: `Check boards against the table.
Line 1: "80" becomes the number 80. Line 2: 80 − 15 = 65 replaces 80. Line 3 prints Power left: 65%.
Ask: what if we took str() out of line 3? → TypeError, because + can't join text and a number. That's exactly the bug they fix in Life Support's Investigate.`,
});

R.chapterSlide(K, {
  section: P2, kicker: 'CHAPTER 1  ·  PART 2', title: 'Life Support', activity: 'Life Support', time: '≈20 MIN', logLabel: 'CORRIDOR C',
  log: ['A trail of frost leads', 'to Life Support.', '', 'Something that cold', 'shouldn’t be able to walk.'],
  note: [{ text: 'Modification 1 is your call again. ', options: { bold: true, color: P.gold } },
    { text: 'Your choice and your door choice decide what happens to Pod 5.' }],
  notes: `Students open "Life Support — Casting" from Google Classroom.
Predict (3 questions) → Run → Investigate (3 steps: delete int(); type "six" → ValueError; Break it plants the TypeError, fixed with str()) → Modify (4 steps; step 1 is the oxygen-rate choice) → Make (survival supply manifest).
Hale's last log appears after Investigate — let it land.
Anyone who didn't finish Wake Up: finish it first; their choices carry over.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  19. Plenary
// ════════════════════════════════════════════════════════════════════════════
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Write one line that asks how many crew are awake and stores it as a whole number in crew.',
    'Fix this line, and say why it crashed:'],
  code: 'print("Crew awake: " + crew)',
  cliff: [{ text: 'MOTION DETECTED · SENSOR OPS · TAG: ' }, { text: 'HALE', color: P.gold, bold: true }],
  notes: `Exit task on whiteboards or a sticky note.
1. crew = int(input("How many crew are awake? ")) — any prompt is fine; int() and the variable name crew are the point.
2. print("Crew awake: " + str(crew)) — crew is a number, and + can't join text and a number, so it's a TypeError.
Close the story: "Motion in Sensor Ops. The tag says HALE. Next lesson, we find out what's moving." (Hale is dead — leave it hanging.)`,
});

K.write(OUT);
