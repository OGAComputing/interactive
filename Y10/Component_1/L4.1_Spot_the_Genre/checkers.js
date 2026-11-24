// checkers.js for a page built from _templates/BTEC_Y10.html — copy it beside the page as
// checkers.js and replace the example data. Pure functions and data only (no DOM), so
// checkers.test.js can test every answer in Vitest.

// ── Task list ───────────────────────────────────────────────────────────────
// One entry per tab, in order. kind: 'choice' (radio questions), 'sort' (cards into bins),
// 'write' (open writing: completion only, never auto-marked, always gold), 'reveal' (clue-by-clue
// rounds), 'spot' (find and fix the slips in a paragraph), 'fix' (the harder spot: change any line to the
// right version), 'spectrum' (cards placed on a line between
// two ends), 'hunt' (live research: find a fact, paste its link), 'profile' (an audience profile card) or
// 'numbers' (questions answered from a real table of statistics) or 'hotspot' (click the part of a picture
// that shows X). Vary them: no lesson should run the
// same kind in two tabs in a row (Y10/CLAUDE.md).
// once: true makes a choice task an assessment (a check of what students remember): it is marked once, every
// question goes green or red without showing the right option, there is no cooldown or Try for Gold, and it scores
// the share of questions right (onceShare) instead of 80 for finishing + 20 for first time. weight: n counts a
// task n times in the score (default 1). Built for 3.3's Unit A check (Nick, 2026-11-19).
// Optional extra tabs take level: 'support' (a Warm-up for students who need a way in) or
// 'challenge' (an extension). They don't count towards the score; put them at the END of this
// list so the core tasks keep indexes 0, 1, 2…, and give their tabs class="tab support|challenge".
// 4.1 Spot the Genre. Part 1 teaches genre and iconography (film); Part 2 teaches codes and conventions
// across the sectors (TV, newspapers, websites, games). Kinds: sort (Warm-up), choice, hotspot, spot (★),
// reveal, write, write (★); 3.3 ended choice, sort, write.
export const TASKS = [
  { key: 'trail', kind: 'choice' },                              // 1 · Three trailers: a clip each, genre and iconography
  { key: 'icon', kind: 'hotspot' },                              // 2 · Find the iconography on two real posters
  { key: 'conv', kind: 'reveal', part: 2 },                      // 3 · Name the genre from its conventions, clue by clue
  { key: 'mine', kind: 'write', part: 2 },                       // 4 · Describe one trailer: genre, iconography, conventions
  { key: 'warm', kind: 'sort', level: 'support' },               // Warm-up · Which genre? (iconography examples; definitions open)
  { key: 'slip', kind: 'spot', level: 'challenge' },             // ★ Spot the slip: Mo's notes on genre (Part 1, while waiting)
  { key: 'break', kind: 'write', level: 'challenge', part: 2 },  // ★ Breaking a convention (Part 2; leads into 4.2)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'masthead' };
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
// Task 1: each clip gets a genre question and an iconography question. The iconography options are all
// things that genre could show, so only watching the clip tells you which one is there. No posters here: they
// would give the iconography away (the S, the dragon); Task 4 shows them.
const GENRES = [['scifi', 'Science fiction'], ['hero', 'Superhero'], ['fantasy', 'Fantasy'], ['horror', 'Horror']];
export const CHOICES = {
  trail: {
    dune_g: { q: 'Clip 1, Dune: Part Two. Which genre is it?', a: 'scifi', opts: GENRES },
    dune_i: { q: 'Clip 1. Which piece of science fiction iconography is in the clip?', a: 'worm',
      opts: [['worm', 'A giant sandworm in the desert'], ['robot', 'A robot with glowing red eyes'], ['laser', 'A laser gun fired at a spaceship'], ['alien', 'A green alien in a spaceship']] },
    sup_g: { q: 'Clip 2, Superman. Which genre is it?', a: 'hero', opts: GENRES },
    sup_i: { q: 'Clip 2. Which piece of superhero iconography is in the clip?', a: 'cape',
      opts: [['cape', 'A red cape and an S on the chest'], ['bat', 'A bat signal shining on the clouds'], ['shield', 'A round shield with a star on it'], ['web', 'A web shot between two tall buildings']] },
    drag_g: { q: 'Clip 3, How to Train Your Dragon. Which genre is it?', a: 'fantasy', opts: GENRES },
    drag_i: { q: 'Clip 3. Which piece of fantasy iconography is in the clip?', a: 'dragon',
      opts: [['dragon', 'Dragons and Viking warriors'], ['wand', 'A wand and a school for wizards'], ['ring', 'A magic ring and a volcano'], ['castle', 'A princess in a tall castle']] },
  },
};

// ── Sorts: { taskKey: { bins: [[key, label], …], items: [{ id, label, bin, img?, credit?, note? }] } } ──
// img = a key in the page's IMG-DATA block; credit = its source (shown under the bins);
// note = shown on the card once the task is done (e.g. the year it came out).
// Warm-up: iconography examples only (two per genre); the definitions are open on the tab.
export const SORTS = {
  warm: {
    bins: [['horror', 'Horror'], ['scifi', 'Science fiction'], ['hero', 'Superhero'], ['fantasy', 'Fantasy']],
    items: [
      { id: 'w_doll', label: 'A doll with a cracked face, sitting in the dark', bin: 'horror' },
      { id: 'w_house', label: 'An empty old house at night, one window lit', bin: 'horror' },
      { id: 'w_ship', label: 'A spaceship landing on a strange planet', bin: 'scifi' },
      { id: 'w_suit', label: 'A space suit and a helmet with a visor', bin: 'scifi' },
      { id: 'w_cape', label: 'A cape and a tight costume with a logo', bin: 'hero' },
      { id: 'w_roof', label: 'A masked figure on a rooftop above a city', bin: 'hero' },
      { id: 'w_staff', label: 'A wizard with a long staff and a spell book', bin: 'fantasy' },
      { id: 'w_dragon', label: 'A dragon flying over a stone castle', bin: 'fantasy' },
    ],
  },
};

// ── Writing: { taskKey: [{ id, prompt, starter?, minWords } | { id, prompt, short: true }] } ──
// short = a one-line name (a product, a caption), checked only for being a real name.
// differentFrom = another answer's id that this one must not repeat.
// Structure for longer writing (Nick, 2026-11-06): group = a heading before the question (e.g. a sector);
// tone = 'pur' | 'mot' | 'aim' colours the box like the decks; ask = the question to ask yourself;
// words = [[word, …], …] word banks shown under the starter: the answer must use one word from each bank.
export const WRITING = {
  // Task 4: each spec term gets its own box (Y10/CLAUDE.md "Writing structure"); students use the words themselves.
  mine: [
    { id: 'm_prod', prompt: 'Which trailer are you writing about? Dune: Part Two, Superman or How to Train Your Dragon.', short: true },
    { id: 'm_genre', group: 'Genre', prompt: 'What genre is it?', ask: 'What type of product is it, and how can you tell straight away?',
      starter: 'Its genre is … I can tell straight away because…', words: [['genre']], minWords: 10 },
    { id: 'm_icon', group: 'Iconography', prompt: 'What iconography does the trailer show?', ask: 'Which objects, costumes and settings did you see?',
      starter: 'The iconography includes … which shows the genre because…', words: [['iconography']], minWords: 12 },
    { id: 'm_conv', group: 'Conventions', prompt: 'What conventions of the genre does it follow?', ask: 'What do we expect from this genre, and does the trailer give it to us?',
      starter: 'One convention of … films is … and the trailer…', words: [['convention']], minWords: 12 },
  ],
  // ★ Part 2: a product that breaks a convention (the start of 4.2's subverting).
  break: [
    { id: 'b_prod', prompt: 'Name a different product you know that breaks a convention of its genre.', short: true },
    { id: 'b_how', prompt: 'Which convention does it break, and what does it do instead?', ask: 'Why might the producer have done that?',
      starter: 'A convention of … is … but this product…', words: [['convention'], ['genre']], minWords: 15 },
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
// Use for: identifying from evidence (producer type, genre from the first shot, audience from clues).
// Task 3: the product stays hidden; every clue is a convention. Solved rounds show the real product.
export const REVEALS = {
  conv: {
    prompt: 'Which genre do these conventions belong to?',
    auto: 7,   // a new clue every 7 s, under the 10 s a wrong guess costs, so waiting beats a wild guess
    opts: [['soap', 'Soap opera'], ['sitcom', 'Sitcom'], ['quiz', 'Quiz show'], ['tabloid', 'Tabloid newspaper'],
      ['broad', 'Broadsheet newspaper'], ['site', 'News website'], ['race', 'Racing game'], ['horror', 'Horror film']],
    rounds: [
      { id: 'r_ee', a: 'soap', label: 'EastEnders', img: 'eastenders', credit: 'BBC', note: 'BBC One, since 1985: four episodes a week, all set in Albert Square.',
        clues: ['Lots of stories run at once, and the programme never really ends.', 'The same people live and work in one place: a square with a pub, a café and a market.',
          'Every episode ends on a cliffhanger, then the same drum beats play.'] },
      { id: 'r_simp', a: 'sitcom', label: 'The Simpsons', img: 'simpsons', credit: 'Fox / Disney', note: 'Fox, since 1989: an animated sitcom; the opening ends on the family sofa.',
        clues: ['The same small group of main characters are back every week, mostly at home.', 'Each episode, an everyday problem goes wrong in a funny way.',
          'By the end, everything is back to normal, and next week nobody remembers it.'] },
      { id: 'r_chase', a: 'quiz', label: 'The Chase', img: 'chase', credit: 'ITV', note: 'ITV, since 2009: Bradley Walsh hosts; contestants play against a "Chaser".',
        clues: ['A host talks straight to the camera and to members of the public.', 'The same set, the same music and the same rounds every time.',
          'Contestants answer general knowledge questions against the clock to win a cash prize.'] },
      { id: 'r_mirror', a: 'tabloid', label: 'Sunday Mirror front page, 31 July 1966', img: 'mirror', credit: 'Sunday Mirror / Reach plc',
        note: 'The morning after England won the World Cup. A "red top" tabloid: it cost 6d (about 2½p).',
        clues: ['At the top: the masthead, the date, the issue number and the price.',
          'Columns of stories about what happened yesterday, and "Pages 6, 15, 16" telling you where to find more inside.',
          'The masthead is a red box, and a huge two-word headline with "!" sits over a big photo: more picture than words.'] },
      { id: 'r_bbc', a: 'site', label: 'BBC Sport home page', img: 'bbcsport', credit: 'bbc.co.uk/sport, screenshot 24 November 2026', note: 'bbc.co.uk/sport: updated all day, every day.',
        clues: ['A logo in the top left corner: click it and you go back to the start.', 'A navigation bar along the top, a search box and a sign-in button.',
          'Live scores and the latest stories, newest first, each one a link with a photo.'] },
      { id: 'r_f1', a: 'race', label: 'F1 25', img: 'f1', credit: 'F1 25 cover · EA Sports / Codemasters', note: 'EA Sports, 2025: the official Formula 1 game.',
        clues: ['You see everything from just behind, or inside, the vehicle you control.', 'Numbers on the screen show your position, like P3 of 20, and which lap you are on.',
          'A small map of the track and a timer counting the lap in thousandths of a second.'] },
    ],
  },
};

// ── Spot the slip (kind 'spot'): a paragraph with planted mistakes ──
// { taskKey: { by, parts: [{ id, text, fix?: { a, opts: [[key, text], …] } }] } }; parts with a fix are the slips.
// Stage 1: click every wrong sentence and nothing else, then Check. A wrong check marks only the flagged
// sentences (green = a slip, red = fine) and says how many slips are still hiding. Stage 2: the fixes appear as radio questions.
// Say on the page who "wrote" it (an imaginary student) and keep each fix's options a similar length.
// Markup: <div class="spot" data-spot="t4"></div> with the usual check, reset and feedback.
// lines: true puts each sentence on its own line (a research log, a list of survey questions).
// Use for: the common slips (profit as a purpose, wrong producer type, leading survey questions, weak evidence).
export const SPOTS = {
  slip: {
    by: "Mo's notes on genre",
    parts: [
      { id: 's1', text: 'A genre is a type of media product, like horror or science fiction.' },
      { id: 's2', text: 'Iconography is the story of the film: what happens to the characters.',
        fix: { a: 'a', opts: [['a', 'Iconography is the objects, costumes and settings we see.'], ['b', 'Iconography is the music and sound effects we hear.'], ['c', 'Iconography is the audience the film is made for.']] } },
      { id: 's3', text: 'In a superhero film, the cape and the logo on the costume are iconography.' },
      { id: 's4', text: 'A dragon and a stone castle tell us that the genre is science fiction.',
        fix: { a: 'b', opts: [['a', 'A dragon and a stone castle tell us the genre is horror.'], ['b', 'A dragon and a stone castle tell us the genre is fantasy.'], ['c', 'A dragon and a stone castle tell us the genre is superhero.']] } },
      { id: 's5', text: 'Audiences use iconography to spot the genre in the first few seconds.' },
      { id: 's6', text: 'Genre means the sector a product is in, like print or interactive.',
        fix: { a: 'c', opts: [['a', 'Genre means the audience a product is for, like teenagers.'], ['b', 'Genre means the producer that made it, like Disney or the BBC.'], ['c', 'Genre means the type of product, like horror films or games.']] } },
    ],
  },
};

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
// Task 2: zones are percent boxes on each poster (set by eye with ?zones=show). Every part a student might
// click has a zone, so the evidence names what they clicked.
export const HOTSPOTS = {
  icon: {
    pics: [
      { id: 'p_fnaf', img: 'fnaf', label: "Five Nights at Freddy's (2023): a horror film",
        alt: "Still from Five Nights at Freddy's: four animatronic animals and a cupcake toy peer over a children's ball pit in the dark, eyes glowing",
        credit: "Five Nights at Freddy's (2023) still · Universal / Blumhouse",
        // Eyes are their own zones (smaller than the heads, so they win); a head find accepts them too.
        zones: {
          back: { box: [0, 0, 100, 18], label: 'The dark room behind them' },
          pit: { box: [0, 18, 100, 82], label: 'The ball pit' },
          freddy: { box: [11, 20, 23, 38], label: 'Freddy' },
          chica: { box: [35, 22, 16, 36], label: 'Chica' },
          bonnie: { box: [53, 7, 17, 50], label: 'Bonnie' },
          foxy: { box: [72, 18, 19, 38], label: 'Foxy' },
          cupcake: { box: [28, 45, 11, 15], label: 'Mr Cupcake, a toy with eyes' },
          e_freddy: { box: [18, 38, 11, 10], label: "Freddy's glowing eyes" },
          e_chica: { box: [37, 38, 11, 10], label: "Chica's glowing eyes" },
          e_bonnie: { box: [55, 38, 11, 10], label: "Bonnie's glowing eyes" },
          e_foxy: { box: [79, 38, 7, 9], label: "Foxy's glowing eye" },
          e_cupcake: { box: [28, 47, 10, 9], label: "Mr Cupcake's glowing eyes" },
        },
        finds: [
          { id: 'h_char', q: 'A character made to scare you', ok: ['freddy', 'chica', 'bonnie', 'foxy', 'cupcake', 'e_freddy', 'e_chica', 'e_bonnie', 'e_foxy', 'e_cupcake'] },
          { id: 'h_set', q: "A setting: a children's play area, made creepy", ok: ['pit'] },
          { id: 'h_eyes', q: 'Eyes that glow in the dark', ok: ['e_freddy', 'e_chica', 'e_bonnie', 'e_foxy', 'e_cupcake'] },
        ] },
      { id: 'p_mando', img: 'mando', label: 'The Mandalorian (2019–2023): a science fiction series',
        alt: 'The Mandalorian poster: a man in a silver helmet and armour flies on a jetpack, firing a blaster, holding a small green alien, with smoke and fire behind',
        credit: 'The Mandalorian season 3 poster · Lucasfilm / Disney+',
        zones: {
          sky: { box: [0, 0, 100, 100], label: 'The smoky sky' },
          helmet: { box: [53, 2, 17, 14], label: 'The helmet' },
          armour: { box: [33, 15, 40, 30], label: 'The armour' },
          legs: { box: [8, 45, 47, 42], label: 'The armoured legs and boots' },
          blaster: { box: [3, 27, 30, 15], label: 'The blaster in his left hand' },
          rifle: { box: [70, 33, 21, 6], label: 'The blaster rifle by his side' },
          grogu: { box: [72, 15, 19, 15], label: 'Grogu, a small green alien' },
          pack: { box: [86, 8, 13, 12], label: 'The jetpack on his back' },
          pack2: { box: [91, 20, 8, 18], label: 'The jetpack on his back' },
          jet: { box: [69, 38, 7, 8], label: "The jetpack's nozzle" },
          flame: { box: [67, 45, 12, 15], label: "The jetpack's flame" },
          fire: { box: [0, 87, 35, 13], label: 'Fire and explosions' },
          title: { box: [38, 76, 62, 20], label: 'The title' },
        },
        finds: [
          { id: 'h_cost', q: 'A science fiction costume', ok: ['helmet', 'armour', 'legs'] },
          { id: 'h_weap', q: 'A science fiction weapon', ok: ['blaster', 'rifle'] },
          { id: 'h_alien', q: 'An alien creature', ok: ['grogu'] },
          { id: 'h_jet', q: 'Technology that lets a person fly', ok: ['pack', 'pack2', 'jet', 'flame'] },
        ] },
    ],
  },
};

// ── Glossary: [pattern, meaning] for every word a typical 13-year-old might not know ──
// The page underlines each match in the task content (questions, options, clues, paragraphs, prompts,
// goals) and shows the meaning on hover, focus or tap; the .terms boxes and help panels are skipped.
// pattern is a case-insensitive regex fragment matched as whole words: 'shareholders?', 'TV licence|licence fee'.
// Use (?:…) for groups, never (…). Keep each meaning under about 80 characters and in plain words.
// Include the lesson's spec terms wherever they turn up as answer options, plus everyday-but-tricky words
// (shareholders, poverty, box office); leave out words students know (entertain, volunteers, streaming).
// The spec terms' meanings start with the ISYS facts on the slides: Genre … a type of product;
// Iconography … objects, costumes, settings; Conventions … what we expect.
export const GLOSSARY = [
  ['genres?', 'A type of product, like horror, sitcom or racing game.'],
  ['iconography', 'Objects, costumes, settings: the things you see that tell you the genre.'],
  ['conventions?', 'What we expect: the things a genre usually has.'],
  ['science fiction', 'Stories about science and the future: space, aliens, robots, new technology.'],
  ['fantasy', 'Stories with magic and made-up worlds: dragons, wizards, spells.'],
  ['sectors?', 'The three groups of media: audio/moving image, print and interactive.'],
  ['animatronic', 'A robot puppet that moves, made to look like a person or animal.'],
  ['cliffhanger', 'An ending that stops at an exciting moment, so you watch the next one.'],
  ['contestants', 'The people taking part in a quiz or game show to win something.'],
  ['tabloid', 'A newspaper with big photos, short punchy headlines and short stories.'],
  ['broadsheet', 'A newspaper with long stories, small headlines and lots of detail.'],
  ['masthead', 'The name of a newspaper or magazine, in big letters across the top of the front.'],
  ['headlines?', 'The title of a news story, in big letters above it.'],
  ['navigation bar', 'The row of links along the top of a website that takes you to its sections.'],
  ['props?', 'An object a character uses or holds, like a weapon, a phone or a cake.'],
  ['jetpack', 'A machine worn on the back that blasts out flames so a person can fly.'],
  ['sandworm', 'A giant worm that lives under the desert sand in Dune.'],
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
