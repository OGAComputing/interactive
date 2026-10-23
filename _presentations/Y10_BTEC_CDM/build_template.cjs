// Y10 BTEC Component 1 — "Front Page" deck TEMPLATE: one example of every slide type in lesson
// order, each labelled with its recipe (footer) and with guidance in its speaker notes.
//
//   node build_template.cjs   → C1_Deck_Template.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'C1_Deck_Template.pptx');
const K = createDeck({ lesson: 0, footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Component 1 deck template' });
const { P, HEAD, BODY, QUOTE, M, CW, W, newSlide, text, box, rule, kicker, note } = K;
const recipe = (s, name, dark) => note(s, 'TEMPLATE  ·  ' + name, dark);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do media products target a specific audience?';

// ── Guide ───────────────────────────────────────────────────────────────────
recipe(K.titleSlide({
  masthead: 'FRONT PAGE', issueLine: 'Component 1  ·  deck template', coverLine: 'One example of every slide type',
  standfirst: 'The Component 1 look: newsprint, black ink, one red.', puff: 'Copy me!',
  notes: `A reference deck, not a lesson. Each example slide names its recipe (a function in c1_kit.cjs) in the footer; its speaker notes say when to use it.
Rules and feedback: README.md in this folder. Rebuild with: node build_template.cjs`,
}), 'titleSlide', true);

{
  const s = newSlide('C1_PAPER', 'Guide', 'How the look works');
  const cols = [
    ['Paper & ink', 'Light slides are newsprint paper; dark slides are ink. The Recap answers and the plenary are the ink slides.'],
    ['One red', 'Red marks the one thing to look at: numbers, kickers, today\'s question, the live step. Never body text.'],
    ['Square & ruled', 'No rounded cards or shadows. Heavy rules separate items, like columns on a magazine page.'],
  ];
  const cw = (CW - 0.6) / 3;
  cols.forEach(([h, t], i) => {
    const x = M + i * (cw + 0.3);
    rule(s, x, 1.95, cw, P.rule, 3);
    text(s, String(i + 1), { x, y: 2.1, w: 1, h: 1, fontFace: HEAD, fontSize: 60, color: P.red });
    text(s, h, { x, y: 3.15, w: cw, h: 0.6, fontFace: HEAD, fontSize: 30 });
    text(s, t, { x, y: 3.8, w: cw, h: 2.6, fontSize: 19 });
  });
  recipe(s, 'guide');
  s.addNotes('Files: c1_kit.cjs (palette, masters and one function per slide type), build_template.cjs (this deck), README.md (rules and feedback log). Copy build_template.cjs to build_L<n>.cjs for a lesson and keep only the slides you need.');
}

{
  const s = newSlide('C1_PAPER', 'Guide', 'Palette and type');
  const sw = [['Ink', P.ink, P.paper], ['Paper', P.paper, P.ink], ['Print red', P.red, P.white], ['Red on ink', P.redLt, P.ink], ['Grey', P.grey, P.white]];
  sw.forEach(([n, c, fg], i) => {
    const x = M + i * 1.7;
    box(s, { x, y: 1.9, w: 1.5, h: 1.5, fill: c, line: P.rule, lw: 1 });
    text(s, n + '\n#' + c, { x: x + 0.1, y: 2.85, w: 1.3, h: 0.5, fontSize: 12, bold: true, color: fg });
  });
  text(s, 'Bahnschrift Condensed', { x: M, y: 3.75, w: 8, h: 0.9, fontFace: HEAD, fontSize: 48 });
  text(s, 'Headlines, numbers, the masthead. Windows font: on every school PC.', { x: M, y: 4.6, w: 8.5, h: 0.4, fontSize: 16, color: P.grey });
  text(s, 'Segoe UI for body text — 18 pt minimum.', { x: M, y: 5.15, w: 8.5, h: 0.5, fontFace: BODY, fontSize: 24 });
  text(s, 'Georgia italic for quotes, standfirsts and the topic question.', { x: M, y: 5.8, w: 8.5, h: 0.5, fontFace: QUOTE, italic: true, fontSize: 24 });
  text(s, 'Different on purpose: the Computing decks use Cambria / Calibri, charcoal and gold, and rounded cards.', {
    x: 9.5, y: 3.75, w: W - 9.5 - M, h: 2.5, fontSize: 18, color: P.grey });
  recipe(s, 'guide');
}

// ── Lesson order ────────────────────────────────────────────────────────────
const RECALL = [
  { tag: 'Last lesson', q: 'A podcast belongs to which media sector?', options: ['audio/moving image', 'publishing', 'interactive'], a: 'Audio/moving image' },
  { tag: 'Lesson 2', q: 'Name one purpose of a media product. Example: a film trailer.', a: 'To promote (also: inform, entertain, educate)' },
  { tag: 'Lesson 1', q: 'Which is a primary audience for a teen running magazine?', options: ['13–17s', 'parents', 'coaches'], a: '13–17-year-olds' },
  { tag: 'Last lesson', q: 'Is a website an example of linear or non-linear media?', options: ['linear', 'non-linear'], a: 'Non-linear: the user chooses the order' },
];
recipe(K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'recallStarter — always the first slide. 2–4 questions from last lesson and further back; the tag says which lesson. Give choices or an example in the question (README rule), so it isn\'t bare recall. Light paper slide, so the answers slide can be the dark one.' }), 'recallStarter');
recipe(K.recallAnswers({ questions: RECALL,
  notes: 'recallAnswers — the same questions on ink, answers in red. Students tick or fix in a different colour.' }), 'recallAnswers', true);

recipe(K.titleSlide({ coverLine: 'Who is it for?', standfirst: 'Every media product is made for someone. Today: how to spot who.', puff: 'Learning aim A',
  imgLabel: 'Cover image: e.g. a This Girl Can campaign poster',
  notes: 'titleSlide — the lesson as a magazine cover. coverLine = the lesson title (short!). The image fills the right side: use a real product from today\'s lesson; ask Nick for it before building.' }), 'titleSlide', true);

recipe(K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'questions — topic question (whole component, muted, the same every lesson) and today\'s question (ink panel). The plenary comes back to today\'s question.' }), 'questions');

recipe(K.info({ title: 'Three ways to describe an audience', standfirst: 'Producers picture one kind of person, then make every choice for them.',
  points: [['Demographics', 'Facts: age, gender, where they live, income.'], ['Psychographics', 'Lifestyle: interests, attitudes, values, behaviour.'],
    ['Primary or secondary', 'Who it\'s mainly for, and who else it reaches.']],
  imgLabel: 'Optional image: a real product aimed at a clear audience',
  notes: 'info — New Information. A one-sentence standfirst, then up to 4 numbered points (bold lead-in + one line). Leave imgLabel and img out for a full-width text slide.' }), 'info');

recipe(K.keyTerm({ term: 'Psychographics', say: 'say: SY-ko-GRAF-iks', definition: 'Describing an audience by how they live and think: interests, attitudes, values and behaviour.',
  example: 'This Girl Can shows real women sweating and red-faced, for women who feel judged when they exercise.',
  imgLabel: 'This Girl Can campaign still',
  notes: 'keyTerm — one key term or theory per slide: the word, how to say it if needed, a plain definition, and a REAL example with its image (ask Nick for the image). Abstract terms need a concrete model first (README rule).' }), 'keyTerm');

recipe(K.readingScaffold({ title: 'Read the brief', step: 1, source: 'From the assignment brief (sample text)',
  chunk: 'The client wants a campaign that encourages teenagers who do not usually take part in sport to try a new activity. The products must feel welcoming and must not suggest that being "sporty" matters.',
  jot: 'Silent, 1 min: who is the audience?', talk: 'What must the products avoid?',
  notes: 'readingScaffold — for any dense text (briefs, theory, exemplars). One short chunk per slide. step = the live stage (0 Read, 1 Jot, 2 Turn & Talk, 3 Share): duplicate the slide and change step to move through it. Never jump straight to open Q&A.' }), 'readingScaffold');

recipe(K.clip({ title: 'Watch: who is this for?', from: '0:00', to: '0:45', where: 'Classroom › Lesson 3 › Clip',
  imgLabel: 'Still from the clip (Drive)',
  questions: ['Who is the primary audience? Give two clues.', 'Which shot shows their lifestyle best?', 'What does the music suggest about them?'],
  notes: 'clip — a Google Drive clip (listed in Y10/media.md). The watch window is always on the slide: the page can start the clip at a time but can\'t stop it. Questions come after watching, not during.' }), 'clip', true);

recipe(K.annotate({ title: 'Annotate: how does it target its audience?', imgLabel: 'Magazine cover or poster to annotate',
  marks: [{ at: [0.5, 0.12], label: 'Masthead', note: 'Font and colour suggest…' }, { at: [0.35, 0.5], label: 'Main image', note: 'Who is shown, and how?' },
    { at: [0.72, 0.72], label: 'Cover line', note: 'Mode of address: "you"' }, { at: [0.2, 0.88], label: 'Price / free gift', note: 'Who can afford it?' }],
  prompt: 'Copy the numbers onto your printout and finish each note.',
  notes: 'annotate — a real product with numbered markers; marks[].at is [across, down] from 0 to 1 on the image. Up to 4–5 marks. Use as Deliberate Practice (default) or pillar: "info" for a worked example.' }), 'annotate');

recipe(K.compare({ title: 'Same purpose, different audience', a: { name: 'Product A', imgLabel: 'Product A (real)' }, b: { name: 'Product B', imgLabel: 'Product B (real)' },
  rows: [['Audience', '', ''], ['Colours', '', ''], ['Language', '', ''], ['Images', '', '']],
  notes: 'compare — two real products and the same criteria for each. Leave cells blank for students to fill in, or fill them for a worked example.' }), 'compare');

recipe(K.task({ title: 'Profile your audience', mins: 15, where: 'Classroom › Lesson 3 › Audience profile',
  steps: ['Pick one product from today.', 'Fill in its demographics.', 'Fill in two psychographics, each with a clue from the product.'],
  criteria: ['Every point has a clue from the product', 'Uses demographics and psychographics', 'Names a primary audience'],
  notes: 'task — Deliberate Practice. Numbered steps (3–4), where to find the worksheet, success criteria on the right, optional timer.' }), 'task');

recipe(K.choice({ question: 'Which detail best shows the audience\'s values, not just their age?',
  options: ['The price on the cover', 'A cover line about saving the planet', 'The model\'s age'],
  notes: 'choice — hinge question with 2–4 options; students show A/B/C on fingers or whiteboards. Use it to check before moving on. Make every option plausible and a similar length.' }), 'choice');

recipe(K.modelAnswer({ title: 'What a good analysis sounds like', question: 'Explain how the product targets its audience.',
  key: ['Point', 'Evidence', 'Explain'],
  parts: [['Point', 'The poster targets teenage girls who feel self-conscious about exercise.'], ['Evidence', 'It shows a red-faced girl laughing mid-run with the slogan "Have a go, not a race".'],
    ['Explain', 'This suggests that effort matters more than looking good, which reassures an audience that values fun over competition.']],
  notes: 'modelAnswer — Feedback. A model paragraph colour-coded by job (key = the roles, in order). Component 1 is marked on analytical writing, so model it before students write.' }), 'modelAnswer');

recipe(K.plenary({ lesson: LESSON, task: 'Name one product from today and explain one choice that targets its audience.',
  starter: '"The ___ targets ___ because…"',
  notes: 'plenary — always last. Revisits today\'s question as an exit task, with a sentence starter.' }), 'plenary', true);

K.write(OUT);
