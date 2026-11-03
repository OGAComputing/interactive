import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  TASKS, TASK_COUNT, BINS, PRODUCTS, SORTS, CHOICES, WRITING, markSort, markChoices, markWriting, allCorrect,
  isRealSentence, isRealName, cooldownSeconds, calcScore, coreDone, coreGold, seededRandom, shuffled, SNAP,
} from './checkers.js';

const html = readFileSync(new URL('./1_Media_Everywhere.html', import.meta.url), 'utf8');
const key = Object.fromEntries(PRODUCTS.map(p => [p.id, p.bin]));

describe('the Media Board', () => {
  test('21 products, every one in a real bin, ids unique', () => {
    expect(PRODUCTS).toHaveLength(21);
    expect(new Set(PRODUCTS.map(p => p.id)).size).toBe(21);
    const bins = BINS.map(b => b[0]);
    PRODUCTS.forEach(p => expect(bins).toContain(p.bin));
  });

  test('every sector and era has at least three products', () => {
    for (const [bin] of BINS) expect(PRODUCTS.filter(p => p.bin === bin).length).toBeGreaterThanOrEqual(3);
  });

  test('the year shown after checking matches the era', () => {
    for (const p of PRODUCTS) {
      const year = +p.note.match(/\d{4}/)[0];
      expect(p.bin.endsWith('-pre') ? year < 2000 : year >= 2000, `${p.id} ${p.note}`).toBe(true);
    }
  });

  test('every product has an image inlined in the page and a source', () => {
    for (const p of PRODUCTS) {
      expect(html, p.img).toContain(`'${p.img}': 'data:image/jpeg;base64,`);
      expect(p.credit).toBeTruthy();
    }
  });

  test('a perfect board passes; one card in the wrong era fails just that card', () => {
    expect(allCorrect(markSort('board', key))).toBe(true);
    const res = markSort('board', { ...key, pacman: 'int-post' });
    expect(allCorrect(res)).toBe(false);
    expect(Object.entries(res).filter(([, ok]) => !ok).map(([id]) => id)).toEqual(['pacman']);
  });

  test('unsorted cards are wrong', () => {
    const res = markSort('board', {});
    expect(Object.values(res).every(ok => !ok)).toBe(true);
  });
});

describe('then and now questions', () => {
  const right = Object.fromEntries(Object.entries(CHOICES.then).map(([id, c]) => [id, c.a]));

  test('every answer is one of its options', () => {
    for (const c of Object.values(CHOICES.then)) expect(c.opts.map(o => o[0])).toContain(c.a);
  });

  test('right answers pass, a wrong one is flagged', () => {
    expect(allCorrect(markChoices('then', right))).toBe(true);
    expect(markChoices('then', { ...right, where94: 'yt' }).where94).toBe(false);
  });

  test('the right answer is not the longest option in half or more of the questions', () => {
    const qs = Object.values(CHOICES).flatMap(Object.values);
    const longest = qs.filter(c => {
      const len = k => c.opts.find(o => o[0] === k)[1].length;
      return c.opts.every(([k]) => k === c.a || len(c.a) >= len(k));
    });
    expect(longest.length).toBeLessThan(qs.length / 2);
  });
});

describe('writing', () => {
  test('real answers pass; mashed or too-short ones do not', () => {
    const good = {
      diff: 'The 1994 trailer is a hand-drawn cartoon, whereas the 2019 trailer looks like real lions filmed in Africa',
      why: 'I think they look different because computers can now make animals look real',
    };
    expect(allCorrect(markWriting('compare', good))).toBe(true);
    expect(markWriting('compare', { ...good, diff: 'lions lions lions lions lions lions lions lions lions lions' }).diff).toBe(false);
    expect(markWriting('compare', { ...good, why: 'cgi' }).why).toBe(false);
  });

  test('product names can be short and contain numbers', () => {
    expect(isRealName('EA FC 26')).toBe(true);
    expect(isRealName('Metro')).toBe(true);
    expect(isRealName('aaaa')).toBe(false);
    expect(isRealName('  ')).toBe(false);
    expect(allCorrect(markWriting('day', { day_ami: 'Stranger Things', day_print: 'Metro', day_int: 'Roblox', day_most: 'I use Roblox the most because my friends play it every night' }))).toBe(true);
  });

  test('isRealSentence rejects keyboard mash', () => {
    expect(isRealSentence('sdfg hjkl qwrt zxcv bnmp', 4)).toBe(false);
    expect(isRealSentence('The shark looks scary and big', 4)).toBe(true);
  });
});

describe('warm-up and challenges', () => {
  test('the warm-up uses six board products, sector only', () => {
    expect(SNAP).toHaveLength(6);
    for (const it of SNAP) expect(PRODUCTS.find(p => 'snap_' + p.id === it.id).bin.startsWith(it.bin)).toBe(true);
    expect(allCorrect(markSort('snap', Object.fromEntries(SNAP.map(it => [it.id, it.bin]))))).toBe(true);
  });

  test('tricky cases: every answer is an option, right answers pass', () => {
    const right = Object.fromEntries(Object.entries(CHOICES.tricky).map(([id, c]) => [id, c.a]));
    expect(allCorrect(markChoices('tricky', right))).toBe(true);
    expect(markChoices('tricky', { ...right, setin: 'set' }).setin).toBe(false);
  });

  test('optional tasks never change the score, gold or "all done"', () => {
    const core = [true, true, true, true];
    expect(calcScore([...core, false, false, false], [true, true, true, true, false, false, false])).toBe(100);
    expect(coreDone([...core, false, false, false])).toBe(true);
    expect(coreDone([true, true, true, false, true, true, true])).toBe(false);
    expect(coreGold([true, true, true, true, false, false, false])).toBe(true);
  });
});

describe('engine', () => {
  test('tasks line up with the data', () => {
    expect(TASK_COUNT).toBe(7);
    expect(TASKS.filter(t => !t.level)).toHaveLength(4);
    for (const t of TASKS) {
      const data = { sort: SORTS, choice: CHOICES, write: WRITING }[t.kind];
      expect(data[t.key], t.key).toBeTruthy();
    }
  });

  test('scoring: 80 for finishing, up to 20 more for first-time answers', () => {
    expect(calcScore([true, true, true, true], [true, true, true, true])).toBe(100);
    expect(calcScore([true, true, true, true], [false, true, true, true])).toBe(95);
    expect(calcScore([true, false, false, false], [true, true, true, true])).toBe(25);
    expect(calcScore([false, false, false, false], [true, true, true, true])).toBe(0);
  });

  test('cooldowns grow 10, 20, 30 s and stop there', () => {
    expect([1, 2, 3, 4].map(cooldownSeconds)).toEqual([10, 20, 30, 30]);
  });

  test('card order is the same for one student and different between students', () => {
    const ids = PRODUCTS.map(p => p.id);
    expect(shuffled(ids, seededRandom('abc|board'))).toEqual(shuffled(ids, seededRandom('abc|board')));
    expect(shuffled(ids, seededRandom('abc|board'))).not.toEqual(shuffled(ids, seededRandom('xyz|board')));
  });
});
