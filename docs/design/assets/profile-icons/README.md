# JudYa — Profile icons (20) v1.0

ไอคอนโปรไฟล์สมาชิกในบ้าน 20 รูป สร้างเป็นเวกเตอร์จากภาพต้นฉบับ (ChatGPT) ตาม Master prompt vector logo
สีใช้ตามต้นฉบับ เงา/แก้มไล่ระดับถูกทำเป็นสีเรียบ (flat)

## ไฟล์
- `svg/judya-profile-NN_full-color.svg` — ตัวหลัก (path ล้วน, พื้นโปร่งใสนอกวงกลม, artboard 1000×1000 เว้นขอบ 5%)
- `png/judya-profile-NN_full-color.png` — 512×512 RGBA สร้างจาก vector
- `profiles.json` — ดัชนี (id, ไฟล์, สีพื้นหลัง, alt) — ให้โค้ดอ่านจากไฟล์นี้ ห้าม hard-code รายชื่อไฟล์
- `qa/` — แผ่นตรวจเทียบต้นฉบับ + ตัวเลข QA ของแต่ละรูป

## วิธีใช้ในแอป
- แสดงด้วย `<img src=".../judya-profile-05_full-color.svg" alt="...">` เท่านั้น **ห้ามฝัง SVG แบบ inline / innerHTML**
  (id ภายในไฟล์ซ้ำกันข้ามรูป และการ inline เปิดช่องโจมตีถ้าวันหลังมี SVG จากผู้ใช้)
- เก็บในข้อมูลสมาชิกเพียง `avatarId` (เช่น `profile-05`) แล้ว lookup จาก `profiles.json` — ไม่เก็บ path เต็ม
- ถ้า `avatarId` ไม่พบ ให้ fallback เป็นรูป default ไม่ให้แอปพัง
- วงนอกเป็นวงรีเล็กน้อยตามต้นฉบับ ใช้ `border-radius:50%` + `object-fit:cover` ได้ตามต้องการ
- ถ้าใช้ service worker ให้เพิ่มไฟล์เหล่านี้ใน cache list และ bump เวอร์ชัน cache (ห้ามแตะ `localStorage`)

## ตรวจความถูกต้อง
`python3 tools/check_profile_icons.py` — เช็คว่าเป็น path ล้วน ไม่มี script/style/stroke/filter/gradient/href และไฟล์ครบตาม `profiles.json`

## ข้อจำกัดที่รู้
- เงา/แก้มไล่ระดับเป็นสีเรียบ; สีตา คิ้ว แว่นทำให้เรียบ
- ไอคอน 3 ติ่งหูมีรอยสีเป็นหย่อม; ไอคอน 4 มีจุดเล็กๆ ขอบคอไม่เรียบ; ไอคอน 18 แก้มซ้ายเห็นเป็นวงจางๆ ข้างเดียว; ไอคอน 20 กรอบแว่นและลายเสื้อขอบไม่เรียบเท่าต้นฉบับ
- ยังไม่ได้ทดสอบเปิดใน Illustrator/Canva/เครื่องพิมพ์; RGB อย่างเดียว
