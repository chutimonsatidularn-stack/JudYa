import { Header, Body, Screen } from '../ui/Shell';
import { Chip, Note, Timeline } from '../ui/components';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { historyOf } from '../domain/medicine';
import { medOf } from '../domain/selectors';
import { describeChange, thDate } from '../domain/format';

/** 09c History: a timeline of this medicine, newest first; entries can only be added (SF-5, L-9) */
export function HistoryPage({ id }: { id: string }) {
  const { data: d } = useStore();
  const a = d.assignments.find((q) => q.id === id), med = a && medOf(d, a), today = todayBangkok();
  if (!a || !med) return <Screen><Header title="ประวัติ" back="/medicines" /><Body><Note icon="info">ไม่พบยานี้</Note></Body></Screen>;
  const list = historyOf(d, id);
  return (
    <Screen>
      <Header title="ประวัติ" sub={`${med.generic} ${med.strength}`.trim()} back={a.active ? `/medicine/${id}/dose` : '/medicines'} />
      <Body>
        {list.length === 0 && <p className="mut">ยังไม่มีประวัติการปรับโดสหรือหยุดยา</p>}
        <Timeline items={list.map((c) => ({
          id: c.id, stop: c.kind === 'stop',
          title: `${thDate(c.on)} · ${c.kind === 'stop' ? 'หยุดใช้ยา' : 'ปรับโดส'}`,
          text: <>
            {c.kind === 'dose' && c.previous && c.next && <div>{describeChange(c.previous, c.next, med.baseUnit, c.on)}</div>}
            {c.symptoms && c.symptoms.length > 0 && <div>อาการ: {c.symptoms.join(', ')}</div>}
            <div style={{ margin: '6px 0' }}><Chip tone="info">เหตุผล: {c.reason}</Chip></div>
            {c.note && <div className="mut sm">{c.note}</div>}
          </>,
        }))} />
        <p className="mut cap" style={{ marginTop: 8 }}>ประวัติเพิ่มได้อย่างเดียว ลบหรือแก้ย้อนหลังไม่ได้</p>
      </Body>
    </Screen>
  );
}
