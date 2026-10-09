import { describe, expect, it } from 'vitest';
import { demoData, TODAY } from '../__fixtures__/demo';
import { compareOrder, currentTemplate, fillTemplate, orderLines, qtyText, saveTemplate, selectTemplate, templateError } from '../order';
import { savePharmacy, emptyPharmacyForm } from '../settings';

const withShops = () => {
  let d = demoData();
  const f = (o: object) => ({ ...emptyPharmacyForm(), ...o });
  d = savePharmacy(d, f({ name: 'ร้าน A', shipping: '40' }), 'phA');
  d = savePharmacy(d, f({ name: 'ร้าน B', shipping: '0' }), 'phB');
  d = savePharmacy(d, f({ name: 'ร้าน C' }), 'phC'); // shipping unknown
  d.medications = d.medications.map((m) => (m.id === 'm_los' ? { ...m, prices: [{ pharmacyId: 'phA', price: 5, unit: 'เม็ด' as const }, { pharmacyId: 'phB', price: 40, unit: 'แผง' as const }] } : m));
  return d;
};

describe('order lines', () => {
  it('only low medicines, filled up to the refill cycle in whole packs', () => {
    const l = orderLines(demoData(), TODAY, null);
    expect(l.map((x) => x.a.id)).toEqual(['a_dad_los', 'a_mom_met'].filter((id) => l.some((x) => x.a.id === id)));
    const los = l.find((x) => x.a.id === 'a_dad_los')!;
    expect(qtyText(los)).toBe('30 เม็ด (3 แผง)'); // 30 days × 1 − 5 in stock = 25 → 3 packs of 10
    expect(orderLines(demoData(), TODAY, 'p_me')).toEqual([]);
  });
});

describe('compare pharmacies', () => {
  it('ranks by medicine + shipping, keeps unpriced / unknown-shipping shops out', () => {
    const d = withShops(); const lines = orderLines(d, TODAY, 'p_dad').filter((l) => l.a.id === 'a_dad_los');
    const c = compareOrder(d, lines);
    expect(c.best?.pharmacy.id).toBe('phB'); expect(c.best?.total).toBe(120);
    expect(c.next?.total).toBe(190);
    expect(c.rows.find((r) => r.pharmacy.id === 'phC')?.ok).toBe(false);
  });
});

describe('message templates', () => {
  it('fills the three placeholders and lists the lines', () => {
    const d = withShops(); const lines = orderLines(d, TODAY, 'p_dad').filter((l) => l.a.id === 'a_dad_los');
    expect(fillTemplate('{ร้านยา}|{รายการยา}|{ผู้สั่ง}', 'ร้าน B', lines, 'บ้านของเรา')).toBe('ร้าน B|1) Losartan (Cozaar) 50 mg x 30 เม็ด (3 แผง) (คุณพ่อ)|บ้านของเรา');
  });
  it('save, add, select; needs a name and text', () => {
    let d = demoData();
    expect(templateError('', 'x')).toBe('ใส่ชื่อแบบฟอร์มก่อน'); expect(templateError('a', ' ')).toBe('ใส่ข้อความก่อน');
    d = saveTemplate(d, 't1', ' ชื่อใหม่ ', 'ข้อความ', 'x'); expect(d.templates[0]).toEqual({ id: 't1', name: 'ชื่อใหม่', body: 'ข้อความ' });
    d = saveTemplate(d, null, 'อีกแบบ', 'b', 't9'); expect(d.templates).toHaveLength(3);
    d = selectTemplate(d, 't9'); expect(currentTemplate(d).id).toBe('t9');
    expect(selectTemplate(d, 'nope').settings.selectedTemplateId).toBe('t9');
  });
});
