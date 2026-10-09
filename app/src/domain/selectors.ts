// What the screens show, computed from the saved data. Pure functions: `today` is a parameter (never the clock).
import { expiryStatus, isTakeDay, stockWalk, reorderDate, doseTotal } from './calc';
import type { AppData, Assignment, Medication, Person } from './schema';

export const members = (d: AppData): Person[] => d.persons.filter((p) => !p.removed);
export const removedMembers = (d: AppData): Person[] => d.persons.filter((p) => p.removed);
export const personById = (d: AppData, id: string): Person | undefined => d.persons.find((p) => p.id === id);
export const medOf = (d: AppData, a: Assignment): Medication | undefined => d.medications.find((m) => m.id === a.medicationId);
const ownerId = (a: Assignment): string | null => (a.owner.kind === 'person' ? a.owner.personId : null);
const ownerActive = (d: AppData, a: Assignment): boolean => { const id = ownerId(a); return id === null || !!(personById(d, id) && !personById(d, id)!.removed); };

/** running (not stopped) medicines of one person */
export const assignmentsOfPerson = (d: AppData, personId: string): Assignment[] => d.assignments.filter((a) => ownerId(a) === personId && a.active);
export const stoppedOfPerson = (d: AppData, personId: string): Assignment[] => d.assignments.filter((a) => ownerId(a) === personId && !a.active);
export const householdAssignments = (d: AppData): Assignment[] => d.assignments.filter((a) => a.owner.kind === 'household' && a.active);
/** every running medicine whose owner is still in the list (or the household) */
export const activeAssignments = (d: AppData): Assignment[] => d.assignments.filter((a) => a.active && ownerActive(d, a));

export type Stock = { status: 'ok' | 'noStock' | 'noDose' | 'beyondCap' | 'unitMismatch' | 'household'; days: number | null; depletionDate: string | null; reorderDate: string | null };
const none = (status: Stock['status']): Stock => ({ status, days: null, depletionDate: null, reorderDate: null });

/** stock in base units (BR-6): base unit as is; pack unit × pack size; anything else is not comparable → null */
export function stockInBase(a: Assignment, med: Medication): number | null {
  if (a.stockQty == null) return null;
  if (a.stockUnit === med.baseUnit) return a.stockQty;
  if (a.stockUnit === med.packUnit && med.packSize) return a.stockQty * med.packSize;
  return null;
}
/** days remaining by the day-by-day walk (DS-7); household medicines have none (HM-2) */
export function stockOf(d: AppData, a: Assignment, today: string): Stock {
  if (!a.schedule) return none('household');
  const med = medOf(d, a);
  if (!med) return none('noStock');
  if (a.stockQty != null && stockInBase(a, med) === null) return none('unitMismatch');
  const r = stockWalk({ stock: stockInBase(a, med), doses: a.doses, schedule: a.schedule, today });
  return { status: r.status, days: r.daysRemaining, depletionDate: r.depletionDate, reorderDate: reorderDate(r.depletionDate, a.leadDays) };
}
export const isLow = (s: Stock, reminderDays: number): boolean => s.status === 'ok' && s.days !== null && s.days <= reminderDays;

/** running medicines that must be bought soon (stock ≤ reminder days) */
export const lowAssignments = (d: AppData, today: string): Assignment[] =>
  activeAssignments(d).filter((a) => a.owner.kind === 'person' && isLow(stockOf(d, a, today), d.settings.reminderDays));

/** fewest days left among a person's medicines, or null when none is known */
export function minDays(d: AppData, personId: string, today: string): number | null {
  const v = assignmentsOfPerson(d, personId).map((a) => stockOf(d, a, today).days).filter((x): x is number => x !== null);
  return v.length ? Math.min(...v) : null;
}

/** does the medicine have a dose to take today (schedule + a dose > 0)? */
export const takesToday = (a: Assignment, today: string): boolean => !!a.schedule && doseTotal(a.doses) > 0 && isTakeDay(a.schedule, today);
export const restsToday = (a: Assignment, today: string): boolean => !!a.schedule && doseTotal(a.doses) > 0 && !isTakeDay(a.schedule, today);
/** medicines to prepare today for one person (self-managed members are left out, MB-2) */
export const dueToday = (d: AppData, personId: string, today: string): Assignment[] => {
  const p = personById(d, personId);
  return !p || p.removed || p.selfManaged ? [] : assignmentsOfPerson(d, personId).filter((a) => takesToday(a, today));
};
export const restToday = (d: AppData, personId: string, today: string): Assignment[] => {
  const p = personById(d, personId);
  return !p || p.removed || p.selfManaged ? [] : assignmentsOfPerson(d, personId).filter((a) => restsToday(a, today));
};

export type PersonSummary = { self: boolean; due: number; buy: number };
export const personSummary = (d: AppData, personId: string, today: string): PersonSummary => ({
  self: !!personById(d, personId)?.selfManaged,
  due: dueToday(d, personId, today).length,
  buy: assignmentsOfPerson(d, personId).filter((a) => isLow(stockOf(d, a, today), d.settings.reminderDays)).length,
});

/** household medicines to look at: expired or ≤ 30 days to expiry (HM-2) */
export const expiringHousehold = (d: AppData, today: string): { a: Assignment; days: number }[] =>
  householdAssignments(d).flatMap((a) => { const e = expiryStatus(a.expiryDate, today); return e.days !== null && (e.status === 'soon' || e.status === 'expired') ? [{ a, days: e.days }] : []; });

/** today's tick keys are "<assignmentId>:<period>" and only count for today */
export const doneToday = (d: AppData, today: string): Set<string> => new Set(d.ticks && d.ticks.date === today ? d.ticks.done : []);
export type Task = { key: string; assignment: Assignment; period: string; amount: number; personId: string };
export function tasksToday(d: AppData, today: string, personFilter: string | 'all' = 'all'): Task[] {
  const out: Task[] = [];
  for (const p of members(d)) {
    if (personFilter !== 'all' && p.id !== personFilter) continue;
    for (const a of dueToday(d, p.id, today)) for (const k of (['morning', 'noon', 'evening', 'bedtime'] as const)) if (a.doses[k] > 0) out.push({ key: `${a.id}:${k}`, assignment: a, period: k, amount: a.doses[k], personId: p.id });
  }
  return out;
}

/** bell count (NV-3): 1 if anyone has pills today + low-stock medicines + expiring household medicines */
export const notifCount = (d: AppData, today: string): number =>
  (members(d).some((p) => dueToday(d, p.id, today).length > 0) ? 1 : 0) + lowAssignments(d, today).length + expiringHousehold(d, today).length;

/** UI-10: reminder > family > normal (owner confirmed 2026-10-08). Pure; inputs are counts. */
export type BannerState = 'normal' | 'reminder' | 'family';
export function getHomeBannerState(i: { lowCount?: number; dueNow?: number; othersOpen?: number } | null | undefined): BannerState {
  if (!i) return 'normal';
  if ((i.lowCount ?? 0) > 0 || (i.dueNow ?? 0) > 0) return 'reminder';
  if ((i.othersOpen ?? 0) > 0) return 'family';
  return 'normal';
}
export function homeBannerInput(d: AppData, today: string) {
  const done = doneToday(d, today);
  const dueNow = tasksToday(d, today).filter((t) => !done.has(t.key)).length;
  const others = members(d).filter((p) => p.relationship !== 'ตัวฉัน' && (dueToday(d, p.id, today).length > 0 || personSummary(d, p.id, today).buy > 0)).length;
  return { lowCount: lowAssignments(d, today).length, dueNow, othersOpen: others };
}
