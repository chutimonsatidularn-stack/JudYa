# ADR-0004: Dose schedule — how a medicine says "which days"

- Status: Accepted (owner confirmed the five kinds, the start-date rule and the skip-month rule on 2026-10-07; the day-by-day counting method is the agent's design and the owner approved its results by example)
- Date: 2026-10-07
- Linked inputs/stories: DS-1 … DS-15 in docs/requirements.md; S-5 … S-9 in docs/stories.md

## Context
The app stores a medicine's dose as four numbers per day (morning, noon, evening, bedtime), which means "every day". Real prescriptions also say "Mon/Wed/Fri", "every other day", "every 3 days" or "the 1st of the month". With the old model days-remaining, the reorder date and the quantity to buy are wrong for those medicines (e.g. 12 tablets taken Mon/Wed/Fri last about 28 days, not 12). The owner remembers alternate days as "odd dates", which breaks at the end of a 31-day month.

## Decision
1. Add a `schedule` to every assignment (medicine for one person). The four daily doses stay and mean "the dose on a day the medicine is taken".
   ```
   schedule = { kind: 'daily' }
            | { kind: 'weekdays',  days: [0..6] }                      // 0 = Sunday, at least one
            | { kind: 'interval',  everyNDays: n >= 2, anchorDate: 'YYYY-MM-DD' }  // n = 2 is "every other day"
            | { kind: 'monthDays', days: [1..31] }                     // at least one
   ```
   A day is a take-day for `interval` when (day − anchorDate) in whole calendar days is divisible by `everyNDays`. For `monthDays`, a month without that date has no take-day for it (skipped, not moved).
2. Dates are calendar dates (`YYYY-MM-DD`) in Asia/Bangkok. Day differences are computed from year/month/day numbers, not from milliseconds.
3. Stock calculation walks forward day by day from today and subtracts each scheduled day's dose until the stock cannot cover a day. From that: `depletionDate`, `daysRemaining` (calendar days), `reorderDate`. Target quantity = sum of the scheduled doses over the target days. Walk is capped (3,650 days); no scheduled day or dose total 0 → "ยังคำนวณไม่ได้". For `daily` the result equals the old formula.
4. History: a dose change entry also stores `previousSchedule` and `newSchedule` (whole copy). One entry per save, even if both dose and schedule changed. Entries are never edited or deleted.
5. Saved data version goes from 1 to 2. Upgrade: every assignment gets `{kind:'daily'}`; every old change entry gets `{kind:'daily'}` for both fields. The upgrade must be safe to run twice and must not change any number for every-day medicines. Keep a copy of the version-1 data until the upgrade has succeeded.
6. Put the schedule logic (is-take-day, summary text, simulation, upgrade) in small pure functions that do not touch the screen, so they can be tested alone and reused by the real app.
7. Step-down doses are **not** built now. A later version can turn the assignment into a list of periods, each with its own schedule and doses; the version number is what makes that upgrade possible.

## Alternatives considered
- Odd/even date for every-other-day – breaks when a 31-day month is followed by the 1st (two take-days in a row).
- Store a list of dates – large, hard to edit, hard to describe in words.
- Average per day (e.g. 3 ÷ 7 per day) – gives wrong depletion dates and wrong purchase quantities.
- Cron-style text – not understandable for the owner or the family.
- Move a 31st to the last day of a short month – owner chose "skip the month" instead.

## Consequences
- Easier: the app can describe real prescriptions; numbers for ordering are right.
- Harder: every place that read "daily dose" must now ask the schedule (stock, order planning, Home, lists, Doctor Mode, order message).
- Existing saved data is upgraded once; keep the backup copy until the upgrade is confirmed.
- Revisit when step-down doses are requested (OS-2) or when the real app gets a database (the same shape can be used there).
- The prototype is a compiled single file (ADR-0002), so these changes are made by editing it in place; if that becomes too risky, a readable rebuild needs its own ADR.
