# Y8 Data Representation lesson decks

PowerPoint decks for the Y8 Data Representation unit (MTP: `Knowledge Base/project_y8_data_representation_mtp.md`).
Every deck follows [`../ppt-guidelines.md`](../ppt-guidelines.md) §9 and the cognitive-load rules below.

## Files

| File | What it is |
|---|---|
| `build_L1.cjs` | Builds `L1_Binary_And_Denary.pptx` (activity: `Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html`) |

Built with the Y9 kit (`../Y9_Python/sz_kit.cjs`: masters, pillar icons, click animations, Recap & Recall cards and
recipes from `sz_slides.cjs`) with no story layer (`station: 'none'`) and Google fonts (`fonts: { head: 'Lato',
body: 'Lato', mono: 'Ubuntu Mono' }`), because lessons are taught from Google Slides. Drawing parts for this unit
(the place-value `grid`, `numCard`, `taskSlide`, sub-goal `steps`) are at the top of `build_L1.cjs`: copy them for
the next lesson.

## Building and checking

```
node build_L1.cjs
powershell -File ../Y10_BTEC_CDM/render_slides.ps1 -Deck <full path>.pptx -OutDir <folder>
```

The render shows each slide with every click shown. Look at every one.

## Rules

- **Follow the activity:** the deck teaches in the page's tab order; a "Tab n" task slide comes straight after the
  teaching that tab needs, and every term the tab uses is on a slide first.
- **No split attention:** headings sit directly above their bits; working (`+8`, `22−16=6`) sits directly under its
  column; never a separate key or legend.
- **One step at a time:** worked examples build on click or one heading per slide; only the new part changes
  between slides (same grid, same place).
- **Fade the support:** I do → We do → You do. Binary → denary goes from highlighted columns with the sum, to bits
  under headings, to the bare number. Sub-goal steps sit along the bottom of the worked examples.
- **No redundancy:** what the teacher says lives in the notes; at most 3 text areas; no decorative images.

## Feedback log

Add new feedback at the bottom, dated, one line each.

- **2026-11-03 · Lesson 1** — Deck rebuilt from the lesson aims (not the old Google Slides), with cognitive load first.
