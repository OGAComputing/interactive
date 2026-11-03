import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TASKS, TASK_COUNT, SORTS, CHOICES, WRITING, PHOTOS, markSort, markChoices, markWriting, allCorrect } from './checkers.js';

const html = readFileSync(new URL('./1_Reading_an_Image.html', import.meta.url), 'utf8');

describe('Jaws: denotation or connotation', () => {
  const items = SORTS.jaws.items;
  const key = Object.fromEntries(items.map(it => [it.id, it.bin]));

  test('four of each, ids unique', () => {
    expect(items.filter(it => it.bin === 'den')).toHaveLength(4);
    expect(items.filter(it => it.bin === 'con')).toHaveLength(4);
    expect(new Set(items.map(it => it.id)).size).toBe(items.length);
  });

  test('no statement repeats the worked model on the page', () => {
    for (const it of items) expect(html).not.toContain(`>${it.label}<`);
  });

  test('a perfect sort passes; swapping two fails both', () => {
    expect(allCorrect(markSort('jaws', key))).toBe(true);
    const res = markSort('jaws', { ...key, d_title: 'con', c_red: 'den' });
    expect(res.d_title).toBe(false);
    expect(res.c_red).toBe(false);
    expect(Object.values(res).filter(Boolean)).toHaveLength(6);
  });
});

describe('anchorage and polysemy questions', () => {
  const qs = Object.values(CHOICES.anchor);

  test('every answer is one of its options and right answers pass', () => {
    for (const c of qs) expect(c.opts.map(o => o[0])).toContain(c.a);
    const right = Object.fromEntries(Object.entries(CHOICES.anchor).map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('anchor', right))).toBe(true);
    expect(markChoices('anchor', { ...right, pink: 'bg' }).pink).toBe(false);
  });

  test('the right answer is not the longest option in half or more of the questions', () => {
    const longest = qs.filter(c => {
      const len = k => c.opts.find(o => o[0] === k)[1].length;
      return c.opts.every(([k]) => k === c.a || len(c.a) >= len(k));
    });
    expect(longest.length).toBeLessThan(qs.length / 2);
  });
});

describe('writing', () => {
  test('a real Spider-Verse analysis passes', () => {
    expect(allCorrect(markWriting('spider', {
      sv_den: 'I can see Miles hanging upside down and lots of other Spider-People',
      sv_con: 'The claw marks on his suit suggest he is in danger because something has attacked him',
      sv_anc: 'The words Across the Spider-Verse tell us he travels between worlds full of Spider-People',
      sv_enc: 'The designers chose to hang Miles upside down to encode that his whole world is turned over',
    }))).toBe(true);
  });

  const caps = {
    cap_poly: 'My photo could mean he is late for the bus or it could mean he is being chased',
    cap1: 'Late for the last bus', mean1: 'Caption 1 anchors the photo to mean he is rushing home late at night',
    cap2: 'Running for his life', mean2: 'Caption 2 anchors it to mean he is scared and something is chasing him',
  };

  test('two different captions with explanations pass', () => {
    expect(allCorrect(markWriting('caption', caps))).toBe(true);
  });

  test('the same caption twice fails, even with different spacing or capitals', () => {
    expect(markWriting('caption', { ...caps, cap2: 'late for the LAST bus!' }).cap2).toBe(false);
    expect(markWriting('caption', { ...caps, mean2: caps.mean1 }).mean2).toBe(false);
  });
});

describe('warm-up and challenge', () => {
  test('the warm-up has two examples (no meaning cards) for each of the five words', () => {
    for (const [bin] of SORTS.words.bins) expect(SORTS.words.items.filter(it => it.bin === bin)).toHaveLength(2);
    expect(SORTS.words.items.every(it => /_ex2?$/.test(it.id))).toBe(true);
    const key = Object.fromEntries(SORTS.words.items.map(it => [it.id, it.bin]));
    expect(allCorrect(markSort('words', key))).toBe(true);
  });

  test('the challenge needs real, extended writing', () => {
    const good = {
      rt_genre: 'Comedy', rt_tag: 'He just wants a hug',
      rt_how: 'The denotation stays the same: a swimmer and a shark. But my tagline anchors a funny reading, so the open mouth now connotes a smile instead of danger and the audience laughs',
      rt_two: 'One reading is that Miles is a hero because he is the biggest figure. Another reading is that he is trapped because he hangs upside down and the claw marks suggest an attack. I think the producers wanted the second because the crowd of Spider-People looks like it is hunting him',
    };
    expect(allCorrect(markWriting('retag', good))).toBe(true);
    expect(markWriting('retag', { ...good, rt_how: 'It makes it funny now' }).rt_how).toBe(false);
  });
});

describe('page wiring', () => {
  test('tasks line up with the data', () => {
    expect(TASK_COUNT).toBe(6);
    expect(TASKS.filter(t => !t.level)).toHaveLength(4);
    for (const t of TASKS) expect({ sort: SORTS, choice: CHOICES, write: WRITING }[t.kind][t.key], t.key).toBeTruthy();
  });

  test('every image the page uses is inlined', () => {
    const keys = [...html.matchAll(/<img data-img="([^"]+)"/g)].map(m => m[1]).concat(PHOTOS.map(p => p[0]));
    expect(keys.length).toBeGreaterThan(5);
    for (const k of keys) expect(html, k).toContain(`'${k}': 'data:image/jpeg;base64,`);
  });
});
