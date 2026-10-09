// Settings, pharmacies and the backup file, as pure functions (old data in → new data out).
import { AppData, DATA_VERSION, type Pharmacy } from './schema';
import { emptyData } from './storage';

export const PHONE_RE = /^[0-9][0-9\- ]{7,13}[0-9]$/;
export const BACKUP_MAX_BYTES = 5 * 1024 * 1024;

export type PharmacyForm = { id: string | null; name: string; note: string; phone: string; shipping: string; freeOver: string };
export const emptyPharmacyForm = (): PharmacyForm => ({ id: null, name: '', note: '', phone: '', shipping: '', freeOver: '' });
export const formFromPharmacy = (p: Pharmacy): PharmacyForm => ({ id: p.id, name: p.name, note: p.note ?? '', phone: p.phone ?? '', shipping: p.shippingFee == null ? '' : String(p.shippingFee), freeOver: p.freeShippingOver == null ? '' : String(p.freeShippingOver) });

export const phoneOk = (v: string): boolean => !v.trim() || PHONE_RE.test(v.trim());
const baht = (v: string): boolean => v.trim() === '' || /^\d{1,5}$/.test(v.trim());

/** '' when it can be saved, else the one reason shown under the button */
export function pharmacyError(d: AppData, f: PharmacyForm): string {
  const n = f.name.trim();
  if (!n) return 'ใส่ชื่อร้านก่อน';
  if (n.length > 40) return 'ชื่อร้านยาวเกิน 40 ตัวอักษร';
  if (d.pharmacies.some((p) => p.id !== f.id && p.name.trim() === n)) return 'มีร้านชื่อนี้แล้ว';
  if (!phoneOk(f.phone)) return 'เบอร์โทรไม่ถูกต้อง';
  if (!baht(f.shipping)) return 'ค่าส่งใส่เป็นตัวเลขบาท 0–99999';
  if (!baht(f.freeOver)) return 'ยอดส่งฟรีใส่เป็นตัวเลขบาท';
  if (f.freeOver.trim() !== '' && Number(f.freeOver) === 0) return 'ยอดส่งฟรีต้องมากกว่า 0 (ถ้าไม่มีให้เว้นว่าง)';
  return '';
}

export function savePharmacy(d: AppData, f: PharmacyForm, newId: string): AppData {
  const old = f.id ? d.pharmacies.find((p) => p.id === f.id) : undefined;
  const p: Pharmacy = {
    ...(old ?? {}), id: f.id ?? newId, name: f.name.trim(), active: true,
    shippingFee: f.shipping.trim() === '' ? null : Number(f.shipping),
    freeShippingOver: f.freeOver.trim() === '' ? null : Number(f.freeOver),
  };
  const opt = (k: 'note' | 'phone', v: string) => { if (v.trim()) p[k] = v.trim(); else delete p[k]; };
  opt('note', f.note); opt('phone', f.phone);
  return { ...d, pharmacies: old ? d.pharmacies.map((x) => (x.id === p.id ? p : x)) : [...d.pharmacies, p] };
}

/** how many price rows would go with this pharmacy */
export const priceRowsOf = (d: AppData, id: string): number => d.medications.reduce((n, m) => n + m.prices.filter((r) => r.pharmacyId === id).length, 0);
export const deletePharmacy = (d: AppData, id: string): AppData => ({
  ...d,
  pharmacies: d.pharmacies.filter((p) => p.id !== id),
  medications: d.medications.map((m) => (m.prices.some((r) => r.pharmacyId === id) ? { ...m, prices: m.prices.filter((r) => r.pharmacyId !== id) } : m)),
  orderDrafts: d.orderDrafts,
});

export const REMINDER_MIN = 1, REMINDER_MAX = 30;
export const setReminderDays = (d: AppData, n: number): AppData => ({ ...d, settings: { ...d.settings, reminderDays: Math.min(REMINDER_MAX, Math.max(REMINDER_MIN, Math.round(n))) } });

/* ---- backup file (D-3) ---- */
export const backupName = (today: string): string => `judya-backup-${today}.json`;
export const exportBackup = (d: AppData): string => JSON.stringify(d, null, 1);

export type Counts = { persons: number; medications: number; assignments: number; allergies: number; pharmacies: number };
export const countsOf = (d: AppData): Counts => ({ persons: d.persons.length, medications: d.medications.length, assignments: d.assignments.length, allergies: d.allergies.length, pharmacies: d.pharmacies.length });

export type BackupResult = { ok: true; data: AppData } | { ok: false; message: string };
/** AC-D2: refuse anything that is not a valid JudYa backup; the current data is never touched here */
export function parseBackup(text: string, bytes = text.length): BackupResult {
  if (bytes > BACKUP_MAX_BYTES) return { ok: false, message: 'ไฟล์ใหญ่เกินไป (เกิน 5 MB) ไม่ใช่ไฟล์สำรองของ JudYa' };
  let json: unknown;
  try { json = JSON.parse(text); } catch { return { ok: false, message: 'อ่านไฟล์ไม่ได้ ไม่ใช่ไฟล์สำรองของ JudYa' }; }
  if (typeof json !== 'object' || json === null || (json as { version?: unknown }).version !== DATA_VERSION) return { ok: false, message: 'ไฟล์นี้ไม่ใช่ไฟล์สำรองของ JudYa รุ่นนี้' };
  const r = AppData.safeParse(json);
  return r.success ? { ok: true, data: r.data } : { ok: false, message: 'ข้อมูลในไฟล์ไม่ผ่านการตรวจ จึงไม่นำเข้า' };
}

export const deleteAllData = (): AppData => emptyData();
