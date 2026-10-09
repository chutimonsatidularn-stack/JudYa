import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useRouter } from '../router';

/** Header: back arrow (when not a root tab) + title + at most one pill on the right (design-system "Patterns"). */
export function Header({ title, sub, back, pill }: { title: ReactNode; sub?: ReactNode; back?: string | (() => void); pill?: ReactNode }) {
  const { go, back: historyBack } = useRouter();
  const onBack = typeof back === 'function' ? back : back ? () => go(back) : historyBack;
  return (
    <div className="hdr" style={back ? undefined : { paddingLeft: 24 }}>
      {back !== undefined && <button type="button" className="ib" onClick={onBack} aria-label="ย้อนกลับ"><Icon name="back" /></button>}
      <h1>{title}{sub && <small>{sub}</small>}</h1>
      {pill}
    </div>
  );
}
export const Body = ({ children, gap = 16 }: { children: ReactNode; gap?: number }) => <div className="body" style={{ gap }}>{children}</div>;
export const Footer = ({ children }: { children: ReactNode }) => <div className="foot">{children}</div>;

const TABS: [string, string, string][] = [['/', 'หน้าแรก', 'home'], ['/medicines', 'ยา', 'pill'], ['/share', 'แชร์', 'share'], ['/settings', 'ตั้งค่า', 'gear']];
/** Bottom navigation: หน้าแรก · ยา · แชร์ · ตั้งค่า (NV-1). */
export function BottomNav() {
  const { path, go } = useRouter();
  return (
    <nav className="nav" aria-label="เมนูหลัก">
      {TABS.map(([p, t, i]) => { const on = p === '/' ? path === '/' : path.startsWith(p); return <button key={p} type="button" className={`ni${on ? ' on' : ''}`} onClick={() => go(p)} aria-current={on ? 'page' : undefined}><Icon name={i} />{t}</button>; })}
    </nav>
  );
}
/** One screen = the app column. Root tabs show the bottom nav. */
export const Screen = ({ children, nav = false }: { children: ReactNode; nav?: boolean }) => <>{children}{nav && <BottomNav />}</>;
