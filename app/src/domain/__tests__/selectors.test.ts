import { describe, expect, it } from 'vitest';
import { demoData, TODAY } from '../__fixtures__/demo';
import * as s from '../selectors';
import { fr, qf, scheduleSummary, doseText, medTitle, thDate, nextTakeDate } from '../format';
import { AppData as Schema } from '../schema';

const T = TODAY;
describe('format', () => {
  it('fractions: ½ 1½ ¼ ¾', () => { expect([0.5, 1.5, 0.25, 0.75, 2, 0].map(fr)).toEqual(['½', '1½', '¼', '¾', '2', '0']); expect(qf(7)).toBe('7'); expect(qf(2.3)).toBe('2.3'); });
  it('schedule summaries in Thai (DS-6)', () => {
    expect(scheduleSummary({ kind: 'daily' }, T)).toBe('ทุกวัน');
    expect(scheduleSummary({ kind: 'weekdays', days: [6, 1, 4] }, T)).toBe('ทุกวันจันทร์ พฤหัสบดี และ เสาร์');
    expect(scheduleSummary({ kind: 'interval', everyNDays: 2, anchorDate: '2026-10-07' }, T)).toBe('วันเว้นวัน ครั้งถัดไป 9 ต.ค.');
    expect(scheduleSummary({ kind: 'interval', everyNDays: 3, anchorDate: '2026-10-08' }, T)).toBe('ทุก 3 วัน ครั้งถัดไป 11 ต.ค.');
    expect(scheduleSummary({ kind: 'monthDays', days: [15, 1] }, T)).toBe('ทุกวันที่ 1, 15 ของเดือน');
    expect(scheduleSummary(null, T)).toBe('ใช้เมื่อมีอาการ');
  });
  it('dose text and titles', () => {
    expect(doseText({ morning: 1, noon: 0, evening: 1.5, bedtime: 0 }, 'เม็ด')).toBe('เช้า 1 เม็ด · เย็น 1½ เม็ด');
    expect(doseText({ morning: 0, noon: 0, evening: 0, bedtime: 0 }, 'เม็ด')).toBe('ยังไม่ได้ตั้งขนาดยา');
    expect(medTitle(demoData().medications[0]!)).toBe('Losartan (Cozaar) 50 mg');
    expect(thDate('2026-10-31')).toBe('31 ต.ค. 2569');
    expect(nextTakeDate({ kind: 'weekdays', days: [1] }, T)).toBe('2026-10-12');
  });
});

describe('selectors', () => {
  const d = demoData();
  it('demo data is valid', () => { expect(Schema.safeParse(d).success).toBe(true); });
  it('stock by the day-by-day walk, never an average (DS-7)', () => {
    expect(s.stockOf(d, d.assignments.find((a) => a.id === 'a_dad_los')!, T).days).toBe(5);
    expect(s.stockOf(d, d.assignments.find((a) => a.id === 'a_dad_vitd')!, T).days).toBe(70); // 20 tablets, Mon + Thu
    expect(s.stockOf(d, d.assignments.find((a) => a.id === 'a_house_para')!, T).status).toBe('household');
  });
  it('unknown, unit mismatch and pack units are handled without guessing (BR-6)', () => {
    const x = demoData(); const a = x.assignments.find((q) => q.id === 'a_dad_los')!;
    a.stockQty = null; expect(s.stockOf(x, a, T).status).toBe('noStock');
    a.stockQty = 2; a.stockUnit = 'ขวด'; expect(s.stockOf(x, a, T).status).toBe('unitMismatch'); expect(s.isLow(s.stockOf(x, a, T), 7)).toBe(false);
    a.stockUnit = 'แผง'; expect(s.stockInBase(a, x.medications[0]!)).toBe(20); expect(s.stockOf(x, a, T).days).toBe(20);
    x.medications[0]!.packSize = null; expect(s.stockInBase(a, x.medications[0]!)).toBeNull();
  });
  it('low stock list uses the reminder setting; stopped and removed people are left out', () => {
    expect(s.lowAssignments(d, T).map((a) => a.id)).toEqual(['a_dad_los']);
    const x = demoData(); x.settings.reminderDays = 30; expect(s.lowAssignments(x, T).map((a) => a.id)).toEqual(['a_dad_los', 'a_mom_met']);
    x.persons[1]!.removed = true; expect(s.lowAssignments(x, T).map((a) => a.id)).toEqual(['a_dad_los']);
  });
  it('who prepares what today; self-managed members are left out (MB-2)', () => {
    expect(s.dueToday(d, 'p_dad', T).map((a) => a.id)).toEqual(['a_dad_los', 'a_dad_vitd']); // calcium starts tomorrow
    expect(s.restToday(d, 'p_dad', T).map((a) => a.id)).toEqual(['a_dad_cal']);
    expect(s.dueToday(d, 'p_mom', T)).toEqual([]);
    expect(s.tasksToday(d, T).map((t) => t.key)).toEqual(['a_dad_los:morning', 'a_dad_vitd:morning', 'a_me_los:morning']);
    expect(s.tasksToday(d, T, 'p_me')).toHaveLength(1);
  });
  it('person summary and min days', () => {
    expect(s.personSummary(d, 'p_dad', T)).toEqual({ self: false, due: 2, buy: 1 });
    expect(s.personSummary(d, 'p_mom', T)).toEqual({ self: true, due: 0, buy: 0 });
    expect(s.minDays(d, 'p_dad', T)).toBe(5); expect(s.minDays(d, 'p_house', T)).toBeNull();
  });
  it('household medicines are reminded by expiry, not stock (HM-2)', () => {
    expect(s.expiringHousehold(d, T)).toEqual([{ a: d.assignments.find((a) => a.id === 'a_house_para'), days: 23 }]);
    const x = demoData(); x.assignments.find((a) => a.id === 'a_house_para')!.expiryDate = '2026-12-31'; expect(s.expiringHousehold(x, T)).toEqual([]);
  });
  it('bell count (NV-3) = 1 if anyone has pills + low stock + expiring', () => { expect(s.notifCount(d, T)).toBe(3); });
  it('ticks only count for today (NV-4)', () => {
    const x = demoData(); x.ticks = { date: '2026-10-07', done: ['a_dad_los:morning'] }; expect(s.doneToday(x, T).size).toBe(0);
    x.ticks = { date: T, done: ['a_dad_los:morning'] }; expect(s.doneToday(x, T).has('a_dad_los:morning')).toBe(true);
  });
  it('removed member: gone from every list, history and medicines kept (MB-7)', () => {
    const x = demoData(); x.persons[0]!.removed = true;
    expect(s.members(x).map((p) => p.id)).toEqual(['p_mom', 'p_me']); expect(s.removedMembers(x).map((p) => p.id)).toEqual(['p_dad']);
    expect(s.dueToday(x, 'p_dad', T)).toEqual([]); expect(s.activeAssignments(x).some((a) => a.id === 'a_dad_los')).toBe(false);
    expect(x.assignments.some((a) => a.id === 'a_dad_los')).toBe(true);
  });
  it('home banner: reminder > family > normal; no data → normal (UI-10)', () => {
    expect(s.getHomeBannerState({ lowCount: 1, othersOpen: 2 })).toBe('reminder'); expect(s.getHomeBannerState({ dueNow: 1 })).toBe('reminder');
    expect(s.getHomeBannerState({ othersOpen: 2 })).toBe('family'); expect(s.getHomeBannerState({})).toBe('normal'); expect(s.getHomeBannerState(null)).toBe('normal');
    expect(s.homeBannerInput(d, T)).toEqual({ lowCount: 1, dueNow: 3, othersOpen: 1 });
  });
});
