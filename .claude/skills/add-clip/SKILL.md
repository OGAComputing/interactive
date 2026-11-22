---
name: add-clip
description: Add a sound or video clip to a Y10 lesson: get the source, have Nick pick the moments from a check file, cut it to 90 s or less at pauses, upload it to Drive › Clips (Outwood-only), record it in Y10/media.md, and embed it on the hub page and as a linked clip slide in the deck. Use when asked to add, cut, trim, upload or link an audio clip, sound clip, radio extract, video clip or trailer for a lesson.
argument-hint: <page.html> <what the clip should show>
---

# Add a clip

Add the clip described in `$ARGUMENTS` to that page and its deck. The rules are in `Y10/CLAUDE.md`
("Video clips (Google Drive)"): clips live in Drive › Clips, shared view-only with the Outwood domain,
**never in this repo**, short and for teaching (CDPA s32). **Each clip is 90 s at most, and as short as it can be**: 90 s is a limit, not a target, so cut long music and padding (Nick, 2026-11-20).
Images are not clips: they go through `/find-images`.

Work in the scratchpad (`clips/` for outputs, its own folder for each download). Nothing here is committed
except the page, the deck builder and `Y10/media.md`.

## 1. Source

- Find a full-length source: archive.org for old radio and film (check the item's licence and description),
  or a file Nick gives you. For a trailer, the official upload.
- Note where it came from: it goes in `media.md` and the caption.

## 2. Nick picks the moments (don't guess)

You can't hear audio or watch video, and guessing from loudness put a cut in the wrong place three times
on 3.3 (2026-11-20). So:

- From the script or a transcript, work out roughly where the moments are (generously: a few minutes).
- For audio, cut a **check file** covering that stretch:
  `node Y10/cut_audio.cjs <source.mp3> "<scratchpad>/clips/CHECK <from>-<to>.mp3" <from>-<to> --check`
- Ask Nick for the times **in the check file** of each moment wanted (e.g. "heat ray at 2:03, the
  transmission line after it, a bit of the piano before 1:10"). Add the check file's start to get source times.
- Video: ask Nick for the times in the source.

## 3. Cut to 90 s or less

- **Audio (MP3):** `node Y10/cut_audio.cjs <source.mp3> "<scratchpad>/clips/<Name>.mp3" <from>-<to> [<from>-<to> …]`
  joins the ranges in order and moves each cut to the quietest moment within 2 s (`--snap=<s>` to widen,
  `--exact` to cut where told). It refuses a clip over 90 s: drop the least important part, and tell Nick
  what was left out. It prints where each part lands in the clip and in the source: give Nick that table.
- **Video (MP4):** there is no ffmpeg on this PC, so ask Nick to trim it (Photos app › Trim, or PowerPoint ›
  Trim Video, then Save Media As) and send the file. A whole trailer under 90 s needs no trimming.
- Name files the way students will see them: `War of the Worlds 2 - Grovers Mill.mp3`.
- Nick listens before upload. Re-cut with his corrections; the file name stays the same.

## 4. Upload

`node Y10/upload_media.cjs --to Clips "<scratchpad>/clips/<Name>.mp3" …` uploads with the deck publisher's
saved sign-in and prints each ID, the embed and Open in Drive links, and the sharing. A file of the same name
is **replaced in place** (same ID, so links keep working). Stop if it warns about "anyone with the link" or
a missing Outwood share.

## 5. Record and link

- **`Y10/media.md`:** one row per clip: name, Drive ID, start/end, what it shows (which parts of the source,
  with times) and the source, and the lessons using it.
- **Page:** a `figure.clip` before the questions that use it, copying 1.1 (video) or 3.3 Task 1 (audio:
  `class="clip-frame audio"`): the `/preview?t=0` iframe, the "Open in Drive ↗" `/view?t=0` link, a
  "Watch / Listen to the whole clip" tag and a caption saying what happens and whose it is. The task's goal
  says to watch or listen first; questions come after the clip and must need it to be answered.
- **Deck:** a `K.clip({ …, video: '<ID>' })` slide where the class hears or watches it, with two or three
  questions and speaker notes naming the clip file, its length and what to draw out (see `build_L3.3.cjs`).
  Rebuild: the build lists any clip slide without a `video`.
- Run `/test-page <page>` (`activity-dependencies.test.js` checks each embed has its Open in Drive link).

## 6. Report

Clip lengths, the table of what is in each, anything left out to fit 90 s, the Drive IDs, and anything
still for Nick to check (e.g. the player on a student account). Then `/ship` if asked.
