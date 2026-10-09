# ADR-0005 (number: use the next free one in the repo): JudYa v0.7 — data model v3 and lossless migration

- Status: Accepted (owner OKed on 2026-10-09). The exact v2 field names are read from `medmate-app.html` in Step 1; if they differ from the mapping below, add a note here before coding the migration.
- Date: 2026-10-08
- Inputs: requirements MB-*, HM-*, BR-*, PR-*, DA-*, AL-*, D-4; ADR-0004.

## Context
The review prototype added: brand entries, household medicines with expiry, per-pharmacy prices and shipping, self-managed members, dose reasons + history + stop, allergies, profile photos. The owner's phone already stores real data under `medmate.v1` (`version: 2`, after ADR-0004). It must survive.

## Decision
1. Data version **2 → 3** (shape in `docs/data-model.md`). Key `medmate.v1` unchanged.
2. (The exact v2 field names are in the repo code / ADR-0004 — read them there; the mapping below is by meaning.) Migration is a pure function `migrate2to3(v2) → v3` in its own module with fixtures:
   - every old medicine → one `Medication` (brand empty) + one `Assignment` for its person; `packSize/baseUnit/packUnit` from the old package fields (null if absent);
   - `schedule` and doses unchanged; `doseStep` default ½; `selfManaged=false`; `Person.photo` none;
   - old dose-change entries → `DoseChange{kind:'dose', reason: 'อื่นๆ', note: 'ก่อนมีช่องเหตุผล'}` (reason was not recorded then; never invent a reason);
   - pharmacies: add `shippingFee/freeShippingOver` = null (unknown) unless the old record has a fixed fee (copy it);
   - allergies from the old person record (free text) → `Allergy{symptoms:['อื่นๆ'], note: old text}`;
   - settings: reminderDays from old setting or 7; templates kept.
3. Before writing v3: copy the raw v2 string to `medmate.v1.backup.v2` (do not delete it until the owner confirms in Settings, or after N successful launches). Migration is idempotent (`version>=3` → no-op) and all-or-nothing (validate result, else keep v2 and show a clear Thai error).
4. The owner exports a backup file with the **existing backup button** before the upgrade and keeps it; Claude Code uses it (or a fixture built from it) as the migration test input. Never commit real personal data to the repo (fixtures are anonymised).
5. Calculations use `reference/calc.mjs` ported to TypeScript (day-by-day, DS-7), replacing any average-based code.

## Alternatives
- New storage key + manual re-entry → rejected (owner does not want to re-enter data).
- Keep schema v2 and bolt fields on → rejected (brand/owner split and household owner need a shape change).

## Consequences
Brand-level packaging/prices are shared across owners; older entries get an explicit "ก่อนมีช่องเหตุผล" note; a rollback is possible via the backup key until confirmed.
