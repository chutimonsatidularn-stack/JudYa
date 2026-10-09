# JudYa app (real build, ADR-0006)

Step 1 (revised): data model and safe storage. No migration (the owner starts fresh, ADR-0007). No screens yet.

- `src/domain/schema.ts` — data model (format version 1 of the new app) as zod schemas (docs/data-model.md)
- (removed) `migrate1to3` is in git history, commit 3197889 (not used)
- `src/domain/storage.ts` — `loadData` / `saveData` on key `judya.v1`; validates, verifies, never overwrites on failure; never touches `medmate.v1`
- Fixtures: anonymised only; **never commit real backups** (see `.gitignore`)

Commands (run inside `app/`): `npm install`, `npm test`, `npm run typecheck`.
