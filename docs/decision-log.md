# Design-review decision log (owner comments → what was decided)

Review method: the owner opened the flow artifact, marked each screen ผ่าน / ต้องแก้ with a comment, and Claude fixed and republished (rounds 1–7, 2026-10-08; versions 0.1 → 0.7). The owner passed the flow on 2026-10-08 ("ผ่าน").

| Round | Owner decided | Result |
|---|---|---|
| 1–2 | App is called JudYa; logo + splash are final (use the project's approved SVGs); review as a flow of realistic mockups with per-screen comment boxes and attach-image. | Flow page + clickable prototype; palette locked to the logo. Image attach was later removed (r6, did not work for the owner). |
| 3 | Larger readable text; home dashboard; notification, today, template editor, pharmacy-form screens. | Font scale 17/16/15; screens 06b, 06c, 11b, 14b added. |
| 4 | Pack size differs by brand → typed field, **no quick chips**; edit form follows the reference image of the old app (form dropdown → units follow, units changeable, pack unit + number must match); login woman without background; remove the "today" card from Home; reasons/units/UX clarity. | Edit form rebuilt; 08c schedule modes. |
| 5 | Edit page had too much per page → asked for a UX proposal. Bottom tab 2 "สั่งยา" → **"ยา"** (add medicines one by one, assign to a member); prices per unit per regular pharmacy (2–3) so the app picks the cheapest **including shipping** for a multi-medicine order. | 3-level edit split; 07c, 08d; price rows; comparison with free-shipping threshold; split hint. |
| 6 | Rename "ปรับขนาดยา" → **"ปรับโดส"**; dose change needs a reason + timeline history; stop needs a reason; allergy → warning in profile with symptoms; confirm sheet shows the reason; household common medicines; some members self-manage pills; profile picture on member page; remove the image-attach button. | 09 rebuilt, 09c, 09d, allergy block, "ยาสามัญประจำบ้าน", "จัดยาเอง", avatar. |
| 7 | Standalone allergy entry: **yes**; household medicines remind by **expiry** (not stock); **brand separate** entries + generic name + brand fields (pack size per brand); dose unit label follows form: **ตรง**; allergy needs **delete** button too (and edit). | 07d, expiry chips/notifications, generic + brand, allergy edit/delete. |

## Standing owner rules (project instructions, verbatim meaning)
1. Graphics from ChatGPT or images the owner sends: apply the project's "Master prompt vector logo", and check the result is **100 % like the original** before delivering; fix if not.
2. Tell the owner when **Claude Code** is needed.
3. If anything is unclear, **ask first; never guess**.
4. Code and architecture: security standards, reuse, don't rewrite what exists.

## Assumptions I made (owner may overturn)
Allergy delete leaves no log (Q-A) · allergy matches by generic name · household allergy check covers all members · low-stock reminders not wanted for household medicines · demo numbers in the prototype use an average per day (the real app must use day-by-day, DS-7) · ตัวอย่าง: คุณแม่ is set to "จัดยาเอง" in the demo data · phone button only shows a toast in the prototype.
