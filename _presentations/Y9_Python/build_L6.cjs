// Y9 Python — Lesson 6 (Assessment) deck, Station Zero theme, Chapter 6: Systems Check.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md (rules + feedback log).
//
//   node build_L6.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L6_Assessment.pptx beside this file. Activity: Y9/Python/L6_Assessment/1_Python_Assessment.html.
// An assessment lesson, so nothing is taught before the activity that the questions test: a short Recap,
// how the assessment works (one try / check as often as you like / read the error), then the task card
// and ≈45 minutes of silent work. After it: Feedback on the two kinds of error (the lesson's ISYS
// moment), the plenary, and the breach (MTP Decisions 17–18): the cliffhanger shown to the whole class,
// so it lands even for students who never pressed 📡 Transmit. Station state L6 (clean: diagnostic
// mode), then a beat to L7 on the breach.

const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L6_Assessment.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python Lesson 6: Assessment',
  footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  LESSON 6', station: 'L6' });
const { P, M, HEAD, MONO, newSlide, addIcon, text, box, codePanel, badge } = K;

const LESSON_Q = 'What can I now do in Python on my own?';
const ACTIVITY = 'Python Assessment — Systems Check';

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (last lesson: where a call goes; Lesson 3: a while loop's count;
//  Lesson 1: a missing bracket, the easy one; Lesson 4: what a for loop prints). Kept short (4 min):
//  the assessment needs the time. Contexts differ from the assessment's own questions.
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'LAST LESSON', q: 'Where does the call go?', type: 'mcq',
    opts: ['Above its def', 'Below its def', 'Inside its def'], a: 'B — Below its def', why: 'Python must read the def first' },
  { pill: 'LESSON 3', q: 'How many times does the loop run?', type: 'mcq',
    code: ['n = 5', 'while n > 3:', '    n = n - 1'], opts: ['1', '2', '3'], a: 'B — 2', why: 'n is 5, then 4; at 3 it stops' },
  { pill: 'LESSON 1', q: 'SyntaxError. Fix the line.', type: 'write',
    code: ['print("Ready"'], a: 'print("Ready")', why: 'every ( needs its )', aMono: true },
  { pill: 'LESSON 4', q: 'What is printed?', type: 'write',
    code: ['for i in range(3):', '    print("Go")'], a: 'Go Go Go', why: 'range(3) runs the loop 3 times', aMono: true },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, time: '4 MIN', notes: `DO NOW — 4 minutes, silent, no notes. A warm-up for the assessment, so keep it brisk.
Q1 is from last lesson (The Drone), Q2 from Lesson 3 (Locked In), Q3 from Lesson 1, Q4 from Lesson 4 (Distress Signal).
Q1–2 are multiple choice; Q3 is the easy one everyone can fix; Q4 needs a written answer.
Confidence 1–3 next to each answer.` });

R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Self-mark quickly: no more than 2 minutes on this today.
Q1: Python reads from the top, so the def must come first; a call above it is a NameError.
Q2: n is 5: 5 > 3, round once, n becomes 4. 4 > 3, round again, n becomes 3. 3 > 3 is False: stop. 2 times.
Q3: the bracket opened after print is never closed.
Q4: Go, three times, each on its own line.` });

// ════════════════════════════════════════════════════════════════════════════
//  Title, questions
// ════════════════════════════════════════════════════════════════════════════
R.titleSlide(K, {
  section: 'Title', kicker: 'Y9 PYTHON  ·  LESSON 6  ·  ASSESSMENT', title: 'Station Zero', subtitle: 'Chapter 6 — Systems Check',
  status: ['RESCUE SHIP ..... IN RANGE', 'DOCKING ......... LOCKED',
    [{ text: 'SYSTEMS CHECK ... ' }, { text: 'REQUIRED', color: P.gold, bold: true }], 'WARDEN .......... WATCHING', [{ text: '> _' }]],
  notes: `Say it, don't show it:
"The rescue ship is in range. But it won't dock until every system on the station passes a check. Today, that check is you: everything you've learned about Python since Lesson 1."
Keep the story to that. Today is an assessment: the questions are plain Python, with no story in them. The score never changes the story.`,
});

R.questionsSlide(K, {
  section: 'Title', topic: 'How do we write programs that make decisions, repeat and reuse code?', lesson: LESSON_Q,
  notes: `Topic question = the whole unit. Today we find out where everyone is: there's one section for each thing we've learned.
Next lesson uses the results: everyone practises the sections they found hardest.`,
});

// ════════════════════════════════════════════════════════════════════════════
//  How the assessment works (New Information): three rules, one card each, side by side
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_DARK', 'How it works', 'How the assessment works');
  const cards = [
    ['🔒', 'Click questions', 'One try. Lock in, then it’s final.'],
    ['▶  ✓', 'Code questions', 'Check as often as you like. Best mark kept.'],
    ['💡', 'Got an error?', 'Read the last line first. Then Get help.'],
  ];
  const cw = 3.91, cg = 0.2, cy = 1.75, ch = 3.6;
  cards.forEach(([icon, head, body], i) => {
    const x = M + i * (cw + cg);
    box(s, { x, y: cy, w: cw, h: ch, fill: P.panel, line: P.line, r: 0.08 });
    text(s, icon, { x, y: cy + 0.3, w: cw, h: 0.9, fontSize: 40, align: 'center', valign: 'middle' });
    text(s, head, { x: x + 0.3, y: cy + 1.35, w: cw - 0.6, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: P.gold, align: 'center' });
    text(s, body, { x: x + 0.3, y: cy + 2.0, w: cw - 0.6, h: 1.3, fontSize: 22, align: 'center', valign: 'top' });
  });
  R.banner(K, s, [{ text: 'Stuck? Look back at your work from that lesson.', options: { bold: true, color: P.gold, breakLine: true } },
    { text: 'Any order. Finished? Open ✓ Review to check nothing is left.' }], 5.6, 1.05, 22);
  addIcon(s, 'info');
  s.addNotes(`Two minutes, then straight in. The page's Start here tab says the same, so students can look back.
Click questions (multiple choice, trace, the selection rows): ONE try. Pressing Lock in makes the answer final, then shows the right answer for a few seconds before hiding it, so nobody can copy it from a neighbour's screen.
Code questions: Run code and Check as often as they like; the best mark is kept, and full marks locks the question. Every code question has an example from a different program under its requirements (just the code; the colon fix has a one-line reminder instead): tell them to use the idea, not copy it.
Errors: read the LAST line first, then find the line number (the debugging recipe). The Get help button explains what a Python error means, but never says how to do the task.
Stuck: they can, and should, look back at their own work from earlier lessons (their Lesson 1–5 pages, their books). Each section's heading says which lesson it comes from. Today shows what they can do with what they've made, not what they remember cold.
Any order: one section per thing we've learned. A tab turns red if they skip a question and move on, so they can find it again. Review lists anything left.
Every answer saves and goes to Classroom as they work: nothing to submit.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  The task card (drawn by hand: chapterTask's P-R-I-M-M strip doesn't fit an assessment)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_COVER', 'Assessment');
  text(s, 'CHAPTER 6', { x: M, y: 0.6, w: 6, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  text(s, 'Systems Check', { x: M, y: 1.0, w: 6, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true });
  K.terminal(s, ['The rescue ship is in range.', '', 'It will not dock until', 'every system passes.', '', 'Run the check.'],
    { x: M, y: 2.35, w: 5.7, size: 20, story: true, label: 'WARDEN', h: 3.05 });
  const x = 6.75, w = 5.98;
  box(s, { x, y: 1.55, w, h: 4.85, fill: P.panel, line: P.line, r: 0.08 });
  text(s, 'YOUR TASK', { x: x + 0.35, y: 1.8, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  text(s, [{ text: 'Open ' }, { text: ACTIVITY, options: { bold: true, color: P.gold } }, { text: ' from Google Classroom' }],
    { x: x + 0.35, y: 2.15, w: w - 0.7, h: 1.2, fontSize: 24, valign: 'middle' });
  // The six sections, as numbered chips (the same numbers as the page's tabs), then the ★ bonus
  const secs = ['Errors', 'Casting', 'Selection', 'while', 'for', 'Functions', 'Bonus'];
  const pw = 0.73, pg = 0.06;
  secs.forEach((n, i) => {
    const px = x + 0.35 + i * (pw + pg);
    box(s, { x: px, y: 3.55, w: pw, h: 0.7, fill: P.charcoal, line: P.gold, r: 0.06 });
    text(s, i < 6 ? String(i + 1) : '★', { x: px, y: 3.55, w: pw, h: 0.7, fontFace: HEAD, fontSize: 26, bold: true, color: P.gold, align: 'center', valign: 'middle' });
    text(s, n, { x: px - 0.12, y: 4.3, w: pw + 0.24, h: 0.3, fontSize: 12, color: P.muted, align: 'center' });
  });
  text(s, [{ text: 'On your own, in silence.', options: { bold: true, color: P.gold, breakLine: true } },
    { text: 'Stuck? Look back at your work from that lesson.' }],
    { x: x + 0.35, y: 4.85, w: w - 0.7, h: 1.3, fontSize: 22, valign: 'middle' });
  K.chip(s, '⏱  ≈45 MIN', { x: x + w - 1.65, y: 1.78, w: 1.4, fill: P.charcoal, line: P.gold, color: P.gold, size: 14 });
  addIcon(s, 'practice');
  s.addNotes(`Students open "${ACTIVITY}" from Google Classroom (Y9 › Python › Lesson 6). It opens on its Start here tab.
Assessment conditions: silent, on their own. They may, and should, look back at their own work from earlier lessons when stuck (each section heading names its lesson): remind them of that, never of the answer. Leave this slide up.
49 marks in 6 sections: 1 Errors (5) · 2 Variables, input & casting (12) · 3 Selection with elif (7) · 4 while loops (9) · 5 for loops & turtle (8) · 6 Functions (8). The ★ bonus is extra marks outside the percentage: ★1 the cinema till (5) and ★2 a guessing game (3). It stays locked until every code question in sections 1–6 has full marks.
Each section starts with questions to click, then a guided code task with an example underneath, and ends with a Write it. If someone is stuck on code, point them at the example under the task and their own work from that lesson, nothing more.
Circulate. Watch for students who answer the click questions and skip every code task (the Y8 pattern): nudge them to try each section's first code task, worth 1 mark and guided.
At about 45 minutes, stop the class for the last slides.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Feedback after the assessment: the two kinds of error (the lesson's ISYS moment)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_DARK', 'Feedback', 'Two kinds of error');
  const cw = 5.96, gx = M + cw + 0.21;
  text(s, 'SYNTAX ERROR', { x: M, y: 1.6, w: cw, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 2 });
  const cl = codePanel(s, ['print("Ready"'], { x: M, y: 2.0, w: cw, size: 20 });
  K.terminal(s, [[{ text: "SyntaxError: '(' was never closed", color: P.red }]], { x: M, y: 2.0 + cl.h + 0.15, w: cw, size: 18, label: 'IT STOPS' });
  text(s, 'LOGIC ERROR', { x: gx, y: 1.6, w: cw, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 2 });
  const cr = codePanel(s, ['for i in range(2):', '    print("Go")', '    print("Done")'], { x: gx, y: 2.0, w: cw, size: 20 });
  K.terminal(s, ['Go', 'Done', 'Go', 'Done'], { x: gx, y: 2.0 + cr.h + 0.15, w: cw, size: 16, lh: 0.28, label: 'IT RUNS: WRONG OUTPUT' });
  R.banner(K, s, [{ text: 'No error message ', options: { bold: true, color: P.gold } }, { text: 'doesn’t mean it works. Check the output.' }], 6.02, 0.8, 24);
  K.isys(s, { term: 'Syntax error', fact: 'breaks the language rules', check: 'Which error breaks the language rules?', reverse: 'What does a syntax error do?',
    say: 'A syntax error breaks the language rules, so Python stops before it runs anything.' });
  K.isys(s, { term: 'Logic error', fact: 'runs, but wrong output', check: 'Which error runs, but gives the wrong output?', reverse: 'What happens with a logic error?',
    say: 'A logic error runs, but wrong output comes out: Done was meant to print once, after the loop.' });
  addIcon(s, 'feedback');
  s.addNotes(`After the assessment: everyone stops, screens down. These are the OCR exam words for the two errors they met today (the missing bracket in 1.3 and the missing colon in 1.5 were syntax errors; the square that came out as a straight line in section 5 was a logic error).
Left: a syntax error. The code breaks Python's rules (here, a bracket that's never closed), so Python stops and nothing runs. The error message tells you where.
Right: a logic error. Python runs every line, with no message at all, but the output is wrong: "Done" was meant to print once, at the end, but it's indented, so it's inside the loop. Ask: "Which one line would you change?" (take the indent off print("Done"), so Done prints once, after Go, Go).
The worst errors are the ones with no message: always check the output against what you meant.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  Plenary, then the breach: the cliffhanger for the whole class (MTP Decision 18)
// ════════════════════════════════════════════════════════════════════════════
R.plenarySlide(K, {
  section: 'Plenary', lesson: LESSON_Q,
  tasks: ['Which section was hardest for you? Write its number and one reason.',
    'Name one thing you can do now that you couldn’t in Year 8.'],
  notes: `Exit task on a sticky note or in books: 2 minutes.
1. Their own read of where they are. Next lesson gives each of them practice on their lowest-scoring sections, worked out from today's marks, so this is a prediction they can check.
2. Anything from this unit: elif, while loops, for loops, turtle, functions.
Then: "Everyone press 📡 Transmit on the Review tab now", and the next slide.`,
});

K.beat('L7');   // the lights go out: Chapter 7's damage creeps in on the breach
{
  const s = newSlide('SZ_COVER', 'Plenary');
  text(s, 'SYSTEMS CHECK TRANSMITTED', { x: M, y: 0.6, w: 8, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  text(s, 'Breach', { x: M, y: 1.0, w: 6, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true });
  K.terminal(s, ['The docking clamps fire', 'on their own.', '', 'The station falls', 'towards the storm.', '',
    [{ text: '"IF IT REACHES THE SHIP,', color: P.gold }], [{ text: 'IT REACHES EARTH."', color: P.gold }]],
    { x: M, y: 2.35, w: 5.7, size: 18, story: true, label: 'WARDEN' });
  const x = 6.75, w = 5.98;
  text(s, 'WHO CAN FIX IT?', { x, y: 1.55, w, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  const rows = [
    ['The storm', 'Patel · Pilot', 'steers you out'],
    ['You are hurt', 'Chen · Medic', 'patches you up'],
    ['The clamps', 'Okafor · Commander', 'takes them back'],
  ];
  rows.forEach(([prob, who, fix], i) => {
    const y = 1.95 + i * 1.32;
    box(s, { x, y, w, h: 1.15, fill: P.panel, line: P.line, r: 0.08 });
    text(s, prob, { x: x + 0.3, y: y + 0.12, w: 2.3, h: 0.9, fontFace: HEAD, fontSize: 24, bold: true, color: P.off, valign: 'middle' });
    text(s, [{ text: who, options: { bold: true, color: P.gold, breakLine: true } }, { text: fix, options: { color: P.muted } }],
      { x: x + 2.6, y: y + 0.12, w: w - 2.9, h: 0.9, fontSize: 20, valign: 'middle' });
  });
  text(s, [{ text: 'Your screen shows ', options: { color: P.off } }, { text: 'who you still have.', options: { bold: true, color: P.gold } }],
    { x, y: 5.95, w, h: 0.5, fontSize: 22, valign: 'middle' });
  addIcon(s, 'recall');
  s.addNotes(`The cliffhanger, for everyone (many won't have pressed Transmit; that's fine: nothing depends on it, and Lesson 7 retells this for every student).
In Slide Show this slide fades in through black and the damage creeps in: let it finish before you speak.
Read the log aloud: "The moment you transmit, the docking clamps fire on their own. Something in Maintenance has taken them, and it's trying to reach the rescue ship. The station lurches out of orbit, towards the storm, and you're thrown against a bulkhead. You're hurt."
Point at the right: three problems, and the one crew member who can fix each. Patel can fly you out of the storm. Chen can patch you up. Okafor's command codes can take the clamps back.
"But only if they're still alive. Look at your report: a green tick means you still have them. Your choices since Lesson 1 decided that, not today's score."
Next lesson: they fix what they can, with who they have left. Don't say more.`);
}

K.write(OUT);
