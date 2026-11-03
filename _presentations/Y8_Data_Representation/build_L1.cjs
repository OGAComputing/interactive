// Y8 Data Representation — Lesson 1 (Binary and denary) deck.
// Follows _presentations/ppt-guidelines.md §9 and this folder's README.md. Built with the Y9 kit
// (sz_kit.cjs: masters, pillar icons, click animations, Recap & Recall cards) with no story layer
// and Google fonts (Lato, Ubuntu Mono), because lessons are taught from Google Slides.
//
//   node build_L1.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: L1_Binary_And_Denary.pptx. Activity: Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html
// The deck follows the activity's tabs in order; each "Tab n" task slide sends the class to it.
//
// Cognitive load: every label sits on the grid it labels (headings above bits, working under the
// column); one step per slide or per click; worked example → we do → you do, with the support fading;
// what the teacher says lives in the notes, not on the slide.

const path = require('path');
const { createDeck } = require('../Y9_Python/sz_kit.cjs');
const R = require('../Y9_Python/sz_slides.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1_Binary_And_Denary.pptx');
const K = createDeck({ title: 'Y8 Data Representation — Lesson 1: Binary and denary',
  footerText: 'Y8 DATA REPRESENTATION  ·  LESSON 1', fonts: { head: 'Lato', body: 'Lato', mono: 'Ubuntu Mono' } });
const { P, MONO, M, W, newSlide, addIcon, text, box, chip, timer, arrow, badge, onClick } = K;

const TOPIC_Q = 'How do computers represent and process different types of data using binary?';
const LESSON_Q = 'How are denary numbers represented in binary using 1s and 0s?';
const ACTIVITY = 'Binary and Denary';
const HEADINGS = [128, 64, 32, 16, 8, 4, 2, 1];

// ════════════════════════════════════════════════════════════════════════════
//  Drawing parts for this deck
// ════════════════════════════════════════════════════════════════════════════
// A place-value grid: each heading sits directly above its digit, and any working sits directly under it.
// o: { y, heads, cells (strings; '' = blank, null = not shown yet), glow: [i], cur: [i], notes: { i: text },
//      dimNotes: [i], times: '×2' (label between headings), colW, gap, x,
//      only: true = draw just the cells and notes (a click layer over a grid already on the slide) }
const colXs = (n, colW = 1.15, gap = 0.15, x) => {
  const x0 = x ?? (W - (n * colW + (n - 1) * gap)) / 2;
  return Array.from({ length: n }, (_, i) => x0 + i * (colW + gap));
};
function grid(s, o) {
  const heads = o.heads || HEADINGS, n = heads.length;
  const colW = o.colW || 1.15, gap = o.gap ?? 0.15;
  const y = o.y ?? 2.3;
  const xs = colXs(n, colW, gap, o.x);
  const glow = new Set(o.glow || []), cur = new Set(o.cur || []);
  if (!o.only) heads.forEach((h, i) => {
    const x = xs[i];
    const hot = glow.has(i) || cur.has(i);
    if (cur.has(i)) box(s, { x: x - 0.06, y: y - 0.12, w: colW + 0.12, h: 2.45, fill: '2B2618', line: P.gold, lw: 2.5, r: 0.1 });
    else if (glow.has(i)) s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.06, y: y - 0.12, w: colW + 0.12, h: 2.45,
      rectRadius: 0.1, fill: { type: 'none' }, line: { color: P.gold, width: 2 } });
    // A highlighted heading is redrawn in gold on a solid patch, so it hides the grey one underneath.
    text(s, String(h), { x, y, w: colW, h: 0.5, fontFace: MONO, fontSize: o.headSize || 26, bold: true,
      color: hot ? P.gold : P.muted, align: 'center', valign: 'middle', fill: hot && !cur.has(i) ? { color: P.charcoal } : undefined });
    if (o.times && i > 0) text(s, o.times, { x: x - gap / 2 - 0.35, y: y - 0.5, w: 0.7, h: 0.35, fontFace: MONO, fontSize: 16,
      color: P.gold, align: 'center', valign: 'middle' });
  });
  (o.cells || []).forEach((c, i) => drawCell(s, xs[i], y + 0.6, colW, c));
  Object.entries(o.notes || {}).forEach(([i, t]) => note(s, xs[i], y, colW, t, (o.dimNotes || []).includes(+i)));
  return { xs, y, colW };
}
function drawCell(s, x, y, w, c) {
  if (c === null || c === undefined) return;
  if (c === '') {
    s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.12, y, w: w - 0.24, h: 1.0, rectRadius: 0.08,
      fill: { type: 'none' }, line: { color: P.line, width: 1.5, dashType: 'dash' } });
    return;
  }
  box(s, { x: x + 0.12, y, w: w - 0.24, h: 1.0, fill: P.code, line: P.line, r: 0.08 });
  text(s, c, { x: x + 0.12, y, w: w - 0.24, h: 1.0, fontFace: MONO, fontSize: 46, bold: true,
    color: c === '1' ? P.off : P.muted, align: 'center', valign: 'middle' });
}
function note(s, x, y, w, t, dim) {
  text(s, t, { x: x - 0.2, y: y + 1.7, w: w + 0.4, h: 0.5, fontFace: MONO, fontSize: 20, bold: true,
    color: dim ? P.dim : P.gold, align: 'center', valign: 'middle' });
}
// The cells for a binary number lined up from the right ('' for the empty headings on the left).
const cellsOf = (bits, n = 8) => Array.from({ length: n }, (_, i) => (i >= n - bits.length ? bits[i - (n - bits.length)] : ''));
const used = (bits) => [...bits].map((b, i) => (b === '1' ? 2 ** (bits.length - 1 - i) : 0)).filter(Boolean);

// One line under the grid (the question, or the sum). Big, centred.
function line(s, t, y = 5.15, o = {}) {
  text(s, t, { x: M, y, w: W - 2 * M, h: 0.7, fontSize: o.size || 30, bold: true, align: 'center', valign: 'middle',
    fontFace: o.mono ? MONO : K.BODY, color: o.color || P.off });
}
// Numbered sub-goal steps along the bottom (the steps students reuse on their own).
function steps(s, items, y = 6.15) {
  const w = (W - 2 * M - (items.length - 1) * 0.2) / items.length;
  items.forEach((t, i) => {
    const x = M + i * (w + 0.2);
    box(s, { x, y, w, h: 0.62, fill: P.panel, line: P.line, r: 0.08 });
    badge(s, i + 1, x + 0.1, y + 0.1, 0.42);
    text(s, t, { x: x + 0.62, y, w: w - 0.7, h: 0.62, fontSize: 19, valign: 'middle' });
  });
}
// Task slide: one clear task, which tab of the activity, a timer. Nothing else.
function taskSlide(o) {
  const s = newSlide('SZ_DARK', o.section, o.title);
  box(s, { x: M, y: 1.75, w: W - 2 * M, h: 4.6, fill: P.panel, line: P.line, r: 0.1 });
  text(s, 'YOUR TASK', { x: M + 0.5, y: 2.05, w: 4, h: 0.35, fontSize: 14, bold: true, color: P.dim, charSpacing: 2 });
  text(s, [{ text: 'Open ' }, { text: ACTIVITY, options: { bold: true, color: P.gold } }, { text: ' from Google Classroom' }],
    { x: M + 0.5, y: 2.5, w: 11, h: 0.75, fontSize: 30, valign: 'middle' });
  o.tabs.forEach((t, i) => {
    const y = 3.55 + i * 1.15;
    chip(s, t[0], { x: M + 0.5, y: y + 0.12, w: 1.9, h: 0.6, fill: P.charcoal, line: P.gold, color: P.gold, size: 18, cs: 2 });
    text(s, t[1], { x: M + 2.7, y, w: 9, h: 0.85, fontSize: 26, valign: 'middle' });
  });
  timer(s, o.time);
  addIcon(s, 'practice');
  s.addNotes(o.notes);
  return s;
}
// A small number card for whiteboard practice and its answers: headings sit right above the digits.
// o: { x, y, w, h, letter, heads, digits, prompt?, answer? (runs), glow? }
function numCard(s, o) {
  box(s, { x: o.x, y: o.y, w: o.w, h: o.h, fill: P.panel, line: P.line, r: 0.1 });
  badge(s, o.letter, o.x + 0.2, o.y + 0.2, 0.46);
  if (o.prompt) text(s, o.prompt, { x: o.x + 0.8, y: o.y + 0.18, w: o.w - 1, h: 0.5, fontSize: 18, color: P.muted, valign: 'middle' });
  const n = o.heads.length, cw = Math.min(0.62, (o.w - 0.6) / n), x0 = o.x + (o.w - n * cw) / 2;
  const dy = o.y + (o.prompt ? 0.85 : 0.75);
  o.heads.forEach((h, i) => {
    const one = o.glow && o.digits[i] === '1';
    if (o.showHeads !== false) text(s, String(h), { x: x0 + i * cw, y: dy, w: cw, h: 0.4, fontFace: MONO, fontSize: n > 4 ? 15 : 18,
      bold: true, color: one ? P.gold : P.dim, align: 'center', valign: 'middle' });
    if (o.digits) text(s, o.digits[i], { x: x0 + i * cw, y: dy + 0.38, w: cw, h: 0.75, fontFace: MONO, fontSize: n > 4 ? 34 : 44,
      bold: true, color: one ? P.gold : P.off, align: 'center', valign: 'middle' });
  });
  if (o.big) text(s, o.big, { x: o.x, y: o.y + 0.75, w: o.w, h: 1.2, fontFace: MONO, fontSize: 54, bold: true,
    align: 'center', valign: 'middle' });
  if (o.answer) text(s, o.answer, { x: o.x + 0.1, y: o.y + o.h - 0.6, w: o.w - 0.2, h: 0.55, fontSize: 20,
    bold: true, color: P.ok, align: 'center', valign: 'middle' });
}
// A light switch drawn as a toggle (for "a bit is a switch").
function toggle(s, x, y, on) {
  box(s, { x, y, w: 2.2, h: 1.0, fill: on ? '2B2618' : P.code, line: on ? P.gold : P.line, lw: 2.5, r: 0.5 });
  s.addShape(K.pres.shapes.OVAL, { x: on ? x + 1.28 : x + 0.12, y: y + 0.1, w: 0.8, h: 0.8,
    fill: { color: on ? P.gold : P.dim }, line: { type: 'none' } });
}

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall (new unit: the maths today builds on)
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { pill: 'PRIMARY MATHS', q: 'In 4205, what is the 2 worth?', type: 'mcq', opts: ['2', '20', '200'],
    a: 'C — 200', why: 'It is in the hundreds column' },
  { pill: 'EVERYDAY', q: 'How many states does a light switch have?', type: 'mcq', opts: ['1', '2', '10'],
    a: 'B — 2', why: 'On or off' },
  { pill: 'MATHS', q: 'Doubling: 1, 2, 4, 8, … what is next?', type: 'write', a: '16', why: 'Each one is 2 × the last' },
  { pill: 'MATHS', q: 'What is 22 − 16?', type: 'write', a: '6', why: 'You will need this later today' },
];
R.recallStarter(K, { section: 'Recap & Recall', questions: RR, notes: `DO NOW — 4 minutes, silent. Mini-whiteboards or books.
This is a new unit, so the questions are the maths today's lesson stands on: place value, two states, doubling and taking away.
Q1–2 are multiple choice, so everyone commits to an answer. Q3–4 need a number.` });
R.recallAnswers(K, { section: 'Recap & Recall', questions: RR, notes: `Self-mark.
Q1: the 2 is in the hundreds column, so it is worth 200. Today's whole lesson is columns like this.
Q2: on or off: two states. Computers are built from switches like this.
Q3: 16. Doubling gives us the binary headings.
Q4: 6. Taking away is how we will turn a number into binary.` });

// ════════════════════════════════════════════════════════════════════════════
//  3–4. Title, questions
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_COVER', 'Title');
  text(s, 'Y8 COMPUTING  ·  DATA REPRESENTATION  ·  LESSON 1', { x: M + 0.1, y: 2.3, w: 11, h: 0.4, fontSize: 14, bold: true,
    color: P.gold, charSpacing: 3 });
  text(s, 'Binary and Denary', { x: M + 0.1, y: 2.75, w: 12, h: 1.2, fontFace: K.HEAD, fontSize: 64, bold: true });
  text(s, '00010110  =  22', { x: M + 0.1, y: 4.0, w: 8, h: 0.7, fontFace: MONO, fontSize: 32, color: P.muted });
  s.addNotes('Lesson 1 of 7 in Data Representation. Next lessons: adding binary, hexadecimal, logic, text and images, sound.');
}
R.questionsSlide(K, { section: 'Title', topic: TOPIC_Q, lesson: LESSON_Q, notes: `Read the lesson question aloud.
By the end, everyone should be able to turn binary into a normal number, and a normal number into binary.` });

// ════════════════════════════════════════════════════════════════════════════
//  5–6. Starter: crack the code (activity Tab 1)
// ════════════════════════════════════════════════════════════════════════════
taskSlide({ section: 'Starter', title: 'Crack the code', time: '4 MIN',
  tabs: [['TAB 1', 'Starter: decode the 9 words (A = 1 … Z = 26)']],
  notes: `Students open the activity from Classroom and do Tab 1 only. The key is on the page, right above the words.
Early finishers: what do you think the sentence means?` });
{
  const s = newSlide('SZ_DARK', 'Starter', 'Crack the code — answer');
  const words = ['THERE', 'ARE', 'TEN', 'TYPES', 'OF', 'PEOPLE', 'THAT', 'UNDERSTAND', 'BINARY'];
  text(s, words.slice(0, 5).join('  '), { x: M, y: 2.2, w: W - 2 * M, h: 1.0, fontSize: 40, bold: true, align: 'center', valign: 'middle' });
  text(s, words.slice(5).join('  '), { x: M, y: 3.2, w: W - 2 * M, h: 1.0, fontSize: 40, bold: true, align: 'center', valign: 'middle' });
  text(s, 'A strange sentence. Keep it in your head until the end of the lesson.', { x: M, y: 5.0, w: W - 2 * M, h: 0.6,
    fontSize: 22, color: P.muted, align: 'center', valign: 'middle' });
  addIcon(s, 'feedback');
  s.addNotes(`"There are ten types of people that understand binary." It doesn't make sense yet. The plenary comes back to it: by then they'll see the joke.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  7–10. Key words: bit, nibble and byte, denary and binary (activity Tab 2)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_DARK', 'Key words', 'A computer is made of switches');
  [[false, '0', 'OFF'], [true, '1', 'ON']].forEach(([on, d, lab], i) => {
    const x = 2.3 + i * 5.0;
    toggle(s, x, 2.2, on);
    text(s, lab, { x: x + 2.4, y: 2.2, w: 1.2, h: 1.0, fontSize: 24, bold: true, color: on ? P.gold : P.muted, valign: 'middle' });
    text(s, d, { x, y: 3.35, w: 2.2, h: 1.2, fontFace: MONO, fontSize: 80, bold: true, color: on ? P.gold : P.off, align: 'center', valign: 'middle' });
  });
  onClick(s, 1, () => {
    box(s, { x: 3.2, y: 5.05, w: 6.93, h: 1.0, fill: P.panel, line: P.gold, lw: 2, r: 0.1 });
    text(s, [{ text: 'bit', options: { bold: true, color: P.gold } }, { text: '  =  a single 0 or 1' }],
      { x: 3.2, y: 5.05, w: 6.93, h: 1.0, fontSize: 28, align: 'center', valign: 'middle' });
  });
  addIcon(s, 'info');
  s.addNotes(`A computer is billions of tiny switches. Each one is either off or on — two states, like Q2 in the Do Now.
We write off as 0 and on as 1.
[click] One switch, one 0 or 1, is called a BIT. (Short for BInary digiT: binary is on the next-but-one slide.)`);
}
{
  const s = newSlide('SZ_DARK', 'Key words', 'Bits come in groups');
  const row = (bits, y, label) => {
    bits.split('').forEach((b, i) => drawCell(s, 1.0 + i * 0.95, y, 0.95, b));
    text(s, label, { x: 1.0 + bits.length * 0.95 + 0.3, y, w: 4, h: 1.0, fontSize: 28, valign: 'middle' });
  };
  row('1011', 2.0, [{ text: 'nibble', options: { bold: true, color: P.gold } }, { text: '  =  4 bits' }]);
  onClick(s, 1, () => row('01001101', 3.8, [{ text: 'byte', options: { bold: true, color: P.gold } }, { text: '  =  8 bits' }]));
  addIcon(s, 'info');
  s.addNotes(`Count the bits with the class. Four bits is a nibble.
[click] Eight bits is a byte — two nibbles. (A nibble is half a byte: a small bite.)
Today we use up to 8 bits: one byte.`);
}
{
  const s = newSlide('SZ_DARK', 'Key words', 'Two number systems');
  const card = (x, name, base, digits, who) => {
    box(s, { x, y: 1.7, w: 5.9, h: 4.3, fill: P.panel, line: P.line, r: 0.1 });
    text(s, [{ text: name, options: { bold: true, color: P.gold } }, { text: '   base ' + base, options: { color: P.muted } }],
      { x: x + 0.4, y: 2.0, w: 5.2, h: 0.7, fontSize: 32, valign: 'middle' });
    digits.forEach((d, i) => {
      const cx = x + 0.4 + (i % 5) * 1.03, cy = 2.95 + Math.floor(i / 5) * 1.05;
      box(s, { x: cx, y: cy, w: 0.9, h: 0.9, fill: P.code, line: P.line, r: 0.08 });
      text(s, d, { x: cx, y: cy, w: 0.9, h: 0.9, fontFace: MONO, fontSize: 36, bold: true, align: 'center', valign: 'middle' });
    });
    text(s, who, { x: x + 0.4, y: 5.2, w: 5.2, h: 0.6, fontSize: 22, color: P.muted, valign: 'middle' });
  };
  card(M, 'Denary', 10, '0123456789'.split(''), 'What we use every day');
  onClick(s, 1, () => card(M + 6.23, 'Binary', 2, ['0', '1'], 'What computers use'));
  onClick(s, 2, () => text(s, [{ text: 'conversion', options: { bold: true, color: P.gold } },
    { text: '  =  changing a number from one system to the other' }], { x: M, y: 6.25, w: W - 2 * M, h: 0.55, fontSize: 24,
    align: 'center', valign: 'middle' }));
  addIcon(s, 'info');
  s.addNotes(`Denary is the normal number system: ten digits, 0 to 9, so we call it base 10. (Also called decimal.)
[click] Binary has only two digits, 0 and 1 — one for each switch state — so it's base 2.
[click] Changing a number from one system to the other is called CONVERSION. That's today's job.`);
}
taskSlide({ section: 'Key words', title: 'Key words', time: '2 MIN',
  tabs: [['TAB 2', 'Keywords: drag each word onto its meaning']],
  notes: 'Six words: denary, binary, bit, nibble, byte, conversion. A wrong check locks the button for 10 seconds, so think first.' });

// ════════════════════════════════════════════════════════════════════════════
//  11–13. Headings (activity Tab 3)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_DARK', 'Headings', 'Denary: each heading is 10 × bigger');
  const g = { heads: [1000, 100, 10, 1], colW: 1.9, gap: 0.35, y: 2.2, times: '×10' };
  grid(s, g);
  onClick(s, 1, () => grid(s, { ...g, cells: ['4', '2', '0', '5'], only: true }));
  onClick(s, 2, () => grid(s, { ...g, notes: { 0: '4000', 1: '200', 2: '0', 3: '5' }, only: true }));
  onClick(s, 3, () => line(s, '4000 + 200 + 0 + 5 = 4205', 5.0, { mono: true, size: 34 }));
  addIcon(s, 'info');
  s.addNotes(`Start from the right: ones, tens, hundreds, thousands. Each heading is 10 times the one on its right.
[click] Write 4205 under the headings, one digit per column.
[click] Each digit times its heading: 4 × 1000 = 4000 … (the working sits right under each digit).
[click] Add them up: 4205. Binary works exactly the same way — only the headings change.`);
}
{
  const s = newSlide('SZ_DARK', 'Headings', 'Binary: each heading is 2 × bigger');
  const xs = colXs(8);
  // Build the headings from the right, one per click: 1 and 2 to start, then 4, 8 … 128.
  for (let k = 0; k < 8; k++) {
    const i = 7 - k;
    const draw = () => {
      text(s, String(HEADINGS[i]), { x: xs[i], y: 2.6, w: 1.15, h: 0.6, fontFace: MONO, fontSize: 30, bold: true,
        color: P.off, align: 'center', valign: 'middle' });
      if (i < 7) text(s, '×2', { x: xs[i + 1] - 0.075 - 0.35, y: 2.05, w: 0.7, h: 0.35, fontFace: MONO, fontSize: 16,
        color: P.gold, align: 'center', valign: 'middle' });
    };
    if (k < 2) draw(); else onClick(s, k - 1, draw);
  }
  onClick(s, 7, () => line(s, 'Learn these 8: they never change', 4.4, { size: 28, color: P.muted }));
  addIcon(s, 'info');
  s.addNotes(`Same idea as denary, but each heading is 2 times the one on its right (base 2).
Start at 1 and 2 on the right. Before each click, ask the class: "What's next?" Double it.
[clicks] 4, 8, 16, 32, 64, 128.
[last click] Eight headings for eight bits: one byte. They're the same every time.`);
}
taskSlide({ section: 'Headings', title: 'The headings', time: '2 MIN',
  tabs: [['TAB 3', 'Headings: fill in the six missing binary headings']],
  notes: 'Cover the board or switch to a blank slide first if you want this from memory.' });

// ════════════════════════════════════════════════════════════════════════════
//  14–19. Binary → denary: I do, we do, you do (activity Tab 4)
// ════════════════════════════════════════════════════════════════════════════
const B2D_STEPS = ['Line up from the right', 'Find the headings with a 1', 'Add those headings'];
function b2dSlide(bits, mode, notes) {
  const s = newSlide('SZ_DARK', 'Binary to denary', `Binary → denary: ${bits}`);
  R.modeChip(K, s, mode);
  grid(s, { y: 2.0 });
  onClick(s, 1, () => grid(s, { y: 2.0, cells: cellsOf(bits), only: true }));
  const ones = cellsOf(bits).map((c, i) => (c === '1' ? i : -1)).filter((i) => i >= 0);
  onClick(s, 2, () => grid(s, { y: 2.0, glow: ones, notes: Object.fromEntries(ones.map((i) => [i, '+' + HEADINGS[i]])) }));
  onClick(s, 3, () => line(s, `${used(bits).join(' + ')} = ${parseInt(bits, 2)}`, 4.6, { mono: true, size: 36, color: P.gold }));
  steps(s, B2D_STEPS);
  addIcon(s, 'info');
  s.addNotes(notes);
  return s;
}
b2dSlide('1101', 'I DO', `I do: think aloud, one step per click. The three steps along the bottom are the method — point at each one.
[click] Step 1: line the bits up from the RIGHT, so the last bit is under the 1. Empty headings on the left count as 0.
[click] Step 2: which headings have a 1 under them? 8, 4 and 1. (The working sits right under each column.)
[click] Step 3: add them. 8 + 4 + 1 = 13. So binary 1101 is 13 in denary.`);
b2dSlide('1001', 'WE DO', `We do: the class tells you each step BEFORE you click. Cold-call.
[click] "Where does the last 1 go?" Under the 1 heading.
[click] "Which headings have a 1?" 8 and 1. The 0s in the middle don't count.
[click] "Add them": 8 + 1 = 9.`);
{
  const s = newSlide('SZ_DARK', 'Binary to denary', 'Your turn: binary → denary');
  R.modeChip(K, s, 'YOU DO', true);
  timer(s, '3 MIN');
  ['0100', '1011', '1111', '0110'].forEach((d, i) => numCard(s, { x: M + i * 3.1, y: 1.85, w: 2.9, h: 3.0,
    letter: 'ABCD'[i], heads: [8, 4, 2, 1], digits: d }));
  steps(s, B2D_STEPS);
  addIcon(s, 'practice');
  s.addNotes(`Mini-whiteboards. Write the denary answer for A to D. The headings are right above each digit this time; on the activity they fade away.
Boards up on 3, 2, 1. Look for anyone who added the bits (1 + 1 + 1 + 1 = 4 for C) instead of the headings.`);
}
{
  const s = newSlide('SZ_DARK', 'Binary to denary', 'Your turn — answers');
  [['0100', '4'], ['1011', '8 + 2 + 1 = 11'], ['1111', '8 + 4 + 2 + 1 = 15'], ['0110', '4 + 2 = 6']].forEach(([d, a], i) =>
    numCard(s, { x: M + i * 3.1, y: 1.85, w: 2.9, h: 3.0, letter: 'ABCD'[i], heads: [8, 4, 2, 1], digits: d, glow: true, answer: a }));
  text(s, '1111 is the biggest 4-bit number: 15', { x: M, y: 5.3, w: W - 2 * M, h: 0.6, fontSize: 24, color: P.muted, align: 'center', valign: 'middle' });
  addIcon(s, 'feedback');
  s.addNotes(`Self-mark. The highlighted headings are the ones that count.
C: all four headings: 15 is the biggest number 4 bits can make. (With 8 bits the biggest is 255.)
Common slip: adding the 1s themselves. We add the HEADINGS above the 1s.`);
}
taskSlide({ section: 'Binary to denary', title: 'Binary → denary', time: '6 MIN',
  tabs: [['TAB 4', 'Binary → Denary: get 6 right']],
  notes: `The help fades as they go: first the 1-columns are highlighted and the sum is laid out, then just the bits under the headings, then only the binary number.
A wrong answer shows the working, then a new number. Circulate: watch who lines up from the left on the last two (no grid).` });
{
  const s = newSlide('SZ_DARK', 'Binary to denary', 'Common mistake: which end?');
  const rows = [['101', 'left', 'Lined up from the left = 128 + 32 = 160', P.muted],
    ['101', 'right', 'Lined up from the right = 4 + 1 = 5', P.ok]];
  rows.forEach(([bits, side, label, c], r) => {
    const y = 1.95 + r * 2.35;
    const cells = side === 'left' ? ['1', '0', '1', '', '', '', '', ''] : cellsOf(bits);
    const ones = cells.map((v, i) => (v === '1' ? i : -1)).filter((i) => i >= 0);
    const draw = () => {
      grid(s, { y, cells, glow: ones, colW: 1.0, gap: 0.12, x: M, headSize: 22 });
      text(s, [{ text: r ? '✓  ' : '✗  ', options: { bold: true, color: c } }, { text: label }],
        { x: M + 9.15, y: y + 0.4, w: 2.95, h: 1.3, fontSize: 21, valign: 'middle', color: r ? P.off : P.muted });
    };
    if (r) onClick(s, 1, draw); else draw();
  });
  addIcon(s, 'feedback');
  s.addNotes(`The most common mistake on the last questions: writing the bits from the left, under 128.
101 is three bits. The LAST bit always goes under the 1 heading, so start from the right.
[click] Lined up from the right: 4 + 1 = 5.`);
}

// ════════════════════════════════════════════════════════════════════════════
//  20–29. Denary → binary: does it fit? (activity Tabs 5 and 6)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = newSlide('SZ_DARK', 'Denary to binary', 'Denary → binary: does it fit?');
  const bx = (x, y, w, t, gold) => {
    box(s, { x, y, w, h: 1.0, fill: gold ? '2B2618' : P.panel, line: gold ? P.gold : P.line, lw: 2, r: 0.1 });
    text(s, t, { x: x + 0.1, y, w: w - 0.2, h: 1.0, fontSize: 22, bold: !!gold, align: 'center', valign: 'middle' });
  };
  bx(M, 2.6, 2.6, 'Start at 128');
  arrow(s, M + 2.7, 3.1, M + 3.4, 3.1);
  bx(M + 3.5, 2.6, 4.0, 'Does the heading fit into what is left?', true);
  onClick(s, 1, () => {
    arrow(s, M + 7.6, 2.9, M + 8.3, 2.1, P.ok);
    bx(M + 8.4, 1.6, 3.7, [{ text: 'Yes: ', options: { bold: true, color: P.ok } }, { text: 'write 1, take it away' }]);
  });
  onClick(s, 2, () => {
    arrow(s, M + 7.6, 3.3, M + 8.3, 4.1, P.muted);
    bx(M + 8.4, 3.6, 3.7, [{ text: 'No: ', options: { bold: true, color: P.muted } }, { text: 'write 0' }]);
  });
  onClick(s, 3, () => line(s, 'Then move one heading right and ask again', 5.3, { size: 26, color: P.gold }));
  addIcon(s, 'info');
  s.addNotes(`Going the other way. One question, asked at every heading from left to right: does it fit?
[click] If it fits, write 1 and take the heading away from the number.
[click] If it's too big, write 0.
[click] Then move one heading right and ask again, all the way to the 1 column.
Remember Q4 in the Do Now: 22 − 16 = 6. That's this taking away.`);
}
// The 22 worked example, one heading per slide (128–32 together: all too big).
const FIT22 = [
  { cur: [0, 1, 2], q: 'Do 128, 64 or 32 fit into 22?', bits: { 0: '0', 1: '0', 2: '0' }, say: 'No: all too big. Write 0, 0, 0.' },
  { cur: [3], q: 'Does 16 fit into 22?', bits: { 3: '1' }, work: { 3: '22−16=6' }, say: 'Yes: write 1. 22 − 16 = 6 left.' },
  { cur: [4], q: 'Does 8 fit into 6?', bits: { 4: '0' }, say: 'No: write 0. Still 6 left.' },
  { cur: [5], q: 'Does 4 fit into 6?', bits: { 5: '1' }, work: { 5: '6−4=2' }, say: 'Yes: write 1. 6 − 4 = 2 left.' },
  { cur: [6], q: 'Does 2 fit into 2?', bits: { 6: '1' }, work: { 6: '2−2=0' }, say: 'Yes: write 1. 2 − 2 = 0 left.' },
  { cur: [7], q: 'Does 1 fit into 0?', bits: { 7: '0' }, say: 'No: write 0.' },
];
FIT22.forEach((st, k) => {
  const s = newSlide('SZ_DARK', 'Denary to binary', 'Convert 22 to binary');
  R.modeChip(K, s, 'I DO');
  const before = FIT22.slice(0, k);
  const cells = HEADINGS.map((_, i) => before.reduce((c, b) => b.bits[i] ?? c, ''));
  const work = Object.assign({}, ...before.map((b) => b.work || {}));
  grid(s, { y: 2.0, cells, cur: st.cur, notes: work, dimNotes: Object.keys(work).map(Number) });
  line(s, st.q, 4.75);
  onClick(s, 1, () => {
    grid(s, { y: 2.0, cells: HEADINGS.map((_, i) => st.bits[i] ?? null), notes: st.work || {}, only: true });
    line(s, st.say, 5.5, { size: 26, color: P.gold });
  });
  if (k === FIT22.length - 1) onClick(s, 2, () => {
    box(s, { x: 2.67, y: 6.25, w: 8.0, h: 0.62, fill: P.panel, line: P.gold, lw: 2, r: 0.1 });
    text(s, '22 = 00010110    check: 16 + 4 + 2 = 22 ✓', { x: 2.67, y: 6.25, w: 8.0, h: 0.62, fontFace: MONO, fontSize: 24, bold: true,
      align: 'center', valign: 'middle' });
  });
  addIcon(s, 'info');
  s.addNotes(k === 0
    ? `I do, one heading at a time. The highlighted column is the one we're asking about; what's left is in the question.
128, 64 and 32 are all bigger than 22, so none of them fit. [click] 0, 0, 0.`
    : k === FIT22.length - 1
      ? `[click] 1 doesn't fit into 0: write 0. Nothing left, every heading done.
[click] 22 is 00010110. Check it the other way: add the headings with a 1 — 16 + 4 + 2 = 22. Always check.`
      : `${st.q} [click] ${st.say}${st.work ? ' The taking away goes right under the column.' : ''}`);
});
{
  const s = newSlide('SZ_DARK', 'Denary to binary', 'Convert 13 to binary');
  R.modeChip(K, s, 'WE DO');
  grid(s, { y: 2.0, cells: HEADINGS.map(() => '') });
  const reveal = [[[0, 1, 2, 3], {}], [[4], { 4: '13−8=5' }], [[5], { 5: '5−4=1' }], [[6], {}], [[7], { 7: '1−1=0' }]];
  const bits = '00001101';
  reveal.forEach(([cols, work], k) => onClick(s, k + 1, () => grid(s, { y: 2.0, only: true,
    cells: HEADINGS.map((_, i) => (cols.includes(i) ? bits[i] : null)), notes: work })));
  onClick(s, 6, () => line(s, '13  =  00001101      (8 + 4 + 1 = 13 ✓)', 4.75, { mono: true, size: 30, color: P.gold }));
  line(s, 'Does it fit? Say yes or no before each click.', 5.9, { size: 22, color: P.muted });
  addIcon(s, 'practice');
  s.addNotes(`We do: the class answers each heading BEFORE you click. Whiteboards optional.
[click] 128, 64, 32, 16: all bigger than 13 → 0000.
[click] 8 fits into 13: 1, and 13 − 8 = 5 left.
[click] 4 fits into 5: 1, 5 − 4 = 1 left.
[click] 2 doesn't fit into 1: 0.
[click] 1 fits into 1: 1, nothing left.
[click] 13 = 00001101. Check: 8 + 4 + 1 = 13.`);
}
{
  const s = newSlide('SZ_DARK', 'Denary to binary', 'Your turn: denary → binary');
  R.modeChip(K, s, 'YOU DO', true);
  timer(s, '4 MIN');
  [7, 12, 9, 25].forEach((n, i) => numCard(s, { x: M + i * 3.1, y: 1.85, w: 2.9, h: 2.4, letter: 'ABCD'[i], heads: [], big: String(n) }));
  line(s, 'Write all 8 bits for each number', 4.75, { size: 26, color: P.muted });
  addIcon(s, 'practice');
  s.addNotes(`Mini-whiteboards. Headings across the top of the board first, then "does it fit?" for each one.
Boards up after 4 minutes. Spot anyone writing the denary digits in binary (e.g. 12 as 1 and 2).`);
}
{
  const s = newSlide('SZ_DARK', 'Denary to binary', 'Your turn — answers');
  [[7, '00000111', '4 + 2 + 1'], [12, '00001100', '8 + 4'], [9, '00001001', '8 + 1'], [25, '00011001', '16 + 8 + 1']].forEach(([n, b, a], i) =>
    numCard(s, { x: M + (i % 2) * 6.18, y: 1.65 + Math.floor(i / 2) * 2.6, w: 5.95, h: 2.45, letter: 'ABCD'[i], prompt: `${n} =`,
      heads: HEADINGS, digits: b, glow: true, answer: `check: ${a} = ${n} ✓` }));
  addIcon(s, 'feedback');
  s.addNotes(`Self-mark. Each answer is checked by converting it back — the method from earlier.
The leading zeros fill the byte: 111 and 00000111 are the same number, but a byte always has 8 bits.`);
}
taskSlide({ section: 'Denary to binary', title: 'Denary → binary', time: '12 MIN',
  tabs: [['TAB 5', 'Does it fit? Watch the 22 example, then do 2 numbers'], ['TAB 6', 'Denary → Binary: get 5 right']],
  notes: `Tab 5 walks them through two numbers one heading at a time (Yes / No). Tab 6 they click the 8 bits on their own; no running total, so they have to work it out.
Finished early? Tab 7 is the plenary — but wait for the class.` });

// ════════════════════════════════════════════════════════════════════════════
//  30. Plenary (activity Tab 7)
// ════════════════════════════════════════════════════════════════════════════
R.plenarySlide(K, { section: 'Plenary', lesson: LESSON_Q, tasks: [
  [{ text: 'Tab 7: ' , options: { bold: true, color: P.gold } }, { text: 'six in a row, both directions' }],
  [{ text: 'Explain the starter: ', options: { bold: true, color: P.gold } }, { text: '"There are 10 types of people that understand binary"' }],
], notes: `Exit task. Tab 7: six conversions in a row, alternating directions. One wrong sends them back to question 1.
Last 2 minutes, whiteboards: explain the starter joke. 10 in binary is 2 (one 2, no 1s). The full joke: "There are 10 types of people: those who understand binary, and those who don't."
Next lesson: adding two binary numbers.` });

K.write(OUT);
