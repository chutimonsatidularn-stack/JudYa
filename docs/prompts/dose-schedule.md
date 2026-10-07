# Task for Claude Code: add the dose schedule to the prototype

Paste this to Claude Code (or say "ทำตาม docs/prompts/dose-schedule.md") with the MedMate repo open. It follows `AGENTS.md`: prototype phase, edit only `medmate-app.html`, update the documents first, small commits.

## 0. Read first
`AGENTS.md` · `docs/requirements.md` (section "Dose schedule", DS-1 … DS-15, and L-3 … L-10) · `docs/adr/0004-dose-schedule-model.md` · `docs/stories.md` (S-5 … S-9) · `docs/design-system.md` · `docs/acceptance-criteria.md` · pictures in `docs/design/screens/` (06, 07b, 08, 08c, 09, 09b, 12).
If anything is unclear, stop and ask the owner in Thai (multiple choice if possible). Never guess and write a guess as the owner's decision.

## 1. What the owner wants (already decided)
A medicine can be taken on certain days only. Five kinds: every day · chosen weekdays · every other day · every N days · days of the month. Every-other-day and every-N-days count from a start date the owner picks. A month without the chosen date is skipped. The four daily dose boxes stay (they are the dose on a take-day). Schedule changes are history, need a confirmation, and cannot be deleted. Step-down doses are NOT part of this task.

## 2. How the prototype is built (checked 2026-10-07)
`medmate-app.html` is one compiled React file (about 690 KB, no separate source; ADR-0002 says edit it in place). Data is one JSON object in `localStorage` key `medmate.v1` with `version: 1` and lists `persons, medications, assignments, doseChanges, notes, pharmacies, prices, orders` plus `settings` and `orderPlan`. A dose is `{morning, noon, evening, bedtime}` and is printed by a small helper that joins "เช้า 1 · เย็น 1 เม็ด". Stock and order maths use fields such as `stockQuantity`, `reorderLeadDays`, `targetStockDays`, `packageSize`. Find the real places by searching for those names and for the Thai labels on the screens; do not trust line numbers.
If editing the compiled file proves too risky, stop and tell the owner: a readable rebuild needs its own ADR first.

## 3. Order of work (one commit per step, message format in AGENTS.md)
1. **Documents first** (already written; correct them if reality differs).
2. **Pure functions**, no screen code. Write them as a small block of plain functions in the file, and test them with a throw-away script that you do not commit (for example load the function text in Node and run the cases below).
   - `isTakeDay(schedule, y, m, d)` using calendar numbers only (no UTC milliseconds). Weekday 0 = Sunday. `interval`: whole-day difference from `anchorDate` divisible by `everyNDays`. `monthDays`: take on that date only in months that have it.
   - `scheduleSummaryTh(schedule)` → "ทุกวัน", "ทุก จ. พ. ศ.", "วันเว้นวัน เริ่ม 7 ต.ค.", "ทุก 3 วัน เริ่ม 7 ต.ค.", "ทุกวันที่ 1 และ 15 ของเดือน".
   - `nextDays(schedule, from, count)` for the 7-day preview.
   - `projectStock({stock, doses, schedule, today, capDays})` → `{depletionDate, daysRemaining}` by walking day by day; and `targetQuantity(doses, schedule, today, targetDays)`.
   - `upgradeData(v1) → v2` (every assignment and old change entry gets `{kind:'daily'}`); safe to run twice; keep a copy of the version-1 data under another key until the upgrade is confirmed.
3. **Data**: add `schedule` to assignments; add `previousSchedule` and `newSchedule` to dose-change entries; bump to `version: 2` with the upgrade above.
4. **Maths**: replace "stock ÷ daily dose" everywhere (Home, lists, order planning, order message, Doctor Mode) with the functions above. For `daily` the numbers must equal the old ones.
5. **Screens**, matching the pictures: medicine edit (08/08c), dose adjust (09) with the confirmation sheet (09b), Home (06), the person's medicine list (07b), Doctor Mode (12). Use the sizes in `docs/design-system.md` (48 px targets, 52 px button, text ≥ 11 px), line icons, text + icon for every status.
6. Walk through `docs/acceptance-criteria.md` ("Dose schedule", "Safety", "Quality") on a 390 px wide window and tick what passes in your report.

## 4. Test cases that must pass
- 12 tablets, morning 1, Mon/Wed/Fri, start on a Monday → about 28 calendar days (12 take-days), not 12.
- 10 tablets, morning 1, every other day → about 20 days, not 10.
- Every-day medicines: same results as the old formula for a range of stock and dose values (regression).
- Every other day and every 3 days across: 30→31 Jan→1 Feb, 28/29 Feb, 31 Dec→1 Jan (also a leap year); never two take-days in a row for `interval 2`.
- Days of month `[31]`: take on 31 Jan, skip April, take 31 May; `[29,30,31]` in February skips the missing dates (leap year too).
- Weekdays with every start weekday; anchor in the past and in the future.
- Total dose 0, no stock, no take-day → "ยังคำนวณไม่ได้" / "ขาดข้อมูล", no invented number.
- Package size: rounding up to packages; calculated and package quantity shown separately.
- Schedule change creates a new history entry, never edits an old one; stopping a medicine keeps history.
- Upgrade run twice gives the same data; old numbers for every-day medicines are unchanged.
- Dates at 23:30 and 00:30 Asia/Bangkok give the right calendar day.

## 5. Rules that always apply
No medical advice; the app never changes a dose or schedule by itself and never says to start or stop a medicine; no claim that LINE is sent automatically; history is never hard-deleted; only the approved palette; Thai text; do not delete or move files without asking; do not start the real app. Report to the owner in Thai: what changed, what you tested, what is still open.
