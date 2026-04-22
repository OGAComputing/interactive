import { describe, test, expect } from 'vitest';
import { normalise, has, MOD_CHECKS, validateMake, validateExt } from './checkers.js';

// ─── normalise ────────────────────────────────────────────────────────────────

describe('normalise', () => {
  test('strips line comments', () => {
    expect(normalise('x = 1  # a comment')).not.toContain('#');
  });
  test('replaces string contents with placeholder', () => {
    expect(normalise('print("Hello!")')).toBe('print("…")');
  });
  test('lowercases everything', () => {
    expect(normalise('DEF Greet():')).toContain('def greet():');
  });
  test('collapses whitespace', () => {
    expect(normalise('def  foo (  )')).toBe('def foo ( )');
  });
});

// ─── MOD_CHECKS.mod1 ─────────────────────────────────────────────────────────

describe('MOD_CHECKS.mod1', () => {
  const code = (lines) => lines.join('\n');

  test('passes when correctly renamed with farewell kept', () => {
    const r = MOD_CHECKS.mod1(code([
      'def hello():',
      '    print("Hello!")',
      'def farewell():',
      '    print("Goodbye!")',
      'hello()',
      'farewell()',
    ]));
    expect(r.pass).toBe(true);
  });

  test('fails when greet not renamed', () => {
    const r = MOD_CHECKS.mod1(code([
      'def greet():',
      '    print("Hello!")',
      'def farewell():',
      '    print("Goodbye!")',
      'greet()',
      'farewell()',
    ]));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('hello');
  });

  test('fails when hello call is missing', () => {
    const r = MOD_CHECKS.mod1(code([
      'def hello():',
      '    print("Hello!")',
      'def farewell():',
      '    print("Goodbye!")',
      'farewell()',
    ]));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('call');
  });

  test('fails when farewell is removed', () => {
    const r = MOD_CHECKS.mod1(code([
      'def hello():',
      '    print("Hello!")',
      'hello()',
    ]));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('farewell');
  });
});

// ─── MOD_CHECKS.mod2 ─────────────────────────────────────────────────────────

describe('MOD_CHECKS.mod2', () => {
  test('passes with hello and a print', () => {
    const r = MOD_CHECKS.mod2('def hello():\n    print("Custom message")\nhello()');
    expect(r.pass).toBe(true);
  });

  test('passes with old greet name (mod2 does not require rename)', () => {
    const r = MOD_CHECKS.mod2('def greet():\n    print("Hi")\ngreet()');
    expect(r.pass).toBe(true);
  });

  test('fails when no function defined', () => {
    const r = MOD_CHECKS.mod2('print("Hi")');
    expect(r.pass).toBe(false);
  });

  test('fails when print is missing', () => {
    const r = MOD_CHECKS.mod2('def hello():\n    pass\nhello()');
    expect(r.pass).toBe(false);
  });
});

// ─── MOD_CHECKS.mod3 ─────────────────────────────────────────────────────────

describe('MOD_CHECKS.mod3', () => {
  test('passes when farewell renamed to say_goodbye', () => {
    const r = MOD_CHECKS.mod3(
      'def hello():\n    print("Hi")\ndef say_goodbye():\n    print("Bye")\nhello()\nsay_goodbye()'
    );
    expect(r.pass).toBe(true);
  });

  test('fails when farewell not renamed', () => {
    const r = MOD_CHECKS.mod3(
      'def hello():\n    print("Hi")\ndef farewell():\n    print("Bye")\nhello()\nfarewell()'
    );
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('say_goodbye');
  });

  test('fails when say_goodbye call is missing', () => {
    const r = MOD_CHECKS.mod3(
      'def hello():\n    print("Hi")\ndef say_goodbye():\n    print("Bye")\nhello()'
    );
    expect(r.pass).toBe(false);
  });
});

// ─── MOD_CHECKS.mod4 ─────────────────────────────────────────────────────────

describe('MOD_CHECKS.mod4', () => {
  test('passes when print_line defined and called', () => {
    const r = MOD_CHECKS.mod4([
      'def print_line():',
      '    print("----------")',
      'def hello():',
      '    print_line()',
      '    print("Hello!")',
      '    print_line()',
      'def say_goodbye():',
      '    print("Goodbye!")',
      'hello()',
      'say_goodbye()',
    ].join('\n'));
    expect(r.pass).toBe(true);
  });

  test('fails when print_line not defined', () => {
    const r = MOD_CHECKS.mod4('def hello():\n    print("Hi")\nhello()');
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('print_line');
  });

  test('fails when print_line defined but never called', () => {
    const r = MOD_CHECKS.mod4(
      'def print_line():\n    print("---")\ndef hello():\n    print("Hi")\nhello()'
    );
    expect(r.pass).toBe(false);
  });
});

// ─── validateMake ─────────────────────────────────────────────────────────────

const VALID_MAKE = `
def show_menu():
    print("Animal Fact Finder")
    print("1. Dog  2. Cat  3. Rabbit")

def dog_facts():
    print("Dogs are loyal.")
    print("Dogs can bark.")

def cat_facts():
    print("Cats purr.")
    print("Cats sleep a lot.")

def rabbit_facts():
    print("Rabbits hop.")
    print("Rabbits eat plants.")

def show_goodbye():
    print("Thanks for using Animal Fact Finder!")

show_menu()
choice = input("Enter 1, 2 or 3: ")
if choice == "1":
    dog_facts()
elif choice == "2":
    cat_facts()
elif choice == "3":
    rabbit_facts()
else:
    print("Sorry, that's not a valid option.")
show_goodbye()
`.trim();

describe('validateMake', () => {
  test('passes a complete valid program', () => {
    const r = validateMake(VALID_MAKE);
    expect(r.pass).toBe(true);
  });

  test('fails when program is empty', () => {
    expect(validateMake('').pass).toBe(false);
  });

  test('fails when fewer than 5 functions defined', () => {
    const r = validateMake(
      'def show_menu(): print("Menu")\nchoice = input("Enter: ")\nif choice == "1": pass\nelif choice == "2": pass\nelse: print("Sorry, that\'s not a valid option.")'
    );
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('5 function');
  });

  test('fails when input() is missing', () => {
    const noInput = VALID_MAKE.replace('input("Enter 1, 2 or 3: ")', '"1"');
    const r = validateMake(noInput);
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('input()');
  });

  test('fails when show_menu is missing', () => {
    const r = validateMake(VALID_MAKE.replace('def show_menu', 'def start_menu'));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('show_menu');
  });

  test('fails when show_goodbye is missing', () => {
    const r = validateMake(VALID_MAKE.replace('def show_goodbye', 'def end_program'));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('show_goodbye');
  });

  test('fails when else branch is missing', () => {
    const noElse = VALID_MAKE
      .split('\n')
      .filter(l => !l.startsWith('else:') && !l.includes("Sorry, that"))
      .join('\n');
    const r = validateMake(noElse);
    expect(r.pass).toBe(false);
  });
});

// ─── validateExt ─────────────────────────────────────────────────────────────

const VALID_EXT = `
def show_menu():
    print("1. Dog  2. Cat  3. Rabbit  4. Quit")

def dog_facts():
    print("Dogs are loyal.")

def cat_facts():
    print("Cats purr.")

def rabbit_facts():
    print("Rabbits hop.")

def show_goodbye():
    print("Goodbye!")

while True:
    show_menu()
    choice = input("Enter 1-4: ")
    if choice == "1":
        dog_facts()
    elif choice == "4":
        show_goodbye()
        break
    else:
        print("Sorry, that's not a valid option.")
`.trim();

describe('validateExt', () => {
  test('passes with while loop and break', () => {
    expect(validateExt(VALID_EXT).pass).toBe(true);
  });

  test('fails when program is too short', () => {
    expect(validateExt('while True: pass').pass).toBe(false);
  });

  test('fails when while loop is missing', () => {
    const r = validateExt(VALID_EXT.replace('while True:', 'if True:'));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('while');
  });

  test('fails when break is missing', () => {
    const r = validateExt(VALID_EXT.replace('break', 'pass'));
    expect(r.pass).toBe(false);
    expect(r.msg).toContain('break');
  });
});
