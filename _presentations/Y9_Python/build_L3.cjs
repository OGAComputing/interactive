// Y9 Python — Lesson 3 (While loops) deck, Station Zero theme, Chapter 3: Locked In.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L3.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L3_While_Loops.pptx beside this file. Activity: Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html.
// Teaching order (as Lesson 2): the condition first (!= joins the True or False operators), then
// the flowchart, then one animated run of a counting loop (I do, "Watch it run"), then
// short questions, not trace tables: which line runs next? on the keypad loop (We do), and the same question on three new loops
// (You do + answers). Then str() (the activity's Modification 2 needs it), then the activity.

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
  { pill: 'LAST LESSON', q: 'Which if statement is correct?', type: 'mcq',
    opts: ['if: x == 5', 'if x == 5:', 'if x = 5:'], optsMono: true,
    a: 'B — if x == 5:', why: '== to compare, colon at the end' },
  { pill: 'LESSON 1', q: 'This crashes. Write the last line correctly.', type: 'write',
    code: ['score = 10', 'print(scroe)'], a: 'print(score)', why: 'the name must match exactly', aMono: true },
  { pill: 'LAST LESSON', q: 'They type 14. What is printed?', type: 'write',
    code: ['age = int(input("Age? "))', 'print(age + 1)'], a: '15', why: 'int() made it a number, so + adds', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
Q1, 2 and 4 are from last lesson, Proximity: conditions, if / elif / else and int(). Q3 (variables) is from Lesson 1.
Q1–2 are multiple choice (everyone commits to an answer). Q3–4 need a written answer.
Confidence rating 1–3 next to each answer — confident-but-wrong is the one most worth correcting.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident and wrong" on each.
Q1: >= means "more than OR equal to", so 30 >= 30 is True. 30 > 30 is False: the boundary again.
Q2: the condition comes straight after if, and the colon goes at the END of the line (A puts it in the wrong place). A single = STORES a value; == COMPARES two values, so C is a SyntaxError. Today's while lines follow the same pattern: while, a condition, a colon.
Q3: scroe is not score. Python has no box called scroe, so it stops with a NameError. Names must match exactly, letter for letter: today's loops need the same name in the condition and inside the loop.
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

// 5. Selection vs iteration (one-off diagram): the same flowchart twice. The program runs straight
// down the middle (line before → condition → False → next line); True goes out to the right. The only
// difference is where the True path comes back in: below the diamond (if) or above it (while).
{
  const s = newSlide('SZ_DARK', C, 'Selection and iteration');
  const lab = (t, x, color = P.dim) => text(s, t, { x, y: 1.55, w: 5.6, h: 0.3, fontSize: 13, bold: true, color, charSpacing: 2 });
  const node = (t, x, y, w, line = P.line) => {
    box(s, { x, y, w, h: NH, fill: P.panel, line, lw: line === P.line ? 1.25 : 2, r: 0.08 });
    text(s, t, { x, y, w, h: NH, fontSize: 20, color: P.off, align: 'center', valign: 'middle' });
  };
  const seg = (x1, y1, x2, y2, color, w = 2.25) => s.addShape(K.pres.shapes.LINE,   // a plain line, no head
    { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color, width: w } });
  // Geometry shared by both halves (ox = the half's left edge)
  const NH = 0.6, DW = 2.6, DH = 1.2, TOP = 1.95, DY = 2.95, NEXT = 5.0, BW = 2.2, GAP = 0.5;
  const geo = (ox) => {
    const cx = ox + 1.55, cy = DY + DH / 2, bx = cx + DW / 2 + GAP;
    return { cx, cy, bx, bmid: bx + BW / 2 };
  };
  // The trunk: line before → condition → (False) → next line. drawn in `line` colour.
  const trunk = (ox, line) => {
    const { cx, cy } = geo(ox);
    node('Line before', cx - 1.2, TOP, 2.4);
    arrow(s, cx, TOP + NH, cx, DY);
    s.addShape(K.pres.shapes.DIAMOND, { x: cx - DW / 2, y: DY, w: DW, h: DH, fill: { color: P.code }, line: { color: line, width: 2 } });
    text(s, [{ text: 'condition', options: { bold: true } }, { text: '\nTrue or False?', options: { color: P.muted, fontSize: 15 } }],
      { x: cx - DW / 2 + 0.4, y: DY, w: DW - 0.8, h: DH, fontSize: 19, align: 'center', valign: 'middle' });
    arrow(s, cx, DY + DH, cx, NEXT);
    text(s, 'False', { x: cx + 0.12, y: DY + DH + 0.12, w: 1, h: 0.4, fontSize: 18, bold: true, color: P.muted });
    node('Next line', cx - 1.2, NEXT, 2.4);
    return cx;
  };
  // The True branch: out to the right of the diamond into the indented lines.
  const branch = (ox, line) => {
    const { cx, cy, bx } = geo(ox);
    arrow(s, cx + DW / 2, cy, bx, cy, P.ok);
    text(s, 'True', { x: cx + DW / 2 - 0.05, y: cy + 0.05, w: GAP + 0.1, h: 0.4, fontSize: 18, bold: true, color: P.ok, align: 'center' });
    node('Indented lines', bx, cy - NH / 2, BW, line);
  };

  // Left: selection (last lesson): the True path rejoins BELOW the diamond, so it runs once
  const L = M, Rx = 6.85;
  lab('LAST LESSON: SELECTION (if)', L);
  trunk(L, P.muted);
  branch(L, P.line);
  { const { cx, cy, bmid } = geo(L), jy = NEXT - 0.4;
    seg(bmid, cy + NH / 2, bmid, jy, P.muted);
    arrow(s, bmid, jy, cx, jy, P.muted); }
  text(s, 'Checks once, runs once', { x: L, y: 6.0, w: 5.6, h: 0.5, fontSize: 22, color: P.muted, align: 'center' });
  s.addShape(K.pres.shapes.LINE, { x: 6.45, y: 1.6, w: 0, h: 4.9, line: { color: P.line, width: 1 } });

  // Right: iteration (today), built up on click
  onClick(s, 1, () => { lab('TODAY: ITERATION (while)', Rx, P.gold); trunk(Rx, P.gold); branch(Rx, P.ok); });
  onClick(s, 2, () => {           // back up and round: rejoins ABOVE the diamond, so the condition is checked again
    const { cx, cy, bmid } = geo(Rx), jy = (TOP + NH + DY) / 2;
    seg(bmid, cy - NH / 2, bmid, jy, P.gold, 2.5);
    arrow(s, bmid, jy, cx, jy, P.gold);
    text(s, 'back up: check again', { x: cx + 0.6, y: jy + 0.05, w: bmid - cx - 0.7, h: 0.32, fontSize: 16, italic: true,
      bold: true, color: P.gold, align: 'right' });
  });
  onClick(s, 3, () => text(s, 'Checks again each time round', { x: Rx, y: 6.0, w: 5.6, h: 0.5, fontSize: 22,
    color: P.gold, bold: true, align: 'center' }));
  addIcon(s, 'info');
  s.addNotes(`Trace each flowchart with your finger, top to bottom.
Left, last lesson: an if checks its condition ONCE. True → the indented lines run once, then come back in BELOW the diamond and the program carries on. False → straight down to the next line.
Click 1: a while loop. Same shape: same diamond, same True to the right, same False straight down.
Click 2: the one difference. After the indented lines run, the arrow goes back UP, above the diamond — so the condition is checked again. Round and round while it's True. Only False gets you down to the next line.
Click 3: "A while is an if that keeps checking."
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

// ════════════════════════════════════════════════════════════════════════════
//  Loops in action: watch one run (I do), then short questions instead of trace tables
//  (Nick, 2026-11-04: trace tables after the example were too complicated and too slow).
// ════════════════════════════════════════════════════════════════════════════
const R1 = 'Loops in action';

// Watch it run (one-off, animated): a gold bar steps through the code one line per click, the fuel box
// changes, the output builds up, and a gold arrow shows each jump back to the top. Uses onClick's
// `until` to fade the bar, the old value and the arrow out again.
const FUEL = ['fuel = 0', 'while fuel < 3:', '    fuel = fuel + 1', '    print(fuel)', 'print("Full")'];
{
  const s = newSlide('SZ_DARK', R1, 'Watch it run');
  const cx = 1.35, cw = 6.4;
  const cp = codePanel(s, FUEL, { x: cx, y: 1.7, w: cw, size: 24, lh: 0.74 });
  K.varBox(s, { name: 'fuel', type: 'int', value: '', x: 8.2, y: 1.95, w: 2.4, h: 1.0 });
  const out = { x: 8.2, y: 3.3, w: 4.53, lh: 0.42 };
  K.terminal(s, ['', '', '', ''], { x: out.x, y: out.y, w: out.w, size: 22, lh: out.lh, label: 'OUTPUT' });
  // One step per click: the line that runs, and what it does
  const steps = [{ line: 1, mem: '0' }, { line: 2, check: ['0 < 3', true] }, { line: 3, mem: '1' }, { line: 4, out: '1' },
    { line: 2, back: 1, check: ['1 < 3', true] }, { line: 3, mem: '2' }, { line: 4, out: '2' },
    { line: 2, back: 1, check: ['2 < 3', true] }, { line: 3, mem: '3' }, { line: 4, out: '3' },
    { line: 2, back: 1, check: ['3 < 3', false] }, { line: 5, out: 'Full' }];
  const lineTop = (n) => cp.ys[n - 1] - cp.lh / 2;
  const nextMem = (i) => { const j = steps.findIndex((st, k) => k > i && st.mem); return j < 0 ? undefined : j + 1; };
  let outRow = 0;
  steps.forEach((st, i) => {
    const k = i + 1, last = k === steps.length;
    onClick(s, k, () => {         // the gold bar on the line that runs now (gone on the next click)
      s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: lineTop(st.line), w: cw - 0.12, h: cp.lh,
        fill: { color: P.gold, transparency: 82 }, line: { color: P.gold, width: 2 } });
      if (st.check) {
        s.addText([{ text: '→  ', options: { color: P.gold, bold: true, fontFace: MONO, fontSize: 22 } }, ...pyRuns(st.check[0], 22)],
          { isTextBox: true, x: 5.05, y: lineTop(2), w: 1.45, h: cp.lh, margin: 0, valign: 'middle' });
        R.boolChip(K, s, st.check[1], 6.55, cp.ys[1] - 0.25, 1.05, 0.5, 20);
      }
      if (st.back) {                // round the left of the code, from the end of the body back up to line 2
        const lx = cx - 0.4, y4 = cp.ys[3], y2 = cp.ys[1];
        s.addShape(K.pres.shapes.LINE, { x: lx, y: y4, w: cx - lx, h: 0, line: { color: P.gold, width: 2.5 } });
        s.addShape(K.pres.shapes.LINE, { x: lx, y: y2, w: 0, h: y4 - y2, line: { color: P.gold, width: 2.5 } });
        arrow(s, lx, y2, cx, y2, P.gold);
      }
    }, last ? undefined : k + 1);
    if (st.mem) onClick(s, k, () => text(s, st.mem, { x: 8.3, y: 2.15, w: 2.2, h: 0.75, fontFace: MONO, fontSize: 32,
      color: P.off, align: 'center', valign: 'middle' }), nextMem(i));
    if (st.out) {
      const row = outRow++;
      onClick(s, k, () => text(s, st.out, { x: out.x + 0.25, y: out.y + 0.25 + 0.35 + row * out.lh, w: out.w - 0.5, h: out.lh,
        fontFace: MONO, fontSize: 22, valign: 'middle' }));
    }
  });
  onClick(s, steps.length + 1, () => R.banner(K, s, [{ text: '4 checks, 3 times round. ', options: { bold: true, color: P.gold } },
    { text: 'The loop stops at the first False.' }], 6.0, 0.7, 22));
  R.modeChip(K, s, 'I DO');
  addIcon(s, 'info');
  s.addNotes(`I DO — the whole loop, one line per click. Students just watch; you narrate every click in the same words.
The gold bar is the line Python is running. The fuel box holds ONE value: each new one replaces the old. The output builds up.
Before click 1, point at the shape: while, a condition, a colon (like an if); the indented lines are the body.
1 "fuel = 0: put 0 in the box."  2 "Check: is 0 < 3? True, so into the body."  3 "fuel = fuel + 1: 0 + 1 is 1. This line changes fuel: without it, 0 < 3 is True for ever."  4 "print(fuel): 1."
5 The gold arrow: "End of the body, so BACK TO THE TOP. Check again: 1 < 3? True."  6–7: 2 and print 2.
8 "Back up. 2 < 3? True."  9–10: 3 and print 3.
11 "Back up. 3 < 3? FALSE." Pause here: ask "Which line runs next?" (line 5: Python skips the body and carries on below the loop.)
12 "print("Full"): once, because it isn't indented."  13 The takeaway: four checks, but only three times round, because the last check is False.
Common slip to name now: "Doesn't it print 0 first?" No: line 3 adds 1 before line 4 prints.`);
}

// Which line runs next? (one-off, We do): the keypad loop. Each question is a click (the gold bar = the
// line that has just run, plus what's in code), then a click for the answer (the next line outlined in
// green, an arrow when Python jumps, and why). Each question fades out when the next one starts.
const KEYPAD = ['code = input("Code: ")', 'while code != "4271":', '    print("ACCESS DENIED")', '    code = input("Code: ")',
  'print("Airlock open")'];
{
  const s = newSlide('SZ_DARK', R1, 'Which line runs next?');
  const cx = 1.35, cw = 6.4;
  const cp = codePanel(s, KEYPAD, { x: cx, y: 1.7, w: cw, size: 22, lh: 0.7 });
  K.varBox(s, { name: 'code', type: 'str', value: '', x: 8.2, y: 1.95, w: 2.6, h: 1.0 });
  box(s, { x: 8.2, y: 3.35, w: 4.53, h: 2.15, fill: P.panel, line: P.line, r: 0.08 });
  text(s, 'NEXT LINE', { x: 8.45, y: 3.5, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  const qs = [
    { line: 1, mem: '"1234"', next: 2, why: 'The loop starts: check the condition' },
    { line: 2, mem: '"1234"', next: 3, why: [{ text: '"1234" != "4271"', options: { fontFace: MONO, bold: true } },
      { text: ' is True: into the body' }] },
    { line: 4, mem: '"4271"', next: 2, why: 'End of the body: back to the top' },
    { line: 2, mem: '"4271"', next: 5, why: [{ text: '"4271" != "4271"', options: { fontFace: MONO, bold: true } },
      { text: ' is False: skip the body' }] },
  ];
  const top = (n) => cp.ys[n - 1] - cp.lh / 2;
  qs.forEach((q, i) => {
    const ask = 2 * i + 1, ans = ask + 1, gone = i < qs.length - 1 ? ask + 2 : undefined;
    onClick(s, ask, () => {
      s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: top(q.line), w: cw - 0.12, h: cp.lh,
        fill: { color: P.gold, transparency: 82 }, line: { color: P.gold, width: 2 } });
      text(s, q.mem, { x: 8.3, y: 2.15, w: 2.4, h: 0.75, fontFace: MONO, fontSize: 30, color: P.off, align: 'center', valign: 'middle' });
    }, gone);
    onClick(s, ans, () => {
      s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: top(q.next), w: cw - 0.12, h: cp.lh,
        fill: { type: 'none' }, line: { color: P.ok, width: 2.5 } });
      if (Math.abs(q.next - q.line) > 1) {       // a jump: round the left of the code, from this line to the next
        const lx = cx - 0.4, y1 = cp.ys[q.line - 1], y2 = cp.ys[q.next - 1];
        s.addShape(K.pres.shapes.LINE, { x: lx, y: y1, w: cx - lx, h: 0, line: { color: P.ok, width: 2.5 } });
        s.addShape(K.pres.shapes.LINE, { x: lx, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1), line: { color: P.ok, width: 2.5 } });
        arrow(s, lx, y2, cx, y2, P.ok);
      }
      text(s, String(q.next), { x: 8.45, y: 3.8, w: 4.0, h: 0.8, fontFace: MONO, fontSize: 44, bold: true, color: P.ok, valign: 'middle' });
      text(s, q.why, { x: 8.45, y: 4.6, w: 4.05, h: 0.8, fontSize: 19, color: P.off, valign: 'middle' });
    }, gone);
  });
  R.banner(K, s, [{ text: 'The gold line has just run. ', options: { bold: true, color: P.gold } },
    { text: 'On your board: the number of the line that runs next.' }], 6.0, 0.75, 22);
  R.modeChip(K, s, 'WE DO');
  addIcon(s, 'practice');
  s.addNotes(`WE DO — the airlock keypad, the same program as today's activity. 8 clicks: a question, then its answer, four times.
Each question: the gold line has JUST run, and the box shows what's in code. Boards up with a line number, THEN click for the answer.
Q1 (line 1 ran, they typed 1234) → line 2: the loop starts by checking the condition.
Q2 (line 2, code is "1234") → line 3: "1234" != "4271" is True, so into the body.
Q3 (line 4 ran, they typed 4271) → line 2, NOT line 5: the end of the body always goes back to the top. This is the one most of the class gets wrong.
Q4 (line 2, code is "4271") → line 5: False, so Python skips the whole body.
Follow-up: "How many times did the program ASK?" (twice here: line 1 and line 4.) The activity's Predict asks exactly this.`);
}

// Your turn: which line runs next? (Deliberate Practice / Feedback): the We do question on three new loops.
// The gold line has just run and the box shows the variable; the answers outline the next line in green.
const NEXT3 = [
  { code: ['n = 1', 'while n <= 3:', '    print(n)', '    n = n + 1', 'print("Launch")'], name: 'n', mem: '3', line: 2, next: 3 },
  { code: ['hp = 3', 'while hp > 0:', '    print("Hit!")', '    hp = hp - 1', 'print("Game over")'], name: 'hp', mem: '2', line: 4, next: 2 },
  { code: ['fuel = 5', 'while fuel < 5:', '    print(fuel)', '    fuel = fuel + 1', 'print("Full")'], name: 'fuel', mem: '5', line: 2, next: 5 },
];
function nextSlide(reveal) {
  const s = newSlide('SZ_DARK', R1, reveal ? 'Which line runs next? — answers' : 'Which line runs next? Your turn');
  const tw = 3.84, th = 4.25, gx = 0.3, y = 1.7;
  NEXT3.forEach((it, i) => {
    const x = M + i * (tw + gx);
    box(s, { x, y, w: tw, h: th, fill: P.panel, line: P.line, r: 0.08 });
    badge(s, i + 1, x + 0.15, y + 0.15, 0.4);
    const cx = x + 0.15, cw = tw - 0.3;
    const cp = codePanel(s, it.code, { x: cx, y: y + 0.65, w: cw, size: 16, lh: 0.4 });
    const top = (n) => cp.ys[n - 1] - cp.lh / 2;
    s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: top(it.line), w: cw - 0.12, h: cp.lh,
      fill: { color: P.gold, transparency: 82 }, line: { color: P.gold, width: 2 } });
    K.varBox(s, { name: it.name, type: 'int', value: it.mem, x: x + 0.2, y: y + 3.4, w: 1.7, h: 0.7, size: 24 });
    text(s, 'NEXT LINE', { x: x + 2.15, y: y + 3.15, w: 1.5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
    if (reveal) {
      s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: top(it.next), w: cw - 0.12, h: cp.lh,
        fill: { type: 'none' }, line: { color: P.ok, width: 2.5 } });
      text(s, String(it.next), { x: x + 2.15, y: y + 3.45, w: 1.5, h: 0.65, fontFace: MONO, fontSize: 40, bold: true,
        color: P.ok, valign: 'middle' });
    } else text(s, '?', { x: x + 2.15, y: y + 3.45, w: 1.5, h: 0.65, fontFace: MONO, fontSize: 40, bold: true,
      color: P.dim, valign: 'middle' });
  });
  R.banner(K, s, reveal
    ? [{ text: 'End of the body? ', options: { bold: true, color: P.gold } }, { text: 'Back to the while line. ' },
      { text: 'False? ', options: { bold: true, color: P.gold } }, { text: 'Skip the body.' }]
    : [{ text: 'The gold line has just run. ', options: { bold: true, color: P.gold } },
      { text: 'On your board: the next line number for 1, 2 and 3.' }],
  6.15, 0.7, 22);
  if (reveal) addIcon(s, 'feedback');
  else { K.timer(s, '2 MIN'); R.modeChip(K, s, 'YOU DO', true); addIcon(s, 'practice'); }
  return s;
}
nextSlide(false).addNotes(`YOU DO — silent, 2 minutes. The same question as the keypad, on three new loops.
The gold line has JUST run; the box shows what's in the variable now. Write three line numbers: 1, 2, 3.
Boards up together on 3-2-1.`);
nextSlide(true).addNotes(`Go through any the class split on.
1 → 3: 3 <= 3 is True (<= includes equal), so into the body.
2 → 2, NOT 5: line 4 is the end of the body, so Python goes back up to check hp > 0 again. Same slip as the keypad question.
3 → 5: 5 < 5 is False straight away, so the body is skipped: it runs ZERO times.
Link: in the activity, the right code first time means "ACCESS DENIED" never prints.`);

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
// Story so far: right before the chapter card that sends the class to the activity (Nick, 2026-11-04).
R.storySoFarSlide(K, {
  section: A, title: 'Locked In', logLabel: 'AIRLOCK 1',
  log: ['WARDEN has locked the airlock.', 'It changed the code.', 'Navigation is on the other side.'],
  notes: `Read it aloud in 20 seconds, then into the chapter card and the activity. The story so far, for anyone who missed Lesson 2.
It leaves out Lesson 2's choices (which pod, the lockdown, the power): they differ from student to student, and the activity's own "Previously…" recap covers them.
Link it: the keypad has to keep asking until the code is right — that's the loop you'll write now.`,
});

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
