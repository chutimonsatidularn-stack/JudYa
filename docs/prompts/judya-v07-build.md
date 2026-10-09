# Claude Code prompt — JudYa v0.7 build (paste this as the first message)

You are continuing the JudYa app (formerly MedMate) for a **non-coder owner** who reads Thai. Reply to the owner in **simple Thai**, short, no jargon; explain decisions in one or two sentences. Repo: `chutimonsatidularn-stack/MedMate` (private; GitHub Pages hosts the installed PWA; the owner's real medicine data is in the phone's `localStorage` key `medmate.v1`, data `version: 2`). **Losing or corrupting that data is the worst possible failure.**

**The owner has never used Claude Code.** Explain each term the first time (branch, PR, test). Owner's pre-chosen defaults (confirm in step 0, do not silently assume): approach **B**, work on a branch + PR, allergy delete = no log, undesigned screens = draft then pause. See `docs/BEGINNER-GUIDE.md`.

## 0. Read first (in this order) — do not write code yet
1. Repo `AGENTS.md` and `docs/adr/*` (ADR-0002 compiled single file, ADR-0004 dose schedule). Respect the repo's process rules.
2. `docs/requirements.md` (replace the repo copy with this pack's `docs/requirements.md` — it is a superset; keep every ID) → `docs/screen-spec.md` → `docs/data-model.md` → `docs/calculation-spec.md` → `docs/acceptance-criteria.md` → `docs/design-system.md` + `docs/design/design-tokens.json` → look at **every** picture in `docs/design/screens/` → open `prototype/judya-flow-v0.7.html` (click through it) → `docs/decision-log.md` → `HANDOFF.md`.
3. `reference/calc.mjs` + `reference/calc.test.mjs`: run `node reference/calc.test.mjs` (18 pass). This is the reference for all calculations.

## 1. Ground rules (from the owner)
- **If anything is unclear, ask the owner first (AskUserQuestion, Thai, multiple choice). Never guess.**
- **Security**: escape all user text (SEC-1); validate everything from storage/imports (SEC-2); CSP, no third-party scripts that see data, no secrets, no analytics (SEC-3, D-6); data never leaves the device.
- **Reuse / no rewrites**: pure calculation module with tests (C-4); build each UI component once (list in `design-system.md`); do not rewrite what already works.
- **Match the approved pictures first**; do not redesign confirmed flows (UX-4). Review-only parts of the prototype (feedback boxes, jump bar, phone frame, demo data, the *average* days formula) are **not** product (C-5, DS-7).
- Medical safety: no advice, no automatic dose/schedule/stop changes, reasons required, history append-only (SF-*).
- Brand graphics: use the approved SVGs in `docs/design/assets/` only. If the owner later sends new graphics, follow the project's **"Master prompt vector logo"** and verify 100 % match to the original before delivering.
- Keep `docs/requirements.md` current on every owner input; write ADRs for big decisions; commit small, with clear messages; never commit real personal data (anonymise fixtures).
- Tell the owner at each checkpoint what they can try on their phone.

## 2. Step 0 — decision before building (ask the owner)
The flow was **passed on 2026-10-08**, but AGENTS.md says the real app starts only after the owner says the **prototype is approved** (AP-2) and an ADR exists. Ask the owner (one AskUserQuestion, two questions):
1. "ตอนนี้ flow ผ่านแล้ว ให้เริ่มสร้างแอปจริง (v0.7) เลยไหม?" → Yes = AP-2 satisfied for v0.7 (record it in requirements) / Not yet.
2. Approach (ADR-0005 proposal): **A)** keep editing the compiled single file in place (risky: ~26 screens, new data model) · **B) readable rebuild — Vite + React + TypeScript, Vitest for tests, a small validation layer (e.g. Zod), PWA manifest + service worker, GitHub Actions → same Pages URL (recommended)**. Under B the app must keep reading the same `medmate.v1` data (migration, below).
Then write `docs/adr/0005-…` (use the next free number; start from `docs/adr/0005-judya-v07-model-and-migration.md` in this pack) and wait for the owner's OK.

## 3. Step 1 — protect the owner's data (before any UI)
- Ask the owner to press the existing **backup** button on the installed app and save the file (also send it to you only if they agree; never commit it).
- Inspect the real v2 shape in the repo code, then implement `migrate2to3` per ADR-0005 as a pure function with anonymised fixtures: lossless, idempotent, all-or-nothing, raw v2 copy kept under a backup key. Add backup/restore (validate file, show what will be replaced, confirm) and "delete all data".
- Tests: fixture v2 → v3 equality of meaning; double run no-op; corrupt input rejected (AC-D1…D3).

## 4. Step 2 — foundation
Scaffold (if B), tokens → CSS variables, Noto Sans Thai (self-hosted or one allowed origin), components from `design-system.md`, storage + validation module, `calc` ported to TypeScript from `reference/calc.mjs` (same names; tests ported and green), router/state, CSP, base path of the existing Pages site. Deploy nothing yet.

## 5. Step 3 — screens (build in this order; each: match picture, all states from UX-3, tests, tick acceptance items)
1. 06 Home, 06b, 06c · 2. 07 Members, 07b Member page (+ self-manage switch, avatar, allergy block, 07d Allergy form with edit/delete) · 3. 07c Medicines tab · 4. 08 Edit (generic+brand, owner incl. household, expiry), 08d Pack & buying (price rows), 08c Schedule · 5. 09 Adjust dose, 09b Confirm, 09c History, 09d Stop · 6. 10 Compare & order, 11, 11b · 7. 12 Doctor, 13 Share, 14 Settings, 14b Pharmacy form · 8. 01–05 (Splash/Welcome real; Login/Register/OTP stay pictures — D-5).
Checkpoint after 1–3, after 4–5, after 6–8: describe what changed in Thai and what the owner should try.

## 6. Step 4 — PWA and hardening
Manifest + icons from `assets/icon.svg`, service worker (offline after first load, L-2), install check on Android Chrome, accessibility pass (labels, focus, contrast, ≥15 px text), run **every** acceptance criterion, XSS test string (AC-U2), Lighthouse, console clean on all screens. First deploy to the owner's phone only with migration + backup key in place and the owner's backup file tested.

## 7. Deliverables to report back
Updated requirements/ADR/acceptance status table, test results, what remains, and the exact "try this on your phone" steps. Update `HANDOFF.md` §2 (status) at the end of every session so a later chat can continue the design.

## Known gaps in the pack (ask the owner, don't invent)
Member add/edit/remove screens, real photo picker UI, backup/restore screens, delete-all-data confirmation, empty/error/loading states, pharmacy delete, PWA install/offline pages, deleting an allergy leaves no log (Q-A), exact v2 data shape (read it from the repo).
