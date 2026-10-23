# PRIMM templates and editor trial features

Read this before building or changing a PRIMM lesson, a PRIMM template, or `code-editor.js`.

## Just-in-time error help (`errorHints`)

`setupEditors(selector, { errorHints: true })` makes the shared editor offer a short,
scannable help card — kept deliberately brief for Year 8 readers. It always shows three
lines: the **error type and line number** (e.g. *NameError — line 3*), the **quoted
Python error translated into one short sentence** (from `python-error-hints.js`'s
`plain` field, key takeaway emboldened), and a **"Try:" line** with the single most
likely fix (`fix` field). Errors not in the library still get the type/line header plus
a generic one-line meaning and fix.

Two reveal paths, both opening the same single window — both are click-to-open, never
automatic:

- **💡 Get help button** on the live syntax-hint strip — appears instantly, before any
  run (syntax errors only, since that's what static analysis can see).
- **💡 Get help button** next to the output panel — appears as soon as a run fails,
  covering run-time errors (`NameError`, `TypeError`) that have no syntax-hint. The
  student reads the raw error first and opens help only if they want it.

Fixing the code (clean syntax or a successful run) hides whichever button is showing
and closes the window if it was open.

It is **opt-in** — editors set up without the flag behave exactly as before. A single
textarea can also opt in with a `data-error-hints` attribute. The PRIMM Y8 template
enables it by default. Leave it **off for assessments**, where scaffolding the fix
would undermine the task.

## Memory view (`memoryView`) — trial

`setupEditors(selector, { memoryView: true })` (or `data-memory-view` on one textarea) adds a **Memory** strip at the foot of the output panel: each variable the student's code assigns appears as a labelled box holding its value (strings in double quotes), in source order. Each box's label shows its data type (`str`, `int`, `float`, `bool`, `list`, others grey), using a colour from the Okabe-Ito colour-blind-safe palette, a background pattern (stripes, dots, grid…) and the type name; a cast recolours it on the line it runs, with a brief pop. Editors with it on always run in live-input mode, so a box appears the moment the student presses Enter on an `input()`. After a crash the boxes show what memory held at that moment. Activities that call `runPython` directly (Modify/Make checks) pass `trackVars: true` and hand `run.vars` to `setEditorOutput(ta, text, isError, line, vars)`. `?memory=off` / `?memory=on` in the URL overrides it for the whole page, for A/B trials. It is on in the Y9 Python lessons built so far (Wake Up, Life Support, Proximity, Locked In).

**In Predict:** a Predict question about a program that takes input starts with what the user types ("The user types **Riley** for their name, then **6** for the hours."). Under its label, a hand-drawn `.predict-memory` strip uses the same `mem-box` markup to show what those answers put in memory. The strip stays in the question card's markup, but the page shows it beside the Predict code (`renderPredict` copies the current card's strip into `#p_memory_slot` in `.predict-code-row`, which is hidden for a question with no strip; it stacks under the code below 700 px wide), like the Memory strip beside the editor in Investigate. Leave the strip off a question that asks what is stored, and show `?` for a value the question asks for. Used in Wake Up, Life Support and Proximity; the Y9 templates carry a commented example.

## Step-through Run (`stepThrough`) — trial

`setupEditors(selector, { stepThrough: true })` (or `data-step-through` on one textarea) makes `runCode()` (the **▶ Run code** buttons) show the run line by line. The program still runs in one go: `runPython(..., { traceLines: true })` records each line as it is about to run, and how much had been printed by then. The editor then replays that record at 0.5 s per line (`STEP_MS`). A bar sits behind the running line, its number lights up in the gutter, and the output that line printed appears while it is lit. A **⏩ Skip to end** button finishes the replay at once, and so does typing in the editor. `input()` works as in live-input mode: the replay waits on the input line while the student types, then carries on. After a crash, the output printed before it stays above the error, and the failing line stays marked in red until the code is edited. No replay takes more than 5 s (`MAX_REPLAY_MS`): a program with more than 10 lines to show gets shorter steps so it still fits. With `input()`, each stretch between answers gets its own 5 s, because later lines aren't known until the student answers. Only the first 150 lines run are replayed (`MAX_TRACE_STEPS`), and the rest of the output appears at once. Checks that call `runPython` themselves (Modify/Make) pass `traceLines: true` and hand the result to `replayRun(ta, run)` in place of `setEditorOutput`. It steps through the run (or shows it at once when stepping is off), and resolves `false` if a newer run took over the panel, in which case the check should stop. Each test answer the check fed to `input()` is typed into the output as part of the replay, one character at a time. It appears in an amber box tagged "⌨ typed for you", and the status row reads `input() on line N — typing the answer "…"`. The answer stays highlighted after the replay ends, so students can see that the program still stopped for an input. Answers the student types live are not animated. In the Y9 Station Zero lessons these answers change from check to check: each `checkers.js` has a bank of 5–10 sets (`MOD_PROFILES` / `MAKE_PROFILES` in Wake Up and Life Support; `MOD_TEST_BANK` / `MAKE_TEST_BANK` / `EXT_TEST_BANK` in Proximity, where the boundary values are in every set, and in Locked In, where `CODE` in a set stands for the student's airlock code and `fillCode` swaps it in). Each set is one person's answers, so they fit the story together (e.g. Riley, Engineer, 4, Dizzy). Each ⚡ Check types one set, picked at random but never the same set twice in a row (`pickFrom` in the module), and passes it to `evalMod` / `evalMake` / `evalExt`, so hints name the answers that were typed. `?answers=fixed` always types the first set. `?step=off` / `?step=on` in the URL overrides it for the whole page. It is on in `_templates/PRIMM_Python_Y9_StationZero.html` the Y9 L1 lessons (Wake Up, Life Support), Proximity and Locked In.

## PRIMM Investigate + Modify: teacher-gated skip and reset (Y8 PRIMM activities)

Both the Investigate and Modify skip buttons ("Skip this step →" / "Skip this task →", shown after 3 failed checks on the current step) only open a password box — a teacher types `outwood` (`SKIP_PASSWORD` in the JS) to actually skip (`confirmSkip('i')` / `confirmSkip('m1')`). Both editors also have a **↺ Reset to original** button (`resetInvestigateEditor` / `resetModifyEditor`): step 1 restores the starting code, and later steps restore the code snapshot taken when the previous step passed (falling back to the starting code), so a reset never throws away earlier steps' work. It is disabled while revisiting an already-passed step. All of this lives in `_templates/PRIMM_Python_Y8.html`, and `_templates/PRIMM_Python_Y9.html` carries the same logic.

## Y9 PRIMM template (`_templates/PRIMM_Python_Y9.html`)

This is a copy of the Y8 PRIMM template with **identical HTML structure and JS**. Only the `<style>` block differs: Y9 uses a neutral "graphite" dark theme (charcoal canvas, near-black header with a five-colour PRIMM stage stripe, dark cards, cobalt accent, flat sentence-case buttons, graphite editor chrome, no violet/neon/glow), so it stays dark (students prefer it) but is clearly different from Y8's neon arcade. Its tokens are declared on `:root, body[data-year]` so they win over shared.css's dark `[data-year="9"]` palette. **When you change PRIMM logic or markup in one template, make the same change in the others (including the Station Zero variant, documented in `Y9/Python/CLAUDE.md`).** `primm-templates.test.js` fails if the Y8 and Y9 module scripts drift apart.

## PRIMM Investigate: code-change tick-lists (Y8 PRIMM activities)

Every Investigate instruction that needs a code change is a numbered `<li>` in the step's `<ul class="req-list" id="req_i_N">` (plain "run it" lines are `<li class="req-note">`, never ticked; Wake Up, Life Support and Locked In make each step's run a ticked bullet instead, which passes only for a finished run of the code on screen (in Locked In, with the codes that step asks for; in a bug step, a run that hit the planted error), and only that run unlocks the step's answer). `INV_CHECKS.invN` in the activity's `checkers.js` has one req per numbered `<li>`; they tick live as the student types, show ticks and crosses on Run (no MCQ needed first), and **all must pass before that step's answer is accepted**. A step with no code change has no list and no `INV_CHECKS` entry, so it is never gated. **Scoring** (`calcScore` in every PRIMM page and template): Predict 10, Run 5, Investigate 35, Modify 30, Make 15, Extension 5, so finishing Investigate is 50% and finishing Modify 80%. Each Investigate step is an equal share, split evenly between its ticks and its answer: `recordInvProgress` keeps the best tick share (`passedChecks.i_shareN`), and the answer's share comes when the step passes. For the Break it step, `isBugFixed(raw)` must require the *fixed* line to be present, so deleting the broken line never counts as fixing it — unless deleting it *is* the fix (L2 Variables). Reference implementation: `Y8/Python Unit 1/L4_Data_Types_Casting/checkers.js` + `checkers.test.js`.
