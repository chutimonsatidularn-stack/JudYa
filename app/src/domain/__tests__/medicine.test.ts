import { describe, expect, it } from 'vitest';
import * as m from '../medicine';
import { equivalence, formUnits, unitGroups } from '../units';
import { demoData, TODAY } from '../__fixtures__/demo';
import { AppData, type Schedule } from '../schema';
import { stockOf } from '../selectors';
import { addDays } from '../calc';

const draft = (o: Partial<m.MedDraft> = {}): m.MedDraft => ({ ...m.newDraft('p_dad', '/medicines'), generic: 'Amlodipine', strength: '5 mg', stockQty: '30', packSize: '10', ...o });
const ids = { med: 'm_new', asg: 'a_new' };

describe('units (BR-4, BR-6)', () => {
  it('form sets the default units', () => { expect(formUnits('ผงชง/ซอง')).toMatchObject({ base: 'ซอง', pack: 'กล่อง' }); expect(formUnits('ครีม/ขี้ผึ้ง')).toMatchObject({ base: 'กรัม', pack: 'หลอด' }); });
  it('units that match the pack come first', () => { expect(unitGroups('เม็ด', 'แผง')[0]).toEqual({ group: 'ตรงกับขนาดบรรจุ', items: ['เม็ด', 'แผง'] }); expect(unitGroups('เม็ด', 'แผง')[1]!.items).not.toContain('เม็ด'); });
  it('equivalence note, mismatch warning, no pack size', () => {
    const o = { qty: 15, unit: 'เม็ด', base: 'เม็ด', pack: 'แผง', packSize: 10 };
    expect(equivalence(o)).toEqual({ kind: 'info', text: 'เท่ากับ 1.5 แผง' });
    expect(equivalence({ ...o, qty: 2, unit: 'แผง' })).toEqual({ kind: 'info', text: 'เท่ากับ 20 เม็ด' });
    expect(equivalence({ ...o, unit: 'ขวด' })!.kind).toBe('warn');
    expect(equivalence({ ...o, packSize: null })!.text).toContain('ยังไม่ระบุขนาดบรรจุ');
  });
});

describe('validation (SEC-2)', () => {
  it('name is required; limits are enforced', () => {
    expect(m.medError(draft({ generic: ' ' }))).toBe('ใส่ชื่อยาก่อน');
    expect(m.medError(draft())).toBe('');
    expect(m.medError(draft({ stockQty: '10000' }))).toContain('0–9999'); expect(m.medError(draft({ stockQty: 'abc' }))).toContain('0–9999');
    expect(m.medError(draft({ packSize: '0' }))).toContain('1–1000'); expect(m.medError(draft({ cycle: '400' }))).toContain('1–365'); expect(m.medError(draft({ lead: '91' }))).toContain('0–90');
    expect(m.medError(draft({ schedule: { kind: 'weekdays', days: [] } }))).toContain('ตารางทานยา');
    expect(m.medError(draft({ prices: [{ pharmacyId: 'x', price: '-1', unit: 'แผง' }] }))).toContain('ราคา');
  });
  it('household medicines need no schedule, cycle or lead', () => { expect(m.medError(draft({ owner: m.HOUSE, cycle: '', lead: '', schedule: { kind: 'weekdays', days: [] } }))).toBe(''); });
  it('allergy warning is by generic name, any brand, and covers everyone for household medicines (AL-6)', () => {
    const d = demoData(); d.allergies.push({ id: 'al', personId: 'p_dad', drug: 'Penicillin', symptoms: ['ผื่น/ลมพิษ'], recordedOn: TODAY, source: 'manual' });
    expect(m.allergyWarnings(d, draft({ generic: 'penicillin v' }))).toEqual([{ person: 'คุณพ่อ', drug: 'Penicillin', symptoms: ['ผื่น/ลมพิษ'] }]);
    expect(m.allergyWarnings(d, draft({ generic: 'penicillin v', owner: 'p_me' }))).toEqual([]);
    expect(m.allergyWarnings(d, draft({ generic: 'penicillin v', owner: m.HOUSE })).length).toBe(1);
    expect(m.allergyWarnings(d, draft({ generic: 'pe' }))).toEqual([]);
  });
});

describe('save a new medicine', () => {
  it('creates a medicine entry and an assignment; data stays valid; numbers come from the day-by-day walk', () => {
    const d0 = demoData(); const x = draft({ doses: { morning: 1, noon: 0, evening: 1, bedtime: 0 }, brand: 'Norvasc', prices: [{ pharmacyId: 'ph1', price: '12.345', unit: 'แผง' }, { pharmacyId: 'ph2', price: '', unit: 'แผง' }] });
    const { data, assignmentId } = m.saveMedicine(d0, x, ids);
    expect(assignmentId).toBe('a_new'); expect(AppData.safeParse(data).success).toBe(true);
    const med = data.medications.find((q) => q.id === 'm_new')!;
    expect(med).toMatchObject({ generic: 'Amlodipine', brand: 'Norvasc', strength: '5 mg', packSize: 10, baseUnit: 'เม็ด', packUnit: 'แผง' });
    expect(med.prices).toEqual([{ pharmacyId: 'ph1', price: 12.35, unit: 'แผง' }]); // blank price dropped, 2 decimals
    const a = data.assignments.find((q) => q.id === 'a_new')!;
    expect(a).toMatchObject({ medicationId: 'm_new', owner: { kind: 'person', personId: 'p_dad' }, stockQty: 30, schedule: { kind: 'daily' }, active: true, refillCycleDays: 30, leadDays: 7 });
    expect(stockOf(data, a, TODAY).days).toBe(15); // 30 tablets, 2 a day
  });
  it('same product with the same packaging for another person shares the entry (L-3); prices merge', () => {
    const d1 = m.saveMedicine(demoData(), draft({ prices: [{ pharmacyId: 'ph1', price: '10', unit: 'แผง' }] }), ids).data;
    const d2 = m.saveMedicine(d1, draft({ owner: 'p_me', prices: [{ pharmacyId: 'ph2', price: '11', unit: 'แผง' }] }), { med: 'm_other', asg: 'a_other' }).data;
    expect(d2.medications.filter((q) => q.generic === 'Amlodipine')).toHaveLength(1);
    expect(d2.medications.find((q) => q.id === 'm_new')!.prices.map((p) => p.pharmacyId)).toEqual(['ph1', 'ph2']);
    expect(d2.assignments.filter((q) => q.medicationId === 'm_new')).toHaveLength(2);
  });
  it('a different pack size is a separate entry (BR-1)', () => {
    const d1 = m.saveMedicine(demoData(), draft(), ids).data;
    const d2 = m.saveMedicine(d1, draft({ owner: 'p_me', packSize: '30' }), { med: 'm_30', asg: 'a_30' }).data;
    expect(d2.medications.filter((q) => q.generic === 'Amlodipine')).toHaveLength(2);
  });
  it('household medicine: no schedule, zero doses, expiry kept (HM-2)', () => {
    const { data } = m.saveMedicine(demoData(), draft({ generic: 'ORS', owner: m.HOUSE, expiry: '2027-01-31' }), ids);
    expect(data.assignments.find((q) => q.id === 'a_new')).toMatchObject({ owner: { kind: 'household' }, schedule: null, doses: { morning: 0, noon: 0, evening: 0, bedtime: 0 }, expiryDate: '2027-01-31' });
    expect(AppData.safeParse(data).success).toBe(true);
  });
});

describe('edit an existing medicine', () => {
  it('round trip: draft → save keeps everything; stock edit does not write history', () => {
    const d = demoData(); const a = d.assignments.find((q) => q.id === 'a_dad_los')!;
    const x = m.draftFromAssignment(d, a, '/medicines')!; expect(x.key).toBe('a_dad_los'); expect(x.owner).toBe('p_dad'); expect(m.doseChanged(x)).toBe(false);
    const { data } = m.saveMedicine(d, { ...x, stockQty: '50' }, ids);
    expect(data.assignments.find((q) => q.id === 'a_dad_los')!.stockQty).toBe(50); expect(data.changes).toHaveLength(0); expect(AppData.safeParse(data).success).toBe(true);
    expect(data.assignments.find((q) => q.id === 'a_dad_los')!.doses).toEqual(a.doses); // dose never changes through this path
  });
  it('dose / schedule change is detected and written as ONE history entry with the reason (SF-4, L-9)', () => {
    const d = demoData(); const a = d.assignments.find((q) => q.id === 'a_dad_vitd')!; const x = m.draftFromAssignment(d, a, '/')!;
    const sched: Schedule = { kind: 'weekdays', days: [1, 3, 5] };
    const next = { ...x, doses: { ...x.doses, evening: 1 }, schedule: sched };
    expect(m.doseChanged(next)).toBe(true);
    const out = m.applyDoseChange(d, a.id, { doses: next.doses, schedule: next.schedule }, 'แพทย์สั่งปรับ', 'หลังตรวจเลือด', TODAY, 'dc1', '2026-10-08T10:00:00+07:00');
    expect(out.changes).toHaveLength(1);
    expect(out.changes[0]).toMatchObject({ id: 'dc1', assignmentId: a.id, kind: 'dose', reason: 'แพทย์สั่งปรับ', note: 'หลังตรวจเลือด', on: TODAY, previous: { schedule: { kind: 'weekdays', days: [1, 4] } }, next: { schedule: { kind: 'weekdays', days: [1, 3, 5] } } });
    expect(out.assignments.find((q) => q.id === a.id)).toMatchObject({ doses: { morning: 1, evening: 1 }, schedule: { kind: 'weekdays', days: [1, 3, 5] } });
    expect(AppData.safeParse(out).success).toBe(true);
    expect(d.changes).toHaveLength(0); // input untouched
  });
  it('buy summary line', () => { expect(m.buySummary(draft({ prices: [{ pharmacyId: 'a', price: '5', unit: 'แผง' }] }))).toBe('1 แผง = 10 เม็ด · เติมทุก 30 วัน · ราคา 1 ร้าน'); expect(m.buySummary(draft({ packSize: '', owner: m.HOUSE }))).toBe('ยังไม่ระบุขนาดบรรจุ · ยังไม่มีราคา'); });
});

describe('schedule editor helpers (DS-1…DS-6)', () => {
  it('modes map to the five kinds; alternate = every 2 days from the start date', () => {
    expect(m.modeOf({ kind: 'interval', everyNDays: 2, anchorDate: TODAY })).toBe('alternate'); expect(m.modeOf({ kind: 'interval', everyNDays: 3, anchorDate: TODAY })).toBe('everyN');
    expect(m.withMode({ kind: 'daily' }, 'alternate', TODAY)).toEqual({ kind: 'interval', everyNDays: 2, anchorDate: TODAY });
    expect(m.withMode({ kind: 'daily' }, 'weekdays', TODAY)).toEqual({ kind: 'weekdays', days: [] });
    expect(m.withMode({ kind: 'daily' }, 'monthDays', TODAY)).toEqual({ kind: 'monthDays', days: [] });
  });
  it('preview for 7 days and toggling days', () => {
    const p = m.preview7({ kind: 'interval', everyNDays: 2, anchorDate: TODAY }, TODAY, addDays); expect(p.map((x) => x.take)).toEqual([true, false, true, false, true, false, true]);
    expect(m.toggleIn([1, 4], 3)).toEqual([1, 3, 4]); expect(m.toggleIn([1, 4], 4)).toEqual([1]);
  });
});
