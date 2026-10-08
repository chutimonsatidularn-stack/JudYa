# JudYa — Acceptance criteria (v0.7)

Format: Given / When / Then. IDs link to requirements. "Test" = automated (unit/component) unless marked **Manual** (done on the owner's Android phone). Numbers use the demo data in `reference/calc.test.mjs`.

## Data safety (do first)
- **AC-D1 (D-4)** Given a phone/browser holding v2 data, when the new build loads, then all medicines, people, doses, schedules, history, pharmacies and templates are present and unchanged in meaning; a copy of the old data exists under the backup key; running the upgrade twice changes nothing. Test with an anonymised fixture + **Manual** with the owner's real backup file.
- **AC-D2 (SEC-2)** Given a corrupt/oversized/foreign JSON backup, when imported, then the app refuses with a Thai message and keeps current data.
- **AC-D3 (D-3)** Backup file → restore on a clean browser reproduces identical data (round trip test); restore asks for confirmation first.

## Calculations (unit tests = `reference/calc.test.mjs` ported)
- **AC-C1 (DS-7)** 12 tablets, 1 per take-day, Mon/Wed/Fri → 26–30 days; 10 tablets every other day → 20; every-day numbers equal the old formula.
- **AC-C2 (DS-3/4/14)** Every-other-day never two take-days in a row across a 31-day month; day 31 skipped in 30-day months; Thursday 2026-10-08 is dow 4 in Asia/Bangkok at any device timezone.
- **AC-C3 (L-6)** Target 60, stock 12, pack 10 → 48 additional, 5 packs, 50 actual; unknown pack → 48, no rounding.
- **AC-C4 (PR-3…8)** Demo prices → สุขใจ ฿505, หมอยาเภสัช ฿456 recommended, ฿49 cheaper; ออนไลน์ "เทียบไม่ได้" (missing Losartan); unknown shipping → not ranked; free-over applies when subtotal ≥ threshold; price unit that matches neither base nor pack unit → "เทียบไม่ได้".
- **AC-C5 (HM-2)** Household medicine expiring in 23 days → soon; −1 day → expired; empty → unknown; none of them ever show days-remaining.

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
