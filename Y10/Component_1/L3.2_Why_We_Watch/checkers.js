// checkers.js for Lesson 3.2 Why We Watch (Y10 BTEC Component 1, spec A1: audience uses and gratifications).
// Built from _templates/BTEC_Y10_checkers.js (which documents every task kind's data and markup).
// Pure functions and data only (no DOM), so checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. Optional tabs (level: 'support' | 'challenge') go at the END so the core
// tasks keep indexes 0, 1, 2…; they never change the score. No two core tabs in a row share a kind.
export const TASKS = [
  { key: 'why', kind: 'reveal' },                                 // 1 · Why are they watching? Four real people, clue by clue
  { key: 'diary', kind: 'write' },                                // 2 · Classify my diary: the need two 3.1 diary products met
  { key: 'same', kind: 'choice', part: 2 },                       // 3 · Same product, different needs (people and situations)
  { key: 'thumbs', kind: 'write', part: 3 },                      // 4 · Two thumbnails, two needs (Photoshop: adjustment layers, a cut-out, type)
  { key: 'warm', kind: 'sort', level: 'support' },                // Warm-up · Match the need (examples only; definitions open)
  { key: 'slip', kind: 'spot', level: 'challenge' },              // ★ Spot the slip: Kai's notes (Part 1, while waiting)
  { key: 'two', kind: 'write', level: 'challenge', part: 2 },     // ★ One product, two needs: a diary product, in writing (Part 2)
  { key: 'third', kind: 'write', level: 'challenge', part: 3 },   // ★ A third promise: one more thumbnail (Part 3)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Part 2 (one product, many needs; the situation changes the need) and Part 3 (the Photoshop demo:
// adjustment layers, a cut-out, type) each open with the word on their task slide.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'gratify', 3: 'thumbnail' };
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// The five needs (spec A1: information, entertainment, escapism, personal identity, social interaction).
export const NEEDS = [['info', 'Information'], ['ent', 'Entertainment'], ['esc', 'Escapism'],
  ['pi', 'Personal identity'], ['si', 'Social interaction']];
// A writing word bank: the answer must name one of the needs.
const NEED_WORDS = ['information', 'entertainment', 'escapism', 'personal identity', 'social interaction'];
// The adjustment layers the Photoshop task teaches.
const EDIT_WORDS = ['adjustment', 'hue', 'saturation', 'brightness', 'contrast', 'vibrance', 'gradient map', 'photo filter'];

// ── Multiple choice: { taskKey: { questionId: { q, a, opts, img?, alt?, credit? } } } ──
// Task 3 offers all five needs every time (seeded order), so the right one is only the longest
// when it is "Social interaction" (2 questions of 8).
export const CHOICES = {
  same: {
    c_theory: { q: 'Uses and gratifications theory says that the audience…',
      a: 'act', opts: [['act', 'chooses media to meet its own needs'], ['pas', 'takes in whatever the media shows it'], ['told', 'is told what it needs by producers']] },
    c_dev: { img: 'planetearth', alt: 'Planet Earth III poster', credit: 'Planet Earth III (2023) · BBC Studios',
      q: 'Ruby watches Planet Earth III for her geography project. Dev puts it on after a stressful day because, for an hour, he feels miles away from his homework. Which need does it meet for Dev?',
      a: 'esc', opts: NEEDS },
    c_news: { img: 'newsround', alt: 'Newsround logo', credit: 'Newsround · CBBC',
      q: 'The BBC says Newsround explains the news to 6 to 12-year-olds, so they understand what is going on in the world. Which need is it made to meet?',
      a: 'info', opts: NEEDS },
    c_rosa: { img: 'paddington', alt: 'Paddington in Peru poster', credit: 'Paddington in Peru (2024) · StudioCanal',
      q: 'Rosa\'s family moved to the UK from Peru. She loved seeing Peru on a cinema screen: "It felt like my film." Which need did Paddington in Peru meet for Rosa?',
      a: 'pi', opts: NEEDS },
    c_mum: { img: 'erastour', alt: 'Taylor Swift: The Eras Tour film poster', credit: 'Taylor Swift: The Eras Tour (2023) · AMC Theatres Distribution',
      q: 'Grace is a huge Swiftie. Her mum isn\'t a fan at all: she went to the Eras Tour film just to enjoy the catchy songs and the light show. Which need did it meet for her mum?',
      a: 'ent', opts: NEEDS },
    c_jay: { img: 'sidemen', alt: 'Sidemen FC badge', credit: 'Sidemen · Sidemen',
      q: 'Jayden watches every Sidemen video, wears a Sidemen hoodie, and uses their sayings so people know he\'s a fan. Which need do the Sidemen meet for him?',
      a: 'pi', opts: NEEDS },
    c_traitors: { img: 'traitors', alt: 'The Traitors: host Claudia Winkleman at the round table', credit: 'The Traitors · BBC One',
      q: 'Priya\'s family watch The Traitors live and argue about who the traitors are. The next day, her whole class talks about it. Which need does it meet most for Priya?',
      a: 'si', opts: NEEDS },
    c_ollie: { img: 'animalcrossing', alt: 'Animal Crossing: New Horizons key art: villagers on the island beach', credit: 'Animal Crossing: New Horizons (2020) · Nintendo',
      q: 'Ollie usually plays Animal Crossing alone to forget his worries. On Saturday he plays it on the sofa with his cousin, and they laugh and chat the whole time. Which need does it meet on Saturday?',
      a: 'si', opts: NEEDS },
  },
};

// ── Sorts: { taskKey: { bins, items: [{ id, label, bin }] } } ──
export const SORTS = {
  // Warm-up: real examples only, two per need; the definitions are open above it.
  warm: {
    bins: NEEDS,
    items: [
      { id: 'w_news', label: 'Watching Newsround to find out what is happening in the world', bin: 'info' },
      { id: 'w_score', label: 'Checking the BBC Sport app for the latest football scores', bin: 'info' },
      { id: 'w_task', label: 'Watching Taskmaster just because it makes you laugh', bin: 'ent' },
      { id: 'w_pad', label: 'Going to see Paddington in Peru for a fun afternoon', bin: 'ent' },
      { id: 'w_ac', label: 'Playing Animal Crossing to forget about a stressful day', bin: 'esc' },
      { id: 'w_oz', label: 'Watching Wicked and imagining you are in the land of Oz', bin: 'esc' },
      { id: 'w_eras', label: 'Dressing up as your favourite era for the Eras Tour film, like other Swifties', bin: 'pi' },
      { id: 'w_club', label: 'Following your football club on TikTok because it\'s "your" team', bin: 'pi' },
      { id: 'w_wordle', label: 'Posting your Wordle score in the family group chat', bin: 'si' },
      { id: 'w_among', label: 'Playing Among Us online with your mates on a call', bin: 'si' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
// group = a heading before the question; ask = the question to ask yourself; words = word banks
// (the answer must use one word from each); differentFrom = an answer this one must not repeat.
export const WRITING = {
  // Task 2: two products from the 3.1 media diary, and the main need each one met.
  diary: [
    ...[1, 2].flatMap(n => [
      { id: `d${n}_prod`, group: `Diary product ${n}`, prompt: 'The product', short: true, ...(n > 1 ? { differentFrom: `d${n - 1}_prod` } : {}) },
      { id: `d${n}_need`, prompt: 'The main need it met for you', ask: 'Which of the five needs was it? What did the product give you?',
        starter: 'It met my need for … because …', minWords: 12, words: [NEED_WORDS], ...(n > 1 ? { differentFrom: `d${n - 1}_need` } : {}) },
    ]),
    { id: 'd_most', group: 'Your whole diary', prompt: 'Which need came up most in your diary, and why do you think that is?',
      starter: 'The need I met most was … , because …', minWords: 12, words: [NEED_WORDS] },
  ],
  // ★ Part 2 challenge: one diary product, a need for you, a different need for someone else, and how the producer meets one.
  two: [
    { id: 't_prod', group: 'Your product', prompt: 'One product from your diary', short: true },
    { id: 't_me', group: 'For you', prompt: 'The need it meets for you', ask: 'Which need, and what in the product meets it?',
      starter: 'For me, … meets a need for … because …', minWords: 12, words: [NEED_WORDS] },
    { id: 't_them', group: 'For someone else', prompt: 'A different need it meets for someone else',
      ask: 'Think of a different person, or a different situation: where, when or who with.',
      starter: 'For … , it meets a need for … because …', minWords: 12, words: [NEED_WORDS], differentFrom: 't_me' },
    { id: 't_prodr', group: 'The producer', prompt: 'What has the producer put in the product to meet one of these needs?',
      ask: 'A feature, a character, a type of story, a share button…', starter: 'The producer has … , which meets a need for … because …',
      minWords: 12, words: [NEED_WORDS] },
  ],
  // Task 4 (Part 3): two Photoshop thumbnails from the Planet Earth III trailer thumbnail, each promising a
  // different need. One product, two needs, done by making (Nick, 2026-11-17: about 25 minutes, everyone).
  thumbs: [
    ...[1, 2].flatMap(n => [
      { id: `th${n}_need`, group: `Thumbnail ${n}`, prompt: 'The need it promises, and who for',
        ask: 'Which need would make someone click? What kind of viewer would it pull in?',
        starter: `My ${n === 1 ? 'first' : 'second'} thumbnail promises … to people who …`, minWords: 12, words: [NEED_WORDS],
        ...(n > 1 ? { differentFrom: 'th1_need' } : {}) },
      { id: `th${n}_how`, prompt: 'How you made it promise that',
        ask: 'Name your adjustment layers, your title and your cut-out, and what each one adds.',
        starter: 'I used … to make the colours … My title says … The cut-out of … shows …', minWords: 20,
        words: [EDIT_WORDS, ['title', 'text', 'type', 'font'], ['cut-out', 'cut out', 'mask', 'selection']],
        ...(n > 1 ? { differentFrom: 'th1_how' } : {}) },
    ]),
    { id: 'th_click', group: 'Compare', prompt: 'Which one would you click, and why?',
      starter: 'I would click … because I use products like this for …', minWords: 12, words: [NEED_WORDS] },
  ],
  // ★ Part 3 challenge: a third version promising one of the other three needs.
  third: [
    { id: 'th3_need', prompt: 'Your third thumbnail: which need does it promise, and how?',
      ask: 'Pick a need neither of your first two promised.',
      starter: 'My third thumbnail promises … I used … The title says …', minWords: 20, words: [NEED_WORDS, EDIT_WORDS] },
  ],
};

// ── Reveals (kind 'reveal'): clue-by-clue rounds; showFirst shows the product from the start ──
// Four rounds (Nick, 2026-11-17: Part 1 trimmed to make room for the Photoshop task); entertainment
// is identified in Task 3. The need depends on the person, not the product, so every round is one real person's reasons and
// the last clue decides it. Earlier clues fit more than one need, so guessing early is a real risk.
export const REVEALS = {
  why: {
    prompt: 'Which need does this product meet for {who}?',
    showFirst: true,
    opts: NEEDS,
    rounds: [
      { id: 'r_news', a: 'info', who: 'Zara', label: 'Newsround · CBBC', img: 'newsround', credit: 'CBBC',
        note: 'Finding out about the world: information',
        clues: ['Zara watches Newsround on iPlayer most mornings before school.', 'She often hears about things happening in other countries.', 'She says: "I want to know what\'s going on in the world, and why it\'s happening."'] },
      { id: 'r_ac', a: 'esc', who: 'Ollie', label: 'Animal Crossing: New Horizons · Nintendo', img: 'animalcrossing', credit: 'Nintendo',
        note: 'A calm place away from real life: escapism',
        clues: ['Ollie plays Animal Crossing most evenings.', 'He has spent hours building his perfect island.', 'He says: "When exams stress me out, my island is somewhere calm I can go instead."'] },
      { id: 'r_eras', a: 'pi', who: 'Grace', label: 'Taylor Swift: The Eras Tour (2023)', img: 'erastour', credit: 'AMC Theatres Distribution',
        note: 'Showing who she is, as a Swiftie: personal identity',
        clues: ['Grace went to see the Eras Tour film at the cinema.', 'She swapped friendship bracelets with other fans in the queue.', 'She says: "Being a Swiftie is part of who I am. I dressed as my favourite era."'] },
      { id: 'r_wordle', a: 'si', who: 'Max', label: 'Wordle · The New York Times', img: 'wordle', credit: 'The New York Times · grid drawing: Wikimedia Commons',
        note: 'Something to share and talk about: social interaction',
        clues: ['Max plays Wordle every day on his phone.', 'He plays it at breakfast, before anyone else in his family.', 'He says: "The best bit is posting my score in the family group chat and teasing my sister."'] },
    ],
  },
};

// ── Spot the slip (kind 'spot'): Kai's notes, with three planted mix-ups ──
export const SPOTS = {
  slip: {
    by: 'Kai, Year 10 · Notes on uses and gratifications',
    lines: true,
    parts: [
      { id: 'p1', text: 'Uses and gratifications theory says audiences choose media to meet their own needs.' },
      { id: 'p2', text: 'My cousin watches Newsround to find out what is happening in the world, so it meets her need for escapism.', fix: { a: 'info', opts: [
        ['info', 'Newsround meets her need for information: she learns about the world'],
        ['ent', 'Newsround meets her need for entertainment: the news is always fun'],
        ['si', 'Newsround meets her need for social interaction: she watches it alone']] } },
      { id: 'p3', text: 'My dad plays Animal Crossing to forget about work for a while, which is escapism.' },
      { id: 'p4', text: 'I post my Wordle score in our group chat every day, so for me Wordle meets a need for information.', fix: { a: 'si', opts: [
        ['si', 'For me, Wordle meets a need for social interaction: I share my score'],
        ['pi', 'For me, Wordle meets personal identity: everyone in the chat plays it'],
        ['esc', 'For me, Wordle meets a need for escapism: the chat is like another world']] } },
      { id: 'p5', text: 'Swifties who dress up as their favourite era at the Eras Tour film meet a need for personal identity.' },
      { id: 'p6', text: 'The theory says the audience is passive: the media decides what they need.', fix: { a: 'act', opts: [
        ['act', 'The theory says the audience is active: they choose what meets their needs'],
        ['pas', 'The theory says the audience is passive: they watch whatever is on TV'],
        ['prod', 'The theory says producers are active: they choose for the audience']] } },
      { id: 'p7', text: 'Watching Paddington in Peru just for a laugh meets a need for entertainment.' },
    ],
  },
};

// Kinds this lesson doesn't use (kept so the shared engine finds them).
export const FIXES = {};
export const SPECTRUMS = {};
export const HUNTS = {};
export const PROFILES = {};
export const NUMBERS = {};
export const PILOTS = {};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// Spec terms wherever they are answer options, plus everyday-but-tricky words. Meanings ≤ 80 characters.
export const GLOSSARY = [
  ['uses and gratifications', 'A theory: people choose media to meet their own needs'],
  ['gratifications?|gratify', 'A reward or need met: what you get out of using a product'],
  ['information', 'A need: finding out facts or what is happening in the world'],
  ['entertainment', 'A need: enjoyment, fun or a laugh'],
  ['escapism', 'A need: getting away from your real life and worries for a while'],
  ['personal identity', 'A need: showing or finding who you are, and what you are like'],
  ['social interaction', 'A need: something to share, do or talk about with other people'],
  ['theory', 'An idea that explains why something happens'],
  ['stressful|stress', 'Making you feel worried or under pressure'],
  ['Swifties?', 'A fan of Taylor Swift'],
  ['era', 'A part of Taylor Swift\'s career, each with its own look and album'],
  ['friendship bracelets?', 'Bead bracelets fans make and swap with each other'],
  ['thumbnail', 'The small picture that shows what a video is about before you click'],
  ['adjustment layers?', 'A Photoshop layer that changes colour or light without editing the photo'],
  ['hue', 'The colour itself: red, green, blue and so on'],
  ['saturation', 'How strong or dull a colour is'],
  ['vibrance', 'Like saturation, but it boosts the dull colours most'],
  ['gradient map', 'Swaps the dark-to-light tones for colours you choose'],
  ['photo filter', 'Tints the whole picture warmer, cooler or one colour'],
  ['layer mask', 'Hides part of a layer without deleting it: black hides, white shows'],
  ['cut-out', 'Part of one picture cut away from its background and put on another'],
  ['contrast', 'How different the darkest and lightest parts look'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking ─────────────────────────────────────────────────────────────────
// Each returns { questionId: true/false } so the page can colour every question.
export function markReveal(taskKey, given) {
  return Object.fromEntries(REVEALS[taskKey].rounds.map(r => [r.id, given[r.id] === r.a]));
}
// Stars for solving a round after seeing `shown` clues: 3 on the first clue, 2 on the second, then 1.
export const starsFor = shown => Math.max(1, 4 - shown);

export function markSpotFlags(taskKey, given) {
  return Object.fromEntries(SPOTS[taskKey].parts.map(p => [p.id, !!given[p.id] === !!p.fix]));
}
export function markSpot(taskKey, given) {
  const res = markSpotFlags(taskKey, given);
  for (const p of SPOTS[taskKey].parts) if (p.fix) res[p.id + '_fix'] = given[p.id + '_fix'] === p.fix.a;
  return res;
}

// Fix the slip: given[lineId] = the chosen version's key (absent = kept as it is).
// Marks only the changed lines; a slip left alone isn't marked, so a check never shows where it is.
export function markFixLines(lines, given) {
  return Object.fromEntries(lines.filter(l => given[l.id]).map(l => [l.id, given[l.id] === l.a]));
}
export const markFix = (taskKey, given) => markFixLines(FIXES[taskKey].lines, given);
// How many slips haven't been changed yet.
export const fixLeftLines = (lines, given) => lines.filter(l => l.a !== 'keep' && !given[l.id]).length;
export const fixLeft = (taskKey, given) => fixLeftLines(FIXES[taskKey].lines, given);
// Data mistakes that would give the slips away or make a line impossible: [] when the lines are fine.
export function fixDataProblems(lines) {
  const out = [];
  for (const l of lines) {
    const keys = l.opts.map(o => o[0]);
    if (l.opts.length !== 3) out.push(`${l.id}: needs exactly 3 opts, has ${l.opts.length}`);
    if (new Set(keys).size !== keys.length || keys.includes('keep')) out.push(`${l.id}: opt keys must be different and not 'keep'`);
    if (l.a !== 'keep' && !keys.includes(l.a)) out.push(`${l.id}: answer '${l.a}' isn't one of its opts`);
    if (l.opts.some(o => o[1].trim() === l.text.trim())) out.push(`${l.id}: an opt is the same as the line`);
  }
  if (!lines.some(l => l.a !== 'keep')) out.push('no line is a slip');
  return out;
}

export function markChoices(taskKey, given) {
  return Object.fromEntries(Object.entries(CHOICES[taskKey]).map(([id, c]) => [id, given[id] === c.a]));
}

export function markSort(taskKey, given) {
  return Object.fromEntries(SORTS[taskKey].items.map(it => [it.id, given[it.id] === it.bin]));
}

export function markWriting(taskKey, given) {
  return Object.fromEntries(WRITING[taskKey].map(w => [w.id, markWriteQ(w, given)]));
}
// One writing question: a real sentence (or name), not a copy of another answer, with a word from each bank.
export function markWriteQ(w, given) {
  const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords);
  const differs = !w.differentFrom || squash(given[w.id]) !== squash(given[w.differentFrom]);
  const worded = (w.words || []).every(bank => bank.some(x => usesWord(given[w.id], x)));
  return real && differs && worded;
}
const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function markSpectrum(taskKey, given) {
  const sp = SPECTRUMS[taskKey];
  const res = Object.fromEntries(sp.items.map(it => [it.id, it.ok.includes(given[it.id])]));
  for (const w of sp.why || []) res[w.id] = markWriteQ(w, given);
  return res;
}

export function markPilotFlags(taskKey, given) {
  return Object.fromEntries(PILOTS[taskKey].lines.map(l => [l.id, !!given[l.id] === !!l.slip]));
}
export function markPilot(taskKey, given) {
  const res = markPilotFlags(taskKey, given);
  for (const l of PILOTS[taskKey].lines) if (l.slip) res[l.id + '_re'] = !pilotProblem(l, given[l.id + '_re'] ?? l.text);
  return res;
}
// What's still wrong with a rewritten line ('' when it works).
export function pilotProblem(line, text) {
  const t = String(text ?? '');
  if (squash(t) === squash(line.text)) return 'This is still the original: change it.';
  if (!isRealSentence(t, 4)) return 'Write it out in full.';
  for (const r of line.slip.rules) {
    const hit = new RegExp(r.must ?? r.not, 'i').test(t);
    if (r.must ? !hit : hit) return r.msg;
  }
  return '';
}
// The new results a working rewrite gets when it runs again.
export function pilotAgain(line, text) {
  const a = line.slip.again.find(x => !x.when || new RegExp(x.when, 'i').test(String(text ?? '')));
  return a ? [].concat(a.show) : [];
}

export function markNumbers(taskKey, given) {
  return Object.fromEntries(NUMBERS[taskKey].qs.map(q => [q.id, q.opts ? given[q.id] === q.a
    : Math.abs(parseNumber(given[q.id]) - q.a) <= (q.tol || 0)]));
}
// The first number in what was typed, ignoring £, %, spaces and thousands commas ("£56.9m" → 56.9); NaN if none.
export function parseNumber(text) {
  const m = String(text ?? '').replace(/(\d),(?=\d{3}\b)/g, '$1').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}

export function markProfile(taskKey, given) {
  const pr = PROFILES[taskKey], res = {};
  for (const c of pr.cards) for (const f of c.fields) res[f.id] = f.ok.includes(given[f.id]);
  for (const w of pr.why || []) res[w.id] = markWriteQ(w, given);
  return res;
}

export function markHunt(taskKey, given) {
  const hunt = HUNTS[taskKey], res = {}, seen = new Set();
  for (const r of hunt.rows) {
    const g = f => given[`${r.id}_${f}`], note = r.note || hunt.note;
    if (r.pick) res[r.id + '_prod'] = isRealName(g('prod'));
    res[r.id + '_fact'] = r.accept ? factMatches(g('fact'), r.accept)
      : isRealSentence(g('fact'), r.minWords || 5) && (!r.number || /\d/.test(g('fact') || ''));
    if (!r.primary) {
      const u = linkKey(g('url'));
      res[r.id + '_url'] = isRealUrl(g('url')) && !seen.has(u);
      seen.add(u);
    }
    res[r.id + '_who'] = isRealName(g('who'));
    if (note) {
      const words = (r.primary && note.primaryWords) || note.words || [];
      res[r.id + '_note'] = isRealSentence(g('note'), note.minWords || 8) && words.every(bank => bank.some(x => usesWord(g('note'), x)));
    }
  }
  return res;
}

// The answers that are writing, links or names: they go red when missing but never cost gold or time.
export function softIds(task) {
  if (task.kind === 'spectrum') return new Set((SPECTRUMS[task.key].why || []).map(w => w.id));
  if (task.kind === 'profile') return new Set((PROFILES[task.key].why || []).map(w => w.id));
  if (task.kind === 'hunt') return new Set(HUNTS[task.key].rows.flatMap(r =>
    ['_prod', '_url', '_who', '_note', ...(r.accept ? [] : ['_fact'])].map(f => r.id + f)));
  return new Set();
}

// A fact matches if any accepted answer appears in it, ignoring case, spaces and punctuation ("Hawkins, Indiana").
export function factMatches(text, accept) {
  const t = squash(text);
  return !!t && accept.some(a => t.includes(squash(a)));
}

// A real web address copied from the address bar: no spaces, a proper domain, and not a search results page.
export function isRealUrl(text) {
  const u = parseUrl(text);
  return !!u && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(u.hostname) && !isSearchLink(text);
}
// A Google, Bing, DuckDuckGo or Yahoo results page: the search, not the source.
export function isSearchLink(text) {
  const u = parseUrl(text);
  return !!u && /(^|\.)(google|bing|duckduckgo|yahoo|ecosia)\./i.test(u.hostname) && (/^\/search/i.test(u.pathname) || u.searchParams.has('q'));
}
function parseUrl(text) {
  const t = String(text || '').trim();
  if (!t || /\s/.test(t)) return null;
  try { return new URL(/^https?:\/\//i.test(t) ? t : 'https://' + t); } catch { return null; }
}
// Two links are the same page if they match without http(s)://, www. and a trailing slash.
const linkKey = t => String(t || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

// Does the text use this word or phrase in any form? Each word of 3+ letters must appear as the start
// of a word ("generating a profit" uses "generate profit"; "accessibility" uses "accessible").
export function usesWord(text, phrase) {
  const words = String(text || '').toLowerCase().split(/[^a-z]+/);
  return phrase.toLowerCase().split(/[^a-z]+/).filter(x => x.length >= 3)
    .every(x => words.some(w => w.startsWith(x.slice(0, Math.max(4, Math.min(x.length - 3, 5))))));
}

// A name such as "EA FC 25" or "Metro": at least two letters, not one key held down.
export function isRealName(text) {
  const t = String(text || '').trim();
  return (t.match(/[a-z]/gi) || []).length >= 2 && new Set(t.toLowerCase().replace(/\s/g, '')).size >= 2;
}

export function allCorrect(result) {
  const v = Object.values(result);
  return v.length > 0 && v.every(Boolean);
}

// A real answer, not "asdf asdf asdf": enough words, mostly different, mostly made of letters.
export function isRealSentence(text, minWords = 4) {
  const words = String(text || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
  if (words.length < minWords) return false;
  if (new Set(words).size < Math.ceil(words.length * 0.6)) return false;
  if (words.some(w => w.length > 25)) return false;
  return words.filter(w => /[aeiouy]/.test(w)).length >= Math.ceil(words.length * 0.8);
}

// A wrong check costs 10 s, every time: enough to stop guessing, not so long it punishes (Nick, 2026-11-12).
export function cooldownSeconds() {
  return 10;
}

// House scoring: 80 for finishing every task, 20 more for getting them right first time.
export function calcScore(completed, firstAttempt) {
  const idx = coreTasks(), n = idx.length;
  const done = idx.filter(i => completed[i]).length;
  const mastered = idx.filter(i => completed[i] && firstAttempt[i]).length;
  return Math.round(done / n * 80 + mastered / n * 20);
}

// Optional tasks (level: 'support' or 'challenge') never count towards the score, gold or "all done",
// so nobody loses marks for skipping a Warm-up or a Challenge. They still send their evidence.
const coreTasks = () => TASKS.map((t, i) => (t.level ? -1 : i)).filter(i => i >= 0);
export const coreDone = completed => coreTasks().every(i => completed[i]);
export const coreGold = firstAttempt => coreTasks().every(i => firstAttempt[i]);

// ── Per-student order (seeded, so neighbours see different orders) ──────────
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed).toUpperCase()) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (!s) s = 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
