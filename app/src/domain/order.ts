// Ordering: which medicines to buy, how much, which pharmacy is cheapest, and the message text (PR-1…PR-10).
import { compareShops, purchasePlan, targetQuantity, type ShopLine } from './calc';
import { medTitle } from './format';
import { lowAssignments, medOf, personById, stockInBase } from './selectors';
import type { AppData, Assignment, Medication, MessageTemplate } from './schema';

export type OrderLine = { a: Assignment; med: Medication; qtyBase: number; packs: number | null; personName: string };
export const baht = (n: number): string => `฿${(Math.round(n * 100) / 100).toLocaleString('en-US')}`;

/** one line per running medicine that is low; quantity = what fills the refill cycle (DS-8, L-6). Lines needing 0 are left out. */
export function orderLines(d: AppData, today: string, personId: string | null): OrderLine[] {
  const out: OrderLine[] = [];
  for (const a of lowAssignments(d, today)) {
    if (personId && !(a.owner.kind === 'person' && a.owner.personId === personId)) continue;
    const med = medOf(d, a); if (!med || !a.schedule) continue;
    const target = targetQuantity({ doses: a.doses, schedule: a.schedule, today, targetDays: a.refillCycleDays });
    const plan = purchasePlan({ target, stock: stockInBase(a, med) ?? 0, packageSize: med.packSize });
    if (plan.actual <= 0) continue;
    out.push({ a, med, qtyBase: plan.actual, packs: plan.packages, personName: a.owner.kind === 'person' ? personById(d, a.owner.personId)?.name ?? '' : '' });
  }
  return out;
}

export const qtyText = (l: OrderLine): string => `${l.qtyBase} ${l.med.baseUnit}${l.packs ? ` (${l.packs} ${l.med.packUnit})` : ''}`;

export function compareOrder(d: AppData, lines: OrderLine[]) {
  const shop: ShopLine[] = lines.map((l) => ({ id: l.a.id, item: { baseUnit: l.med.baseUnit, packUnit: l.med.packUnit, packSize: l.med.packSize }, qtyBase: l.qtyBase, prices: l.med.prices }));
  return compareShops(shop, d.pharmacies.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name, shipping: p.shippingFee, freeOver: p.freeShippingOver })));
}

export const orderItemsText = (lines: OrderLine[]): string =>
  lines.length ? lines.map((l, i) => `${i + 1}) ${medTitle(l.med)} x ${qtyText(l)}${l.personName ? ` (${l.personName})` : ''}`).join('\n') : '(ยังไม่มียาที่ต้องสั่ง)';

export const PLACEHOLDERS = ['{ร้านยา}', '{รายการยา}', '{ผู้สั่ง}'] as const;
export const fillTemplate = (body: string, pharmacyName: string, lines: OrderLine[], orderer: string): string =>
  body.replace(/\{ร้านยา\}/g, pharmacyName).replace(/\{รายการยา\}/g, orderItemsText(lines)).replace(/\{ผู้สั่ง\}/g, orderer);

export const templateError = (name: string, body: string): string => (!name.trim() ? 'ใส่ชื่อแบบฟอร์มก่อน' : !body.trim() ? 'ใส่ข้อความก่อน' : '');
/** edit one template, or add a new one when id is null */
export function saveTemplate(d: AppData, id: string | null, name: string, body: string, newId: string): AppData {
  const t: MessageTemplate = { id: id ?? newId, name: name.trim(), body };
  return { ...d, templates: id ? d.templates.map((x) => (x.id === id ? t : x)) : [...d.templates, t] };
}
export const selectTemplate = (d: AppData, id: string): AppData => (d.templates.some((t) => t.id === id) ? { ...d, settings: { ...d.settings, selectedTemplateId: id } } : d);
export const currentTemplate = (d: AppData): MessageTemplate => d.templates.find((t) => t.id === d.settings.selectedTemplateId) ?? d.templates[0]!;
