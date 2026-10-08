# JudYa — Screen spec (v0.7, 26 screens)

Pictures: `docs/design/screens/NN_<no>_<id>.png` (390×~845 phone frame). Clickable prototype: `prototype/judya-flow-v0.7.html` (open → tap a thumbnail). Pixel details come from the pictures + `design-system.md`; this file defines **content, rules, actions, states**. Thai strings in the pictures are the copy to use. Req IDs in brackets.

Common: status bar area is a mock (do not build). Header = back arrow (when not a root tab) · title (22, with optional 16 subtitle) · max one pill button on the right. Root tabs show the bottom nav (หน้าแรก · ยา · แชร์ · ตั้งค่า) [NV-1]. Primary button 52 px navy at the bottom, above the nav. Disabled primary buttons show a one-line hint beneath saying why.

## Start (pictures only for the real app: 03–05)
| No | Screen | Content / rules |
|---|---|---|
| 01 | Splash | Logo + splash illustration (approved SVG, no leaf version in-app). Goes to Welcome. |
| 02 | Welcome | Headline "ดูแลยาของคนที่คุณรัก ได้ในที่เดียว"; 3 benefits (เช็คสต๊อกยา · เตือนซื้อยา · ส่งต่อข้อมูลยา); buttons เริ่มใช้งาน (prototype → Home, D-5) / ฉันมีบัญชีแล้ว. |
| 03 | Login | Phone number + OTP text; woman illustration without background; "สร้างบัญชีใหม่". Picture only. |
| 04 | Register | Name, phone, household name, consent tick, "ขอรหัส OTP". Picture only. |
| 05 | OTP | 6 boxes, resend countdown, ยืนยัน. Picture only. |

## Home & daily
| No | Screen | Content / rules / actions |
|---|---|---|
| 06 | Home | Header บ้านของเรา + date + bell with count [NV-3]. Yellow banner "ยาใกล้หมด N รายการ" (first item named) → 10. Member cards (avatar, name, chips: ทานวันนี้ N / พักวันนี้ / **จัดยาเอง** · ต้องซื้อ N / สต๊อกพอ) → 07b. Button "เตรียมสั่งยา" → 10. Empty states: no members, no medicines, nothing low (banner hidden). No "today" summary card [NV-2]. |
| 06b | Notifications | Groups: วันนี้ (who takes pills → 06c) · ควรซื้อยา (each low medicine → 10) · **ใกล้หมดอายุ** (household medicines ≤30 days → 08) · ตั้งค่าการเตือน (→ 14). |
| 06c | Today | Filter chips ทุกคน/members; progress card "จัดแล้ว X จาก Y"; groups เช้า/กลางวัน/เย็น/ก่อนนอน with tick rows (medicine, person, dose+unit); "พักวันนี้" note; **"ไม่รวม <คน> เพราะจัดยาเอง"** [NV-4, MB-2]. Ticks are per day (not persisted across days). |

## Members & medicines
| No | Screen | Content / rules / actions |
|---|---|---|
| 07 | Members | One card per member: avatar, name, "ยา N รายการ", "ตัวที่น้อยสุดพอทาน N วัน", chip (ต้องจัดยาวันนี้ N ตัว / วันนี้ไม่ต้องจัดยา / **จัดยาเอง · เราดูแลสต๊อก**), status chip. Pill "เพิ่มสมาชิก" (real app). Note about self-managed. |
| 07b | Member page | See MB-3: profile card (large avatar, name, chip เราจัดยาให้/จัดยาเอง, pill "รูป") · switch "<คน>จัดยาทานเอง" · allergy block (red when records; else note + "เพิ่มแพ้ยา") with แก้ไข/ลบ per record (inline delete confirm) [AL-2,AL-4] · tiles: จัดยาวันนี้ (or จัดยาเอง) / สั่งยา / แชร์ให้แพทย์ / สรุปพบแพทย์ · medicine cards · "ยาที่หยุดแล้ว" (name, date, reason). Header pill "เพิ่มยา" (owner preset). |
| 07c | Medicines (tab 2) | Filter chips ทุกคน · พ่อ · แม่ · ฉัน · **ยาบ้าน**; banner "ยาใกล้หมด N รายการ → เทียบราคาร้านยาก่อนสั่ง"; sections per owner; medicine card: generic + strength, **brand line**, status chip (ใกล้หมด/พอใช้/ยังไม่ทราบ, or expiry chip for household), schedule summary, progress bar (not for household), "เหลือ X · พอทานอีก N วัน". Tap → 08. Pill "เพิ่มยา". |
| 07d | Allergy form | Title บันทึกแพ้ยา / แก้ไขแพ้ยา; fields: drug name (required), symptom chips (≥1, multi), severe warning when severe chosen, optional detail; info note; save disabled with hint until valid [AL-1…AL-5]. Saves to the member shown in the header; edit keeps the original date. |

## Edit medicine (3 levels) [BR-7]
| No | Screen | Content / rules |
|---|---|---|
| 08 | Edit / Add medicine | Fields in order: ตัวยาสามัญ (required) · ยี่ห้อ (optional, hint about separate entries) · ความแรง · ยานี้ของใคร (chips: members + **ยาสามัญประจำบ้าน**; household hint) · allergy warning (red, when generic matches) [AL-6] · รูปแบบยา (select) · จำนวนที่เหลือ (number + unit select, grouped "ตรงกับขนาดบรรจุ" / "หน่วยอื่น") + helper · equivalence note ("เท่ากับ 0.3 ขวด") or unit-mismatch warning [BR-6] · **expiry date (household only)** · card → 08d (summary: "1 ขวด = 60 เม็ด · เติมทุก 30 วัน · ราคา 2 ร้าน") · card → 08c (schedule summary; hidden for household) · card → 09 "ปรับโดส" (hidden for household and for a medicine being added). Header pill "บันทึก"; validation: name required (toast). UX why split: one topic per screen; the daily-edited fields are first, set-once settings are one tap away with a summary; see r5. |
| 08d | Pack & buying | Pack: "1 [unit] มี [typed number] [base unit]" (number optional) · equivalence note · refill cycle chips 30/60/90/กำหนดเอง (+ number) · lead days · **price rows** (pharmacy select · price · unit select (base or pack unit) · delete) + "เพิ่มราคาจากร้านอื่น" (disabled when every pharmacy used) · note that saving happens on 08. Household: cycle and lead hidden. Header pill "เสร็จ" → 08. |
| 08c | Schedule | Mode chips (ทุกวัน · เลือกวัน · วันเว้นวัน · ทุกกี่วัน · วันที่ของเดือน) with the panel per mode (weekday circles; 7-day strip; N stepper; 31-day grid with "เดือนที่ไม่มีวันนั้นจะข้าม") · Thai summary · step chips (1 / ½ / ¼ + unit) · four dose steppers (−/+; 0..9) · **reason box when editing an existing medicine** · footer: new medicine → "เสร็จ กลับไปหน้าเพิ่มยา"; existing → "ตรวจสอบก่อนบันทึก" disabled until changed + reason, hint text. |

## Dose changes [DA-*]
| No | Screen | Content / rules |
|---|---|---|
| 09 | Adjust dose | As DA-2 (current dose card, new dose rows with "เปลี่ยน" chip, changes summary, reason select (required) + note, "ตรวจสอบก่อนบันทึก", red "หยุดใช้ยา", header pill ประวัติ). |
| 09b | Confirm | Bottom sheet over 09: "ยืนยันการเปลี่ยนตาราง", medicine + owner, เดิม → ใหม่ blocks, **เหตุผล** block (red text if missing), tick "ฉันตรวจสอบตารางนี้แล้ว", "บันทึกตารางใหม่" (needs tick + reason), "กลับไปแก้". Save → appends DoseChange, updates assignment, back to 08, toast. |
| 09c | History | Timeline (dot + line; red dot for stop); entry = date · kind, change text, symptoms, reason chip, note. Empty state text. Footer "เพิ่มได้อย่างเดียว". |
| 09d | Stop medicine | Info note; reason select (required); if แพ้ยา → symptom chips (≥1) + severe note + note about warning in profile/summary; detail textarea; tick "ฉันยืนยันว่าจะหยุดใช้ยาตัวนี้"; button "ยืนยันหยุดใช้ยา" (hint explains what is missing). Save → DoseChange(kind stop) + (allergy record if แพ้ยา) + assignment inactive → member page + toast "…ย้ายไปยาที่หยุดแล้ว และขึ้นเตือนแพ้ยาในโปรไฟล์". |

## Order & share
| No | Screen | Content / rules |
|---|---|---|
| 10 | Compare & order | Header "สั่งยา", sub "ควรสั่ง N รายการ · <คน>", pill "ดูทั้งหมด" when filtered. Item card (tick, generic + strength, brand · person · "สั่ง 30 เม็ด (3 แผง)", days chip). Recommendation card (green) or the "ยังเทียบร้านไม่ได้" note (PR-5). Optional split hint. Pharmacy cards (radio; name, "ค่ายา + ส่ง", phone or "ยังไม่มีเบอร์โทร", total or "เทียบไม่ได้" + what is missing; "ถูกที่สุด" chip). Footer: "สร้างข้อความสั่งยา" → 11; "โทรสั่งที่ <ร้าน>" (disabled w/o phone). [PR-*] |
| 11 | Order message | Template chips; filled message preview; note "แอปไม่ส่งข้อความให้เอง"; button "คัดลอกข้อความ" (clipboard + toast; fallback text if blocked) and a secondary "ฉันจะเปิด LINE เอง" (the user opens LINE by hand — no deep link promised); pill "แก้แบบฟอร์ม" → 11b. |
| 11b | Template editor | Template chips + "ใหม่"; name; body textarea; placeholder chips insert at end; live preview; save. |
| 12 | Doctor mode | Person; "ไม่ใช่การวินิจฉัย" note; medicine cards (generic strength + schedule + dose); latest ≤3 history entries with reasons; allergy block (red) or "ยังไม่มีบันทึกแพ้ยา"; button แชร์สรุปนี้. |
| 13 | Share | Privacy header; person chips; per-field switches; "สรุปสำหรับพบแพทย์" link; copy summary text; (real app: link/PDF/picture/invite). |
| 14 | Settings & pharmacies | Pharmacy list (name, note, phone, shipping line incl. free-over) with edit, header pill "เพิ่มร้าน"; "สั่งล่วงหน้าตั้งต้น" stepper (default 7 days; the notification list repeats it as "เตือนซื้อเมื่อเหลือไม่เกิน 7 วัน" — one setting, L-11); "ข้อมูลของฉัน" with buttons สำรอง / นำเข้า (toast only in the prototype) [D-3]; footer "ข้อมูลเก็บในเครื่องนี้เท่านั้น". |
| 14b | Pharmacy form | name (required), note, phone (validated live), shipping fee (0 = pickup; empty = unknown, explained), free-over amount; save disabled until valid. |

## What the review prototype does NOT show (design later / real-app work)
Add/edit/remove member and member details; real photo picker; real backup/restore (file save, validation, replace confirmation); delete-all-data button + confirmation; pharmacy delete; empty/error/loading states for every screen (UX-3); pharmacy delete confirmation; real LINE/phone intents; PWA install prompt, offline page, app icon set; accessibility pass (focus order, labels, contrast check).
