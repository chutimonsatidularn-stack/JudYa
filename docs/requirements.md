# JudYa — Requirements (living document, v0.7)

The **current truth** about what JudYa (formerly MedMate) should do. Not a chat log.
This file is a **superset of the repo's `docs/requirements.md`** (all old IDs kept; MedMate → JudYa; new sections added from design-review rounds 1–7). Claude Code: replace `docs/requirements.md` in the repo with this file, then keep it updated.

- Update it on **every** owner input about logic, UI, UX, a suggestion or a requirement — immediately, before changing the app. Edit the existing line when something changes; delete lines that are no longer true. History is in git; big decisions are in `docs/adr/`.
- Status: `Confirmed` (owner said it) · `Assumed` (inferred, needs a yes) · `Suggested` (agent idea, waiting for the owner) · `Open` (question).
- Source tags: `(pkg)` owner's design package v1.0 · `(chat 2026-10-07)` dose-schedule conversation · `(review rN)` owner's comments in the flow-review artifact, round N (r1–r7, 2026-10-08) · `(proto 0.7)` behaviour shown in the approved flow prototype `prototype/judya-flow-v0.7.html` that the owner has not commented on but approved by passing the review ("ผ่าน", 2026-10-08).
- Look and feel: `docs/design-system.md` + `docs/design/design-tokens.json`. Screen pictures: `docs/design/screens/`. Screen behaviour: `docs/screen-spec.md`. Data: `docs/data-model.md`. Maths: `docs/calculation-spec.md` + `reference/calc.mjs` (+ tests).

## Product
| ID | Requirement | Status |
|---|---|---|
| P-1 | JudYa helps people manage the medicines they keep at home. | Confirmed |
| P-2 | Stay simple for beginners; no complex features yet. | Confirmed |
| P-3 | It is a **family medication management assistant**, not only a reminder app: keep each person's medicines, know the stock, days remaining and reorder date, prepare the order, compare pharmacies, share with family, give the doctor a readable summary. (pkg) | Confirmed |
| P-4 | Core principle: **ไม่ต้องจำ ไม่ต้องคำนวณ ไม่ต้องพิมพ์ใหม่**. (pkg) | Confirmed |
| P-5 | Name is **JudYa**. The new app uses the storage key `judya.v1` (ADR-0007); the old app keeps `medmate.v1`. (owner, Q-rename; revised 2026-10-09) | Confirmed |
| P-6 | The app UI uses only the JudYa logo palette (see design system). (owner) | Confirmed |
| P-7 | Plan: trial PWA first (Android), later maybe sold (first customers: families caring for elderly parents) and maybe App Store/Play Store. Design so it can become a mobile app. | Confirmed |

## Users
| ID | Requirement | Status |
|---|---|---|
| U-1 | A household caregiver keeps medicines for several family members; other carers can be given read-only access; a doctor reads a summary. | Confirmed |
| U-2 | 3–4 people in the household use medicines; stock is tracked **separately per person** even for the same medicine. | Confirmed |

## Members (added r5–r7)
| ID | Requirement | Status |
|---|---|---|
| MB-1 | Each member has a **profile picture** at the top of their page. **All profile pictures in the app come from the JudYa set of 20 icons** (`docs/design/assets/profile-icons/`, owner 2026-10-09), read through one helper `getAvatar(avatarId)` and `profiles.json`; an unknown or missing id falls back to `profile-01`. Shown with `<img>` only (never inline SVG). Prototype defaults (my pick by look, owner may change): คุณพ่อ `profile-11`, คุณแม่ `profile-19`, ฉัน `profile-02`. The member keeps only `avatarId`. **The user picks the icon themselves** from all 20 on screen 07e ("เลือกรูปโปรไฟล์"), opened by "เปลี่ยนรูป" on the member page; choosing shows a check + dark frame, "ใช้รูปนี้" saves, going back changes nothing. **No own photo (camera / file) in this version** (owner 2026-10-09). When add-member is designed (Q-B) it uses the same picker. (review r6) | Confirmed |
| MB-2 | Each member has a switch **"จัดยาทานเอง"** (self-manages pills). When on: the member is **left out of the daily "จัดยา" (prepare pills) list** and of "ต้องทานยา N คน", but the app still tracks stock, buy reminders and orders for them. Household list and Home show the chip "จัดยาเอง · เราดูแลสต๊อก". The member page tile becomes "จัดยาเอง". (review r6) | Confirmed |
| MB-3 | The member page order, top to bottom: profile card · self-manage switch · allergy block · 4 tiles (จัดยาวันนี้ / สั่งยา / แชร์ให้แพทย์ / สรุปพบแพทย์) · medicine list · "ยาที่หยุดแล้ว". (proto 0.7) | Confirmed |
| MB-4 | Member data holds: name, relationship, birth year, profile icon (MB-1), self-manage switch (MB-2); conditions and health / accident insurance (D-2) come later. Editing them is MB-5…MB-9. (Proposed in the prototype 2026-10-09; owner asked for the add / remove design) | Proposed |
| MB-5 | **Add member** (screen 07f, from the pill "เพิ่มสมาชิก" on Members): name (required, ≤ 40, must not repeat another member), relationship (one of: พ่อ · แม่ · ปู่ย่าตายาย · คู่สมรส · ลูก · ตัวฉัน · อื่นๆ; optional), birth year in พ.ศ. (optional, 4 digits 2400–2569; the age is shown under it), profile icon (shows the current one + "เปลี่ยนรูป" → 07e, default `profile-01`). The primary button "เพิ่มสมาชิก" is disabled until the name is valid, with one line under it saying why. A new member starts with no medicines; the member page shows the existing empty text. (Proposed) | Proposed |
| MB-6 | **Edit member** (same screen 07f, title "แก้ไขข้อมูลสมาชิก", opened from the card "ข้อมูลสมาชิก" on the member page). Same fields; primary "บันทึก". Changing the name or relationship is not a high-risk edit (no reason needed). (Proposed) | Proposed |
| MB-7 | **Remove member = "นำออกจากรายชื่อ", not deleting** (screen 07g, red outline button at the bottom of 07f in edit mode). The screen shows who, how many medicines, and says: the medicines and the member disappear from Home, notifications, today's list, medicine list and orders; **dose history, schedules, stock and allergies are kept** (SF-5) and the member can be brought back. Needs a tick "ฉันเข้าใจ" then "ยืนยันนำออก" (red); "ยกเลิก" goes back. Household common medicines (บ้าน) are not affected. A reason is not asked. (Proposed — chosen to match "stop a medicine = inactive, history stays" L-9; a real delete is not offered) | Proposed |
| MB-8 | **Removed members** are listed at the bottom of Members under "สมาชิกที่นำออกแล้ว" (name, number of medicines kept) with a button "นำกลับ" that restores them as they were. (Proposed) | Proposed |
| MB-9 | If no member is left, Members and Home show an empty state: "ยังไม่มีสมาชิก" + button "เพิ่มสมาชิก"; "เตรียมสั่งยา" and the banner are hidden. (UX-3 "no household members") | Proposed |

## Household common medicines (added r6–r7)
| ID | Requirement | Status |
|---|---|---|
| HM-1 | In "ยานี้ของใคร" there is an extra owner choice **"ยาสามัญประจำบ้าน"** for medicines anyone may use (e.g. paracetamol). (review r6) | Confirmed |
| HM-2 | A household medicine has **no routine schedule** ("ใช้เมื่อมีอาการ"), so no daily dose, no days-remaining and no stock-based reorder reminder. It is **reminded by expiry date**: warn when ≤ 30 days remain, and when expired. The edit page has an expiry date field; the list card shows an expiry chip; the notification list has a "ใกล้หมดอายุ" group. (review r7) | Confirmed |
| HM-3 | The medicine list has a filter chip "ยาบ้าน". The schedule card and the "ปรับโดส" card are hidden for household medicines; the buy page hides refill cycle and lead days. (proto 0.7) | Confirmed |
| HM-4 | Allergy check for a household medicine looks at **all members'** allergies. (proto 0.7) | Assumed |
| HM-5 | Low-stock reminders for household medicines are **not** wanted ("เตือนเป็นวันหมดอายุแทน"). Stock quantity is still shown. | Confirmed |

## Medicine identity: generic name + brand, packaging (added r7)
| ID | Requirement | Status |
|---|---|---|
| BR-1 | A medicine has a **generic name** (ตัวยาสามัญ), an optional **brand** (ยี่ห้อ), strength, form. The same generic drug with a different brand is a **separate entry**, because pack size and price differ. The edit page says so. (review r7) | Confirmed |
| BR-2 | Brand is shown on the list card, the order list, the buy page header and in the order message: "Losartan (Cozaar) 50 mg". (review r7) | Confirmed |
| BR-3 | **Pack size belongs to the brand entry** (unit of pack, number of base units per pack, unit of the base). The user types the number; there are no quick-pick chips. The page says "ของยี่ห้อนี้". (review r4, r7) | Confirmed |
| BR-4 | Form (dropdown) sets the default units: เม็ด→เม็ด/แผง · แคปซูล→แคปซูล/แผง · ผงชง/ซอง→ซอง/กล่อง · น้ำ/ไซรัป→มล./ขวด · ยาหยอด/พ่น→มล./ขวด · ครีม/ขี้ผึ้ง→กรัม/หลอด · แผ่นแปะ→แผ่น/กล่อง. The stock unit and pack unit are dropdowns and can be changed by the user; units matching the pack are listed first. (review r3–r4) | Confirmed |
| BR-5 | The **dose unit label follows the form** (e.g. "1½ ซอง"). (owner: "ตรง", r7) | Confirmed |
| BR-6 | If the stock unit matches neither the base unit nor the pack unit, show a warning ("หน่วยไม่ตรงกับขนาดบรรจุ") and treat days-remaining as unknown; if no pack size is entered show "ยังไม่ระบุขนาดบรรจุ" and do not round purchase quantity to full packs. | Confirmed |
| BR-7 | The edit page is split into three levels (r5): (1) core fields (generic, brand, strength, owner, form, stock, expiry for household); (2) card → "ขนาดบรรจุและการซื้อ" (pack, refill cycle 30/60/90/custom, lead days, prices per pharmacy); (3) card → "ตารางทานยา" (schedule + doses); plus a card → "ปรับโดส" for existing non-household medicines. Each card shows a one-line summary of its current values. (review r5; UX rationale in `docs/screen-spec.md` §08) | Confirmed |

## Logic & rules
| ID | Requirement | Status |
|---|---|---|
| L-2 | Works offline after the first load. | Assumed |
| L-3 | **Stock, dose and schedule belong to the person** (one "assignment" per person and medicine). Packaging and prices belong to the medicine (brand) entry. (pkg, r7) | Confirmed |
| L-4 | A day's dose is four numbers: morning, noon, evening, bedtime; total per take-day = their sum. Doses step by 1, ½ or ¼ (default ½) and are shown as ½ 1½ ¼ ¾. (pkg, r4) | Confirmed |
| L-5 | `depletionDate` = first day the remaining stock cannot cover that day's dose; `daysRemaining` = calendar days today → `depletionDate`; `reorderDate` = `depletionDate` − reorder lead days. Exact rule: DS-7. (pkg + chat) | Confirmed |
| L-6 | Purchase: `targetQuantity` = need for the target days (DS-8); `additionalQuantity` = max(target − stock, 0); with a pack size: `packagesToBuy` = ceil(additional ÷ packSize), `actualQuantity` = packages × packSize. Always show calculated and package quantity separately. (pkg) | Confirmed |
| L-7 | Pharmacy comparison — see PR-1…PR-8. | Confirmed |
| L-8 | Order message: show the exact list, user reviews, copies it and opens LINE by hand. Never claim the app sends to LINE. (pkg) | Confirmed |
| L-9 | Dose/schedule changes and stop events are **history, append-only**; never edited or deleted. Stopping a medicine = set inactive. (pkg) | Confirmed |
| L-10 | If data for a number is missing (dose 0, no stock, no price, unknown shipping) show it as missing ("ยังไม่ทราบ", "ยังคำนวณไม่ได้", "ขาดข้อมูล", "เทียบไม่ได้"); never invent a number. (pkg) | Confirmed |
| L-11 | Reorder threshold default **7 days** ("เตือนซื้อเมื่อเหลือไม่เกิน 7 วัน"), changeable in Settings (1–30). A medicine is "ใกล้หมด" when daysRemaining ≤ threshold. (proto 0.7) | Confirmed |

## Dose schedule — which days a medicine is taken (2026-10-07)
Decision record: `docs/adr/0004-dose-schedule-model.md`. **Reference implementation and tests: `reference/calc.mjs`, `reference/calc.test.mjs`.**

| ID | Requirement | Status |
|---|---|---|
| DS-1 | Five kinds: every day · chosen weekdays · every other day · every N days · chosen days of the month. Default = every day. | Confirmed |
| DS-2 | Weekdays: pick one or more of Sun–Sat (at least one). | Confirmed |
| DS-3 | "Every other day" and "every N days" (N ≥ 2) **count from a start date the user picks**, never from odd/even dates. | Confirmed |
| DS-4 | Days of the month: one or more of 1–31; a month without that date is **skipped**, not moved. The screen says so. | Confirmed |
| DS-5 | On a take-day the dose is still split morning / noon / evening / bedtime. | Confirmed |
| DS-6 | The editor shows a Thai one-line summary ("ทุกวันจันทร์ พฤหัสบดี และ เสาร์", "วันเว้นวัน ครั้งถัดไป 9 ต.ค.") and, for cycle kinds, a 7-day take/rest preview. | Confirmed |
| DS-7 | **Stock is counted day by day**, never by an average: walk forward from today, subtract each scheduled day's dose, stop on the first day stock is not enough; cap 3,650 days then "enough beyond the calculated period". Must hold: 12 tablets, 1 per take-day, Mon/Wed/Fri → ≈28 days (not 12); 10 tablets, every other day → 20 days; every-day medicines unchanged. **The prototype used an average only because it is a demo — the real app must not.** | Confirmed |
| DS-8 | `targetQuantity` = sum of the doses on every scheduled day inside the target days, counted from today. | Confirmed |
| DS-9 | Home and lists show **"ทานวันนี้" / "พักวันนี้"** (text + icon) for medicines that are not every-day. | Confirmed |
| DS-10 | Changing the schedule is a high-risk edit: confirmation sheet shows old → new **and the reason**, says history cannot be deleted, needs a tick. It writes **one** history entry holding previous/new schedule and dose. | Confirmed |
| DS-11 | Doctor Mode shows the schedule beside each dose and lists schedule changes in the history. | Confirmed |
| DS-12 | Order quantities and the order message use schedule-based numbers (DS-8); user still reviews. | Confirmed |
| DS-13 | Existing data becomes "every day" on upgrade; numbers for every-day medicines must not change. | Confirmed |
| DS-14 | Dates are calendar dates in Asia/Bangkok, never UTC ms ÷ 86,400,000. | Confirmed |
| DS-15 | **Not now:** step-down doses. Keep the data shape open. | Confirmed |

## Dose adjustment, history, stopping (added r6)
| ID | Requirement | Status |
|---|---|---|
| DA-1 | The screen is named **"ปรับโดส"** everywhere (the old name "ปรับขนาดยา" was confused with editing medicine data). The step selector says "กดแต่ละครั้งเปลี่ยนทีละ". (review r6) | Confirmed |
| DA-2 | "ปรับโดส" is for when a doctor/pharmacist changes the dose. Layout: current dose card · new dose rows (−/+ per period) · "สิ่งที่จะเปลี่ยน" summary · **reason dropdown (required)** · free-text detail (optional) · button "ตรวจสอบก่อนบันทึก" (disabled until something changed **and** a reason is chosen) · red-outline button "หยุดใช้ยา" · header pill "ประวัติ". (review r6 + screenshot of the installed app) | Confirmed |
| DA-3 | Dose-change reasons: แพทย์สั่งปรับ · เภสัชกรแนะนำ · ผลตรวจเลือดหรือผลตรวจอื่น · มีผลข้างเคียง · อื่นๆ. The same reason box is on the schedule page when editing an existing medicine; it is **not** required for a new medicine. | Confirmed |
| DA-4 | The confirm sheet shows old → new **and the chosen reason + note**; the save button needs the tick **and** a reason. (review r6) | Confirmed |
| DA-5 | **History screen (09c)**: a timeline for the medicine, newest first; each entry: date, kind (ปรับโดส / หยุดใช้ยา), what changed, reason chip, note, and symptoms if any. Footer: "ประวัติเพิ่มได้อย่างเดียว ลบหรือแก้ย้อนหลังไม่ได้". | Confirmed |
| DA-6 | **Stop medicine (09d)**: reason required (แพทย์สั่งหยุด · หายแล้ว ไม่ต้องใช้แล้ว · มีผลข้างเคียง · แพ้ยา · เปลี่ยนไปใช้ยาอื่น · อื่นๆ), optional note, tick to confirm. The medicine moves to "ยาที่หยุดแล้ว" on the member page; it no longer counts for pill preparation or buy reminders; history is kept. | Confirmed |
| DA-7 | If the stop reason is **"แพ้ยา"** the user must choose at least one symptom; an allergy record is created automatically (AL-1). | Confirmed |
| DA-8 | Doctor Mode lists the latest 3 history entries (with reasons). | Confirmed |

## Allergies (added r6–r7)
| ID | Requirement | Status |
|---|---|---|
| AL-1 | An allergy record = drug name (generic or brand), symptoms (multi-select), optional note, date recorded. Symptoms list: ผื่น/ลมพิษ · คัน · บวมที่หน้า/ปาก · หายใจลำบาก · คลื่นไส้/อาเจียน · ท้องเสีย · เวียนหัว/ใจสั่น · อื่นๆ. (review r6, r7) | Confirmed |
| AL-2 | Allergies show as a **red warning block in the member's profile** (drug, symptoms, note, date) and in the Doctor summary. With no record the profile says so and offers "เพิ่มแพ้ยา". (review r6) | Confirmed |
| AL-3 | Allergy can be added **standalone** from the profile ("เพิ่มแพ้ยา", screen 07d) — also for drugs never used in the app — or automatically when a medicine is stopped as "แพ้ยา". (review r7: "อยาก") | Confirmed |
| AL-4 | Each allergy has **"แก้ไข"** (opens the same form filled in; the original date is kept) and **"ลบ"** (inline confirm: "ลบรายการนี้ใช่ไหม? ถ้าลบ จะไม่ขึ้นเตือนแพ้ยานี้อีก" → ยืนยันลบ / ยกเลิก). (review r7: "ต้องมีปุ่มลบด้วย") | Confirmed |
| AL-5 | If a severe symptom is chosen (บวมที่หน้า/ปาก, หายใจลำบาก) show "อาการรุนแรง — ถ้าเกิดอีก ให้ไปโรงพยาบาลหรือโทร 1669 ทันที". This is a fixed safety note, not advice about doses. | Confirmed |
| AL-6 | When adding/editing a medicine whose **generic name** matches an allergy of its owner (case-insensitive; one contains the other; ≥ 3 characters) show a red warning "ระวัง: <คน> เคยแพ้ <ยา> · อาการที่เคยเกิด: …" — brand-independent. | Confirmed |
| AL-7 | Allergy deletion is a hard delete and leaves no log (unlike dose history). | Assumed — see Open questions |

## Pricing and pharmacy comparison (added r5)
| ID | Requirement | Status |
|---|---|---|
| PR-1 | The user can add **per-unit prices of each medicine for each regular pharmacy** (2–3 pharmacies; any number is allowed). Each price row = pharmacy · price (THB, 2 decimals) · price unit (dropdown: base unit or pack unit). Add and delete rows. (review r5) | Confirmed |
| PR-2 | Pharmacy = name, optional note, optional phone, **shipping fee** (0 = pickup; empty = unknown), optional **free-shipping-over** amount. Pharmacies are user-addable/removable (not fixed at 2). (review r5 + earlier) | Confirmed |
| PR-3 | Order screen: the list of medicines to order (default = the ones near running out; filter by member), quantity per line, and for each pharmacy the **medicines subtotal + shipping = total**; a green recommendation card names the cheapest pharmacy including shipping and how much cheaper it is than the next. | Confirmed |
| PR-4 | Per-line cost: price × base quantity when the price unit is the base unit; price × ceil(base qty ÷ pack size) when it is the pack unit; **otherwise "เทียบไม่ได้"** (never guess). | Confirmed |
| PR-5 | A pharmacy is **ranked only if every line is priced and its shipping is known**; otherwise the card says what is missing ("ขาดราคา: Losartan" / "ไม่ระบุค่าส่ง") and "เทียบไม่ได้". If no pharmacy is complete the screen says the comparison is not possible yet and where to add prices. | Confirmed |
| PR-6 | Free shipping applies when the pharmacy subtotal ≥ its free-over amount. | Confirmed |
| PR-7 | **Split-order hint**: if buying each line at its cheapest pharmacy (shipping counted per pharmacy used) beats the best single pharmacy, show it as a note; it never changes the recommendation. | Confirmed |
| PR-8 | Demo numbers that tests must reproduce (see `reference/calc.test.mjs`): สุขใจ ฿505, หมอยาเภสัช ฿456 (recommended, ฿49 cheaper), ออนไลน์ not comparable (Losartan unpriced). | Confirmed |
| PR-9 | After choosing a pharmacy: "สร้างข้อความสั่งยา" (L-8) and "โทรสั่งที่ <ร้าน>" (disabled with "ยังไม่มีเบอร์โทร" when no phone). The phone button opens the dialler in the real app. | Confirmed |
| PR-10 | Message templates: user can pick, create, rename, edit; placeholders `{ร้านยา}` `{รายการยา}` `{ผู้สั่ง}` inserted by tap; live preview. Order lines read "n) <generic> (<brand>) <strength> x <qty base unit> (<packs>) (<person>)". | Confirmed |

## Navigation and notifications (r4–r7)
| ID | Requirement | Status |
|---|---|---|
| NV-1 | Bottom navigation has 4 items: **หน้าแรก · ยา · แชร์ · ตั้งค่า**. The second item was "สั่งยา" and is now **"ยา"** = medicine list of everyone (filter chips: ทุกคน/พ่อ/แม่/ฉัน/ยาบ้าน), "เพิ่มยา" button, banner "ยาใกล้หมด N รายการ → เทียบราคาร้านยาก่อนสั่ง", each medicine opens its edit page. (review r5) | Confirmed |
| NV-2 | Home is action-first: header "บ้านของเรา" + date + bell with a count; yellow banner for medicines near running out; member cards with chips (ทานวันนี้ N / พักวันนี้ / จัดยาเอง · ต้องซื้อ N / สต๊อกพอ); big button "เตรียมสั่งยา". **No separate "วันนี้ต้องทานยากี่คน" card** (duplicates the chips). (review r4) | Confirmed |
| NV-3 | Bell → notification list: วันนี้ (who must take pills) · ควรซื้อยา · **ใกล้หมดอายุ** · ตั้งค่าการเตือน. The bell count = (1 if anyone has pills today) + low-stock medicines + expiring household medicines. | Confirmed |
| NV-4 | "ยาวันนี้" (06c): tick per medicine per time of day, progress "จัดแล้ว X จาก Y", rest-day note, and a note "ไม่รวม <คน> เพราะจัดยาเอง". Entry from the member page tile and the notification list. | Confirmed |
| NV-5 | The back button of the edit page returns to wherever it was opened from (medicine list, member page, or notifications). | Confirmed |

## UI
| ID | Requirement | Status |
|---|---|---|
| UI-1 | Thai language, mobile-first. | Confirmed |
| UI-2 | Visual system = `docs/design-system.md` + `docs/design/design-tokens.json`: navy `#0B3A6B`, blue, green/mint, yellow, sky/pale surfaces, Noto Sans Thai, rounded cards, clean-line icons. | Confirmed |
| UI-3 | Screens (29; pictures in `docs/design/screens/`): 01 Splash · 02 Welcome · 03 Login · 04 Register · 05 OTP · 06 Home · 06b Notifications · 06c Today · 07 Members · 07b Member page · 07c Medicines · 07d Allergy · 07e Choose profile picture · 07f Add / edit member · 07g Remove member · 08 Edit medicine · 08c Schedule · 08d Pack & buying · 09 Adjust dose · 09b Confirm · 09c History · 09d Stop · 10 Compare & order · 11 Order message · 11b Message template · 12 Doctor mode · 13 Share · 14 Pharmacies/Settings · 14b Pharmacy form. | Confirmed |
| UI-4 | Home is action-first (NV-2). | Confirmed |
| UI-5 | Doctor Mode: person, current medicines with dose and schedule, latest history with reasons, **allergy block (red when present)**, share button, and a visible note "ไม่ใช่การวินิจฉัย". | Confirmed |
| UI-6 | Share: family link, picture summary, PDF, invite; privacy notice always visible. Per-field switches (medicine list, strength, schedule, dates/doses, stock, days left). | Confirmed |
| UI-7 | Settings: pharmacy list with phone + shipping lines, add/edit/delete; default lead/reminder days (one setting, L-11); backup/restore; delete all data. (Prototype shows add/edit, the stepper and สำรอง/นำเข้า buttons only.) | Confirmed |
| UI-8 | Brand graphics = the approved vector set in `docs/design/assets/` (icon, vertical/horizontal logo, splash illustration, woman illustration), kept as separate files so they can be swapped. Splash and Welcome use them (Welcome stays as it is, owner 2026-10-09); Login uses the woman illustration without background. | Confirmed |
| UI-9 | Text sizes in the prototype: body 17, secondary 16, chips 16, nav label 15, H1 22, display 30 (never below 15 for readable text). Primary button navy/white 52 px; touch targets ≥ 44–48 px; 8 px grid; 24 px side padding. | Confirmed |
| UI-10 | **Home banner, 3 states** (owner 2026-10-08). The Home welcome card shows one of three badge pictures instead of the house picture, and the 👋 emoji next to "สวัสดีค่ะ" is removed. `normal` (woman greeting with a medicine list): default, nothing urgent. `reminder` (refill reminder, bottle and calendar): a dose is coming up, or a medicine is near running out / time to order. `family` (family with organised medicines): there are other household members with open items. Pictures are made (vector, transparent) and kept in the owner's Claude Project source; they go to `assets/banner/` as `judya-banner-{normal,reminder,family}.svg` (+ PNG fallback). Display: ≈ 38% of card width, right, vertically centred, `contain` in a fixed-height box, never stretched, no extra background or shadow. Greeting, counts and the "ดูทันที" button stay text from code, not in the picture. Build rules and tests: `docs/prompts/home-banner.md`. Priority when several apply: `reminder` > `family` > `normal` (owner confirmed 2026-10-08). Dark theme: warn the owner first (pictures are light). The picture files are used as delivered (≈ 374 KB in total, family 223 KB); no size limit (owner 2026-10-09). Only `normal` is preloaded. Shown in the review prototype (2026-10-09) as a sky greeting card above the yellow banner: "สวัสดีค่ะ" + one short line + the picture; pictures: `docs/design/screens/06_home_banner_*.png`. State inputs: items near running out, doses still to take today, other members with open items. | Confirmed |

## UX
| ID | Requirement | Status |
|---|---|---|
| UX-1 | Installable to the Android home screen (PWA). | Confirmed |
| UX-2 | One-handed use; status never by colour alone (icon + text); disabled buttons say why (small hint under the button). | Confirmed |
| UX-3 | Every screen has loading, empty, error, validation-error, disabled, pressed, saved and copy-success states; plus confirmation dialogs, unavailable pharmacy, missing stock, missing address, no medicines, no members. | Confirmed |
| UX-4 | Do not redesign confirmed flows during a build pass; match the approved visuals first. | Confirmed |
| UX-5 | Typing in a field must not lose focus or caret when the screen refreshes (matters in the prototype; the real app should use controlled components). | Confirmed |
| UX-6 | Toasts for saved / copied / deleted actions; destructive actions need an inline or sheet confirmation. | Confirmed |

## Data & privacy
| ID | Requirement | Status |
|---|---|---|
| D-1 | Data is stored **on the device only**; no cloud sync (for now). | Confirmed |
| D-2 | Entities: see `docs/data-model.md` (Person, Allergy, Medication [brand entry: names, strength, form, packaging, prices], Assignment [stock, doses, schedule, cycle, lead days, expiry, active/stop], DoseChange [append-only: dose/stop, previous/new, reason, note, symptoms], Pharmacy, MessageTemplate, OrderDraft, Settings). | Confirmed |
| D-3 | **Backup / restore**: Settings can save all data to a file and load it back. Loading replaces current data only after a confirmation showing what will be replaced; the file is validated first. User can delete all data. | Confirmed |
| D-4 | Saved data is versioned (`version` inside the saved object). The new app uses its own key `judya.v1`, format `version: 1`. **No migration of the old app's data** (owner 2026-10-09, ADR-0007); the old key `medmate.v1` is never touched. | Confirmed |
| D-5 | No login in the prototype/test phase: the app opens straight to Home. Screens 03–05 stay as pictures for the real app. | Confirmed |
| D-6 | Health data is sensitive personal data (Thai PDPA): keep it on the device, no analytics/tracking, no third-party scripts that see the data, sharing only on explicit user action, privacy notice visible on Share. | Confirmed |

## Safety (medical)
| ID | Requirement | Status |
|---|---|---|
| SF-1 | The app shows only what the user entered; no medical advice or dosing guidance. (The fixed allergy "go to hospital" note AL-5 is the only emergency text.) | Confirmed |
| SF-2 | Do not promise reminders/alarms a web app cannot reliably deliver (take-pill reminders are for the sellable version; buy reminders now). | Confirmed |
| SF-3 | The app never changes a dose or schedule by itself, never recommends starting/stopping a medicine, never diagnoses. | Confirmed |
| SF-4 | High-risk edits (dose, schedule, stop) need a human confirmation and a **reason**. | Confirmed |
| SF-5 | Medication history is never hard-deleted. | Confirmed |

## Security & engineering (project instructions)
| ID | Requirement | Status |
|---|---|---|
| SEC-1 | Escape every user-entered string before rendering (no `innerHTML` with raw user text; React escaping or an `esc()` helper). No `eval`/`Function`, no inline event handlers from data. | Confirmed |
| SEC-2 | Validate everything read from storage or from an imported backup (type, range, enum, size) before use; reject or repair, never crash. Limits used by the prototype: stock ≤ 9999 (steps of ¼), pack size ≤ 1000, cycle ≤ 365 days, lead ≤ 90 days, free text ≤ 200 chars, names ≤ 40, phone `^[0-9][0-9\- ]{7,13}[0-9]$` or empty. | Confirmed |
| SEC-3 | Content-Security-Policy meta/headers; only same-origin scripts; fonts self-hosted or a single allowed font origin; no secrets in the repo. | Confirmed |
| SEC-4 | Profile pictures are downscaled before storing (≤ 256 px, JPEG) and stored in IndexedDB or as a small data URL; never uploaded. | Assumed |
| C-4 | Calculation code = small pure functions in their own module, separate from screens, with unit tests (start from `reference/calc.mjs`). Reuse components (Button, Chip, Card, Field, Select, Stepper, Sheet, Toast, Timeline, Switch). Do not rewrite what exists. | Confirmed |
| C-5 | Review-only features (feedback boxes, "ข้ามไปหน้าจอ" jump bar, demo data) are **not** part of the product. | Confirmed |

## Constraints
| ID | Requirement | Status |
|---|---|---|
| C-1 | Target: Android Chrome first. | Confirmed |
| C-2 | Readable for older users: large text, good contrast. | Confirmed |
| C-3 | Free hosting (GitHub Pages, private repo), no running costs. Live address (owner checked 2026-10-09): `https://chutimonsatidularn-stack.github.io/JudYa/`; the installed phone app opens. | Confirmed |

## Out of scope (parked)
| ID | Item | Status |
|---|---|---|
| OS-1 | Cloud login/accounts and sync, barcode scan, drug-interaction checks, push notifications, selling or ads. Real-app screens 03–05 exist as pictures only. | Confirmed |
| OS-2 | Step-down (tapering) dose tables. | Confirmed |
| OS-3 | Low-stock reminders for household medicines (HM-5); automatic LINE sending; automatic phone calls. | Confirmed |

## Prototype approval
| ID | Check | Status |
|---|---|---|
| AP-1 | Owner can do the top 3 jobs on their own phone without help: (1) see stock left and when to prepare an order; (2) one overview of everything to manage for the household; (3) pass medicine and dose info to others. | Open |
| AP-2 | Owner says in words "the prototype is approved". **Done 2026-10-09: the owner answered "เริ่มเลย" to "flow passed — start building the real app (v0.7)?"**; this approves prototype v0.7 (29 screens) as the base for the real app. The real build still follows ADR-0005 (data) and ADR-0006 (approach) once the owner OKs them. | Confirmed |
| AP-3 | Acceptance checks: `docs/acceptance-criteria.md`. | Confirmed |

## Open questions
| ID | Question | Status |
|---|---|---|
| Q-A | Should deleting an allergy leave a log entry (like dose history)? Prototype: no log. | Decided 2026-10-08: no log for now |
| Q-B | Edit-page details for "real app" members: add / edit / remove member **designed in the prototype 2026-10-09 (MB-5…MB-9)**, waiting for the owner's review. Still open: conditions and insurance fields. | Designed — review |
| Q-C | Which approach for the build? **Owner chose B, readable rebuild (Vite + React + TypeScript) on 2026-10-09** → ADR-0006 (waiting for the owner's OK). | Answered |
| Q-D | Phone-number login (OTP) provider for the sellable version — not for now. | Open |
| Q-E | Do the Welcome illustration, Home house banner and profile pictures also change to the JudYa style/palette? **Answer (owner 2026-10-08/09): yes for the Home banner (done, UI-10) and profile pictures (the 20-icon set, done in the prototype, MB-1). Welcome: no change, owner is satisfied.** | Answered |
| Q-F | Camera / file photo next to the 20-icon set? **Answer (owner 2026-10-09): no. This version uses only the 20 icons; the user picks one (MB-1).** | Answered |
