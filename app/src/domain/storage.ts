// Load the saved data and bring it to v3 safely (ADR-0005). Works on any object shaped like localStorage so it can be tested.
// Rules: never write before a backup of the raw old string exists; never overwrite anything if migration or validation fails;
// running it again on v3 changes nothing.
import { RootV3 } from './schema';
import { migrate1to3 } from './migrate';

export const STORAGE_KEY = 'medmate.v1'; // unchanged on purpose (P-5, C-3)
export const backupKey = (version: number) => `${STORAGE_KEY}.backup.v${version}`;

export type Store = Pick<Storage, 'getItem' | 'setItem'>;
export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; data: RootV3; migratedFrom: number | null }
  | { status: 'error'; code: 'corrupt' | 'unsupported' | 'invalid' | 'backup-failed' | 'write-failed'; message: string };

const err = (code: Extract<LoadResult, { status: 'error' }>['code'], message: string): LoadResult => ({ status: 'error', code, message });

export function loadData(store: Store): LoadResult {
  let raw: string | null;
  try { raw = store.getItem(STORAGE_KEY); } catch { return err('corrupt', 'อ่านข้อมูลในเครื่องไม่ได้'); }
  if (raw === null) return { status: 'empty' };

  let json: unknown;
  try { json = JSON.parse(raw); } catch { return err('corrupt', 'ข้อมูลในเครื่องอ่านไม่ได้ (ไม่ได้แก้อะไร)'); }
  const version = typeof json === 'object' && json !== null ? (json as { version?: unknown }).version : undefined;

  if (version === 3) {
    const r = RootV3.safeParse(json);
    return r.success ? { status: 'ok', data: r.data, migratedFrom: null } : err('invalid', 'ข้อมูลรุ่น 3 ไม่ผ่านการตรวจ (ไม่ได้แก้อะไร)');
  }
  if (version !== 1) {
    return err('unsupported', `ยังไม่รองรับข้อมูลรุ่น ${String(version)} (ไม่ได้แก้อะไร) กรุณาส่งไฟล์สำรองให้ผู้ช่วยดู`);
  }

  const result = migrate1to3(json);
  if (!result.ok) return err('invalid', `${result.error} (ข้อมูลเดิมยังอยู่ ไม่ได้แก้อะไร)`);

  // 1) keep the raw old string before anything is written (never overwrite an existing backup)
  try {
    if (store.getItem(backupKey(1)) === null) store.setItem(backupKey(1), raw);
    if (store.getItem(backupKey(1)) === null) return err('backup-failed', 'สำรองข้อมูลเดิมไม่สำเร็จ จึงยังไม่ย้ายข้อมูล');
  } catch { return err('backup-failed', 'สำรองข้อมูลเดิมไม่สำเร็จ จึงยังไม่ย้ายข้อมูล'); }

  // 2) write v3, then read it back and validate (all-or-nothing)
  const text = JSON.stringify(result.data);
  try {
    store.setItem(STORAGE_KEY, text);
    const back = RootV3.safeParse(JSON.parse(store.getItem(STORAGE_KEY) ?? 'null'));
    if (!back.success) throw new Error('verify');
  } catch {
    try { store.setItem(STORAGE_KEY, raw); } catch { /* the raw copy is still under the backup key */ }
    return err('write-failed', 'บันทึกข้อมูลรุ่นใหม่ไม่สำเร็จ ข้อมูลเดิมยังอยู่');
  }
  return { status: 'ok', data: result.data, migratedFrom: 1 };
}
