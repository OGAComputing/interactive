import { describe, it, expect } from 'vitest';
import {
  TASK_COUNT, toBinary, toHex, hexDigit, hi, lo, nibbleSum, POOLS,
  LADDERS, STEP_COUNT, ladderQuestion, checkLadder, shapeHint, workingFor, SPLIT_GAP,
  digitWorking, nibbleWorking, b2hWorking, h2bWorking, cooldownSeconds,
  checkTyped, formatHint, itemAnswer, itemShown, itemWorking,
  NOHELP_LENGTH, drawNoHelp, PLENARY_POOL, PLENARY_LENGTH, drawPlenary, optionOrder,
  GAME_LEVELS, gameQuestion, gameTime, gamePoints, multiplier, rankFor, runBadges, cleanCode,
  GLOSSARY, glossaryDef, NO_GLOSS,
} from './checkers.js';

// The draft a student who answers q correctly would have.
function rightDraft(q) {
  if (q.task === 0) return { items: q.items.map(it => it.answer) };
  if (q.task === 1) return { dec: { n: String(q.n) }, hex: hexDigit(q.n) };
  if (q.task === 2) return {
    split: SPLIT_GAP, dec: { l: String(hi(q.n)), r: String(lo(q.n)) },
    nib: { l: hexDigit(hi(q.n)), r: hexDigit(lo(q.n)) }, ans: toHex(q.n),
  };
  return { dec: { l: String(hi(q.n)), r: String(lo(q.n)) }, bits: [...toBinary(q.n, 8)], typed: toBinary(q.n, 8) };
}

const SEEDS = ['a1', 'k3j9x', 'zz9', 'q'];
const allQuestions = () => SEEDS.flatMap(seed => [0, 1, 2, 3].flatMap(t =>
  Array.from({ length: STEP_COUNT[t] }, (_, st) => ladderQuestion(t, st, seed))));

describe('conversions', () => {
  it('hex digits and bytes', () => {
    expect(hexDigit(10)).toBe('A');
    expect(hexDigit(15)).toBe('F');
    expect(toHex(0b10110101)).toBe('B5');
    expect(toHex(0x3A)).toBe('3A');
    expect(toHex(0x0F)).toBe('0F');
    for (let n = 0; n < 256; n++) expect(parseInt(toHex(n), 16)).toBe(n);
  });
  it('nibble sums use 8 4 2 1', () => {
    expect(nibbleSum(11)).toBe('8 + 2 + 1 = 11');
    expect(nibbleSum(4)).toBe('4');
    expect(nibbleSum(0)).toBe('0');
  });
  it('working shows every step', () => {
    expect(digitWorking(12)).toBe('12 is C in hex (A = 10, B = 11, C = 12).');
    expect(digitWorking(7)).toContain('the same');
    expect(nibbleWorking(13)).toBe('1101: 8 + 4 + 1 = 13, and 13 is D in hex.');
    expect(b2hWorking(0xB5)).toBe('Split into 1011 0101. 1011 = 8 + 2 + 1 = 11 = B. 0101 = 4 + 1 = 5. Join: B5.');
    expect(h2bWorking(0x3A)).toBe('3 = 2 + 1 → 0011. A = 10 = 8 + 2 → 1010. Join: 00111010.');
  });
});

describe('pools', () => {
  it('match their names', () => {
    const letter = k => k >= 10;
    for (const n of POOLS.twoLetters) expect(letter(hi(n)) && letter(lo(n))).toBe(true);
    for (const n of POOLS.oneLetter) expect(letter(hi(n)) !== letter(lo(n))).toBe(true);
    for (const n of POOLS.lowFirst) expect(toBinary(n, 8)[0]).toBe('0');
    for (const n of POOLS.smallDigit) expect(toBinary(hi(n), 4)[0] === '0' || toBinary(lo(n), 4)[0] === '0').toBe(true);
    for (const n of POOLS.anyLetter) { expect(letter(hi(n)) || letter(lo(n))).toBe(true); expect(lo(n)).toBeGreaterThan(0); }
  });
  it('are big enough for retries', () => {
    for (const pool of Object.values(POOLS)) expect(pool.length).toBeGreaterThanOrEqual(6);
  });
});

describe('ladders', () => {
  it('step counts and fading', () => {
    expect(STEP_COUNT).toEqual({ 0: 4, 1: 4, 2: 5, 3: 5 });
    expect(LADDERS[0].map(s => s.table)).toEqual(['full', 'full', 'a', 'none']);
    expect(LADDERS[2].map(s => s.split)).toEqual(['shown', 'shown', 'tap', 'none', 'none']);
    expect(LADDERS[3].at(-1).entry).toBe('typed');
    for (const t of [0, 1, 2, 3]) expect(LADDERS[t].at(-1).fold).toBe(true);
  });
  it('the digit steps have 3 different numbers, and the last has one 0–9', () => {
    for (const seed of SEEDS) for (let st = 0; st < 4; st++) for (let r = 0; r < 5; r++) {
      const q = ladderQuestion(0, st, seed, r);
      expect(new Set(q.items.map(i => i.n)).size).toBe(3);
      if (st === 3) expect(q.items.filter(i => i.n < 10)).toHaveLength(1);
      if (st < 2) expect(q.items.every(i => i.dir === LADDERS[0][st].dir)).toBe(true);
    }
  });
  it('every conversion question has at least one hex letter in its answer', () => {
    for (const seed of SEEDS) for (const t of [1, 2, 3]) for (let st = 0; st < STEP_COUNT[t]; st++)
      for (let r = 0; r < 8; r++) expect(ladderQuestion(t, st, seed, r).hex).toMatch(/[A-F]/);
    for (const seed of SEEDS) for (let a = 0; a < 5; a++) {
      for (const it of drawNoHelp(seed, a)) expect(toHex(it.n)).toMatch(/[A-F]/);
      for (const it of drawPlenary(seed, a).filter(x => x.type !== 'mcq')) expect(toHex(it.n)).toMatch(/[A-F]/);
    }
  });
  it('questions are stable for a seed and a retry never repeats the one just got wrong', () => {
    expect(ladderQuestion(2, 2, 'abc', 0)).toEqual(ladderQuestion(2, 2, 'abc', 0));
    for (const seed of SEEDS) for (const t of [0, 1, 2, 3]) for (let st = 0; st < STEP_COUNT[t]; st++)
      for (let r = 1; r < 8; r++) expect(ladderQuestion(t, st, seed, r).key).not.toBe(ladderQuestion(t, st, seed, r - 1).key);
  });
  it('every step accepts the right answer, in lower case too', () => {
    for (const q of allQuestions()) {
      const d = rightDraft(q);
      expect(shapeHint(q, d)).toBe('');
      expect(checkLadder(q, d).ok).toBe(true);
      const lower = JSON.parse(JSON.stringify(d).toLowerCase());
      expect(checkLadder(q, lower).ok).toBe(true);
      expect(workingFor(q).length).toBeGreaterThan(10);
    }
  });
  it('marks each part on its own', () => {
    const q = { ...ladderQuestion(2, 0, 'a1'), n: 0xB5, bits: '10110101' };
    const r = checkLadder(q, { dec: { l: '11', r: '5' }, nib: { l: 'B', r: '5' }, ans: '5B' });
    expect(r.ok).toBe(false);
    expect(r.results).toMatchObject({ dl: true, dr: true, hl: true, hr: true, ans: false });
    const tap = { ...ladderQuestion(2, 2, 'a1'), n: 0xB5 };
    expect(checkLadder(tap, { split: 3, nib: { l: 'B', r: '5' }, ans: 'B5' }).results.split).toBe(false);
    const bits = { ...ladderQuestion(3, 0, 'a1'), n: 0x3A };
    const res = checkLadder(bits, { dec: { l: '3', r: '10' }, bits: [...'11001010'] }).results;
    expect(res.b0).toBe(false);
    expect(res.b4).toBe(true);
  });
  it('wrongly shaped answers get a hint instead of a mark', () => {
    const q1 = ladderQuestion(1, 0, 'a1');
    expect(shapeHint(q1, { dec: { n: '' }, hex: '' })).toContain('Fill in');
    expect(shapeHint(q1, { dec: { n: '11' }, hex: 'G' })).toContain('one character');
    const q2 = ladderQuestion(2, 3, 'a1');
    expect(shapeHint(q2, { ans: '115' })).toContain('two hex digits');
    const q3 = ladderQuestion(3, 3, 'a1');
    expect(shapeHint(q3, { typed: '111010' })).toContain('8 bits');
    const q4 = ladderQuestion(3, 0, 'a1');
    expect(shapeHint(q4, { dec: { l: '3', r: '10' }, bits: ['1', '0'] })).toContain('all 8 bits');
    const tap = ladderQuestion(2, 2, 'a1');
    expect(shapeHint(tap, { nib: { l: 'B', r: '5' }, ans: 'B5' })).toContain('Tap the gap');
  });
  it('waits 5, 10 then 15 s', () => {
    expect([1, 2, 3, 4].map(cooldownSeconds)).toEqual([5, 10, 15, 15]);
  });
});

describe('typed conversions', () => {
  it('right, wrong and wrongly shaped', () => {
    const b2h = { type: 'b2h', n: 0xB5 }, h2b = { type: 'h2b', n: 0x3A };
    expect(checkTyped(b2h, 'b5')).toBe('ok');
    expect(checkTyped(b2h, ' B5 ')).toBe('ok');
    expect(checkTyped(b2h, '5B')).toBe('wrong');
    expect(checkTyped(b2h, '115')).toBe('format');
    expect(checkTyped(h2b, '00111010')).toBe('ok');
    expect(checkTyped(h2b, '0011 1010')).toBe('ok');
    expect(checkTyped(h2b, '111010')).toBe('format');
    expect(checkTyped(h2b, '10100011')).toBe('wrong');
    expect(checkTyped({ type: 'nib2h', n: 12 }, 'c')).toBe('ok');
    expect(checkTyped({ type: 'h2nib', n: 3 }, '0011')).toBe('ok');
    expect(checkTyped({ type: 'h2nib', n: 3 }, '11')).toBe('format');
    for (const t of ['b2h', 'h2b', 'nib2h', 'h2nib']) expect(formatHint({ type: t })).toMatch(/Type/);
  });
  it('shows, answers and explains every type', () => {
    expect(itemShown({ type: 'h2b', n: 0xB5 })).toBe('B5');
    expect(itemAnswer({ type: 'h2b', n: 0xB5 })).toBe('10110101');
    expect(itemWorking({ type: 'h2nib', n: 12 })).toBe('C = 12 = 8 + 4 → 1100.');
  });
});

describe('chains', () => {
  it('no help: 6 different numbers, 3 each way', () => {
    for (const seed of SEEDS) for (let a = 0; a < 5; a++) {
      const items = drawNoHelp(seed, a);
      expect(items).toHaveLength(NOHELP_LENGTH);
      expect(new Set(items.map(i => i.n)).size).toBe(6);
      expect(items.filter(i => i.type === 'b2h')).toHaveLength(3);
    }
    expect(drawNoHelp('x', 1)).not.toEqual(drawNoHelp('x', 2));
  });
  it('plenary: 3 key ideas and one conversion each way', () => {
    for (const seed of SEEDS) {
      const items = drawPlenary(seed, 0);
      expect(items).toHaveLength(PLENARY_LENGTH);
      expect(items.filter(i => i.type === 'mcq')).toHaveLength(3);
      expect(items.filter(i => i.type === 'b2h')).toHaveLength(1);
      expect(items.filter(i => i.type === 'h2b')).toHaveLength(1);
    }
  });
  it('MCQs: 4 options, the answer is one of them, and it is not the longest most of the time', () => {
    let longest = 0;
    for (const q of PLENARY_POOL) {
      expect(q.opts).toHaveLength(4);
      expect(q.opts.map(o => o[0])).toContain(q.a);
      const len = k => q.opts.find(o => o[0] === k)[1].length;
      if (q.opts.every(o => len(q.a) > o[1].length || o[0] === q.a)) longest++;
    }
    expect(longest / PLENARY_POOL.length).toBeLessThan(0.5);
  });
  it('option order is shuffled per student, not always in key order', () => {
    const orders = SEEDS.map(s => optionOrder(PLENARY_POOL[0], s, 0).join(''));
    expect(new Set(orders).size).toBeGreaterThan(1);
  });
});

describe('Hex Rush', () => {
  it('a code gives the same questions, never the same one twice running', () => {
    for (let i = 0; i < 40; i++) expect(gameQuestion('HEX1', i)).toEqual(gameQuestion('HEX1', i));
    for (let i = 1; i < 60; i++) {
      const a = gameQuestion('HEX1', i - 1), b = gameQuestion('HEX1', i);
      expect(a.n === b.n && a.type === b.type).toBe(false);
    }
  });
  it('levels grow from nibbles to bytes to both ways', () => {
    expect(gameQuestion('X', 0).type).toBe('nib2h');
    expect(gameQuestion('X', GAME_LEVELS[1].from).type).toBe('h2nib');
    expect(gameQuestion('X', GAME_LEVELS[2].from).type).toBe('b2h');
    expect(gameQuestion('X', GAME_LEVELS[3].from).type).toBe('h2b');
    expect(gameTime(GAME_LEVELS[4].from + 200)).toBe(20);
  });
  it('scoring, ranks, badges and codes', () => {
    expect([0, 3, 6, 10].map(multiplier)).toEqual([1, 2, 3, 4]);
    expect(gamePoints(0, 20, 20, 0)).toBe(200);
    expect(gamePoints(0, 0, 20, 3)).toBe(200);
    expect(rankFor(0)).toBe('Trainee');
    expect(rankFor(6500)).toBe('Hex Hacker');
    const b = runBadges({ played: 30, maxStreak: 6, fast: 5, perfect: true, score: 12000 });
    expect(b).toMatchObject({ first: true, streak5: true, streak10: false, bytes: true, mixed: true, speed: true, perfect: true, score10k: true });
    expect(cleanCode(' hex-7 ')).toBe('HEX7');
  });
});

describe('hover definitions', () => {
  it('every word has a short meaning', () => {
    for (const [, def] of GLOSSARY) expect(def.length).toBeLessThanOrEqual(80);
    expect(glossaryDef('Nibbles')).toBeUndefined();   // the term isn't used with students
    expect(glossaryDef('binary')).toContain('0 and 1');
    expect(glossaryDef('hex')).toBe(glossaryDef('hexadecimal'));
  });
  it('questions about a word never define it', () => {
    for (const id of NO_GLOSS) expect(PLENARY_POOL.some(q => q.id === id)).toBe(true);
  });
  it('TASK_COUNT', () => expect(TASK_COUNT).toBe(6));
});
