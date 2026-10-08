# JudYa design files

Visual reference for the app. Rules and meaning of colours, type, icons and components: `../design-system.md`. Requirements: `../requirements.md`.

| File | What |
|---|---|
| `MEDMATE_SCREEN_OVERVIEW.png` | One picture with all 17 screens (tall screens cropped). |
| `design-tokens.json` | Colours, type sizes, sizes, icon set (machine-readable). |
| `medmate_logo.svg` | Earlier plain logo from the design package. Not used any more. |
| `assets/judya_icon.svg`, `judya_wordmark.svg`, `judya_splash_illustration.svg` | **Current** JudYa logo icon, wordmark and Splash illustration (approved 2026-10-08). The full logos (vertical/horizontal with taglines) are in the Claude Project, `claude/judya-logo_*.svg`. The older `logo_mark`, `wordmark`, `splash_illustration` are MedMate and not used. |
| `assets/*.svg` | The approved vector graphics taken from the running app: `logo_mark`, `wordmark`, `splash_illustration`, `welcome_illustration`, `home_house`, `avatar_dad/mom/grandpa/kid/add`. To change the brand graphics later, replace these files and re-run `gen_screens.py`; the screens place them with `asset()`. |
| `screens/*.svg` | The screens, 390 px wide. Open in a browser. |
| `gen_screens.py` | Draws all 17 screens. Edit this file and re-run instead of redrawing by hand. |
| `render_png.py` | Makes PNG previews of the SVGs (needs Python + Playwright). |

## Screens
| # | Screen | Status |
|---|---|---|
| 01 | Splash | **JudYa**: icon, wordmark, two taglines, new woman illustration |
| 02 | Welcome | **redrawn**: approved phone-checklist illustration |
| 03 | Login | **redrawn**: line icons, 48 px targets |
| 04 | Register | **redrawn**: line icons, 48 px targets |
| 05 | OTP | **redrawn**: line icons, 48 px targets |
| 06 | Home | **redrawn**: house banner, profile pictures, take/rest chips, yellow attention banner |
| 07 | Household | **redrawn**: line icons, 48 px+ rows |
| 07b | Person's medicines | **new**: schedule, today chip, stock status |
| 08 | Add / edit medicine | **redrawn**: "ทานวันไหน" section; field overlap fixed |
| 08c | Schedule modes | **new**: all five kinds side by side |
| 09 | Dose adjust | **redrawn**: new schedule + "what will change" card |
| 09b | Confirm schedule change | **new**: bottom sheet with old → new |
| 10 | Order compare | **redrawn**: line icons, 48 px targets |
| 11 | Order message | **redrawn**: line icons, 48 px targets |
| 12 | Doctor mode | **redrawn**: schedule tags, schedule changes in history, safety note |
| 13 | Share | **redrawn**: line icons, 48 px targets |
| 14 | Pharmacy settings | **redrawn**: line icons, 48 px targets |

## What was fixed in the originals (2026-10-07)
Every original SVG had a style rule `.t{... fill:#0F172A}` that overrides the `fill` on each text, so white text on navy buttons and every coloured text came out near-black. The rule was removed; the fill on each text now applies.

Colours on all screens follow design-system v1.2 (JudYa palette). `judya_app_colours_check.png` is a screenshot check of the running app in the new colours.

## Regenerate
```
python3 gen_screens.py screens        # rewrites all 17 SVGs in screens/
python3 render_png.py screens         # optional: PNG previews in screens/png/
```
The sample data on the screens is invented (same persona on every screen; the numbers are explained at the top of `gen_screens.py`).
