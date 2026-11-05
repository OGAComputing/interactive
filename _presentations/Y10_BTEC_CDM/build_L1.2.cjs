// Y10 BTEC Component 1 — Lesson 1.2 Reading an Image (second half of the week 1 double; 1.1 has its own deck).
// Hub page: Y10/Component_1/L1.2_Reading_an_Image/.
//
//   node build_L1.2.cjs   → L1.2_Reading_an_Image.pptx

const path = require('path');
const { createDeck } = require('./c1_kit.cjs');

const OUT = process.env.DECK_OUT || path.join(__dirname, 'L1.2_Reading_an_Image.pptx');
const K = createDeck({ lesson: '1.2', footerText: 'COMPONENT 1  ·  EXPLORING MEDIA PRODUCTS', title: 'Lesson 1.2: Reading an Image' });
const img = (f) => path.join(__dirname, 'images', f);

const TOPIC = 'How are media products made to reach and engage their audiences?';
const LESSON = 'How do images and words work together to make meaning?';

// Recap looks back at 1.1 (sectors, eras, the Lion King pair), then bridges from the C3 cover to anchorage.
const RECALL = [
  { tag: 'Lesson 1.1', q: 'Minecraft belongs in which media sector?', options: ['interactive', 'print', 'audio / moving image'], a: 'Interactive: the player makes the choices' },
  { tag: 'Lesson 1.1', q: 'The Lion King (1994) was made before 2000, so it is…', options: ['historical', 'contemporary'], a: 'Historical: made before 2000' },
  { tag: 'Lesson 1.1', q: "One change from the 1994 to the 2019 Lion King? E.g. 'how it was made'.", a: 'Hand-drawn → computer-generated (CGI)' },
  { tag: 'Bridge', q: 'On your FIZZIKAL cover, the words around the cover star are…', options: ['cover lines', 'the masthead', 'the folio'], a: 'Cover lines: words that steer what the picture means' },
];
K.recallStarter({ questions: RECALL, mins: 4,
  notes: 'Q1–3 look back at 1.1. Q4 bridges from the Component 3 mock into today: words change what a picture means (anchorage).' });
K.recallAnswers({ questions: RECALL,
  notes: 'Tick or fix. Q4 is the hook: today we look at how words and pictures work together.' });

K.titleSlide({ coverLine: 'Reading an Image', issueLine: 'Lesson 1.2  ·  Y10 BTEC Creative Media', standfirst: 'Every poster is built from choices. Today you learn to read them.', puff: 'Lesson 1.2',
  img: img('barbie_ken_2023.jpg'), imgLabel: 'Barbie poster (2023)',
  notes: 'Cover: the Barbie poster. Ask: what can you see, and what does it make you think? That is today in one question.' });

K.questions({ topic: TOPIC, lesson: LESSON,
  notes: 'The topic question stays for the whole of Component 1; today\'s question comes back in the plenary.' });

K.keyTerm({ term: 'Denotation', say: 'say: dee-noh-TAY-shun', definition: 'What you can actually see or hear. Just describe it, no opinions.',
  example: 'On the Jaws poster: a woman swims at the top of the sea; a huge shark rises below her, mouth open.', img: img('jaws_1975.jpg'), imgLabel: 'Jaws poster (1975)',
  notes: 'Spec textual analysis: denotation and connotation, encoding, anchorage, polysemy. Test: could two people argue about it? If not, it is denotation.' });
K.keyTerm({ term: 'Connotation', say: 'say: con-oh-TAY-shun', definition: 'What it suggests: the ideas and feelings it gives you.',
  example: 'She has no idea what is below her. Danger is coming, and we know before she does, so we feel tense.', img: img('jaws_1975.jpg'), imgLabel: 'Jaws poster (1975)',
  notes: 'Connotations come from denotations: always point to the thing you can see first.' });

K.keyTerm({ term: 'Anchorage', definition: 'Words (a caption, title or tagline) that fix the meaning of an image, so we read it the way the producer wants.',
  example: '"She\'s everything. He\'s just Ken." tells us whose film this is: Barbie is the star.', img: img('barbie_ken_2023.jpg'), imgLabel: 'Barbie poster (2023)',
  notes: 'Without the caption: two smiling people on a pink B. With it: a joke about who matters.' });

K.annotate({ title: 'Worked model: the Jaws poster', pillar: 'info', img: img('jaws_1975.jpg'), imgLabel: 'Jaws poster (1975)',
  marks: [{ at: [0.09, 0.105], label: 'Tagline', note: '"Terrifying" → this is horror (anchorage)' }, { at: [0.86, 0.22], label: 'Title', note: 'Red capitals → blood, danger' },
    { at: [0.76, 0.31], label: 'Swimmer', note: 'Small, relaxed → helpless' }, { at: [0.8, 0.57], label: 'Shark', note: 'Rising, mouth open → a killer coming' }],
  prompt: 'See it (denotation) → read it (connotation) → fix it (anchorage).',
  notes: 'Markers sit beside the feature they label. Model aloud: say the denotation, then "this suggests…", then how the words anchor it. Hub Task 1 repeats this model, then students sort 8 new statements.' });

K.choice({ question: '"The swimmer is about to be attacked." Is that denotation, connotation or anchorage?',
  options: ['Denotation: we can see it', 'Connotation: it is suggested', 'Anchorage: the words say so'],
  notes: 'Answer B. We never see an attack: we see a shark and a swimmer, and we read danger into it.' });

K.keyTerm({ term: 'Encoding', say: 'say: en-KOH-ding', definition: 'The producer chooses every detail on purpose to put a meaning in. We decode it when we read it.',
  example: 'Jaws: a red title, a tiny swimmer and a shark she cannot see, all chosen to encode danger.', img: img('jaws_1975.jpg'), imgLabel: 'Jaws poster (1975)',
  notes: 'Encoding is the producer\'s side; connotation is what we read. Ask: why did the designer make the swimmer so small? Nothing on a poster is an accident.' });

K.keyTerm({ term: 'Polysemy', say: 'say: puh-LISS-uh-mee', definition: 'An image can be read in more than one way. Producers use anchorage to pick one.',
  example: 'Someone running at night: late for the bus, being chased, or out training? A caption decides.', img: img('photo_running.jpg'), imgLabel: 'Pexels photo: running at night',
  notes: 'This is one of the three photos for the Photoshop task. Ask for three readings before revealing the term.' });

K.turnTalk({ prompt: 'Spider-Verse: name one thing you can SEE. Then say what it SUGGESTS.', img: img('spiderverse_2023.jpg'), imgLabel: 'Spider-Verse poster (2023)',
  notes: 'Denotation then connotation, out loud, before writing it in hub Task 3. Look for: Miles upside down (his world is flipped), claw marks on his suit (danger), dozens of Spider-People (many worlds, a crowd hunting him). Push for encoding: why did the designers put him upside down?' });

K.modelAnswer({ title: 'What a good analysis sounds like', question: 'How does the Jaws poster make the audience feel?', key: ['Point', 'Evidence', 'Explain'],
  parts: [['Point', 'The Jaws poster makes the audience feel that danger is close.'],
    ['Evidence', 'A huge shark rises from the dark water towards a swimmer who cannot see it.'],
    ['Explain', 'The connotation of this is that she is helpless and the threat is hidden, so we feel tense, and the word "terrifying" anchors it as a horror film.']],
  notes: 'Point → evidence (denotation) → explain (connotation + anchorage). Students use this shape in hub Task 3 on Spider-Verse.' });

K.task({ title: 'Read the posters', mins: 20, where: 'Hub › Year 10 › Lesson 1.2 › Reading an Image',
  steps: ['New words feel tricky? Warm-up tab first: match each word to its meaning.', 'Task 1: Jaws. Read the worked model, then sort 8 statements.', 'Tasks 2–3: Barbie questions, then Spider-Verse in full sentences, ending with encoding.', 'Finished? ★ Rewrite the meaning: a new genre and tagline for Jaws.'],
  criteria: ['Denotation = only what you see', 'Connotation points to a detail', 'Says how the words fix the meaning'],
  notes: 'Tasks 1–2 are auto-marked with cooldowns; Task 3 is writing sent to Classroom. Each task has a 💡 help panel (how to tell denotation from connotation, things to look for, a word bank). Differentiation: Warm-up (Match the words) and ★ Rewrite the meaning (change the anchorage of Jaws; two readings of Spider-Verse). Optional tabs do not change the grade.' });

K.task({ title: 'One photo, two captions', mins: 20, where: 'Hub › Lesson 1.2 › Task 4 · photos in Drive › Photo Bank',
  steps: ['Pick a photo on the hub and download it from the Photo Bank.', 'Photoshop: File › Open, then the Type Tool (T): add caption 1.', 'File › Export › Export As… JPG. Change the text to caption 2 and export again.', 'Hub: polysemy (two things it could mean), then each caption and the meaning it anchors.'],
  criteria: ['Same photo, two opposite meanings', 'Captions are short, like real ones', 'Both JPGs attached in Classroom'],
  notes: 'Polysemy + anchorage made practical. The hub previews each caption on the photo as they type. Photos: Pexels (free, no attribution).' });

K.plenary({ lesson: LESSON, task: 'Pick one poster from today. Write one denotation, one connotation, and one thing the designers chose to encode.',
  starter: '"On the ___ poster I can see ___, which suggests ___. The designers chose it to…"',
  notes: 'Exit ticket. Stretch: how do its words anchor the meaning?' });

K.write(OUT);
