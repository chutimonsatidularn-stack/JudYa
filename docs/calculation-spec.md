# JudYa — Calculation spec

Source of truth for numbers = **`reference/calc.mjs`** (pure JS, no DOM, no storage) and **`reference/calc.test.mjs`** (18 tests, `node reference/calc.test.mjs`). Port both to TypeScript with the same names; keep tests green; add tests when a rule changes. Rules live in requirements: DS-1…DS-15, L-5…L-7, PR-4…PR-8, HM-2, AL-6.

| Function | Rule |
|---|---|
| `isTakeDay(schedule, date)` | daily · weekdays (0=Sun) · interval (n≥2, counted from `anchorDate`, never before it) · monthDays (short months skip) |
| `stockWalk({stock,doses,schedule,today})` | day-by-day, never an average; status `ok|noStock|noDose|beyondCap`; `daysRemaining` = calendar days to the first day the dose cannot be covered |
| `reorderDate(depletion, lead)` | depletion − lead days |
| `targetQuantity(...)` / `purchasePlan(...)` | DS-8 / L-6 (pack rounding only when `packageSize` known; no `-0`) |
| `lineCost(item, price, qtyBase)` | price unit = base → price×qty; = pack → price×ceil(qty/packSize); else `null` ("เทียบไม่ได้") |
| `compareShops(lines, pharmacies)` | rank only complete + shipping known; free-shipping threshold; split hint |
| `expiryStatus(expiry, today)` | `unknown|expired|soon(≤30)|ok` |
| `allergyHits(generic, allergies)` | case-insensitive containment either way, ≥3 chars |
| `diffSchedule(a,b)` | list of changed fields for the confirm sheet / history |

**Known gap in the prototype (do not copy):** the review prototype computes days-remaining with an *average per day* (`perDay`) because it is a click-through demo. Its demo numbers (los 5, vitd 70, cal 48, met 6 days) are illustrative. The real app must produce numbers from `stockWalk`; for every-day medicines they are identical.

## Worked examples (also in the tests)
- 10 tablets, 1/day → 10 days. 12 tablets, 1/take-day, Mon/Wed/Fri → ≈28 days. 10 tablets every other day → 20 days.
- Target 60 (2/day × 30 days), stock 12, pack 10 → additional 48, 5 packs, 50 actual; no pack size → 48.
- Compare (Losartan 30 tabs, Metformin 60 tabs): สุขใจ 465+40=฿505 · หมอยาเภสัช 426+30=฿456 (cheapest, ฿49 less) · ออนไลน์ not comparable.
