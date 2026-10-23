---
name: move-activity
description: Move or rename an activity page without breaking links already posted in Google Classroom — git mv, redirect stub at the old path, classroom-former-path meta, test path updates and a redirect test. Use when asked to move, rename, relocate or reorganise an activity or folder.
argument-hint: <old/path.html> <new/path.html>
---

# Move an activity

Move `$ARGUMENTS` (old path, new path). Do one page at a time; for a folder, repeat per page.

1. **Look first.** Read the old page. Note its depth (topic or lesson level), its
   `checkers*.js`, any `checkers*.test.js`, and every reference to the old path:
   `grep -rn "<old file name>" --include=*.js --include=*.html --include=*.md . | grep -v node_modules`.
   Check the new path doesn't exist.
2. **Move:** `git mv` the page, and its checkers and unit test if they move with it.
3. **Fix the moved page:**
   - Shared-file paths for the new depth (`../../` topic-level, `../../../` lesson-level).
   - Add to `<head>`: `<meta name="classroom-former-path" content="<old path from repo root>">`.
     If it already has one (moved before), add another line for the new former path; keep both.
   - Keep its localStorage key unchanged, so progress carries over.
4. **Redirect stub** at the old path, copying `Y9/Databases/Criminal_Database_Investigation.html`:
   a `<!-- REDIRECT: moved to <relative new path> … -->` comment, `location.replace(<relative
   new path> + location.search + location.hash)`, a `meta refresh` and a fallback link. The
   path is relative from the old folder to the new file.
5. **Tests:** update URLs/imports in `tests/*.spec.js` and any unit test; add
   `['/<old>', '/<new>']` to `MOVES` in `tests/redirect-stubs.spec.js`.
6. **Docs:** update any CLAUDE.md, MTP or teacher guide that names the old path.
7. **Verify:** `npx vitest run` and
   `npx playwright test tests/redirect-stubs.spec.js tests/<page spec>.spec.js`.

Tell the user the old link still works and grades from old Classroom assignments still submit.
