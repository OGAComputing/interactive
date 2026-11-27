// Y8 Data Representation · Lesson 4 — Logic Gates and Truth Tables.
// Builds L4_Logic_Gates.pptx. Follows ../ppt-guidelines.md §9, using the shared slide kit from
// ../Y9_Python (sz_kit.cjs + sz_slides.cjs) with no story layer (station 'none'), Google fonts, and this
// unit's parts in dr_kit.cjs. The deck teaches what the activity page asks, in its order:
//   Y8/Data_Representation/L4_Logic_Gates/1_Logic_Gates.html
// Gates in real life → symbols and truth tables → tracing a two-gate circuit → building a circuit.
// Gate symbols are PNGs drawn from the page's own SVG (make_gate_images.cjs), and circuits use the page's
// layout coordinates, so the slides look like the page.
// ISYS (Nick, 2026-11-27; four allowed for this lesson): Logic gate … makes a decision · AND gate … both inputs are 1 · OR gate … at least one 1 · Truth table … output for every input.
//
//   node build_L4.cjs   → L4_Logic_Gates.pptx

const path = require('path');
const { createDeck } = require('../Y9_Python/sz_kit.cjs');
const S = require('../Y9_Python/sz_slides.cjs');

const K = createDeck({
  isysMax: 4,   // Nick allowed this lesson a fourth ISYS phrase, Logic gate (2026-11-27)
  title: 'Logic Gates and Truth Tables',
  footerText: 'Y8 DATA REPRESENTATION · LESSON 4',
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
const { strip, youDoSlide, taskSlide, recallQuestions } = require('./dr_kit.cjs')(K, S, { activity: 'Logic Gates and Truth Tables' });

const TOPIC = 'How do computers represent and process different types of data using binary?';
const LESSON = 'How is binary logic used to represent a real-world problem?';
const GATE_IMG = (g) => path.join(__dirname, 'gates', g + '.png');
const BULB = 'FACC15';

const ISYS_AND = { term: 'AND gate', fact: 'both inputs are 1', check: 'Which gate gives 1 only when both inputs are 1?',
  reverse: 'When does an AND gate give 1?', say: 'An AND gate gives 1 only when both inputs are 1.' };
const ISYS_OR = { term: 'OR gate', fact: 'at least one 1', check: 'Which gate gives 1 when there is at least one 1?',
  reverse: 'When does an OR gate give 1?', say: 'An OR gate gives 1 when the inputs have at least one 1.' };
const ISYS_GATE = { term: 'Logic gate', fact: 'makes a decision', check: 'What makes a decision from inputs of 1 or 0?',
  reverse: 'What does a logic gate do?', say: 'A logic gate makes a decision: it takes inputs of 1 or 0 and gives one output.' };
const ISYS_TT = { term: 'Truth table', fact: 'output for every input', check: 'What shows the output for every input?',
  reverse: 'What does a truth table show?', say: 'A truth table shows the output for every input combination.' };

const gate = (g, a, b) => (g === 'AND' ? a & b : g === 'OR' ? a | b : 1 - a);
const rows = (n) => Array.from({ length: 1 << n }, (_, r) => Array.from({ length: n }, (_, k) => (r >> (n - 1 - k)) & 1));

// ── Drawing: lines, gates and circuits ─────────────────────────────────────
// A straight wire, horizontal or vertical (thin rectangles draw crisper than line shapes).
function seg(s, x1, y1, x2, y2, color = P.muted, t = 0.035) {
  K.box(s, { x: Math.min(x1, x2) - (x1 === x2 ? t / 2 : 0), y: Math.min(y1, y2) - (y1 === y2 ? t / 2 : 0),
    w: x1 === x2 ? t : Math.abs(x2 - x1) + t / 2, h: y1 === y2 ? t : Math.abs(y2 - y1) + t / 2, fill: color });
}
function gateImg(s, g, cx, cy, w) { s.addImage({ path: GATE_IMG(g), x: cx - w / 2, y: cy - w * 30 / 88, w, h: w * 60 / 88, altText: `${g} gate symbol` }); }

// The page's circuit layouts, in its 640-wide drawing units (1_Logic_Gates.html GEO / checkers.js LAYOUTS).
const LAYOUTS = {
  one:    { inputs: ['A', 'B'], slots: { g1: ['A', 'B'] }, out: 'g1', H: 170, g: { g1: [300, 85] } },
  notIn:  { inputs: ['A', 'B'], slots: { g1: ['A'], g2: ['g1', 'B'] }, out: 'g2', H: 185, g: { g1: [190, 60], g2: [410, 100] } },
  notOut: { inputs: ['A', 'B'], slots: { g1: ['A', 'B'], g2: ['g1'] }, out: 'g2', H: 170, g: { g1: [230, 85], g2: [430, 85] } },
};
const GW = 42, GH = 30, STUB = 34, BULB_X = 592;
const isSlot = (src) => /^g\d$/.test(src);

// o: { x, y, u (inches per unit), build: { g1: 'NOT', … }, at: { g1: click, 'g1.0': click } (a gate or input letter
//      appears on that click; before it, an empty dashed box or circle), names: label under each gate,
//      pLabel: 'P' on the wire out of the first gate, lit: true lights the bulb (on the last click given by litAt) }
function circuit(s, id, o) {
  const L = LAYOUTS[id], u = o.u, X = (v) => o.x + v * u, Y = (v) => o.y + v * u;
  const at = o.at || {};
  const later = (k, draw) => (at[k] ? K.onClick(s, at[k], draw) : draw());
  for (const [g, ins] of Object.entries(L.slots)) {
    const [gx, gy] = L.g[g];
    const ys = ins.length === 1 ? [gy] : [gy - 15, gy + 15];
    ins.forEach((src, k) => {
      if (isSlot(src)) {
        const [sx, sy] = L.g[src];
        const x1 = sx + GW, x2 = gx - GW, mid = Math.round((x1 + x2) / 2) + (k ? 14 : -6);
        seg(s, X(x1), Y(sy), X(mid), Y(sy)); seg(s, X(mid), Y(sy), X(mid), Y(ys[k])); seg(s, X(mid), Y(ys[k]), X(x2), Y(ys[k]));
        if (o.pLabel && src === 'g1') K.text(s, 'P', { x: X(mid) + 0.08, y: Y((sy + ys[k]) / 2) - 0.2, w: 0.4, h: 0.4, fontFace: MONO, fontSize: 22, bold: true, color: P.gold, valign: 'middle' });
      } else {
        // A gate's two inputs are spread apart, so the letters don't touch; the wire bends in.
        const ty = ins.length === 1 ? ys[k] : ys[k] + (k ? 12 : -12), tx = gx - GW - STUB;
        seg(s, X(tx), Y(ty), X(gx - GW - 12), Y(ty)); seg(s, X(gx - GW - 12), Y(ty), X(gx - GW - 12), Y(ys[k])); seg(s, X(gx - GW - 12), Y(ys[k]), X(gx - GW), Y(ys[k]));
        const d = 0.4, key = `${g}.${k}`;
        if (at[key]) s.addShape(K.pres.shapes.OVAL, { x: X(tx) - d / 2, y: Y(ty) - d / 2, w: d, h: d, fill: { color: P.code }, line: { color: P.dim, width: 1.5, dashType: 'dash' } });
        later(key, () => {
          s.addShape(K.pres.shapes.OVAL, { x: X(tx) - d / 2 - 0.03, y: Y(ty) - d / 2 - 0.03, w: d + 0.06, h: d + 0.06, fill: { color: P.charcoal }, line: { type: 'none' } });
          s.addShape(K.pres.shapes.OVAL, { x: X(tx) - d / 2, y: Y(ty) - d / 2, w: d, h: d, fill: { color: P.code }, line: { color: P.gold, width: 2 } });
          K.text(s, src, { x: X(tx) - d / 2, y: Y(ty) - d / 2, w: d, h: d, fontFace: MONO, fontSize: 18, bold: true, color: P.off, align: 'center', valign: 'middle' });
        });
      }
    });
    if (at[g]) s.addShape(K.pres.shapes.ROUNDED_RECTANGLE, { x: X(gx - GW + 8), y: Y(gy - GH), w: (2 * GW - 16) * u, h: 2 * GH * u,
      fill: { color: P.code }, line: { color: P.dim, width: 1.5, dashType: 'dash' }, rectRadius: 0.08 });
    later(g, () => {
      // Over the empty dashed box: a patch of background, then the gate.
      if (at[g]) K.box(s, { x: X(gx - GW + 8) - 0.04, y: Y(gy - GH) - 0.04, w: (2 * GW - 16) * u + 0.08, h: 2 * GH * u + 0.08, fill: P.charcoal });
      gateImg(s, o.build[g], X(gx), Y(gy), 2 * (GW + 2) * u);
      if (o.names) K.text(s, o.build[g], { x: X(gx) - 0.7, y: Y(gy + GH) + 0.02, w: 1.4, h: 0.32, fontFace: MONO, fontSize: 16, bold: true, color: P.gold, align: 'center' });
    });
  }
  const [ox, oy] = L.g[L.out];
  seg(s, X(ox + GW), Y(oy), X(BULB_X - 19), Y(oy));
  const r = 19 * u;
  const bulb = (lit) => {
    s.addShape(K.pres.shapes.OVAL, { x: X(BULB_X) - r, y: Y(oy) - r, w: 2 * r, h: 2 * r, fill: { color: lit ? BULB : P.code }, line: { color: P.off, width: 2 } });
    K.text(s, 'Q', { x: X(BULB_X) - r, y: Y(oy) - r, w: 2 * r, h: 2 * r, fontFace: MONO, fontSize: 18, bold: true, color: lit ? P.charcoal : P.off, align: 'center', valign: 'middle' });
  };
  bulb(false);
  if (o.litAt) K.onClick(s, o.litAt, () => bulb(true));
}

// A truth table. o: { x, y, heads, rows, cols: [{ head, vals: '0111', at?: click | [click per row], color?, given? }],
//   cw, rh, size, headW? (wider heading cells, e.g. for "A AND B") }
function ttable(s, o) {
  const cw = o.cw || 0.8, rh = o.rh || 0.55, size = o.size || 24;
  const widths = [...o.heads.map(() => cw), ...o.cols.map((c) => c.w || cw)];
  const xs = widths.map((_, i) => o.x + widths.slice(0, i).reduce((a, b) => a + b + 0.06, 0));
  const all = [...o.heads, ...o.cols.map((c) => c.head)];
  all.forEach((h, i) => K.text(s, h, { x: xs[i], y: o.y, w: widths[i], h: 0.45, fontFace: MONO, fontSize: o.cols[i - o.heads.length]?.hs || 18, bold: true,
    color: i >= o.heads.length ? P.gold : P.dim, align: 'center', valign: 'middle' }));
  const sepX = xs[o.heads.length] - 0.06;
  K.box(s, { x: sepX - 0.015, y: o.y + 0.05, w: 0.03, h: 0.45 + o.rows.length * rh, fill: P.line });
  o.rows.forEach((r, k) => {
    const y = o.y + 0.5 + k * rh;
    r.forEach((v, i) => {
      K.box(s, { x: xs[i], y: y + 0.03, w: widths[i], h: rh - 0.06, fill: P.code, r: 0.05 });
      K.text(s, String(v), { x: xs[i], y, w: widths[i], h: rh, fontFace: MONO, fontSize: size, bold: true, color: P.off, align: 'center', valign: 'middle' });
    });
    o.cols.forEach((c, j) => {
      const i = o.heads.length + j;
      K.box(s, { x: xs[i], y: y + 0.03, w: widths[i], h: rh - 0.06, fill: P.panel, line: P.line, r: 0.05 });
      if (c.vals === undefined) return;
      const draw = () => K.text(s, c.vals[k], { x: xs[i], y, w: widths[i], h: rh, fontFace: MONO, fontSize: size, bold: true,
        color: c.color || P.gold, align: 'center', valign: 'middle' });
      const click = Array.isArray(c.at) ? c.at[k] : c.at;
      click ? K.onClick(s, click, draw) : draw();
    });
  });
  return { xs, widths, bottom: o.y + 0.5 + o.rows.length * rh };
}

// ── Slide types for this lesson ─────────────────────────────────────────────
const yn = (v) => (v ? 'Yes  1' : 'No  0');

// Gates in real life: the rule as a sentence (the gate word lit), then a table of situations whose answers
// appear one row per click; a last click names the rule. o: { title, before, gate, after, a, b?, q, isys, rule, notes }
function lifeSlide(o) {
  const s = K.newSlide('SZ_DARK', 'Gates in real life', o.title);
  K.box(s, { x: M, y: 1.55, w: 12.13, h: 0.95, fill: P.panel, line: P.line, r: 0.08 });
  K.text(s, [{ text: o.before }, { text: o.gate, options: { bold: true, color: P.gold, fontFace: MONO } }, { text: o.after }],
    { x: M + 0.35, y: 1.55, w: 11.5, h: 0.95, fontSize: 26, valign: 'middle' });
  const two = !!o.b, rs = two ? rows(2) : rows(1);
  const cw = 2.95, rh = 0.58, x0 = M, y0 = 2.6;
  const heads = two ? [o.a, o.b, o.q] : [o.a, o.q];
  heads.forEach((h, i) => K.text(s, h + '?', { x: x0 + i * (cw + 0.1), y: y0, w: cw, h: 0.5, fontSize: 18, bold: true,
    color: i === heads.length - 1 ? P.gold : P.muted, align: 'center', valign: 'middle' }));
  rs.forEach((r, k) => {
    const y = y0 + 0.55 + k * rh;
    r.forEach((v, i) => {
      K.box(s, { x: x0 + i * (cw + 0.1), y: y + 0.04, w: cw, h: rh - 0.08, fill: P.code, r: 0.05 });
      K.text(s, yn(v), { x: x0 + i * (cw + 0.1), y, w: cw, h: rh, fontSize: 22, bold: true, color: P.off, align: 'center', valign: 'middle' });
    });
    const xq = x0 + heads.length * (cw + 0.1) - cw - 0.1;
    K.box(s, { x: xq, y: y + 0.04, w: cw, h: rh - 0.08, fill: P.panel, line: P.line, r: 0.05 });
    K.onClick(s, k + 1, () => K.text(s, yn(gate(o.gate, r[0], r[1])), { x: xq, y, w: cw, h: rh, fontSize: 22, bold: true,
      color: P.gold, align: 'center', valign: 'middle' }));
  });
  const last = rs.length + 1;
  K.onClick(s, last, () => {
    S.banner(K, s, o.rule, 5.75, 0.95, 24);
    // The gate's symbol, beside the table: inputs on the left, the output on the right.
    const sx = two ? 10.55 : 7.7;
    K.box(s, { x: sx, y: 2.6, w: 2.15, h: 2.85, fill: P.panel, line: P.gold, lw: 2, r: 0.08 });
    K.text(s, 'SYMBOL', { x: sx, y: 2.72, w: 2.15, h: 0.3, fontSize: 13, bold: true, color: P.gold, charSpacing: 2, align: 'center' });
    gateImg(s, o.gate, sx + 1.075, 3.85, 1.85);
    K.text(s, o.gate, { x: sx, y: 4.6, w: 2.15, h: 0.5, fontFace: MONO, fontSize: 24, bold: true, color: P.off, align: 'center', valign: 'middle' });
  });
  if (o.isys) K.isys(s, { ...o.isys, click: last });
  K.addIcon(s, 'info');
  s.addNotes(o.notes);
  return s;
}

// Trace a two-gate circuit: circuit on the left, table on the right; P then Q fill one row at a time.
// o: { title, layout, build, mode: 'I DO' | 'WE DO' | 'YOU DO', reveal?, section, notes }
const TRACE_STEPS = ['P: the first gate', 'P goes into the next gate', 'Q: the last gate'];
function traceSlide(o) {
  const L = LAYOUTS[o.layout];
  const s = K.newSlide('SZ_DARK', 'Trace a circuit', o.title);
  circuit(s, o.layout, { x: M - 0.6, y: 1.75, u: 0.0118, build: o.build, names: true, pLabel: true });
  const rs = rows(2);
  const p = rs.map((r) => (L.slots.g1.length === 1 ? gate(o.build.g1, r[0]) : gate(o.build.g1, r[0], r[1])));
  const q = rs.map((r, k) => (o.layout === 'notOut' ? gate('NOT', p[k]) : gate(o.build.g2, p[k], r[1])));
  const anim = o.mode !== 'YOU DO';
  const show = anim || o.reveal;
  // Headings say what each column is, as on the page (Nick, 2026-11-27): P = NOT A, Q = P AND B.
  const pHead = L.slots.g1.length === 1 ? 'P = NOT A' : `P = A ${o.build.g1} B`;
  const qHead = o.layout === 'notOut' ? 'Q = NOT P' : `Q = P ${o.build.g2} B`;
  ttable(s, { x: 7.75, y: 1.6, heads: ['A', 'B'], rows: rs, rh: 0.6, cols: [
    { head: pHead, w: 1.6, hs: 16, vals: show ? p.join('') : undefined, at: anim ? rs.map((_, k) => 2 * k + 1) : undefined },
    { head: qHead, w: 1.6, hs: 16, vals: show ? q.join('') : undefined, at: anim ? rs.map((_, k) => 2 * k + 2) : undefined, color: P.ok },
  ] });
  if (anim) strip(s, TRACE_STEPS, [1, 2, 2]);
  else if (!o.reveal) S.banner(K, s, [{ text: 'On your board: ', options: { bold: true, color: P.gold } },
    { text: 'copy the table. Fill in P for every row, then Q.' }], 5.75, 0.95, 24);
  else S.banner(K, s, o.takeaway, 5.75, 0.95, 24);
  if (o.mode === 'YOU DO' && !o.reveal) { K.timer(s, '3 MIN'); S.modeChip(K, s, 'YOU DO', true); }
  else if (anim) S.modeChip(K, s, o.mode);
  K.addIcon(s, o.reveal ? 'feedback' : o.mode === 'I DO' ? 'info' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// Whiteboards after each gate: three cards that get harder, all on the gate just taught (Nick, 2026-11-27):
//   { kind: 'words', text, ask }  a situation from the story, in words
//   { kind: 'bits', g, ins }      the gate written with bits: 1 AND 0
//   { kind: 'gate', g, ins }      the gate's symbol with bits on its input wires
// Each card also has a (the answer, 0 or 1) and why. reveal: the answer in green and the reason underneath.
const CARD_KICKER = { words: 'IN WORDS', bits: 'IN BITS', gate: 'AS A GATE' };
function setupSlide(o) {
  const s = K.newSlide('SZ_DARK', 'Gates in real life', o.reveal ? 'Answers' : 'Your turn');
  const cw = 3.84, gx = 0.3, iw = 2.0, off = 15 * iw / 88;
  o.items.forEach((it, i) => {
    const x = M + i * (cw + gx), cy = 2.95;
    K.box(s, { x, y: 1.6, w: cw, h: 3.2, fill: P.panel, line: P.line, r: 0.08 });
    K.badge(s, i + 1, x + 0.2, 1.78, 0.42);
    K.text(s, CARD_KICKER[it.kind], { x: x + 0.75, y: 1.78, w: cw - 0.9, h: 0.42, fontSize: 13, bold: true, color: P.dim, charSpacing: 2, valign: 'middle' });
    const ans = (t, y, size = 32) => K.text(s, t, { x, y, w: cw, h: 0.55, fontFace: MONO, fontSize: size, bold: true,
      color: o.reveal ? P.ok : P.gold, align: 'center', valign: 'middle' });
    if (it.kind === 'words') {
      K.text(s, it.text, { x: x + 0.25, y: 2.25, w: cw - 0.5, h: 0.85, fontSize: 20, color: P.off, align: 'center', valign: 'middle' });
      K.text(s, it.ask, { x: x + 0.25, y: 3.1, w: cw - 0.5, h: 0.45, fontSize: 20, bold: true, color: P.off, align: 'center', valign: 'middle' });
      ans(o.reveal ? String(it.a) : '1 or 0?', 3.58, o.reveal ? 32 : 24);
    } else if (it.kind === 'bits') {
      const t = it.ins.length === 1 ? `NOT ${it.ins[0]}` : `${it.ins[0]} ${it.g} ${it.ins[1]}`;
      K.text(s, t, { x, y: 2.45, w: cw, h: 0.9, fontFace: MONO, fontSize: 40, bold: true, color: P.off, align: 'center', valign: 'middle' });
      ans(o.reveal ? String(it.a) : '?', 3.5);
    } else {
      const cx = x + cw / 2 + 0.1;
      gateImg(s, it.g, cx, cy, iw);
      const ys = it.ins.length === 1 ? [cy] : [cy - off, cy + off];
      it.ins.forEach((v, k) => K.text(s, String(v), { x: cx - iw / 2 - 0.45, y: ys[k] - 0.25, w: 0.42, h: 0.5, fontFace: MONO,
        fontSize: 30, bold: true, color: P.off, align: 'right', valign: 'middle' }));
      K.text(s, o.reveal ? String(it.a) : '?', { x: cx + iw / 2 + 0.04, y: cy - 0.28, w: 0.42, h: 0.56, fontFace: MONO, fontSize: 32, bold: true,
        color: o.reveal ? P.ok : P.gold, valign: 'middle' });
    }
    if (o.reveal) K.text(s, it.why, { x: x + 0.2, y: 4.25, w: cw - 0.4, h: 0.5, fontSize: 18, color: P.muted, align: 'center', valign: 'middle' });
  });
  S.banner(K, s, o.reveal ? o.takeaway : [{ text: 'On your board: ', options: { bold: true, color: P.gold } }, { text: o.prompt }], 5.1, 1.0, 24);
  if (!o.reveal) { K.timer(s, o.time || '2 MIN'); S.modeChip(K, s, 'YOU DO', true); }
  K.addIcon(s, o.reveal ? 'feedback' : 'practice');
  s.addNotes(o.notes);
  return s;
}

// ═══════════════ THE DECK ═══════════════

// 1–2 · Recap & Recall: last lesson's hex, Lesson 2's adding, Lesson 1 turned round to denary → binary, so no two
// cards use the same method (Logic Rush mixes all three in). Q1 gets the 8 4 2 1 hint from recallQuestions.
const RECALL = recallQuestions([
  { pill: 'LAST LESSON', type: 'write', q: 'Convert 1011 to one hex digit', a: 'B', why: '8 + 2 + 1 = 11 = B' },
  { pill: 'LAST LESSON', type: 'mcq', q: 'Which hex digit is 13?', opts: ['C', 'D', 'E'], optsMono: true, a: 'B — D', why: 'A = 10, B = 11, C = 12, D = 13' },
  { pill: 'LESSON 2', type: 'write', q: 'Add 0110 + 0011', a: '1001', why: '6 + 3 = 9' },
  // Denary → binary, so it isn't the same method as Q1 (Nick, 2026-11-27).
  { pill: 'LESSON 1', type: 'write', q: 'Convert 6 to 4-bit binary', a: '0110', why: '4 + 2: every bit shown' },
]);
S.recallStarter(K, { section: 'Recap & Recall', questions: RECALL, time: '4 MIN',
  notes: 'Do Now, no notes. Q1–2 are last lesson (hex), Q3 Lesson 2 (adding), Q4 Lesson 1 the other way round (denary → binary). Today is new, but all three come back '
    + 'in the extension game at the end. Q2 is multiple choice so everyone commits to an answer.' });
S.recallAnswers(K, { section: 'Recap & Recall', questions: RECALL,
  notes: 'Q1: 8 4 2 1 over the bits, 11, then count on from A = 10. Q3: watch for anyone writing 0901 or 9: the answer is in binary. '
    + 'Q4: 8 does not fit, 4 fits (2 left), 2 fits (0 left), 1 does not: 0110. Insist on all 4 bits, not 110.' });

// 3–4 · Title, questions
{
  const s = K.newSlide('SZ_COVER', 'Intro');
  K.text(s, 'YEAR 8 · DATA REPRESENTATION · LESSON 4', { x: M + 0.1, y: 2.3, w: 11, h: 0.4, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  K.text(s, 'Logic Gates', { x: M + 0.1, y: 2.8, w: 11.5, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: P.off });
  K.text(s, 'Decisions made of 1s and 0s', { x: M + 0.1, y: 4.05, w: 11, h: 0.6, fontFace: HEAD, fontSize: 28, color: P.muted });
  ['AND', 'OR', 'NOT'].forEach((g, i) => gateImg(s, g, M + 1.0 + i * 1.9, 5.55, 1.5));
  s.addNotes('Lesson 4. So far: how computers store numbers in binary. Today: how they make decisions with 1s and 0s, using '
    + 'logic gates. The three shapes along the bottom are the gates we meet today.');
}
S.questionsSlide(K, { section: 'Intro', topic: TOPIC, lesson: LESSON,
  notes: 'Same topic question as every lesson in the unit; today\'s lesson question underneath. "Real-world problem": a car that '
    + 'should only start when it is safe, an alarm, a light. By the end we turn a rule like that into a circuit.' });

// 5 · What a logic gate is
{
  const s = K.newSlide('SZ_DARK', 'Gates in real life', 'A logic gate makes a decision');
  const y = 2.3;
  ['A', 'B'].forEach((x, i) => {
    K.text(s, x, { x: M + 0.3, y: y + 0.25 + i * 1.1, w: 0.6, h: 0.6, fontFace: MONO, fontSize: 30, bold: true, color: P.off, align: 'center', valign: 'middle' });
    seg(s, M + 0.95, y + 0.55 + i * 1.1, M + 2.4, y + 0.55 + i * 1.1);
  });
  K.box(s, { x: M + 2.4, y, w: 2.6, h: 2.2, fill: P.panel, line: P.gold, lw: 2.5, r: 0.12 });
  K.text(s, 'LOGIC GATE', { x: M + 2.4, y, w: 2.6, h: 2.2, fontSize: 22, bold: true, color: P.gold, align: 'center', valign: 'middle', charSpacing: 2 });
  seg(s, M + 5.0, y + 1.1, M + 6.4, y + 1.1);
  K.text(s, 'Q', { x: M + 6.45, y: y + 0.8, w: 0.6, h: 0.6, fontFace: MONO, fontSize: 30, bold: true, color: P.off, align: 'center', valign: 'middle' });
  K.text(s, 'INPUTS', { x: M, y: y - 0.5, w: 2.2, h: 0.35, fontSize: 14, bold: true, color: P.dim, charSpacing: 2, align: 'center' });
  K.text(s, 'OUTPUT', { x: M + 5.6, y: y - 0.5, w: 2.2, h: 0.35, fontSize: 14, bold: true, color: P.dim, charSpacing: 2, align: 'center' });
  K.onClick(s, 1, () => {
    K.box(s, { x: 8.6, y: 2.0, w: 4.0, h: 2.6, fill: P.code, line: P.line, r: 0.08 });
    K.text(s, [{ text: '1', options: { color: P.gold, fontFace: MONO, bold: true, fontSize: 40 } }, { text: '   yes · on · true', options: { fontSize: 24 } }],
      { x: 8.9, y: 2.15, w: 3.6, h: 1.1, valign: 'middle' });
    K.text(s, [{ text: '0', options: { color: P.muted, fontFace: MONO, bold: true, fontSize: 40 } }, { text: '   no · off · false', options: { fontSize: 24 } }],
      { x: 8.9, y: 3.35, w: 3.6, h: 1.1, valign: 'middle' });
  });
  K.onClick(s, 2, () => S.banner(K, s, [{ text: 'Logic gate: ', options: { bold: true, color: P.gold } },
    { text: 'makes a decision. It takes inputs of 1 or 0 and gives one output.' }], 5.35, 0.95, 24));
  K.isys(s, { ...ISYS_GATE, click: 2 });
  K.addIcon(s, 'info');
  s.addNotes('A computer decides things with tiny switches called logic gates. Inputs go in on the left, one output comes out on the '
    + 'right. Click 1: every input and output is a bit, 1 or 0, and in logic 1 means yes, on, true; 0 means no, off, false. '
    + 'Click 2: the keyword. The gate\'s name says how it decides: today AND, OR and NOT.');
}

// 6–14 · AND, OR, NOT in real life (Task 1): each gate is taught, then straight onto whiteboards with set-ups of that gate
// before the next one (Nick, 2026-11-27).
lifeSlide({ title: 'AND: both must be true', before: 'The kettle boils when it has water ', gate: 'AND', after: ' the switch is on.',
  a: 'Has water', b: 'Switch on', q: 'Kettle boils', isys: ISYS_AND,
  rule: [{ text: 'AND gate: ', options: { bold: true, color: P.gold } }, { text: 'gives 1 only when both inputs are 1.' }],
  notes: 'Read the rule. Ask before each click: does it boil? Row 1: no water, switch off: no, 0. Row 2: switch on but no water: no. '
    + 'Row 3: water but switch off: no. Row 4: both: yes, 1. Click 5: the rule. One 0 anywhere and AND gives 0.' });
const AND_YOU = [
  { kind: 'words', text: 'The kettle has water, but the switch is off.', ask: 'Does it boil?', a: 0, why: '1 AND 0 = 0' },
  { kind: 'bits', g: 'AND', ins: [1, 1], a: 1, why: 'Both inputs are 1' },
  { kind: 'gate', g: 'AND', ins: [0, 1], a: 0, why: 'A is 0, so not both' },
];
setupSlide({ items: AND_YOU, prompt: 'write 1 or 0 for each card. They get harder.',
  notes: 'Boards up after each card, or all three at once. Card 1 is the kettle in words; card 2 the same rule in bits; card 3 the '
    + 'AND symbol from the last slide, bits on its input wires and Q on the right.' });
setupSlide({ reveal: true, items: AND_YOU,
  takeaway: [{ text: 'Any 0 going in: ', options: { bold: true, color: P.gold } }, { text: 'AND gives 0.' }],
  notes: 'Only card 2 gives 1. Anyone with 1 for card 3 is thinking "one is enough": that is the next gate.' });

lifeSlide({ title: 'OR: one is enough', before: 'The dog barks when someone knocks ', gate: 'OR', after: ' the doorbell rings.',
  a: 'Knock', b: 'Doorbell', q: 'Dog barks', isys: ISYS_OR,
  rule: [{ text: 'OR gate: ', options: { bold: true, color: P.gold } }, { text: 'gives 1 when the inputs have at least one 1.' }],
  notes: 'Ask first: does a knock on its own make it bark? Yes. A ring on its own? Yes. Both? Still yes: OR includes both. '
    + 'Only no knock and no ring gives 0. Click 5: the rule.' });
const OR_YOU = [
  { kind: 'words', text: 'Someone knocks. The doorbell does not ring.', ask: 'Does the dog bark?', a: 1, why: '1 OR 0 = 1' },
  { kind: 'bits', g: 'OR', ins: [0, 0], a: 0, why: 'No 1 going in' },
  { kind: 'gate', g: 'OR', ins: [1, 1], a: 1, why: 'At least one 1: both count' },
];
setupSlide({ items: OR_YOU, prompt: 'write 1 or 0 for each card. They get harder.',
  notes: 'Boards. Card 3 is the one to watch: 1 OR 1. The symbol is the one from the last slide: curved back, pointed front.' });
setupSlide({ reveal: true, items: OR_YOU,
  takeaway: [{ text: 'It is logic, not adding: ', options: { bold: true, color: P.gold } }, { text: '1 OR 1 is 1, not 2.' }],
  notes: 'Ask: what is 1 OR 1? Some will say 2. The output is only ever one bit, and OR gives 1 when there is at least one 1.' });

lifeSlide({ title: 'NOT: the opposite', before: 'The heating comes on when the room is ', gate: 'NOT', after: ' warm.',
  a: 'Room warm', q: 'Heating on',
  rule: [{ text: 'NOT gate: ', options: { bold: true, color: P.gold } }, { text: 'one input. It gives the opposite.' }],
  notes: 'NOT has only one input. Warm (1) → heating off (0). Not warm (0) → heating on (1). It flips the bit. '
    + 'Its table has only 2 rows, because one input can only be 0 or 1.' });
const NOT_YOU = [
  { kind: 'words', text: 'The room is warm.', ask: 'Heating on?', a: 0, why: 'Warm is 1, so NOT 1 = 0' },
  { kind: 'bits', g: 'NOT', ins: [0], a: 1, why: 'The opposite of 0' },
  { kind: 'gate', g: 'NOT', ins: [1], a: 0, why: 'The opposite of 1' },
];
setupSlide({ items: NOT_YOU, prompt: 'write 1 or 0 for each card. They get harder.',
  notes: 'Boards. NOT has one input, so the gate card has one wire going in. The small circle on the symbol means "opposite".' });
setupSlide({ reveal: true, items: NOT_YOU,
  takeaway: [{ text: 'NOT flips the bit: ', options: { bold: true, color: P.gold } }, { text: '1 becomes 0, 0 becomes 1.' }],
  notes: 'Quick: NOT 1? NOT 0? Then the task.' });
taskSlide({ section: 'Gates in real life', time: '8 MIN',
  tasks: [[1, 'Gates in real life', '4 steps: tap 1 or 0 for each situation, then fill the gaps']],
  note: 'A wrong answer shows the working and gives you a new question after a short wait.',
  notes: 'Task 1. Steps 1–3: one AND, one OR and one NOT sentence; tap 1 or 0 for each situation. Step 4: three sentences with a gap, '
    + 'and what happened in each situation is the clue for AND, OR or NOT. Bring the class back once most are on step 4.' });

// 12–17 · Symbols and truth tables (Tasks 2 and 3)
{
  const s = K.newSlide('SZ_DARK', 'Symbols and truth tables', 'Telling the symbols apart');
  const tips = { AND: 'flat back, round front: a D', OR: 'curved back, pointed front', NOT: 'triangle and a small circle: one input' };
  ['AND', 'OR', 'NOT'].forEach((g, i) => K.onClick(s, i + 1, () => {
    const x = M + i * 4.1;
    K.box(s, { x, y: 1.65, w: 3.9, h: 3.9, fill: P.panel, line: P.line, r: 0.1 });
    gateImg(s, g, x + 1.95, 2.85, 2.9);
    K.text(s, g, { x, y: 4.0, w: 3.9, h: 0.55, fontFace: MONO, fontSize: 30, bold: true, color: P.gold, align: 'center', valign: 'middle' });
    K.text(s, tips[g], { x: x + 0.2, y: 4.55, w: 3.5, h: 0.8, fontSize: 18, color: P.muted, align: 'center', valign: 'middle' });
  }));
  K.onClick(s, 4, () => S.banner(K, s, [{ text: 'Inputs on the left, ', options: { bold: true, color: P.gold } }, { text: 'the output on the right.' }], 5.8, 0.85, 24));
  K.addIcon(s, 'info');
  s.addNotes('Each symbol was met on its gate\'s slide; here they are side by side, one per click. AND: flat back and a round front, like a capital D (AND has a D in it). OR: curved back and a '
    + 'pointed front. NOT: a triangle with a small circle on its tip; the circle means "opposite". NOT has one input, the others two. '
    + 'Cover the names and quiz: point at a symbol, class says the gate.');
}
{
  const s = K.newSlide('SZ_DARK', 'Symbols and truth tables', 'A truth table for AND');
  K.box(s, { x: M, y: 1.7, w: 4.6, h: 3.4, fill: P.panel, line: P.line, r: 0.1 });
  gateImg(s, 'AND', M + 2.3, 3.4, 3.0);
  K.text(s, 'A', { x: M + 0.15, y: 2.85, w: 0.5, h: 0.4, fontFace: MONO, fontSize: 22, bold: true, color: P.off });
  K.text(s, 'B', { x: M + 0.15, y: 3.55, w: 0.5, h: 0.4, fontFace: MONO, fontSize: 22, bold: true, color: P.off });
  K.text(s, 'Q', { x: M + 4.1, y: 3.0, w: 0.5, h: 0.4, fontFace: MONO, fontSize: 22, bold: true, color: P.off });
  ttable(s, { x: 6.4, y: 1.6, heads: ['A', 'B'], rows: rows(2), rh: 0.62, cols: [{ head: 'Q', vals: '0001', at: [1, 2, 3, 4] }] });
  K.onClick(s, 5, () => S.banner(K, s, [{ text: 'Truth table: ', options: { bold: true, color: P.gold } },
    { text: 'the output for every input. Two inputs: 4 rows.' }], 5.45, 0.95, 24));
  K.isys(s, { ...ISYS_TT, click: 5 });
  S.modeChip(K, s, 'I DO');
  K.addIcon(s, 'info');
  s.addNotes('I do. The inputs are listed by counting up in binary: 00, 01, 10, 11. That way no combination is missed. '
    + 'One row per click: 0 AND 0 = 0, 0 AND 1 = 0, 1 AND 0 = 0, 1 AND 1 = 1. Point at the kettle slide: same pattern. '
    + 'Click 5: the keyword.');
}
{
  const s = K.newSlide('SZ_DARK', 'Symbols and truth tables', 'Truth tables for OR and NOT');
  gateImg(s, 'OR', M + 1.6, 2.1, 1.9);
  ttable(s, { x: M + 0.1, y: 2.85, heads: ['A', 'B'], rows: rows(2), rh: 0.6, cols: [{ head: 'Q', vals: '0111', at: [1, 2, 3, 4] }] });
  gateImg(s, 'NOT', M + 7.3, 2.1, 1.9);
  ttable(s, { x: M + 6.6, y: 2.85, heads: ['A'], rows: rows(1), rh: 0.6, cols: [{ head: 'Q', vals: '10', at: [5, 6] }] });
  S.modeChip(K, s, 'WE DO');
  K.addIcon(s, 'practice');
  s.addNotes('We do: the class says each output before the click. OR: 0 0 → 0; any row with a 1 → 1, including 1 1. '
    + 'NOT: only 2 rows, because one input can only be 0 or 1. 0 → 1, 1 → 0.');
}
const WHICH_YOU = [
  { q: '0111', a: 'OR', why: '1 when there is at least one 1' },
  { q: '10', a: 'NOT', why: '2 rows: one input, flipped' },
  { q: '0001', a: 'AND', why: '1 only when both inputs are 1' },
];
youDoSlide({ section: 'Symbols and truth tables', title: 'Which gate?', items: WHICH_YOU, qSize: 44,
  prompt: 'which gate gives this output column? Rows go 00, 01, 10, 11.', time: '1 MIN',
  notes: 'Each is the Q column of a truth table, top to bottom. Count the rows first: 2 rows means one input, so NOT.' });
youDoSlide({ section: 'Symbols and truth tables', title: 'Which gate? — answers', items: WHICH_YOU, qSize: 44, reveal: true,
  takeaway: [{ text: 'AND has one 1. OR has one 0. ', options: { bold: true, color: P.gold } }, { text: 'NOT has only 2 rows.' }],
  notes: 'A quick way to tell them apart in a table. The page\'s last truth-table step asks exactly this.' });
taskSlide({ section: 'Symbols and truth tables', time: '12 MIN',
  tasks: [[2, 'Gate symbols', 'drag the names onto the symbols, then onto gates in a circuit'],
    [3, 'Truth tables', 'fill in AND, OR and NOT, then name a gate from its table']],
  note: 'Drag a name onto a box, or tap the name and then tap the box.',
  notes: 'Task 2: a shape key on step 1, then none; steps 3–4 name every gate in a circuit. Task 3: tap each output box to set 0 or 1; '
    + 'step 4 shows only the symbol; step 5 is "which gate?". Task 4 stays locked until Task 3 is passed.' });

// 18–24 · Trace a circuit (Task 4)
traceSlide({ title: 'One gate feeds the next', layout: 'notIn', build: { g1: 'NOT', g2: 'AND' }, mode: 'I DO',
  notes: 'I do. In a circuit, one gate\'s output becomes the next gate\'s input. We call the middle wire P. '
    + 'Each row: P first (NOT A), then Q (P AND B). Row 00: P = NOT 0 = 1, Q = 1 AND 0 = 0. Row 01: P = 1, Q = 1 AND 1 = 1. '
    + 'Rows 10 and 11: P = 0, so Q = 0. Point at the strip each time: P, P goes in, Q.' });
// We do on the same shape as the I do (Nick, 2026-11-27, after the first class: students copied B or P into Q
// instead of putting P and B into the second gate). One row at a time, boards up for each Q.
traceSlide({ title: 'P and B go into the next gate', layout: 'notIn', build: { g1: 'NOT', g2: 'OR' }, mode: 'WE DO',
  notes: 'We do, one row at a time, boards up before each click. Ask for P (NOT A), click. Then point at the two wires going '
    + 'into the OR gate: P and B. Read them out ("P is 1, B is 0"), then ask for Q: 1 OR 0 = 1. Click. '
    + 'Row 10 is the one people get wrong: A = 1, so P = 0, and 0 OR 0 = 0. Q is never just a copy of B or of P.' });
traceSlide({ title: 'One gate feeds the next', layout: 'notOut', build: { g1: 'OR', g2: 'NOT' }, mode: 'WE DO',
  notes: 'We do: this time the NOT comes last. Ask for P before each click: A OR B. Then Q is just the opposite of P.' });
traceSlide({ title: 'Your turn', layout: 'notOut', build: { g1: 'AND', g2: 'NOT' }, mode: 'YOU DO',
  notes: 'Boards: copy the four rows of A and B, add P and Q. P = A AND B, then Q = NOT P.' });
traceSlide({ title: 'Answers', layout: 'notOut', build: { g1: 'AND', g2: 'NOT' }, mode: 'YOU DO', reveal: true,
  takeaway: [{ text: 'P first, then Q: ', options: { bold: true, color: P.gold } }, { text: 'the middle wire is the next gate\'s input.' }],
  notes: 'Only row 11 gives P = 1, so only row 11 gives Q = 0. Anyone with 0001 for Q forgot the NOT at the end.' });
taskSlide({ section: 'Trace a circuit', time: '10 MIN',
  tasks: [[4, 'Trace a circuit', 'fill in P, then Q, for every row']],
  note: 'Got one wrong? The same circuit comes back: fix the empty boxes. ★ Extension: three inputs, 8 rows.',
  notes: 'Task 4. Step 1 gives P; from step 2 they fill both. A wrong answer brings the same circuit back with the wrong boxes '
    + 'emptied; after fixing it they do one more new circuit. The ★ extension has three inputs and 8 rows; it is not needed to pass.' });

// 24–26 · Build it (Task 5)
{
  const s = K.newSlide('SZ_DARK', 'Build it', 'From a rule to a circuit');
  K.box(s, { x: M, y: 1.55, w: 12.13, h: 0.9, fill: P.panel, line: P.line, r: 0.08 });
  K.text(s, [{ text: 'The fan comes on when the window is ' }, { text: 'NOT', options: { bold: true, color: P.gold, fontFace: MONO } },
    { text: ' open ' }, { text: 'AND', options: { bold: true, color: P.gold, fontFace: MONO } }, { text: ' it is hot.' }],
    { x: M + 0.35, y: 1.55, w: 11.5, h: 0.9, fontSize: 26, valign: 'middle' });
  K.text(s, [{ text: 'A', options: { fontFace: MONO, bold: true, color: P.gold } }, { text: ' = window open      ' },
    { text: 'B', options: { fontFace: MONO, bold: true, color: P.gold } }, { text: ' = it is hot      ' },
    { text: 'Q', options: { fontFace: MONO, bold: true, color: P.gold } }, { text: ' = fan on' }],
    { x: M + 0.35, y: 2.55, w: 11.5, h: 0.5, fontSize: 20, color: P.muted, valign: 'middle' });
  circuit(s, 'notIn', { x: M + 0.2, y: 3.15, u: 0.0118, build: { g1: 'NOT', g2: 'AND' }, names: true,
    at: { g1: 1, 'g1.0': 1, g2: 2, 'g2.1': 2 }, litAt: 3 });
  K.onClick(s, 3, () => {
    K.box(s, { x: 8.7, y: 3.4, w: 3.95, h: 1.7, fill: P.code, line: P.line, r: 0.08 });
    K.text(s, [{ text: 'Test: ', options: { bold: true, color: P.gold } }, { text: 'window shut, hot' }], { x: 8.95, y: 3.5, w: 3.6, h: 0.5, fontSize: 20, valign: 'middle' });
    K.text(s, 'A = 0, B = 1 → Q = 1', { x: 8.95, y: 4.05, w: 3.6, h: 0.5, fontFace: MONO, fontSize: 20, bold: true, color: P.ok, valign: 'middle' });
    K.text(s, 'the fan comes on ✓', { x: 8.95, y: 4.55, w: 3.6, h: 0.45, fontSize: 18, color: P.muted, valign: 'middle' });
  });
  strip(s, ['Find the gate words', 'A gate in each box', 'Test it'], [0, 1, 3]);
  S.modeChip(K, s, 'I DO');
  K.addIcon(s, 'info');
  s.addNotes('I do, the end point of the lesson. The gate words are in the rule already. Which input does the NOT belong to? '
    + 'The window: NOT open. Click 1: NOT in the first box, with A going into it. Click 2: its output and B go into an AND. '
    + 'Click 3: test it like the switches on the page: window shut (0), hot (1): NOT 0 = 1, 1 AND 1 = 1, the fan comes on. '
    + 'Try window open (1): NOT 1 = 0, so the fan stays off. Good.');
}
{
  const s = K.newSlide('SZ_DARK', 'Build it', 'From a truth table to a circuit');
  K.text(s, 'Build a circuit that gives this table:', { x: M, y: 1.5, w: 7, h: 0.5, fontSize: 22, valign: 'middle' });
  ttable(s, { x: M, y: 2.05, heads: ['A', 'B'], rows: rows(2), rh: 0.58, cols: [
    { head: 'A AND B', w: 1.7, vals: '0001', at: 1, color: P.muted },
    { head: 'Q', vals: '1110', color: P.gold },
  ] });
  K.onClick(s, 2, () => K.text(s, [{ text: 'Q is the opposite of A AND B', options: { bold: true, color: P.gold } }, { text: ', so NOT comes last.' }],
    { x: M, y: 4.95, w: 7.0, h: 0.6, fontSize: 22, valign: 'middle' }));
  circuit(s, 'notOut', { x: 5.75, y: 2.0, u: 0.0115, build: { g1: 'AND', g2: 'NOT' }, names: true,
    at: { g1: 3, 'g1.0': 3, 'g1.1': 3, g2: 4 } });
  strip(s, ['Working column', 'Compare it with Q', 'Build it'], [1, 2, 3]);
  S.modeChip(K, s, 'WE DO');
  K.addIcon(s, 'practice');
  s.addNotes('We do. There is no story, only the table. Q is 1 on three rows: that looks a bit like OR, but 1 1 gives 0. '
    + 'Click 1: on the page they can add a working column; try A AND B: 0001. Click 2: Q is exactly the opposite of it. '
    + 'Click 3: so AND first, with A and B into it; click 4: then NOT. Check one row aloud: 1 1 → AND 1 → NOT 0. ✓');
}
taskSlide({ section: 'Build it', time: '20 MIN',
  tasks: [[5, 'Build it', 'drag in the gates and inputs, test with the switches, then check'], [6, 'Plenary', '5 in a row'],
    ['★', 'Logic Rush', 'the class challenge: type code GATES1']],
  notes: 'Task 5: Check tries every row of the truth table, so any circuit that works is right; a wrong one shows which rows are wrong. '
    + 'Step 3 is a table only: remind them about the working column. Task 6: one wrong answer starts it again. '
    + 'Logic Rush is the extension: write a class code on the board (GATES1, or any code up to 8 letters and digits). The first couple of '
    + 'minutes are logic only, then hex, binary adding and denary join in. Best scores show at the top of the page and on the hub\'s Live '
    + 'leaderboard. The game does not change their grade.' });

// 27 · Plenary
{
  const s = S.plenarySlide(K, { section: 'Plenary', lesson: LESSON,
    tasks: ['Write the Q column for A OR B (rows 00, 01, 10, 11).', 'Light on when the switch is on AND it is NOT daytime. Which gates?'],
    notes: 'Exit task on boards, then click for each answer. 1: 0111. 2: A = switch on, B = daytime: B goes into a NOT, then that and A '
      + 'into an AND. Then the lesson question aloud: a real rule becomes AND, OR and NOT, each one a gate, and the truth table checks every input.' });
  K.onClick(s, 1, () => K.text(s, [{ text: '0111', options: { color: P.ok } }, { text: '   at least one 1 → 1', options: { color: P.muted, fontSize: 20 } }],
    { x: M + 0.7, y: 3.75, w: 8, h: 0.55, fontFace: MONO, fontSize: 26, bold: true, valign: 'middle' }));
  K.onClick(s, 2, () => {
    K.text(s, [{ text: 'NOT', options: { color: P.ok } }, { text: ' on daytime, then ', options: { color: P.muted, fontSize: 20, fontFace: 'Lato', bold: false } },
      { text: 'AND', options: { color: P.ok } }, { text: ' with the switch', options: { color: P.muted, fontSize: 20, fontFace: 'Lato', bold: false } }],
      { x: M + 0.7, y: 5.0, w: 9, h: 0.5, fontFace: MONO, fontSize: 26, bold: true, valign: 'middle' });
  });
  K.onClick(s, 3, () => S.banner(K, s, [{ text: 'Answer: ', options: { bold: true, color: P.gold } },
    { text: "the rule's AND, OR and NOT become gates; a truth table checks every input." }], 5.65, 0.85, 22));
}

// DECK_OUT writes somewhere else (e.g. a preview while the deck is open in PowerPoint).
K.write(process.env.DECK_OUT || path.join(__dirname, 'L4_Logic_Gates.pptx'));
