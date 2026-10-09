# Claude Code prompt — ใช้ไอคอนโปรไฟล์ 20 รูป (JudYa)

อ่านก่อน: `docs/design/assets/profile-icons/README.md` และ `profiles.json`

## ทำ
1. ก่อนแก้ไฟล์ ให้หาในโค้ดว่าตอนนี้โปรไฟล์สมาชิกแสดงรูป/ตัวอักษรย่ออย่างไร (ระบุไฟล์+บรรทัด) แล้วสรุปให้เจ้าของดูสั้นๆ
2. ทำ helper เดียว (reuse) เช่น `getAvatar(avatarId)` ที่อ่าน `profiles.json` คืน `{src, alt, background}` และมี fallback เมื่อไม่พบ — ทุกหน้าที่แสดงรูปโปรไฟล์ต้องเรียกผ่าน helper นี้ ห้ามเขียน path ซ้ำ
3. เพิ่มตัวเลือกเลือกรูปโปรไฟล์ (ตาราง 20 รูป) ในหน้าเพิ่ม/แก้ไขสมาชิก — ออกแบบหน้านี้ยังไม่ได้อนุมัติ: ร่างแล้ว **หยุดรอเจ้าของดู** ก่อนทำต่อ
4. เก็บใน state แค่ `avatarId` (ข้อมูลเดิมที่ไม่มี avatarId ต้องไม่พัง, ห้ามล้าง/เขียนทับ `localStorage` key `medmate.v1`)
5. แสดงด้วย `<img>` เท่านั้น ห้าม inline SVG/innerHTML; ตั้ง alt จาก `profiles.json`
6. รัน `python3 tools/check_profile_icons.py` ให้ผ่าน; ถ้ามี service worker bump cache version
7. ทดสอบ: รูปครบ 20, เลือกแล้วบันทึกแล้วโหลดใหม่ยังอยู่, avatarId ผิด → fallback, ขนาด 32/48/96 px ดูชัด
8. commit แยก 1 commit ต่อ 1 เรื่อง บน branch + PR ห้าม push main

## ห้าม
- ห้ามแก้ไฟล์ SVG/PNG ของไอคอน (ถ้าเห็นว่าผิด ให้แจ้งเจ้าของ)
- ห้ามเดา — ไม่แน่ใจอะไรให้ถามเจ้าของก่อน
