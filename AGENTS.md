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
| `docs/inputs.md` | Every requirement, preference or decision the owner gives, dated, in their words. **Append it the moment it's said**, before acting. |
| `docs/stories.md` | What users need: "As a …, I want …, so that …" + done-when. Add/adjust when a request changes what the app does. |
| `docs/adr/` | One short file per decision that's costly to reverse (tech, data, structure). Copy `0000-template.md`. Never edit an accepted ADR – supersede it with a new one. |

Never record a guess as the owner's decision. If unsure, mark it `Proposed` / `Open question` and ask.

## Working rules
1. Ask only when the answer changes what you build; otherwise pick the simplest option, say so, and log it.
2. Small steps: one change per request, then show it.
3. **Ask the owner before every `git commit` or `git push`.** Never open a PR unless asked.
   Commit messages follow git convention: title ≤ 50 characters, imperative mood ("Add story for offline use"), no trailing period; blank line; then a body explaining what and why.
   Commit one medium-sized logical change at a time (one story, one decision, one page change) — not one giant commit, not one per tiny edit.
4. Don't delete or move files without asking (see open questions in `docs/inputs.md`).
5. Health context: the app must never give medical advice or dosing recommendations beyond what the user entered.
6. Reply in the owner's language (Thai or English).

## FIRST TASK (one-time — delete this whole section when done)
Stories are only guesses until the owner's intent is on paper.
1. Write the owner's goals, users and must-have features from the chat memory of the kick-off discussion into `docs/inputs.md` and turn them into stories in `docs/stories.md`.
2. If chat memory isn't enough, ask the owner briefly using question mode — at most 20 questions in total, grouped, multiple-choice where possible. Log each answer in `docs/inputs.md`.
3. Mark Q-3 answered, then remove this section from `AGENTS.md` and tell the owner.
