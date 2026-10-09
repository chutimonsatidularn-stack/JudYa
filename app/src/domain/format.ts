// Thai text helpers shared by every screen (one place, one wording).
import { addDays, dow, isTakeDay, parseDate } from './calc';
import type { Assignment, Doses, Medication, Schedule } from './schema';

const FRAC: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };
/** 1.5 → "1½", 0.25 → "¼", 2 → "2" (doses step by 1, ½ or ¼; L-4) */
export function fr(n: number): string {
  const w = Math.floor(n + 1e-9), f = +(n - w).toFixed(2), q = FRAC[String(f)];
  return (w || !q ? String(w) : '') + (q ?? '');
}
/** stock quantity: fractions when they fit, else the plain number */
export const qf = (n: number): string => (Number.isInteger(n) || FRAC[String(+(n % 1).toFixed(2))] ? fr(n) : String(n));

export const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const DAY_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
/** '31 ต.ค. 2569' */
export const thDate = (iso: string): string => { const { y, m, d } = parseDate(iso); return `${d} ${MONTHS[m - 1]} ${y + 543}`; };
const thDayMonth = (iso: string): string => { const { m, d } = parseDate(iso); return `${d} ${MONTHS[m - 1]}`; };
export const joinTh = (a: string[]): string => (a.length < 2 ? a.join('') : a.slice(0, -1).join(' ') + ' และ ' + a[a.length - 1]);

/** First take-day strictly after today (looks ahead one year), or null */
export function nextTakeDate(schedule: Schedule, today: string): string | null {
  for (let i = 1; i <= 400; i++) { const d = addDays(today, i); if (isTakeDay(schedule, d)) return d; }
  return null;
}
/** One-line Thai summary of a schedule (DS-6) */
export function scheduleSummary(schedule: Schedule | null, today: string): string {
  if (!schedule) return 'ใช้เมื่อมีอาการ';
  switch (schedule.kind) {
    case 'daily': return 'ทุกวัน';
    case 'weekdays': return 'ทุกวัน' + joinTh([...schedule.days].sort((a, b) => a - b).map((d) => DAY_NAMES[d] as string));
    case 'interval': { const n = nextTakeDate(schedule, today); return `${schedule.everyNDays === 2 ? 'วันเว้นวัน' : `ทุก ${schedule.everyNDays} วัน`}${n ? ` ครั้งถัดไป ${thDayMonth(n)}` : ''}`; }
    case 'monthDays': return 'ทุกวันที่ ' + [...schedule.days].sort((a, b) => a - b).join(', ') + ' ของเดือน';
  }
}

export const PERIODS = [['morning', 'เช้า'], ['noon', 'กลางวัน'], ['evening', 'เย็น'], ['bedtime', 'ก่อนนอน']] as const;
export type PeriodKey = (typeof PERIODS)[number][0];
/** periods with a dose > 0 */
export const periodsOf = (doses: Doses): { key: PeriodKey; label: string; amount: number }[] =>
  PERIODS.filter(([k]) => doses[k] > 0).map(([key, label]) => ({ key, label, amount: doses[key] }));
/** "เช้า 1 เม็ด · เย็น 1 เม็ด" */
export const doseText = (doses: Doses, unit: string): string => { const p = periodsOf(doses).map((x) => `${x.label} ${fr(x.amount)} ${unit}`); return p.length ? p.join(' · ') : 'ยังไม่ได้ตั้งขนาดยา'; };
/** "ทุกวัน · เช้า 1 เม็ด" */
export const scheduleDoseText = (schedule: Schedule | null, doses: Doses, unit: string, today: string): string => `${scheduleSummary(schedule, today)} · ${doseText(doses, unit)}`;
export const fullDose = (a: Assignment, med: Medication, today: string): string => scheduleDoseText(a.schedule, a.doses, med.baseUnit, today);
/** "Losartan (Cozaar) 50 mg" (BR-2) */
export const medTitle = (m: Medication): string => `${m.generic}${m.brand ? ` (${m.brand})` : ''}${m.strength ? ` ${m.strength}` : ''}`;

/** "วันที่ทาน: ทุกวัน → จันทร์ · ขนาดยาเช้า: ½ เม็ด → 1 เม็ด" for the history and the confirm card (what changed) */
export function describeChange(prev: { doses: Doses; schedule: Schedule | null }, next: { doses: Doses; schedule: Schedule | null }, unit: string, today: string): string {
  const parts: string[] = [];
  if (JSON.stringify(prev.schedule) !== JSON.stringify(next.schedule)) parts.push(`วันที่ทาน: ${scheduleSummary(prev.schedule, today)} → ${scheduleSummary(next.schedule, today)}`);
  for (const [k, label] of PERIODS) if ((prev.doses[k] || 0) !== (next.doses[k] || 0)) parts.push(`ขนาดยา${label}: ${fr(prev.doses[k] || 0)} ${unit} → ${fr(next.doses[k] || 0)} ${unit}`);
  return parts.join(' · ');
}
