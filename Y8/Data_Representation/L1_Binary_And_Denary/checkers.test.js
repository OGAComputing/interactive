import { describe, it, expect } from 'vitest';
import {
  TASK_COUNT, HEADINGS4, HEADINGS8, toBinary, toDenary, ones, POOLS,
  LADDERS, STEP_COUNT, ladderQuestion, checkB2D, checkD2B, checkPad, checkBuild, BUILD_TILES,
  leftAfter, checkTyped, workingFor, cooldownSeconds, d2bWorking, b2dWorking, padWorking,
  BASICS_POOL, BASICS_LENGTH, drawBasics, optionOrder,
  NOHELP_LENGTH, drawNoHelp, PLENARY_POOL, PLENARY_LENGTH, drawPlenary,
} from './checkers.js';

const q4 = (kind, value, extra = {}) => ({ kind, value, width: 4, bits: toBinary(value, 4), ...extra });
const q8 = (kind, value, extra = {}) => ({ kind, value, width: 8, bits: toBinary(value, 8), ...extra });

describe('conversions', () => {
  it('converts both ways', () => {
    expect(toDenary('1011')).toBe(11);
    expect(toDenary('00000101')).toBe(5);
    expect(toBinary(11, 4)).toBe('1011');
    expect(toBinary(37, 8)).toBe('00100101');
  });
  it('headings double right to left', () => {
    expect(HEADINGS4).toEqual([8, 4, 2, 1]);
    expect(HEADINGS8).toEqual([128, 64, 32, 16, 8, 4, 2, 1]);
  });
  it('leftAfter follows the method', () => {
    expect(leftAfter(11, HEADINGS4)).toEqual([3, 3, 1, 0]);
    expect(leftAfter(6, HEADINGS4)).toEqual([6, 2, 0, 0]);
  });
});

describe('number pools', () => {
  it('fit their bit widths and are never single-1 numbers', () => {
    for (const n of [...POOLS.b2d4, ...POOLS.d2b4]) { expect(n).toBeLessThan(16); expect(ones(n)).toBeGreaterThanOrEqual(2); }
    for (const n of [...POOLS.b2d8, ...POOLS.d2b8]) { expect(n).toBeLessThan(256); expect(ones(n)).toBeGreaterThanOrEqual(3); }
    for (const n of POOLS.d2b8small) expect(n).toBeLessThan(128);
  });
});

describe('ladders', () => {
  it('Task 5 opens with the heading build, and step counts match', () => {
    expect(LADDERS[4][0].kind).toBe('build');
    expect(STEP_COUNT).toEqual({ 1: 5, 2: 5, 4: 4, 5: 4 });
    expect(LADDERS[4].every(s => s.kind === 'build' || s.kind === 'b2d')).toBe(true);
    expect(LADDERS[5].every(s => s.kind === 'd2b' || s.kind === 'pad')).toBe(true);
  });
  it('help fades: the last steps of Tasks 2 and 3 have blank headings', () => {
    for (const t of [1, 2]) {
      expect(LADDERS[t][0].show).toBe('headings');
      expect(LADDERS[t].at(-1).show).toBe('blank');
    }
  });
  it('questions are stable for a seed and change on a retry', () => {
    const a = ladderQuestion(1, 2, 'abc', 0);
    expect(ladderQuestion(1, 2, 'abc', 0)).toEqual(a);
    const values = new Set(Array.from({ length: 10 }, (_, r) => ladderQuestion(1, 2, 'abc', r).value));
    expect(values.size).toBeGreaterThan(1);
  });
  it('a retry never repeats the number just got wrong', () => {
    for (const seed of ['a1', 'k3j9x', 'zz9']) for (const t of [1, 2]) for (let st = 0; st < STEP_COUNT[t]; st++)
      for (let r = 1; r < 12; r++) expect(ladderQuestion(t, st, seed, r).value).not.toBe(ladderQuestion(t, st, seed, r - 1).value);
  });
  it('every binary number to convert is shown with all its bits (no short numbers to line up)', () => {
    for (const seed of ['a1', 'k3j9x', 'zz9']) for (const t of [1, 4]) for (let st = 0; st < STEP_COUNT[t]; st++)
      for (let r = 0; r < 6; r++) {
        const q = ladderQuestion(t, st, seed, r);
        if (q.kind === 'b2d') expect(q.bits).toHaveLength(q.width);
      }
  });
});

describe('checkB2D', () => {
  it('headings shown: only the total is marked', () => {
    expect(checkB2D(q4('b2d', 11, { show: 'headings' }), { total: '11' }).ok).toBe(true);
    expect(checkB2D(q4('b2d', 11, { show: 'headings' }), { total: ' 11 ' }).ok).toBe(true);
    expect(checkB2D(q4('b2d', 11, { show: 'headings' }), { total: '13' }).ok).toBe(false);
  });
  it('blank: every bit box needs its bit, 0s included', () => {
    const q = q4('b2d', 5, { show: 'blank' });
    const headings = ['8', '4', '2', '1'];
    expect(checkB2D(q, { headings, bits: [...'0101'], total: '5' }).ok).toBe(true);
    expect(checkB2D(q, { headings, bits: ['', '1', '0', '1'], total: '5' }).results.b0).toBe(false);
    expect(checkB2D(q, { headings, bits: [...'1010'], total: '5' }).ok).toBe(false);
  });
  it('blank: wrong headings are marked one by one', () => {
    const q = q4('b2d', 11, { show: 'blank' });
    const r = checkB2D(q, { headings: ['1', '2', '4', '8'], bits: [...'1011'], total: '11' });
    expect(r.ok).toBe(false);
    expect(r.results.h0).toBe(false);
    expect(r.results.total).toBe(true);
  });
  it('blank: an unfilled box with a 1 behind it is wrong', () => {
    const q = q4('b2d', 13, { show: 'blank' });
    const bits = []; bits[1] = '1'; bits[2] = '0'; bits[3] = '1';    // sparse, as typed in the page
    expect(checkB2D(q, { headings: ['8', '4', '2', '1'], bits, total: '13' }).results.b0).toBe(false);
  });
  it('8 bits with blank headings', () => {
    const q = q8('b2d', 150, { show: 'blank' });
    expect(checkB2D(q, { headings: HEADINGS8.map(String), bits: [...toBinary(150, 8)], total: '150' }).ok).toBe(true);
  });
});

describe('checkD2B', () => {
  it('guided: bits and what is left in every row', () => {
    const q = q4('d2b', 11, { show: 'headings', guided: true });
    expect(checkD2B(q, { bits: [...'1011'], left: ['3', '3', '1', '0'] }).ok).toBe(true);
    const r = checkD2B(q, { bits: [...'1011'], left: ['3', '', '1', '0'] });
    expect(r.ok).toBe(false);
    expect(r.results.l1).toBe(false);
  });
  it('every column needs a bit, including leading zeros', () => {
    const q = q4('d2b', 6, { show: 'headings' });
    expect(checkD2B(q, { bits: [...'0110'] }).ok).toBe(true);
    expect(checkD2B(q, { bits: ['', '1', '1', '0'] }).ok).toBe(false);
  });
  it('blank headings are checked', () => {
    const q = q8('d2b', 37, { show: 'blank' });
    expect(checkD2B(q, { headings: HEADINGS8.map(String), bits: [...'00100101'] }).ok).toBe(true);
    expect(checkD2B(q, { headings: ['128', '64', '32', '16', '8', '4', '2', ''], bits: [...'00100101'] }).ok).toBe(false);
  });
});

describe('checkPad and checkBuild', () => {
  it('pads to 8 bits and keeps the value', () => {
    const q = { kind: 'pad', value: 13, bits: '1101', width: 8 };
    expect(checkPad(q, { bits8: '00001101', total: '13' }).ok).toBe(true);
    expect(checkPad(q, { bits8: '0000 1101', total: '13' }).ok).toBe(true);
    expect(checkPad(q, { bits8: '11010000', total: '13' }).ok).toBe(false);
    expect(checkPad(q, { bits8: '00001101', total: '1101' }).results.total).toBe(false);
  });
  it('builds 128 64 32 16 in order', () => {
    expect(checkBuild({ h0: 128, h1: 64, h2: 32, h3: 16 }).ok).toBe(true);
    expect(checkBuild({ h0: 256, h1: 64, h2: 32, h3: 16 }).results.h0).toBe(false);
    for (const h of [128, 64, 32, 16]) expect(BUILD_TILES).toContain(h);
  });
});

describe('checkTyped', () => {
  it('b2d needs a number', () => {
    expect(checkTyped({ type: 'b2d', value: 11, width: 4 }, '11')).toBe('ok');
    expect(checkTyped({ type: 'b2d', value: 11, width: 4 }, '12')).toBe('wrong');
    expect(checkTyped({ type: 'b2d', value: 11, width: 4 }, 'eleven')).toBe('format');
  });
  it('d2b needs exactly width bits (leading zeros required)', () => {
    const q = { type: 'd2b', value: 6, width: 4 };
    expect(checkTyped(q, '0110')).toBe('ok');
    expect(checkTyped(q, '110')).toBe('format');
    expect(checkTyped(q, '0111')).toBe('wrong');
    expect(checkTyped({ type: 'd2b', value: 37, width: 8 }, '0010 0101')).toBe('ok');
  });
});

describe('cooldownSeconds', () => {
  it('escalates 10, 20, 30 and stays at 30', () => {
    expect([1, 2, 3, 4, 9].map(cooldownSeconds)).toEqual([10, 20, 30, 30, 30]);
  });
});

describe('working', () => {
  it('shows the method', () => {
    expect(b2dWorking(11, 4)).toBe('1011 has a 1 under 8, 2, 1. 8 + 2 + 1 = 11.');
    expect(d2bWorking(11, 4)).toContain("4 doesn't fit: 0");
    expect(d2bWorking(11, 4)).toContain('So 11 = 1011.');
    expect(padWorking(5)).toContain('00000101');
    expect(workingFor({ type: 'd2b', value: 6, width: 4 })).toContain('0110');
  });
});

describe('chains', () => {
  it('basics: draws distinct questions, stable per attempt', () => {
    const d = drawBasics('s1', 0);
    expect(d).toHaveLength(BASICS_LENGTH);
    expect(new Set(d).size).toBe(BASICS_LENGTH);
    expect(drawBasics('s1', 0)).toEqual(d);
  });
  it('MCQs: valid answer key, 4 options, correct option not the longest in half or more', () => {
    const pool = [...BASICS_POOL, ...PLENARY_POOL];
    let longest = 0;
    for (const q of pool) {
      expect(q.opts).toHaveLength(4);
      expect(q.opts.map(o => o[0])).toContain(q.a);
      const lens = q.opts.map(o => o[1].length);
      const right = q.opts.find(o => o[0] === q.a)[1].length;
      if (right === Math.max(...lens) && lens.filter(l => l === right).length === 1) longest++;
      expect(optionOrder(q, 's', 0).sort()).toEqual(['a', 'b', 'c', 'd']);
    }
    expect(longest / pool.length).toBeLessThan(0.5);
  });
  it('no help: 3 each way, all different numbers', () => {
    const d = drawNoHelp('s2', 3);
    expect(d).toHaveLength(NOHELP_LENGTH);
    expect(d.filter(x => x.type === 'b2d')).toHaveLength(3);
    expect(new Set(d.map(x => x.value)).size).toBe(NOHELP_LENGTH);
  });
  it('plenary: 3 MCQs and one 8-bit conversion each way', () => {
    const d = drawPlenary('s3', 1);
    expect(d).toHaveLength(PLENARY_LENGTH);
    expect(d.filter(x => x.type === 'mcq')).toHaveLength(3);
    expect(d.filter(x => x.type === 'b2d')).toHaveLength(1);
    expect(d.find(x => x.type === 'd2b').value).toBeLessThan(128);
  });
  it('TASK_COUNT is 7', () => expect(TASK_COUNT).toBe(7));
});
