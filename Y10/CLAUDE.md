# Y10 — BTEC Tech Award in Creative Media Production

Rules for everything in `Y10/` and the Y10 decks. They add to the root `CLAUDE.md`. The PRIMM, Python and Station Zero rules don't apply here.

## The course

- Two-year Pearson BTEC Tech Award in Creative Media Production; Y10 is Year 1. Three hours a week.
- The teacher has taught OCR Creative iMedia but is delivering BTEC for the first time.
- Current focus: **Component 1 (Exploring Media Products)**, entered for the **May 2027** series: the Pearson-set Assignment (PSA, about 10 supervised hours: Task 1 ≈ 3 h, Task 2 ≈ 7 h) runs in February–March, and marks and the sample are due **15 May**.
- Component 1 vs iMedia: more media theory and analytical writing; holistic "best fit" marking.
- Before Component 1, both classes did a Component 3 mock: a magazine cover for **FIZZIKAL** (a team fitness brand). It is the natural bridge for early Recap & Recall (cover conventions, audience, layout) and the print sector.
- Across Component 1 series only the vocational context (client, theme, target audience) changes. Tasks, structure, evidence and timing stay the same, so teaching materials can be reused year to year with the context swapped.
- Unit plan: `Knowledge Base/project_y10_btec_cdm_c1_mtp.md` (Component 1 starts at Lesson 1.1, w/c 2 Nov 2026). Bullet points for discrete knowledge; reading age about 12.
- Spec, assessment guidance and marking grids: `Knowledge Base/BTEC_CDM/`. **The whole folder is git-ignored: no Pearson file (or text copy of one) is ever committed** (Nick, 2026-11-02), so each machine keeps its own copy. **Read and grep the text copies in `Knowledge Base/BTEC_CDM/text/` (one `.md` per document, `<!-- page N -->` markers matching the PDF pages) rather than opening the PDFs.** The marking grids were images in the PDF and are transcribed there as tables. If a source document is added or replaced, extract it again into `text/`.
- **Anything behind a Pearson login goes in `Knowledge Base/BTEC_CDM/secure/`, which is git-ignored** (the repo is public): the live PSA (`secure/PSA_June2027/`), exemplar student material (`secure/exemplars/<series>/`, High/Medium/Low) and moderator reports (`secure/moderator_reports/`). Their text copies go in `secure/text/`, never in `text/`. Grep `secure/text/` for what moderators praise or penalise and how marks were awarded. Never quote the live PSA, and never copy exemplar students' work into anything committed or shown to students.

## Teaching approach

- **Students make things from the start.** Practical work dominates; introduce knowledge just in time, not all up front.
- **As interactive as possible, with the repo's usual house style:** drag-drop over dropdowns, per-question green/red feedback, real understanding checks (no click-to-continue), work saved locally, and `submitGrade` sending score and evidence back to Classroom whenever a task is completed. Open analytical writing is evidence for Classroom, scored on completion, not auto-marked.
- **Scaffold dense texts before open questions** (briefs, theory, exemplars): short chunks → silent jot → Turn & Talk → open Q&A. Never go straight from presenting to unstructured Q&A.
- **Abstract terms need a concrete worked model.** E.g. audience lifestyle terms (interests, attitudes, values, behaviour) only clicked with a neutral model audience (football fans) worked through first.
- **Scaffold where confusion actually happened.** The teacher reports the real sticking points after teaching; build scaffolds for those exact points rather than guessing ahead of time.
- **Use media students know.** Make every point with real products they're familiar with (games, shows, films, YouTubers, adverts, apps they use), plus historical ones with a hook. Never abstract or invented examples. But don't use products about the live PSA theme or aimed at its audience as worked models (see the MTP's guard rails). Avoid products centred on people facing serious allegations (e.g. Michael Jackson: no Thriller, no covers featuring him).
- **Ask for images up front.** At the start of every lesson build, list the images and clips needed (covers, campaign images, stills, photo banks) so the teacher can supply them before the lesson is built around them. Never leave a real example text-only: ask for its image.
- **The live PSA is confidential:** never commit it (it's git-ignored), quote it in files, put it on slides or paste it into AI tools (Pearson's notice forbids AI use of its content).
- **Assessed work:** during the PSA students get no hints, feedback, writing frames, templates or other scaffolds, and nothing made in teaching may be reused. So no activity is used during the PSA, and scaffolds (research-log template, PEE frames) are faded out during the walking mock (sample PSA, interleaved with the live PSA from 8.1), whose later sections are done without them. Teaching activities before that are fine.

## Decks

- Component 1 decks use the **"Front Page"** kit in `_presentations/Y10_BTEC_CDM/` (read its `README.md`; examples in `C1_Deck_Template.pptx`). It keeps §9 of `_presentations/ppt-guidelines.md` (slide order, pillar icons, ≥ 18 pt) but has its own look, so the decks don't resemble the Computing ones. Never build a Y10 deck with `Y9_Python/sz_kit.cjs`.
- **Decks are taught from Google Slides** (Nick, 2026-11-03): `publish_to_drive.cjs` uploads each lesson deck to the course Drive folder (`Term 2 (Component 1 Theory)/<lesson>/`, with any `resources/`) as Google Slides; `/ship` and `/lesson-deck` run it. So decks use Google fonts only, and changes go in the builder, never in the Slides copy.
- **Recap & Recall questions are easier here:** include an example in the question, or give a choice of a few options ("hierarchy, alignment or white space?") rather than bare open recall.
- **Define a term before using it** (Nick, 2026-11-03): no concept appears on a slide or in a hub task before it has been introduced or defined (e.g. 1.2 used "anchorage" on the Jaws worked model before its key-term slide). Only the lesson-question slide may pose it first. `/lesson-deck` checks this.
- **One deck per lesson, even in a double** (Nick, 2026-11-03): 1.1 and 1.2 are two files (`build_L1.1.cjs`, `build_L1.2.cjs`), each with its own Recap & Recall, cover, lesson question and plenary. The second lesson's recall looks back at the first.
- **Lesson numbering is week.lesson**, as in Google Classroom: week 1 is 1.1, 1.2, 1.3; week 2 starts at 2.1. Use it on slides ("look back at 2.3"), in deck file names (`L2.3_<Name>.pptx`) and in activity folders: `Y10/Component_1/L2.3_<Name>/` (the hub shows "Lesson 2.3").

## Activities

- Start from `_templates/BTEC_Y10.html` (copy `_templates/BTEC_Y10_checkers.js` beside it as `checkers.js`). Pages are lesson-level: `Y10/Component_1/L<week>.<lesson>_<Name>/<n>_<Name>.html`. The class that has the single first starts with `L1.0_Course_Introduction`.
- The page's script is a shared engine: leave it alone and put the content in `checkers.js` (`TASKS`, then `CHOICES`, `SORTS`, `WRITING`). Task kinds: `choice` (radio questions), `sort` (click or drag cards into boxes), `write` (open writing: checked only for real sentences, completion-scored, always gold). Wrong checks cost 10/20/30 s and survive a refresh; card and option order is seeded per student; `submitGrade` runs on every completed task.
- **Every lesson caters for the whole class, not just the middle** (Nick, 2026-11-02): an optional **Warm-up** tab (`level: 'support'`: fewer, clearer items, a way into Task 1), one or two **★ Challenge** tabs (`level: 'challenge'`: tricky cases and extended writing), and 💡 `details.help` panels inside core tasks (clues, things to look for, word banks, an example). Optional tabs never change the score, gold or "all done", but still send evidence. The deck's task slides say where the Warm-up and Challenge tabs are.
- **Technical terms: spec terms only, each in two core tasks** (Nick, 2026-11-02). Check a term is in the spec (grep `Knowledge Base/BTEC_CDM/text/`) before teaching it; if it isn't, use plain words. Every spec term gets one task where students identify or define it and one where they use the word themselves to describe a real product (a prompt or starter that names it). Optional tabs don't count towards the two.
- **Clips must show obvious differences.** For "then and now", pick a pair whose differences students can spot straight away (e.g. hand-drawn vs CGI), not two versions in a similar style: two Jurassic trailers were too alike to compare.
- **Picture sorts with many cards use `class="sort deal"`** (Nick, 2026-11-02: with 21 cards students kept scrolling between the cards and the boxes). Cards are dealt one at a time, large, beside the boxes, with "Card n of N" and a Skip button; sorted cards shrink to picture tiles (hover shows them bigger with their name), so the whole sort fits on one screen. Short text sorts (e.g. 1.2's Jaws statements) keep the plain layout.
- Page-only extras (e.g. 1.2's caption preview) go in a `PAGE` block just before `// ── Start`, using the engine's `state`, `save` and `esc`.
- Real product images: inline them with `python Y10/inline_images.py <page> key=file[@width] …` (files from `_presentations/Y10_BTEC_CDM/images/`; 600 px wide by default; sort cards `@fit440`, which fits a 440 px square so the zoom view is sharp). Sort-card pictures are never cropped: the card shows the whole image, hovering shows it bigger beside the card, and the magnifier button opens it full size (Nick, 2026-11-02: square crops hid titles and logos). Use them with `<img data-img="key">` or a sort item's `img: 'key'`, and give every one a source (`credit`, or a figcaption). Keep a page under about 1 MB.
- Tests: `checkers.test.js` beside the page (data, marking, MCQ lengths, every image inlined) and a lean spec in `tests/`.

## Software and assets

- Students use **Photoshop 2024**, with only its standard fonts: no Google Fonts or other installed fonts. Menu paths in instructions should be Photoshop's.
- Print documents: choose A4 from the templates rather than typing pixel sizes.
- Free image sources students can use: Unsplash and Pexels (no login; Pexels needs no attribution).
- **Real product images** (posters, covers, screenshots): full-size originals go in `_presentations/Y10_BTEC_CDM/images/` (git-ignored, for the decks) and the Drive folder's `Images/`. Hub pages inline a reduced copy (about 600 px) with a source credit under it (agreed 2026-11-02: UK fair dealing for instruction, s32).
- The Drive folder (below) has `Clips/`, `Images/` and `Photo Bank/` (free photos students may edit, plus the Component 3 mock's cover stars).

## Video clips (Google Drive)

- Clips live in the course's **shared drive folder** (https://drive.google.com/drive/folders/1qs5P8Jj3ZcRDurJtcHiJc8iUX75fa3ey), which is shared **view-only with the Outwood domain**. Never use "anyone with the link", and never put clips in this repo. Tested on a student account on a school PC (2026-10-23). Students use school PCs only (no Chromebooks or iPads).
- Embed: `<iframe src="https://drive.google.com/file/d/<ID>/preview?t=<seconds>" allow="autoplay; fullscreen" allowfullscreen>`, with an "Open in Drive" link `https://drive.google.com/file/d/<ID>/view?t=<seconds>` underneath. `activity-dependencies.test.js` enforces both.
- The page can set the start time only. It can't pause, stop at an end time or tell whether a clip was watched, so state "watch 0:45–1:30" in the task, or trim the clip, and put questions after the clip.
- Every clip used goes in `Y10/media.md` (ID, start/end, lessons that use it). Check a new clip's sharing with the Drive connector before using it.
- Keep clips short, school-only and for teaching (UK fair dealing, CDPA s32).

## Feedback

Feedback that only applies to this course goes in this file (or the Y10 deck README), not in auto-memory.
