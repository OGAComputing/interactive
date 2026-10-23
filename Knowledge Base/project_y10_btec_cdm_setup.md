# Y10 BTEC Creative Digital Media — repository setup plan

Started 2026-10-23. Scope: Component 1 (Exploring Media Products) first.
Tick items off as they're done. **You** = teacher, **Claude** = Claude Code in this repo.

## Stage 1 — Prove Drive video works (do this first)

Everything in Component 1 depends on students watching media clips, so test the delivery method before building lessons.

- [ ] **You:** pick a short test clip that you own (not a colleague's file, not one with pupils in it) and upload it to a school Drive folder, e.g. `BTEC CDM Media/`.
- [ ] **You:** share the **folder** with the school domain as Viewer (not "Anyone with the link"). Files added later inherit it.
- [ ] **You:** check that student accounts are covered by that domain share. Staff are `grange.outwood.com`; a share to `outwood.com` may or may not include student accounts.
- [ ] **Claude:** push the probe page `_drafts/Drive_Video_Probe.html`. It takes the file ID from the address, so no ID is committed.
- [ ] **You:** on a student account on a school PC, open
      `https://<pages-site>/_drafts/Drive_Video_Probe.html?id=<FILE_ID>&t=8` and record, for each box:
  - A: plain embed — plays / sign-in prompt / "request access"?
  - B: embed with `?t=8` — starts at 8 s?
  - C: embed with `#t=8` — starts at 8 s?
  - D: "Open in Drive" link with `?t=8` — opens at 8 s? (Already confirmed on a staff account.)
- [ ] **You:** repeat once on a staff account and, if students use them, on a Chromebook or iPad.
- [ ] **Decide** from the results:
  - Embeds play and start time works → embed with a start time, plus a fallback link.
  - Embeds play, start time doesn't → embed, and write "watch from 0:45" in the task.
  - Embeds blocked (third-party cookies) → links that open in a new tab at the start time.

What stays impossible either way: the page can't pause the clip, stop it at an end time, or tell whether it was watched. Trim clips to the part students need.

## Stage 2 — Bring the web project across

From https://claude.ai/project/019eb0ea-1cb5-7755-86dc-0a7dc4d466d2:

- [ ] **You:** copy the project instructions.
- [ ] **You:** copy the project memory, or ask Claude there: *"List every preference, convention and piece of feedback you've learned in this project, as bullet points."*
- [ ] **You:** download the knowledge files that matter for Component 1: the Pearson specification, the Component 1 assessment guidance, the authorised assignment brief, and any exemplars.
- [ ] **You:** paste the text into this chat and put the files in `Knowledge Base/BTEC_CDM/`.
- [ ] **Claude:** sort out what applies to Component 1 and what was specific to the Component 3 mock.

## Stage 3 — Folder structure and rules

- [ ] **Claude:** create `Y10/CLAUDE.md` with the BTEC preferences from Stage 2, the house rules that do and don't apply (PRIMM and Python rules don't), and Pearson's rules on feedback during assessed work.
- [ ] **Claude:** create the course folder, e.g. `Y10/Component_1/L1_<Name>/…` (lesson folders as in the root CLAUDE.md; underscores, no spaces).
- [ ] **Claude:** create `Y10/media.md`: one row per clip with title, Drive file ID, start/end times, and the lessons that use it. Lessons read IDs from here, so a re-uploaded clip is fixed in one place.
- [ ] **Claude:** add a memory rule: BTEC-only feedback goes in `Y10/CLAUDE.md`, not auto-memory.

## Stage 4 — Tests and repo rules

- [ ] **Claude:** add `'Y10'` to `ACTIVITY_ROOTS` in `activity-dependencies.test.js` (it currently skips Y10, so Y10 pages would go unchecked).
- [ ] **Claude:** add a test that every `<iframe>` in an activity points only at `https://drive.google.com/file/d/<id>/preview` and nothing else. The current external-resource check only looks at scripts, stylesheets and fonts, so iframes aren't checked at all.
- [ ] **Claude:** add a test that every Drive embed has a matching "Open in Drive" fallback link.
- [ ] **Claude:** update the root `CLAUDE.md` "No external files" rule to name the one exception (school-only Drive video embeds and links).
- [ ] **Claude:** add a Y10 topic accent to `shared.css` if wanted.
- [ ] **Claude:** check the hub shows Year 10 correctly (`build-manifest.yml` already maps `Y10` → "Year 10").

## Stage 5 — Templates and first lesson

- [ ] **Claude:** add a `_templates/BTEC_Y10.html` starter (based on `Y8.html`/`Y11.html`) with a ready-made video block: embed, fallback link, "watch from–to" note, analysis questions underneath.
- [ ] **You:** agree the Component 1 lesson sequence (MTP) → saved as `Knowledge Base/project_y10_btec_cdm_c1_mtp.md`.
- [ ] **Claude + You:** build Lesson 1: activity page, deck (`/lesson-deck`), any printable resources. Run `/audit-activity`, then `/ship`.
- [ ] **You:** teach it, then `/log-feedback`.

## Notes

- **Copyright:** keep clips school-only and short. UK fair dealing for teaching (CDPA s32) covers illustration for instruction, not public posting.
- **Assessed work:** activities used during the assessed Component 1 tasks must not give hints or auto-feedback on the assessed content.
- **Ownership:** clips in a colleague's Drive vanish if they delete them or leave. Keep course media in a shared drive or a folder you own.
