// Y9 Python — Lesson 5 (Functions) deck, Station Zero theme, Chapter 5: The Drone.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L5.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L5_Functions.pptx beside this file. Activity: Y9/Python/L5_Functions/1_The_Drone_PRIMM.html.
// Teaching order (as Lesson 4): only what Predict, Run and Investigate need before the activity.
// After the Recap (Nick, 2026-11-17: the "while or for?" slide is gone) → one animated run of the drone program, the page's own
// code (I do, "Watch it run": define, call, jump in, carry on) → two commands (I do, the run jumps between them)
// → "Which line runs next?" (We do) → a You do of three short programs (what is printed?) → Story so far → the chapter card.
// A mid-activity stop before Modification 4 shows a loop inside a function and one function calling another
// (Modify 4's new ideas; its code is given on the page). After the activity: the NameError from the bug step
// (define before you call), then the plenary and WARDEN's cliffhanger.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L5_Functions.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 5: Functions',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 5', station: 'L5' });
const { P, MONO, M, newSlide, addIcon, text, box, arrow, codePanel, badge, onClick } = K;

const LESSON_Q = 'How do we name lines of code, then run them by name?';

// A gold bar on the line that runs now (as in Lesson 4's "Watch it run").
const runBar = (s, cp, x, w, n) => s.addShape(K.pres.shapes.RECTANGLE, { x: x + 0.06, y: cp.ys[n - 1] - cp.lh / 2,
  w: w - 0.12, h: cp.lh, fill: { color: P.gold, transparency: 82 }, line: { color: P.gold, width: 2 } });
const hline = (s, x1, x2, y, color, width = 2.5) => s.addShape(K.pres.shapes.LINE, { x: Math.min(x1, x2), y, w: Math.abs(x2 - x1), h: 0, line: { color, width } });
const vline = (s, x, y1, y2, color, width = 2.5) => s.addShape(K.pres.shapes.LINE, { x, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1), line: { color, width } });
const label = (s, t, x, y, w = 4) => text(s, t, { x, y, w, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
// An output panel whose lines appear one at a time: draw the empty panel, then outLine(k, i, text) on click k.
function outPanel(s, { x, y, w, h, size = 22, lh = 0.48 }) {
  box(s, { x, y, w, h, fill: P.outBg, line: P.line, r: 0.08 });
  label(s, 'OUTPUT', x + 0.25, y + 0.15, w - 0.5);
  return (k, i, t) => onClick(s, k, () => text(s, t, { x: x + 0.25, y: y + 0.55 + i * lh, w: w - 0.5, h: lh, fontFace: MONO,
    fontSize: size, color: P.off, valign: 'middle' }));
}

const DRONE = ['def drone_status():', '    print("DRONE ONLINE")', '    print("Battery: 100%")', '', 'drone_status()'];

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (Lesson 3: a while loop's count; Lesson 2: >=; Lesson 1: a misspelt name; Lesson 4: the indent)
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'LESSON 3', q: 'How many times does the loop run?', type: 'mcq',
    code: ['n = 0', 'while n < 3:', '    n = n + 1'], opts: ['2', '3', '4'],
    a: 'B — 3', why: 'n is 0, 1, 2; at 3 it stops' },
  { pill: 'LESSON 2', q: 'x holds 7. Which one is True?', type: 'mcq', optsMono: true,
    opts: ['x > 7', 'x >= 7', 'x == "7"'], a: 'B — x >= 7', why: '7 is equal to 7; "7" is text' },
  { pill: 'LESSON 1', q: 'NameError. Fix line 2.', type: 'write',
    code: ['score = 5', 'print(scroe)'], a: 'print(score)', why: 'the name must match exactly', aMono: true },
  { pill: 'LAST LESSON', q: 'What is printed?', type: 'write',
    code: ['for i in range(2):', '    print("Ping")', 'print("Sent")'], a: 'Ping Ping Sent', why: 'Sent isn’t indented, so it runs once', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 5 minutes, silent, no notes. Mini-whiteboards or books.
Q1 is from Lesson 3, Locked In: how many times a while loop repeats. Q2 (>=) is from Lesson 2, Q3 from Lesson 1, Q4 from last lesson, Distress Signal: which lines repeat.
Q1–2 are multiple choice (everyone commits to an answer). Q3 is the easy one: everyone can spot the typo. Q4 needs a written answer.
Confidence rating 1–3 next to each answer — confident-but-wrong is the one most worth correcting.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Reveal and self-mark. Hands up for "confident and wrong" on each.
Q1: trace n. 0 < 3, so round once: n becomes 1. 1 < 3: round again, n becomes 2. 2 < 3: round a third time, n becomes 3. Now 3 < 3 is False, so it stops: 3 times. The common slip is 4 (thinking it also runs when n is 3).
Q2: >= means "greater than or equal to": 7 >= 7 is True. 7 > 7 is False, and x == "7" compares the number with TEXT, so it's False.
Q3: scroe isn't a name Python knows, so it stops with a NameError. Keep that error in mind: today you'll meet it again, for a different reason.
Q4: Ping twice (indented, so it repeats), then Sent once (after the loop).` });

// ════════════════════════════════════════════════════════════════════════════
//  Title, questions
// ════════════════════════════════════════════════════════════════════════════
// Station state: Lesson 4 ended on Chapter 5's hull breach (L5), so the story picks up there as a beat.
K.beat('L5');
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 5  ·  FUNCTIONS', title: 'Station Zero', subtitle: 'Chapter 5 — The Drone',
  status: ['HULL ............ BREACH', 'LIFE SIGNS ...... TWO MOVING',
    [{ text: 'REPAIR DRONE .... ' }, { text: 'NO COMMANDS', color: P.gold, bold: true }], 'DRONE BAY ....... DARK', [{ text: '> _' }]],
  notes: `Recap the story out loud — don't put it on screen:
"Your beacon reached the rescue ship. Then it sent one more line: your beacon says one survivor awake, but they're reading TWO life signs moving aboard. Something is in the vents."
Today you're in the drone bay. There's one small repair drone left, and the storm wiped every command it knew. A command is a set of lines with a name: write it once, and the drone can run it whenever you call it. In Python that's a function.
In Slide Show this slide fades in through black and the hull cracks creep in: let it finish before you speak.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit. Lessons 2 to 4 were decisions and repeats. Today is the last part: REUSE.
We come back to this question in the plenary.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Define, then call: watch one run (I do), then short questions, not trace tables (Lesson 3 feedback)
// ════════════════════════════════════════════════════════════════════════════
const F = 'Define, then call';

// Watch it run (animated): the page's drone program. A gold bar steps through it in the order Python runs it:
// line 1 (def: Python learns the name; nothing prints) → line 5 (the call) → up to lines 2 and 3 (they print)
// → back to after the call. "Python knows" fills on line 1; the output builds up.
{
  const s = newSlide('SZ_DARK', F, 'Watch it run');
  K.isys(s, { term: "Function", fact: "named lines of code", say: "A function is named lines of code that you can run by name." });
  const cx = 1.35, cw = 6.4;
  const cp = codePanel(s, DRONE, { x: cx, y: 1.7, w: cw, size: 24, lh: 0.74 });
  // what Python has learnt: the command's name
  const kx = 8.2, kw = 4.53;
  box(s, { x: kx, y: 1.7, w: kw, h: 1.15, fill: P.code, line: P.line, r: 0.08 });
  label(s, 'PYTHON KNOWS THE COMMAND', kx + 0.25, 1.82, kw - 0.5);
  onClick(s, 1, () => text(s, 'drone_status', { x: kx + 0.25, y: 2.17, w: kw - 0.5, h: 0.55, fontFace: MONO, fontSize: 26,
    color: P.fn, valign: 'middle' }));
  const out = outPanel(s, { x: kx, y: 3.05, w: kw, h: 1.75 });
  // 1 line 1 · 2 line 5 · 3 jump up, line 2 · 4 line 3 · 5 back after the call, takeaway
  onClick(s, 1, () => runBar(s, cp, cx, cw, 1), 2);
  onClick(s, 2, () => runBar(s, cp, cx, cw, 5), 3);
  onClick(s, 3, () => {
    runBar(s, cp, cx, cw, 2);
    const lx = cx - 0.4;   // the jump: from the call, round the left, into the first indented line
    hline(s, lx, cx, cp.ys[4], P.gold); vline(s, lx, cp.ys[4], cp.ys[1], P.gold); arrow(s, lx, cp.ys[1], cx, cp.ys[1], P.gold);
  }, 4);
  out(3, 0, 'DRONE ONLINE');
  onClick(s, 4, () => runBar(s, cp, cx, cw, 3), 5);
  out(4, 1, 'Battery: 100%');
  onClick(s, 5, () => {   // back down, round the right, to just after the call
    const rx = cx + cw - 0.12, ex = cx + 3.45;
    hline(s, cx + 5.62, rx, cp.ys[2], P.muted); vline(s, rx, cp.ys[2], cp.ys[4], P.muted); arrow(s, rx, cp.ys[4], ex, cp.ys[4], P.muted);
    R.banner(K, s, [{ text: 'def defines: nothing runs yet. ', options: { bold: true, color: P.gold } },
      { text: 'A call jumps in, runs the indented lines, then carries on.' }], 5.95, 0.75, 22);
  });
  R.modeChip(K, s, 'I DO');
  addIcon(s, 'info');
  s.addNotes(`I DO — the drone's first command, one step per click (5 clicks). Students just watch; you narrate.
Before click 1, point at the shape: def, a name, brackets, a colon; the indented lines belong to it, like the body of a loop.
1 Line 1 lights up: "def means DEFINE. Python learns a new command called drone_status and remembers the indented lines. Does anything print?" No: the output stays empty.
2 "Python skips the indented lines and goes on to line 5: drone_status() is a CALL. The name with brackets means: run it now."
3 The gold arrow: "The call jumps UP into the command." Line 2 runs: DRONE ONLINE.
4 Line 3: Battery: 100%.
5 The grey arrow: "The command is finished, so Python carries on after the call. Nothing else, so the program ends."
Ask: "What if line 5 said drone_status() twice?" (Both lines again: every call runs the whole command.) "What if there were no line 5?" (Nothing prints at all.)
This is the code from today's Predict. In the activity, Run steps through it one line per click (Next line ▶), like this.`);
}

// Two commands (I do, animated): two defs, then three calls in a different order, so the bar jumps about, and a
// print at the left edge after the last call, which runs once at the end: it isn't part of dock() (Nick,
// 2026-11-17). Each jump into a command is a gold arrow round the left; each return to the line after the call
// a grey arrow round the right. Every arrow fades when the next click starts. "Python knows" fills on the
// defs; the output builds. (Nick, 2026-11-17: an I do / We do with two functions declared, to show the run
// moving about.)
const TWO = ['def scan():', '    print("SCANNING")', '', 'def dock():', '    print("DOCKING")', '', 'dock()', 'scan()', 'dock()',
  'print("DONE")'];
// Where a line's code ends, in inches from the panel's left edge (Consolas: ~0.55 em a character).
const codeEnd = (ln, size = 22) => 0.7 + ln.length * size * 0.55 / 72;
const jumpIn = (s, cp, cx, from, to, color = P.gold) => {
  const lx = cx - 0.4;
  hline(s, lx, cx, cp.ys[from - 1], color); vline(s, lx, cp.ys[from - 1], cp.ys[to - 1], color); arrow(s, lx, cp.ys[to - 1], cx, cp.ys[to - 1], color);
};
// Back round the right, from the end of line `from` to just after the end of line `to` (lines = the code).
const backOut = (s, cp, cx, cw, lines, size, from, to, color = P.muted) => {
  const rx = cx + cw - 0.12;
  hline(s, cx + codeEnd(lines[from - 1], size) + 0.15, rx, cp.ys[from - 1], color); vline(s, rx, cp.ys[from - 1], cp.ys[to - 1], color);
  arrow(s, rx, cp.ys[to - 1], cx + codeEnd(lines[to - 1], size) + 0.15, cp.ys[to - 1], color);
};
{
  const s = newSlide('SZ_DARK', F, 'Two commands: watch it jump');
  K.isys(s, { term: "Call", fact: "run it by name", say: "To call a function is to run it by name." });
  const cx = 1.35, cw = 6.4, size = 21;
  const cp = codePanel(s, TWO, { x: cx, y: 1.6, w: cw, size, lh: 0.49 });
  const kx = 8.2, kw = 4.53;
  box(s, { x: kx, y: 1.6, w: kw, h: 1.45, fill: P.code, line: P.line, r: 0.08 });
  label(s, 'PYTHON KNOWS', kx + 0.25, 1.72, kw - 0.5);
  ['scan', 'dock'].forEach((n, i) => onClick(s, i + 1, () => text(s, n, { x: kx + 0.25, y: 2.05 + i * 0.45, w: kw - 0.5, h: 0.45,
    fontFace: MONO, fontSize: 24, color: P.fn, valign: 'middle' })));
  const out = outPanel(s, { x: kx, y: 3.2, w: kw, h: 2.55, size: 22, lh: 0.46 });
  // the line the bar is on, and what else happens
  const steps = [
    { line: 1 }, { line: 4 }, { line: 7 },
    { line: 5, jump: [7, 5], out: 'DOCKING' },
    { line: 8, back: [5, 8] },
    { line: 2, jump: [8, 2], out: 'SCANNING' },
    { line: 9, back: [2, 9] },
    { line: 5, jump: [9, 5], out: 'DOCKING' },
    { line: 10, back: [5, 10], out: 'DONE' },
  ];
  let printed = 0;
  steps.forEach((st, i) => {
    const k = i + 1, until = k < steps.length ? k + 1 : undefined;
    onClick(s, k, () => runBar(s, cp, cx, cw, st.line), until);
    if (st.jump) onClick(s, k, () => jumpIn(s, cp, cx, ...st.jump), until);
    if (st.back) onClick(s, k, () => backOut(s, cp, cx, cw, TWO, size, ...st.back), until);
    if (st.out) out(k, printed++, st.out);
  });
  onClick(s, steps.length + 1, () => {
    box(s, { x: kx, y: 5.9, w: kw, h: 0.95, fill: P.charcoal, line: P.gold, lw: 2, r: 0.08 });
    text(s, [{ text: 'The calls decide the order, ', options: { bold: true, color: P.gold } }, { text: 'not where the defs are.' }],
      { x: kx + 0.3, y: 5.9, w: kw - 0.6, h: 0.95, fontSize: 19, valign: 'middle' });
  });
  R.modeChip(K, s, 'I DO');
  addIcon(s, 'info');
  s.addNotes(`I DO — two commands, one step per click (10 clicks). Narrate every click in the same words as Watch it run.
1 "def scan(): Python learns scan." Nothing prints.  2 "def dock(): Python learns dock." Still nothing printed: two defs, no calls yet.
3 "Line 7: the first CALL. Which command?" dock.
4 The gold arrow: "Jump UP into dock." Line 5 prints DOCKING.
5 The grey arrow: "dock is finished, so back down, to the line after the call: line 8."
6 "scan() jumps up to line 2": SCANNING. Point out it went ABOVE dock: the order on the page doesn't matter.
7 Back down to line 9.  8 "dock() again: up to line 5", DOCKING a second time. One def, two calls, two DOCKINGs.
9 Back down to line 10: DONE. Ask before you click: "Is print("DONE") part of dock()?" No: it's at the left edge, not indented, so it isn't inside any command. It runs ONCE, at the end, after the last call has finished. Only the indented lines belong to a def.
10 The takeaway. Ask: "Line 2 is above line 5. Why did DOCKING print first?" Because line 7, the first call, is dock().`);
}

// We do: which line runs next? (the Lesson 3 pattern, README 2026-11-04): two commands again, one of them two
// lines long. Each question is a click (the gold bar = the line that has just run), then a click for the answer
// (the next line outlined in green, an arrow when Python jumps, and why). Each fades when the next starts.
// Easiest first (Nick, 2026-11-17: it started too hard): a call (jump in, as in the I do) → the next line inside
// the command → the end of the command (back after the call) → the second call. "After a def, skip to the
// first call" is left to the I do and the notes.
const LIGHTS = ['def lights():', '    print("LIGHTS OFF")', '    print("DOORS LOCKED")', '', 'def alarm():', '    print("ALARM")', '',
  'lights()', 'alarm()'];
{
  const s = newSlide('SZ_DARK', F, 'Which line runs next?');
  const cx = 1.35, cw = 6.4;
  const cp = codePanel(s, LIGHTS, { x: cx, y: 1.6, w: cw, size: 22, lh: 0.53 });
  const kx = 8.2, kw = 4.53;
  box(s, { x: kx, y: 1.6, w: kw, h: 2.45, fill: P.panel, line: P.line, r: 0.08 });
  label(s, 'NEXT LINE', kx + 0.25, 1.75, 3);
  const qs = [
    { line: 8, next: 2, why: 'A call: jump up into lights()' },
    { line: 2, next: 3, why: 'The next line inside lights()' },
    { line: 3, next: 9, why: 'lights() is done: back after the call' },
    { line: 9, next: 6, why: 'Another call: jump up into alarm()' },
  ];
  const top = (n) => cp.ys[n - 1] - cp.lh / 2;
  qs.forEach((q, i) => {
    const ask = 2 * i + 1, ans = ask + 1, gone = i < qs.length - 1 ? ask + 2 : undefined;
    onClick(s, ask, () => runBar(s, cp, cx, cw, q.line), gone);
    onClick(s, ans, () => {
      s.addShape(K.pres.shapes.RECTANGLE, { x: cx + 0.06, y: top(q.next), w: cw - 0.12, h: cp.lh,
        fill: { type: 'none' }, line: { color: P.ok, width: 2.5 } });
      if (q.next < q.line) jumpIn(s, cp, cx, q.line, q.next, P.ok);
      else if (q.next - q.line > 1) {   // down past other lines: round the right
        const rx = cx + cw - 0.12;
        hline(s, cx + codeEnd(LIGHTS[q.line - 1]) + 0.15, rx, cp.ys[q.line - 1], P.ok); vline(s, rx, cp.ys[q.line - 1], cp.ys[q.next - 1], P.ok);
        arrow(s, rx, cp.ys[q.next - 1], cx + codeEnd(LIGHTS[q.next - 1]) + 0.15, cp.ys[q.next - 1], P.ok);
      }
      text(s, String(q.next), { x: kx + 0.25, y: 2.1, w: kw - 0.5, h: 0.8, fontFace: MONO, fontSize: 44, bold: true, color: P.ok, valign: 'middle' });
      text(s, q.why, { x: kx + 0.25, y: 2.9, w: kw - 0.5, h: 0.95, fontSize: 19, color: P.off, valign: 'middle' });
    }, gone);
  });
  box(s, { x: kx, y: 4.3, w: kw, h: 2.0, fill: P.charcoal, line: P.gold, lw: 2, r: 0.08 });
  text(s, [{ text: 'The gold line has just run. ', options: { bold: true, color: P.gold } },
    { text: 'On your board: the number of the line that runs next.' }], { x: kx + 0.3, y: 4.3, w: kw - 0.6, h: 2.0, fontSize: 21, valign: 'middle' });
  R.modeChip(K, s, 'WE DO');
  addIcon(s, 'practice');
  s.addNotes(`WE DO — two commands again; lights() has TWO lines. 8 clicks: a question, then its answer, four times. Easiest first.
Each question: the gold line has JUST run. Boards up with a line number, THEN click for the answer.
Q1 (line 8, the call lights()) → 2: jump up into lights(), exactly as in the I do.
Q2 (line 2 printed LIGHTS OFF) → 3: the next line, still inside lights(). Every indented line runs before Python leaves.
Q3 (line 3 printed DOORS LOCKED) → 9: that was the last line of lights(), so back to the line after the call. Not line 4 or 5: a blank line and a def are not part of lights().
Q4 (line 9, the call alarm()) → 6: jump up into alarm().
Follow-ups: "What does the whole program print?" LIGHTS OFF, DOORS LOCKED, ALARM. "Which line runs first of all?" Line 1, the def: it teaches Python the command, then Python skips the indented lines and carries on down to line 8.`);
}

// You do: three short programs, then the answers (one idea each: two calls · def runs nothing until called · no call).
const YOU = [
  { code: ['def hi():', '    print("Hi")', '', 'hi()', 'hi()'], output: ['Hi', 'Hi'], why: 'two calls: it runs twice' },
  { code: ['def a():', '    print("A")', '', 'print("B")', 'a()'], output: ['B', 'A'], why: 'a() is called last' },
  { code: ['def go():', '    print("Go")', '', 'print("Done")'], output: ['Done'], why: 'go() is never called' },
];
R.whatPrintedGridSlide(K, { section: F, title: 'What is printed? Your turn', items: YOU, time: '3 MIN',
  notes: `YOU DO — silent, 3 minutes. Boards up together on 3-2-1. Write exactly what appears, one line each.` });
R.whatPrintedGridSlide(K, { section: F, title: 'What is printed? — answers', items: YOU, reveal: true,
  notes: `Go through any the class split on.
1: Hi, Hi. Each call runs the whole command: two calls, two Hi.
2: B, then A. The def comes first, but it only DEFINES: nothing prints until a(), which is the last line.
3: only Done. go() is defined but never called, so Go never prints. In the activity, Investigate step 3 asks the same thing: "DOCKING didn't print. Why not?"` });

// ════════════════════════════════════════════════════════════════════════════
//  The activity
// ════════════════════════════════════════════════════════════════════════════
const A = 'The Drone';
// Story so far: right before the chapter card that sends the class to the activity (Lesson 3 feedback).
R.storySoFarSlide(K, {
  section: A, title: 'The Drone', logLabel: 'DRONE BAY',
  log: ['Your beacon reached the rescue ship.', 'It reads two life signs moving aboard.', 'The repair drone has no commands left.'],
  notes: `Read it aloud in 20 seconds, then into the chapter card and the activity. The story so far, for anyone who missed Lesson 4.
It leaves out earlier choices (MAYDAY or QUARANTINE, who's hurt, how far away the ship is): they differ from student to student, and the activity's own "Previously…" recap covers them.
Link it: a command is a function. Teach the drone some.`,
});

R.chapterSlide(K, {
  section: A, kicker: 'CHAPTER 5', title: 'The Drone', activity: 'The Drone', time: '≈30 MIN', logLabel: 'DRONE BAY',
  log: ['The drone bay is dark.', '', 'One small repair drone is left,', 'with no commands in it.', '', 'Something is in the vents.'],
  note: [{ text: 'Three calls again: ', options: { bold: true, color: P.gold } },
    { text: 'in Investigate, Modify and Make. They change the story, not your score.' }],
  notes: `Students open "The Drone — Functions" from Google Classroom (Y9 › Python › Lesson 5).
Predict (4 questions on drone_status(): Q1 is a guess at what def does; the def and call labels and the "How functions work" card appear after it) → Run (three runs; runs 2 and 3 wait on each line for Next line ▶, so they can follow the highlight) → Investigate (4 steps: a second call; a third print inside the function, then 3 questions in a row; def drone_dock() with no call; then Break it: a call above its def, a NameError) → Modify (4 steps that CHANGE the program: rename drone_status to the drone's job in the def AND the call; change both its messages; call it a second time; beep() with a loop inside, called inside drone_dock(), code given) → Make (the cryo-pod lookup: a menu function, a function for each of pods 1, 3 and 5, if / elif / else calling them, plus the priority line).
The three calls: Investigate step 1 opens with the CRISIS — Pod 1's heater is failing: wake Commander Okafor (he's out in the open with you) or keep him under (his pod gets colder). Modify 1: the drone scouts the ducts or guards the Cryo Bay. Make: the med kit to Okafor or replay the drone's camera. The better call covers what the last report left unsolved. Don't tell them that.
Circulate. In Modify 1, renaming only the def gives a NameError: send them back to the call at the bottom.
Stop the class before Modification 4 (next slide).
Fast finishers: the Make extension (keep looking up pods until 0), then the ★ bonus (parameters: polygon(sides)).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Before Modify 4 — a mid-activity stop. A loop inside a function, and one function calling another, first
//  appear in Modification 4 (its code is given), so they're shown here, on a non-drone example.
// ════════════════════════════════════════════════════════════════════════════
const B = 'Before Modify 4';
const STARS = ['def stars():', '    for i in range(3):', '        print("*")', '', 'def alarm():', '    stars()', '    print("ALARM")', '', 'alarm()'];
function starsSlide(reveal) {
  const s = newSlide('SZ_DARK', B, reveal ? 'One command can call another' : 'A loop inside a command');
  const cp = codePanel(s, STARS, { x: M, y: 1.65, w: 6.3, size: 22, lh: 0.5, hl: reveal ? [6] : undefined });
  const rx = 7.15, rw = 5.58;
  if (!reveal) {
    box(s, { x: rx, y: 1.65, w: rw, h: 1.3, fill: P.charcoal, line: P.gold, lw: 2, r: 0.08 });
    text(s, [{ text: 'On your board: ', options: { bold: true, color: P.gold } }, { text: 'what does it print?' }],
      { x: rx + 0.35, y: 1.65, w: rw - 0.7, h: 1.3, fontSize: 25, valign: 'middle' });
    K.timer(s, '1 MIN');
    addIcon(s, 'practice');
    return s;
  }
  const t = K.terminal(s, ['*', '*', '*', 'ALARM'], { x: rx, y: 1.65, w: rw, size: 22, label: 'OUTPUT' });
  text(s, '← runs stars() first', { x: M + 2.75, y: cp.ys[5] - cp.lh / 2, w: 3.45, h: cp.lh, fontSize: 18, bold: true,
    color: P.gold, valign: 'middle' });
  const by = 1.65 + t.h + 0.3;
  box(s, { x: rx, y: by, w: rw, h: 1.5, fill: P.charcoal, line: P.gold, lw: 2, r: 0.08 });
  text(s, [{ text: 'A call can go inside a command. ', options: { bold: true, color: P.gold } },
    { text: 'The whole loop runs every time it is called.' }], { x: rx + 0.35, y: by, w: rw - 0.7, h: 1.5, fontSize: 22, valign: 'middle' });
  addIcon(s, 'feedback');
  return s;
}
starsSlide(false).addNotes(`The mid-activity stop: everyone looks up, whatever step they're on.
Two things are new, and both are in Modification 4: a for loop INSIDE a command (it's indented twice: 4 spaces under the def, 8 under the for), and a call INSIDE another command (line 6).
Boards up after a minute.`);
starsSlide(true).addNotes(`Trace it the same way as Watch it run. Lines 1 and 5 define: nothing prints. Line 9 calls alarm(), which jumps to line 6: a call to stars(). That jumps up again, and the loop prints * three times. stars() is finished, so back to alarm(): line 7, ALARM.
Modification 4 is exactly this shape, with the code given: beep() prints BEEP 3 times, and drone_dock() calls it before DOCKING. Put def beep() ABOVE def drone_dock(), so the program still reads top to bottom.`);

R.chapterSlide(K, {
  section: B, kicker: 'CHAPTER 5  ·  BACK IN', title: 'The Drone', activity: 'The Drone', time: '≈15 MIN', logLabel: 'DRONE BAY',
  log: ['The drone is back on its rack.', '', 'Before it docks,', 'it must warn the crew.'],
  note: [{ text: 'Carry on from where you were. ', options: { bold: true, color: P.gold } },
    { text: 'Modification 4 gives you its 4 lines: watch the indents.' }],
  notes: `Back to the activity. Leave this up while students work.
Modification 4: the 4 lines tick as they're typed. The usual slip is beep() typed at the left edge, at the bottom: it then runs once on its own, not as part of docking.
Make: the cryo-pod lookup. A function for each pod, called from inside if / elif / else, and the menu function called BEFORE the question. The page has a worked example of the shape.
Fast finishers: the extension (keep looking up pods until 0), then the ★ bonus (parameters).`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Feedback after the activity: the NameError (Investigate's bug step)
// ════════════════════════════════════════════════════════════════════════════
R.errorFeedbackSlide(K, {
  section: 'Feedback', title: 'Define before you call',
  code: ['drone_dock()', '', 'def drone_dock():', '    print("DOCKING")'], hl: [1],
  error: ["NameError: name 'drone_dock' is not defined"],
  takeaway: [{ text: 'Python reads top to bottom: ', options: { bold: true, color: P.gold } },
    { text: 'a call above its def is too early. Define first, then call.' }],
  notes: `Whole-class feedback after the activity — this was the Break it step in Investigate.
Ask: "The def is RIGHT THERE on line 3. Why doesn't Python know the name?" Python reads top to bottom. On line 1 it hasn't reached the def yet, so drone_dock is a name it has never seen: the same NameError as scroe in the Do Now, for a different reason.
The fix: move the call to the bottom, below the def.
Link to Modify 1: renaming only the def (and not the call) gave the same error. The call has to use exactly the name the def gave it.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  Plenary and WARDEN's cliffhanger
// ════════════════════════════════════════════════════════════════════════════
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Write a command called siren() that prints WARNING. Then call it twice.',
    'A program has a def but prints nothing. Why?'],
  cliff: [{ text: 'WARDEN: "HALE DID NOT SAY THAT. ' }, { text: 'IT', color: P.gold, bold: true }, { text: ' DID."' }],
  notes: `Exit task on whiteboards or a sticky note.
1. def siren(): / (indented) print("WARNING") / then siren() twice at the left edge, BELOW the def. Check: colon, indent, brackets on the calls.
2. The def only defines the command: nothing runs until a line calls it. (Or the call is above the def: a NameError.)
Close the story: "At the end of the activity, every screen turned red and WARDEN spoke for the first time. It checked Hale's last log against the crew records: the last words, 'Don't trust WARD—', were never Hale's. WARDEN says the thing in Hale's body added them. It wanted you to fight WARDEN."
Ask: "Who do you trust now?" Don't answer it: Lessons 6 and 7 do.`,
});

K.write(OUT);
