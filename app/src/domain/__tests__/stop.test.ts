import { describe, expect, it } from 'vitest';
import { historyOf, stopMedication, stopValid, applyDoseChange } from '../medicine';
import { describeChange, fr } from '../format';
import { demoData, TODAY } from '../__fixtures__/demo';
import { AppData } from '../schema';
import { activeAssignments, assignmentsOfPerson, stoppedOfPerson, lowAssignments } from '../selectors';

describe('stop a medicine (DA-6, DA-7, AC-A3)', () => {
  it('needs a reason; "แพ้ยา" also needs a symptom', () => { expect(stopValid('', [])).toBe(false); expect(stopValid('หายแล้ว ไม่ต้องใช้แล้ว', [])).toBe(true); expect(stopValid('แพ้ยา', [])).toBe(false); expect(stopValid('แพ้ยา', ['คัน'])).toBe(true); });
  it('moves to "stopped", keeps history, leaves reminders and today lists', () => {
    const d = stopMedication(demoData(), 'a_dad_los', { reason: 'แพทย์สั่งหยุด', note: 'ความดันปกติ', symptoms: [] }, TODAY, { dc: 'dc1', allergy: 'al1' }, '2026-10-08T10:00:00+07:00');
    expect(AppData.safeParse(d).success).toBe(true);
    expect(assignmentsOfPerson(d, 'p_dad').map((a) => a.id)).not.toContain('a_dad_los'); expect(stoppedOfPerson(d, 'p_dad').map((a) => a.id)).toContain('a_dad_los');
    expect(lowAssignments(d, TODAY)).toEqual([]); expect(activeAssignments(d).some((a) => a.id === 'a_dad_los')).toBe(false);
    expect(d.changes.at(-1)).toMatchObject({ kind: 'stop', reason: 'แพทย์สั่งหยุด', note: 'ความดันปกติ' }); expect(d.allergies).toEqual([]);
    expect(d.assignments.find((a) => a.id === 'a_dad_los')!.stopped).toEqual({ on: TODAY, reason: 'แพทย์สั่งหยุด', note: 'ความดันปกติ' });
  });
  it('reason แพ้ยา creates the allergy record with the symptoms (AL-3)', () => {
    const d = stopMedication(demoData(), 'a_dad_los', { reason: 'แพ้ยา', note: '', symptoms: ['ผื่น/ลมพิษ', 'หายใจลำบาก'] }, TODAY, { dc: 'dc1', allergy: 'al1' }, '2026-10-08T10:00:00+07:00');
    expect(d.allergies).toEqual([{ id: 'al1', personId: 'p_dad', drug: 'Losartan', symptoms: ['ผื่น/ลมพิษ', 'หายใจลำบาก'], recordedOn: TODAY, source: 'stopMedication' }]);
    expect(d.changes.at(-1)!.symptoms).toEqual(['ผื่น/ลมพิษ', 'หายใจลำบาก']); expect(AppData.safeParse(d).success).toBe(true);
  });
  it('a stopped or household medicine cannot be stopped again', () => { const d = demoData(); expect(stopMedication(d, 'a_dad_old', { reason: 'อื่นๆ', note: '', symptoms: [] }, TODAY, { dc: 'x', allergy: 'y' }, 'z')).toBe(d); expect(stopMedication(d, 'a_house_para', { reason: 'อื่นๆ', note: '', symptoms: [] }, TODAY, { dc: 'x', allergy: 'y' }, 'z')).toBe(d); });
});

describe('history (DA-5, L-9)', () => {
  it('newest first; text says what changed', () => {
    let d = applyDoseChange(demoData(), 'a_dad_vitd', { doses: { morning: 0.5, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'weekdays', days: [1, 4] } }, 'เภสัชกรแนะนำ', '', '2026-07-02', 'c1', '2026-07-02T09:00:00+07:00');
    d = applyDoseChange(d, 'a_dad_vitd', { doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, 'แพทย์สั่งปรับ', 'หลังตรวจเลือด', '2026-08-15', 'c2', '2026-08-15T09:00:00+07:00');
    expect(historyOf(d, 'a_dad_vitd').map((c) => c.id)).toEqual(['c2', 'c1']); expect(historyOf(d, 'a_dad_cal')).toEqual([]);
    const c = historyOf(d, 'a_dad_vitd')[0]!;
    expect(describeChange(c.previous!, c.next!, 'เม็ด', TODAY)).toBe('วันที่ทาน: ทุกวันจันทร์ และ พฤหัสบดี → ทุกวัน · ขนาดยาเช้า: ½ เม็ด → 1 เม็ด');
    expect(fr(0.5)).toBe('½');
  });
});
