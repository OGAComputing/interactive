// Y9 Python — Lesson 4 (For loops) deck, Station Zero theme, Chapter 4: Distress Signal.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L4.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L4_For_Loops.pptx beside this file. Activity: Y9/Python/L4_For_Loops/1_Distress_Signal_PRIMM.html.
// Teaching order (built with Lesson 3's feedback): only what Predict, Run and Investigate need before the
// activity. Meet the turtle (forward, left) → why loop (eight lines become three) → one animated run of the
// beacon program, the page's own code (I do, "Watch it run": the turtle draws as the bar steps) → one We do
// and a You do of three short questions (no trace tables) → Story so far → the chapter card.
// A mid-activity stop before Modification 4 teaches range() with a variable in a non-turtle example (so
// Modify 4, which has no code, isn't given away). After the activity: the logic error (the bug step), then
// the plenary (while or for?) and the beat into Chapter 5.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L4_For_Loops.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 4: For loops',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 4', station: 'L4' });
const { P, MONO, M, newSlide, addIcon, text, box, arrow, codePanel, badge, onClick } = K;

const LESSON_Q = 'How do we make a program repeat lines a set number of times?';

// ── The beacon display: the activity's turtle screen, drawn with kit shapes ─────────────────────────
// Lines in signal green (as on the page, where the turtle's black pen shows green on the dark display).
const DISPLAY_BG = '070B16', SIGNAL = P.ok;
function display(s, { x, y, w, h, label = 'BEACON DISPLAY' }) {
  box(s, { x, y, w, h, fill: DISPLAY_BG, line: P.line, r: 0.08 });
  if (label) text(s, label, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.3, fontSize: 12, bold: true, color: P.muted, charSpacing: 2 });
}
// A straight line between two points (pptxgenjs lines go top-left → bottom-right; flip for the other diagonal).
function seg(s, x1, y1, x2, y2, color = SIGNAL, width = 3) {
  s.addShape(K.pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001,
    h: Math.abs(y2 - y1) || 0.001, flipH: (x2 - x1) * (y2 - y1) < 0, line: { color, width } });
}
// The turtle: an arrowhead at (x, y) pointing along heading h (degrees, 0 = east, anticlockwise, as in turtle).
function turtleAt(s, x, y, h, size = 0.3) {
  s.addShape(K.pres.shapes.ISOSCELES_TRIANGLE, { x: x - size * 0.4, y: y - size / 2, w: size * 0.8, h: size,
    rotate: ((90 - h) % 360 + 360) % 360, fill: { color: 'E2F8EA' }, line: { color: SIGNAL, width: 1.5 } });
}
// Run turtle moves ([['fd', n] | ['lt', deg] | ['rt', deg]]) from (0, 0) facing east.
// Returns, per move, the segment it drew (if any) and the pose after it, in slide inches.
function simulate(moves, { ox, oy, sc }) {
  let x = 0, y = 0, h = 0;
  const X = (v) => ox + v * sc, Y = (v) => oy - v * sc;
  return moves.map(([cmd, n]) => {
    let line = null;
    if (cmd === 'fd') {
      const nx = x + n * Math.cos(h * Math.PI / 180), ny = y + n * Math.sin(h * Math.PI / 180);
      line = [X(x), Y(y), X(nx), Y(ny)];
      x = Math.round(nx * 1e6) / 1e6; y = Math.round(ny * 1e6) / 1e6;
    } else h = (h + (cmd === 'lt' ? n : -n) + 360) % 360;
    return { line, pose: [X(x), Y(y), h] };
  });
}
// Draw a finished drawing at once (answers): every line, then the turtle where it ends.
function drawAll(s, moves, geo, size) {
  const st = simulate(moves, geo);
  st.forEach((m) => m.line && seg(s, ...m.line));
  const [x, y, h] = st.length ? st[st.length - 1].pose : [geo.ox, geo.oy, 0];
  turtleAt(s, x, y, h, size);
}
const times = (n, moves) => Array.from({ length: n }, () => moves).flat();

// A gold bar on the line that runs now, and the gold "back to the top" arrow round the left of the code.
const runBar = (s, cp, x, w, n) => s.addShape(K.pres.shapes.RECTANGLE, { x: x + 0.06, y: cp.ys[n - 1] - cp.lh / 2,
  w: w - 0.12, h: cp.lh, fill: { color: P.gold, transparency: 82 }, line: { color: P.gold, width: 2 } });
function backArrow(s, cp, x, from, to, color = P.gold) {
  const lx = x - 0.4, y1 = cp.ys[from - 1], y2 = cp.ys[to - 1];
  s.addShape(K.pres.shapes.LINE, { x: lx, y: y1, w: x - lx, h: 0, line: { color, width: 2.5 } });
  s.addShape(K.pres.shapes.LINE, { x: lx, y: y2, w: 0, h: y1 - y2, line: { color, width: 2.5 } });
  arrow(s, lx, y2, x, y2, color);
}
const label = (s, t, x, y, w = 4) => text(s, t, { x, y, w, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });

const BEACON = ['import turtle', 't = turtle.Turtle()', 'for i in range(4):', '    t.forward(100)', '    t.left(90)'];

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (Lesson 3 = Locked In: while, !=, str(); Lesson 2: indentation under an if)
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'LAST LESSON', q: 'code holds "4271". Which one is True?', type: 'mcq', optsMono: true,
    opts: ['code != "4271"', 'code == "4271"', 'code == 4271'],
    a: 'B — code == "4271"', why: 'the same text, quotes and all' },
  { pill: 'LAST LESSON', q: 'How many times does the loop run?', type: 'mcq',
    code: ['n = 0', 'while n < 3:', '    n = n + 1'], opts: ['2', '3', '4'],
    a: 'B — 3', why: 'n is 0, 1, 2 inside; at 3 the check is False' },
  { pill: 'LESSON 2', q: 'IndentationError. What is missing on line 2?', type: 'write',
    code: ['if x > 5:', 'print("Big")'], a: 'An indent', why: '4 spaces: the line belongs to the if' },
  { pill: 'LAST LESSON', q: 'What is printed?', type: 'write',
    code: ['tries = 3', 'print("Tries: " + str(tries))'], a: 'Tries: 3', why: 'str() made 3 into text', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
Q1, 2 and 4 are from last lesson, Locked In: != and ==, a while loop, str(). Q3 (indentation) is from Lesson 2.
Q1–2 are multiple choice (everyone commits to an answer). Q3 is the easy one: everyone can write something. Q4 needs a written answer.
Confidence rating 1–3 next to each answer — confident-but-wrong is the one most worth correcting.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident and wrong" on each.
Q1: == asks "is it equal?": the same text, so True. != is False here. C compares with the NUMBER 4271, not the text "4271", so it's False.
Q2: n is 0, 1, then 2 when the check is True, so the body runs 3 times. When n reaches 3, 3 < 3 is False and the loop stops. Keep this one in mind: a loop that runs a set number of times needs a counter and a check. Today there's a tidier way.
Q3: the line under an if must be indented (4 spaces), or Python doesn't know it belongs to the if. Today the indent decides which lines REPEAT.
Q4: str() turned 3 into the text "3", so + joins it on: Tries: 3.` });

// ════════════════════════════════════════════════════════════════════════════
//  3–4. Title, questions
// ════════════════════════════════════════════════════════════════════════════
// Station state: Lesson 3 ended on Chapter 4's static (L4), so the story picks up there as a beat.
K.beat('L4');
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 4  ·  FOR LOOPS', title: 'Station Zero', subtitle: 'Chapter 4 — Distress Signal',
  status: ['NAVIGATION ..... DARK', 'BEACON PROGRAM . WIPED',
    [{ text: 'RESCUE SHIP .... ' }, { text: 'NO CONTACT', color: P.gold, bold: true }], 'STORM .......... CLOSING', [{ text: '> _' }]],
  notes: `Recap the story out loud — don't put it on screen:
"You got through the airlock. Behind you, the intercom used Hale's voice: 'Let me in. It's me.' The voiceprint said NO MATCH. Now you're in Navigation, and it's dark. The storm has wiped the beacon program — and without the beacon, the rescue ship will never find you."
Today we rewrite the beacon. It flashes shapes out into space, and each shape is a different message. A shape is the same move repeated: that's a loop.
In Slide Show this slide fades in through black and the static creeps in: let it finish before you speak.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit. Last lesson was "repeat while a condition is True". Today is still "repeat", but a SET number of times.
We come back to this question in the plenary.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  The turtle: a pen you steer (only what the beacon program uses: forward and left)
// ════════════════════════════════════════════════════════════════════════════
const T = 'The turtle';

// 5. Meet the turtle (I do, animated): one line per click, its label beside it, the display changes.
{
  const s = newSlide('SZ_DARK', T, 'Meet the turtle');
  const code = ['import turtle', 't = turtle.Turtle()', 't.forward(100)', 't.left(90)'];
  const labels = ['load the turtle', 'make a turtle called t', 'move 100, drawing a line', 'turn left 90°'];
  const cx = M, cw = 7.9;
  const cp = codePanel(s, code, { x: cx, y: 1.75, w: cw, size: 24, lh: 0.78 });
  const d = { x: 8.75, y: 1.75, w: 3.98, h: cp.h };
  display(s, d);
  const geo = { ox: d.x + d.w / 2 - 0.75, oy: d.y + d.h / 2 + 0.55, sc: 0.015 };
  const st = simulate([['fd', 100], ['lt', 90]], geo);
  const poses = [[geo.ox, geo.oy, 0], st[0].pose, st[1].pose];
  code.forEach((_, i) => {
    const k = i + 1;
    onClick(s, k, () => runBar(s, cp, cx, cw, k), k < code.length ? k + 1 : undefined);
    onClick(s, k, () => text(s, labels[i], { x: cx + 4.45, y: cp.ys[i] - cp.lh / 2, w: cw - 4.6, h: cp.lh, fontSize: 18,
      italic: true, color: P.gold, valign: 'middle' }));
  });
  onClick(s, 3, () => seg(s, ...st[0].line));
  poses.forEach((p, j) => onClick(s, j + 2, () => turtleAt(s, ...p), j < 2 ? j + 3 : undefined));
  R.banner(K, s, [{ text: 'A turtle is a pen you steer: ', options: { bold: true, color: P.gold } },
    { text: 'it draws a line wherever it moves.' }], 5.55, 0.8, 24);
  R.modeChip(K, s, 'I DO');
  addIcon(s, 'info');
  s.addNotes(`Some of you met the turtle in Year 8. One line per click.
1 import turtle: load Python's turtle drawing tools. Nothing appears yet.
2 t = turtle.Turtle(): make a turtle and call it t. It appears in the middle, facing right (east).
3 t.forward(100): move forward 100 steps. The pen is down, so it draws a line.
4 t.left(90): turn left 90° on the spot. A turn draws nothing; it only changes where the turtle faces.
Ask: "What would t.forward(100) do now?" (Draw a line upwards.) In the activity, this screen is the station's Beacon display.`);
}

// 6. Same square, fewer lines: eight lines that repeat a pair four times → a for loop of three lines.
{
  const s = newSlide('SZ_DARK', T, 'A square: the same two lines, 4 times');
  const long = times(4, ['t.forward(100)', 't.left(90)']);
  const cp = codePanel(s, long, { x: M, y: 1.65, w: 3.75, size: 20, lh: 0.535, first: 3 });
  // a bracket and a count beside each repeated pair
  onClick(s, 1, () => [0, 1, 2, 3].forEach((p) => {
    const y1 = cp.ys[2 * p] - 0.17, y2 = cp.ys[2 * p + 1] + 0.17, bx = M + 3.95;
    s.addShape(K.pres.shapes.LINE, { x: bx, y: y1, w: 0, h: y2 - y1, line: { color: P.gold, width: 2.5 } });
    [y1, y2].forEach((yy) => s.addShape(K.pres.shapes.LINE, { x: bx - 0.12, y: yy, w: 0.12, h: 0, line: { color: P.gold, width: 2.5 } }));
    badge(s, p + 1, bx + 0.15, (y1 + y2) / 2 - 0.2, 0.4);
  }));
  onClick(s, 2, () => {
    arrow(s, 5.35, 3.85, 6.15, 3.85, P.gold);
    label(s, 'THE SAME SQUARE, WITH A LOOP', 6.35, 2.35, 6.3);
    const lp = codePanel(s, BEACON.slice(2), { x: 6.35, y: 2.75, w: 6.38, size: 26, lh: 0.8, first: 3 });
    text(s, '4 times', { x: 11.2, y: lp.ys[0] - 0.3, w: 1.45, h: 0.6, fontSize: 22, bold: true, color: P.gold, valign: 'middle' });
    text(s, [{ text: 'The indented lines repeat. ', options: { bold: true, color: P.gold } },
      { text: 'Change 4, and they repeat a different number of times.' }],
      { x: 6.35, y: 5.75, w: 6.38, h: 0.95, fontSize: 21, valign: 'middle' });
  });
  addIcon(s, 'info');
  s.addNotes(`(Lines 1–2, import and make the turtle, are left off here: they don't change.)
Before click 1, ask: "How do you draw a square with the turtle?" Forward, turn, four times over: eight lines.
Click 1: the same two lines, four times. Copying lines is slow, and easy to get wrong: miss one turn and the square breaks.
Click 2: a for loop says it once. for i in range(4): repeats the indented lines 4 times. It's the same colon and the same indent as your while loops last lesson; what's new is that it counts for you.
This is the beacon program from today's activity: lines 3 to 5.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  For loops in action: watch one run (I do), then short questions, not trace tables (Lesson 3 feedback)
// ════════════════════════════════════════════════════════════════════════════
const F1 = 'For loops in action';

// 7. Watch it run (one-off, animated): the beacon program. A gold bar steps through it one line per click,
// i's box changes, the turtle draws each side as line 4 runs and turns as line 5 runs, and a gold arrow
// shows each jump back to the for line.
{
  const s = newSlide('SZ_DARK', F1, 'Watch it run');
  const cx = 1.35, cw = 6.4;
  const cp = codePanel(s, BEACON, { x: cx, y: 1.7, w: cw, size: 24, lh: 0.74 });
  K.varBox(s, { name: 'i', type: 'int', value: '', x: 8.2, y: 1.95, w: 2.0, h: 1.0 });
  const d = { x: 8.2, y: 3.25, w: 4.53, h: 2.6 };
  display(s, d);
  const geo = { ox: d.x + d.w / 2 - 0.7, oy: d.y + 0.35 + (d.h - 0.35) / 2 + 0.7, sc: 0.014 };
  const st = simulate(times(4, [['fd', 100], ['lt', 90]]), geo);
  // One step per click: the line that runs, and what it does
  const steps = [{ line: 1 }, { line: 2, pose: [geo.ox, geo.oy, 0] }];
  for (let r = 0; r < 4; r++) {
    steps.push({ line: 3, i: String(r), back: r > 0 },
      { line: 4, seg: st[2 * r].line, pose: st[2 * r].pose },
      { line: 5, pose: st[2 * r + 1].pose });
  }
  const nextAfter = (i, key) => { const j = steps.findIndex((x, k) => k > i && x[key] !== undefined); return j < 0 ? undefined : j + 1; };
  steps.forEach((stp, i) => {
    const k = i + 1, last = k === steps.length;
    onClick(s, k, () => {
      runBar(s, cp, cx, cw, stp.line);
      if (stp.back) backArrow(s, cp, cx, 5, 3);
    }, last ? undefined : k + 1);
    if (stp.i !== undefined) onClick(s, k, () => text(s, stp.i, { x: 8.3, y: 2.15, w: 1.8, h: 0.75, fontFace: MONO, fontSize: 32,
      color: P.off, align: 'center', valign: 'middle' }), nextAfter(i, 'i'));
    if (stp.seg) onClick(s, k, () => seg(s, ...stp.seg));
    if (stp.pose) onClick(s, k, () => turtleAt(s, ...stp.pose), nextAfter(i, 'pose'));
  });
  onClick(s, steps.length + 1, () => R.banner(K, s, [{ text: 'range(4) gives 0, 1, 2, 3. ', options: { bold: true, color: P.gold } },
    { text: 'Four times round: lines 4 and 5 run 4 times.' }], 6.0, 0.7, 22));
  R.modeChip(K, s, 'I DO');
  addIcon(s, 'info');
  s.addNotes(`I DO — the whole program, one line per click (15 clicks). Students just watch; you narrate every click in the same words.
Before click 1, point at the shape: for, a name (i), in range(4), a colon; the indented lines are the body, like a while.
1 "import turtle." 2 "Make the turtle t." It appears facing right.
3 "for i in range(4): i gets the first number from range(4): 0." The box shows 0.
4 "t.forward(100): the first side." 5 "t.left(90): turn. End of the body…"
6 The gold arrow: "…so BACK TO THE FOR LINE. i gets the next number: 1." 7–8: side two, turn.
9 "Back up: i is 2." 10–11. 12 "Back up: i is 3." 13–14: the last side and turn.
15 The takeaway. Ask: "Why does i stop at 3, not 4?" range(4) gives four numbers, starting at 0 and stopping BEFORE 4.
Compare with last lesson: no counter to set up, no n = n + 1, no condition to get wrong. for counts for you.`);
}

// 8. We do: one change, the count (range(3)): only things the class has just seen (README 2026-11-05). Three questions
// on boards, one answer per click.
{
  const s = newSlide('SZ_DARK', F1, 'One change: range(3)');
  const code = ['import turtle', 't = turtle.Turtle()', 'for i in range(3):', '    t.forward(100)', '    t.left(90)'];
  const cp = codePanel(s, code, { x: M, y: 1.7, w: 5.7, size: 22, lh: 0.66 });
  // the one change, marked in the code
  s.addShape(K.pres.shapes.RECTANGLE, { x: M + 3.12, y: cp.ys[2] - cp.lh / 2 + 0.05, w: 0.32, h: cp.lh - 0.1,
    fill: { type: 'none' }, line: { color: P.gold, width: 2 } });
  const qx = 6.65, qw = 6.08;
  const qs = [['How many times round?', '3'], ['What is in i, the last time round?', '2']];
  qs.forEach(([q, a], j) => {
    const y = 1.7 + j * 0.8;
    badge(s, j + 1, qx, y + 0.11, 0.44);
    text(s, q, { x: qx + 0.6, y, w: qw - 1.6, h: 0.66, fontSize: 20, valign: 'middle' });
    onClick(s, j + 1, () => text(s, a, { x: qx + qw - 0.9, y, w: 0.9, h: 0.66, fontFace: MONO, fontSize: 32, bold: true,
      color: P.ok, align: 'center', valign: 'middle' }));
  });
  badge(s, 3, qx, 3.41, 0.44);
  text(s, 'Sketch what it draws', { x: qx + 0.6, y: 3.3, w: qw - 0.6, h: 0.66, fontSize: 20, valign: 'middle' });
  const d = { x: qx, y: 4.05, w: qw, h: 1.75 };
  display(s, { ...d, label: '' });
  const geo = { ox: d.x + d.w / 2 - 0.6, oy: d.y + 1.47, sc: 0.012 };
  onClick(s, 3, () => drawAll(s, times(3, [['fd', 100], ['lt', 90]]), geo, 0.26));
  R.banner(K, s, [{ text: 'On your board: ', options: { bold: true, color: P.gold } },
    { text: 'answer 1, then 2, then 3. Boards up after each one.' }], 6.0, 0.7, 22);
  R.modeChip(K, s, 'WE DO');
  addIcon(s, 'practice');
  s.addNotes(`WE DO — the beacon program with ONE change: range(3) instead of range(4) (outlined). Boards up after each question, THEN click.
1 → 3: range(3) means 3 times round.
2 → 2: i is 0, 1, 2. The last time round it's 2, not 3. (The most common slip.)
3 → three sides of the square, with the last side missing: the turtle ends at the top left, facing down.
Ask: "Which lines repeat?" (4 and 5: they're indented.) "What would make it a square again?" (range(4).)`);
}

// 9–10. You do: three short programs, then the answers. Card 1 is sketched, cards 2–3 are written.
const YOU = [
  { code: ['import turtle', 't = turtle.Turtle()', 'for i in range(2):', '    t.forward(100)', '    t.left(90)'],
    draw: times(2, [['fd', 100], ['lt', 90]]), why: '2 times round: two sides' },
  { code: ['for i in range(3):', '    print(i)'], out: ['0', '1', '2'], why: 'starts at 0, stops before 3' },
  { code: ['for i in range(4):', '    print("Beacon")', 'print("Sent")'], out: ['Beacon', 'Beacon', 'Beacon', 'Beacon', 'Sent'],
    why: 'Sent isn’t indented: once' },
];
function youDo(reveal) {
  const s = newSlide('SZ_DARK', F1, reveal ? 'What does it do? — answers' : 'What does it do? Your turn');
  const tw = 3.84, gx = 0.3, y = 1.65, th = 4.5;
  YOU.forEach((it, i) => {
    const x = M + i * (tw + gx);
    box(s, { x, y, w: tw, h: th, fill: P.panel, line: P.line, r: 0.08 });
    badge(s, i + 1, x + 0.15, y + 0.15, 0.4);
    text(s, reveal ? it.why : (it.draw ? 'Sketch it' : 'Write what it prints'),
      { x: x + 0.65, y: y + 0.12, w: tw - 0.8, h: 0.46, fontSize: 18, color: reveal ? P.off : P.muted, valign: 'middle' });
    const cp = codePanel(s, it.code, { x: x + 0.15, y: y + 0.7, w: tw - 0.3, size: 16, lh: 0.4 });
    const ay = y + 0.7 + cp.h + 0.15, ah = y + th - 0.15 - ay;
    if (!reveal) {
      text(s, '?', { x, y: ay, w: tw, h: ah, fontFace: MONO, fontSize: 44, bold: true, color: P.dim, align: 'center', valign: 'middle' });
    } else if (it.draw) {
      display(s, { x: x + 0.15, y: ay, w: tw - 0.3, h: ah, label: '' });
      drawAll(s, it.draw, { ox: x + tw / 2 - 0.45, oy: ay + ah / 2 + 0.45, sc: 0.009 }, 0.24);
    } else {
      K.terminal(s, it.out, { x: x + 0.15, y: ay, w: tw - 0.3, size: 16, lh: 0.3, label: 'OUTPUT' });
    }
  });
  if (!reveal) {
    R.banner(K, s, [{ text: 'On your board: ', options: { bold: true, color: P.gold } },
      { text: 'sketch 1, write what 2 and 3 print.' }], 6.3, 0.6, 21);
    K.timer(s, '3 MIN'); R.modeChip(K, s, 'YOU DO', true); addIcon(s, 'practice');
  } else addIcon(s, 'feedback');
  return s;
}
youDo(false).addNotes(`YOU DO — silent, 3 minutes. Boards up together on 3-2-1.
Card 1 is a drawing: sketch it. Cards 2 and 3 print: write exactly what appears, one line each.`);
youDo(true).addNotes(`Go through any the class split on.
1: range(2) → only 2 times round: forward, left, forward, left. Two sides of the square: a corner, with the turtle facing left at the end.
2: 0, 1, 2. Not 1, 2, 3 and not 0 to 3: range(3) starts at 0 and stops BEFORE 3. Still 3 numbers.
3: Beacon four times, then Sent ONCE. Only the indented line repeats; Sent is after the loop. In the activity, a turn that isn't indented has the same effect on a drawing.`);

// ════════════════════════════════════════════════════════════════════════════
//  The activity
// ════════════════════════════════════════════════════════════════════════════
const A = 'Distress Signal';
// Story so far: right before the chapter card that sends the class to the activity (Lesson 3 feedback).
R.storySoFarSlide(K, {
  section: A, title: 'Distress Signal', logLabel: 'NAVIGATION',
  log: ['You made it through the airlock.', 'The storm has wiped the beacon program.', 'Without it, no one can find you.'],
  notes: `Read it aloud in 20 seconds, then into the chapter card and the activity. The story so far, for anyone who missed Lesson 3.
It leaves out earlier choices (the seals, the power, who's hurt): they differ from student to student, and the activity's own "Previously…" recap covers them.
Link it: the beacon draws shapes, and every shape is a loop.`,
});

R.chapterSlide(K, {
  section: A, kicker: 'CHAPTER 4', title: 'Distress Signal', activity: 'Distress Signal', time: '≈30 MIN', logLabel: 'NAVIGATION',
  log: ['Navigation is dark.', '', 'Each shape the beacon draws', 'is a different message.', '', 'Something else is aboard.'],
  note: [{ text: 'Three calls again: ', options: { bold: true, color: P.gold } },
    { text: 'in Investigate, Modify and Make. They change the story, not your score.' }],
  notes: `Students open "Distress Signal — For Loops" from Google Classroom (Y9 › Python › Lesson 4).
Predict (4 questions on the beacon program: what it draws, the values of i, which lines repeat, the total turn; the "How for works" card appears after question 2) → Run (three runs, each followed by a question; i is in the Memory box) → Investigate (4 steps: range(8) draws the square twice; a triangle with range(3) and 120°, then turn = 360 ÷ sides; print(i) and range(1, 4); then Break it: the turn moves out of the loop, a straight line and NO error message) → Modify (4 steps: the signal choice, a hexagon or an octagon with the code given; red and pensize(3) with the code given; a pentagon at the bottom; the number of sides from int(input())) → Make (the flare: ask for a colour, draw any regular shape in it, plus the flare call).
The Beacon display draws in step with the code. Black lines show green on it (the page says so). When the code has no print or input, the display takes the output panel's place.
The three calls: Investigate step 1 opens with the CRISIS — the storm is dragging the station down. Hold the orbit (the cryo pods drop to reserve power) or keep the pods powered (the orbit decays). Either way only a FAST ship beats the countdown. Modify 1: MAYDAY (fast, medics) or QUARANTINE (slower, containment). Make: a warning flare or a medical flare — the better call covers what the ship's reply is missing. Don't tell them that.
Circulate. In Investigate step 2, the chain asks for 360 ÷ sides: send stuck students back to the square (4 × 90 = 360).
Stop the class before Modification 4 (next slide).
Fast finishers: the Make extension (a growing starburst: i in the distance).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Before Modify 4 — a mid-activity stop. range() with a variable first appears in Modification 4 (no code
//  given there), so it's taught here, on a non-turtle example, when the class reaches Modify.
// ════════════════════════════════════════════════════════════════════════════
const B = 'Before Modify 4';
const BEEP = ['n = int(input("Beeps? "))', 'for i in range(n):', '    print("Beep")'];
R.predictSlide(K, {
  section: B, title: 'range() can take a variable', code: BEEP, inputs: [['Beeps?', '3']],
  prompt: [{ text: 'On your board: ', options: { bold: true, color: K.P.gold } }, { text: 'what does it print? Then: what if they type 5?' }],
  time: '1 MIN',
  notes: `The mid-activity stop: everyone looks up, whatever step they're on.
int(input()) is from Lessons 2 and 3: the user types 3, int() makes it the number 3, and it goes in the box n.
New: range(n). The number of times round doesn't have to be written in the code: it can come from a variable, so the USER decides.
Boards up after a minute.`,
});
R.predictRevealSlide(K, {
  section: B, title: 'range(n): n decides how many times', code: BEEP, hl: [2],
  output: [[{ text: 'Beeps? ', color: P.muted }, { text: '3', color: P.str, bold: true }], 'Beep', 'Beep', 'Beep'],
  mistakes: [
    { head: 'Type 5 → 5 Beeps', headMono: false, headColor: P.gold, text: 'The same code, a different number of times round.' },
    { head: 'range("3") crashes', text: 'range() needs a number: keep the int() round the input().' },
  ],
  notes: `3 Beeps. Type 5 and the same code beeps 5 times: n decides.
Without int(), n holds the TEXT "3", and range(n) stops with a TypeError ('str' object cannot be interpreted as an integer).
Modification 4 uses exactly this: ask how many sides, then the loop runs that many times. Remember what each turn has to be: 360 ÷ the number of sides (Investigate step 2). That's all the help on the slides: the step itself has no code.`,
});
R.chapterSlide(K, {
  section: B, kicker: 'CHAPTER 4  ·  BACK IN', title: 'Distress Signal', activity: 'Distress Signal', time: '≈15 MIN', logLabel: 'NAVIGATION',
  log: ['The beacon is sending.', '', 'The ship needs to know', 'how many sides', 'the next signal has.'],
  note: [{ text: 'Carry on from where you were. ', options: { bold: true, color: P.gold } },
    { text: 'Modification 4 asks for the number of sides, with int(input()).' }],
  notes: `Back to the activity. Leave this up while students work.
Modification 4 has no code: ask for the sides with int(input()), use it in range(), and turn 360 / sides. It's tested with two numbers, such as 7 then 3.
Make: the flare. Ask for a colour with input(), draw any regular shape in it with a for loop, then make the flare call.
Fast finishers: the extension (a growing starburst).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Feedback after the activity: the logic error (Investigate's bug step)
// ════════════════════════════════════════════════════════════════════════════
const FB = 'Feedback';
{
  const s = newSlide('SZ_DARK', FB, 'A bug with no error message');
  const code = ['import turtle', 't = turtle.Turtle()', 'for i in range(4):', '    t.forward(100)', 't.left(90)'];
  const cp = codePanel(s, code, { x: M, y: 1.7, w: 5.6, size: 22, lh: 0.62, hl: [5] });
  text(s, '← not indented', { x: M + 2.6, y: cp.ys[4] - cp.lh / 2, w: 2.9, h: cp.lh, fontSize: 18, bold: true, color: P.gold,
    valign: 'middle' });
  const d = { x: 6.55, y: 1.7, w: 6.18, h: cp.h - 1.3 };
  display(s, d);
  drawAll(s, [...times(4, [['fd', 100]]), ['lt', 90]], { ox: d.x + 0.5, oy: d.y + d.h / 2 + 0.3, sc: 0.0128 }, 0.28);
  K.terminal(s, ['No error. Every line ran.'], { x: d.x, y: d.y + d.h + 0.2, w: d.w, size: 18, label: 'OUTPUT' });
  R.banner(K, s, [{ text: 'A logic error: ', options: { bold: true, color: P.gold } },
    { text: 'the program runs, but does the wrong thing. The indent decides what repeats.' }], 5.75, 0.9, 22);
  addIcon(s, 'feedback');
  s.addNotes(`Whole-class feedback after the activity — this was the Break it step in Investigate (there it was the triangle).
Ask: "Which lines repeat?" (Only line 4: line 5 is at the left edge, so it's AFTER the loop.) "So what does the turtle do?" Forward 100, four times: one straight line, 400 long. Then ONE turn, at the end.
This is the first bug this year with no red error message. Python can't know what you MEANT: every line is valid. That's a logic error. The debugging recipe starts from an error message, so here you start from what you expected: compare the drawing with the shape you wanted.
The fix: indent t.left(90) under t.forward(100), so it's back in the loop.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Plenary (while or for? links Lessons 3 and 4) and the beat into Chapter 5
// ════════════════════════════════════════════════════════════════════════════
K.beat('L5'); // the cliffhanger: lights out, then hull cracks and the red alarm (Chapter 5: The Drone)
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Write a for loop that draws a triangle (3 sides, each turn 120°).',
    'while or for? (a) keep asking until the code is right  (b) draw 8 sides'],
  cliff: [{ text: 'RESCUE SHIP: "WE’RE READING ' }, { text: 'TWO', color: P.gold, bold: true }, { text: ' LIFE SIGNS MOVING ABOARD."' }],
  notes: `Exit task on whiteboards or a sticky note.
1. for i in range(3): / (indented) t.forward(100) / (indented) t.left(120). Check both lines are indented, and the turn is 120 (360 ÷ 3).
2. (a) while: you don't know how many tries it will take. (b) for: you know it's 8 times. "When you know how many times, for is the tidy way to count."
Close the story: "The rescue ship has your signal. Then it sends one more line: your beacon says one survivor awake, but they're reading TWO life signs moving aboard."
Quick hands-up: "Who sent MAYDAY? Who sent QUARANTINE?" Don't say which was better — later lessons answer that.
In Slide Show this slide fades in through black and the hull cracks creep in by themselves: Chapter 5's state, which Lesson 5's deck opens with.`,
});

K.write(OUT);
