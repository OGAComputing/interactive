---
name: find-images
description: Find, download and inline the real product images a lesson needs (posters, covers, logos, key art, video thumbnails), using Claude in Chrome, at full size for the decks and as small copies on the hub page. Use when asked to find, search for, get or download images or pictures for a lesson, a page or a deck, or when a page still has images to supply.
argument-hint: <page.html> [image keys or products…]
---

# Find images

Find the images for `$ARGUMENTS`: usually the keys in a page's `PENDING_IMAGES` (in its
`checkers.test.js`) and the deck's empty image slots. Y10 rules on real images still apply
(`Y10/CLAUDE.md`: source credit on each, a reduced copy on the page, full size in the git-ignored
`_presentations/Y10_BTEC_CDM/images/`).

## 1. Connect

- Read the `chrome-browser` skill and load the Chrome tools in one ToolSearch call, including
  `javascript_tool` and `list_connected_browsers`.
- If `list_connected_browsers` is empty, the extension isn't reachable. Ask Nick to check that it's on
  and signed in, and that **Chrome is in the right profile** (that was the cause on 2026-11-17).
  Don't retry more than once without hearing back.
- Work in a new tab and close it at the end.

## 2. Search, best source first

Aim for at least 1200 px on the long side: a 260 px Wikipedia poster looked too small on slides
(Nick, 2026-11-17).

| Product | Source | How |
|---|---|---|
| Film or TV poster, TV logo artwork | **TMDB** (themoviedb.org) | Search `/search/movie?query=` or `/search/tv?query=`, open the first result, take the `.poster img` file name; the full size is `https://image.tmdb.org/t/p/original/<file>` (usually 2000×3000) |
| Game key art or box art | The publisher's UK site (e.g. nintendo.com/en-gb game page) | Take the largest `<img>` on the page (the hero is often 1600 px with the logo) and try the bigger variants of its URL |
| Video thumbnail (for a Photoshop task or a clip slide) | YouTube, from the official channel | `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (1280×720) |
| App or web screen, diagram, logo drawn as SVG | Wikimedia Commons | Through the Wikipedia API with `iiurlwidth=1200`, which gives a PNG of any width |
| Free photos for students to edit (Photo Bank: animals, faces, people on plain backgrounds) | **Pexels** (no login, no credit needed) | Fetch `/search/<words>/` from a pexels.com tab and read `__NEXT_DATA__` (items with `type: 'photo'`: id, size, alt, photographer); download `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=2400` (a few older photos use another file name: skip them). For cut-outs, pick plain backgrounds and clear edges |
| Fallback | The Wikipedia infobox picture | `action=parse` on the article, then `.infobox a.mw-file-description` and `prop=imageinfo`. Small (about 260 px), so the page only |

- **The school wifi blocks games sites** (nintendo.com and igdb.com show a Chrome error page;
  Wikipedia, YouTube and TMDB load). If a page shows an error page twice, tell Nick at once so he
  can switch to his phone's connection, then try again.
- `javascript_tool` refuses to return text that looks like URLs with query strings
  (`[BLOCKED: Cookie/query string data]`). Keep the URLs in `window.__…` and return only file names,
  sizes and `pathname` parts.
- Measure each candidate in the page (`fetch` → `blob` → `createImageBitmap`), then show them side by
  side (`document.body.innerHTML = '<img …>'`) and take a screenshot. Check that each is the real
  official artwork (the right film or series, English title).
- Pick an image that shows the point the lesson makes, e.g. a game grid for "sharing your Wordle
  score", not the logo.

## 3. Ask once, then download

- Send one table: **file name to save as** (lower case, underscores, like the files already in
  `images/`), **source** and **size** (pixels and KB). Then wait for a yes: every download needs
  Nick's approval.
- Download with `curl -sfL -A "lesson-image-fetch/1.0" -o <name> <url>` into
  `_presentations/Y10_BTEC_CDM/images/`, then check each one's size with PIL against the table.

## 4. Put them in

- **Page:** re-run `python Y10/inline_images.py <page> …` with **every** key (the old ones too:
  the block is rebuilt each time; copy the existing ones from the command in the block's comment).
  Portrait posters `@fit440`, landscape `@600`, small logos or grids `@300`–`@400`. Keep the page
  under about 1 MB.
- Make the alt text and `credit` match the image you actually used (key art, not "cover";
  "grid drawing: Wikimedia Commons" when it isn't the producer's own).
- Remove the keys from `PENDING_IMAGES`, then run `/test-page <page>` and screenshot the tasks with
  pictures to check them by eye.
- **Deck:** builders use the full-size files from `images/` (`img: 'images/<file>'`).

## 5. Drive

Master copies go in the course Drive folder (`Y10/CLAUDE.md`): products in `Images/`, free photos in
`Photo Bank/`. If the Drive connector's session has expired, upload with the deck publisher's saved sign-in
(`~/.oga-drive`, as in `_presentations/drive_publish.cjs`: refresh the token, then a resumable upload with
`supportsAllDrives=true`).

## 6. Report

Which images are in (size and source), anything still missing and why, and remind Nick to copy the
new files to the Drive folder's `Images/` (the master copies), including any a task tells students
to open from there.
