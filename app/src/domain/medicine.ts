// The add/edit-medicine form as data (strings as typed), and saving it. Three screens share one draft: 08 → 08d / 08c → 08.
import { allergyHits, isTakeDay, validateSchedule } from './calc';
import type { FormName } from './units';
import type { AppData, Assignment, Doses, Medication, Schedule } from './schema';
import { members, personById } from './selectors';

export const HOUSE = 'house'; // owner value for "ยาสามัญประจำบ้าน" (HM-1)
export const ZERO: Doses = { morning: 0, noon: 0, evening: 0, bedtime: 0 };
export const REASONS = ['แพทย์สั่งปรับ', 'เภสัชกรแนะนำ', 'ผลตรวจเลือดหรือผลตรวจอื่น', 'มีผลข้างเคียง', 'อื่นๆ'] as const;
export const STOP_REASONS = ['แพทย์สั่งหยุด', 'หายแล้ว ไม่ต้องใช้แล้ว', 'มีผลข้างเคียง', 'แพ้ยา', 'เปลี่ยนไปใช้ยาอื่น', 'อื่นๆ'] as const;

export type PriceDraft = { pharmacyId: string; price: string; unit: string };
export type MedDraft = {
  key: string; // 'new' or the assignment id
  generic: string; brand: string; strength: string;
  owner: string; // person id or HOUSE
  form: FormName; stockQty: string; stockUnit: string; expiry: string;
  baseUnit: string; packUnit: string; packSize: string;
  cycle: string; lead: string; prices: PriceDraft[];
  schedule: Schedule; doses: Doses; doseStep: 1 | 0.5 | 0.25;
  base: { schedule: Schedule; doses: Doses } | null; // what is saved now (null for a new medicine) — dose changes are compared with it
  reason: string; reasonNote: string; from: string;
};

export const newDraft = (owner: string, from: string): MedDraft => ({
  key: 'new', generic: '', brand: '', strength: '', owner, form: 'เม็ด', stockQty: '', stockUnit: 'เม็ด', expiry: '',
  baseUnit: 'เม็ด', packUnit: 'แผง', packSize: '', cycle: '30', lead: '7', prices: [],
  schedule: { kind: 'daily' }, doses: { ...ZERO }, doseStep: 0.5, base: null, reason: '', reasonNote: '', from,
});

export function draftFromAssignment(d: AppData, a: Assignment, from: string): MedDraft | null {
  const m = d.medications.find((x) => x.id === a.medicationId); if (!m) return null;
  const schedule: Schedule = a.schedule ?? { kind: 'daily' };
  return {
    key: a.id, generic: m.generic, brand: m.brand ?? '', strength: m.strength, owner: a.owner.kind === 'person' ? a.owner.personId : HOUSE,
    form: m.form, stockQty: a.stockQty == null ? '' : String(a.stockQty), stockUnit: a.stockUnit, expiry: a.expiryDate ?? '',
    baseUnit: m.baseUnit, packUnit: m.packUnit, packSize: m.packSize == null ? '' : String(m.packSize),
    cycle: String(a.refillCycleDays), lead: String(a.leadDays), prices: m.prices.map((p) => ({ pharmacyId: p.pharmacyId, price: String(p.price), unit: p.unit })),
    schedule, doses: { ...a.doses }, doseStep: a.doseStep, base: { schedule, doses: { ...a.doses } }, reason: '', reasonNote: '', from,
  };
}

const num = (s: string): number | null => { const t = s.trim(); if (t === '') return null; const n = Number(t); return Number.isFinite(n) ? n : NaN; };
export const isHouse = (x: MedDraft) => x.owner === HOUSE;

/** the one thing to fix first, or '' when the medicine can be saved (SEC-2 limits) */
export function medError(x: MedDraft): string {
  if (!x.generic.trim()) return 'ใส่ชื่อยาก่อน';
  if (x.generic.trim().length > 40 || x.brand.trim().length > 40) return 'ชื่อยาหรือยี่ห้อยาวเกิน 40 ตัวอักษร';
  if (x.strength.trim().length > 20) return 'ความแรงยาวเกิน 20 ตัวอักษร';
  const q = num(x.stockQty); if (q !== null && (Number.isNaN(q) || q < 0 || q > 9999)) return 'จำนวนที่เหลือต้องเป็นตัวเลข 0–9999';
  const ps = num(x.packSize); if (ps !== null && (Number.isNaN(ps) || ps < 1 || ps > 1000)) return 'ขนาดต่อแพ็กต้องเป็นตัวเลข 1–1000';
  if (!isHouse(x)) {
    const c = num(x.cycle); if (c === null || Number.isNaN(c) || c < 1 || c > 365 || !Number.isInteger(c)) return 'รอบเติมยาต้องเป็น 1–365 วัน';
    const l = num(x.lead); if (l === null || Number.isNaN(l) || l < 0 || l > 90 || !Number.isInteger(l)) return 'สั่งล่วงหน้าต้องเป็น 0–90 วัน';
    if (!validateSchedule(x.schedule)) return 'ตารางทานยายังไม่ครบ (เลือกวันอย่างน้อย 1 วัน)';
  }
  for (const p of x.prices) { const v = num(p.price); if (v !== null && (Number.isNaN(v) || v < 0 || v > 1_000_000)) return 'ราคาต้องเป็นตัวเลขไม่ติดลบ'; }
  return '';
}

/** red warning "ระวัง: <คน> เคยแพ้ <ยา>" when the generic name matches an allergy of the owner (household: everyone) (AL-6) */
export function allergyWarnings(d: AppData, x: MedDraft): { person: string; drug: string; symptoms: string[] }[] {
  const people = isHouse(x) ? members(d) : [personById(d, x.owner)].filter((p): p is NonNullable<typeof p> => !!p);
  return people.flatMap((p) => allergyHits(x.generic, d.allergies.filter((a) => a.personId === p.id)).map((a) => ({ person: p.name, drug: a.drug, symptoms: [...a.symptoms] })));
}

/** summary line on card 08d */
export function buySummary(x: MedDraft): string {
  const ps = num(x.packSize);
  return [ps ? `1 ${x.packUnit} = ${ps} ${x.baseUnit}` : 'ยังไม่ระบุขนาดบรรจุ', ...(isHouse(x) ? [] : [`เติมทุก ${x.cycle} วัน`]), x.prices.filter((p) => num(p.price) !== null).length ? `ราคา ${x.prices.filter((p) => num(p.price) !== null).length} ร้าน` : 'ยังไม่มีราคา'].join(' · ');
}

/** does the draft's schedule/dose differ from what is saved? (existing medicines only) */
export const doseChanged = (x: MedDraft): boolean => !!x.base && !isHouse(x) && (JSON.stringify(x.base.schedule) !== JSON.stringify(x.schedule) || JSON.stringify(x.base.doses) !== JSON.stringify(x.doses));
export const isNewDraft = (x: MedDraft) => x.key === 'new';

const sameProduct = (m: Medication, o: { generic: string; brand: string; strength: string }) => m.generic.trim().toLowerCase() === o.generic.trim().toLowerCase() && (m.brand ?? '').trim().toLowerCase() === o.brand.trim().toLowerCase() && m.strength.trim().toLowerCase() === o.strength.trim().toLowerCase();

/** Save the form. New: reuse an existing entry only when it is the same product with identical packaging (L-3), else a new entry.
 *  Existing: update the (shared) medicine entry and this assignment. Dose/schedule changes of an existing medicine are NOT written here —
 *  they go through applyDoseChange with a reason (SF-4). */
export function saveMedicine(d: AppData, x: MedDraft, ids: { med: string; asg: string }): { data: AppData; assignmentId: string } {
  const house = isHouse(x), ps = num(x.packSize);
  const prices = x.prices.flatMap((p) => { const v = num(p.price); return v === null ? [] : [{ pharmacyId: p.pharmacyId, price: Math.round(v * 100) / 100, unit: p.unit as Medication['prices'][number]['unit'] }]; });
  const entry = (id: string, base?: Medication): Medication => ({ ...(base ?? {}), id, generic: x.generic.trim(), strength: x.strength.trim(), form: x.form, baseUnit: x.baseUnit as Medication['baseUnit'], packUnit: x.packUnit as Medication['packUnit'], packSize: ps, prices, ...(x.brand.trim() ? { brand: x.brand.trim() } : {}) } as Medication);
  const qty = num(x.stockQty);
  const common = { stockQty: qty, stockUnit: x.stockUnit as Assignment['stockUnit'], refillCycleDays: house ? 30 : Number(x.cycle), leadDays: house ? 7 : Number(x.lead), ...(house && x.expiry ? { expiryDate: x.expiry } : {}) };
  const owner: Assignment['owner'] = house ? { kind: 'household' } : { kind: 'person', personId: x.owner };

  if (isNewDraft(x)) {
    const same = d.medications.find((m) => sameProduct(m, x) && m.baseUnit === x.baseUnit && m.packUnit === x.packUnit && m.packSize === ps && m.form === x.form);
    const medId = same ? same.id : ids.med;
    const mergedPrices = same ? [...same.prices.filter((p) => !prices.some((n) => n.pharmacyId === p.pharmacyId)), ...prices] : prices;
    const med = { ...entry(medId, same), prices: mergedPrices };
    const a: Assignment = { id: ids.asg, medicationId: medId, owner, ...common, doses: house ? { ...ZERO } : { ...x.doses }, doseStep: x.doseStep, schedule: house ? null : x.schedule, active: true };
    return { data: { ...d, medications: same ? d.medications.map((m) => (m.id === medId ? med : m)) : [...d.medications, med], assignments: [...d.assignments, a] }, assignmentId: a.id };
  }
  const old = d.assignments.find((a) => a.id === x.key) as Assignment;
  const a: Assignment = { ...old, ...common, owner, doseStep: x.doseStep };
  if (!house && !a.expiryDate) delete a.expiryDate;
  return { data: { ...d, medications: d.medications.map((m) => (m.id === old.medicationId ? entry(m.id, m) : m)), assignments: d.assignments.map((q) => (q.id === old.id ? a : q)) }, assignmentId: old.id };
}

/** SF-4: a dose / schedule change of an existing medicine: one history entry (previous + next + reason), then the assignment is updated */
export function applyDoseChange(d: AppData, assignmentId: string, next: { doses: Doses; schedule: Schedule; doseStep?: 1 | 0.5 | 0.25 }, reason: string, note: string, today: string, id: string, at: string): AppData {
  const a = d.assignments.find((q) => q.id === assignmentId); if (!a || !a.schedule) return d;
  const entry = { id, assignmentId, on: today, at, kind: 'dose' as const, previous: { doses: { ...a.doses }, schedule: a.schedule }, next: { doses: { ...next.doses }, schedule: next.schedule }, reason: reason as (typeof REASONS)[number], ...(note.trim() ? { note: note.trim() } : {}) };
  return { ...d, changes: [...d.changes, entry], assignments: d.assignments.map((q) => (q.id === assignmentId ? { ...q, doses: { ...next.doses }, schedule: next.schedule, ...(next.doseStep ? { doseStep: next.doseStep } : {}) } : q)) };
}

/** helpers for the schedule editor */
export type Mode = 'daily' | 'weekdays' | 'alternate' | 'everyN' | 'monthDays';
export const MODES: [Mode, string][] = [['daily', 'ทุกวัน'], ['weekdays', 'เลือกวัน'], ['alternate', 'วันเว้นวัน'], ['everyN', 'ทุกกี่วัน'], ['monthDays', 'วันที่ของเดือน']];
export const modeOf = (s: Schedule): Mode => (s.kind === 'interval' ? (s.everyNDays === 2 ? 'alternate' : 'everyN') : s.kind);
export function withMode(s: Schedule, mode: Mode, today: string): Schedule {
  if (modeOf(s) === mode) return s;
  switch (mode) {
    case 'daily': return { kind: 'daily' };
    case 'weekdays': return { kind: 'weekdays', days: [] };
    case 'alternate': return { kind: 'interval', everyNDays: 2, anchorDate: s.kind === 'interval' ? s.anchorDate : today };
    case 'everyN': return { kind: 'interval', everyNDays: s.kind === 'interval' && s.everyNDays > 2 ? s.everyNDays : 3, anchorDate: s.kind === 'interval' ? s.anchorDate : today };
    case 'monthDays': return { kind: 'monthDays', days: [] };
  }
}
export const toggleIn = (a: number[], v: number): number[] => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v].sort((p, q) => p - q));
/** 7-day take/rest preview for the interval modes (DS-6) */
export const preview7 = (s: Schedule, today: string, addDays: (iso: string, n: number) => string): { date: string; take: boolean }[] => Array.from({ length: 7 }, (_, i) => { const date = addDays(today, i); return { date, take: isTakeDay(s, date) }; });
