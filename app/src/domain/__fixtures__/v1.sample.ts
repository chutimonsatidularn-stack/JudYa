// ANONYMISED test data in the shape of the old app's version 1 (read from medmate-app.html). Not real people, not real data.
export const v1Sample = {
  version: 1,
  session: { name: 'ผู้ใช้', email: '', guest: true },
  settings: { deliveryAddress: '1 ถนนตัวอย่าง', recipient: 'คุณตัวอย่าง', recipientPhone: '080-000-0000', warnDays: 10, targetDays: 30 },
  persons: [
    { id: 'p_a', name: 'คุณ A', relationship: 'พ่อ', gender: 'ชาย', birthYear: 2497, conditions: ['ความดัน'], allergies: ['Penicillin'], insurance: 'ประกันตัวอย่าง', accidentInsurance: '', avatar: 'color-dad', createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
    { id: 'p_b', name: 'คุณ B', relationship: 'แม่', gender: 'หญิง', birthYear: 2500, conditions: [], allergies: [], insurance: '', accidentInsurance: '', avatar: 'color-mom', createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
  ],
  medications: [
    { id: 'm_x', genericName: 'DrugX', brandName: '', strength: '50 mg', dosageForm: 'เม็ด', notes: '' },
    { id: 'm_y', genericName: 'DrugY', brandName: 'BrandY', strength: '500 mg', dosageForm: 'เม็ด', notes: 'ทานหลังอาหาร' },
    { id: 'm_z', genericName: 'DrugZ', brandName: '', strength: '1000 IU', dosageForm: 'น้ำหยด', notes: '' },
    { id: 'm_q', genericName: 'DrugQ', brandName: '', strength: '5 mg', dosageForm: 'เม็ด', notes: '' },
  ],
  assignments: [
    { id: 'a_a_x', personId: 'p_a', medicationId: 'm_x', stockQuantity: 5, packageSize: 30, packageUnit: 'เม็ด', doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-01-05', reorderLeadDays: 7, targetStockDays: 30, prescriber: 'หมอ ตัวอย่าง', notes: '', active: true, createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
    { id: 'a_b_x', personId: 'p_b', medicationId: 'm_x', stockQuantity: 120, packageSize: 30, packageUnit: 'เม็ด', doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-01-05', reorderLeadDays: 7, targetStockDays: 30, prescriber: '', notes: '', active: true, createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
    { id: 'a_a_y', personId: 'p_a', medicationId: 'm_y', stockQuantity: 150, packageSize: 60, packageUnit: 'เม็ด', doses: { morning: 1, noon: 0, evening: 1, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-01-05', reorderLeadDays: 7, targetStockDays: 60, prescriber: '', notes: '', active: true, createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
    { id: 'a_b_y', personId: 'p_b', medicationId: 'm_y', stockQuantity: 16, packageSize: 100, packageUnit: 'เม็ด', doses: { morning: 1, noon: 0, evening: 1, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-01-05', reorderLeadDays: 7, targetStockDays: 60, prescriber: '', notes: '', active: true, createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-01-05T03:00:00.000Z' },
    { id: 'a_b_z', personId: 'p_b', medicationId: 'm_z', stockQuantity: null, packageSize: null, packageUnit: 'ขวด', doses: { morning: 0.5, noon: 0, evening: 0, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-02-01', reorderLeadDays: 7, targetStockDays: 30, prescriber: '', notes: 'ยาน้ำ', active: true, createdAt: '2026-02-01T03:00:00.000Z', updatedAt: '2026-02-01T03:00:00.000Z' },
    { id: 'a_a_q', personId: 'p_a', medicationId: 'm_q', stockQuantity: 0, packageSize: 30, packageUnit: 'เม็ด', doses: { morning: 0, noon: 0, evening: 0, bedtime: 0 }, frequency: 'ทุกวัน', startDate: '2026-01-05', reorderLeadDays: 7, targetStockDays: 30, prescriber: '', notes: '', active: false, createdAt: '2026-01-05T03:00:00.000Z', updatedAt: '2026-03-01T03:00:00.000Z' },
  ],
  doseChanges: [
    { id: 'dc1', assignmentId: 'a_a_y', kind: 'adjust', effectiveAt: '2026-03-10T17:30:00.000Z', previousDose: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, newDose: { morning: 1, noon: 0, evening: 1, bedtime: 0 }, source: 'ตามคำแนะนำแพทย์', reason: '', note: '', changedBy: 'ฉัน', createdAt: '2026-03-10T17:30:00.000Z' },
    { id: 'dc2', assignmentId: 'a_a_q', kind: 'stop', effectiveAt: '2026-03-01T03:00:00.000Z', previousDose: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, newDose: { morning: 0, noon: 0, evening: 0, bedtime: 0 }, source: 'ตามคำแนะนำแพทย์', reason: '', note: '', changedBy: 'ฉัน', createdAt: '2026-03-01T03:00:00.000Z' },
    { id: 'dc3', assignmentId: 'a_a_x', kind: 'start', effectiveAt: '2026-01-05T03:00:00.000Z', previousDose: { morning: 0, noon: 0, evening: 0, bedtime: 0 }, newDose: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, source: '', reason: '', note: '', changedBy: 'ฉัน', createdAt: '2026-01-05T03:00:00.000Z' },
  ],
  notes: [{ id: 'n1', personId: 'p_a', date: '2026-02-02', symptom: 'ปวดหัว', severity: 'low', note: 'ตัวอย่าง' }],
  pharmacies: [
    { id: 'ph_a', name: 'ร้านตัวอย่าง A', contact: 'สมชาย', lineHandle: '@shopa', phone: '02-000-0000', address: '', shippingMode: 'fixed', shippingCost: 80, orderTemplate: 'สั่งยา {{items}} ส่ง {{delivery}}', active: true },
    { id: 'ph_b', name: 'ร้านตัวอย่าง B', contact: '', lineHandle: '', phone: '', address: '', shippingMode: 'variable', shippingCost: null, orderTemplate: '', active: true },
  ],
  prices: { ph_a: { m_x: 95, m_y: 140, m_z: 60, bad_med: 5 }, ph_b: { m_x: 100, m_y: 'abc' }, ph_gone: { m_x: 1 } },
  orders: [{ id: 'o1', total: 500 }],
  orderPlan: { targetDays: 30, selected: {}, qtyOverride: {}, variableShipping: {}, strategy: 'single', pharmacyId: null },
  seeded: false,
} as const;
