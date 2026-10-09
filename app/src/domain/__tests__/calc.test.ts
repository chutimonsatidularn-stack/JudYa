// @ts-nocheck — ported 1:1 from reference/calc.test.mjs (loose object literals); the module itself is fully typed.
import assert from 'node:assert/strict';
import { it } from 'vitest';
import * as c from '../calc';
const T = '2026-10-08'; // a Thursday
const d1 = { morning: 1, noon: 0, evening: 0, bedtime: 0 };
const t = (name, fn) => it(name, fn);

t('dates: Thursday, month length, no UTC drift', () => {
  assert.equal(c.dow(T), 4); assert.equal(c.daysInMonth(2026, 2), 28); assert.equal(c.addDays('2026-10-31', 1), '2026-11-01'); assert.equal(c.diffDays('2026-03-28', '2026-03-30'), 2);
});
t('isTakeDay weekdays Mon/Wed/Fri', () => {
  const s = { kind: 'weekdays', days: [1, 3, 5] }; assert.equal(c.isTakeDay(s, '2026-10-09'), true); assert.equal(c.isTakeDay(s, T), false);
});
t('every other day counts from anchor, no two days in a row at month end (DS-3)', () => {
  const s = { kind: 'interval', everyNDays: 2, anchorDate: '2026-10-07' };
  const take = []; for (let i = 0; i < 40; i++) take.push(c.isTakeDay(s, c.addDays('2026-10-01', i)));
  for (let i = 1; i < take.length; i++) assert.ok(!(take[i] && take[i - 1]));
  assert.equal(c.isTakeDay(s, '2026-10-06'), false); // before anchor
});
t('month days skip short months, not moved (DS-4)', () => {
  const s = { kind: 'monthDays', days: [31] }; assert.equal(c.isTakeDay(s, '2026-11-30'), false); assert.equal(c.isTakeDay(s, '2026-12-31'), true);
});
t('validateSchedule', () => {
  assert.ok(c.validateSchedule({ kind: 'daily' })); assert.ok(!c.validateSchedule({ kind: 'weekdays', days: [] })); assert.ok(!c.validateSchedule({ kind: 'interval', everyNDays: 1, anchorDate: T })); assert.ok(!c.validateSchedule({ kind: 'monthDays', days: [32] }));
});
t('DS-7 daily: 10 tablets, 1/day => 10 days (same as old formula)', () => {
  const r = c.stockWalk({ stock: 10, doses: d1, schedule: { kind: 'daily' }, today: T }); assert.equal(r.daysRemaining, 10); assert.equal(r.depletionDate, '2026-10-18');
});
t('DS-7 Mon/Wed/Fri: 12 tablets => about 28 days, not 12', () => {
  const r = c.stockWalk({ stock: 12, doses: d1, schedule: { kind: 'weekdays', days: [1, 3, 5] }, today: T }); assert.ok(r.daysRemaining >= 26 && r.daysRemaining <= 30, String(r.daysRemaining));
});
t('DS-7 every other day: 10 tablets => about 20 days, not 10', () => {
  const r = c.stockWalk({ stock: 10, doses: d1, schedule: { kind: 'interval', everyNDays: 2, anchorDate: T }, today: T }); assert.equal(r.daysRemaining, 20); // takes on days 0,2,..,18 (10 tablets); first uncovered take-day is day 20
});
t('missing data is reported, never invented (L-10)', () => {
  assert.equal(c.stockWalk({ stock: 5, doses: { morning: 0, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' }, today: T }).status, 'noDose');
  assert.equal(c.stockWalk({ stock: null, doses: d1, schedule: { kind: 'daily' }, today: T }).status, 'noStock');
  assert.equal(c.stockWalk({ stock: 9999, doses: d1, schedule: { kind: 'daily' }, today: T, cap: 30 }).status, 'beyondCap');
});
t('half doses (1/2, 1 1/2) are exact', () => {
  const r = c.stockWalk({ stock: 3, doses: { morning: 1.5, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' }, today: T }); assert.equal(r.daysRemaining, 2);
});
t('reorderDate = depletion - lead days', () => { assert.equal(c.reorderDate('2026-10-18', 7), '2026-10-11'); });
t('DS-8 target quantity and L-6 purchase plan', () => {
  const q = c.targetQuantity({ doses: { morning: 1, noon: 0, evening: 1, bedtime: 0 }, schedule: { kind: 'daily' }, today: T, targetDays: 30 }); assert.equal(q, 60);
  assert.deepEqual(c.purchasePlan({ target: 60, stock: 12, packageSize: 10 }), { additional: 48, packages: 5, actual: 50 });
  assert.deepEqual(c.purchasePlan({ target: 60, stock: 12, packageSize: null }), { additional: 48, packages: null, actual: 48 });
  assert.deepEqual(c.purchasePlan({ target: 10, stock: 12, packageSize: 10 }), { additional: 0, packages: 0, actual: 0 });
});
// ---- pharmacy comparison: the same numbers as the approved prototype demo (review round 5) ----
const losItem = { baseUnit: 'เม็ด', packUnit: 'แผง', packSize: 10 }, metItem = { baseUnit: 'เม็ด', packUnit: 'แผง', packSize: 10 };
const lines = [
  { id: 'los', item: losItem, qtyBase: 30, prices: [{ pharmacyId: 'a', price: 35, unit: 'แผง' }, { pharmacyId: 'b', price: 3.2, unit: 'เม็ด' }] },
  { id: 'met', item: metItem, qtyBase: 60, prices: [{ pharmacyId: 'a', price: 60, unit: 'แผง' }, { pharmacyId: 'b', price: 5.5, unit: 'เม็ด' }, { pharmacyId: 'c', price: 58, unit: 'แผง' }] },
];
const phs = [{ id: 'a', name: 'สุขใจ', shipping: 40, freeOver: 500 }, { id: 'b', name: 'เภสัช', shipping: 30, freeOver: null }, { id: 'c', name: 'ออนไลน์', shipping: 60, freeOver: 300 }];
t('compareShops: totals incl. shipping, cheapest valid first, incomplete shops not ranked', () => {
  const r = c.compareShops(lines, phs); const by = (id) => r.rows.find((x) => x.pharmacy.id === id);
  assert.equal(by('a').sub, 105 + 360); assert.equal(by('a').total, 465 + 40);   // 505
  assert.equal(by('b').sub, 96 + 330); assert.equal(by('b').total, 426 + 30);   // 456
  assert.equal(by('c').ok, false); assert.deepEqual(by('c').missing, ['los']);  // Losartan unpriced at c
  assert.equal(r.best.pharmacy.id, 'b'); assert.equal(r.next.total - r.best.total, 49);
});
t('free shipping threshold and unknown shipping', () => {
  const r = c.compareShops(lines, [{ id: 'a', name: 'a', shipping: 40, freeOver: 400 }, { id: 'b', name: 'b', shipping: null, freeOver: null }]);
  assert.equal(r.rows[0].fee, 0); assert.equal(r.rows[1].ok, false); assert.equal(r.rows[1].fee, null);
});
t('price unit must match base or pack unit, else null (no guessing)', () => {
  assert.equal(c.lineCost(losItem, { price: 100, unit: 'ขวด' }, 30), null);
  assert.equal(c.lineCost({ baseUnit: 'เม็ด', packUnit: 'แผง', packSize: null }, { price: 35, unit: 'แผง' }, 30), null);
});
t('expiry status (house medicines)', () => {
  assert.deepEqual(c.expiryStatus('2026-10-31', T), { status: 'soon', days: 23 }); assert.equal(c.expiryStatus('2026-10-01', T).status, 'expired'); assert.equal(c.expiryStatus('2027-03-01', T).status, 'ok'); assert.equal(c.expiryStatus('', T).status, 'unknown');
});
t('allergy matches generic name across brands', () => {
  const al = [{ drug: 'Penicillin' }]; assert.equal(c.allergyHits('penicillin v', al).length, 1); assert.equal(c.allergyHits('Pe', al).length, 0); assert.equal(c.allergyHits('Aspirin', al).length, 0);
});
t('diffSchedule', () => {
  const a = { schedule: { kind: 'daily' }, doses: { morning: 1 } }, b = { schedule: { kind: 'weekdays', days: [1] }, doses: { morning: 1.5 } };
  assert.equal(c.diffSchedule(a, b).length, 2); assert.equal(c.diffSchedule(a, a).length, 0);
});
