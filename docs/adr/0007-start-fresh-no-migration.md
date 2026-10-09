# ADR-0007: Start fresh in the new app — no migration of the old app's data

- Status: Accepted (owner decided 2026-10-09: "I will not use the data in the old installed app; I will start entering data in the new app"). Supersedes ADR-0005.
- Date: 2026-10-09
- Linked inputs/stories: D-1, D-3, D-4, P-5, C-3 in docs/requirements.md; ADR-0005 (superseded), ADR-0006.

## Context
ADR-0005 planned a lossless migration of the old app's data (found to be format version 1, not 2) into the new data format. The owner decided not to carry that data over and to enter everything again in the new app.

## Decision
1. **No migration code in the app.** The working `migrate1to3` and its tests stay in git history (commit 3197889, "Add data migration v1 to v3") in case the owner changes their mind.
2. The new app stores its data under its **own key `judya.v1`**, format `version: 1` (the data model of docs/data-model.md; "v3" in older docs meant the third format counting the old app's two). The old key `medmate.v1` is **never read, changed or deleted** by the new app, so nothing of the old data can be damaged by the new app (a test checks this).
3. The old app file `medmate-app.html` stays in the repo and on Pages unchanged. The new app is deployed at its own entry (not replacing it) until the owner chooses to retire the old one.
4. Backup / restore for the **new** app is still built (D-3): it protects the data the owner is about to enter.
5. Clearing the old data on the phone is the owner's choice and is not done by the app. It is suggested to save one backup file from the old app (Settings → "สำรองข้อมูลเป็นไฟล์") before clearing, as a precaution, not as a requirement.

## Alternatives considered
- Keep ADR-0005 and migrate anyway — more code and risk for data the owner does not want.
- Reuse the key `medmate.v1` for the new app — the new app would meet old-format data and could overwrite it; a separate key removes that risk.

## Consequences
- Simpler: no migration to maintain; a clean first run (empty states must be good: MB-9, no medicines, no pharmacies).
- The new app shows no data until the owner enters it.
- The owner's old data stays only as long as they keep the old app's browser storage; it is not carried into the new app.
