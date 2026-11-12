import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, NUMBERS, HUNTS, PILOTS, WRITING, markSort, markChoices, markNumbers, parseNumber,
  markHunt, markPilot, markPilotFlags, pilotProblem, pilotAgain, markWriting, softIds, allCorrect, calcScore, GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Counting_and_Asking_Audiences.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = c => c.opts.every(([k]) => k === c.a || optLen(c.opts, c.a) >= optLen(c.opts, k));

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Counting and Asking Audiences');
    expect(html).toContain("const ACTIVITY_TITLE = 'Counting and Asking Audiences';");
    expect(html).toMatch(/class="tab support active" data-idx="6"/);
    expect(html).toMatch(/class="panel active" id="panel-6"/);
    for (let i = 0; i < TASK_COUNT; i++) {
      expect(html, `tab ${i}`).toContain(`data-idx="${i}"`);
      expect(html, `panel ${i}`).toContain(`id="panel-${i}"`);
    }
    expect(html).not.toMatch(/FILL IN|TODO/);
  });

  test('no two core tabs in a row use the same kind, and at most one core sort', () => {
    const core = TASKS.filter(t => !t.level);
    for (let i = 1; i < core.length; i++) expect(core[i].kind, core[i].key).not.toBe(core[i - 1].kind);
    expect(core.filter(t => t.kind === 'sort').length).toBeLessThanOrEqual(1);
  });

  test('every inlined image the page uses is in the IMG-DATA block', () => {
    const keys = [...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1])
      .concat(NUMBERS.read.tables.filter(t => t.img).map(t => t.img));
    for (const k of new Set(keys)) expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/jpeg;base64,`));
    expect(html.length).toBeLessThan(1_000_000);
  });
});

describe('parts', () => {
  test('Part 2 opens with its word (any case or hyphen), the teacher word opens everything, and Part 1 has a challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('Follow-up')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('survey')).toBe(0);
    const p1 = TASKS.map((t, i) => i).filter(i => partOf(i) === 1);
    expect(p1.some(i => TASKS[i].level === 'challenge')).toBe(true);
    expect(TASKS.map((t, i) => i).filter(i => partOf(i) === 2).some(i => TASKS[i].level === 'challenge')).toBe(true);
  });
});

describe('warm-up: which kind of number?', () => {
  test('two examples in each box, and right answers pass', () => {
    const right = Object.fromEntries(SORTS.warm.items.map(it => [it.id, it.bin]));
    for (const [bin] of SORTS.warm.bins) expect(SORTS.warm.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(allCorrect(markSort('warm', right))).toBe(true);
    expect(markSort('warm', { ...right, w_beano: 'sales' }).w_beano).toBe(false);
  });
});

describe('1 · which number? and 4 · which way to ask?', () => {
  for (const key of ['which', 'how']) {
    const qs = Object.entries(CHOICES[key]);
    test(`${key}: every answer is an option, right answers pass and a wrong one fails`, () => {
      for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
      const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
      expect(allCorrect(markChoices(key, right))).toBe(true);
      const [id, c] = qs[0];
      expect(markChoices(key, { ...right, [id]: c.opts.find(o => o[0] !== c.a)[0] })[id]).toBe(false);
    });
    test(`${key}: the right answer is the longest option in under half the questions`, () => {
      expect(qs.filter(([, c]) => rightIsLongest(c)).length).toBeLessThan(qs.length / 2);
    });
  }

  test('every method and every question type is a right answer once in Task 4', () => {
    const answers = Object.values(CHOICES.how).map(c => c.a);
    for (const k of ['int', 'fg', 'sur', 'rate', 'rank', 'open', 'mc']) expect(answers.filter(a => a === k), k).toHaveLength(1);
  });

  test('no warm-up card turns up again as an option', () => {
    const opts = Object.values(CHOICES.which).flatMap(c => c.opts.map(o => o[1]));
    for (const it of SORTS.warm.items) expect(opts).not.toContain(it.label);
  });
});

describe('2 · read the numbers', () => {
  const nd = NUMBERS.read;
  const right = Object.fromEntries(nd.qs.map(q => [q.id, q.opts ? q.a : String(q.a)]));

  test('every table has a source and rows as wide as its head', () => {
    for (const t of nd.tables) {
      expect(t.source, t.id).toBeTruthy();
      for (const r of t.rows) expect(r, t.id).toHaveLength(t.head.length);
    }
  });

  test('the answers follow from the tables', () => {
    const cell = (tid, name, col) => nd.tables.find(t => t.id === tid).rows.find(r => r.some(c => c.startsWith(name)))[col];
    const q = id => nd.qs.find(x => x.id === id);
    expect(q('n_mc').a).toBe(parseNumber(cell('tA', 'A Minecraft Movie', 2)));
    expect(q('n_gap').a).toBeCloseTo(parseNumber(cell('tA', 'A Minecraft Movie', 2)) - parseNumber(cell('tA', 'Lilo and Stitch', 2)), 5);
    expect(q('n_tt').a).toBe(parseNumber(cell('tB', 'TikTok', 1)));
    expect(Math.abs(30 * parseNumber(cell('tB', 'WhatsApp', 1)) / 100 - q('n_class').a)).toBeLessThanOrEqual(q('n_class').tol);
    expect(Math.abs(parseNumber(cell('tC', 'TV Choice', 2)) / 40000 - q('n_times').a)).toBeLessThanOrEqual(q('n_times').tol);
    expect(q('n_beast').a).toBe(parseNumber(cell('tC', 'MrBeast', 2)) - 400);
  });

  test('typed answers are read with £, commas, units and spaces; wrong or blank ones fail', () => {
    expect(parseNumber('£56.9m')).toBe(56.9);
    expect(parseNumber('850,169 copies')).toBe(850169);
    expect(parseNumber(' 19 ')).toBe(19);
    expect(parseNumber('about twenty')).toBeNaN();
    expect(allCorrect(markNumbers('read', right))).toBe(true);
    const res = markNumbers('read', { ...right, n_mc: '£56.9 million', n_class: '18', n_gap: '19', n_tt: '' });
    expect(res.n_mc).toBe(true);
    expect(res.n_class).toBe(true);    // 18.9 rounds either way: within 1
    expect(res.n_gap).toBe(false);
    expect(res.n_tt).toBe(false);
    expect(markNumbers('read', { ...right, n_not: 'most' }).n_not).toBe(false);
  });

  test('the option questions: right answer is the longest in under half', () => {
    const oq = nd.qs.filter(q => q.opts);
    expect(oq.filter(rightIsLongest).length).toBeLessThan(oq.length / 2);
  });
});

describe('3 · find two statistics (hunt)', () => {
  const good = {
    h1_prod: 'A Minecraft Movie', h1_fact: 'It took £56.9 million at UK and Ireland cinemas in 2025', h1_url: 'https://www.bbc.co.uk/news/articles/c123',
    h1_who: 'BBC News', h1_note: 'This box office figure shows that millions of people paid to see it at the cinema',
    h2_prod: 'MrBeast', h2_fact: 'His YouTube channel has 500 million subscribers in June 2026', h2_url: 'https://www.youtube.com/@MrBeast',
    h2_who: 'YouTube', h2_note: 'This subscribers figure shows his channel has a huge audience all around the world',
  };
  test('a full log passes; a fact with no number, a search link or a note with no statistic word goes red', () => {
    expect(allCorrect(markHunt('find', good))).toBe(true);
    expect(markHunt('find', { ...good, h1_fact: 'It took loads of money at the cinema last year' }).h1_fact).toBe(false);
    expect(markHunt('find', { ...good, h2_url: 'https://www.google.com/search?q=mrbeast' }).h2_url).toBe(false);
    expect(markHunt('find', { ...good, h1_note: 'This shows that lots and lots of people really liked it' }).h1_note).toBe(false);
    expect(markHunt('find', { ...good, h2_url: good.h1_url }).h2_url).toBe(false);
  });
  test('everything in the hunt is soft (never a cooldown), because no fact has a fixed answer', () => {
    const soft = softIds(TASKS.find(t => t.key === 'find'));
    expect(Object.keys(markHunt('find', {})).every(id => soft.has(id))).toBe(true);
  });
});

describe('5 · test the survey (pilot)', () => {
  const pl = PILOTS.jay, slips = pl.lines.filter(l => l.slip), line = id => pl.lines.find(l => l.id === id);
  const good = {
    j_best: 'How much do you like Fortnite, from 1 (not at all) to 5 (a lot)?',
    j_two: 'How often do you play Fortnite? Who do you usually play with?',
    j_who: '20 students aged 12 to 16: some who play every day and some who don\'t play any more.',
  };
  test('four good lines and three slips; flags pass only when exactly the slips are flagged', () => {
    expect(slips.map(l => l.id).sort()).toEqual(Object.keys(good).sort());
    const flags = Object.fromEntries(slips.map(l => [l.id, 'flag']));
    expect(allCorrect(markPilotFlags('jay', flags))).toBe(true);
    expect(allCorrect(markPilotFlags('jay', { ...flags, j_rank: 'flag' }))).toBe(false);
    expect(allCorrect(markPilotFlags('jay', { ...flags, j_two: undefined }))).toBe(false);
  });
  test('Jay\'s own lines fail; good rewrites pass and run again', () => {
    for (const l of slips) {
      expect(pilotProblem(l, l.text), l.id).not.toBe('');
      expect(pilotProblem(l, good[l.id]), l.id).toBe('');
      expect(pilotAgain(l, good[l.id]).length, l.id).toBeGreaterThan(0);
    }
    const flags = Object.fromEntries(slips.map(l => [l.id, 'flag']));
    const re = Object.fromEntries(slips.map(l => [l.id + '_re', good[l.id]]));
    expect(allCorrect(markPilot('jay', { ...flags, ...re }))).toBe(true);
    expect(markPilot('jay', flags).j_best_re).toBe(false);   // untouched box = Jay's line
  });
  test('half-fixes are caught with a reason', () => {
    const p = (id, t) => pilotProblem(line(id), t);
    expect(p('j_best', 'Do you agree Fortnite is a good game?')).toMatch(/agree/);
    expect(p('j_best', 'Is Fortnite the best game you have played?')).toMatch(/Best/);
    expect(p('j_two', 'How often do you play and who with, and where?')).toMatch(/two questions/);
    expect(p('j_two', 'How often do you play with who? Do you like it?')).toMatch(/who/i);
    expect(p('j_who', 'My three best mates and some other people')).toMatch(/how many/);
    expect(p('j_who', '20 of my best friends aged 15, some who play a lot')).toMatch(/friends/);
    expect(p('j_who', '20 students aged 12 to 16 who all play Fortnite every day')).toMatch(/different/);
  });
  test('a rating-scale rewrite of question 2 runs again as a chart; an open one as quotes', () => {
    expect(pilotAgain(line('j_best'), good.j_best)[0].bars).toBeDefined();
    expect(pilotAgain(line('j_best'), 'What do you think of Fortnite?')[0].quotes).toBeDefined();
  });
});

describe('writing: 6 · interview a partner, and the two challenges', () => {
  test('full answers using the word banks pass; a missing word or a copied question goes red', () => {
    const ans = {
      t_prod: 'Stranger Things', t_use: 'Where do you usually watch Stranger Things?', t_feel: 'How does Stranger Things make you feel when you watch it?',
      t_rate: 'On a scale of 1 to 5, how scary is it?', t_more: 'Why do you say that about it?',
      t_said: 'In the interview, my partner said they watch it with their sister and it makes them jump',
      t_shows: 'This suggests that the audience enjoys watching scary shows with family at home',
      t_next: 'I would use a survey because I can count the answers. My sample would be thirty students from Years 9 and 10',
    };
    expect(allCorrect(markWriting('talk', ans))).toBe(true);
    expect(markWriting('talk', { ...ans, t_rate: 'How much do you like the show a lot?' }).t_rate).toBe(false);
    expect(markWriting('talk', { ...ans, t_feel: ans.t_use }).t_feel).toBe(false);
    expect(markWriting('talk', { ...ans, t_next: 'I would use a survey because I can count all of the answers quickly and easily' }).t_next).toBe(false);
  });
  test('every writing box has a prompt; long ones have a starter', () => {
    for (const w of Object.values(WRITING).flat()) {
      expect(w.prompt, w.id).toBeTruthy();
      if (!w.short) expect(w.starter, w.id).toBeTruthy();
    }
  });
});

describe('glossary', () => {
  test('meanings are short; spec terms are defined; patterns use no capturing groups', () => {
    for (const [p, m] of GLOSSARY) {
      expect(m.length, p).toBeLessThanOrEqual(80);
      expect(p, p).not.toMatch(/\((?!\?:)/);
    }
    for (const w of ['box office', 'circulation', 'hits', 'subscriptions', 'followers', 'focus group', 'survey', 'rating scale', 'open-ended', 'follow-up', 'sample'])
      expect(glossaryDef(w), w).toBeTruthy();
  });
});

describe('scoring', () => {
  test('optional tabs never change the score', () => {
    const core = TASKS.map(t => !t.level);
    expect(calcScore(core, core)).toBe(100);
    expect(calcScore(TASKS.map(() => false), TASKS.map(() => true))).toBe(0);
  });
});
