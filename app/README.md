# JudYa app (real build, ADR-0006)

Step 1 only: data migration and storage loading. No screens yet.

- `src/domain/schema.ts` — data model v3 as zod schemas (docs/data-model.md)
- `src/domain/migrate.ts` — `migrate1to3` (old app data → v3), pure, tested
- `src/domain/storage.ts` — `loadData(store)`: backup first, migrate, verify, never overwrite on failure
- `src/domain/__fixtures__/` — anonymised fixtures only; **never commit real backups** (see `.gitignore`)

Commands (run inside `app/`): `npm install`, `npm test`, `npm run typecheck`.
