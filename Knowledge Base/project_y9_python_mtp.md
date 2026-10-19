# Y9 Python — Medium Term Plan

**Scope:** 7 × 1-hour lessons (weekly). Lessons 1–5 teach, each as a complete small PRIMM cycle. Lesson 6 is an assessment and Lesson 7 is SRT (targeted practice). This unit reactivates everything from Y8 Python Unit 1 and then moves on to multi-way selection, iteration and functions.

**Starting point:** Students last programmed about a year ago. They met output, variables, input, casting and binary `if`/`else` in Y8 Unit 1 (see `project_y8_python_unit1_mtp.md`). By Bjork's *new theory of disuse*, that knowledge is probably still stored (high storage strength) but hard to recall (low retrieval strength). So we reactivate it by making students **retrieve** it, not by re-teaching it from scratch. This year, loops and functions have moved out of Y8, so for these students they are **first contact**. Lessons 4 and 5 are adapted from `Y8/Python Unit 2/L3_Turtle_And_Loops` and `Y8/Python Unit 2/L4_Functions`, which worked well.

## The lesson-budget problem, and how this plan solves it

The brief asks for 7 lessons, but "2–3 reactivation lessons + selection + 2 iteration + functions + assessment + SRT" adds up to 8–9. The plan fits it into 7 like this:

- **L1** reactivates the **sequence** half of Y8 Unit 1 (Y8 U1 L1–L4: output, variables, input, casting).
- **L2** reactivates the **selection** half (Y8 U1 L5: binary `if`/`else`) and then extends it to `elif`. Two lessons therefore cover all of Y8 Unit 1, and L2 is also the selection lesson.
- After that, Y8 Unit 1 content is **not** left behind. Every later lesson has spaced retrieval starters, and its programs *use* `input()`, `int()` and `if`/`elif` in context, so the reactivated knowledge keeps getting practised.

A dedicated third reactivation lesson would only fit if functions moved into a later unit. Only do that if the L1 diagnostic shows widespread loss. The L1 quiz results are the evidence for that decision.

**Revised 2026-10-16 (after teaching L1):** most students did not finish Wake Up in the hour, and almost nobody reached Life Support. So **L1 is now Wake Up only** (output, variables, `input()`, `+`), and casting is folded into the next two lessons, each time at the point the program needs it:

- **`int()` → L2.** Proximity already depends on it: `distance = int(input(...))` is in Predict, the Investigate bug step removes `int()` (`TypeError`), and the Make asks for `int()`. L2 just needs a "Remind me: `input()` gives text, `int()` makes it a number" card, which can also show the `six` → `ValueError` case. That adds no task.
- **`str()` → L3.** The `attempts` counter is the first number students have to print inside a sentence. Modification 2 gives the line in full, `print("Cracked in " + str(attempts) + " tries")`, with `str()` annotated (early Modify steps may show code). The Make retrieves it.
- **Spacing:** the L2 and L3 Do Nows each carry one casting item (`"5" + "5"`, an un-cast comparison), and L6 section 2 still assesses casting.
- **`2_Life_Support_PRIMM.html` stays live** (its link is already in Classroom) as an optional catch-up or extension round. It no longer decides anything in the story (see "Choices and the crew count").
- **Pacing check:** if L2 also overruns, its first cut is Modification 4 (`== "y"`), which can move to ★. Students who didn't finish Wake Up don't go back to it in L2. L2's "Previously…" recap tells them the story.

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

- **Now Wake Up only (2026-10-16).** Casting moved to L2 (`int()`) and L3 (`str()`). See "Revised 2026-10-16" above. The notes below describe the earlier designs.
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

- **Reactivated:** binary `if`/`else`, comparison operators, `==` vs `=`, indentation defines the block (Y8 U1 L5). **Also `int()` (2026-10-16):** casting moved here from L1. The program needs it to compare numbers, so it's taught in context. Add a "Remind me" card; don't add a step.
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
- **Also `str()` (2026-10-16):** moved here from L1. Modification 2 (the `attempts` counter) gives `print("Cracked in " + str(attempts) + " tries")` in full, with `str()` annotated, and a "Remind me" card shows the `TypeError` you get without it. The Make retrieves it.
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

- Reads `oga_y9py_assess_v1` (from localStorage, then from Drive via `Classroom.fetchResults` as in Y8), puts the lowest-scoring topics first and caps at **3–4 topics** (≈25 min; cut from 5–6 on 2026-10-14 so every student has time for the containment PRIMM). The manual topic picker stays as the fallback, because results only exist on the device used for the assessment or in a Classroom-linked Drive.
- Each topic uses the Y8 pattern of a **walkthrough (worked example) then an "on your own" similar task**. This is a faded-example pair, the right pattern for a remediation lesson.
- **Topics:** reading errors · casting input · `str()` in sentences · selection with `elif` (ordering conditions) · `while` loops (stopping condition, infinite loops) · `for` and `range()` · turtle loops · defining and calling functions · functions with loops inside.
- **Y9 addition (if time):** a short **interleaved mixed review** (4 items drawn from different topics). Blocked practice feels fluent but interleaved practice transfers better (Rohrer & Taylor 2007). Under the 3–4 topic cap it may not fit; keep it after the containment PRIMM or drop it.
- **The containment PRIMM replaces the Y8 extension tab** (the guessing-game "extended Make"). That stretch task can still sit after the ending for students who finish early, with no story attached.
- **Finale (everyone, decided 2026-10-07):** after the targeted practice, a short **containment protocol** PRIMM. Its Modification 1 is the trap choice (airlock or nest), its Make is the docking call (dock now or hold the ship off), and Make passing plays the ending. See "Choices plan, L2–L7" and "L7 story layer" below.
- As in the Y8 plan, keep L6 and L7 as **separate** lessons so there is a marking window.

### L7 story layer — repairs, then containment (planned 2026-10-14)

The Y8 page's flow (boot → plan screen → one tab per topic with Task A then Task B → extension → reflect) maps onto Station Zero as **"your lowest-scoring topics are the systems the creature damaged"**:

| Y8 page | Y9 Station Zero version |
|---|---|
| Boot screen: "Looking up your assessment results…" | WARDEN's **damage scan**: "Scanning station systems…" (the same results fetch). |
| Plan screen | The **intro report**: a "Previously…" recap from `sz_choices` (crew alive, WARDEN's airlock control, nest found, sensors, ship fast/prepared), then the station map with each damaged room in red and the topic list as a **repair list** (e.g. *Sensor Ops: selection logic corrupted*). |
| One tab per topic | One **system**, by the chapter that taught the concept (table below). |
| Task A passes | The room turns `UNSTABLE` on the map. No report. |
| Task B passes | The room turns `ONLINE` and one **short** report plays: a feed animation into that room's device and one line of story. |
| "All right" refresher (3 strongest topics) | *"Minor faults only"*: the topics are routine maintenance. |
| No-data fallback / picker | *"Damage scan failed. Check every system by hand."* |
| Extension tab | The **containment protocol PRIMM** (`trap`, `dock`). |
| Reflect tab | Kept after the ending, framed as the rescue ship's **debrief**. The questions stay plain. |

**Topic → room** (each concept returns to the chapter that taught it):

| Topic(s) | Room | Device for the feed animation |
|---|---|---|
| Reading errors | WARDEN Core | WARDEN's diagnostics |
| Casting input, `str()` in sentences | Life Support | O2 recycler |
| Selection with `elif` | Sensor Ops | Proximity sensors |
| `while` loops | Airlock | Airlock seals |
| `for` / `range()`, turtle loops | Navigation | Beacon |
| Functions, functions with loops | Drone Bay | Drone |

**Rules:**
1. **The score never changes the ending** (as in L6). Which rooms are damaged depends on the score, but that is scenery only. A repair must **not** feed the trap requirements (e.g. "fixing selection restores the sensors"), because a student who was strong at selection never gets that topic and would be punished for it. The trap requirements and the ending come only from `sz_choices` (L2–L5, then `trap` and `dock`).
2. **Everyone reaches the ending.** The containment tab is **unlocked from the start**, not gated behind the repairs, so the teacher can call "move to containment" at a set time (≈25 min in). An unfinished repair is one readout line (*Drone Bay: OFFLINE*) that changes nothing else.
3. **Keep repair reports light.** Up to 4 repairs plus a PRIMM is too many full typed reports. Repair reports are one line plus the feed animation. Full reports are only for the intro, the containment stages and the ending.

**Hooks** (the Y8 page has no story layer, so the Station Zero overlay script and header are added to it):
- `beat('intro')` on the plan screen.
- `beat('fix_<room>')` when a topic's Task B passes, with one entry per room in `STORY.beats`. Two topics share a room, so the beat plays on the **first** pass in that room.
- `beat('P'|'R'|'I'|'M1'|'M2')` in the containment PRIMM, as in the other chapters. `M2` plays the ending.
- `STORY.crew` starts from the roll call left after L5 (X from L2, the L2-shielded crew member from L4, Okafor from L5, plus *You: injured* from L3) and settles critical crew at `M2` by the final roll-call rule.
- `?story=off` and the Station map button work as in the other chapters. The map shows every room the student has already restored across the unit as `online`, except the damaged ones.

---

## Narrative thread — *Station Zero* (survival horror)

**Why:** the Y9 forensics unit (`Y9/Digital_Forensics/L4_Criminal_Database/Criminal_Database_Investigation.html`) showed that a story Y9s buy into makes lessons easier to deliver. Here each lesson's one new concept is the tool that gets you through that chapter, so the story follows the concept sequence and isn't bolted on.

**Premise.** You wake from cryosleep on Station Zero, a research station orbiting an uncharted planet. The rest of the crew are still sealed in their cryo-pods, except Pod 2 (Engineer Hale), which is empty and cracked from the inside. A solar storm has wiped the station's software, and the station AI, **WARDEN**, has locked every door. **The science team brought samples up from the planet, and something came with them.** It's now living in the maintenance ducts. You're the only engineer awake. You have to rewrite each system to survive until a rescue ship can dock.

**The twist (revealed in L5).** For four lessons, students assume WARDEN is the villain, because Hale's last log says "don't trust WARD—". In L5 the drone's camera finds the creature, WARDEN's voiceprint check shows that the warning was added by the creature after Hale died, and WARDEN speaks: *"I SEALED THE DOORS TO KEEP IT IN. EVERY SYSTEM YOU RESTORE OPENS ONE."* WARDEN wasn't the threat. It was the quarantine. From then on, the students and WARDEN work together. The final job is to make sure the creature does **not** get onto the rescue ship.

**Canon: the facts every chapter must agree with (settled in the 2026-10-17 continuity pass).**
- **There is one creature, and it is inside Hale's body.** "The thing in the ducts", "the motion blip" and "Hale's tag" are the same creature: it moves fast through the ducts and walks slowly and wrongly in the corridors in Hale's body. Never write it as two things at once. Every trap, ending and `it` in the plan means this one creature. What happens to Hale's body is never shown; it is sealed in, or taken away, with the creature.
- **It makes cold, and it hunts warmth.** It leaves frost wherever it goes (Pod 2, the floor of Sensor Ops, trails in the corridors), and frost on a pod's glass means that crew member is in danger. It is drawn to heat, which is why the crisis choices about heaters (L2, L3) and bait (L7) work. Hale was wrong about the cold: freezing himself didn't kill it, because cold is what it's made for. Sensors see it as a **life sign** or **motion**, never as a heat signature.
- **It can imitate Hale's voice, but a voiceprint check catches it.** To a person it sounds like Hale, but the voiceprint doesn't match. That's how L5 can prove the log was faked even though L3's intercom voice sounds right. **L3's intercom readout shows `Voiceprint: NO MATCH`**, a fair clue that pays off in L5.
- **Timeline:** Hale recorded his log and froze himself 3 days ago; his heart stopped soon after. Twelve hours later Pod 2 opened from the inside, and the line "don't trust WARD—" was added to the log that same minute. You wake in Wake Up three days after Hale froze himself.
- **Who did what to the station:** the solar storm wiped the software, which is where the planted bugs come from. WARDEN sealed the doors, and every later lock (the L2 airlock lockdown, the changed code) is WARDEN **keeping the creature away from the airlock and the ship**. Before L5 that looks hostile; after L5 it makes sense. WARDEN doesn't speak before L5. It acts, and it watches (the red eye).
- **Life support:** it's running on **reserve tanks** from L2 on, whether or not the student did the optional Life Support round. Never say "you got life support running" in a later recap.

**Engineer Hale (the darker thread, chosen 2026-10-03: "they like edgier stuff").** The creature got into Hale. Hale froze himself in Pod 2 hoping the cold would kill it. It didn't: Hale's heart stopped, and twelve hours later the pod opened from the inside. What walks the station now uses Hale's body and ID tag, and imitates his voice. It is never described physically (no gore, no body horror on screen). Students piece it together from records, frost trails and sensor readings:
- **L1 round 1 (Wake Up) tells all of Hale's L1 story (moved 2026-10-13; most students won't finish round 2 before L2, so Hale's beats can't depend on it):** "RUN" written in the frost inside Pod 2. Pod record: heart rate 0, then the pod was opened from the inside, and Hale's last log plays with it (Investigate): *"It came up with the planet samples, and now it's in me. I can hear it thinking. I'm freezing myself in Pod 2. If my pod is ever open, I'm not Hale any more. And don't trust WARD—"*. Slow footsteps outside the door when the crew list says you're alone. Cliffhanger: the crew locator picks up a tag nobody searched for, **HALE**, moving towards Sensor Ops, and the bio-scan says **not human** (with the Sensor Ops CCTV still of him walking).
- **L1 round 2 (Life Support, optional from 2026-10-16) is only about the air.** Its "Previously…" recap tells Hale's story for students who didn't finish Wake Up. It has no Hale beats of its own.
- **L2:** its recap retells all of the above, because most students didn't reach Wake Up's log or cliffhanger. The one camera frame shows a figure in Hale's overalls, moving wrong.
- **L3:** after the airlock, Hale's voice on the intercom: *"Let me in. It's me."* The readout says `Voiceprint: NO MATCH` (see Canon).
- **L5 (the twist; made explicit 2026-10-14 so no student misses that the warning was faked):** WARDEN replays Hale's last log with a voiceprint check beside it, and the report shows the evidence instead of hinting at it:
  - Every line up to *"If my pod is ever open, I'm not Hale any more."* reads **Voiceprint: HALE · 98% match**, recorded 3 days ago at the time Hale froze himself.
  - The last line, *"And don't trust WARD—"*, reads **Voiceprint: NO MATCH**, and it was **added 12 hours later, the same minute Pod 2 opened from the inside**. Hale's heart had already stopped.
  - WARDEN: *"HALE DID NOT SAY THAT. IT DID. HALE DIED THREE DAYS AGO. I SEALED THE DOORS TO KEEP IT IN."*
  - The log takes **"It wanted you to fight me."** so the point is said outright, not left to inference.
  - Readouts: *Voiceprint: NO MATCH*, *Last line added: Pod 2 opened*, *WARDEN: Quarantine*.
  - (Optional seed for Wake Up: the Investigate quote's byline could show the log's time as "3 days ago · edited", so the clue was there from L1. Not built.)

**The alien.** It is never shown clearly. Students only see what the station's sensors see: a motion blip, a second life sign, an "unknown lifeform" bio-scan, a shape caught on camera for one frame. Keeping it barely seen is scarier and avoids gore. It is fast, lives in the ducts, and has learned the door codes.

**Tone: Doctor Who horror.** It's genuinely scary, and people can die or disappear on screen (e.g. Engineer Hale's log cuts off mid-sentence, Pod 2 is empty and cracked from the inside). There is **no gore**: deaths are never described graphically. Tension comes from atmosphere, isolation, flickering terminals, motion-tracker blips, an alien that's barely seen, and WARDEN's messages. Every system students restore is a small victory, but it also opens a door the creature can use. That gives each lesson's code real stakes without making mistakes scary.

### Chapter map

| Lesson | Chapter | System | Story use of the concept | PRIMM anchor (re-skins the plan above) | Cliffhanger |
|---|---|---|---|---|---|
| L1 round 1 | **1 — Wake Up** | Cryo Bay door | Ask → store → join → output gets you out of the room | Predict: the door check-in program (`name`/`role` = `input(...)`, joined with `+`). Bug: `Name` vs `name` → `NameError`. Hale's last log (with the pod records). Make: **crew locator** | The locator picks up crew tag **HALE**, moving towards Sensor Ops. Bio-scan: **not human**. |
| L1 round 2 *(optional catch-up from 2026-10-16; doesn't change the crew)* | **1 — Life Support** | Life support | Ask → store → convert → calculate → output keeps you breathing | Predict: `hours = int(input(...))`, `oxygen = hours * 50`. Investigate: delete `int()`, type `six` (`ValueError`), bug = `TypeError` fixed with `str()`, which unblocks the life-support logs (running on reserve tanks). Make: **survival supply manifest** | Life support is online. Then the motion tracker blips in Sensor Ops, and the proximity sensors that could tell you how close it is are offline. |
| L2 | **2 — Proximity** | Motion sensors | Multi-way selection = threat level | Predict: `distance = int(input())`: `>= 50` "All clear" / `elif >= 20` "Movement detected" / `else` "IT'S RIGHT BEHIND YOU". Inputs 85, **20** (boundary), 5. Investigate 1 = the **shield** crisis (Chen or Patel goes critical), Modify 1 = the **lockdown** choice and Make = the **power** call (below); later Modify steps add a band. Make: **radiation scanner** (dose bands, boundary-tested; built) | The sensors catch it for one frame: a figure in Hale's overalls, moving wrong. Then WARDEN locks the airlock and changes the code. |
| L3 | **3 — Locked In** | Airlock | `while` the code is wrong, the door stays shut | Predict: `while code != "4271":` (re-skin of 6×7). The planted infinite loop becomes **the airlock cycling forever**, and the runner's 4 s guard is the "emergency override". Modify 1 = the **airlock code** choice and Make = the **seals** call (below). Make: **crack the backup lock** (guessing game, ★ too high / too low hints) | You're through. Behind you, something hits the airlock door (if WARDEN was overridden, the door buckles), then Hale's voice on the intercom: *"Let me in. It's me."* (readout: *Voiceprint: NO MATCH*). Navigation is dark and the rescue ship can't find you. |
| L4 | **4 — Distress Signal** | Navigation beacon | Turtle draws the beacon patterns that are broadcast into space | Square = a **distress beacon**, and each polygon is a different signal code. The unindented `t.left(90)` logic error is a **garbled signal** (no error message, still wrong). Colour Burst = **flare colours**. Modify 1 = the **signal** choice, and the ship's reply (*"ETA 1 day. Medical team standing by"* / *"ETA 3 days. Containment team aboard"*) comes in the report after Modify. Make = the **flare** call (below) | The ship acknowledges the flare: *"Your beacon says one survivor awake. We're reading **two** life signs moving aboard."* (Not "heat signatures": the creature is cold; see Canon.) |
| L5 | **5 — The Drone** | Repair drone | Functions are named commands the drone remembers, so the drone goes into the ducts instead of you | `greet()` becomes `drone_status()`. Calling before `def` → `NameError` = "the drone doesn't know that command yet". Modify 1 = the **drone job** choice and Make = the **priority** call (below). For Modify 1, the starter defines `scout_ducts()` and `guard_cryo()`, and students add a call to one. Animal Fact Finder becomes **cryo-pod lookup** (pod number → crew name/status with `if`/`elif`). ★ Parameters: `scan(distance)` | **Twist:** the drone camera finds the creature nesting in Maintenance, and WARDEN finally speaks: *"HALE DIED THREE DAYS AGO. I SEALED THE DOORS TO KEEP IT IN. EVERY SYSTEM YOU RESTORE OPENS ONE."* WARDEN replays Hale's log with a voiceprint check: every line matches Hale except the last, *"don't trust WARD—"*, which is **NO MATCH** and was added the minute Pod 2 opened, after Hale's heart had stopped. *"HALE DID NOT SAY THAT. IT DID."* (see the Hale thread above). If the L3 seals stayed on override: *"YOU TOOK THE AIRLOCK FROM ME. I CAN NO LONGER HOLD IT THERE."* If they were handed back: *"YOU GAVE THE AIRLOCK BACK."* |
| L6 | **6 — Systems Check** | All | The rescue ship won't dock unless every system passes | Assessment. **Framing only**: a title card and one line per section heading. Questions stay clean and story-free. **The score never changes the story.** The closing report is an inventory of what the student's choices have left them: *Crew alive* (who is critical), *You* (ok / injured), *WARDEN airlock control*, *Nest location*, *Sensors*, *Cryo heaters*, *Rescue ship* (fast / prepared). | WARDEN: *"IF IT REACHES THE SHIP, IT REACHES EARTH."* |
| L7 | **7 — Last Stand** | Damaged systems | SRT routing *is* the plot: "your lowest-scoring topics are the systems the creature damaged" | Each repaired topic restores a system. Then **everyone** does a short **containment protocol** PRIMM (decided 2026-10-07; it replaces the stretch-only Make). Its Modify 1 is the **trap** choice and its Make is the **docking** call (below). | One of three endings (below). Only the bad ending keeps the rescue ship's motion tracker blipping once *(fade to black)*. |

### Choices and the crew count (built 2026-10-07; two per PRIMM cycle from 2026-10-08)

Students make story choices, and how many crew survive the unit depends on them. There is no game over: every path reaches the same cliffhangers, and only the reports along the way differ.

**Crew roster.** There are five crew: Okafor (Pod 1, Commander), Hale (Pod 2, Engineer, already dead), Chen (Pod 3, Medic), you (Pod 4) and Patel (Pod 5, Pilot). Only Hale's role comes from the story; the other roles were added for the header crew readout (2026-10-12) and can still change. The Wake Up pod records introduce them and the first *Crew alive: 4 of 5* readout. **Header crew readout (built 2026-10-12):** pod lights, a heart-monitor line and a crew count, with a manifest of portraits on hover. It hides the crew until Wake Up's pod records. In Wake Up, Patel shows *at risk* after the door is opened and *critical* if Make then locks the bay. Every chapter from L2 on needs a `STORY.crew` that starts from Wake Up's `door` + `lock` (Patel critical only if the door was opened and the bay then locked). Life Support's `fate()` no longer counts (2026-10-16). **Compromised Hale (2026-10-12; moved to Wake Up 2026-10-13):** when Wake Up's cliffhanger closes (tag HALE, not human), Hale's card changes from *Deceased* to *Tag active · NOT HUMAN*, with a frosted, flash-eyed portrait that glitches. Hale is compromised all through Life Support and every later chapter. The portraits are AI-generated (sources in `_drafts/crew/`).

**Two choices per PRIMM cycle (decided 2026-10-08, user feedback: one per cycle wasn't enough to keep students interested).** Every PRIMM exercise has a pair of choices, and the second one can win back a bad first one:

1. **Choice 1 is on Modification 1 and is a dilemma.** The card shows the trade-off for each option, and the note says *"There's no right answer…"*. Usually one option is safe but costs something, and the other is risky but gains something.
2. **The report after Modify shows what choice 1 caused**, without settling it yet (e.g. *Pod 5 · Patel: Failing*).
3. **Choice 2 is on Make and is a reaction.** It offers the same two options on every path, but which one is better depends on what choice 1 caused. The card repeats the deciding fact from the last report in a *"Last report: …"* line, so the better call is something to reason out, not a trick. Its note says *"Read the last report first: one of these is the better call. Both programs pass, and your choice changes the story, not your score."*
4. **The cliffhanger after Make settles both choices.** The outcome tiers are:

| Choice 1 | Choice 2 | Outcome |
|---|---|---|
| safe | better call | **good**: the cost of playing safe is won back, or never comes |
| safe | worse call | **ok**: a minor cost that shows in the readouts and recap, never a crew member |
| risky | better call | **ok (recovered)**: the danger is contained, and you keep what the risk gained |
| risky | worse call | **bad**: the danger lands (a crew member critical or dead, or an asset lost) |

Where a lesson's choice 1 has no safe option (L3), the tiers become *recovered* or *bad*. (L2 has one again since its 2026-10-16 rework: locking the Cryo Bay keeps X safe.)

**How a choice works (low load).** The student picks one of two options on a "Your call" card, and only then does that option's single requirement appear. Both options pass. Choice 1 is the Modification 1 edit. Choice 2 adds **one fixed `print` line at the end of the Make program** (e.g. `print("LOCK: POD 5 SHIELD")`), so it adds almost nothing to the hardest stage. The checker looks for that line in the output. Choice 1 locks when Modification 1 passes, and choice 2 locks when Make first passes, just before the cliffhanger plays. Both are stored for the unit in localStorage `sz_choices`, and also saved to the student's Google Drive when they're signed in through Classroom, so they follow the student to another computer (the most recent choice wins). **Defaults:** a missing choice 1 uses the safe option, and a missing choice 2 uses the better call for that path. A student who missed a lesson therefore never loses crew for it.

**Vary what makes the better call,** or students learn "pick the one that fixes what I lost" by L3. Wake Up asks *where is it?*, Life Support (optional) asks *what did choice 1 leave short?*, L2 asks *what did the lockdown leave exposed: X or the sensors?*, L3 is about *evidence on whether to trust WARDEN*, L4 asks *what is missing from the ship's reply?*, L5 asks *what does the drone's report still leave unsolved: Okafor or the nest?*, and L7 asks *is the trap holding?*.

**Three choices per PRIMM cycle, from L2, and in Wake Up since 2026-10-19 (decided 2026-10-16, user feedback after L1: students need more decisions to feel part of the story, and the first one should come early).** A new **crisis choice** comes first, early in Investigate, and puts something in danger. The rest of the lesson is about getting it back:

0. **The crisis (Investigate step 1) is a sideways choice, not a dilemma.** Neither option is safe, so there's no wrong pick: the student decides *who or what* is in danger, not *how much*. Its card note: *"Either way, someone is in danger. The rest of this chapter is about getting them out."* Choosing the victim makes the student own the problem, which is a stronger hook than a danger that just happens to them.
1. **Choice 1 (Modification 1, dilemma)** and **choice 2 (Make, reaction)** work as above, but now they act on what the crisis put in danger. So the outcome tiers stay at four rows; only *who* they apply to changes.
2. **The danger stays on screen until it's settled.** From the crisis on, every report carries a **stake readout** that gets worse at each beat (e.g. `POD 5 · PATEL ..... 34 BPM [CRIT]` → `29 BPM` → `24 BPM`), and that crew member's header light turns critical straight away. The cliffhanger settles it: the readout recovers or flatlines.
3. **Mechanics (low load).** The crisis is a plain pick on a "Your call" card (`#i_choice`, radios `i_choice`) at the top of Investigate step 1. Unlike choices 1 and 2, **it adds no code.** Investigate is where a stuck student is already most loaded, so the step's edit stays exactly as planned. The choice locks when step 1 passes, then `StationZero.choose()` runs and a **short** new beat, `I1`, plays: 2 lines plus the stake readout, with no camera still, so it costs under 30 s. The existing `I` beat still plays at the end of Investigate. **Default** when missing: the option named per lesson below. With the defaults for choices 1 and 2 (the better call), a student who misses a lesson always ends on the recovered tier, so they never lose crew for being absent.
4. **Template work:** the `#i_choice` card, the `I1` beat, a `stake` readout field on beats, and a new **"you" state** for the crew readout (*hunted* / *injured*) for crises that put the student at risk (L3, L7).

**Kinds of crisis (vary them, so it isn't "pick a crew member to hurt" every week):**

| Kind | How it works | Used in |
|---|---|---|
| **Who gets hurt** | Two crew are in danger and you can save one; the other goes critical. | L2 |
| **Them or you** | Protect the crew or yourself. The other choice puts *you* on the readout (*hunted*, with a closing `CONTACT ..... 40 M` distance). | L3 |
| **Countdown** | A readout ticks down at every report (orbit, pod temperature, air), and the Make decides whether it reaches zero. | L4 |
| **Wake someone early** | A pod is failing. Wake them (awake, exposed, and a voice in the story: they can give the deciding fact for a later choice) or leave them under (critical). | L5 |
| **Bait** | Something has to draw the creature away. Pick what: the crew's heat or yours. | L7 |
| *Spares* | **Lose a system:** the storm burns out one of two systems, and the lost one removes an option later (lost cameras → the nest is harder to find). **The voice:** a crew member calls for help over the intercom; go, or don't. (Only fair if the report gives a clue, such as no heartbeat on the readout, so it can be reasoned out and isn't a gotcha.) | If one of the above doesn't land |

**Missed lessons.** Every lesson's first report from L2 on (and Life Support's) opens with a **"Previously…"** recap (1–2 sentences) built from the student's choices, or from the defaults. A student who missed a lesson gets the story so far without having seen it. Each recap should name who is alive, critical or dead, plus anything the next choices depend on (e.g. L7's recap must say whether WARDEN still controls the airlock and whether the nest was found).

#### L1 (built)

| Lesson | Choice | Code it changes | What it causes |
|---|---|---|---|
| Wake Up · Investigate 1 (crisis, added 2026-10-19) | **voice**: answer / silent (default silent) | none (a plain pick; step 1's task appears once it's made) | Hale's voice on the intercom asks which pod you're in, before the pod records reveal he's dead. **Answer:** the call is traced to the ducts above the Cryo Bay, but it knows you're awake (`I1` map shows it in the vents). **Silent:** it doesn't know, but it works its way round every room and you lose track of it. Nobody's health changes, so the `door`/`lock` tiers below are untouched and L2 doesn't read it. It changes the Modify 1 card's wording (answer: *"Hale's voice says your name. It knows you're in here."*) and the M1 report's log. The I report adds *Intercom · last caller: Hale · 7 min ago* beside his 0 heart rate. *Spare for L3:* its *"Let me in. It's me."* intercom line can call back to it. |
| Wake Up · Modify 1 | **door**: open / sealed (default sealed) | last line prints `Cryo Bay door: OPEN` / `SEALED` | open (risky): something slips into the Cryo Bay, and frost creeps across Pod 5's glass; oxygen 29%. Sealed (safe): it moves away down the corridor; oxygen 24%. |
| Wake Up · Make | **lock**: pod5 / bay (default: the better call) | adds `print("LOCK: POD 5 SHIELD")` / `print("LOCK: CRYO BAY DOOR")` | The better call depends on **where it is**. Open + shield: it leaves Pod 5 alone (recovered). Open + lock the bay: it's shut in with the crew (**Pod 5 risk**). Sealed + lock the bay: all secure (good). Sealed + shield: the bay is left unlocked (ok). |
| Life Support · Modify 1 | **air**: full 60 L/h / low 40 L/h (default full) | the rate on line 3, which flows into Modifications 3–4 (crew total 1080 / 720) | full: every pod at full power, but your suit is down to 19%. Low: Pod 5 drops to minimum power. |
| Life Support · Make | **transfer**: pod5 / suit (default: the better call) | adds `print("TRANSFER: POD 5")` / `print("TRANSFER: YOUR SUIT")` | The better call fills **what choice 1 left short**. Low + Pod 5: back to full power (recovered). Low + suit: Pod 5 stays on minimum (**Pod 5 risk**). Full + suit: you can breathe (good). Full + Pod 5: wasted, your suit stays at 19% (ok). **If Wake Up left Patel critical**, Pod 5 is the better call at either rate: the canisters are the only thing that can save him, and the card says Patel is critical. |

**Patel's outcome moves to L2 (2026-10-16).** Life Support is optional now, so it can't decide anything. Otherwise almost every student who left Patel critical in Wake Up would lose him for a lesson they were never given time to do. **Wake Up's result carries straight into L2's crisis:** if Wake Up left Patel critical, L2's shield card says so, and shielding Pod 5 stabilises him (Chen's pod then takes the cold). Life Support can only help (built 2026-10-17): `transfer: pod5` saves a critical Patel, and L2 reads that one choice. Otherwise he stays critical, and nothing else it does is carried forward. L2 ignores `air`. **Superseded rule, kept for reference:**

**Patel's outcome (Life Support's cliffhanger, and every *Crew alive* readout after it; changed 2026-10-13).** `fate()` in Life Support's story script:
- **Wake Up left Patel critical** (door opened, then the bay locked with it inside): only Life Support's canisters can save him. `transfer: pod5` → he lives, *4 of 5*. The canisters went to the suit, **or no transfer was ever chosen** (Life Support's Make not finished) → **Patel dies** (the heart monitor goes flat, no gore), *3 of 5*. This is the one place where a missing choice is not defaulted to the better call: the student left him critical and never got help to him.
- Otherwise, Life Support's own risk: 40 L/h and the canisters to your suit → Patel is **critical**, *4 of 5 · 1 critical*, and later chapters can save or lose him. Every other path: *4 of 5*.

~~Students who finish Life Support see the death in its cliffhanger. L2's first report must say it too…~~ (superseded 2026-10-16). **L2's recap now has to tell all of Wake Up's story,** because most students never reached its Investigate log or its cliffhanger: Pod 2 opened from the inside, Hale's last log, and the HALE tag, which isn't human. It also says whether Patel is at risk, from `door` and `lock` only.

### Choices plan, L2–L7 (planned 2026-10-07; two per lesson from 2026-10-08, three from 2026-10-16; L2 built with two and being reworked, L3–L7 not built yet)

L2–L5 and L7 each have **one PRIMM exercise** with three choices (from 2026-10-16): the **crisis** (Investigate step 1), **Modification 1** (dilemma) and **Make** (reaction). L6, the assessment, has no choice. Choice 1 is a one-line edit that uses that lesson's concept, both options are equally hard, and the defaults apply when a choice is missing.

**Crises (2026-10-16; L2 is ready to build, L3–L7 are sketches to firm up when each lesson is built):**

| Lesson | Crisis · Investigate 1 (default) | Stake readout | How choices 1 and 2 settle it |
|---|---|---|---|
| **L2 Proximity** | **Who gets hurt.** `shield`: *"It went past the Cryo Bay on its way here (it knows the door codes), and frost is spreading across two pods. The heaters can save one."* (This fits between the built R beat, a blip in the ring corridor, and the I beat, the blip moving on to Life Support.) **Shield Pod 3 · Chen** / **Shield Pod 5 · Patel**. Whoever isn't shielded (call them **X**) goes critical. If Wake Up left Patel critical, the card says so, and shielding him stabilises him. (Default: Pod 5) | `POD n · X ..... 34 BPM [CRIT]`, falling | `lockdown` + `power`, reworked around X (L2 row below). X is lost only on the double-risky path. |
| **L3 Locked In** | **Them or you.** `heat`: the airlock and the Cryo Bay share one power line. **Keep the Cryo Bay warm** → the airlock cycles slowly and it's coming down the corridor (*You: hunted*) · **Fast-cycle the airlock** → you'll get through quickly, but the Cryo Bay heaters cut out. (Default: Cryo Bay) | Warm: `CONTACT ..... 40 M`, closing. Fast: `CRYO BAY ..... -4°C`, falling | On **both** paths, handing the seals to WARDEN fixes it: WARDEN holds the door (warm path), or WARDEN sends the airlock's power back to the heaters (fast path). Keeping the override → *You: injured* (warm path), or the **Cryo Bay heaters are damaged** (fast path, `heaters: damaged`: no crew member goes critical, but L7's "crew's heat" bait isn't possible). This keeps each crew member to one lesson's crisis: Chen/Patel in L2 and L4, Okafor in L5. This fits the L3 rule that the evidence points to WARDEN on purpose, which plants the L5 twist. |
| **L4 Distress Signal** | **Countdown.** `fuel`: the storm is dragging the station down. **Hold the orbit** → the pods drop to reserve power · **Keep the pods powered** → `ORBIT ..... 3 DAYS` and falling. (Default: hold the orbit) | Reserve: `POD RESERVE ..... 2 DAYS`. Orbit: `ORBIT ..... 3 DAYS` | Any **fast** ship settles it (every path except QUARANTINE + warning flare, which is already this lesson's bad tier). If the ship is slow, holding the orbit means **the crew member you shielded in L2** goes critical (their pod's reserve runs out first; the card says so: *"The pod you saved last time is on reserve power"*), and keeping the pods powered means the station clips the storm and **Sensor Ops is lost** (which feeds L7's Maintenance trap). |
| **L5 The Drone** | **Wake someone early.** `wake`: Pod 1's heater is failing. **Wake Okafor** → she joins you awake but exposed, and as Commander she says the deciding fact for `priority` · **Keep her under** → Okafor critical. Nothing before L5 touches Okafor, so she always starts L5 stable. (Default: wake) | Under: `POD 1 · OKAFOR ..... 31 BPM [CRIT]`. Awake: `OKAFOR ..... EXPOSED` | Replaces "Scout → Okafor critical" in the table below. Kept under: the med kit (`priority: pod1`) saves her. Awake: `guard_cryo()` keeps her safe, but scouting leaves her exposed, and then the med kit decides. Firm up the full table when L5 is built. |
| **L7 Last Stand** | **Bait.** `bait`: it hunts warmth, so something warm has to draw it to the trap. **The crew's heat** (run the Cryo Bay heaters to full; shows ❌ and can't be picked if L3 left `heaters: damaged`) / **Your own heat** (*You: hunted*). (Default: your own heat) | `CONTACT ..... 20 M` near whoever is the bait | This doesn't change which ending plays. It changes who is in danger if the trap fails: the critical crew (the cost on the *Failing* rows), or you (*You: injured* in the ending). L7 is short, so keep this report to 2 lines. |

**Final roll call:** with the crises, each crew member is in danger in exactly one or two places: X (Chen or Patel) in L2, the other one of them in L4 (slow ship only), and Okafor in L5. The rule doesn't change (critical crew survive only if the ship is fast **and** docks now). The worst case is still 1 of 5, and the best is 4 of 5.

**What the story tracks** (all in `sz_choices`):

| Tracked | Set by | Used by |
|---|---|---|
| Crew status: Okafor, Chen, Patel each ok / critical / dead (nobody dies before L7's roll call) | Wake Up (Patel at risk), L2 crisis (X), L4 crisis (the L2-shielded one), L5 (Okafor) | Every report's *Crew alive* readout, and the ending |
| `shield` → who X is in L2 | L2 | L2's recap and outcomes; L4's `fuel` card |
| `heat`, `fuel`, `wake`, `bait` (the crises) | L3, L4, L5, L7 | That lesson's outcomes. `heat` can damage the heaters (blocks L7's crew-heat bait); `fuel` can lose the sensors (L7 Maintenance trap) |
| You: ok / injured | L3 (warm path + override), L7 | Crew readout and the ending text only |
| `lockdown` + `power` → sensors ok / lost, X ok / critical | L2 | The Maintenance trap (L7) |
| `airlock` + `seals` → whether WARDEN controls the airlock seals | L3 | The L5 twist, and the airlock trap (L7) |
| `signal` + `flare` → whether the ship is **fast** (medics) and/or **prepared** (containment) | L4 | Whether critical crew survive, and whether an escape reaches Earth |
| `drone` + `priority` → whether the nest location is known, Okafor ok / critical | L5 | The Maintenance trap (L7) |
| `trap` + `dock` | L7 | The ending |

**The rule that ties it together:** critical crew survive only if the rescue ship is **fast** and docks without waiting. If the creature gets aboard, a **prepared** ship takes it away in a box; an unprepared one carries it home.

| Lesson | Choice 1 · Modify 1 (dilemma) | Trade-off shown on the card | Choice 2 · Make (reaction): options → line printed | The deciding fact (on the card) | Outcomes |
|---|---|---|---|---|---|
| **L2 Proximity** (defaults: cryo, then the better call; **reworked 2026-10-16 around X**, the crew member the crisis left critical) | Hale's tag is moving between you and the Cryo Bay, and the sensor can lock down one room. **Lock the Cryo Bay** → `else` prints `LOCKDOWN: CRYO BAY` · **Lock Sensor Ops** → `LOCKDOWN: SENSOR OPS` (tested with 5) | X is sealed in, safe from it, but you'll lose the sensors · The sensors are safe, but the Cryo Bay is left open with X inside | `power`: there's power for one repair. **Restart the sensors** → `POWER: SENSORS` · **Stabilise the pods** → `POWER: CRYO PODS` | Cryo: *the sensor array is smashed. X's pod is sealed and slowly warming: 30 bpm and holding.* Sensor Ops: *it was in the Cryo Bay. X: 24 bpm and falling.* | Cryo + sensors: X recovers and backup sensors come online (good). Cryo + pods: X recovers, but the sensors are lost (ok). Sensor Ops + pods: X stabilised (recovered). Sensor Ops + sensors: **X stays critical** (bad), and only a fast ship that docks now can save them. |
| **L3 Locked In** (defaults: warden, then warden) | WARDEN has changed the airlock code, and Hale's log said not to trust it. **WARDEN's code** → `"4271"` becomes `"9013"` · **Engineer override** → `"0000"` | WARDEN keeps control of the airlock, and Hale said not to trust it · You're through, and WARDEN can never lock this airlock again | `seals`: the airlock seals need an owner. **Hand them to WARDEN** → `SEALS: WARDEN` · **Keep them on override** → `SEALS: OVERRIDE` | WARDEN: *WARDEN held the airlock shut while something hit it, and it didn't open.* Override: *the outer door buckled, and your override seals are at 40% and failing.* | WARDEN controls the seals if `seals` is WARDEN. This is the one lesson where the evidence points the same way on both paths, on purpose: it plants the L5 twist. Override + hand back: WARDEN in L5 says *"YOU GAVE THE AIRLOCK BACK."* Keeping the override: *"YOU TOOK THE AIRLOCK FROM ME. I CAN NO LONGER HOLD IT THERE."* |
| **L4 Distress Signal** (defaults: quarantine, then the better call) | The beacon can send one message. **MAYDAY** → draw a hexagon (`range(6)`, `60`) · **QUARANTINE** → an octagon (`range(8)`, `45`) (changed from a triangle 2026-10-14, so both options are a polygon with more sides than the square and need the same `360 / sides` reasoning) | Fastest rescue with medics, but the ship won't know what's aboard · The ship comes ready to contain it, but slower | `flare`: one more flare before the beacon burns out. **Warning flare** → `FLARE: BIOHAZARD` · **Medical flare** → `FLARE: MEDICAL` | The ship's reply. MAYDAY: *"ETA 1 day. Medical team standing by."* QUARANTINE: *"ETA 3 days. Containment team aboard."* | The better call covers **what the reply is missing**. MAYDAY + warning: fast **and** prepared. MAYDAY + medical: fast, unprepared (bad). QUARANTINE + medical: a medical shuttle comes ahead, so prepared **and** fast. QUARANTINE + warning: prepared, slow (bad: critical crew can't be saved). This is the hardest choice in the unit, and now it's recoverable. |
| **L5 The Drone** (defaults: guard, then the better call) | The drone can do one job, and the creature is heading for the Cryo Bay. **Scout the ducts** → add a `scout_ducts()` call · **Guard the Cryo Bay** → add a `guard_cryo()` call | You'll find where it lives, but the Cryo Bay is unguarded · The crew are protected, but you won't learn where it hides | `priority`: the drone bay has power for one more job. **Med kit to Pod 1** → `PRIORITY: POD 1` · **Replay the camera** → `PRIORITY: CAMERA` | Scout: *the drone found the nest in Maintenance, but Pod 1 · Okafor is critical.* Guard: *the drone held the Cryo Bay and was destroyed. Its camera memory survived. Nobody knows where it hides.* | Scout + med kit: nest known, Okafor stabilised (recovered). Scout + camera: nothing new, Okafor stays critical (bad). Guard + camera: the footage shows the nest (recovered). Guard + med kit: the crew were fine, and the nest stays unknown (bad). The twist plays on the cliffhanger on every path. |
| **L6 Systems Check** | No choice (assessment) | — | — | — | Inventory report only. The score never changes the story. |
| **L7 Last Stand** (defaults: airlock, then the better call) | One chance to trap it. The card shows ✅/❌ for each trap's requirements, from the student's own state. If neither is possible: *"Neither trap is certain. Pick the best chance you have."* **Trap it in the airlock** → add a `trap_airlock()` call · **Seal it in its nest** → add a `trap_maintenance()` call | Needs WARDEN to control the airlock seals (L3) · Needs the nest known (L5) **and** the sensors (L2) | `dock`: the rescue ship is here. **Dock now** → `DOCKING: NOW` · **Hold the ship off** → `DOCKING: HOLD` | The report after Modify: *TRAP: HOLDING* (the chosen trap's requirements are met) or *TRAP: FAILING*. | See the endings below. |

**Endings (L7):**

| Trap | Dock | Ending | Tier |
|---|---|---|---|
| Holding | Now | The creature is sealed in, the ship docks, the crew wake. WARDEN: *"QUARANTINE HOLDING. GOODBYE, ENGINEER."* No blip. | Good |
| Holding | Hold | The same, but the wait costs any critical crew. | Good (costly) |
| Failing | Hold | You and WARDEN seal it in by hand while the ship waits. The ship docks late, and critical crew are lost. | OK (recovered) |
| Failing | Now, ship prepared | The containment team takes it aboard in a sealed unit. *"It's going to Earth. In a box."* | OK (uneasy) |
| Failing | Now, ship not prepared | The ship leaves, and its motion tracker blips once. Fade to black. | Bad |

**Final roll call** on every ending: critical crew survive only if the ship is fast (L4) **and** docks now. The best case is 4 of 5 (only Hale lost). The worst case is **1 of 5 (only you)**: Chen, Patel and Okafor are all critical and lost (from 2026-10-16 nobody can die in L1, because Life Support no longer decides Patel's fate). This was confirmed as acceptable.

### Rules for keeping the story low-load and safe

1. **The story only changes the framing.** Code is exactly as complex as the plan above; only identifiers and strings change. The one exception is a choice's single fixed line (the Modification 1 edit, and the Make `print`), which is the same difficulty whichever option is picked. The crisis adds no code.
2. **The story lives in the situation reports and the "Your call" cards only** (updated 2026-10-17; the first design was a briefing plus a one-line cliffhanger). WARDEN never speaks inside tasks, feedback or error help, and doesn't speak at all before L5. Python error messages stay real Python.
3. **Mistakes never make it scarier.** A wrong Check doesn't escalate the threat (no flicker, no "it's getting closer"), because the error-is-information culture matters more than tension. Tension goes up only at story beats, which come with **progress**. The crisis's stake readout gets worse with *time passing between reports*, never with a failed check, and success brings relief ("SYSTEM RESTORED").
4. **Planted bugs are storm or WARDEN corruption.** That gives every Investigate "break it" step a reason to exist.
5. **Game-feel UI is in `_templates/PRIMM_Python_Y9_StationZero.html`.** A situation report (station map, status readouts, typed log, optional recovered crew log) opens on first load as the chapter title card, between each PRIMM stage, and as the cliffhanger when Make first passes. The header has the objective and a Station map button. Each lesson edits only the `STORY` object. Carry earlier chapters' restored rooms forward as `online` so the station visibly comes back to life across the unit.
6. **Accessibility:** no strobing, and keep any flicker slow and low contrast. Honour `prefers-reduced-motion` (typed text appears instantly and there's no glitch animation). A click or any key shows the whole typed report at once, and **Jump to story ↓** goes straight to the log. (There is deliberately no close button at the top, so the story can't be skipped unseen; see `CLAUDE.md`.)
7. **Teacher calibration:** if a class (or a student) finds it too intense, play the threat down in the verbal narration. The on-screen content is already PG.

## Build notes

| Lesson | Proposed path | Source |
|---|---|---|
| 1 | `Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html` + `2_Life_Support_PRIMM.html` | New, from `_templates/PRIMM_Python_Y9_StationZero.html` (its `STORY` example is already Chapter 1) |
| 2 | `Y9/Python/L2_Selection/1_Proximity_PRIMM.html` | Built 2026-10-14 from `2_Life_Support_PRIMM.html` (it already had `runCode`, both choices and the Drive sync, which the template still lacks) |
| 3 | `Y9/Python/L3_While_Loops/1_While_PRIMM.html` | New (runner loop guard and live input are in place) |
| 4 | `Y9/Python/L4_For_Loops_Turtle/1_For_Loop_Turtle_PRIMM.html` | Adapted copy of Y8 U2 L3 |
| 5 | `Y9/Python/L5_Functions/1_Functions_PRIMM.html` | Adapted copy of Y8 U2 L4 (+ `checkers.js`) |
| 6 | `Y9/Python/L6_Assessment/1_Python_Assessment.html` | Adapted from Y8 U2 L5 |
| 7 | `Y9/Python/L7_Targeted_Practice/1_Targeted_Practice.html` | Adapted from Y8 U2 L6 |

- `shared.css` now has a `[data-year="9"][data-topic="Python"]` rule (teal, matching the Station Zero theme).
- **L1 built (2026-10-03) as two PRIMM rounds** in `Y9/Python/L1_Python_Refresh/`. Each round has its own checker file (two activities share the folder, following the Y8 `checkers_strings.js` precedent) and its own story progress:
  - **Round 1 — `1_Wake_Up_PRIMM.html`** (`checkers_wakeup.js`, 23 unit tests, `tests/wake-up-primm.spec.js`). A confidence builder on `input()`, variables and `+`, with no casting. Predict has 3 questions. Investigate has 2 steps: change the prompt text (it isn't stored), then the bug step, where Break it adds `print("Access granted to " + Name)` → `NameError`, fixed with a lower-case `n`. Modify has 4 steps: a new door message; a pod-number question added at the bottom with its own `print("Pod: " + pod)` line underneath; a "how are you feeling?" question that students write themselves (the question is given, the code is not; checked for a prompt mentioning "feel", test answer "Dizzy"), printed with `+` underneath; then one line joining the name and the feeling. Every edit is below the `pod = input(...)` line, so students never use `pod` before it is assigned. Make is a crew locator (2 questions, a `+` sentence, 2 lines of report). The extension adds a third answer, and one line must use all three. Checked with word answers.
  - **Round 2 — `2_Life_Support_PRIMM.html`** (`checkers_life_support.js`, 27 unit tests, `tests/life-support-primm.spec.js`). Casting. Investigate has 3 steps: delete `int()` (the output shows 6 repeated 50 times), put it back and type `six` (`ValueError`), then the bug step `print("Oxygen per hour: " + 50)` → `TypeError`, fixed with `str()`. Modify (4 steps) and Make (supply manifest) are unchanged from the first build.
  - **Story split (2026-10-13):** Hale's log and the HALE tag reveal moved from Life Support to Wake Up (Investigate and the cliffhanger), because most students won't finish Life Support before L2. Life Support's story is now only life support and Patel; its recap carries Hale's story.
  - The "order matters" step (`oxygen = 0` after the print) and the planted missing-quote bug were dropped. Cover them in the L1 Do Now or the L2 Investigate instead.
  - The **diagnostic retrieval quiz (Do Now) is not built yet**. It is a separate activity.
  - **Second choice per round (built 2026-10-08):** each round's Make has a "Your call" card (`#m2_choice`, radios `m2_choice`) with a *Last report* line, and a final requirement for the chosen fixed `print` line (`LOCK_CHOICES` / `TRANSFER_CHOICES` in the checkers, checked by `evalMake(raw, out, choice)`). It locks when Make first passes, and `StationZero.choose()` runs just before the cliffhanger. Life Support's Make card reads Wake Up's choices through `StationZero.choices()`. The transfer line doesn't count towards the manifest's 3 lines.
  - Both rounds run code with `runCode` (students type answers live in the output panel). Modify/Make are judged on the program's output, run with fixed answers. The Station Zero template still uses the older `runPython` wiring, so port these two pieces into the templates before building L2.
- **L2 built (2026-10-14): `Y9/Python/L2_Selection/1_Proximity_PRIMM.html`** (`checkers.js`, 39 unit tests, `tests/proximity-primm.spec.js`). Chapter 2, blue-steel tint.
  - **Predict** re-teaches before `elif`: Program A (binary) is shown bare for question 1 (the retrieval attempt). Its annotations and a "How if / else works" recipe card then appear (`data-reveal`). Program B (the same program plus one highlighted `elif`) and a "How elif works" card appear from question 3. Questions: 30 on A, indentation of `Scan complete`, then 85, **20** and 5 on B.
  - **Run** is gated: it must be run with 85, 20 and 5 (ticked from the echoed input) before the question is accepted.
  - **Investigate** has 4 steps: swap the two numbers (30 now prints All clear: order matters), `elif` → `if` (85 prints two messages), `>=` → `>` (20 falls to the else), then the bug step. **Only the un-cast `TypeError` bug was built**: Break it takes `int()` off line 1 in place, so nothing is planted and `isBugPairLine` is always false. `=` vs `==` is covered by Modification 4's Remind card; a missing colon is caught by the live syntax hint.
  - **Modify:** the lockdown choice (one indented print in the `else`, tested with 5/30/85), `>= 60` (60/59), a 10–19 "Proximity alert" band with no code given (15/10/25/20/9, with an order hint), then `== "y"` at the bottom (5+y, 5+n).
  - **Make** is a **radiation scanner** (DANGER 200+ / WARNING 100–199 / CAUTION 50–99 / SAFE), tested on both sides of every boundary. Each message must contain only its own band word. The power line must print on every run. **Extension:** SCANNER FAULT below 0, EVACUATE from 500.
  - **Behaviour-based checking** is built: `runTests()` runs the program once per test (`MOD_TESTS` / `MAKE_TESTS` / `EXT_TESTS`, `onInputsExhausted: 'error'`). The checkers drop the echoed prompt lines (`ownOutput`), and the editor steps through the run of the failing requirement (`show`). Copy this pattern for L3.
  - **Story (as built 2026-10-14; to be reworked, see the to-do below):** `lockdown` + `power` as planned. Chen is critical after a Sensor Ops lockdown and is saved by `power: pods`. Patel follows Life Support's `fate()` (copied in) and nothing in L2 changes him. The recap names Patel ok / critical / dead. Camera stills: the report after Modify shows the sealed-door still (`_drafts/story/wake_up_corridor.png`), labelled as the door of the room the student locked down. The cliffhanger shows "the figure in Hale's overalls, moving wrong" (`_drafts/story/proximity_cctv_hale.jpg`, cropped in tight so it reads as a different shot from Wake Up's walking-away still; note `life_support_hale_cctv.png` is the one Wake Up already uses, despite its name).
  - **Ligatures:** Cascadia Code draws `>=` `<=` `==` `!=` as single symbols, so the page sets `font-variant-ligatures: none`. The same rule is now in both L1 pages and both Y9 templates (Station Zero and graphite), so L3's `!=` shows as typed.
- **Done 2026-10-17 (L2 rework, items 1, 2 and 5 below):** the `shield` crisis is built in Proximity (`#i_choice`, `#i1_task`, `I1` beat, `CRISIS` / `lockCrisis()` in the module), with the stake readout on I1, I, M1 and M2, and the lockdown/power outcomes, `STORY.crew`, Make's card and the recap reworked around X. The `int()` "Remind me" card is on the bug step. Wake Up's cliffhanger now points to Sensor Ops, and its completion banner offers Life Support as a **bonus round**. **Life Support can only help:** canisters to Pod 5 save a critical Patel, and Proximity reads that one choice (`shutIn` requires `transfer !== 'pod5'`); otherwise he stays critical, and nobody dies there. **Bug fixed in all three pages and the template:** the stored-choice cleaner rejected digits, so values like `pod5` were dropped on reload. Specs updated; 65 E2E and 122 unit tests pass.
- **To do before L2 is taught (2026-10-16 revision):**
  1. **L2:** add the `shield` crisis card to Investigate step 1, the `I1` beat and the stake readout. Rework `lockdown`/`power` outcomes, `STORY.crew` and the recap around X (Chen or Patel). Drop `air`/`transfer`/`fate` from the copied story script; Patel's state comes from `door` + `lock` only. Expand the recap to tell all of Wake Up's story. Add the "Remind me: `int()`" card (with the `six` → `ValueError` example). Update `checkers.test.js` and the spec if the choice needs to be clicked through.
  2. **Life Support:** stop `fate()` and its cliffhanger from changing the crew (it's an optional catch-up now).
  3. ✅ (2026-10-17) **Templates:** port the `#i_choice` card, the `I1` beat, the `stake` readout and the "you" crew states into `_templates/PRIMM_Python_Y9_StationZero.html`, and update the Station Zero section in `CLAUDE.md`.
  4. **L3 (when built):** `str()` in Modification 2, plus the `heat` crisis.
  5. **Continuity fixes found in the 2026-10-17 pass (built pages):**
     - **Wake Up cliffhanger (M2):** the map's `objective` is `'life'` (Life Support), so it points students at the optional round. Change it to `'sensors'`, since the HALE tag is heading to Sensor Ops, which is where L2 starts. Also update the `crew` code comment that says Patel "stays critical until Life Support saves him".
     - **L2 recap (`INTRO_VARIANTS`):** all three variants say *"You got life support running"*, which most students never did, and the `dead` variant kills Patel. Rebuild it from `door` + `lock`: Hale's story (Canon), *"Life support is on reserve tanks"*, Patel's state, and **why you go to Sensor Ops** (*"Its tag was heading for Sensor Ops. If you can get the proximity sensors working, you'll know where it is."*). Set `life: 'unstable'` on L2's maps instead of `'online'`.
     - **L2 `crewAlive()`:** remove the `3 of 5` (Patel dead) case.
     - **Life Support (optional):** its map and readouts can keep restoring life support, which fits the Canon. Its cliffhanger can save Patel but never makes him worse (done 2026-10-17).
- **Template + L2 deck (2026-10-17):** the Station Zero template now has the crisis (card, `CRISIS`/`lockCrisis()`, example `I1` beat, stake-readout notes) and the "you" crew states `hunted`/`injured`. It still has **no Modify/Make "Your call" cards**; build L3 by copying `Y9/Python/L2_Selection/1_Proximity_PRIMM.html` as L2 was copied from Life Support, or port those cards first. The L2 deck (`_presentations/Y9_Python/build_L2.cjs`): Recap & Recall now asks about Wake Up only (Q3 NameError, Q4 `age + age` → `1414`), an `int()` runLines slide sits just before the chapter card, the chapter card says three calls, and the notes cover the crisis.
- **Situation reports are an 80s green-phosphor terminal** (like the *Alien* ship's computer). Text types itself in group by group (kicker, title, map labels, readout lines, log, crew log) with a blinking block cursor. A click or any key shows it all. Reduced motion and map re-opens show it at once. Readouts are `LABEL ..... VALUE [CRIT]` lines, so the level is a word, not just a colour. This is all in the template's story layer, so no per-lesson work is needed.
- Each PRIMM lesson gets `checkers.js` + `checkers.test.js` (Vitest), following the existing testing architecture.

## Decisions (2026-09-30)
1. The cohort covered binary `if`/`else` in Y8 but won't remember it, so L2 re-teaches it from a worked example after a retrieval attempt.
2. L5 core stays parameter-free. Parameters are an optional ★ extension at the end of L5 only.

## Decisions (2026-10-03)
3. The unit is threaded with the *Station Zero* survival-horror narrative (see above). It re-skins the Predict/Make contexts, and the concept sequence is unchanged.
4. L1 is split into two PRIMM rounds: round 1 is an input confidence builder, round 2 introduces casting.
5. The darker Hale thread was chosen: Hale was taken over, and what walks the station uses Hale's body and voice. It is never described physically.

## Decisions (2026-10-08)
6. Every PRIMM cycle has at least **two** story choices: a dilemma on Modification 1 and a reaction on Make. The better second call recovers a bad first one (bad → ok); see "Choices and the crew count". Built into both L1 rounds, and planned for L2–L5 and L7.

## Decisions (2026-10-16, after teaching L1)
7. Most students didn't finish Wake Up in one hour. **L1 is Wake Up only.** Casting moves to L2 (`int()`, which the program needs for comparisons) and L3 (`str()`, for printing the attempts counter). Life Support stays live as an optional catch-up and no longer changes the crew; Patel's fate moves to L2's crisis.
8. From L2, every PRIMM cycle has **three** choices: a **crisis** early in Investigate (a sideways pick that puts someone or something in danger, with no code), then the dilemma (Modify 1) and the reaction (Make), which decide whether the danger is resolved. The crisis kind varies per lesson: who gets hurt (L2), them or you (L3), countdown (L4), wake someone early (L5), bait (L7).
9. **Continuity pass (2026-10-17):** the "Canon" block under Narrative thread is the source of truth: one creature (in Hale's body), it makes cold and hunts warmth, it imitates Hale's voice but fails a voiceprint check, and life support is on reserve tanks from L2. Each crew member is put in danger by only one lesson's crisis (L3's fast-path cost became damaged heaters instead of Okafor). Nobody dies before L7's roll call.
