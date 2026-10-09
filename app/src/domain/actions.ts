// Changes to the data, as pure functions (old data in → new data out). The screens call these through the store.
import type { AppData, Allergy, Person } from './schema';

export const SYMPTOMS = ['ผื่น/ลมพิษ', 'คัน', 'บวมที่หน้า/ปาก', 'หายใจลำบาก', 'คลื่นไส้/อาเจียน', 'ท้องเสีย', 'เวียนหัว/ใจสั่น', 'อื่นๆ'] as const;
export const SEVERE = ['บวมที่หน้า/ปาก', 'หายใจลำบาก'] as const;
export const RELATIONS = ['พ่อ', 'แม่', 'ปู่ย่าตายาย', 'คู่สมรส', 'ลูก', 'ตัวฉัน', 'อื่นๆ'] as const;

export const newId = (prefix: string): string => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

/** birth year in พ.ศ. → age, or null when empty/invalid (valid: 4 digits, 2400 … this year) */
export const ageFromBirthYear = (by: string | number | undefined, today: string): number | null => {
  const s = String(by ?? '').trim(); const now = Number(today.slice(0, 4)) + 543;
  return /^\d{4}$/.test(s) && Number(s) >= 2400 && Number(s) <= now ? now - Number(s) : null;
};

export type MemberForm = { id: string | null; name: string; relationship: string; birthYear: string; avatarId: string };
/** '' when the form can be saved, else the one reason shown under the button (MB-5/6) */
export function memberError(d: AppData, f: MemberForm, today: string): string {
  const n = f.name.trim();
  if (!n) return 'ใส่ชื่อก่อน';
  if (n.length > 40) return 'ชื่อยาวเกิน 40 ตัวอักษร';
  if (d.persons.some((p) => p.id !== f.id && p.name.trim() === n)) return 'มีสมาชิกชื่อนี้แล้ว';
  if (f.birthYear.trim() && ageFromBirthYear(f.birthYear, today) === null) return `ปีเกิดไม่ถูกต้อง (พ.ศ. 2400–${Number(today.slice(0, 4)) + 543})`;
  return '';
}
const personFromForm = (f: MemberForm, base: Partial<Person>): Person => {
  const out: Person = { selfManaged: false, ...base, id: (f.id ?? base.id) as string, name: f.name.trim(), avatarId: f.avatarId };
  if (f.relationship) out.relationship = f.relationship; else delete out.relationship;
  const by = f.birthYear.trim(); if (by) out.birthYear = Number(by); else delete out.birthYear;
  return out;
};
export const addMember = (d: AppData, f: MemberForm, id: string): AppData => ({ ...d, persons: [...d.persons, personFromForm({ ...f, id }, {})] });
export const updateMember = (d: AppData, f: MemberForm): AppData => ({ ...d, persons: d.persons.map((p) => (p.id === f.id ? personFromForm(f, p) : p)) });
/** MB-7: take out, not delete — medicines, history and allergies stay */
export const setRemoved = (d: AppData, id: string, removed: boolean): AppData => ({ ...d, persons: d.persons.map((p) => { if (p.id !== id) return p; const q: Person = { ...p, removed }; if (!removed) delete q.removed; return q; }) });
export const setSelfManaged = (d: AppData, id: string, v: boolean): AppData => ({ ...d, persons: d.persons.map((p) => (p.id === id ? { ...p, selfManaged: v } : p)) });
export const setAvatar = (d: AppData, id: string, avatarId: string): AppData => ({ ...d, persons: d.persons.map((p) => (p.id === id ? { ...p, avatarId } : p)) });

export type AllergyForm = { drug: string; symptoms: string[]; note: string };
export const allergyValid = (f: AllergyForm): boolean => !!f.drug.trim() && f.symptoms.length > 0;
/** AL-3/4: add or edit; an edit keeps the original date; delete is a hard delete with no log (Q-A) */
export function saveAllergy(d: AppData, personId: string, f: AllergyForm, today: string, id: string, editId?: string): AppData {
  const base = { drug: f.drug.trim(), symptoms: f.symptoms as Allergy['symptoms'], ...(f.note.trim() ? { note: f.note.trim() } : {}) };
  if (editId) return { ...d, allergies: d.allergies.map((a) => (a.id === editId ? { ...a, drug: base.drug, symptoms: base.symptoms, ...(base.note ? { note: base.note } : { note: undefined }) } : a)) };
  return { ...d, allergies: [...d.allergies, { id, personId, ...base, recordedOn: today, source: 'manual' }] };
}
export const deleteAllergy = (d: AppData, id: string): AppData => ({ ...d, allergies: d.allergies.filter((a) => a.id !== id) });

/** NV-4: tick / untick one "<assignmentId>:<period>" for today; ticks of other days are dropped */
export function toggleTick(d: AppData, key: string, today: string): AppData {
  const cur = d.ticks && d.ticks.date === today ? d.ticks.done : [];
  return { ...d, ticks: { date: today, done: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] } };
}
