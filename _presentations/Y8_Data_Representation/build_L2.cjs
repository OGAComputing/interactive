// Y8 Data Representation · Lesson 2 — Binary addition.
// Builds L2_Binary_Addition.pptx. Follows ../ppt-guidelines.md §9, using the shared slide kit from
// ../Y9_Python (sz_kit.cjs + sz_slides.cjs) with no story layer (station 'none'), Google fonts, and this
// unit's parts in dr_kit.cjs. The deck teaches what the activity page asks, in its order:
//   Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html
//
//   node build_L2.cjs   → L2_Binary_Addition.pptx

const path = require('path');
const { createDeck } = require('../Y9_Python/sz_kit.cjs');
const S = require('../Y9_Python/sz_slides.cjs');

const K = createDeck({
  title: 'Binary Addition',
  footerText: 'Y8 DATA REPRESENTATION · LESSON 2',
  fonts: { head: 'Lora', body: 'Lato', mono: 'Ubuntu Mono' },
  // Data Representation look: deep indigo with a sky-blue accent (as build_L1.cjs), not charcoal and gold.
  palette: {
    charcoal: '1E1B4B', deep: '17153B', panel: '2E2A6E', code: '15133A', line: '453F95',
    gold: '38BDF8', off: 'F5F5FF', muted: 'B8B5E6', dim: '8B87C9', ok: '4ADE80', red: 'FB7185',
    ink: '1E1B4B', paper: 'EEF2FF', card: 'FFFFFF', cardLine: 'C7D2FE', inkMuted: '4B4891',
    pillBg: 'E0E7FF', pillInk: '3730A3', paperDim: '6B68A8', hlBg: '2A2766', outBg: '100E2E', lt2: 'E0E7FF',
  },
});
const { P, M, HEAD, MONO } = K;
const { gridGeom, rowLabel, cellRow, strip, youDoSlide, taskSlide } = require('./dr_kit.cjs')(K, S, { activity: 'Binary Addition' });

const TOPIC = 'How do computers represent and process different types of data using binary?';
const LESSON = 'How do I add two binary numbers?';
const ADD_STEPS = ['Start at the right', 'Add the column and any carry', 'Write the bit; carry 1 left'];

// ── Column addition, built one column per click ────────────────────────────
// The page's grid: Carry / first number / + second number / line / Answer. Each click adds one column,
// right to left: an outline on that column, the answer digit, the carry above the next column (or, from the
// leftmost column, a new digit on the left), and the column's working underneath (the outline and working
// fade out on the next click, so only the column being added is signalled).
// o: { section, title, mode, a, b (digit strings, same length), base (2 or 10), extra (an answer box on the
//      left for a final carry), steps (show the sub-goal strip), end (runs shown on the last click), notes }
function addSlide(o) {
  const W = o.a.length, base = o.base || 2;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  const cols = W + 1;                                       // column 0 is the space on the left for a final carry
  const g0 = { x: M, y: 0, heads: new Array(cols).fill(0), labels: true, cw: W > 4 ? 1.02 : 1.35, ch: 0.78, size: W > 4 ? 30 : 36 };
  const g = gridGeom(g0);
  const yC = 1.62, hC = 0.5, yA = 2.25, yB = yA + g.ch + 0.12, yL = yB + g.ch + 0.1, yS = yL + 0.14, yW = yS + g.ch + 0.18;
  const dashed = (x, y, w, h) => s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { type: 'none' },
    line: { color: P.line, width: 1.25, dashType: 'dash' }, rectRadius: 0.06 });
  const digit = (t, i, y, h, color, size) => K.text(s, t, { x: g.xs[i], y, w: g.cw, h, fontFace: MONO, fontSize: size || g0.size,
    bold: true, color, align: 'center', valign: 'middle' });

  rowLabel(s, g, g0, yC, 'CARRY', hC);
  for (let k = 0; k < W - 1; k++) dashed(g.xs[k + 1] + 0.12, yC, g.cw - 0.24, hC);
  [[yA, o.a], [yB, o.b]].forEach(([y, num]) => [...num].forEach((d, k) => {
    K.box(s, { x: g.xs[k + 1], y, w: g.cw, h: g.ch, fill: P.code, line: P.line, r: 0.06 });
    digit(d, k + 1, y, g.ch, P.off);
  }));
  K.text(s, '+', { x: g.xs[0], y: yB, w: g.cw, h: g.ch, fontFace: MONO, fontSize: 40, bold: true, color: P.off, align: 'center', valign: 'middle' });
  K.box(s, { x: g.xs[0], y: yL, w: g.xs[W] + g.cw - g.xs[0], h: 0.05, fill: P.off });
  rowLabel(s, g, g0, yS, 'ANSWER');
  if (o.extra) dashed(g.xs[0], yS, g.cw, g.ch);
  for (let k = 0; k < W; k++) K.box(s, { x: g.xs[k + 1], y: yS, w: g.cw, h: g.ch, fill: P.panel, line: P.line, r: 0.06 });

  let c = 0;
  const clicks = W + (o.end ? 1 : 0);
  for (let k = W - 1; k >= 0; k--) {
    const x = +o.a[k], y = +o.b[k], sum = x + y + c, write = sum % base, out = sum >= base ? 1 : 0;
    const n = W - k, hide = n < clicks ? n + 1 : undefined;
    const parts = [x, y, ...(c ? [c] : [])].join(' + ');
    const inBinary = base === 2 && sum >= 2 ? ` (${sum.toString(2)} in binary)` : '';
    const what = out ? (k === 0 ? `write ${write}; carry 1 into a new column` : `write ${write}, carry 1`) : `write ${write}`;
    K.onClick(s, n, () => s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: g.xs[k + 1] - 0.07, y: yC - 0.07, w: g.cw + 0.14,
      h: yS + g.ch - yC + 0.14, fill: { type: 'none' }, line: { color: P.gold, width: 3 }, rectRadius: 0.08 }), hide);
    K.onClick(s, n, () => K.text(s, [{ text: `${parts} = ${sum}${inBinary}`, options: { fontFace: MONO, bold: true } },
      { text: '  →  ' + what, options: { color: P.gold, bold: true } }],
    { x: M + g.lab, y: yW, w: 12.13 - g.lab, h: 0.55, fontSize: 22, valign: 'middle' }), hide);
    K.onClick(s, n, () => {
      digit(String(write), k + 1, yS, g.ch, P.gold);
      if (out && k > 0) digit('1', k, yC, hC, P.gold, 24);
      if (out && k === 0) digit('1', 0, yS, g.ch, P.gold);
    });
    c = out;
  }
  if (o.end) K.onClick(s, clicks, () => K.text(s, o.end, { x: M + g.lab, y: yW, w: 12.13 - g.lab, h: 0.55, fontSize: 24, valign: 'middle' }));
  if (o.steps) strip(s, ADD_STEPS, [1, 1, 1]);
  if (o.mode) S.modeChip(K, s, o.mode);
  K.addIcon(s, o.mode === 'WE DO' ? 'practice' : 'info');
  s.addNotes(o.notes);
  return s;
}

// ═══════════════ THE DECK ═══════════════

// 1–2 · Recap & Recall: Lesson 1's conversions (used to check every sum today) and denary carrying.
const RECALL = [
  { pill: 'LAST LESSON', type: 'write', q: 'Convert 0101 to denary', a: '5', why: '4 + 1' },
  { pill: 'LAST LESSON', type: 'mcq', q: 'Which is 6 written with 4 bits?', opts: ['110', '0110', '1100'], optsMono: true,
    a: 'B — 0110', why: 'Every column gets a bit, 0s too' },
  { pill: 'LAST LESSON', type: 'mcq', q: 'The biggest number 4 bits can hold?', opts: ['16', '15', '8'], a: 'B — 15', why: '1111 = 8 + 4 + 2 + 1' },
  { pill: 'KS2 MATHS', type: 'write', q: 'Work out 47 + 38', a: '85', why: '7 + 8 = 15: write 5, carry 1' },
];
S.recallStarter(K, { section: 'Recap & Recall', questions: RECALL, time: '4 MIN',
  notes: 'Do Now, no notes. Q1–3 are Lesson 1: today every sum gets checked by converting to denary, so they need it. '
    + 'Q4 is column addition from primary school; the next slides build binary addition on it. Insist on an answer for every card.' });
S.recallAnswers(K, { section: 'Recap & Recall', questions: RECALL,
  notes: 'Q2: 0110, not 110: every column gets a bit. Q3: four 1s, 8 + 4 + 2 + 1 = 15; this comes back when a sum is too big for 4 bits. '
    + 'Q4: ask how they did it. "7 add 8 is 15, write the 5, carry the 1." That carry is today\'s keyword.' });

// 3–4 · Title, questions
{
  const s = K.newSlide('SZ_COVER', 'Intro');
  K.text(s, 'YEAR 8 · DATA REPRESENTATION · LESSON 2', { x: M + 0.1, y: 2.3, w: 11, h: 0.4, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  K.text(s, 'Binary Addition', { x: M + 0.1, y: 2.8, w: 11.5, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: P.off });
  K.text(s, 'Adding with only 1s and 0s', { x: M + 0.1, y: 4.05, w: 11, h: 0.6, fontFace: HEAD, fontSize: 28, color: P.muted });
  K.text(s, '0 1 1 0   +   0 0 1 1', { x: M + 0.1, y: 5.3, w: 11, h: 0.5, fontFace: MONO, fontSize: 24, color: P.dim, charSpacing: 4 });
  s.addNotes('Lesson 2. Last lesson we turned numbers into binary; today we add them. A computer does every sum this way. '
    + '(The sum along the bottom is the first one we work through.)');
}
S.questionsSlide(K, { section: 'Intro', topic: TOPIC, lesson: LESSON,
  notes: 'Same topic question as Lesson 1; today\'s lesson question underneath.' });

// 5–8 · The four rules (modelled here; the page starts with whole sums)
addSlide({ section: 'The four rules', title: 'Adding in columns: denary', a: '47', b: '38', base: 10,
  end: [{ text: 'Carry: ', options: { bold: true, color: P.gold } },
    { text: 'the column reached 10, so a 1 moves into the next column on the left.' }],
  notes: 'Recall Q4, in columns. Click 1: start on the right, 7 + 8 = 15. 15 is too big for one column: write 5, and the 1 (the ten) '
    + 'is carried: write it above the next column on the left. Click 2: 4 + 3 + the carried 1 = 8. Click 3: that 1 is a carry, '
    + 'today\'s keyword. Binary works exactly like this, right to left, but it carries sooner.' });
{
  const s = K.newSlide('SZ_DARK', 'The four rules', 'Binary carries at 2');
  const RULES = [
    ['0 + 0', 'write 0', ''],
    ['0 + 1', 'write 1', ''],
    ['1 + 1', 'write 0, carry 1', '2 in binary is 10'],
    ['1 + 1 + 1', 'write 1, carry 1', '3 in binary is 11'],
  ];
  const cw = 2.85, gx = 0.243;
  RULES.forEach(([sum, write, why], i) => {
    const x = M + i * (cw + gx);
    K.onClick(s, i + 1, () => {
      K.box(s, { x, y: 1.7, w: cw, h: 3.05, fill: P.panel, line: i >= 2 ? P.gold : P.line, lw: i >= 2 ? 2 : 1.25, r: 0.08 });
      K.text(s, sum, { x, y: 1.95, w: cw, h: 0.9, fontFace: MONO, fontSize: i === 3 ? 34 : 40, bold: true, color: P.off, align: 'center', valign: 'middle' });
      K.text(s, write, { x: x + 0.1, y: 2.95, w: cw - 0.2, h: 0.9, fontSize: 24, bold: true, color: P.gold, align: 'center', valign: 'middle' });
      if (why) K.text(s, why, { x: x + 0.1, y: 3.9, w: cw - 0.2, h: 0.6, fontSize: 18, color: P.muted, align: 'center', valign: 'middle' });
    });
  });
  K.onClick(s, 5, () => S.banner(K, s, [{ text: 'Denary carries at 10. ', options: { bold: true, color: P.gold } },
    { text: 'Binary only has 0 and 1, so it carries at 2.' }], 5.15, 1.0, 24));
  K.addIcon(s, 'info');
  s.addNotes('One column at a time, one click each. 0 + 0 = 0 and 0 + 1 = 1: nothing new. Click 3: 1 + 1 = 2, but binary has no '
    + 'digit 2. 2 in binary is 10 (Lesson 1: a 1 under the 2 heading), so write the 0 and carry the 1 left, exactly like the 15 '
    + 'in 47 + 38. Click 4: a column can have 1 + 1 and a carry, three 1s. 3 is 11 in binary: write 1, carry 1. Click 5: same idea as '
    + 'denary, it just carries at 2 instead of 10. These four rules are all of binary addition.');
}
const RULES_YOU = [
  { q: '1 + 0', a: '1', why: 'No carry' },
  { q: '1 + 1', a: '0, carry 1', why: '2 in binary is 10' },
  { q: '1 + 1 + 1', a: '1, carry 1', why: '3 in binary is 11' },
];
youDoSlide({ section: 'The four rules', items: RULES_YOU, prompt: 'what do you write in this column? Is there a carry?', time: '1 MIN',
  notes: 'Quick fire on boards: the bit to write, and whether there is a carry. Hide the rules slide.' });
youDoSlide({ section: 'The four rules', items: RULES_YOU, reveal: true,
  takeaway: [{ text: 'A column that makes 2 or 3 ', options: { bold: true, color: P.gold } }, { text: 'carries 1 into the next column on the left.' }],
  notes: 'The common slip: writing 2, or writing 10 in one column. One column holds one bit.' });
// 9–14 · Adding 4-bit numbers, and the final carry
addSlide({ section: 'Adding with 4 bits', title: 'Adding two 4-bit numbers', mode: 'I DO', a: '0110', b: '0011', steps: true,
  end: [{ text: 'Check in denary:  ', options: { bold: true, color: P.gold } },
    { text: '6 + 3 = 9,  and 1001 = 9', options: { fontFace: MONO, bold: true } }],
  notes: 'I do (the sum from the title slide). Click 1: start at the right: 0 + 1 = 1, write 1. Click 2: 1 + 1 = 2, 10 in binary: write 0, '
    + 'carry 1 above the next column. Click 3: 1 + 0 + the carry = 2 again: write 0, carry 1. Click 4: 0 + 0 + the carry = 1. '
    + 'Click 5: check with Lesson 1: 0110 is 6, 0011 is 3, 1001 is 9. Point at the three steps in the strip: it\'s the same three every column.' });
addSlide({ section: 'Adding with 4 bits', title: 'Adding two 4-bit numbers', mode: 'WE DO', a: '0101', b: '0111', steps: true,
  end: [{ text: 'Check in denary:  ', options: { bold: true, color: P.gold } },
    { text: '5 + 7 = 12,  and 1100 = 12', options: { fontFace: MONO, bold: true } }],
  notes: 'We do: ask before each click. 1 + 1 = 2: write 0, carry 1. Next: 0 + 1 + the carry = 2: write 0, carry 1. '
    + 'Next: 1 + 1 + the carry: three 1s, 11 in binary: write 1, carry 1. Last: 0 + 0 + the carry = 1. 1100 = 12, and 5 + 7 = 12.' });
const ADD_YOU = [
  { q: '0011 + 0001', a: '0100', why: '3 + 1 = 4' },
  { q: '0101 + 0010', a: '0111', why: '5 + 2 = 7: no carries' },
  { q: '0110 + 0110', a: '1100', why: '6 + 6 = 12' },
];
youDoSlide({ section: 'Adding with 4 bits', items: ADD_YOU, qSize: 36, prompt: 'write each sum in columns, carries above. Right to left.',
  notes: 'Boards: one number above the other, carries written in. Watch for anyone starting on the left.' });
youDoSlide({ section: 'Adding with 4 bits', items: ADD_YOU, qSize: 36, reveal: true,
  takeaway: [{ text: 'Check it in denary: ', options: { bold: true, color: P.gold } }, { text: 'convert both numbers and the answer. The first two add up to the third.' }],
  notes: 'Q1 carries twice in a row (1 + 1, then 1 + carry). Q2 has no carries: not every sum does. Show the denary check on Q3.' });
addSlide({ section: 'Adding with 4 bits', title: 'The final carry', mode: 'I DO', a: '1100', b: '0110', extra: true,
  end: [{ text: 'The answer has 5 bits:  ', options: { bold: true, color: P.gold } },
    { text: '12 + 6 = 18,  and 10010 = 18', options: { fontFace: MONO, bold: true } }],
  notes: 'Note the dashed box on the left of the answer. Click through: 0 + 0 = 0; 0 + 1 = 1; 1 + 1 = 2: write 0, carry 1; '
    + 'then 1 + 0 + the carry = 2: write 0, carry 1. But there is no column left for that carry. It becomes a new bit on the left, '
    + 'so the answer is 10010, five bits. Last click: 18 is too big for 4 bits (the biggest is 15, from the starter), so the answer '
    + 'needs a fifth bit. Leaving the final carry off gives 0010 = 2: wrong.' });
taskSlide({ section: 'Adding with 4 bits', time: '20 MIN',
  tasks: [[1, 'Add with 4 bits', '5 steps, the help fades'], [2, 'The final carry', '3 sums with a new box on the left'],
    [3, 'No help', '5 sums in a row, on paper first']],
  note: 'From step 3 of Task 1 you write the carries yourself. Task 3 has nothing on screen to help.',
  notes: 'Task 1: the carries are given at first, then students write them. Task 2: the final carry; its last sum may not have one, '
    + 'so the box stays empty. Task 3 is the gate: 5 sums in a row with no help; one wrong restarts it with new sums. '
    + 'Task 4 stays locked until it is passed.' });

// 15–17 · Eight bits
{
  const s = K.newSlide('SZ_DARK', 'Eight bits', 'Lining up: write both numbers with 8 bits');
  K.text(s, [{ text: 'Add  ' }, { text: '101101', options: { fontFace: MONO, bold: true, color: P.gold } }, { text: '  +  ' },
    { text: '1011', options: { fontFace: MONO, bold: true, color: P.gold } }], { x: M, y: 1.55, w: 9, h: 0.6, fontSize: 28, valign: 'middle' });
  const g0 = { x: M, y: 2.45, heads: new Array(8).fill(0), labels: true, cw: 1.2, size: 28 };
  const g = gridGeom(g0);
  const yB = g0.y + g.ch + 0.14;
  K.onClick(s, 1, () => {
    cellRow(s, g0, g0.y, '', [...'00101101'], { dim: [0, 1] });
    cellRow(s, g0, yB, '', [...'00001011'], { dim: [0, 1, 2, 3] });
    K.text(s, '+', { x: M + 0.6, y: yB, w: 0.8, h: g.ch, fontFace: MONO, fontSize: 36, bold: true, color: P.off, align: 'center', valign: 'middle' });
  });
  K.onClick(s, 2, () => S.banner(K, s, [{ text: '0s on the left: ', options: { bold: true, color: P.gold } },
    { text: 'the columns line up, and the values stay 45 and 11.' }], 4.85, 1.0, 24));
  K.addIcon(s, 'info');
  s.addNotes('Ask first: how would you line these up? Click 1: write both as 8 bits by putting 0s on the left, as in Lesson 1. '
    + 'Now the right-hand bits sit in the same column. Lining them up on the left instead (1011 under 1011…) adds the wrong columns. '
    + 'Click 2: the 0s change nothing: still 45 and 11. Task 4 has a step just like this.');
}
addSlide({ section: 'Eight bits', title: 'Adding two 8-bit numbers', mode: 'WE DO', a: '00101101', b: '00001011', steps: true,
  end: [{ text: 'Check in denary:  ', options: { bold: true, color: P.gold } },
    { text: '45 + 11 = 56,  and 00111000 = 56', options: { fontFace: MONO, bold: true } }],
  notes: 'We do, the class leads: same method, more columns. 1 + 1: write 0, carry 1. 0 + 1 + carry: 0, carry 1. 1 + 0 + carry: 0, '
    + 'carry 1. 1 + 1 + carry: three 1s: 1, carry 1. Then 0 + 0 + carry = 1, 1 + 0 = 1, and 0 + 0 twice. 00111000. Last click: '
    + '32 + 16 + 8 = 56 = 45 + 11. Task 4\'s last step asks for exactly this check.' });
taskSlide({ section: 'Eight bits', time: '15 MIN',
  tasks: [[4, '8 bits', 'line up, add, check in denary'], [5, 'Plenary', '5 in a row'],
    ['★', 'Carry Rush', 'the class challenge: type code BIN7']],
  note: 'Carry Rush opens when Task 5 is done. The same code gives everyone the same sums: highest score wins.',
  notes: 'Tasks 4 and 5 open one after the other. Carry Rush is the extension: it opens when Task 5 is passed. Write a class code on '
    + 'the board (BIN7, or any code up to 8 letters and digits): everyone on that code gets the same sums in the same order, so scores '
    + 'compare fairly. Each student\'s best shows in a gold chip at the top of the page on every tab, so at the end ask for chips up '
    + 'to find the class winner. The game does not change their grade.' });

// 18 · Plenary
{
  const s = S.plenarySlide(K, { section: 'Plenary', lesson: LESSON,
    tasks: ['Add 01011011 + 00110110.', 'Add 1111 + 0001.'],
    notes: 'Exit task on boards, then click for each answer. 1: 91 + 54 = 145 = 10010001; three carries in a row in the middle. '
      + '2: every column carries, and the final carry is a new bit on the left: 10000 (15 + 1 = 16). Then the lesson question aloud.' });
  K.onClick(s, 1, () => K.text(s, [{ text: '10010001', options: { color: P.ok } }, { text: '   91 + 54 = 145', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.0, y: 3.15, w: 5.7, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 2, () => K.text(s, [{ text: '10000', options: { color: P.ok } }, { text: '   15 + 1 = 16', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.0, y: 4.4, w: 5.7, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'Answer: ', options: { bold: true, color: P.gold } },
    { text: 'add the columns right to left. A column that makes 2 or 3 carries 1 to the left.' }], 5.6, 1.0, 24));
}

// DECK_OUT writes somewhere else (e.g. a preview while the deck is open in PowerPoint).
K.write(process.env.DECK_OUT || path.join(__dirname, 'L2_Binary_Addition.pptx'));
