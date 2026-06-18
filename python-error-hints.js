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
// `plain` is written as a "means …" clause so a caller can echo the raw Python
// error and append the translation, e.g.
//   "unterminated string literal" means you are missing a speech mark.
// The key takeaway is wrapped in **double asterisks** for the caller to embolden.
const HINTS = [
  {
    id: 'unterminated-string',
    match: /unterminated string literal|EOL while scanning string literal/i,
    title: 'Missing a speech mark',
    plain: 'you are **missing one of the pair of speech marks** " " — every piece of ' +
           'text needs a speech mark at the start and the end.',
  },
  {
    id: 'unclosed-bracket',
    match: /'\(' was never closed|unexpected EOF while parsing|expected '\)'|'\)' was never closed/i,
    title: 'Missing a bracket',
    plain: 'you are **missing a closing bracket** ) — every ( you open needs a ) to close it.',
  },
  {
    id: 'missing-colon',
    match: /expected ':'/i,
    title: 'Missing a colon',
    plain: 'you are **missing a colon :** at the end of the line — if, elif, else, for ' +
           'and while lines all end with a colon.',
  },
  {
    id: 'expected-indent',
    match: /IndentationError:\s*expected an indented block/i,
    title: 'Needs indenting',
    plain: 'the line underneath **needs to be indented** (pushed in with Tab) — the code ' +
           'inside an if or a loop moves in from the left.',
  },
  {
    id: 'unexpected-indent',
    match: /IndentationError:\s*unexpected indent|unexpected indent/i,
    title: 'Too much indenting',
    plain: 'there is **an extra space or Tab at the start of the line** — line it up with ' +
           'the lines above it.',
  },
  {
    id: 'print-parens',
    match: /Missing parentheses in call to '?print'?/i,
    title: 'print needs brackets',
    plain: 'print **needs brackets () around what you want to show**, like print("Hello").',
  },
  {
    id: 'name-error',
    match: /NameError:\s*name .* is not defined/i,
    title: "Python doesn't recognise a word",
    plain: 'Python **does not recognise a word** — usually the text is **missing its ' +
           'speech marks " "**, **a variable name is spelled differently** from where ' +
           'you created it, or **the variable hasn\'t been given created yet**.',
  },
  {
    id: 'type-concat',
    match: /can only concatenate str|unsupported operand type\(s\)/i,
    title: 'Mixing text and numbers',
    plain: 'you tried to **add text and a number together with +** — put numbers inside ' +
           'speech marks to join them as text, e.g. "Age: " + "12".',
  },
  {
    // Catch-all — keep LAST.
    id: 'invalid-syntax',
    match: /invalid syntax|SyntaxError/i,
    title: 'Python cannot read a line',
    plain: 'there is a **small typo Python cannot read** on that line — read it out loud ' +
           'and compare it carefully with what you meant to write.',
  },
];

/**
 * Map a raw Python / Pyodide error message to a friendly explanation.
 * @param {string} rawError - The full error output or its last line.
 * @returns {{id: string, title: string, plain: string} | null}
 *   `plain` is a "means …" clause (see HINTS above); null when nothing matches.
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
