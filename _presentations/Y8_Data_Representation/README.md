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

## Building

```
npm install -g pptxgenjs          (once)
node build_L1.cjs                 → L1_Binary_And_Denary.pptx
```

Close the `.pptx` in PowerPoint first. To check it: `soffice --headless --convert-to pdf L1_Binary_And_Denary.pptx`, then turn the pages into images with Python `pdfplumber`.
