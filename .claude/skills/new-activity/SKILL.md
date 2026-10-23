---
name: new-activity
description: Scaffold a new interactive activity page from the right _templates/ starter, in the right folder, with shared-file paths fixed for its depth, the ACTIVITY block and ACTIVITY_TITLE filled in, and stub checkers/tests. Use when asked to create, start or add a new activity, worksheet page, quiz page or PRIMM lesson (for a Y9 Station Zero chapter use /new-chapter instead).
argument-hint: <Year>/<Topic>[/L<n>_Lesson]/<File_Name>.html "<title>"
---

# New activity

Create one new activity at the path in `$ARGUMENTS`. Work from the repo root. If the path or
title is missing, ask for it in one question (with the options you'd suggest).

## 1. Pick the template

| Page | Template | Its paths |
|---|---|---|
| Y7–Y9 general activity | `_templates/Y8.html` (for Y9, the newest Y9 page in the same style may be a better start: e.g. `Y9/Digital_Forensics/L5_Searching_the_Computer/`) | `../../` |
| Y11/Y13 general activity | `_templates/Y11.html` | `../../` |
| OCR pseudocode | `_templates/Pseudocode_Y11.html` | `../../` |
| RS lesson | `_templates/RS_Christianity_USA.html` (or `RS_British_Muslim.html`) | `../../` |
| Y8 Python PRIMM | `_templates/PRIMM_Python_Y8.html` (then read `_templates/CLAUDE.md`) | `../../../` |
| Y9 Python PRIMM, no story | `_templates/PRIMM_Python_Y9.html` (then read `_templates/CLAUDE.md`) | `../../../` |
| Y9 Station Zero chapter | stop: use `/new-chapter` | |

## 2. Place it

- Folder: `Y<n>/<Topic>/` (topic-level) or `Y<n>/<Topic>/L<n>_Lesson_Name/` (lesson-level).
  New folders use underscores, never spaces. In a lesson folder, number pages in teaching
  order (`1_…`, `2_…`). Reuse an existing topic folder if one fits (`ls Y<n>/`).
- If the topic is new, check `shared.css` for a `[data-year="<n>"][data-topic="<Topic>"]` rule
  and add one if missing (copy the neighbouring rules' shape).
- Copy the template, then fix every shared-file reference (`shared.css`, `classroom.js`,
  `activity-ui.js`, `error-reporter.js`, `theme-toggle.js`, `code-editor.js`,
  `pyodide-runner.js`, `pseudocode-editor.js`) to the page's depth: `../../` at topic level,
  `../../../` at lesson level. Grep the new file for `\.\./` to check every one.

## 3. Fill in the identity

- `<!-- ACTIVITY -->` block: `title`, `type` (Practice / Challenge / PRIMM / Assessment),
  `stars`, a one-sentence `desc`, and any `color`.
- `ACTIVITY_TITLE` in the script = the `title:` exactly. Every `submitGrade` call uses it
  (the Y9 template hard-codes `'Activity Title'` in two places: replace both).
- `<title>` element, and a unique localStorage key (PRIMM: `STORAGE_KEY`, e.g.
  `primm_y8_u2_l5_lists`) so it can't share progress with another page.
- Don't add `data-year` / `data-topic` to `<body>`.

## 4. Tests (pages with code checks)

- `checkers.js` beside the page (`checkers_<page>.js` if the folder will hold several checked
  pages): pure exported functions, no DOM. Reference: `Y8/Python Unit 1/L4_Data_Types_Casting/checkers.js`.
- `checkers.test.js` beside it (Vitest).
- `tests/<kebab-name>.spec.js`: a lean UI-wiring spec using `tests/helpers/activityHelpers.js`.
  Copy the shape of the nearest similar spec.

Leave the content `FILL IN`s for the author unless they gave you the content; if they did,
write it following `/audit-activity`'s rules.

## 5. Finish

- `npx vitest run activity-dependencies.test.js` (and the new `checkers.test.js`).
- Tell the user: the file(s) created, the URL to open (`node test-server.mjs` →
  `http://localhost:3000/<path>`), and the `FILL IN` placeholders still left
  (`grep -n "FILL IN\|TODO" <page>`).
