# Y10 — BTEC Tech Award in Creative Media Production

Rules for everything in `Y10/` and the Y10 decks. They add to the root `CLAUDE.md`. The PRIMM, Python and Station Zero rules don't apply here.

## The course

- Two-year Pearson BTEC Tech Award in Creative Media Production; Y10 is Year 1. Three hours a week.
- The teacher has taught OCR Creative iMedia but is delivering BTEC for the first time.
- Current focus: **Component 1 (Exploring Media Products)**. The Pearson-set assignment is released and marks are due in **December**: that deadline drives the pace.
- Component 1 vs iMedia: more media theory and analytical writing; holistic "best fit" marking.
- Across Component 1 series only the vocational context (client, theme, target audience) changes. Tasks, structure, evidence and timing stay the same, so teaching materials can be reused year to year with the context swapped.
- Unit plan: the existing 42-lesson, four-phase Component 1 MTP (two 7-week terms, 3 lessons a week) → `Knowledge Base/BTEC_CDM/` once copied across. Bullet points for discrete knowledge; reading age about 12.
- Spec, assessment guidance and marking grids: `Knowledge Base/BTEC_CDM/`.

## Teaching approach

- **Students make things from the start.** Practical work dominates; introduce knowledge just in time, not all up front.
- **Scaffold dense texts before open questions** (briefs, theory, exemplars): short chunks → silent jot → Turn & Talk → open Q&A. Never go straight from presenting to unstructured Q&A.
- **Abstract terms need a concrete worked model.** E.g. audience lifestyle terms (interests, attitudes, values, behaviour) only clicked with a neutral model audience (football fans) worked through first.
- **Scaffold where confusion actually happened.** The teacher reports the real sticking points after teaching; build scaffolds for those exact points rather than guessing ahead of time.
- **Use real-life examples** (real campaigns, products, covers) rather than invented ones.
- **Ask for images up front.** At the start of every lesson build, list the images and clips needed (covers, campaign images, stills, photo banks) so the teacher can supply them before the lesson is built around them. Never leave a real example text-only: ask for its image.
- **Assessed work:** activities used during the assessed Component 1 tasks must not give hints or auto-feedback on the assessed content (Pearson rules). Teaching activities before that are fine.

## Decks

- Component 1 decks use the **"Front Page"** kit in `_presentations/Y10_BTEC_CDM/` (read its `README.md`; examples in `C1_Deck_Template.pptx`). It keeps §9 of `_presentations/ppt-guidelines.md` (slide order, pillar icons, ≥ 18 pt) but has its own look, so the decks don't resemble the Computing ones. Never build a Y10 deck with `Y9_Python/sz_kit.cjs`.
- **Recap & Recall questions are easier here:** include an example in the question, or give a choice of a few options ("hierarchy, alignment or white space?") rather than bare open recall.
- When a slide tells students to look back at an earlier lesson, use the teacher's **Google Classroom folder numbering**, not the MTP numbering, where they differ. (Component 1 numbering to be confirmed.)

## Software and assets

- Students use **Photoshop 2024**, with only its standard fonts: no Google Fonts or other installed fonts. Menu paths in instructions should be Photoshop's.
- Print documents: choose A4 from the templates rather than typing pixel sizes.
- Free image sources students can use: Unsplash and Pexels (no login; Pexels needs no attribution).

## Video clips (Google Drive)

- Clips live in a school Google Drive folder shared **view-only with the Outwood domain**, never "anyone with the link" and never in this repo. Tested on a student account on a school PC (2026-10-23).
- Embed: `<iframe src="https://drive.google.com/file/d/<ID>/preview?t=<seconds>" allow="autoplay; fullscreen" allowfullscreen>`, with an "Open in Drive" link `https://drive.google.com/file/d/<ID>/view?t=<seconds>` underneath. `activity-dependencies.test.js` enforces both.
- The page can set the start time only. It can't pause, stop at an end time or tell whether a clip was watched, so state "watch 0:45–1:30" in the task, or trim the clip, and put questions after the clip.
- Every clip used goes in `Y10/media.md` (ID, start/end, lessons that use it). Check a new clip's sharing with the Drive connector before using it.
- Keep clips short, school-only and for teaching (UK fair dealing, CDPA s32).

## Feedback

Feedback that only applies to this course goes in this file (or the Y10 deck README), not in auto-memory.
