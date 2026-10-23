// Y10 BTEC Creative Media Production — Component 1 "Front Page" slide kit.
// Editorial/magazine look: newsprint paper, black ink, one print red; condensed poster headlines.
// Keeps ppt-guidelines.md §9 (slide order, pillar icons, ≥ 18 pt body). Rules and feedback: README.md.
//
//   const { createDeck } = require('./c1_kit.cjs');
//   const K = createDeck({ lesson: 3, footerText: '…' });
//   K.recallStarter({ … }); K.titleSlide({ … }); …        // one recipe per slide, see README.md
//   K.write('L3_Audience.pptx');

const fs = require('fs');
const path = require('path');
const requireGlobal = (name) => {
  try { return require(name); } catch {
    const root = require('child_process').execSync('npm root -g').toString().trim();
    return require(path.join(root, name));
  }
};
const pptxgen = requireGlobal('pptxgenjs');

// ── Palette and type ────────────────────────────────────────────────────────
// Red on paper and redLt on ink both pass 4.5:1. Red is the only accent: kickers, numerals, the one
// thing to look at. Never use it for body text.
const P = {
  ink: '16161A', ink2: '26262C', paper: 'F4EFE6', paper2: 'E8E1D4', white: 'FFFFFF',
  red: 'C8321A', redLt: 'FF6A4D', grey: '5F5A52', greyLt: 'A8A296', rule: '16161A', ruleLt: '3A3A42',
};
const HEAD = 'Bahnschrift SemiBold Condensed', BODY = 'Segoe UI', QUOTE = 'Georgia';
const W = 13.333, M = 0.6, CW = W - 2 * M;
const ICON = {
  clarity: ['ClarityOfLearningIntentions', 'Clarity of learning intentions'], info: ['NewInformation', 'New information'],
  practice: ['DeliberatePractice', 'Deliberate practice'], recall: ['RecapAndRecall', 'Recap and recall'],
  feedback: ['Feedback', 'Feedback'],
};

function createDeck({ lesson, footerText, title = 'Component 1 lesson', author = 'Nicholas Houlton' }) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = title; pres.author = author;
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
  const issue = lesson ? `LESSON ${String(lesson).padStart(2, '0')}` : '';

  // Masters: a folio line across the top (like a magazine page) and a slide number at the bottom.
  const folio = (color, ruleColor) => ([
    { text: { text: footerText, options: { x: M, y: 0.12, w: 8, h: 0.28, fontFace: BODY, fontSize: 11, bold: true,
      color, charSpacing: 3, margin: 0, valign: 'middle' } } },
    { text: { text: issue, options: { x: W - M - 3, y: 0.12, w: 3, h: 0.28, fontFace: BODY, fontSize: 11, bold: true,
      color, charSpacing: 3, margin: 0, align: 'right', valign: 'middle' } } },
    { line: { x: M, y: 0.44, w: CW, h: 0, line: { color: ruleColor, width: 2.5 } } },
  ]);
  const titlePh = (color) => ({ placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.62, w: 10.9, h: 1.0,
    fontFace: HEAD, fontSize: 44, color, align: 'left', valign: 'middle', margin: 0 }, text: '' } });
  const num = (color) => ({ x: W - M - 0.8, y: 7.0, w: 0.8, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color, align: 'right' });
  pres.defineSlideMaster({ title: 'C1_PAPER', background: { color: P.paper },
    objects: [...folio(P.grey, P.rule), titlePh(P.ink)], slideNumber: num(P.grey) });
  pres.defineSlideMaster({ title: 'C1_INK', background: { color: P.ink },
    objects: [...folio(P.greyLt, P.paper), titlePh(P.paper)], slideNumber: num(P.greyLt) });
  pres.defineSlideMaster({ title: 'C1_COVER', background: { color: P.ink }, objects: [] });

  // ── Drawing parts ─────────────────────────────────────────────────────────
  let slideNo = 0;
  const sections = new Set(), imagesNeeded = [];
  function newSlide(master, section, t) {
    if (!sections.has(section)) { pres.addSection({ title: section }); sections.add(section); }
    const s = pres.addSlide({ masterName: master, sectionTitle: section });
    slideNo++;
    if (t) s.addText(t, { placeholder: 'title' });
    return s;
  }
  const text = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, fontFace: BODY, color: P.ink, valign: 'top', ...o });
  const box = (s, o) => s.addShape(pres.shapes.RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: o.fill },
    line: o.line ? { color: o.line, width: o.lw || 1.5, dashType: o.dash } : { type: 'none' } });
  const rule = (s, x, y, w, color = P.rule, weight = 2.5) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: weight } });
  const kicker = (s, t, o) => text(s, t.toUpperCase(), { fontSize: 13, bold: true, color: P.red, charSpacing: 3, h: 0.3, ...o });
  // Square-cornered label, e.g. the source-lesson tag on a recall question.
  function tag(s, t, o) {
    const w = o.w || Math.max(1.2, 0.2 + t.length * 0.105);
    box(s, { x: o.x, y: o.y, w, h: 0.32, fill: o.fill || P.ink });
    text(s, t.toUpperCase(), { x: o.x, y: o.y, w, h: 0.32, fontSize: 12, bold: true, color: o.color || P.paper,
      align: 'center', valign: 'middle', charSpacing: 2 });
    return w;
  }
  function timer(s, mins, dark = false) {
    tag(s, `TIMER  ${mins} MIN`, { x: 9.85, y: 0.82, w: 1.75, fill: P.red, color: P.white });
  }
  function addIcon(s, kind) {
    const [file, alt] = ICON[kind];
    s.addImage({ path: path.join(__dirname, 'icons', file + '.png'), x: 12.0, y: 0.68, w: 0.75, h: 0.75, altText: alt });
  }
  // An image the teacher supplies. With img, the picture fills the frame (cropped to fit);
  // without it, a labelled placeholder is drawn and the image is listed when the deck is written.
  function imageSlot(s, o) {
    if (o.img && fs.existsSync(o.img)) {
      s.addImage({ path: o.img, x: o.x, y: o.y, w: o.w, h: o.h, sizing: { type: 'cover', w: o.w, h: o.h }, altText: o.label });
      return;
    }
    imagesNeeded.push(`slide ${slideNo}: ${o.label}`);
    box(s, { x: o.x, y: o.y, w: o.w, h: o.h, fill: o.dark ? P.ink2 : P.paper2, line: o.dark ? P.ruleLt : P.greyLt, dash: 'dash', lw: 1.25 });
    text(s, [{ text: 'IMAGE\n', options: { fontSize: 12, bold: true, charSpacing: 3, color: P.red } },
      { text: o.label, options: { fontSize: 16, color: o.dark ? P.greyLt : P.grey } }],
    { x: o.x + 0.2, y: o.y, w: o.w - 0.4, h: o.h, align: 'center', valign: 'middle' });
  }
  const notes = (s, n) => n && s.addNotes(n);
  const note = (s, t, dark) => text(s, t, { x: M, y: 7.0, w: 9, h: 0.3, fontSize: 12, italic: true, bold: true,
    color: dark ? P.redLt : P.red, valign: 'middle' });

  // ── Recipes ───────────────────────────────────────────────────────────────
  // Recap & Recall: up to 4 questions in a 2 × 2 grid. Each has a source tag ("Last lesson") and,
  // where possible, choices or an example so it isn't bare recall (README rule).
  function recallGrid(s, qs, dark, showAnswers) {
    const cw = (CW - 0.5) / 2, ch = 2.35;
    qs.forEach((q, i) => {
      const x = M + (i % 2) * (cw + 0.5), y = 1.95 + Math.floor(i / 2) * (ch + 0.25);
      rule(s, x, y, cw, dark ? P.paper : P.rule, 2);
      text(s, String(i + 1), { x, y: y + 0.12, w: 0.6, h: 0.8, fontFace: HEAD, fontSize: 48, color: dark ? P.redLt : P.red });
      tag(s, q.tag, { x: x + 0.7, y: y + 0.22, fill: dark ? P.paper : P.ink, color: dark ? P.ink : P.paper });
      text(s, q.q, { x: x + 0.7, y: y + 0.66, w: cw - 0.7, h: 0.95, fontSize: 20, color: dark ? P.paper : P.ink });
      if (q.options && !showAnswers) text(s, q.options.join('  ·  ') + '?', { x: x + 0.7, y: y + 1.6, w: cw - 0.7, h: 0.7, fontSize: 18,
        bold: true, color: dark ? P.greyLt : P.red });
      if (showAnswers) text(s, [{ text: 'ANSWER  ', options: { fontSize: 13, charSpacing: 2, color: P.greyLt } },
        { text: q.a, options: { fontSize: 20, color: P.redLt } }],
      { x: x + 0.7, y: y + 1.6, w: cw - 0.7, h: 0.7, bold: true });
    });
  }
  function recallStarter({ questions, mins = 4, notes: n }) {
    const s = newSlide('C1_PAPER', 'Recap & Recall', 'Recap & Recall');
    kicker(s, 'Answer in your book — no notes', { x: M, y: 1.5, w: 8 });
    recallGrid(s, questions, false, false); timer(s, mins); addIcon(s, 'recall'); notes(s, n);
    return s;
  }
  function recallAnswers({ questions, notes: n }) {
    const s = newSlide('C1_INK', 'Recap & Recall', 'Answers');
    kicker(s, 'Tick or fix in a different colour', { x: M, y: 1.5, w: 8, color: P.redLt });
    recallGrid(s, questions, true, true); addIcon(s, 'recall'); notes(s, n);
    return s;
  }
  // Cover: the lesson as a magazine cover. Masthead, issue line, cover line, cover image, a puff.
  function titleSlide({ masthead = 'EXPLORING MEDIA', issueLine, coverLine, standfirst, puff, img, imgLabel = 'Cover image: a real media product from this lesson', notes: n }) {
    const s = newSlide('C1_COVER', 'Title');
    imageSlot(s, { x: 7.75, y: 0, w: W - 7.75, h: 7.5, img, label: imgLabel, dark: true });
    text(s, masthead, { x: M, y: 0.35, w: 7.4, h: 1.6, fontFace: HEAD, fontSize: 96, color: P.paper, valign: 'middle', fit: 'shrink' });
    rule(s, M, 2.05, 6.9, P.paper, 3);
    text(s, (issueLine || [issue, 'Y10 BTEC Creative Media Production'].filter(Boolean).join('  ·  ')).toUpperCase(),
      { x: M, y: 2.15, w: 6.9, h: 0.35, fontSize: 13, bold: true, charSpacing: 3, color: P.greyLt });
    box(s, { x: M, y: 3.0, w: 6.9, h: 2.25, fill: P.red });
    text(s, coverLine, { x: M + 0.3, y: 3.1, w: 6.3, h: 2.05, fontFace: HEAD, fontSize: 54, color: P.white, valign: 'middle', fit: 'shrink' });
    if (standfirst) text(s, standfirst, { x: M, y: 5.5, w: 6.9, h: 1.2, fontFace: QUOTE, italic: true, fontSize: 22, color: P.paper });
    if (puff) {
      s.addShape(pres.shapes.OVAL, { x: 6.2, y: 2.4, w: 1.5, h: 1.5, fill: { color: P.paper }, line: { color: P.ink, width: 3 } });
      text(s, puff, { x: 6.28, y: 2.4, w: 1.34, h: 1.5, fontFace: HEAD, fontSize: 18, align: 'center', valign: 'middle', color: P.ink });
    }
    notes(s, n);
    return s;
  }
  function questions({ topic, lesson: lq, notes: n }) {
    const s = newSlide('C1_PAPER', 'Learning intentions', 'The big questions');
    kicker(s, 'Topic question — the whole of Component 1', { x: M, y: 1.95, w: 10, color: P.grey });
    text(s, topic, { x: M, y: 2.35, w: 10.8, h: 1.0, fontFace: QUOTE, italic: true, fontSize: 24, color: P.grey });
    box(s, { x: M, y: 3.65, w: CW, h: 2.9, fill: P.ink });
    box(s, { x: M, y: 3.65, w: 0.18, h: 2.9, fill: P.red });
    kicker(s, "Today's question", { x: M + 0.55, y: 3.95, w: 8, color: P.redLt });
    text(s, lq, { x: M + 0.55, y: 4.35, w: CW - 1.1, h: 2.0, fontFace: HEAD, fontSize: 44, color: P.paper, valign: 'middle' });
    addIcon(s, 'clarity'); notes(s, n);
    return s;
  }
  // New Information: a standfirst (the one-sentence idea) and up to 4 numbered points, magazine-column style.
  function info({ title: t, standfirst, points, img, imgLabel, notes: n }) {
    const s = newSlide('C1_PAPER', 'Content', t);
    const textW = img || imgLabel ? 6.9 : CW;
    if (standfirst) text(s, standfirst, { x: M, y: 1.8, w: textW, h: 1.0, fontFace: QUOTE, italic: true, fontSize: 24 });
    const y0 = standfirst ? 3.0 : 1.95, ph = (6.75 - y0) / points.length;
    points.forEach(([lead, body], i) => {
      const y = y0 + i * ph;
      rule(s, M, y, textW, P.rule, 1.25);
      text(s, String(i + 1), { x: M, y: y + 0.08, w: 0.5, h: 0.6, fontFace: HEAD, fontSize: 36, color: P.red });
      text(s, [{ text: lead + '  ', options: { bold: true } }, { text: body }],
        { x: M + 0.6, y: y + 0.12, w: textW - 0.6, h: ph - 0.2, fontSize: 19 });
    });
    if (img || imgLabel) imageSlot(s, { x: 7.95, y: 1.8, w: W - 7.95 - M, h: 4.95, img, label: imgLabel });
    addIcon(s, 'info'); notes(s, n);
    return s;
  }
  // Key term or theory card: the word huge, a plain definition, and a real example with its image.
  function keyTerm({ term, say, definition, example, img, imgLabel, notes: n }) {
    const s = newSlide('C1_PAPER', 'Content');
    kicker(s, 'Key term', { x: M, y: 0.7, w: 4 });
    text(s, term, { x: M, y: 1.0, w: 7.4, h: 1.5, fontFace: HEAD, fontSize: 80, valign: 'middle', fit: 'shrink' });
    if (say) text(s, say, { x: M, y: 2.5, w: 7.4, h: 0.4, fontSize: 16, italic: true, color: P.grey });
    rule(s, M, 3.05, 7.2, P.rule, 3);
    text(s, definition, { x: M, y: 3.25, w: 7.2, h: 1.6, fontSize: 24 });
    box(s, { x: M, y: 5.0, w: 7.2, h: 1.75, fill: P.ink });
    text(s, [{ text: 'IN THE REAL WORLD\n', options: { fontSize: 12, bold: true, charSpacing: 3, color: P.redLt } },
      { text: example, options: { fontSize: 19, color: P.paper } }], { x: M + 0.3, y: 5.15, w: 6.6, h: 1.5 });
    imageSlot(s, { x: 8.15, y: 1.75, w: W - 8.15 - M, h: 5.0, img, label: imgLabel || 'Real example of this term' });
    addIcon(s, 'info'); notes(s, n);
    return s;
  }
  // Annotated product: numbered markers on the image (x, y as 0–1 across/down it), matching notes beside it.
  function annotate({ title: t, img, imgLabel, marks, pillar = 'practice', prompt, notes: n }) {
    const s = newSlide('C1_PAPER', 'Content', t);
    const ix = M, iy = 1.8, iw = 7.0, ih = prompt ? 4.45 : 4.95;
    imageSlot(s, { x: ix, y: iy, w: iw, h: ih, img, label: imgLabel || 'Media product to annotate' });
    marks.forEach((m, i) => {
      const d = 0.5, cx = ix + m.at[0] * iw - d / 2, cy = iy + m.at[1] * ih - d / 2;
      s.addShape(pres.shapes.OVAL, { x: cx, y: cy, w: d, h: d, fill: { color: P.red }, line: { color: P.white, width: 2 } });
      text(s, String(i + 1), { x: cx, y: cy, w: d, h: d, fontFace: HEAD, fontSize: 20, color: P.white, align: 'center', valign: 'middle' });
    });
    const lx = 8.0, lw = W - lx - M, lh = Math.min(1.25, 4.95 / marks.length);
    marks.forEach((m, i) => {
      const y = iy + i * lh;
      rule(s, lx, y, lw, P.rule, 1.25);
      text(s, String(i + 1), { x: lx, y: y + 0.08, w: 0.45, h: 0.5, fontFace: HEAD, fontSize: 28, color: P.red });
      text(s, [{ text: m.label + '\n', options: { bold: true, fontSize: 19 } }, { text: m.note || '', options: { fontSize: 18, color: P.grey } }],
        { x: lx + 0.5, y: y + 0.1, w: lw - 0.5, h: lh - 0.15 });
    });
    if (prompt) text(s, prompt, { x: ix, y: iy + ih + 0.12, w: iw, h: 0.4, fontSize: 18, bold: true, color: P.red });
    addIcon(s, pillar); notes(s, n);
    return s;
  }
  // Two products side by side, then the same criteria for each. Blank cells = students fill them in.
  function compare({ title: t, a, b, rows, notes: n }) {
    const s = newSlide('C1_PAPER', 'Content', t);
    const lab = 2.6, cw = (CW - lab) / 2, ih = 2.05;
    [a, b].forEach((p, i) => {
      const x = M + lab + i * cw;
      imageSlot(s, { x: x + 0.1, y: 1.75, w: cw - 0.2, h: ih, img: p.img, label: p.imgLabel || p.name });
      text(s, p.name, { x: x + 0.1, y: 1.75 + ih + 0.05, w: cw - 0.2, h: 0.45, fontFace: HEAD, fontSize: 24, align: 'center' });
    });
    const rh = Math.min(0.62, (6.85 - 4.35) / rows.length);
    rows.forEach(([label, va, vb], i) => {
      const y = 4.35 + i * rh;
      rule(s, M, y, CW, P.rule, i ? 1 : 2.5);
      text(s, label.toUpperCase(), { x: M, y, w: lab - 0.1, h: rh, fontSize: 13, bold: true, charSpacing: 2, color: P.red, valign: 'middle' });
      [va, vb].forEach((v, j) => text(s, v || '', { x: M + lab + j * cw + 0.15, y, w: cw - 0.3, h: rh, fontSize: 18, valign: 'middle' }));
    });
    addIcon(s, 'practice'); notes(s, n);
    return s;
  }
  // A Drive clip: a film frame with the watch window, then the questions to answer after watching.
  // The page can't stop the clip, so the window is always written on the slide.
  function clip({ title: t, from, to, where, img, imgLabel, questions: qs, notes: n }) {
    const s = newSlide('C1_INK', 'Content', t);
    const fx = M, fy = 1.8, fw = 7.2, fh = 4.5;
    box(s, { x: fx, y: fy, w: fw, h: fh, fill: '000000' });
    for (let i = 0; i < 16; i++) [fy + 0.1, fy + fh - 0.3].forEach((y) =>
      box(s, { x: fx + 0.2 + i * 0.43, y, w: 0.24, h: 0.2, fill: P.ink2 }));
    imageSlot(s, { x: fx + 0.2, y: fy + 0.45, w: fw - 0.4, h: fh - 0.9, img, label: imgLabel || 'Still from the clip', dark: true });
    tag(s, `WATCH  ${from} – ${to}`, { x: fx, y: fy + fh + 0.2, w: 2.9, fill: P.red, color: P.white });
    if (where) text(s, where, { x: fx + 3.1, y: fy + fh + 0.2, w: fw - 3.1, h: 0.32, fontSize: 14, color: P.greyLt, valign: 'middle' });
    const qx = 8.25, qw = W - qx - M;
    kicker(s, 'Then answer', { x: qx, y: 1.8, w: qw, color: P.redLt });
    qs.forEach((q, i) => {
      const y = 2.25 + i * 1.3;
      rule(s, qx, y, qw, P.paper, 1.25);
      text(s, String(i + 1), { x: qx, y: y + 0.08, w: 0.45, h: 0.5, fontFace: HEAD, fontSize: 28, color: P.redLt });
      text(s, q, { x: qx + 0.5, y: y + 0.12, w: qw - 0.5, h: 1.1, fontSize: 19, color: P.paper });
    });
    addIcon(s, 'practice'); notes(s, n);
    return s;
  }
  // Hinge question: 2–4 lettered options. Students show A/B/C on fingers or whiteboards.
  function choice({ question, options, pillar = 'feedback', notes: n }) {
    const s = newSlide('C1_PAPER', 'Content', 'Which one?');
    text(s, question, { x: M, y: 1.8, w: CW, h: 1.3, fontFace: QUOTE, italic: true, fontSize: 28 });
    const gap = 0.3, ow = (CW - gap * (options.length - 1)) / options.length;
    options.forEach((o, i) => {
      const x = M + i * (ow + gap);
      box(s, { x, y: 3.35, w: ow, h: 3.3, fill: P.ink });
      text(s, 'ABCD'[i], { x: x + 0.3, y: 3.5, w: 1, h: 1.1, fontFace: HEAD, fontSize: 64, color: P.redLt });
      text(s, o, { x: x + 0.3, y: 4.65, w: ow - 0.6, h: 1.85, fontSize: 21, color: P.paper });
    });
    addIcon(s, pillar); notes(s, n);
    return s;
  }
  // Staged reading scaffold for dense text (briefs, theory): read a chunk → silent jot → Turn & Talk → share.
  // step = which stage is live (0–3); the others are greyed out.
  function readingScaffold({ title: t, chunk, source, jot, talk, step = 0, notes: n }) {
    const s = newSlide('C1_PAPER', 'Content', t);
    box(s, { x: M, y: 1.8, w: 7.3, h: 4.95, fill: P.white, line: P.rule, lw: 1.5 });
    text(s, chunk, { x: M + 0.35, y: 2.05, w: 6.6, h: 4.0, fontFace: QUOTE, fontSize: 22 });
    if (source) text(s, source, { x: M + 0.35, y: 6.2, w: 6.6, h: 0.35, fontSize: 13, color: P.grey, italic: true });
    const stages = [['Read', 'This chunk only'], ['Jot', jot || 'Silent, 1 minute'], ['Turn & Talk', talk || 'Compare with your partner'], ['Share', 'Open Q&A']];
    const sx = 8.3, sw = W - sx - M;
    stages.forEach(([h, d], i) => {
      const y = 1.8 + i * 1.25, live = i === step;
      box(s, { x: sx, y, w: sw, h: 1.1, fill: live ? P.red : P.paper2 });
      text(s, String(i + 1), { x: sx + 0.2, y, w: 0.5, h: 1.1, fontFace: HEAD, fontSize: 36, valign: 'middle', color: live ? P.white : P.greyLt });
      text(s, [{ text: h.toUpperCase() + '\n', options: { fontSize: 15, bold: true, charSpacing: 2 } }, { text: d, options: { fontSize: 18 } }],
        { x: sx + 0.8, y: y + 0.1, w: sw - 1.0, h: 0.9, valign: 'middle', color: live ? P.white : P.grey });
    });
    addIcon(s, 'practice'); notes(s, n);
    return s;
  }
  // Deliberate Practice task: steps, where to find it, success criteria.
  function task({ title: t, steps, where, criteria, mins, notes: n }) {
    const s = newSlide('C1_PAPER', 'Practice', t);
    const lw = 7.3;
    steps.forEach((st, i) => {
      const y = 1.85 + i * (4.3 / steps.length);
      rule(s, M, y, lw, P.rule, 1.25);
      text(s, String(i + 1), { x: M, y: y + 0.08, w: 0.5, h: 0.6, fontFace: HEAD, fontSize: 36, color: P.red });
      text(s, st, { x: M + 0.6, y: y + 0.14, w: lw - 0.6, h: 4.3 / steps.length - 0.2, fontSize: 20 });
    });
    if (where) text(s, [{ text: 'FIND IT  ', options: { bold: true, color: P.red, charSpacing: 2, fontSize: 13 } }, { text: where, options: { fontSize: 18 } }],
      { x: M, y: 6.3, w: lw, h: 0.45, valign: 'middle' });
    const cx = 8.3, cw = W - cx - M;
    box(s, { x: cx, y: 1.85, w: cw, h: 4.9, fill: P.ink });
    kicker(s, 'Success looks like', { x: cx + 0.3, y: 2.05, w: cw - 0.6, color: P.redLt });
    text(s, criteria.map((c) => ({ text: c, options: { bullet: { code: '25A0' }, paraSpaceAfter: 10 } })),
      { x: cx + 0.3, y: 2.5, w: cw - 0.6, h: 4.1, fontSize: 19, color: P.paper });
    if (mins) timer(s, mins);
    addIcon(s, 'practice'); notes(s, n);
    return s;
  }
  // Model analytical writing, colour-coded by job. parts: [[role, text], …]; roles are named in key.
  function modelAnswer({ title: t, question, parts, key, notes: n }) {
    const s = newSlide('C1_PAPER', 'Feedback', t);
    const colors = [P.red, '1F5FAD', '2E7D4F'];
    text(s, question, { x: M, y: 1.75, w: CW, h: 0.8, fontSize: 19, bold: true, color: P.grey });
    box(s, { x: M, y: 2.6, w: 8.6, h: 4.15, fill: P.white, line: P.rule, lw: 1.5 });
    text(s, parts.map(([r, t2]) => ({ text: t2 + ' ', options: { color: colors[key.indexOf(r)], bold: r === key[0] } })),
      { x: M + 0.35, y: 2.85, w: 7.9, h: 3.7, fontFace: QUOTE, fontSize: 21, lineSpacingMultiple: 1.15 });
    key.forEach((r, i) => {
      const y = 2.6 + i * 1.0;
      box(s, { x: 9.55, y, w: 0.3, h: 0.75, fill: colors[i] });
      text(s, r, { x: 10.0, y, w: W - 10.0 - M, h: 0.75, fontSize: 20, bold: true, valign: 'middle', color: colors[i] });
    });
    addIcon(s, 'feedback'); notes(s, n);
    return s;
  }
  function plenary({ lesson: lq, task: tk, starter, notes: n }) {
    const s = newSlide('C1_INK', 'Plenary', 'Exit ticket');
    kicker(s, "Back to today's question", { x: M, y: 1.85, w: 8, color: P.redLt });
    text(s, lq, { x: M, y: 2.25, w: CW - 1, h: 1.5, fontFace: HEAD, fontSize: 44, color: P.paper, valign: 'middle' });
    rule(s, M, 4.0, CW, P.paper, 2);
    text(s, tk, { x: M, y: 4.2, w: CW, h: 1.0, fontSize: 22, color: P.paper });
    if (starter) {
      box(s, { x: M, y: 5.35, w: CW, h: 1.2, fill: P.red });
      text(s, [{ text: 'START WITH  ', options: { fontSize: 13, bold: true, charSpacing: 2 } }, { text: starter, options: { fontFace: QUOTE, italic: true, fontSize: 24 } }],
        { x: M + 0.35, y: 5.35, w: CW - 0.7, h: 1.2, valign: 'middle', color: P.white });
    }
    addIcon(s, 'recall'); notes(s, n);
    return s;
  }

  async function write(out) {
    await pres.writeFile({ fileName: out });
    console.log(`Wrote ${out} (${slideNo} slides)`);
    if (imagesNeeded.length) console.log('Images to supply:\n  ' + imagesNeeded.join('\n  '));
  }

  return { pres, P, HEAD, BODY, QUOTE, W, M, CW, newSlide, text, box, rule, kicker, tag, timer, addIcon, imageSlot, note,
    recallStarter, recallAnswers, titleSlide, questions, info, keyTerm, annotate, compare, clip, choice, readingScaffold,
    task, modelAnswer, plenary, write, get slideNo() { return slideNo; } };
}

module.exports = { createDeck, P, HEAD, BODY, QUOTE };
