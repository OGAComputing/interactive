# Y9 Python lesson decks (Station Zero)

PowerPoint decks for the Y9 Python unit, themed for the unit's *Station Zero* survival-horror story. Every deck follows the school-wide rules in [`../ppt-guidelines.md`](../ppt-guidelines.md) (§9 is the approved build system), plus the rules and feedback below.

**Start here:** open **`Y9_Python_Deck_Template.pptx`**. It shows one example of every slide type, in lesson order, and each one's speaker notes say when to use it and what to watch for. Its first slides repeat the rules and feedback log from this file.

## Files

| File | What it is |
|---|---|
| `Y9_Python_Deck_Template.pptx` | The template deck: one example of each slide type, with guidance in the speaker notes |
| `L1_Python_Refresh.pptx` | Lesson 1 deck (Wake Up + Life Support) |
| `build_template.cjs` | Builds the template deck (re-reads this README for the rules slides) |
| `build_deck.cjs` | Builds the Lesson 1 deck: copy this file to start a new lesson's deck |
| `sz_slides.cjs` | The slide types ("recipes"), one function each |
| `sz_kit.cjs` | Drawing parts: palette, layouts, code panels, terminals, variable boxes, badges |
| `clean_icons.py`, `icons/` | The five pillar icons, edges rebuilt from the circle's geometry |
| `make_station_art.py`, `station/` | The station-state damage layers (frost, alarm edges, hazard stripes, static, cracks) as see-through PNGs |

## Building

```
npm install -g pptxgenjs          (once)
node build_deck.cjs               → L1_Python_Refresh.pptx
node build_template.cjs           → Y9_Python_Deck_Template.pptx
```

Close the `.pptx` in PowerPoint first, or the build can't save over it. To check the slides as images: `soffice --headless --convert-to pdf <deck>.pptx`, then `pdftoppm -jpeg -r 80 <deck>.pdf slide`.

**Making a new lesson's deck:** copy `build_deck.cjs` to e.g. `build_L2.cjs`, change the output name, footer and content, and keep the slide order. Every slide is one recipe call with its content and speaker notes. Only draw a slide by hand (as L1 does for slides 14–16) when no recipe fits, and use the kit's parts (`varBox`, `codePanel`, `terminal`, `badge`, `arrow`) so it still matches.

## Slide order

1. **Recap & Recall** starter (light) → 2. **answers** (dark) → 3. **Title** → 4. **Topic + lesson question** → 5. lesson content, repeating New Information → Deliberate Practice → Feedback, with a chapter card before each activity → 6. **Plenary** (the same lesson question as an exit task).

## Slide types (recipes in `sz_slides.cjs`)

| Recipe | Pillar | Use it for |
|---|---|---|
| `recallStarter` / `recallAnswers` | Recap & Recall | The Do Now and its answers |
| `titleSlide` | — | Chapter title with a station-status readout |
| `questionsSlide` | Clarity | Topic question (muted) + lesson question (highlighted) |
| `runLinesSlide` | New Information | A short program run line by line: each row is the whole line → what's on screen → what's in memory, with one plain sentence under the line. Fades in on click: code → screen → memory (6 clicks for 2 lines) |
| `pairSlide` | New Information | Two lines that differ by one thing (quotes vs no quotes) |
| `predictSlide` / `predictRevealSlide` | Deliberate Practice / Feedback | Mini-whiteboard Predict, then the output and two common mistakes |
| `traceSlide` | Deliberate Practice / Feedback | Trace table, blank then filled (`reveal`) |
| `turnTalkSlide` | Deliberate Practice | Two short lines to discuss *before* the explanation |
| `debugRecipeSlide` | New Information (reference) | The 4-step debugging recipe, numbered on a real error message |
| `errorFeedbackSlide` | Feedback | A common error after an activity: code, real error, what's in memory, one takeaway |
| `chapterSlide` | Deliberate Practice | Story card + "open this activity" task |
| `plenarySlide` | Recap & Recall | Lesson question again + 2 exit tasks + optional cliffhanger |

## Station state (the slides decay with the story)

**Intention:** the decks show what is happening to the station, so the story builds week to week and peaks at its beats, without adding anything for students to read. Cognitive load comes first: the damage is drawn underneath everything, only in the frame (edges, corners and a small status line above the title), at low contrast. Code, output and memory boxes always stay clean. If a layer ever competes with the content, turn it off. It is made-up damage, not real corruption: every deck still validates and opens normally.

| State | Chapter | What the frame shows |
|---|---|---|
| `L1` | Wake Up | Frost in the corners · status: cryo bay, −41°C |
| `L1b` | Life Support | Frost · the O2 reading drops a little on every slide |
| `L2` | Proximity | Amber alarm glow at the edges · motion detected |
| `L3` | Locked In | Red alarm glow + hazard stripes top and bottom · lockdown |
| `L4` | Distress Signal | Scanlines and torn static at the edges · signal weak |
| `L5` | The Drone | Hull cracks from the corners, claw marks, red alarm · hull breach |
| `L6` | Systems Check | Clean (it's the assessment): status line only |
| `L7` | Last Stand | Everything at once; switch layers off as each system is repaired |

- **Week to week:** `createDeck({ station: 'L3', … })` sets the state for the whole deck.
- **Within a lesson:** `K.station('L1b')` switches it for the slides that follow (e.g. part 2 of Lesson 1).
- **A story beat:** `K.beat('L2')` switches it as a beat. In Slide Show the next slide fades in through black (the lights go out), then the new damage fades in by itself over 2 seconds. Use it at most once or twice a lesson, on the story moment itself (e.g. the cliffhanger), so it stays a shock.
- **One layer at a time:** overrides change single layers, e.g. `K.station('L7', { static: false })`. Layers: `frost`, `edge` (`'amber'`/`'red'`), `hazard`, `static`, `cracks`, plus `hud` (the status line) and `dot` (its colour). Light slides (Recap & Recall) skip frost and static.
- The template's last section shows every state and a beat. To change the art, edit `make_station_art.py` and run it. Keep every layer in the frame (`clip_to_frame` does this for frost, cracks and static).

## Rules and feedback log

Add new feedback at the bottom, dated. `build_template.cjs` turns this list into the template's rules slides, so keep each entry to one line, starting `- **date · topic** — `.

- **2026-10-08 · Format** — Lesson decks are PowerPoint (.pptx), built with pptxgenjs from these scripts so every deck matches.
- **2026-10-08 · Recap & Recall** — Slide 1 is always Recap & Recall on the previous lesson (in Lesson 1: basic Y8 Python facts), with 4 questions.
- **2026-10-08 · Recap & Recall** — Q1–2 are multiple choice; Q3–4 need a written word or sentence. At least 3 of the 4 are built on code snippets students have already met.
- **2026-10-08 · Code on slides** — Always show the whole line of code, never fragments like `input(…)`. Show what each whole line does instead (`runLinesSlide`).
- **2026-10-08 · Theme** — Survival horror, but readable first: charcoal background, gold for warnings, green "terminal" text for story only, red for error messages only. Body text 18pt or more.
- **2026-10-08 · Story** — The story appears only on the title, chapter cards and the plenary cliffhanger. The premise is spoken from the notes, not written on the slide.
- **2026-10-08 · Cognitive load** — No split attention (labels sit on or beside what they label) and no redundancy (say it or show it, not both). At most 3 text areas per slide.
- **2026-10-08 · Code on slides** — A slide must make sense without the teacher. No brackets, badges or numbers to decode: show each line, then what it puts on screen and in memory, read left to right.
- **2026-10-08 · Animation** — Build worked examples up on click, one part at a time (code → screen → memory), so students only see the step being explained. Use `K.onClick` in any slide type.
- **2026-10-08 · Sequencing** — Reintroduce each idea on its own slide before a slide builds on it (e.g. a variable is a named box, *then* input() fills the box). Reuse the same layout so only the new part changes.
- **2026-10-08 · Station state** — The slides decay with the story: chapter by chapter, and on screen at a story beat. Damage only ever goes in the frame, under the content, so code, output and memory stay clean (`createDeck({ station })`, `K.station`, `K.beat`).
- **2026-10-08 · Station state** — Make the damage clearly visible (first version was too subtle): stronger frost, wider alarm glow, solid hazard stripes, heavier static and cracks. Still frame only.
