# Y10 BTEC Creative Media Production — Component 1 decks ("Front Page")

Lesson decks for Component 1 (Exploring Media Products). Course rules are in `Y10/CLAUDE.md`; this file covers the decks.

## Files

| File | What it is |
|------|-----------|
| `c1_kit.cjs` | Palette, fonts, slide masters and one function ("recipe") per slide type |
| `build_template.cjs` → `C1_Deck_Template.pptx` | One example of every slide type, with guidance in the speaker notes |
| `build_L<n>.cjs` → `L<n>_<Name>.pptx` | One builder per lesson: copy the template builder and keep the slides you need |
| `icons/` | The five pillar icons, already cleaned (copied from `Y9_Python/icons/`) |
| `publish_to_drive.cjs` + `drive.json` | Uploads lesson decks to the course Drive folder as Google Slides (see Publishing to Drive) |
| `resources/<deck name>/` | Optional files that go in the lesson's Drive folder beside the deck (checklists, worksheets) |
| `install_fonts.ps1` | Installs Oswald, Lato and Lora for the current user, so PowerPoint renders the real look |

Build: `node build_L<n>.cjs` (needs `npm install -g pptxgenjs`). The builder lists every image slot still waiting for a picture: send that list to Nick before the lesson is built around them. Pass `img: 'images/….jpg'` to a recipe to fill a slot (keep images in `images/` beside the builder). `images/` is git-ignored (full-size copyrighted originals); the master copies are in the course Drive folder's `Images/`. A picture close to its slot's shape fills it; a very different shape (a portrait poster in a wide slot) is fitted whole and centred, with no box behind it on paper slides (black on dark ones), so `annotate` marks are positions in the slot, not the picture.

Lesson decks so far: `build_L1.0.cjs` (course introduction, single-first class only) `build_L1.1.cjs` and `build_L1.2.cjs` (the week 1 double: one deck per lesson, each with its own Recap & Recall).

Check in **PowerPoint**, not LibreOffice: `powershell -File render_slides.ps1 -Deck <full path>.pptx -OutDir <folder>` exports every slide as PowerPoint draws it, then look at every slide (LibreOffice substitutes fonts and hid overflowing headlines; Nick, 2026-11-02). PowerPoint ignores "shrink text on overflow" until someone edits the text, so the kit sizes `fit: 'shrink'` text itself from measured font widths (`fitFont`); key-term slides use a master with no title placeholder, so no empty "Click to add title" box shows.

## Publishing to Drive

Lessons are taught from Google Slides in the course Drive folder, not from the `.pptx`. `node publish_to_drive.cjs` first rebuilds every deck from its `build_L<n>.cjs` (so Drive always gets the latest builder and kit; a deck open in PowerPoint stops the run), then uploads each deck whose slides changed since it was last published to `Term 2 (Component 1 Theory)/<lesson>` (e.g. `1.1 Media Everywhere`), converted to Google Slides, plus anything in `resources/<deck name>/` (Word/Excel/PowerPoint become Docs/Sheets/Slides). `drive.json` records each file's Drive ID and hash: commit it. A republish replaces the contents of the same Slides file, so links in Classroom keep working, but **edits made in Slides are lost**: change the builder instead. `--dry-run` lists what would go up; name a deck to publish only that one; `--force` republishes unchanged files. `/ship` and `/lesson-deck` run it.

One-time setup per machine: in the Google Cloud project that owns the hub's OAuth client, enable the **Google Drive API**, create an OAuth client of type **Desktop app**, download its JSON and save it as `%USERPROFILE%\.oga-drive\client_secret.json`. The first run opens the browser to sign in (the school account, which can edit the course folder); the token is saved beside the client file, outside the repo.

## The look

Editorial / magazine, so Component 1 decks look nothing like the Computing decks (chosen 2026-10-23, with the ui-ux-pro-max skill's "magazine" recommendations mapped to fonts every school PC has).

- **Colours:** paper `#F4EFE6`, ink `#16161A`, print red `#C8321A` (on ink: `#FF6A4D`), grey `#5F5A52`. Red marks the one thing to look at; never body text.
- **Fonts:** Oswald (headlines, numerals), Lato (body, ≥ 18 pt), Lora italic (quotes, standfirsts, the topic question). All Google fonts, because the decks are taught from Google Slides (see Publishing to Drive). To render in PowerPoint, install them once per machine: `powershell -File install_fonts.ps1`. The first render after installing can still show fallback fonts on the opening slides: render again.
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
| `turnTalk` | Deliberate Practice | One question in big type, then think → partner A → partner B; optional image |
| `task` | Deliberate Practice | Steps, where to find it, success criteria, timer |
| `choice` | Feedback | Hinge question, 2–4 lettered options of similar length |
| `modelAnswer` | Feedback | Model analytical paragraph colour-coded Point / Evidence / Explain |
| `plenary` | Recap & Recall | Last slide: today's question as an exit task + sentence starter |

## Rules and feedback log

Newest last. Add feedback here (or with `/log-feedback`), then rebuild the template.

- **2026-10-23 · Look** — Component 1 decks must not look like the Computing or Component 3 decks: use this kit, not `Y9_Python/sz_kit.cjs`.
- **2026-10-23 · Recap** — Recap & Recall questions include an example or a choice of options; no bare open recall.
- **2026-10-23 · Images** — Real examples, never invented ones; list the images needed before building, and never leave a real example text-only.
- **2026-11-03 · Google Slides** — Decks are published to the course Drive folder as Google Slides (`publish_to_drive.cjs`), so they use Google fonts only (Oswald / Lato / Lora replaced Bahnschrift / Segoe UI / Georgia). Design every new recipe and deck around Google fonts.
