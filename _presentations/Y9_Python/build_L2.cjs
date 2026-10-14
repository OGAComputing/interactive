// Y9 Python — Lesson 2 (Selection) deck, Station Zero theme, Chapter 2: Proximity.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L2.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L2_Selection.pptx beside this file. Activity: Y9/Python/L2_Selection/1_Proximity_PRIMM.html.
// Teaching order (from the Y8 Lesson 5 Selection deck): conditions first (True or False), then if / else,
// then two rounds of "what is printed?" — round 1 with numbers in the condition, round 2 with one
// variable — each as I do (1 example) → We do (1) → You do (3) → answers. Then elif, then the activity.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L2_Selection.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 2: Selection',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 2' });
const { P, HEAD, MONO, M, newSlide, addIcon, text, box, arrow, pyRuns, codePanel, varBox, badge, onClick } = K;

const LESSON_Q = 'How do we make a program choose which lines to run?';

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (Lesson 1, plus = from Year 8)
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'Y8 · LESSON 2', q: 'Which line stores 70 in score?', type: 'mcq',
    opts: ['score = 70', 'score == 70', '70 = score'],
    a: 'A — score = 70', why: '== does something else: you’ll see it today' },
  { pill: 'LAST LESSON', q: 'What does this print?', type: 'mcq',
    code: ['x = "5" + "5"', 'print(x)'], opts: ['10', '55', '5 5'],
    a: 'B — 55', why: 'two strings, so + joins them' },
  { pill: 'LAST LESSON', q: 'This line crashes. Which error?', type: 'write',
    code: ['crew = 4', 'print("Crew: " + crew)'], a: 'TypeError', why: 'fix it with str(crew)' },
  { pill: 'LAST LESSON', q: 'Write exactly what this prints.', type: 'write',
    code: ['o2 = 90 - 25', 'print("O2: " + str(o2))'], a: 'O2: 65', why: 'str() turns 65 into text', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
Q1 is from Year 8 (variables); Q2–4 are from last lesson (joining, TypeError, str()).
Q1–2 are multiple choice (everyone commits to an answer). Q3–4 need a written answer.
Confidence rating 1–3 next to each answer — confident-but-wrong is the one most worth correcting.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident and wrong" on each.
Q1: = STORES. Don't explain == yet — just say "keep that question in your head, we answer it today".
Q2: "5" and "5" are strings (orange), so + joins them: 55. No space appears because there's no space inside the quotes.
Q3: crew is a number (int), and + can't join text and a number. TypeError. Fix: str(crew).
Q4: 90 − 25 = 65, then str() turns it into text so + can join it.` });

// ════════════════════════════════════════════════════════════════════════════
//  3–4. Title, questions
// ════════════════════════════════════════════════════════════════════════════
// Station state: Lesson 1 ended on the amber motion alarm (L2), so the story picks up there as a beat.
K.beat('L2');
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 2  ·  SELECTION', title: 'Station Zero', subtitle: 'Chapter 2 — Proximity',
  status: ['SENSOR OPS ..... EMPTY', 'PROXIMITY ...... OFFLINE', 'MOTION ......... DETECTED',
    [{ text: 'TAG ............ ' }, { text: 'HALE', color: P.gold, bold: true }], [{ text: '> _' }]],
  notes: `Recap the story out loud — don't put it on screen:
"Last lesson the crew locator picked up a tag nobody searched for: HALE. Hale's pod was opened from the inside, and the bio-scan says whatever is wearing his tag is not human. It's heading for Sensor Ops — and that's where you are now. The room is empty, but there's frost on the floor and a vent cover hangs open. The proximity sensors that could tell you how close it is are offline."
Today we rebuild them. A sensor has to DECIDE what to say, depending on the distance — that's selection.
In Slide Show this slide fades in through black and the amber alarm creeps in: let it finish before you speak.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit. Today is the "make decisions" part.
Lesson question = today. You did if / else in Year 8, but it was a year ago, so we start from the beginning: conditions first.
We come back to this question in the plenary.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Conditions first
// ════════════════════════════════════════════════════════════════════════════
const C = 'Conditions';

// 5. Sequence vs selection (one-off diagram)
{
  const s = newSlide('SZ_DARK', C, 'Sequence and selection');
  const lab = (t, x, y, w, color = P.dim) => text(s, t, { x, y, w, h: 0.3, fontSize: 13, bold: true, color, charSpacing: 2 });
  const node = (t, x, y, w, h, o = {}) => {
    box(s, { x, y, w, h, fill: o.fill || P.panel, line: o.line || P.line, lw: o.lw, r: 0.08 });
    text(s, t, { x, y, w, h, fontSize: o.size || 22, bold: !!o.bold, color: o.color || P.off, align: 'center',
      valign: 'middle', fontFace: o.mono ? MONO : undefined });
  };
  // Left: sequence
  lab('SO FAR: SEQUENCE', M, 1.6, 4.5);
  ['Line 1', 'Line 2', 'Line 3'].forEach((t, i) => {
    node(t, M + 0.8, 2.05 + i * 1.3, 2.8, 0.8);
    if (i < 2) arrow(s, M + 2.2, 2.85 + i * 1.3, M + 2.2, 3.35 + i * 1.3);
  });
  text(s, 'Every line runs, in order', { x: M, y: 6.0, w: 4.4, h: 0.5, fontSize: 22, color: P.muted, align: 'center' });
  s.addShape(K.pres.shapes.LINE, { x: 5.35, y: 1.7, w: 0, h: 4.85, line: { color: P.line, width: 1 } });
  // Right: selection (appears on click)
  onClick(s, 1, () => {
    lab('TODAY: SELECTION', 5.75, 1.6, 4.5, P.gold);
    const cx = 9.3, dl = 7.5, dr = 11.1, dy = 2.0, dh = 1.15;
    s.addShape(K.pres.shapes.DIAMOND, { x: dl, y: dy, w: dr - dl, h: dh, fill: { color: P.code },
      line: { color: P.gold, width: 2 } });
    text(s, [{ text: 'condition', options: { bold: true } }, { text: '\nTrue or False?', options: { color: P.muted, fontSize: 16 } }],
      { x: dl + 0.6, y: dy, w: dr - dl - 1.2, h: dh, fontSize: 20, align: 'center', valign: 'middle' });
    const by = 3.65, bw = 2.7, bh = 0.8;
    arrow(s, dl, dy + dh / 2, dl, by, P.ok);
    arrow(s, dr, dy + dh / 2, dr, by, P.muted);
    text(s, 'True', { x: dl - 1.05, y: 2.75, w: 0.95, h: 0.4, fontSize: 20, bold: true, color: P.ok, align: 'right' });
    text(s, 'False', { x: dr + 0.12, y: 2.75, w: 1.0, h: 0.4, fontSize: 20, bold: true, color: P.muted });
    node('True path', dl - bw / 2, by, bw, bh, { line: P.ok });
    node('False path', dr - bw / 2, by, bw, bh);
    const jy = 5.05, jw = 2.4;
    s.addShape(K.pres.shapes.LINE, { x: dl, y: by + bh, w: 0, h: jy + bh / 2 - by - bh, line: { color: P.muted, width: 2.25 } });
    s.addShape(K.pres.shapes.LINE, { x: dr, y: by + bh, w: 0, h: jy + bh / 2 - by - bh, line: { color: P.muted, width: 2.25 } });
    arrow(s, dl, jy + bh / 2, cx - jw / 2, jy + bh / 2);
    arrow(s, dr, jy + bh / 2, cx + jw / 2, jy + bh / 2);
    node('Next line', cx - jw / 2, jy, jw, bh);
    text(s, 'Only ONE path runs, then they join up', { x: 5.75, y: 6.0, w: 6.98, h: 0.5, fontSize: 22, color: P.gold,
      bold: true, align: 'center' });
  });
  addIcon(s, 'info');
  s.addNotes(`So far every program has been a SEQUENCE: every line runs, top to bottom.
Click: SELECTION. The program asks a question — a condition — and the answer is True or False. True takes one path, False takes the other. Only one of them runs, then the paths join and the program carries on.
Ask: "Where would a proximity sensor need this?" (Close → alarm; far → all clear.)`);
}

// 6. A condition is True or False (one-off: operator key + two examples)
{
  const s = newSlide('SZ_DARK', C, 'A condition is True or False');
  text(s, 'COMPARISON OPERATORS', { x: M, y: 1.6, w: 5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  const ops = [['==', 'is equal to'], ['<', 'is less than'], ['>', 'is more than'], ['<=', 'is less than or equal to'],
    ['>=', 'is more than or equal to']];
  ops.forEach(([op, say], i) => {
    const y = 2.0 + i * 0.76;
    box(s, { x: M, y, w: 1.15, h: 0.62, fill: P.code, line: P.line, r: 0.08 });
    text(s, op, { x: M, y, w: 1.15, h: 0.62, fontFace: MONO, fontSize: 28, bold: true, align: 'center', valign: 'middle' });
    text(s, say, { x: M + 1.4, y, w: 4.3, h: 0.62, fontSize: 22, valign: 'middle' });
  });
  text(s, 'TRUE OR FALSE?', { x: 7.0, y: 1.6, w: 5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  [['85 >= 50', true, 'Is 85 more than or equal to 50? Yes'], ['30 >= 50', false, 'Is 30 more than or equal to 50? No']]
    .forEach(([expr, val, say], i) => {
      const y = 2.0 + i * 1.95;
      box(s, { x: 7.0, y, w: 3.4, h: 1.0, fill: P.code, line: P.line, r: 0.08 });
      s.addText(pyRuns(expr, 36), { isTextBox: true, x: 7.0, y, w: 3.4, h: 1.0, margin: 0, align: 'center', valign: 'middle' });
      onClick(s, i + 1, () => {
        arrow(s, 10.5, y + 0.5, 11.05, y + 0.5);
        R.boolChip(K, s, val, 11.15, y + 0.2, 1.55, 0.6, 26);
        text(s, say, { x: 7.0, y: y + 1.1, w: 5.7, h: 0.45, fontSize: 18, italic: true, color: P.muted });
      });
    });
  R.banner(K, s, [{ text: 'A condition asks a yes / no question. ', options: { bold: true, color: P.gold } },
    { text: 'Python’s answer is True or False.' }], 5.95, 0.8, 22);
  addIcon(s, 'info');
  s.addNotes(`Read each operator as words: ">=" is "more than or equal to". Students mix up < and > — "the open side faces the bigger number".
Before each click, ask the class "True or False?" and get a show of hands.
Click 1: 85 >= 50 → True. Click 2: 30 >= 50 → False.
== is TWO equals signs: it ASKS "are these equal?". One = STORES (Do Now Q1). We'll come back to that.`);
}

// 7–8. True or False? practice + answers
const TF = [{ expr: '8 > 3', value: true }, { expr: '4 >= 4', value: true }, { expr: '10 < 2', value: false },
  { expr: '7 == 7', value: true }, { expr: '5 > 5', value: false }, { expr: '9 <= 6', value: false }];
R.trueFalseSlide(K, {
  section: C, items: TF,
  takeaway: [{ text: 'On your board: ', options: { bold: true, color: P.gold } }, { text: 'write T or F for all six. Boards up together.' }],
  notes: `Silent, 2 minutes. Boards up on 3-2-1.
Number 5 (5 > 5) and number 2 (4 >= 4) are the boundary ones — look for who gets those right.`,
});
R.trueFalseSlide(K, {
  section: C, items: TF, reveal: true,
  takeaway: [{ text: 'Watch out: ', options: { bold: true, color: P.gold } },
    { text: '5 > 5', options: { fontFace: MONO, bold: true } }, { text: ' is False, but ' },
    { text: '4 >= 4', options: { fontFace: MONO, bold: true } }, { text: ' is True. The = in >= lets it be equal.' }],
  notes: `Go through any the class split on.
The boundary is where programs go wrong: > leaves the number itself out; >= lets it in. The activity tests exactly this (a distance of exactly 20).`,
});

// 9. Anatomy of if / else (one-off: labels beside each line, one per click)
{
  const s = newSlide('SZ_DARK', C, 'if and else');
  const lines = ['if 85 >= 50:', '    print("All clear")', 'else:', '    print("Too close")'];
  const cp = codePanel(s, lines, { x: M, y: 1.75, w: 6.2, size: 28, lh: 0.85 });
  const labels = [
    [{ text: 'if', options: { fontFace: MONO, bold: true } }, { text: ' + a condition + a colon ' },
      { text: ':', options: { fontFace: MONO, bold: true, color: P.gold } }],
    [{ text: 'Indented 4 spaces: ' }, { text: 'runs only if True', options: { bold: true, color: P.ok } }],
    [{ text: 'else', options: { fontFace: MONO, bold: true } }, { text: ' has ' }, { text: 'no condition', options: { bold: true } },
      { text: ', just a colon' }],
    [{ text: 'Indented 4 spaces: ' }, { text: 'runs only if False', options: { bold: true, color: P.gold } }],
  ];
  labels.forEach((l, i) => onClick(s, i + 1, () => {
    arrow(s, M + 6.35, cp.ys[i], M + 6.85, cp.ys[i], P.dim);
    text(s, l, { x: M + 7.0, y: cp.ys[i] - 0.4, w: 5.1, h: 0.8, fontSize: 22, valign: 'middle' });
  }));
  onClick(s, 5, () => R.banner(K, s, [{ text: 'Exactly one block runs: ', options: { bold: true, color: P.gold } },
    { text: 'never both, never neither.' }], 5.45, 1.0, 24));
  addIcon(s, 'info');
  s.addNotes(`5 clicks: one label per line, then the rule.
Line 1: "if", the condition, then a colon. The colon means "a block comes next".
Line 2: indented = INSIDE the if. It only runs if the condition is True.
Line 3: else has NO condition — it's "everything else". Students often try to write else 30 < 50: — that's an error.
Line 4: inside the else. Runs only when the condition was False.
Ask: 85 >= 50 is True, so what's printed? (All clear — and only All clear.)`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Round 1 — numbers in the condition: I do → We do → You do → answers
// ════════════════════════════════════════════════════════════════════════════
const R1 = 'Round 1 — numbers';
const STEPS_1 = ['True or False?', 'Which lines run?', 'What is printed?'];

R.whatPrintedSlide(K, {
  section: R1, mode: 'I DO', lh: 0.8,
  code: ['if 30 >= 50:', '    print("All clear")', 'else:', '    print("Too close")'],
  conds: [{ line: 1, expr: '30 >= 50', result: false }], runs: [4], skipped: [2],
  output: ['Too close'], steps: STEPS_1,
  notes: `I DO — model it out loud, students just watch. Same three questions every time (the strip at the bottom).
Click 1 — True or False? "Is 30 more than or equal to 50? No. False."
Click 2 — Which lines run? "False, so skip the if block and run the else block."
Click 3 — What is printed? Too close — and only Too close.
Say the steps every time: "condition, block, print".`,
});

R.whatPrintedSlide(K, {
  section: R1, mode: 'WE DO', lh: 0.8,
  code: ['if 7 == 7:', '    print("Door open")', 'else:', '    print("Door locked")'],
  conds: [{ line: 1, expr: '7 == 7', result: true }], runs: [2], skipped: [4],
  output: ['Door open'], steps: STEPS_1,
  notes: `WE DO — students answer each step on boards BEFORE you click.
Step 1: "True or False?" Boards up → click. (== asks "are they equal?" 7 equals 7: True.)
Step 2: "Which lines run?" Cold-call someone to say the line numbers → click.
Step 3: "What is printed?" Boards up → click. Door open.
Look for anyone writing Door open AND Door locked: exactly one block runs.`,
});

const YOU_1 = [
  { code: ['if 9 < 12:', '    print("Low")', 'else:', '    print("High")'], output: ['Low'],
    why: [{ text: '9 < 12', options: { fontFace: MONO, bold: true } }, { text: ' is True' }] },
  { code: ['if 20 > 20:', '    print("Alarm")', 'else:', '    print("Quiet")'], output: ['Quiet'],
    why: [{ text: '20 > 20', options: { fontFace: MONO, bold: true } }, { text: ' is False' }] },
  { code: ['if 4 >= 4:', '    print("Ready")', 'else:', '    print("Wait")'], output: ['Ready'],
    why: [{ text: '4 >= 4', options: { fontFace: MONO, bold: true } }, { text: ' is True' }] },
];
R.whatPrintedGridSlide(K, {
  section: R1, items: YOU_1,
  notes: `YOU DO — silent, on your own, 4 minutes. Boards up together at the end.
Students who are stuck: point at the strip from the last two slides — True or False? Which lines run? What is printed?
Number 2 is the boundary trap (20 > 20).`,
});
R.whatPrintedGridSlide(K, {
  section: R1, items: YOU_1, reveal: true,
  notes: `Check boards. Most common mistakes:
2: "Alarm" — 20 is not MORE than 20, so it's False.
3: "Wait" — >= lets 4 equal 4, so it's True.
Anyone who wrote both messages for a program: exactly one block runs.
If most of the class got 2 or 3 wrong, do one more together before Round 2.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  = stores, == asks — before the variable appears in a condition
// ════════════════════════════════════════════════════════════════════════════
const R2 = 'Round 2 — a variable';
{
  const s = newSlide('SZ_DARK', R2, '= stores. == asks.');
  const rows = [
    { code: 'distance = 30', head: 'STORES', say: 'puts 30 in the box', color: P.gold },
    { code: 'distance == 30', head: 'ASKS', say: 'is it 30?  →  True or False', color: P.int },
  ];
  rows.forEach((r, i) => {
    const y = 1.85 + i * 1.6;
    codePanel(s, [r.code], { x: M, y, w: 4.6, size: 28, nums: false, h: 1.05 });
    arrow(s, M + 4.75, y + 0.52, M + 5.35, y + 0.52);
    text(s, [{ text: r.head, options: { bold: true, color: r.color, fontFace: HEAD, fontSize: 26 } },
      { text: '\n' + r.say, options: { color: P.off, fontSize: 22 } }], { x: M + 5.55, y: y - 0.1, w: 3.6, h: 1.25, valign: 'middle' });
    if (i === 0) varBox(s, { x: 9.95, y: y + 0.08, w: 2.6, name: 'distance', type: 'int', value: '30' });
    else R.boolChip(K, s, true, 9.95, y + 0.2, 1.5, 0.65, 26);
  });
  R.banner(K, s, [{ text: 'An if must use ==. ', options: { bold: true, color: P.gold } }, { text: 'This crashes:   ' },
    { text: 'if distance = 30:', options: { fontFace: MONO } }, { text: '  →  ' },
    { text: 'SyntaxError', options: { fontFace: MONO, bold: true, color: P.red } }], 5.25, 1.05, 24);
  addIcon(s, 'info');
  s.addNotes(`This is the answer to Do Now Q1's "keep that in your head".
One = STORES: it puts 30 in the box called distance. Nothing is printed, nothing is asked.
Two == ASKS: "is what's in distance equal to 30?" The answer is True or False, so it can go in an if.
Using one = in an if is a SyntaxError — Python won't even start. They'll need == in Modify 4 of today's activity (answer == "y").`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Round 2 — one variable in the condition: I do → We do → You do → answers
// ════════════════════════════════════════════════════════════════════════════
const STEPS_2 = ['Look in the box', 'True or False?', 'Which lines run?', 'What is printed?'];

R.whatPrintedSlide(K, {
  section: R2, mode: 'I DO',
  code: ['distance = 30', 'if distance >= 50:', '    print("All clear")', 'else:', '    print("Too close")', 'print("Scan complete")'],
  memory: { line: 1, name: 'distance', type: 'int', value: '30' },
  conds: [{ line: 2, expr: '30 >= 50', result: false }], runs: [5], skipped: [3], always: [6],
  output: ['Too close', 'Scan complete'], steps: STEPS_2,
  notes: `I DO — Round 1's I do program with two changes: the number is now in a variable (one new step: look in the box), and a last line that isn't indented.
Click 1 — Look in the box: line 1 stores 30 in distance.
Click 2 — True or False? "Swap distance for what's in the box: 30 >= 50. False."
Click 3 — Which lines run? "The else block. Line 6 isn't indented, so it isn't inside the if or the else: it runs every time, after them."
Click 4 — What is printed? Too close, then Scan complete.
Point out: Too close is the same as Round 1 — a variable is just a name for the value in the box. Scan complete is new, and it would print whatever distance was.`,
});

R.whatPrintedSlide(K, {
  section: R2, mode: 'WE DO',
  code: ['oxygen = 20', 'if oxygen < 20:', '    print("Refill now")', 'else:', '    print("Oxygen OK")', 'print("Check done")'],
  memory: { line: 1, name: 'oxygen', type: 'int', value: '20' },
  conds: [{ line: 2, expr: '20 < 20', result: false }], runs: [5], skipped: [3], always: [6],
  output: ['Oxygen OK', 'Check done'], steps: STEPS_2,
  notes: `WE DO — boards before each click.
Step 1: "What's in the box?" (20) → click.
Step 2: "So the condition is 20 < 20. True or False?" Boards up → click. Is 20 LESS than 20? No: False. (Boundary again.)
Step 3: "Which lines run?" Cold-call → click.
Step 4: "What is printed?" Boards up → click. Oxygen OK, Check done.`,
});

const YOU_2 = [
  { code: ['level = 3', 'if level > 2:', '    print("Locked")', 'else:', '    print("Open")'], output: ['Locked'],
    why: [{ text: '3 > 2', options: { fontFace: MONO, bold: true } }, { text: ' is True' }] },
  { code: ['power = 50', 'if power >= 50:', '    print("Systems on")', 'else:', '    print("Backup")', 'print("Done")'],
    output: ['Systems on', 'Done'],
    why: [{ text: '50 >= 50', options: { fontFace: MONO, bold: true } }, { text: ' is True' }] },
  { code: ['answer = "n"', 'if answer == "y":', '    print("Sent")', 'else:', '    print("Cancelled")', 'print("Done")'],
    output: ['Cancelled', 'Done'],
    why: [{ text: '"n" == "y"', options: { fontFace: MONO, bold: true } }, { text: ' is False' }] },
];
R.whatPrintedGridSlide(K, {
  section: R2, items: YOU_2,
  notes: `YOU DO — silent, on your own, 4 minutes. Boards up together.
Stuck? Four steps on the strip: look in the box, True or False, which lines run, what is printed.
Number 3 compares text: "n" is not equal to "y". This is exactly Modify 4 in today's activity.`,
});
R.whatPrintedGridSlide(K, {
  section: R2, items: YOU_2, reveal: true,
  notes: `Check boards.
1: 3 > 2, True → Locked. Nothing after the else, so that's all.
2: 50 >= 50 is True (boundary). Don't forget Done.
3: "n" == "y" is False → Cancelled, then Done. Text needs its quotes when you compare it: answer == y (no quotes) would be a NameError.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  elif — a third path
// ════════════════════════════════════════════════════════════════════════════
const E = 'elif';
const STEPS_E = ['Look in the box', 'Check from the top', 'Which lines run?', 'What is printed?'];
const ELIF_CODE = (v) => [`battery = ${v}`, 'if battery >= 70:', '    print("Full")', 'elif battery >= 30:', '    print("Low")',
  'else:', '    print("Critical")'];

R.whatPrintedSlide(K, {
  section: E, mode: 'I DO', title: 'elif: a third path',
  code: ELIF_CODE(35), size: 22, lh: 0.55, stripY: 6.12,
  memory: { line: 1, name: 'battery', type: 'int', value: '35' },
  conds: [{ line: 2, expr: '35 >= 70', result: false }, { line: 4, expr: '35 >= 30', result: true }],
  runs: [5], skipped: [3, 7], output: ['Low'], steps: STEPS_E,
  notes: `elif means "else if": another condition, checked only if the ones above it were False.
Click 1 — box: 35.
Click 2 — the if: 35 >= 70? False, so Python moves down to the elif.
Click 3 — the elif: 35 >= 30? True. Stop checking.
Click 4 — only the elif block runs. Click 5 — Low.
else still has no condition: it runs only when NONE of the conditions were True.`,
});

R.whatPrintedSlide(K, {
  section: E, mode: 'I DO', title: 'The first True one wins',
  code: ELIF_CODE(80), size: 22, lh: 0.55, stripY: 6.12,
  memory: { line: 1, name: 'battery', type: 'int', value: '80' },
  conds: [{ line: 2, expr: '80 >= 70', result: true }, { line: 4, expr: '80 >= 30', result: true }],
  runs: [3], skipped: [5, 7], output: ['Full'], steps: STEPS_E,
  notes: `Same program, battery = 80.
Click 1 — box: 80. Click 2 — 80 >= 70 is True, so the elif is NOT CHECKED, even though 80 >= 30 is also True.
Click 3 — only the if block runs. Click 4 — Full, and only Full.
This is the big one: Python checks from the top and stops at the FIRST True condition. So the order of the conditions matters — they'll test that in Investigate step 1.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  The activity, feedback, plenary
// ════════════════════════════════════════════════════════════════════════════
const A = 'Proximity';
R.chapterSlide(K, {
  section: A, kicker: 'CHAPTER 2', title: 'Proximity', activity: 'Proximity', time: '≈30 MIN', logLabel: 'SENSOR OPS',
  log: ['The room is empty.', '', 'Frost on the floor.', 'A vent cover hangs open', 'above the console.'],
  note: [{ text: 'Two calls this time: ', options: { bold: true, color: P.gold } },
    { text: 'one in Modify, one in Make. They change the story, not your score.' }],
  notes: `Students open "Proximity — Selection" from Google Classroom (Y9 › Python › Lesson 2).
Predict (5 questions: Program A is if / else, Program B adds one elif) → Run (85, 20, 5) → Investigate (4 steps: swap the numbers, elif → if, >= → >, then Break it: int() removed → TypeError) → Modify (4 steps; step 1 is the lockdown choice) → Make (radiation scanner, plus the power choice).
Circulate. During Investigate, point students back to the debugging recipe (Lesson 1) before they press Get help.
Anyone who missed Lesson 1: the activity's "Previously…" recap catches them up on the story.
Fast finishers: the Make extension (SCANNER FAULT below 0, EVACUATE from 500).`,
});

R.errorFeedbackSlide(K, {
  section: A, title: 'input() gives text, so convert it',
  code: ['distance = input("Distance: ")', 'if distance >= 50:'], hl: [2],
  error: [[{ text: 'TypeError: ', color: P.red, bold: true },
    { text: "'>=' not supported between instances of 'str' and 'int'", color: P.red }]],
  memory: { name: 'distance', type: 'str', value: '"30"' },
  takeaway: [{ text: 'Python points at line 2, but the fix is on line 1:', options: { bold: true, color: P.gold } },
    { text: '\ndistance = int(input("Distance: "))', options: { fontFace: MONO } }],
  notes: `Whole-class feedback after the activity — this was the Break it step in Investigate.
Ask: "Which line did Python point to?" (2) "What's in the box?" (the text "30", orange: a str) "Why can't >= compare it with 50?" (text and a number).
The error shows on the line that USES the value, but the fix is on the line that STORED it. Same rule as last lesson: input() always gives text.`,
});

K.beat('L3'); // the cliffhanger: lights out, then red alarm and hazard stripes (Chapter 3: Locked In)
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Write if / elif / else for temp: 30 or more → Hot, 15 or more → Warm, else Cold.',
    'Fix this line, and say why it crashed:'],
  code: 'if answer = "y":',
  cliff: [{ text: 'AIRLOCK: SEALED · ACCESS CODE CHANGED · BY: ' }, { text: 'WARDEN', color: P.gold, bold: true }],
  notes: `Exit task on whiteboards or a sticky note.
1. if temp >= 30: print("Hot") / elif temp >= 15: print("Warm") / else: print("Cold"). Follow-up question: what does yours print when temp = 15? (Warm: 15 >= 15 is True.) Any order that works is fine — check they didn't put >= 15 first (then 30 would print Warm).
2. if answer == "y": — one = stores, an if needs == to ask. It's a SyntaxError.
Close the story: "For one frame, the sensors catch it: a figure in Hale's overalls, moving wrong. Then the airlock seals, and WARDEN changes the access code. Next lesson: you're locked in."
In Slide Show this slide fades in through black and the red alarm creeps in by itself: Chapter 3's state, which Lesson 3's deck opens with.`,
});

K.write(OUT);
