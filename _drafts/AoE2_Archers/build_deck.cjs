// AoE2 — Archers into Castle Age. One-off joke deck (not part of any unit).
// Loosely follows _presentations/ppt-guidelines.md §9: pillar icons, slide order, palette, fonts, sizes.
//
//   node build_deck.cjs   (needs `npm install -g pptxgenjs`)
//
// Output: AoE2_Archers_Into_Castle.pptx beside this file.
// Activities: 1_Build_Order_Sequencer.html, 2_Economy_Simulator.html, 3_Civ_Quiz.html (same folder).

const path = require('path');
const requireGlobal = (name) => {
  try { return require(name); } catch {
    const root = require('child_process').execSync('npm root -g').toString().trim();
    return require(path.join(root, name));
  }
};
const pptxgen = requireGlobal('pptxgenjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'AoE2_Archers_Into_Castle.pptx');
const ICONS = path.join(__dirname, '..', '..', '_presentations', 'Y9_Python', 'icons');

const P = {
  char: '1E1E24', char2: '2A2A33', gold: 'D8A73D', off: 'F5F5F3', ink: '1E1E24', mute: '8A8A94',
  red: 'B23A3A', blue: '3A6EA5', green: '4F9D69', parch: 'EFE4C8', line: 'D9D4C7',
};
const HEAD = 'Cambria', BODY = 'Calibri', MONO = 'Consolas';
const ICON = { recall: 'RecapAndRecall', clarity: 'ClarityOfLearningIntentions', info: 'NewInformation',
  practice: 'DeliberatePractice', feedback: 'Feedback' };
const FOOTER = 'AGE OF EMPIRES II  ·  ARCHERS INTO CASTLE  ·  A LESSON NOBODY ASKED FOR';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Archers into Castle Age';

function slide({ pillar, dark = false, title, kicker, notes }) {
  const s = pres.addSlide();
  s.background = { color: dark ? P.char : P.off };
  const fg = dark ? P.off : P.ink;
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.35, w: 10.5, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: P.gold, charSpacing: 2 });
  if (title) s.addText(title, { x: 0.6, y: 0.7, w: 11, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: fg });
  s.addText(FOOTER, { x: 0.6, y: 7.0, w: 10, h: 0.3, fontFace: BODY, fontSize: 10, color: P.mute, charSpacing: 1 });
  if (pillar) s.addImage({ path: path.join(ICONS, ICON[pillar] + '.png'), x: 12.15, y: 0.3, w: 0.75, h: 0.75 });
  if (notes) s.addNotes(notes);
  s.fg = fg;
  return s;
}

function card(s, { x, y, w, h, fill = 'FFFFFF', border = P.line, accent }) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: border, width: 1 } });
  if (accent) s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.1, h, fill: { color: accent }, line: { color: accent, width: 0 } });
}

function pill(s, txt, x, y, color = P.gold, w = 1.9) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color }, line: { color, width: 0 } });
  s.addText(txt.toUpperCase(), { x, y, w, h: 0.34, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 12, bold: true, color: P.char });
}

const bullets = (items, color, size = 20) => items.map((t, i) => ({
  text: t, options: { bullet: { indent: 18 }, color, fontSize: size, breakLine: i < items.length - 1, paraSpaceAfter: 8 },
}));

// ════════════════════════════════════════════════════════════════════════════
//  1–2. Recap & Recall — Dark Age basics (the bit everyone already "knows")
// ════════════════════════════════════════════════════════════════════════════
const RR = [
  { tag: 'DARK AGE', q: 'How many villagers go on sheep first?', a: '6', why: 'Your first six. Then wood.' },
  { tag: 'DARK AGE', q: 'Which two buildings let you click Feudal?', a: 'Any two Dark Age ones', why: 'e.g. mill + lumber camp (barracks counts too)' },
  { tag: 'ECONOMY', q: 'A villager costs 50 food. How long does it take?', a: '25 seconds', why: '~2.4 per minute, every minute' },
  { tag: 'EMBARRASSING', q: 'Your TC has been idle for a minute. How many villagers did you lose?', a: 'About 2.4', why: 'and every resource they would ever have gathered' },
];
function recall(dark) {
  const s = slide({ pillar: 'recall', dark, kicker: dark ? 'Recap & Recall — answers' : 'Recap & Recall — do now · 4 minutes',
    title: dark ? 'How did you do?' : 'Prove you have played this game before',
    notes: dark
      ? `Reveal and self-mark. Q4 is the whole lesson in one question: an idle TC is not "a small mistake", it is villagers that never exist, and those villagers would have gathered for the rest of the game.`
      : `Silent, mini-whiteboards. Confidence 1–3 next to each. Anyone who writes "I just go Scouts" for Q1 must stand up and apologise to the archery range.` });
  RR.forEach((r, i) => {
    const x = 0.6 + (i % 2) * 6.1, y = 1.75 + Math.floor(i / 2) * 2.55;
    card(s, { x, y, w: 5.9, h: 2.35, fill: dark ? P.char2 : 'FFFFFF', border: dark ? '3A3A44' : P.line, accent: P.gold });
    pill(s, r.tag, x + 0.3, y + 0.2);
    s.addText(r.q, { x: x + 0.3, y: y + 0.6, w: 5.4, h: 0.9, fontFace: BODY, fontSize: 20, color: s.fg, valign: 'top' });
    if (dark) {
      s.addText([{ text: r.a, options: { bold: true, color: P.gold, fontSize: 22, breakLine: true } },
        { text: r.why, options: { color: 'C8C8CC', fontSize: 18 } }], { x: x + 0.3, y: y + 1.4, w: 5.4, h: 0.85, fontFace: BODY, valign: 'top' });
    }
  });
}
recall(false);
recall(true);

// ════════════════════════════════════════════════════════════════════════════
//  3. Title
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ dark: true, notes: `Deliver with total sincerity. This is a real lesson. There will be a plenary.` });
  s.addText('AGE OF EMPIRES II  ·  ADVANCED ECONOMICS  ·  LESSON 1 OF 1', { x: 0.8, y: 1.6, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: P.gold, charSpacing: 3 });
  s.addText('Feudal Is Not the Finish Line', { x: 0.8, y: 2.1, w: 11.5, h: 1.2, fontFace: HEAD, fontSize: 50, bold: true, color: P.off });
  s.addText('Archers into Castle Age without starving your economy', { x: 0.8, y: 3.3, w: 11.5, h: 0.6, fontFace: HEAD, fontSize: 26, italic: true, color: 'C8C8CC' });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 4.3, w: 4, h: 0, line: { color: P.gold, width: 2 } });
  s.addText([{ text: 'Featuring  ', options: { color: P.mute } }, { text: 'Britons', options: { color: 'E07A7A', bold: true } },
    { text: '  and  ', options: { color: P.mute } }, { text: 'Bohemians', options: { color: '7FA8D6', bold: true } }],
  { x: 0.8, y: 4.5, w: 11, h: 0.5, fontFace: BODY, fontSize: 22 });
}

// ════════════════════════════════════════════════════════════════════════════
//  4. Clarity of Learning Intentions
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'clarity', kicker: 'Clarity of Learning Intentions', title: 'Why are we here?',
    notes: `Topic question: say it out loud and let it hang. Lesson question: this is what the plenary asks again at the end.` });
  s.addText('TOPIC QUESTION', { x: 0.6, y: 1.8, w: 6, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: P.mute, charSpacing: 2 });
  s.addText('How do I stop losing to that one friend who "only plays a bit"?', { x: 0.6, y: 2.15, w: 12, h: 0.7, fontFace: HEAD, fontSize: 24, italic: true, color: P.mute });
  card(s, { x: 0.6, y: 3.3, w: 12.1, h: 2.6, fill: 'FFFFFF', accent: P.gold });
  s.addText('LESSON QUESTION', { x: 1.0, y: 3.55, w: 6, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: P.gold, charSpacing: 2 });
  s.addText('How do you keep booming your economy while you make archers all the way from Feudal into Castle Age?',
    { x: 1.0, y: 3.95, w: 11.4, h: 1.6, fontFace: HEAD, fontSize: 30, bold: true, color: P.ink, valign: 'top' });
}

// ════════════════════════════════════════════════════════════════════════════
//  5. Meet the civs
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', kicker: 'New Information', title: 'Meet the civs',
    notes: `Britons are the textbook archer civ: the range bonus is why their crossbows win fights they have no right to win.
Bohemians are honestly a gunpowder and monk civ. They are on this slide because their economy bonuses fund an archer opening beautifully, and because a hand cannoneer is basically an archer who has had too much coffee.
Bonuses change with patches — check the in-game tech tree before you quote these at anyone.` });
  const civ = (x, name, color, tag, lines, joke) => {
    card(s, { x, y: 1.75, w: 5.95, h: 5.0, fill: 'FFFFFF', accent: color });
    s.addText(name, { x: x + 0.35, y: 1.9, w: 5.4, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color });
    s.addText(tag, { x: x + 0.35, y: 2.45, w: 5.4, h: 0.4, fontFace: BODY, fontSize: 16, italic: true, color: P.mute });
    s.addText(bullets(lines, P.ink, 19), { x: x + 0.35, y: 2.95, w: 5.4, h: 2.8, fontFace: BODY, valign: 'top' });
    s.addText(joke, { x: x + 0.35, y: 5.85, w: 5.4, h: 0.75, fontFace: BODY, fontSize: 16, italic: true, color, valign: 'top' });
  };
  civ(0.6, 'Britons', P.red, 'The archer civ. Unapologetically.', [
    'Shepherds work 25% faster — a quicker Dark Age',
    'Foot archers +1 range in Castle, +1 more in Imperial',
    'Town Centres −50% wood from Castle Age',
    'Longbowman + Yeomen (even more range)',
  ], '“Why fight them when you can fight them from over there?”');
  civ(6.75, 'Bohemians', P.blue, 'An archer civ, if you squint.', [
    'Mining Camp technologies are free',
    'Blacksmith and University cost −100 wood',
    'Hand Cannoneers available in Castle Age',
    'Hussite Wagon, Houfnice, Wagenburg Tactics',
  ], '“A hand cannoneer is just an archer who discovered chemistry.”');
}

// ════════════════════════════════════════════════════════════════════════════
//  6. Dark Age build (the 22-pop archer opener)
// ════════════════════════════════════════════════════════════════════════════
const DARK = [
  ['1–6', 'Sheep', 'Scout finds more sheep. Build a house with vil 1–2.'],
  ['7–10', 'Wood', 'Lumber camp on a good tree line.'],
  ['11', 'Lure boar', 'Villager 11 lures the first boar to the TC.'],
  ['12–15', 'Berries', 'Mill + house on the bushes.'],
  ['16–17', 'Sheep / 2nd boar', 'Lure boar 2 when boar 1 is nearly gone.'],
  ['18–19', 'Wood', 'Second lumber camp or more on the first.'],
  ['20–21', 'Gold', 'Mining camp now. Archers cost 45 gold each.'],
  ['22 pop', 'Loom → click Feudal', 'Barracks must be up (or going up) before you click.'],
];
{
  const s = slide({ pillar: 'info', kicker: 'New Information — Dark Age', title: 'The bit you think you already know',
    notes: `This is a standard straight-archers opener: up at 22 population (21 villagers + scout).
The key difference from a scouts build: gold miners start in the Dark Age. If you arrive in Feudal with 0 gold, your two shiny archery ranges are ornaments.
Barracks: you need it before you can build an archery range, so drop it during the Dark Age, not on arrival.` });
  const rows = [[
    { text: 'Villager', options: { bold: true, color: P.off, fill: { color: P.char } } },
    { text: 'Job', options: { bold: true, color: P.off, fill: { color: P.char } } },
    { text: 'Notes', options: { bold: true, color: P.off, fill: { color: P.char } } },
  ]].concat(DARK.map((r, i) => r.map((c, j) => ({ text: c, options: {
    bold: j === 0, color: j === 0 ? P.gold : P.ink, fill: { color: i === DARK.length - 1 ? 'F7EBCB' : (i % 2 ? 'FFFFFF' : 'F0EFEB') } } }))));
  s.addTable(rows, { x: 0.6, y: 1.7, w: 12.1, colW: [1.6, 3.0, 7.5], fontFace: BODY, fontSize: 18, rowH: 0.56,
    border: { type: 'solid', pt: 0.5, color: P.line }, valign: 'middle', margin: [0, 0.1, 0, 0.1] });
}

// ════════════════════════════════════════════════════════════════════════════
//  7. Feudal: what actually happens
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', kicker: 'New Information — Feudal Age', title: 'Arriving in Feudal: the first 3 minutes',
    notes: `The trap: players arrive, build two ranges, and then spend the next five minutes clicking archers while the TC sits idle and the sheep run out.
Farms are the hidden cost of the Feudal Age. Every farm is 60 wood. Your food villagers need somewhere to go when the berries end, and that is in about two minutes.` });
  const steps = [
    ['ON ARRIVAL', 'Two wood villagers build 2 Archery Ranges. Start archers immediately.'],
    ['THEN', 'Double-Bit Axe at the lumber camp. Fletching at the Blacksmith.'],
    ['ALWAYS', 'Villagers from the TC. Every. Single. 25 seconds.'],
    ['AS FOOD RUNS OUT', 'Reseed food onto farms (60 wood each). Aim for 8–10 farms by Castle click.'],
    ['~25 VILLAGERS', 'Wheelbarrow + Horse Collar. Add miners up to 6–8 on gold.'],
  ];
  steps.forEach(([k, t], i) => {
    const y = 1.75 + i * 1.0;
    s.addShape(pres.shapes.OVAL, { x: 0.65, y: y + 0.12, w: 0.55, h: 0.55, fill: { color: P.gold }, line: { color: P.gold } });
    s.addText(String(i + 1), { x: 0.65, y: y + 0.12, w: 0.55, h: 0.55, align: 'center', valign: 'middle', fontFace: HEAD, fontSize: 20, bold: true, color: P.char });
    s.addText(k, { x: 1.45, y, w: 3.0, h: 0.8, fontFace: BODY, fontSize: 14, bold: true, color: P.mute, valign: 'middle', charSpacing: 1 });
    s.addText(t, { x: 4.3, y, w: 8.4, h: 0.8, fontFace: BODY, fontSize: 20, color: P.ink, valign: 'middle' });
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  8. The golden rule (compounding)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', dark: true, kicker: 'New Information — the golden rule', title: 'The Town Centre never stops',
    notes: `Work the maths through on the board.
1 minute idle = 60 ÷ 25 ≈ 2.4 villagers you will never get back.
Each villager gathers roughly 0.35 resources a second.
If that happens 15 minutes before the end of the game: 2.4 × 0.35 × 900 ≈ 750 resources. That's a castle-age click's worth of food.
Turn & Talk: "Where do you look when you're microing archers?" (Answer: not at your TC. That's the problem.)` });
  const stat = (x, big, small) => {
    s.addText(big, { x, y: 2.0, w: 3.8, h: 1.2, fontFace: HEAD, fontSize: 60, bold: true, color: P.gold, align: 'center' });
    s.addText(small, { x, y: 3.2, w: 3.8, h: 0.9, fontFace: BODY, fontSize: 19, color: 'C8C8CC', align: 'center', valign: 'top' });
  };
  stat(0.6, '60 s', 'of idle Town Centre');
  s.addText('=', { x: 4.3, y: 2.0, w: 0.6, h: 1.2, fontFace: HEAD, fontSize: 50, color: P.mute, align: 'center' });
  stat(4.8, '2.4', 'villagers who never existed');
  s.addText('=', { x: 8.5, y: 2.0, w: 0.6, h: 1.2, fontFace: HEAD, fontSize: 50, color: P.mute, align: 'center' });
  stat(9.0, '~750', 'resources over the next 15 minutes');
  card(s, { x: 0.6, y: 4.7, w: 12.1, h: 1.6, fill: P.char2, border: '3A3A44', accent: P.gold });
  s.addText([{ text: 'TURN & TALK  ', options: { bold: true, color: P.gold } },
    { text: 'When you are busy controlling archers, what is your Town Centre doing? Be honest.', options: { color: P.off } }],
  { x: 1.0, y: 4.85, w: 11.5, h: 1.3, fontFace: BODY, fontSize: 23, valign: 'middle' });
}

// ════════════════════════════════════════════════════════════════════════════
//  9. Five idle sins
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', kicker: 'New Information', title: 'The Five Idle Sins',
    notes: `These are what the Economy Simulator measures. Students get a score for each.
Hotkey tip for the real game: bind "go to Town Centre" and "select all idle villagers" and press them every time an archer volley lands.` });
  const sins = [
    ['Idle TC', 'No villager queued. The worst one.', P.red],
    ['Housed', 'Population cap reached. Build houses before you need them.', P.red],
    ['Idle villagers', 'Berries ran out, nobody noticed.', 'C9822B'],
    ['No farms', 'Natural food is gone and you have 2 farms.', 'C9822B'],
    ['Skipped upgrades', 'No Double-Bit, Wheelbarrow or Horse Collar.', P.gold],
  ];
  sins.forEach(([t, d, c], i) => {
    const x = 0.6 + (i % 3) * 4.07, y = 1.8 + Math.floor(i / 3) * 2.55;
    card(s, { x, y, w: 3.85, h: 2.3, fill: 'FFFFFF', accent: c });
    s.addText(`${i + 1}. ${t}`, { x: x + 0.3, y: y + 0.2, w: 3.4, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: c });
    s.addText(d, { x: x + 0.3, y: y + 0.85, w: 3.4, h: 1.3, fontFace: BODY, fontSize: 19, color: P.ink, valign: 'top' });
  });
  card(s, { x: 8.74, y: 4.35, w: 3.85, h: 2.3, fill: P.char, border: P.char });
  s.addText('Bonus sin: building a 4th archery range on 22 villagers.', { x: 9.0, y: 4.5, w: 3.4, h: 2.0, fontFace: BODY, fontSize: 20, italic: true, color: P.gold, valign: 'middle' });
}

// ════════════════════════════════════════════════════════════════════════════
//  10. The Castle click maths
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', kicker: 'New Information — Castle Age', title: 'Where does the gold go?',
    notes: `This is the tension of the whole lesson. Castle Age costs 800 food and 200 gold, and archers eat 45 gold each.
Every archer you make is gold you can't spend on clicking up. So: keep two ranges going, but keep the miners growing too, and click with ~28–32 villagers.
The moment you arrive: Crossbowman upgrade first. Unupgraded archers in Castle Age are just decorations with bows.` });
  const bars = [
    ['Castle Age', 800, 200, 0],
    ['Crossbowman upgrade', 125, 75, 0],
    ['10 archers', 0, 450, 250],
    ['8 farms', 0, 0, 480],
  ];
  const max = 1000, X0 = 4.0, W = 6.0;
  bars.forEach(([name, f, g, w], i) => {
    const y = 1.9 + i * 0.95;
    s.addText(name, { x: 0.6, y, w: 3.3, h: 0.6, fontFace: BODY, fontSize: 19, color: P.ink, valign: 'middle', align: 'right' });
    let x = X0;
    [[f, 'C0392B', 'F'], [w, '8B5A2B', 'W'], [g, P.gold, 'G']].forEach(([v, c]) => {
      if (!v) return;
      const bw = v / max * W;
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.08, w: bw, h: 0.45, fill: { color: c }, line: { color: c } });
      if (bw > 0.6) s.addText(String(v), { x, y: y + 0.08, w: bw, h: 0.45, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 14, bold: true, color: 'FFFFFF' });
      x += bw;
    });
  });
  [['Food', 'C0392B'], ['Wood', '8B5A2B'], ['Gold', P.gold]].forEach(([n, c], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 4.0 + i * 1.6, y: 5.85, w: 0.3, h: 0.3, fill: { color: c }, line: { color: c } });
    s.addText(n, { x: 4.4 + i * 1.6, y: 5.75, w: 1.1, h: 0.5, fontFace: BODY, fontSize: 16, color: P.ink });
  });
  card(s, { x: 10.3, y: 1.9, w: 2.4, h: 3.7, fill: P.char, border: P.char });
  s.addText([{ text: 'Rule of thumb', options: { bold: true, color: P.gold, breakLine: true, fontSize: 18 } },
    { text: 'Click Castle at 28–32 villagers with 2 ranges still working.', options: { color: P.off, fontSize: 18 } }],
  { x: 10.45, y: 2.0, w: 2.1, h: 3.5, fontFace: BODY, valign: 'top' });
}

// ════════════════════════════════════════════════════════════════════════════
//  11. Civ-specific Castle plans
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'info', kicker: 'New Information — Castle Age plans', title: 'What happens when you arrive?',
    notes: `Britons: half-price-wood TCs make a 2–3 TC boom behind crossbows very strong. The +1 range keeps the crossbows safe while the new TCs go up.
Bohemians: the free Mining Camp techs mean your gold line is quietly faster than everyone else's. Use that gold: crossbows, then hand cannoneers arrive in Castle Age (most civs wait for Imperial).
Both: don't stop villager production in ANY TC, ever. A second TC that's idle is just an expensive house.` });
  const plan = (x, name, color, items) => {
    card(s, { x, y: 1.75, w: 5.95, h: 4.95, fill: 'FFFFFF', accent: color });
    s.addText(name, { x: x + 0.35, y: 1.9, w: 5.4, h: 0.6, fontFace: HEAD, fontSize: 28, bold: true, color });
    s.addText(bullets(items, P.ink, 19), { x: x + 0.35, y: 2.6, w: 5.4, h: 3.9, fontFace: BODY, valign: 'top' });
  };
  plan(0.6, 'Britons', P.red, [
    'Crossbowman upgrade first, then Bodkin Arrow',
    'Drop 1–2 extra TCs (half wood!) behind the army',
    'Bow Saw, Heavy Plow as wood and food allow',
    'Your range bonus buys you time: use it to boom',
  ]);
  plan(6.75, 'Bohemians', P.blue, [
    'Crossbowman upgrade, then Gold Shaft Mining (free!)',
    'Cheap Blacksmith and University: armour up early',
    'Hand Cannoneers in Castle Age to crush infantry',
    'Add a 2nd TC: the gold line will pay for it',
  ]);
}

// ════════════════════════════════════════════════════════════════════════════
//  12. We do: spot the mistakes
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'practice', kicker: 'Deliberate Practice — we do', title: 'Spot the four mistakes',
    notes: `Mini-whiteboards: write the timestamp of each mistake.
Answers (reveal on next click or verbally):
6:40 — TC idle (nothing queued for 50 s).
10:10 — Housed at 25/25.
12:00 — Berries gone, only 2 farms: 4 idle villagers.
13:30 — 4th archery range on 24 villagers; gold has 2 miners.` });
  const log = [
    ['5:10', 'Mill + 4 on berries'],
    ['6:40', 'Waiting for 175 wood for barracks… (TC queue empty)'],
    ['8:30', 'Clicked Feudal at 22 pop'],
    ['10:10', 'Built 2 archery ranges. Pop: 25/25'],
    ['12:00', 'Berries exhausted. Farms: 2'],
    ['13:30', 'Built a 4th archery range. Gold miners: 2'],
    ['16:50', 'Clicked Castle with 23 villagers. “Why am I losing?”'],
  ];
  card(s, { x: 0.6, y: 1.7, w: 12.1, h: 5.0, fill: P.char, border: P.char });
  log.forEach(([t, e], i) => {
    s.addText([{ text: t.padStart(5, ' ') + '  ', options: { color: P.gold, bold: true } }, { text: e, options: { color: 'D8D8DC' } }],
      { x: 0.95, y: 1.9 + i * 0.65, w: 11.5, h: 0.6, fontFace: MONO, fontSize: 20, valign: 'middle' });
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  13. You do: the activities
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'practice', kicker: 'Deliberate Practice — you do', title: 'Your three tasks',
    notes: `Open the three HTML files in this folder, in order. The Economy Simulator is the main task: let students replay it to beat their own score. Britons are easier in the sim; Bohemians reward a heavier gold line.` });
  const tasks = [
    ['1', 'Build Order Sequencer', 'Drag the steps of the archer build into the right order, Dark Age to Castle.'],
    ['2', 'Economy Simulator', 'Play Feudal → Castle in 3 minutes of real time. Keep the TC working and the raids out.'],
    ['3', 'Civ Quiz', 'Britons or Bohemians? Ten questions. No googling.'],
  ];
  tasks.forEach(([n, t, d], i) => {
    const y = 1.8 + i * 1.65;
    card(s, { x: 0.6, y, w: 12.1, h: 1.45, fill: 'FFFFFF', accent: P.green });
    s.addText(n, { x: 0.9, y, w: 0.8, h: 1.45, fontFace: HEAD, fontSize: 44, bold: true, color: P.green, valign: 'middle' });
    s.addText([{ text: t, options: { bold: true, fontSize: 24, color: P.ink, breakLine: true } },
      { text: d, options: { fontSize: 19, color: '55555E' } }], { x: 1.8, y: y + 0.1, w: 10.7, h: 1.25, fontFace: BODY, valign: 'middle' });
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  14. Feedback
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'feedback', kicker: 'Feedback', title: 'Read your scorecard',
    notes: `The sim's end screen gives a rank and a breakdown. Students pick the worst of their Five Idle Sins and write one sentence on how they would fix it next game.` });
  const rows = [
    ['TC idle under 30 s', 'You have the hands of a pro'],
    ['Never housed', 'You understand that houses are not optional'],
    ['30+ villagers at Castle click', 'Your economy is real'],
    ['No villagers lost to raids', 'Your archers did their one job'],
  ];
  rows.forEach(([a, b], i) => {
    const y = 1.85 + i * 1.05;
    card(s, { x: 0.6, y, w: 12.1, h: 0.85, fill: 'FFFFFF', accent: P.blue });
    s.addText(a, { x: 0.95, y, w: 5.2, h: 0.85, fontFace: BODY, fontSize: 21, bold: true, color: P.ink, valign: 'middle' });
    s.addText(b, { x: 6.2, y, w: 6.3, h: 0.85, fontFace: BODY, fontSize: 20, italic: true, color: '55555E', valign: 'middle' });
  });
  s.addText('Write: my worst sin was ____ , and next game I will ____ .', { x: 0.6, y: 6.15, w: 12.1, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: P.blue });
}

// ════════════════════════════════════════════════════════════════════════════
//  15. Plenary
// ════════════════════════════════════════════════════════════════════════════
{
  const s = slide({ pillar: 'recall', dark: true, kicker: 'Plenary — exit ticket', title: 'Back to the lesson question',
    notes: `Model answer: "Keep the TC making villagers non-stop, build houses and farms ahead of time, grow the gold line, take the eco upgrades, and only make as many archers as you need to stay safe until Castle Age."
Acceptable shorter answer: "Make villagers. Always. Forever."` });
  card(s, { x: 0.6, y: 1.8, w: 12.1, h: 2.3, fill: P.char2, border: '3A3A44', accent: P.gold });
  s.addText('How do you keep booming your economy while you make archers all the way from Feudal into Castle Age?',
    { x: 1.0, y: 1.95, w: 11.4, h: 2.0, fontFace: HEAD, fontSize: 28, bold: true, color: P.off, valign: 'middle' });
  s.addText('Answer in one sentence. You must mention the Town Centre.', { x: 0.6, y: 4.5, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 22, color: 'C8C8CC' });
  s.addText('(“wololo” is not an answer)', { x: 0.6, y: 5.3, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 18, italic: true, color: P.mute });
}

pres.writeFile({ fileName: OUT }).then(f => console.log('Wrote', f));
