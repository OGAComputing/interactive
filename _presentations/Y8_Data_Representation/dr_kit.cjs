// Y8 Data Representation · drawing parts and slide types shared by the lesson decks.
// const D = require('./dr_kit.cjs')(K, S, { activity: 'Binary Addition' });
// K is a deck from ../Y9_Python/sz_kit.cjs createDeck, S the recipes in ../Y9_Python/sz_slides.cjs.

module.exports = function drKit(K, S, { activity }) {
  const { P, M, HEAD, MONO } = K;

  // Column grid: a row of headings, then rows under it. Returns the column x positions.
  // o: { x, y, heads, cw, ch, gap, size, labels?: true (row labels on the left),
  //      start?: true (one more column before the headings, for the starting number in the Left row; its x is xStart) }
  function gridGeom(o) {
    const cw = o.cw || 1.5, gap = o.gap ?? 0.14, lab = o.labels ? 1.55 : 0, pre = o.start ? cw + gap : 0;
    const xs = o.heads.map((_, i) => o.x + lab + pre + i * (cw + gap));
    return { xs, xStart: o.x + lab, cw, ch: o.ch || 0.85, gap, lab,
      w: lab + pre + o.heads.length * (cw + gap) - gap };
  }
  function rowLabel(s, g, o, y, t, h) {
    if (g.lab) K.text(s, t, { x: o.x, y, w: g.lab - 0.15, h: h || g.ch, fontSize: 13, bold: true, color: P.dim, charSpacing: 2, valign: 'middle' });
  }
  function headRow(s, o, { newOnes = [] } = {}) {
    const g = gridGeom(o);
    rowLabel(s, g, o, o.y, 'HEADING');
    o.heads.forEach((h, i) => {
      const isNew = newOnes.includes(i);
      K.box(s, { x: g.xs[i], y: o.y, w: g.cw, h: g.ch, fill: isNew ? P.gold : P.panel, line: isNew ? undefined : P.line, r: 0.06 });
      K.text(s, String(h), { x: g.xs[i], y: o.y, w: g.cw, h: g.ch, fontFace: MONO, fontSize: o.size || 32, bold: true,
        color: isNew ? P.charcoal : P.gold, align: 'center', valign: 'middle' });
    });
    return g;
  }
  // cells: strings ('' = empty column); lit: column indexes with a gold outline; dim: indexes drawn in the dim colour
  function cellRow(s, o, y, label, cells, { lit = [], dim = [], color = P.off } = {}) {
    const g = gridGeom(o);
    rowLabel(s, g, o, y, label);
    cells.forEach((c, i) => {
      const on = lit.includes(i);
      K.box(s, { x: g.xs[i], y, w: g.cw, h: g.ch, fill: P.code, line: on ? P.gold : P.line, lw: on ? 3 : 1.25, r: 0.06 });
      if (c !== '') K.text(s, String(c), { x: g.xs[i], y, w: g.cw, h: g.ch, fontFace: MONO, fontSize: o.size || 32, bold: true,
        color: dim.includes(i) ? P.dim : color, align: 'center', valign: 'middle' });
    });
  }
  // A gold outline round whole columns (heading + bit), drawn over the grid.
  function litColumns(s, o, cols, rows = 2) {
    const g = gridGeom(o);
    cols.forEach((i) => s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: g.xs[i] - 0.06, y: o.y - 0.06, w: g.cw + 0.12,
      h: rows * g.ch + (rows - 1) * 0.14 + 0.12, fill: { type: 'none' }, line: { color: P.gold, width: 3 }, rectRadius: 0.08 }));
  }
  // "← ×2" labels centred over each gap between headings (the headings double as you go left).
  function doubleArrows(s, o, from = 0) {
    const g = gridGeom(o);
    for (let i = Math.max(from, 1); i < o.heads.length; i++) {
      const cx = g.xs[i] - g.gap / 2;
      K.text(s, '← ×2', { x: cx - 0.5, y: o.y - 0.5, w: 1.0, h: 0.35, fontSize: 18, bold: true, color: P.gold, align: 'center' });
    }
  }
  // Sub-goal strip along the bottom: the same steps every time, so students learn the routine.
  // at[i] is the click that reaches step i (0 = from the start): an outline fades in round that step, so the
  // step being done is signalled on screen (fade-ins only, so steps already done stay lit).
  function strip(s, steps, at = [], y = 6.08) {
    const sh = 0.62, iw = 12.13 / steps.length, bd = 0.36;
    K.box(s, { x: M, y, w: 12.13, h: sh, fill: P.panel, r: 0.08 });
    steps.forEach((t, i) => {
      K.badge(s, i + 1, M + 0.2 + i * iw, y + (sh - bd) / 2, bd);
      K.text(s, t, { x: M + 0.68 + i * iw, y, w: iw - 0.75, h: sh, fontSize: 18, valign: 'middle' });
      const lit = () => s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.05 + i * iw, y: y + 0.05, w: iw - 0.1, h: sh - 0.1,
        fill: { type: 'none' }, line: { color: P.gold, width: 2.5 }, rectRadius: 0.08 });
      if (at[i] === 0) lit(); else if (at[i]) K.onClick(s, at[i], lit);
    });
  }

  // A small binary sum written in columns, one number under the other (an item with sum: ['01', '10']).
  // Reveal adds the carries above, the answer under the line and it.why.
  function stackedSum(s, x, cw, it, i, reveal) {
    const [a, b] = it.sum, W = Math.max(a.length, b.length);
    const A = a.padStart(W, '0'), B = b.padStart(W, '0');
    let c = 0; const ans = [], carry = new Array(W + 1).fill('');
    for (let k = W - 1; k >= 0; k--) {
      const t = +A[k] + +B[k] + c; ans.unshift(t % 2); c = t >= 2 ? 1 : 0;
      if (c) carry[k] = '1';                       // carry sits above column k-1, i.e. index k in the padded row
    }
    const answer = (c ? '1' : '') + ans.join('');
    const cols = W + 2, dw = 0.62, x0 = x + (cw - cols * dw) / 2;   // col 0 = '+', col 1 = room for a final carry
    const cx = (j) => x0 + j * dw;
    const row = (str, y, h, size, color) => [...str].forEach((d, k) => K.text(s, d,
      { x: cx(cols - str.length + k), y, w: dw, h, fontFace: MONO, fontSize: size, bold: true, color, align: 'center', valign: 'middle' }));
    K.box(s, { x, y: 1.7, w: cw, h: 3.0, fill: P.panel, line: P.line, r: 0.08 });
    K.badge(s, i + 1, x + 0.2, 1.88, 0.42);
    row(A, 2.4, 0.55, 34, P.gold);
    row(B, 2.95, 0.55, 34, P.gold);
    K.text(s, '+', { x: cx(1), y: 2.95, w: dw, h: 0.55, fontFace: MONO, fontSize: 34, bold: true, color: P.off, align: 'center', valign: 'middle' });
    K.box(s, { x: cx(1), y: 3.55, w: (cols - 1) * dw, h: 0.04, fill: P.off });
    if (reveal) {
      // carry[k] (k ≥ 1) goes above column k-1 of the number; carry[0] is a final carry (a new answer bit)
      carry.forEach((v, k) => { if (v && k > 0) K.text(s, '1', { x: cx(cols - W + k - 1), y: 1.98, w: dw, h: 0.4,
        fontFace: MONO, fontSize: 20, bold: true, color: P.ok, align: 'center', valign: 'middle' }); });
      row(answer, 3.63, 0.55, 34, P.ok);
      K.text(s, it.why, { x: x + 0.15, y: 4.18, w: cw - 0.3, h: 0.48, fontSize: 16, color: P.muted, align: 'center', valign: 'middle' });
    }
  }

  // You do: three questions on mini-whiteboards; reveal adds the answer and its working.
  // qSize: font size of the questions (44 by default; smaller for a whole sum)
  // An item with sum: [top, bottom] is drawn as a column sum instead of it.q (see stackedSum).
  function youDoSlide(o) {
    const s = K.newSlide('SZ_DARK', o.section, o.title || (o.reveal ? 'Answers' : 'Your turn'));
    const cw = 3.84, gx = 0.3;
    o.items.forEach((it, i) => {
      const x = M + i * (cw + gx);
      if (it.sum) { stackedSum(s, x, cw, it, i, o.reveal); return; }
      K.box(s, { x, y: 1.7, w: cw, h: 2.75, fill: P.panel, line: P.line, r: 0.08 });
      K.badge(s, i + 1, x + 0.2, 1.88, 0.42);
      K.text(s, it.q, { x, y: 2.1, w: cw, h: 1.0, fontFace: MONO, fontSize: o.qSize || 44, bold: true, color: P.gold, align: 'center', valign: 'middle' });
      if (o.reveal) {
        K.text(s, it.a, { x, y: 3.05, w: cw, h: 0.65, fontFace: MONO, fontSize: 32, bold: true, color: P.ok, align: 'center', valign: 'middle' });
        K.text(s, it.why, { x: x + 0.2, y: 3.7, w: cw - 0.4, h: 0.6, fontSize: 18, color: P.muted, align: 'center', valign: 'middle' });
      }
    });
    S.banner(K, s, o.reveal ? o.takeaway : [{ text: 'On your board: ', options: { bold: true, color: P.gold } }, { text: o.prompt }], 4.85, 1.1, 24);
    if (!o.reveal) { K.timer(s, o.time || '3 MIN'); S.modeChip(K, s, 'YOU DO', true); }
    K.addIcon(s, o.reveal ? 'feedback' : 'practice');
    s.addNotes(o.notes);
    return s;
  }

  // Task card: open the activity and do these tabs. tasks: [[number, name, one-line what]]
  function taskSlide(o) {
    const s = K.newSlide('SZ_COVER', o.section);
    K.text(s, 'YOUR TASK · GOOGLE CLASSROOM', { x: M, y: 0.6, w: 8, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
    K.text(s, [{ text: 'Open ' }, { text: activity, options: { color: P.gold } }],
      { x: M, y: 1.0, w: 9.5, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, valign: 'middle' });
    o.tasks.forEach(([n, name, what], i) => {
      const y = 2.3 + i * 1.12;
      K.box(s, { x: M, y, w: 12.13, h: 0.95, fill: P.panel, line: P.line, r: 0.08 });
      K.badge(s, n, M + 0.25, y + 0.22, 0.5);
      K.text(s, [{ text: name, options: { bold: true } }, { text: '   ' + what, options: { color: P.muted } }],
        { x: M + 1.0, y, w: 10.9, h: 0.95, fontSize: 22, valign: 'middle' });
    });
    if (o.note) K.text(s, o.note, { x: M, y: 2.3 + o.tasks.length * 1.12 + 0.15, w: 12.13, h: 0.7, fontSize: 20, italic: true, color: P.off, valign: 'middle' });
    K.chip(s, '⏱  ' + o.time, { x: 10.35, y: 0.62, w: 1.4, fill: P.charcoal, line: P.gold, color: P.gold, size: 14 });
    K.addIcon(s, 'practice');
    s.addNotes(o.notes);
    return s;
  }

  return { gridGeom, rowLabel, headRow, cellRow, litColumns, doubleArrows, strip, youDoSlide, taskSlide };
};
