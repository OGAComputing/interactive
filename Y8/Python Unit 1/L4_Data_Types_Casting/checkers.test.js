import { describe, test, expect } from 'vitest';
import { evalMod, evalMake, evalExt, MOD_INPUTS, MAKE_INPUTS, EXT_STEP_COUNT } from './checkers.js';

const code = (lines) => lines.join('\n');

// The Investigate stage leaves the student with this — Modify builds on it.
const INVESTIGATE_END = [
  'a = int(input("Enter first number: "))',
  'b = int(input("Enter second number: "))',
  'print(a + b)',
  '',
  'c = 5',
  'd = 5',
  'print(c + d)',
];
// What that program prints with the Modify test numbers (prompts echo the typed value).
const BASE_OUT = ['Enter first number: 9', 'Enter second number: 5', '14', '10'];
const out = (...lines) => lines.join('\n') + '\n';

test('test numbers match the values the checkers expect', () => {
  expect(MOD_INPUTS.mod1).toEqual(['9', '5', '7', '2.5']);
  expect(MAKE_INPUTS).toEqual(['8', '2']);
  expect(EXT_STEP_COUNT).toBe(5);
});

// ─── Modify ──────────────────────────────────────────────────────────────────

describe('evalMod', () => {
  test('mod1 passes print(a - b)', () => {
    const r = evalMod('mod1', code([...INVESTIGATE_END, 'print(a - b)']), out(...BASE_OUT, '4'));
    expect(r.pass).toBe(true);
  });

  test('mod1 passes b - a and a stored difference (any valid shape)', () => {
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'print(b - a)']), out(...BASE_OUT, '-4')).pass).toBe(true);
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'diff = a - b', 'print("Difference: " + str(diff))']),
      out(...BASE_OUT, 'Difference: 4')).pass).toBe(true);
  });

  test('mod1 fails when nothing is subtracted', () => {
    expect(evalMod('mod1', code([...INVESTIGATE_END, 'print(4)']), out(...BASE_OUT, '4')).pass).toBe(false);
  });

  test('mod2 accepts casting on a separate line and a stored total', () => {
    const r = evalMod('mod2', code([...INVESTIGATE_END,
      'e = input("Third? ")', 'e = int(e)', 'total = a + b + e', 'print(total)']),
      out(...BASE_OUT, 'Third? 7', '21'));
    expect(r.results).toEqual([true, true]);
  });

  test('mod2 fails when the third number is never cast', () => {
    const r = evalMod('mod2', code([...INVESTIGATE_END, 'e = input("Third? ")', 'print(e)']),
      out(...BASE_OUT, 'Third? 7', '7'));
    expect(r.results).toEqual([false, false]);
  });

  test('mod3 passes the bracketed average, fails the precedence mistake', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))', 'print(a + b + e)'];
    expect(evalMod('mod3', code([...base, 'print((a + b + e) / 3)']),
      out(...BASE_OUT, 'Third? 7', '21', '7.0')).pass).toBe(true);
    expect(evalMod('mod3', code([...base, 'print(a + b + e / 3)']),
      out(...BASE_OUT, 'Third? 7', '21', '16.333333333333332')).pass).toBe(false);
  });

  test('mod3 does not mistake the typed test number 7 for the average', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))', 'print(a + b + e)', 'print(21 / 3)'];
    expect(evalMod('mod3', code(base), out(...BASE_OUT, 'Third? 7', '21')).pass).toBe(false);
  });

  test('mod4 needs a genuinely new float() question, not a re-cast third number', () => {
    const base = [...INVESTIGATE_END, 'e = int(input("Third? "))'];
    const good = evalMod('mod4', code([...base, 'f = float(input("Decimal? "))', 'print(a + b + e + f)']),
      out(...BASE_OUT, 'Third? 7', 'Decimal? 2.5', '23.5'));
    expect(good.pass).toBe(true);
    const recast = evalMod('mod4', code([...INVESTIGATE_END, 'e = float(input("Third? "))', 'print(a + b + e)']),
      out(...BASE_OUT, 'Third? 7', '21.0'));
    expect(recast.results[0]).toBe(false);
  });
});

// ─── Make ────────────────────────────────────────────────────────────────────

describe('evalMake', () => {
  const makeOut = (...lines) => out('First? 8', 'Second? 2', ...lines);

  test('passes the one-line cast style', () => {
    const r = evalMake(code([
      'x = int(input("First? "))', 'y = int(input("Second? "))',
      'print(x + y)', 'print(x * y)',
    ]), makeOut('10', '16'));
    expect(r.results).toEqual([true, true, true, true]);
  });

  test('passes casting on later lines, float(), and sentences', () => {
    const r = evalMake(code([
      'x = input("First? ")', 'y = input("Second? ")', 'x = float(x)', 'y = float(y)',
      'print("Sum: " + str(x + y))', 'print("Divided: " + str(x / y))',
    ]), makeOut('Sum: 10.0', 'Divided: 4.0'));
    expect(r.pass).toBe(true);
  });

  test('fails when the numbers are joined as text (82) instead of added', () => {
    const r = evalMake(code([
      'x = input("First? ")', 'y = input("Second? ")', 'print(x + y)', 'print(int(x) - int(y))',
    ]), makeOut('82', '6'));
    expect(r.results[2]).toBe(false);
  });

  test('fails with only a sum', () => {
    const r = evalMake(code(['x = int(input("First? "))', 'y = int(input("Second? "))', 'print(x + y)']), makeOut('10'));
    expect(r.results[3]).toBe(false);
  });
});

// ─── Extension challenges ────────────────────────────────────────────────────

const CALC = [
  'pizzas = int(input("How many pizzas? "))',
  'slices = int(input("Slices per pizza? "))',
  'people = int(input("How many people? "))',
  'each = pizzas * slices / people',
];

describe('evalExt', () => {
  test('ext1 passes a three-number calculator using two operators', () => {
    expect(evalExt('ext1', code([...CALC, 'print(each)'])).pass).toBe(true);
  });

  test('ext1 fails with only two numbers', () => {
    const r = evalExt('ext1', code(['a = int(input("A? "))', 'b = int(input("B? "))', 'print(a * b - a)']));
    expect(r.results[0]).toBe(false);
  });

  test('ext2 needs a stored result printed with str() in a sentence', () => {
    expect(evalExt('ext2', code([...CALC, 'print("Everyone gets " + str(each) + " slices")'])).pass).toBe(true);
    expect(evalExt('ext2', code([...CALC, 'print(each)'])).results).toEqual([true, false]);
  });

  test('ext3 needs a printed comparison and an ==', () => {
    expect(evalExt('ext3', code([...CALC, 'print(each > 2)', 'print(pizzas == people)'])).pass).toBe(true);
    expect(evalExt('ext3', code([...CALC, 'print(each > 2)'])).results).toEqual([true, false]);
  });

  test('ext4 needs an if with a comparison and an indented print', () => {
    expect(evalExt('ext4', code([...CALC, 'if each > 3:', '    print("Lots of pizza!")'])).pass).toBe(true);
    expect(evalExt('ext4', code([...CALC, 'if each > 3:', 'print("Lots of pizza!")'])).results).toEqual([true, false]);
    expect(evalExt('ext4', code([...CALC, 'if each > 3', '    print("x")'])).results[0]).toBe(false);
  });

  test('ext4 accepts tab indentation', () => {
    expect(evalExt('ext4', code([...CALC, 'if each >= 3:', '\tprint("Lots!")'])).pass).toBe(true);
  });

  test('ext5 needs else lined up with if, with its own indented print', () => {
    const good = [...CALC, 'if each > 3:', '    print("Lots!")', 'else:', '    print("Order more!")'];
    expect(evalExt('ext5', code(good)).pass).toBe(true);
    const badIndent = [...CALC, 'if each > 3:', '    print("Lots!")', '    else:', '    print("Order more!")'];
    expect(evalExt('ext5', code(badIndent)).results[0]).toBe(false);
    const noBody = [...CALC, 'if each > 3:', '    print("Lots!")', 'else:', 'print("Order more!")'];
    expect(evalExt('ext5', code(noBody)).results).toEqual([true, false]);
  });

  test('comparisons inside strings do not count', () => {
    expect(evalExt('ext3', code([...CALC, 'print("each > 2 == True")'])).pass).toBe(false);
  });
});
