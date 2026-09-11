---
name: y8-python-unit1-mtp
description: "Y8 Python \"first contact\" Unit 1 — 7-lesson research-led medium-term plan (PRIMM, reading-before-writing); reference when building/sequencing the Y8 Python intro activities."
metadata:
  type: project
---

# Y8 Python Unit 1 — Medium Term Plan

**Scope:** First-contact introduction to Python for Year 8. 7 × 1-hour lessons (weekly). Depth-over-breadth: stop at binary `if`/`else` selection; `elif`/multi-way selection and iteration deferred to a later unit. 5 teaching lessons + 1 assessment + 1 DIRT.

**Revision history:** originally 6 lessons (4 teaching). After piloting Lesson 2 ("Variables & input" combined), many students got stuck — variables and input() introduced together, plus the objective/modify checkers were too rigid about *how* the correct answer had to be written (there is always more than one valid solution). Split into two lessons: L2 is now variables + print only (no input at all), L3 is a new lesson dedicated purely to input(). Unit grew from 6 to 7 lessons as a result — chosen deliberately over cramming input() into the data-types lesson, since the extra week was available in the scheme of work.

## Research basis (applies to every lesson)
- **Reading/tracing precede writing** (Lister/BRACElet hierarchy: read → trace → explain → write). Biggest lever.
- **PRIMM** (Sentance, Waite & Kallia 2019) operationalises it: Predict → Run → Investigate → Modify → Make. Each teaching lesson runs a **complete but small** PRIMM cycle so the ownership gradient (code "not yours" → "yours") transfers within the concept. Never skip the front stages and rush to Make; Make grows in scope across the unit.
- **Cognitive Load Theory** (Sweller): worked examples with faded guidance, sub-goal labelling (Margulieux & Catrambone). One genuinely new concept per lesson — do not introduce two (e.g. variables + input) in the same cycle.
- **Notional machine** (du Boulay): repeated explicit tracing ("play computer") to build a mental model of execution.
- **Live coding, not slides** (Raj et al.; Sentance): demonstrate by typing, including making/fixing mistakes.
- **Variation theory** (Marton): hold most of the program constant, vary one thing.
- **Retrieval & spacing**: every lesson opens with low-stakes recall of prior lessons, not just last lesson.

## Errors / debugging — decision
Taught **explicitly but embedded**, never siloed. Introduce a small **debugging recipe** in Lesson 1 (e.g. *Read the last line → find the line number → read that line aloud → compare to what you meant*), keep it on the wall, and **plant a deliberate bug in the Investigate step of every cycle** so error-reading is practised across the unit. Evidence: Michaeli & Romeike (2019) — explicit systematic debugging process helps, but only when applied continuously.

## Checker/objective design — decision (added after L2 pilot)
Automated "Modify"/"Make" checkers must accept the **shape** of the target concept, not one specific phrasing of it. Never require a specific variable name, one exact print format, or a single ordering when several are equally valid Python. When a checker must reject something, the failure message should name the concrete thing still missing, not just "objective not met". Order Modify tasks from a genuinely trivial first step (one new input/variable + one direct print, no `+` needed) up to the harder combined step — do not open Modify with the hardest requirement of the lesson.

## PRIMM does NOT structure the assessment or DIRT lessons
PRIMM is for learning new programming through reading-to-writing. Assessment = measurement; DIRT = feedback-action. The creative task in DIRT is the legitimate unit-level "extended Make".

---

## Lessons 1–5 — complete small PRIMM cycle each

### Lesson 1 — Output & sequence
- **Declarative:** a program is an ordered sequence run top-to-bottom; `print()` shows output; strings need quotes; syntax must be exact; an error message is information.
- **Procedural:** run a program; edit/add `print`; use quotes; apply the debugging recipe (introduced here).
- **Predict:** output of a 3–4 line `print` program (incl. one reordered line).
- **Run:** execute; check against prediction.
- **Investigate:** *What does `print` do? What do the quotes do? Does order matter?* **Planted bug:** a missing quote → read the `SyntaxError` with the recipe.
- **Modify:** change the text; add a line; reorder two lines and predict the new output.
- **Make:** a 3-line program printing their own name / favourite thing / a fact.

### Lesson 2 — Variables (no input — deliberately separated from Lesson 3)
- **Declarative:** a variable is a named box holding one value; `=` means "store right-into-left" (not equality); a variable can be **overwritten** by reassigning it — the old value is gone; `+` joins strings.
- **Procedural:** declare/assign; trace a variable's value in a table; reassign an existing variable; concatenate with `+`; print the same variable more than once.
- **Predict:** trace `name = "Sam"` … `greeting = "Hello "` … `print(greeting + name)`.
- **Run:** confirm.
- **Investigate:** *What's in the box at each line?* (tracing table). *What does `=` do? What happens to the old value when you reassign a variable?* **Planted bug:** using a variable before it has been assigned → `NameError` (no `input()` needed for this — a plain assignment-order bug).
- **Modify:** change a stored value; add a second variable; **reassign** an existing variable partway through the program and print it again (see that the earlier `print()` already used the old value — order matters); alter the concatenation.
- **Make:** a short "profile card" built entirely from variables **set directly in the code** (name, favourite subject, house, …), printed combined with `+`. No `input()` anywhere — everything is hard-coded on purpose, so the lesson stays 100% about variables.

### Lesson 3 — Input (NEW — split out of the old combined Lesson 2)
- **Declarative:** `input()` pauses the program and waits for the user to type; whatever they type becomes the value `input()` returns; that value is normally stored in a variable with `=`; the text inside the brackets, e.g. `input("What is your name? ")`, is just a prompt message — it is not stored anywhere.
- **Procedural:** call `input()` with a clear prompt; store the result in a variable; use that variable in a `print()`; ask more than one question in the same program.
- **Predict:** a short program with one `input()` and a `print()` using the result — predict what appears when a given answer is typed.
- **Run:** actually type an answer and see it appear (first time students see a program pause and wait for them).
- **Investigate:** *What does the text inside `input("...")` actually do — does changing it change what's stored?* *What happens if you leave the answer blank?* **Planted bug:** printing a variable name that doesn't match the one `input()` was assigned to → `NameError`.
- **Modify:** change the question wording; ask a **second** question with a new `input()` and print it too (two inputs, two separate prints — deliberately trivial first step, no `+` required); then join one answer into a sentence with `+`; then reuse an answer in two different prints.
- **Make:** ask three questions with `input()` and print them back as a short interactive profile/greeting — mirrors Lesson 2's Make but now interactive.

### Lesson 4 (was Lesson 3) — Data types, casting & arithmetic
- **Declarative:** values have types (`int`, `str`); `input()` always returns a string; `+ - * /`; `"5"+"5"` ≠ `5+5`; must cast with `int()` to do maths on input.
- **Procedural:** identify a value's type; cast input; do calculations; predict concatenation vs addition.
- **Predict:** output of `"5" + "5"` vs `5 + 5`, then a program adding two *inputs* (the surprise).
- **Run:** see it concatenate / error.
- **Investigate:** *Why? Because input is a string.* Name the misconception. **Planted bug:** `int + str` → `TypeError`, fixed by casting.
- **Modify:** add `int()` casts to fix it; swap the operator.
- **Make:** ask for two numbers and print their (correctly cast) sum.

### Lesson 5 (was Lesson 4) — Selection (`if`/`else`, binary only)
- **Declarative:** programs choose between paths; conditions are True/False; comparison operators (`== < > >= <=`); `==` vs `=`; indentation defines the block.
- **Procedural:** write and trace an `if`/`else`; build a condition; indent correctly; predict which branch runs.
- **Predict:** for a pass/fail (or age-check) program, which branch runs for 2–3 given inputs?
- **Run:** confirm for each input (so they see *both* branches fire).
- **Investigate:** *What makes the condition True/False?* **Planted bugs:** `IndentationError` and `=` vs `==`.
- **Modify:** change the threshold; change the messages; flip the comparison.
- **Make:** "enter your score → print Pass or Fail" — first owned program with a decision.

---

## Lesson 6 (was Lesson 5) — Assessment (not PRIMM)
Sample across the unit, **weighted toward reading, tracing and spot-and-fix**, with **one** short write task. Formats: what is the output / complete the missing line / trace the variable / find and fix the bug. Tests the notional machine, discriminates better between novices, lower anxiety. Low-stakes, criterion-referenced.

## Lesson 7 (was Lesson 6) — DIRT + creative Make (not a PRIMM cycle; is the unit-level extended Make)
Ringfenced time to **act on specific feedback** from Lesson 6 (fix the exact things they got wrong), then a short **creative selection program** of their own. Feedback only works when time is ringfenced to use it (Wiliam; Hattie).

## Assessment / SRT arrangement
Default best practice: **separate** assessment (L6) and DIRT (L7) so there is a marking window to give *specific* feedback. Blending into one hour is only defensible if the assessment is self/peer-marked live against a visible mark scheme.
