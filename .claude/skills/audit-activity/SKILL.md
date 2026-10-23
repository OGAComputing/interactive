---
name: audit-activity
description: Check one activity page against the repo's rules and the teacher's house style (grade submission, shared-file paths, no CDN, scoring and green/gold, per-question highlighting, MCQ answer lengths, real understanding checks, PRIMM flow and checker flexibility, light mode) and report what fails. Use when asked to audit, review, check or QA an activity, or before finishing a new one.
argument-hint: <page.html> [--fix]
---

# Audit an activity

Audit the page in `$ARGUMENTS`. Read the **whole** page (and its `checkers.js`) first. Report
findings as a table: rule · ✅/❌/n/a · where (`file:line`) · what to change. Only fix things
when `--fix` was passed or the user asks; then fix, re-run tests, and re-report.

## Platform rules (CLAUDE.md)

1. `<!-- ACTIVITY -->` block present with title/type/stars/desc/color; `ACTIVITY_TITLE` ===
   `title:`; no `FILL IN` / `TODO` left (`grep -n "FILL IN\|TODO"`).
2. `classroom.js` and `activity-ui.js` loaded, at the right depth (`../../` topic,
   `../../../` lesson). `error-reporter.js`, if present, loads before `activity-ui.js`.
3. Only allowed shared files referenced. **No CDN / external URLs** (`grep -n "https\?://"`
   in `src=`/`href=`/`@import`; Google Fonts counts). Fonts are a system stack or a self-hosted
   `fonts/<family>.css` (CLAUDE.md "Adding a font"), always followed by a system fallback.
4. `submitGrade(pct, ACTIVITY_TITLE)` is called in `markDone` (or equivalent) with the real
   current percentage, and **not** again from `allComplete`/`allDone`.
5. No hard-coded `data-year` / `data-topic` on `<body>`.
6. Every answer sits in a container with a visible heading/label (evidence scraper).
7. Progress saved to localStorage on every change, under a key no other page uses.

## Scoring and feedback

8. **Green/gold:** `firstAttempt[]` per scoreable task, set false on a wrong answer before
   `markDone`, never reset to true. Score = done/TASK_COUNT×80 + mastered/TASK_COUNT×20.
   Code tasks are auto-gold; open-text, PRIMM Predict and Run are excluded. All-done shows the
   banner, `#glow-overlay` (gold/green) and confetti in the matching palette.
   PRIMM pages instead use `calcScore` (Predict 10, Run 5, Investigate 35, Modify 30, Make 15,
   Extension 5).
9. **Per-question highlighting:** every Check marks each question `.is-correct` / `.is-wrong`
   (or `.ans-correct` / `.ans-wrong` on inline selects/inputs), and Reset removes both.

## Question design

10. **MCQ lengths:** for each question, compare option lengths. ❌ if the correct option is the
    longest in ≥ 50% of questions. List each offending question.
11. **Real understanding checks:** no step passes on a button press alone. Guessing costs
    something (checkpoint chains, escalating 10/20/30 s cooldowns that survive refresh,
    lockouts). Order of options/cards is randomised per student (seeded, saved) and never in
    question order. Drag-and-drop preferred over dropdowns. Open text needs a "real sentence"
    check (4+ words, not repeated or mashed).

## PRIMM pages (also read `_templates/CLAUDE.md`)

12. One question on screen, auto-advance after 1.5 s, Back/Forward bar; Run/Investigate laid out
    instruction → editor → answer card.
13. Investigate/Modify are additive (never "start fresh"); each code-change `<li>` has a matching
    `INV_CHECKS` req; Break-it `isBugFixed` requires the fixed line.
14. Modify starts trivially, adds code at the bottom, fades the scaffold (later steps: exact task,
    no code in task or hints).
15. Checkers accept any valid solution shape (no fixed variable names or print wording): read
    `checkers.js` and try two alternative valid solutions in your head (or in `checkers.test.js`).
16. `errorHints` off on assessments.
17. Pages loading `theme-toggle.js` have an `html[data-theme="light"]` palette with text pairs
    ≥ 4.5:1.

## Station Zero pages (also read `Y9/Python/CLAUDE.md`)

18. Story text short (`previously` ≤ 2 one-sentence bullets); every beat has a `cam`; both
    options of each choice pass; `STORY.crew` only changes on the report that reveals it.

Finish by running the page's tests (`/test-page <page>`) and stating the result.
