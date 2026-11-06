// Y10 BTEC Component 1 — Lesson 1.3 Who Made It and Why? (spec A1: producer types, purposes, motivations, aims).
// Hub page: Y10/Component_1/L1.3_Who_Made_It_and_Why/. The deck follows the page: the four kinds of producer
// (Warm-up + Task 1), then purpose / motivation / aim with the McCrispy worked model (Tasks 2–4).
//
//   node build_L1.3.cjs   → L1.3_Who_Made_It_and_Why.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1.3_Who_Made_It_and_Why.pptx');
const K = createDeck({ lesson: '1.3', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 1.3: Who Made It and Why?' });
const { P, HEAD, M, CW, newSlide, text, rule, kicker, addIcon } = K;
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'Who makes media products, and why do they make them?';

// Recap: 1.2 (anchorage, connotation), 1.1 (sectors), then a bridge into today's question: who made it?
const RECALL = [
  { tag: 'Lesson 1.2', q: 'Words that fix what a picture means are called…', options: ['anchorage', 'polysemy', 'denotation'], a: 'Anchorage: e.g. "He\'s just Ken."' },
  { tag: 'Lesson 1.2', q: '"The shark suggests danger." Denotation or connotation?', options: ['denotation', 'connotation'], a: 'Connotation: it is suggested, not seen' },
  { tag: 'Lesson 1.1', q: 'A magazine belongs in which media sector?', options: ['print', 'interactive', 'audio / moving image'], a: 'Print' },
  { tag: 'Bridge', q: 'Which company made A Minecraft Movie (2025)?', options: ['Mojang', 'Warner Bros.', 'Netflix'], a: 'Warner Bros. Mojang made the game' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Q1–2 look back at 1.2, Q3 at 1.1. Q4 bridges into today: the game and the film have different producers. Who are they, and why do they make things?' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q4: Mojang (owned by Microsoft) made the game; Warner Bros. made the film. Today: what kind of company is Warner Bros., and why did it make the film?' });

K.titleSlide({ coverLine: 'Who Made It and Why?', issueLine: 'Lesson 1.3  ·  Y10 BTEC Creative Media',
  standfirst: 'Every media product has a producer, and a reason.', puff: 'Lesson 1.3',
  img: img('minecraft_movie_2025.jpg'), imgLabel: 'A Minecraft Movie poster (2025)',
  notes: 'Cover: A Minecraft Movie. Ask: who made it? Why would they make a film of a game? Hold the answers: we come back to Warner Bros. in Sam\'s paragraph (Task 2).' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'Topic question for the whole of Component 1; today\'s question comes back in the plenary.' });

// ── Part 1: four kinds of producer (Warm-up + Task 1) ──
K.info({ title: 'Four kinds of producer', standfirst: 'The producer is whoever makes a media product.',
  points: [['Media conglomerate', 'A giant company that owns lots of media businesses. Disney, Sony.'],
    ['Public service broadcaster', 'A duty to serve the whole public, not just make money. The BBC, Channel 4.'],
    ['Independent producer', 'A person or small company no media giant owns. ConcernedApe (Stardew Valley).'],
    ['Community media', 'Made by and for a local area or group, not for profit. Hospital radio.']],
  notes: `Spec A1 producer types. One per click. For each, ask: who owns it, and how is it paid for? Those two questions decide the type.
Conglomerate: Disney owns Pixar, Marvel, Star Wars. Public service broadcaster: paid for by the TV licence (BBC) or adverts but owned by the public (Channel 4), with a duty to inform, educate and entertain. Independent: Toby Fox made Undertale almost alone. Community: often volunteers.` });

K.choice({ question: 'BBC Radio 1 is paid for by the TV licence and plays no adverts. Which kind of producer makes it?',
  options: ['A media conglomerate', 'A public service broadcaster', 'An independent producer', 'Community media'],
  notes: 'Answer B. The TV licence and the duty to serve everyone make it a public service broadcaster. If anyone says A: the BBC is big, but size alone isn\'t the test; who pays and who it must serve is.' });

K.task({ title: 'Name the producer', mins: 12, where: 'Hub › Year 10 › Lesson 1.3 › Who Made It and Why?',
  steps: ['The page opens on the Warm-up tab: sort 8 examples, two per kind of producer.',
    'Task 1 · Mystery producer: each round names a real producer. Read the clue and name its type.',
    'Guess on clue 1 for ★★★. A wrong guess shows the next clue, but loses gold and makes you wait.'],
  criteria: ['Ask: who owns it?', 'Ask: how is it paid for?', 'All seven rounds solved'],
  notes: 'Warm-up is optional: its definitions are open on the page. Confident students can go straight to Task 1. Clues go from vague to clear: who owns it, how it is paid for, how big it is. Dotted words on the page show their meaning on hover or tap.' });

// ── Part 2: purpose, motivation, aim (Tasks 2–4) ──
K.info({ title: 'Purpose, motivation, aim', standfirst: 'Three questions to ask about every product.',
  points: [['Purpose', 'What the product does for the audience.'],
    ['Motivation', 'Why the producer makes it: what they want or get.'],
    ['Aim', 'What the producer wants the product to be like.']],
  notes: 'One per click. The test for purpose versus motivation: who gets it? If the audience gets it (a laugh, facts), it is a purpose. If the producer gets it (money, a message heard), it is a motivation.' });

{
  // The spec words, one column per question, colour-matched to the page's worked model (purpose blue, motivation red, aim green).
  const s = newSlide('C1_PAPER', 'Content', 'The words to use');
  const cols = [
    ['Purpose', 'for the audience', '1F5FAD', [['entertain', 'fun, a laugh, a story'], ['inform', 'give facts'], ['educate', 'teach'],
      ['persuade', 'get you to do or buy'], ['inspire', 'make you feel you could too'], ['challenge', 'question an idea']]],
    ['Motivation', 'for the producer', P.red, [['generate profit', 'make money'], ['raise awareness', 'make people know'],
      ['benefit a community', 'help an area or group'], ['self-expression', 'show your own ideas'], ['innovation', 'do something new'],
      ['public service responsibilities', 'a duty to serve everyone']]],
    ['Aim', 'what it is like', '2E7D4F', [['high quality', 'well made, expensive-looking'], ['distinctive', 'stands out'],
      ['accessible', 'easy for everyone to use'], ['diverse', 'many kinds of people'], ['inclusive', 'everyone feels welcome'], ['impartial', 'fair to every side']]],
  ];
  const cw = (CW - 0.6) / 3;
  cols.forEach(([head, sub, color, words], i) => {
    const x = M + i * (cw + 0.3), r = { objectName: `reveal-${i + 1}` };
    rule(s, x, 1.8, cw, color, 6, r);
    text(s, [{ text: head + '  ', options: { fontFace: HEAD, fontSize: 30, color } }, { text: sub, options: { fontSize: 16, color: P.grey } }],
      { x, y: 1.9, w: cw, h: 0.65, valign: 'middle', ...r });
    text(s, words.flatMap(([w, m]) => [{ text: w, options: { bold: true } }, { text: '  ' + m, options: { color: P.grey, breakLine: true } }]),
      { x, y: 2.6, w: cw, h: 4.2, fontSize: 18, valign: 'top', paraSpaceAfter: 6, ...r });
  });
  addIcon(s, 'info');
  s.addNotes('One column per click. These are the exact spec words: use them, not near-misses ("to make money" is fine in speech, but write "generate profit"). Students have them on the page too: dotted words show their meaning, and Task 3 has a "The words" panel.');
}

K.annotate({ title: 'Worked model: the McCrispy billboard', pillar: 'info', img: img('billboard_mccrispy.jpg'), imgLabel: 'McCrispy billboard (2025) · McDonald\'s',
  marks: [{ at: [0.33, 0.7], label: 'Purpose: persuade', note: '"Betray your go-to": swap your usual order' },
    { at: [0.46, 0.2], label: 'Motivation: generate profit', note: 'Every swap is a burger sold' },
    { at: [0.345, 0.47], label: 'Aim: distinctive', note: 'Yellow, one burger, three words: it\'s McDonald\'s' }],
  prompt: 'Purpose: the audience gets it. Motivation: the producer gets it.',
  notes: 'Model aloud, in this order: what does it do to me (purpose), what does McDonald\'s get (motivation), what did they want it to look like (aim)? Hub Task 2 repeats this model before students spot Sam\'s slips.' });

K.choice({ question: 'Sam writes: "The purpose of the billboard is to make money." What has Sam got wrong?',
  options: ['Making money is a motivation', 'A billboard has no purpose', 'Making money is an aim'],
  notes: 'Answer A, and the most common slip moderators see. The audience doesn\'t get the money; McDonald\'s does, so it is a motivation. The purpose is to persuade. Task 2 has four slips like this in Sam\'s paragraph about A Minecraft Movie.' });

K.modelAnswer({ title: 'What a good answer sounds like', question: 'Who made Stardew Valley, and what is its purpose?', key: ['Producer', 'Purpose', 'Reason'],
  parts: [['Producer', 'Stardew Valley was made by ConcernedApe, which is an independent producer.'],
    ['Purpose', 'Its purpose is to entertain,'],
    ['Reason', 'because you relax by running your own farm at your own pace.']],
  notes: 'This is the shape for hub Task 4: name the producer and its type, give the purpose in the spec word, then say why with something from the product. Then go deeper on one product: its motivation and one aim.' });

K.turnTalk({ lead: 'Think of a game, show or app you used this week.', prompt: 'Who made it? What kind of producer are they, and why did they make it?',
  notes: 'Everyone says one product out loud before writing Task 4. Push for the spec words: "a conglomerate", "to generate profit". If no one knows who made it: search "<name> made by", or check the credits or app store page (the page\'s help panel says the same).' });

K.task({ title: 'Spot it, name it, use it', mins: 25, where: 'Hub › Year 10 › Lesson 1.3 › Who Made It and Why?',
  steps: ['Task 2 · Spot the slip: click each wrong sentence in Sam\'s paragraph, check, then pick each fix.',
    'Task 3 · Name the reason: pick the exact word for each real product.',
    'Task 4 · Your turn: one product per sector, in full sentences.',
    'Finished? ★ Tricky cases, the last tab: MrBeast, Metro and the BBC.'],
  criteria: ['Purpose = what the audience gets', 'Motivation = what the producer gets', "Uses today's exact words"],
  notes: 'Tasks 2–3 are auto-marked with cooldowns; Task 4 is writing sent to Classroom. A wrong check in Task 2 marks only the sentences students flagged, so they have to find the missed slips themselves. ★ Tricky cases is optional and doesn\'t change the grade.' });

K.plenary({ lesson: LESSON, task: 'Pick one product from today. Name its producer, the kind of producer, one purpose and one motivation.',
  starter: '"___ was made by ___, a ___. Its purpose is to ___, and the motivation is to ___."',
  notes: 'Exit ticket. Check that purpose and motivation are not the same thing in their answer.' });

K.write(OUT);
