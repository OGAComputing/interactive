// Y9 Python — Station Zero deck TEMPLATE: one example of every slide type, in lesson order,
// each labelled with its recipe and with guidance in its speaker notes. The rules slides are
// read from README.md's "Rules and feedback log", so new feedback only goes in one place.
//
//   node build_template.cjs   → Y9_Python_Deck_Template.pptx

const fs = require('fs');
const path = require('path');
const { createDeck } = require('./sz_kit.cjs');
const R = require('./sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'Y9_Python_Deck_Template.pptx');
const K = createDeck({ title: 'Station Zero — Y9 Python deck template', footerText: 'STATION ZERO  ·  Y9 PYTHON  ·  DECK TEMPLATE' });
const { P, M, HEAD, MONO, newSlide, addIcon, text, box, badge, terminal, templateNote } = K;

// ── Rules and feedback log, from README.md ──────────────────────────────────
const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
const logPart = (readme.split(/^## Rules and feedback log\s*$/m)[1] || '').split(/^## /m)[0];
const plain = (t) => t.replace(/\*\*|`/g, '');
const RULES = logPart.split('\n').filter((l) => l.startsWith('- ')).map((l) => {
  const m = l.match(/^- \*\*(.+?)\s·\s(.+?)\*\*\s—\s(.+)$/);
  return m ? { date: m[1], topic: m[2], text: plain(m[3]) } : { date: '', topic: '', text: plain(l.slice(2)) };
});

// ════════════════════════════════════════════════════════════════════════════
//  Guide slides
// ════════════════════════════════════════════════════════════════════════════
R.titleSlide(K, {
  section: 'How to use', kicker: 'Y9 PYTHON  ·  LESSON DECKS', title: 'Deck template', subtitle: 'One example of every slide type',
  status: ['SLIDE TYPES ...... 14', `RULES ............ ${RULES.length}`, 'SOURCE ........... README.md', [{ text: '> _' }]],
  statusLabel: 'TEMPLATE',
  notes: `This deck is a reference, not a lesson. It shows one example of every Station Zero slide type, in lesson order.
Each example's footer names its recipe (the function in sz_slides.cjs), and its speaker notes say when to use it and what to watch for.
Rules and feedback live in README.md (same folder). Rebuild this deck with: node build_template.cjs`,
});

{
  const s = newSlide('SZ_DARK', 'How to use', 'How to use this template');
  const cards = [
    ['Look', 'Each example is labelled in its footer with the slide type. Its speaker notes say when to use it.'],
    ['Build', 'Copy build_deck.cjs, change only the content, then run node to make the .pptx.'],
    ['Feed back', 'Add feedback to the log in README.md. Rebuild this template and it appears on the rules slides.'],
  ];
  const cw = 3.87, cg = 0.26;
  cards.forEach(([h, t], i) => {
    const x = M + i * (cw + cg);
    box(s, { x, y: 1.75, w: cw, h: 4.4, fill: P.panel, r: 0.08 });
    badge(s, i + 1, x + 0.3, 2.05, 0.6);
    text(s, h, { x: x + 0.3, y: 2.85, w: cw - 0.6, h: 0.6, fontFace: HEAD, fontSize: 28, bold: true, color: P.gold });
    text(s, t, { x: x + 0.3, y: 3.55, w: cw - 0.6, h: 2.3, fontSize: 20, valign: 'top' });
  });
  templateNote(s, 'GUIDE');
  s.addNotes(`Files (all in _presentations/Y9_Python/):
- README.md: the rules, the feedback log and the list of slide types.
- sz_slides.cjs: one function per slide type ("recipe").
- sz_kit.cjs: the drawing parts (palette, code panels, variable boxes, badges).
- build_deck.cjs: Lesson 1. Copy it for a new lesson.
Needs: npm install -g pptxgenjs. Close the .pptx in PowerPoint before rebuilding.`);
}

{
  const s = newSlide('SZ_DARK', 'How to use', 'Slide order');
  const steps = [
    ['recall', 'Recap & Recall', 'light'], ['recall', 'Answers', 'dark'], [null, 'Title', 'story'],
    ['clarity', 'Topic + lesson question', ''], [['info', 'practice', 'feedback'], 'Lesson content', 'repeat'],
    ['recall', 'Plenary', 'exit task'],
  ];
  const cw = 1.86, cg = 0.19, y = 1.9;
  steps.forEach(([icon, name, sub], i) => {
    const x = M + i * (cw + cg);
    box(s, { x, y, w: cw, h: 3.0, fill: P.panel, r: 0.08 });
    if (Array.isArray(icon)) icon.forEach((k, j) => addIcon(s, k, { x: x + 0.13 + j * 0.55, y: y + 0.3, d: 0.5 }));
    else if (icon) addIcon(s, icon, { x: x + cw / 2 - 0.4, y: y + 0.25, d: 0.8 });
    else badge(s, 'T', x + cw / 2 - 0.4, y + 0.25, 0.8, P.charcoal, P.gold);
    text(s, String(i + 1), { x: x + 0.15, y: y + 1.25, w: 0.5, h: 0.4, fontSize: 14, bold: true, color: P.dim });
    text(s, name, { x: x + 0.15, y: y + 1.6, w: cw - 0.3, h: 0.8, fontSize: 19, bold: true, valign: 'top' });
    if (sub) text(s, sub, { x: x + 0.15, y: y + 2.45, w: cw - 0.3, h: 0.35, fontSize: 14, color: P.muted, italic: true });
    if (i < steps.length - 1) K.arrow(s, x + cw + 0.01, y + 1.5, x + cw + cg - 0.01, y + 1.5, P.gold);
  });
  const legend = [['recall', 'Recap & Recall'], ['clarity', 'Clarity'], ['info', 'New information'],
    ['practice', 'Deliberate practice'], ['feedback', 'Feedback']];
  legend.forEach(([k, n], i) => {
    const x = M + i * 2.45;
    addIcon(s, k, { x, y: 5.4, d: 0.5 });
    text(s, n, { x: x + 0.6, y: 5.4, w: 1.8, h: 0.5, fontSize: 16, color: P.muted, valign: 'middle' });
  });
  templateNote(s, 'GUIDE');
  s.addNotes(`Lesson content repeats New Information → Deliberate Practice → Feedback as often as the lesson needs, with a chapter card before each activity.
Every slide carries exactly one pillar icon, top right (the title and chapter cards are story slides: the chapter card counts as Deliberate Practice).`);
}

// Rules: 5 per slide
for (let p = 0; p < RULES.length; p += 5) {
  const page = RULES.slice(p, p + 5);
  const s = newSlide('SZ_DARK', 'How to use', RULES.length > 5 ? `Rules and feedback (${p / 5 + 1} of ${Math.ceil(RULES.length / 5)})` : 'Rules and feedback');
  page.forEach((r, i) => {
    const y = 1.6 + i * 1.0;
    box(s, { x: M, y, w: 12.13, h: 0.88, fill: P.panel, r: 0.06 });
    text(s, r.topic, { x: M + 0.25, y: y + 0.08, w: 2.6, h: 0.45, fontSize: 18, bold: true, color: P.gold, valign: 'middle' });
    text(s, r.date, { x: M + 0.25, y: y + 0.5, w: 2.6, h: 0.3, fontSize: 12, color: P.dim, valign: 'middle' });
    text(s, r.text, { x: M + 3.0, y: y + 0.04, w: 8.95, h: 0.8, fontSize: 18, valign: 'middle' });
  });
  templateNote(s, 'FROM README.md — ADD NEW FEEDBACK THERE');
  s.addNotes('These rules come from the "Rules and feedback log" in README.md. Add new feedback there (one dated line) and rebuild.');
}

// ════════════════════════════════════════════════════════════════════════════
//  Examples — one of each recipe (content from Lesson 1)
// ════════════════════════════════════════════════════════════════════════════
const EX = 'Examples';
const tag = (s, recipe, what, light) => templateNote(s, `${recipe}()  ·  ${what}`, light);
const guide = (lines) => lines.join('\n');

const RR = [
  { pill: 'Y8 · LESSON 1', q: 'What does print() do?', type: 'mcq',
    opts: ['Shows text on the screen', 'Asks the user to type', 'Saves text into a file'],
    a: 'A — it shows text on the screen', why: 'input() is the one that asks the user' },
  { pill: 'Y8 · LESSON 2', q: 'What does this print?', type: 'mcq',
    code: ['score = 5', 'score = 9', 'print(score)'], opts: ['5', '9', '14'], a: 'B — 9', why: 'the new value replaces the old one' },
  { pill: 'Y8 · LESSON 1', q: 'This line crashes. What is missing?', type: 'write',
    code: ['print("Hello)'], a: 'A closing quote mark', why: 'print("Hello")', whyMono: true },
  { pill: 'Y8 · LESSON 2', q: 'Write exactly what this prints.', type: 'write',
    code: ['name = "Sam"', 'print("Hi " + name)'], a: 'Hi Sam', why: 'the space is inside the quotes', aMono: true },
];
tag(R.recallStarter(K, { section: EX, questions: RR, notes: guide([
  'WHEN: always slide 1. Light background.',
  'RULES: 4 questions on the previous lesson and further back; each card has a pill naming its source lesson.',
  'Q1–2 multiple choice (3 options, similar lengths, the right answer not always the longest). Q3–4 need a written word or sentence.',
  'At least 3 of the 4 use a code snippet students have already met. Ask for a confidence rating 1–3.',
  'DATA: { pill, q, type: "mcq"|"write", code?, opts?, a, why }. For an MCQ, a starts with the right letter.',
]) }), 'recallStarter', 'Recap & Recall starter', true);

tag(R.recallAnswers(K, { section: EX, questions: RR, notes: guide([
  'WHEN: slide 2. Same questions as the starter; dark background.',
  'The right option turns green; each card adds a one-line "why". Discuss confident-but-wrong answers first.',
]) }), 'recallAnswers', 'Recap & Recall answers');

tag(R.titleSlide(K, {
  section: EX, kicker: 'Y9 PYTHON  ·  LESSON 1  ·  PYTHON REFRESH', title: 'Station Zero', subtitle: 'Chapter 1 — Wake Up',
  status: ['SOFTWARE ....... WIPED', 'DOORS .......... SEALED', 'CREW AWAKE ..... 1 OF 5',
    [{ text: 'POD 2 .......... ' }, { text: 'OPEN', color: P.gold, bold: true }], [{ text: '> _' }]],
  notes: guide([
    'WHEN: slide 3. Kicker = year · lesson · lesson name; title = Station Zero; subtitle = this chapter.',
    'The status readout is the only story text: short LABEL ..... VALUE lines. Tell the premise aloud from the notes, never as a paragraph on the slide.',
  ]),
}), 'titleSlide', 'Title');

tag(R.questionsSlide(K, {
  section: EX, topic: 'How do we write programs that make decisions, repeat and reuse code?',
  lesson: 'How do we ask for, store and calculate with what a user types?',
  notes: guide([
    'WHEN: slide 4. The topic question is the same all unit (muted); the lesson question is this lesson only (highlighted).',
    'Reuse the exact lesson question on the plenary slide.',
  ]),
}), 'questionsSlide', 'Topic + lesson question');

tag(R.labelledLinesSlide(K, {
  section: EX, title: 'Ask → store → join → output',
  lines: [
    { code: 'name = input("Name? ")',
      labels: [{ n: 2, text: 'Store', from: 0, to: 6 }, { n: 1, text: 'Ask', from: 7, to: 22 }],
      results: [{ n: 1, terminal: [[{ text: 'Name? ' }, { text: 'Riley', color: P.str, bold: true }]] },
        { n: 2, var: { name: 'name', type: 'str', value: '"Riley"', size: 26 } }] },
    { code: 'print("Hi " + name)',
      labels: [{ n: 4, text: 'Output', from: 0, to: 5 }, { n: 3, text: 'Join', from: 6, to: 18 }],
      results: [{ n: 3, var: { type: 'str', value: '"Hi Riley"' } }, { n: 4, terminal: ['Hi Riley'] }] },
  ],
  notes: guide([
    'WHEN: introducing sub-goals (the steps of a recipe) on real code.',
    'RULES: whole lines only — never fragments like input(…) (feedback 2026-10-08). Up to 2 lines.',
    'Each label is bracketed under the exact characters that do that step: from/to are character positions in the line.',
    'Number the labels in the order Python does them (so in line 1, Ask is 1 and Store is 2), and give each result on the right the same number.',
    'Results are a terminal (what the screen shows) or a variable box (what memory holds).',
  ]),
}), 'labelledLinesSlide', 'Whole lines with sub-goal labels');

tag(R.pairSlide(K, {
  section: EX, title: 'Quotes: the word, or what’s stored?', memory: { name: 'name', type: 'str', value: '"Riley"' },
  rows: [
    { code: 'print("name")', out: 'name', note: [{ text: 'In quotes', options: { bold: true, color: P.str } }, { text: ' → printed exactly as written' }] },
    { code: 'print(name)', out: 'Riley', note: [{ text: 'No quotes', options: { bold: true, color: P.gold } }, { text: ' → prints what’s stored inside' }] },
  ],
  notes: guide([
    'WHEN: two lines that differ by ONE thing (variation theory). Cover the outputs, ask, then reveal.',
    'Each row: code → output → a one-line rule. Optional "IN MEMORY" box shows what the variable holds.',
  ]),
}), 'pairSlide', 'Discriminating pair');

const PREDICT_CODE = ['room = input("Which room? ")', 'level = input("Which level? ")', 'print("Scanning...")',
  'print(room + " on level " + level)'];
tag(R.predictSlide(K, {
  section: EX, code: PREDICT_CODE, inputs: [['1st', 'Medbay'], ['2nd', '3']],
  prompt: [{ text: 'On your whiteboard: ', options: { bold: true, color: P.gold } }, { text: 'write the exact last line this program prints.' }],
  notes: guide([
    'WHEN: Deliberate Practice before the reveal. 4–6 lines of code, the answers the user types, one prompt, a timer.',
    'No hints on the slide. A program not taken from the activity, so the activity\'s Predict is still fresh.',
  ]),
}), 'predictSlide', 'Predict (mini-whiteboards)');

tag(R.predictRevealSlide(K, {
  section: EX, code: PREDICT_CODE, hl: [4],
  output: [[{ text: 'Which room? ' }, { text: 'Medbay', color: P.str }], [{ text: 'Which level? ' }, { text: '3', color: P.str }],
    'Scanning...', [{ text: 'Medbay on level 3', color: P.gold, bold: true }]],
  mistakes: [{ head: '✗  room on level level', headColor: P.red, text: 'No quotes → Python prints what’s stored, not the name' },
    { head: '" on level "', text: 'The spaces come from inside the quotes' }],
  notes: guide(['WHEN: straight after predictSlide. Highlight the line that made the answer; name the two most likely mistakes.']),
}), 'predictRevealSlide', 'Predict reveal');

tag(R.traceSlide(K, {
  section: EX, code: ['battery = int(input("Battery %: "))', 'battery = battery - 15', 'print("Power left: " + str(battery) + "%")'],
  typed: '80', table: { cols: ['Line', 'battery', 'Output'], colW: [1.4, 2.6, 8.13], rows: [['1', '', ''], ['2', '', ''], ['3', '', '']] },
  notes: guide([
    'WHEN: tracing (notional machine). Columns: Line, one per variable, Output. Then repeat it with reveal: { hl, side } and the rows filled in.',
  ]),
}), 'traceSlide', 'Trace table');

tag(R.turnTalkSlide(K, {
  section: EX, title: 'Join or add?', codes: ['print("5" + "5")', 'print(5 + 5)'],
  prompt: 'what does each one print — and why are they different?',
  notes: guide(['WHEN: just before new information — an attempt first makes the explanation stick. Never show the answers on this slide.']),
}), 'turnTalkSlide', 'Turn & Talk');

tag(R.debugRecipeSlide(K, {
  section: EX,
  error: ['  File "main.py", line 3', '    print("Scanning...)', '          ^',
    [{ text: 'SyntaxError: ', color: P.red, bold: true }, { text: 'unterminated string literal', color: P.red }]],
  marks: [{ n: 1, line: 3, col: 41 }, { n: 2, line: 0, col: 24 }, { n: 3, line: 1, col: 23 }],
  fix: 'print("Scanning...")',
  notes: guide([
    'WHEN: once per lesson before the activity, then flip back to it during Investigate.',
    'Use a real Python error, copied exactly. The numbered badges sit on the error itself (marks: line + column), matching the 4 fixed steps below.',
  ]),
}), 'debugRecipeSlide', 'Debugging recipe');

tag(R.chapterSlide(K, {
  section: EX, kicker: 'CHAPTER 1  ·  PART 1', title: 'Wake Up', activity: 'Wake Up', time: '≈20 MIN', logLabel: 'CRYO BAY',
  log: ['Every pod is frosted', 'over — except Pod 2.', '', 'Open. Empty.', 'Cracked from the inside.'],
  note: [{ text: 'Modification 1 is your call. ', options: { bold: true, color: P.gold } }, { text: 'It changes the story, not your score.' }],
  notes: guide([
    'WHEN: just before students open an activity. Story log: at most 3 short sentences, in green, broken into short lines.',
    'The task names the activity exactly as it appears in Google Classroom. The note line is for the story choice (Modification 1).',
  ]),
}), 'chapterSlide', 'Chapter card + task');

tag(R.errorFeedbackSlide(K, {
  section: EX, title: 'Capitals matter',
  code: ['name = input("Enter your name: ")', 'print("Access granted to " + Name)'], hl: [2],
  error: [[{ text: 'NameError: ', color: P.red, bold: true }, { text: "name 'Name' is not defined. Did you mean: 'name'?", color: P.red }]],
  memory: { name: 'name', type: 'str', value: '"Riley"' },
  takeaway: [{ text: 'Name', options: { fontFace: MONO, color: P.red, bold: true } }, { text: '  and  ' },
    { text: 'name', options: { fontFace: MONO, color: P.ok, bold: true } }, { text: '  are two different names. Python only knows the one you stored.' }],
  notes: guide(['WHEN: whole-class feedback after an activity, usually on its planted bug. Real error text; one takeaway sentence.']),
}), 'errorFeedbackSlide', 'Common error feedback');

tag(R.plenarySlide(K, {
  section: EX, lesson: 'How do we ask for, store and calculate with what a user types?',
  tasks: ['Write one line that asks how many crew are awake and stores it as a whole number in crew.',
    'Fix this line, and say why it crashed:'],
  code: 'print("Crew awake: " + crew)',
  cliff: [{ text: 'MOTION DETECTED · SENSOR OPS · TAG: ' }, { text: 'HALE', color: P.gold, bold: true }],
  notes: guide([
    'WHEN: last slide. The same lesson question as slide 4, then 2 exit tasks: one to write, one to fix.',
    'Optional one-line cliffhanger in green, to lead into the next chapter.',
  ]),
}), 'plenarySlide', 'Plenary');

K.write(OUT);
