import { describe, expect, it } from 'vitest';
import { demoData } from '../__fixtures__/demo';
import { emptyData } from '../storage';
import { deleteAllData, emptyPharmacyForm, exportBackup, formFromPharmacy, parseBackup, pharmacyError, priceRowsOf, deletePharmacy, savePharmacy, setReminderDays } from '../settings';

const form = (o: Partial<ReturnType<typeof emptyPharmacyForm>>) => ({ ...emptyPharmacyForm(), ...o });

describe('pharmacy form', () => {
  const d = emptyData();
  it('needs a name, a valid phone and numeric baht', () => {
    expect(pharmacyError(d, form({}))).toBe('ใส่ชื่อร้านก่อน');
    expect(pharmacyError(d, form({ name: 'ร้านสุขใจ', phone: '12-ab' }))).toBe('เบอร์โทรไม่ถูกต้อง');
    expect(pharmacyError(d, form({ name: 'ร้านสุขใจ', phone: '02-123-4567', shipping: '-5' }))).toMatch(/ค่าส่ง/);
    expect(pharmacyError(d, form({ name: 'ร้านสุขใจ', freeOver: '0' }))).toMatch(/มากกว่า 0/);
    expect(pharmacyError(d, form({ name: 'ร้านสุขใจ', phone: '02-123-4567', shipping: '0', freeOver: '500' }))).toBe('');
  });
  it('saves with 0 = pickup and empty = unknown, and rejects a duplicate name', () => {
    const a = savePharmacy(d, form({ name: ' ร้าน ก ', shipping: '0' }), 'ph1');
    expect(a.pharmacies[0]).toMatchObject({ id: 'ph1', name: 'ร้าน ก', shippingFee: 0, freeShippingOver: null, active: true });
    expect(a.pharmacies[0]).not.toHaveProperty('phone');
    expect(pharmacyError(a, form({ name: 'ร้าน ก' }))).toBe('มีร้านชื่อนี้แล้ว');
    const b = savePharmacy(a, { ...formFromPharmacy(a.pharmacies[0]!), phone: '081-234-5678', shipping: '', freeOver: '300' }, 'x');
    expect(b.pharmacies).toHaveLength(1);
    expect(b.pharmacies[0]).toMatchObject({ phone: '081-234-5678', shippingFee: null, freeShippingOver: 300 });
    expect(pharmacyError(b, formFromPharmacy(b.pharmacies[0]!))).toBe(''); // editing itself is not a duplicate
  });
  it('delete removes the pharmacy and only its price rows', () => {
    let base = savePharmacy(savePharmacy(demoData(), form({ name: 'ก', shipping: '0' }), 'phA'), form({ name: 'ข', shipping: '30' }), 'phB');
    const m = base.medications[0]!;
    base = { ...base, medications: [{ ...m, prices: [{ pharmacyId: 'phA', price: 10, unit: m.baseUnit }, { pharmacyId: 'phB', price: 12, unit: m.baseUnit }] }, ...base.medications.slice(1)] };
    const ph = base.pharmacies[0]!;
    const n = priceRowsOf(base, ph.id);
    const after = deletePharmacy(base, ph.id);
    expect(after.pharmacies.some((p) => p.id === ph.id)).toBe(false);
    expect(priceRowsOf(after, ph.id)).toBe(0);
    expect(after.medications.reduce((s, m) => s + m.prices.length, 0)).toBe(1); expect(n).toBe(1);
    expect(after.assignments).toEqual(base.assignments);
  });
});

describe('reminder days and backup', () => {
  it('stays between 1 and 30', () => {
    expect(setReminderDays(emptyData(), 0).settings.reminderDays).toBe(1);
    expect(setReminderDays(emptyData(), 99).settings.reminderDays).toBe(30);
    expect(setReminderDays(emptyData(), 10).settings.reminderDays).toBe(10);
  });
  it('round trip gives identical data (AC-D3)', () => {
    const d = demoData(); const r = parseBackup(exportBackup(d));
    expect(r.ok && r.data).toEqual(d);
  });
  it('refuses foreign, corrupt, wrong-version and oversized files (AC-D2)', () => {
    expect(parseBackup('not json').ok).toBe(false);
    expect(parseBackup('{"version":2}').ok).toBe(false);
    expect(parseBackup('{"version":1,"persons":"x"}').ok).toBe(false);
    expect(parseBackup('[]').ok).toBe(false);
    expect(parseBackup(exportBackup(emptyData()), 6 * 1024 * 1024).ok).toBe(false);
  });
  it('delete-all gives the empty app data', () => { expect(deleteAllData()).toEqual(emptyData()); });
});
