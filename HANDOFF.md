# JudYa — Handoff (v0.7, 2026-10-08)

Purpose: let a **new chat (design work)** or **Claude Code (build)** continue without the old conversation. Read §0 first.

## 0. Read first
- Project: **JudYa** (formerly MedMate) — household medicine manager (stock, buy reminders, pharmacy price comparison incl. shipping, share with doctor/caregivers). Owner: non-coder, Thai, Android phone, PWA first.
- Status: the **review prototype v0.7 (26 screens at the time; 07e profile picker added 2026-10-09, now 27) passed** the owner's flow review on 2026-10-08. **No real build of v0.7 has started.** The installed PWA on the owner's phone is the older MedMate prototype (compiled single file `medmate-app.html`, React, key `medmate.v1`, data `version: 2`) and holds real data — it must be migrated, not replaced blindly.
- Language: reply to the owner in simple Thai, short. Say when **Claude Code** is needed (it is, for the real build). Ask when unsure; never guess.

## 1. What is in this pack
| Path | What |
|---|---|
| `docs/requirements.md` | Full living requirements (all IDs; supersedes the repo copy) |
| `docs/screen-spec.md` | 27 screens: content, rules, actions |
| `docs/data-model.md`, `docs/adr/0007-…` | Data model of the new app (key `judya.v1`); no migration (ADR-0005 superseded) |
| `docs/calculation-spec.md`, `reference/calc.mjs`, `reference/calc.test.mjs` | Reference maths + 18 passing tests (`node reference/calc.test.mjs`) |
| `docs/acceptance-criteria.md` | Testable checks |
| `docs/design-system.md`, `docs/design/design-tokens.json`, `docs/design/assets/*.svg`, `docs/design/screens/*.png` | Look & feel, approved vector brand set, 26 screen pictures |
| `docs/decision-log.md` | What the owner decided in review rounds 1–7 |
| `docs/BEGINNER-GUIDE.md` | **คู่มือมือใหม่ภาษาไทย**: เริ่มใช้ Claude Code ทีละขั้น (เจ้าของยังไม่เคยใช้) |
| `docs/prompts/judya-v07-build.md` | **The Claude Code prompt** (paste as first message) |
| `prototype/app.src.html`, `build.py`, `judya-flow-v0.7.html`, `tools/*` | Review prototype source, build, built file, screenshot + behaviour test scripts (Playwright) |

Review artifact (private, owner only): https://claude.ai/artifact/PoFWfN59Sg2TiNXeWBHirz — flow page + clickable prototype + per-screen comment boxes (saved in the artifact database `feedback/<screenId>`; the owner's last comments are all answered, all screens marked ผ่าน).
Claude Project "แอพจัดการยา" also holds the earlier package (APP_SPEC, SCREEN_SPEC, DESIGN_SYSTEM, ACCEPTANCE_CRITERIA, logo files, ADR-0004, prompts). Where they disagree with this pack, **this pack (v0.7) wins** for screens/data; older files still describe the "real app" component tree and routes (CLAUDE_HANDOFF.md §3–4) which remain a good base.

## 2. Status (update at the end of every session)
- Design: 26 screens approved as a flow. Not yet designed: member add/edit/remove, backup/restore screens, delete-all-data confirmation, empty/error/loading states, pharmacy delete, PWA install/offline pages, real photo picker (see screen-spec last section).
- Build: **Steps 0–2 and Step 3 groups 1–6 (incl. 10, 11, 11b order) and screens 14, 14b done 2026-10-09 (in `app/`)**: screens 06, 06b, 06c, 07, 07b–07g, 08, 08c, 08d, 09, 09b, 09c, 09d, 14, 14b work on saved data (key `judya.v1`; settings has real backup/restore/delete-all and pharmacy delete, all Proposed in UI-7a); 116 tests (`cd app && npm test`); looks match the approved pictures. Still "coming soon": 12 doctor, 13 share, 01–02 start screens. Nothing deployed — a deploy workflow and a Pages setting are needed to let the owner try it on the phone (ask the owner). Remove the `#/gallery` page before release.

- Decisions made 2026-10-08 (owner asked Claude to choose, beginner): run on **claude.ai/code**; **approach B**; work on a branch + PR; allergy delete = no log (Q-A); undesigned screens = Claude Code drafts then pauses for owner. Beginner steps: `docs/BEGINNER-GUIDE.md`.

## 3. Continuing the DESIGN in a chat (rebuild + republish the prototype)
1. `cd prototype && python3 build.py` → `judya-flow-v0.7.html` (inlines the SVGs from `../docs/design/assets`). Edit `app.src.html` (single file: CSS, helpers, `SCREENS`, state `mk()`, `act()`, listeners, comment widget, `ROWS` flow layout).
2. Check: extract the `<script>` and run `node --check`; run `tools/shot_screens.py` (edit its path to the built file; Playwright + Chromium) for screenshots; `tools/test_*.py` are click-through behaviour tests. Google Fonts cannot load in the sandbox (harmless console error).
3. Publish with the Artifact tool to the **same URL** (pass `url` + the file path; do not pass an icon again; capabilities `db` + `assets` are carried forward). The page is `<title>` + `<style>` + body content (no `<html>`/`<body>`).
4. Feedback loop: read `feedback/*` with ArtifactData (`list` + `out_dir`), write answers into each doc's `reply` and move the owner's text to `prev`, clear `text/verdict/images` (batch `update`, **pin `if_version`**). The image-attach button was removed in r6 (the owner could not use it).
5. Gotchas learned: re-render must restore focus (`data-num/sel/pf/pr/dm`); `change` events redraw via `setTimeout(draw,0)`; select/number fields need grouped units; `S` state is global and some demo data mutates globally (reload to reset); FB_IDS[0] must stay `'general'` (jump bar slices it).
6. Palette is locked (tokens file). New graphics from ChatGPT/owner images → project "Master prompt vector logo", verify 100 % match first.

## 4. Key decisions (full list: `docs/decision-log.md`, rules: `docs/requirements.md`)
Edit page split in 3 levels · tab "ยา" · brand = separate entry, pack size per brand · price per unit per pharmacy, ranked only if complete, shipping + free-over, split hint · dose renamed "ปรับโดส", reason required, history timeline, stop needs reason, allergy → red profile block, standalone allergy with edit/delete · household medicines reminded by expiry · members can self-manage pills · profile photo · no login in the test phase.

## 5. Risks / conflicts Claude Code must resolve with the owner
1. **Process**: repo `AGENTS.md` = prototype phase until the owner says "prototype approved" + ADR. "ผ่าน" was said about the *flow review*. → ask (prompt step 0).
2. **Approach**: compiled single file vs readable rebuild (ADR-0004 anticipated this). Recommended: readable rebuild (React + TypeScript) on the same Pages URL.
3. **Data**: the owner starts fresh in the new app (ADR-0007); the old app's data on the phone is left alone (key `medmate.v1` is never touched). Never commit real data.
4. **Maths**: prototype uses an average per day for days-remaining; real app uses the day-by-day walk (`reference/calc.mjs`, DS-7). Demo numbers (5/70/48/6 days) are not test targets; the test targets are in the test file.
5. **Brand per-entry model** changes the old "medicine shared by people" idea (L-3): packaging/prices per brand entry, stock/dose/schedule per assignment (data-model.md).
6. **Allergy deletion** leaves no log (Q-A) — confirm with the owner.

## 6. Owner's standing rules (verbatim intent)
Graphics from ChatGPT/owner images → "Master prompt vector logo" + 100 % match check · tell when Claude Code is needed · ask, don't guess · secure, reusable code, don't rewrite.
