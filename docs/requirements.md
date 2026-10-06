# Requirements (living document)

The **current truth** about what MedMate should do. Not a chat log.
- Update it on **every** owner input about logic, UI, UX, a suggestion, or a requirement — immediately, before changing the app.
- Edit the existing line when something changes; delete lines that are no longer true. History is in git; big decisions are in `docs/adr/`.
- Status: `Confirmed` (owner said it) · `Assumed` (inferred from the existing app, needs a yes) · `Suggested` (agent idea, waiting for the owner) · `Open` (question).

## Product
| ID | Requirement | Status |
|---|---|---|
| P-1 | MedMate helps people manage the medicines they keep at home. | Assumed |
| P-2 | Stay simple for beginners; no complex features yet. | Confirmed |

## Users
| ID | Requirement | Status |
|---|---|---|
| U-1 | Who uses the app (owner only? family? elderly relatives?) | Open |

## Logic & rules
| ID | Requirement | Status |
|---|---|---|
| L-2 | Works offline after the first load. | Assumed |

## UI
| ID | Requirement | Status |
|---|---|---|
| UI-1 | Thai language, mobile-first screens. | Assumed |

## UX
| ID | Requirement | Status |
|---|---|---|
| UX-1 | Installable to the Android home screen (PWA). | Assumed |

## Data & privacy
| ID | Requirement | Status |
|---|---|---|
| D-1 | Data is stored on the device only; no account, no sync between devices. | Assumed |
| D-2 | What is stored per medicine (name, amount, expiry, notes…)? | Open |
| D-3 | User can delete their data; export/backup wanted? | Open |

## Safety
| ID | Requirement | Status |
|---|---|---|
| SF-1 | The app shows only what the user entered; it gives no medical advice or dosing guidance. | Assumed |
| SF-2 | Do not promise reminders/alarms the web app can't reliably deliver. | Assumed |

## Out of scope (parked, not now)
| ID | Item | Status |
|---|---|---|
| OS-1 | Login/accounts, cloud sync, barcode scan, drug-interaction checks, notifications, selling or ads. Move an item out of this list only when the owner asks. | Assumed |

## Prototype approval (when the real app may start)
| ID | Check | Status |
|---|---|---|
| AP-1 | Owner can do the top 3 jobs (see Q-1) on their own phone without help. | Open |
| AP-2 | Owner says in words: "the prototype is approved". | Confirmed |

## Constraints
| ID | Requirement | Status |
|---|---|---|
| C-1 | Target: Android Chrome (other devices?). | Assumed |
| C-2 | Readable for older users (large text, good contrast)? | Open |
| C-3 | Free hosting (e.g. GitHub Pages), no running costs. | Assumed |

## Suggestions waiting for the owner
| ID | Idea | Status |
|---|---|---|
| — | none yet | |

## Open questions
| ID | Question |
|---|---|
| Q-1 | The 3 things the app must do first? (Asked in the FIRST TASK.) |
