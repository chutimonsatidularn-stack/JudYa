# MedMate design system v1.1

The source of truth for how MedMate looks. Machine-readable values: `docs/design/design-tokens.json`. Pictures of every screen: `docs/design/screens/` (index and how to regenerate: `docs/design/README.md`). The SVG screens are **visual references**, not production components: the real UI must copy their hierarchy, spacing, colour, type and content with real HTML/CSS.

## Brand
- Name **MedMate** · Thai line **จัดการยาในบ้านได้ง่ายๆ** · positioning: family medication management assistant.
- Principle: **ไม่ต้องจำ ไม่ต้องคำนวณ ไม่ต้องพิมพ์ใหม่**.
- Direction (from the JotWai reference): premium, clean mobile UI; white and light surfaces; navy brand colour; green/mint as the second colour; yellow as the attention accent; beige and sky-blue supporting surfaces; rounded cards; clean-line icons; Noto Sans Thai; restrained decoration.
- Not allowed: a green-only "health" look. Illustration: the approved ChatGPT-derived vector set (woman with phone on Splash, phone checklist on Welcome, house banner on Home, profile icons) is part of the brand; use it as is, do not redraw (owner 2026-10-07). It lives in `docs/design/assets/` and may be replaced later.
- Logo: the approved vector logo (blue/navy two-tone capsule + MedMate wordmark + yellow leaf), file in `docs/design/assets/`. `medmate_logo.svg` (simple capsule) is the earlier package logo and is not used.

## Colour (locked palette)
| Token | Hex | Use |
|---|---|---|
| navy | `#1F3A56` | brand, navigation, primary button, headings |
| green | `#22A06B` | success / enough stock, check icons |
| mint | `#DDF3E6` | success surface, "ทานวันนี้" chip |
| yellow | `#FACC15` | attention / close to reorder (icon disc) |
| beige | `#F8F4EB` | notes, "พักวันนี้" chip, soft surfaces |
| sky | `#EAF4FF` | selected / info surface, icon discs, steppers |
| white | `#FFFFFF` | cards and fields |
| background | `#F7FAFC` | page |
| text | `#0F172A` | body text |
| muted | `#64748B` | secondary text |
| border | `#E2E8F0` | 1 px outlines |
| danger / danger bg | `#EF4444` / `#FEECEC` | **only** out of stock, allergy, errors |
| warning bg | `#FFF7D6` | attention banners and "what will change" cards |
| success bg | `#EAF8F0` | success banners |

The running prototype also defines readable "ink" colours for text on tinted backgrounds: `--danger-ink #B91C1C`, `--warning-ink #8A6A00`, `--success-ink #14744C`. Use navy or these inks for text on mint/yellow/red tints; red `#EF4444` is for icons and large marks (small red text on white or pink fails the AA contrast target).

Meaning: navy = brand/primary action · green = fine · **yellow = approaching reorder** · red = out of stock/critical only · mint/sky/beige = surfaces.
**Never show a medicine state by colour alone**: always add text and/or an icon.

## Type
Noto Sans Thai (fallback Noto Sans), weights 400/500/600/700. Sizes: display 28 · H1 24 · H2 20 · H3 17 · body 16 · label 14 · caption 12 · micro 11. On the 390 px mock-ups card titles are 14–16, secondary lines 12, and nothing is below 11. Thai body text that people must read should be ≥ 16 px in the real app where space allows.

## Geometry
- Reference frame 390 × 844; 8 px grid; page side padding 24 px.
- Card radius 16 (list rows 12–14); control radius 12; chips and pills fully round.
- Primary button 52 px high, secondary 48 px. Minimum touch target **48 × 48 px**; where the drawing is smaller (7 weekday circles, 7-column date grid) the touch area is the whole cell (≈ 49 px wide) so neighbours do not overlap.
- Shadow: none or very subtle; use space rather than heavy borders.
- Screens longer than 844 px scroll; the main button of a form sits at the end of the form (in the real app it may be pinned above the bottom bar).

## Icons
One clean-line family: 24 px box, **2 px stroke, round caps and joins**, navy (or muted when inactive). The set used in the screens: back, chevron, menu, user, home, bag (order), share, sliders (settings), pill, check, moon (rest day), alert, calendar, plus, minus, arrow-down, arrow-right, file. Draw them as SVG components. **No emoji and no text glyphs (✉ ☑ ⌂ …) as production icons.**

## Navigation
Bottom bar (4): หน้าแรก · สั่งยา · แชร์ · ตั้งค่า. Selected item = sky pill with navy icon and label; others muted. Secondary screens use a back arrow at the top left and at most one pill button at the top right (44 px high).

## Components added for the dose schedule (2026-10-07)
- **Schedule kind chips** (row of 5): ทุกวัน · เลือกวัน · วันเว้นวัน · ทุกกี่วัน · วันที่ของเดือน. 48 px high, round. Selected = navy fill + white check + white text; others white with border.
- **Weekday picker**: 7 round buttons อา จ อ พ พฤ ศ ส (Sunday first); selected = navy fill/white text.
- **Cycle editor** (every other day / every N days): optional stepper "ทุก [−] N วัน [+]", a "เริ่มนับวันที่" date row, and a 7-day strip: take = navy block "ทาน", rest = dashed outline "พัก".
- **Month-day grid**: 7 columns × up to 5 rows of 44 px cells, selected = navy; beige note: months without that date are skipped.
- **Summary card** (sky): bold Thai sentence ("ทุก จ. พ. ศ. · 3 วันต่อสัปดาห์") + muted next dates.
- **Stepper**: 48 × 48 sky square with a minus or plus icon; value 17 px bold between; dose rows are 56 px high.
- **Today chip**: "ทานวันนี้" = mint pill + green check icon; "พักวันนี้" = beige pill with border + moon icon; text navy 12 px semibold. Shown only for not-every-day medicines.
- **Schedule tag** (Doctor Mode): sky pill with calendar icon and the schedule ("จ. พ. ศ.", "วันเว้นวัน"); every-day shows plain muted "ทุกวัน".
- **Change card** (warning bg): alert icon + "สิ่งที่จะเปลี่ยน (ต้องยืนยันก่อนบันทึก)" + old → new line.
- **Confirmation sheet** (bottom sheet over a dimmed screen): old card, arrow-down, new card (sky with navy outline), beige notice, tick row "ฉันตรวจสอบตารางนี้แล้ว", primary "ยืนยันและบันทึก", secondary "กลับไปแก้ไข".
- **History timeline** (Doctor Mode): date on the left, navy dot on a 2 px line, medicine name and the change below.

## Accessibility
- Thai body text ≥ 16 px where readability needs it; touch targets ≥ 48 px; visible focus ring; WCAG AA contrast target; status always has text; icon-only buttons have an accessible name (e.g. "ย้อนกลับ", "เพิ่ม", "ลด").
- Critical medication information (dose, schedule, allergy) must stay legible at normal phone size.

## Known gaps
All 17 screens now follow this system (2026-10-07). Open: the logo mark is drawn exactly as in `medmate_logo.svg`, which sits about 6% off-centre in its tile (SG-2); the Google/Apple buttons use a plain "G" badge and a simple apple shape, not official brand artwork; Noto Sans Thai was not installed in the drawing tool, so the PNG previews use a fallback font (the SVG files name Noto Sans Thai).
