import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, SPOTS, REVEALS, NEEDS, markSort, markChoices, markWriting, markReveal,
  markSpot, markSpotFlags, allCorrect, calcScore, GLOSSARY, glossaryDef, UNLOCK, unlockedBy, partOf,
} from './checkers.js';

const html = readFileSync(new URL('./1_Why_We_Watch.html', import.meta.url), 'utf8');
const optLen = (opts, k) => opts.find(o => o[0] === k)[1].length;
const rightIsLongest = (opts, a) => opts.every(([k]) => k === a || optLen(opts, a) >= optLen(opts, k));
const needKeys = NEEDS.map(n => n[0]);

// Product images still to be supplied by the teacher (the page hides their frames until they're inlined).
// Remove each key from here once it is inlined with Y10/inline_images.py.
const PENDING_IMAGES = new Set([]);

describe('page identity and tabs', () => {
  test('title matches ACTIVITY_TITLE, the page opens on the warm-up, and every task has a tab and panel', () => {
    expect(html).toContain('title:  Why We Watch');
    expect(html).toContain("const ACTIVITY_TITLE = 'Why We Watch';");
    expect(html).toContain("const STORAGE_KEY    = 'y10_c1_l3_2_gratifications';");
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

  test('Task 2 links to the 3.1 media diary, which exists', () => {
    expect(html).toContain('href="../L3.1_Where_When_Who_With/1_Where_When_Who_With.html#diary" target="_blank"');
    expect(readFileSync(new URL('../L3.1_Where_When_Who_With/checkers.js', import.meta.url), 'utf8')).toContain("key: 'diary'");
  });

  test('every image the page uses is inlined, or still on the pending list', () => {
    const keys = new Set([...html.matchAll(/data-img="([^"]+)"/g)].map(m => m[1])
      .concat(Object.values(CHOICES.same).filter(c => c.img).map(c => c.img))
      .concat(REVEALS.why.rounds.map(r => r.img)));
    expect(keys.has('example') && keys.has('pe3thumb') && keys.has('padthumb'), 'the before-and-after and both starting pictures').toBe(true);
    for (const k of keys) {
      if (PENDING_IMAGES.has(k)) continue;
      expect(html, k).toMatch(new RegExp(`['"]${k}['"]:\\s*['"]data:image/(jpeg|png);base64,`));
    }
    for (const k of PENDING_IMAGES) expect(keys.has(k), `${k} is pending but not used`).toBe(true);
    expect(html.length).toBeLessThan(1_000_000);
  });
});

describe('parts', () => {
  test('each part opens with its word (any case), the teacher word opens everything, and every part has a challenge', () => {
    expect(unlockedBy(UNLOCK[2])).toBe(2);
    expect(unlockedBy('GRATIFY')).toBe(2);
    expect(unlockedBy(UNLOCK[3])).toBe(3);
    expect(unlockedBy('outwood')).toBe(3);
    expect(unlockedBy('escapism')).toBe(0);
    const inPart = p => TASKS.map((t, i) => i).filter(i => partOf(i) === p);
    for (const p of [1, 2, 3]) expect(inPart(p).some(i => TASKS[i].level === 'challenge'), `part ${p}`).toBe(true);
    // "One product, many needs" is taught in Part 2, and the Photoshop demo in Part 3.
    for (const k of ['same', 'two']) expect(partOf(TASKS.findIndex(t => t.key === k))).toBe(2);
    for (const k of ['thumbs', 'third']) expect(partOf(TASKS.findIndex(t => t.key === k))).toBe(3);
  });
});

describe('warm-up sort', () => {
  const s = SORTS.warm, right = Object.fromEntries(s.items.map(it => [it.id, it.bin]));
  test('two example cards per need; right answers pass, a wrong card fails', () => {
    for (const [bin] of s.bins) expect(s.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(allCorrect(markSort('warm', right))).toBe(true);
    expect(markSort('warm', { ...right, w_ac: 'ent' }).w_ac).toBe(false);
  });
  test('the cards are examples, not definitions', () => {
    for (const it of s.items) expect(it.label).not.toMatch(/^(a need|finding out facts|getting away from your)/i);
  });
});

describe('Task 1: why are they watching?', () => {
  const g = REVEALS.why;
  test('four rounds, four different needs, three clues each, each with a picture and source', () => {
    expect(g.rounds).toHaveLength(4);
    expect(new Set(g.rounds.map(r => r.a)).size).toBe(4);
    for (const r of g.rounds) {
      expect(r.clues.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.who && r.img && r.credit && r.note, r.id).toBeTruthy();
    }
  });
  test('right answers pass and a wrong one fails', () => {
    const right = Object.fromEntries(g.rounds.map(r => [r.id, r.a]));
    expect(allCorrect(markReveal('why', right))).toBe(true);
    expect(markReveal('why', { ...right, r_ac: 'ent' }).r_ac).toBe(false);
  });
});

describe('Task 3: same product, different needs', () => {
  const qs = Object.entries(CHOICES.same);
  test('every answer is an option; right answers pass and a wrong one fails', () => {
    for (const [, c] of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    const right = Object.fromEntries(qs.map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('same', right))).toBe(true);
    expect(markChoices('same', { ...right, c_dev: 'info' }).c_dev).toBe(false);
  });
  test('the need questions cover all five needs and each has a picture and source', () => {
    const needQs = qs.filter(([, c]) => c.opts === NEEDS);
    expect(new Set(needQs.map(([, c]) => c.a))).toEqual(new Set(needKeys));
    for (const [id, c] of needQs) expect(c.img && c.alt && c.credit, id).toBeTruthy();
  });
  test('the right answer is the longest option in under half the questions', () => {
    expect(qs.filter(([, c]) => rightIsLongest(c.opts, c.a)).length).toBeLessThan(qs.length / 2);
  });
});

describe('writing', () => {
  const diary = {
    d1_prod: 'Wordle', d1_need: 'It met my need for social interaction because I posted my score in the family group chat.',
    d2_prod: 'Spotify', d2_need: 'It met my need for escapism because the music took my mind off the bus ride and school.',
    d_most: 'The need I met most was escapism, because I use media to relax after a long day at school.',
  };
  test('a full diary passes; the same product twice, or no need named, fails', () => {
    expect(allCorrect(markWriting('diary', diary))).toBe(true);
    expect(markWriting('diary', { ...diary, d2_prod: 'Wordle' }).d2_prod).toBe(false);
    expect(markWriting('diary', { ...diary, d1_need: 'I liked it a lot because I posted my score in the family group chat.' }).d1_need).toBe(false);
  });
  test('★ one product, two needs: the second need must differ from the first', () => {
    const two = {
      t_prod: 'Planet Earth III',
      t_me: 'For me, Planet Earth III meets a need for information because I learn how animals survive.',
      t_them: 'For my dad, it meets a need for escapism because after work he feels far away from home.',
      t_prodr: 'The producer has filmed huge slow shots of wild places, which meets a need for escapism because you feel far away.',
    };
    expect(allCorrect(markWriting('two', two))).toBe(true);
    expect(markWriting('two', { ...two, t_them: two.t_me }).t_them).toBe(false);
  });
  test('Task 4 thumbnails: each "how" box names an adjustment layer, the title and the cut-out', () => {
    const th = {
      th1_need: 'My first thumbnail promises escapism to people who want to forget school and feel far away.',
      th1_how: 'I used a gradient map to make the colours purple and dreamy. My title says Lose yourself. The cut-out of a whale shows calm.',
      th2_need: 'My second thumbnail promises entertainment to people who want a laugh and something exciting.',
      th2_how: 'I used vibrance and contrast to make the colours bright. My title says Wildest jumps ever! The cut-out of a shocked face is funny.',
      th_click: 'I would click the second one because I use products like this for entertainment after school.',
    };
    expect(allCorrect(markWriting('thumbs', th))).toBe(true);
    expect(markWriting('thumbs', { ...th, th2_need: th.th1_need }).th2_need).toBe(false);
    const noCut = 'I used vibrance and contrast to make the colours bright and loud. My title says Wildest jumps ever in big letters.';
    expect(markWriting('thumbs', { ...th, th2_how: noCut }).th2_how).toBe(false);
  });
  test('every writing box has a prompt', () => {
    for (const ws of Object.values(WRITING)) for (const w of ws) expect(w.prompt, w.id).toBeTruthy();
  });
});

describe('★ spot the slip', () => {
  const s = SPOTS.slip, slips = s.parts.filter(p => p.fix);
  test('three slips; flagging them all passes, flagging a right line fails', () => {
    expect(slips).toHaveLength(3);
    const flags = Object.fromEntries(slips.map(p => [p.id, true]));
    expect(allCorrect(markSpotFlags('slip', flags))).toBe(true);
    expect(markSpotFlags('slip', { ...flags, p1: true }).p1).toBe(false);
    const fixes = Object.fromEntries(slips.map(p => [p.id + '_fix', p.fix.a]));
    expect(allCorrect(markSpot('slip', { ...flags, ...fixes }))).toBe(true);
  });
  test('each fix\'s right option is not the longest every time', () => {
    expect(slips.filter(p => rightIsLongest(p.fix.opts, p.fix.a)).length).toBeLessThan(slips.length);
  });
});

describe('glossary and scoring', () => {
  test('every meaning is short, and the spec terms are covered', () => {
    for (const [, m] of GLOSSARY) expect(m.length).toBeLessThanOrEqual(80);
    for (const w of ['uses and gratifications', 'information', 'entertainment', 'escapism', 'personal identity', 'social interaction'])
      expect(glossaryDef(w), w).toBeTruthy();
  });
  test('optional tabs never change the score', () => {
    const done = TASKS.map(t => !t.level), first = TASKS.map(() => true);
    expect(calcScore(done, first)).toBe(100);
    expect(calcScore(TASKS.map(() => true), first)).toBe(100);
  });
});
