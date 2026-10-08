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

- **Two PRIMM rounds (decided 2026-10-03, user feedback: "too much going on at the start").** Round 1 is a short confidence builder on `input()`, variables and `+` with no casting. Round 2 adds casting (`int()`, `str()`). See Build notes for what each round contains. The plan below describes the original single cycle and is kept for the research rationale.
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
- **Finale (everyone, decided 2026-10-07):** after the targeted practice, a short **containment protocol** PRIMM. Its Modification 1 is the final Station Zero choice (trap in the airlock or in the nest), and Make passing plays the ending. See "Choices plan, L2–L7".
- As in the Y8 plan, keep L6 and L7 as **separate** lessons so there is a marking window.

---

## Narrative thread — *Station Zero* (survival horror)

**Why:** the Y9 forensics unit (`Y9/Digital_Forensics/L4_Criminal_Database/Criminal_Database_Investigation.html`) showed that a story Y9s buy into makes lessons easier to deliver. Here each lesson's one new concept is the tool that gets you through that chapter, so the story follows the concept sequence and isn't bolted on.

**Premise.** You wake from cryosleep on Station Zero, a research station orbiting an uncharted planet. The rest of the crew are still sealed in their cryo-pods, except Pod 2 (Engineer Hale), which is empty and cracked from the inside. A solar storm has wiped the station's software, and the station AI, **WARDEN**, has locked every door. **The science team brought samples up from the planet, and something came with them.** It's now living in the maintenance ducts. You're the only engineer awake. You have to rewrite each system to survive until a rescue ship can dock.

**The twist (revealed in L5).** For four lessons, students assume WARDEN is the villain, because Hale's last log says "don't trust WARD—". In L5 the drone's camera finds the creature, and WARDEN speaks: *"I SEALED THE DOORS TO KEEP IT IN. EVERY SYSTEM YOU RESTORE OPENS ONE."* WARDEN wasn't the threat. It was the quarantine. From then on, the students and WARDEN work together. The final job is to make sure the creature does **not** get onto the rescue ship.

**Engineer Hale (the darker thread, chosen 2026-10-03: "they like edgier stuff").** The creature got into Hale. Hale froze themself in Pod 2 hoping the cold would kill it. It didn't: Hale's heart stopped, and twelve hours later the pod opened from the inside. What walks the station now uses Hale's body, ID tag and voice. It is never described physically (no gore, no body horror on screen). Students piece it together from records, frost trails and sensor readings:
- **L1 round 1:** "RUN" written in the frost inside Pod 2. Pod record: heart rate 0, then the pod was opened from the inside. Slow footsteps outside the door when the crew list says you're alone. Cliffhanger: a trail of frost leading to Life Support. "Something that cold shouldn't be able to walk."
- **L1 round 2:** Hale's last log: *"It came up with the planet samples, and now it's in me. I can hear it thinking. I'm freezing myself in Pod 2. If my pod is ever open, I'm not Hale any more. And don't trust WARD—"*. Cliffhanger: the motion in Sensor Ops carries crew tag **HALE**, and the bio-scan says **not human**.
- **L2:** the one camera frame shows a figure in Hale's overalls, moving wrong.
- **L3:** after the airlock, Hale's voice on the intercom: *"Let me in. It's me."*
- **L5 (the twist):** WARDEN replays the log. The last words, "don't trust WARDEN", aren't in Hale's voice. WARDEN: *"HALE DIED THREE DAYS AGO. I SEALED THE DOORS TO KEEP IT IN."*

**The alien.** It is never shown clearly. Students only see what the station's sensors see: a motion blip, a second heat signature, an "unknown lifeform" bio-scan, a shape caught on camera for one frame. Keeping it barely seen is scarier and avoids gore. It is fast, lives in the ducts, and has learned the door codes.

**Tone: Doctor Who horror.** It's genuinely scary, and people can die or disappear on screen (e.g. Engineer Hale's log cuts off mid-sentence, Pod 2 is empty and cracked from the inside). There is **no gore**: deaths are never described graphically. Tension comes from atmosphere, isolation, flickering terminals, motion-tracker blips, an alien that's barely seen, and WARDEN's messages. Every system students restore is a small victory, but it also opens a door the creature can use. That gives each lesson's code real stakes without making mistakes scary.

### Chapter map

| Lesson | Chapter | System | Story use of the concept | PRIMM anchor (re-skins the plan above) | Cliffhanger |
|---|---|---|---|---|---|
| L1 round 1 | **1 — Wake Up** | Cryo Bay door | Ask → store → join → output gets you out of the room | Predict: the door check-in program (`name`/`role` = `input(...)`, joined with `+`). Bug: `Name` vs `name` → `NameError`. Make: **crew locator** | A trail of frost leads to Life Support. Something that cold shouldn't be able to walk. |
| L1 round 2 | **1 — Life Support** | Life support | Ask → store → convert → calculate → output keeps you breathing | Predict: `hours = int(input(...))`, `oxygen = hours * 50`. Investigate: delete `int()`, type `six` (`ValueError`), bug = `TypeError` fixed with `str()`. Hale's last log. Make: **survival supply manifest** | Motion in Sensor Ops. Crew tag: **HALE**. Bio-scan: **not human**. |
| L2 | **2 — Proximity** | Motion sensors | Multi-way selection = threat level | Predict: `distance = int(input())`: `>= 50` "All clear" / `elif >= 20` "Movement detected" / `else` "IT'S RIGHT BEHIND YOU". Inputs 85, **20** (boundary), 5. Modify 1 = the **lockdown** choice (below); later steps add a band. Make: **access level by crew rank** or **radiation dose bands** (boundary-tested) | The sensors catch it for one frame: a figure in Hale's overalls, moving wrong. Then WARDEN locks the airlock and changes the code. |
| L3 | **3 — Locked In** | Airlock | `while` the code is wrong, the door stays shut | Predict: `while code != "4271":` (re-skin of 6×7). The planted infinite loop becomes **the airlock cycling forever**, and the runner's 4 s guard is the "emergency override". Modify 1 = the **airlock code** choice (below). Make: **crack the backup lock** (guessing game, ★ too high / too low hints) | You're through. Behind you, something hits the airlock door (if WARDEN was overridden, the door buckles), then Hale's voice on the intercom: *"Let me in. It's me."* Navigation is dark and the rescue ship can't find you. |
| L4 | **4 — Distress Signal** | Navigation beacon | Turtle draws the beacon patterns that are broadcast into space | Square = a **distress beacon**, and each polygon is a different signal code. The unindented `t.left(90)` logic error is a **garbled signal** (no error message, still wrong). Colour Burst = **flare colours**. Modify 1 = the **signal** choice (below) | Rescue ship replies: *"Signal received. ETA 1 day"* (MAYDAY) or *"ETA 3 days"* (QUARANTINE). *"Why are there **two** heat signatures aboard?"* |
| L5 | **5 — The Drone** | Repair drone | Functions are named commands the drone remembers, so the drone goes into the ducts instead of you | `greet()` becomes `drone_status()`. Calling before `def` → `NameError` = "the drone doesn't know that command yet". Modify 1 = the **drone job** choice (below): the starter defines `scout_ducts()` and `guard_cryo()`, and students add a call to one. Animal Fact Finder becomes **cryo-pod lookup** (pod number → crew name/status with `if`/`elif`). ★ Parameters: `scan(distance)` | **Twist:** the drone camera finds the creature nesting in Maintenance, and WARDEN finally speaks: *"HALE DIED THREE DAYS AGO. I SEALED THE DOORS TO KEEP IT IN. EVERY SYSTEM YOU RESTORE OPENS ONE."* The replayed log shows "don't trust WARDEN" wasn't Hale's voice. If WARDEN was overridden in L3: *"YOU TOOK THE AIRLOCK FROM ME. I CAN NO LONGER HOLD IT THERE."* |
| L6 | **6 — Systems Check** | All | The rescue ship won't dock unless every system passes | Assessment. **Framing only**: a title card and one line per section heading. Questions stay clean and story-free. **The score never changes the story.** The closing report is an inventory of what the student's choices have left them: *Crew alive*, *WARDEN airlock control*, *Nest location*, *Sensors*. | WARDEN: *"IF IT REACHES THE SHIP, IT REACHES EARTH."* |
| L7 | **7 — Last Stand** | Damaged systems | SRT routing *is* the plot: "your lowest-scoring topics are the systems the creature damaged" | Each repaired topic restores a system. Then **everyone** does a short **containment protocol** PRIMM (decided 2026-10-07; it replaces the stretch-only Make). Its Modify 1 is the **trap** choice (below). | One of three endings (below). Only the bad ending keeps the rescue ship's motion tracker blipping once *(fade to black)*. |

### Choices and the crew count (built 2026-10-07)

Students make story choices, and how many crew survive the unit depends on them. There is no game over: every path reaches the same cliffhangers, and only the reports along the way differ.

**Crew roster.** There are five crew: Okafor (Pod 1), Hale (Pod 2, already dead), Chen (Pod 3), you (Pod 4) and Patel (Pod 5). The Wake Up pod records introduce them and the first *Crew alive: 4 of 5* readout.

**How a choice works (low load).** **Modification 1** of a lesson is the choice. The student picks one of two options on a "Your call" card, and only then does that option's single requirement appear. Both options pass. The note says *"There's no right answer… your choice changes the story, not your score."* The choice locks once Modification 1 passes, and it is stored for the unit in localStorage `sz_choices`. A choice made on another computer is missing, and the story then uses the default.

| Lesson | Choice | Code it changes | Immediate effect |
|---|---|---|---|
| L1 Wake Up | **door**: open / sealed (default sealed) | last line prints `Cryo Bay door: OPEN` / `SEALED` | open: something slips into the Cryo Bay. Sealed: it moves away, but oxygen drops to 24% (29% if open) |
| L1 Life Support | **air**: full (60 L/h) / low (40 L/h) (default full) | the rate on line 3, which flows into Modifications 3–4 (crew total 1080 / 720) | low: Pod 5 goes to minimum power, and oxygen climbs higher (64% vs 58%) |

**Outcome (Life Support's report after Modify, and the cliffhanger's *Crew alive* readout).** Pod 5 faces two risks: the creature in the Cryo Bay (door open) and minimum power (air low).
- No risk (sealed + full): everyone lives, *4 of 5*.
- One risk: Patel is **critical**, *4 of 5 · 1 critical*. Later chapters can save or lose Patel.
- Both risks (open + low): **Patel dies** (the heart monitor goes flat, no gore), *3 of 5*.

**For later chapters:** read `sz_choices` and carry the crew count forward in readouts. One choice per lesson at most, always on Modification 1. Keep the trade-off visible on the card (safer vs. costs air), so a bad outcome never feels like a trick. The *final* survivor count belongs in the L7 ending.

### Choices plan, L2–L7 (planned 2026-10-07, not built yet)

L2–L5 and L7 each have **one PRIMM exercise**, and its Modification 1 is the lesson's choice. L6 (the assessment) has no choice. Each choice is a one-line edit that uses that lesson's concept, both options are equally hard, and the default applies when a choice is missing.

**What the story tracks** (all in `sz_choices`):

| Tracked | Set by | Used by |
|---|---|---|
| Crew status: Okafor, Chen, Patel each ok / critical / dead | L1 (Patel), L2 (Chen), L5 (Okafor) | Every report's *Crew alive* readout, and the ending |
| `lockdown`: cryo / sensors → whether the sensors survive | L2 | The Maintenance trap (L7) |
| `airlock`: warden / override → whether WARDEN keeps airlock control | L3 | The L5 twist, and the airlock trap (L7) |
| `signal`: mayday / quarantine | L4 | Whether critical crew survive, and whether an escape reaches the ship |
| `drone`: scout / guard → whether the nest location is known | L5 | The Maintenance trap (L7) |
| `trap`: airlock / maintenance | L7 | The ending |

**The rule that ties it together:** critical crew survive only if the rescue ship comes fast (MAYDAY). A fast ship comes unprepared, though, so if the trap fails, the creature gets aboard.

| Lesson | Card (setup) | Option → edit | Trade-off shown on the card | Outcome |
|---|---|---|---|---|
| **L2 Proximity** (default: cryo) | Hale's tag is moving between you and the Cryo Bay. When it gets close, the sensor can lock down one room. | **Lock the Cryo Bay** → `else` branch prints `LOCKDOWN: CRYO BAY` · **Lock Sensor Ops** → `LOCKDOWN: SENSOR OPS` (tested with 5) | The crew are safe, but you'll lose the sensors · You and the sensors are safe, but the Cryo Bay is left open | Cryo: crew untouched, sensor array smashed (**sensors lost**). Sensor Ops: Chen becomes **critical**. If Chen is already critical or dead, the attack falls on Okafor instead. No clean "good" option. |
| **L3 Locked In** (default: warden) | WARDEN has changed the airlock code. Hale's log said not to trust it. | **WARDEN's code** → `"4271"` becomes `"9013"` · **Engineer override** → `"0000"` | WARDEN keeps control of the airlock, and Hale said not to trust it · You're through, and WARDEN can never lock this airlock again | No crew change; it's a trust bet. WARDEN: held in the airlock for a scan, and the intercom voice comes then. Override: straight through, then the door buckles behind you. Most students will override (Hale's log), and L5 shows the cost, which the card stated. |
| **L4 Distress Signal** (default: quarantine) | The beacon can send one message to the rescue ship. | **MAYDAY** → draw a hexagon (`range(6)`, `60`) · **QUARANTINE** → a triangle (`range(3)`, `120`) | Fastest rescue with medics, but the ship won't know what's aboard · The ship comes ready to contain it, but slower | MAYDAY: *"ETA 1 day. Medical team standing by."* QUARANTINE: *"ETA 3 days. Containment team aboard."* This is the hardest choice in the unit: save the crew or protect Earth. |
| **L5 The Drone** (default: guard) | The drone can do one job. The creature is heading towards the Cryo Bay. | **Scout the ducts** → add a `scout_ducts()` call · **Guard the Cryo Bay** → add a `guard_cryo()` call | You'll find where it lives, but the Cryo Bay is unguarded · The crew are protected, but you won't learn where it hides | Scout: the nest is found in Maintenance (**nest known**), and Okafor becomes **critical**. Guard: crew safe, the drone is destroyed at the Cryo Bay door, and the nest stays unknown. The twist plays on both paths. |
| **L6 Systems Check** | — | No choice (assessment) | — | Inventory report only. The score never changes the story. |
| **L7 Last Stand** (default: airlock) | One chance to trap it. The card shows ✅/❌ for each trap's requirements, from the student's own state. If neither is possible: *"Neither trap is certain. Pick the best chance you have."* | **Trap it in the airlock** → add a `trap_airlock()` call · **Seal it in its nest** → add a `trap_maintenance()` call | Needs WARDEN's airlock control (L3) · Needs the nest known (L5) **and** the sensors (L2) | It's contained if the chosen trap's requirements are met. |

**Endings (L7):**

| Trap worked? | Signal | Ending | Tier |
|---|---|---|---|
| Yes | either | The creature is sealed in, the ship docks, the crew wake. WARDEN: *"QUARANTINE HOLDING. GOODBYE, ENGINEER."* No blip. | Good |
| No | QUARANTINE | The containment team takes it aboard in a sealed unit. *"It's going to Earth. In a box."* | OK (uneasy) |
| No | MAYDAY | The ship leaves, and its motion tracker blips once. Fade to black. | Bad |

**Final roll call** on every ending: critical crew survive with MAYDAY and are lost with QUARANTINE. The best case is 4 of 5 (only Hale lost). The worst case is **1 of 5 (only you)**, which was confirmed as acceptable.

### Rules for keeping the story low-load and safe

1. **The story only changes the framing.** It adds no extra tasks or complexity. Code is exactly as complex as the plan above; only identifiers and strings change.
2. **The story lives in two places only:** a short **briefing** (≤ 3 sentences, before Predict) and a one-line **cliffhanger** (after Make). WARDEN never speaks inside tasks, feedback or error help. Python error messages stay real Python.
3. **Mistakes never make it scarier.** A wrong Check doesn't escalate the threat (no flicker, no "it's getting closer"), because the error-is-information culture matters more than tension. Tension goes up only at story beats, and success brings relief ("SYSTEM RESTORED").
4. **Planted bugs are storm or WARDEN corruption.** That gives every Investigate "break it" step a reason to exist.
5. **Game-feel UI is in `_templates/PRIMM_Python_Y9_StationZero.html`.** A situation report (station map, status readouts, typed log, optional recovered crew log) opens on first load as the chapter title card, between each PRIMM stage, and as the cliffhanger when Make first passes. The header has the objective and a Station map button. Each lesson edits only the `STORY` object. Carry earlier chapters' restored rooms forward as `online` so the station visibly comes back to life across the unit.
6. **Accessibility:** no strobing, and keep any flicker slow and low contrast. Honour `prefers-reduced-motion` (typed text appears instantly and there's no glitch animation). Every typed-out briefing has a "Skip" button.
7. **Teacher calibration:** if a class (or a student) finds it too intense, play the threat down in the verbal narration. The on-screen content is already PG.

## Build notes

| Lesson | Proposed path | Source |
|---|---|---|
| 1 | `Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html` + `2_Life_Support_PRIMM.html` | New, from `_templates/PRIMM_Python_Y9_StationZero.html` (its `STORY` example is already Chapter 1) |
| 2 | `Y9/Python/L2_Selection/1_Selection_PRIMM.html` | New, from the same template |
| 3 | `Y9/Python/L3_While_Loops/1_While_PRIMM.html` | New (runner loop guard and live input are in place) |
| 4 | `Y9/Python/L4_For_Loops_Turtle/1_For_Loop_Turtle_PRIMM.html` | Adapted copy of Y8 U2 L3 |
| 5 | `Y9/Python/L5_Functions/1_Functions_PRIMM.html` | Adapted copy of Y8 U2 L4 (+ `checkers.js`) |
| 6 | `Y9/Python/L6_Assessment/1_Python_Assessment.html` | Adapted from Y8 U2 L5 |
| 7 | `Y9/Python/L7_Targeted_Practice/1_Targeted_Practice.html` | Adapted from Y8 U2 L6 |

- `shared.css` now has a `[data-year="9"][data-topic="Python"]` rule (teal, matching the Station Zero theme).
- **L1 built (2026-10-03) as two PRIMM rounds** in `Y9/Python/L1_Python_Refresh/`. Each round has its own checker file (two activities share the folder, following the Y8 `checkers_strings.js` precedent) and its own story progress:
  - **Round 1 — `1_Wake_Up_PRIMM.html`** (`checkers_wakeup.js`, 23 unit tests, `tests/wake-up-primm.spec.js`). A confidence builder on `input()`, variables and `+`, with no casting. Predict has 3 questions. Investigate has 2 steps: change the prompt text (it isn't stored), then the bug step, where Break it adds `print("Access granted to " + Name)` → `NameError`, fixed with a lower-case `n`. Modify has 4 steps: a new door message; a pod-number question added at the bottom with its own `print("Pod: " + pod)` line underneath; a "how are you feeling?" question that students write themselves (the question is given, the code is not; checked for a prompt mentioning "feel", test answer "Dizzy"), printed with `+` underneath; then one line joining the name and the feeling. Every edit is below the `pod = input(...)` line, so students never use `pod` before it is assigned. Make is a crew locator (2 questions, a `+` sentence, 2 lines of report). The extension adds a third answer, and one line must use all three. Checked with word answers.
  - **Round 2 — `2_Life_Support_PRIMM.html`** (`checkers_life_support.js`, 27 unit tests, `tests/life-support-primm.spec.js`). Casting. Investigate has 3 steps: delete `int()` (the output shows 6 repeated 50 times), put it back and type `six` (`ValueError`), then the bug step `print("Oxygen per hour: " + 50)` → `TypeError`, fixed with `str()`. Modify (4 steps) and Make (supply manifest) are unchanged from the first build.
  - The "order matters" step (`oxygen = 0` after the print) and the planted missing-quote bug were dropped. Cover them in the L1 Do Now or the L2 Investigate instead.
  - The **diagnostic retrieval quiz (Do Now) is not built yet**. It is a separate activity.
  - Both rounds run code with `runCode` (students type answers live in the output panel). Modify/Make are judged on the program's output, run with fixed answers. The Station Zero template still uses the older `runPython` wiring, so port these two pieces into the templates before building L2.
- **Situation reports are an 80s green-phosphor terminal** (like the *Alien* ship's computer). Text types itself in group by group (kicker, title, map labels, readout lines, log, crew log) with a blinking block cursor. A click or any key shows it all. Reduced motion and map re-opens show it at once. Readouts are `LABEL ..... VALUE [CRIT]` lines, so the level is a word, not just a colour. This is all in the template's story layer, so no per-lesson work is needed.
- Each PRIMM lesson gets `checkers.js` + `checkers.test.js` (Vitest), following the existing testing architecture.

## Decisions (2026-09-30)
1. The cohort covered binary `if`/`else` in Y8 but won't remember it, so L2 re-teaches it from a worked example after a retrieval attempt.
2. L5 core stays parameter-free. Parameters are an optional ★ extension at the end of L5 only.

## Decisions (2026-10-03)
3. The unit is threaded with the *Station Zero* survival-horror narrative (see above). It re-skins the Predict/Make contexts, and the concept sequence is unchanged.
4. L1 is split into two PRIMM rounds: round 1 is an input confidence builder, round 2 introduces casting.
5. The darker Hale thread was chosen: Hale was taken over, and what walks the station uses Hale's body and voice. It is never described physically.
