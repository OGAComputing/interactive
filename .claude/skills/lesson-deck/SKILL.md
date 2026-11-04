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
  "Images to supply" list the build prints before filling the slides. One deck per lesson, even in a
  double.
- Other units: follow §9 of `ppt-guidelines.md` and copy the nearest existing build script.
- Build: `node build_L<n>.cjs` in the unit folder (needs `npm install -g pptxgenjs`). If it
  can't save, the deck is open in PowerPoint: ask the user to close it.

## Check

- Render: `soffice --headless --convert-to pdf <deck>.pptx`, then turn pages into images with
  Python `pdfplumber` (pdftoppm isn't installed on this machine) and look at every slide.
- Check against the feedback log: whole lines of code, labels right beside what they label,
  ≤ 3 text areas, no split attention, no redundancy (nothing on screen that you will say), story
  only on title / story-so-far / chapter cards / plenary, damage only in the frame.
- **Expertise reversal:** check the support against what the class already knows (the MTP and
  earlier decks). No full worked example, labels or step prompts for anything taught and secured in
  an earlier lesson; keep them for what is new. See `ppt-guidelines.md` §5.
- **Define before use:** read the slides in order. No technical term or concept appears on a slide
  (labels, prompts, hinge options, task steps) before the slide that introduces or defines it. The
  lesson-question slide may pose it; speaker notes don't count. Move the defining slide earlier, or
  reword the earlier slide in plain words.
- Y10 decks: check in PowerPoint itself with `render_slides.ps1` (the README says how).
- Fix and rebuild until clean. Report the slide list (number · recipe · one-line purpose).

## Publish (Y10 BTEC and Y9 Python)

Once the deck is clean, run `node publish_to_drive.cjs L<n>_<Name>.pptx` in the unit folder
(`_presentations/Y10_BTEC_CDM/` or `_presentations/Y9_Python/`). It rebuilds the deck from its builder, then uploads it (and its `resources/<deck name>/`) to the unit's
Drive folder as Google Slides (Y9 also records it in `lesson-slides.json`). Report the Slides and folder links it prints. If it says the OAuth
client is missing, point the user to "Publishing to Drive" in `Y10_BTEC_CDM/README.md`.

If the user gives feedback on a deck, also run `/log-feedback`.
