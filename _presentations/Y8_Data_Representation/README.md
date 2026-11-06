# Y8 Data Representation lesson decks

PowerPoint decks for the Y8 Data Representation unit (`Knowledge Base/project_y8_data_representation_mtp.md`). Every deck follows [`../ppt-guidelines.md`](../ppt-guidelines.md) §9.

- **Kit:** the shared slide kit from `../Y9_Python/` (`sz_kit.cjs` parts, `sz_slides.cjs` recipes) with no story layer (`station: 'none'`).
- **Palette:** deep indigo with a sky-blue accent, passed to `createDeck({ palette })`. **Not charcoal and gold** (Nick, 2026-11-03). Copy the `palette` block from `build_L1.cjs` for later lessons.
- **Binary numbers:** always show every bit, 0s included (0110, not 110). Short numbers lined up on the right are confusing (Nick; MTP decision, 2026-11-03).
- **Fonts:** Google fonts, so the decks look the same in Google Slides: Lora (headings), Lato (body), Ubuntu Mono (bits and sums).
- **Unit parts** (in each builder for now): a heading/bit/left column grid, accent outlines round the columns with a 1, ×2 doubling labels, a three-step sub-goal strip (each step gets an outline on the click that reaches it), and worked-example slides that build up one step per click (`b2dSlide`, `d2bSlide`), You do / answers (`youDoSlide`) and task cards (`taskSlide`). If Lesson 2 needs them too, move them into a shared `dr_kit.cjs`.

## Files

| File | What it is |
|---|---|
| `build_L1.cjs` | Builds `L1_Binary_And_Denary.pptx` from the L1 activity page and MTP section |
| `publish_to_drive.cjs` + `drive.json` | Uploads lesson decks to the "Data Representation" Drive folder as Google Slides (see Publishing to Drive) |

## Building

```
npm install -g pptxgenjs          (once)
node build_L1.cjs                 → L1_Binary_And_Denary.pptx
```

Close the `.pptx` in PowerPoint first. To check it: `soffice --headless --convert-to pdf L1_Binary_And_Denary.pptx`, then turn the pages into images with Python `pdfplumber`.

## Publishing to Drive

Decks are published as Google Slides to the [Data Representation](https://drive.google.com/drive/folders/1ZPf7_uq6PWK69OaGfLnPw1QVT2v1cRKJ) Drive folder. `node publish_to_drive.cjs` rebuilds every `build_L<n>.cjs` deck, uploads each deck whose slides changed to a folder named after it (`L1_Binary_And_Denary/L1_Binary_And_Denary`), and writes its Slides ID into `../lesson-slides.json` under `Y8/Data_Representation/<deck>`, so the hub's Assign button attaches it to the lesson's Classroom post. **A deck's name must match its lesson folder** (`L2_Binary_Addition.pptx` for `Y8/Data_Representation/L2_Binary_Addition/`). Commit `drive.json` and `lesson-slides.json`. A republish replaces the same Slides file, so posted links keep working, but edits made in Slides are lost: change the builder. `--dry-run` lists what would go up. Sign-in setup is shared with Y10 (see `../Y10_BTEC_CDM/README.md`).
