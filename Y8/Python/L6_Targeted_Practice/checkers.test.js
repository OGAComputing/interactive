import { describe, test, expect } from 'vitest';
import { CHECKERS, FEEDBACK } from './checkers.js';

// ─── errors_read ──────────────────────────────────────────────────────────────

describe('errors_read_A', () => {
  const fn = CHECKERS.errors_read_A;
  test('accepts "C"', () => expect(fn('C')).toBe(true));
  test('accepts "C" with surrounding whitespace', () => expect(fn('  C  ')).toBe(true));
  test('rejects "A"', () => expect(fn('A')).toBe(false));
  test('rejects "B"', () => expect(fn('B')).toBe(false));
  test('rejects empty string', () => expect(fn('')).toBe(false));
  test('rejects null', () => expect(fn(null)).toBe(false));
});

describe('errors_read_B', () => {
  const fn = CHECKERS.errors_read_B;
  test('accepts "B"', () => expect(fn('B')).toBe(true));
  test('accepts "B" with whitespace', () => expect(fn(' B\n')).toBe(true));
  test('rejects "A"', () => expect(fn('A')).toBe(false));
  test('rejects "C"', () => expect(fn('C')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── errors_fix ───────────────────────────────────────────────────────────────

describe('errors_fix_A', () => {
  const fn = CHECKERS.errors_fix_A;
  const PASS = 'score = 10\nprint(score)';
  test('passes valid code', () => expect(fn(PASS)).toBe(true));
  test('rejects the old underscore variable', () => expect(fn('player_score = 10\nprint(player_score)')).toBe(false));
  test('rejects code without score variable', () => expect(fn('player = "Asha"\nprint(player)')).toBe(false));
  test('rejects code that never prints score', () => expect(fn('score = 10\nprint("hello")')).toBe(false));
  test('rejects empty string', () => expect(fn('')).toBe(false));
});

describe('errors_fix_B', () => {
  const fn = CHECKERS.errors_fix_B;
  const PASS = 'temp = 35\nif temp > 30:\n    print("It\'s hot!")';
  test('passes valid code', () => expect(fn(PASS)).toBe(true));
  test('passes with double-quoted string', () => expect(fn('temp = 35\nif temp > 30:\n    print("It\'s hot!")')).toBe(true));
  test('rejects wrong condition (temp < 30)', () => expect(fn('temp = 35\nif temp < 30:\n    print("It\'s hot!")')).toBe(false));
  test('rejects unindented print', () => expect(fn('if temp > 30:\nprint("It\'s hot!")')).toBe(false));
  test('rejects missing print body', () => expect(fn('if temp > 30:\n    pass')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── cast_to_int ──────────────────────────────────────────────────────────────

describe('cast_to_int_A', () => {
  const fn = CHECKERS.cast_to_int_A;
  const PASS = 'age = int(input("Age? "))\nprint(age + 1)';
  test('passes valid code', () => expect(fn(PASS)).toBe(true));
  test('rejects when int() wrapping is missing', () => expect(fn('age = input("Age? ")\nprint(age + 1)')).toBe(false));
  test('rejects when age + 1 is missing', () => expect(fn('age = int(input("Age? "))\nprint(age)')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('cast_to_int_B', () => {
  const fn = CHECKERS.cast_to_int_B;
  const PASS = 'mins = int(input("Minutes? "))\nprint(mins * 60)';
  test('passes mins * 60', () => expect(fn(PASS)).toBe(true));
  test('passes 60 * mins variant', () => expect(fn('mins = int(input("M? "))\nprint(60 * mins)')).toBe(true));
  test('rejects without int(input(', () => expect(fn('mins = input("M? ")\nprint(mins * 60)')).toBe(false));
  test('rejects without multiply-by-60', () => expect(fn('mins = int(input("M? "))\nprint(mins + 60)')).toBe(false));
  test('rejects without print', () => expect(fn('mins = int(input("M? "))\nresult = mins * 60')).toBe(false));
});

// ─── cast_to_str ──────────────────────────────────────────────────────────────

describe('cast_to_str_A', () => {
  const fn = CHECKERS.cast_to_str_A;
  test('passes str(score) concatenation', () => expect(fn('score = 10\nprint("Score: " + str(score))')).toBe(true));
  test('rejects without str(score)', () => expect(fn('score = 10\nprint("Score: " + score)')).toBe(false));
  test('rejects without concatenation operator', () => expect(fn('score = 10\nprint(str(score))')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('cast_to_str_B', () => {
  const fn = CHECKERS.cast_to_str_B;
  const PASS = 'age = 16\nprint("You are " + str(age) + " years old.")';
  test('passes valid code', () => expect(fn(PASS)).toBe(true));
  test('rejects missing age assignment', () => expect(fn('print("You are " + str(16) + " years old.")')).toBe(false));
  test('rejects missing str()', () => expect(fn('age = 16\nprint("You are " + age + " years old.")')).toBe(false));
  test('rejects missing print', () => expect(fn('age = 16\nresult = "Age: " + str(age)')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── range_basics ─────────────────────────────────────────────────────────────

describe('range_basics_A', () => {
  const fn = CHECKERS.range_basics_A;
  const PASS = 'for i in range(4):\n    print("Hi")';
  test('passes valid loop', () => expect(fn(PASS)).toBe(true));
  test('passes lowercase hi, matching what students often type in Thonny', () => {
    expect(fn('for i in range(4):\n    print("hi")')).toBe(true);
  });
  test('passes when the executed output is exactly four hi lines', () => {
    expect(fn('for word in ["hi", "hi", "hi", "hi"]:\n    print(word)', {
      ok: true,
      output: 'hi\nhi\nhi\nhi\n'
    })).toBe(true);
  });
  test('rejects range(3)', () => expect(fn('for i in range(3):\n    print("Hi")')).toBe(false));
  test('rejects executed output with only three hi lines', () => {
    expect(fn('for i in range(3):\n    print("hi")', {
      ok: true,
      output: 'hi\nhi\nhi\n'
    })).toBe(false);
  });
  test('rejects missing print Hi', () => expect(fn('for i in range(4):\n    print("Hello")')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('range_basics_A feedback', () => {
  const fb = FEEDBACK.range_basics_A;
  test('flags Hi with an exclamation mark as not exact output', () => {
    expect(fb('for i in range(4):\n    print("Hi!")', {
      ok: true,
      output: 'Hi!\nHi!\nHi!\nHi!\n'
    })).toContain('no exclamation mark');
  });
  test('flags the wrong repeat count from actual output', () => {
    expect(fb('for i in range(3):\n    print("Hi")', {
      ok: true,
      output: 'Hi\nHi\nHi\n'
    })).toContain('exactly 4');
  });
});

describe('range_basics_B', () => {
  const fn = CHECKERS.range_basics_B;
  const PASS = 'for n in range(5, 11):\n    print(n)';
  test('passes valid loop', () => expect(fn(PASS)).toBe(true));
  test('passes when executed output is the numbers 5 to 10', () => {
    expect(fn('for n in [5, 6, 7, 8, 9, 10]:\n    print(n)', {
      ok: true,
      output: '5\n6\n7\n8\n9\n10\n'
    })).toBe(true);
  });
  test('rejects wrong range start', () => expect(fn('for n in range(1, 11):\n    print(n)')).toBe(false));
  test('rejects wrong range end', () => expect(fn('for n in range(5, 10):\n    print(n)')).toBe(false));
  test('rejects missing print', () => expect(fn('for n in range(5, 11):\n    pass')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── turtle_loops ─────────────────────────────────────────────────────────────

describe('turtle_loops_A', () => {
  const fn = CHECKERS.turtle_loops_A;
  const PASS = 'for i in range(3):\n    t.forward(100)\n    t.left(120)';
  test('passes triangle with left(120)', () => expect(fn(PASS)).toBe(true));
  test('passes with right(120)', () => expect(fn('for i in range(3):\n    t.forward(100)\n    t.right(120)')).toBe(true));
  test('rejects range(4)', () => expect(fn('for i in range(4):\n    t.forward(100)\n    t.left(120)')).toBe(false));
  test('rejects wrong turn angle', () => expect(fn('for i in range(3):\n    t.forward(100)\n    t.left(90)')).toBe(false));
  test('rejects missing forward', () => expect(fn('for i in range(3):\n    t.left(120)')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('turtle_loops_B', () => {
  const fn = CHECKERS.turtle_loops_B;
  const PASS = 'for i in range(5):\n    t.forward(80)\n    t.left(72)';
  test('passes pentagon with left(72)', () => expect(fn(PASS)).toBe(true));
  test('passes with right(72)', () => expect(fn('for i in range(5):\n    t.forward(80)\n    t.right(72)')).toBe(true));
  test('rejects range(6)', () => expect(fn('for i in range(6):\n    t.forward(80)\n    t.left(72)')).toBe(false));
  test('rejects wrong angle', () => expect(fn('for i in range(5):\n    t.forward(80)\n    t.left(60)')).toBe(false));
  test('rejects missing forward', () => expect(fn('for i in range(5):\n    t.left(72)')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── function_basics ──────────────────────────────────────────────────────────

describe('function_basics_A', () => {
  const fn = CHECKERS.function_basics_A;
  const PASS = 'def say_bye():\n    print("Goodbye!")\n\nsay_bye()\nsay_bye()\nsay_bye()';
  test('passes with def + 3 calls (4 occurrences total)', () => expect(fn(PASS)).toBe(true));
  test('passes simple code that prints three lines containing bye', () => {
    expect(fn('print("bye")\nprint("bye for now")\nprint("goodbye")')).toBe(true);
  });
  test('passes when executed output has three lines containing bye', () => {
    expect(fn('for word in ["bye", "bye", "bye"]:\n    print(word)', {
      ok: true,
      output: 'bye\nbye\nbye\n'
    })).toBe(true);
  });
  test('passes bye() as the simpler function name', () => {
    expect(fn('def bye():\n    print("Goodbye!")\n\nbye()\nbye()\nbye()')).toBe(true);
  });
  test('rejects mixed function names', () => {
    expect(fn('def say_bye():\n    print("Goodbye!")\n\nbye()\nbye()\nbye()')).toBe(false);
  });
  test('rejects missing def when there is no successful output evidence', () => expect(fn('bye()\nbye()\nbye()')).toBe(false));
  test('accepts any print message containing bye', () => expect(fn('def bye():\n    print("Bye!")\nbye()\nbye()\nbye()')).toBe(true));
  test('rejects too few calls (only 2 total — def + 1 call)', () => {
    expect(fn('def bye():\n    print("Goodbye!")\nbye()')).toBe(false);
  });
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('function_basics_B', () => {
  const fn = CHECKERS.function_basics_B;
  const PASS = 'def welcome():\n    print("Hello!")\n    print("Welcome to Python.")\n\nwelcome()\nwelcome()';
  test('passes with 2 indented prints and 2 calls', () => expect(fn(PASS)).toBe(true));
  test('rejects wrong function name', () => {
    expect(fn('def greet():\n    print("Hello!")\n    print("Welcome.")\ngreet()\ngreet()')).toBe(false);
  });
  test('rejects only 1 indented print', () => {
    expect(fn('def welcome():\n    print("Hello!")\nwelcome()\nwelcome()')).toBe(false);
  });
  test('rejects only 1 call (def + 1 call = 2 occurrences, need >=3)', () => {
    expect(fn('def welcome():\n    print("Hello!")\n    print("Welcome.")\nwelcome()')).toBe(false);
  });
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── function_loop ────────────────────────────────────────────────────────────

describe('function_loop_A', () => {
  const fn = CHECKERS.function_loop_A;
  const PASS = [
    'import turtle',
    't = turtle.Turtle()',
    'def square():',
    '    for i in range(4):',
    '        t.forward(80)',
    '        t.left(90)',
    'square()',
    'square()',
  ].join('\n');
  test('passes valid program', () => expect(fn(PASS)).toBe(true));
  test('passes with right(90)', () => expect(fn(PASS.replace('left(90)', 'right(90)'))).toBe(true));
  test('rejects wrong function name', () => expect(fn(PASS.replace(/square/g, 'draw'))).toBe(false));
  test('rejects wrong range count', () => expect(fn(PASS.replace('range(4)', 'range(3)'))).toBe(false));
  test('rejects wrong turn angle', () => expect(fn(PASS.replace('left(90)', 'left(72)'))).toBe(false));
  test('rejects fewer than 2 calls (def + 1 call = 2 occurrences, need >=3)', () => {
    expect(fn(PASS.replace('square()\nsquare()', 'square()'))).toBe(false);
  });
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('function_loop_B', () => {
  const fn = CHECKERS.function_loop_B;
  const PASS = [
    'import turtle',
    't = turtle.Turtle()',
    'def triangle():',
    '    for i in range(3):',
    '        t.forward(100)',
    '        t.left(120)',
    'triangle()',
    'triangle()',
  ].join('\n');
  test('passes valid program', () => expect(fn(PASS)).toBe(true));
  test('passes with right(120)', () => expect(fn(PASS.replace('left(120)', 'right(120)'))).toBe(true));
  test('rejects wrong function name', () => expect(fn(PASS.replace(/triangle/g, 'tri'))).toBe(false));
  test('rejects wrong range count', () => expect(fn(PASS.replace('range(3)', 'range(4)'))).toBe(false));
  test('rejects wrong angle', () => expect(fn(PASS.replace('left(120)', 'left(90)'))).toBe(false));
  test('rejects fewer than 2 calls', () => {
    expect(fn(PASS.replace('triangle()\ntriangle()', 'triangle()'))).toBe(false);
  });
  test('rejects empty', () => expect(fn('')).toBe(false));
});

// ─── io_basics ────────────────────────────────────────────────────────────────

describe('io_basics_A', () => {
  const fn = CHECKERS.io_basics_A;
  const PASS = 'print("Hello!")\nprint("I am learning Python.")\nprint("This is fun.")';
  test('passes three prints with required words', () => expect(fn(PASS)).toBe(true));
  test('rejects only 2 prints', () => expect(fn('print("Hello!")\nprint("Python is fun.")')).toBe(false));
  test('rejects missing Hello', () => expect(fn('print("Hi!")\nprint("Python")\nprint("This is fun.")')).toBe(false));
  test('rejects missing Python', () => expect(fn('print("Hello!")\nprint("Hello again!")\nprint("This is fun.")')).toBe(false));
  test('rejects missing fun', () => expect(fn('print("Hello!")\nprint("I am learning Python.")\nprint("Goodbye.")')).toBe(false));
  test('accepts "Fun" (case-insensitive)', () => expect(fn('print("Hello!")\nprint("Python")\nprint("Fun!")')).toBe(true));
  test('rejects empty', () => expect(fn('')).toBe(false));
});

describe('io_basics_B', () => {
  const fn = CHECKERS.io_basics_B;
  const PASS = 'print("My Python badge")\nprint("I can use print()")\nprint("I can put text in quotes")\nprint("Ready for the next challenge!")';
  test('passes four print lines with required words', () => expect(fn(PASS)).toBe(true));
  test('rejects only 3 prints', () => expect(fn('print("Python")\nprint("print")\nprint("quotes and ready")')).toBe(false));
  test('rejects input', () => expect(fn('name = input("Name: ")\nprint("Python")\nprint("print")\nprint("quotes")\nprint("ready")')).toBe(false));
  test('rejects missing Python', () => expect(fn('print("My badge")\nprint("I can use print()")\nprint("I can use quotes")\nprint("Ready!")')).toBe(false));
  test('rejects missing print word', () => expect(fn('print("My Python badge")\nprint("I can code")\nprint("I can use quotes")\nprint("Ready!")')).toBe(false));
  test('rejects missing quotes', () => expect(fn('print("My Python badge")\nprint("I can use print()")\nprint("I can write text")\nprint("Ready!")')).toBe(false));
  test('rejects missing ready', () => expect(fn('print("My Python badge")\nprint("I can use print()")\nprint("I can use quotes")\nprint("Next challenge!")')).toBe(false));
  test('rejects empty', () => expect(fn('')).toBe(false));
});
