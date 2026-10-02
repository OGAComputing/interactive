import { describe, expect, test } from 'vitest';
import { explainPythonError, ERROR_HINT_IDS } from './python-error-hints.js';

// Representative raw messages as Pyodide/CPython actually report them, paired
// with the hint id we expect and a substring that must appear in the bold-marked
// plain-English takeaway.
const CASES = [
  ['  File "<exec>", line 1\n    print("This is fun!)\n                       ^\nSyntaxError: unterminated string literal (detected at line 1)',
    'unterminated-string', 'speech marks'],
  ['SyntaxError: EOL while scanning string literal', 'unterminated-string', 'speech marks'],
  ["SyntaxError: '(' was never closed", 'unclosed-bracket', 'closing bracket'],
  ['SyntaxError: unexpected EOF while parsing', 'unclosed-bracket', 'closing bracket'],
  ["  File \"<exec>\", line 1\nSyntaxError: expected ':'", 'missing-colon', 'colon'],
  ['IndentationError: expected an indented block', 'expected-indent', 'indented'],
  ['IndentationError: unexpected indent', 'unexpected-indent', 'extra space'],
  ['IndentationError: unindent does not match any outer indentation level', 'unindent-mismatch', "doesn't line up"],
  ['TabError: inconsistent use of tabs and spaces in indentation', 'tab-error', 'tabs and spaces'],
  ["SyntaxError: Missing parentheses in call to 'print'", 'print-parens', 'brackets'],
  ["NameError: name 'fun' is not defined", 'name-error', 'speech marks'],
  ['TypeError: can only concatenate str (not "int") to str', 'type-concat', 'number'],
  ['TypeError: unsupported operand type(s) for +: \'int\' and \'str\'', 'type-concat', 'number'],
  ['SyntaxError: invalid syntax', 'invalid-syntax', 'typo'],
  // Raised by pyodide-runner.js's loop guard / exhausted input() mock.
  ['InfiniteLoopError: the program was still running after 4 seconds, so it was stopped - a loop probably never finishes',
    'infinite-loop', 'never finished'],
  ['InfiniteLoopError: the program kept asking for input after every answer had been used, so it was stopped - check the loop can finish',
    'infinite-loop-input', 'asking for input'],
  ['EOFError: the program asked for input more times than it was given answers', 'eof-input', 'more times'],
];

describe('explainPythonError', () => {
  test.each(CASES)('maps %#', (raw, expectedId, takeaway) => {
    const hint = explainPythonError(raw);
    expect(hint).not.toBeNull();
    expect(hint.id).toBe(expectedId);
    expect(hint.title).toBeTruthy();
    // The bold takeaway is marked with ** ** and contains the key phrase.
    expect(hint.plain).toContain('**');
    expect(hint.plain.toLowerCase()).toContain(takeaway.toLowerCase());
  });

  test('NameError quotes the actual undefined name', () => {
    const hint = explainPythonError("NameError: name 'nickname' is not defined");
    expect(hint.plain).toContain('nickname');
    expect(hint.fix).toContain('nickname');
  });

  test('specific messages win over the SyntaxError catch-all', () => {
    // "unterminated string literal" also contains nothing matching earlier rows,
    // but a message that mentions both should still pick the most specific.
    const raw = 'SyntaxError: unterminated string literal (detected at line 1)';
    expect(explainPythonError(raw).id).toBe('unterminated-string');
  });

  test('"invalid syntax" on an else: line is explained as an indentation slip', () => {
    // A flat line between the if block and else:, or an indented else:, both come out of
    // Python as a bare "invalid syntax" pointing at the else line.
    for (const lineText of ['else:', '    else:', 'elif score > 10:']) {
      const hint = explainPythonError('SyntaxError: invalid syntax', { lineText });
      expect(hint.id).toBe('stray-else');
      expect(hint.plain).toContain('**');
      expect(hint.fix).toMatch(/Indent/);
    }
  });

  test('without the line text (or on any other line) "invalid syntax" stays the generic typo hint', () => {
    expect(explainPythonError('SyntaxError: invalid syntax').id).toBe('invalid-syntax');
    expect(explainPythonError('SyntaxError: invalid syntax', { lineText: 'print "hi"' }).id).toBe('invalid-syntax');
    expect(explainPythonError('SyntaxError: invalid syntax', { lineText: 'elsewhere = 5' }).id).toBe('invalid-syntax');
  });

  test('a missing colon on else still wins over the stray-else hint', () => {
    expect(explainPythonError("SyntaxError: expected ':'", { lineText: 'else' }).id).toBe('missing-colon');
  });

  test('returns null for an unrecognised message', () => {
    expect(explainPythonError('ZeroDivisionError: division by zero')).toBeNull();
  });

  test('returns null for empty / missing input', () => {
    expect(explainPythonError('')).toBeNull();
    expect(explainPythonError(null)).toBeNull();
    expect(explainPythonError(undefined)).toBeNull();
  });

  test('all advertised ids are reachable in the table', () => {
    expect(new Set(ERROR_HINT_IDS).size).toBe(ERROR_HINT_IDS.length);
    expect(ERROR_HINT_IDS).toContain('invalid-syntax');
  });
});
