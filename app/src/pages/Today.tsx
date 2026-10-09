import { Header, Body, Screen } from '../ui/Shell';
import { Chip, Note } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter, enc } from '../router';
import { useStore } from '../store';
import { todayBangkok, thaiDateLabel } from '../domain/dates';
import { doneToday, medOf, members, personById, restToday, tasksToday } from '../domain/selectors';
import { fr, joinTh, PERIODS } from '../domain/format';
import { toggleTick } from '../domain/actions';

/** 06c: prepare today's pills by time of day, tick when done (NV-4) */
export function Today({ filter }: { filter: string }) {
  const { go } = useRouter();
  const { data: d, update } = useStore();
  const today = todayBangkok();
  const ppl = members(d), sel = filter === 'all' ? 'all' : ppl.some((p) => p.id === filter) ? filter : 'all';
  const tasks = tasksToday(d, today, sel), done = doneToday(d, today);
  const finished = tasks.filter((t) => done.has(t.key)).length;
  const rest = (sel === 'all' ? ppl : ppl.filter((p) => p.id === sel)).flatMap((p) => restToday(d, p.id, today).map((a) => ({ p, a })));
  const selfOnes = (sel === 'all' ? ppl : ppl.filter((p) => p.id === sel)).filter((p) => p.selfManaged);
  return (
    <Screen>
      <Header title="ยาวันนี้" sub={thaiDateLabel(today)} back="/" />
      <Body gap={14}>
        <div className="chips" role="group" aria-label="เลือกคน">
          {(['all', ...ppl.map((p) => p.id)] as string[]).map((id) => { const on = sel === id; return <button key={id} type="button" className={`sch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => go(`/today/${enc(id)}`)}>{on && <Icon name="check" size={16} />}{id === 'all' ? 'ทุกคน' : personById(d, id)?.name}</button>; })}
        </div>
        <div className="sum"><small>{finished === tasks.length && tasks.length ? 'จัดยาครบแล้ว' : 'ความคืบหน้าการจัดยา'}</small><b>จัดแล้ว {finished} จาก {tasks.length} รายการ · เหลืออีก {tasks.length - finished}</b><span className="sm" style={{ display: 'block', color: 'var(--mut)', marginTop: 2 }}>1 รายการ = ยา 1 ตัวในช่วงเวลาหนึ่ง</span></div>
        {PERIODS.map(([k, label]) => {
          const list = tasks.filter((t) => t.period === k); if (!list.length) return null;
          return (
            <div key={k} className="card" style={{ padding: '4px 16px' }}>
              <h2 style={{ fontSize: 19, padding: '12px 0 2px' }}>{label}</h2>
              {list.map((t) => { const m = medOf(d, t.assignment), on = done.has(t.key); if (!m) return null; return (
                <button key={t.key} type="button" className="pr" role="checkbox" aria-checked={on} onClick={() => update((x) => toggleTick(x, t.key, today))}>
                  <span className={`ck${on ? ' on' : ''}`}>{on && <Icon name="check" size={20} />}</span>
                  <span className="grow"><b>{m.generic} {m.strength}</b><br /><span className="mut sm">{personById(d, t.personId)?.name} · {fr(t.amount)} {m.baseUnit}</span></span>
                  {on && <Chip tone="ok" icon="check">จัดแล้ว</Chip>}
                </button>); })}
            </div>
          );
        })}
        {tasks.length === 0 && <Note icon="info">วันนี้ไม่มียาที่ต้องจัด</Note>}
        {rest.length > 0 && <Note tone="caution" icon="moon"><b>พักวันนี้</b><br />{rest.map(({ p, a }) => `${medOf(d, a)?.generic} (${p.name})`).join(', ')}</Note>}
        {selfOnes.length > 0 && <Note icon="info">ไม่รวม {joinTh(selfOnes.map((p) => p.name))} เพราะจัดยาเอง</Note>}
      </Body>
    </Screen>
  );
}
