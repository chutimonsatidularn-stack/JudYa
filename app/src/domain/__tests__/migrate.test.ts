import { describe, expect, it } from 'vitest';
import { migrate1to3, bangkokDate } from '../migrate';
import { loadData, backupKey, STORAGE_KEY, type Store } from '../storage';
import { RootV3 } from '../schema';
import { v1Sample } from '../__fixtures__/v1.sample';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const deepFreeze = <T,>(o: T): T => { if (o && typeof o === 'object') { Object.values(o as object).forEach(deepFreeze); Object.freeze(o); } return o; };
const memStore = (initial?: Record<string, string>, failWriteOf?: string): Store & { map: Map<string, string> } => {
  const map = new Map(Object.entries(initial ?? {}));
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { if (k === failWriteOf) throw new Error('quota'); map.set(k, v); } };
};
const ok = (input: unknown) => { const r = migrate1to3(input); if (!r.ok) throw new Error(r.error); return r.data; };

describe('migrate1to3 (AC-D1)', () => {
  it('produces valid v3 and keeps every person, assignment and pharmacy id', () => {
    const d = ok(clone(v1Sample));
    expect(RootV3.safeParse(d).success).toBe(true);
    expect(d.version).toBe(3);
    expect(d.persons.map((p) => p.id)).toEqual(['p_a', 'p_b']);
    expect(d.assignments.map((a) => a.id)).toEqual(v1Sample.assignments.map((a) => a.id));
    expect(d.pharmacies.map((p) => p.id)).toEqual(['ph_a', 'ph_b']);
  });

  it('keeps doses, stock and "every day" exactly (DS-13)', () => {
    const d = ok(clone(v1Sample));
    for (const old of v1Sample.assignments) {
      const a = d.assignments.find((x) => x.id === old.id)!;
      expect(a.doses).toEqual(old.doses);
      expect(a.stockQty).toBe(old.stockQuantity);
      expect(a.schedule).toEqual({ kind: 'daily' });
      expect(a.doseStep).toBe(0.5);
      expect(a.leadDays).toBe(old.reorderLeadDays);
      expect(a.refillCycleDays).toBe(old.targetStockDays);
    }
    expect(d.assignments.find((a) => a.id === 'a_b_z')!.stockQty).toBeNull(); // unknown stays unknown
  });

  it('splits one old medicine used with different pack sizes into one entry per pack (never merges, never guesses)', () => {
    const d = ok(clone(v1Sample));
    const y = d.medications.filter((m) => m.generic === 'DrugY');
    expect(y.map((m) => m.packSize as number).sort((a, b) => a - b)).toEqual([60, 100]);
    expect(y.every((m) => m.brand === 'BrandY' && m.strength === '500 mg')).toBe(true);
    const ofA = d.medications.find((m) => m.id === d.assignments.find((a) => a.id === 'a_a_y')!.medicationId)!;
    const ofB = d.medications.find((m) => m.id === d.assignments.find((a) => a.id === 'a_b_y')!.medicationId)!;
    expect([ofA.packSize, ofB.packSize]).toEqual([60, 100]);
    const x = d.medications.filter((m) => m.generic === 'DrugX');
    expect(x).toHaveLength(1); // same pack for both people → one entry shared (L-3)
  });

  it('handles unknown form and unit without inventing: form → เม็ด with the old text kept in notes; unknown pack → null', () => {
    const d = ok(clone(v1Sample));
    const z = d.medications.find((m) => m.generic === 'DrugZ')!;
    expect(z.form).toBe('เม็ด');
    expect(z.notes).toContain('น้ำหยด');
    expect(z.notes).toContain('ขวด');
    expect(z.packSize).toBeNull();
  });

  it('prices keep their number but NOT a unit (unit unknown → comparison says เทียบไม่ได้)', () => {
    const d = ok(clone(v1Sample));
    const x = d.medications.find((m) => m.generic === 'DrugX')!;
    expect(x.prices).toEqual([{ pharmacyId: 'ph_a', price: 95, unit: null }, { pharmacyId: 'ph_b', price: 100, unit: null }]);
    const invalid = (d.legacy as unknown as { invalidPrices: unknown[] }).invalidPrices;
    expect(invalid).toHaveLength(3); // unknown medicine, text price, unknown pharmacy: kept, not dropped silently
  });

  it('history: adjust → dose, stop → stop, start → legacy; reason is never invented', () => {
    const d = ok(clone(v1Sample));
    expect(d.changes.map((c) => [c.id, c.kind])).toEqual([['dc1', 'dose'], ['dc2', 'stop']]);
    const dose = d.changes[0]!;
    expect(dose.reason).toBe('อื่นๆ');
    expect(dose.note).toContain('ก่อนมีช่องเหตุผล');
    expect(dose.previous!.doses).toEqual({ morning: 1, noon: 0, evening: 0, bedtime: 0 });
    expect(dose.next!.doses).toEqual({ morning: 1, noon: 0, evening: 1, bedtime: 0 });
    expect(dose.on).toBe('2026-03-11'); // 17:30 UTC is already the next day in Bangkok (DS-14)
    expect((d.legacy as unknown as { startEvents: { id: string }[] }).startEvents.map((e) => e.id)).toEqual(['dc3']);
  });

  it('inactive assignment becomes stopped with the date of its stop entry', () => {
    const q = ok(clone(v1Sample)).assignments.find((a) => a.id === 'a_a_q')!;
    expect(q.active).toBe(false);
    expect(q.stopped).toMatchObject({ on: '2026-03-01', reason: 'อื่นๆ' });
  });

  it('allergies, relationship, insurance and conditions survive', () => {
    const d = ok(clone(v1Sample));
    expect(d.allergies).toEqual([{ id: 'al_p_a_1', personId: 'p_a', drug: 'Penicillin', symptoms: ['อื่นๆ'], recordedOn: '2026-01-05', source: 'manual' }]);
    const a = d.persons[0]!;
    expect(a).toMatchObject({ name: 'คุณ A', relationship: 'พ่อ', gender: 'ชาย', birthYear: 2497, conditions: ['ความดัน'], insurance: { health: 'ประกันตัวอย่าง' }, selfManaged: false });
  });

  it('pharmacies: fixed shipping kept, variable → unknown (null), nothing invented', () => {
    const d = ok(clone(v1Sample));
    expect(d.pharmacies[0]).toMatchObject({ shippingFee: 80, freeShippingOver: null, line: '@shopa', phone: '02-000-0000', note: 'สมชาย' });
    expect(d.pharmacies[1]).toMatchObject({ shippingFee: null });
  });

  it('keeps what v3 has no place for in legacy (notes, orders, session, settings, pharmacy templates, per-assignment extras)', () => {
    const l = ok(clone(v1Sample)).legacy as Record<string, any>;
    expect(l.sourceVersion).toBe(1);
    expect(l.notes).toEqual(v1Sample.notes);
    expect(l.orders).toEqual(v1Sample.orders);
    expect(l.session).toEqual(v1Sample.session);
    expect(l.settings).toMatchObject({ deliveryAddress: '1 ถนนตัวอย่าง', recipient: 'คุณตัวอย่าง', targetDays: 30, warnDays: 10 });
    expect(l.pharmacyTemplates).toEqual({ ph_a: 'สั่งยา {{items}} ส่ง {{delivery}}' });
    expect(l.assignments.a_a_x).toMatchObject({ prescriber: 'หมอ ตัวอย่าง', frequency: 'ทุกวัน', startDate: '2026-01-05' });
  });

  it('uses the old warn-days setting as the reminder days', () => {
    expect(ok(clone(v1Sample)).settings.reminderDays).toBe(10);
    const noSetting = clone(v1Sample) as any; delete noSetting.settings.warnDays;
    expect(ok(noSetting).settings.reminderDays).toBe(7);
  });

  it('never changes its input and is deterministic', () => {
    const frozen = deepFreeze(clone(v1Sample));
    const a = migrate1to3(frozen);
    const b = migrate1to3(frozen);
    expect(a).toEqual(b);
    expect(JSON.stringify(frozen)).toBe(JSON.stringify(v1Sample));
  });

  it('rejects broken or foreign data with an error instead of a half result', () => {
    for (const bad of [null, 'x', 42, {}, { version: 1 }, { ...clone(v1Sample), persons: 'no' }, { ...clone(v1Sample), assignments: [{ id: 'a' }] }]) {
      expect(migrate1to3(bad).ok).toBe(false);
    }
  });

  it('bangkokDate handles midnight and bad input', () => {
    expect(bangkokDate('2026-10-08T16:59:59.000Z')).toBe('2026-10-08');
    expect(bangkokDate('2026-10-08T17:00:00.000Z')).toBe('2026-10-09');
    expect(bangkokDate('nonsense')).toBe('1970-01-01');
  });
});

describe('loadData on a storage (AC-D1 idempotent, AC-D2 corrupt input)', () => {
  const raw = JSON.stringify(v1Sample);

  it('empty storage → empty', () => { expect(loadData(memStore()).status).toBe('empty'); });

  it('migrates v1 → v3, keeps the raw old string under the backup key byte for byte, writes v3', () => {
    const s = memStore({ [STORAGE_KEY]: raw });
    const r = loadData(s);
    expect(r.status === 'ok' && r.migratedFrom).toBe(1);
    expect(s.map.get(backupKey(1))).toBe(raw);
    expect(JSON.parse(s.map.get(STORAGE_KEY)!).version).toBe(3);
  });

  it('running it twice changes nothing (idempotent)', () => {
    const s = memStore({ [STORAGE_KEY]: raw });
    loadData(s);
    const afterFirst = s.map.get(STORAGE_KEY);
    const second = loadData(s);
    expect(second.status === 'ok' && second.migratedFrom).toBeNull();
    expect(s.map.get(STORAGE_KEY)).toBe(afterFirst);
    expect(s.map.get(backupKey(1))).toBe(raw);
  });

  it('never overwrites an existing backup', () => {
    const s = memStore({ [STORAGE_KEY]: raw, [backupKey(1)]: 'older backup' });
    loadData(s);
    expect(s.map.get(backupKey(1))).toBe('older backup');
  });

  it('corrupt text: error, nothing written', () => {
    const s = memStore({ [STORAGE_KEY]: '{not json' });
    const r = loadData(s);
    expect(r).toMatchObject({ status: 'error', code: 'corrupt' });
    expect(s.map.get(STORAGE_KEY)).toBe('{not json');
    expect(s.map.has(backupKey(1))).toBe(false);
  });

  it('unknown version (2, 99, none): error, original untouched', () => {
    for (const v of [{ version: 2 }, { version: 99 }, {}]) {
      const text = JSON.stringify(v); const s = memStore({ [STORAGE_KEY]: text });
      expect(loadData(s)).toMatchObject({ status: 'error', code: 'unsupported' });
      expect(s.map.get(STORAGE_KEY)).toBe(text);
    }
  });

  it('v1 that fails migration: error, original untouched, no v3 written', () => {
    const text = JSON.stringify({ ...v1Sample, persons: 'broken' }); const s = memStore({ [STORAGE_KEY]: text });
    expect(loadData(s)).toMatchObject({ status: 'error', code: 'invalid' });
    expect(s.map.get(STORAGE_KEY)).toBe(text);
  });

  it('cannot write the backup → does not migrate, original untouched', () => {
    const s = memStore({ [STORAGE_KEY]: raw }, backupKey(1));
    expect(loadData(s)).toMatchObject({ status: 'error', code: 'backup-failed' });
    expect(s.map.get(STORAGE_KEY)).toBe(raw);
  });

  it('cannot write v3 (storage full) → original kept, backup exists', () => {
    const throwing: Store & { map: Map<string, string> } = (() => {
      const map = new Map<string, string>([[STORAGE_KEY, raw]]);
      return { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { if (k === STORAGE_KEY && v !== raw) throw new Error('quota'); map.set(k, v); } };
    })();
    expect(loadData(throwing)).toMatchObject({ status: 'error', code: 'write-failed' });
    expect(throwing.map.get(STORAGE_KEY)).toBe(raw);
    expect(throwing.map.get(backupKey(1))).toBe(raw);
  });

  it('a v3 file that is invalid is reported, not repaired silently', () => {
    const s = memStore({ [STORAGE_KEY]: JSON.stringify({ version: 3, persons: [] }) });
    expect(loadData(s)).toMatchObject({ status: 'error', code: 'invalid' });
  });
});

// Data produced by the REAL old app (its built-in demo data, saved with the "ใช้ข้อมูลตัวอย่าง" button; not personal data).
import demo from '../__fixtures__/v1.app-demo.json';
describe('migrate1to3 on data written by the real old app', () => {
  it('migrates all of it and keeps the counts and every dose', () => {
    const v1 = demo as any;
    const d = ok(clone(v1));
    expect(d.persons).toHaveLength(v1.persons.length);
    expect(d.assignments).toHaveLength(v1.assignments.length);
    expect(d.pharmacies).toHaveLength(v1.pharmacies.length);
    expect(d.changes).toHaveLength(v1.doseChanges.filter((c: any) => c.kind !== 'start').length);
    for (const old of v1.assignments) {
      const a = d.assignments.find((x) => x.id === old.id)!;
      expect(a.doses).toEqual(old.doses);
      expect(a.stockQty).toBe(old.stockQuantity);
      expect(a.active).toBe(old.active);
    }
    expect(d.allergies.map((a) => a.drug)).toEqual(['Penicillin']);
  });
  it('loads through the storage layer and is stable on a second run', () => {
    const text = JSON.stringify(demo);
    const s = memStore({ [STORAGE_KEY]: text });
    expect(loadData(s).status).toBe('ok');
    const first = s.map.get(STORAGE_KEY);
    expect(loadData(s).status).toBe('ok');
    expect(s.map.get(STORAGE_KEY)).toBe(first);
    expect(s.map.get(backupKey(1))).toBe(text);
  });
});
