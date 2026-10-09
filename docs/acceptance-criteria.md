# JudYa — Acceptance criteria (v0.7)

Format: Given / When / Then. IDs link to requirements. "Test" = automated (unit/component) unless marked **Manual** (done on the owner's Android phone). Numbers use the demo data in `reference/calc.test.mjs`.

## Data safety (do first)
- **AC-D1 (D-4, ADR-0007)** Given a phone that still holds the old app's data under `medmate.v1`, when the new app runs, saves and is restored from a backup, then `medmate.v1` is byte-for-byte unchanged and the new app starts with its own empty data under `judya.v1`. (Test: `app/src/domain/__tests__/storage.test.ts`.)
- **AC-D2 (SEC-2)** Given a corrupt/oversized/foreign JSON backup, when imported, then the app refuses with a Thai message and keeps current data.
- **AC-D3 (D-3)** Backup file → restore on a clean browser reproduces identical data (round trip test); restore asks for confirmation first.

## Calculations (unit tests = `reference/calc.test.mjs` ported)
- **AC-C1 (DS-7)** 12 tablets, 1 per take-day, Mon/Wed/Fri → 26–30 days; 10 tablets every other day → 20; every-day numbers equal the old formula.
- **AC-C2 (DS-3/4/14)** Every-other-day never two take-days in a row across a 31-day month; day 31 skipped in 30-day months; Thursday 2026-10-08 is dow 4 in Asia/Bangkok at any device timezone.
- **AC-C3 (L-6)** Target 60, stock 12, pack 10 → 48 additional, 5 packs, 50 actual; unknown pack → 48, no rounding.
- **AC-C4 (PR-3…8)** Demo prices → สุขใจ ฿505, หมอยาเภสัช ฿456 recommended, ฿49 cheaper; ออนไลน์ "เทียบไม่ได้" (missing Losartan); unknown shipping → not ranked; free-over applies when subtotal ≥ threshold; price unit that matches neither base nor pack unit → "เทียบไม่ได้".
- **AC-C5 (HM-2)** Household medicine expiring in 23 days → soon; −1 day → expired; empty → unknown; none of them ever show days-remaining.
- **AC-C6 (DS-4/14)** Day-of-month 29–31 skips February (also in a leap year) and shows the note; a cycle crossing New Year keeps its spacing; calendar-day maths is right at midnight Asia/Bangkok on a device in another timezone.
- **AC-C7 (DS-9)** Home and medicine lists show "ทานวันนี้" / "พักวันนี้" with text and icon for non-daily medicines; every-day medicines show no chip.
- **AC-C8 (DS-6/10)** The schedule editor shows the Thai one-line summary and, for cycle kinds, the 7-day take/rest preview; changing the schedule shows old → new in a confirmation sheet with a tick box before saving.

## Members, household medicines, brands
- **AC-M1 (MB-2)** Turn on "จัดยาทานเอง" for คุณแม่ → Home/Members show "จัดยาเอง · เราดูแลสต๊อก"; ยาวันนี้ and the bell's "ต้องทานยา N คน" exclude her; her low stock still appears in ควรซื้อยา and in the order list.
- **AC-M2 (MB-1)** Avatar shows the initial; after choosing a photo it is stored downscaled (≤256 px) and shown on Home, Members, member page.
- **AC-H1 (HM-1/3)** Choosing "ยาสามัญประจำบ้าน": schedule card, ปรับโดส card, refill cycle and lead days disappear; expiry field appears; after save the medicine is listed under ยาบ้าน with an expiry chip.
- **AC-B1 (BR-1/2)** Two entries "Losartan" with brands Cozaar and X can coexist with different pack sizes/prices; the order message shows "Losartan (Cozaar) 50 mg".
- **AC-B2 (BR-4/6)** Choosing form ผงชง/ซอง sets units ซอง/กล่อง; changing the stock unit to one that matches neither base nor pack shows the warning and days = "ยังไม่ทราบ".
- **AC-N1 (NV-1)** Bottom nav = หน้าแรก · ยา · แชร์ · ตั้งค่า; "ยา" opens the all-medicine list with filter chips and the add button.

## Dose, history, stop, allergy
- **AC-A1 (DA-2/4)** On ปรับโดส the "ตรวจสอบก่อนบันทึก" button stays disabled until a dose changed **and** a reason is chosen; the confirm sheet shows old → new and the reason; save needs the tick.
- **AC-A2 (L-9/DA-5)** After saving, one new history entry exists (previous/new, reason, note, date); entries cannot be edited or deleted anywhere in the UI.
- **AC-A3 (DA-6/7)** Stop needs a reason; with "แพ้ยา" it also needs ≥1 symptom; after confirming, the medicine is in ยาที่หยุดแล้ว, excluded from today/low-stock/orders, history keeps a "หยุดใช้ยา" entry, and the member page shows a red allergy block with the symptoms.
- **AC-L1 (AL-3/4)** Add allergy for a drug never used (Aspirin, ผื่น/ลมพิษ + หายใจลำบาก) → red block + severe warning text; แก้ไข keeps the original date; ลบ asks "ลบรายการนี้ใช่ไหม?" and cancel keeps the record.
- **AC-L2 (AL-6)** Typing "penicillin v" as a new medicine for a member allergic to Penicillin shows the red warning, whatever the brand.
- **AC-A4 (DS-10)** Editing the schedule of an existing medicine also requires a reason (not for a brand-new medicine).

## Ordering
- **AC-O1 (PR-1)** Add 3 price rows for a medicine, delete one, change a unit; values persist after reload.
- **AC-O2 (L-8)** The order message lists the same items as the order screen; "คัดลอกข้อความ" puts it on the clipboard and shows a toast; nothing is sent automatically.
- **AC-O3 (PR-9)** Pharmacy without a phone → call button disabled with "ยังไม่มีเบอร์โทร".

## UX / quality
- **AC-U1 (UX-2/5)** Typing in any field keeps focus and caret; disabled buttons show a reason line; no text smaller than 15 px; all interactive elements ≥ 44 px; status not by colour alone.
- **AC-U2 (SEC-1)** A medicine name like `<img src=x onerror=alert(1)>` is shown as plain text everywhere (list, order message, history, doctor summary).
- **AC-U3 (UX-1/L-2)** Installs to the Android home screen; opens offline after first load; **Manual** on the owner's phone.
- **AC-U4 (SEC-3)** CSP present; no console errors on any of the 26 screens; Lighthouse accessibility ≥ 90.
- **AC-H1 (UI-10)** Home shows the `reminder` picture when something is near running out or a dose is still to take today, else `family` when other members have open items, else `normal`; the picture keeps its proportions and never covers the text at 360 / 390 / 430 px; no 👋 anywhere. Test: pure function `getHomeBannerState` (3 states, several at once, no data → `normal`) + screenshots.
- **AC-P1 (MB-1)** Every member picture (Home, Members, member page) is one of the 20 icons shown via `getAvatar`; an unknown or missing `avatarId` shows `profile-01` and nothing breaks; icons stay clear at 32 / 48 / 96 px; `python3 tools/check_profile_icons.py` passes; saved data is not cleared.
- **AC-P2 (MB-1)** On the member page "เปลี่ยนรูป" opens all 20 icons; the current one is marked (check + frame, not colour alone); choosing one and "ใช้รูปนี้" updates that member on Home, Members and the member page; going back without saving changes nothing; each icon button is ≥ 48 px.
- **AC-M3 (MB-5/6)** Add: the button is disabled until the name is filled and not a repeat; birth year outside 2400–2569 shows an error; after adding, the member shows on Home, Members, Today and the medicine filters with the chosen icon. Edit changes name / relationship / year / icon everywhere.
- **AC-M4 (MB-7/8/9)** Remove needs the tick; after it the member and their medicines are gone from Home, notifications, Today, medicine list, order and the banner counts; "สมาชิกที่นำออกแล้ว" lists them and "นำกลับ" restores them with the same medicines, history and allergies; with no member left the empty state shows.
