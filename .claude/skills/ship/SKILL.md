---
name: ship
description: Test, commit, rebase onto main, push and watch the GitHub Actions run until the site is deployed. Use only when the user runs /ship.
argument-hint: [commit message]
disable-model-invocation: true
---

# Ship to the live site

Pushing to `main` deploys to students, so stop and report at the first failure.

1. **Look:** `git status --short` and `git diff --stat`. List what will go in. If there are
   unrelated changes mixed in, or anything that looks private (keys, `.env`, personal notes),
   ask which files to include before staging.
2. **Test what changed:** `npx vitest run` (always; it's seconds), plus the Playwright specs for
   each changed page (as `/test-page` finds them). If a spec fails, stop and report.
3. **Publish decks:** every `_presentations/<unit>/` folder with a `publish_to_drive.cjs` publishes
   (`ls _presentations/*/publish_to_drive.cjs`: now Y10_BTEC_CDM, Y9_Python, Y8_Data_Representation).
   If anything in such a folder is in the change (a deck, builder, kit, `images/` or `resources/`), run
   `node publish_to_drive.cjs` in that folder. A change to `_presentations/drive_publish.cjs` means every
   such folder; a change to the Y9 kit (`Y9_Python/sz_kit.cjs`, `sz_slides.cjs`) also means
   `Y8_Data_Representation/`, whose decks are built with it. It rebuilds every deck, then uploads only
   those whose slides changed, as Google Slides, to the unit's Drive folder, and updates `drive.json`
   (Y9 and Y8 also `_presentations/lesson-slides.json`): include `drive.json`, `lesson-slides.json` and any
   rebuilt deck whose slides changed in the commit; `git restore` decks that differ only by the rebuild. If a build fails because a deck is open in PowerPoint, ask the user to close it and rerun.
   If publishing fails (no OAuth client, sign-in refused), report it and carry on shipping the site; the
   decks can be published later with the same command.
4. **Commit:** stage the agreed files by name (not `git add -A`). Message: `$ARGUMENTS` if
   given, else a one-line summary in the style of `git log --oneline -10`, plus the
   attribution trailer from the session. Never `--no-verify`.
5. **Sync:** `git pull --rebase origin main` (the manifest bot will have pushed
   `chore: rebuild manifest` commits). On a conflict in `activities.json` / `meta.json`, take
   `origin/main`'s copy (`git checkout --ours`, since the rebase reverses sides) and continue:
   the bot rebuilds them. Any other conflict: stop and show it.
6. **Push:** `git push origin main`.
7. **Watch:** `gh run list --branch main --limit 3`, then `gh run watch <id> --exit-status` for
   the "Test and Deploy" run of this commit. On failure: `gh run view <id> --log-failed`, and
   report the failing test.
8. Report: the commit hash, the run result, any Slides links published and https://ogacomputing.github.io/interactive/.
