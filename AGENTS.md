# JudYa (formerly MedMate) – agent rules

JudYa helps people manage medicine at home (Thai UI, mobile-first PWA).
The owner is a **non-coder building with AI**. Keep everything simple, explain in plain language, and don't add complexity "for later".

## Phase: BUILD (real app v0.7, started 2026-10-09)
The owner approved prototype v0.7 (AP-2) and approach B (ADR-0006). The real app is built in `app/` (Vite + React + TypeScript) step by step as in `docs/prompts/judya-v07-build.md`. The owner's real data is in the phone (`medmate.v1`): **never lose or change it without the tested migration (ADR-0005)**. The prototype below stays as the design reference.
- Change the page the owner asks about, show/describe the result, and let them react. Repeat until they say they're satisfied.
- Two files matter. Read `HANDOFF.md` first.
  - **Review prototype (v0.7, 26 screens):** edit `prototype/app.src.html`, then run `python3 build.py` in `prototype/` to make `judya-flow-v0.7.html`. Never edit the built file by hand.
  - **Installed MedMate prototype** (`medmate-app.html`, with `medmate-app.json`, `medmate-sw.js`): holds the owner's real data on their phone. Don't change it until the build is approved; it must be migrated, not replaced blindly (ADR-0005).
- The prototype is static HTML, no build step. The real app has a build step but still no backend, no accounts, no analytics; data stays on the device. (ADR-0002 for the prototype, ADR-0006 for the app)
- Database, sync and login are still out of scope (OS-1) until the owner asks, with a new ADR first.

## Documents are the memory (read before working, update as you go)
| Where | What |
|---|---|
| `docs/requirements.md` | **Living spec** of logic, UI, UX, requirements and pending suggestions. Update it on *every* owner input, before changing the app. Edit lines in place; remove what's no longer true. It is current state, not a chat log. |
| `docs/stories.md` | What users need: "As a …, I want …, so that …" + done-when. Add/adjust when a request changes what the app does. |
| `docs/adr/` | One short file per decision that's costly to reverse (tech, data, structure). Copy `0000-template.md`. Never edit an accepted ADR – supersede it with a new one. |
| `docs/design-system.md` + `docs/design/` | How the app must look (palette, type, icons, components) and the 26 screen pictures. Match them; change them only when the owner asks. The screen pictures come from the review prototype (`prototype/tools/shot_screens.py`); don't redraw them by hand. |
| `docs/acceptance-criteria.md` | Checklist for "done". Walk through it before asking the owner to approve a change. |
| `docs/prompts/` | Ready-made task instructions written for Claude Code (e.g. `judya-v07-build.md`, the first message for the real build). |

Never record a guess as the owner's decision. If unsure, mark it `Proposed` / `Open question` and ask.

## Working rules
1. Ask only when the answer changes what you build; otherwise pick the simplest option, say so, and log it.
2. Small steps: one change per request, then show it.
3. **Commit automatically** after each finished change and push. Users are non-developers: never ask about or explain git.
   - Work on a branch and open a PR for review, as decided on 2026-10-08. Do the git steps yourself; never ask the owner about git.
   - Don't merge a PR until the owner says so.
   - The commit message format below always applies.
   Commit messages follow git convention: title ≤ 50 characters, imperative mood ("Add story for offline use"), no trailing period; blank line; then a body explaining what and why.
   Commit one medium-sized logical change at a time (one story, one decision, one page change) — not one giant commit, not one per tiny edit.
4. Don't delete or move files without asking.
5. Health context: follow the Safety section of `docs/requirements.md`.
6. Reply in the owner's language (Thai or English).
