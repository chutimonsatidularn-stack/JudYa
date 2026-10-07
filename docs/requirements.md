# Requirements (living document)

The **current truth** about what MedMate should do. Not a chat log.
- Update it on **every** owner input about logic, UI, UX, a suggestion, or a requirement — immediately, before changing the app.
- Edit the existing line when something changes; delete lines that are no longer true. History is in git; big decisions are in `docs/adr/`.
- Status: `Confirmed` (owner said it) · `Assumed` (inferred from the existing app, needs a yes) · `Suggested` (agent idea, waiting for the owner) · `Open` (question).
- `(pkg)` = taken from the owner's design/handoff package v1.0 (Claude Project "แอพจัดการยา": APP_SPEC, SCREEN_SPEC, ACCEPTANCE_CRITERIA, DESIGN_SYSTEM). `(chat 2026-10-07)` = owner's answers in the dose-schedule conversation.
- Look and feel lives in `docs/design-system.md`; the screen pictures are in `docs/design/screens/`.

## Product
| ID | Requirement | Status |
|---|---|---|
| P-1 | MedMate helps people manage the medicines they keep at home. | Assumed |
| P-2 | Stay simple for beginners; no complex features yet. | Confirmed |
| P-3 | It is a **family medication management assistant**, not only a reminder app: keep each person's medicines, know the stock, days remaining and reorder date, prepare the order, compare pharmacies, share with family, and give the doctor a readable summary. (pkg) | Confirmed |
| P-4 | Core principle: **ไม่ต้องจำ ไม่ต้องคำนวณ ไม่ต้องพิมพ์ใหม่** (no remembering, no calculating, no retyping). (pkg) | Confirmed |
| P-5 | The app is being renamed from MedMate to **JudYa** (owner 2026-10-07). Scope of the first pass: only what users see (name in the app, screens, install name and icon, documents). Internal names stay as they are so saved data and links keep working: the `medmate.v1` storage key, file names, repo name, backup file format name. A full technical rename is done later when the app moves host or becomes the real app. The new wordmark, Thai spelling and tagline are waiting for the owner's concept image; the vector wordmark is made from it with the logo master prompt and checked against it before use. Until then nothing is renamed. | Confirmed (assets pending) |

## Users
| ID | Requirement | Status |
|---|---|---|
| U-1 | A household caregiver keeps medicines for several family members (e.g. คุณพ่อ, คุณแม่, ฉัน); other carers can be given read-only access; a doctor reads a summary. (project description) | Confirmed |

## Logic & rules
| ID | Requirement | Status |
|---|---|---|
| L-2 | Works offline after the first load. | Assumed |
| L-3 | The same medicine can be used by several people; **stock, dose and schedule belong to the person** (one "assignment" per person and medicine). (pkg) | Confirmed |
| L-4 | A day's dose is four numbers: morning, noon, evening, bedtime. Total per take-day = their sum. (pkg) | Confirmed |
| L-5 | `depletionDate` = the first day the remaining stock cannot cover that day's dose. `daysRemaining` = calendar days from today to `depletionDate`. `reorderDate` = `depletionDate` − reorder lead days. Exact counting rule: see DS-7. (pkg + chat 2026-10-07) | Confirmed |
| L-6 | Purchase: `targetQuantity` = what is needed for the target number of days (DS-8). `additionalQuantity` = max(target − stock, 0). If a package size exists: `packagesToBuy` = ceil(additional ÷ packageSize), `actualQuantity` = packages × packageSize. Always show the calculated quantity and the package quantity separately. (pkg) | Confirmed |
| L-7 | Pharmacy comparison: total = medicines + shipping. Compare only options with complete prices; otherwise show "ข้อมูลราคาไม่ครบ". Highlight the cheapest valid option and say when the comparison is incomplete. (pkg) | Confirmed |
| L-8 | Order message: show the exact list, the user reviews it, can copy it and open LINE. Never claim the app sends to LINE automatically. (pkg) | Confirmed |
| L-9 | Dose/schedule changes are **history, append-only** (never edited or deleted). Stopping a medicine = set inactive; history stays. (pkg) | Confirmed |
| L-10 | If data needed for a number is missing (dose = 0, no stock, no price) show it as missing ("ยังคำนวณไม่ได้", "ขาดข้อมูล"); never invent a number. (pkg) | Confirmed |

## Dose schedule — which days a medicine is taken (added 2026-10-07)
Why: a daily-only dose could not describe "vitamin on Mon/Wed/Fri" or "every other day", and made days-remaining wrong for them. Decision record: `docs/adr/0004-dose-schedule-model.md`.

| ID | Requirement | Status |
|---|---|---|
| DS-1 | Each medicine (per person) has a **schedule** with five kinds: every day · chosen weekdays · every other day · every N days · chosen days of the month. Default = every day. (chat 2026-10-07) | Confirmed |
| DS-2 | Weekdays: pick one or more of Sun–Sat (at least one). | Confirmed |
| DS-3 | "Every other day" (= every 2 days) and "every N days" (N ≥ 2) **count from a start date the user picks**, not from odd/even dates, so the cycle never takes two days in a row when a month has 31 days. (chat 2026-10-07) | Confirmed |
| DS-4 | Days of the month: pick one or more of 1–31. A month that does not have that date is **skipped** (31 in a 30-day month; 29–31 in February); it is not moved to the last day. The screen says so. (chat 2026-10-07) | Confirmed |
| DS-5 | On a take-day the dose is still split morning / noon / evening / bedtime exactly as before. (chat 2026-10-07) | Confirmed |
| DS-6 | The editor shows a Thai one-line summary ("ทุก จ. พ. ศ.", "วันเว้นวัน เริ่ม 7 ต.ค.", "ทุก 3 วัน เริ่ม 7 ต.ค.", "ทุกวันที่ 1 และ 15 ของเดือน") and, for cycle kinds, a 7-day preview of take / rest days so the user can check it. | Confirmed |
| DS-7 | **Stock is counted day by day**, never by an average: walk forward from today, subtract each scheduled day's dose, and stop on the first day the stock is not enough. Cap the walk (e.g. 3,650 days) and then say "enough beyond the calculated period". Examples that must hold: 12 tablets, 1 per take-day, Mon/Wed/Fri → about 28 days (not 12); 10 tablets, 1 per take-day, every other day → about 20 days (not 10); every-day medicines give the same result as before. | Confirmed |
| DS-8 | `targetQuantity` = sum of the doses on every scheduled day inside the target days, counted from today. | Confirmed |
| DS-9 | Home and the medicine lists show **"ทานวันนี้" / "พักวันนี้"** (text + icon) for medicines that are not every-day. Every-day medicines show no chip. | Confirmed |
| DS-10 | Changing the schedule is a high-risk edit: a confirmation sheet shows old → new, says that history cannot be deleted, and needs a tick before saving. It writes one history entry holding the previous and new schedule (and dose if it also changed). | Confirmed |
| DS-11 | Doctor Mode shows the schedule beside each dose ("เช้า 1 เม็ด · จ. พ. ศ.") and lists schedule changes in the history ("ตาราง: ทุกวัน → ทุก จ. พ. ศ."). | Confirmed |
| DS-12 | Order quantities and the order message use the schedule-based numbers (DS-8); the user still reviews before sending. | Confirmed |
| DS-13 | Existing data becomes "every day" when the data format is upgraded; numbers for every-day medicines must not change. | Confirmed |
| DS-14 | Dates are calendar dates in Thai local time (Asia/Bangkok), never UTC timestamps divided by 86,400,000 (midnight would give the wrong day). | Confirmed |
| DS-15 | **Not now:** step-down doses (e.g. lowering a dose every week). Keep the data shape open so it can be added later without a rebuild. (chat 2026-10-07) | Confirmed |

## UI
| ID | Requirement | Status |
|---|---|---|
| UI-1 | Thai language, mobile-first screens. | Assumed |
| UI-2 | Visual system = `docs/design-system.md` + `docs/design/design-tokens.json`: navy brand, green/mint success, yellow attention, beige/sky surfaces, Noto Sans Thai, rounded cards, clean-line icons, no mascot. (pkg) | Confirmed |
| UI-3 | Screens (pictures in `docs/design/screens/`): 01 Splash · 02 Welcome · 03 Login · 04 Register · 05 OTP · 06 Home · 07 Household · 07b Person medicines · 08 Medicine edit · 08c Schedule modes · 09 Dose adjust · 09b Confirm schedule change · 10 Order compare · 11 Order message · 12 Doctor mode · 13 Share · 14 Pharmacy settings. | Confirmed |
| UI-4 | Home is action-first: medicines close to running out, household overview, a "prepare order" button; avoid information overload. (pkg) | Confirmed |
| UI-5 | Doctor Mode: person, age if stored, allergies, current medicines with dose and schedule, recent dose/schedule changes, a "create medication summary" button, and a visible note that it is communication support, not diagnosis. (pkg) | Confirmed |
| UI-6 | Share: family link, picture summary, PDF, invite; the privacy notice stays visible. (pkg) | Confirmed |
| UI-8 | Brand graphics (logo, Splash and Welcome illustration, house banner on Home, user profile icons) are the approved vector set made from the ChatGPT concept (owner chose it 2026-10-07). They are kept as separate files in `docs/design/assets/` so the owner can swap them later without redrawing screens. | Confirmed |
| UI-7 | Pharmacy settings: pharmacies, shipping cost (fixed or variable), delivery address, recipient, refill warning days. (pkg) | Confirmed |

## UX
| ID | Requirement | Status |
|---|---|---|
| UX-1 | Installable to the Android home screen (PWA). | Assumed |
| UX-2 | Easy to use one-handed on a phone: touch targets ≥ 48 px, primary button 52 px, readable text (secondary text ≥ 11 px), status never by colour alone. (chat 2026-10-07 + pkg) | Confirmed |
| UX-3 | Every screen has loading, empty, error, validation-error, disabled, pressed, saved and copy-success states; plus confirmation dialog, unavailable pharmacy, missing stock, missing address, no medicines, no household members. (pkg) | Confirmed |
| UX-4 | Do not redesign confirmed flows during a build pass; match the approved visuals first, change after review. (pkg) | Confirmed |

## Data & privacy
| ID | Requirement | Status |
|---|---|---|
| D-1 | Data is stored on the device only; no cloud sync between devices. | Assumed |
| D-2 | Stored entities: **Person** (name, relationship, birth year, conditions, allergies, insurance) · **Medication** (name, strength, form, notes) · **Assignment** = a medicine for one person (stock, package size/unit, four daily doses, **schedule**, start date, reorder lead days, target stock days, prescriber/source, notes, active) · **DoseChange** (when, previous/new dose, **previous/new schedule**, source, reason, note, by whom; append-only) · **FollowUpNote** (date, symptom, severity, trend, note) · **Pharmacy** (name, LINE, phone, address, fixed/variable shipping, order template, active) · **OrderDraft** (people, assignments, target days, line items, pharmacy, subtotal, shipping, total, message, status draft/reviewed/copied). (pkg + DS) | Confirmed |
| D-3 | Backup and restore: Settings has a button to save all data to a file and a button to load such a file back (owner 2026-10-07). Loading replaces current data only after a confirmation that shows what will be replaced; the file is checked before use. User can also delete their data. | Confirmed |
| D-4 | The saved-data format is versioned. Today the app saves one JSON object in the browser under `medmate.v1` with `version: 1`; the dose-schedule change upgrades it to `version: 2` (see ADR-0004). | Assumed |
| D-5 | No login in the prototype (owner 2026-10-07): the app opens straight to Home. The old local login is removed; saved accounts in `medmate.accounts.v1` are ignored and left untouched. Screens 03 Login, 04 Register and 05 OTP stay as pictures for the later real app. | Confirmed |

## Safety
| ID | Requirement | Status |
|---|---|---|
| SF-1 | The app shows only what the user entered; it gives no medical advice or dosing guidance. | Assumed |
| SF-2 | Do not promise reminders/alarms the web app can't reliably deliver. | Assumed |
| SF-3 | The app never changes a dose or schedule by itself, never recommends starting or stopping a medicine, never diagnoses. (pkg) | Confirmed |
| SF-4 | High-risk fields (dose, schedule, stop) need a human confirmation before they are saved or used in an order message. (pkg) | Confirmed |
| SF-5 | Medication history is never hard-deleted. (pkg) | Confirmed |

## Out of scope (parked, not now)
| ID | Item | Status |
|---|---|---|
| OS-1 | Cloud login/accounts and sync, barcode scan, drug-interaction checks, notifications, selling or ads. Move an item out of this list only when the owner asks. (The real-app screens for login/OTP/share exist as pictures only — see Q-2.) | Assumed |
| OS-2 | Step-down (tapering) dose tables. (DS-15) | Confirmed |

## Prototype approval (when the real app may start)
| ID | Check | Status |
|---|---|---|
| AP-1 | Owner can do the top 3 jobs (Q-1 answered above) on their own phone without help. | Open |
| AP-2 | Owner says in words: "the prototype is approved". | Confirmed |
| AP-3 | Acceptance checks are listed in `docs/acceptance-criteria.md`. | Confirmed |

## Constraints
| ID | Requirement | Status |
|---|---|---|
| C-1 | Target: Android Chrome (other devices?). | Assumed |
| C-2 | Readable for older users (large text, good contrast)? | Open |
| C-3 | Free hosting (e.g. GitHub Pages), no running costs. | Assumed |
| C-4 | Code must be safe, reusable, and not rewritten needlessly: keep calculation code in small pure functions separate from the screens. (project instructions) | Confirmed |

## Suggestions waiting for the owner
| ID | Idea | Status |
|---|---|---|
| SG-1 | Screens 01–05, 10, 11, 13, 14 redrawn with the clean-line icons, 48 px buttons, text ≥ 11 px (2026-10-07, in `gen_screens.py`). | Done (owner to review in the running app) |
| SG-2 | (closed) The approved logo from the app is used as is on the screens; the earlier plain capsule logo is dropped. | Done |

## Answered questions
| ID | Answer (owner, 2026-10-07) |
|---|---|
| Q-1 | The 3 first jobs: (1) show how much stock is left and when to start preparing an order; (2) one overview of everything to manage for the people in the household; (3) pass medicine and dose information on to other people. |
| Q-2 | All 17 screens are wanted. 03–05 (login, register, OTP) are kept as pictures for the real app and are not in the running prototype (see Q-3). |
| Brand | Rename to JudYa: wordmark, Thai spelling and tagline to come from the owner's concept image (P-5). Scope: user-visible names only. |
| Q-3 | Remove the local login for the test phase; the app opens to Home (D-5). |
| Review | Owner will judge the look only after using the real prototype, not from the pictures. |

## Open questions
None at the moment.
