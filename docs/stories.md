# User stories

Format: **S-n** As a *who*, I want *what*, so that *why*. · Done when: observable checks. · Status.
Status: `Draft` (agent's guess) → `Confirmed` (owner agreed) → `In prototype` → `Approved`.
Source column points to `docs/requirements.md` or the evidence used.

> S-1 to S-4 are **Draft**: inferred from `README-TH.txt`. Owner to confirm/edit (Q-1 in `docs/requirements.md`). S-5 to S-9 come from the owner's own words on 2026-10-07 and are **Confirmed**.

| ID | Story | Done when | Status | Source |
|---|---|---|---|---|
| S-1 | As a household member, I want to keep a list of the medicines at home, so that I know what we have. | I can add, view, edit and delete a medicine. | Draft | README-TH |
| S-2 | As a phone user, I want the app to work offline, so that I can open it anywhere. | After first load, the app opens with no internet. | Draft | README-TH |
| S-3 | As an Android user, I want to install it to my home screen, so that it opens like a normal app. | Chrome offers "Install app" and it opens full-screen. | Draft | README-TH |
| S-4 | As a user, I want my data to stay on my phone, so that I don't need an account. | No login; data persists after closing the app. (Not synced across devices.) | Draft | README-TH |
| S-5 | As a caregiver, I want to say that a medicine is taken only on certain days (weekdays, every other day, every N days, days of the month), so that the app matches the doctor's instruction. | I can pick one of five kinds; I see a Thai summary and, for cycles, a 7-day take/rest preview; the dose per time of day still works on take-days. | Confirmed | DS-1…DS-6 |
| S-6 | As a caregiver, I want days remaining and the quantity to order to follow the schedule, so that I buy the right amount at the right time. | 12 tablets taken Mon/Wed/Fri show about 28 days; 10 tablets every other day show about 20 days; every-day medicines are unchanged. | Confirmed | DS-7, DS-8, DS-12 |
| S-7 | As a caregiver, I want Home and the medicine list to tell me whether a not-every-day medicine is for today, so that I don't have to remember the pattern. | Such medicines show "ทานวันนี้" or "พักวันนี้" with text and icon; every-day medicines show nothing extra. | Confirmed | DS-9 |
| S-8 | As a doctor or another carer reading the summary, I want to see the schedule next to the dose and any schedule changes, so that I get the full picture. | Doctor Mode shows "เช้า 1 เม็ด · จ. พ. ศ." and history lines like "ตาราง: ทุกวัน → ทุก จ. พ. ศ.". | Confirmed | DS-11 |
| S-9 | As a caregiver, I want a schedule change to be double-checked and kept in history, so that a wrong tap cannot silently change a medicine. | A confirmation sheet shows old → new and needs a tick; one history entry is saved and cannot be deleted. | Confirmed | DS-10, L-9 |
| S-10 | As a caregiver, I want the Home welcome card to show a picture that matches what needs my attention (nothing urgent, a refill reminder, or family members to look after), so that I see the main thing at a glance. | The card shows the `normal`, `reminder` or `family` picture by the rule in UI-10; text stays readable and the picture is never stretched at 360 / 390 / 430 px. | Draft | owner 2026-10-08 |
