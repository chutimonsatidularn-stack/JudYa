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

## Review-only chrome (do not ship)
The flow page, per-screen comment boxes, the jump bar and phone frame belong to the review artifact only (C-5).
