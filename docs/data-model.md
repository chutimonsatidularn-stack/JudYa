# JudYa — Data model v3 (target)

Storage key stays `medmate.v1` (P-5). Root object: `{ "version": 3, ... }`. Dates are `YYYY-MM-DD` (Asia/Bangkok); timestamps ISO 8601 with offset. IDs are short random strings. TypeScript-style shapes below are the contract; validate on load and on import (SEC-2).

```ts
type Id = string;
type Unit = 'เม็ด'|'แคปซูล'|'ซอง'|'มล.'|'กรัม'|'แผ่น';           // base units
type PackUnit = 'แผง'|'กล่อง'|'ขวด'|'หลอด'|'แพ็ก'|'ถุง';         // pack units
type Form = 'เม็ด'|'แคปซูล'|'ผงชง/ซอง'|'น้ำ/ไซรัป'|'ยาหยอด/พ่น'|'ครีม/ขี้ผึ้ง'|'แผ่นแปะ';

interface Root { version: 3; household: {name: string}; persons: Person[]; allergies: Allergy[];
  medications: Medication[]; assignments: Assignment[]; changes: DoseChange[];
  pharmacies: Pharmacy[]; templates: MessageTemplate[]; settings: Settings; orderDrafts: OrderDraft[]; }

interface Person { id: Id; name: string /*≤40*/; relationship?: string; birthYear?: number; photo?: string /*small data URL, ≤256px*/;
  selfManaged: boolean;            // MB-2: leaves the daily pill-preparation list; stock/buying still tracked
  conditions?: string[]; insurance?: {health?: string; accident?: string}; }

interface Allergy { id: Id; personId: Id; drug: string /*generic or brand, ≤40*/; symptoms: Symptom[] /*≥1*/;
  note?: string /*≤200*/; recordedOn: string; source: 'manual'|'stopMedication'; }
type Symptom = 'ผื่น/ลมพิษ'|'คัน'|'บวมที่หน้า/ปาก'|'หายใจลำบาก'|'คลื่นไส้/อาเจียน'|'ท้องเสีย'|'เวียนหัว/ใจสั่น'|'อื่นๆ';
// severe = ['บวมที่หน้า/ปาก','หายใจลำบาก']

// A "Medication" is ONE BRAND ENTRY. Same generic + other brand = another Medication (BR-1).
interface Medication { id: Id; generic: string /*required ≤40*/; brand?: string; strength: string /*≤20*/; form: Form;
  baseUnit: Unit; packUnit: PackUnit; packSize: number|null /*1..1000, null = unknown*/;
  prices: PriceRow[]; notes?: string; }
interface PriceRow { pharmacyId: Id; price: number /*THB ≥0, 2 dp*/; unit: Unit|PackUnit; }  // unit must be baseUnit or packUnit to be comparable

// An "Assignment" = a medicine for ONE owner. Owner is a person or the household (HM-1).
interface Assignment { id: Id; medicationId: Id; owner: {kind:'person', personId: Id} | {kind:'household'};
  stockQty: number /*0..9999 step 0.25*/; stockUnit: Unit|PackUnit;
  doses: {morning:number; noon:number; evening:number; bedtime:number};   // 0..9, step 1/½/¼; unit label = form's base unit
  doseStep: 1|0.5|0.25;
  schedule: Schedule | null;       // null for household medicines ("ใช้เมื่อมีอาการ")
  refillCycleDays: number /*1..365, default 30*/; leadDays: number /*0..90, default 7*/;
  expiryDate?: string;             // household medicines: reminded by expiry (HM-2)
  active: boolean; stopped?: {on: string; reason: StopReason; note?: string}; }
type Schedule = {kind:'daily'} | {kind:'weekdays', days:number[]} | {kind:'interval', everyNDays:number, anchorDate:string} | {kind:'monthDays', days:number[]};

// Append-only. Never edit or delete (SF-5).
interface DoseChange { id: Id; assignmentId: Id; on: string; at: string /*timestamp*/;
  kind: 'dose'|'stop';
  previous?: {doses; schedule}; next?: {doses; schedule};      // kind 'dose'
  reason: DoseReason | StopReason; note?: string; symptoms?: Symptom[]; }   // reason REQUIRED except when creating a new medicine
type DoseReason = 'แพทย์สั่งปรับ'|'เภสัชกรแนะนำ'|'ผลตรวจเลือดหรือผลตรวจอื่น'|'มีผลข้างเคียง'|'อื่นๆ';
type StopReason = 'แพทย์สั่งหยุด'|'หายแล้ว ไม่ต้องใช้แล้ว'|'มีผลข้างเคียง'|'แพ้ยา'|'เปลี่ยนไปใช้ยาอื่น'|'อื่นๆ';

interface Pharmacy { id: Id; name: string; note?: string; phone?: string; shippingFee: number|null /*0 = pickup, null = unknown*/;
  freeShippingOver: number|null; line?: string; address?: string; active: boolean; }
interface MessageTemplate { id: Id; name: string; body: string /*placeholders {ร้านยา} {รายการยา} {ผู้สั่ง}*/; }
interface Settings { reminderDays: number /*1..30, default 7*/; expiryWarnDays: 30; selectedTemplateId: Id; shares: {list:boolean; schedule:boolean; doses:boolean; stock:boolean; days:boolean}; }
interface OrderDraft { id: Id; personFilter: Id|null; lines: {assignmentId: Id; qtyBase: number; packs: number|null}[]; pharmacyId: Id; subtotal: number; shipping: number; total: number; message: string; status: 'draft'|'reviewed'|'copied'; }
```

## Rules
- A stopped assignment keeps all history and is listed under "ยาที่หยุดแล้ว"; excluded from pill preparation, buy reminders, orders, allergy-free lists.
- `Medication.prices`/packaging are shared by every assignment of that brand entry; stock/dose/schedule are per assignment (L-3).
- Household assignment: `schedule = null`, doses all 0, no days-remaining; only expiry reminders (HM-2).
- Dose unit label = `Medication.baseUnit` of the form (BR-5); stock unit may be base or pack unit; days-remaining is "unknown" if stock unit matches neither (BR-6).
- Images: only `Person.photo`, downscaled (SEC-4).

## Prototype → model mapping (the review prototype is NOT the schema)
| Prototype | Real model |
|---|---|
| `MEDS[w][i]` `{id,n,st,br,bq,left,days}` + `S.inv[id]` + `S.saved[id]` | Medication + Assignment (split brand entry vs owner) |
| `n` / `st` / `br` | `generic` / `strength` / `brand` |
| `who` ('พ่อ','แม่','ฉัน','บ้าน') | `owner` person id or `{kind:'household'}` |
| `inv{qty,form,unit,bu,pu,ps,cycle,lead}` | `stockQty,stockUnit`, `Medication.form/baseUnit/packUnit/packSize`, `refillCycleDays`, `leadDays` |
| `sch{mode:'daily'|'weekdays'|'alternate'|'everyN'|'monthdates', days,n,dates,start,step,doses{เช้า,กลางวัน,เย็น,ก่อนนอน}}` | `Schedule` (`alternate` = interval n=2) + `doses{morning…}` + `doseStep` |
| `prices[medId]=[{ph,price,unit}]` | `Medication.prices` |
| `ph[]` `{ship,free}` | `Pharmacy.shippingFee/freeShippingOver` |
| `hist[]`, `allergies{who:[…]}`, `self{who}` | `DoseChange[]`, `Allergy[]`, `Person.selfManaged` |
