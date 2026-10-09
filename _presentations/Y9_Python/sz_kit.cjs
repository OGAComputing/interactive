// Station Zero slide kit — shared by every Y9 Python deck builder (lesson decks and the template).
// Follows _presentations/ppt-guidelines.md §9. README.md in this folder holds the rules and feedback log.
//
//   const { createDeck } = require('./sz_kit.cjs');
//   const K = createDeck({ title, footerText });
//   const s = K.newSlide('SZ_DARK', 'Section', 'Slide title');   // layouts: SZ_DARK, SZ_LIGHT, SZ_COVER
//   …
//   K.write('Deck.pptx');

const path = require('path');
// Falls back to the global npm folder, so `npm install -g pptxgenjs` is enough (jszip comes with it).
const requireGlobal = (name) => {
  try { return require(name); } catch {
    const root = require('child_process').execSync('npm root -g').toString().trim();
    try { return require(path.join(root, name)); } catch { return require(path.join(root, 'pptxgenjs', 'node_modules', name)); }
  }
};
const pptxgen = requireGlobal('pptxgenjs');

function createDeck({ title, footerText, author = 'Nicholas Houlton', station: startState = 'none' }) {
// ── Palette ─────────────────────────────────────────────────────────────────
// Approved: charcoal / gold / off-white. Station Zero adds phosphor green (story text only)
// and alarm red (error messages only).
const P = {
  charcoal: '1E1E24', deep: '141418', panel: '2A2A32', code: '111115', line: '3A3A44',
  gold: 'D8A73D', off: 'F5F5F3', muted: 'A9A9B4', dim: '6E6E7A',
  str: 'E69F00', int: '56B4E9', fn: 'E8C878',
  green: '7FD99A', termBg: '0D1310', termLine: '2C4434',
  red: 'FF6B6B', ok: '7FD99A',
  ink: '1E1E24', paper: 'F5F5F3', card: 'FFFFFF', cardLine: 'D6D5D0', inkMuted: '55555F',
};
const THEME = {
  name: 'Station Zero',
  headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: {
    dk1: P.charcoal, lt1: P.off, dk2: P.deep, lt2: 'E9E8E4',
    accent1: P.gold, accent2: P.str, accent3: P.int, accent4: P.green, accent5: P.red, accent6: P.muted,
    hlink: P.int, folHlink: P.muted,
  },
};
const HEAD = 'Cambria', BODY = 'Calibri', MONO = 'Consolas';

const W = 13.333, M = 0.6;
const ICON = {
  clarity: 'ClarityOfLearningIntentions', info: 'NewInformation', practice: 'DeliberatePractice',
  recall: 'RecapAndRecall', feedback: 'Feedback',
};
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

// ── Layouts ─────────────────────────────────────────────────────────────────
const footer = (color) => ([
  { text: { text: footerText, options: {
    x: M, y: 6.98, w: 6, h: 0.3, fontFace: BODY, fontSize: 12, color, charSpacing: 2, margin: 0 } } },
]);
const titlePh = (color) => ({ placeholder: { options: {
  name: 'title', type: 'title', x: M, y: 0.45, w: 10.3, h: 0.85,
  fontFace: HEAD, fontSize: 36, bold: true, color, align: 'left', valign: 'middle', margin: 0 }, text: '' } });

pres.defineSlideMaster({
  title: 'SZ_DARK', background: { color: P.charcoal },
  objects: [...footer(P.dim), titlePh(P.off)],
  slideNumber: { x: 12.2, y: 6.98, w: 0.55, h: 0.3, fontFace: BODY, fontSize: 12, color: P.dim, align: 'right' },
});
pres.defineSlideMaster({
  title: 'SZ_LIGHT', background: { color: P.paper },
  objects: [...footer('8A8A93'), titlePh(P.ink)],
  slideNumber: { x: 12.2, y: 6.98, w: 0.55, h: 0.3, fontFace: BODY, fontSize: 12, color: '8A8A93', align: 'right' },
});
pres.defineSlideMaster({ title: 'SZ_COVER', background: { color: P.deep }, objects: [] });

// ── Station state ───────────────────────────────────────────────────────────
// The slides decay with the story (README.md, "Station state"). Damage is drawn only in the frame:
// edges, corners and the status line above the title. It sits under everything else on the slide,
// so code, terminals and memory boxes always stay clean. Art: station/*.png (make_station_art.py).
// hud: status-line items; a function gets i = slides since this state began (e.g. a falling O2 level).
const STATION = {
  none: {},
  L1:  { frost: true, dot: 'C8E4FF', hud: ['CRYO BAY', 'TEMP −41°C', 'POWER 12%', 'CREW AWAKE 1/5'] },
  L1b: { frost: true, dot: P.str, hud: ['LIFE SUPPORT', (i) => `O2 ${Math.max(9, 94 - i * 3)}%`, 'POWER 31%', 'CREW AWAKE 1/5'] },
  L2:  { edge: 'amber', dot: P.str, hud: ['SENSOR OPS', 'MOTION DETECTED', 'BIO-SCAN: NOT HUMAN'] },
  L3:  { edge: 'red', hazard: true, dot: P.red, hud: ['LOCKDOWN', 'AIRLOCK CYCLING', 'WARDEN: NO RESPONSE'] },
  L4:  { static: true, dot: P.int, hud: ['NAV BEACON', 'SIGNAL WEAK ▂▁▃▁', 'RESCUE SHIP: NO REPLY'] },
  L5:  { cracks: true, edge: 'red', dot: P.red, hud: ['HULL BREACH · DECK 2', 'DRONE ONLINE', 'O2 VENTING'] },
  L6:  { dot: P.gold, hud: ['SYSTEMS CHECK', 'DIAGNOSTIC MODE'] },
  L7:  { cracks: true, edge: 'red', static: true, dot: P.red, hud: ['LAST STAND', 'SYSTEMS DAMAGED', 'RESCUE SHIP DOCKING'] },
};
let state = {}, stateSlide = 0, beatFrom = null;
const beatSlides = [];
// Switch state for the slides that follow. overrides change single layers, e.g. station('L7', { static: false })
// as each system is repaired.
function station(name, overrides = {}) {
  if (!STATION[name]) throw new Error(`Unknown station state "${name}" (${Object.keys(STATION).join(', ')})`);
  state = { ...STATION[name], ...overrides };
  stateSlide = 0;
}
// A story beat: the next slide fades in through black, then whatever damage is new creeps in by itself.
function beat(name, overrides) { const before = state; station(name, overrides); beatFrom = before; }
function drawStation(s, master) {
  const light = master === 'SZ_LIGHT';
  const layers = [['frost', state.frost && !light], ['edge_' + state.edge, !!state.edge], ['hazard', state.hazard],
    ['static', state.static && !light], ['cracks', state.cracks]];
  const isNew = (f) => !!beatFrom && (f.startsWith('edge_') ? f !== 'edge_' + beatFrom.edge : !beatFrom[f]);
  layers.filter(([, on]) => on).forEach(([f]) => s.addImage({ path: path.join(__dirname, 'station', f + '.png'),
    x: 0, y: 0, w: W, h: 7.5, objectName: (isNew(f) ? 'auto · ' : '') + 'station ' + f, altText: '' }));
  if (state.hud) {
    const items = state.hud.map((h) => (typeof h === 'function' ? h(stateSlide) : h));
    s.addText([{ text: '●  ', options: { color: state.dot || P.dim } },
      { text: items.join('   ·   '), options: { color: light ? '8A8A93' : P.dim } }],
    { isTextBox: true, x: M, y: 0.08, w: 11.2, h: 0.26, margin: 0, fontFace: MONO, fontSize: 11, charSpacing: 1,
      valign: 'middle', objectName: 'station status' });
  }
  if (beatFrom) { beatSlides.push(slideNo); beatFrom = null; }
  stateSlide++;
}
station(startState);

// ── Helpers ─────────────────────────────────────────────────────────────────
let slideNo = 0;
const sections = new Set();
function newSlide(master, section, title) {
  if (!sections.has(section)) { pres.addSection({ title: section }); sections.add(section); }
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  slideNo++;
  drawStation(s, master);
  if (title) s.addText(title, { placeholder: 'title' });
  return s;
}
// Click animation: everything draw() adds to the slide fades in on click k (1, 2, 3 …).
// pptxgenjs can't write animations, so this only names the shapes "click<k>"; write() adds the timing XML.
function onClick(s, k, draw) {
  const orig = { addText: s.addText, addShape: s.addShape, addImage: s.addImage };
  const tag = (o = {}) => ({ ...o, objectName: `click${k}` + (o.objectName ? ' · ' + o.objectName : '') });
  s.addText = (t, o) => orig.addText.call(s, t, tag(o));
  s.addShape = (type, o) => orig.addShape.call(s, type, tag(o));
  s.addImage = (o) => orig.addImage.call(s, tag(o));
  try { draw(); } finally { Object.assign(s, orig); }
}

// Pillar icon: always added last-ish (after any background shapes), flat, no shadow.
// pos is optional ({ x, y, d }); the default is the standard top-right spot.
function addIcon(s, kind, pos = {}) {
  const d = pos.d || 0.8;
  s.addImage({ path: path.join(__dirname, 'icons', ICON[kind] + '.png'), x: pos.x ?? 12.0, y: pos.y ?? 0.42, w: d, h: d,
    altText: { clarity: 'Clarity of learning intentions', info: 'New information', practice: 'Deliberate practice',
      recall: 'Recap and recall', feedback: 'Feedback' }[kind] });
}
function text(s, t, o) { s.addText(t, { isTextBox: true, margin: 0, fontFace: BODY, color: P.off, ...o }); }
function box(s, o) {
  s.addShape(o.r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: o.fill },
    line: o.line ? { color: o.line, width: o.lw || 1.25 } : { type: 'none' },
    rectRadius: o.r || undefined, objectName: o.name,
  });
}
function chip(s, label, o) { // small uppercase label / pill
  box(s, { x: o.x, y: o.y, w: o.w, h: o.h || 0.36, fill: o.fill, r: 0.18, line: o.line });
  text(s, label, { x: o.x, y: o.y, w: o.w, h: o.h || 0.36, fontSize: o.size || 13, bold: true,
    color: o.color, align: 'center', valign: 'middle', charSpacing: o.cs ?? 1 });
}
function timer(s, label, dark = true) {
  chip(s, '⏱  ' + label, { x: 10.35, y: 0.62, w: 1.4, fill: dark ? P.charcoal : P.paper,
    line: dark ? P.gold : P.ink, color: dark ? P.gold : P.ink, size: 14 });
}
function arrow(s, x1, y1, x2, y2, color = P.muted) {
  s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 2.25, endArrowType: 'triangle' } });
}

// Python syntax colouring → pptxgenjs runs. Strings = str colour, numbers = int colour.
const BUILTINS = new Set(['print', 'input', 'int', 'str']);
function pyRuns(src, size, base = P.off) {
  const runs = [];
  const re = /("[^"\n]*"?|'[^'\n]*'?)|(\b\d+\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(src))) {
    let color = base;
    if (m[1]) color = P.str;
    else if (m[2]) color = P.int;
    else if (m[3] && BUILTINS.has(m[3])) color = P.fn;
    else if (m[5]) color = P.muted;
    runs.push({ text: m[0], options: { color, fontFace: MONO, fontSize: size } });
  }
  return runs;
}
// Code panel: one text box per line so annotations can line up with lines exactly.
// Returns the y-centre of each line.
function codePanel(s, lines, o) {
  const size = o.size || 22, lh = o.lh || size * 1.65 / 72, padY = 0.22, gut = o.nums === false ? 0 : 0.5;
  const h = o.h || lines.length * lh + padY * 2;
  box(s, { x: o.x, y: o.y, w: o.w, h, fill: P.code, line: P.line, r: 0.08, name: o.name || 'code' });
  const ys = [];
  lines.forEach((ln, i) => {
    const y = o.y + padY + i * lh;
    if (o.hl && o.hl.includes(i + 1)) box(s, { x: o.x + 0.06, y, w: o.w - 0.12, h: lh, fill: '2B2618' });
    if (gut) text(s, String(i + (o.first || 1)), { x: o.x + 0.12, y, w: 0.3, h: lh, fontFace: MONO, fontSize: size - 4,
      color: P.dim, align: 'right', valign: 'middle' });
    s.addText(pyRuns(ln, size), { isTextBox: true, x: o.x + 0.2 + gut, y, w: o.w - 0.3 - gut, h: lh,
      margin: 0, valign: 'middle' });
    ys.push(y + lh / 2);
  });
  return { ys, h, lh };
}
// Terminal panel (program output, or story text in phosphor green).
function terminal(s, lines, o) {
  const size = o.size || 20, lh = o.lh || size * 1.6 / 72, pad = 0.25;
  const story = o.story;
  const h = o.h || lines.length * lh + pad * 2 + (o.label ? 0.35 : 0);
  box(s, { x: o.x, y: o.y, w: o.w, h, fill: story ? P.termBg : '0A0A0D', line: story ? P.termLine : P.line, r: 0.08,
    name: o.name || 'terminal' });
  let y = o.y + pad;
  if (o.label) {
    text(s, o.label, { x: o.x + 0.25, y: y - 0.05, w: o.w - 0.5, h: 0.3, fontSize: 12, bold: true,
      color: story ? P.green : P.muted, charSpacing: 2 });
    y += 0.35;
  }
  const ys = [];
  lines.forEach((ln) => {
    const runs = (Array.isArray(ln) ? ln : [{ text: ln }]).map(r => ({ text: r.text, options: {
      fontFace: MONO, fontSize: size, color: r.color || (story ? P.green : P.off), bold: !!r.bold } }));
    s.addText(runs, { isTextBox: true, x: o.x + 0.25, y, w: o.w - 0.5, h: lh, margin: 0, valign: 'middle' });
    ys.push(y + lh / 2);
    y += lh;
  });
  return { ys, h };
}
// Variable box, styled like the activities' memory view: label chip "name · type" in the
// type's colour, value inside. Strings show their quotes.
function varBox(s, o) {
  const c = o.type === 'str' ? P.str : o.type === 'int' ? P.int : P.muted;
  const w = o.w || 2.2, h = o.h || 0.95;
  box(s, { x: o.x, y: o.y, w, h, fill: P.code, line: c, lw: 2, r: 0.06 });
  const lab = o.name ? `${o.name}  ·  ${o.type}` : o.type;
  const lw = Math.max(0.9, lab.length * 0.11 + 0.3);
  box(s, { x: o.x + 0.15, y: o.y - 0.2, w: lw, h: 0.38, fill: c, r: 0.05 });
  text(s, lab, { x: o.x + 0.15, y: o.y - 0.2, w: lw, h: 0.38, fontFace: MONO, fontSize: 14, bold: true,
    color: P.code, align: 'center', valign: 'middle' });
  text(s, o.value, { x: o.x + 0.1, y: o.y + 0.2, w: w - 0.2, h: h - 0.25, fontFace: MONO, fontSize: o.size || 26,
    color: P.off, align: 'center', valign: 'middle' });
}
function badge(s, n, x, y, d = 0.48, fill = P.gold, color = P.charcoal) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  text(s, String(n), { x, y, w: d, h: d, fontSize: d > 0.45 ? 20 : 16, bold: true, color, align: 'center', valign: 'middle',
    fontFace: HEAD });
}

pres.title = title;
pres.author = author;

// Recap & Recall: 2×2 question cards. reveal = the dark answers version (same layout).
const CARD = { w: 5.92, h: 2.5, xs: [M, M + 5.92 + 0.3], ys: [1.75, 1.75 + 2.5 + 0.15] };
function recallCards(s, questions, reveal) {
  questions.forEach((q, i) => {
    const x = CARD.xs[i % 2], y = CARD.ys[Math.floor(i / 2)];
    box(s, { x, y, w: CARD.w, h: CARD.h, r: 0.08, fill: reveal ? P.panel : P.card, line: reveal ? P.line : P.cardLine,
      name: `q${i + 1}` });
    const ink = reveal ? P.off : P.ink;
    badge(s, i + 1, x + 0.25, y + 0.22, 0.42, reveal ? P.gold : P.ink, reveal ? P.charcoal : P.paper);
    chip(s, q.pill, { x: x + 0.8, y: y + 0.25, w: 1.75, h: 0.34, size: 12, fill: reveal ? P.charcoal : 'EDE6D3',
      color: reveal ? P.gold : '7A5A12', line: reveal ? P.gold : undefined });
    chip(s, q.type === 'mcq' ? 'CHOOSE A, B OR C' : 'WRITE IT', { x: x + 2.65, y: y + 0.25, w: 1.95, h: 0.34, size: 12,
      fill: reveal ? P.charcoal : P.paper, color: reveal ? P.muted : P.inkMuted, line: reveal ? P.line : P.cardLine });
    text(s, q.q, { x: x + 0.25, y: y + 0.7, w: CARD.w - 0.5, h: 0.45, fontSize: 20, bold: true, color: ink });
    // body: code and/or options
    let by = y + 1.15;
    const codeW = q.type === 'mcq' && q.code ? 2.5 : CARD.w - 0.5;
    if (q.code) {
      const lh = 0.33;
      box(s, { x: x + 0.25, y: by, w: codeW, h: q.code.length * lh + 0.2, fill: P.code, r: 0.06 });
      q.code.forEach((ln, j) => s.addText(pyRuns(ln, 18), { isTextBox: true, x: x + 0.4, y: by + 0.1 + j * lh,
        w: codeW - 0.3, h: lh, margin: 0, valign: 'middle' }));
    }
    if (q.type === 'mcq') {
      const ox = q.code ? x + 3.0 : x + 0.25, oy = by;
      q.opts.forEach((o, j) => {
        const right = reveal && q.a.startsWith('ABC'[j]);
        text(s, [{ text: 'ABC'[j] + '   ', options: { bold: true, color: right ? P.ok : (reveal ? P.gold : '7A5A12') } },
          { text: o, options: { color: right ? P.ok : (reveal ? P.muted : P.ink), bold: right } }],
          { x: ox, y: oy + j * 0.36, w: q.code ? 0.75 : 3.3, h: 0.36, fontSize: 18, valign: 'middle' });
      });
    }
    if (reveal && q.type === 'write') {
      const ay = by + q.code.length * 0.33 + 0.28;
      text(s, [{ text: q.a, options: { bold: true, color: P.ok, fontSize: 22,
        fontFace: q.aMono ? MONO : BODY } }, { text: '   ' + q.why, options: { color: P.muted, fontSize: 18,
        fontFace: q.whyMono ? MONO : BODY } }],
        { x: x + 0.25, y: ay, w: CARD.w - 0.5, h: 0.4, valign: 'middle' });
    }
    if (reveal && q.type === 'mcq') {
      const wx = q.code ? x + 3.85 : x + 3.65;
      text(s, q.why, { x: wx, y: by, w: x + CARD.w - 0.2 - wx, h: 1.08, fontSize: 18, italic: true,
        color: P.muted, valign: 'middle' });
    }
  });
}

function chapterTask(s, o) {
  text(s, o.kicker, { x: M, y: 0.6, w: 6, h: 0.35, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  text(s, o.title, { x: M, y: 1.0, w: 6, h: 1.0, fontFace: HEAD, fontSize: 48, bold: true });
  terminal(s, o.log, { x: M, y: 2.35, w: 5.7, size: 20, story: true, label: o.logLabel, h: 3.05 });
  // task card
  const x = 6.75, w = 5.98;
  box(s, { x, y: 1.55, w, h: 4.85, fill: P.panel, line: P.line, r: 0.08 });
  text(s, 'YOUR TASK', { x: x + 0.35, y: 1.8, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  text(s, [{ text: 'Open ' }, { text: o.activity, options: { bold: true, color: P.gold } },
    { text: ' from Google Classroom' }], { x: x + 0.35, y: 2.15, w: w - 0.7, h: 0.9, fontSize: 26, valign: 'middle' });
  const stages = [['P', 'Predict'], ['R', 'Run'], ['I', 'Investigate'], ['M', 'Modify'], ['M', 'Make']];
  const pw = 1.0, pg = 0.07;
  stages.forEach(([l, n], i) => {
    const px = x + 0.35 + i * (pw + pg);
    box(s, { x: px, y: 3.35, w: pw, h: 0.75, fill: P.charcoal, line: P.gold, r: 0.06 });
    text(s, l, { x: px, y: 3.35, w: pw, h: 0.75, fontFace: HEAD, fontSize: 28, bold: true, color: P.gold,
      align: 'center', valign: 'middle' });
    text(s, n, { x: px - 0.1, y: 4.15, w: pw + 0.2, h: 0.3, fontSize: 12, color: P.muted, align: 'center' });
  });
  text(s, o.note, { x: x + 0.35, y: 4.75, w: w - 0.7, h: 1.4, fontSize: 19, color: P.off, valign: 'middle' });
  chip(s, '⏱  ' + o.time, { x: x + w - 1.65, y: 1.78, w: 1.4, fill: P.charcoal, line: P.gold, color: P.gold, size: 14 });
  addIcon(s, 'practice');
}

// o: { y, cols: ['Line', …variables…, 'Output'], colW, rows: [[…], …] }
function traceTable(s, o) {
  const x = M, y = o.y ?? 4.2, cws = o.colW, rh = 0.52, head = o.cols, vals = o.rows, last = head.length - 1;
  const isVar = (i) => i > 0 && i < last;
  const opt = (t, o = {}) => ({ text: t, options: { fontFace: o.mono ? MONO : BODY, fontSize: 20, color: o.color || P.off,
    bold: !!o.bold, fill: { color: o.fill || P.charcoal }, align: o.align || 'center', valign: 'middle',
    border: { type: 'solid', color: P.line, pt: 1 } } });
  const rows = [head.map((h, i) => opt(h, { bold: true, fill: P.panel, color: isVar(i) ? P.int : P.gold, mono: isVar(i) })),
    ...vals.map(r => r.map((v, i) => i === 0 ? opt(v, { color: P.muted })
      : i === last ? opt(v, { mono: true, align: 'left', color: P.gold })
      : opt(v, { mono: true, color: P.int, bold: true })))];
  s.addTable(rows, { x, y, w: cws.reduce((a, b) => a + b), colW: cws, rowH: rh, margin: [0.04, 0.15, 0.04, 0.15] });
}

// Template deck only: a one-line note in the footer row saying which recipe this is (see README.md).
function templateNote(s, t, light = false) {
  text(s, t, { x: 4.6, y: 6.95, w: 7.45, h: 0.35, fontSize: 13, italic: true, bold: true,
    color: light ? '7A5A12' : P.gold, align: 'right', valign: 'middle' });
}

async function write(out, theme = THEME) {
  await pres.writeFile({ fileName: out });
  await addClickAnimations(out, beatSlides);
  if (process.env.APPLY_THEME) {
    const { applyTheme } = require(process.env.APPLY_THEME);
    await applyTheme(out, theme);
  }
  console.log(`Wrote ${out} (${slideNo} slides)`);
}

return { pres, P, THEME, HEAD, BODY, MONO, W, M, newSlide, addIcon, text, box, chip, timer, arrow, pyRuns,
  codePanel, terminal, varBox, badge, recallCards, chapterTask, traceTable, templateNote, onClick, station, beat,
  STATES: Object.keys(STATION), write };
}

// Adds a fade-in on click for every shape named "click<k>" (see onClick): click 1 shows all the
// click1 shapes together, then click 2, and so on. Shapes named "auto…" (new station damage on a
// story beat) fade in by themselves as the slide opens, before any click. Beat slides (1-based
// numbers in beats) also get a slow fade-through-black transition: the lights go out.
async function addClickAnimations(file, beats = []) {
  const fs = require('fs');
  const JSZip = requireGlobal('jszip');
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
  for (const f of slides) {
    let xml = await zip.file(f).async('string');
    const isBeat = beats.includes(+f.match(/slide(\d+)\.xml$/)[1]);
    const groups = new Map();   // click number → shape ids; 0 = auto (plays as the slide opens)
    const textIds = new Set();
    for (const m of xml.matchAll(/<p:(sp|pic|cxnSp)>\s*<p:nv\w+Pr>\s*<p:cNvPr id="(\d+)" name="(?:click(\d+)|(auto))[^"]*"[\s\S]*?<\/p:\1>/g)) {
      const k = m[4] ? 0 : +m[3];
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(m[2]);
      if (m[1] === 'sp' && m[0].includes('<p:txBody>')) textIds.add(m[2]);
    }
    if (!groups.size && !isBeat) continue;
    let id = 2;
    const effect = (spid, node, delay, dur) => {
      const g = textIds.has(spid) ? ' grpId="0"' : '';
      return `<p:par><p:cTn id="${++id}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold"${g} nodeType="${node}">`
        + `<p:stCondLst><p:cond delay="${delay}"/></p:stCondLst><p:childTnLst>`
        + `<p:set><p:cBhvr><p:cTn id="${++id}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>`
        + `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>`
        + '<p:to><p:strVal val="visible"/></p:to></p:set>'
        + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${++id}" dur="${dur}"/>`
        + `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`;
    };
    const clicks = [...groups.keys()].sort((a, b) => a - b).map((k) => {
      const outer = ++id, inner = ++id, auto = k === 0;
      const fx = groups.get(k).map((spid, i) => effect(spid, i > 0 ? 'withEffect' : auto ? 'afterEffect' : 'clickEffect',
        auto ? 700 : 0, auto ? 2000 : 500)).join('');
      const start = '<p:cond delay="indefinite"/>' + (auto ? '<p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>' : '');
      return `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst>${start}</p:stCondLst><p:childTnLst>`
        + `<p:par><p:cTn id="${inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${fx}`
        + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>';
    }).join('');
    const bld = [...textIds].map((spid) => `<p:bldP spid="${spid}" grpId="0" animBg="1"/>`).join('');
    const timing = !groups.size ? '' : '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
      + '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + clicks
      + '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
      + '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
      + '</p:childTnLst></p:cTn></p:par></p:tnLst>' + (bld ? `<p:bldLst>${bld}</p:bldLst>` : '') + '</p:timing>';
    const add = (isBeat ? '<p:transition spd="slow"><p:fade thruBlk="1"/></p:transition>' : '') + timing;
    xml = xml.includes('<p:extLst>') && xml.lastIndexOf('<p:extLst>') > xml.lastIndexOf('</p:cSld>')
      ? xml.replace(/<p:extLst>(?![\s\S]*<p:extLst>)/, add + '<p:extLst>')
      : xml.replace('</p:sld>', add + '</p:sld>');
    zip.file(f, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

module.exports = { createDeck };
