#!/usr/bin/env python3
"""MedMate design screens (SVG, 390 px reference width) -- generator.

Why this exists: the SVG screens are the visual reference for the app. Editing
one generator is faster and safer than redrawing 20 files by hand.

Draws all 17 screens in one visual language (line icons, 48 px targets, text >= 11 px).
The logo on 01-05 is the exact drawing from medmate_logo.svg, scaled (logo_mark).

Rules baked in (see docs/design-system.md):
  * palette only from design-tokens.json; navy is the main colour
  * Noto Sans Thai; secondary text >= 11 px
  * clean-line icons, 2 px stroke, round caps; no emoji, no text glyph icons
  * buttons 52 px (primary) / 48 px; controls are >= 44 px visual, and the
    touch area is >= 48 px (cells are spaced so hit areas do not overlap)
  * state is never colour only: every status has text and/or an icon

Sample data (all invented, same persona on every screen):
  today = Wed 7 Oct 2569. Dad's medicines: Losartan 50 (daily), Amlodipine 5
  (daily), Metformin 500 (morning+evening), Atorvastatin 20 (bedtime),
  Vitamin D 1000 IU (Mon/Wed/Fri, 4 tablets left -> lasts until 16 Oct = 9 days),
  Calcium 600 mg (every other day from 6 Oct, 3 tablets left -> 14 Oct = 7 days).

Run:  python3 gen_screens.py <out_dir>
"""
import os
import sys

NAVY, GREEN, MINT, YELLOW = "#1F3A56", "#22A06B", "#DDF3E6", "#FACC15"
BEIGE, SKY, BG, TEXT = "#F8F4EB", "#EAF4FF", "#F7FAFC", "#0F172A"
MUTED, BORDER, WHITE = "#64748B", "#E2E8F0", "#FFFFFF"
DANGER, DANGER_BG, WARN_BG = "#EF4444", "#FEECEC", "#FFF7D6"

STYLE = ("@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:"
         "wght@400;500;600;700&amp;display=swap');\n"
         ".t{font-family:Noto Sans Thai,Noto Sans,sans-serif}")


def f(v):
    return ("%.2f" % v).rstrip("0").rstrip(".")


def head(h, title):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="390" height="%d" viewBox="0 0 390 %d">\n'
            '<defs><style>%s</style></defs>\n<title>%s</title>'
            '<rect width="390" height="%d" fill="%s"/>' % (h, h, STYLE, title, h, BG))


def T(x, y, s, size, weight, fill, anchor="start"):
    return ('<text x="%s" y="%s" class="t" font-size="%s" font-weight="%s" fill="%s" '
            'text-anchor="%s">%s</text>' % (f(x), f(y), size, weight, fill, anchor, s))


def R(x, y, w, h, rx, fill, stroke=None, dash=None, sw=1):
    s = '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"' % (f(x), f(y), f(w), f(h), rx, fill)
    if stroke:
        s += ' stroke="%s" stroke-width="%s"' % (stroke, sw)
    if dash:
        s += ' stroke-dasharray="%s"' % dash
    return s + "/>"


def C(cx, cy, r, fill, stroke=None):
    s = '<circle cx="%s" cy="%s" r="%s" fill="%s"' % (f(cx), f(cy), r, fill)
    if stroke:
        s += ' stroke="%s" stroke-width="1"' % stroke
    return s + "/>"


# ------------------------------------------------------------------ icons
# 24 x 24 box, drawn with a 2 px stroke, round caps and joins (design system).
ICONS = {
    "back": ['<path d="M15 18l-6-6 6-6"/>'],
    "chev": ['<path d="M9 18l6-6-6-6"/>'],
    "menu": ['<path d="M4 6h16M4 12h16M4 18h16"/>'],
    "user": ['<circle cx="12" cy="8" r="4"/>', '<path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'],
    "home": ['<path d="M3 11l9-8 9 8"/>', '<path d="M5 10v10h14V10"/>', '<path d="M10 20v-6h4v6"/>'],
    "bag": ['<path d="M6 7h12l1 13H5L6 7z"/>', '<path d="M9 7a3 3 0 0 1 6 0"/>'],
    "share": ['<circle cx="18" cy="5" r="2.5"/>', '<circle cx="6" cy="12" r="2.5"/>',
              '<circle cx="18" cy="19" r="2.5"/>', '<path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/>'],
    "sliders": ['<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/>', '<circle cx="14" cy="7" r="2"/>',
                '<circle cx="10" cy="17" r="2"/>'],
    "pill": ['<g transform="rotate(-45 12 12)"><rect x="8.5" y="2.5" width="7" height="19" rx="3.5"/>'
             '<path d="M8.5 12h7v6a3.5 3.5 0 0 1-7 0z" fill="currentColor"/></g>'],
    "check": ['<path d="M5 12.5l4.5 4.5L19 7.5"/>'],
    "moon": ['<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>'],
    "alert": ['<path d="M12 3.5l9.5 16.5h-19L12 3.5z"/>', '<path d="M12 10v4.5"/>', '<path d="M12 17.2h.01"/>'],
    "cal": ['<rect x="4" y="5" width="16" height="16" rx="2"/>', '<path d="M4 10h16M8 3v4M16 3v4"/>'],
    "plus": ['<path d="M12 5v14M5 12h14"/>'],
    "minus": ['<path d="M5 12h14"/>'],
    "down": ['<path d="M12 4v15M6 13l6 6 6-6"/>'],
    "arrow": ['<path d="M5 12h14M13 6l6 6-6 6"/>'],
    "file": ['<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/>',
             '<path d="M14 3v5h5M9 13h6M9 17h6"/>'],
    "mail": ['<rect x="3" y="5" width="18" height="14" rx="2"/>', '<path d="M3 7l9 6 9-6"/>'],
    "lock": ['<rect x="5" y="11" width="14" height="10" rx="2"/>', '<path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
    "link": ['<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/>',
             '<path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'],
    "image": ['<rect x="3" y="4" width="18" height="16" rx="2"/>', '<circle cx="9" cy="10" r="1.5"/>',
              '<path d="M21 16l-5-5-9 9"/>'],
    "userplus": ['<circle cx="9" cy="8" r="4"/>', '<path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/>',
                 '<path d="M19 8v6M16 11h6"/>'],
    "store": ['<path d="M4 9l1.5-5h13L20 9"/>',
              '<path d="M4 9c0 1.4 1.1 2.5 2.5 2.5S9 10.4 9 9c0 1.4 1.1 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.1 2.5 2.5 2.5S20 10.4 20 9"/>',
              '<path d="M5 11.5V20h14v-8.5"/>', '<path d="M10 20v-5h4v5"/>'],
    "copy": ['<rect x="9" y="9" width="11" height="11" rx="2"/>', '<path d="M5 15V6a2 2 0 0 1 2-2h8"/>'],
    "chat": ['<path d="M4 5h16v11H9l-5 4V5z"/>'],
    "box": ['<rect x="4" y="4" width="16" height="16" rx="4"/>'],
}


def icon(name, x, y, size=24, color=NAVY, sw=2.0):
    s = size / 24.0
    return ('<g transform="translate(%s,%s) scale(%s)" color="%s" fill="none" stroke="%s" stroke-width="%s" '
            'stroke-linecap="round" stroke-linejoin="round">%s</g>'
            % (f(x), f(y), f(s), color, color, f(sw / s), "".join(ICONS[name])))


# ------------------------------------------------------------------ shared parts
def topbar(title, pill=None, pill_w=76):
    s = icon("back", 22, 14, 28, NAVY)
    s += T(195, 35, title, 17, 700, NAVY, "middle")
    if pill:
        s += R(366 - pill_w, 6, pill_w, 44, 22, SKY) + T(366 - pill_w / 2, 34, pill, 13, 600, NAVY, "middle")
    return s


def bottom_nav(active):
    out = R(0, 780, 390, 64, 0, WHITE)
    out += '<line x1="0" y1="780" x2="390" y2="780" stroke="%s" stroke-width="1"/>' % BORDER
    for i, (ic, lab) in enumerate([("home", "หน้าแรก"), ("bag", "สั่งยา"), ("share", "แชร์"), ("sliders", "ตั้งค่า")]):
        cx = 49 + i * 97.33
        on = i == active
        if on:
            out += R(cx - 38, 786, 76, 52, 14, SKY)
        col = NAVY if on else MUTED
        out += icon(ic, cx - 12, 791, 24, col) + T(cx, 830, lab, 11, 600, col, "middle")
    return out


def button(y, label, primary=True, h=52, with_arrow=False):
    if primary:
        s = R(24, y, 342, h, 14, NAVY)
        if with_arrow:
            s += T(180, y + h / 2 + 5, label, 14, 700, WHITE, "middle") + icon("arrow", 232, y + h / 2 - 9, 18, WHITE)
        else:
            s += T(195, y + h / 2 + 5, label, 14, 700, WHITE, "middle")
        return s
    return R(24, y, 342, h, 14, WHITE, BORDER) + T(195, y + h / 2 + 5, label, 14, 700, NAVY, "middle")


INITIAL = {"คุณพ่อ": "พ", "คุณแม่": "ม", "คุณปู่": "ป", "น้อง": "น", "ฉัน": "ฉ"}


def med_icon(cx, cy, r=20):
    return C(cx, cy, r, SKY) + icon("pill", cx - r * 0.55, cy - r * 0.55, r * 1.1, NAVY, 2)


def today_chip(right, y, take, w=92):
    """'ทานวันนี้' / 'พักวันนี้' -- text + icon, never colour alone."""
    x = right - w
    if take:
        return (R(x, y, w, 28, 14, MINT) + icon("check", x + 10, y + 7, 14, GREEN, 2.4)
                + T(x + 29, y + 19, "ทานวันนี้", 12, 600, NAVY))
    return (R(x, y, w, 28, 14, BEIGE, BORDER) + icon("moon", x + 10, y + 7, 14, MUTED, 2.2)
            + T(x + 29, y + 19, "พักวันนี้", 12, 600, NAVY))


# ------------------------------------------------------------------ schedule editor
CHIPS = [("daily", "ทุกวัน", 24, 88, 0), ("weekdays", "เลือกวัน", 120, 100, 0),
         ("interval2", "วันเว้นวัน", 228, 112, 0),
         ("everyN", "ทุกกี่วัน", 24, 104, 1), ("monthDays", "วันที่ของเดือน", 136, 140, 1)]


def chips(y, selected):
    out = ""
    for key, label, x, w, row in CHIPS:
        cy = y + row * 56
        if key == selected:
            out += R(x, cy, w, 48, 24, NAVY) + icon("check", x + 14, cy + 15, 18, WHITE, 2.4)
            out += T(x + w / 2 + 10, cy + 29, label, 13, 600, WHITE, "middle")
        else:
            out += R(x, cy, w, 48, 24, WHITE, BORDER) + T(x + w / 2, cy + 29, label, 13, 600, NAVY, "middle")
    return out, y + 104


def summary(y, l1, l2, h=60):
    return R(24, y, 342, h, 12, SKY) + T(40, y + 25, l1, 14, 700, NAVY) + T(40, y + 46, l2, 12, 400, MUTED)


def weekday_row(y, on):
    out = T(24, y + 12, "เลือกวันที่ทาน", 13, 600, NAVY)
    for i, lab in enumerate(["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]):
        cx = 46 + i * (342 - 44) / 6.0
        cy = y + 46
        if i in on:
            out += C(cx, cy, 22, NAVY) + T(cx, cy + 5, lab, 13, 700, WHITE, "middle")
        else:
            out += C(cx, cy, 21.5, WHITE, BORDER) + T(cx, cy + 5, lab, 13, 600, NAVY, "middle")
    return out, y + 78


def date_row(y, value):
    return (R(24, y, 342, 52, 12, WHITE, BORDER) + icon("cal", 40, y + 14, 24, NAVY)
            + T(74, y + 31, "เริ่มนับวันที่", 13, 500, MUTED) + T(350, y + 31, value, 14, 700, NAVY, "end"))


def stepper(cx, cy, kind):
    return R(cx - 24, cy - 24, 48, 48, 12, SKY) + icon(kind, cx - 10, cy - 10, 20, NAVY, 2.4)


def n_row(y, n):
    cy = y + 28
    return (R(24, y, 342, 56, 12, WHITE, BORDER) + T(40, cy + 5, "ทุก", 14, 500, MUTED)
            + stepper(236, cy, "minus") + T(286, cy + 6, "%s วัน" % n, 15, 700, NAVY, "middle") + stepper(336, cy, "plus"))


def strip(y, days):
    out = T(24, y + 14, "ตัวอย่าง 7 วันถัดไป", 12, 500, MUTED)
    for i, (lab, take) in enumerate(days):
        x = 24 + i * (342 - 44) / 6.0
        out += T(x + 22, y + 36, lab, 11, 500, MUTED, "middle")
        if take:
            out += R(x, y + 44, 44, 32, 10, NAVY) + T(x + 22, y + 65, "ทาน", 12, 700, WHITE, "middle")
        else:
            out += R(x, y + 44, 44, 32, 10, WHITE, MUTED, "3 3") + T(x + 22, y + 65, "พัก", 12, 600, MUTED, "middle")
    return out, y + 88


DAYLAB = ["พ 7", "พฤ 8", "ศ 9", "ส 10", "อา 11", "จ 12", "อ 13"]


def detail(y, mode, with_summary=True):
    out = ""
    if mode == "daily":
        if with_summary:
            out += summary(y, "ทานทุกวัน", "ไม่มีวันพัก")
            y += 60
    elif mode == "weekdays":
        s, y = weekday_row(y, {1, 3, 5})
        out += s
        if with_summary:
            out += summary(y + 6, "ทุก จ. พ. ศ. · 3 วันต่อสัปดาห์", "วันที่จะทานต่อไป: พ. 7 · ศ. 9 · จ. 12 ต.ค.")
            y += 72
    elif mode in ("interval2", "everyN"):
        if mode == "everyN":
            out += n_row(y, 3)
            y += 64
        out += date_row(y, "7 ต.ค.")
        y += 60
        pat = ([True, False] * 4)[:7] if mode == "interval2" else [True, False, False, True, False, False, True]
        s, y = strip(y, list(zip(DAYLAB, pat)))
        out += s
        if with_summary:
            if mode == "interval2":
                out += summary(y + 4, "วันเว้นวัน เริ่ม 7 ต.ค.", "ทาน 1 วัน พัก 1 วัน สลับต่อเนื่อง ไม่ขึ้นกับเลขวันที่")
            else:
                out += summary(y + 4, "ทุก 3 วัน เริ่ม 7 ต.ค.", "ทาน 1 วัน พัก 2 วัน สลับต่อเนื่อง ไม่ขึ้นกับเลขวันที่")
            y += 68
    elif mode == "monthDays":
        out += T(24, y + 12, "เลือกวันที่ในเดือน", 13, 600, NAVY)
        on = {1, 15}
        for d in range(1, 32):
            r, c = divmod(d - 1, 7)
            x = 24 + c * (342 - 44) / 6.0
            cy = y + 26 + r * 52
            if d in on:
                out += R(x, cy, 44, 44, 12, NAVY) + T(x + 22, cy + 28, str(d), 13, 700, WHITE, "middle")
            else:
                out += R(x, cy, 44, 44, 12, WHITE, BORDER) + T(x + 22, cy + 28, str(d), 13, 600, NAVY, "middle")
        y += 26 + 5 * 52 + 8
        out += R(24, y, 342, 64, 12, BEIGE) + icon("alert", 38, y + 20, 22, NAVY, 2)
        out += T(70, y + 28, "เดือนที่ไม่มีวันที่ที่เลือก (เช่น 31 ในเดือนที่มี 30 วัน)", 12, 500, TEXT)
        out += T(70, y + 48, "ระบบจะข้ามเดือนนั้น ไม่ย้ายไปวันอื่น", 12, 600, TEXT)
        y += 76
        if with_summary:
            out += summary(y, "ทุกวันที่ 1 และ 15 ของเดือน", "ครั้งถัดไป: 15 ต.ค. · 1 พ.ย. · 15 พ.ย.")
            y += 68
    return out, y


def dose_rows(y, vals):
    out = ""
    for i, (lab, v) in enumerate(zip(["เช้า", "กลางวัน", "เย็น", "ก่อนนอน"], vals)):
        ry = y + i * 64
        cy = ry + 28
        out += (R(24, ry, 342, 56, 12, WHITE, BORDER) + T(40, cy + 5, lab, 14, 600, TEXT)
                + stepper(236, cy, "minus") + T(286, cy + 6, v, 17, 700, NAVY, "middle") + stepper(336, cy, "plus"))
    return out, y + 4 * 64 - 8


# ------------------------------------------------------------------ screens
def screen_06_home():
    H = 844
    s = head(H, "MedMate — Home")
    s += icon("menu", 24, 14, 26, NAVY) + T(195, 35, "MedMate", 18, 700, NAVY, "middle") + icon("user", 340, 14, 26, NAVY)
    # greeting
    s += R(24, 62, 342, 92, 16, SKY) + T(40, 93, "สวัสดีค่ะ", 18, 700, NAVY)
    s += T(40, 116, "วันนี้ พุธ 7 ต.ค. 2569", 13, 500, MUTED) + T(40, 138, "มี 3 รายการที่ควรดูแล", 13, 600, NAVY)
    s += R(262, 82, 88, 48, 24, WHITE) + T(306, 111, "ดูทันที", 14, 600, NAVY, "middle")
    # attention banner (yellow = approaching reorder; red is reserved for out-of-stock)
    s += R(24, 166, 342, 48, 12, WARN_BG) + C(52, 190, 14, YELLOW) + icon("alert", 43, 181, 18, NAVY, 2.2)
    s += T(76, 195, "ยาใกล้หมด 3 รายการ", 14, 700, NAVY)
    rows = [("Losartan 50 mg", "คุณพ่อ · เหลือ 5 วัน", None),
            ("Vitamin D 1000 IU", "คุณพ่อ · จ. พ. ศ. · เหลือ 9 วัน", True),
            ("Calcium 600 mg", "คุณพ่อ · วันเว้นวัน · เหลือ 7 วัน", False)]
    y = 226
    for name, sub, take in rows:
        s += R(24, y, 342, 72, 14, WHITE, BORDER) + med_icon(56, y + 36)
        s += T(88, y + 31, name, 14, 700, NAVY) + T(88, y + 54, sub, 12, 400, MUTED)
        if take is not None:
            s += today_chip(334, y + 12, take)
        s += icon("chev", 340, y + 26, 20, MUTED)
        y += 80
    # household
    s += T(24, 486, "คนในบ้าน", 15, 700, NAVY)
    y = 500
    for who, n in [("คุณพ่อ", "6 รายการ"), ("คุณแม่", "8 รายการ"), ("ฉัน", "5 รายการ")]:
        s += R(24, y, 342, 52, 12, WHITE, BORDER) + C(54, y + 26, 18, MINT) + T(54, y + 31, INITIAL[who], 14, 700, NAVY, "middle")
        s += T(84, y + 23, who, 14, 600, TEXT) + T(84, y + 42, n, 12, 400, MUTED) + icon("chev", 340, y + 16, 20, MUTED)
        y += 60
    s += button(704, "เตรียมสั่งยา", with_arrow=True)
    s += bottom_nav(0)
    return s + "</svg>", H


def screen_07_household():
    H = 844
    s = head(H, "MedMate — Household") + topbar("คนในบ้าน", "+ เพิ่มคน")
    y = 72
    for who, g, n in [("คุณพ่อ", "ชาย", 6), ("คุณแม่", "หญิง", 8), ("คุณปู่", "ชาย", 5), ("น้อง", "หญิง", 2)]:
        s += R(24, y, 342, 80, 16, WHITE, BORDER) + C(62, y + 40, 26, SKY) + T(62, y + 46, INITIAL[who], 16, 700, NAVY, "middle")
        s += T(102, y + 35, who, 16, 700, NAVY) + T(102, y + 58, "%s · %d รายการ" % (g, n), 12, 400, MUTED)
        s += icon("chev", 336, y + 28, 24, MUTED)
        y += 90
    s += bottom_nav(0)
    return s + "</svg>", H


def screen_07b_person_meds():
    meds = [("Losartan 50 mg", "เช้า 1 เม็ด · ทุกวัน", None, 5),
            ("Amlodipine 5 mg", "เช้า 1 เม็ด · ทุกวัน", None, 24),
            ("Metformin 500 mg", "เช้า 1 · เย็น 1 เม็ด · ทุกวัน", None, 16),
            ("Atorvastatin 20 mg", "ก่อนนอน 1 เม็ด · ทุกวัน", None, 21),
            ("Vitamin D 1000 IU", "เช้า 1 เม็ด · จ. พ. ศ.", True, 9),
            ("Calcium 600 mg", "เช้า 1 เม็ด · วันเว้นวัน", False, 7)]
    H = max(844, 62 + 96 + 8 + len(meds) * 92 + 24)
    s = head(H, "MedMate — Person medications") + topbar("คุณพ่อ", "+ เพิ่มยา")
    s += R(24, 62, 342, 80, 16, SKY) + C(62, 102, 26, WHITE) + T(62, 108, "พ", 15, 700, NAVY, "middle")
    s += T(102, 93, "6 รายการ · วันนี้ พุธ 7 ต.ค.", 14, 700, NAVY) + T(102, 117, "ทานวันนี้ 5 รายการ · พักวันนี้ 1 รายการ", 12, 500, MUTED)
    y = 158
    for name, dose, take, left in meds:
        s += R(24, y, 342, 84, 14, WHITE, BORDER) + med_icon(56, y + 42)
        s += T(88, y + 30, name, 14, 700, NAVY) + T(88, y + 51, dose, 12, 500, TEXT)
        if left <= 10:
            s += icon("alert", 88, y + 60, 14, NAVY, 2.2) + T(107, y + 73, "เหลือ %d วัน · ใกล้หมด" % left, 12, 600, NAVY)
        else:
            s += T(88, y + 73, "เหลือ %d วัน" % left, 12, 400, MUTED)
        if take is not None:
            s += today_chip(332, y + 12, take)
        s += icon("chev", 340, y + 30, 20, MUTED)
        y += 92
    return s + "</svg>", H


def field(y, label, ph):
    return (T(24, y + 29, label, 12, 500, MUTED) + R(132, y, 234, 44, 10, WHITE, BORDER)
            + T(146, y + 28, ph, 13, 400, MUTED))


def screen_08():
    s = ""
    s += topbar("เพิ่มยา", "บันทึก")
    s += R(24, 62, 342, 48, 12, WHITE, BORDER) + T(40, 92, "ค้นชื่อยา หรือสแกนฉลาก...", 14, 400, MUTED)
    s += R(24, 122, 112, 44, 22, NAVY) + T(80, 149, "ค้นพบแล้ว", 13, 600, WHITE, "middle")
    s += R(144, 122, 136, 44, 22, WHITE, BORDER) + T(212, 149, "กรอกข้อมูลเอง", 13, 600, NAVY, "middle")
    y = 182
    for lab, ph in [("ชื่อยา", "เช่น Losartan"), ("ความแรง", "เช่น 50 mg"), ("รูปแบบยา", "เม็ด / แคปซูล"),
                    ("จำนวนที่เหลือ", "30 เม็ด"), ("กำหนดการเติมยา", "ทุก 30 วัน")]:
        s += field(y, lab, ph)
        y += 54
    y += 14
    s += T(24, y, "ทานวันไหน", 14, 700, NAVY)
    c, y = chips(y + 12, "weekdays")
    s += c
    d, y = detail(y + 12, "weekdays")
    s += d
    s += T(24, y + 24, "โดสในวันที่ทาน", 14, 700, NAVY)
    r, y2 = dose_rows(y + 38, ["1", "0", "0", "0"])
    s += r
    s += button(y2 + 28, "บันทึกยา")
    H = y2 + 28 + 52 + 32
    return head(H, "MedMate — Add Medication (dose schedule)") + s + "</svg>", H


def screen_09():
    s = topbar("ปรับโดส", "ประวัติ")
    s += R(24, 62, 342, 68, 14, WHITE, BORDER) + T(40, 91, "Vitamin D 1000 IU", 16, 700, NAVY) + T(40, 114, "คุณพ่อ", 12, 400, MUTED)
    s += T(24, 158, "ตารางและโดสปัจจุบัน", 13, 600, MUTED)
    s += R(24, 170, 342, 68, 12, SKY) + T(40, 197, "ทุกวัน", 15, 700, NAVY) + T(40, 220, "เช้า 1 เม็ด", 14, 500, TEXT)
    s += T(24, 268, "ตารางวันใหม่", 13, 600, MUTED)
    c, y = chips(280, "weekdays")
    s += c
    d, y = detail(y + 12, "weekdays", with_summary=False)
    s += d
    y += 14
    s += R(24, y, 342, 100, 14, WARN_BG) + icon("alert", 38, y + 16, 24, NAVY, 2)
    s += T(74, y + 33, "สิ่งที่จะเปลี่ยน (ต้องยืนยันก่อนบันทึก)", 13, 700, NAVY)
    s += T(74, y + 57, "ตาราง: ทุกวัน → ทุก จ. พ. ศ.", 14, 600, NAVY)
    s += T(74, y + 79, "โดสในวันที่ทาน: เช้า 1 เม็ด (เท่าเดิม)", 12, 400, MUTED)
    y += 100 + 28
    s += T(24, y, "โดสใหม่ (ในวันที่ทาน)", 13, 600, MUTED)
    r, y = dose_rows(y + 12, ["1", "0", "0", "0"])
    y += 32
    s += T(24, y, "เหตุผล / แหล่งข้อมูล", 13, 600, MUTED)
    s += R(24, y + 10, 342, 52, 12, WHITE, BORDER) + T(40, y + 42, "ปรับตามคำแนะนำแพทย์", 13, 400, MUTED)
    s += r
    y += 62 + 26
    s += button(y, "บันทึกการปรับโดส")
    s += button(y + 64, "หยุดใช้ยา", primary=False, h=48)
    s += T(195, y + 64 + 48 + 28, "การเปลี่ยนยาจะถูกบันทึกในประวัติ ลบย้อนหลังไม่ได้", 12, 400, MUTED, "middle")
    H = y + 64 + 48 + 28 + 28
    return head(H, "MedMate — Dose Adjust (dose schedule)") + s + "</svg>", H


def screen_09b():
    H = 844
    s = head(H, "MedMate — Confirm schedule change") + topbar("ปรับโดส", "ประวัติ")
    s += R(24, 62, 342, 68, 14, WHITE, BORDER) + T(40, 91, "Vitamin D 1000 IU", 16, 700, NAVY) + T(40, 114, "คุณพ่อ", 12, 400, MUTED)
    s += '<rect width="390" height="844" fill="%s" opacity="0.45"/>' % TEXT
    b = 228
    s += '<path d="M0 %d a24 24 0 0 1 24 -24 h342 a24 24 0 0 1 24 24 v%d h-390 z" fill="#FFFFFF"/>' % (b + 24, 844 - b - 24)
    s += R(171, b + 12, 48, 5, 2.5, BORDER)
    s += T(195, b + 54, "ยืนยันการเปลี่ยนตารางวัน", 18, 700, NAVY, "middle")
    s += T(195, b + 77, "Vitamin D 1000 IU · คุณพ่อ", 13, 500, MUTED, "middle")
    y = b + 96
    s += R(24, y, 342, 56, 12, WHITE, BORDER) + T(40, y + 22, "เดิม", 12, 500, MUTED) + T(40, y + 44, "ทุกวัน", 15, 700, NAVY)
    s += icon("down", 183, y + 60, 24, NAVY)
    y += 92
    s += R(24, y, 342, 56, 12, SKY, NAVY, None, 1.5) + T(40, y + 22, "ใหม่", 12, 500, MUTED)
    s += T(40, y + 44, "ทาน จ. พ. ศ. · 3 วันต่อสัปดาห์", 15, 700, NAVY)
    y += 76
    s += T(24, y, "โดสในวันที่ทาน: เช้า 1 เม็ด (ไม่เปลี่ยน)", 13, 500, TEXT)
    y += 16
    s += R(24, y, 342, 68, 12, BEIGE)
    s += T(40, y + 27, "จำนวนวันที่เหลือและจำนวนที่ต้องสั่งจะคำนวณใหม่", 12, 500, TEXT)
    s += T(40, y + 50, "การเปลี่ยนนี้บันทึกในประวัติและลบย้อนหลังไม่ได้", 12, 600, TEXT)
    y += 80
    s += R(24, y, 342, 56, 12, WHITE, BORDER) + R(40, y + 16, 24, 24, 7, NAVY) + icon("check", 42, y + 18, 20, WHITE, 2.6)
    s += T(76, y + 34, "ฉันตรวจสอบตารางนี้แล้ว", 14, 600, NAVY)
    y += 68
    s += button(y, "ยืนยันและบันทึก")
    s += button(y + 60, "กลับไปแก้ไข", primary=False, h=48)
    s += T(195, y + 60 + 48 + 24, "แอปบันทึกตามที่คุณระบุ ไม่แนะนำการเริ่มหรือหยุดยา", 12, 400, MUTED, "middle")
    return s + "</svg>", H


def screen_08c():
    modes = [("daily", "แบบที่ 1 · ทุกวัน"), ("weekdays", "แบบที่ 2 · เลือกวันในสัปดาห์"),
             ("interval2", "แบบที่ 3 · วันเว้นวัน"), ("everyN", "แบบที่ 4 · ทุกกี่วัน"),
             ("monthDays", "แบบที่ 5 · วันที่ของเดือน")]
    body, y = "", 24
    for key, title in modes:
        body += T(24, y + 14, title, 14, 700, NAVY)
        body += T(24, y + 44, "ทานวันไหน", 13, 600, NAVY)
        c, y2 = chips(y + 56, key)
        body += c
        d, y2 = detail(y2 + 12, key)
        body += d
        y = y2 + 24
        body += '<line x1="24" y1="%d" x2="366" y2="%d" stroke="%s" stroke-width="1"/>' % (y - 12, y - 12, BORDER)
        y += 12
    return head(y, "MedMate — Schedule modes") + body + "</svg>", y


def screen_12_doctor():
    meds = [("Losartan 50 mg", "เช้า 1 เม็ด", None), ("Amlodipine 5 mg", "เช้า 1 เม็ด", None),
            ("Metformin 500 mg", "เช้า 1 · เย็น 1 เม็ด", None), ("Atorvastatin 20 mg", "ก่อนนอน 1 เม็ด", None),
            ("Vitamin D 1000 IU", "เช้า 1 เม็ด", "จ. พ. ศ."), ("Calcium 600 mg", "เช้า 1 เม็ด", "วันเว้นวัน")]
    s = topbar("ข้อมูลสำหรับแพทย์", "แชร์/พิมพ์", 84)
    s += R(24, 62, 342, 104, 16, WHITE, BORDER) + C(64, 114, 26, SKY) + T(64, 120, "พ", 16, 700, NAVY, "middle")
    s += T(104, 96, "คุณพ่อ", 17, 700, NAVY) + T(104, 118, "อายุ 72 ปี · อัปเดตล่าสุดวันนี้", 12, 400, MUTED)
    s += R(104, 128, 178, 28, 14, DANGER_BG) + icon("alert", 114, 134, 16, DANGER, 2.2) + T(136, 147, "แพ้ยา: Penicillin", 12, 700, NAVY)
    s += T(24, 198, "ยาที่ใช้อยู่ (6)", 15, 700, NAVY)
    y = 212
    for name, dose, sched in meds:
        s += R(24, y, 342, 68, 12, WHITE, BORDER) + C(52, y + 34, 15, SKY) + icon("pill", 44, y + 26, 16, NAVY, 2)
        s += T(78, y + 29, name, 14, 700, NAVY) + T(78, y + 51, dose, 13, 500, TEXT)
        if sched:
            w = 108 if sched == "วันเว้นวัน" else 96
            s += R(358 - w, y + 20, w, 28, 14, SKY) + icon("cal", 358 - w + 10, y + 27, 14, NAVY, 2.2)
            s += T(358 - w + 30, y + 39, sched, 12, 600, NAVY)
        else:
            s += T(350, y + 39, "ทุกวัน", 12, 500, MUTED, "end")
        y += 76
    y += 14
    s += T(24, y, "ประวัติการปรับโดสและตาราง (4)", 15, 700, NAVY)
    hist = [("7 ต.ค.", "Vitamin D 1000 IU", "ตาราง: ทุกวัน → ทุก จ. พ. ศ."),
            ("20 ก.ย.", "Metformin 500 mg", "โดส: เช้า 1 → เช้า 1 + เย็น 1"),
            ("15 ก.ย.", "Glibenclamide", "หยุดใช้"),
            ("1 ส.ค.", "Losartan", "โดส: 25 → 50 mg")]
    y += 18
    s += '<line x1="80" y1="%d" x2="80" y2="%d" stroke="%s" stroke-width="2"/>' % (y + 20, y + 20 + 3 * 60, BORDER)
    for date, name, what in hist:
        s += T(64, y + 24, date, 12, 700, NAVY, "end") + C(80, y + 20, 5, NAVY)
        s += T(96, y + 24, name, 13, 600, TEXT) + T(96, y + 45, what, 12, 400, MUTED)
        y += 60
    y += 12
    s += button(y, "สร้าง Medication Summary")
    s += T(195, y + 52 + 28, "สรุปจากข้อมูลที่บันทึกไว้ เพื่อใช้สื่อสารกับแพทย์ ไม่ใช่คำวินิจฉัย", 12, 400, MUTED, "middle")
    H = y + 52 + 28 + 28
    return head(H, "MedMate — Doctor Mode") + s + "</svg>", H


# ------------------------------------------------------------------ logo (exact geometry of medmate_logo.svg)
# The logo file draws a 110 px tile with a capsule group at translate(20,18) from the tile corner.
# This function scales that exact drawing, so every screen shows the same mark as the logo file.
LOGO_TILE = 110.0


def logo_mark(x, y, size):
    k = size / LOGO_TILE
    return ('<g transform="translate(%s,%s) scale(%s)"><rect width="110" height="110" rx="28" fill="%s"/>'
            '<g transform="translate(20 18) rotate(-42 35 35)" fill="none" stroke="%s" stroke-width="6" '
            'stroke-linecap="round"><rect x="25" y="4" width="28" height="72" rx="14"/><path d="M25 40h28"/></g></g>'
            % (f(x), f(y), f(k), SKY, NAVY))


APPLE = ('<path fill="currentColor" stroke="none" d="M16.4 12.6c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7'
         's-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.5 2.1 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6 '
         '1.8-1 2.4-2c.8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.2zM14.5 6.5c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 '
         '1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z"/>')
ICONS["apple"] = [APPLE]


def checkbox(x, y, on=True, size=24):
    if on:
        return R(x, y, size, size, 6, NAVY) + icon("check", x + size * 0.17, y + size * 0.17, size * 0.66, WHITE, 3)
    return R(x, y, size, size, 6, WHITE, BORDER, sw=1.5)


def field_row(y, ic, label, h=52):
    return R(24, y, 342, h, 12, WHITE, BORDER) + icon(ic, 40, y + (h - 22) / 2, 22, MUTED) + T(74, y + h / 2 + 5, label, 15, 400, MUTED)


def social(y, which):
    """Google / Apple buttons (secondary 48 px)."""
    lab = {"g_in": "เข้าสู่ระบบด้วย Google", "a_in": "เข้าสู่ระบบด้วย Apple",
           "g_up": "สมัครด้วย Google", "a_up": "สมัครด้วย Apple"}[which]
    s = R(24, y, 342, 48, 14, WHITE, BORDER)
    if which.startswith("g"):
        s += C(66, y + 24, 12, WHITE, BORDER) + T(66, y + 29, "G", 14, 700, NAVY, "middle")
    else:
        s += icon("apple", 54, y + 12, 24, NAVY)
    return s + T(100, y + 29, lab, 14, 700, NAVY)


def or_divider(y):
    return ('<line x1="24" y1="%s" x2="168" y2="%s" stroke="%s"/><line x1="222" y1="%s" x2="366" y2="%s" stroke="%s"/>'
            % (y - 5, y - 5, BORDER, y - 5, y - 5, BORDER)) + T(195, y, "หรือ", 13, 400, MUTED, "middle")


def screen_01_splash():
    H = 844
    s = head(H, "MedMate — Splash") + logo_mark(147, 188, 96)
    s += T(195, 336, "MedMate", 32, 700, NAVY, "middle") + T(195, 366, "จัดการยาในบ้านได้ง่ายๆ", 16, 600, NAVY, "middle")
    s += T(195, 398, "ยาของทุกคนในบ้าน ครบ จบ ในที่เดียว", 14, 400, MUTED, "middle")
    s += button(730, "เริ่มใช้งาน", with_arrow=True)
    return s + "</svg>", H


def screen_02_welcome():
    H = 844
    s = head(H, "MedMate — Welcome")
    s += R(290, 6, 76, 44, 22, SKY) + T(328, 34, "ข้าม", 14, 600, NAVY, "middle")
    s += R(32, 76, 326, 262, 28, WHITE, BORDER) + logo_mark(140, 112, 110)
    s += T(195, 270, "MedMate", 22, 700, NAVY, "middle") + T(195, 298, "จัดการยาในบ้านได้ง่ายๆ", 14, 500, MUTED, "middle")
    s += T(195, 392, "จัดการยาในบ้าน", 24, 700, NAVY, "middle") + T(195, 424, "ได้ง่ายขึ้นทุกวัน", 24, 700, NAVY, "middle")
    for i, t in enumerate(["เตือนเมื่อยาใกล้หมด", "เตรียมสั่งยาอัตโนมัติ", "เทียบราคาและค่าส่ง", "แชร์ข้อมูลให้คนในบ้าน"]):
        y = 462 + i * 52
        s += C(58, y + 14, 14, MINT) + icon("check", 50, y + 6, 16, GREEN, 2.6) + T(86, y + 20, t, 16, 500, NAVY)
    s += button(730, "เริ่มใช้งาน")
    return s + "</svg>", H


def screen_03_login():
    H = 844
    s = head(H, "MedMate — Login") + topbar("เข้าสู่ระบบ") + logo_mark(159, 68, 72)
    s += T(195, 176, "MedMate", 24, 700, NAVY, "middle") + T(195, 204, "ยินดีต้อนรับกลับมา", 14, 400, MUTED, "middle")
    s += field_row(240, "mail", "อีเมล") + field_row(302, "lock", "รหัสผ่าน")
    s += checkbox(24, 372, True) + T(58, 390, "จดจำฉัน", 14, 500, NAVY) + T(366, 390, "ลืมรหัสผ่าน?", 14, 600, NAVY, "end")
    s += button(424, "เข้าสู่ระบบ") + or_divider(508) + social(528, "g_in") + social(584, "a_in")
    s += T(195, 668, "ยังไม่มีบัญชี? สมัครใช้งาน", 14, 600, NAVY, "middle")
    return s + "</svg>", H


def screen_04_register():
    H = 844
    s = head(H, "MedMate — Register") + topbar("สมัครใช้งาน")
    s += T(24, 92, "เริ่มจัดการยาในบ้านได้เลย", 15, 500, MUTED)
    for i, (ic, lab) in enumerate([("user", "ชื่อ – นามสกุล"), ("mail", "อีเมล"), ("lock", "รหัสผ่าน"), ("lock", "ยืนยันรหัสผ่าน")]):
        s += field_row(116 + i * 62, ic, lab)
    s += checkbox(24, 376, True) + T(58, 388, "ยอมรับข้อกำหนดการใช้งาน", 13, 500, NAVY) + T(58, 408, "และนโยบายความเป็นส่วนตัว", 13, 500, NAVY)
    s += button(440, "สมัครใช้งาน") + or_divider(524) + social(544, "g_up") + social(600, "a_up")
    s += T(195, 684, "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ", 14, 600, NAVY, "middle")
    return s + "</svg>", H


def screen_05_otp():
    H = 844
    s = head(H, "MedMate — OTP") + topbar("ยืนยันอีเมล") + logo_mark(159, 84, 72)
    s += T(195, 206, "ยืนยันอีเมล", 22, 700, NAVY, "middle") + T(195, 236, "เราส่งรหัสยืนยัน 6 หลักไปที่", 14, 400, MUTED, "middle")
    s += T(195, 260, "chutimon@example.com", 14, 600, NAVY, "middle")
    for i in range(6):
        x = 24 + i * 58.8
        s += R(x, 296, 48, 56, 12, WHITE, NAVY if i == 0 else BORDER, sw=2 if i == 0 else 1)
    s += T(195, 392, "ไม่ได้รับรหัส? ส่งอีกครั้ง (00:59)", 14, 500, NAVY, "middle")
    return s + "</svg>", H


def screen_10_order_compare():
    H = 844
    s = head(H, "MedMate — Order Compare") + topbar("สั่งยา", "เก็บราคา", 100)
    s += R(24, 64, 150, 44, 22, WHITE, BORDER) + T(99, 92, "รายการสั่งยา", 14, 600, NAVY, "middle")
    s += R(182, 64, 150, 44, 22, NAVY) + icon("check", 196, 76, 20, WHITE, 2.6) + T(264, 92, "เทียบราคา", 14, 600, WHITE, "middle")
    s += R(24, 124, 342, 92, 16, WARN_BG) + C(56, 166, 20, YELLOW) + icon("check", 44, 154, 24, NAVY, 2.6)
    s += T(88, 154, "ตัวเลือกที่คุ้มที่สุด", 14, 700, NAVY) + T(88, 182, "รวมค่าส่ง 1,250 บาท", 17, 700, NAVY)
    s += T(88, 204, "ประหยัดกว่า 180 บาท", 12, 600, "#14744C")
    rows = [("ร้านยาสุขใจ", "1,250 บาท", True), ("ร้านยาคุณภาพ", "1,380 บาท", False), ("ร้านยาใกล้บ้าน", "1,450 บาท", False)]
    for i, (n, p, best) in enumerate(rows):
        y = 232 + i * 88
        s += R(24, y, 342, 76, 16, WHITE, GREEN if best else BORDER, sw=2 if best else 1)
        s += (C(56, y + 38, 14, GREEN) + icon("check", 48, y + 30, 16, WHITE, 3)) if best else C(56, y + 38, 14, WHITE, BORDER)
        s += T(84, y + 33, n, 16, 700, NAVY) + T(84, y + 56, "8 รายการ", 12, 400, MUTED) + T(346, y + 45, p, 16, 700, NAVY, "end")
    s += T(24, 514, "หรือ แยกซื้อหลายร้าน (ทุกครั้งมีค่าส่ง)", 13, 500, MUTED)
    s += button(700, "ดูรายการสั่งยา") + bottom_nav(1)
    return s + "</svg>", H


def screen_11_order_message():
    H = 844
    s = head(H, "MedMate — Order Message") + topbar("รายการยาสำหรับสั่ง")
    s += R(24, 64, 342, 72, 16, WHITE, BORDER) + T(40, 94, "ร้านยาสุขใจ", 16, 700, NAVY) + T(40, 118, "รวม 8 รายการ · 1,250 บาท", 12, 400, MUTED)
    s += R(306, 76, 48, 48, 12, SKY) + icon("copy", 318, 88, 24, NAVY)
    s += T(24, 168, "สั่งยา:", 14, 700, NAVY)
    items = ["Losartan 50 mg 30 เม็ด", "Amlodipine 5 mg 30 เม็ด", "Metformin 500 mg 60 เม็ด", "Atorvastatin 20 mg 30 เม็ด",
             "Calcium 600 mg 60 เม็ด", "Vitamin D 1000 IU 30 เม็ด", "Omeprazole 20 mg 30 เม็ด", "Cetirizine 10 mg 30 เม็ด"]
    for i, t in enumerate(items):
        s += T(40, 198 + i * 30, "%d) %s" % (i + 1, t), 14, 500, TEXT)
    s += T(24, 464, "ข้อความที่จะส่ง", 14, 700, NAVY) + R(24, 476, 342, 124, 16, SKY)
    for i, t in enumerate(["สวัสดีค่ะ ขอสั่งยาตามรายการนี้ค่ะ", "รบกวนแจ้งยอดและวันที่จัดส่งด้วยค่ะ", "ขอบคุณค่ะ"]):
        s += T(40, 506 + i * 28, t, 14, 500, TEXT)
    s += button(620, "คัดลอกข้อความ")
    s += R(24, 684, 342, 48, 14, WHITE, BORDER) + icon("chat", 128, 696, 24, NAVY) + T(164, 713, "เปิด LINE", 14, 700, NAVY)
    s += T(195, 764, "แอพไม่ส่งข้อความเอง คัดลอกแล้วนำไปวางใน LINE", 12, 400, MUTED, "middle")
    return s + "</svg>", H


def screen_13_share():
    H = 844
    s = head(H, "MedMate — Share") + topbar("แชร์ข้อมูล")
    rows = [("link", "ลิงก์สำหรับคนในครอบครัว", "ให้คนในบ้านดูข้อมูลและสถานะยา"),
            ("image", "รูปสรุปข้อมูล", "เป็นรูปภาพพร้อมส่งในไลน์"),
            ("file", "ไฟล์ PDF", "สำหรับแพทย์หรือเก็บไว้"),
            ("userplus", "เชิญสมาชิกใหม่", "ส่งลิงก์ให้เข้ามาช่วยจัดการยา")]
    for i, (ic, t, sub) in enumerate(rows):
        y = 72 + i * 92
        s += R(24, y, 342, 80, 16, WHITE, BORDER) + C(62, y + 40, 24, SKY) + icon(ic, 50, y + 28, 24, NAVY)
        s += T(98, y + 35, t, 15, 700, NAVY) + T(98, y + 58, sub, 12, 400, MUTED) + icon("chev", 330, y + 28, 24, MUTED)
    s += R(24, 448, 342, 92, 16, MINT) + icon("lock", 40, 466, 24, GREEN)
    s += T(76, 484, "ความเป็นส่วนตัว", 14, 700, NAVY) + T(76, 508, "ข้อมูลสุขภาพควรแชร์เฉพาะคนที่ไว้ใจ", 13, 500, NAVY)
    s += bottom_nav(2)
    return s + "</svg>", H


def screen_14_pharmacy():
    H = 844
    s = head(H, "MedMate — Pharmacy Settings") + topbar("ตั้งค่าร้านยา")
    s += R(262, 6, 104, 44, 22, SKY) + icon("plus", 272, 16, 24, NAVY, 2.4) + T(324, 34, "เพิ่มร้าน", 14, 600, NAVY, "middle")
    rows = [("ร้านยาสุขใจ", "ค่าส่ง 80 บาท (คงที่)"), ("ร้านยาคุณภาพ", "ค่าส่ง 60 บาท (คงที่)"),
            ("ร้านยาใกล้บ้าน", "ค่าส่งไม่แน่นอน (กรอกทุกครั้ง)")]
    for i, (n, sub) in enumerate(rows):
        y = 72 + i * 88
        s += R(24, y, 342, 76, 16, WHITE, BORDER) + C(62, y + 38, 24, SKY) + icon("store", 50, y + 26, 24, NAVY)
        s += T(98, y + 33, n, 15, 700, NAVY) + T(98, y + 56, sub, 12, 400, MUTED)
        s += R(290, y + 14, 64, 48, 12, SKY) + T(322, y + 44, "แก้ไข", 14, 600, NAVY, "middle")
    s += T(24, 366, "ที่อยู่จัดส่ง", 16, 700, NAVY) + R(24, 380, 342, 60, 12, WHITE, BORDER) + T(40, 416, "ที่อยู่ผู้รับ", 14, 400, MUTED)
    s += T(24, 476, "เตือนก่อนยาใกล้หมด", 16, 700, NAVY) + R(24, 490, 342, 52, 12, WHITE, BORDER)
    s += T(40, 522, "10 วัน", 15, 600, NAVY) + T(350, 522, "ก่อนยาหมด", 12, 400, MUTED, "end")
    s += bottom_nav(3)
    return s + "</svg>", H


SCREENS = [
    ("01_splash.svg", screen_01_splash), ("02_welcome.svg", screen_02_welcome), ("03_login.svg", screen_03_login),
    ("04_register.svg", screen_04_register), ("05_otp.svg", screen_05_otp),
    ("10_order_compare.svg", screen_10_order_compare), ("11_order_message.svg", screen_11_order_message),
    ("13_share.svg", screen_13_share), ("14_pharmacy_settings.svg", screen_14_pharmacy),
    ("06_home.svg", screen_06_home), ("07_household.svg", screen_07_household),
    ("07b_person_medications.svg", screen_07b_person_meds), ("08_medication_edit.svg", screen_08),
    ("08c_schedule_modes.svg", screen_08c), ("09_dose_adjust.svg", screen_09),
    ("09b_schedule_confirm.svg", screen_09b), ("12_doctor_mode.svg", screen_12_doctor),
]


def main(out):
    os.makedirs(out, exist_ok=True)
    for name, fn in SCREENS:
        svg, h = fn()
        # screens that build their own body return it without <svg> head
        if not svg.startswith("<svg"):
            svg = head(h, name) + svg + "</svg>"
        open(os.path.join(out, name), "w", encoding="utf-8").write(svg)
        print("%-30s 390 x %d" % (name, h))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "screens")
