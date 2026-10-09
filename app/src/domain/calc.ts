// JudYa — calculation module (pure functions, no DOM, no storage). TypeScript port of reference/calc.mjs (same names, same results).
// Written to match docs/requirements.md (DS-1..DS-14, L-5..L-7) and ADR-0004.
// Keep it free of UI code; keep the tests (calc.test.ts, ported 1:1 from reference/calc.test.mjs) green.
// Dates are calendar dates 'YYYY-MM-DD' in Asia/Bangkok. Day differences use Date.UTC(y,m-1,d) of the
// calendar PARTS only (never local-time milliseconds), so DST/timezone cannot shift a day (DS-14).
import type { Schedule, Doses } from './schema';

export const CAP_DAYS = 3650;

export const parseDate = (iso: string) => { const [y = 0, m = 1, d = 1] = iso.split('-').map(Number); return { y, m, d }; };
export const dayNum = (iso: string): number => { const { y, m, d } = parseDate(iso); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
export const addDays = (iso: string, n: number): string => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
export const diffDays = (a: string, b: string): number => dayNum(b) - dayNum(a); // b - a
export const dow = (iso: string): number => new Date(dayNum(iso) * 86400000).getUTCDay(); // 0 = Sunday
export const daysInMonth = (y: number, m: number): number => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** schedule = {kind:'daily'} | {kind:'weekdays',days:[0..6]} | {kind:'interval',everyNDays:n>=2,anchorDate} | {kind:'monthDays',days:[1..31]} */
export function isTakeDay(schedule: Schedule, iso: string): boolean {
  switch (schedule.kind) {
    case 'daily': return true;
    case 'weekdays': return schedule.days.includes(dow(iso));
    case 'interval': { const n = schedule.everyNDays, k = diffDays(schedule.anchorDate, iso); return n >= 2 && k >= 0 && k % n === 0; }
    case 'monthDays': { const { d } = parseDate(iso); return schedule.days.includes(d); } // a short month simply has no such day (skipped, DS-4)
    default: return false;
  }
}

export const validateSchedule = (s: unknown): boolean => {
  const x = s as Record<string, unknown> | null;
  if (!x || typeof x !== 'object') return false;
  const ints = (a: unknown, lo: number, hi: number) => Array.isArray(a) && a.length > 0 && a.every((v) => Number.isInteger(v) && v >= lo && v <= hi);
  if (x.kind === 'daily') return true;
  if (x.kind === 'weekdays') return ints(x.days, 0, 6);
  if (x.kind === 'interval') return Number.isInteger(x.everyNDays) && (x.everyNDays as number) >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(String(x.anchorDate ?? ''));
  if (x.kind === 'monthDays') return ints(x.days, 1, 31);
  return false;
};

export const DOSE_SLOTS = ['morning', 'noon', 'evening', 'bedtime'] as const;
export const doseTotal = (doses: Doses): number => DOSE_SLOTS.reduce((a, k) => a + (Number(doses[k]) || 0), 0);

export type StockStatus = 'ok' | 'noStock' | 'noDose' | 'beyondCap';
export type StockResult = { status: StockStatus; daysRemaining: number | null; depletionDate: string | null };

/** Day-by-day stock walk (DS-7). Never use an average.
 * depletionDate = first day whose scheduled dose cannot be covered; daysRemaining = calendar days from today to it. */
export function stockWalk({ stock, doses, schedule, today, cap = CAP_DAYS }: { stock: number | null; doses: Doses; schedule: Schedule; today: string; cap?: number }): StockResult {
  const per = doseTotal(doses);
  if (stock == null || Number.isNaN(stock)) return { status: 'noStock', daysRemaining: null, depletionDate: null };
  if (!(per > 0)) return { status: 'noDose', daysRemaining: null, depletionDate: null };
  let left = stock;
  for (let i = 0; i < cap; i++) {
    const day = addDays(today, i);
    if (!isTakeDay(schedule, day)) continue;
    if (left + 1e-9 < per) return { status: 'ok', daysRemaining: i, depletionDate: day };
    left -= per;
  }
  return { status: 'beyondCap', daysRemaining: null, depletionDate: null };
}
export const reorderDate = (depletionDate: string | null, leadDays: number): string | null => (depletionDate ? addDays(depletionDate, -leadDays) : null);

/** DS-8: sum of scheduled doses on every day inside [today, today+targetDays). */
export function targetQuantity({ doses, schedule, today, targetDays }: { doses: Doses; schedule: Schedule; today: string; targetDays: number }): number {
  const per = doseTotal(doses); let q = 0;
  for (let i = 0; i < targetDays; i++) if (isTakeDay(schedule, addDays(today, i))) q += per;
  return q;
}
/** L-6. packageSize may be null/0 (unknown): then no rounding to full packs. */
export function purchasePlan({ target, stock, packageSize }: { target: number; stock: number; packageSize: number | null }) {
  const additional = Math.max(target - stock, 0);
  if (!packageSize) return { additional, packages: null as number | null, actual: additional };
  const packages = Math.max(0, Math.ceil(additional / packageSize - 1e-9)) || 0; // `|| 0` turns -0 into 0
  return { additional, packages: packages as number | null, actual: packages * packageSize };
}

export type Item = { baseUnit: string; packUnit: string; packSize: number | null };
export type Price = { price: number | null; unit: string; pharmacyId?: string };
/** Price unit conversion. qtyBase = base units to buy.
 * Returns THB or null when the price unit matches neither base nor pack unit (=> "เทียบไม่ได้"), never a guess. */
export function lineCost(item: Item, price: Price | undefined | null, qtyBase: number): number | null {
  if (!price || price.price == null || !(qtyBase > 0)) return null;
  if (price.unit === item.baseUnit) return price.price * qtyBase;
  if (price.unit === item.packUnit && item.packSize) return price.price * Math.ceil(qtyBase / item.packSize - 1e-9);
  return null;
}

export type ShopLine = { id: string; item: Item; qtyBase: number; prices: (Price & { pharmacyId: string })[] };
export type ShopPharmacy = { id: string; name?: string; shipping: number | null; freeOver: number | null };
export type ShopRow = { pharmacy: ShopPharmacy; sub: number; missing: string[]; fee: number | null; total: number | null; ok: boolean };
/** L-7. A pharmacy is rankable only if every line is priced AND shipping is known (0 = pickup). Cheapest first.
 * Also reports an optional split-order hint when buying each line at its cheapest pharmacy (shipping per used pharmacy) beats the best single shop. */
export function compareShops(lines: ShopLine[], pharmacies: ShopPharmacy[]) {
  const priceOf = (ln: ShopLine, ph: ShopPharmacy) => lineCost(ln.item, ln.prices.find((x) => x.pharmacyId === ph.id), ln.qtyBase);
  const rows: ShopRow[] = pharmacies.map((ph) => {
    let sub = 0; const missing: string[] = [];
    for (const ln of lines) { const c = priceOf(ln, ph); if (c == null) missing.push(ln.id); else sub += c; }
    const fee = ph.shipping == null ? null : (ph.freeOver != null && sub >= ph.freeOver ? 0 : ph.shipping);
    return { pharmacy: ph, sub, missing, fee, total: fee == null ? null : sub + fee, ok: lines.length > 0 && !missing.length && fee != null };
  });
  const ranked = rows.filter((r) => r.ok).sort((a, b) => (a.total as number) - (b.total as number));
  let split: { total: number; pharmacies: string[] } | null = null;
  const first = ranked[0];
  if (lines.length > 1 && first) {
    let total = 0, fail = false; const used = new Map<string, { ph: ShopPharmacy; sub: number }>();
    for (const ln of lines) {
      let best: { c: number; ph: ShopPharmacy } | null = null;
      for (const r of rows) { if (r.pharmacy.shipping == null) continue; const c = priceOf(ln, r.pharmacy); if (c != null && (best == null || c < best.c)) best = { c, ph: r.pharmacy }; }
      if (!best) { fail = true; break; }
      total += best.c; used.set(best.ph.id, { ph: best.ph, sub: (used.get(best.ph.id)?.sub || 0) + best.c });
    }
    if (!fail) {
      let fee = 0; for (const u of used.values()) fee += u.ph.freeOver != null && u.sub >= u.ph.freeOver ? 0 : (u.ph.shipping as number);
      if (used.size > 1 && total + fee < (first.total as number)) split = { total: total + fee, pharmacies: [...used.values()].map((u) => u.ph.id) };
    }
  }
  return { rows, best: first ?? null, next: ranked[1] ?? null, split };
}

/** Common household medicines are reminded by EXPIRY, not by stock (owner, review round 7). */
export const EXPIRY_WARN_DAYS = 30;
export const expiryStatus = (expiryIso: string | null | undefined, today: string): { status: 'unknown' | 'expired' | 'soon' | 'ok'; days: number | null } => {
  if (!expiryIso) return { status: 'unknown', days: null };
  const days = diffDays(today, expiryIso);
  return { status: days < 0 ? 'expired' : days <= EXPIRY_WARN_DAYS ? 'soon' : 'ok', days };
};

/** Allergy match is by GENERIC name (case-insensitive, either contains the other, >= 3 chars), so every brand is covered. */
export const allergyHits = <A extends { drug: string }>(genericName: string | null | undefined, allergies: A[]): A[] => {
  const n = (genericName || '').trim().toLowerCase(); if (n.length < 3) return [];
  return allergies.filter((a) => { const d = a.drug.toLowerCase(); return d.includes(n) || n.includes(d); });
};

/** Dose-change diff (for the confirm sheet and the history entry). */
export const diffSchedule = (a: { doses: Doses; schedule: Schedule | null }, b: { doses: Doses; schedule: Schedule | null }) => {
  const out: { field: string; from: unknown; to: unknown }[] = [];
  if (JSON.stringify(a.schedule) !== JSON.stringify(b.schedule)) out.push({ field: 'schedule', from: a.schedule, to: b.schedule });
  for (const k of DOSE_SLOTS) if ((a.doses[k] || 0) !== (b.doses[k] || 0)) out.push({ field: k, from: a.doses[k] || 0, to: b.doses[k] || 0 });
  return out;
};
