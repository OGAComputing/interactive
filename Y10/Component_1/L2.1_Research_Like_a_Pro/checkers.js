// Lesson 2.1 Research Like a Pro: data and marking for 1_Research_Like_a_Pro.html (pure, no DOM).
// Spec A1 "Researching media products and practice" (primary and secondary sources) and "Media research
// techniques: recording research outcomes" (note taking, screen recordings, research logs); teacher guide:
// judging the reliability of secondary sources and referencing the work of others.
// The marking functions at the bottom are copied from _templates/BTEC_Y10_checkers.js.

// ── Task list ───────────────────────────────────────────────────────────────
// Part 1 (primary vs secondary) is open from the start; Part 2 (reliable sources) opens with UNLOCK[2];
// Part 3 (research log, referencing, screenshots and screen recording) with UNLOCK[3].
export const TASKS = [
  { key: 'which', kind: 'choice' },                          // 1 · Which research? Name the technique, pick the research that fits
  { key: 'rely', kind: 'spectrum', part: 2 },                // 2 · Trust it? Minecraft sources on a line
  { key: 'slip', kind: 'spot', part: 3 },                    // 3 · Spot the slip in Jay's research log
  { key: 'log', kind: 'hunt', part: 3 },                     // 4 · Start your research log: one product per sector + one primary entry
  { key: 'warm', kind: 'sort', level: 'support' },           // Warm-up · Primary or secondary?
  { key: 'depends', kind: 'write', level: 'challenge' },     // ★ It depends (Part 1, while waiting)
  { key: 'behind', kind: 'write', level: 'challenge', part: 2 },  // ★ Who's behind it? (Part 2, while waiting)
  { key: 'more', kind: 'hunt', level: 'challenge', part: 3 },     // ★ One more for your log (Part 3)
];
export const TASK_COUNT = TASKS.length;

// ── Lesson parts: teach → tasks → teach → tasks (Nick, 2026-11-06) ──
// Give a task part: 2 (3, …) and it stays locked until the student types that part's word from UNLOCK,
// shown on the part's task slide (the deck kit's task recipe takes unlock: '…'). Part 1 needs no word.
// Every part except the last should end with an optional ★ challenge (level: 'challenge'), so students who
// finish early have work on what has been taught while they wait: the lock box links to it.
// TEACHER_WORD (or teacher mode in classroom.js) opens every part.
export const UNLOCK = { 2: 'detective', 3: 'credit' };   // shown on the Part 2 and Part 3 task slides
export const TEACHER_WORD = 'outwood';
export const partOf = i => TASKS[i]?.part || 1;
// The highest part this word opens (0 if none). Case, spaces and punctuation don't matter.
export function unlockedBy(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (w === TEACHER_WORD) return Math.max(1, ...TASKS.map(t => t.part || 1));
  return Number(Object.entries(UNLOCK).find(([, x]) => x.toLowerCase().replace(/[^a-z0-9]/g, '') === w)?.[0] || 0);
}

// ── Warm-up: the page shows what primary and secondary research are; students sort real research jobs.
export const SORTS = {
  warm: {
    bins: [['pri', 'Primary research'], ['sec', 'Secondary research']],
    items: [
      { id: 'w_pixar', label: 'You ask 15 people in your form which Pixar film is their favourite', bin: 'pri' },
      { id: 'w_dad', label: 'You ask your dad which TV shows he watched as a child, and write down what he says', bin: 'pri' },
      { id: 'w_sister', label: 'You watch your little sister play Roblox and note what she clicks on', bin: 'pri' },
      { id: 'w_barbie', label: 'Your group talks about the Barbie poster, and you note what each person says', bin: 'pri' },
      { id: 'w_empire', label: 'You read a review of Inside Out 2 on the Empire magazine website', bin: 'sec' },
      { id: 'w_euro', label: 'You read a BBC News article about how many people watched the Euro 2024 final', bin: 'sec' },
      { id: 'w_yt', label: 'You watch a YouTube video about how Spider-Verse was animated', bin: 'sec' },
      { id: 'w_pacman', label: 'You read about the history of Pac-Man on a video game museum\'s website', bin: 'sec' },
    ],
  },
};

// ── 1 · Which research? Five questions name the technique; three pick the research that would find the answer.
// Option lengths checked: the right answer is the longest in under half (checkers.test.js).
const TECH = { srv: 'Survey', int: 'Interview', obs: 'Observation', dis: 'Discussion', sec: 'Secondary research' };
const techOpts = (...keys) => keys.map(k => [k, TECH[k]]);
export const CHOICES = {
  which: {
    yt: { q: 'You give 30 Year 10s a form asking how many hours of YouTube they watch a week. What kind of research is this?', a: 'srv',
      opts: techOpts('srv', 'int', 'obs', 'sec') },
    totp: { q: 'You sit with your grandma, ask her ten questions about watching Top of the Pops in the 1980s and record her answers. What kind of research is this?', a: 'int',
      opts: techOpts('int', 'srv', 'dis', 'sec') },
    party: { q: 'At a family party you watch which Switch games your cousins choose and write down how long they play each one. What kind of research is this?', a: 'obs',
      opts: techOpts('obs', 'int', 'srv', 'dis') },
    weds: { q: 'Your table spends five minutes talking about whether the Wednesday trailer is scary or funny, and you note what each person says. What kind of research is this?', a: 'dis',
      opts: techOpts('dis', 'srv', 'obs', 'sec') },
    who: { q: 'You read a Radio Times article about how the Doctor Who theme tune was made. What kind of research is this?', a: 'sec',
      opts: techOpts('sec', 'int', 'obs', 'dis') },
    boxoff: { q: 'You want to know how much money Barbie (2023) made at the box office. Which research would find it?', a: 'sec', opts: [
      ['sec', 'Secondary: a news report on its box office'], ['srv', 'Primary: a survey of people in your class'],
      ['int', 'Primary: an interview with your best friend'], ['obs', 'Primary: watching the queue at a cinema']] },
    fc: { q: 'You want to know what Year 10s at your school think of EA Sports FC. Which research would find it?', a: 'srv', opts: [
      ['srv', 'Primary: a survey of Year 10s'], ['rev', 'Secondary: a review on a games website'],
      ['ea', 'Secondary: EA\'s own website'], ['tv', 'Primary: watching a match on TV']] },
    toy: { q: 'You want to know the year Toy Story first came out in cinemas. Which research would find it?', a: 'sec', opts: [
      ['sec', 'Secondary: a film website'], ['srv', 'Primary: a survey of your family'],
      ['int', 'Primary: an interview with a friend'], ['dis', 'Primary: a class discussion']] },
  },
};

// ── 2 · Trust it? Sources for one research question, placed between "Trust it" and "Don't trust it".
// Clear cases accept the two zones at their end; middle cases accept the middle.
const TRUST_WORDS = ['reliable', 'official', 'trusted', 'up to date', 'fact', 'second source', 'checked'];
const DOUBT_WORDS = ['anonymous', 'opinion', 'out of date', 'biased', 'unreliable', 'no source', 'fact-check', 'made up'];
export const SPECTRUMS = {
  rely: {
    ends: ['Trust it', 'Don\'t trust it'],
    zones: [['z1', 'Trust it'], ['z2', 'Mostly trust it'], ['z3', 'Check it first'], ['z4', 'Doubt it'], ['z5', 'Don\'t trust it']],
    items: [
      { id: 'r_mojang', label: 'Minecraft\'s official website, 2023: "Minecraft has sold over 300 million copies"', ok: ['z1', 'z2'],
        note: 'Official, and a fact the makers can count' },
      { id: 'r_news', label: 'A news website\'s article from 2023 that gives the same figure as Minecraft\'s official website', ok: ['z1', 'z2'],
        note: 'Trusted news, and it matches a second source' },
      { id: 'r_wiki', label: 'Wikipedia\'s Minecraft page: anyone can edit it, but each figure links to where it came from', ok: ['z2', 'z3'],
        note: 'Follow its link and check the source' },
      { id: 'r_2011', label: 'A news article from 2011: "Minecraft has sold 4 million copies"', ok: ['z3', 'z4'],
        note: 'True then, but out of date now' },
      { id: 'r_ai', label: 'An AI chatbot\'s answer that gives a number of copies but no sources', ok: ['z3', 'z4', 'z5'],
        note: 'AI can make things up: fact-check it' },
      { id: 'r_review', label: 'A review on a games website: "Minecraft is the best game ever made"', ok: ['z4', 'z5'],
        note: 'An opinion, not a fact about sales' },
      { id: 'r_reddit', label: 'An anonymous Reddit post: "my uncle works at Mojang and it\'s sold a billion"', ok: ['z4', 'z5'],
        note: 'Anonymous, no proof, and nobody can check it' },
    ],
    why: [
      { id: 'why_trust', prompt: 'The card you put nearest "Trust it": why can you trust it for this fact?',
        starter: 'I can trust … because …', minWords: 10, words: [TRUST_WORDS] },
      { id: 'why_doubt', prompt: 'The card you put nearest "Don\'t trust it": what makes it unreliable?',
        starter: 'I can\'t trust … because …', minWords: 10, words: [DOUBT_WORDS] },
    ],
  },
};

// ── 3 · Spot the slip: an imaginary student's research log on Roblox, one entry per line, with five slips.
// Each slip is a research mistake this lesson teaches (plagiarism, primary vs secondary, an unchecked claim,
// no screen recording, an out-of-date figure). Fix options are a similar length: the right one is never the longest.
export const SPOTS = {
  slip: {
    by: 'Jay, Year 10 · Research log: Roblox',
    lines: true,
    parts: [
      { id: 's1', text: 'Source 1: roblox.com, Roblox\'s official website, looked at on 3 November 2026.' },
      { id: 's2', text: 'It says players can make their own games and play games that other people have made.' },
      { id: 's3', text: 'I copied the whole "About" paragraph from the Roblox Wikipedia page into my notes.', fix: { a: 'own', opts: [
        ['own', 'That\'s plagiarism: put it in my own words and name the source'],
        ['few', 'That\'s fine, as long as I change a few words so it looks different'],
        ['keep', 'That\'s fine: it\'s only my notes, so nobody needs to know the source']] } },
      { id: 's4', text: 'Source 2: I asked six people in my form how often they play Roblox. Four play every week.' },
      { id: 's5', text: 'Source 2 is secondary research, because the answers came from other people.', fix: { a: 'pri', opts: [
        ['pri', 'It\'s primary research: I collected the answers myself'],
        ['web', 'It\'s secondary research: the answers came from a website'],
        ['none', 'It isn\'t research at all, because six people is too few']] } },
      { id: 's6', text: 'A YouTube comment said 2 billion people play Roblox every day, so I wrote it down as a fact.', fix: { a: 'chk', opts: [
        ['chk', 'Check the number in a reliable source before using it'],
        ['likes', 'Use it, because hundreds of people liked that comment'],
        ['round', 'Use it, but round the number down to be on the safe side']] } },
      { id: 's7', text: 'I put one sentence from a review in quotation marks, and wrote the website and its link under it.' },
      { id: 's8', text: 'To show how you build in Roblox Studio, I wrote: "you click stuff and it builds".', fix: { a: 'rec', opts: [
        ['rec', 'Add a short screen recording of me building something'],
        ['leave', 'Leave it: the examiner can go and play Roblox themselves'],
        ['draw', 'Draw what the screen looks like from memory at home']] } },
      { id: 's9', text: 'I took a screenshot of the Roblox home page (Windows + Shift + S) and wrote its link and the date under it.' },
      { id: 's10', text: 'Source 3: a news article from 2016 gives the number of Roblox players, so that\'s how many play it now.', fix: { a: 'old', opts: [
        ['old', 'That\'s out of date: find a figure from this year'],
        ['ok', 'That\'s fine: a news article is always a reliable source'],
        ['about', 'That\'s fine, but add "about" before the number']] } },
    ],
  },
};

// ── 4 and ★ · Hunts: live research. Each row is a research-log entry; done rows become references.
const PRIMARY_KINDS = ['survey', 'interview', 'discussion', 'observation'];
const NOTE = {
  prompt: 'Log note: what kind of research is this, and why can you trust the source?',
  starter: 'This is secondary research. I can trust it because …',
  words: [['secondary'], TRUST_WORDS],
  minWords: 10,
  primaryPrompt: 'Log note: what kind of research is this?',
  primaryStarter: 'This is primary research: a … because I …',
  primaryWords: [['primary'], PRIMARY_KINDS],
};
export const HUNTS = {
  log: {
    note: NOTE,
    rows: [
      { id: 'h_st', sector: 'Audio/moving image', label: 'Stranger Things (Netflix)', img: 'stranger', credit: 'Netflix',
        q: 'Which town is Stranger Things set in?', accept: ['Hawkins'] },
      { id: 'h_beano', sector: 'Print', label: 'The Beano', img: 'beano', credit: 'Beano Studios',
        q: 'In what year did the first issue of The Beano come out?', accept: ['1938'] },
      { id: 'h_fn', sector: 'Interactive', label: 'Fortnite', img: 'fortnite', credit: 'Epic Games',
        q: 'How many players start a game of Fortnite Battle Royale?', accept: ['100', 'hundred'] },
      { id: 'h_pri', sector: 'Primary research', label: 'Stranger Things, The Beano or Fortnite', primary: true,
        q: 'Ask someone near you which of these three they have watched, read or played, and what they thought of it. What did they say?' },
    ],
  },
  // ★ Part 3 challenge: a historical product and one of their own, for students who finish early.
  more: {
    note: NOTE,
    rows: [
      { id: 'm_old', sector: 'Historical (made before 2000)', label: 'A historical product', pick: 'A product made before 2000 (e.g. Jaws, Pac-Man, Smash Hits)',
        q: 'When did it come out, and who made it? Write it as a sentence.' },
      { id: 'm_own', sector: 'Your choice', label: 'A product you might research', pick: 'A product from any sector',
        q: 'One fact about it that would help your research. Write it as a sentence.' },
    ],
  },
};

export const REVEALS = {};   // no clue-by-clue rounds in this lesson

// ── ★ Writing challenges (evidence for Classroom; checked for real sentences only) ──
export const WRITING = {
  // ★ Part 1: research that could be either, depending on who collected it.
  depends: [
    { id: 'ch_react', prompt: 'Lots of YouTubers film themselves reacting to trailers. If you watch a YouTuber\'s reaction to the Wednesday trailer, is that primary or secondary research? What if you film your own friend reacting instead? Explain both.',
      starter: 'Watching the YouTuber is … research because … Filming my friend is … because …', minWords: 25, words: [['primary'], ['secondary']] },
    { id: 'ch_cinema', prompt: 'Your aunt works at a cinema and tells you how many tickets for Barbie it sold. Is that primary or secondary research? Is one cinema enough to say how popular Barbie was across the UK?',
      starter: 'It is … research because … One cinema is / isn\'t enough because …', minWords: 25 },
  ],
  // ★ Part 2: who is behind a source, and what they want.
  behind: [
    { id: 'ch_poster', prompt: 'Film posters often have a quote like "The best film of the year!" on them. Who chose that quote, and why might it be biased? Would you use it as evidence that the film is good?',
      starter: 'The quote was chosen by … It might be biased because …', minWords: 25 },
    { id: 'ch_wiki', prompt: 'Teachers often say "don\'t use Wikipedia as a source". Why do they say that? How could Wikipedia still help your research?',
      starter: 'Teachers say that because … but Wikipedia can still help because …', minWords: 25 },
  ],
};

// ── Glossary: hover, focus or tap shows the meaning (list shown to Nick, 2026-11-06) ──
export const GLOSSARY = [
  // Lesson terms
  ['primary research', 'Research you do yourself: you collect new information first-hand'],
  ['secondary research', 'Research someone else has already done, that you find and use'],
  ['surveys?', 'The same questions asked to lots of people'],
  ['interviews?', 'Lots of questions asked to one person, with their answers recorded'],
  ['observations?', 'Watching what people do and noting it down'],
  ['discussions?', 'A group talking about something while you note what each person says'],
  ['sources?', 'Where information comes from: a website, an article, a person'],
  ['reliable', 'You can trust it to be true'],
  ['unreliable', 'You can\'t trust it to be true'],
  ['official', 'From the people who made it or run it'],
  ['anonymous', 'Nobody knows who wrote it'],
  ['biased', 'Only shows one side, often the side that suits whoever made it'],
  ['fact-check', 'Check a claim in another source you trust'],
  ['out of date', 'No longer true, or no longer the newest information'],
  ['research log', 'A record of your research: each source, what you found and when'],
  ['references?', 'Saying where something came from: who made it, what it is, the link and the date'],
  ['plagiarism', 'Using someone else\'s words or work as if they were your own'],
  ['quotation marks', 'The marks " " that show you are using someone\'s exact words'],
  ['screen recording', 'A video of what happens on your screen'],
  // Everyday-but-tricky words
  ['box office', 'The money a film makes from cinema tickets'],
  ['issue', 'One copy of a magazine or comic, e.g. this week\'s'],
  ['Battle Royale', 'A game where lots of players fight until only one is left'],
  ['claim', 'Something someone says is true, before it has been checked'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}

// ── Marking (from the template) ─────────────────────────────────────────────
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

export function markHunt(taskKey, given) {
  const hunt = HUNTS[taskKey], res = {}, seen = new Set();
  for (const r of hunt.rows) {
    const g = f => given[`${r.id}_${f}`], note = r.note || hunt.note;
    if (r.pick) res[r.id + '_prod'] = isRealName(g('prod'));
    res[r.id + '_fact'] = r.accept ? factMatches(g('fact'), r.accept) : isRealSentence(g('fact'), r.minWords || 5);
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
