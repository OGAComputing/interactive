// Y8 Data Representation · Lesson 3 — Hexadecimal.
// Builds L3_Hexadecimal.pptx. Follows ../ppt-guidelines.md §9, using the shared slide kit from
// ../Y9_Python (sz_kit.cjs + sz_slides.cjs) with no story layer (station 'none'), Google fonts, and this
// unit's parts in dr_kit.cjs. The deck teaches what the activity page asks, in its order:
//   Y8/Data_Representation/L3_Hexadecimal/1_Hexadecimal.html
// MTP decision (2026-11-16): the word "nibble" is never used with students: say "4 bits" / "a group of 4".
// Every conversion has at least one hex letter in its answer.
//
//   node build_L3.cjs   → L3_Hexadecimal.pptx

const path = require('path');
const { createDeck } = require('../Y9_Python/sz_kit.cjs');
const S = require('../Y9_Python/sz_slides.cjs');

const K = createDeck({
  title: 'Hexadecimal',
  footerText: 'Y8 DATA REPRESENTATION · LESSON 3',
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
const { strip, youDoSlide, taskSlide } = require('./dr_kit.cjs')(K, S, { activity: 'Hexadecimal' });

const TOPIC = 'How do computers represent and process different types of data using binary?';
const LESSON = 'How do I represent binary numbers with fewer digits using hexadecimal?';
const H4 = [8, 4, 2, 1];
const HEX = '0123456789ABCDEF';
const bin = (n, w) => n.toString(2).padStart(w, '0');

const FOUR_STEPS = ['Headings 8 4 2 1', 'Add the headings with a 1', '10–15 become A–F'];
const B2H_STEPS = ['Split into two groups of 4', 'Convert each group', 'Join the two digits'];
const H2B_STEPS = ['Each digit → denary', '4 bits under 8 4 2 1', 'Join: 4 bits for every digit'];

// ── The page's conversion grid ─────────────────────────────────────────────
// Row labels on the left (PLACE VALUE, BITS, DENARY, HEX, ANSWER, as on the page); one or two groups of
// 4 columns, each box centred under its own group, the answer under both.
function geom(groups) {
  const cw = groups === 1 ? 1.35 : 1.0, gap = 0.12, split = 0.85, lab = 2.0;
  const gw = 4 * cw + 3 * gap;
  const x0 = M + lab;
  const xs = (k) => [0, 1, 2, 3].map((j) => x0 + k * (gw + split) + j * (cw + gap));
  return { cw, gap, gw, x0, xs, gx: (k) => x0 + k * (gw + split), w: groups * gw + (groups - 1) * split };
}
function label(s, t, y, h) {
  K.text(s, t, { x: M, y, w: 1.85, h, fontSize: 13, bold: true, color: P.dim, charSpacing: 2, valign: 'middle' });
}
function cells(s, G, k, y, h, vals, { color = P.off, size = 30, fill = P.code, line = P.line, plain = false } = {}) {
  G.xs(k).forEach((x, j) => {
    if (!plain) K.box(s, { x, y, w: G.cw, h, fill, line, r: 0.06 });
    K.text(s, String(vals[j]), { x, y, w: G.cw, h, fontFace: MONO, fontSize: size, bold: true,
      color: Array.isArray(color) ? color[j] : color, align: 'center', valign: 'middle' });
  });
}
function centred(s, G, k, y, h, t, { size = 26, color = P.off, box = false, w } = {}) {
  const bw = w || G.gw;
  const x = G.gx(k) + (G.gw - bw) / 2;
  if (box) K.box(s, { x, y, w: bw, h, fill: P.panel, line: P.gold, lw: 2, r: 0.06 });
  K.text(s, t, { x, y, w: bw, h, fontFace: MONO, fontSize: size, bold: true, color, align: 'center', valign: 'middle' });
}
function outline(s, G, k, j, y, h) {
  s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: G.xs(k)[j] - 0.06, y: y - 0.06, w: G.cw + 0.12, h: h + 0.12,
    fill: { type: 'none' }, line: { color: P.gold, width: 3 }, rectRadius: 0.08 });
}
const sumOf = (n) => { const p = H4.filter((h) => n & h); return p.length ? p.join(' + ') : '0'; };
const workOf = (n) => (H4.filter((h) => n & h).length > 1 ? `${sumOf(n)} = ${n}` : `${n}`);

// Binary → hex, one or two groups of 4, one step per click.
// o: { bits, mode, title, section, notes }
function b2hSlide(o) {
  const groups = o.bits.length / 4, G = geom(groups);
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  K.text(s, [{ text: 'Convert  ' }, { text: o.bits, options: { fontFace: MONO, bold: true, color: P.gold } },
    { text: groups === 1 ? '  to one hex digit' : '  to hex' }], { x: M, y: 1.5, w: 9.5, h: 0.6, fontSize: 28, valign: 'middle' });
  const yCap = 2.12, yH = 2.45, hH = 0.5, yB = 3.03, hB = 0.72, yD = 3.95, hD = 0.6, yX = 4.68, hX = 0.68, yA = 5.42, hA = 0.58;
  const nibs = [0, 1].slice(0, groups).map((k) => o.bits.slice(k * 4, k * 4 + 4));
  const vals = nibs.map((b) => parseInt(b, 2));
  label(s, 'BITS', yB, hB);
  nibs.forEach((b, k) => cells(s, G, k, yB, hB, [...b]));
  let c = 0;
  if (groups === 2) {
    c++;
    K.onClick(s, c, () => {
      ['FIRST 4 BITS', 'SECOND 4 BITS'].forEach((t, k) => K.text(s, t, { x: G.gx(k), y: yCap, w: G.gw, h: 0.3, fontSize: 13,
        bold: true, color: P.gold, charSpacing: 2, align: 'center' }));
      const xm = G.gx(1) - 0.425 - 0.02;
      K.box(s, { x: xm, y: yCap, w: 0.05, h: yX + hX - yCap, fill: P.gold });
    });
  }
  c++;
  K.onClick(s, c, () => {
    label(s, 'PLACE VALUE', yH, hH);
    nibs.forEach((b, k) => {
      cells(s, G, k, yH, hH, H4, { color: P.gold, size: 22, plain: true });
      [...b].forEach((bit, j) => { if (bit === '1') outline(s, G, k, j, yH, yB + hB - yH); });
    });
  });
  label(s, 'DENARY', yD, hD); label(s, 'HEX', yX, hX);
  vals.forEach((n, k) => {
    c++;
    K.onClick(s, c, () => {
      centred(s, G, k, yD, hD, workOf(n), { size: groups === 1 ? 28 : 24 });
      centred(s, G, k, yX, hX, HEX[n], { size: 34, color: P.gold, box: true, w: 1.1 });
    });
  });
  if (groups === 2) {
    c++;
    K.onClick(s, c, () => {
      label(s, 'ANSWER', yA, hA);
      K.text(s, [{ text: `${HEX[vals[0]]} and ${HEX[vals[1]]}  →  ` }, { text: HEX[vals[0]] + HEX[vals[1]], options: { color: P.gold } }],
        { x: G.x0, y: yA, w: G.w, h: hA, fontFace: MONO, fontSize: 32, bold: true, align: 'center', valign: 'middle' });
    });
  }
  if (groups === 1) strip(s, FOUR_STEPS, [1, 2, 2]);
  else strip(s, B2H_STEPS, [1, 3, c]);
  S.modeChip(K, s, o.mode);
  K.addIcon(s, o.mode === 'I DO' ? 'info' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// Hex → 8-bit binary, one step per click: each digit's denary, then its 4 bits, then join.
function h2bSlide(o) {
  const G = geom(2), n = parseInt(o.hex, 16), vals = [n >> 4, n & 15];
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  K.text(s, [{ text: 'Convert  ' }, { text: o.hex, options: { fontFace: MONO, bold: true, color: P.gold } },
    { text: '  to binary (8 bits)' }], { x: M, y: 1.5, w: 9.5, h: 0.6, fontSize: 28, valign: 'middle' });
  const yX = 2.25, hX = 0.68, yD = 3.08, hD = 0.6, yH = 3.85, hH = 0.5, yB = 4.42, hB = 0.72, yA = 5.36, hA = 0.6;
  label(s, 'HEX', yX, hX); label(s, 'DENARY', yD, hD); label(s, 'PLACE VALUE', yH, hH); label(s, 'BITS', yB, hB);
  vals.forEach((v, k) => {
    centred(s, G, k, yX, hX, HEX[v], { size: 34, color: P.gold, box: true, w: 1.1 });
    cells(s, G, k, yH, hH, H4, { color: P.gold, size: 22, plain: true });
    G.xs(k).forEach((x) => K.box(s, { x, y: yB, w: G.cw, h: hB, fill: P.code, line: P.line, r: 0.06 }));
  });
  vals.forEach((v, k) => {
    K.onClick(s, 2 * k + 1, () => centred(s, G, k, yD, hD, v >= 10 ? `${HEX[v]} = ${v}` : `${v}`, { size: 26 }));
    K.onClick(s, 2 * k + 2, () => {
      const b = bin(v, 4);
      cells(s, G, k, yB, hB, [...b], { plain: true, color: [...b].map((c) => (c === '1' ? P.off : P.muted)) });
      [...b].forEach((bit, j) => { if (bit === '1') outline(s, G, k, j, yH, yB + hB - yH); });
    });
  });
  K.onClick(s, 5, () => {
    label(s, 'ANSWER', yA, hA);
    K.text(s, [{ text: `${bin(vals[0], 4)} and ${bin(vals[1], 4)}  →  ` }, { text: bin(n, 8), options: { color: P.gold } }],
      { x: G.x0, y: yA, w: G.w, h: hA, fontFace: MONO, fontSize: 30, bold: true, align: 'center', valign: 'middle' });
  });
  strip(s, H2B_STEPS, [1, 2, 5]);
  S.modeChip(K, s, o.mode);
  K.addIcon(s, o.mode === 'I DO' ? 'info' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// ═══════════════ THE DECK ═══════════════

// 1–2 · Recap & Recall: Lesson 1's 4-bit conversions (today's method converts 4 bits at a time) and Lesson 2.
const RECALL = [
  { pill: 'LESSON 1', type: 'write', q: 'Convert 1101 to denary', a: '13', why: '8 + 4 + 1' },
  { pill: 'LESSON 1', type: 'mcq', q: 'Which is 3 written with 4 bits?', opts: ['11', '0011', '1100'], optsMono: true,
    a: 'B — 0011', why: 'Every column gets a bit, 0s too' },
  // Q3's sum is drawn in columns by missingBitSum (below), so the card itself only holds the question.
  { pill: 'LAST LESSON', type: 'write', q: 'What is the missing bit?', a: '', why: '' },
  { pill: 'LAST LESSON', type: 'write', q: 'Add 0101 + 0011', a: '1000', why: '5 + 3 = 8' },
];
// Q3 as a column addition, as in Lesson 2: each bit in its own column, the + on the left, a line, the answer.
// Card 3 sits bottom-left of the 2×2 recall grid (sz_kit.cjs CARD): x = M, y = 4.4, 5.92 × 2.5.
function missingBitSum(s, reveal) {
  const x = M + 0.25, y = 4.4, cw = 0.42, rh = 0.38, xs = (j) => x + 0.55 + j * cw;
  const ink = reveal ? P.off : P.ink, hi = reveal ? P.gold : P.pillInk;
  const row = (bits, yy, plus) => {
    if (plus) K.text(s, '+', { x, y: yy, w: 0.45, h: rh, fontFace: MONO, fontSize: 24, bold: true, color: ink, align: 'center', valign: 'middle' });
    [...bits].forEach((b, j) => {
      const missing = b === '?';
      if (missing) K.box(s, { x: xs(j) + 0.03, y: yy + 0.02, w: cw - 0.06, h: rh - 0.04, fill: reveal ? P.code : P.pillBg, line: hi, lw: 1.5, r: 0.05 });
      K.text(s, missing && reveal ? '0' : b, { x: xs(j), y: yy, w: cw, h: rh, fontFace: MONO, fontSize: 24, bold: true,
        color: missing ? (reveal ? P.ok : hi) : ink, align: 'center', valign: 'middle' });
    });
  };
  row('0110', y + 1.1, false);
  row('0?11', y + 1.48, true);
  K.box(s, { x, y: y + 1.9, w: 0.55 + 4 * cw, h: 0.03, fill: ink });
  row('1001', y + 1.95, false);
  if (reveal) {
    K.text(s, [{ text: '? = 0', options: { bold: true, color: P.ok, fontSize: 22, fontFace: MONO } }],
      { x: x + 2.65, y: y + 1.15, w: 2.8, h: 0.45, valign: 'middle' });
    K.text(s, '0110 + 0011: 6 + 3 = 9', { x: x + 2.65, y: y + 1.6, w: 2.9, h: 0.4, fontSize: 18, color: P.muted, valign: 'middle' });
  }
}
missingBitSum(S.recallStarter(K, { section: 'Recap & Recall', questions: RECALL, time: '4 MIN',
  notes: 'Do Now, no notes. Q1–2 are Lesson 1 with 4 bits: today every hex digit is made from exactly 4 bits, so they need '
    + 'both. Q3–4 keep last lesson\'s addition warm. Q3 is a finished sum with one bit missing: only 0 or 1, so everyone can '
    + 'commit to an answer; the reasoning is the point. Insist on an answer for every card.' }), false);
missingBitSum(S.recallAnswers(K, { section: 'Recap & Recall', questions: RECALL,
  notes: 'Q2: 0011, not 11: every column gets a bit. That comes back today: every hex digit is written with all 4 bits. '
    + 'Q3: ask how they knew. Try both: 0011 is 3 and 6 + 3 = 9 = 1001; 0111 is 7 and 6 + 7 = 13, too big. Or add it in '
    + 'columns: 0 + 1 = 1, 1 + 1 = 10 (write 0, carry 1), then 1 + ? + 1 must write 0, so ? = 0. '
    + 'Q4: three carries in a row.' }), true);

// 3–4 · Title, questions
{
  const s = K.newSlide('SZ_COVER', 'Intro');
  K.text(s, 'YEAR 8 · DATA REPRESENTATION · LESSON 3', { x: M + 0.1, y: 2.3, w: 11, h: 0.4, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  K.text(s, 'Hexadecimal', { x: M + 0.1, y: 2.8, w: 11.5, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: P.off });
  K.text(s, 'Writing binary with fewer digits', { x: M + 0.1, y: 4.05, w: 11, h: 0.6, fontFace: HEAD, fontSize: 28, color: P.muted });
  K.text(s, '1 0 1 1 0 1 0 1   →   B 5', { x: M + 0.1, y: 5.3, w: 11, h: 0.5, fontFace: MONO, fontSize: 24, color: P.dim, charSpacing: 4 });
  s.addNotes('Lesson 3. Binary is long: eight 1s and 0s for one number. Today: a way to write the same number with just two '
    + 'characters. (The example along the bottom is the first one we work through.)');
}
S.questionsSlide(K, { section: 'Intro', topic: TOPIC, lesson: LESSON,
  notes: 'Same topic question as Lessons 1 and 2; today\'s lesson question underneath. Don\'t define hexadecimal yet: the next slides do.' });

// 5 · Why hex
{
  const s = K.newSlide('SZ_DARK', 'The hex digits', 'Binary is long');
  K.box(s, { x: M, y: 1.75, w: 5.6, h: 1.6, fill: P.panel, line: P.line, r: 0.08 });
  K.text(s, 'BINARY', { x: M + 0.3, y: 1.88, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  K.text(s, '10110101', { x: M, y: 2.25, w: 5.6, h: 0.9, fontFace: MONO, fontSize: 48, bold: true, color: P.off, align: 'center', valign: 'middle' });
  K.onClick(s, 1, () => {
    K.text(s, '→', { x: M + 5.75, y: 2.0, w: 0.9, h: 1.1, fontSize: 48, bold: true, color: P.gold, align: 'center', valign: 'middle' });
    K.box(s, { x: M + 6.8, y: 1.75, w: 5.33, h: 1.6, fill: P.panel, line: P.gold, lw: 2, r: 0.08 });
    K.text(s, 'HEXADECIMAL (HEX)', { x: M + 7.1, y: 1.88, w: 4.5, h: 0.3, fontSize: 13, bold: true, color: P.gold, charSpacing: 2 });
    K.text(s, 'B5', { x: M + 6.8, y: 2.25, w: 5.33, h: 0.9, fontFace: MONO, fontSize: 48, bold: true, color: P.gold, align: 'center', valign: 'middle' });
  });
  K.onClick(s, 2, () => S.banner(K, s, [{ text: 'Same number, 2 digits instead of 8. ', options: { bold: true, color: P.gold } },
    { text: 'Easier for people to read and copy.' }], 3.85, 1.0, 24));
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'The computer still stores binary. ', options: { bold: true, color: P.gold } },
    { text: 'Hex is only how people write it.' }], 5.05, 1.0, 24));
  K.addIcon(s, 'info');
  s.addNotes('Ask: copy this into your book without looking back. Hard: eight 1s and 0s, easy to lose your place. '
    + 'Click 1: hexadecimal, hex for short, writes the same number as B5. Click 2: that is the whole point, shorter for people. '
    + 'Programmers use it for colours and memory addresses. Click 3: the computer does not change; it still stores 10110101. '
    + 'By the end of today you can turn one into the other.');
}

// 6 · The sixteen digits (Task 1)
{
  const s = K.newSlide('SZ_DARK', 'The hex digits', 'Hex has sixteen digits');
  K.isys(s, { term: 'Hexadecimal', fact: 'sixteen digits', say: 'Hexadecimal has sixteen digits: 0 to 9, then A to F.' });
  const cw = 0.6, gap = 0.06, x0 = M + 1.3, yH = 2.0, yD = 2.82, h = 0.72;
  K.text(s, 'HEX', { x: M, y: yH, w: 1.25, h, fontSize: 13, bold: true, color: P.dim, charSpacing: 2, valign: 'middle' });
  K.text(s, 'DENARY', { x: M, y: yD, w: 1.25, h, fontSize: 13, bold: true, color: P.dim, charSpacing: 2, valign: 'middle' });
  const col = (n) => {
    const x = x0 + n * (cw + gap), letter = n >= 10;
    K.box(s, { x, y: yH, w: cw, h, fill: letter ? P.panel : P.code, line: letter ? P.gold : P.line, lw: letter ? 2 : 1.25, r: 0.06 });
    K.text(s, HEX[n], { x, y: yH, w: cw, h, fontFace: MONO, fontSize: 28, bold: true, color: letter ? P.gold : P.off, align: 'center', valign: 'middle' });
    K.box(s, { x, y: yD, w: cw, h, fill: P.code, line: P.line, r: 0.06 });
    K.text(s, String(n), { x, y: yD, w: cw, h, fontFace: MONO, fontSize: n >= 10 ? 22 : 26, bold: true, color: P.off, align: 'center', valign: 'middle' });
  };
  K.onClick(s, 1, () => { for (let n = 0; n < 10; n++) col(n); });
  for (let n = 10; n < 16; n++) K.onClick(s, n - 8, () => col(n));
  K.onClick(s, 8, () => S.banner(K, s, [{ text: 'Hexadecimal: ', options: { bold: true, color: P.gold } },
    { text: 'sixteen digits, 0–9 then A–F. Every number from 0 to 15 fits in one digit.' }], 4.05, 1.0, 24));
  K.addIcon(s, 'info');
  s.addNotes('Click 1: hex starts like denary, 0 to 9, the same digits with the same values. But hex needs sixteen digits and we have '
    + 'run out at 9. Writing 10 would take two digits, so hex uses letters. Clicks 2–7, one letter each, the class says the next one: '
    + 'A = 10, B = 11 … F = 15. Click 8: the keyword. Ask: what is 1111 in denary? 15, so 4 bits hold 0 to 15, and one hex digit holds 0 to 15. '
    + 'Trick for the letters: A is 10, then count on.');
}
const DIGITS_YOU = [
  { q: '12 → hex', a: 'C', why: 'A = 10, B = 11, C = 12' },
  { q: 'E → denary', a: '14', why: 'Count on from A = 10' },
  { q: '15 → hex', a: 'F', why: 'The last digit, F = 15' },
];
youDoSlide({ section: 'The hex digits', items: DIGITS_YOU, qSize: 38, prompt: 'hide the table. Count on from A = 10.', time: '1 MIN',
  notes: 'Boards, no table on screen. Watch for 12 written as "12": in hex one digit only, so it must be a letter.' });
K.isys(youDoSlide({ section: 'The hex digits', items: DIGITS_YOU, qSize: 38, reveal: true,
  takeaway: [{ text: '10 to 15 are one letter each: ', options: { bold: true, color: P.gold } }, { text: 'A B C D E F.' }],
  notes: 'Anyone who wrote two digits for 12: hex needs one character per digit, that is why the letters exist.' }),
  { term: 'A', fact: '10', say: 'In hex, A is 10: count on from there.' });

// 9–12 · 4 bits → one hex digit (Task 2)
b2hSlide({ section: '4 bits → hex', title: '4 bits make one hex digit', mode: 'I DO', bits: '1011',
  notes: 'I do. This is Lesson 1 plus one step. Click 1: the headings 8 4 2 1 over the 4 bits; the outlines show the headings with a 1. '
    + 'Click 2: add them, 8 + 2 + 1 = 11, then 11 in hex is B. Point at the strip: headings, add, letter. '
    + 'Key fact: 4 bits hold 0 (0000) to 15 (1111), and one hex digit holds 0 to 15, so every group of 4 bits is exactly one hex digit.' });
b2hSlide({ section: '4 bits → hex', title: '4 bits make one hex digit', mode: 'WE DO', bits: '1110',
  notes: 'We do: ask before each click. Which headings have a 1? 8, 4 and 2. Total 14. 14 in hex? Count on from A: E.' });
const FOUR_YOU = [
  { q: '1100', a: 'C', why: '8 + 4 = 12 = C' },
  { q: '1010', a: 'A', why: '8 + 2 = 10 = A' },
  { q: '1111', a: 'F', why: '8 + 4 + 2 + 1 = 15 = F' },
];
youDoSlide({ section: '4 bits → hex', items: FOUR_YOU, prompt: 'turn each into one hex digit. Write 8 4 2 1 above the bits first.', time: '2 MIN',
  notes: 'Boards: headings above the bits, the denary total, then the letter.' });
K.isys(youDoSlide({ section: '4 bits → hex', items: FOUR_YOU, reveal: true,
  takeaway: [{ text: 'One hex digit stands for exactly 4 bits: ', options: { bold: true, color: P.gold } }, { text: '0000 is 0, 1111 is F.' }],
  notes: 'Common slip: stopping at the denary number (12 instead of C). The answer is one hex digit.' }),
  { term: 'One hex digit', fact: '4 bits', say: 'One hex digit stands for exactly 4 bits.' });
taskSlide({ section: '4 bits → hex', time: '10 MIN',
  tasks: [[1, 'Hex digits', '4 steps, the table fades away'], [2, '4-bit binary → hex', '4 steps, every answer a letter']],
  note: 'A wrong answer shows the working and gives you a new question after a short wait.',
  notes: 'Task 1: denary to hex and back; by step 4 the table has gone. Task 2: 4 bits to one hex digit; the lit headings fade, '
    + 'then the headings. Bring the class back once most are on Task 2 step 3.' });

// 13–16 · 8 bits → hex (Task 3)
b2hSlide({ section: '8 bits → hex', title: '8 bits make two hex digits', mode: 'I DO', bits: '10110101',
  notes: 'I do, the number from the title slide. Click 1: split the 8 bits down the middle into two groups of 4. '
    + 'Click 2: 8 4 2 1 over each group, not 128 down to 1: each group is converted on its own. Click 3: first group, 8 + 2 + 1 = 11 = B. '
    + 'Click 4: second group, 4 + 1 = 5, and 5 stays 5. Click 5: join them, first group first: B5. The strip: split, convert, join.' });
b2hSlide({ section: '8 bits → hex', title: '8 bits make two hex digits', mode: 'WE DO', bits: '00111010',
  notes: 'We do. Split: 0011 and 1010. The first group starts with 0s: convert it the same way, 2 + 1 = 3. '
    + 'Second: 8 + 2 = 10 = A. Join: 3A. The 0s at the front matter for the split: always split 4 and 4.' });
const B2H_YOU = [
  { q: '11001010', a: 'CA', why: '1100 = C,  1010 = A' },
  { q: '01111110', a: '7E', why: '0111 = 7,  1110 = E' },
  { q: '10011101', a: '9D', why: '1001 = 9,  1101 = D' },
];
youDoSlide({ section: '8 bits → hex', items: B2H_YOU, qSize: 34, prompt: 'split into two groups of 4, convert each, join.', time: '3 MIN',
  notes: 'Boards: draw a line between bit 4 and bit 5 first. Watch for anyone adding all 8 bits together.' });
youDoSlide({ section: '8 bits → hex', items: B2H_YOU, qSize: 34, reveal: true,
  takeaway: [{ text: '8 bits always make 2 hex digits: ', options: { bold: true, color: P.gold } }, { text: 'one for each group of 4.' }],
  notes: 'The big slip: adding all 8 bits (202 for Q1) or writing 12 10 instead of CA. Two hex digits, one per group.' });
taskSlide({ section: '8 bits → hex', time: '10 MIN',
  tasks: [[3, '8-bit binary → hex', '5 steps: from step 3 you split the bits yourself']],
  note: 'Step 3: tap the gap where the bits split. Steps 4 and 5: just the answer, so work on paper.',
  notes: 'Task 3. Steps 1–2 split the bits for them; step 3 they tap the gap; steps 4–5 are answer only. '
    + 'Writing 115 for B5 (denary for each group) gets a hint, not a wrong mark: that is the misconception to listen for.' });

// 17–20 · Hex → 8 bits (Task 4)
h2bSlide({ section: 'Hex → 8 bits', title: 'Hex back to binary', mode: 'I DO', hex: 'C3',
  notes: 'I do: the method backwards. Click 1: first digit, C = 12. Click 2: 12 = 8 + 4, so 1100. Click 3: second digit, 3. '
    + 'Click 4: 3 = 2 + 1, so 0011. Stop on the 0s: every hex digit gets all 4 bits. Writing 11 instead of 0011 would make the '
    + 'answer 6 bits long and wrong. Click 5: join, first digit first: 11000011.' });
h2bSlide({ section: 'Hex → 8 bits', title: 'Hex back to binary', mode: 'WE DO', hex: '2E',
  notes: 'We do: 2 is just 2, which is 0010 (two 0s at the front, one at the end). E = 14 = 8 + 4 + 2, so 1110. Join: 00101110.' });
const H2B_YOU = [
  { q: 'A7', a: '10100111', why: 'A = 1010,  7 = 0111' },
  { q: '4F', a: '01001111', why: '4 = 0100,  F = 1111' },
  { q: 'D9', a: '11011001', why: 'D = 1101,  9 = 1001' },
];
youDoSlide({ section: 'Hex → 8 bits', items: H2B_YOU, prompt: 'each digit → denary → 4 bits under 8 4 2 1. Join.', time: '3 MIN',
  notes: 'Boards: 8 4 2 1 written twice. Count the bits at the end: there must be 8.' });
youDoSlide({ section: 'Hex → 8 bits', items: H2B_YOU, reveal: true,
  takeaway: [{ text: 'Every hex digit gets all 4 bits: ', options: { bold: true, color: P.gold } }, { text: '4 is 0100, not 100.' }],
  notes: 'Q2 is the one to check: 4 = 0100. Without the 0 the answer is 7 bits and every bit after it moves.' });
taskSlide({ section: 'Hex → 8 bits', time: '20 MIN',
  tasks: [[4, 'Hex → 8-bit binary', '5 steps, then type all 8 bits'], [5, 'No help', '6 conversions in a row, both ways'],
    [6, 'Plenary', '5 in a row'], ['★', 'Hex Rush', 'the class challenge: type code HEX1']],
  notes: 'Task 4: set the bits by tapping, then type all 8. Task 5 is the gate: 6 conversions on paper, nothing on screen; one wrong answer in Task 5 or 6 starts it again with new numbers. '
    + 'Task 6 opens when it is passed. Hex Rush is the extension: write a class code on the board (HEX1, or any code up to 8 letters '
    + 'and digits); everyone on that code gets the same questions in the same order. Best scores show in a chip at the top of the page. '
    + 'The game does not change their grade.' });

// 21 · Plenary
{
  const s = S.plenarySlide(K, { section: 'Plenary', lesson: LESSON,
    tasks: ['Convert 11101001 to hex.', 'Convert 5C to binary.'],
    notes: 'Exit task on boards, then click for each answer. 1: 1110 = 14 = E, 1001 = 9: E9. 2: 5 = 0101, C = 12 = 1100: 01011100. '
      + 'Then the lesson question aloud.' });
  K.onClick(s, 1, () => K.text(s, [{ text: 'E9', options: { color: P.ok } }, { text: '   1110 = E,  1001 = 9', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.0, y: 3.15, w: 5.7, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 2, () => K.text(s, [{ text: '01011100', options: { color: P.ok } }, { text: '   5 = 0101,  C = 1100', options: { color: P.muted, fontSize: 20 } }],
    { x: 7.0, y: 4.4, w: 5.7, h: 0.65, fontFace: MONO, fontSize: 28, bold: true, valign: 'middle' }));
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'Answer: ', options: { bold: true, color: P.gold } },
    { text: 'split the binary into groups of 4. Each group is one hex digit, 0–9 or A–F.' }], 5.6, 1.0, 24));
}

// DECK_OUT writes somewhere else (e.g. a preview while the deck is open in PowerPoint).
K.write(process.env.DECK_OUT || path.join(__dirname, 'L3_Hexadecimal.pptx'));
