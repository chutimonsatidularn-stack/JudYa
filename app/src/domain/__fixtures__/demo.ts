// Anonymised demo data for tests. Not real people.
import { emptyData } from '../storage';
import type { AppData, Assignment } from '../schema';

export const TODAY = '2026-10-08'; // a Thursday
const z = { morning: 0, noon: 0, evening: 0, bedtime: 0 };
const asg = (o: Partial<Assignment> & Pick<Assignment, 'id' | 'medicationId' | 'owner'>): Assignment => ({ stockQty: 10, stockUnit: 'เม็ด', doses: { ...z, morning: 1 }, doseStep: 0.5, schedule: { kind: 'daily' }, refillCycleDays: 30, leadDays: 7, active: true, ...o });
const med = (id: string, generic: string, strength: string, packSize: number | null = 10, brand?: string) => ({ id, generic, strength, ...(brand ? { brand } : {}), form: 'เม็ด' as const, baseUnit: 'เม็ด' as const, packUnit: 'แผง' as const, packSize, prices: [] });

export function demoData(): AppData {
  const d = emptyData();
  d.persons = [
    { id: 'p_dad', name: 'คุณพ่อ', relationship: 'พ่อ', selfManaged: false, avatarId: 'profile-11' },
    { id: 'p_mom', name: 'คุณแม่', relationship: 'แม่', selfManaged: true, avatarId: 'profile-19' },
    { id: 'p_me', name: 'ฉัน', relationship: 'ตัวฉัน', selfManaged: false, avatarId: 'profile-02' },
  ];
  d.medications = [med('m_los', 'Losartan', '50 mg', 10, 'Cozaar'), med('m_vitd', 'Vitamin D', '1,000 IU', 60), med('m_cal', 'Calcium', '600 mg', 60), med('m_met', 'Metformin', '500 mg', 10), med('m_para', 'Paracetamol', '500 mg', 10)];
  d.assignments = [
    asg({ id: 'a_dad_los', medicationId: 'm_los', owner: { kind: 'person', personId: 'p_dad' }, stockQty: 5 }),
    asg({ id: 'a_dad_vitd', medicationId: 'm_vitd', owner: { kind: 'person', personId: 'p_dad' }, stockQty: 20, schedule: { kind: 'weekdays', days: [1, 4] } }),
    asg({ id: 'a_dad_cal', medicationId: 'm_cal', owner: { kind: 'person', personId: 'p_dad' }, stockQty: 40, schedule: { kind: 'interval', everyNDays: 2, anchorDate: '2026-10-09' }, doses: { ...z, morning: 1, evening: 1 } }),
    asg({ id: 'a_mom_met', medicationId: 'm_met', owner: { kind: 'person', personId: 'p_mom' }, stockQty: 16, doses: { ...z, morning: 1, evening: 1 } }),
    asg({ id: 'a_me_los', medicationId: 'm_los', owner: { kind: 'person', personId: 'p_me' }, stockQty: 120 }),
    asg({ id: 'a_house_para', medicationId: 'm_para', owner: { kind: 'household' }, schedule: null, doses: { ...z }, expiryDate: '2026-10-31' }),
    asg({ id: 'a_dad_old', medicationId: 'm_met', owner: { kind: 'person', personId: 'p_dad' }, active: false, stopped: { on: '2026-09-01', reason: 'แพทย์สั่งหยุด' } }),
  ];
  return d;
}
