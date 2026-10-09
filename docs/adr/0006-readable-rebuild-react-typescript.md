# ADR-0006: Build the real JudYa app as a readable rebuild (Vite + React + TypeScript)

- Status: Accepted (owner chose approach B and OKed this ADR on 2026-10-09; supersedes ADR-0002 for the real app)
- Date: 2026-10-09
- Linked inputs/stories: AP-2, Q-C, C-4, C-5, D-4, SEC-1…SEC-3, L-2, UX-1 in docs/requirements.md; ADR-0002 (superseded for the real app), ADR-0004, ADR-0005.

## Context
The owner approved prototype v0.7 (29 screens) as the base for the real app. Today there are two things:
- the installed app `medmate-app.html`: one compiled file with no readable source (ADR-0002), holding the owner's real data in `localStorage` key `medmate.v1` (data `version: 2`);
- the review prototype `prototype/app.src.html`: readable, but a click-through demo (average days formula, global mutable demo data, review-only chrome).
The data model changes (brand entries, owners, history, pharmacies, allergies) and the maths must follow the day-by-day rules (DS-7).

## Decision
1. Build the real app as a **readable rebuild**: Vite + React + TypeScript, Vitest for tests, a small validation layer (Zod) for everything read from storage or from a backup file, a PWA manifest + service worker, and a GitHub Actions job that builds and publishes to GitHub Pages.
2. The app lives in a new folder `app/` in this repo. Docs, `reference/`, `prototype/` and the old `medmate-app.html` stay where they are; the old file is not changed until the owner confirms the migration worked (rollback).
3. Calculations come from `reference/calc.mjs`, ported to TypeScript with the same names and the same 18 tests (C-4).
4. The storage key stays `medmate.v1`; data goes from version 2 to 3 by the pure function `migrate2to3` (ADR-0005). A raw copy of the v2 data is kept under `medmate.v1.backup.v2`.
5. Same origin and path must be kept for the installed app (C-3). **Open point:** the repo was renamed MedMate → JudYa, so the Pages address changed from `…github.io/MedMate/` to `…github.io/JudYa/`. `localStorage` belongs to the origin (`https://<user>.github.io`), so the saved data is still there, but the phone's installed app points at the old path. Step 1 starts by checking, with the owner, which address the phone uses and which one Pages serves now; nothing is deployed before that is clear.
6. The review prototype stays as the design reference; review-only parts (feedback boxes, jump bar, phone frame, demo data) are never copied (C-5).
7. Work happens on a branch with a pull request; the owner presses Merge.

## Alternatives considered
- **A) Keep editing the compiled single file**: no tooling to learn, but about 29 screens and a new data model in a file nobody can read; high risk of breaking the owner's real data; no unit tests.
- **Extend the review prototype into the product**: it is already readable, but it is built as a demo (average maths, shared global state, review chrome) and has no tests or validation.
- **Another framework or a backend/database now**: more cost and complexity than the owner needs (D-1, no sync for now).

## Consequences
- Easier: tests for maths and migration, one place for each component, safer changes by Claude Code.
- Harder: a build step and a deploy workflow; the owner must press Merge for the app to change.
- The installed phone app keeps working as it is until the owner updates it after a tested migration and a saved backup file.
- Revisit if the app moves host or gets accounts/sync (OS-1).
