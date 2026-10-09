// migrate1to3 — turns the old app's saved data (version 1, key medmate.v1) into JudYa data v3 (ADR-0005).
// Pure function: no storage, no clock, no randomness, never changes its input. Same input → same output.
// Rules: lossless in meaning (anything v3 has no place for goes to `legacy`), never invent values
// (unknown stays null, e.g. price unit), all-or-nothing (returns an error instead of a half result).
import { z } from 'zod';
import { RootV3, type RootV3 as Root, type Medication, type Assignment, type DoseChange, type Person, type Allergy } from './schema';

type Result = { ok: true; data: Root } | { ok: false; error: string };

// --- shape of the old data, read from the old app's code (medmate-app.html). Loose on purpose: unknown extras are kept.
const N = z.number().nullable().optional();
const S = z.string().nullable().optional();
const V1Doses = z.object({ morning: z.number(), noon: z.number(), evening: z.number(), bedtime: z.number() });
const V1 = z
  .object({
    version: z.literal(1),
    session: z.unknown().optional(),
    settings: z.object({ warnDays: N, targetDays: N, deliveryAddress: S, recipient: S, recipientPhone: S }).passthrough().optional(),
    persons: z.array(
      z.object({ id: z.string(), name: z.string(), relationship: S, gender: S, birthYear: N, conditions: z.array(z.string()).optional(), allergies: z.array(z.string()).optional(), insurance: S, accidentInsurance: S, avatar: S, createdAt: S, updatedAt: S }).passthrough(),
    ),
    medications: z.array(z.object({ id: z.string(), genericName: z.string(), brandName: S, strength: S, dosageForm: S, notes: S }).passthrough()),
    assignments: z.array(
      z.object({ id: z.string(), personId: z.string(), medicationId: z.string(), stockQuantity: N, packageSize: N, packageUnit: S, doses: V1Doses, frequency: S, startDate: S, reorderLeadDays: N, targetStockDays: N, prescriber: S, notes: S, active: z.boolean().optional(), createdAt: S, updatedAt: S }).passthrough(),
    ),
    doseChanges: z.array(z.object({ id: z.string(), assignmentId: z.string(), kind: z.string(), effectiveAt: z.string(), previousDose: V1Doses.nullable().optional(), newDose: V1Doses.nullable().optional(), source: S, reason: S, note: S, changedBy: S, createdAt: S }).passthrough()),
    notes: z.array(z.unknown()).optional(),
    pharmacies: z.array(z.object({ id: z.string(), name: z.string(), contact: S, lineHandle: S, phone: S, address: S, shippingMode: S, shippingCost: N, orderTemplate: S, active: z.boolean().optional() }).passthrough()),
    prices: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
    orders: z.array(z.unknown()).optional(),
    orderPlan: z.unknown().optional(),
    seeded: z.boolean().optional(),
  })
  .passthrough();
type V1Root = z.infer<typeof V1>;

const FORMS = ['เม็ด', 'แคปซูล', 'ผงชง/ซอง', 'น้ำ/ไซรัป', 'ยาหยอด/พ่น', 'ครีม/ขี้ผึ้ง', 'แผ่นแปะ'] as const;
type FormT = (typeof FORMS)[number];
const BASE_UNITS = ['เม็ด', 'แคปซูล', 'ซอง', 'มล.', 'กรัม', 'แผ่น'] as const;
type BaseUnit = (typeof BASE_UNITS)[number];
// BR-4: a form sets the default units
const FORM_UNITS: Record<FormT, { base: BaseUnit; pack: Medication['packUnit'] }> = {
  เม็ด: { base: 'เม็ด', pack: 'แผง' },
  แคปซูล: { base: 'แคปซูล', pack: 'แผง' },
  'ผงชง/ซอง': { base: 'ซอง', pack: 'กล่อง' },
  'น้ำ/ไซรัป': { base: 'มล.', pack: 'ขวด' },
  'ยาหยอด/พ่น': { base: 'มล.', pack: 'ขวด' },
  'ครีม/ขี้ผึ้ง': { base: 'กรัม', pack: 'หลอด' },
  แผ่นแปะ: { base: 'แผ่น', pack: 'กล่อง' },
};
const DAILY = { kind: 'daily' } as const;
const NOTE_OLD = 'ก่อนมีช่องเหตุผล';

const str = (v: string | null | undefined) => (typeof v === 'string' ? v : '');
// calendar date in Asia/Bangkok from an ISO timestamp (DS-14): shift by +7h, then read the date parts
export const bangkokDate = (iso: string): string => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : '1970-01-01';
  return new Date(t + 7 * 3600_000).toISOString().slice(0, 10);
};
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const join = (parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(' · ');

export function migrate1to3(input: unknown): Result {
  const parsed = V1.safeParse(input);
  if (!parsed.success) return { ok: false, error: `ข้อมูลรุ่น 1 ไม่ถูกต้อง: ${parsed.error.issues[0]?.path.join('.') || 'root'}` };
  const v1: V1Root = parsed.data;
  const legacy: Record<string, unknown> = { sourceVersion: 1 };

  // persons + allergies (old allergies were plain strings on the person)
  const allergies: Allergy[] = [];
  const persons: Person[] = v1.persons.map((p) => {
    (p.allergies ?? []).forEach((drug, i) => {
      if (drug.trim()) allergies.push({ id: `al_${p.id}_${i + 1}`, personId: p.id, drug: drug.trim(), symptoms: ['อื่นๆ'], recordedOn: bangkokDate(str(p.createdAt) || '1970-01-01'), source: 'manual' });
    });
    const out: Person = { id: p.id, name: p.name, selfManaged: false };
    if (str(p.relationship)) out.relationship = str(p.relationship);
    if (str(p.gender)) out.gender = str(p.gender);
    if (typeof p.birthYear === 'number') out.birthYear = p.birthYear;
    if (p.conditions?.length) out.conditions = p.conditions;
    if (str(p.insurance) || str(p.accidentInsurance)) out.insurance = { ...(str(p.insurance) && { health: str(p.insurance) }), ...(str(p.accidentInsurance) && { accident: str(p.accidentInsurance) }) };
    return out;
  });

  // medications: pack size belongs to the brand entry (L-3), but the old app kept it per assignment.
  // One old medication used with different packs becomes one entry per distinct pack — never merged, never guessed.
  const assignmentsByMed = new Map<string, V1Root['assignments']>();
  for (const a of v1.assignments) assignmentsByMed.set(a.medicationId, [...(assignmentsByMed.get(a.medicationId) ?? []), a]);
  const medications: Medication[] = [];
  const medOfAssignment = new Map<string, string>();
  const medsByOld = new Map<string, string[]>();
  for (const m of v1.medications) {
    const rawForm = str(m.dosageForm).trim();
    const form: FormT = (FORMS as readonly string[]).includes(rawForm) ? (rawForm as FormT) : 'เม็ด';
    const formNote = rawForm && form !== rawForm ? `รูปแบบเดิม: ${rawForm}` : '';
    const packs = new Map<string, { size: number | null; unit: BaseUnit | null; rawUnit: string }>();
    const users = assignmentsByMed.get(m.id) ?? [];
    for (const a of users) {
      const rawUnit = str(a.packageUnit).trim();
      const unit = (BASE_UNITS as readonly string[]).includes(rawUnit) ? (rawUnit as BaseUnit) : null;
      const size = typeof a.packageSize === 'number' && a.packageSize >= 1 ? a.packageSize : null;
      packs.set(`${size ?? 'null'}|${unit ?? rawUnit}`, { size, unit, rawUnit });
    }
    if (!packs.size) packs.set('null|', { size: null, unit: null, rawUnit: '' });
    const ids: string[] = [];
    [...packs.entries()].forEach(([key, p], i) => {
      const id = i === 0 ? m.id : `${m.id}~${i + 1}`;
      ids.push(id);
      const notes = join([str(m.notes), formNote, p.rawUnit && !p.unit ? `หน่วยเดิม: ${p.rawUnit}` : '']);
      const med: Medication = { id, generic: m.genericName, strength: str(m.strength), form, baseUnit: p.unit ?? FORM_UNITS[form].base, packUnit: FORM_UNITS[form].pack, packSize: p.unit || !p.rawUnit ? p.size : null, prices: [] };
      if (str(m.brandName).trim()) med.brand = str(m.brandName).trim();
      if (notes) med.notes = notes;
      medications.push(med);
      for (const a of users) {
        const rawUnit = str(a.packageUnit).trim();
        const unit = (BASE_UNITS as readonly string[]).includes(rawUnit) ? rawUnit : null;
        const size = typeof a.packageSize === 'number' && a.packageSize >= 1 ? a.packageSize : null;
        if (`${size ?? 'null'}|${unit ?? rawUnit}` === key) medOfAssignment.set(a.id, id);
      }
    });
    medsByOld.set(m.id, ids);
  }

  // prices: the old app saved ONE number per pharmacy and medicine with no unit → unit stays null (not comparable until set)
  const pharmacyIds = new Set(v1.pharmacies.map((p) => p.id));
  const invalidPrices: unknown[] = [];
  for (const [pharmacyId, byMed] of Object.entries(v1.prices ?? {})) {
    for (const [medId, price] of Object.entries(byMed)) {
      const targets = (medsByOld.get(medId) ?? []).map((id) => medications.find((m) => m.id === id)!);
      if (typeof price === 'number' && price >= 0 && pharmacyIds.has(pharmacyId) && targets.length) targets.forEach((t) => t.prices.push({ pharmacyId, price, unit: null }));
      else invalidPrices.push({ pharmacyId, medId, price });
    }
  }
  if (invalidPrices.length) legacy.invalidPrices = invalidPrices;

  // history: 'adjust' → dose change, 'stop' → stop; 'start' is not a dose change → kept in legacy
  const assignmentIds = new Set(v1.assignments.map((a) => a.id));
  const changes: DoseChange[] = [];
  const startEvents: unknown[] = [];
  const orphanChanges: unknown[] = [];
  const stopOn = new Map<string, { on: string; note: string }>();
  for (const c of v1.doseChanges) {
    if (!assignmentIds.has(c.assignmentId)) { orphanChanges.push(c); continue; }
    if (c.kind === 'start') { startEvents.push(c); continue; }
    const on = bangkokDate(c.effectiveAt);
    const at = str(c.createdAt) || c.effectiveAt;
    const note = join([str(c.reason), str(c.note), str(c.source), NOTE_OLD]);
    if (c.kind === 'stop') {
      changes.push({ id: c.id, assignmentId: c.assignmentId, on, at, kind: 'stop', reason: 'อื่นๆ', note });
      const prev = stopOn.get(c.assignmentId);
      if (!prev || on >= prev.on) stopOn.set(c.assignmentId, { on, note });
    } else {
      changes.push({ id: c.id, assignmentId: c.assignmentId, on, at, kind: 'dose', previous: { doses: c.previousDose ?? { morning: 0, noon: 0, evening: 0, bedtime: 0 }, schedule: DAILY }, next: { doses: c.newDose ?? { morning: 0, noon: 0, evening: 0, bedtime: 0 }, schedule: DAILY }, reason: 'อื่นๆ', note });
    }
  }
  if (startEvents.length) legacy.startEvents = startEvents;
  if (orphanChanges.length) legacy.orphanDoseChanges = orphanChanges;

  // assignments
  const legacyAssignments: Record<string, unknown> = {};
  const assignments: Assignment[] = v1.assignments.map((a) => {
    const medId = medOfAssignment.get(a.id)!;
    const med = medications.find((m) => m.id === medId)!;
    const active = a.active !== false;
    const out: Assignment = {
      id: a.id,
      medicationId: medId,
      owner: { kind: 'person', personId: a.personId },
      stockQty: typeof a.stockQuantity === 'number' ? a.stockQuantity : null,
      stockUnit: med.baseUnit,
      doses: { ...a.doses },
      doseStep: 0.5,
      schedule: DAILY,
      refillCycleDays: clamp(Math.round(a.targetStockDays ?? 30) || 30, 1, 3650),
      leadDays: clamp(Math.round(a.reorderLeadDays ?? 7), 0, 3650),
      active,
    };
    if (!active) {
      const s = stopOn.get(a.id);
      out.stopped = { on: s?.on ?? bangkokDate(str(a.updatedAt) || str(a.startDate) || '1970-01-01'), reason: 'อื่นๆ', note: s?.note || NOTE_OLD };
    }
    legacyAssignments[a.id] = { frequency: str(a.frequency), startDate: str(a.startDate), prescriber: str(a.prescriber), notes: str(a.notes), packageUnit: str(a.packageUnit), packageSize: a.packageSize ?? null, createdAt: str(a.createdAt), updatedAt: str(a.updatedAt) };
    return out;
  });
  legacy.assignments = legacyAssignments;

  // pharmacies: fixed shipping → fee; variable (or unknown) → null = unknown, never invented
  const templatesFromPharmacies: Record<string, string> = {};
  const pharmacies = v1.pharmacies.map((p) => {
    const out: RootV3['pharmacies'][number] = { id: p.id, name: p.name, shippingFee: p.shippingMode === 'fixed' && typeof p.shippingCost === 'number' && p.shippingCost >= 0 ? p.shippingCost : null, freeShippingOver: null, active: p.active !== false };
    if (str(p.contact)) out.note = str(p.contact);
    if (str(p.phone)) out.phone = str(p.phone);
    if (str(p.lineHandle)) out.line = str(p.lineHandle);
    if (str(p.address)) out.address = str(p.address);
    if (str(p.orderTemplate).trim()) templatesFromPharmacies[p.id] = str(p.orderTemplate); // old {{items}} placeholders differ → kept, not converted
    if (p.shippingMode === 'variable') legacy.variableShippingPharmacies = [...((legacy.variableShippingPharmacies as string[]) ?? []), p.id];
    return out;
  });
  if (Object.keys(templatesFromPharmacies).length) legacy.pharmacyTemplates = templatesFromPharmacies;

  if (v1.session !== undefined) legacy.session = v1.session;
  if (v1.orders?.length) legacy.orders = v1.orders;
  if (v1.notes?.length) legacy.notes = v1.notes;
  if (v1.orderPlan !== undefined) legacy.orderPlan = v1.orderPlan;
  if (v1.seeded !== undefined) legacy.seeded = v1.seeded;
  const s = v1.settings ?? {};
  legacy.settings = { deliveryAddress: str(s.deliveryAddress), recipient: str(s.recipient), recipientPhone: str(s.recipientPhone), targetDays: s.targetDays ?? null, warnDays: s.warnDays ?? null };

  const data: Root = {
    version: 3,
    household: { name: 'บ้านของเรา' },
    persons,
    allergies,
    medications,
    assignments,
    changes,
    pharmacies,
    templates: [
      { id: 't1', name: 'แบบทั่วไป', body: 'สวัสดีครับ/ค่ะ {ร้านยา}\nขอสั่งยาตามรายการนี้\n{รายการยา}\nรบกวนแจ้งราคารวมและเวลารับยาด้วย ขอบคุณครับ/ค่ะ' },
      { id: 't2', name: 'แบบสั้น', body: '{ร้านยา} ขอสั่งยา\n{รายการยา}\nขอบคุณครับ/ค่ะ' },
    ],
    settings: { reminderDays: clamp(Math.round(typeof s.warnDays === 'number' ? s.warnDays : 7) || 7, 1, 30), expiryWarnDays: 30, selectedTemplateId: 't1', shares: { list: true, schedule: true, doses: true, stock: false, days: false } },
    orderDrafts: [],
    legacy: legacy as Root['legacy'],
  };
  const check = RootV3.safeParse(data);
  if (!check.success) return { ok: false, error: `ผลการแปลงไม่ผ่านการตรวจ: ${check.error.issues[0]?.path.join('.') || 'root'}` };
  return { ok: true, data: check.data };
}
