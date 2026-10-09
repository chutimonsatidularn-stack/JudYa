import { Avatar, Chip, ProgressBar, StockChip } from '../ui/components';
import { Icon } from '../ui/Icon';
import { medOf, personSummary, stockOf } from '../domain/selectors';
import { expiryStatus } from '../domain/calc';
import { fullDose, qf, thDate } from '../domain/format';
import type { AppData, Assignment, Person } from '../domain/schema';

/** chips under a member's name (NV-2): จัดยาเอง / ทานวันนี้ N / พักวันนี้ · ต้องซื้อ N / สต๊อกพอ */
export function PersonChips({ d, p, today }: { d: AppData; p: Person; today: string }) {
  const s = personSummary(d, p.id, today);
  return (
    <span className="chips" style={{ gap: 6, marginTop: 6, display: 'flex' }}>
      {s.self ? <Chip tone="info" icon="info">จัดยาเอง</Chip> : s.due ? <Chip tone="info" icon="pill">ทานวันนี้ {s.due}</Chip> : <Chip tone="rest" icon="moon">พักวันนี้</Chip>}
      {s.buy ? <Chip tone="low" icon="alert">ต้องซื้อ {s.buy}</Chip> : <Chip tone="ok" icon="check">สต๊อกพอ</Chip>}
    </span>
  );
}
export function PersonRow({ d, p, today, onClick, pad = '12px 14px' }: { d: AppData; p: Person; today: string; onClick: () => void; pad?: string }) {
  return (
    <button type="button" className="card tap" style={{ padding: pad }} onClick={onClick}>
      <Avatar avatarId={p.avatarId} size="lg" />
      <span className="grow"><b style={{ fontSize: 20 }}>{p.name}</b><PersonChips d={d} p={p} today={today} /></span>
      <Icon name="chev" size={20} />
    </button>
  );
}
export const SectionTitle = ({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) => (
  <div className="sec"><h2>{title}</h2>{action && <button type="button" className="lnk" onClick={action.onClick}>{action.label}</button>}</div>
);


/** household medicines show an expiry chip instead of a stock chip (HM-2) */
export function ExpiryChip({ iso, today }: { iso?: string; today: string }) {
  const e = expiryStatus(iso, today);
  if (e.status === 'unknown') return <Chip tone="rest" icon="info">ยังไม่ระบุวันหมดอายุ</Chip>;
  if (e.status === 'expired') return <Chip tone="low" icon="alert">หมดอายุแล้ว</Chip>;
  if (e.status === 'soon') return <Chip tone="low" icon="alert">ใกล้หมดอายุ อีก {e.days} วัน</Chip>;
  return <Chip tone="ok" icon="check">ยังไม่หมดอายุ</Chip>;
}
/** one medicine as a card (07b, 07c): name, brand, status chip, schedule + dose, bar, stock line */
export function MedCard({ d, a, today, onClick }: { d: AppData; a: Assignment; today: string; onClick: () => void }) {
  const m = medOf(d, a); if (!m) return null;
  const st = stockOf(d, a, today), house = st.status === 'household';
  const stockText = a.stockQty == null ? 'ยังไม่ระบุจำนวน' : `${qf(a.stockQty)} ${a.stockUnit}`;
  const left = st.status === 'unitMismatch' ? 'หน่วยไม่ตรงกับขนาดบรรจุ' : st.days != null ? `พอทานอีก ${st.days} วัน` : st.status === 'beyondCap' ? 'พอทานนานกว่า 10 ปี' : 'ยังไม่ทราบว่าพอทานกี่วัน';
  return (
    <button type="button" className="card" style={{ display: 'block', width: '100%' }} onClick={onClick}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="grow"><b style={{ fontSize: 18 }}>{m.generic}</b> <span className="mut sm">{m.strength}</span>{m.brand && <><br /><span className="mut sm">ยี่ห้อ {m.brand}</span></>}</span>
        {house ? <ExpiryChip iso={a.expiryDate} today={today} /> : <StockChip days={st.days} lowDays={d.settings.reminderDays} />}
      </span>
      <span className="mut sm" style={{ display: 'block', margin: '4px 0 10px' }}>{house ? `ใช้เมื่อมีอาการ · ${a.expiryDate ? `หมดอายุ ${thDate(a.expiryDate)}` : 'ยังไม่ระบุวันหมดอายุ'}` : fullDose(a, m, today)}</span>
      {!house && <ProgressBar percent={st.days == null ? 0 : st.days * 3} low={st.days != null && st.days <= d.settings.reminderDays} />}
      <span className="sm mut" style={{ display: 'block', marginTop: 6 }}>เหลือ {stockText}{house ? '' : ` · ${left}`}</span>
    </button>
  );
}
