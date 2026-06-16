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
  ["SyntaxError: Missing parentheses in call to 'print'", 'print-parens', 'brackets'],
  ["NameError: name 'fun' is not defined", 'name-error', 'speech marks'],
  ['TypeError: can only concatenate str (not "int") to str', 'type-concat', 'number'],
  ['TypeError: unsupported operand type(s) for +: \'int\' and \'str\'', 'type-concat', 'number'],
  ['SyntaxError: invalid syntax', 'invalid-syntax', 'typo'],
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

  test('specific messages win over the SyntaxError catch-all', () => {
    // "unterminated string literal" also contains nothing matching earlier rows,
    // but a message that mentions both should still pick the most specific.
    const raw = 'SyntaxError: unterminated string literal (detected at line 1)';
    expect(explainPythonError(raw).id).toBe('unterminated-string');
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
