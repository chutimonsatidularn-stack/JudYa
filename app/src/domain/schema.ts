// JudYa data model (format version 1 of the new app) — the contract from docs/data-model.md, as zod schemas (SEC-2: validate everything read from
// storage or from an imported backup). Limits here are "storage sanity" limits and are deliberately lenient so that
// real data is never rejected by a migration; the screens apply the tighter limits (names ≤ 40, stock ≤ 9999 …).
import { z } from 'zod';

export const Unit = z.enum(['เม็ด', 'แคปซูล', 'ซอง', 'มล.', 'กรัม', 'แผ่น']);
export const PackUnit = z.enum(['แผง', 'กล่อง', 'ขวด', 'หลอด', 'แพ็ก', 'ถุง']);
export const Form = z.enum(['เม็ด', 'แคปซูล', 'ผงชง/ซอง', 'น้ำ/ไซรัป', 'ยาหยอด/พ่น', 'ครีม/ขี้ผึ้ง', 'แผ่นแปะ']);
export const Symptom = z.enum(['ผื่น/ลมพิษ', 'คัน', 'บวมที่หน้า/ปาก', 'หายใจลำบาก', 'คลื่นไส้/อาเจียน', 'ท้องเสีย', 'เวียนหัว/ใจสั่น', 'อื่นๆ']);
export const DoseReason = z.enum(['แพทย์สั่งปรับ', 'เภสัชกรแนะนำ', 'ผลตรวจเลือดหรือผลตรวจอื่น', 'มีผลข้างเคียง', 'อื่นๆ']);
export const StopReason = z.enum(['แพทย์สั่งหยุด', 'หายแล้ว ไม่ต้องใช้แล้ว', 'มีผลข้างเคียง', 'แพ้ยา', 'เปลี่ยนไปใช้ยาอื่น', 'อื่นๆ']);

const Id = z.string().min(1).max(120);
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // calendar date, Asia/Bangkok (DS-14)
const Timestamp = z.string().min(10).max(40);
const Text = (max: number) => z.string().max(max);

export const Doses = z.object({
  morning: z.number().min(0).max(99),
  noon: z.number().min(0).max(99),
  evening: z.number().min(0).max(99),
  bedtime: z.number().min(0).max(99),
});

export const Schedule = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('daily') }),
  z.object({ kind: z.literal('weekdays'), days: z.array(z.number().int().min(0).max(6)).min(1) }),
  z.object({ kind: z.literal('interval'), everyNDays: z.number().int().min(2), anchorDate: IsoDate }),
  z.object({ kind: z.literal('monthDays'), days: z.array(z.number().int().min(1).max(31)).min(1) }),
]);

export const Person = z.object({
  id: Id,
  name: Text(100),
  relationship: Text(60).optional(),
  birthYear: z.number().int().min(1800).max(3000).optional(), // พ.ศ. as saved by the old app
  avatarId: Text(40).optional(), // MB-1: id from docs/design/assets/profile-icons/profiles.json
  selfManaged: z.boolean(),
  removed: z.boolean().optional(), // MB-7: taken out of the list; medicines, history and allergies are kept, can be brought back
  conditions: z.array(Text(200)).optional(),
  insurance: z.object({ health: Text(200).optional(), accident: Text(200).optional() }).optional(),
});

export const Allergy = z.object({
  id: Id,
  personId: Id,
  drug: Text(100).min(1),
  symptoms: z.array(Symptom).min(1),
  note: Text(500).optional(),
  recordedOn: IsoDate,
  source: z.enum(['manual', 'stopMedication']),
});

// the unit must be the base or pack unit of the medicine to be comparable (PR-4); otherwise the comparison says "เทียบไม่ได้"
export const PriceRow = z.object({ pharmacyId: Id, price: z.number().min(0), unit: z.union([Unit, PackUnit]) });

export const Medication = z.object({
  id: Id,
  generic: Text(100).min(1),
  brand: Text(100).optional(),
  strength: Text(60),
  form: Form,
  baseUnit: Unit,
  packUnit: PackUnit,
  packSize: z.number().min(1).max(100000).nullable(),
  prices: z.array(PriceRow),
  notes: Text(500).optional(),
});

export const Assignment = z.object({
  id: Id,
  medicationId: Id,
  owner: z.discriminatedUnion('kind', [z.object({ kind: z.literal('person'), personId: Id }), z.object({ kind: z.literal('household') })]),
  stockQty: z.number().min(0).max(1000000).nullable(), // null = not known yet
  stockUnit: z.union([Unit, PackUnit]),
  doses: Doses,
  doseStep: z.union([z.literal(1), z.literal(0.5), z.literal(0.25)]),
  schedule: Schedule.nullable(), // null for household medicines
  refillCycleDays: z.number().int().min(1).max(3650),
  leadDays: z.number().int().min(0).max(3650),
  expiryDate: IsoDate.optional(),
  active: z.boolean(),
  stopped: z.object({ on: IsoDate, reason: StopReason, note: Text(500).optional() }).optional(),
});

const DoseSnapshot = z.object({ doses: Doses, schedule: Schedule.nullable() });
export const DoseChange = z.object({
  id: Id,
  assignmentId: Id,
  on: IsoDate,
  at: Timestamp,
  kind: z.enum(['dose', 'stop']),
  previous: DoseSnapshot.optional(),
  next: DoseSnapshot.optional(),
  reason: z.union([DoseReason, StopReason]),
  note: Text(1000).optional(),
  symptoms: z.array(Symptom).optional(),
});

export const Pharmacy = z.object({
  id: Id,
  name: Text(100),
  note: Text(300).optional(),
  phone: Text(40).optional(),
  shippingFee: z.number().min(0).nullable(), // 0 = pickup, null = unknown
  freeShippingOver: z.number().min(0).nullable(),
  line: Text(100).optional(),
  address: Text(500).optional(),
  active: z.boolean(),
});

export const MessageTemplate = z.object({ id: Id, name: Text(100), body: Text(4000) });

export const Settings = z.object({
  reminderDays: z.number().int().min(1).max(30),
  expiryWarnDays: z.literal(30),
  selectedTemplateId: Id,
  shares: z.object({ list: z.boolean(), schedule: z.boolean(), doses: z.boolean(), stock: z.boolean(), days: z.boolean() }),
});

export const OrderDraft = z.object({
  id: Id,
  personFilter: Id.nullable(),
  lines: z.array(z.object({ assignmentId: Id, qtyBase: z.number().min(0), packs: z.number().min(0).nullable() })),
  pharmacyId: Id,
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  message: Text(4000),
  status: z.enum(['draft', 'reviewed', 'copied']),
});

export const DATA_VERSION = 1;
export const AppData = z.object({
  version: z.literal(DATA_VERSION),
  household: z.object({ name: Text(100) }),
  persons: z.array(Person),
  allergies: z.array(Allergy),
  medications: z.array(Medication),
  assignments: z.array(Assignment),
  changes: z.array(DoseChange),
  pharmacies: z.array(Pharmacy),
  templates: z.array(MessageTemplate).min(1),
  settings: Settings,
  orderDrafts: z.array(OrderDraft),
  ticks: z.object({ date: IsoDate, done: z.array(z.string()) }).optional(), // today's "จัดแล้ว" ticks (NV-4); reset when the date changes
});

export type Person = z.infer<typeof Person>;
export type Allergy = z.infer<typeof Allergy>;
export type Medication = z.infer<typeof Medication>;
export type Assignment = z.infer<typeof Assignment>;
export type DoseChange = z.infer<typeof DoseChange>;
export type Pharmacy = z.infer<typeof Pharmacy>;
export type MessageTemplate = z.infer<typeof MessageTemplate>;
export type Schedule = z.infer<typeof Schedule>;
export type Doses = z.infer<typeof Doses>;
export type AppData = z.infer<typeof AppData>;
