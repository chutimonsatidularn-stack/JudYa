# Acceptance status (real app, 2026-10-09)

Where each check in `docs/acceptance-criteria.md` stands. **Tested** = an automated test in `app/` (`cd app && npm test`, 124 tests). **Swept** = a browser script opened every screen with demo data (26 routes, 390 px wide): no console errors/warnings, every button/field/image has a name, no horizontal scroll, no text under 15 px, and the HTML-like test names (`<img onerror>`, `<script>`) stayed plain text (nothing ran). **Phone** = still needs the owner's Android phone. Not yet done is said plainly.

| Check | Status |
|---|---|
| AC-D1, D2, D3 | Tested (`storage`, `settings` tests; restore flow test asks for confirmation) |
| AC-P3 | Tested (`settings.test.ts`, flow test) |
| AC-C1–C6 | Tested (`calc.test.ts` is the port of the reference tests; `selectors`, `dates`) |
| AC-C7 "ทานวันนี้/พักวันนี้" chips | Not separately tested; look at it on the phone |
| AC-C8 schedule summary + confirm sheet | Tested (`format`, flow test for schedule change) |
| AC-M1 self-managed | Tested (flow: Today, Members) |
| AC-M2 photo upload | **Obsolete**: replaced by the 20 icons (owner, 2026-10-09) |
| AC-H1 household medicine | Tested (flow + `medicine` tests) |
| AC-B1, B2 brands and units | Tested (`medicine`, `units`) |
| AC-N1 nav and medicine list | Tested |
| AC-A1–A4 dose, history, stop | Tested (`flows`, `stop`, `medicine`) |
| AC-L1, L2 allergies | Tested |
| AC-O1 price rows persist | Partly: saving prices is tested in `medicine`; the add/delete/change-unit clicks on 08d are only looked at, not clicked by a test |
| AC-O2 message = order lines, copy | Tested for the text; the clipboard call itself is tested on Share, not on the order message |
| AC-O3 no phone → disabled | Tested |
| AC-U1 focus/caret, disabled reasons, ≥ 15 px, status not by colour alone | Swept for ≥ 15 px (fixed two 14 px spots); `components` tests for status; touch size ≥ 44 px is by the design CSS, not measured |
| AC-U2 XSS | Tested + Swept |
| AC-U3 offline / install | Offline checked in a browser (first load, then offline reload shows the app, no errors). **Phone**: install to the home screen and offline test |
| AC-U4 CSP, console, Lighthouse | CSP present; console clean (Swept). **Lighthouse not run** (no network in this sandbox) |
| AC-H1 (UI-10) banner | Tested |
| AC-P1, P2 pictures | Tested (`components`, flow) |
| AC-M3, M4 add / remove member | Tested |

Still to do on the owner's side: the Pages setting (Source = GitHub Actions), then the Phone checks above.
