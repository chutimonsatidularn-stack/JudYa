// JudYa — reference calculation module (pure functions, no DOM, no storage).
// Written to match docs/requirements.md (DS-1..DS-14, L-5..L-7) and ADR-0004.
// Claude Code: port to TypeScript as-is (same names), keep it free of UI code, keep the tests green.
// Dates are calendar dates 'YYYY-MM-DD' in Asia/Bangkok. Day differences use Date.UTC(y,m-1,d) of the
// calendar PARTS only (never local-time milliseconds), so DST/timezone cannot shift a day (DS-14).

export const CAP_DAYS = 3650;

export const parseDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; };
export const dayNum = (iso) => { const { y, m, d } = parseDate(iso); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
export const addDays = (iso, n) => { const t = new Date((dayNum(iso) + n) * 86400000); return t.toISOString().slice(0, 10); };
export const diffDays = (a, b) => dayNum(b) - dayNum(a); // b - a
export const dow = (iso) => new Date(dayNum(iso) * 86400000).getUTCDay(); // 0 = Sunday
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** schedule = {kind:'daily'} | {kind:'weekdays',days:[0..6]} | {kind:'interval',everyNDays:n>=2,anchorDate} | {kind:'monthDays',days:[1..31]} */
export function isTakeDay(schedule, iso) {
  switch (schedule.kind) {
    case 'daily': return true;
    case 'weekdays': return schedule.days.includes(dow(iso));
    case 'interval': { const n = schedule.everyNDays, k = diffDays(schedule.anchorDate, iso); return n >= 2 && k >= 0 && k % n === 0; }
    case 'monthDays': { const { d } = parseDate(iso); return schedule.days.includes(d); } // a short month simply has no such day (skipped, DS-4)
    default: return false;
  }
}

export const validateSchedule = (s) => {
  if (!s || typeof s !== 'object') return false;
  if (s.kind === 'daily') return true;
  if (s.kind === 'weekdays') return Array.isArray(s.days) && s.days.length > 0 && s.days.every((x) => Number.isInteger(x) && x >= 0 && x <= 6);
  if (s.kind === 'interval') return Number.isInteger(s.everyNDays) && s.everyNDays >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(s.anchorDate || '');
  if (s.kind === 'monthDays') return Array.isArray(s.days) && s.days.length > 0 && s.days.every((x) => Number.isInteger(x) && x >= 1 && x <= 31);
  return false;
};

export const DOSE_SLOTS = ['morning', 'noon', 'evening', 'bedtime'];
export const doseTotal = (doses) => DOSE_SLOTS.reduce((a, k) => a + (Number(doses[k]) || 0), 0);

/** Day-by-day stock walk (DS-7). Never use an average.
 * Returns {status, daysRemaining, depletionDate}. status: 'ok' | 'noStock' | 'noDose' | 'beyondCap'
 * depletionDate = first day whose scheduled dose cannot be covered; daysRemaining = calendar days from today to it. */
export function stockWalk({ stock, doses, schedule, today, cap = CAP_DAYS }) {
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
export const reorderDate = (depletionDate, leadDays) => (depletionDate ? addDays(depletionDate, -leadDays) : null);

/** DS-8: sum of scheduled doses on every day inside [today, today+targetDays). */
export function targetQuantity({ doses, schedule, today, targetDays }) {
  const per = doseTotal(doses); let q = 0;
  for (let i = 0; i < targetDays; i++) if (isTakeDay(schedule, addDays(today, i))) q += per;
  return q;
}
/** L-6. packageSize may be null/0 (unknown): then no rounding to full packs. */
export function purchasePlan({ target, stock, packageSize }) {
  const additional = Math.max(target - stock, 0);
  if (!packageSize) return { additional, packages: null, actual: additional };
  const packages = Math.max(0, Math.ceil(additional / packageSize - 1e-9)) || 0; // `|| 0` turns -0 into 0
  return { additional, packages, actual: packages * packageSize };
}

/** Price unit conversion. item = {baseUnit, packUnit, packSize|null}; price = {price, unit}; qtyBase = base units to buy.
 * Returns THB or null when the price unit matches neither base nor pack unit (=> "เทียบไม่ได้"), never a guess. */
export function lineCost(item, price, qtyBase) {
  if (!price || price.price == null || !(qtyBase > 0)) return null;
  if (price.unit === item.baseUnit) return price.price * qtyBase;
  if (price.unit === item.packUnit && item.packSize) return price.price * Math.ceil(qtyBase / item.packSize - 1e-9);
  return null;
}
/** L-7. lines=[{id,item,qtyBase,prices:[{pharmacyId,price,unit}]}], pharmacies=[{id,name,shipping:number|null,freeOver:number|null}]
 * A pharmacy is rankable only if every line is priced AND shipping is known (0 = pickup). Cheapest first.
 * Also reports an optional split-order hint when buying each line at its cheapest pharmacy (shipping per used pharmacy) beats the best single shop. */
export function compareShops(lines, pharmacies) {
  const priceOf = (ln, ph) => lineCost(ln.item, ln.prices.find((x) => x.pharmacyId === ph.id), ln.qtyBase);
  const rows = pharmacies.map((ph) => {
    let sub = 0; const missing = [];
    for (const ln of lines) { const c = priceOf(ln, ph); if (c == null) missing.push(ln.id); else sub += c; }
    const fee = ph.shipping == null ? null : (ph.freeOver != null && sub >= ph.freeOver ? 0 : ph.shipping);
    return { pharmacy: ph, sub, missing, fee, total: fee == null ? null : sub + fee, ok: lines.length > 0 && !missing.length && fee != null };
  });
  const ranked = rows.filter((r) => r.ok).sort((a, b) => a.total - b.total);
  let split = null;
  if (lines.length > 1 && ranked.length) {
    let total = 0, fail = false; const used = new Map();
    for (const ln of lines) {
      let best = null;
      for (const r of rows) { if (r.pharmacy.shipping == null) continue; const c = priceOf(ln, r.pharmacy); if (c != null && (best == null || c < best.c)) best = { c, ph: r.pharmacy }; }
      if (!best) { fail = true; break; }
      total += best.c; used.set(best.ph.id, { ph: best.ph, sub: (used.get(best.ph.id)?.sub || 0) + best.c });
    }
    if (!fail) {
      let fee = 0; for (const u of used.values()) fee += u.ph.freeOver != null && u.sub >= u.ph.freeOver ? 0 : u.ph.shipping;
      if (used.size > 1 && total + fee < ranked[0].total) split = { total: total + fee, pharmacies: [...used.values()].map((u) => u.ph.id) };
    }
  }
  return { rows, best: ranked[0] || null, next: ranked[1] || null, split };
}

/** Common household medicines are reminded by EXPIRY, not by stock (owner, review round 7). */
export const EXPIRY_WARN_DAYS = 30;
export const expiryStatus = (expiryIso, today) => {
  if (!expiryIso) return { status: 'unknown', days: null };
  const days = diffDays(today, expiryIso);
  return { status: days < 0 ? 'expired' : days <= EXPIRY_WARN_DAYS ? 'soon' : 'ok', days };
};

/** Allergy match is by GENERIC name (case-insensitive, either contains the other, >= 3 chars), so every brand is covered. */
export const allergyHits = (genericName, allergies) => {
  const n = (genericName || '').trim().toLowerCase(); if (n.length < 3) return [];
  return allergies.filter((a) => { const d = a.drug.toLowerCase(); return d.includes(n) || n.includes(d); });
};

/** Dose-change diff (for the confirm sheet and the history entry). */
export const diffSchedule = (a, b) => {
  const out = [];
  if (JSON.stringify(a.schedule) !== JSON.stringify(b.schedule)) out.push({ field: 'schedule', from: a.schedule, to: b.schedule });
  for (const k of DOSE_SLOTS) if ((a.doses[k] || 0) !== (b.doses[k] || 0)) out.push({ field: k, from: a.doses[k] || 0, to: b.doses[k] || 0 });
  return out;
};
