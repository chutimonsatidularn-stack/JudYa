# MedMate – agent rules

MedMate helps people manage medicine at home (Thai UI, mobile-first PWA).
The owner is a **non-coder building with AI**. Keep everything simple, explain in plain language, and don't add complexity "for later".

## Phase: PROTOTYPE
We are shaping the app by looking at it, not building the real one yet.
- Change the page the owner asks about, show/describe the result, and let them react. Repeat until they say they're satisfied.
- The prototype is **`medmate-app.html`** (with `medmate-app.json`, `medmate-sw.js`). Edit only this file.
- Prototype = static HTML, no build step, no backend, no accounts. Data stays in the browser. (ADR-0002)
- Don't start the "real app" (frameworks, database, sync, login) until the owner explicitly says the prototype is approved. Then write an ADR first.

## Documents are the memory (read before working, update as you go)
| Where | What |
|---|---|
| `docs/requirements.md` | **Living spec** of logic, UI, UX, requirements and pending suggestions. Update it on *every* owner input, before changing the app. Edit lines in place; remove what's no longer true. It is current state, not a chat log. |
| `docs/stories.md` | What users need: "As a …, I want …, so that …" + done-when. Add/adjust when a request changes what the app does. |
| `docs/adr/` | One short file per decision that's costly to reverse (tech, data, structure). Copy `0000-template.md`. Never edit an accepted ADR – supersede it with a new one. |
| `docs/design-system.md` + `docs/design/` | How the app must look (palette, type, icons, components) and the 17 screen pictures. Match them; change them only when the owner asks. Edit `docs/design/gen_screens.py` and re-run it rather than redrawing SVGs by hand. |
| `docs/acceptance-criteria.md` | Checklist for "done". Walk through it before asking the owner to approve a change. |
| `docs/prompts/` | Ready-made task instructions written for Claude Code (e.g. `dose-schedule.md`). |

Never record a guess as the owner's decision. If unsure, mark it `Proposed` / `Open question` and ask.

## Working rules
1. Ask only when the answer changes what you build; otherwise pick the simplest option, say so, and log it.
2. Small steps: one change per request, then show it.
3. **Commit automatically** after each finished change and push. Users are non-developers: never ask about or explain git.
   - No branch or PR is required for anyone. A user may push straight to `main` or work however they like.
   - Only open a PR if the user (or their own agent) says so and the user agrees.
   - The only git rule that always applies is the commit message format below.
   Commit messages follow git convention: title ≤ 50 characters, imperative mood ("Add story for offline use"), no trailing period; blank line; then a body explaining what and why.
   Commit one medium-sized logical change at a time (one story, one decision, one page change) — not one giant commit, not one per tiny edit.
4. Don't delete or move files without asking.
5. Health context: follow the Safety section of `docs/requirements.md`.
6. Reply in the owner's language (Thai or English).

## FIRST TASK (one-time — delete this whole section when done)
Stories are only guesses until the owner's intent is on paper.
1. Write the owner's goals, users and must-have features from the chat memory of the kick-off discussion into `docs/requirements.md` and turn them into stories in `docs/stories.md`.
2. If chat memory isn't enough, ask the owner briefly using question mode — at most 20 questions in total, grouped, multiple-choice where possible. Record each answer in `docs/requirements.md`.
3. Mark Q-1 answered, then remove this section from `AGENTS.md` and tell the owner.
