// Y9 Python — Lesson 3 (While loops) deck, Station Zero theme, Chapter 3: Locked In.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L3.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L3_While_Loops.pptx beside this file. Activity: Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html.
// Teaching order (as Lesson 2): the condition first (!= joins the True or False operators), then
// the shape of a while loop, then two rounds of tracing — round 1 a counting loop, round 2 a loop
// that asks with input() — each as I do (1 example) → We do (1), with a You do grid after round 1.
// Then str() (the activity's Modification 2 needs it), then the activity.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L3_While_Loops.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 3: While loops',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 3', station: 'L3' });
const { P, MONO, BODY, M, newSlide, addIcon, text, box, arrow, pyRuns, codePanel, badge, onClick } = K;

const LESSON_Q = 'How do we make a program repeat lines while a condition is True?';

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (Lesson 2 = Proximity: if / elif / else, == ; Lesson 2 also taught int())
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'LAST LESSON', q: 'x holds 30. Which one is True?', type: 'mcq',
    opts: ['x > 30', 'x < 30', 'x >= 30'],
    a: 'C — x >= 30', why: '>= includes "equal to"' },
  { pill: 'LAST LESSON', q: 'Which line has no condition?', type: 'mcq',
    opts: ['elif x > 5:', 'else:', 'if x > 5:'],
    a: 'B — else:', why: 'else runs when nothing above was True' },
  { pill: 'LAST LESSON', q: 'This line crashes. Write it correctly.', type: 'write',
    code: ['if answer = "y":'], a: 'if answer == "y":', why: '= stores, == asks', aMono: true },
  { pill: 'LAST LESSON', q: 'They type 14. What is printed?', type: 'write',
    code: ['age = int(input("Age? "))', 'print(age + 1)'], a: '15', why: 'int() made it a number, so + adds', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
All four are from last lesson, Proximity: conditions, if / elif / else, == and int().
Q1–2 are multiple choice (everyone commits to an answer). Q3–4 need a written answer.
Confidence rating 1–3 next to each answer — confident-but-wrong is the one most worth correcting.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident and wrong" on each.
Q1: >= means "more than OR equal to", so 30 >= 30 is True. 30 > 30 is False: the boundary again.
Q2: else: has no condition: it runs when none of the conditions above it were True. elif means "else if": it has its own condition, checked only if everything above it was False.
Q3: one = STORES, two == ASK. An if needs a question, so ==. The one-= version is a SyntaxError.
Q4: int() turned the text "14" into the number 14, so + ADDS: 15. Keep this in your head: today we'll need to go the other way, a number back into text.` });

// ════════════════════════════════════════════════════════════════════════════
//  3–4. Title, questions
// ════════════════════════════════════════════════════════════════════════════
// Station state: Lesson 2 ended on the red lockdown (L3), so the story picks up there as a beat.
K.beat('L3');
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 3  ·  WHILE LOOPS', title: 'Station Zero', subtitle: 'Chapter 3 — Locked In',
  status: ['AIRLOCK ........ SEALED', 'ACCESS CODE .... CHANGED',
    [{ text: 'CHANGED BY ..... ' }, { text: 'WARDEN', color: P.gold, bold: true }], 'NAVIGATION ..... OFFLINE', [{ text: '> _' }]],
  notes: `Recap the story out loud — don't put it on screen:
"Last lesson you got the proximity sensors working, and for one frame they caught a figure in Hale's overalls, moving wrong. Then every airlock light turned red: WARDEN locked the airlock and changed the code. Navigation is on the other side — and Navigation is the only way to call the rescue ship."
Today we rewrite the airlock keypad. A keypad has to keep asking until the code is right — that's a loop.
In Slide Show this slide fades in through black and the red alarm creeps in: let it finish before you speak.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit. Last lesson was "make decisions"; today is "repeat".
Lesson question = today. This is new for everyone: loops weren't in Year 8.
We come back to this question in the plenary.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Iteration: what a loop is, and its condition
// ════════════════════════════════════════════════════════════════════════════
const C = 'Iteration';

// 5. Selection vs iteration (one-off diagram): an if checks once; a while goes back and checks again
{
  const s = newSlide('SZ_DARK', C, 'Selection and iteration');
  const lab = (t, x, y, w, color = P.dim) => text(s, t, { x, y, w, h: 0.3, fontSize: 13, bold: true, color, charSpacing: 2 });
  const node = (t, x, y, w, h, o = {}) => {
    box(s, { x, y, w, h, fill: o.fill || P.panel, line: o.line || P.line, lw: o.lw, r: 0.08 });
    text(s, t, { x, y, w, h, fontSize: o.size || 22, bold: !!o.bold, color: o.color || P.off, align: 'center', valign: 'middle' });
  };
  const diamond = (x, y, w, h, line) => {
    s.addShape(K.pres.shapes.DIAMOND, { x, y, w, h, fill: { color: P.code }, line: { color: line, width: 2 } });
    text(s, [{ text: 'condition', options: { bold: true } }, { text: '\nTrue or False?', options: { color: P.muted, fontSize: 15 } }],
      { x: x + 0.45, y, w: w - 0.9, h, fontSize: 19, align: 'center', valign: 'middle' });
  };
  // Left: selection (last lesson) — checked once
  lab('LAST LESSON: SELECTION (if)', M, 1.6, 5);
  diamond(M + 0.9, 2.0, 3.0, 1.1, P.muted);
  arrow(s, M + 2.4, 3.1, M + 2.4, 3.6, P.ok);
  text(s, 'True', { x: M + 2.5, y: 3.15, w: 1, h: 0.4, fontSize: 18, bold: true, color: P.ok });
  node('Run the block', M + 1.15, 3.6, 2.5, 0.75);
  arrow(s, M + 2.4, 4.35, M + 2.4, 4.9);
  node('Next line', M + 1.15, 4.9, 2.5, 0.75);
  text(s, 'Checks once, runs once', { x: M, y: 6.0, w: 4.8, h: 0.5, fontSize: 22, color: P.muted, align: 'center' });
  s.addShape(K.pres.shapes.LINE, { x: 5.55, y: 1.7, w: 0, h: 4.85, line: { color: P.line, width: 1 } });
  // Right: iteration (today) — the arrow goes back up to the condition (appears on click)
  onClick(s, 1, () => {
    lab('TODAY: ITERATION (while)', 6.0, 1.6, 5, P.gold);
    const dx = 7.0, dy = 2.0, dw = 3.0, dh = 1.1, cx = dx + dw / 2;
    diamond(dx, dy, dw, dh, P.gold);
    arrow(s, cx, dy + dh, cx, 3.6, P.ok);
    text(s, 'True', { x: cx + 0.1, y: 3.15, w: 1, h: 0.4, fontSize: 18, bold: true, color: P.ok });
    node('Run the body', cx - 1.25, 3.6, 2.5, 0.75, { line: P.ok });
    // back up: left of the body, up to the diamond's left point
    const lx = dx - 0.55;
    s.addShape(K.pres.shapes.LINE, { x: cx - 1.25 - 0.55, y: 3.975, w: 0.55, h: 0, line: { color: P.gold, width: 2.5 } });
    s.addShape(K.pres.shapes.LINE, { x: lx, y: dy + dh / 2, w: 0, h: 3.975 - dy - dh / 2, line: { color: P.gold, width: 2.5 } });
    arrow(s, lx, dy + dh / 2, dx, dy + dh / 2, P.gold);
    text(s, 'back to the top', { x: lx - 1.6, y: 2.95, w: 1.55, h: 0.4, fontSize: 16, italic: true, color: P.gold, align: 'right' });
    // False: carry on
    arrow(s, dx + dw, dy + dh / 2, 11.6, dy + dh / 2, P.muted);
    text(s, 'False', { x: dx + dw + 0.1, y: dy + 0.1, w: 1, h: 0.4, fontSize: 18, bold: true, color: P.muted });
    node('Next line', 10.6, 4.9, 2.0, 0.75);
    s.addShape(K.pres.shapes.LINE, { x: 11.6, y: dy + dh / 2, w: 0, h: 4.9 - dy - dh / 2, line: { color: P.muted, width: 2.25 } });
    arrow(s, 11.6, 4.5, 11.6, 4.9, P.muted);
    text(s, 'Checks again each time round', { x: 6.0, y: 6.0, w: 6.7, h: 0.5, fontSize: 22, color: P.gold, bold: true, align: 'center' });
  });
  addIcon(s, 'info');
  s.addNotes(`Last lesson: an if checks its condition ONCE. True → the block runs once, then the program moves on.
Click: a while loop. Same diamond, same True or False. But after the body runs, the program goes BACK TO THE TOP and checks again. It keeps going round while the condition is True. Only when it's False does the program carry on.
"A while is an if that keeps checking."
Ask: "Where would an airlock keypad need this?" (Keep asking for the code until it's right.)`);
}

// 6. != (one-off: the two "equal" operators + two examples)
{
  const s = newSlide('SZ_DARK', C, 'One new operator: !=');
  text(s, 'EQUAL, OR NOT EQUAL?', { x: M, y: 1.6, w: 5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  [['==', 'is equal to', P.dim], ['!=', 'is NOT equal to', P.gold]].forEach(([op, say, line], i) => {
    const y = 2.05 + i * 1.0;
    box(s, { x: M, y, w: 1.15, h: 0.75, fill: P.code, line, lw: i ? 2 : 1, r: 0.08 });
    text(s, op, { x: M, y, w: 1.15, h: 0.75, fontFace: MONO, fontSize: 30, bold: true, align: 'center', valign: 'middle' });
    text(s, say, { x: M + 1.4, y, w: 4.3, h: 0.75, fontSize: 24, valign: 'middle', bold: !!i });
  });
  text(s, 'Last lesson: ==   Today: != too', { x: M, y: 4.25, w: 5.5, h: 0.45, fontSize: 18, italic: true, color: P.muted });
  text(s, 'TRUE OR FALSE?', { x: 7.0, y: 1.6, w: 5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  [['"1234" != "4271"', true, 'Is 1234 different from 4271? Yes'], ['"4271" != "4271"', false, 'Is 4271 different from 4271? No']]
    .forEach(([expr, val, say], i) => {
      const y = 2.0 + i * 1.95;
      box(s, { x: 7.0, y, w: 3.6, h: 1.0, fill: P.code, line: P.line, r: 0.08 });
      s.addText(pyRuns(expr, 24), { isTextBox: true, x: 7.0, y, w: 3.6, h: 1.0, margin: 0, align: 'center', valign: 'middle' });
      onClick(s, i + 1, () => {
        arrow(s, 10.7, y + 0.5, 11.1, y + 0.5);
        R.boolChip(K, s, val, 11.2, y + 0.2, 1.5, 0.6, 26);
        text(s, say, { x: 7.0, y: y + 1.1, w: 5.7, h: 0.45, fontSize: 18, italic: true, color: P.muted });
      });
    });
  R.banner(K, s, [{ text: 'A keypad loop keeps going ', options: { bold: true, color: P.gold } },
    { text: 'while the code typed != the right code.' }], 5.95, 0.8, 22);
  addIcon(s, 'info');
  s.addNotes(`!= is new this year (Year 8 only had == < > <= >=). Read it as "is not equal to". Like ==, it's two characters, typed with no space.
Before each click, ask the class "True or False?" and get a show of hands.
Click 1: "1234" != "4271" → True: they ARE different.
Click 2: "4271" != "4271" → False: they're the same, so "not equal" is False.
The double negative trips people up: say it as a question. "Are these different?"
They're in quotes because input() gives text — the codes are text, not numbers.`);
}

// 7–8. True or False? practice + answers (mixing last lesson's operators with !=)
const TF = [{ expr: '"a" != "b"', value: true }, { expr: '5 != 5', value: false }, { expr: '3 < 3', value: false },
  { expr: '7 == 7', value: true }, { expr: '"y" != "y"', value: false }, { expr: '9 != 6', value: true }];
R.trueFalseSlide(K, {
  section: C, items: TF,
  takeaway: [{ text: 'On your board: ', options: { bold: true, color: P.gold } }, { text: 'write T or F for all six. Boards up together.' }],
  notes: `Silent, 2 minutes. Boards up on 3-2-1.
Number 2 (5 != 5) and number 5 ("y" != "y") are the ones to watch: the same value on both sides makes != False.
Number 3 (3 < 3) is retrieval from last lesson's boundary work.`,
});
R.trueFalseSlide(K, {
  section: C, items: TF, reveal: true,
  takeaway: [{ text: 'Watch out: ', options: { bold: true, color: P.gold } },
    { text: 'x != x', options: { fontFace: MONO, bold: true } }, { text: ' is always False. Ask: "are they different?"' }],
  notes: `Go through any the class split on.
5 != 5: are they different? No → False. "y" != "y": same text → False.
In today's loop, the condition is code != "4271": it stays True for every wrong code, and turns False the moment the right one is typed.`,
});

// 9. Anatomy of while (one-off: labels beside each line, one per click — the 4-step recipe)
{
  const s = newSlide('SZ_DARK', C, 'The shape of a while loop');
  const lines = ['code = input("Code: ")', 'while code != "4271":', '    print("ACCESS DENIED")', '    code = input("Code: ")',
    'print("Airlock open")'];
  const cp = codePanel(s, lines, { x: M, y: 1.75, w: 6.4, size: 24, lh: 0.78 });
  const labels = [
    [{ text: '① Set up the variable: ', options: { bold: true, color: P.gold } }, { text: 'ask first' }],
    [{ text: '② ', options: { bold: true, color: P.gold } }, { text: 'while', options: { fontFace: MONO, bold: true } },
      { text: ' + a condition + a colon ' }, { text: ':', options: { fontFace: MONO, bold: true, color: P.gold } }],
    [{ text: '③ Indented: ', options: { bold: true, color: P.gold } }, { text: 'repeats ', options: { bold: true, color: P.ok } },
      { text: 'while True' }],
    [{ text: '④ Change the variable ', options: { bold: true, color: P.gold } }, { text: 'inside: ask again' }],
    [{ text: 'Not indented: ', options: { bold: true } }, { text: 'runs once, after the loop' }],
  ];
  labels.forEach((l, i) => onClick(s, i + 1, () => {
    arrow(s, M + 6.55, cp.ys[i], M + 7.05, cp.ys[i], P.dim);
    text(s, l, { x: M + 7.2, y: cp.ys[i] - 0.38, w: 4.95, h: 0.76, fontSize: 21, valign: 'middle' });
  }));
  onClick(s, 6, () => R.banner(K, s, [{ text: 'Forget ④ and the loop never ends: ', options: { bold: true, color: P.gold } },
    { text: 'the condition stays True for ever.' }], 6.0, 0.8, 22));
  addIcon(s, 'info');
  s.addNotes(`6 clicks: one label per line, then the warning. These four steps are the recipe on the wall and in the activity.
① The variable needs a value BEFORE the loop, or line 2 has nothing to check (NameError).
② while, the condition, a colon. Same shape as an if.
③ The indented lines are the BODY. They run while the condition is True — then Python goes back up to line 2.
④ Something inside must change code, or the condition can never become False.
Line 5 isn't indented: it runs once, when the loop ends.
Ask: "What happens if I delete line 4?" (Infinite loop — they'll do exactly this in Investigate's Break it step.)`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Tracing a loop (one-off layout: code on the left; the trace table fills in one check per
//  click). Each row is one time Python checks the condition; the Printed column, read down, is
//  the output (the last row's is printed after the loop ends).
// ════════════════════════════════════════════════════════════════════════════
const STEPS_LOOP = ['Check the condition', 'True: run the body', 'Back to the top', 'False: carry on'];
const cell = (t, o = {}) => ({ text: t, options: { fontFace: o.mono ? MONO : BODY, fontSize: 18, color: o.color || P.off,
  bold: !!o.bold, fill: { color: o.fill || P.charcoal }, align: 'center', valign: 'middle', border: { type: 'solid', color: P.line, pt: 1 } } });

function loopTraceSlide(o) {
  const s = newSlide('SZ_DARK', o.section, o.title || 'Trace the loop');
  const cp = codePanel(s, o.code, { x: M, y: 1.7, w: 5.3, size: 20, lh: 0.56 });
  if (o.typed) {
    const y = 1.7 + cp.h + 0.25;
    text(s, [{ text: 'THE USER TYPES   ', options: { fontSize: 13, bold: true, color: P.dim, charSpacing: 2, fontFace: BODY } },
      { text: o.typed.join('   '), options: { fontFace: MONO, fontSize: 24, bold: true, color: P.str } }],
      { x: M, y, w: 5.3, h: 0.5, valign: 'middle' });
  }
  const tx = 5.95, colW = o.colW, rh = 0.55, tw = colW.reduce((a, b) => a + b);
  s.addTable([o.cols.map((c, i) => cell(c, { bold: true, fill: P.panel, color: i === 1 ? P.int : P.gold, mono: i > 0 && i < 3 }))],
    { x: tx, y: 1.7, w: tw, colW, rowH: rh, margin: [0.04, 0.1, 0.04, 0.1] });
  o.rows.forEach((r, i) => onClick(s, i + 1, () => {
    const isTrue = r[2] === 'True';
    s.addTable([r.map((v, j) => cell(v, {
      mono: j > 0, bold: j === 2,
      color: j === 0 ? P.muted : j === 1 ? (v.startsWith('"') ? P.str : P.int) : j === 2 ? (isTrue ? P.ok : P.muted) : P.gold,
    }))], { x: tx, y: 1.7 + rh * (i + 1), w: tw, colW, rowH: rh, margin: [0.04, 0.1, 0.04, 0.1] });
  }));
  // Sub-goal strip: the same four steps every time, so students learn the routine.
  const sy = 6.12, sh = 0.62, iw = 12.13 / STEPS_LOOP.length, bd = 0.36;
  box(s, { x: M, y: sy, w: 12.13, h: sh, fill: P.panel, r: 0.08 });
  STEPS_LOOP.forEach((t, i) => {
    badge(s, i + 1, M + 0.2 + i * iw, sy + (sh - bd) / 2, bd);
    text(s, t, { x: M + 0.68 + i * iw, y: sy, w: iw - 0.75, h: sh, fontSize: 18, valign: 'middle' });
  });
  R.modeChip(K, s, o.mode);
  addIcon(s, o.mode === 'I DO' ? 'info' : 'practice');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ════════════════════════════════════════════════════════════════════════════
//  Round 1 — a counting loop: I do → We do → You do → answers
// ════════════════════════════════════════════════════════════════════════════
const R1 = 'Round 1 — counting';

R.storySoFarSlide(K, {
  section: R1, title: 'Locked In', logLabel: 'AIRLOCK 1',
  log: ['WARDEN has locked the airlock.', 'It changed the code.', 'Navigation is on the other side.'],
  notes: `Read it aloud in 20 seconds, then into the first trace. The story so far, for anyone who missed Lesson 2.
It leaves out Lesson 2's choices (which pod, the lockdown, the power): they differ from student to student, and the activity's own "Previously…" recap covers them.
Link it: the keypad has to keep asking until the code is right — but first, a loop that just counts.`,
});

loopTraceSlide({
  section: R1, mode: 'I DO',
  code: ['fuel = 0', 'while fuel < 3:', '    fuel = fuel + 1', '    print("Pump")', 'print("Full")'],
  cols: ['Check', 'fuel', 'fuel < 3', 'Printed'], colW: [1.05, 1.15, 1.75, 2.55],
  rows: [['1', '0', 'True', 'Pump'], ['2', '1', 'True', 'Pump'], ['3', '2', 'True', 'Pump'], ['4', '3', 'False', 'Full']],
  notes: `I DO — model it out loud, students just watch. The same four steps every time (the strip at the bottom).
Each ROW is one time Python checks the condition on line 2.
Click 1 — "fuel is 0. Is 0 < 3? True. Run the body: fuel becomes 1, print Pump. Back to the top."
Click 2 — "fuel is 1. 1 < 3? True. fuel becomes 2, Pump." Click 3 — "2 < 3, True. fuel becomes 3, Pump."
Click 4 — "fuel is 3. 3 < 3? FALSE. Carry on after the loop: Full."
Read the Printed column down: that's the output. Point out: 3 Pumps, and Full only once, because line 5 isn't indented.
This counting shape is next lesson's for loop in disguise.`,
});

loopTraceSlide({
  section: R1, mode: 'WE DO',
  code: ['oxygen = 10', 'while oxygen > 7:', '    oxygen = oxygen - 1', '    print(oxygen)', 'print("Refill")'],
  cols: ['Check', 'oxygen', 'oxygen > 7', 'Printed'], colW: [1.05, 1.3, 1.85, 2.3],
  rows: [['1', '10', 'True', '9'], ['2', '9', 'True', '8'], ['3', '8', 'True', '7'], ['4', '7', 'False', 'Refill']],
  notes: `WE DO — students answer each row on boards BEFORE you click.
For each row ask: "What's in oxygen? True or False? What's printed?" Boards up → click.
Row 1: 10 > 7 True → oxygen becomes 9, print 9 (it prints AFTER the subtraction, so 9, not 10).
Row 4: 7 > 7 is False (boundary again: 7 is not MORE than 7) → Refill.
Common mistakes: printing 10 first (line 3 runs before line 4), or printing 6 (forgetting the check is at the top).`,
});

const YOU_1 = [
  { code: ['n = 1', 'while n <= 3:', '    print(n)', '    n = n + 1'], output: ['1', '2', '3'],
    why: [{ text: '4 <= 3', options: { fontFace: MONO, bold: true } }, { text: ' is False' }] },
  { code: ['n = 5', 'while n < 5:', '    print(n)', '    n = n + 1', 'print("End")'], output: ['End'],
    why: [{ text: '5 < 5', options: { fontFace: MONO, bold: true } }, { text: ' at once' }] },
  { code: ['n = 0', 'while n < 6:', '    n = n + 2', 'print(n)'], output: ['6'],
    why: [{ text: 'print', options: { fontFace: MONO, bold: true } }, { text: ' is not in the loop' }] },
];
R.whatPrintedGridSlide(K, {
  section: R1, items: YOU_1,
  notes: `YOU DO — silent, on your own, 4 minutes. Boards up together at the end.
Stuck? Draw a trace table like the last two slides: one row per check.
Number 2 is the trap: the condition is checked BEFORE the loop runs even once. Number 3: look at the spaces in front of print.`,
});
R.whatPrintedGridSlide(K, {
  section: R1, items: YOU_1, reveal: true,
  notes: `Check boards. Most common mistakes:
1: "1 2 3 4" — after 3 prints, n becomes 4, and 4 <= 3 is False, so it stops.
2: "5, End" — 5 < 5 is False straight away, so the body NEVER runs. A while can run zero times.
3: "2 4 6" — print(n) isn't indented, so it's not in the loop: it runs once, after the loop, when n is 6.
If most of the class got 2 or 3 wrong, trace one more together before Round 2.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Round 2 — a loop that asks: I do → We do
// ════════════════════════════════════════════════════════════════════════════
const R2 = 'Round 2 — input()';

loopTraceSlide({
  section: R2, mode: 'I DO', typed: ['1234', '0000', '4271'],
  code: ['code = input("Code: ")', 'while code != "4271":', '    print("ACCESS DENIED")', '    code = input("Code: ")',
    'print("Airlock open")'],
  cols: ['Check', 'code', 'code != "4271"', 'Printed'], colW: [0.95, 1.15, 2.4, 2.25],
  rows: [['1', '"1234"', 'True', 'ACCESS DENIED'], ['2', '"0000"', 'True', 'ACCESS DENIED'], ['3', '"4271"', 'False', 'Airlock open']],
  notes: `I DO — the airlock keypad, the same program as today's activity. Now the variable changes because the USER types something new each time round.
Click 1 — "Line 1 asks: 1234. Is "1234" != "4271"? Yes, True. ACCESS DENIED, then line 4 asks again: 0000."
Click 2 — "0000 != 4271? True. ACCESS DENIED, ask again: 4271."
Click 3 — "4271 != 4271? False. The loop ends: Airlock open."
Read the Printed column down: two denials for two wrong codes. We don't know in advance how many times it will loop — that's what a while is for.`,
});

loopTraceSlide({
  section: R2, mode: 'WE DO', typed: ['40', '48', '42'],
  code: ['answer = input("6 x 7? ")', 'while answer != "42":', '    print("Not quite")', '    answer = input("6 x 7? ")',
    'print("Correct!")'],
  cols: ['Check', 'answer', 'answer != "42"', 'Printed'], colW: [0.95, 1.15, 2.4, 2.25],
  rows: [['1', '"40"', 'True', 'Not quite'], ['2', '"48"', 'True', 'Not quite'], ['3', '"42"', 'False', 'Correct!']],
  notes: `WE DO — boards before each click: "What's in answer? True or False? What's printed?"
Then: "How many times did the program ASK?" (3: once on line 1, twice on line 4.) The activity's Predict asks exactly this.
Follow-up: "What if they typed 42 first?" (Correct! only — the body never runs.)`,
});

// ════════════════════════════════════════════════════════════════════════════
//  str(): a number back into text (moved here from Lesson 1's Life Support round; the activity's
//  Modification 2 prints an attempts counter with it)
// ════════════════════════════════════════════════════════════════════════════
const verb = (t) => ({ text: t, options: { bold: true, color: P.gold } });
const mono = (t) => ({ text: t, options: { fontFace: MONO, color: P.off } });
R.runLinesSlide(K, {
  section: 'Numbers into text', title: 'str() turns a number into text', codeSize: 20,
  lines: [
    { code: 'print("Tries: " + attempts)',
      say: [{ text: 'Text + a number: ' }, verb('Python stops'), { text: ', because + can’t join and add at once' }],
      screen: [[{ text: 'TypeError', color: P.red, bold: true }]],
      screenNote: 'A crash, not a message',
      memory: [{ name: 'attempts', type: 'int', value: '3' }],
      memoryNote: 'A number' },
    { code: 'print("Tries: " + str(attempts))',
      say: [mono('str()'), { text: ' turns 3 into the ' }, { text: 'text', options: { bold: true, color: P.str } },
        { text: ' "3", so + ' }, verb('joins'), { text: ' it on' }],
      screen: ['Tries: 3'],
      screenNote: 'Joined into one line',
      memory: [{ name: 'attempts', type: 'int', value: '3' }],
      memoryNote: 'Still a number: str() doesn’t change the box' },
  ],
  notes: `Last lesson int() turned text INTO a number. Today we need the opposite.
6 clicks: each line, then what's on screen, then what's in memory.
Line 1: "Tries: " is text, attempts is a number. + can join two texts, or add two numbers, but not one of each: TypeError. (The full message is "can only concatenate str (not "int") to str".)
Line 2: str(attempts) makes the TEXT "3" just for this line, so + joins it. Memory is the same both times: attempts is still the number 3.
In today's activity, Modification 2 counts the tries at the keypad and prints them exactly like this (the code is given).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  The activity, feedback, plenary
// ════════════════════════════════════════════════════════════════════════════
const A = 'Locked In';
R.chapterSlide(K, {
  section: A, kicker: 'CHAPTER 3', title: 'Locked In', activity: 'Locked In', time: '≈30 MIN', logLabel: 'AIRLOCK 1',
  log: ['The airlock is sealed.', '', 'WARDEN changed the code.', 'Something is moving', 'down the ring corridor.'],
  note: [{ text: 'Three calls again: ', options: { bold: true, color: P.gold } },
    { text: 'in Investigate, Modify and Make. They change the story, not your score.' }],
  notes: `Students open "Locked In — While Loops" from Google Classroom (Y9 › Python › Lesson 3).
Predict (5 questions on the keypad loop; the worked example appears after question 1) → Run (twice: 4271 first time, then 3+ wrong codes first) → Investigate (4 steps: while → if, indent Airlock open into the loop, != → ==, then Break it: the line that asks again is deleted → an infinite loop) → Modify (4 steps: the airlock code choice, count the tries with str(), number each ACCESS DENIED, a pressure loop) → Make (the backup lock: a guessing game, plus the seals choice).
The three calls: Investigate step 1 opens with the CRISIS — the airlock and the Cryo Bay heaters share one power line. Keep the heaters on, and the airlock cycles slowly while something comes down the corridor (the student is "hunted"); fast-cycle it, and the Cryo Bay freezes. There's no right answer: let them argue.
Modify 1: WARDEN's code (9013) or an engineer override (0000) — Hale's log said not to trust WARDEN. Make: who holds the seals. On both paths the report shows WARDEN doing the right thing; that's deliberate, and pays off in Lesson 5. Don't tell them.
Break it: the loop never ends, so ACCESS DENIED floods the output until the editor stops it after 4 seconds (InfiniteLoopError). Tell them that's expected — it's the "emergency override".
Circulate. During Investigate, point students back to the debugging recipe before they press Get help.
Fast finishers: the Make extension (Too high / Too low hints: an if INSIDE the while).`,
});

R.errorFeedbackSlide(K, {
  section: A, title: 'A loop that never ends',
  code: ['code = input("Code: ")', 'while code != "4271":', '    print("ACCESS DENIED")'], hl: [2],
  error: [[{ text: 'InfiniteLoopError: ', color: P.red, bold: true },
    { text: 'the program was still running after 4 seconds', color: P.red }]],
  memory: { name: 'code', type: 'str', value: '"1234"' },
  takeaway: [{ text: 'Nothing inside the loop changes code, so the condition stays True. ', options: { bold: true, color: P.gold } },
    { text: 'Step ④: change the variable inside the loop.' }],
  notes: `Whole-class feedback after the activity — this was the Break it step in Investigate.
Ask: "What's in code?" (the text "1234") "Is "1234" != "4271"?" (True) "What changes code inside the loop?" (nothing — so it's True for ever).
Our editor stops a loop after 4 seconds. Real Python doesn't: the program just hangs. In IDLE or a terminal, Ctrl+C stops it.
The fix is the missing line, INDENTED, inside the loop: code = input("Code: "). Put it after the loop and it never runs while the loop repeats.`,
});

K.beat('L4'); // the cliffhanger: lights out, then scanlines and static (Chapter 4: Distress Signal)
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Write a loop that keeps asking "Password?" until the answer is "open".',
    'This loop never ends. Say why, and fix it:'],
  code: 'while fuel < 100: print("Filling")',
  cliff: [{ text: 'INTERCOM: "LET ME IN. IT’S ME."  ·  VOICEPRINT: ' }, { text: 'NO MATCH', color: P.gold, bold: true }],
  notes: `Exit task on whiteboards or a sticky note.
1. password = input("Password? ") / while password != "open": / (indented) password = input("Password? "). Check for all four recipe steps — especially ① asking BEFORE the loop and ④ asking again INSIDE it.
2. Nothing inside the loop changes fuel, so fuel < 100 stays True for ever. Fix: put fuel = fuel + 10 (or ask for the fuel again) inside the loop, indented.
Close the story: "You're through the airlock. Behind you, something hits the outer door. Then the intercom crackles, and it's Hale's voice: 'Let me in. It's me.' But the voiceprint says NO MATCH. Ahead of you, Navigation is dark — and the rescue ship can't find you."
Quick hands-up: "Who handed the seals to WARDEN? Who kept them?" Don't say which was better — Lesson 5 answers that.
In Slide Show this slide fades in through black and the static creeps in by itself: Chapter 4's state, which Lesson 4's deck opens with.`,
});

K.write(OUT);
