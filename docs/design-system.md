# JudYa design system (v0.7)

Tokens: `docs/design/design-tokens.json` (single source). Pictures: `docs/design/screens/`. Brand SVGs: `docs/design/assets/` (approved; do not redraw; swap files, not screens). **Palette rule:** only the logo palette (navy #0B3A6B, blue #1976F3, green #13C596, yellow #FFC629, sky #E6F4FF, pale #F5FAFF) plus the derived mint/cream/ink/danger tones in the tokens.

## Principles
- Calm, clinical-friendly, readable for older users: body 17 px, nothing below 15 px, primary button 52 px, touch targets ≥ 44 px, 8 px grid, 24 px side padding.
- **Never colour alone**: every status has an icon and a word (ใกล้หมด ⚠, พอใช้ ✓, ยังไม่ทราบ ⓘ, จัดยาเอง ⓘ, ทานวันนี้ 💊 / พักวันนี้ ☾).
- **Missing data is shown as missing** ("ยังไม่ระบุ", "เทียบไม่ได้"), never a made-up number.
- Disabled primary buttons explain why in one small line under the button.
- Destructive or high-risk actions: red-outline button + inline/sheet confirmation + reason (stop medicine, dose change, delete allergy).
- One topic per screen; summaries on cards tell the current value before opening (the 08 edit pattern).

## Components to build once and reuse (C-4)
`AppShell` (header with back + title + ≤1 pill, bottom nav 4 items) · `Button` (primary / secondary / danger / pill) · `Card` (+ tappable card with disc icon, text, chevron) · `Chip` (low / ok / rest / info) · `Field` (label + input + hint) · `Select` (custom caret, optgroups) · `NumberInput` with unit select · `Stepper` (− value +) · `ChipGroup` (single / multi, with ✓ on selected) · `Switch` (role=switch, 52×30) · `Banner` (yellow) · `SummaryCard` (mint) · `Note` (info / caution / danger) · `Timeline` · `Avatar` (initials, sizes, colour per person; photo when set) · `Sheet` (bottom, 24 px top radius) · `Toast` · `ProgressBar` · `DateInput` · `AllergyBlock`.

## Patterns
- Header: back arrow + 22 px title + optional 16 px subtitle + one right pill (e.g. "เพิ่มยา", "บันทึก", "ประวัติ").
- Member card on Home/Members: avatar (56), name 20, chips row.
- Medicine card: generic + strength, brand line (muted), chip at right, schedule summary, bar, stock line.
- Allergy: red block with ⚠ title, per-record drug (bold) + symptoms + date + [แก้ไข][ลบ]; delete confirms inline in the same block.
- Reason box (required select + optional textarea) is shared by 08c and 09; shown read-only on 09b.

## Colour usage rules (v1.2, carried over from the earlier design system)
- Primary buttons stay navy fill + white text. Never a blue button with small white text (4.26:1).
- Blue is not used for small body text on white; use it for the focus ring, icons, borders, large or bold text.
- Green is for fills and large marks only. A small green icon on a light fill is drawn in `success-ink` (#14744C); a check on a green disc is navy. Text is never green.
- Yellow is a fill with navy text or mark.
- Text on tinted backgrounds uses navy or the ink colours: `danger-ink #B91C1C`, `warning-ink #8A6A00`, `success-ink #14744C`. Red `#EF4444` is for icons and large marks only (small red text on white or pink fails AA).
- Contrast checked 2026-10-08: all text pairs used pass 4.5:1. Known failures kept visible: card/field outline `#D5E3F0` on white is 1.31:1 (decorative), and the green progress bar on white is 2.22:1 (status text sits beside it).
- Not yet restyled to the JudYa palette: house banner on Home, Welcome illustration, profile pictures (see Q-E).

## Schedule components (added 2026-10-07)
- **Schedule kind chips** (row of 5): ทุกวัน · เลือกวัน · วันเว้นวัน · ทุกกี่วัน · วันที่ของเดือน. 48 px high, round. Selected = navy fill + white check + white text.
- **Weekday picker**: 7 round buttons อา จ อ พ พฤ ศ ส (Sunday first); selected = navy fill, white text. Touch area is the whole cell.
- **Cycle editor** (every other day / every N days): stepper "ทุก [−] N วัน [+]", a "เริ่มนับวันที่" date row, and a 7-day strip: take = navy block "ทาน", rest = dashed outline "พัก".
- **Month-day grid**: 7 columns × up to 5 rows of ≥ 44 px cells, selected = navy; beige note says months without that date are skipped.
- **Summary card** (sky): bold Thai sentence ("ทุก จ. พ. ศ. · 3 วันต่อสัปดาห์") + muted next dates.
- **Today chip**: "ทานวันนี้" = mint pill + green check icon; "พักวันนี้" = beige pill with border + moon icon; navy semibold text. Shown only for not-every-day medicines.
- **Schedule tag** (Doctor Mode): sky pill with calendar icon and the schedule; every-day shows plain muted "ทุกวัน".
- **Change card** (warning bg): alert icon + "สิ่งที่จะเปลี่ยน (ต้องยืนยันก่อนบันทึก)" + old → new line.
- **Confirmation sheet** (bottom sheet over a dimmed screen): old card, arrow-down, new card (sky with navy outline), beige notice, tick row "ฉันตรวจสอบตารางนี้แล้ว", primary "ยืนยันและบันทึก", secondary "กลับไปแก้ไข".
- **History timeline** (Doctor Mode): date on the left, navy dot on a 2 px line, medicine name and the change below.

## Review-only chrome (do not ship)
The flow page, per-screen comment boxes, the jump bar and phone frame belong to the review artifact only (C-5).
