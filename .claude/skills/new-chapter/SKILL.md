---
name: new-chapter
description: Build the next Y9 Python "Station Zero" PRIMM chapter (a story-threaded lesson page) from the MTP — page, checkers.js, unit tests, Playwright spec, story beats, CAMS still slots and image prompts. Use when asked to build, start or make Lesson N / the next chapter of the Y9 Python unit or a new Station Zero lesson.
argument-hint: <lesson number, e.g. 4> [chapter name]
---

# New Station Zero chapter

Build Y9 Python Lesson `$ARGUMENTS` as a Station Zero chapter. This is a large build: plan
first, show the plan, then build in the order below, running tests as you go.

## 0. Read first (all of it, every time)

- `Y9/Python/CLAUDE.md` (the story layer) and `_templates/CLAUDE.md` (PRIMM engine, scoring,
  tick-lists, step-through, memory view).
- `Knowledge Base/project_y9_python_mtp.md`: the lesson's section, "Narrative thread",
  "Chapter map", "Choices and the crew count", "Choices plan, L2–L7" (this chapter's three
  choices and what earlier choices it reads), "Rules for keeping the story low-load and
  safe", "Build notes" (proposed path) and every dated "Decisions" section.
- `_presentations/Y9_Python/README.md` feedback log (the deck and the page should teach the
  same things in the same order).
- The previous chapter's page, `checkers.js`, `checkers.test.js` and `tests/*.spec.js`.

## 1. Start from the previous chapter, not the template

L2 was built from Life Support and L3 from Proximity, because the latest chapter has
`runCode`, both "Your call" cards, the crisis card and the Drive sync, which
`_templates/PRIMM_Python_Y9_StationZero.html` still lacks. Copy the latest chapter's page
into the MTP's proposed path, then replace, in this order:

1. **Identity:** ACTIVITY block, `<title>`, `STORAGE_KEY`, `ACTIVITY_TITLE`, objective text,
   the chapter's `--canvas` tint (each chapter has its own; pick one not used yet), and the
   `LIGHT MODE` block's chapter tint.
2. **PRIMM content** (Predict 3–4 questions, Run, Investigate steps with tick-lists, Modify,
   Make, Extension), following the MTP. Keep the rules in "Content rules" below.
3. **checkers.js** with the same export shape as the previous chapter: `normalise`, `has`,
   `INV_CHECKS` + `evalInv`, `isBugFixed`, `MOD_TEST_BANK`/`MOD_CHECKS`/`evalMod`,
   `MAKE_TEST_BANK`/`MAKE_CHECK`/`evalMake`, `EXT_TEST_BANK`/`EXT_CHECK`/`evalExt`. Each bank has
   5–10 answer sets, each one person's answers that fit the story together, with boundary
   values in every set.
4. **Story script:** `STORY` (beats `intro`, `P`, `R`, `I1`, `I`, `M1`, `M2` — check `ORDER`),
   `CAMS` (one entry per beat, `src: ''`, a distinct `label` and `alt`), `SCENES` for the live
   feed, `STORY.crew(choices, seen)` gated on the report that reveals each change, the intro's
   `previously` (1–2 one-sentence bullets, in variants so it follows earlier choices), and
   `CHOICE` / `CRISIS` / the `#m2_choice` options for this chapter's three choices.
5. **Image prompts:** add the chapter's section to `_drafts/story/PROMPTS.md` (one prompt per
   `CAMS` key, same shape as the others, with file name and `add_still.py` command).

## 2. Content rules (from the user's feedback)

- Each Modify step adds code at the bottom and never asks for a variable to be used above where
  it's made. Fade the scaffold: early steps show the code; later steps name the exact task and
  check it, with no code in the task or its hints. Start Modify with a trivial step.
- Checkers accept any valid solution shape: check for the concept (an `input()` assigned and
  reused, a condition with the right boundary), never a fixed variable name or print wording.
  Behaviour-check by running the program with the test bank.
- The Break-it step's `isBugFixed` requires the fixed line, so deleting the broken line never
  passes (unless deleting it is the fix).
- MCQ options of equal length; the correct one is not usually the longest.
- Story text short: reports are a few lines, `previously` 1–2 short bullets. The story lives in
  reports and "Your call" cards only; Python errors stay real Python.
- Both options of every choice pass; the second choice can recover a bad first one.

## 3. Tests

- `checkers.test.js`: every check passes for at least two different valid solutions and fails
  for the common wrong ones; every bank set passes the model answer.
- `tests/<chapter>-primm.spec.js` modelled on the previous chapter's spec: open with
  `?step=off&answers=fixed&story=off`, wait for `#pyStatusText` "ready" (60 s), cover stage
  flow, one happy path per checker, the choice cards locking and one story report.
- Run `npx vitest run Y9/Python` and `npx playwright test tests/<chapter>-primm.spec.js`.

## 4. Record it

- MTP: change the lesson's "Build notes" row to "Built <today>" and add a short bullet list of
  what was built (match the L2/L3 entries), plus anything that changed from the plan.
- `Y9/Python/CLAUDE.md`: only if this chapter adds a new mechanism (not to list the chapter).
- Tell the user what to do next: `/story-stills <page>` for the pictures, `/lesson-deck <n>`
  for the deck.
