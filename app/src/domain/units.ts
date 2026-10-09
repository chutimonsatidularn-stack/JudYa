// Forms, units and the equivalence note (BR-3…BR-6).
import { qf } from './format';
import type { Medication } from './schema';

export const BASE_UNITS = ['เม็ด', 'แคปซูล', 'ซอง', 'มล.', 'กรัม', 'แผ่น'] as const;
export const PACK_UNITS = ['แผง', 'กล่อง', 'ขวด', 'หลอด', 'แพ็ก', 'ถุง'] as const;
export type FormName = Medication['form'];
/** BR-4: the form sets the default units (the user can change them) */
export const FORMS: { name: FormName; base: Medication['baseUnit']; pack: Medication['packUnit'] }[] = [
  { name: 'เม็ด', base: 'เม็ด', pack: 'แผง' },
  { name: 'แคปซูล', base: 'แคปซูล', pack: 'แผง' },
  { name: 'ผงชง/ซอง', base: 'ซอง', pack: 'กล่อง' },
  { name: 'น้ำ/ไซรัป', base: 'มล.', pack: 'ขวด' },
  { name: 'ยาหยอด/พ่น', base: 'มล.', pack: 'ขวด' },
  { name: 'ครีม/ขี้ผึ้ง', base: 'กรัม', pack: 'หลอด' },
  { name: 'แผ่นแปะ', base: 'แผ่น', pack: 'กล่อง' },
];
export const formUnits = (f: string) => FORMS.find((x) => x.name === f) ?? (FORMS[0] as (typeof FORMS)[number]);

/** unit choices: the two that match the pack come first (BR-4) */
export function unitGroups(base: string, pack: string): { group: string; items: string[] }[] {
  const match = [...new Set([base, pack])];
  return [{ group: 'ตรงกับขนาดบรรจุ', items: match }, { group: 'หน่วยอื่น', items: [...BASE_UNITS, ...PACK_UNITS].filter((u) => !match.includes(u)) }];
}

export type Equivalence = { kind: 'info' | 'warn'; text: string } | null;
/** the line under "จำนวนที่เหลือ": what the stock equals, or why days cannot be calculated (BR-6) */
export function equivalence(o: { qty: number | null; unit: string; base: string; pack: string; packSize: number | null }): Equivalence {
  if (!o.packSize) return { kind: 'info', text: 'ยังไม่ระบุขนาดบรรจุ ระบบจะไม่ปัดจำนวนซื้อเป็นแพ็กเต็ม' };
  if (o.unit === o.base) return o.qty == null ? null : { kind: 'info', text: `เท่ากับ ${+(o.qty / o.packSize).toFixed(1)} ${o.pack}` };
  if (o.unit === o.pack) return o.qty == null ? null : { kind: 'info', text: `เท่ากับ ${qf(o.qty * o.packSize)} ${o.base}` };
  return { kind: 'warn', text: `หน่วย ${o.unit} ไม่ตรงกับขนาดบรรจุ เลือกหน่วยเป็น ${o.base} หรือ ${o.pack} เพื่อให้คำนวณวันที่พอทานได้` };
}
