---
name: new-lesson
description: Build a whole lesson in one go: its interactive activity page (via /new-chapter or /new-activity), its tests, then its PowerPoint deck (via /lesson-deck) built from the finished page, then an audit. Use when asked to make, build or prepare a lesson with both the activity and the slides/deck/PowerPoint. For only a page use /new-activity or /new-chapter; for only a deck use /lesson-deck.
argument-hint: <unit, e.g. Y9_Python | Y10_BTEC | Y8_Python> <lesson number> [lesson name]
---

# New lesson (page + deck)

Build lesson `$ARGUMENTS`: the activity page first, then the deck from it. This skill only
sets the order. Every rule lives in the skills it calls, so follow each one in full and don't
restate or shortcut its rules here.

## 0. Work out the lesson

- Find the unit's MTP in `Knowledge Base/` (`project_*_mtp.md`) and read the lesson's section.
  If there's no MTP section for the lesson, or the unit or lesson number is missing, ask in one
  question before building anything.
- Pick the page skill:
  - Y9 Python (Station Zero) → `/new-chapter <n>`
  - everything else → `/new-activity <path> "<title>"`, with the path from the MTP's build
    notes or the unit's existing folders (Y10 BTEC: lesson-level, see `Y10/CLAUDE.md`)
- Show the user a short plan (page path, deck file, what each covers) and go on unless they
  object.

## 1. Page

- Run the page skill. With `/new-activity`, write the content from the MTP section rather than
  leaving `FILL IN`s, following `/audit-activity`'s rules.
- Run `/test-page <page>` and fix what fails.

## 2. Checkpoint

Stop and give the user the URL to open (`node test-server.mjs` →
`http://localhost:3000/<path>`). The deck has to teach what the finished page asks, in the same
order and with the same code, so wait until they've looked at the page and are happy with it
before building the deck. If they ask for changes, make them and re-run `/test-page` first.

## 3. Deck

- Run `/lesson-deck <unit> <n>`, building from the page as it is now (it reads the page and
  the MTP section itself).
- Check the deck against the page: every code sample, term and question the page's
  Predict/Run/Investigate (or Task 1…) stages need is on a slide before students meet it, and
  nothing on the slides contradicts the page.

## 4. Finish

- Run `/audit-activity <page>` and fix what fails.
- Report, in this order:
  - the page path and URL
  - the deck file
  - the test results
  - the audit result
  - what's left for the user: `/story-stills <page>` for Y9 Station Zero, the "Images to
    supply" list for Y10, any `FILL IN`s
- Commit only if asked (`/ship` does it).
