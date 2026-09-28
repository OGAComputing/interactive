import { describe, test, expect } from 'vitest';
import { evalInv, isBugFixed, isBugPairLine, IBUG_LINE, IBUG_FIXED_LINE } from './checkers_strings.js';

const code = (lines) => lines.join('\n');
const ran = (src, ok = true) => ({ code: src, ok });

const STARTER = ['print("Hello, World!")', 'print("I am learning Python.")', 'print("This is fun!")'];
const STEP1 = ['print("Hi there!")', ...STARTER.slice(1)];
const STEP3 = ["print('Hi there!')", ...STARTER.slice(1), 'print("Sam")'];

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv step 1 — own greeting', () => {
  test('untouched starter is not accepted', () => expect(evalInv(1, code(STARTER)).pass).toBe(false));
  test('a changed greeting passes', () => expect(evalInv(1, code(STEP1)).pass).toBe(true));
  test('deleting line 1 is not accepted', () => expect(evalInv(1, code(STARTER.slice(1))).pass).toBe(false));
});

describe('evalInv step 2 — a 4th print()', () => {
  test('three prints are not enough', () => expect(evalInv(2, code(STEP1)).pass).toBe(false));
  test('a 4th print passes', () => expect(evalInv(2, code([...STEP1, 'print("Sam")'])).pass).toBe(true));
  test('an empty print() does not count as the 4th', () => expect(evalInv(2, code([...STEP1, 'print()'])).pass).toBe(false));
});

describe('evalInv step 3 — single quotes', () => {
  test('double quotes only fails', () => expect(evalInv(3, code([...STEP1, 'print("Sam")'])).pass).toBe(false));
  test('one single-quoted print passes', () => expect(evalInv(3, code(STEP3)).pass).toBe(true));
});

describe('evalInv step 4 — Break it (missing quote)', () => {
  const fixed = code([...STEP3, IBUG_FIXED_LINE]);
  const broken = code([...STEP3, IBUG_LINE]);

  test('nothing ticks before Break it', () => expect(evalInv(4, code(STEP3)).results).toEqual([false, false]));
  test('still broken: first bullet only', () => {
    const r = evalInv(4, broken, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/missing "/);
  });
  test('fixed and run passes', () => expect(evalInv(4, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true));
  test('deleting the broken line is not a fix', () => {
    const r = evalInv(4, code(STEP3), { breaks: 1, lastRun: ran(code(STEP3)) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });
  test('single-quote fix counts too', () => {
    const src = code([...STEP3, "print('Debugging is normal!')"]);
    expect(evalInv(4, src, { breaks: 1, lastRun: ran(src) }).pass).toBe(true);
  });
});

describe('evalInv step 5 — empty print() between lines', () => {
  test('at the very end fails', () => expect(evalInv(5, code([...STEP3, 'print()'])).pass).toBe(false));
  test('between two lines passes', () => {
    expect(evalInv(5, code([STEP3[0], 'print()', ...STEP3.slice(1)])).pass).toBe(true);
  });
});

test('bug helpers', () => {
  expect(isBugFixed(IBUG_FIXED_LINE)).toBe(true);
  expect(isBugFixed(IBUG_LINE)).toBe(false);
  expect(isBugPairLine(IBUG_LINE)).toBe(true);
  expect(isBugPairLine('print("Hi")')).toBe(false);
});
