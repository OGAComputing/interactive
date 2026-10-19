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

**Revised after the first sitting (class mean 37%, 14/38).** Items under ~40% were trap-heavy, not skill-heavy: the trace's self-join (`owner = owner + "my"`, 9%), the no-space join `"Hello" + name` (0%), predicting `print("city")` (24%), picking `==` from four lines (24%), quoted-text rules on trace boxes, and the game shop from a blank editor (27%). Changes: the trace only reassigns; the space is inside the quotes; quotes are optional on trace values; quotes-vs-variable and `==` became recognition questions; two `num` sort cards became plain text-vs-number ones; the game shop starter has step comments. Each lesson section now ends with a 2-mark **"Write it"** task (two print lines; a variable; input + hello; int() for next year's age; a PIN if/else) — easy marks for writing code. Sections 1–2 also have two 1-mark guided tasks (type `print("Hello, world!")`; change `pet = "cat"` to dog), and the early tasks (those two, two lines, a variable, input + hello) show a **💡 How to do it** box with an example, to build confidence. Total 38 → 51. The removed traps are still practised in L7's checkpoint pools.

**Second sitting (revised version, est. ~50–55%).** The guided tasks were near ceiling as intended; the casting/selection code and the game shop were reached by only about half the class. The trace's chef "Al" was read as "AI", so it became "Ed" (and L7's `"Al" + "ex"` became `"Jo" + "sh"`). The evidence report now labels every answer with its question number, and hidden `textarea[data-evidence]` fields record the version of a randomised question each student got (MCQ/trace) and where each sort card was put. They never include the right answer, because students can open the doc mid-test.

**Third version (after marking all 54 second-sitting docs; real mean 47%, range 8–96%).** The bottom third (<33%) answered the multiple-choice questions to the end but left 88–94% of the code from Casting onwards untouched; only 7 students ran out of time. Changes: Casting and Selection now OPEN with a guided 1-mark task with a How-to box (`c_guide`: put int() round input() so 5 doubles to 10; `s_guide`: add the else); trace boxes forgive capital letters (20 students lost a mark for "tom"/"jo"); the printed lines now come before the boxes, which ask about "after the last line" (17 of 28 who printed "Al cooks pasta" still put pizza in the box); the input trace names the typed value in the question; `v_order` and `c_str` (near-zero discrimination) are `retired: true` — kept in ITEMS, not shown or marked (`LIVE_ITEMS`). Still 51 marks (L1 8, L2 8, L3 6, L4 10, L5 11, write 8). The assessment now saves `ver: 3`; L7's `SITTINGS` (1, 2, 3) route and number each student on the version they sat, so the 13 Oct classes still get v_order/c_str in L7.

**Fourth version (after the third sitting, 19 Oct 2026: 25 students, mean 38%, median 35%, no one in the 50s).** Questions that didn't change also scored lower than on 13 Oct, so the lower mean is mostly this group (the Selection multiple-choice questions were at or below chance). The 11 students under 33% averaged 12/51, still well under a third. What the third version's changes did:
- Case-forgiving boxes worked: the box that doesn't change rose from 48% to 88%.
- Putting the printed lines first backfired. The changing box didn't move (28%), and the printed lines fell from 52% to 22%: students typed the program's line 1 and 2, or a box value.
- The guided tasks were left untouched by the low group. Make it a number: 0 of 11. Add the else: 3 of 11 changed it.

The teacher also saw students type the answer into the code (`print(5 + 3)`, `print("13")`) instead of using the variables.

Changes, 53 marks (Casting 11, Selection 12):
- The boxes come first again; the printed rows are labelled "1st print" and "2nd print".
- New pick-the-line questions (`c_pick`, `s_pick`) open Casting and Selection, before the guided tasks.
- `c_join` (never separated strong from weak) is retired. `c_total` replaces it: which last line works whatever is typed, with a typed-in-numbers distractor.
- The add-the-else mark accepts any message in the else.
- Every code task that starts from code has a worked example in a different program, shown straight under the goal.
- A program that prints the same thing whatever is typed is told to use the variables.

The assessment saves `ver: 4`; L7 `SITTINGS` has entries 1–4.

## Lesson 7 (was Lesson 6) — DIRT + creative Make (not a PRIMM cycle; is the unit-level extended Make)
Ringfenced time to **act on specific feedback** from Lesson 6 (fix the exact things they got wrong), then a short **creative selection program** of their own. Feedback only works when time is ringfenced to use it (Wiliam; Hattie).

## Assessment / SRT arrangement
Default best practice: **separate** assessment (L6) and DIRT (L7) so there is a marking window to give *specific* feedback. Blending into one hour is only defensible if the assessment is self/peer-marked live against a visible mark scheme.

## Lesson 6 — built (2026-10-09)
Built as `Y8/Python Unit 1/L6_Assessment/1_Python_Assessment.html` (questions + marking in `checkers.js`, tests in `checkers.test.js` and `tests/unit1-assessment.spec.js`). 51 marks across one section per lesson (L1 8, L2 9, L3 6, L4 10, L5 10, each ending with "Write it" tasks) + Write 8 (warm-up edit 2, game-shop program 6). ★ speed-camera extension = 4 bonus marks outside the %. One-try MCQ/trace/sort (lock saved immediately), per-student versions + option order from a saved seed, behaviour-based code marking with best mark kept. 💡 Get help (errorHints) is ON in the code editors at the teacher's request: it explains what a Python error means, while the requirement messages still never say how to meet a requirement. **For L7 DIRT:** state in localStorage `oga_y8u1_assess_v1` (`pts` per item id, item ids prefixed by section: o_/v_/i_/c_/s_/w_), and `Classroom.submitResults({ points, sections:{id:{earned,max}}, earned, max, pct, bonus }, "Unit 1 Assessment — Python First Steps")` → route the lowest `sections` first.

## Lesson 7 — built (2026-10-09)
Built as `Y8/Python Unit 1/L7_Targeted_Practice/1_Targeted_Practice.html` (targets, pools + marking in `checkers.js`, which imports the L6 question bank from `../L6_Assessment/checkers.js`; tests in `checkers.test.js` and `tests/unit1-targeted-practice.spec.js`). Every core assessment item maps to exactly one of 9 targets (print, errors, variables, input, cast_int, cast_str, branches, conditions, write). Plan = 3 targets with the lowest share of marks (ties → earlier lesson), shown in lesson order; data from localStorage `oga_y8u1_assess_v1`, else Drive `fetchResults`; none → student picks up to 3. Each target: 🔍 look back at their OWN answers → ✍️ one real sentence → 🧠 3-in-a-row checkpoint (restart saved immediately) → 🛠 code task in a new context (error hints ON); the write target improves their own assessment game shop. Then 🎨 Make it (own decision program, checked against the student's own two-test plan; 4 reqs + 3 ★ stretches), locked until targets are done (teacher password `outwood`). Score: 2 units per target + 4 for Make, mastery 80/20; extra targets and the speed-camera challenge are bonus. The L6 assessment's submitResults now also sends `seed, sel, sort, results, code` so look-back works on another computer. **First sitting (one class, 38-mark version):** its saved data has no version marker, so `readSnapshot` flags it as `first` when none of the items added since (`FIRST_SITTING.missing` in L7 `checkers.js`) was ever touched. Those items are then left out of routing, section totals and question numbers. For the questions asked differently then (`FIRST_SITTING.changed`), look-back shows today's question and answer with a note, not the student's own answer. If the assessment changes again, update both lists.
