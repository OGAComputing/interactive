# Y10 BTEC Creative Media Production — Component 1 decks ("Front Page")

Lesson decks for Component 1 (Exploring Media Products). Course rules are in `Y10/CLAUDE.md`; this file covers the decks.

## Files

| File | What it is |
|------|-----------|
| `c1_kit.cjs` | Palette, fonts, slide masters and one function ("recipe") per slide type |
| `build_template.cjs` → `C1_Deck_Template.pptx` | One example of every slide type, with guidance in the speaker notes |
| `build_L<n>.cjs` → `L<n>_<Name>.pptx` | One builder per lesson: copy the template builder and keep the slides you need |
| `icons/` | The five pillar icons, already cleaned (copied from `Y9_Python/icons/`) |

Build: `node build_L<n>.cjs` (needs `npm install -g pptxgenjs`). The builder lists every image slot still waiting for a picture: send that list to Nick before the lesson is built around them. Pass `img: 'images/….jpg'` to a recipe to fill a slot (keep images in `images/` beside the builder).

Check: `soffice.exe --headless --convert-to pdf <deck>.pptx`, render pages with `pdfplumber`, and look at every slide.

## The look

Editorial / magazine, so Component 1 decks look nothing like the Computing decks (chosen 2026-10-23, with the ui-ux-pro-max skill's "magazine" recommendations mapped to fonts every school PC has).

- **Colours:** paper `#F4EFE6`, ink `#16161A`, print red `#C8321A` (on ink: `#FF6A4D`), grey `#5F5A52`. Red marks the one thing to look at; never body text.
- **Fonts:** Bahnschrift SemiBold Condensed (headlines, numerals), Segoe UI (body, ≥ 18 pt), Georgia italic (quotes, standfirsts, the topic question). All Windows fonts, so nothing needs installing.
- **Shapes:** square corners, heavy rules between items, a folio line across the top of every slide. No rounded cards, no shadows.
- §9 still applies: slide order, pillar icons top right, Recap starter light and answers dark, plenary revisits the lesson question.

## Slide types (recipes in `c1_kit.cjs`)

| Recipe | Pillar | Use for |
|--------|--------|---------|
| `recallStarter` / `recallAnswers` | Recap & Recall | First two slides. 2–4 questions, source tag, choices or an example in each question |
| `titleSlide` | — | The lesson as a magazine cover: masthead, cover line (lesson title), cover image, optional puff |
| `questions` | Clarity | Topic question (muted, every lesson) + today's question |
| `info` | New Information | Standfirst + up to 4 numbered points, optional image |
| `keyTerm` | New Information | One term or theory: definition + a real example with its image |
| `readingScaffold` | Deliberate Practice | Dense text in chunks: Read → Jot → Turn & Talk → Share (`step` = live stage) |
| `clip` | Deliberate Practice | A Drive clip (from `Y10/media.md`): watch window on the slide, questions after |
| `annotate` | Deliberate Practice (or `info` for a worked example) | A real product with numbered markers and notes |
| `compare` | Deliberate Practice | Two real products against the same criteria |
| `task` | Deliberate Practice | Steps, where to find it, success criteria, timer |
| `choice` | Feedback | Hinge question, 2–4 lettered options of similar length |
| `modelAnswer` | Feedback | Model analytical paragraph colour-coded Point / Evidence / Explain |
| `plenary` | Recap & Recall | Last slide: today's question as an exit task + sentence starter |

## Rules and feedback log

Newest last. Add feedback here (or with `/log-feedback`), then rebuild the template.

- **2026-10-23 · Look** — Component 1 decks must not look like the Computing or Component 3 decks: use this kit, not `Y9_Python/sz_kit.cjs`.
- **2026-10-23 · Recap** — Recap & Recall questions include an example or a choice of options; no bare open recall.
- **2026-10-23 · Images** — Real examples, never invented ones; list the images needed before building, and never leave a real example text-only.
