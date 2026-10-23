---
name: log-feedback
description: Record the teacher's feedback after teaching a lesson (or on a deck or activity) in the right place — the deck README's dated feedback log, the unit MTP's Decisions section, and memory only if it applies across activity types — then apply it. Use when the user reports how a lesson went, what students did, or gives feedback to remember on a deck, activity or the unit.
argument-hint: <unit or lesson> <feedback>
---

# Log feedback

Record `$ARGUMENTS` (if empty, ask what happened and in which lesson). Use today's date
(YYYY-MM-DD) and the user's own wording where possible. Show the entries before applying
bigger changes.

## Where each kind of feedback goes

| Feedback about | Goes in |
|---|---|
| A lesson deck / slides (Y9 Python) | `_presentations/Y9_Python/README.md` → "Rules and feedback log", one line at the bottom: `- **YYYY-MM-DD · Topic** — …`. Then apply it to the recipe in `sz_slides.cjs` / the build script and rebuild the template (`node build_template.cjs`) |
| A lesson deck, other units | `_presentations/ppt-guidelines.md`, in the section it changes |
| The unit plan, pacing, story, choices | The MTP (`Knowledge Base/project_y9_python_mtp.md` or `project_y8_python_unit1_mtp.md`): a new or existing `## Decisions (YYYY-MM-DD, after teaching L<n>)` section, plus edits to the lesson's plan if it changes |
| One activity type (PRIMM, pseudocode, Station Zero) | That template's comments, or `_templates/CLAUDE.md` / `Y9/Python/CLAUDE.md` if it's a rule for future builds |
| How every activity should work | Memory: a `feedback_*.md` file with **Why:** and **How to apply:**, plus its line in `MEMORY.md`. Update an existing one rather than duplicating |

Keep each entry to the change and its reason in one or two sentences.

## Then

- Ask whether to apply it to pages already built (list which ones it affects), and to the
  templates so future pages get it.
- If it changes a PRIMM template, make the same change in all three (see CLAUDE.md) and run
  `npx vitest run primm-templates.test.js`.
