import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, CHOICES, SORTS, WRITING, SNAPPER_EVIDENCE, ISYS, UNLOCK, unlockedBy, partOf,
  markChoices, markSort, markWriting, allCorrect, calcScore, sortBlocker, GLOSSARY, glossaryDef, coreDone,
} from './checkers_readings.js';

const html = readFileSync(new URL('./2_Same_Text_Different_Readings.html', import.meta.url), 'utf8');
const qs = Object.entries(CHOICES.panic);
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));
const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
const answerText = c => c.opts.find(o => o[0] === c.a)[1].replace(/^(The|An?) /, '');
const placed = key => Object.fromEntries(SORTS[key].items.map(it => [it.id, it.bin]));

// Product images still to be supplied (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the Warm-up, every task has a tab and panel', () => {
    expect(html).toContain('title:  Same Text, Different Readings');
    expect(html).toContain("const ACTIVITY_TITLE = 'Same Text, Different Readings';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_c1_l3_3_readings';");
    expect(html).toContain("from './checkers_readings.js'");
    const warm = TASKS.findIndex(t => t.level === 'support');
    expect(html).toMatch(new RegExp(`class="tab support active" data-idx="${warm}"`));
    expect(html).toMatch(new RegExp(`class="panel active" id="panel-${warm}"`));
    for (let i = 0; i < TASK_COUNT; i++) {
      expect(html, `tab ${i}`).toContain(`data-idx="${i}"`);
      expect(html, `panel ${i}`).toContain(`id="panel-${i}"`);
    }
    expect(html).not.toMatch(/FILL IN|TODO/);
  });

  test('core kinds vary (no two in a row the same, one core sort)', () => {
    const core = TASKS.filter(t => !t.level).map(t => t.kind);
    for (let i = 1; i < core.length; i++) expect(core[i], `core ${i}`).not.toBe(core[i - 1]);
    expect(core.filter(k => k === 'sort')).toHaveLength(1);
  });

  test('two parts: Part 2 opens with its word, and each part ends with a ★ challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('outwood')).toBe(2);
    expect(unlockedBy('wrong')).toBe(0);
    for (const p of [1, 2]) expect(TASKS.some((t, i) => partOf(i) === p && t.level === 'challenge'), `part ${p}`).toBe(true);
  });

  test('every image the page uses is inlined, or still on the pending list', () => {
    const keys = new Set([...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1]));
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    expect(html.length).toBeLessThan(1_000_000);
  });

  test('the Snapper evidence on the page matches SNAPPER_EVIDENCE (HTML apostrophes as typed)', () => {
    for (const e of SNAPPER_EVIDENCE) expect(html, e.slice(0, 30)).toContain(e);
  });

  test('ISYS terms are on the page and their facts are in the glossary meanings, word for word', () => {
    for (const [term, fact] of ISYS) {
      expect(html, term).toContain(`<b>${term}</b>`);
      expect(glossaryDef(term)?.toLowerCase(), term).toContain(fact.toLowerCase());
      expect(fact.split(' ').length, term).toBeLessThanOrEqual(4);
    }
  });
});

describe('Task 1: War of the Worlds and a passive audience', () => {
  test('four options each, the answer among them; right answers pass and a wrong one fails', () => {
    expect(qs).toHaveLength(5);
    for (const [id, c] of qs) {
      expect(c.opts, id).toHaveLength(4);
      expect(c.opts.map(o => o[0]), id).toContain(c.a);
    }
    expect(allCorrect(markChoices('panic', right))).toBe(true);
    expect(markChoices('panic', { ...right, n_found: 'right' }).n_found).toBe(false);
  });
  test('no question contains its own answer', () => {
    for (const [id, c] of qs) expect(c.q.toLowerCase(), id).not.toContain(answerText(c).toLowerCase());
  });
  test('spec terms only: no "hypodermic needle" anywhere (it is in the Teacher Guide, not the spec)', () => {
    expect(html.toLowerCase()).not.toContain('hypodermic');
  });
  test('the right answer is the longest option in under half the questions', () => {
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a)).length).toBeLessThan(qs.length / 2);
  });
});

describe('sorts', () => {
  test('Warm-up: three per box, all right passes, one swapped fails', () => {
    const p = placed('warm');
    expect(SORTS.warm.items.filter(it => it.bin === 'pas')).toHaveLength(3);
    expect(allCorrect(markSort('warm', p))).toBe(true);
    expect(markSort('warm', { ...p, w_check: 'pas' }).w_check).toBe(false);
  });
  test('Task 2: three comments per reading; all right passes; everything in one box is refused', () => {
    const p = placed('reads');
    for (const [b] of SORTS.reads.bins) expect(SORTS.reads.items.filter(it => it.bin === b), b).toHaveLength(3);
    expect(allCorrect(markSort('reads', p))).toBe(true);
    expect(markSort('reads', { ...p, r_artists: 'opp' }).r_artists).toBe(false);
    const allPref = Object.fromEntries(SORTS.reads.items.map(it => [it.id, 'pref']));
    expect(sortBlocker(SORTS.reads, allPref)).toBeTruthy();
  });
  test('no comment names its reading', () => {
    for (const it of SORTS.reads.items) expect(it.label.toLowerCase(), it.id).not.toMatch(/preferred|negotiated|oppositional/);
  });
});

describe('writing', () => {
  const good = {
    s_pref: 'The preferred reading is that Christmas traditions can change, and John Lewis is the place to shop for a new kind of family Christmas.',
    s_neg: 'A negotiated reading would be a viewer who laughs at Snapper but thinks the advert is too strange to make them shop at John Lewis.',
    s_opp: 'An oppositional reading would be a viewer who says the advert is just a shop trying to sell expensive presents to families at Christmas.',
    s_passive: 'A passive audience would all take in the same message, but Snapper got different readings, so its viewers were not passive at all.',
  };
  test('a full answer passes; each box needs its own term', () => {
    expect(allCorrect(markWriting('snapper', good))).toBe(true);
    expect(markWriting('snapper', { ...good, s_neg: 'A viewer might laugh at Snapper but think the advert is far too strange to make them want to shop there.' }).s_neg).toBe(false);
    expect(markWriting('snapper', { ...good, s_passive: 'This old idea says every viewer takes in the same message, but Snapper got different readings from different viewers.' }).s_passive).toBe(false);
  });
  test('the same text in two boxes fails the second', () => {
    expect(markWriting('snapper', { ...good, s_opp: good.s_neg }).s_opp).toBe(false);
  });
  test('★ challenges pass with real answers', () => {
    expect(allCorrect(markWriting('papers', {
      p_why: 'Newspapers might have exaggerated the panic because radio was taking their advertisers, so they wanted people to think radio was dangerous.',
      p_now: 'Some people say violent games make players violent. This treats players as passive, but most players do not copy what they play.',
    }))).toBe(true);
    expect(allCorrect(markWriting('mine', {
      m_ad: 'Marks & Spencer',
      m_pref: 'The preferred reading is that you can have a brilliant Christmas without spending lots of money at M&S.',
      m_opp: 'An oppositional reading would be that cheap food is not special, for someone who thinks Christmas should be a treat.',
    }))).toBe(true);
  });
});

describe('scoring and glossary', () => {
  test('house scoring: all core done first time is 100; optional tabs never change it', () => {
    const done = TASKS.map(t => !t.level), first = TASKS.map(() => true);
    expect(calcScore(done, first, {})).toBe(100);
    expect(calcScore(TASKS.map(() => true), first, {})).toBe(100);
    expect(calcScore(done, TASKS.map(() => false), {})).toBe(80);
    expect(coreDone(done)).toBe(true);
  });
  test('meanings are short; the spec terms and tricky words have one', () => {
    for (const [, m] of GLOSSARY) expect(m.length).toBeLessThanOrEqual(80);
    for (const w of ['passive audience', 'preferred reading', 'negotiated reading', 'oppositional reading',
      'passive', 'Martians', 'generative AI', 'Venus flytrap', 'exaggerated']) expect(glossaryDef(w), w).toBeTruthy();
  });
});
