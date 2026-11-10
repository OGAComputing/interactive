// Y8 Data Representation · Lesson 1 — Binary and denary conversion.
// Builds L1_Binary_And_Denary.pptx. Follows ../ppt-guidelines.md §9, using the shared slide kit from
// ../Y9_Python (sz_kit.cjs + sz_slides.cjs) with no story layer (station 'none') and Google fonts.
// The deck teaches what the activity page asks, in its order:
//   Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html
//
//   node build_L1.cjs   → L1_Binary_And_Denary.pptx

const path = require('path');
const { createDeck } = require('../Y9_Python/sz_kit.cjs');
const S = require('../Y9_Python/sz_slides.cjs');

const K = createDeck({
  title: 'Binary and Denary',
  footerText: 'Y8 DATA REPRESENTATION · LESSON 1',
  fonts: { head: 'Lora', body: 'Lato', mono: 'Ubuntu Mono' },
  // Data Representation look: deep indigo with a sky-blue accent (the activity pages' indigo), not charcoal and gold.
  // The kit calls its accent "gold" and its background "charcoal"; here they are sky blue and indigo.
  palette: {
    charcoal: '1E1B4B', deep: '17153B', panel: '2E2A6E', code: '15133A', line: '453F95',
    gold: '38BDF8', off: 'F5F5FF', muted: 'B8B5E6', dim: '8B87C9', ok: '4ADE80', red: 'FB7185',
    ink: '1E1B4B', paper: 'EEF2FF', card: 'FFFFFF', cardLine: 'C7D2FE', inkMuted: '4B4891',
    pillBg: 'E0E7FF', pillInk: '3730A3', paperDim: '6B68A8', hlBg: '2A2766', outBg: '100E2E', lt2: 'E0E7FF',
  },
});
const { P, M, HEAD, MONO } = K;

const TOPIC = 'How do computers represent and process different types of data using binary?';
const LESSON = 'How are denary numbers represented in binary using 1s and 0s?';
const H4 = [8, 4, 2, 1];
const H8 = [128, 64, 32, 16, 8, 4, 2, 1];
const bin = (n, w) => n.toString(2).padStart(w, '0');

// ── Drawing parts for this unit (dr_kit.cjs) ──────────────────────────────
const { gridGeom, headRow, cellRow, litColumns, doubleArrows, strip, youDoSlide, taskSlide } =
  require('./dr_kit.cjs')(K, S, { activity: 'Binary and Denary' });

const B2D_STEPS = ['Write the headings', 'Each bit under its heading', 'Add the headings with a 1'];
const D2B_STEPS = ['Write the headings', 'Biggest first: does it fit?', 'Fits: 1, take it away. No: 0'];

// ── Slide types for this lesson ────────────────────────────────────────────

// Binary → denary worked example, one step per click: headings → bits → light the 1s → the sum.
function b2dSlide(o) {
  const w = o.bits.length, heads = w === 8 ? H8 : H4;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  K.text(s, [{ text: 'Convert  ' }, { text: o.bits, options: { fontFace: MONO, bold: true, color: P.gold } },
    { text: '  to denary' }], { x: M, y: 1.55, w: 9, h: 0.6, fontSize: 28, valign: 'middle' });
  const g0 = { x: M, y: 2.75, heads, labels: true, cw: w === 8 ? 1.2 : 1.6, size: w === 8 ? 28 : 34 };
  const g = gridGeom(g0);
  const ones = [...o.bits].map((b, i) => (b === '1' ? i : -1)).filter((i) => i >= 0);
  const total = parseInt(o.bits, 2);
  K.onClick(s, 1, () => headRow(s, g0));
  K.onClick(s, 2, () => cellRow(s, g0, g0.y + g.ch + 0.14, 'BIT', [...o.bits]));
  K.onClick(s, 3, () => litColumns(s, g0, ones));
  K.onClick(s, 4, () => K.text(s, [{ text: ones.map((i) => heads[i]).join(' + ') + ' = ' },
    { text: String(total), options: { color: P.gold } }],
  { x: M + g.lab, y: 4.85, w: 10.5, h: 0.75, fontFace: MONO, fontSize: 34, bold: true, valign: 'middle' }));
  strip(s, B2D_STEPS, [1, 2, 3]);
  S.modeChip(K, s, o.mode);
  K.addIcon(s, o.mode === 'I DO' ? 'info' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// Denary → binary worked example, the page's three-row table. One click per heading: its bit and what's left.
function d2bSlide(o) {
  const w = o.width, heads = w === 8 ? H8 : H4, target = bin(o.value, w);
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  K.text(s, [{ text: 'Convert  ' }, { text: String(o.value), options: { fontFace: MONO, bold: true, color: P.gold } },
    { text: '  to binary' + (w === 8 ? ' (8 bits)' : '') }], { x: M, y: 1.55, w: 6.6, h: 0.6, fontSize: 28, valign: 'middle' });
  // start: the Left row begins with the number itself, so every heading is compared with the Left box just before it.
  const g0 = { x: M, y: 2.35, heads, labels: true, start: true, cw: w === 8 ? 1.05 : 1.6, size: w === 8 ? 28 : 32, ch: 0.72 };
  const g = gridGeom(g0);
  const yBit = g0.y + g.ch + 0.14, yLeft = yBit + g.ch + 0.14, yWhy = yLeft + g.ch + 0.1;
  headRow(s, g0);
  cellRow(s, g0, yBit, 'BIT', heads.map(() => ''));
  cellRow(s, g0, yLeft, 'LEFT', heads.map(() => ''));
  K.text(s, 'START', { x: g.xStart, y: yBit, w: g.cw, h: g.ch, fontSize: 13, bold: true, color: P.dim, charSpacing: 2,
    align: 'center', valign: 'bottom' });
  K.box(s, { x: g.xStart, y: yLeft, w: g.cw, h: g.ch, fill: P.panel, line: P.gold, lw: 2, r: 0.06 });
  K.text(s, String(o.value), { x: g.xStart, y: yLeft, w: g.cw, h: g.ch, fontFace: MONO, fontSize: g0.size - 4, bold: true,
    color: P.gold, align: 'center', valign: 'middle' });
  let left = o.value;
  heads.forEach((h, i) => {
    const fits = h <= left;
    if (fits) left -= h;
    const now = left;
    K.onClick(s, i + 1, () => {
      K.text(s, fits ? '1' : '0', { x: g.xs[i], y: yBit, w: g.cw, h: g.ch, fontFace: MONO, fontSize: g0.size, bold: true,
        color: fits ? P.gold : P.off, align: 'center', valign: 'middle' });
      K.text(s, String(now), { x: g.xs[i], y: yLeft, w: g.cw, h: g.ch, fontFace: MONO, fontSize: g0.size - 4,
        color: P.muted, align: 'center', valign: 'middle' });
      K.text(s, fits ? 'fits' : 'no', { x: g.xs[i] - 0.1, y: yWhy, w: g.cw + 0.2, h: 0.4, fontSize: 18, italic: true,
        color: fits ? P.gold : P.dim, align: 'center' });
    });
  });
  K.onClick(s, w + 1, () => K.text(s, [{ text: `${o.value} = ` }, { text: target, options: { color: P.gold } }],
    { x: M + g.lab, y: yWhy + 0.45, w: 10.5, h: 0.6, fontFace: MONO, fontSize: 32, bold: true, valign: 'middle' }));
  strip(s, D2B_STEPS, [0, 1, 1]);
  S.modeChip(K, s, o.mode);
  K.addIcon(s, o.mode === 'I DO' ? 'info' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// ═══════════════ THE DECK ═══════════════

// 1–2 · Recap & Recall: the maths today's two methods are built on (place value, doubling, adding).
const RECALL = [
  { pill: 'KS2 MATHS', type: 'mcq', q: 'In 352, what is the 5 worth?', opts: ['5', '50', '500'], a: 'B — 50', why: '5 tens' },
  { pill: 'KS2 MATHS', type: 'mcq', q: 'What comes next?  1, 2, 4, 8, …', opts: ['10', '12', '16'], a: 'C — 16', why: 'Each one doubles' },
  { pill: 'KS2 MATHS', type: 'write', q: 'What is 8 + 2 + 1?', a: '11', why: 'Add them up' },
  { pill: 'KS2 MATHS', type: 'write', q: 'Write 6 hundreds, no tens, 4 ones', a: '604', why: 'The 0 holds the tens place' },
];
S.recallStarter(K, { section: 'Recap & Recall', questions: RECALL, time: '4 MIN',
  notes: 'Do Now, no notes. Every question is maths they already know, and each one is a piece of today\'s method: '
    + 'place value (Q1, Q4), doubling (Q2) and adding a few numbers (Q3). Insist on an answer for every card: a guess beats a blank.' });
S.recallAnswers(K, { section: 'Recap & Recall', questions: RECALL,
  notes: 'Q1: the column a digit sits in gives its value. Q2: doubling, which is how today\'s binary headings grow. '
    + 'Q4: the 0 is still needed to hold the tens column. In binary too, every column gets a digit, 0s included.' });

// 3–4 · Title, questions
{
  const s = K.newSlide('SZ_COVER', 'Intro');
  K.text(s, 'YEAR 8 · DATA REPRESENTATION · LESSON 1', { x: M + 0.1, y: 2.3, w: 11, h: 0.4, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  K.text(s, 'Binary and Denary', { x: M + 0.1, y: 2.8, w: 11.5, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: P.off });
  K.text(s, 'Turning numbers into 1s and 0s', { x: M + 0.1, y: 4.05, w: 11, h: 0.6, fontFace: HEAD, fontSize: 28, color: P.muted });
  K.text(s, '0  1  0  0  0  0  1  0', { x: M + 0.1, y: 5.3, w: 11, h: 0.5, fontFace: MONO, fontSize: 24, color: P.dim, charSpacing: 4 });
  s.addNotes('First lesson of the unit. Today is about doing: by the end everyone converts numbers both ways, first with 4 bits, '
    + 'then with 8. (The bits along the bottom are 66. By the end of the lesson they can work that out.)');
}
S.questionsSlide(K, { section: 'Intro', topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole unit; today\'s lesson question underneath. Don\'t define the words yet: the next slides do.' });

// 5 · Denary
{
  const s = K.newSlide('SZ_DARK', 'Denary and binary', 'Denary: the numbers we use every day');
  K.text(s, [{ text: 'Ten digits: ', options: { bold: true, color: P.gold } }, { text: '0 1 2 3 4 5 6 7 8 9' }],
    { x: M, y: 1.6, w: 11, h: 0.6, fontSize: 28, valign: 'middle' });
  const g0 = { x: M, y: 2.9, heads: [100, 10, 1], labels: true, cw: 1.9, size: 36 };
  headRow(s, g0);
  cellRow(s, g0, g0.y + 0.99, 'DIGIT', ['3', '5', '2']);
  K.onClick(s, 1, () => K.text(s, [{ text: '300 + 50 + 2 = ' }, { text: '352', options: { color: P.gold } }],
    { x: M + 1.55, y: 4.95, w: 8, h: 0.8, fontFace: MONO, fontSize: 34, bold: true, valign: 'middle' }));
  K.addIcon(s, 'info');
  s.addNotes('Denary is the number system we use every day: ten digits, 0 to 9. Each column has a heading, and a digit is '
    + 'worth its heading times the digit. Click: 300 + 50 + 2 = 352. Binary works the same way, just with different headings.');
}

// 6 · Binary and bits
{
  const s = K.newSlide('SZ_DARK', 'Denary and binary', 'Binary: only 0 and 1');
  K.text(s, [{ text: 'A computer is made of switches: ', options: { bold: true } }, { text: 'on = 1, off = 0' , options: { color: P.gold, bold: true } }],
    { x: M, y: 1.6, w: 12, h: 0.6, fontSize: 28, valign: 'middle' });
  const states = [1, 0, 1, 0];
  states.forEach((on, i) => {
    const x = M + 1.6 + i * 2.1, y = 2.65;
    K.box(s, { x, y, w: 1.6, h: 0.8, fill: on ? P.gold : P.panel, line: on ? undefined : P.line, r: 0.4 });
    s.addShape(K.pres.shapes.OVAL, { x: on ? x + 0.88 : x + 0.08, y: y + 0.08, w: 0.64, h: 0.64,
      fill: { color: on ? P.off : P.dim }, line: { type: 'none' } });
    K.text(s, String(on), { x, y: y + 0.95, w: 1.6, h: 0.9, fontFace: MONO, fontSize: 54, bold: true, color: P.off, align: 'center', valign: 'middle' });
  });
  K.onClick(s, 1, () => S.banner(K, s, [{ text: 'Bit: ', options: { bold: true, color: P.gold } },
    { text: 'one binary digit, a 0 or a 1.  ' }, { text: '1010', options: { fontFace: MONO, bold: true, color: P.gold } },
    { text: ' is 4 bits.' }], 5.15, 1.1, 26));
  K.addIcon(s, 'info');
  s.addNotes('Binary has only two digits, 0 and 1. Why? A computer is made of tiny switches, and each switch is either on (1) '
    + 'or off (0). Click: one binary digit is a bit. 1010 has four digits, so it is 4 bits.');
}

// 7 · The headings double
{
  const s = K.newSlide('SZ_DARK', 'Denary and binary', 'Binary headings double');
  const g0 = { x: M + 1.5, y: 2.7, heads: H4, cw: 1.9, size: 40, ch: 1.0, gap: 0.6 };
  headRow(s, g0);
  K.onClick(s, 1, () => doubleArrows(s, g0));
  S.banner(K, s, [{ text: 'Every conversion starts the same way: ', options: { bold: true, color: P.gold } },
    { text: 'write the headings first.' }], 5.2, 1.0, 24);
  K.addIcon(s, 'info');
  s.addNotes('Denary headings go 1, 10, 100: times ten each time. Binary headings go 1, 2, 4, 8: start at 1 on the right and '
    + 'double each time you move left. Click to show the ×2s. '
    + 'Ask: what would come after 8? (16: that is in today\'s first quiz.) Today we start with four headings, 8 4 2 1.');
}

// 8–12 · Binary → denary
b2dSlide({ section: 'Binary to denary', title: 'Binary → denary', mode: 'I DO', bits: '1011',
  notes: 'I do. Click 1: write the headings 8 4 2 1, always first. Click 2: the bits go underneath. Click 3: find the columns '
    + 'with a 1 under them. Click 4: add those headings, 8 + 2 + 1 = 11. Point at the three steps in the strip as you go.' });
b2dSlide({ section: 'Binary to denary', title: 'Binary → denary', mode: 'WE DO', bits: '0110',
  notes: 'We do. Before each click, ask the class what comes next. Headings; bits; which columns have a 1 (4 and 2); 4 + 2 = 6. '
    + 'The 0 under the 8 adds nothing.' });
const B2D_YOU = [
  { q: '0111', a: '7', why: '4 + 2 + 1' },
  { q: '1001', a: '9', why: '8 + 1' },
  { q: '1100', a: '12', why: '8 + 4' },
];
youDoSlide({ section: 'Binary to denary', items: B2D_YOU, prompt: 'convert each binary number to denary. Headings first.',
  notes: 'Mini-whiteboards. Headings first, every time, then one bit under each heading.' });
youDoSlide({ section: 'Binary to denary', items: B2D_YOU, reveal: true,
  takeaway: [{ text: 'A 0 adds nothing: ', options: { bold: true, color: P.gold } }, { text: 'only add the headings with a 1 under them.' }],
  notes: 'Go through each. Watch for students adding every heading (15) instead of only the ones with a 1.' });
taskSlide({ section: 'Binary to denary', time: '15 MIN',
  tasks: [[1, 'Binary basics', '4 questions in a row'], [2, 'Binary → denary', '5 steps, the help fades']],
  note: 'One wrong answer in Task 1 starts it again. In Task 2, by step 4 you write the headings yourself.',
  notes: 'Tasks 1 and 2 only, then stop: the next method needs teaching first. Task 1 checks the words (denary, binary, bit) '
    + 'and the headings. Task 2 is the method with the help fading away. Gold = right first time.' });

// 13–17 · Denary → binary
d2bSlide({ section: 'Denary to binary', title: 'Denary → binary', mode: 'I DO', value: 11, width: 4,
  notes: 'I do, the same table as the activity. Headings first. 11 goes in the first Left box, so every heading is compared with the '
    + 'Left box just before it. Then each click is one heading, biggest first: does 8 fit into '
    + '11? Yes: write 1, take it away, 3 left. Does 4 fit into 3? No: write 0, still 3 left. 2 fits: 1, 1 left. 1 fits: 1, 0 left. '
    + 'Last click: read the bits, 1011. Check it backwards: 8 + 2 + 1 = 11.' });
d2bSlide({ section: 'Denary to binary', title: 'Denary → binary', mode: 'WE DO', value: 6, width: 4,
  notes: 'We do: ask before each click. 8 doesn\'t fit into 6: 0 (the method writes the 0, so every column gets a 1 or a 0). '
    + '4 fits: 1, 2 left. 2 fits: 1, 0 left. 1 doesn\'t fit into 0: 0. Answer 0110.' });
const D2B_YOU = [
  { q: '9', a: '1001', why: '8 + 1' },
  { q: '14', a: '1110', why: '8 + 4 + 2' },
  { q: '5', a: '0101', why: '4 + 1' },
];
youDoSlide({ section: 'Denary to binary', items: D2B_YOU, prompt: 'convert each denary number to binary. Write all 4 bits.',
  notes: 'Mini-whiteboards. Headings first; biggest first. Every column gets a 1 or a 0, so 5 is 0101.' });
youDoSlide({ section: 'Denary to binary', items: D2B_YOU, reveal: true,
  takeaway: [{ text: 'Check it backwards: ', options: { bold: true, color: P.gold } }, { text: 'add the headings with a 1. You should get the number you started with.' }],
  notes: 'Show checking by converting back: 1110 = 8 + 4 + 2 = 14.' });
taskSlide({ section: 'Denary to binary', time: '15 MIN',
  tasks: [[3, 'Denary → binary', '5 steps, the help fades'], [4, 'No help', '6 in a row, both ways']],
  note: 'Task 4 has nothing on screen to help: write the headings on paper first.',
  notes: 'Task 4 is the gate: 6 conversions in a row, both ways, with no help on screen. One wrong answer restarts it with new '
    + 'numbers. The 8-bit tasks stay locked until it is passed.' });

// 18–21 · Eight bits
{
  const s = K.newSlide('SZ_DARK', 'Eight bits', 'Eight bits: keep doubling');
  const g0 = { x: M, y: 2.2, heads: H8, cw: 1.32, size: 30, ch: 0.9, gap: 0.22 };
  headRow(s, g0, { newOnes: [0, 1, 2, 3] });
  doubleArrows(s, g0);
  K.onClick(s, 1, () => {
    K.text(s, [{ text: '4 bits:  biggest is  ' }, { text: '1111 = 15', options: { fontFace: MONO, bold: true, color: P.gold } }],
      { x: M, y: 3.75, w: 12, h: 0.6, fontSize: 26, valign: 'middle' });
    K.text(s, [{ text: '8 bits:  biggest is  ' }, { text: '11111111 = 255', options: { fontFace: MONO, bold: true, color: P.gold } }],
      { x: M, y: 4.4, w: 12, h: 0.6, fontSize: 26, valign: 'middle' });
  });
  K.onClick(s, 2, () => S.banner(K, s, [{ text: 'Same two methods, ', options: { bold: true, color: P.gold } },
    { text: 'just more columns.' }], 5.4, 0.95, 24));
  K.addIcon(s, 'info');
  s.addNotes('Keep doubling past 8: 16, 32, 64, 128. Eight headings, so 8 bits. Click 1: four bits can only reach 8 + 4 + 2 + 1 = 15, '
    + 'so 17 won\'t fit. Eight bits reach 255. Click 2: nothing new to learn, the same two methods with more columns. '
    + 'Task 5 starts by dragging the four new headings into place.');
}
b2dSlide({ section: 'Eight bits', title: '8 bits: binary → denary', mode: 'WE DO', bits: '10010110',
  notes: 'We do: they have passed the Task 4 gate, so the class leads. Ask before each click: the headings (128 down to 1); '
    + 'the bits underneath; which columns have a 1 (128, 16, 4 and 2); 128 + 16 + 4 + 2 = 150.' });
d2bSlide({ section: 'Eight bits', title: '8 bits: denary → binary', mode: 'I DO', value: 37, width: 8,
  notes: 'Same method, biggest first. 128 doesn\'t fit into 37: 0. 64: 0. 32 fits: 1, 5 left. 16: 0. 8: 0. 4 fits: 1, 1 left. '
    + '2: 0. 1 fits: 1, 0 left. 00100101. The two 0s on the left are part of the answer: every column gets a 1 or a 0.' });
{
  const s = K.newSlide('SZ_DARK', 'Eight bits', 'Writing a number as 8 bits');
  K.text(s, [{ text: 'Write  ' }, { text: '1101', options: { fontFace: MONO, bold: true, color: P.gold } }, { text: '  as 8 bits' }],
    { x: M, y: 1.55, w: 9, h: 0.6, fontSize: 28, valign: 'middle' });
  const g0 = { x: M, y: 2.45, heads: H8, labels: true, cw: 1.2, size: 28 };
  const g = gridGeom(g0);
  headRow(s, g0);
  cellRow(s, g0, g0.y + g.ch + 0.14, 'BIT', ['', '', '', '', '1', '1', '0', '1']);
  K.onClick(s, 1, () => cellRow(s, g0, g0.y + g.ch + 0.14, 'BIT', [...'00001101'], { dim: [0, 1, 2, 3] }));
  K.onClick(s, 2, () => K.text(s, [{ text: '1101 = 00001101 = ' }, { text: '13', options: { color: P.gold } }],
    { x: M + g.lab, y: 4.5, w: 10, h: 0.65, fontFace: MONO, fontSize: 32, bold: true, valign: 'middle' }));
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'Put 0s on the left. ', options: { bold: true, color: P.gold } },
    { text: 'They sit under headings you don\'t add, so the value doesn\'t change.' }], 5.45, 0.95, 24));
  K.addIcon(s, 'info');
  s.addNotes('1101 has 4 bits, so it sits under 8 4 2 1. Click 1: fill the empty columns with 0s to make 8 bits. '
    + 'Click 2: the value is still 13. Click 3: a 0 means "don\'t add this heading", so leading 0s change nothing. Task 6 asks for '
    + 'every answer as 8 bits.');
}
taskSlide({ section: 'Eight bits', time: '15 MIN',
  tasks: [[5, '8 bits: binary → denary', 'build the headings, then convert'],
    [6, '8 bits: denary → binary', 'every answer as 8 bits'],
    [7, 'Plenary', '5 in a row']],
  note: 'All done? The last tab links to the Cisco Binary Game: race the clock both ways.',
  notes: 'Tasks 5, 6 and 7 open one after another. Task 7 checks the big ideas too: padding doesn\'t change the value, '
    + 'the biggest 4-bit and 8-bit numbers, 64 not fitting into 40. When a student finishes everything, the page sends them to the '
    + 'Cisco Binary Game (learningcontent.cisco.com/games/binary). Open it on a student PC once before the lesson.' });

// 22 · Back to the title slide: its bits were 66 all along
b2dSlide({ section: 'Plenary', title: 'The title slide', mode: 'WE DO', bits: '01000010',
  notes: 'The bits along the bottom of the title slide. At the start of the lesson they meant nothing. Boards up before each '
    + 'click: headings, bits, which columns have a 1 (64 and 2), 64 + 2 = 66.' });

// 23 · Plenary
{
  const s = S.plenarySlide(K, { section: 'Plenary', lesson: LESSON,
    tasks: ['Convert 10101010 to denary.', 'Convert 99 to binary. Write 8 bits.'],
    notes: 'Exit task on boards, then click for each answer. 1: 128 + 32 + 8 + 2 = 170. 2: 99 → 64 fits (35 left), 32 fits (3 left), '
      + '2 fits (1 left), 1 fits: 01100011. Then answer the lesson question aloud: each bit says whether its heading is added.' });
  K.onClick(s, 1, () => K.text(s, [{ text: '170', options: { color: P.ok } }, { text: '   128 + 32 + 8 + 2', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.4, y: 3.15, w: 5.3, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 2, () => K.text(s, [{ text: '01100011', options: { color: P.ok } }, { text: '   64 + 32 + 2 + 1', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.4, y: 4.4, w: 5.3, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'Answer: ', options: { bold: true, color: P.gold } },
    { text: 'each bit sits under a heading. A 1 means add that heading; a 0 means don\'t.' }], 5.6, 1.0, 24));
}

// DECK_OUT writes somewhere else (e.g. a preview while the deck is open in PowerPoint).
K.write(process.env.DECK_OUT || path.join(__dirname, 'L1_Binary_And_Denary.pptx'));
