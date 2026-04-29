// Detection functions for the Targeted Practice follow-up lesson.
// Kept in a separate module so the inline HTML script and the vitest
// unit tests share the same source of truth.
//
// Each entry is keyed by `<clusterId>_<taskKey>` (taskKey is 'A' or 'B').
// Functions take the student's submitted code as a string and return true
// when the answer should be considered correct.

export const CHECKERS = {
  // ── Reading error messages ─────────────────────────────
  errors_read_A: code => /^C$/.test((code || '').trim()),  // not used — MCQ check is handled separately
  errors_read_B: code => /^B$/.test((code || '').trim()),

  // ── Fixing common errors ───────────────────────────────
  errors_fix_A: code => /player_score/.test(code) && /print\s*\(.*player_score/.test(code),
  errors_fix_B: code => /if\s+temp\s*>\s*30\s*:/.test(code) && /^([ ]{2,}|\t)print\s*\(\s*["']It's hot!["']/m.test(code),

  // ── Casting input to a number ──────────────────────────
  cast_to_int_A: code => /int\s*\(\s*input\s*\(/.test(code) && /age\s*\+\s*1/.test(code),
  cast_to_int_B: code => /int\s*\(\s*input\s*\(/.test(code) && /\*\s*60|60\s*\*/.test(code) && /print\s*\(/.test(code),

  // ── Casting numbers into strings ───────────────────────
  cast_to_str_A: code => /str\s*\(\s*score\s*\)/.test(code) && /\+/.test(code),
  cast_to_str_B: code => /age\s*=\s*\d+/.test(code) && /str\s*\(/.test(code) && /\+/.test(code) && /print\s*\(/.test(code),

  // ── How range() works ──────────────────────────────────
  range_basics_A: code => /for\s+\w+\s+in\s+range\s*\(\s*4\s*\)\s*:/.test(code) && /print\s*\(\s*["']Hi["']/.test(code),
  range_basics_B: code => /for\s+\w+\s+in\s+range\s*\(\s*5\s*,\s*11\s*\)\s*:/.test(code) && /print\s*\(\s*\w+\s*\)/.test(code),

  // ── Loops with turtle graphics ─────────────────────────
  turtle_loops_A: code => /range\s*\(\s*3\s*\)/.test(code) && /(left|right)\s*\(\s*120\s*\)/.test(code) && /forward\s*\(/.test(code),
  turtle_loops_B: code => /range\s*\(\s*5\s*\)/.test(code) && /(left|right)\s*\(\s*72\s*\)/.test(code) && /forward\s*\(/.test(code),

  // ── Defining and calling functions ─────────────────────
  function_basics_A: code => {
    const hasDef = /def\s+say_bye\s*\(\s*\)\s*:/.test(code);
    const hasPrint = /print\s*\(\s*["']Goodbye!["']/.test(code);
    const callCount = (code.match(/say_bye\s*\(\s*\)/g) || []).length;
    return hasDef && hasPrint && callCount >= 4; // def + 3 calls
  },
  function_basics_B: code => {
    const hasDef = /def\s+welcome\s*\(\s*\)\s*:/.test(code);
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

  // ── Foundational: print and input ──────────────────────
  io_basics_A: code => {
    const printCount = (code.match(/print\s*\(/g) || []).length;
    return printCount >= 3 && /Hello/.test(code) && /Python/.test(code) && /fun/i.test(code);
  },
  io_basics_B: code => /int\s*\(\s*input\s*\(/.test(code) && /\*\s*2|2\s*\*/.test(code) && /print\s*\(/.test(code),
};
