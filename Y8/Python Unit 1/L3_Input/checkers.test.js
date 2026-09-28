import { describe, test, expect } from 'vitest';
import { evalMod, evalMake, evalExt, nonQuestionPrompts, evalInv, isBugFixed, IBUG_LINE, IBUG_FIXED_LINE } from './checkers.js';

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
  // Five questions with sensible variable names, reused by several tests below.
  const ask5 = [
    'name = input("Player name? ")',
    'game = input("Favourite game? ")',
    'score = input("Best score? ")',
    'team = input("Team name? ")',
    'motto = input("Your motto? ")',
  ];

  test('passes a multi-line player card that prints every answer', () => {
    const r = evalExt(code([
      ...ask5,
      'print("==== PLAYER CARD ====")',
      'print("Name: " + name)',
      'print(name + " plays " + game + " for " + team)',
      'print("Best score: " + score)',
      'print("Motto: " + motto)',
    ]));
    expect(r.results).toEqual([true, true, true]);
    expect(r.pass).toBe(true);
  });

  test('passes a mad-libs story built in ONE print() (no particular line count required)', () => {
    const r = evalExt(code([
      'hero = input("A name? ")',
      'place = input("A place? ")',
      'animal = input("An animal? ")',
      'food = input("A food? ")',
      'adj = input("An adjective? ")',
      'print(hero + " went to " + place + " and met a " + adj + " " + animal + " who loved " + food + ".")',
    ]));
    expect(r.pass).toBe(true);
  });

  test('passes a chatbot that prints between the questions', () => {
    const r = evalExt(code([
      'print("Hi, I am Botty!")',
      'name = input("What is your name? ")',
      'print("Nice to meet you, " + name)',
      'hobby = input("What do you do for fun? ")',
      'print(hobby + " sounds great!")',
      'pet = input("Do you have a pet? ")',
      'print("Tell " + pet + " I said hi")',
      'food = input("Favourite food? ")',
      'print("Yum, " + food)',
      'day = input("Best day of the week? ")',
      'print(name + " loves " + day)',
    ]));
    expect(r.pass).toBe(true);
  });

  test('is not tied to any variable names', () => {
    const r = evalExt(code([
      'a = input("1? ")', 'b = input("2? ")', 'c = input("3? ")', 'd = input("4? ")', 'e = input("5? ")',
      'print(a + b + " and " + c + d + e)',
    ]));
    expect(r.pass).toBe(true);
  });

  test('fails with only four questions', () => {
    const r = evalExt(code([
      'a = input("1? ")', 'b = input("2? ")', 'c = input("3? ")', 'd = input("4? ")',
      'print(a + " and " + b + " and " + c + " and " + d)',
    ]));
    expect(r.results).toEqual([false, true, true]);
    expect(r.pass).toBe(false);
  });

  test('five input() calls that reuse one variable name only count once', () => {
    const r = evalExt(code([
      'x = input("1? ")', 'x = input("2? ")', 'x = input("3? ")', 'x = input("4? ")', 'x = input("5? ")',
      'print("You said " + x + "!")',
    ]));
    expect(r.results[0]).toBe(false);
  });

  test('fails when one answer is never printed', () => {
    const r = evalExt(code([
      ...ask5,
      'print(name + " plays " + game + " for " + team)',
      'print("Best score: " + score)',
      // motto is asked but never used
    ]));
    expect(r.results).toEqual([true, false, true]);
    expect(r.pass).toBe(false);
  });

  test('a variable name that only appears inside a string does not count as printed', () => {
    const r = evalExt(code([
      ...ask5,
      'print(name + " plays " + game + " for " + team)',
      'print("Best score: " + score)',
      'print("motto")',
    ]));
    expect(r.results[1]).toBe(false);
  });

  test('fails when no print() joins two answers with own words', () => {
    const r = evalExt(code([
      ...ask5,
      'print(name)', 'print(game)', 'print(score)', 'print(team)', 'print(motto)',
    ]));
    expect(r.results).toEqual([true, true, false]);
  });

  test('joining two answers with + but no words of your own does not pass the third check', () => {
    const r = evalExt(code([
      ...ask5,
      'print(name + game + score + team + motto)',
    ]));
    expect(r.results).toEqual([true, true, false]);
  });

  test('single-quoted strings count as words of your own', () => {
    const r = evalExt(code([
      ...ask5,
      "print(name + ' plays ' + game + team + score + motto)",
    ]));
    expect(r.pass).toBe(true);
  });

  test('commented-out questions do not count', () => {
    const r = evalExt(code([
      ...ask5.slice(0, 4),
      '# motto = input("Your motto? ")',
      'print(name + " plays " + game + " for " + team + score)',
    ]));
    expect(r.results[0]).toBe(false);
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

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv', () => {
  const ran = (src, ok = true) => ({ code: src, ok });
  const STARTER = ['name = input("What is your name? ")', 'greeting = "Hello "', IBUG_FIXED_LINE];
  const STEP1 = ['name = input("Enter your name: ")', ...STARTER.slice(1)];

  test('step 1: the input() message must change', () => {
    expect(evalInv(1, code(STARTER)).pass).toBe(false);
    expect(evalInv(1, code(STEP1)).pass).toBe(true);
    expect(evalInv(1, code(STARTER.slice(1))).pass).toBe(false);   // deleted line 1
  });

  test('step 2 has no code change, so it always passes', () => {
    expect(evalInv(2, code(STEP1))).toEqual({ results: [], pass: true, msg: null });
  });

  test('step 3: broken, fixed, renamed and deleted', () => {
    const broken = code([...STEP1.slice(0, 2), IBUG_LINE]);
    const fixed = code(STEP1);
    expect(evalInv(3, fixed, { lastRun: ran(fixed) }).results).toEqual([false, false]);   // Break it not pressed
    expect(evalInv(3, broken, { breaks: 1, lastRun: ran(broken, false) }).results).toEqual([true, false]);
    expect(evalInv(3, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
    const renamed = code(['fullname = input("Enter your name: ")', 'greeting = "Hello "', IBUG_LINE]);
    expect(isBugFixed(renamed)).toBe(true);
    expect(evalInv(3, renamed, { breaks: 1, lastRun: ran(renamed) }).pass).toBe(true);
    const deleted = code(STEP1.slice(0, 2));
    const r = evalInv(3, deleted, { breaks: 1, lastRun: ran(deleted) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });
});
