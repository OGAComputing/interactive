---
name: test-page
description: Run just the tests that cover one activity page (its checkers unit tests and its Playwright spec) instead of the whole slow suite, and report the result. Use when asked to test a page, lesson or activity, or after changing one.
argument-hint: <page.html | folder | spec name>
---

# Test one page

Find and run the tests for `$ARGUMENTS`.

1. **Unit tests:** the `*.test.js` files in the page's folder (`ls <folder>/*.test.js`). If the
   change touched a shared file, also add its test: `code-editor.js`/`python-error-hints.js` →
   `python-error-hints.test.js`, `pseudocode-*.js` → `pseudocode-transpiler.test.js`, any PRIMM
   template → `primm-templates.test.js`. Always include `activity-dependencies.test.js`.
   Run: `npx vitest run <files…>`.
2. **E2E spec:** specs name their page in a `PATH`/`goto` string, so
   `grep -ln "<page file name>" tests/*.spec.js` (URL-encode spaces as `%20` if the first grep
   finds nothing). Shared-file changes: `code-editor.js` → `step-through`, `live-input`,
   `error-hints` specs; `classroom.js` → `classroom.spec.js`; `activity-ui.js` →
   `activity-ui*.spec.js`; `error-reporter.js` → `error-reporter.spec.js`.
   Run: `npx playwright test <specs…> --reporter=line` (allow up to 10 minutes; Pyodide pages
   are slow).
3. If no spec covers the page, say so and offer to write one (the `/new-activity` test shape).

Report: passed/failed counts per file, and for each failure the test name, the assertion and
the likely cause. Don't "fix" a test to make it pass without saying so; if a test looks wrong,
explain why and ask.
