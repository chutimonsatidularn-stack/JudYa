// Tiny hash router: works on GitHub Pages with no server rules, and a refresh keeps the page (#/members → members).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const read = () => (window.location.hash.replace(/^#/, '') || '/');
const Ctx = createContext<{ path: string; go: (p: string) => void; back: () => void }>({ path: '/', go: () => {}, back: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(read());
  useEffect(() => { const f = () => setPath(read()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  const go = (p: string) => { window.location.hash = p; };
  const back = () => window.history.back();
  return <Ctx.Provider value={{ path, go, back }}>{children}</Ctx.Provider>;
}
export const useRouter = () => useContext(Ctx);
