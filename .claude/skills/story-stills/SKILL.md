---
name: story-stills
description: Generate the missing Station Zero opening stills (CAMS entries with src '') for a Y9 Python PRIMM page, using Google Gemini in the user's Chrome via Claude in Chrome, then inline them with add_still.py. Use when asked to make, generate or fill in the story stills, camera stills, report pictures or missing images for a Station Zero lesson.
argument-hint: <page.html> [cam key ...]
---

# Station Zero stills with Gemini

Fill the empty `CAMS` pictures of one Station Zero page (`$ARGUMENTS`: the page, and
optionally just some cam keys). Work from the repo root.

## 1. Find what's missing

- In the page, read the `const CAMS = {` block. Every entry with `src: ''` needs a picture
  (or only the keys given in the arguments).
- In `_drafts/story/PROMPTS.md`, find the page's chapter section. Each beat there gives the
  scene prompt, the file name (`→ xx_beat_name.jpg`) and the `add_still.py` command for its
  key. The **Style** block at the top of PROMPTS.md goes in front of every prompt.
- If a key has no prompt in PROMPTS.md, write one from the entry's `alt` (same shape as the
  others) and add it to PROMPTS.md before generating.
- Tell the user the list (key → file) before starting.

## 2. Open Gemini

- Load the Chrome tools in one ToolSearch call (`tabs_context_mcp`, `navigate`, `computer`,
  `find`, `browser_batch`, `tabs_close_mcp`), then `tabs_context_mcp` with
  `createIfEmpty: true` and use that tab.
- Navigate to `https://gemini.google.com/app` and take a screenshot. If it isn't signed in
  (a sign-in button and no account name at the bottom left), **stop and ask the user to sign
  in**. Never type a password.

## 3. Generate each still (one fresh chat each)

For each key, in one `browser_batch`:

1. Navigate to `https://gemini.google.com/app` (a new chat, so earlier images don't steer it).
2. Click the prompt box (`find` "Ask Gemini prompt box" if a screenshot doesn't show where it is).
3. Type: `Generate an image. ` + the Style block (as one paragraph, without the `>` marks) +
   ` Scene: ` + the scene prompt. If the scene asks for words on a screen or label, change the
   style's last sentence to "No words except the ones asked for, spelled exactly."; if it
   asks for none, say "No text anywhere."
4. Press Return, wait about 40 s (several `wait` actions of 10 s), then take a screenshot at
   `scale: 0.5`.

If it still shows "Creating your image", wait 10 s more and screenshot again. When the
image is there, click its **Download full size** button (top-right corner of the image;
`find` "Download full size button" if unsure) and wait 8 s.

Then in Bash move the newest download into place:

```bash
f=$(ls -t ~/Downloads/Gemini_Generated_Image_*.* | head -1); mv "$f" _drafts/story/<file name>
```

Keep the extension Gemini gave it (usually `.jpg`). If it isn't `.jpg`, use that extension
in the `add_still.py` command.

## 4. Check every image before using it

Read the file and look at it. Reject it and generate again if any of these are true:

- text is misspelt, or there is text or signage the prompt didn't ask for
- a person, face, creature, blood or gore is in view (a gloved hand is fine if asked for)
- black bars, borders or a frame
- the main subject is in the bottom third, where the green story text will cover it
- the lighting or the key detail named in the prompt is missing (e.g. amber cycle lights)

To redo one, start a **fresh chat** with the whole prompt plus the fix written into the
scene ("lit mainly by…", "Absolutely no text, signs, labels or lettering anywhere."). Don't
ask for changes in the same chat: Gemini tends to reply with no image. After two failed
tries on one still, stop and show the user what you have.

When a revised prompt works, write it back into PROMPTS.md in place of the old one. Delete
rejected images.

## 5. Inline and finish

- Run each still's command:
  `python _drafts/story/add_still.py <page> <key> _drafts/story/<file>`
  It crops to 16:9, makes a 960×540 WebP (≤ ~70 KB) and fills that key's `src`.
- Check that no `src: ''` is left in `CAMS` (unless the user only asked for some keys).
- Update the chapter's line in PROMPTS.md ("No pictures yet…") and the "Opening stills"
  paragraph in `CLAUDE.md` that lists which beats of each chapter have stills.
- Run the chapter's Playwright spec (`npx playwright test tests/<chapter>-primm.spec.js`)
  and report the result.
- Close the Chrome tab you used.

Report to the user a table of key → file → one-line description, and which stills needed a
second try and why.
