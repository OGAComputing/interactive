import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, ORDERS, markSort, markChoices, markWriting, markOrder, orderAnswer, orderStart,
  orderBlocker, orderDataProblems, allCorrect, calcScore, seededRandom, GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Telling_Stories.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) > optLen(opts, k));
const idx = key => TASKS.findIndex(t => t.key === key);
const answerOf = key => Object.fromEntries(ORDERS[key].lists.map(l => [l.id, orderAnswer(l)]));

// Product images still to be supplied (the page shows each task without its picture until it's inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Telling Stories');
    expect(html).toContain("const ACTIVITY_TITLE = 'Telling Stories';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_l4_3_telling_stories';");
    expect(html).toMatch(/class="tab support active" data-idx="4"/);
    expect(html).toMatch(/class="panel active" id="panel-4"/);
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

  test('every image the page uses is inlined, or still on the pending list', () => {
    const keys = new Set([...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1])
      .concat(Object.values(CHOICES.struct).map(c => c.img))
      .concat(Object.values(ORDERS).flatMap(o => o.lists.map(l => l.img))));
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    expect(html.length).toBeLessThan(1_000_000);
  });
});

describe('parts', () => {
  test('Part 2 opens with its word (any case), the teacher word opens it, and both parts have a challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('HeadLine')).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('pyramid')).toBe(0);
    for (const p of [1, 2]) expect(TASKS.some((t, i) => partOf(i) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
    // The inverted pyramid is taught in Part 2.
    for (const k of ['news', 'words', 'pyramid']) expect(partOf(idx(k)), k).toBe(2);
    for (const k of ['story', 'struct', 'warm', 'nonlin']) expect(partOf(idx(k)), k).toBe(1);
  });
});

describe('warm-up sort', () => {
  const s = SORTS.warm, right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
  test('two made-up examples per box; right answers pass, a wrong card fails', () => {
    for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(allCorrect(markSort('warm', right))).toBe(true);
    expect(markSort('warm', { ...right, w_crash: 'lin' }).w_crash).toBe(false);
  });
  test('the cards never name the answer', () => {
    for (const it of s.items) expect(it.label).not.toMatch(/linear|circular|circle|order|in time/i);
  });
});

describe('Task 1: Wicked in story order (order)', () => {
  const l = ORDERS.story.lists[0];
  test('the data is sound, seven scenes, and only one right order', () => {
    expect(orderDataProblems(ORDERS.story)).toEqual([]);
    expect(l.items).toHaveLength(7);
    expect(l.items.every(it => typeof it.at === 'number')).toBe(true);
  });
  test('once done, the film plot order shows beside it: the same seven cards, with only the party moved', async () => {
    const { orderMoved } = await import('./checkers.js');
    expect(l.shown.order).toEqual(['s_party', ...orderAnswer(l).slice(0, -1)]);
    expect(orderMoved(l.shown.order, orderAnswer(l))).toEqual(['s_party']);
  });
  test('the opening party goes last in the story; the right order passes and the plot order fails', () => {
    expect(orderAnswer(l).at(-1)).toBe('s_party');
    expect(allCorrect(markOrder('story', answerOf('story')))).toBe(true);
    const plot = ['s_party', ...orderAnswer(l).slice(0, -1)];   // the order the film shows them
    expect(allCorrect(markOrder('story', { wicked: plot }))).toBe(false);
  });
  test('every student starts in a shuffle with fewer than half in place, and Check waits for a move', () => {
    for (const seed of ['a1', 'b2', 'c3', 'd4', 'e5', 'f6']) {
      const res = markOrder('story', { wicked: orderStart(l, seededRandom(seed + '|wicked')) });
      expect(Object.values(res).filter(Boolean).length * 2).toBeLessThan(7);
    }
    expect(orderBlocker(ORDERS.story, {})).not.toBe('');
    expect(orderBlocker(ORDERS.story, { wicked_moved: 1 })).toBe('');
  });
});

describe('Task 2: name the structure (choice)', () => {
  const qs = Object.entries(CHOICES.struct);
  test('seven products, each with a picture; one question per structure word except non-linear (Task 1)', () => {
    expect(qs).toHaveLength(7);
    for (const [, c] of qs) expect(c.img && c.credit && c.alt).toBeTruthy();
    expect(new Set(qs.map(([, c]) => c.a))).toEqual(new Set(['lin', 'circ', 'int', 'open', 'closed', 'single', 'multi']));
  });
  test('every answer is an option, never the longest; right answers pass and a wrong one fails', () => {
    for (const [id, c] of qs) {
      expect(c.opts.map(o => o[0]), id).toContain(c.a);
      expect(c.opts, id).toHaveLength(4);
      expect(rightIsLongest(c.opts, c.a), id).toBe(false);
    }
    const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('struct', right))).toBe(true);
    expect(markChoices('struct', { ...right, lion: 'lin' }).lion).toBe(false);
  });
  test('no question names its own answer', () => {
    const word = { lin: /\blinear/i, circ: /circular/i, int: /interactive/i, open: /\bopen\b/i, closed: /closed/i, single: /single/i, multi: /multi/i };
    for (const [id, c] of qs) expect(c.q, id).not.toMatch(word[c.a]);
  });
});

describe('Task 3: the Moon landing as an inverted pyramid (order)', () => {
  const l = ORDERS.news.lists[0];
  test('the data is sound; the top is the news; details and background may swap within their group', () => {
    expect(orderDataProblems(ORDERS.news)).toEqual([]);
    expect(orderAnswer(l)[0]).toBe('n_lead');
    expect(allCorrect(markOrder('news', answerOf('news')))).toBe(true);
    const swapped = ['n_lead', 'n_walk', 'n_step', 'n_home', 'n_jfk', 'n_collins'];
    expect(allCorrect(markOrder('news', { moon: swapped }))).toBe(true);
  });
  test('background above a detail, or the lead lower down, is wrong', () => {
    const res = markOrder('news', { moon: ['n_lead', 'n_jfk', 'n_step', 'n_walk', 'n_collins', 'n_home'] });
    expect(res.n_jfk).toBe(false);
    expect(res.n_walk).toBe(false);
    expect(markOrder('news', { moon: ['n_step', 'n_lead', 'n_walk', 'n_collins', 'n_jfk', 'n_home'] }).n_lead).toBe(false);
  });
});

describe('writing', () => {
  test('Task 4 needs the spec words: story and plot, a structure, and inverted pyramid', () => {
    const good = {
      u_story: 'In Wicked, the story starts with Elphaba being born, but the plot starts with the party at the end.',
      u_struct: 'The Lion King is circular because it begins and ends with a cub held up at Pride Rock.',
      u_pyr: 'Armstrong and Aldrin go at the top because an inverted pyramid puts the most important news first for readers.',
    };
    expect(allCorrect(markWriting('words', good))).toBe(true);
    expect(markWriting('words', { ...good, u_pyr: 'Armstrong and Aldrin go at the top because they are the most important news of all.' }).u_pyr).toBe(false);
    expect(markWriting('words', { ...good, u_story: 'In Wicked, the film starts with a party but Elphaba is born after that.' }).u_story).toBe(false);
  });
  test('every writing box has a prompt; the non-short ones a minimum length', () => {
    for (const list of Object.values(WRITING)) for (const w of list) {
      expect(w.prompt).toBeTruthy();
      if (!w.short) expect(w.minWords).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('scoring', () => {
  test('optional tabs never count; all core tasks first time is 100, with retries 80', () => {
    const done = TASKS.map(t => !t.level), first = TASKS.map(() => true);
    expect(calcScore(done, first)).toBe(100);
    expect(calcScore(done, TASKS.map(() => false))).toBe(80);
    expect(calcScore(TASKS.map(t => !!t.level), first)).toBe(0);
  });
});

describe('glossary', () => {
  test('every structure word and the ISYS facts are defined, each under 80 characters', () => {
    for (const w of ['plot', 'linear', 'non-linear', 'circular', 'interactive', 'open ending', 'closed ending', 'single-strand', 'multi-strand', 'inverted pyramid'])
      expect(glossaryDef(w), w).toBeTruthy();
    expect(glossaryDef('non-linear')).toMatch(/jumps about/i);
    expect(glossaryDef('plot')).toMatch(/^The order we're shown/);
    expect(glossaryDef('inverted pyramid')).toMatch(/^Most important first/);
    for (const [p, m] of GLOSSARY) expect(m.length, p).toBeLessThanOrEqual(80);
  });
});
