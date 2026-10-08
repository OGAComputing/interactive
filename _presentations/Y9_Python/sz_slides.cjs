// Station Zero slide recipes — one function per slide type, shared by every Y9 Python deck.
// Each takes the deck (from sz_kit.createDeck) and the slide's content, and returns the slide.
// README.md in this folder lists the recipes, when to use each one, and the feedback log.
//
// Every recipe takes `section` (the PowerPoint section) and `notes` (speaker notes: put what
// you will SAY there, not on the slide — redundancy effect).

// ── Recap & Recall ──────────────────────────────────────────────────────────
// questions: 4 × { pill, q, type: 'mcq'|'write', code?: [lines], opts?: [3], a, why, aMono?, whyMono? }
// For an MCQ, `a` starts with the correct letter ('B — 9').
function recallStarter(K, o) {
  const { P, M } = K;
  const s = K.newSlide('SZ_LIGHT', o.section, o.title || 'Recap & Recall');
  K.text(s, o.intro || 'No notes. Answer every question — a guess beats a blank. Then rate your confidence: 1, 2 or 3.',
    { x: M, y: 1.28, w: 11.2, h: 0.4, fontSize: 18, color: P.inkMuted });
  K.recallCards(s, o.questions, false);
  K.timer(s, o.time || '5 MIN', false);
  K.addIcon(s, 'recall');
  if (o.notes) s.addNotes(o.notes);
  return s;
}
function recallAnswers(K, o) {
  const { P, M } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'Recap & Recall — answers');
  K.text(s, o.intro || 'Mark your own. Confident but wrong? Those are the ones to fix.',
    { x: M, y: 1.28, w: 11.2, h: 0.4, fontSize: 18, color: P.muted });
  K.recallCards(s, o.questions, true);
  K.addIcon(s, 'recall');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Title ───────────────────────────────────────────────────────────────────
// status: terminal lines (strings, or arrays of { text, color, bold } runs)
function titleSlide(K, o) {
  const { P, M, HEAD } = K;
  const s = K.newSlide('SZ_COVER', o.section);
  K.text(s, o.kicker, { x: M + 0.1, y: 2.05, w: 6.6, h: 0.4, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  K.text(s, o.title, { x: M + 0.1, y: 2.5, w: 6.6, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: P.off });
  K.text(s, o.subtitle, { x: M + 0.1, y: 3.75, w: 6.6, h: 0.6, fontFace: HEAD, fontSize: 28, color: P.muted });
  if (o.status) K.terminal(s, o.status, { x: 7.55, y: 1.75, w: 5.1, size: 20, story: true, label: o.statusLabel || 'STATION STATUS' });
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Clarity: topic question + lesson question ───────────────────────────────
function questionsSlide(K, o) {
  const { P, M, HEAD } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'What are we learning?');
  K.box(s, { x: M, y: 1.75, w: 12.13, h: 1.55, fill: P.charcoal, line: P.line, r: 0.08 });
  K.text(s, 'TOPIC QUESTION', { x: M + 0.4, y: 1.95, w: 6, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
  K.text(s, o.topic, { x: M + 0.4, y: 2.3, w: 11.3, h: 0.8, fontSize: 24, color: P.muted, valign: 'middle' });
  K.box(s, { x: M, y: 3.6, w: 12.13, h: 2.55, fill: P.panel, line: P.gold, lw: 2.5, r: 0.08 });
  K.text(s, 'LESSON QUESTION', { x: M + 0.4, y: 3.85, w: 6, h: 0.3, fontSize: 13, bold: true, color: P.gold, charSpacing: 2 });
  K.text(s, o.lesson, { x: M + 0.4, y: 4.25, w: 11.3, h: 1.6, fontFace: HEAD, fontSize: 36, bold: true, color: P.off, valign: 'middle' });
  K.addIcon(s, 'clarity');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── New Information: whole lines, sub-goals bracketed under the code ────────
// lines: up to 2 × { code, labels: [{ n, text, from, to }], results: up to 2 × ({ n, terminal: [lines] } | { n, var: { name?, type, value, size? } }) }
// Number the labels in the order Python does them; each result carries the same number.
function labelledLinesSlide(K, o) {
  const { P } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  const rx = 8.05, rw = 4.68;
  K.labelledCode(s, o.lines.map((ln) => ({
    code: ln.code, labels: ln.labels,
    result: (s, y) => (ln.results || []).forEach((r, j) => {
      const ry = y + (j === 0 ? 0.1 : 1.25);
      K.badge(s, r.n, rx, ry + 0.2, 0.42);
      if (r.terminal) K.terminal(s, r.terminal, { x: rx + 0.6, y: ry, w: rw - 0.6, size: 22, h: 0.8 });
      else K.varBox(s, { x: rx + 0.6, y: ry + 0.1, w: 2.6, h: 0.85, size: 24, ...r.var });
    }),
  })));
  K.addIcon(s, o.icon || 'info');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── New Information: a discriminating pair (two lines that differ by one thing) ──
// memory?: varBox spec shown as "IN MEMORY"; rows: 2 × { code, out, note: runs }
function pairSlide(K, o) {
  const { P, M } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  if (o.memory) {
    K.text(s, 'IN MEMORY', { x: M, y: 1.7, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
    K.varBox(s, { x: M, y: 2.35, w: 2.6, ...o.memory });
  }
  o.rows.forEach((r, i) => {
    const y = (o.memory ? 3.75 : 2.2) + i * 1.35;
    K.codePanel(s, [r.code], { x: M, y, w: 3.9, size: 24, nums: false, h: 0.95 });
    K.arrow(s, M + 4.05, y + 0.47, M + 4.75, y + 0.47);
    K.terminal(s, [r.out], { x: M + 4.9, y, w: 2.4, size: 24, h: 0.95 });
    K.text(s, r.note, { x: M + 7.65, y, w: 4.5, h: 0.95, fontSize: 22, color: P.off, valign: 'middle' });
  });
  K.addIcon(s, 'info');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Deliberate Practice: Predict (mini-whiteboards) ─────────────────────────
// code: lines (4–6); inputs: [[label, value]] the user types; prompt: runs or string
function predictSlide(K, o) {
  const { P, M, MONO, BODY } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'Predict');
  K.codePanel(s, o.code, { x: M, y: 1.75, w: 7.7, size: 22 });
  if (o.inputs) {
    K.box(s, { x: 8.65, y: 1.75, w: 4.08, h: 2.13, fill: P.panel, r: 0.08 });
    K.text(s, 'THE USER TYPES', { x: 8.95, y: 1.95, w: 3.5, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
    o.inputs.forEach(([n, v], i) => K.text(s, [{ text: n + '   ', options: { color: P.muted, fontFace: BODY, fontSize: 18 } },
      { text: v, options: { color: P.str, bold: true } }], { x: 8.95, y: 2.35 + i * 0.6, w: 3.6, h: 0.55, fontFace: MONO,
      fontSize: 28, valign: 'middle' }));
  }
  banner(K, s, o.prompt, 4.55, 1.4);
  K.timer(s, o.time || '2 MIN');
  K.addIcon(s, 'practice');
  if (o.notes) s.addNotes(o.notes);
  return s;
}
// ── Feedback: Predict reveal ────────────────────────────────────────────────
// output: terminal lines; mistakes: 2 × { head, headMono?, headColor?, text }
function predictRevealSlide(K, o) {
  const { P, M, MONO } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'Predict — what it prints');
  K.codePanel(s, o.code, { x: M, y: 1.75, w: 7.7, size: 22, hl: o.hl });
  K.terminal(s, o.output, { x: 8.65, y: 1.75, w: 4.08, size: 20, label: 'OUTPUT' });
  (o.mistakes || []).forEach((m, i) => {
    const x = M + i * 6.23;
    K.box(s, { x, y: 4.6, w: 5.9, h: 1.65, fill: P.panel, r: 0.08 });
    K.text(s, [{ text: m.head, options: { fontFace: m.headMono === false ? K.BODY : MONO, color: m.headColor || P.str, bold: true } },
      { text: '\n' + m.text, options: { color: P.off } }],
      { x: x + 0.3, y: 4.6, w: 5.4, h: 1.65, fontSize: 20, valign: 'middle', paraSpaceAfter: 6 });
  });
  K.addIcon(s, 'feedback');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Reference: debugging recipe on a real error ─────────────────────────────
// error: terminal lines; marks: [{ n, line, col }] — badge n goes after column `col` of error line `line` (0-based)
// fix: the corrected line, shown on step 4
function debugRecipeSlide(K, o) {
  const { P, M } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'Debugging recipe');
  const t = K.terminal(s, o.error, { x: M, y: 1.7, w: 9.3, size: 20, label: 'ERROR MESSAGE' });
  const cw = 20 * 0.55 / 72, tx = M + 0.25;   // Consolas ≈ 0.55em per character
  o.marks.forEach((m) => K.badge(s, m.n, tx + m.col * cw + 0.25, t.ys[m.line] - 0.24));
  const steps = [
    ['Read the last line', 'What kind of error?'],
    ['Find the line number', 'Where is it?'],
    ['Read that line aloud', 'Quote by quote'],
    ['Compare to what you meant', o.fix],
  ];
  const sw = 2.88, sg = 0.2, sy = 4.35;
  steps.forEach(([h, sub], i) => {
    const x = M + i * (sw + sg);
    K.box(s, { x, y: sy, w: sw, h: 2.2, fill: P.panel, r: 0.08 });
    K.badge(s, i + 1, x + 0.22, sy + 0.25);
    K.text(s, h, { x: x + 0.22, y: sy + 0.85, w: sw - 0.4, h: 0.75, fontSize: 20, bold: true, valign: 'top' });
    K.text(s, i === 3 ? K.pyRuns(sub, 16) : sub, { x: x + 0.22, y: sy + 1.65, w: sw - 0.4, h: 0.4, fontSize: 18,
      color: P.muted, valign: 'top' });
  });
  K.addIcon(s, 'info');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Deliberate Practice: chapter card + activity task ───────────────────────
// kicker, title, activity, time, logLabel, log: story lines (≤ 3 sentences), note: runs
function chapterSlide(K, o) {
  const s = K.newSlide('SZ_COVER', o.section);
  K.chapterTask(s, o);
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Feedback: a common error, with what's in memory ─────────────────────────
// code, hl, error: terminal lines (last line of the real message), memory: varBox spec, takeaway: runs
function errorFeedbackSlide(K, o) {
  const { P, M } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  const cp = K.codePanel(s, o.code, { x: M, y: 1.75, w: 8.2, size: 22, hl: o.hl });
  K.terminal(s, o.error, { x: M, y: 1.75 + cp.h + 0.25, w: 12.13, size: 18, label: 'ERROR — LAST LINE' });
  if (o.memory) {
    K.text(s, 'IN MEMORY', { x: 9.2, y: 1.7, w: 3, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
    K.varBox(s, { x: 9.2, y: 2.3, w: 3.0, ...o.memory });
  }
  banner(K, s, o.takeaway, 5.0, 1.3, 24);
  K.addIcon(s, 'feedback');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Deliberate Practice: Turn & Talk on two short lines ─────────────────────
function turnTalkSlide(K, o) {
  const { M } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title);
  o.codes.forEach((c, i) => {
    const x = M + i * 6.23;
    K.codePanel(s, [c], { x, y: 1.9, w: 5.9, size: 30, nums: false, h: 1.3 });
    K.terminal(s, ['?'], { x, y: 3.45, w: 5.9, size: 30, h: 1.0 });
  });
  banner(K, s, [{ text: 'Turn & Talk: ', options: { bold: true, color: K.P.gold } }, { text: o.prompt }], 4.95, 1.35);
  K.timer(s, o.time || '1 MIN');
  K.addIcon(s, 'practice');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Deliberate Practice / Feedback: trace table ─────────────────────────────
// code, typed (what the user types), table: { cols, colW, rows }, reveal?: { hl, side: runs }
function traceSlide(K, o) {
  const { P, M, MONO } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || (o.reveal ? 'Trace — answers' : 'Predict — trace it'));
  K.codePanel(s, o.code, { x: M, y: 1.65, w: 8.8, size: 22, hl: o.reveal && o.reveal.hl });
  K.box(s, { x: 9.65, y: 1.65, w: 3.08, h: 1.88, fill: P.panel, r: 0.08 });
  if (o.reveal) {
    K.text(s, o.reveal.side, { x: 9.9, y: 1.75, w: 2.7, h: 1.68, fontSize: 22, valign: 'middle', paraSpaceAfter: 6 });
  } else {
    K.text(s, 'THE USER TYPES', { x: 9.9, y: 1.85, w: 2.7, h: 0.3, fontSize: 13, bold: true, color: P.dim, charSpacing: 2 });
    K.text(s, o.typed, { x: 9.9, y: 2.25, w: 2.6, h: 1.0, fontFace: MONO, fontSize: 40, bold: true, color: P.str, valign: 'middle' });
    K.timer(s, o.time || '3 MIN');
  }
  K.traceTable(s, o.table);
  K.addIcon(s, o.reveal ? 'feedback' : 'practice');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ── Plenary: the lesson question again, as an exit task ─────────────────────
// tasks: 2 × string; code?: a line to fix (shown under task 2); cliff?: story line runs
function plenarySlide(K, o) {
  const { P, M, HEAD } = K;
  const s = K.newSlide('SZ_DARK', o.section, o.title || 'Plenary');
  K.box(s, { x: M, y: 1.65, w: 12.13, h: 1.2, fill: P.panel, line: P.gold, lw: 2, r: 0.08 });
  K.text(s, 'LESSON QUESTION', { x: M + 0.4, y: 1.78, w: 4, h: 0.3, fontSize: 13, bold: true, color: P.gold, charSpacing: 2 });
  K.text(s, o.lesson, { x: M + 0.4, y: 2.08, w: 11.3, h: 0.65, fontFace: HEAD, fontSize: 26, bold: true, valign: 'middle' });
  o.tasks.forEach((t, i) => {
    const y = 3.15 + i * 1.25;
    K.badge(s, i + 1, M, y + 0.08);
    K.text(s, t, { x: M + 0.7, y, w: 11.4, h: 0.65, fontSize: 22, valign: 'middle' });
  });
  if (o.code) s.addText(K.pyRuns(o.code, 22), { isTextBox: true, x: M + 0.7, y: 5.0, w: 6.5, h: 0.5, margin: 0 });
  if (o.cliff) K.terminal(s, [o.cliff], { x: M + 0.7, y: 5.8, w: 8.3, size: 18, story: true, h: 0.75 });
  K.addIcon(s, 'recall');
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// Gold-outlined prompt banner (whiteboard prompts, Turn & Talk, takeaways).
function banner(K, s, content, y, h, size = 25) {
  const { P, M } = K;
  K.box(s, { x: M, y, w: 12.13, h, fill: P.charcoal, line: P.gold, lw: 2, r: 0.08 });
  K.text(s, content, { x: M + 0.4, y, w: 11.3, h, fontSize: size, valign: 'middle' });
}

module.exports = {
  recallStarter, recallAnswers, titleSlide, questionsSlide, labelledLinesSlide, pairSlide, predictSlide,
  predictRevealSlide, debugRecipeSlide, chapterSlide, errorFeedbackSlide, turnTalkSlide, traceSlide, plenarySlide, banner,
};
