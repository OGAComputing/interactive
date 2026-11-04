import { describe, it, expect } from 'vitest';
import {
  TASK_COUNT, toBinary, toDenary, addColumns, carryCount, hasTriple, POOLS,
  LADDERS, STEP_COUNT, ladderQuestion, checkAdd, checkColumn, fullAnswer,
  checkTyped, formatHint, workingFor, addWorking, columnWorking, cooldownSeconds,
  STARTER_POOL, STARTER_LENGTH, drawStarter, COLUMN_GROUPS, RULES_POOL, RULES_LENGTH, drawRules,
  NOHELP_LENGTH, drawNoHelp, PLENARY_POOL, PLENARY_LENGTH, drawPlenary, optionOrder,
  GAME_POOLS, gameSum, gameTime, gamePoints, multiplier, RANKS, rankFor, GAME_BADGES, runBadges, cleanCode,
} from './checkers.js';

// The draft a student who answers q correctly would have.
function rightDraft(q) {
  const d = {
    carries: q.carryIn.map(c => (c ? '1' : '')),
    bits: [...q.answer],
    extra: q.final ? '1' : '',
    rowA: [...q.bitsA], rowB: [...q.bitsB],
    dec: { a: String(q.a), b: String(q.b), sum: String(q.sum) },
  };
  return d;
}

describe('column addition', () => {
  it('follows the four rules right to left', () => {
    const r = addColumns(0b0111, 0b0011, 4);          // 7 + 3
    expect(r.carryIn).toEqual([1, 1, 1, 0]);
    expect(r.final).toBe(0);
    expect(fullAnswer(7, 3, 4)).toBe('1010');
    expect(hasTriple(7, 3, 4)).toBe(true);
  });
  it('a final carry makes the answer one bit longer', () => {
    expect(fullAnswer(8, 8, 4)).toBe('10000');
    expect(fullAnswer(15, 1, 4)).toBe('10000');
    expect(addColumns(15, 1, 4).final).toBe(1);
    expect(fullAnswer(200, 55, 8)).toBe('11111111');
  });
  it('the answer always converts back to the denary sum', () => {
    for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) expect(toDenary(fullAnswer(a, b, 4))).toBe(a + b);
  });
});

describe('pools', () => {
  it('match their names', () => {
    for (const [a, b] of POOLS.nocarry4) { expect(a & b).toBe(0); expect(carryCount(a, b, 4)).toBe(0); }
    for (const [a, b] of POOLS.onecarry4) { expect(carryCount(a, b, 4)).toBe(1); expect(a + b).toBeLessThan(16); }
    for (const [a, b] of POOLS.carry4) { expect(carryCount(a, b, 4)).toBeGreaterThanOrEqual(2); expect(a + b).toBeLessThan(16); }
    for (const [a, b] of POOLS.triple4) expect(hasTriple(a, b, 4)).toBe(true);
    for (const [a, b] of POOLS.over4) expect(a + b).toBeGreaterThanOrEqual(16);
    for (const [a, b] of POOLS.add8) expect(a + b).toBeLessThan(256);
    for (const [a, b] of POOLS.pad8) { expect(toBinary(a).length).toBeLessThan(8); expect(toBinary(b).length).toBeLessThan(5); }
  });
  it('the "might not" step is about half final carries', () => {
    const over = POOLS.mixed4.filter(([a, b]) => a + b >= 16).length;
    expect(over * 2).toBe(POOLS.mixed4.length);
  });
  it('are big enough for retries', () => {
    for (const pool of Object.values(POOLS)) expect(pool.length).toBeGreaterThanOrEqual(9);
  });
});

describe('ladders', () => {
  it('step counts and fading', () => {
    expect(STEP_COUNT).toEqual({ 2: 5, 3: 3, 5: 4 });
    expect(LADDERS[2].slice(0, 2).every(s => s.carry === 'given')).toBe(true);
    expect(LADDERS[2].slice(2).every(s => s.carry === 'write')).toBe(true);
    expect(LADDERS[3].every(s => s.extra)).toBe(true);
    expect(LADDERS[5].some(s => s.pad) && LADDERS[5].some(s => s.dec)).toBe(true);
  });
  it('questions are stable for a seed and a retry never repeats the sum just got wrong', () => {
    expect(ladderQuestion(2, 2, 'abc', 0)).toEqual(ladderQuestion(2, 2, 'abc', 0));
    for (const seed of ['a1', 'k3j9x', 'zz9']) for (const t of [2, 3, 5]) for (let st = 0; st < STEP_COUNT[t]; st++)
      for (let r = 1; r < 10; r++) expect(ladderQuestion(t, st, seed, r).key).not.toBe(ladderQuestion(t, st, seed, r - 1).key);
  });
  it('every step accepts the right answer', () => {
    for (const seed of ['a1', 'b2', 'c3']) for (const t of [2, 3, 5]) for (let st = 0; st < STEP_COUNT[t]; st++) {
      const q = ladderQuestion(t, st, seed);
      expect(checkAdd(q, rightDraft(q)).ok).toBe(true);
    }
  });
});

describe('checkAdd', () => {
  const q = ladderQuestion(2, 4, 'seed');           // carries written by the student
  it('marks a missing carry, and only that box', () => {
    const d = rightDraft(q);
    const k = q.carryIn.findIndex(Boolean);
    d.carries[k] = '';
    const { ok, results } = checkAdd(q, d);
    expect(ok).toBe(false);
    expect(Object.entries(results).filter(([, v]) => !v).map(([p]) => p)).toEqual(['c' + k]);
  });
  it('marks a carry written where there isn\'t one', () => {
    const d = rightDraft(q);
    const k = q.carryIn.slice(0, -1).findIndex(c => !c);
    if (k >= 0) {
      d.carries[k] = '1';
      expect(checkAdd(q, d).results['c' + k]).toBe(false);
    }
  });
  it('a wrong answer bit is marked on that bit', () => {
    const d = rightDraft(q);
    d.bits[3] = d.bits[3] === '1' ? '0' : '1';
    expect(checkAdd(q, d).results.s3).toBe(false);
  });
  it('given carries are not marked', () => {
    const g = ladderQuestion(2, 1, 'seed');
    const d = { ...rightDraft(g), carries: [] };
    expect(checkAdd(g, d).ok).toBe(true);
  });
  it('the final-carry box: dropped, or written when there is none', () => {
    const o = ladderQuestion(3, 0, 'seed');
    expect(o.final).toBe(1);
    expect(checkAdd(o, { ...rightDraft(o), extra: '' }).results.x).toBe(false);
    const n = { ...ladderQuestion(2, 4, 'seed'), extra: true };
    expect(checkAdd(n, { ...rightDraft(n), extra: '1' }).results.x).toBe(false);
  });
  it('the pad step needs both numbers as 8 bits', () => {
    const p = ladderQuestion(5, 2, 'seed');
    const d = rightDraft(p);
    d.rowB = [...toBinary(p.b).padEnd(8, '0')];        // 0s on the wrong side
    expect(checkAdd(p, d).ok).toBe(false);
  });
  it('the denary check needs all three numbers', () => {
    const c = ladderQuestion(5, 3, 'seed');
    const d = rightDraft(c);
    d.dec.sum = String(c.sum + 1);
    expect(checkAdd(c, d).results.ds).toBe(false);
  });
});

describe('one column (Task 2)', () => {
  it('follows the four rules', () => {
    expect(checkColumn({ x: 0, y: 0, cin: 0 }, { write: '0', carry: '' }).ok).toBe(true);
    expect(checkColumn({ x: 0, y: 1, cin: 0 }, { write: '1', carry: '' }).ok).toBe(true);
    expect(checkColumn({ x: 1, y: 1, cin: 0 }, { write: '0', carry: '1' }).ok).toBe(true);
    expect(checkColumn({ x: 1, y: 1, cin: 1 }, { write: '1', carry: '1' }).ok).toBe(true);
  });
  it('catches the usual mistakes', () => {
    expect(checkColumn({ x: 1, y: 1, cin: 0 }, { write: '0', carry: '' }).results.carry).toBe(false);   // forgot the carry
    expect(checkColumn({ x: 1, y: 1, cin: 1 }, { write: '0', carry: '1' }).results.write).toBe(false);  // ignored the carry in
    expect(checkColumn({ x: 0, y: 1, cin: 0 }, { write: '1', carry: '1' }).results.carry).toBe(false);
  });
  it('the working names the rule', () => {
    expect(columnWorking(1, 1, 1)).toBe('1 + 1 + 1 = 3: write 1, carry 1.');
    expect(columnWorking(0, 1, 0)).toBe('0 + 1 = 1: write 1, no carry.');
  });
});

describe('typed answers', () => {
  const add = { type: 'add', a: 6, b: 14, width: 4 };   // 10100
  it('needs the final carry', () => {
    expect(checkTyped(add, '10100')).toBe('ok');
    expect(checkTyped(add, '0100')).toBe('wrong');      // final carry dropped
    expect(checkTyped(add, '1 0100')).toBe('ok');
  });
  it('accepts a leading 0 when there is no final carry', () => {
    const q = { type: 'add', a: 7, b: 3, width: 4 };
    expect(checkTyped(q, '1010')).toBe('ok');
    expect(checkTyped(q, '01010')).toBe('ok');
    expect(checkTyped(q, '1011')).toBe('wrong');
  });
  it('badly formed answers are not marked wrong', () => {
    expect(checkTyped(add, '20')).toBe('format');
    expect(checkTyped(add, '101')).toBe('format');
    expect(checkTyped(add, '1010000')).toBe('format');
    expect(formatHint(add)).toMatch(/4 bits, or 5/);
  });
  it('Lesson 1 conversions', () => {
    expect(checkTyped({ type: 'b2d', value: 11, width: 4 }, '11')).toBe('ok');
    expect(checkTyped({ type: 'd2b', value: 6, width: 4 }, '0110')).toBe('ok');
    expect(checkTyped({ type: 'd2b', value: 6, width: 4 }, '110')).toBe('format');
  });
});

describe('working', () => {
  it('walks every column and gives the denary check', () => {
    expect(addWorking(6, 14, 4)).toBe('Right column: 0 + 0 = 0: write 0, no carry. Next: 1 + 1 = 2: write 0, carry 1. '
      + 'Next: 1 + 1 + 1 = 3: write 1, carry 1. Next: 0 + 1 + 1 = 2: write 0, carry 1. '
      + 'The final carry becomes a new bit on the left. Answer: 10100 (6 + 14 = 20).');
    expect(workingFor(ladderQuestion(5, 2, 'seed'))).toMatch(/as 8 bits is/);
  });
  it('waits get longer: 10, 20, then 30 s', () => {
    expect([1, 2, 3, 7].map(cooldownSeconds)).toEqual([10, 20, 30, 30]);
  });
});

describe('chains', () => {
  it('lengths and contents', () => {
    expect(TASK_COUNT).toBe(7);
    const s = drawStarter('x', 0);
    expect(s).toHaveLength(STARTER_LENGTH);
    expect(s.map(i => i.type).sort()).toEqual(['b2d', 'd2b', 'mcq', 'mcq']);
    const r = drawRules('x', 0);
    expect(r).toHaveLength(RULES_LENGTH);
    expect(r.filter(i => i.type === 'col')).toHaveLength(4);
    const n = drawNoHelp('x', 0);
    expect(n).toHaveLength(NOHELP_LENGTH);
    expect(n.filter(i => i.a + i.b >= 16)).toHaveLength(2);
    expect(new Set(n.map(i => `${i.a}+${i.b}`)).size).toBe(NOHELP_LENGTH);
    const p = drawPlenary('x', 0);
    expect(p).toHaveLength(PLENARY_LENGTH);
    expect(p.filter(i => i.type === 'add')).toHaveLength(2);
  });
  it('the rules chain has one column for each of the four rules', () => {
    for (const seed of ['a', 'b', 'c']) {
      const sums = drawRules(seed, 0).filter(i => i.type === 'col').map(i => i.x + i.y + i.cin).sort();
      expect(sums).toEqual([0, 1, 2, 3]);
    }
    expect(COLUMN_GROUPS.flat().every(c => c.length === 3)).toBe(true);
  });
  it('a new attempt gives a new draw', () => {
    expect(drawNoHelp('x', 1)).not.toEqual(drawNoHelp('x', 0));
  });
});

describe('multiple-choice questions', () => {
  const all = [...STARTER_POOL, ...RULES_POOL, ...PLENARY_POOL];
  it('ids are unique and every answer key exists', () => {
    expect(new Set(all.map(q => q.id)).size).toBe(all.length);
    for (const q of all) expect(q.opts.map(o => o[0])).toContain(q.a);
  });
  it('the right answer is not usually the longest option', () => {
    const longest = all.filter(q => {
      const len = k => q.opts.find(o => o[0] === k)[1].length;
      return q.opts.every(o => o[0] === q.a || len(q.a) > len(o[0]));
    });
    expect(longest.length / all.length).toBeLessThan(0.5);
  });
  it('the right answer is spread across positions', () => {
    const keys = new Set(all.map(q => q.a));
    expect(keys.size).toBe(4);
  });
  it('option order is shuffled per student', () => {
    const q = RULES_POOL[0];
    const orders = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(seed => optionOrder(q, seed, 0).join('')));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('Carry Rush (extension game)', () => {
  it('a class code gives everyone the same sums; never the same sum twice running', () => {
    for (let i = 0; i < 60; i++) {
      expect(gameSum('BIN7', i)).toEqual(gameSum('BIN7', i));
      if (i) expect(`${gameSum('BIN7', i).a}+${gameSum('BIN7', i).b}`).not.toBe(`${gameSum('BIN7', i - 1).a}+${gameSum('BIN7', i - 1).b}`);
    }
    const a = Array.from({ length: 10 }, (_, i) => gameSum('BIN7', i));
    const b = Array.from({ length: 10 }, (_, i) => gameSum('OTHER', i));
    expect(a).not.toEqual(b);
  });
  it('sums grow: 4 bits, then a final carry, then 6 bits, then 8', () => {
    const at = i => gameSum('x', i);
    expect(at(0).width).toBe(4);
    for (let i = 0; i < 5; i++) expect(carryCount(at(i).a, at(i).b, 4)).toBeLessThanOrEqual(1);
    for (let i = 20; i < 30; i++) expect(at(i).width).toBe(6);
    for (let i = 30; i < 60; i++) expect(at(i).width).toBe(8);
    for (let i = 0; i < 60; i++) {
      const s = at(i);
      expect(s.a).toBeLessThan(2 ** s.width);
      expect(s.b).toBeLessThan(2 ** s.width);
      expect(checkTyped({ type: 'add', ...s }, fullAnswer(s.a, s.b, s.width))).toBe('ok');
    }
    const over8 = Array.from({ length: 40 }, (_, k) => at(40 + k)).filter(s => s.a + s.b >= 256);
    expect(over8.length).toBeGreaterThan(0);
  });
  it('game pools fit their widths', () => {
    for (const [a, b] of GAME_POOLS.add6) expect(a + b).toBeLessThan(64);
    for (const [a, b] of GAME_POOLS.over8) { expect(a).toBeLessThan(256); expect(a + b).toBeGreaterThanOrEqual(256); }
  });
  it('time shrinks only at the last level, never below 20 s', () => {
    expect(gameTime(0)).toBe(20);
    expect(gameTime(30)).toBe(40);
    expect(gameTime(40)).toBe(36);
    expect(gameTime(45)).toBe(34);
    expect(gameTime(500)).toBe(20);
  });
  it('points: base + speed bonus, times the streak', () => {
    expect(gamePoints(0, 20, 20, 1)).toBe(200);         // full speed bonus
    expect(gamePoints(0, 0, 20, 1)).toBe(100);
    expect(gamePoints(0, 10, 20, 3)).toBe(300);         // ×2 at 3 in a row
    expect(gamePoints(30, 40, 40, 10)).toBe(1600);      // 8 bits, ×4
    expect([0, 2, 3, 6, 10].map(multiplier)).toEqual([1, 1, 2, 3, 4]);
  });
  it('ranks and badges', () => {
    expect(rankFor(0)).toBe('Trainee');
    expect(rankFor(3000)).toBe('Carry Cadet');
    expect(RANKS.every(([m], k) => k === 0 || m > RANKS[k - 1][0])).toBe(true);
    const b = runBadges({ played: 31, maxStreak: 5, fast: 5, perfect: true, overflow: 1, score: 10000 });
    expect(b).toMatchObject({ first: true, streak5: true, streak10: false, overflow: true, eight: true, speed: true, perfect: true, score10k: true });
    expect(runBadges({ played: 30, maxStreak: 0, fast: 0, perfect: true, overflow: 0, score: 0 }).eight).toBe(false);
    expect(runBadges({ played: 10, maxStreak: 0, fast: 0, perfect: true, overflow: 0, score: 0 }).perfect).toBe(false);
    expect(new Set(GAME_BADGES.map(g => g[0]))).toEqual(new Set(Object.keys(b)));
  });
  it('class codes are cleaned', () => {
    expect(cleanCode(' bin-7 ')).toBe('BIN7');
    expect(cleanCode('abcdefghijk')).toBe('ABCDEFGH');
  });
});
