import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Note, Pill, StockChip } from '../ui/components';
import { Icon } from '../ui/Icon';
import { SectionTitle } from './shared';
import { useRouter, queryOf, enc } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { personById, stockOf } from '../domain/selectors';
import { baht, compareOrder, orderLines, qtyText } from '../domain/order';
import { medTitle } from '../domain/format';

/** the order state lives in the address (?of=person&ph=pharmacy&skip=a,b) so the message pages can go back to it */
export const orderQuery = (q: { of?: string; ph?: string; skip?: string }): string => {
  const s = Object.entries(q).filter(([, v]) => v).map(([k, v]) => `${k}=${enc(v as string)}`).join('&');
  return s ? `?${s}` : '';
};

/** 10 Compare & order (PR-3…PR-9) */
export function OrderPage() {
  const { go, path } = useRouter();
  const { data: d } = useStore();
  const today = todayBangkok(), q = queryOf(path), of = q.of && personById(d, q.of) ? q.of : '';
  const [skip, setSkip] = useState<string[]>(q.skip ? q.skip.split(',') : []);
  const [ph, setPh] = useState(q.ph ?? '');
  const lines = orderLines(d, today, of || null), used = lines.filter((l) => !skip.includes(l.a.id));
  const c = compareOrder(d, used), best = c.best;
  const chosen = d.pharmacies.find((p) => p.id === ph) ?? (best ? d.pharmacies.find((p) => p.id === best.pharmacy.id) : undefined) ?? d.pharmacies[0];
  const name = (id: string) => used.find((l) => l.a.id === id)?.med.generic ?? '';
  const toggle = (id: string) => setSkip(skip.includes(id) ? skip.filter((x) => x !== id) : [...skip, id]);
  const phone = chosen?.phone?.replace(/[^0-9]/g, '');
  const why = !used.length ? 'เลือกยาอย่างน้อย 1 รายการ' : !chosen ? 'ยังไม่มีร้านยา เพิ่มที่ตั้งค่า' : '';
  const owner = of ? personById(d, of)?.name : undefined;
  return (
    <Screen>
      <Header title="สั่งยา" back="/" sub={`ควรสั่ง ${lines.length} รายการ${owner ? ` · ${owner}` : ''}`} pill={of ? <Pill onClick={() => go('/order')}>ดูทุกคน</Pill> : undefined} />
      <Body gap={12}>
        {lines.length === 0 ? <Note icon="info">ยังไม่มียาที่ต้องสั่ง</Note> : (
          <div className="card" style={{ padding: '4px 16px' }}>
            {lines.map((l) => { const on = !skip.includes(l.a.id); return (
              <div className="li" key={l.a.id}>
                <button type="button" role="checkbox" aria-checked={on} aria-label={`สั่ง ${medTitle(l.med)}`} className={`bx${on ? ' on' : ''}`} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid var(--navy)', display: 'grid', placeItems: 'center', flex: 'none', background: on ? 'var(--navy)' : '#fff', color: '#fff' }} onClick={() => toggle(l.a.id)}>{on && <Icon name="check" size={18} />}</button>
                <span className="grow"><b>{medTitle(l.med)}</b><br /><span className="mut sm">{l.personName} · สั่ง {qtyText(l)}</span></span>
                <StockChip days={stockOf(d, l.a, today).days} lowDays={d.settings.reminderDays} />
              </div>); })}
          </div>
        )}
        {used.length > 0 && (best ? (
          <div className="sum"><small>แนะนำรอบนี้ (รวมค่าส่งแล้ว)</small><b>{best.pharmacy.name} · {baht(best.total as number)}</b>
            <span className="sm" style={{ display: 'block', color: 'var(--mut)', marginTop: 2 }}>ค่ายา {baht(best.sub)} + ค่าส่ง {baht(best.fee as number)}{c.next ? ` · ถูกกว่าร้านถัดไป ${baht((c.next.total as number) - (best.total as number))}` : ''}</span></div>
        ) : <Note tone="caution" icon="alert">ยังเทียบร้านไม่ได้ ต้องมีราคาครบทุกรายการและค่าส่งอย่างน้อย 1 ร้าน ใส่ราคาได้ในหน้าแก้ไขยา</Note>)}
        {best && c.split && <Note icon="info">ถ้าแยกซื้อ {c.split.pharmacies.length} ร้าน ({c.split.pharmacies.map((id) => d.pharmacies.find((p) => p.id === id)?.name).join(' + ')}) รวมค่าส่งแล้ว {baht(c.split.total)} ถูกกว่าซื้อร้านเดียวอีก {baht((best.total as number) - c.split.total)}</Note>}
        {d.pharmacies.length > 0 && <SectionTitle title="เลือกร้าน" />}
        {c.rows.map((r) => { const p = r.pharmacy, sel = chosen?.id === p.id, ph0 = d.pharmacies.find((x) => x.id === p.id);
          return (
            <button key={p.id} type="button" className="card tap" style={{ padding: '12px 14px', ...(sel ? { border: '2px solid var(--navy)' } : {}) }} aria-pressed={sel} onClick={() => setPh(p.id)}>
              <span className={`rad${sel ? ' on' : ''}`}>{sel && <Icon name="check" size={14} />}</span>
              <span className="grow"><b>{p.name}</b>{best && best.pharmacy.id === p.id && <span className="chip ok" style={{ marginLeft: 4 }}><Icon name="check" size={14} />ถูกที่สุด</span>}<br />
                {r.ok ? <span className="mut sm">ค่ายา {baht(r.sub)} + ส่ง {baht(r.fee as number)}</span> : <span className="sm" style={{ color: 'var(--warnink)' }}>{used.length === 0 ? '' : r.missing.length ? `ขาดราคา: ${r.missing.map(name).join(', ')}` : 'ไม่ระบุค่าส่ง'}</span>}<br />
                <span className="mut sm">{ph0?.phone ? `โทร ${ph0.phone}` : 'ยังไม่มีเบอร์โทร'}</span></span>
              {r.ok ? <b style={{ fontSize: 19 }}>{baht(r.total as number)}</b> : <span className="mut sm">เทียบไม่ได้</span>}
            </button>); })}
        {d.pharmacies.length === 0 && <Note icon="info">ยังไม่มีร้านยา เพิ่มร้านที่หน้าตั้งค่า</Note>}
      </Body>
      <Footer>
        <Button icon="chat" disabled={!!why} onClick={() => go(`/order/message${orderQuery({ of, ph: chosen?.id, skip: skip.join(',') })}`)}>สร้างข้อความสั่งยา</Button>
        {phone && chosen ? <a className="btn s" href={`tel:${phone}`}><Icon name="call" size={20} />โทรสั่งที่ {chosen.name}</a> : <Button variant="s" disabled>{chosen ? `${chosen.name} ยังไม่มีเบอร์โทร` : 'ยังไม่มีเบอร์โทร'}</Button>}
        {why && <p className="mut cap" style={{ textAlign: 'center' }}>{why}</p>}
      </Footer>
    </Screen>
  );
}
