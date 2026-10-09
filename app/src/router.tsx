// Tiny hash router: works on GitHub Pages with no server rules, and a refresh keeps the page (#/members → members).
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const read = () => (window.location.hash.replace(/^#/, '') || '/');
const Ctx = createContext<{ path: string; prev: string; go: (p: string) => void; back: () => void }>({ path: '/', prev: '/', go: () => {}, back: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(read());
  const prev = useRef('/'), cur = useRef(path);
  useEffect(() => { const f = () => { prev.current = cur.current; cur.current = read(); setPath(cur.current); }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  const go = (p: string) => { window.location.hash = p; };
  const back = () => window.history.back();
  return <Ctx.Provider value={{ path, prev: prev.current, go, back }}>{children}</Ctx.Provider>;
}
export const useRouter = () => useContext(Ctx);

/** '/member/p_1/edit' against '/member/:id/edit' → {id:'p_1'} or null */
export function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/'), b = path.split('?')[0]!.split('/');
  if (a.length !== b.length) return null;
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    const p = a[i]!, q = b[i]!;
    if (p.startsWith(':')) out[p.slice(1)] = decodeURIComponent(q); else if (p !== q) return null;
  }
  return out;
}
export const enc = encodeURIComponent;

/** '?owner=p_1' on a path → {owner:'p_1'} */
export const queryOf = (path: string): Record<string, string> => { const out: Record<string, string> = {}; new URLSearchParams(path.split('?')[1] ?? '').forEach((v, k) => { out[k] = v; }); return out; };
