import { describe, test, expect } from 'vitest';
import { evalInv, isBugFixed, isBugPairLine, breakCode, IBUG_LINE, IBUG_FIXED_LINE } from './checkers_strings.js';

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

describe('step 4 near-miss — quote added after the )', () => {
  // Runs fine (prints a stray ")"), so it must get a "Nearly!" hint, not "the line has gone".
  const nearMiss = code([...STEP3, 'print("Debugging is normal!)")']);

  test('is not accepted, with a hint that says where the " goes', () => {
    const r = evalInv(4, nearMiss, { breaks: 1, lastRun: ran(nearMiss) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Nearly!/);
    expect(r.msg).not.toMatch(/has gone/);
  });

  test('Break it turns it back into the broken line in place', () => {
    const { code: out, lineNo } = breakCode(nearMiss);
    expect(out.split('\n')[STEP3.length]).toBe(IBUG_LINE);
    expect(lineNo).toBe(STEP3.length + 1);
    expect(out.split('\n').filter(l => l.includes('Debugging')).length).toBe(1);
  });
});

describe('breakCode', () => {
  test('appends the broken line when there is none', () => {
    const { code: out, lineNo } = breakCode(code(STEP3));
    expect(out).toBe(code([...STEP3, IBUG_LINE]) + '\n');
    expect(lineNo).toBe(STEP3.length + 1);
  });
  test('breaks a fixed line in place, whatever its spacing / quotes', () => {
    for (const fix of [IBUG_FIXED_LINE, "print( 'Debugging is normal!' )"]) {
      const { code: out, lineNo } = breakCode(code([STEP3[0], fix, ...STEP3.slice(1)]));
      expect(out.split('\n')[1]).toBe(IBUG_LINE);
      expect(lineNo).toBe(2);
    }
  });
  test('leaves an already-broken line alone (safe to mash)', () => {
    const broken = code([...STEP3, IBUG_LINE]) + '\n';
    expect(breakCode(broken).code).toBe(broken);
    expect(breakCode(breakCode(broken).code).code).toBe(broken);
  });
});

test('bug helpers', () => {
  expect(isBugFixed(IBUG_FIXED_LINE)).toBe(true);
  expect(isBugFixed(IBUG_LINE)).toBe(false);
  expect(isBugPairLine(IBUG_LINE)).toBe(true);
  expect(isBugPairLine('print("Hi")')).toBe(false);
});
