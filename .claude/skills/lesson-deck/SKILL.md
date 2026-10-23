---
name: lesson-deck
description: Build or update a PowerPoint lesson deck with the approved pptxgenjs build system (Five Pillars slide order, Station Zero recipes for Y9 Python), then render it to images and check it. Use when asked to make, build, update or fix a lesson deck, slides or PowerPoint for a lesson in this repo.
argument-hint: <unit, e.g. Y9_Python> <lesson number> [what to change]
---

# Lesson deck

Build or update the deck for `$ARGUMENTS`.

## Read first

- `_presentations/ppt-guidelines.md` — all of it; §9 is the approved build system (slide order,
  pillar icons, palette, fonts, ≥ 18 pt body, icon rules).
- For Y9 Python: `_presentations/Y9_Python/README.md` — files, slide order, the recipes in
  `sz_slides.cjs`, station state per chapter, and the **Rules and feedback log** (every rule
  there applies).
- The lesson's activity page and its MTP section, so the deck teaches exactly what Predict,
  Run and Investigate need, in the same order and with the same code.

## Build

- New lesson: copy the latest `build_L<n>.cjs` to `build_L<n+1>.cjs`; change the output name,
  footer, `createDeck({ station: 'L<n+1>' })` and content; keep the slide order. One recipe call
  per slide, with speaker notes. Draw by hand only when no recipe fits, using `sz_kit.cjs`
  parts (`varBox`, `codePanel`, `terminal`, `badge`, `arrow`).
- Y10 BTEC Component 1: read `_presentations/Y10_BTEC_CDM/README.md` and `Y10/CLAUDE.md`; copy
  `build_template.cjs` to `build_L<n>.cjs`, keep only the recipes the lesson needs, and send Nick the
  "Images to supply" list the build prints before filling the slides.
- Other units: follow §9 of `ppt-guidelines.md` and copy the nearest existing build script.
- Build: `node build_L<n>.cjs` in the unit folder (needs `npm install -g pptxgenjs`). If it
  can't save, the deck is open in PowerPoint: ask the user to close it.

## Check

- Render: `soffice --headless --convert-to pdf <deck>.pptx`, then turn pages into images with
  Python `pdfplumber` (pdftoppm isn't installed on this machine) and look at every slide.
- Check against the feedback log: whole lines of code, labels right beside what they label,
  ≤ 3 text areas, no split attention, story only on title / story-so-far / chapter cards /
  plenary, damage only in the frame.
- Fix and rebuild until clean. Report the slide list (number · recipe · one-line purpose).

If the user gives feedback on a deck, also run `/log-feedback`.
