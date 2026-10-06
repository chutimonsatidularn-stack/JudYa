# Owner inputs & decisions

Append-only log. Newest at the bottom. Quote the owner; add our interpretation separately.
Status: `Decided` (owner said so) · `Proposed` (agent suggestion, not yet agreed) · `Open` (question).

## 2026-10-06 — Repo kick-off

| # | Input (owner's words) | Interpretation / result | Status |
|---|---|---|---|
| I-1 | "init agent rules, make it minimum" | Short `AGENTS.md` (+ `CLAUDE.md` pointing to it). | Decided |
| I-2 | "make every decision and input regarding requirement from user as document" | `docs/inputs.md` (this file) logs every input; agent must append before acting. | Decided |
| I-3 | "This repo is meant for simplify process for beginner and don't need complex yet" | Keep structure flat: 1 rules file, 1 inputs log, 1 stories file, ADRs. No tooling yet. | Decided |
| I-4 | "The user should be able to ask and agent should adjust the page for prototyping until satisfy before doing the real app" | Prototype phase in `AGENTS.md`; real app is gated on owner approval. See ADR-0002. | Decided |
| I-5 | "at least the documents of stories and ADRs are needed" | `docs/stories.md`, `docs/adr/`. | Decided |
| I-6 | "Act as 2 personas of never-code user using AI … and 2 senior engineers and discuss how should the repo have right now" | Discussion held in chat; outcome = this structure. | Decided |
| I-7 | "Confirm with me before doing any commit" | Superseded by I-15. | Superseded |
| I-8 | Q-1 answer: "medmate-app.html" | `medmate-app.html` is the prototype; named in `AGENTS.md`. It already matches `medmate-app.json` and `medmate-sw.js`. | Decided |
| I-9 | Q-2 answer: "what do you mean? this is the repo" | No other source exists; the compiled file is all there is. Agent edits `medmate-app.html` in place, carefully. If a change proves unsafe, agent proposes rebuilding as readable files and asks first. | Decided (edit in place); rebuild Proposed |
| I-10 | Q-3 answer: put in `AGENTS.md` a first task: write down the discussion from chat memory into documents, or ask the user briefly via question mode (max 20 questions); after writing, remove it from `AGENTS.md` | "FIRST TASK" section in `AGENTS.md`, to be deleted once done. | Decided |
| I-11 | "Add one more rule, use git convention and title <50 characters, more detail in commit body" | Added to rule 3 in `AGENTS.md`. | Decided |
| I-12 | Q-4 answer: "delete them" | Deleted `index.html`, `index-2.html`, `medmate-pwa.zip`, `manifest.json`, `sw.js`. Only `medmate-app.html` remains as the app. | Decided |
| I-13 | "Hope that there is also the rule to commit medium logical size" | Added to rule 3 in `AGENTS.md`. | Decided |
| I-14 | "the ask from agent should also go to README of the repo, in Thai and nicely easy to read and encouraging. now, do that and commit" | Added `README.md` in Thai (friendly tone): how to start, the agent's first questions (max 20), what the agent always asks first, doc map, install steps. Committed in three commits. | Decided |
| I-15 | "no need the rule of the loop for asking, that is only to get the README or story in first time. After that, freely by user. But agent should do auto commit, user shouldn't have to know about that." | The ≤20-question round is first-time only (FIRST TASK). Afterwards the owner just asks freely. Agent commits (and pushes to the working branch) automatically; no commit confirmations. Supersedes I-7. README updated. | Decided |

## Open questions (agent needs the owner)

| # | Question | Why it matters |
|---|---|---|
| Q-3 | Who are the users and which 3 things must the app do first? | Handled by the FIRST TASK in `AGENTS.md`; stories are drafts until then. |

Resolved: Q-1 → I-8, Q-2 → I-9, Q-4 → I-12.
