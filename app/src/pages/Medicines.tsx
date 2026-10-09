import { useState } from 'react';
import { Header, Body, Screen } from '../ui/Shell';
import { Banner, Pill } from '../ui/components';
import { Icon } from '../ui/Icon';
import { MedCard, SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { activeAssignments, householdAssignments, lowAssignments, members, assignmentsOfPerson } from '../domain/selectors';

/** 07c Medicines (tab 2): everyone's medicines, filter chips, banner for medicines near running out (NV-1) */
export function Medicines() {
  const { go } = useRouter();
  const { data: d } = useStore();
  const [f, setF] = useState<string>('all');
  const today = todayBangkok(), ppl = members(d), low = lowAssignments(d, today);
  const hasHouse = householdAssignments(d).length > 0;
  const filter = f === 'all' || f === 'house' || ppl.some((p) => p.id === f) ? f : 'all';
  const chips: [string, string][] = [['all', 'ทุกคน'], ...ppl.map((p) => [p.id, p.name] as [string, string]), ['house', 'ยาบ้าน']];
  const groups = [...ppl.filter((p) => filter === 'all' || filter === p.id).map((p) => ({ key: p.id, title: p.name, list: assignmentsOfPerson(d, p.id) })), ...(filter === 'all' || filter === 'house' ? [{ key: 'house', title: 'ยาสามัญประจำบ้าน', list: householdAssignments(d) }] : [])].filter((g) => g.list.length);
  return (
    <Screen nav>
      <Header title="ยา" sub={`ทั้งหมด ${activeAssignments(d).length} รายการ`} pill={<Pill icon="plus" onClick={() => go('/medicine/new')}>เพิ่มยา</Pill>} />
      <Body gap={14}>
        <div className="chips" role="group" aria-label="กรองตามสมาชิก">
          {chips.map(([id, label]) => <button key={id} type="button" className={`sch${filter === id ? ' on' : ''}`} aria-pressed={filter === id} onClick={() => setF(id)}>{filter === id && <Icon name="check" size={16} />}{label}</button>)}
        </div>
        {low.length > 0 && <Banner icon="bag" title={`ยาใกล้หมด ${low.length} รายการ`} text="เทียบราคาร้านยาก่อนสั่ง" onClick={() => go('/order')} />}
        {groups.length === 0 && <p className="mut" style={{ padding: '8px 0' }}>{ppl.length === 0 && !hasHouse ? 'ยังไม่มียา เพิ่มสมาชิกก่อน แล้วกด เพิ่มยา' : 'ยังไม่มียาในรายการนี้'}</p>}
        {groups.map((g) => <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><div className="sec"><h2>{g.title}</h2><span className="mut sm">{g.list.length} รายการ</span></div>{g.list.map((a) => <MedCard key={a.id} d={d} a={a} today={today} onClick={() => go(`/medicine/${a.id}`)} />)}</div>)}
      </Body>
    </Screen>
  );
}
