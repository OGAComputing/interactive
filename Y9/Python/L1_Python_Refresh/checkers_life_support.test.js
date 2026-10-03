import { describe, test, expect } from 'vitest';
import { evalInv, evalMod, evalMake, evalExt, breakCode, hasBugLine, hasFixedLine, isBugFixed, isBugPairLine,
         IBUG_LINE, IBUG_FIXED_LINE, MOD_INPUTS, MAKE_INPUTS } from './checkers_life_support.js';

const code = (...lines) => lines.join('\n');
const out  = (...lines) => lines.join('\n') + '\n';

const STARTER = [
  'name = input("Enter your name: ")',
  'hours = int(input("Hours until rescue: "))',
  'oxygen = hours * 50',
  'print("Engineer " + name + " is awake.")',
  'print("Oxygen needed in litres:")',
  'print(oxygen)',
];
const withLine = (i, line) => STARTER.map((l, k) => (k === i ? line : l));
const ran = (src, ok = true) => ({ code: src, ok });

test('test answers match the values the checkers expect', () => {
  expect(MOD_INPUTS.mod1).toEqual(['Riley', '6', '3']);
  expect(MOD_INPUTS.mod4).toEqual(['Riley', '6', '3']);
  expect(MAKE_INPUTS.every(v => /^\d+$/.test(v))).toBe(true);
});

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv step 1 — delete int()', () => {
  test('hours = input(...) passes; still cast fails with a hint', () => {
    expect(evalInv(1, code(...withLine(1, 'hours = input("Hours left? ")'))).pass).toBe(true);
    const r = evalInv(1, code(...STARTER));
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/still has int\(/);
  });
  test('casting on a later line still counts as cast', () => {
    expect(evalInv(1, code(...withLine(1, 'hours = input("Hours left? ")'), 'hours = int(hours)')).pass).toBe(false);
  });
});

describe('evalInv step 2 — int() back on line 2', () => {
  test('uncast fails, cast passes (either way of casting)', () => {
    expect(evalInv(2, code(...withLine(1, 'hours = input("Hours left? ")'))).pass).toBe(false);
    expect(evalInv(2, code(...STARTER)).pass).toBe(true);
    expect(evalInv(2, code(...withLine(1, 'hours = input("Hours left? ")'), 'hours = int(hours)')).pass).toBe(true);
  });
});

describe('evalInv step 3 — Break it, fix with str()', () => {
  const broken = code(...STARTER, IBUG_LINE);
  const fixed  = code(...STARTER, IBUG_FIXED_LINE);

  test('needs a Break it press, then a fixed line that has been run', () => {
    expect(evalInv(3, code(...STARTER)).results).toEqual([false, false]);
    expect(evalInv(3, broken, { breaks: 1, lastRun: ran(broken, false) }).results).toEqual([true, false]);
    expect(evalInv(3, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
  });
  test('fixed but not yet run asks for a run', () => {
    const r = evalInv(3, fixed, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Run code/);
  });
  test('deleting the broken line instead of fixing it is not accepted', () => {
    const src = code(...STARTER);
    const r = evalInv(3, src, { breaks: 1, lastRun: ran(src) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });
  test('a working near-miss gets a "Nearly!" hint, not "has gone"', () => {
    const src = code(...STARTER, 'print("Oxygen per hour: " + "50")');
    const r = evalInv(3, src, { breaks: 1, lastRun: ran(src) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/^Nearly!/);
  });
});

describe('bug-pair helpers', () => {
  test('broken and fixed lines are recognised loosely', () => {
    expect(hasBugLine("print('Oxygen per hour:' + 50)")).toBe(true);
    expect(hasFixedLine('print( "Oxygen per hour: "+str( 50 ) )')).toBe(true);
    expect(isBugFixed(code(...STARTER, IBUG_FIXED_LINE))).toBe(true);
    expect(isBugFixed(code(...STARTER))).toBe(false);
    expect(isBugPairLine(IBUG_LINE) && isBugPairLine(IBUG_FIXED_LINE)).toBe(true);
    expect(isBugPairLine('print(oxygen)')).toBe(false);
  });
  test('breakCode appends the line once, re-breaks a fix in place, and is safe to mash', () => {
    const a = breakCode(code(...STARTER));
    expect(a.lineNo).toBe(7);
    expect(a.code.trim().split('\n').pop()).toBe(IBUG_LINE);
    expect(breakCode(a.code).code).toBe(a.code);
    const b = breakCode(code(...STARTER, IBUG_FIXED_LINE));
    expect(b.lineNo).toBe(7);
    expect(hasBugLine(b.code) && !hasFixedLine(b.code)).toBe(true);
    const c = breakCode(code(...STARTER, 'print("Oxygen per hour:", 50)'));
    expect(c.code.split('\n').filter(l => /Oxygen per hour/.test(l))).toHaveLength(1);
  });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

const ECHO = ['Enter your name: Riley', 'Hours until rescue: 6'];

describe('Modify 1 — rate 60', () => {
  test('passes on 360 in the output', () => {
    const src = code(...withLine(2, 'oxygen = hours * 60'));
    expect(evalMod('mod1', src, out(...ECHO, 'Engineer Riley is awake.', 'Oxygen needed in litres:', '360')).pass).toBe(true);
  });
  test('the original 300 fails', () => {
    expect(evalMod('mod1', code(...STARTER), out(...ECHO, 'Engineer Riley is awake.', 'Oxygen needed in litres:', '300')).pass).toBe(false);
  });
});

const MOD2 = [...withLine(2, 'oxygen = hours * 60'), 'crew = int(input("Crew awake: "))', 'print(crew)'];
const ECHO3 = [...ECHO, 'Crew awake: 3'];

describe('Modify 2 — crew question', () => {
  test('a cast third question that is printed passes, any variable name', () => {
    expect(evalMod('mod2', code(...MOD2)).pass).toBe(true);
    expect(evalMod('mod2', code(...withLine(2, 'oxygen = hours * 60'), 'awake = int(input("Awake? "))', 'print("Crew:", awake)')).pass).toBe(true);
  });
  test('an uncast question fails on the first bullet', () => {
    const r = evalMod('mod2', code(...STARTER, 'crew = input("Crew awake: ")', 'print(crew)'));
    expect(r.results).toEqual([false, true]);
  });
  test('a question that is never printed fails on the second bullet', () => {
    expect(evalMod('mod2', code(...STARTER, 'crew = int(input("Crew awake: "))')).results).toEqual([true, false]);
  });
});

describe('Modify 3 — crew total', () => {
  test('1080 (or 900 at the old rate) passes, stored or printed directly', () => {
    expect(evalMod('mod3', code(...MOD2, 'total = hours * crew * 60', 'print(total)'), out(...ECHO3, '1080')).pass).toBe(true);
    expect(evalMod('mod3', code(...MOD2, 'print(crew * hours * 50)'), out(...ECHO3, '900')).pass).toBe(true);
  });
  test('without the crew total in the output it fails', () => {
    expect(evalMod('mod3', code(...MOD2), out(...ECHO3, '360', '3')).pass).toBe(false);
  });
});

describe('Modify 4 — sentence with str()', () => {
  const base = [...MOD2, 'total = hours * crew * 60'];
  test('str() sentence with the total passes', () => {
    const src = code(...base, 'print("Total oxygen: " + str(total) + " litres")');
    expect(evalMod('mod4', src, out(...ECHO3, 'Total oxygen: 1080 litres')).pass).toBe(true);
  });
  test('commas instead of str() fail the first bullet', () => {
    const src = code(...base, 'print("Total oxygen:", total)');
    expect(evalMod('mod4', src, out(...ECHO3, 'Total oxygen: 1080')).results).toEqual([false, true]);
  });
  test('a str() sentence about the wrong number fails the second bullet', () => {
    const src = code(...base, 'print("Crew: " + str(crew))');
    expect(evalMod('mod4', src, out(...ECHO3, 'Crew: 3')).results).toEqual([true, false]);
  });
});

// ─── Make + Extension ────────────────────────────────────────────────────────

const MAKE_GOOD = [
  'cans = int(input("Oxygen canisters: "))',
  'packs = int(input("Ration packs: "))',
  'air = cans * 8',
  'food = packs * 12',
  'print("SUPPLY MANIFEST")',
  'print("Oxygen lasts " + str(air) + " hours")',
  'print("Food lasts " + str(food) + " hours")',
];
const MAKE_OUT = out('Oxygen canisters: 4', 'Ration packs: 5', 'SUPPLY MANIFEST', 'Oxygen lasts 32 hours', 'Food lasts 60 hours');

describe('Make — supply manifest', () => {
  test('a complete manifest passes', () => {
    expect(evalMake(code(...MAKE_GOOD), MAKE_OUT).pass).toBe(true);
  });
  test('a calculation done inside the print still counts', () => {
    const src = code('a = int(input("A? "))', 'b = int(input("B? "))', 'print("Total: " + str(a + b))', 'print("-")', 'print("end")');
    expect(evalMake(src, out('A? 4', 'B? 5', 'Total: 9', '-', 'end')).pass).toBe(true);
  });
  test('joining text with + and str() is not mistaken for a calculation', () => {
    const src = code('a = int(input("A? "))', 'b = int(input("B? "))', 'print("A: " + str(a))', 'print("B: " + str(b))', 'print("done")');
    expect(evalMake(src, out('A? 4', 'B? 5', 'A: 4', 'B: 5', 'done')).results[2]).toBe(false);
  });
  test('only the questions echoed back is not 3 lines of manifest', () => {
    const src = code(...MAKE_GOOD.slice(0, 4), 'print("Oxygen lasts " + str(air))');
    expect(evalMake(src, out('Oxygen canisters: 4', 'Ration packs: 5', 'Oxygen lasts 32')).results[4]).toBe(false);
  });
  test('uncast answers fail the int() bullet', () => {
    const src = code('a = input("A? ")', 'b = input("B? ")', 'print(a + b)');
    expect(evalMake(src, out('A? 4', 'B? 5', '45')).results[1]).toBe(false);
  });
});

describe('Extension — full manifest', () => {
  test('third supply + a two-number str() line passes', () => {
    const src = code(...MAKE_GOOD, 'cells = int(input("Battery cells: "))',
      'print("Canisters: " + str(cans) + ", cells: " + str(cells))');
    expect(evalExt(src).pass).toBe(true);
  });
  test('only one str() in the summary line fails', () => {
    const src = code(...MAKE_GOOD, 'cells = int(input("Battery cells: "))', 'print("Cells: " + str(cells))');
    expect(evalExt(src).results).toEqual([true, false]);
  });
});
