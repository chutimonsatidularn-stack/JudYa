import { describe, expect, it } from 'vitest';
import { loadData, saveData, emptyData, STORAGE_KEY, type Store } from '../storage';
import { AppData } from '../schema';

const memStore = (initial: Record<string, string> = {}): Store & { map: Map<string, string> } => {
  const map = new Map(Object.entries(initial));
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); } };
};

describe('storage (AC-D2, SEC-2)', () => {
  it('empty storage → empty; a fresh data object is valid', () => {
    expect(loadData(memStore()).status).toBe('empty');
    expect(AppData.safeParse(emptyData()).success).toBe(true);
  });

  it('save then load gives the same data', () => {
    const s = memStore(); const d = emptyData();
    d.persons.push({ id: 'p1', name: 'คุณ A', selfManaged: false, avatarId: 'profile-11' });
    expect(saveData(s, d)).toEqual({ ok: true });
    const r = loadData(s);
    expect(r.status === 'ok' && r.data).toEqual(d);
  });

  it('never touches the old app key medmate.v1', () => {
    const old = JSON.stringify({ version: 1, persons: [] });
    const s = memStore({ 'medmate.v1': old });
    expect(loadData(s).status).toBe('empty');
    saveData(s, emptyData());
    expect(s.map.get('medmate.v1')).toBe(old);
  });

  it('refuses to save invalid data and leaves the saved value alone', () => {
    const s = memStore(); saveData(s, emptyData()); const before = s.map.get(STORAGE_KEY);
    expect(saveData(s, { version: 1, persons: 'x' }).ok).toBe(false);
    expect(s.map.get(STORAGE_KEY)).toBe(before);
  });

  it('storage full → says so and keeps the previous value', () => {
    const s0 = memStore(); saveData(s0, emptyData()); const before = s0.map.get(STORAGE_KEY)!;
    const map = new Map([[STORAGE_KEY, before]]);
    const full: Store = { getItem: (k) => map.get(k) ?? null, setItem: () => { throw new Error('quota'); } };
    const r = saveData(full, { ...emptyData(), household: { name: 'ใหม่' } });
    expect(r.ok).toBe(false);
    expect(map.get(STORAGE_KEY)).toBe(before);
  });

  it('corrupt, foreign-version or invalid saved data is reported and never changed', () => {
    for (const [text, code] of [['{not json', 'corrupt'], [JSON.stringify({ version: 3 }), 'unsupported'], [JSON.stringify({}), 'unsupported'], [JSON.stringify({ version: 1, persons: [] }), 'invalid']] as const) {
      const s = memStore({ [STORAGE_KEY]: text });
      expect(loadData(s)).toMatchObject({ status: 'error', code });
      expect(s.map.get(STORAGE_KEY)).toBe(text);
    }
  });

  it('keeps script-like text as plain text (escaping is the screens\' job, SEC-1)', () => {
    const d = emptyData(); d.persons.push({ id: 'p1', name: '<img src=x onerror=alert(1)>', selfManaged: false });
    const s = memStore(); saveData(s, d);
    const r = loadData(s); expect(r.status === 'ok' && r.data.persons[0]!.name).toBe('<img src=x onerror=alert(1)>');
  });
});
