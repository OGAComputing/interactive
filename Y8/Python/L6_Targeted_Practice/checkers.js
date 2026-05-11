// Detection functions for the Targeted Practice follow-up lesson.
// Kept in a separate module so the inline HTML script and the vitest
// unit tests share the same source of truth.
//
// Each entry is keyed by `<clusterId>_<taskKey>` (taskKey is 'A' or 'B').
// Functions take the student's submitted code as a string and optionally the
// Python run result: { ok, output }. They return true when the answer should
// be considered correct.

function outputLines(run) {
  return (run?.ok ? run.output : '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function printedLines(code) {
  return [...String(code || '').matchAll(/print\s*\(\s*(["'])(.*?)\1\s*\)/g)]
    .map(m => m[2].trim())
    .filter(Boolean);
}

function linesFromRunOrLiterals(code, run) {
  const lines = outputLines(run);
  return lines.length ? lines : printedLines(code);
}

function firstRangeNumber(code) {
  const m = String(code || '').match(/range\s*\(\s*(-?\d+)/);
  return m ? Number(m[1]) : null;
}

function firstTurnNumber(code) {
  const m = String(code || '').match(/\b(?:left|right)\s*\(\s*(-?\d+)/);
  return m ? Number(m[1]) : null;
}

export const CHECKERS = {
  // ── Reading error messages ─────────────────────────────
  errors_read_A: code => /^C$/.test((code || '').trim()),  // not used — MCQ check is handled separately
  errors_read_B: code => /^B$/.test((code || '').trim()),

  // ── Fixing common errors ───────────────────────────────
  errors_fix_A: code => /\bscore\b/.test(code) && /print\s*\([^)]*\bscore\b/.test(code),
  errors_fix_B: code => /if\s+temp\s*>\s*30\s*:/.test(code) && /^([ ]{2,}|\t)print\s*\(\s*["']It's hot!["']/m.test(code),

  // ── Casting input to a number ──────────────────────────
  cast_to_int_A: code => /int\s*\(\s*input\s*\(/.test(code) && /age\s*\+\s*1/.test(code),
  cast_to_int_B: code => /int\s*\(\s*input\s*\(/.test(code) && /\*\s*60|60\s*\*/.test(code) && /print\s*\(/.test(code),

  // ── Casting numbers into strings ───────────────────────
  cast_to_str_A: code => /str\s*\(\s*score\s*\)/.test(code) && /\+/.test(code),
  cast_to_str_B: code => /age\s*=\s*\d+/.test(code) && /str\s*\(/.test(code) && /\+/.test(code) && /print\s*\(/.test(code),

  // ── How range() works ──────────────────────────────────
  range_basics_A: (code, run) => {
    const lines = outputLines(run);
    if (lines.length) return lines.length === 4 && lines.every(line => /^hi$/i.test(line));
    return /for\s+\w+\s+in\s+range\s*\(\s*4\s*\)\s*:/.test(code) && /print\s*\(\s*["']hi["']/i.test(code);
  },
  range_basics_B: (code, run) => {
    const lines = outputLines(run);
    if (lines.length) return lines.join('\n') === '5\n6\n7\n8\n9\n10';
    return /for\s+\w+\s+in\s+range\s*\(\s*5\s*,\s*11\s*\)\s*:/.test(code) && /print\s*\(\s*\w+\s*\)/.test(code);
  },

  // ── Loops with turtle graphics ─────────────────────────
  turtle_loops_A: code => /range\s*\(\s*3\s*\)/.test(code) && /(left|right)\s*\(\s*120\s*\)/.test(code) && /forward\s*\(/.test(code),
  turtle_loops_B: code => /range\s*\(\s*5\s*\)/.test(code) && /(left|right)\s*\(\s*72\s*\)/.test(code) && /forward\s*\(/.test(code),

  // ── Defining and calling functions ─────────────────────
  function_basics_A: (code, run) => {
    const byeLines = linesFromRunOrLiterals(code, run)
      .filter(line => /\bbye\b/i.test(line) || /goodbye/i.test(line));
    if (byeLines.length >= 3) return true;

    const def = code.match(/def\s+((?:say_)?bye)\s*\(\s*\)\s*:/);
    const hasPrint = /print\s*\(\s*["'][^"']*bye[^"']*["']/i.test(code);
    const callCount = def ? (code.match(new RegExp(`\\b${def[1]}\\s*\\(\\s*\\)`, 'g')) || []).length : 0;
    return !!def && hasPrint && callCount >= 4; // def + 3 calls
  },
  function_basics_B: (code, run) => {
    const lines = outputLines(run);
    if (lines.length >= 4) return true; // 2+ lines per call, called at least twice

    const hasDef = /def\s+\w+\s*\(\s*\)\s*:/.test(code);
    const printCount = (code.match(/^\s+print\s*\(/gm) || []).length;
    const callCount = (code.match(/welcome\s*\(\s*\)/g) || []).length;
    return hasDef && printCount >= 2 && callCount >= 3; // def + 2 calls; 2 indented prints
  },

  // ── Functions with loops inside ────────────────────────
  function_loop_A: code => {
    const hasDef = /def\s+square\s*\(\s*\)\s*:/.test(code);
    const hasFor = /for\s+\w+\s+in\s+range\s*\(\s*4\s*\)/.test(code);
    const has90  = /(left|right)\s*\(\s*90\s*\)/.test(code);
    const callCount = (code.match(/square\s*\(\s*\)/g) || []).length;
    return hasDef && hasFor && has90 && callCount >= 3; // def + 2 calls
  },
  function_loop_B: code => {
    const hasDef = /def\s+triangle\s*\(\s*\)\s*:/.test(code);
    const hasFor = /for\s+\w+\s+in\s+range\s*\(\s*3\s*\)/.test(code);
    const has120 = /(left|right)\s*\(\s*120\s*\)/.test(code);
    const callCount = (code.match(/triangle\s*\(\s*\)/g) || []).length;
    return hasDef && hasFor && has120 && callCount >= 3;
  },

  // ── Foundational: print ────────────────────────────────
  io_basics_A: (code, run) => {
    const lines = linesFromRunOrLiterals(code, run);
    if (lines.length >= 3) {
      const text = lines.join(' ');
      return /Hello/i.test(text) && /Python/i.test(text) && /fun/i.test(text);
    }
    const printCount = (code.match(/print\s*\(/g) || []).length;
    return printCount >= 3 && /Hello/.test(code) && /Python/.test(code) && /fun/i.test(code);
  },
  io_basics_B: (code, run) => {
    const lines = linesFromRunOrLiterals(code, run);
    if (lines.length >= 4) {
      const text = lines.join(' ');
      return !/input\s*\(/.test(code) &&
        /Python/i.test(text) &&
        /print/i.test(text) &&
        /quotes/i.test(text) &&
        /ready/i.test(text);
    }

    const printCount = (code.match(/print\s*\(/g) || []).length;
    const printedText = (code.match(/["'][^"']*["']/g) || []).join(' ');
    return printCount >= 4 &&
      !/input\s*\(/.test(code) &&
      /Python/i.test(printedText) &&
      /print/i.test(printedText) &&
      /quotes/i.test(printedText) &&
      /ready/i.test(printedText);
  },
};

export const FEEDBACK = {
  errors_fix_A: code => {
    if (/\bscroe\b/.test(code)) return 'Check the spelling: the variable is called score, not scroe.';
    if (!/\bscore\b/.test(code)) return 'Use the same variable name on both lines: score.';
    if (!/print\s*\(/.test(code)) return 'Keep the print line so the score is displayed.';
    return 'Check line 2: it should print the variable score.';
  },

  errors_fix_B: code => {
    if (!/if\s+temp\s*>\s*30\s*:/.test(code)) return 'Check line 1 exactly: it should be if temp > 30: with a colon.';
    if (!/^([ ]{2,}|\t)print\s*\(/m.test(code)) return 'Indent the print line so it sits inside the if block.';
    return "Keep the message as It's hot! and make sure it is printed inside the if block.";
  },

  cast_to_int_A: code => {
    if (!/int\s*\(\s*input\s*\(/.test(code)) return 'Wrap the input with int(...): age = int(input(...)).';
    if (!/age\s*\+\s*1/.test(code)) return 'The output needs to show next year, so add 1 to age.';
    return 'Check that you use int(input(...)) and then print age + 1.';
  },

  cast_to_int_B: code => {
    if (!/int\s*\(\s*input\s*\(/.test(code)) return 'Convert the input to a number with int(input(...)) before multiplying.';
    if (!/\*\s*60|60\s*\*/.test(code)) return 'Minutes to seconds means multiply by 60.';
    if (!/print\s*\(/.test(code)) return 'Print the answer so it appears in the output.';
    return 'Check that your program asks for minutes, multiplies by 60, and prints the result.';
  },

  cast_to_str_A: code => {
    if (!/str\s*\(\s*score\s*\)/.test(code)) return 'Wrap score with str(score) before joining it to text.';
    if (!/\+/.test(code)) return 'This task is practising string joining with +, so keep the + signs.';
    return 'Check line 2: the number score needs str(score).';
  },

  cast_to_str_B: code => {
    if (!/age\s*=\s*\d+/.test(code)) return 'Store age as a number first, for example age = 12.';
    if (!/str\s*\(/.test(code)) return 'Use str(age) when you join age into the sentence.';
    if (!/print\s*\(/.test(code)) return 'Print the sentence so it appears in the output.';
    return 'Check that age starts as a number, then use str(age) inside the printed sentence.';
  },

  range_basics_A: (code, run) => {
    const lines = outputLines(run);
    if (lines.length) {
      if (lines.length !== 4) return `Check the repeat count: your code printed ${lines.length} line${lines.length === 1 ? '' : 's'}, but it needs exactly 4.`;
      if (lines.some(line => /^hi!$/i.test(line))) return 'Check that the output says Hi exactly, with no exclamation mark.';
      if (lines.some(line => !/^hi$/i.test(line))) return 'Check that every output line says Hi exactly.';
    }
    const n = firstRangeNumber(code);
    if (n !== null && n !== 4) return `Use range(4), not range(${n}), because the loop must run exactly 4 times.`;
    if (!/print\s*\(/.test(code)) return 'Use print("Hi") inside the loop.';
    return 'Check that the loop uses range(4) and prints Hi exactly.';
  },

  range_basics_B: (code, run) => {
    const lines = outputLines(run);
    if (lines.length) {
      if (lines.join('\n') === '5\n6\n7\n8\n9') return 'You are missing 10. Remember range stops before the second number, so use 11 as the stop value.';
      if (lines[0] !== '5') return 'The first printed number should be 5.';
      if (lines[lines.length - 1] !== '10') return 'The last printed number should be 10.';
      return 'The output should be exactly 5, 6, 7, 8, 9, 10, each on its own line.';
    }
    if (/range\s*\(\s*5\s*,\s*10\s*\)/.test(code)) return 'Use range(5, 11), not range(5, 10), because 10 would be left out.';
    if (!/range\s*\(\s*5\s*,\s*11\s*\)/.test(code)) return 'Use range(5, 11) to print from 5 up to and including 10.';
    return 'Print the loop variable inside the loop.';
  },

  turtle_loops_A: code => {
    const n = firstRangeNumber(code);
    if (n !== null && n !== 3) return `A triangle has 3 sides, so use range(3), not range(${n}).`;
    const turn = firstTurnNumber(code);
    if (turn !== null && turn !== 120) return `A triangle turn is 120 degrees, not ${turn}.`;
    if (!/forward\s*\(/.test(code)) return 'Use t.forward(...) inside the loop to draw each side.';
    return 'Check for range(3), forward(...), and a 120 degree turn.';
  },

  turtle_loops_B: code => {
    const n = firstRangeNumber(code);
    if (n !== null && n !== 5) return `A pentagon has 5 sides, so use range(5), not range(${n}).`;
    const turn = firstTurnNumber(code);
    if (turn !== null && turn !== 72) return `A pentagon turn is 72 degrees, not ${turn}.`;
    if (!/forward\s*\(/.test(code)) return 'Use t.forward(...) inside the loop to draw each side.';
    return 'Check for range(5), forward(...), and a 72 degree turn.';
  },

  function_basics_A: (code, run) => {
    const byeLines = linesFromRunOrLiterals(code, run).filter(line => /\bbye\b/i.test(line) || /goodbye/i.test(line));
    if (byeLines.length > 0 && byeLines.length < 3) return `You printed bye ${byeLines.length} time${byeLines.length === 1 ? '' : 's'}; it needs 3 times.`;
    if (!/\bbye\b/i.test(code)) return 'Make sure the output contains bye.';
    return 'Check that your program produces three output lines containing bye.';
  },

  function_basics_B: (code, run) => {
    const lines = outputLines(run);
    if (lines.length && lines.length < 4) return 'Calling a two-line welcome function twice should give at least 4 output lines.';
    if (!/def\s+\w+\s*\(\s*\)\s*:/.test(code)) return 'Start by defining a function with def name():';
    if ((code.match(/^\s+print\s*\(/gm) || []).length < 2) return 'Put at least two indented print lines inside the function.';
    return 'Call your function twice after the function definition.';
  },

  function_loop_A: code => {
    if (!/def\s+square\s*\(\s*\)\s*:/.test(code)) return 'The function must be named square because the calls use square().';
    const n = firstRangeNumber(code);
    if (n !== null && n !== 4) return `A square has 4 sides, so use range(4), not range(${n}).`;
    const turn = firstTurnNumber(code);
    if (turn !== null && turn !== 90) return `A square turn is 90 degrees, not ${turn}.`;
    if ((code.match(/square\s*\(\s*\)/g) || []).length < 3) return 'You need square() twice after the function, so it draws two squares.';
    return 'Check the blanks: square, 4, 90, and square().';
  },

  function_loop_B: code => {
    if (!/def\s+triangle\s*\(\s*\)\s*:/.test(code)) return 'Name the function triangle so the calls use triangle().';
    const n = firstRangeNumber(code);
    if (n !== null && n !== 3) return `A triangle has 3 sides, so use range(3), not range(${n}).`;
    const turn = firstTurnNumber(code);
    if (turn !== null && turn !== 120) return `A triangle turn is 120 degrees, not ${turn}.`;
    if ((code.match(/triangle\s*\(\s*\)/g) || []).length < 3) return 'Call triangle() twice after the function definition.';
    return 'Check for def triangle(), range(3), a 120 degree turn, and two calls.';
  },

  io_basics_A: (code, run) => {
    const lines = linesFromRunOrLiterals(code, run);
    if (lines.length < 3) return 'This task needs three print lines.';
    const text = lines.join(' ');
    if (!/Hello/i.test(text)) return 'One output line needs to say Hello!';
    if (!/Python/i.test(text)) return 'One output line needs to mention Python.';
    if (!/fun/i.test(text)) return 'One output line needs to say this is fun.';
    return 'Check the three required messages carefully.';
  },

  io_basics_B: (code, run) => {
    const lines = linesFromRunOrLiterals(code, run);
    if (lines.length < 4) return 'Use print() at least four times for the badge.';
    const text = lines.join(' ');
    if (!/Python/i.test(text)) return 'Include the word Python somewhere in the output.';
    if (!/print/i.test(text)) return 'Include the word print somewhere in the output.';
    if (!/quotes/i.test(text)) return 'Include the word quotes somewhere in the output.';
    if (!/ready/i.test(text)) return 'Include the word ready somewhere in the output.';
    return 'Check the badge includes Python, print, quotes, and ready.';
  },
};
