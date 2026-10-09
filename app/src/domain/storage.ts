// Saving and loading the app's data on the device (localStorage-like store, so it can be tested).
// The new app uses its OWN key. The old app's key `medmate.v1` is never read, changed or deleted (ADR-0007).
import { AppData, DATA_VERSION } from './schema';

export const STORAGE_KEY = 'judya.v1';
export type Store = Pick<Storage, 'getItem' | 'setItem'>;
export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; data: AppData }
  | { status: 'error'; code: 'corrupt' | 'unsupported' | 'invalid'; message: string };
export type SaveResult = { ok: true } | { ok: false; message: string };

export function loadData(store: Store): LoadResult {
  let raw: string | null;
  try { raw = store.getItem(STORAGE_KEY); } catch { return { status: 'error', code: 'corrupt', message: 'อ่านข้อมูลในเครื่องไม่ได้' }; }
  if (raw === null) return { status: 'empty' };
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return { status: 'error', code: 'corrupt', message: 'ข้อมูลในเครื่องอ่านไม่ได้ (ไม่ได้แก้อะไร)' }; }
  const version = typeof json === 'object' && json !== null ? (json as { version?: unknown }).version : undefined;
  if (version !== DATA_VERSION) return { status: 'error', code: 'unsupported', message: `ข้อมูลรุ่น ${String(version)} ใช้กับแอปนี้ไม่ได้ (ไม่ได้แก้อะไร)` };
  const r = AppData.safeParse(json);
  return r.success ? { status: 'ok', data: r.data } : { status: 'error', code: 'invalid', message: 'ข้อมูลในเครื่องไม่ผ่านการตรวจ (ไม่ได้แก้อะไร)' };
}

/** Validates, writes, reads back and validates again. On any failure the previous saved value is put back. */
export function saveData(store: Store, data: unknown): SaveResult {
  const check = AppData.safeParse(data);
  if (!check.success) return { ok: false, message: 'ข้อมูลไม่ถูกต้อง จึงยังไม่บันทึก' };
  let before: string | null = null;
  try { before = store.getItem(STORAGE_KEY); } catch { /* treated as no previous value */ }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(check.data));
    if (!AppData.safeParse(JSON.parse(store.getItem(STORAGE_KEY) ?? 'null')).success) throw new Error('verify');
    return { ok: true };
  } catch {
    try { if (before !== null) store.setItem(STORAGE_KEY, before); } catch { /* nothing more to do */ }
    return { ok: false, message: 'บันทึกข้อมูลลงเครื่องไม่สำเร็จ (พื้นที่เต็มหรือปิดการเก็บข้อมูล) ข้อมูลเดิมยังอยู่' };
  }
}

export const emptyData = (): AppData => ({
  version: DATA_VERSION,
  household: { name: 'บ้านของเรา' },
  persons: [], allergies: [], medications: [], assignments: [], changes: [], pharmacies: [],
  templates: [
    { id: 't1', name: 'แบบทั่วไป', body: 'สวัสดีครับ/ค่ะ {ร้านยา}\nขอสั่งยาตามรายการนี้\n{รายการยา}\nรบกวนแจ้งราคารวมและเวลารับยาด้วย ขอบคุณครับ/ค่ะ' },
    { id: 't2', name: 'แบบสั้น', body: '{ร้านยา} ขอสั่งยา\n{รายการยา}\nขอบคุณครับ/ค่ะ' },
  ],
  settings: { reminderDays: 7, expiryWarnDays: 30, selectedTemplateId: 't1', shares: { list: true, schedule: true, doses: true, stock: false, days: false } },
  orderDrafts: [],
});
