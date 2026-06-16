// python-error-hints.js
// -----------------------------------------------------------------------------
// A small, presentation-free library that turns a raw Python / Pyodide error
// message into a plain-English explanation aimed at Year 8 "first contact"
// programmers.
//
// Usage:
//   import { explainPythonError } from '../../python-error-hints.js';
//   const hint = explainPythonError(result.output);
//   if (hint) showSomewhere(hint.title, hint.plain);
//
// `explainPythonError` returns `{ id, title, plain }` for the first matching
// pattern, or `null` when nothing matches (so the caller can fall back to a
// generic message / debugging recipe).
//
// `plain` is theme-agnostic: the key takeaway is wrapped in **double asterisks**
// so each activity can render the bold span however it likes (HTML, etc.).
// -----------------------------------------------------------------------------

// Ordered most-specific → most-general. The catch-all SyntaxError entry MUST
// stay last so the precise messages win.
const HINTS = [
  {
    id: 'unterminated-string',
    match: /unterminated string literal|EOL while scanning string literal/i,
    title: 'Missing a speech mark',
    plain: 'This means **you are missing one of the pair of speech marks** " ". ' +
           'Every piece of text needs a speech mark at the start AND the end — ' +
           'check the line Python points to and add the missing one back.',
  },
  {
    id: 'unclosed-bracket',
    match: /'\(' was never closed|unexpected EOF while parsing|expected '\)'|'\)' was never closed/i,
    title: 'Missing a bracket',
    plain: 'This means **you are missing a closing bracket** ). ' +
           'Every ( you open needs a ) to close it — count your brackets on that line.',
  },
  {
    id: 'missing-colon',
    match: /expected ':'/i,
    title: 'Missing a colon',
    plain: 'This means you are **missing a colon : at the end of the line**. ' +
           'Lines that start with if, elif, else, for or while must end with a colon.',
  },
  {
    id: 'expected-indent',
    match: /IndentationError:\s*expected an indented block/i,
    title: 'Needs indenting',
    plain: 'This means the line underneath **needs to be indented (pushed in with Tab)**. ' +
           'The code inside an if or a loop has to be moved in from the left.',
  },
  {
    id: 'unexpected-indent',
    match: /IndentationError:\s*unexpected indent|unexpected indent/i,
    title: 'Too much indenting',
    plain: 'This means there is **an extra space or Tab at the start of the line**. ' +
           'Line up the start of the line with the others above it.',
  },
  {
    id: 'print-parens',
    match: /Missing parentheses in call to '?print'?/i,
    title: 'print needs brackets',
    plain: 'This means print **needs brackets () around what you want to show**, ' +
           'like print("Hello") — not print "Hello".',
  },
  {
    id: 'name-error',
    match: /NameError:\s*name .* is not defined/i,
    title: "Python doesn't recognise a word",
    plain: 'Python found a word it does not recognise. Usually this means **text is ' +
           'missing its speech marks " "**, or a name has been spelled differently ' +
           'from where you made it.',
  },
  {
    id: 'type-concat',
    match: /can only concatenate str|unsupported operand type\(s\)/i,
    title: 'Mixing text and numbers',
    plain: 'This means you tried to **add text and a number together with +**. ' +
           'Put numbers inside speech marks to join them as text, e.g. "Age: " + "12".',
  },
  {
    // Catch-all — keep LAST.
    id: 'invalid-syntax',
    match: /invalid syntax|SyntaxError/i,
    title: 'Python cannot read a line',
    plain: 'There is a **small typo Python cannot read** on that line. ' +
           'Read the line Python points to out loud and compare it carefully with ' +
           'what you meant to write.',
  },
];

/**
 * Map a raw Python / Pyodide error message to a friendly explanation.
 * @param {string} rawError - The full error output or its last line.
 * @returns {{id: string, title: string, plain: string} | null}
 */
export function explainPythonError(rawError) {
  if (!rawError) return null;
  const text = String(rawError);
  for (const hint of HINTS) {
    if (hint.match.test(text)) {
      return { id: hint.id, title: hint.title, plain: hint.plain };
    }
  }
  return null;
}

// Exposed for tests / tooling that want to enumerate coverage.
export const ERROR_HINT_IDS = HINTS.map(h => h.id);
