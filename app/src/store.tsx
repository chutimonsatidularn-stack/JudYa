// App state: the saved data (zod-validated) kept in React and written to the device after every change (D-1).
// If saved data cannot be read, the app shows the problem and writes NOTHING (ADR-0007, SEC-2).
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadData, saveData, emptyData, type Store, type LoadResult } from './domain/storage';
import type { AppData } from './domain/schema';

type Ctx = {
  data: AppData;
  update: (fn: (d: AppData) => AppData) => boolean;
  toast: string;
  say: (m: string) => void;
  loadError: string | null;
  saveError: string | null;
};
const C = createContext<Ctx | null>(null);

export function StoreProvider({ store, children, initial }: { store: Store; children: ReactNode; initial?: LoadResult }) {
  const first = useRef<LoadResult>(initial ?? loadData(store)).current;
  const [data, setData] = useState<AppData>(first.status === 'ok' ? first.data : emptyData());
  const [toast, setToast] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const loadError = first.status === 'error' ? first.message : null;

  const say = useCallback((m: string) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 2200); }, []);
  const update = useCallback((fn: (d: AppData) => AppData) => {
    if (loadError) return false; // never overwrite data we could not read
    const next = fn(data);
    const r = saveData(store, next);
    if (!r.ok) { setSaveError(r.message); return false; }
    setSaveError(null); setData(next); return true;
  }, [data, loadError, store]);

  const value = useMemo(() => ({ data, update, toast, say, loadError, saveError }), [data, update, toast, say, loadError, saveError]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useStore = () => { const v = useContext(C); if (!v) throw new Error('StoreProvider missing'); return v; };
