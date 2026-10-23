# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Computing Education Platform — a static web hub serving self-contained HTML activities for UK secondary school students (Computing Y7, Y8, Y9, Y11, Y13, plus some Religious Studies). Hosted on GitHub Pages. No runtime dependencies and no build step; npm is only used for the tests.

## Architecture

- **`index.html`** — Hub page that fetches `activities.json` and `meta.json` to render activity cards grouped by year, topic and lesson
- **`Y7/` … `Y13/`, `RS/`** — Activity folders: `<Year>/<Topic>/[L<n>_Lesson/]file.html`. `Demo/` and `Animations/` hold teacher demos
- **`activities.json`** / **`meta.json`** — Rebuilt by `.github/workflows/build-manifest.yml` (from each page's `<!-- ACTIVITY -->` block) in a `[skip ci]` commit after every push to main; never edit them by hand
- **`.github/workflows/test.yml`** — Runs Vitest and Playwright (4 parallel runners), then deploys to GitHub Pages only if both pass
- **`_templates/`** — Starter pages (see Adding a New Activity). **`_teacher/`** — teacher-only tools (setup page, unit guide, Apps Script rescoring). **`_presentations/`** — PowerPoint decks and their build scripts. **`_drafts/`** — work in progress and story/crew image sources. **`Knowledge Base/`** — specs, MTPs (`project_*_mtp.md`) and reference material

### Shared files

Reached by relative path: `../../` from a topic-level page, `../../../` from a lesson-level page.

| File | Purpose | Used by |
|------|---------|---------|
| `shared.css` | Reset, year-group themes (`data-year`), topic accents (`data-topic`), `ac-*` utility classes and animations | Pages built from templates |
| `classroom.js` | Google Classroom sign-in, grade submission, work evidence, teacher mode; sets `data-year`/`data-topic` | Every graded activity |
| `activity-ui.js` | `window.ActivityUI`: completion celebrations, reduced-motion-safe animation, `.ac-toast` | Every graded activity |
| `error-reporter.js` | Shows unexpected page errors in a footer panel (no dev console on student PCs); `window.ErrorReporter?.report(source, err)`. Load as a plain `<script>` **before** `activity-ui.js`. Never reports mistakes in student Python | Opt-in: Y8 + PRIMM templates, Y8 Python Unit 1 |
| `theme-toggle.js` | Light/dark switch: load as a plain `<script>` in `<head>`; sets `html[data-theme]` (dark by default, localStorage `ac-theme`, `?theme=` override). Each page supplies its light palette under `html[data-theme="light"]` (on `body` too, since shared.css re-sets `--code-bg`/`--muted` there) | PRIMM Y8 + Station Zero templates, Y8 Unit 1 PRIMM lessons, Y9 Python |
| `pyodide-runner.js` + `pyodide/` | Runs Python in the browser (`runPython`, `preload`) from the local Pyodide copy | Python and pseudocode pages |
| `code-editor.js` | Python editor widget (`setupEditors`, `runCode`, `setEditorOutput`, `replayRun`) with opt-in `errorHints`, `memoryView`, `stepThrough` | Python pages, PRIMM lessons |
| `python-error-hints.js` | Year-8-friendly error explanations; imported only by `code-editor.js` | (indirect) |
| `pseudocode-transpiler.js` / `pseudocode-editor.js` | OCR pseudocode → Python (procedural subset, file I/O, classes) and its editor (a fork of `code-editor.js`) | Pseudocode pages only |
| `fonts/<family>.css` + `fonts/<family>/` | Self-hosted web fonts: one stylesheet of `@font-face` rules per family, its `.woff2` files and its licence. Link it in `<head>`: `<link rel="stylesheet" href="../../fonts/outfit.css">` | Pages that want a non-system font (now: Baloo 2, Comic Neue, Fredoka, Outfit) |

These are the only files an activity may reference. They are allowed because activities are always served from the hub/GitHub Pages, and the presentation files degrade gracefully when absent (call them with `?.`).

## Running and testing locally

- **Static pages:** open the HTML file directly.
- **Python, pseudocode and module pages** need a server (ES modules and Pyodide don't load from `file://`): `node test-server.mjs` → http://localhost:3000.
- **Unit tests (Vitest, seconds):** `npm run test:unit`. Covers each page's `checkers.js`, the transpiler, error hints, `activity-dependencies.test.js` (every graded page loads `classroom.js` + `activity-ui.js`, loads nothing from another site, and every `fonts/` link exists) and `primm-templates.test.js` (the Y8 and Y9 PRIMM templates keep one module script).
- **E2E (Playwright, slow):** run one spec at a time, `npx playwright test tests/<name>.spec.js`. The suite is CPU-bound because every Python page boots Pyodide; open `stepThrough` pages with `?step=off` unless the test is about stepping.
- **Every new activity with code checks gets three test files:** `checkers.js` (pure exported functions, no DOM) + `checkers.test.js` beside the page, and a lean UI-wiring spec in `tests/` that uses `tests/helpers/activityHelpers.js`. Checker permutations belong in Vitest, not Playwright. `tests/classroom.spec.js` covers `classroom.js` once; don't repeat it per activity.

## Folder Structure

Activities can live at two depths:

```
Y8/Python/Spot_the_Error.html                 ← topic-level (no lesson grouping)
Y8/Python/L1_Variables/1_Spot_the_Error.html  ← lesson-level (grouped under "Lesson 1 — Variables")
```

Lesson folders must start with `L<number>` (e.g. `L1`, `L02`, `L1_Variables`). The hub shows them as subheadings within the topic. One letter may follow the number for an in-between lesson, e.g. `L4R_Revision` → "Lesson 4R", sorted straight after Lesson 4 (`lesson_suffix` in `activities.json`).

**Naming new folders and files:** use underscores, not spaces (`Digital_Forensics`, `L3_While_Loops`). Existing folders with spaces or spec numbers (`Y11/1.3 Networks`) keep their names, because their URLs are posted in Classroom (`classroom.js` strips the spec number when it derives `data-topic`). Number pages in a lesson folder in teaching order (`1_Wake_Up_PRIMM.html`). A lesson folder with one checked page uses `checkers.js`; with several, `checkers_<page>.js` each.

## Adding a New Activity

The `/new-activity` skill does all of this.

1. Copy a template from `_templates/` into the right folder:
   - General: `Y8.html` (Y7–Y9), `Y11.html` (Y11, Y13) · OCR pseudocode: `Pseudocode_Y11.html` · RS: `RS_*.html`
   - PRIMM Python lesson: `PRIMM_Python_Y8.html`, `PRIMM_Python_Y9.html`, or `PRIMM_Python_Y9_StationZero.html` for the Y9 story chapters (`/new-chapter`)
2. Fix the shared-file paths for the folder depth (templates assume one depth; PRIMM templates are lesson-level `../../../`, the others topic-level `../../`).
3. Fill in the `<!-- ACTIVITY -->` block at the top:
   ```html
   <!-- ACTIVITY
   title:  Activity Title
   type:   Practice or Challenge
   stars:  1-4
   desc:   Short description for the hub card
   color:  teal|amber|red|green|blue|cyan|purple|indigo
   -->
   ```
   Keep `ACTIVITY_TITLE` in the script identical to `title:`. `color:` is required but unused: the hub colours cards by topic.
4. Replace every `FILL IN` / `TODO` placeholder; update `TASK_COUNT` to match the tasks.
5. Add the tests (see Running and testing locally).
6. Push to main — the workflow rebuilds `activities.json` and `meta.json`.

## Adding a font

Any font with an open licence may be self-hosted: SIL Open Font License (OFL), Apache 2.0 or the Ubuntu Font Licence, which between them cover every Google Fonts family (check the licence file anyway). Never self-host a commercial font, or one whose licence forbids web embedding.

1. Download the **Latin** `.woff2` files from Google Fonts (one file per style for a variable font; otherwise one per weight/style the page uses) and the family's licence (`ofl/<family>/OFL.txt` in github.com/google/fonts). Keep files to Latin, so each is ~20–35 KB.
2. Put them in `fonts/<family>/` (lower-case, hyphens: `fonts/baloo-2/`) with the licence beside them. The licence must stay with the files.
3. Write `fonts/<family>.css`: one `@font-face` per file with `font-display: swap`, the weight range it covers, and a comment naming the licence. Copy `fonts/comic-neue.css`.
4. In the page, link that stylesheet and use the font with a system fallback after it: `font-family: 'Outfit', 'Segoe UI', sans-serif;`.

## Moving an Activity

Links to activities are already posted in Google Classroom, so a moved activity must keep working at its old URL. The `/move-activity` skill does all of this.

1. `git mv` the HTML (and any `checkers.js` / tests beside it) to the new folder; fix test imports and URLs.
2. Leave a redirect stub at the old path (see `Y9/Databases/Criminal_Database_Investigation.html`). It must contain a `<!-- REDIRECT` comment so the manifest build skips it, and it forwards with `location.replace(newPath + location.search + location.hash)` so `?courseId=…&proxyUrl=…` survive. Add the move to `MOVES` in `tests/redirect-stubs.spec.js`.
3. Add `<meta name="classroom-former-path" content="Y9/Old_Topic/File.html">` to the moved page's `<head>`. `classroom.js` matches Classroom assignments by link URL, so without it, grades from assignments posted with the old link would not be submitted.
4. localStorage progress is per-origin, so it carries over by itself.

## PRIMM Python lessons

Details of the PRIMM templates and the editor's trial features (`errorHints`, `memoryView`, `stepThrough`, teacher-gated skip/reset, Investigate tick-lists and scoring) are in `_templates/CLAUDE.md`; the Station Zero story layer for Y9 Python is in `Y9/Python/CLAUDE.md`. **Read the relevant one before building or changing a PRIMM lesson, a PRIMM template, or `code-editor.js`.**

- **When you change PRIMM logic or markup in one template, make the same change in the others** (`PRIMM_Python_Y8.html`, `PRIMM_Python_Y9.html`, `PRIMM_Python_Y9_StationZero.html`). `primm-templates.test.js` fails if the Y8 and Y9 module scripts differ; the Station Zero one is checked by hand.
- `errorHints` is opt-in; leave it **off for assessments**, where scaffolding the fix would undermine the task.
- Unit plans: `Knowledge Base/project_y8_python_unit1_mtp.md`, `Knowledge Base/project_y9_python_mtp.md`. Lesson decks: `_presentations/` (`/lesson-deck`).

## Year-Group Themes (shared.css)

`classroom.js` sets `data-year` and `data-topic` on `<body>` at load time from the URL path (e.g. `Y11/1.6 Legislation/file.html` → `data-year="11" data-topic="Legislation"`). **Do not set these attributes manually** in new activities. Explicit attributes on `<body>` still take precedence, so older activities are unaffected.

To add a new topic accent, append a `[data-year="…"][data-topic="…"]` rule to `shared.css`. Use its `ac-*` utility classes (buttons, banner, toast, progress bar, code block, `.sr-only`) and animations instead of re-implementing them inline.

## OCR Pseudocode Activities

Start from `_templates/Pseudocode_Y11.html`; it wires up `pseudocode-editor.js`. Its `// ── Mark scheme conventions (OCR J277)` block holds the marking conventions.

- Import from `../../pseudocode-editor.js` (topic-level) or `../../../pseudocode-editor.js` (lesson-level)
- Call `setupEditors('.pseudocode-textarea')` once on load, after any saved-state restore
- Call `preload()` from `pyodide-runner.js` so Pyodide is warm before the first Run click
- Use `runPseudocode(editorEl)` in Run button handlers; check `r.ok` before calling `markDone`
- Call `window.Classroom?.submitGrade(pct, ACTIVITY_TITLE)` inside `markDone` as usual

## Key Conventions

- **Self-contained logic**: each activity's HTML, questions and JS stay inline (plus its own `checkers.js`); the shared files above are the only other files it may reference
- **No external files**: no CDN scripts, stylesheets, fonts or third-party libraries (`activity-dependencies.test.js` fails on any `http(s)://` resource)
- **Fonts**: pick a system font stack (`'Segoe UI', system-ui, sans-serif`; `'Cascadia Mono', Consolas, monospace`) or a self-hosted font from `fonts/`, and always end with a system fallback. To add a font, see **Adding a font** below
- **Vanilla JS only**: no frameworks; direct DOM manipulation
- **Files/folders starting with `_`** are excluded from the manifest (`_drafts/` for WIP, `_templates/` for starters)
- **Folder structure determines metadata**: `Y8/` → "Year 8", topic folder → topic label, `L<n>_Name` → lesson subheading
- **Hub colours**: cards are coloured by topic. Programming topics (folder names matching `python|algorithm|oop|programming|pseudocode|sandbox`) always get a shade of blue; other topics take the next non-blue colour
- **Before finishing an activity**, run `/audit-activity <page>`: it checks these rules plus the house style for scoring, feedback and question design

## Mandatory: Grade submission and work evidence

Every activity **must** call `window.Classroom?.submitGrade(percent, activityName)` whenever a student completes a task — not just at the very end. This single call does two things:

1. **Submits the draft grade** to Classroom via the teacher's proxy (if configured)
2. **Uploads a work evidence snapshot** — an HTML report of the student's answers, code and choices — to the student's Google Drive and attaches it to their submission. The file is updated in place, so there is always exactly one attachment.

### Rules for calling `submitGrade`

- Call it inside `markDone()` (or equivalent) with the **current percentage**, not only in `allComplete()`:
  ```js
  const pct = Math.round(completed.filter(Boolean).length / TASK_COUNT * 100);
  window.Classroom?.submitGrade(pct, ACTIVITY_TITLE);
  ```
- The `activityName` string becomes the evidence file name — use the same string throughout the activity.
- `submitGrade` is a no-op without a `?courseId=` param, so it is safe to call unconditionally.
- Activities with custom scoring (weighted tasks, the 80 % completion + 20 % first-attempt mastery split in the general templates, PRIMM's `calcScore`) pass the real calculated percentage.
- Do **not** call `submitGrade` from inside `allComplete()` — `markDone` already fires it for the last task. Calling it twice wastes a Drive upload.

### The evidence report

`classroom.js` scrapes the live DOM for answers (text inputs, textareas, radio choices, `.code-checker` code, visible pass/fail) 2 s after the last `submitGrade` call. Standard `.q-card` / `.code-checker` / `.card`/`.mc-option` layouts need nothing extra; for custom layouts, put each answer inside a container with a visible heading or label so the scraper can name the question.

## Git

- `pull.rebase` is on for this repo: the manifest bot commits after every push, and rebasing keeps history free of "Merge branch 'main'" commits. `/ship` runs the related tests, commits, rebases, pushes and watches the deploy.
- `.claude/skills/` is committed (project skills: `/new-activity`, `/new-chapter`, `/audit-activity`, `/move-activity`, `/test-page`, `/ship`, `/lesson-deck`, `/log-feedback`, `/story-stills`); the rest of `.claude/` is personal and ignored.
