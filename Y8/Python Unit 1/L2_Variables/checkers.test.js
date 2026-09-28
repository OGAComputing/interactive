import { describe, test, expect } from 'vitest';
import { evalInv, isBugFixed, breakCode, IBUG_LINE } from './checkers.js';

const code = (lines) => lines.join('\n');
const ran = (src, ok = true) => ({ code: src, ok });

const STARTER = ['name = "Sam"', 'greeting = "Hello "', 'print(greeting + name + ", welcome to Python!")'];
const STEP1 = ['name = "Priya"', ...STARTER.slice(1)];
const STEP2 = ['name = "Priya"', 'greeting = "Hi there, "', STARTER[2]];
const STEP3 = [...STEP2, 'name = "Jordan"', 'print(name)'];

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv step 1 — your own name', () => {
  test('still "Sam" fails', () => expect(evalInv(1, code(STARTER)).pass).toBe(false));
  test('the hint tells a student really called Sam what to do', () => {
    expect(evalInv(1, code(STARTER)).msg).toMatch(/If your name IS Sam/);
  });
  test('a new name passes', () => expect(evalInv(1, code(STEP1)).pass).toBe(true));
  test('deleting line 1 fails', () => expect(evalInv(1, code(STARTER.slice(1))).pass).toBe(false));
});

describe('evalInv step 2 — new greeting', () => {
  test('still "Hello " fails', () => expect(evalInv(2, code(STEP1)).pass).toBe(false));
  test('"Hi there, " passes', () => expect(evalInv(2, code(STEP2)).pass).toBe(true));
});

describe('evalInv step 3 — reassign then print', () => {
  test('nothing added ticks nothing', () => expect(evalInv(3, code(STEP2)).results).toEqual([false, false]));
  test('reassigned but not printed', () => expect(evalInv(3, code([...STEP2, 'name = "Jordan"'])).results).toEqual([true, false]));
  test('print before the reassignment does not count', () => {
    expect(evalInv(3, code([...STEP2, 'print(name)', 'name = "Jordan"'])).results).toEqual([true, false]);
  });
  test('reassign then print passes', () => expect(evalInv(3, code(STEP3)).pass).toBe(true));
});

describe('evalInv step 4 — Break it (NameError)', () => {
  const clean = code(STEP3);
  const broken = code([...STEP3, IBUG_LINE]);

  test('nothing ticks before Break it', () => expect(evalInv(4, clean, { lastRun: ran(clean) }).results).toEqual([false, false]));
  test('still broken: first bullet only', () => {
    const r = evalInv(4, broken, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/Delete the broken/);
  });
  test('deleting the line and running passes (that IS the fix here)', () => {
    expect(evalInv(4, clean, { breaks: 1, lastRun: ran(clean) }).pass).toBe(true);
  });
  test('deleted but not yet run does not pass', () => {
    expect(evalInv(4, clean, { breaks: 1, lastRun: ran(broken, false) }).pass).toBe(false);
  });
  test('creating a nickname variable is also a valid fix', () => {
    const src = code([...STEP3, 'nickname = "Jo"', IBUG_LINE]);
    expect(isBugFixed(src)).toBe(true);
    expect(evalInv(4, src, { breaks: 1, lastRun: ran(src) }).pass).toBe(true);
  });
  test('commenting the line out counts as removing it', () => {
    const src = code([...STEP3, '# ' + IBUG_LINE]);
    expect(evalInv(4, src, { breaks: 1, lastRun: ran(src) }).pass).toBe(true);
  });
});

describe('breakCode', () => {
  test('appends the broken line and reports its line number', () => {
    expect(breakCode(code(STEP3))).toEqual({ code: code([...STEP3, IBUG_LINE]) + '\n', lineNo: STEP3.length + 1 });
  });
  test('leaves a live broken line alone (safe to mash)', () => {
    const broken = code([...STEP3, IBUG_LINE]) + '\n';
    expect(breakCode(broken).code).toBe(broken);
  });
  test('a commented-out copy does not stop Break it adding a live one', () => {
    const src = code([...STEP3, '# ' + IBUG_LINE]);
    expect(breakCode(src)).toEqual({ code: code([...STEP3, '# ' + IBUG_LINE, IBUG_LINE]) + '\n', lineNo: STEP3.length + 2 });
  });
});
