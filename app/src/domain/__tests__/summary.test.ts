import { describe, expect, it } from 'vitest';
import { demoData, TODAY } from '../__fixtures__/demo';
import { recentChanges, setShare, sharesOn, summaryText } from '../summary';

describe('share switches', () => {
  it('schedule and stock switches move their stored pairs together', () => {
    let d = demoData();
    expect(sharesOn(d.settings.shares, 'schedule')).toBe(true); expect(sharesOn(d.settings.shares, 'stock')).toBe(false);
    d = setShare(d, 'stock', true); expect(d.settings.shares).toMatchObject({ stock: true, days: true });
    d = setShare(d, 'schedule', false); expect(d.settings.shares).toMatchObject({ schedule: false, doses: false });
  });
});

describe('summary text', () => {
  it('lists medicines and dose by default, adds stock only when switched on, always has the allergy line', () => {
    let d = demoData();
    const t = summaryText(d, 'p_dad', TODAY);
    expect(t).toContain('สรุปยาของ คุณพ่อ'); expect(t).toContain('แพ้ยา: ยังไม่มีบันทึก');
    expect(t).toContain('1) Losartan (Cozaar) 50 mg · ทุกวัน · เช้า 1 เม็ด'); expect(t).not.toContain('เหลือประมาณ');
    expect(t).toContain('ไม่ใช่การวินิจฉัย');
    d = setShare(setShare(d, 'stock', true), 'schedule', false);
    const u = summaryText(d, 'p_dad', TODAY);
    expect(u).toContain('1) Losartan (Cozaar) 50 mg · เหลือประมาณ 5 วัน'); expect(u).not.toContain('เช้า 1 เม็ด');
    d = { ...d, allergies: [{ id: 'al', personId: 'p_dad', drug: 'Penicillin', symptoms: ['ผื่น/ลมพิษ'], recordedOn: TODAY, source: 'manual' }] };
    d = setShare(d, 'list', false);
    const v = summaryText(d, 'p_dad', TODAY);
    expect(v).toContain('แพ้ยา: Penicillin (ผื่น/ลมพิษ)'); expect(v).not.toContain('Losartan');
    expect(summaryText(d, 'nobody', TODAY)).toBe('');
  });
  it('recent changes: newest first, at most 3', () => {
    expect(recentChanges(demoData(), 'p_dad')).toEqual([]);
  });
});
