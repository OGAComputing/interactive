// checkers.js for a page built from _templates/BTEC_Y10.html — copy it beside the page as
// checkers.js and replace the example data. Pure functions and data only (no DOM), so
// checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. kind: 'choice' (radio questions), 'sort' (cards into bins),
// 'write' (open writing: completion only, never auto-marked, always gold), 'reveal' (clue-by-clue
// rounds), 'spot' (find and fix the slips in a paragraph), 'fix' (the harder spot: change any line to the
// right version), 'spectrum' (cards placed on a line between
// two ends), 'hunt' (live research: find a fact, paste its link), 'profile' (an audience profile card) or
// 'numbers' (questions answered from a real table of statistics), 'hotspot' (click the part of a picture
// that shows X) or 'order' (put cards into a running order). Vary them: no lesson should run the
// same kind in two tabs in a row (Y10/CLAUDE.md).
// once: true makes a choice task an assessment (a check of what students remember): it is marked once, every
// question goes green or red without showing the right option, there is no cooldown or Try for Gold, and it scores
// the share of questions right (onceShare) instead of 80 for finishing + 20 for first time. weight: n counts a
// task n times in the score (default 1). Built for 3.3's Unit A check (Nick, 2026-11-19).
// Optional extra tabs take level: 'support' (a Warm-up for students who need a way in) or
// 'challenge' (an extension). They don't count towards the score; put them at the END of this
// list so the core tasks keep indexes 0, 1, 2…, and give their tabs class="tab support|challenge".
// 4.3 Telling Stories (a single lesson). Part 1 teaches story and plot and the narrative structures (linear,
// non-linear, circular, interactive, open/closed, single/multi-strand); Part 2 teaches the inverted pyramid and
// uses all the words. The MTP's make: reorder a scrambled story (Wicked) and a news story (the 1969 Moon landing).
// Kinds: sort (Warm-up), order, choice, write (★), order, write, write (★); 4.2 ended sort, write, write (★).
export const TASKS = [
  { key: 'story', kind: 'order' },                                // 1 · Story order: Wicked (2024)
  { key: 'struct', kind: 'choice' },                              // 2 · Name the structure: seven real products
  { key: 'news', kind: 'order', part: 2 },                        // 3 · Build the pyramid: Man walks on the Moon (1969)
  { key: 'words', kind: 'write', part: 2 },                       // 4 · Use the words
  { key: 'warm', kind: 'sort', level: 'support' },                // Warm-up · linear, non-linear or circular? (made up)
  { key: 'nonlin', kind: 'write', level: 'challenge' },           // ★ Tell it out of order (Part 1, while waiting)
  { key: 'pyramid', kind: 'write', level: 'challenge', part: 2 }, // ★ Pigs in the news: The Three Little Pigs as a pyramid
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'headline' };
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}


// ── Multiple choice: { taskKey: { questionId: { q, a, opts: [[key, text], …], img?, alt?, credit? } } } ──
// img = a key in the page's IMG-DATA block: the question shows that picture beside it (alt = its description,
// credit = its source, shown under it). Use it when each question is about a different real product.
// Keep the options a similar length: the right answer must not be the longest.
export const CHOICES = {
  // One question per structure word (non-linear is Task 1's), each on a product no earlier lesson leads with.
  struct: {
    moana: { img: 'moana2', alt: 'Moana 2 poster: Moana on her boat on the ocean', credit: 'Moana 2 (2024) poster · Walt Disney Animation Studios',
      q: 'Moana 2 (2024) follows Moana\'s voyage day by day: from the morning she sets sail, through every danger at sea, to the day she comes home. Which structure is it?',
      a: 'lin', opts: [['lin', 'Linear'], ['non', 'Non-linear'], ['circ', 'Circular'], ['int', 'Interactive']] },
    lion: { img: 'lionking', alt: 'The Lion King (1994) poster', credit: 'The Lion King (1994) poster · Walt Disney Pictures',
      q: 'The Lion King (1994) opens with the animals gathering at Pride Rock to see baby Simba held up high. In the very last scene, they gather at Pride Rock to see Simba\'s own cub held up high. Which structure is it?',
      a: 'circ', opts: [['circ', 'Circular'], ['lin', 'Linear'], ['int', 'Interactive'], ['multi', 'Multi-strand']] },
    wild: { img: 'youvswild', alt: 'You vs. Wild key art: Bear Grylls in the wild', credit: 'You vs. Wild (2019) key art · Netflix',
      q: 'You vs. Wild (Netflix, 2019): Bear Grylls is on a mission in the wild. Every few minutes the viewer picks, with the remote, what he does next, and the episode goes a different way. Which structure is it?',
      a: 'int', opts: [['int', 'Interactive'], ['circ', 'Circular'], ['non', 'Non-linear'], ['single', 'Single-strand']] },
    avengers: { img: 'infinitywar', alt: 'Avengers: Infinity War poster', credit: 'Avengers: Infinity War (2018) poster · Marvel Studios',
      q: 'Avengers: Infinity War (2018) ends with the villain, Thanos, winning: half of all living things vanish. Audiences had to wait a year, for the next film, to find out what happened. What kind of ending is it?',
      a: 'open', opts: [['open', 'An open ending'], ['closed', 'A closed ending'], ['circ', 'A circular story'], ['int', 'An interactive story']] },
    lilo: { img: 'lilo', alt: 'Lilo & Stitch (2025) poster', credit: 'Lilo & Stitch (2025) poster · Walt Disney Pictures',
      q: 'Lilo & Stitch (2025) ends with Stitch allowed to stay on Earth, and Lilo, Nani and Stitch still a family. Every problem in the film is sorted out. What kind of ending is it?',
      a: 'closed', opts: [['closed', 'A closed ending'], ['open', 'An open ending'], ['non', 'A non-linear story'], ['multi', 'A multi-strand story']] },
    bluey: { img: 'bluey', alt: 'Bluey, Bingo and Dad playing Keepy Uppy with a balloon', credit: 'Bluey, "Keepy Uppy" (2018), still · Ludo Studio / BBC Studios',
      q: 'Bluey, "Keepy Uppy" (2018): for seven minutes, Bluey, Bingo and Dad try to keep a balloon off the floor. Nothing else happens in the episode. Which structure is it?',
      a: 'single', opts: [['single', 'Single-strand'], ['multi', 'Multi-strand'], ['open', 'An open ending'], ['non', 'Non-linear']] },
    waterloo: { img: 'waterloo', alt: 'Waterloo Road poster: pupils and teachers outside the school', credit: 'Waterloo Road poster · Wall to Wall / BBC One',
      q: 'Waterloo Road (BBC One) is a drama set in a school. Each episode cuts between the stories of several different pupils and teachers. Which structure is it?',
      a: 'multi', opts: [['multi', 'Multi-strand'], ['single', 'Single-strand'], ['circ', 'Circular'], ['lin', 'Linear']] },
  },
};

// ── Sorts: { taskKey: { bins: [[key, label], …], items: [{ id, label, bin, img?, credit?, note? }] } } ──
// img = a key in the page's IMG-DATA block; credit = its source (shown under the bins);
// note = shown on the card once the task is done (e.g. the year it came out).
export const SORTS = {
  // Warm-up: made-up stories, two per structure; the definitions are open above the cards.
  warm: {
    bins: [['lin', 'Linear'], ['non', 'Non-linear'], ['circ', 'Circular']],
    items: [
      { id: 'w_trip', label: 'A vlog of a school trip: getting on the coach, the museum, lunch, then the coach home.', bin: 'lin' },
      { id: 'w_puppy', label: 'A cartoon about a puppy\'s first day: waking up, the park, a bath, then bed.', bin: 'lin' },
      { id: 'w_crash', label: 'A film that opens with a car crash, then goes back a week to show how it happened.', bin: 'non' },
      { id: 'w_detective', label: 'A detective show that keeps cutting back to the night of the crime, ten years before.', bin: 'non' },
      { id: 'w_station', label: 'A story that begins and ends with the same girl waving goodbye at the same station.', bin: 'circ' },
      { id: 'w_bed', label: 'A music video that starts and finishes with the singer asleep in the same bed.', bin: 'circ' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
// short = a one-line name (a product, a caption), checked only for being a real name.
// differentFrom = another answer's id that this one must not repeat.
// Structure for longer writing (Nick, 2026-11-06): group = a heading before the question (e.g. a sector);
// tone = 'pur' | 'mot' | 'aim' colours the box like the decks; ask = the question to ask yourself;
// words = [[word, …], …] word banks shown under the starter: the answer must use one word from each bank.
const STRUCTURES = ['linear', 'non-linear', 'circular', 'interactive', 'open ending', 'closed ending', 'single-strand', 'multi-strand'];
export const WRITING = {
  // Task 4: each spec word used by the student (Task 1, 2 and 3 identify them).
  words: [
    { id: 'u_story', group: 'Story and plot', prompt: 'Pick a film, show or game. Are its story and its plot in the same order?',
      ask: '(What happens first in the story? What are we shown first?)', starter: 'In …, the story … but the plot …',
      words: [['story'], ['plot']], minWords: 12 },
    { id: 'u_struct', group: 'Structure', prompt: 'Pick a product. Which narrative structure does it use, and how can you tell?',
      ask: '(Time, the ending, the storylines, or the audience\'s choices?)', starter: '… is … because …',
      words: [STRUCTURES], minWords: 10 },
    { id: 'u_pyr', group: 'Inverted pyramid', prompt: 'Why did the Moon landing story put Armstrong and Aldrin at the top, and Kennedy\'s promise near the bottom?',
      ask: '(What does a reader most want to know?)', starter: 'Armstrong and Aldrin go at the top because …',
      words: [['inverted pyramid']], minWords: 12 },
  ],
  // ★ Part 1: plan a non-linear plot for a linear film.
  nonlin: [
    { id: 'n_prod', prompt: 'Which linear film or show?', short: true },
    { id: 'n_open', prompt: 'Which scene would your plot open with, and why would it hook the audience?',
      starter: 'My plot would open with …', words: [['plot']], minWords: 10 },
    { id: 'n_back', prompt: 'Where would it jump back to next, and what would the audience want to find out?',
      starter: 'Then it would jump back to …', words: [['story', 'non-linear']], minWords: 10 },
  ],
  // ★ Part 2: a story everyone knows, told in story order, rewritten as an inverted-pyramid news report.
  // Not a real news story: those are already pyramids, so students would only copy the order (Nick, 2026-11-27).
  pyramid: [
    { id: 'p_head', prompt: 'Your headline', short: true },
    { id: 'p_top', prompt: 'Sentence 1, the top: what happened, who, where and when.', starter: 'A wolf …', minWords: 8 },
    { id: 'p_mid', prompt: 'Sentence 2: one detail that tells the reader more, such as how he got in.', minWords: 6 },
    { id: 'p_bot', prompt: 'Sentence 3, the bottom: background the reader could do without. Which part of the story ends up here?', minWords: 6 },
  ],
};

// ── Reveals (kind 'reveal'): clue-by-clue rounds, one at a time, no Check button ──
// { taskKey: { prompt, opts: [[key, text], …], rounds: [{ id, clues: [3+, vaguest first], a, label, img?, credit?, note? }] } }
// showFirst: true shows each round's img and label from the start, and {who} in the prompt becomes the round's who.
// Use it when the thing is easy to name and the task is to classify it ("What type of producer is {who}?"):
// clues should then be facts that decide the answer, so students make one leap, not two (Nick, 2026-11-06).
// Students guess after any clue: earlier = more stars (starsFor); a wrong guess shows the next clue, costs
// gold and starts the cooldown. Solved rounds become "case files" showing img, label, answer and note.
// Markup: <div class="reveal-game" data-reveal="t3"></div>, a feedback div and a reset button, but no check-N button.
// auto: n shows the next clue by itself every n seconds, with a shrinking bar, and a wrong guess then shows no extra clue
// (Nick, 2026-11-24: students guessed on clue 1 without reading). Keep n under cooldownSeconds(), so waiting beats guessing.
// Use for: identifying from evidence (producer type, genre from the first shot, audience from clues).
export const REVEALS = {};

// ── Spot the slip (kind 'spot'): a paragraph with planted mistakes ──
// { taskKey: { by, parts: [{ id, text, fix?: { a, opts: [[key, text], …] } }] } }; parts with a fix are the slips.
// Stage 1: click every wrong sentence and nothing else, then Check. A wrong check marks only the flagged
// sentences (green = a slip, red = fine) and says how many slips are still hiding. Stage 2: the fixes appear as radio questions.
// Say on the page who "wrote" it (an imaginary student) and keep each fix's options a similar length.
// Markup: <div class="spot" data-spot="t4"></div> with the usual check, reset and feedback.
// lines: true puts each sentence on its own line (a research log, a list of survey questions).
// Use for: the common slips (profit as a purpose, wrong producer type, leading survey questions, weak evidence).
export const SPOTS = {};

// ── Fix the slip (kind 'fix'): the harder spot the slip; swap each wrong line for the right version ──
// { taskKey: { by, lines: [{ id, text, a, opts: [[key, whole replacement line], …] }] } }
// a = the key of the right version, or 'keep' when the line is already right. Every line has exactly three
// opts, each the WHOLE line rewritten, so opening a line never shows whether it is a slip: on a slip one opt
// is the fix and two add other mistakes; on a right line all three add a mistake. The page adds "Keep it as
// it is" and highlights the words each version changes. Students click a line, pick a version (it replaces
// the line at once), then Check. Only changed lines are marked: a right change locks green; a wrong one goes
// red with the reason ("This line was right. Put it back." or "Right line, wrong fix."), and the message says
// how many slips are still hiding. A wrong check costs the cooldown. Make each wrong version a slip students
// really make, and keep a line's four versions a similar length. Always one sentence per line.
// Markup: <div class="fix" data-fix="t9"></div> with the usual check, reset and feedback.
// Use for: a later lesson that comes back to an idea first met in a 'spot' task (both kinds stay available).
// fixDataProblems(FIXES.t9.lines) in checkers.test.js catches a line without three opts or with a bad answer key.
export const FIXES = {};

// ── Spectrum (kind 'spectrum'): place cards on a line between two ends ──
// { taskKey: { ends: [left, right], zones: [[key, label], …], items: [{ id, label, ok: [zoneKey, …], note? }], why?: [writing] } }
// Zones run left to right. A clear case accepts the one or two zones at its end; a middle case accepts a wider
// range (that's what makes it a spectrum, not a sort). why = writing questions (as in WRITING, usually with word
// banks) shown under the line: students justify their placements. A wrong place costs gold and starts the
// cooldown; a why box that isn't a real sentence goes red but is never penalised. note shows on the card once done.
// Markup: <div class="sort spectrum" data-spectrum="t5"><div class="tray"></div><div class="bins"></div></div>,
// with the usual check, reset and feedback. Clicks, keys 1–9 and drags work as in a sort.
// Use for: reliable ↔ unreliable sources, passive ↔ active audiences, preferred ↔ oppositional readings.
export const SPECTRUMS = {};

// ── Hunt (kind 'hunt'): a live research mission; each row becomes a research-log entry and a reference ──
// { taskKey: { note?: { prompt, starter, words, minWords, primaryPrompt?, primaryStarter?, primaryWords? },
//   rows: [{ id, label, sector?, img?, credit?, q, accept?: [answer, …], primary?: true, pick?: 'label', note? }] } }
// For each row students write the fact (q), paste the link to the page it came from, say who made that page,
// and write the note (why the source can be trusted). accept = accepted answers (a match anywhere, ignoring case,
// spaces and punctuation): a wrong fact costs gold and starts the cooldown. Without accept the fact must be a
// real sentence. primary: a primary-research row (what a person said; no link; uses the primary… note fields).
// pick: the student chooses the product, and pick is the label of that box. number: true = the fact must
// contain a number (a statistic), checked softly like any fact without accept. Links must be real web addresses,
// different on each row, and not a search results page. Done hunts show a reference list; the task can be saved
// again, and Try for Gold clears only the checked facts.
// Markup: <div class="hunt" data-hunt="t6"></div> with the usual check, reset and feedback.
export const HUNTS = {};

// ── Profile (kind 'profile'): build an audience profile card for a real product, field by field ──
// { taskKey: { cards: [{ id, label, sector?, img?, credit?, evidence: [fact, …],
//   fields: [{ id, group?, label, ask?, opts: [[key, text], …], ok: [key, …] }] }], why?: [writing] } }
// The evidence file (facts about the product and its audience) is what students reason from, so every
// accepted answer must follow from it. group = a heading before the field ('Primary audience', 'Secondary
// audience', 'Lifestyle'); ok = the accepted options (more than one where the evidence allows it).
// Lifestyle fields work best with distractors from the wrong field (an attitude offered as an interest), so
// students have to know what each term means, not just what fits the product. A wrong field costs gold and
// starts the cooldown; why boxes (as in a spectrum) are soft. Markup: <div class="profile" data-profile="t7"></div>
// with the usual check, reset and feedback. Use for: audience profiles (2.2), and any "fill in the card" analysis.
export const PROFILES = {};

// ── Numbers (kind 'numbers'): real tables of audience statistics, then questions answered from them ──
// { taskKey: { tables: [{ id, title, sector?, img?, head: [col, …], rows: [[cell, …], …], source }],
//   qs: [{ id, q, a: number, tol?: number, before?: '£', unit?: 'million' } | { id, q, a: key, opts: [[key, text], …] }] } }
// A number question takes what the student types ("56.9", "£56.9m", "1,200") and accepts it within tol of a
// (default 0: exact). opts makes it a radio question instead (what the table does and doesn't tell you).
// Columns whose cells are all numbers are right-aligned. Every table needs its real source (who, report, date).
// A wrong answer costs gold and starts the cooldown. Markup: <div class="numbers" data-numbers="t8"></div> with the
// usual check, reset and feedback. Use for: box office, circulation, subscribers, survey results (2.3, 7.3).
export const NUMBERS = {};

// ── Test a survey (kind 'pilot'): run an imaginary student's survey, spot the useless results, rewrite them ──
// { taskKey: { by, run: button label, lines: [{ id, text, result, slip?: { prompt, rules: [{ must | not: regex, msg }],
//   again: [{ when?: regex, show }] } }] } }
// result / show = { title?, bars: [[label, count], …] } | { title?, quotes: [text, …] } | { title?, people: [text, …] },
// or a list of them. Stage 1: Run (free) shows each line's results; the student clicks the ones that are no use to
// the researcher (a wrong check costs time; only flagged cards go green or red). Stage 2: each slip is rewritten in a
// box that starts as the original line. Rules are tested in order (ignoring case) and the first one broken shows its
// msg under the box; a rewrite that works "runs again" and shows the first `again` whose `when` matches it. A rewrite
// that doesn't work costs time. Markup: <div class="pilot" data-pilot="t5"></div>, with the usual check, reset and
// feedback. Built for 2.3 (Jay's Fortnite survey); use for any question-writing slip (surveys, interviews).
export const PILOTS = {};

// ── Hotspot (kind 'hotspot'): click the part of a real poster, still or screen that shows X ──
// { taskKey: { pics: [{ id, img, label, alt?, credit?, zones: { zoneId: { box: [x, y, w, h], label } },
//   finds: [{ id, q, ok: [zoneId, …] }] }] } }
// box = a rectangle in percent of the picture (x, y = its top-left corner), so it fits at any size. Give every
// part a student might click its own zone, not only the right ones: a click in a wrong zone or in no zone
// is wrong, and zone labels name what was clicked in the evidence. Where zones overlap, the smallest wins.
// Students pick a find (a numbered pin), then click the picture to place it; the next unplaced find is picked
// for them. Check marks each pin; a wrong one costs the cooldown. Done pictures outline the right zones.
// ?zones=show outlines every zone, for setting the boxes. hotspotDataProblems(HOTSPOTS.t2) in checkers.test.js
// catches a find whose answer isn't a zone and a box off the picture. Markup: <div class="hotspot"
// data-hotspot="t2"></div> with the usual check, reset and feedback. Built for 4.1 (iconography on a poster).
// Use for: iconography, anchorage, a layout's parts, a camera shot's framing, a game or app screen's parts.
export const HOTSPOTS = {};

// ── Order (kind 'order'): put cards into a running order, marked position by position ──
// { taskKey: { lists: [{ id, title?, img?, alt?, credit?, ends: [top label, bottom label], keep?: true,
//   items: [{ id, label, at: n | [n, …], note? }] }] } }
// at = the card's right place, counting from the top (1 = first); a list of places where two cards could fairly
// swap (two details of a news story). Cards start in a seeded shuffle with fewer than half in a right place;
// keep: true starts them in the order listed instead (e.g. the order a film shows its scenes, to be put in story
// order). Students drag a card, or use its ▲ ▼ buttons (or the arrow keys on a focused card). Check needs a card
// moved in every list; each card then goes green or red for its place (more than half wrong: how many, not which),
// and a wrong check costs the cooldown. note shows on each card once the task is done. Markup: <div class="order"
// data-order="t3"></div> with the usual check, reset and feedback. Put expect(orderDataProblems(ORDERS.t3)).toEqual([])
// in the page's checkers.test.js. Built for 4.3 (a film's story order; an inverted-pyramid news story); use for 6.2 editing.
export const ORDERS = {
  // Task 1: Wicked (2024) opens with the party for the witch's death (the end of the story), then goes back to
  // Elphaba's birth and tells the rest in order. Students put the scenes in story order.
  story: { lists: [{ id: 'wicked', title: 'Wicked (2024): put the scenes in story order', img: 'wicked',
    alt: 'Wicked (2024) poster: Elphaba and Glinda', credit: 'Wicked (2024) poster · Universal Pictures',
    ends: ['Happens first in the story', 'Happens last in the story'],
    items: [
      { id: 's_birth', label: 'Elphaba is born with green skin, and her father turns away from her.', at: 1,
        note: 'The film shows this second: it jumps back in time to Elphaba\'s birth.' },
      // Each card carries its own time clue (first day, after weeks, now best friends, once there…), so students who
      // haven't seen the film can work out the order: the task tests story and plot, not knowing Wicked (Nick, 2026-11-26).
      { id: 's_shiz', label: 'On her first day at Shiz University, Elphaba is told she must share a room with a girl called Galinda.', at: 2 },
      { id: 's_hate', label: 'For weeks, Elphaba and Galinda can\'t stand each other, and sing about how much they hate sharing a room.', at: 3 },
      { id: 's_friends', label: 'At last, Galinda gives Elphaba a makeover, and the two become best friends.', at: 4 },
      { id: 's_wizard', label: 'Now best friends, the two of them travel to the Emerald City, because the Wizard wants to meet Elphaba.', at: 5 },
      { id: 's_fraud', label: 'Once she meets him, Elphaba finds out the Wizard has no magic at all, and flies away on a broomstick.', at: 6,
        note: 'The film ends here, but the story doesn\'t.' },
      { id: 's_party', label: 'The people of Oz have a party: the Wicked Witch is dead. Glinda is asked if she was the witch\'s friend.', at: 7,
        note: 'The film opens with this scene, but it happens last in the story: after the film ends.' },
    ] }] },
  // Task 3: a news story from 21 July 1969, rewritten for this lesson from what was reported. The top tells the
  // news; two details may swap; three background paragraphs may go in any order at the bottom.
  news: { lists: [{ id: 'moon', title: 'MAN WALKS ON THE MOON', img: 'moon',
    alt: 'Buzz Aldrin standing on the Moon in his spacesuit', credit: 'Buzz Aldrin on the Moon, July 1969, photographed by Neil Armstrong · NASA (public domain). The story is rewritten for this lesson from the news of 21 July 1969.',
    ends: ['Top: every reader sees this', 'Bottom: many readers never get this far'],
    items: [
      { id: 'n_lead', label: 'Early this morning, two American astronauts, Neil Armstrong and Buzz Aldrin, became the first people ever to walk on the Moon.', at: 1,
        note: 'The top: what happened, who, where and when, in one sentence.' },
      { id: 'n_step', label: 'Armstrong climbed down the ladder of their spacecraft, Eagle, first. As he stepped onto the Moon, he said: "That\'s one small step for man, one giant leap for mankind."', at: [2, 3],
        note: 'A detail: more about what happened.' },
      { id: 'n_walk', label: 'Aldrin joined him about 20 minutes later. The two men put up an American flag and collected Moon rocks to bring back to Earth.', at: [2, 3],
        note: 'A detail: more about what happened.' },
      { id: 'n_collins', label: 'A third astronaut, Michael Collins, stayed behind, flying round and round the Moon in their main spacecraft, Columbia.', at: [4, 5, 6],
        note: 'Background: extra facts.' },
      { id: 'n_jfk', label: 'In 1961, President John F. Kennedy promised that America would land a man on the Moon before the end of the 1960s.', at: [4, 5, 6],
        note: 'Background: extra facts.' },
      { id: 'n_home', label: 'The three astronauts are due to splash down in the Pacific Ocean on Thursday.', at: [4, 5, 6],
        note: 'Background: extra facts.' },
    ] }] },
};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
// Include the lesson's spec terms wherever they turn up as answer options, plus everyday-but-tricky words
// (shareholders, poverty, box office); leave out words students know (entertain, volunteers, streaming).
export const GLOSSARY = [
  ['plot', 'The order we\'re shown: the events as the product shows them.'],
  ['non-linear', 'Jumps about in time: it might start at the end, then go back.'],
  ['linear', 'In the order it happens, from start to finish.'],
  ['circular', 'Ends where it began: the same place, person or moment.'],
  ['interactive', 'The audience\'s choices change what happens.'],
  ['open ending', 'Left unsolved: we don\'t know what happens next.'],
  ['closed ending', 'Every question is answered: the story is finished.'],
  ['single-strand', 'One storyline, from start to end.'],
  ['multi-strand', 'Several storylines at once, cutting between them.'],
  ['inverted pyramid', 'Most important first: how a news story is ordered.'],
  ['narrative', 'How a story is told: its order and its structure.'],
  ['storylines?', 'One thread of events in a story, followed from start to end.'],
  ['voyage', 'A long journey by sea.'],
  ['fraud', 'Someone who pretends to be something they are not.'],
  ['mankind', 'All people: the human race.'],
  ['splash down', 'Land in the sea at the end of a space flight.'],
  ['background', 'Extra facts that help explain the news, but aren\'t the news.'],
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

// ── Guards against gaming a check (Nick, 2026-11-17) ─────────────────────────
// Seen in 3.1: every card into the first box, check, every red card into the second, check, the rest into the
// third. That finishes a sort without reading a card. So a check can't run until the task is really attempted
// (no time lost), and a check with more than half wrong says how many, not which.
const wordsOf = t => String(t || '').toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
// How many cards each box of a sort takes (each box shows it: "2 / 3").
export function binCounts(items) {
  const n = {};
  for (const it of items) n[it.bin] = (n[it.bin] || 0) + 1;
  return n;
}
// '' when a sort or spectrum can be checked: every card placed and, in a sort, each box holding its share.
export function sortBlocker(sort, given) {
  if (sort.items.some(it => !given[it.id])) return sort.zones ? '📥 Place every card on the line first.' : '📥 Put every card in a box first.';
  if (!sort.bins) return '';
  const want = binCounts(sort.items);
  const off = sort.bins.some(([b]) => sort.items.filter(it => given[it.id] === b).length !== (want[b] || 0));
  return off ? '📥 Each box takes the number of cards shown on it. Move cards until every box is full.' : '';
}
// '' when every question has an answer.
export const unansweredBlocker = (ids, given) =>
  ids.some(id => !String(given[id] ?? '').trim()) ? '📥 Answer every question first.' : '';
// '' unless more are flagged (or changed) than there are slips: flagging everything would show where they are.
export function overBlocker(n, slips, noun, verb = 'flagged', thing = '', undo = 'Un-flag the ones you are least sure of.') {
  if (n <= slips) return '';
  return `📥 You've ${verb} ${n}${thing}, but there ${slips === 1 ? `is only 1 ${noun}` : `are only ${slips} ${noun}s`}. ${undo}`;
}
// More than half of these marked answers wrong: the check says how many, not which.
export const tooManyWrong = (res, ids) => ids.length > 0 && ids.filter(id => res[id] === false).length * 2 > ids.length;
// Writing must be mostly the student's own words: at least half its minimum length outside any run of four
// words copied from the question, its "ask" line or its starter (pasting the question back in isn't an answer;
// reusing its key words is fine).
export function ownWords(w, text) {
  if (w.short) return true;
  const runs = new Set();
  for (const part of [w.prompt, w.ask, w.starter].join('.').split(/[.,;:?!…()"“”]+/)) {
    const ws = wordsOf(part);
    for (let k = 0; k + 4 <= ws.length; k++) runs.add(ws.slice(k, k + 4).join(' '));
  }
  const ws = wordsOf(text), copied = new Array(ws.length).fill(false);
  for (let k = 0; k + 4 <= ws.length; k++) if (runs.has(ws.slice(k, k + 4).join(' '))) copied.fill(true, k, k + 4);
  return copied.filter(c => !c).length >= Math.ceil((w.minWords || 4) / 2);
}
// The same answer pasted into two boxes of one task: the later box doesn't count.
export function pastedTwice(list, given) {
  const seen = new Set(), out = new Set();
  for (const w of list) {
    if (w.short) continue;
    const s = String(given[w.id] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!s) continue;
    if (seen.has(s)) out.add(w.id); else seen.add(s);
  }
  return out;
}

export function markChoices(taskKey, given) {
  return Object.fromEntries(Object.entries(CHOICES[taskKey]).map(([id, c]) => [id, given[id] === c.a]));
}

export function markSort(taskKey, given) {
  return Object.fromEntries(SORTS[taskKey].items.map(it => [it.id, given[it.id] === it.bin]));
}

export function markWriting(taskKey, given) {
  const twice = pastedTwice(WRITING[taskKey], given);
  return Object.fromEntries(WRITING[taskKey].map(w => [w.id, markWriteQ(w, given) && !twice.has(w.id)]));
}
// One writing question: a real sentence (or name), not a copy of another answer, with a word from each bank.
export function markWriteQ(w, given) {
  const real = w.short ? isRealName(given[w.id]) : isRealSentence(given[w.id], w.minWords) && ownWords(w, given[w.id]);
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

// The zone under a point (x, y in percent of the picture): the smallest box holding it, or 'miss'.
export function zoneAt(pic, x, y) {
  let best = 'miss', area = Infinity;
  for (const [id, z] of Object.entries(pic.zones)) {
    const [zx, zy, w, h] = z.box;
    if (x >= zx && x <= zx + w && y >= zy && y <= zy + h && w * h < area) { best = id; area = w * h; }
  }
  return best;
}
// given[findId] = the zone its pin is in ('miss' outside every zone).
export function markHotspot(taskKey, given) {
  return Object.fromEntries(HOTSPOTS[taskKey].pics.flatMap(p => p.finds.map(f => [f.id, f.ok.includes(given[f.id])])));
}
// '' when every pin has been placed.
export function hotspotBlocker(hs, given) {
  return hs.pics.some(p => p.finds.some(f => !given[f.id])) ? '📍 Place every pin on its picture first.' : '';
}
// Data mistakes: a find whose answer isn't one of its picture's zones, or a box off the picture. [] when fine.
export function hotspotDataProblems(hs) {
  const out = [];
  for (const p of hs.pics) {
    for (const [id, z] of Object.entries(p.zones)) {
      const [x, y, w, h] = z.box;
      if (!(w > 0 && h > 0 && x >= 0 && y >= 0 && x + w <= 100.01 && y + h <= 100.01)) out.push(`${p.id}.${id}: box off the picture`);
      if (!z.label) out.push(`${p.id}.${id}: no label`);
    }
    for (const f of p.finds) {
      if (!f.ok.length) out.push(`${f.id}: no right zone`);
      for (const z of f.ok) if (!p.zones[z]) out.push(`${f.id}: '${z}' isn't a zone of ${p.id}`);
    }
  }
  return out;
}

// ── Order ──
const placesOf = it => [].concat(it.at);
// { itemId: true/false } for the cards in this order (item ids, top first).
export function markOrderList(list, ids) {
  const order = Array.isArray(ids) ? ids : [];
  return Object.fromEntries(list.items.map(it => [it.id, placesOf(it).includes(order.indexOf(it.id) + 1)]));
}
// given[listId] = the student's order (item ids, top first).
export function markOrder(taskKey, given) {
  return Object.assign({}, ...ORDERS[taskKey].lists.map(l => markOrderList(l, given[l.id])));
}
// One right order (cards sorted by their first right place).
export const orderAnswer = list => list.items.slice().sort((a, b) => Math.min(...placesOf(a)) - Math.min(...placesOf(b))).map(it => it.id);
// The order the cards start in: as listed (keep), or a seeded shuffle with fewer than half in a right place.
export function orderStart(list, rnd = Math.random) {
  if (list.keep) return list.items.map(it => it.id);
  let ids = list.items.map(it => it.id);
  for (let k = 0; k < 60; k++) {
    ids = shuffled(list.items, rnd).map(it => it.id);
    if (Object.values(markOrderList(list, ids)).filter(Boolean).length * 2 < ids.length) break;
  }
  return ids;
}
// '' once a card has been moved in every list (given[listId + '_moved']).
export const orderBlocker = (od, given) =>
  od.lists.some(l => !given[l.id + '_moved']) ? '📥 Put the cards in order first: drag them, or use the ▲ ▼ buttons.' : '';
// Data mistakes: a place off the list, no right order, a duplicate id, or a kept start that is already right.
export function orderDataProblems(od) {
  const out = [], seen = new Set();
  for (const l of od.lists) {
    const n = l.items.length;
    if (n < 3) out.push(`${l.id}: needs at least 3 cards`);
    if (!Array.isArray(l.ends) || l.ends.length !== 2) out.push(`${l.id}: needs ends: [top, bottom]`);
    for (const it of l.items) {
      if (seen.has(it.id)) out.push(`${it.id}: id used twice`);
      seen.add(it.id);
      if (!placesOf(it).length || placesOf(it).some(p => !Number.isInteger(p) || p < 1 || p > n)) out.push(`${it.id}: at must be places 1–${n}`);
    }
    if (!Object.values(markOrderList(l, orderAnswer(l))).every(Boolean)) out.push(`${l.id}: the places don't make one right order`);
    if (l.keep && Object.values(markOrderList(l, orderStart(l))).every(Boolean)) out.push(`${l.id}: keep starts it already in order`);
  }
  return out;
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

// House scoring: 80 for finishing every task, 20 more for getting them right first time. An assessment task
// (once: true) scores the share of its questions right instead; weight: n counts a task n times.
export function calcScore(completed, firstAttempt, answers = {}) {
  const idx = coreTasks(), w = i => TASKS[i].weight || 1;
  const total = idx.reduce((sum, i) => sum + w(i), 0);
  const pts = idx.filter(i => completed[i]).reduce((sum, i) =>
    sum + w(i) * (TASKS[i].once ? onceShare(TASKS[i].key, answers) * 100 : 80 + (firstAttempt[i] ? 20 : 0)), 0);
  return Math.round(pts / total);
}
// The share (0–1) of an assessment choice task's questions answered right.
export function onceShare(taskKey, given) {
  const v = Object.values(markChoices(taskKey, given));
  return v.length ? v.filter(Boolean).length / v.length : 0;
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
