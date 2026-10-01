# Y9 Python — Medium Term Plan

**Scope:** 7 × 1-hour lessons (weekly). Lessons 1–5 teach, each as a complete small PRIMM cycle. Lesson 6 is an assessment and Lesson 7 is SRT (targeted practice). This unit reactivates everything from Y8 Python Unit 1 and then moves on to multi-way selection, iteration and functions.

**Starting point:** Students last programmed about a year ago. They met output, variables, input, casting and binary `if`/`else` in Y8 Unit 1 (see `project_y8_python_unit1_mtp.md`). By Bjork's *new theory of disuse*, that knowledge is probably still stored (high storage strength) but hard to recall (low retrieval strength). So we reactivate it by making students **retrieve** it, not by re-teaching it from scratch. This year, loops and functions have moved out of Y8, so for these students they are **first contact**. Lessons 4 and 5 are adapted from `Y8/Python Unit 2/L3_Turtle_And_Loops` and `Y8/Python Unit 2/L4_Functions`, which worked well.

## The lesson-budget problem, and how this plan solves it

The brief asks for 7 lessons, but "2–3 reactivation lessons + selection + 2 iteration + functions + assessment + SRT" adds up to 8–9. The plan fits it into 7 like this:

- **L1** reactivates the **sequence** half of Y8 Unit 1 (Y8 U1 L1–L4: output, variables, input, casting).
- **L2** reactivates the **selection** half (Y8 U1 L5: binary `if`/`else`) and then extends it to `elif`. Two lessons therefore cover all of Y8 Unit 1, and L2 is also the selection lesson.
- After that, Y8 Unit 1 content is **not** left behind. Every later lesson has spaced retrieval starters, and its programs *use* `input()`, `int()` and `if`/`elif` in context, so the reactivated knowledge keeps getting practised.

A dedicated third reactivation lesson would only fit if functions moved into a later unit. Only do that if the L1 diagnostic shows widespread loss. The L1 quiz results are the evidence for that decision.

---

## Research basis

Everything in the Y8 Unit 1 plan still applies: PRIMM, reading before writing (Lister), one genuinely new concept per lesson, notional-machine tracing, live coding, variation theory, the debugging recipe with a planted bug in every Investigate step, and flexible checkers. This unit adds the following Cognitive Load Theory principles:

| Principle | Source | How this unit applies it |
|---|---|---|
| **Retrieve before re-teaching** (testing and pretesting effects) | Roediger & Karpicke 2006; Kornell, Hays & Bjork 2009 | L1 opens with a no-notes retrieval quiz. Explanations come *after* the attempt. An unsuccessful retrieval attempt still makes the feedback that follows stick better. |
| **Hypercorrection** | Butterfield & Metcalfe 2001 | Retrieval items ask for a confidence rating. Confident wrong answers get immediate, specific feedback, because these are the errors most likely to be fixed. |
| **Expertise reversal** | Kalyuga et al. 2003 | After a year away, Y9s vary widely. Worked examples help those who have forgotten but add load for those who still remember. So refresher worked examples sit in **collapsible "Remind me" cards** (on demand, not forced), and fluent students reach harder Modify tiers sooner. |
| **Worked example → completion problem → independent** | Sweller & Cooper 1985; van Merriënboer 1990 | Each new construct starts fully worked (Predict/Run), then becomes completion problems (fill the gap, or Parsons problems where students put given lines in order) in Investigate/Modify, then Make. |
| **Parsons problems** | Ericson et al. 2017 | Put-the-lines-in-order tasks give similar learning to writing from scratch, in less time and with lower load. Used for the first attempt at each new structure's shape (indentation, where the counter update goes). |
| **Isolated → interacting elements** | Pollock, Chandler & Sweller 2002 | Each construct is met on its own first. **Nesting** (if inside while, loop inside function) is held back to the *top* Modify tier or the Make of a later lesson, never the first exposure. |
| **Split attention** | Chandler & Sweller 1991 | Annotations sit beside the line they explain, as in the Y8 loops/functions lessons, never in a separate panel. |
| **Redundancy** | Kalyuga, Chandler & Sweller 1999 | The teacher explains aloud. The screen shows code and does not duplicate the narration as text. |
| **Transient information** | Leahy & Sweller 2011 | Live coding is kept, but the finished demo code stays visible (on the board or in the activity) rather than vanishing when the teacher scrolls. |
| **Subgoal labels** | Margulieux et al. 2012; Morrison et al. 2015 | Each construct has a fixed short "recipe" on the wall and in the activity, e.g. **while**: ① set up the variable ② write the condition ③ indent the body ④ change the variable inside. |
| **Variability once a schema forms** | Paas & van Merriënboer 1994 | Make tasks vary the surface context (tickets, games, shapes) while the structure stays the same. |
| **Spacing and interleaving** | Cepeda et al. 2006; Rohrer & Taylor 2007 | Each starter has 4 items: last lesson, two lessons ago, Y8 Unit 1, and one mixed "which construct?" item. The assessment and SRT interleave topics. |

### Carried-over conventions (every teaching lesson)
- **Do Now** (5 min, 4 spaced retrieval items) *before* the PRIMM cycle.
- **Debugging recipe** (read the last line → find the line number → read that line aloud → compare to what you meant), with a planted bug in every Investigate step.
- `errorHints: true` in the teaching lessons, **off** in the assessment.
- The PRIMM exercise flow, additive Investigate/Modify steps and flexible checkers from the Y8 units.
- **Behaviour-based checkers** from L2 onwards: run the student's code against several inputs and check the output, rather than regex-matching the shape. Selection and loop programs have many valid shapes (condition order, `>=` vs `>`, etc.).

---

## Lesson 1 — Python Refresh: sequence, variables, input and casting (reactivation)

- **Purpose:** rebuild Y8 U1 L1–L4 as **one connected schema**: *ask → store → convert → calculate → output*. None of this is new, so it can be covered in one cycle. That would be too much for true beginners but is fine as reactivation.
- **Declarative (recalled):** a program runs top to bottom. Strings need quotes. `=` stores right into left, and reassigning overwrites. `input()` always returns a string. `int()` converts it. `"5" + "5"` gives `"55"` but `5 + 5` gives `10`. `+` joins strings. An error message is information.
- **New for some:** `str()` to put a number into a joined sentence (Y8 U1 only cast with `int()`). It appears in Investigate as the fix for a planted `TypeError`, not as a headline concept.
- **Opening (~12 min):** a **diagnostic retrieval quiz**, no notes, 10 tracing/reading items, one per Y8 U1 idea: output order, overwriting a variable, `input()` type, `"5"+"5"`, `int + str` error, `NameError`, missing quote, and so on. Each item has a confidence rating. A wrong answer shows its "Remind me" worked-example card straight away. The score is saved locally and shown to the teacher (this is the evidence for the budget decision above).
- **Predict:** an integrated "cinema ticket" program: `name = input(...)`, `tickets = int(input(...))`, `total = tickets * 8`, two `print`s. Predict the output for given typed answers and fill in a trace table.
- **Run:** type the answers and compare with the prediction.
- **Investigate:** *one isolated concept per step*: change the prompt text (it isn't stored); reassign `total` after the print (order matters); remove `int()` (planted `TypeError` → fix it); planted `NameError` from a misspelt variable; planted missing quote → `SyntaxError`. Re-introduce the debugging recipe explicitly here.
- **Modify:** trivial first step (change the price), then ask a second question (popcorn), then calculate the popcorn cost, then combine into one total printed with `str()`.
- **Make:** a "game shop receipt": 2–3 inputs, casting, one calculation, and a printed receipt.

## Lesson 2 — Selection: `if`/`else` → `elif`

- **Reactivated:** binary `if`/`else`, comparison operators, `==` vs `=`, indentation defines the block (Y8 U1 L5).
- **One new concept:** `elif` for multi-way selection. **Not** included: `and`/`or`/`not`. These are a separate concept for a later unit and are kept out of every lesson's required tasks.
- **Assume it has been forgotten.** The cohort did cover `if`/`else` in Y8, but a year ago, so they probably can't recall it. Open with a retrieval attempt (trace a binary pass/fail program), then **re-teach it properly from a worked example** before `elif` appears. Don't just remind them. The retrieval attempt still helps because it makes the re-teaching stick better (Kornell, Hays & Bjork 2009).
- **Worked-example pair (variation theory):** first show a binary pass/fail program, then *the same program* with one `elif` added. Only one thing changes.
- **Predict:** a `score = int(input())` grading program with `>= 70` / `elif >= 50` / `else`. Predict the output for **85, 50 and 20**. 50 is a deliberate boundary value.
- **Run:** run each input so students see all three branches fire.
- **Investigate:** What happens at exactly 70? **Swap the order of the conditions** so 85 now prints "Pass" (order matters: the first true branch wins). **Change `elif` to `if`** so two messages print (misconception: separate `if`s vs one chain). Planted bugs: `=` vs `==`, a missing colon, and comparing un-cast input (`TypeError: '>=' not supported between 'str' and 'int'`, which reactivates L1).
- **Modify:** change a message, then change a threshold, then add a "Merit" band in the right place, then add a string comparison (`if receipt == "y":`).
- **Make:** "ride checker" or "ticket price by age band" (child / teen / adult / senior). The checker runs it against boundary inputs and accepts any correct ordering.
- **Misconceptions to name:** only the first true branch runs; `else` has no condition; condition order matters when conditions overlap.

## Lesson 3 — Condition-controlled iteration: `while`

- **One new concept:** `while` repeats *while* a condition is true. The condition is checked **only at the top**, before each pass. Something inside the body must eventually make it false. Use it when you *don't know* how many repeats you need.
- **Small addition:** `!=` (Y8 U1 only taught `== < > <= >=`). Introduce it in the Predict annotation as "not equal to".
- **Bridge from L2:** "a `while` is an `if` that keeps checking". Use the same kind of condition students wrote last lesson.
- **Predict:**
  ```python
  answer = input("What is 6 x 7? ")
  while answer != "42":
      print("Not quite - try again")
      answer = input("What is 6 x 7? ")
  print("Correct!")
  ```
  Given the typed answers 40, 48, 42: how many "Not quite" lines appear, and what is the last line?
- **Run:** type those answers.
- **Investigate:** **change `while` to `if`**, so it only re-asks once (the if/while contrast, variation theory). **Delete the `input` line inside the loop**: planted infinite loop, with a teacher demo of what it looks like and how to stop it. Trace-table a running-total loop. *Last step only:* a counter loop (`count = 1 … while count <= 5 … count = count + 1`) as the bridge to L4.
- **Modify:** change the question, then add an `attempts` counter printed at the end, then a numeric version with `int()`, then a validation loop (`while age < 1:` keep asking).
- **Make:** a number guessing game. The required part is: loop until correct and count the guesses. The top criterion adds "Too high / Too low" hints with `if`/`elif` **inside** the loop. This is the unit's first nesting, placed last on purpose. It reuses the Y8 targeted-practice guessing game.
- **Misconceptions to name:** the condition is checked continuously mid-body (it isn't); `while` behaves like `if`; forgetting to update the variable → infinite loop.
- **Runner support (built 2026-09-30):**
  - `pyodide-runner.js` now stops any loop still running after 4 s with `InfiniteLoopError`, and the help card explains it. The planted infinite-loop bug is therefore safe to use.
  - Runs that let students type their own answers should use `runCode(editorEl)`. For code with loops or functions, this asks for each answer when the program needs it, with the output so far shown above.
  - Checkers that feed fixed test inputs should pass `runPython(code, { inputs, onInputsExhausted: 'error' })`. A loop that asks too many times then fails straight away with `EOFError` instead of hanging.

## Lesson 4 — Count-controlled iteration: `for` and `range()` with turtle

*Based on `Y8/Python Unit 2/L3_Turtle_And_Loops/1_For_Loop_Turtle_Challenges.html`. Keep its Predict (square), Investigate (range(8), triangle/120°, pencolor), Modify ladder (triangle → hexagon → colour/pen size → pentagon → green octagon → growing pattern) and Make (Colour Burst, Shape Chooser, Additive pattern).*

- **One new concept:** `for i in range(n)` repeats a known number of times, and `i` counts from 0 up to n−1.
- **Y9 additions:**
  - **Opening worked-example pair:** the L3 counter `while` loop next to `for i in range(5)`, which gives the same output. "When you know how many times, `for` is the tidy way to count." This links the two iteration lessons into one schema and is the basis of the L6 "which loop?" questions.
  - **A planted bug** (the Y8 lesson has none): `t.left(90)` *not* indented, so it draws a straight line instead of a square. This is a **logic error with no error message**, the first one in the unit, and worth naming.
  - **One non-turtle Investigate step** with `print(i)` and `range(1, 6)` (start/stop). The Y8 assessment tested `range(start, stop)` and `range(start, stop, step)` but the Y8 lesson never taught them. Step is a ★ extension only.
- Colour Burst (`input()` inside `t.pencolor()`) gives natural retrieval of input.

## Lesson 5 — Functions (procedures)

*Based on `Y8/Python Unit 2/L4_Functions/1_Functions.html`. Keep its Predict (`greet()`), the five Investigate steps, the Modify ladder (rename → messages → rename → nested `print_line()`) and the Animal Fact Finder Make.*

- **One new concept:** `def` *defines* a named block but does **not** run it; a call runs it; a function can be called many times.
- **Why it fits better in Y9:** the Animal Fact Finder Make needs `input()` + `if`/`elif`/`else`. In Y8 that was new; here it was reactivated in L1–L2, so Make adds load only from functions.
- **Y9 additions:**
  - **Planted bug:** calling a function *above* its `def` → `NameError` (define before you call).
  - **Top Modify tier (interacting elements):** `def square():` containing the L4 `for` loop, called 3 times with `penup()`/move between calls. This mirrors the Y8 SRT "functions with loops inside" task and connects L4 and L5.
  - **Change the Make extension** from `while True` + `break` (`break` is a new keyword) to the L3 pattern `choice = ""` / `while choice != "4":`. This needs no new syntax and reuses L3.
- **Parameters are left out of the core lesson** (one concept per lesson). They appear only as the **final ★ extension task after Make**, for students who have finished:
  - Worked example first: `square()` becomes `square(size)`, called with 50, 100 and 150. Varying one value shows why a parameter is useful.
  - Then a short completion task: `polygon(sides)` using the L4 rule angle = 360 ÷ sides.
  - This is optional and not assessed in L6. Return values and multiple parameters wait for the next unit (OCR J277).
- **Start-of-lesson "which loop?" task:** 5 scenarios, `while` or `for`? This spaces L3/L4 retrieval.

---

## Lesson 6 — Assessment (not PRIMM)

*Modelled on `Y8/Python Unit 2/L5_Assessment/1_Python_Assessment.html` (≈45 min, ≈42 points, one section per topic).*

- **Sections** (one per topic, so SRT can route): 1 Errors and debugging · 2 Sequence: variables, input and casting · 3 Selection (`elif`, order of conditions, boundary values) · 4 `while` loops (trace table, spot the infinite loop, how many times does it run?) · 5 `for`/`range()` + turtle · 6 Functions (define vs call, output order) · 7 Coding: three short write tasks (one each for selection, loop and function) · 8 Extension ★ (a small combined program).
- **Weighting:** about 70% reading, tracing and spot-and-fix, about 30% writing, as in the Y8 Unit 1 plan. Include at least one "which loop is appropriate and why?" item.
- `errorHints` off. MCQ options of balanced length. Per-question highlighting.
- Save per-section scores under **`oga_y9py_assess_v1`** so L7 can read them.

## Lesson 7 — SRT: targeted practice (not PRIMM)

*Modelled on `Y8/Python Unit 2/L6_Targeted_Practice/1_Targeted_Practice.html`.*

- Reads `oga_y9py_assess_v1`, puts the lowest-scoring topics first and caps at 5–6 topics (≈50 min). The manual topic picker stays as the fallback, because results only exist **on the device used for the assessment**.
- Each topic uses the Y8 pattern of a **walkthrough (worked example) then an "on your own" similar task**. This is a faded-example pair, the right pattern for a remediation lesson.
- **Topics:** reading errors · casting input · `str()` in sentences · selection with `elif` (ordering conditions) · `while` loops (stopping condition, infinite loops) · `for` and `range()` · turtle loops · defining and calling functions · functions with loops inside.
- **Y9 addition:** finish with a short **interleaved mixed review** (4 items drawn from different topics). Blocked practice feels fluent but interleaved practice transfers better (Rohrer & Taylor 2007).
- **Stretch / creative Make:** a guessing game or menu program that combines `while`, `if`/`elif` and at least one function. This is the unit-level "extended Make".
- As in the Y8 plan, keep L6 and L7 as **separate** lessons so there is a marking window.

---

## Build notes

| Lesson | Proposed path | Source |
|---|---|---|
| 1 | `Y9/Python/L1_Python_Refresh/1_Refresh_PRIMM.html` | New, from `_templates/PRIMM_Python_Y9.html` |
| 2 | `Y9/Python/L2_Selection/1_Selection_PRIMM.html` | New, from the same template |
| 3 | `Y9/Python/L3_While_Loops/1_While_PRIMM.html` | New (runner loop guard and live input are in place) |
| 4 | `Y9/Python/L4_For_Loops_Turtle/1_For_Loop_Turtle_PRIMM.html` | Adapted copy of Y8 U2 L3 |
| 5 | `Y9/Python/L5_Functions/1_Functions_PRIMM.html` | Adapted copy of Y8 U2 L4 (+ `checkers.js`) |
| 6 | `Y9/Python/L6_Assessment/1_Python_Assessment.html` | Adapted from Y8 U2 L5 |
| 7 | `Y9/Python/L7_Targeted_Practice/1_Targeted_Practice.html` | Adapted from Y8 U2 L6 |

- `shared.css` has no `[data-year="9"][data-topic="Python"]` rule yet, so add one.
- Each PRIMM lesson gets `checkers.js` + `checkers.test.js` (Vitest), following the existing testing architecture.

## Decisions (2026-09-30)
1. The cohort covered binary `if`/`else` in Y8 but won't remember it, so L2 re-teaches it from a worked example after a retrieval attempt.
2. L5 core stays parameter-free. Parameters are an optional ★ extension at the end of L5 only.
