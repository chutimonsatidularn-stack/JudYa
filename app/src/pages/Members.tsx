import { Header, Body, Screen } from '../ui/Shell';
import { Avatar, Button, Chip, Note, Pill, StockChip } from '../ui/components';
import { Icon } from '../ui/Icon';
import { SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { assignmentsOfPerson, dueToday, minDays, members, removedMembers } from '../domain/selectors';
import { setRemoved } from '../domain/actions';

/** 07 Members: one card per member; removed members can be brought back (MB-8); empty state (MB-9) */
export function Members() {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const today = todayBangkok(), list = members(d), gone = removedMembers(d);
  return (
    <Screen>
      <Header title="สมาชิก" back="/" pill={<Pill icon="plus" onClick={() => go('/members/new')}>เพิ่มสมาชิก</Pill>} />
      <Body>
        {list.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <b style={{ fontSize: 20 }}>ยังไม่มีสมาชิก</b>
            <p className="mut sm" style={{ margin: '6px 0 14px' }}>เพิ่มคนที่คุณดูแลยาให้ แล้วค่อยใส่ยาของเขา</p>
            <Button icon="plus" onClick={() => go('/members/new')}>เพิ่มสมาชิก</Button>
          </div>
        )}
        {list.map((p) => {
          const n = assignmentsOfPerson(d, p.id).length, md = minDays(d, p.id, today), due = dueToday(d, p.id, today).length;
          return (
            <button key={p.id} type="button" className="card tap" onClick={() => go(`/member/${p.id}`)}>
              <Avatar avatarId={p.avatarId} size="lg" />
              <span className="grow"><b style={{ fontSize: 21 }}>{p.name}</b><br /><span className="mut sm">ยา {n} รายการ{md != null && <><br />ตัวที่น้อยสุดพอทาน {md} วัน</>}</span>
                <span style={{ display: 'flex', marginTop: 6 }}>{p.selfManaged ? <Chip tone="info" icon="info">จัดยาเอง · เราดูแลสต๊อก</Chip> : due ? <Chip tone="info" icon="pill">ต้องจัดยาวันนี้ {due} ตัว</Chip> : <Chip tone="rest" icon="moon">วันนี้ไม่ต้องจัดยา</Chip>}</span></span>
              <StockChip days={md} lowDays={d.settings.reminderDays} /><Icon name="chev" size={20} />
            </button>
          );
        })}
        {list.length > 0 && <Note>สต๊อกนับเป็นรายวัน แยกตามแต่ละคน คนที่จัดยาเอง (เปิดสวิตช์ในหน้าของเขา) จะไม่ขึ้นรายการจัดยาประจำวัน แต่เรายังดูสต๊อกและเตือนซื้อให้</Note>}
        {gone.length > 0 && <>
          <SectionTitle title="สมาชิกที่นำออกแล้ว" />
          <div className="card" style={{ padding: '4px 16px' }}>
            {gone.map((p) => (
              <div key={p.id} className="li">
                <Avatar avatarId={p.avatarId} />
                <span className="grow"><b>{p.name}</b><br /><span className="mut cap">เก็บยาไว้ {d.assignments.filter((a) => a.owner.kind === 'person' && a.owner.personId === p.id).length} รายการ</span></span>
                <Pill onClick={() => { update((x) => setRemoved(x, p.id, false)); say(`นำ${p.name}กลับแล้ว`); }}>นำกลับ</Pill>
              </div>
            ))}
          </div>
        </>}
      </Body>
    </Screen>
  );
}
