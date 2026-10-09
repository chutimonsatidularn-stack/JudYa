// What the doctor page shows and the text the share page copies (UI-5, UI-6). Pure functions.
import { describeChange, fullDose, medTitle, thDate } from './format';
import { assignmentsOfPerson, medOf, personById, stockOf } from './selectors';
import type { AppData, DoseChange } from './schema';

export type Shares = AppData['settings']['shares'];
export type ShareKey = 'list' | 'schedule' | 'stock';
export const SHARE_ROWS: { key: ShareKey; title: string; text: string }[] = [
  { key: 'list', title: 'รายการยา', text: 'ชื่อยาและความแรง' },
  { key: 'schedule', title: 'ตารางทาน', text: 'วันที่และขนาดยา' },
  { key: 'stock', title: 'สต๊อกคงเหลือ', text: 'จำนวนวันที่พอทาน' },
];
/** one switch controls the pair of stored flags that belong together */
export const sharesOn = (s: Shares, k: ShareKey): boolean => (k === 'schedule' ? s.schedule && s.doses : k === 'stock' ? s.stock && s.days : s.list);
export const setShare = (d: AppData, k: ShareKey, v: boolean): AppData => ({
  ...d, settings: { ...d.settings, shares: { ...d.settings.shares, ...(k === 'list' ? { list: v } : k === 'schedule' ? { schedule: v, doses: v } : { stock: v, days: v }) } },
});

/** latest history entries (newest first) over all the person's medicines, running or stopped */
export function recentChanges(d: AppData, personId: string, n = 3): (DoseChange & { title: string; unit: string })[] {
  const ids = new Set(d.assignments.filter((a) => a.owner.kind === 'person' && a.owner.personId === personId).map((a) => a.id));
  return d.changes.filter((c) => ids.has(c.assignmentId)).sort((p, q) => (q.on + q.at).localeCompare(p.on + p.at)).slice(0, n).map((c) => {
    const a = d.assignments.find((x) => x.id === c.assignmentId)!, m = medOf(d, a);
    return { ...c, title: m ? medTitle(m) : '', unit: m?.baseUnit ?? '' };
  });
}
export const changeText = (c: DoseChange & { unit: string }, today: string): string =>
  c.kind === 'stop' ? 'หยุดใช้ยา' : c.previous && c.next ? describeChange(c.previous, c.next, c.unit, today) : 'ปรับโดส';

/** the text the share page copies; allergies are always included for safety, the rest follows the switches */
export function summaryText(d: AppData, personId: string, today: string): string {
  const p = personById(d, personId); if (!p) return '';
  const sh = d.settings.shares, out: string[] = [`สรุปยาของ ${p.name} (ณ ${thDate(today)})`];
  const al = d.allergies.filter((a) => a.personId === personId);
  out.push(al.length ? `แพ้ยา: ${al.map((a) => `${a.drug} (${a.symptoms.join(', ')})`).join('; ')}` : 'แพ้ยา: ยังไม่มีบันทึก');
  if (sh.list) {
    const rows = assignmentsOfPerson(d, personId).flatMap((a, i) => {
      const m = medOf(d, a); if (!m) return [];
      const parts = [`${i + 1}) ${medTitle(m)}`];
      if (sh.schedule && sh.doses) parts.push(fullDose(a, m, today));
      if (sh.stock && sh.days) { const s = stockOf(d, a, today); parts.push(s.days == null ? 'สต๊อกยังไม่ทราบ' : `เหลือประมาณ ${s.days} วัน`); }
      return [parts.join(' · ')];
    });
    out.push(rows.length ? rows.join('\n') : '(ยังไม่มียา)');
  }
  out.push('ข้อมูลนี้ช่วยสื่อสารกับแพทย์ ไม่ใช่การวินิจฉัย');
  return out.join('\n');
}
