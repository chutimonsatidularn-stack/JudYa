# MedMate design files

Visual reference for the app. Rules and meaning of colours, type, icons and components: `../design-system.md`. Requirements: `../requirements.md`.

| File | What |
|---|---|
| `MEDMATE_SCREEN_OVERVIEW.png` | One picture with all 17 screens (tall screens cropped). |
| `design-tokens.json` | Colours, type sizes, sizes, icon set (machine-readable). |
| `medmate_logo.svg` | Logo. |
| `screens/*.svg` | The screens, 390 px wide. Open in a browser. |
| `gen_screens.py` | Draws the 8 redrawn screens (06, 07, 07b, 08, 08c, 09, 09b, 12). Edit this file and re-run instead of redrawing by hand. |
| `render_png.py` | Makes PNG previews of the SVGs (needs Python + Playwright). |

## Screens
| # | Screen | Status |
|---|---|---|
| 01 | Splash | original, text colour fixed |
| 02 | Welcome | original, text colour fixed |
| 03 | Login | original, text colour fixed |
| 04 | Register | original, text colour fixed |
| 05 | OTP | original, text colour fixed |
| 06 | Home | **redrawn**: icons, take/rest chips, yellow attention banner |
| 07 | Household | **redrawn**: line icons, 48 px+ rows |
| 07b | Person's medicines | **new**: schedule, today chip, stock status |
| 08 | Add / edit medicine | **redrawn**: "ทานวันไหน" section; field overlap fixed |
| 08c | Schedule modes | **new**: all five kinds side by side |
| 09 | Dose adjust | **redrawn**: new schedule + "what will change" card |
| 09b | Confirm schedule change | **new**: bottom sheet with old → new |
| 10 | Order compare | original, text colour fixed |
| 11 | Order message | original, text colour fixed |
| 12 | Doctor mode | **redrawn**: schedule tags, schedule changes in history, safety note |
| 13 | Share | original, text colour fixed |
| 14 | Pharmacy settings | original, text colour fixed |

## What was fixed in the originals (2026-10-07)
Every original SVG had a style rule `.t{... fill:#0F172A}` that overrides the `fill` on each text, so white text on navy buttons and every coloured text came out near-black. The rule was removed; the fill on each text now applies.

## Regenerate
```
python3 gen_screens.py screens        # rewrites the 8 redrawn SVGs in screens/
python3 render_png.py screens         # optional: PNG previews in screens/png/
```
The sample data on the screens is invented (same persona on every screen; the numbers are explained at the top of `gen_screens.py`).
