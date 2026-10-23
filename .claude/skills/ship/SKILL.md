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
3. **Commit:** stage the agreed files by name (not `git add -A`). Message: `$ARGUMENTS` if
   given, else a one-line summary in the style of `git log --oneline -10`, plus the
   attribution trailer from the session. Never `--no-verify`.
4. **Sync:** `git pull --rebase origin main` (the manifest bot will have pushed
   `chore: rebuild manifest` commits). On a conflict in `activities.json` / `meta.json`, take
   `origin/main`'s copy (`git checkout --ours`, since the rebase reverses sides) and continue:
   the bot rebuilds them. Any other conflict: stop and show it.
5. **Push:** `git push origin main`.
6. **Watch:** `gh run list --branch main --limit 3`, then `gh run watch <id> --exit-status` for
   the "Test and Deploy" run of this commit. On failure: `gh run view <id> --log-failed`, and
   report the failing test.
7. Report: the commit hash, the run result and https://ogacomputing.github.io/interactive/.
