import { Header, Body, Screen } from '../ui/Shell';
import { TapCard } from '../ui/components';
import { SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { dueToday, expiringHousehold, lowAssignments, medOf, members, notifCount, personById, stockOf } from '../domain/selectors';
import { joinTh, medTitle, thDate } from '../domain/format';

/** 06b: the bell collects everything in one place (NV-3) */
export function Notifications() {
  const { go } = useRouter();
  const { data: d } = useStore();
  const today = todayBangkok();
  const due = members(d).filter((p) => dueToday(d, p.id, today).length > 0);
  const low = lowAssignments(d, today), exp = expiringHousehold(d, today);
  return (
    <Screen>
      <Header title="การแจ้งเตือน" sub={`${notifCount(d, today)} รายการ`} back="/" />
      <Body gap={12}>
        <SectionTitle title="วันนี้" />
        {due.length ? <TapCard icon="pill" tone="today" title={`ต้องทานยา ${due.length} คน`} text={joinTh(due.map((p) => p.name))} onClick={() => go('/today/all')} /> : <p className="mut">วันนี้ไม่มียาที่ต้องจัดให้ใคร</p>}
        <SectionTitle title="ควรซื้อยา" />
        {low.length === 0 && <p className="mut">ยังไม่มียาที่ต้องซื้อ</p>}
        {low.map((a) => { const m = medOf(d, a); const p = a.owner.kind === 'person' ? personById(d, a.owner.personId) : undefined; return m ? <TapCard key={a.id} icon="alert" tone="buy" title={medTitle(m)} text={`${p?.name ?? ''} · เหลือ ${stockOf(d, a, today).days} วัน`} onClick={() => go('/order')} /> : null; })}
        {exp.length > 0 && <SectionTitle title="ใกล้หมดอายุ" />}
        {exp.map(({ a, days }) => { const m = medOf(d, a); return m ? <TapCard key={a.id} icon="alert" tone="buy" title={medTitle(m)} text={`ยาสามัญประจำบ้าน · ${days < 0 ? 'หมดอายุแล้ว' : `หมดอายุ ${thDate(a.expiryDate as string)} (อีก ${days} วัน)`}`} onClick={() => go(`/medicine/${a.id}`)} /> : null; })}
        <SectionTitle title="ตั้งค่า" />
        <TapCard icon="gear" title="ตั้งค่าการเตือน" text={`เตือนซื้อเมื่อเหลือไม่เกิน ${d.settings.reminderDays} วัน`} onClick={() => go('/settings')} />
      </Body>
    </Screen>
  );
}
