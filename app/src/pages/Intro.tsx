import { useEffect, useState, type ReactNode } from 'react';
import { Body, Footer, Screen } from '../ui/Shell';
import { Button } from '../ui/components';
import { Icon } from '../ui/Icon';
import { loadData, type Store } from '../domain/storage';

const files = import.meta.glob('../../../docs/design/assets/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const pic = (name: string) => Object.entries(files).find(([k]) => k.endsWith(`/${name}.svg`))?.[1] ?? '';

export const INTRO_KEY = 'judya.intro';
/** the splash and welcome show only on the very first start: nothing saved yet and not seen before (01, 02) */
export function introNeeded(store: Store): boolean {
  try { return store.getItem(INTRO_KEY) === null && loadData(store).status === 'empty'; } catch { return false; }
}

/** 01 Splash → 02 Welcome → the app. Splash moves on by itself after a moment or on tap. */
export function Intro({ store, children }: { store: Store; children: ReactNode }) {
  const [stage, setStage] = useState<'splash' | 'welcome' | 'done'>(() => (introNeeded(store) ? 'splash' : 'done'));
  useEffect(() => { if (stage !== 'splash') return; const t = setTimeout(() => setStage('welcome'), 2200); return () => clearTimeout(t); }, [stage]);
  const finish = (to?: string) => { try { store.setItem(INTRO_KEY, '1'); } catch { /* shown again next time, harmless */ } if (to) window.location.hash = to; setStage('done'); };
  if (stage === 'done') return <>{children}</>;
  if (stage === 'splash') return (
    <div className="app"><div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <button type="button" className="body" aria-label="เริ่มต้น" onClick={() => setStage('welcome')} style={{ padding: '32px 24px 0', alignItems: 'center', gap: 76, justifyContent: 'flex-start', overflow: 'hidden' }}>
        <img src={pic('logo-vertical-tight')} alt="JudYa ดูแลยา...ง่ายทุกวัน" style={{ width: 210, height: 'auto', display: 'block' }} />
        <img src={pic('splash-noleaf-tight')} alt="" style={{ width: 330, height: 'auto', display: 'block' }} />
      </button>
    </div></div>
  );
  return (
    <div className="app"><Screen>
      <Body gap={22}>
        <img src={pic('logo-vertical-notag-tight')} alt="JudYa" style={{ width: 190, height: 'auto', display: 'block', alignSelf: 'center', marginTop: 8 }} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 30, lineHeight: 1.3, fontWeight: 700 }}>ดูแลยาของคนที่คุณรัก<br />ได้ในที่เดียว</h1>
          <p className="mut" style={{ marginTop: 8 }}>เก็บรายการยาของทุกคนในบ้านไว้ด้วยกัน</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['pill', 'เช็คสต๊อกยา', 'รู้ว่ายาแต่ละตัวพอทานอีกกี่วัน'], ['bell', 'เตือนซื้อยา', 'เตือนก่อนยาหมดตามจำนวนวันที่ตั้งไว้'], ['steth', 'ส่งต่อข้อมูลยา', 'สรุปให้แพทย์หรือคนดูแลคนอื่นได้ทันที']].map(([ic, t, s]) => (
            <div className="feat" key={t}><span className="disc"><Icon name={ic as string} /></span><div><b>{t}</b><span className="mut sm">{s}</span></div></div>
          ))}
        </div>
      </Body>
      <Footer>
        <Button onClick={() => finish()}>เริ่มใช้งาน</Button>
        <Button variant="s" onClick={() => finish('#/settings')}>ฉันมีไฟล์สำรองข้อมูล</Button>
      </Footer>
    </Screen></div>
  );
}
