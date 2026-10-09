# JudYa app (real build, ADR-0006 / ADR-0007)

Vite + React + TypeScript. Data stays on the device under the key `judya.v1`; the old app's `medmate.v1` is never touched.

Status: Step 1 (data) and Step 2 (foundation) done. Screens come in Step 3. Nothing is deployed.

- `src/domain/` — pure code: `schema.ts` (data model, zod), `storage.ts` (safe load/save), `calc.ts` (calculation module, port of `reference/calc.mjs`), `dates.ts` (Bangkok dates)
- `src/ui/` — building blocks (`components.tsx`, `Shell.tsx`, `Icon.tsx`, `avatars.ts` = the 20 profile icons)
- `src/styles/` — design tokens and component CSS (from the approved prototype)
- `src/pages/` — screens (`Home` first-run now; `Gallery` = all components on one page, **remove before release**)
- `src/store.tsx`, `src/router.tsx` — state and hash router
- `public/` — app icons (bottle icon) and manifest

Commands (inside `app/`): `npm install` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`.
Open `#/gallery` to see every component. Never commit real backups (see `.gitignore`).
