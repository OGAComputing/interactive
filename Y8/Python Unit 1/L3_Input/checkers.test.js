import { describe, test, expect } from 'vitest';
import { evalMod, evalMake, evalExt, nonQuestionPrompts } from './checkers.js';

const code = (lines) => lines.join('\n');

// ─── Make ────────────────────────────────────────────────────────────────────

describe('evalMake', () => {
  test('passes three inputs printed together in ONE print() (regression: needed two prints)', () => {
    const r = evalMake(code([
      'name=input("What is your name")',
      'food=input("What is your fav. food")',
      'drink=input("What is your fav. drink?")',
      'print(drink+food+name)',
    ]));
    expect(r.results).toEqual([true, true, true]);
    expect(r.pass).toBe(true);
  });

  test('passes with three separate print() lines', () => {
    const r = evalMake(code([
      'a = input("Name? ")',
      'b = input("Food? ")',
      'c = input("Drink? ")',
      'print("Hi " + a)',
      'print("You like " + b)',
      'print("and " + c)',
    ]));
    expect(r.pass).toBe(true);
  });

  test('fails when only two answers are printed', () => {
    const r = evalMake(code([
      'a = input("Name? ")',
      'b = input("Food? ")',
      'c = input("Drink? ")',
      'print(a + b)',
    ]));
    expect(r.results).toEqual([true, true, false]);
    expect(r.pass).toBe(false);
  });

  test('fails with fewer than three input() calls', () => {
    const r = evalMake(code(['a = input("Name? ")', 'b = input("Food? ")', 'print(a + b)']));
    expect(r.results[0]).toBe(false);
  });

  test('fails when no + is used in a print()', () => {
    const r = evalMake(code([
      'a = input("Name? ")',
      'b = input("Food? ")',
      'c = input("Drink? ")',
      'print(a)', 'print(b)', 'print(c)',
    ]));
    expect(r.results[1]).toBe(false);
  });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

describe('evalMod', () => {
  test('mod1 passes with a new variable printed on its own', () => {
    const r = evalMod('mod1', code([
      'name = input("What is your name? ")',
      'pet = input("What is your pet called? ")',
      'print(pet)',
    ]));
    expect(r.pass).toBe(true);
  });

  test('mod1 rejects the copied example variable `subject`', () => {
    const r = evalMod('mod1', code([
      'name = input("What is your name? ")',
      'subject = input("Favourite subject? ")',
      'print(subject)',
    ]));
    expect(r.pass).toBe(false);
  });

  test('mod5 needs two answers joined with + in one print()', () => {
    const r = evalMod('mod5', code([
      'name = input("What is your name? ")',
      'pet = input("What is your pet called? ")',
      'print(name + " owns " + pet)',
    ]));
    expect(r.pass).toBe(true);
  });
});

// ─── Extension ───────────────────────────────────────────────────────────────

describe('evalExt', () => {
  test('passes with four inputs and joined output on two lines', () => {
    const r = evalExt(code([
      'a = input("Name? ")', 'b = input("Form? ")', 'c = input("Club? ")', 'd = input("Day? ")',
      'print(a + " is in " + b)',
      'print(c + " meets on " + d)',
    ]));
    expect(r.pass).toBe(true);
  });
});

// ─── nonQuestionPrompts (advisory tip — never affects pass/fail) ─────────────

describe('nonQuestionPrompts', () => {
  test('flags prompts that are not questions', () => {
    expect(nonQuestionPrompts('name = input("What is your name")')).toEqual(['What is your name']);
    expect(nonQuestionPrompts("x = input('Enter a number: ')")).toEqual(['Enter a number:']);
  });

  test('accepts prompts ending in ? even with a trailing space', () => {
    expect(nonQuestionPrompts('name = input("What is your name? ")')).toEqual([]);
  });

  test('ignores commented-out input() calls', () => {
    expect(nonQuestionPrompts('# name = input("nope")\nx = 1')).toEqual([]);
  });

  test('a prompt without ? does not stop a valid Make program passing', () => {
    const r = evalMake(code([
      'a = input("Name")', 'b = input("Food")', 'c = input("Drink")',
      'print(a + b + c)',
    ]));
    expect(r.pass).toBe(true);
  });
});
