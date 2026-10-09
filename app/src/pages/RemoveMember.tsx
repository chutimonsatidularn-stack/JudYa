import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Avatar, Button, Note } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { useDraft } from '../draft';
import { personById } from '../domain/selectors';
import { setRemoved } from '../domain/actions';

/** 07g Take a member out of the list — not a delete: medicines, history and allergies are kept, can be brought back (MB-7) */
export function RemoveMember({ id }: { id: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const { setDraft } = useDraft();
  const [ack, setAck] = useState(false);
  const p = personById(d, id);
  if (!p || p.removed) return <Screen><Header title="นำสมาชิกออก" back="/members" /><Body><Note icon="info">ไม่พบสมาชิกคนนี้</Note></Body></Screen>;
  const n = d.assignments.filter((a) => a.owner.kind === 'person' && a.owner.personId === id && a.active).length;
  return (
    <Screen>
      <Header title="นำสมาชิกออก" back={`/member/${id}/edit`} />
      <Body gap={14}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}><Avatar avatarId={p.avatarId} size="lg" /><span className="grow"><b style={{ fontSize: 21 }}>{p.name}</b><br /><span className="mut sm">ยา {n} รายการ</span></span></div>
        <Note tone="caution" icon="alert"><span><b>สิ่งที่จะเปลี่ยน</b><br />{p.name}และยาของเขาจะหายจากหน้าแรก การแจ้งเตือน ยาวันนี้ รายการยา และการสั่งยา</span></Note>
        <Note icon="info"><span><b>สิ่งที่ยังอยู่</b><br />ประวัติการปรับโดส ตารางทานยา สต๊อก และบันทึกแพ้ยาไม่ถูกลบ ยาบ้านไม่ได้รับผลกระทบ นำกลับได้ที่หน้าสมาชิก หัวข้อ สมาชิกที่นำออกแล้ว</span></Note>
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span className="sm">ฉันเข้าใจ</span></button>
      </Body>
      <Footer>
        <Button variant="d" disabled={!ack} onClick={() => { if (update((x) => setRemoved(x, id, true))) { setDraft(null); say(`นำ${p.name}ออกจากรายชื่อแล้ว`); go('/members'); } }}>ยืนยันนำออก</Button>
        <Button variant="s" onClick={() => go(`/member/${id}/edit`)}>ยกเลิก</Button>
      </Footer>
    </Screen>
  );
}
