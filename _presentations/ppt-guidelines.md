# PowerPoint Slide Guidelines — Y8 Python Unit 1

Use this document when creating lesson slides for Year 8 Python Unit 1.
It covers the school's pedagogical framework, lesson structure, cognitive load principles, and design constraints.

**Sections 1, 2, 4–7 and 9 apply to every lesson deck** (any year, any unit). Section 9 is the approved build system: slide order, palette, fonts, sizes and icon rules.

---

## 1. The Five Pillars

Every slide belongs to exactly one pillar. Display the pillar's icon in the **top-right corner** of the slide so students always know what mode they are in.

| Pillar | Purpose |
|--------|---------|
| **Recap and Recall** | Retrieval of knowledge from earlier in the unit (or prior units) — especially knowledge being built on in today's lesson |
| **Clarity of Learning Intentions** | Two questions: the **topic question** (spans the whole unit) and the **lesson question** (specific to this lesson) |
| **New Information** | Direct teaching and live modelling of the declarative and procedural knowledge required for the lesson |
| **Deliberate Practice** | Students apply the new information in a structured task |
| **Feedback** | Students receive feedback on their work — from the teacher, a peer, or the activity itself |

---

## 2. Typical Lesson Flow

A lesson moves through the pillars roughly in this order, but **New Information → Deliberate Practice → Feedback can repeat multiple times** within a single lesson if the lesson introduces more than one concept:

1. Recap and Recall
2. Clarity of Learning Intentions (topic question + lesson question)
3. New Information
4. Deliberate Practice
5. Feedback
6. *(Repeat 3–5 as needed)*

---

## 3. Y8 Python Unit 1 — Lesson Sequence

6 × 1-hour lessons (4 teaching + 1 assessment + 1 DIRT).

| Lesson | Focus | Core concepts |
|--------|-------|---------------|
| 1 | Output & sequence | `print()`, strings, quotes, syntax errors, debugging recipe |
| 2 | Variables & input | Assignment, `input()`, string concatenation, tracing |
| 3 | Data types & casting | `int` vs `str`, `int()`, arithmetic, type errors |
| 4 | Selection | `if`/`else` (binary only), conditions, indentation, `==` vs `=` |
| 5 | Assessment | Reading, tracing, spot-and-fix, one short write task |
| 6 | DIRT + creative Make | Act on feedback; own selection program |

Each teaching lesson (1–4) runs a **complete PRIMM cycle**: Predict → Run → Investigate → Modify → Make. The New Information pillar covers the declarative and procedural knowledge; Deliberate Practice covers Predict through Modify; Make is the culminating owned task.

---

## 4. Teaching Approach (inform slide design)

- **Live coding, not slide code**: new code is demonstrated by typing live in the IDE — slides frame the activity, they do not replace the coding. Avoid putting large code blocks on slides; use the editor instead.
- **Reading before writing**: students read and trace code before they write any. Slides should prompt tracing (e.g. "what will this output?") rather than asking students to produce code cold.
- **Variation theory**: hold most of a program constant, vary one thing. Slide prompts should highlight what has changed, not restate everything.
- **Planted bugs**: every Investigate step contains a deliberate bug. The slide's role is to direct attention to the error message, not to explain it — let the debugging recipe do that.
- **Debugging recipe**: introduced in Lesson 1, reinforced every lesson. Keep it visible (e.g. as a persistent footer or a standing reference slide).

---

## 5. Cognitive Load — Design Principles

### Avoid these traps

| Trap | What it looks like | Fix |
|------|--------------------|-----|
| **Split attention effect** | Code on one slide, explanation on the next; labels separated from the thing they label | Integrate explanation *into* the code (inline comments or callout arrows); keep related elements together on the same slide |
| **Redundancy effect** | Reading text aloud word-for-word while it is on screen; restating in text what a diagram already shows | Put on the slide only what you *won't* say — key terms, a diagram, a short prompt. Say the rest. |

### Lean into these

| Strategy | How to apply |
|----------|-------------|
| **Dual coding** | Pair a concept with a visual — a variable as a labelled box, execution as a numbered arrow, an error trace diagram. Visual and text together, not text alone. |
| **Worked examples** | Show a complete, annotated piece of code before asking students to write. Use **faded guidance** across the unit: full example (L1) → partially complete (L2–3) → prompt only (L4). |
| **Sub-goal labels** | Name the steps: *"Step 1: ask for input. Step 2: cast it. Step 3: do the maths."* These become the cognitive hooks students reuse when writing their own code. |
| **Notional machine** | Use explicit tracing — a table of variable values at each line — to build a shared mental model of execution. Slides can show a blank trace table; completing it is the deliberate practice. |

---

## 6. Slide Design Constraints

- **Maximum 3 text areas or bullet points per slide** — usually 2. Everything else is spoken.
- Short phrases, not sentences. If a bullet needs a subordinate clause, it probably belongs in what you say, not on the slide.
- Code on slides: only when the code is the object of attention (e.g. a Predict prompt). Keep it short — 4–6 lines maximum. Use a monospace font and syntax highlighting if possible.
- Diagrams and visuals are preferred over text wherever dual coding applies.
- Avoid decorative images that carry no meaning — they add visual noise without reducing cognitive load.

---

## 7. Slide Types Reference

| Slide type | Pillar | What it contains |
|------------|--------|-----------------|
| Retrieval starter | Recap and Recall | 2–3 short retrieval questions (no answers on screen yet); a timer |
| Retrieval reveal | Recap and Recall | Answers revealed; brief discussion prompt |

**Recap and Recall — question design rules:**

- Questions must draw on knowledge from previous lessons in the unit (or prior units where that knowledge is being built on today). Do not recap content from the current lesson.
- **At least one question must be highly guessable** — a true/false, a fill-in-the-blank with a strong contextual cue, or a multiple-choice option. If every question is open-ended, students who feel uncertain will write nothing ("?" or "idk") and the retrieval practice is lost. A guessable question forces a committed answer from every student and gives you something to correct.
- Open-ended questions are fine alongside guessable ones, but should be short and concrete (e.g. "What does `print()` do?" not "Explain how Python programs work").
- Avoid questions that reward vague answers. "What did we learn last lesson?" invites nothing. "What is the word for a named storage location in a program?" does not.
| Learning intentions | Clarity of Learning Intentions | Topic question (unit-level); lesson question (today) |
| Declarative knowledge | New Information | Key term + visual or analogy; max 2 bullets |
| Live coding frame | New Information | Task prompt for the live demo ("watch what happens when…"); no code — code goes in the IDE |
| Predict prompt | Deliberate Practice | Short program (4–6 lines); "What will this output?" or "What value is in the variable after line 3?" |
| Trace table | Deliberate Practice | Blank table: columns = variables, rows = line numbers; students complete on paper or mini-whiteboards |
| Task slide | Deliberate Practice | One clearly stated task; link or filename for the interactive activity; no additional explanation |
| Feedback / reveal | Feedback | Expected output or worked answer; common mistake called out |
| Debugging recipe (reference) | — | Persistent reference slide shown during Investigate phases: *Read the last line → find the line number → read that line aloud → compare to what you meant* |

---

## 8. Unit-Level Questions (Clarity of Learning Intentions)

**Topic question (appears every lesson):**
> *How do we write programs that take input, process it, and produce the right output?*

**Lesson questions (replace each lesson):**

| Lesson | Lesson question |
|--------|----------------|
| 1 | How do we get a program to display information? |
| 2 | How do we store and use information in a program? |
| 3 | Why does the type of a value matter, and how do we change it? |
| 4 | How do we make a program choose between two options? |
| 5 | What have I learned about Python? |
| 6 | What did I get wrong, and how do I fix it? |

---

## 9. Approved Build System (all lesson decks and MTPs)

Use this for every lesson deck unless Nick says otherwise.

### Standard slide order

1. **Recap & Recall starter** — retrieval questions from last lesson **and** further back. Tag each question with a pill label showing its source lesson (e.g. "Last lesson", "Lesson 2"). Recap & Recall icon.
2. **Recap & Recall answers** — same layout, **dark background**, reveals the answers. Recap & Recall icon.
3. **Title slide.**
4. **Topic Question** (unit-level, muted) + **Lesson Question** (this lesson, in a highlighted card). Clarity icon.
5. **Lesson content slides.**
6. **Plenary** — revisits the same Lesson Question as an exit task. Recap & Recall icon.

### Pillar icons (colour-coded)

| Pillar | Colour | File |
|---|---|---|
| Clarity of Learning Intentions | pink | `ClarityOfLearningIntentions.png` |
| New Information | yellow | `NewInformation.png` |
| Deliberate Practice | teal | `DeliberatePractice.png` |
| Recap & Recall | orange | `RecapAndRecall.png` |
| Feedback | blue | `Feedback.png` |

The PNGs are in `C:\Users\n.houlton_grange.out\Pictures\`.

### Design system

- **Reference template:** `component3_example_deck.pptx` (made in Claude web).
- **Build tool:** pptxgenjs. Pipeline: `node build_deck.js` → `validate.py` → `soffice --headless --convert-to pdf` → `pdftoppm -jpeg -r 150` for per-slide visual QA.
- **Layout:** `LAYOUT_WIDE` (13.33 × 7.5 in).
- **Palette:** Charcoal `#1E1E24` · Gold `#D8A73D` · Off-white `#F5F5F3`.
- **Fonts:** Cambria (headers), Calibri (body).
- **Minimum font sizes:** body, bullet and card text **≥ 18pt**; callout banners and Turn & Talk prompts ~19–25pt; small uppercase labels, kickers and timer-chip captions 12–14pt.

### Icon rendering rules

- Source PNGs may have an opaque white background, and simple colour-keying leaves a halo. The correct fix: detect the non-white pixels → find the circle's bounding box → compute the true centre and radius geometrically → build a fresh alpha mask from that geometry (4× supersample, then downsample for a clean 1px anti-aliased edge). This keeps the inner white glyph opaque and gives a crisp, single-colour circle with no fringe.
- **Never add a drop shadow to icons.** They must sit flat.
- **Z-order:** call `addIcon()` *after* any background shapes that would otherwise cover it. pptxgenjs draws in the order shapes are added and has no z-index option.

### Unit theme variants

A unit with a story layer can restyle the deck to match it, but keeps the slide order, pillar icons, fonts, minimum sizes and Section 5–6 rules above.

- **Y9 Python — *Station Zero*** (survival horror, `Y9/Python/`): charcoal stays the base, gold is used as the station's hazard/warning colour, and a dim phosphor green (Consolas) is kept for story text only: chapter cards and terminal logs. Alarm red appears **only** on error messages. The Recap & Recall starter stays light (off-white) so the answers slide can be the dark one. The story appears in two places only, as in the activities: a chapter card before the task and a cliffhanger at the end. Content slides carry no decorative horror imagery. Code uses Consolas, coloured like the activities' memory view: strings in Okabe-Ito orange (`str`), numbers in sky blue (`int`), so slides and activities use the same type colours.
  - **Start from `_presentations/Y9_Python/README.md` and `Y9_Python_Deck_Template.pptx`** (one example of every slide type, with guidance in the speaker notes). The README holds the unit's rules and the running feedback log; the template's rules slides are generated from it.
  - Slide types are functions in `sz_slides.cjs`, drawing parts in `sz_kit.cjs`. A lesson deck is one builder script (`build_deck.cjs` is Lesson 1); copy it for a new lesson. On Windows, call `soffice.exe --headless --convert-to pdf` directly — the pptx skill's `soffice.py` wrapper uses Unix sockets and fails.
