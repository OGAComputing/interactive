---
name: y8-python-unit1-mtp
description: "Y8 Python \"first contact\" Unit 1 — 6-lesson research-led medium-term plan (PRIMM, reading-before-writing); reference when building/sequencing the Y8 Python intro activities."
metadata: 
  node_type: memory
  type: project
  originSessionId: 332d664d-6d18-4af9-b292-b1262a024543
---

# Y8 Python Unit 1 — Medium Term Plan

**Scope:** First-contact introduction to Python for Year 8. 6 × 1-hour lessons (weekly). Depth-over-breadth: stop at binary `if`/`else` selection; `elif`/multi-way selection and iteration deferred to a later unit. 4 teaching lessons + 1 assessment + 1 DIRT.

## Research basis (applies to every lesson)
- **Reading/tracing precede writing** (Lister/BRACElet hierarchy: read → trace → explain → write). Biggest lever.
- **PRIMM** (Sentance, Waite & Kallia 2019) operationalises it: Predict → Run → Investigate → Modify → Make. Each teaching lesson runs a **complete but small** PRIMM cycle so the ownership gradient (code "not yours" → "yours") transfers within the concept. Never skip the front stages and rush to Make; Make grows in scope across the unit.
- **Cognitive Load Theory** (Sweller): worked examples with faded guidance, sub-goal labelling (Margulieux & Catrambone).
- **Notional machine** (du Boulay): repeated explicit tracing ("play computer") to build a mental model of execution.
- **Live coding, not slides** (Raj et al.; Sentance): demonstrate by typing, including making/fixing mistakes.
- **Variation theory** (Marton): hold most of the program constant, vary one thing.
- **Retrieval & spacing**: every lesson opens with low-stakes recall of prior lessons, not just last lesson.

## Errors / debugging — decision
Taught **explicitly but embedded**, never siloed. Introduce a small **debugging recipe** in Lesson 1 (e.g. *Read the last line → find the line number → read that line aloud → compare to what you meant*), keep it on the wall, and **plant a deliberate bug in the Investigate step of every cycle** so error-reading is practised four times. Evidence: Michaeli & Romeike (2019) — explicit systematic debugging process helps, but only when applied continuously.

## PRIMM does NOT structure the assessment or DIRT lessons
PRIMM is for learning new programming through reading-to-writing. Assessment = measurement; DIRT = feedback-action. The creative task in DIRT is the legitimate unit-level "extended Make".

---

## Lessons 1–4 — complete small PRIMM cycle each

### Lesson 1 — Output & sequence
- **Declarative:** a program is an ordered sequence run top-to-bottom; `print()` shows output; strings need quotes; syntax must be exact; an error message is information.
- **Procedural:** run a program; edit/add `print`; use quotes; apply the debugging recipe (introduced here).
- **Predict:** output of a 3–4 line `print` program (incl. one reordered line).
- **Run:** execute; check against prediction.
- **Investigate:** *What does `print` do? What do the quotes do? Does order matter?* **Planted bug:** a missing quote → read the `SyntaxError` with the recipe.
- **Modify:** change the text; add a line; reorder two lines and predict the new output.
- **Make:** a 3-line program printing their own name / favourite thing / a fact.

### Lesson 2 — Variables & input
- **Declarative:** a variable is a named box holding one value; `=` means "store right-into-left" (not equality); `input()` pauses and reads text; `+` joins strings.
- **Procedural:** declare/assign; trace a variable's value in a table; use `input()`; concatenate; name variables sensibly.
- **Predict:** trace `name = "Sam"` … `print("Hello " + name)`.
- **Run:** confirm.
- **Investigate:** *What's in the box at each line?* (tracing table). *What does `=` do? What does `input()` do?* **Planted bug:** using a variable before assignment → `NameError`.
- **Modify:** change the stored value; add a second variable; alter the concatenation.
- **Make:** ask the user's name and greet them.

### Lesson 3 — Data types, casting & arithmetic
- **Declarative:** values have types (`int`, `str`); `input()` always returns a string; `+ - * /`; `"5"+"5"` ≠ `5+5`; must cast with `int()` to do maths on input.
- **Procedural:** identify a value's type; cast input; do calculations; predict concatenation vs addition.
- **Predict:** output of `"5" + "5"` vs `5 + 5`, then a program adding two *inputs* (the surprise).
- **Run:** see it concatenate / error.
- **Investigate:** *Why? Because input is a string.* Name the misconception. **Planted bug:** `int + str` → `TypeError`, fixed by casting.
- **Modify:** add `int()` casts to fix it; swap the operator.
- **Make:** ask for two numbers and print their (correctly cast) sum.

### Lesson 4 — Selection (`if`/`else`, binary only)
- **Declarative:** programs choose between paths; conditions are True/False; comparison operators (`== < > >= <=`); `==` vs `=`; indentation defines the block.
- **Procedural:** write and trace an `if`/`else`; build a condition; indent correctly; predict which branch runs.
- **Predict:** for a pass/fail (or age-check) program, which branch runs for 2–3 given inputs?
- **Run:** confirm for each input (so they see *both* branches fire).
- **Investigate:** *What makes the condition True/False?* **Planted bugs:** `IndentationError` and `=` vs `==`.
- **Modify:** change the threshold; change the messages; flip the comparison.
- **Make:** "enter your score → print Pass or Fail" — first owned program with a decision.

---

## Lesson 5 — Assessment (not PRIMM)
Sample across the unit, **weighted toward reading, tracing and spot-and-fix**, with **one** short write task. Formats: what is the output / complete the missing line / trace the variable / find and fix the bug. Tests the notional machine, discriminates better between novices, lower anxiety. Low-stakes, criterion-referenced.

## Lesson 6 — DIRT + creative Make (not a PRIMM cycle; is the unit-level extended Make)
Ringfenced time to **act on specific feedback** from Lesson 5 (fix the exact things they got wrong), then a short **creative selection program** of their own. Feedback only works when time is ringfenced to use it (Wiliam; Hattie).

## Assessment / SRT arrangement
Default best practice: **separate** assessment (L5) and DIRT (L6) so there is a marking window to give *specific* feedback. Blending into one hour is only defensible if the assessment is self/peer-marked live against a visible mark scheme.
