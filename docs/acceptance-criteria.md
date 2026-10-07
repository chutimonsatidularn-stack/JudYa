# Acceptance criteria (definition of done)

Check these on a real phone (or a 390 px wide window) before the owner is asked to approve a change. Items marked ☐ are not done yet. Source: the owner's design package v1.0 plus the dose-schedule work of 2026-10-07. Requirement IDs refer to `docs/requirements.md`.

## Visual
- ☐ Only the approved palette is used (`docs/design/design-tokens.json`); navy is the main colour; green is success; yellow is attention; sky/mint/beige are surfaces.
- ☐ Noto Sans Thai is used; secondary text ≥ 11 px.
- ☐ Clean-line icons (2 px, round) are used consistently; no emoji or text glyphs as icons.
- ☐ The 390 px layout matches `docs/design/screens/*.svg`; primary button is the same everywhere; cards use 16 px radius.
- ☐ No mascot or cartoon treatment.

## Core workflow
- ☐ Create a household member; create a medicine; give the same medicine to several people with separate stock, dose and schedule (L-3).
- ☐ Edit dose and schedule; each change creates a history entry; stopping keeps history (L-9, DS-10).
- ☐ Days remaining, depletion date and reorder date come from stock + dose + schedule (L-5, DS-7).
- ☐ Pick the target number of days; quantity respects the schedule and package size; calculated and package quantities are shown separately (L-6, DS-8).
- ☐ Compare pharmacies including shipping; cheapest valid option highlighted; incomplete prices say so (L-7).
- ☐ Review, copy and open LINE for the order message; no claim of automatic sending (L-8).
- ☐ Doctor Mode shows current medicines with dose and schedule and recent dose/schedule changes (DS-11).
- ☐ Share a read-only summary (link/picture/PDF) with the privacy notice visible (UI-6).
- ☐ Pharmacy settings hold shipping cost, delivery address, recipient, warning days (UI-7).

## Dose schedule (DS)
- ☐ All five kinds can be set; the editor shows the Thai summary and, for cycles, the 7-day take/rest preview (DS-1…DS-6).
- ☐ Day-of-month 31 (and 29–31 in February) skips months that lack it, and the screen says so (DS-4).
- ☐ Every other day / every N days never gives two take-days in a row across a 31-day month, a February (also a leap year) or New Year (DS-3).
- ☐ 12 tablets, 1 per take-day, Mon/Wed/Fri ≈ 28 days; 10 tablets every other day ≈ 20 days; every-day medicines give the same numbers as before (DS-7).
- ☐ Home and lists show "ทานวันนี้" / "พักวันนี้" with text and icon for non-daily medicines (DS-9).
- ☐ Changing the schedule shows old → new in a confirmation sheet with a tick box before saving (DS-10).
- ☐ Old saved data opens as "every day" with the same numbers; running the upgrade twice changes nothing (DS-13).
- ☐ Calendar-day maths is right at midnight in Asia/Bangkok (DS-14).

## Safety
- ☐ No automatic dose or schedule change; no diagnosis; no start/stop advice (SF-3).
- ☐ Missing data is shown as missing, never as an invented number (L-10).
- ☐ High-risk fields need human confirmation (SF-4); history is not hard-deleted (SF-5).

## Quality
- ☐ Loading, empty, error, validation, disabled, pressed, saved and copy-success states exist (UX-3).
- ☐ Touch targets ≥ 48 px; icon-only buttons have labels for screen readers; status is never colour only (UX-2).
- ☐ Works offline after the first load and installs to the Android home screen (L-2, UX-1).
