# Y8 Data Representation lesson decks

PowerPoint decks for the Y8 Data Representation unit (`Knowledge Base/project_y8_data_representation_mtp.md`). Every deck follows [`../ppt-guidelines.md`](../ppt-guidelines.md) §9.

- **Kit:** the shared slide kit from `../Y9_Python/` (`sz_kit.cjs` parts, `sz_slides.cjs` recipes) with no story layer (`station: 'none'`).
- **Palette:** deep indigo with a sky-blue accent, passed to `createDeck({ palette })`. **Not charcoal and gold** (Nick, 2026-11-03). Copy the `palette` block from `build_L1.cjs` for later lessons.
- **Binary numbers:** always show every bit, 0s included (0110, not 110). Short numbers lined up on the right are confusing (Nick; MTP decision, 2026-11-03).
- **Fonts:** Google fonts, so the decks look the same in Google Slides: Lora (headings), Lato (body), Ubuntu Mono (bits and sums).
- **Unit parts** (`dr_kit.cjs`, shared by every builder): a heading/bit/left column grid, accent outlines round columns, ×2 doubling labels, a three-step sub-goal strip (each step gets an outline on the click that reaches it), You do / answers (`youDoSlide`, `qSize` for whole sums) and task cards (`taskSlide`). Lesson-only slide types stay in their builder: `b2dSlide`/`d2bSlide` (L1), `addSlide` (L2: column addition built one column per click, the column's outline and working fading on the next click, carries above, an optional box on the left for a final carry, works in denary too).

## Files

| File | What it is |
|---|---|
| `dr_kit.cjs` | The unit's drawing parts and slide types (above) |
| `build_L1.cjs` | Builds `L1_Binary_And_Denary.pptx` from the L1 activity page and MTP section |
| `build_L2.cjs` | Builds `L2_Binary_Addition.pptx` from the L2 activity page and MTP section |
| `build_L3.cjs` | Builds `L3_Hexadecimal.pptx` from the L3 activity page and MTP section. Lesson-only slide types: `b2hSlide` (4 or 8 bits → hex in the page's grid: split, 8 4 2 1, denary, hex digit, join) and `h2bSlide` (hex → 8 bits). Never says "nibble" (MTP decision, 2026-11-16) |
| `publish_to_drive.cjs` + `drive.json` | Uploads lesson decks to the "Data Representation" Drive folder as Google Slides (see Publishing to Drive) |

## Building

```
npm install -g pptxgenjs          (once)
node build_L1.cjs                 → L1_Binary_And_Denary.pptx
```

Close the `.pptx` in PowerPoint first. To check it: `soffice --headless --convert-to pdf L1_Binary_And_Denary.pptx`, then turn the pages into images with Python `pdfplumber`.

## ISYS (I Say, You Say)

Each lesson flags 1–3 phrases with `K.isys(slide, { term, fact, say })` (`ppt-guidelines.md` §10): the phrase and a dot by the slide number, the teacher script in the notes, the list on a hidden teacher slide 1. L1: Binary, Bit, 4-bit headings. L2: Carry, 1 + 1, 1 + 1 + 1. L3: Hexadecimal, A, One hex digit.

On an animated slide each phrase is tied to the click where it is taught (`click: k`), so the corner never gives away a reveal: L1 slide 6 Binary, then Bit at click 1 · L2 Carry at click 3; 1 + 1 at click 3, 1 + 1 + 1 at click 4 · L3 slide 6 A at click 2, Hexadecimal at click 8 (A … 10 moved there from the answers slide, where it came after the class had already used it).

## Feedback

- **2026-11-19 · ISYS follows the clicks** — After the Y9 L5 lesson (Call flagged a slide after it was taught didn't work): flag a phrase on the slide, and at the click, where it is taught. See ISYS above.
- **2026-11-17 · L2 recap** — Q1 (convert 0101) carries the hint "Remember 8 4 2 1 along the top" (Nick added it in Slides; it now lives in `build_L2.cjs` as the card's `hint`). Edit the builders, not the Slides copies: a publish replaces Slides edits, and the publisher now refuses to while one is there.

## Publishing to Drive

Decks are published as Google Slides to the [Data Representation](https://drive.google.com/drive/folders/1ZPf7_uq6PWK69OaGfLnPw1QVT2v1cRKJ) Drive folder. `node publish_to_drive.cjs` rebuilds every `build_L<n>.cjs` deck, uploads each deck whose slides changed to a folder named after it (`L1_Binary_And_Denary/L1_Binary_And_Denary`), and writes its Slides ID into `../lesson-slides.json` under `Y8/Data_Representation/<deck>`, so the hub's Assign button attaches it to the lesson's Classroom post. **A deck's name must match its lesson folder** (`L2_Binary_Addition.pptx` for `Y8/Data_Representation/L2_Binary_Addition/`). Commit `drive.json` and `lesson-slides.json`. A republish replaces the same Slides file, so posted links keep working, but edits made in Slides would be lost, so the publisher stops (naming the deck) if one was edited in Slides since it was published: move the edit into the builder, then run with `--discard-slides-edits`. `--dry-run` lists what would go up. Sign-in setup is shared with Y10 (see `../Y10_BTEC_CDM/README.md`).
