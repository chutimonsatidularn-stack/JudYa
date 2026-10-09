import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Card, Chip, Note, AllergyBlock } from '../ui/components';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { assignmentsOfPerson, medOf, personById } from '../domain/selectors';
import { fullDose, medTitle, thDate } from '../domain/format';
import { changeText, recentChanges } from '../domain/summary';

/** 12 Doctor mode: a readable summary for the doctor; not a diagnosis (UI-5) */
export function Doctor({ id }: { id: string }) {
  const { go } = useRouter();
  const { data: d } = useStore();
  const p = personById(d, id), today = todayBangkok();
  if (!p || p.removed) return <Screen><Header title="สรุปสำหรับพบแพทย์" back="/share" /><Body><Note icon="info">ไม่พบสมาชิกคนนี้</Note></Body></Screen>;
  const meds = assignmentsOfPerson(d, id), hist = recentChanges(d, id), allergies = d.allergies.filter((a) => a.personId === id);
  return (
    <Screen>
      <Header title="สรุปสำหรับพบแพทย์" sub={p.name} back={`/share?p=${id}`} />
      <Body gap={12}>
        <Note icon="info">หน้านี้ช่วยสื่อสารกับแพทย์ ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์</Note>
        {meds.length === 0 && <Card><span className="mut">ยังไม่มียาที่ใช้อยู่</span></Card>}
        {meds.map((a) => { const m = medOf(d, a); return m ? <div className="card" key={a.id} style={{ padding: '12px 16px' }}><b>{medTitle(m)}</b><br /><span className="sm">{fullDose(a, m, today)}</span></div> : null; })}
        <div className="card" style={{ padding: '12px 16px' }}>
          <b>ประวัติการเปลี่ยนล่าสุด</b>
          {hist.length === 0 ? <><br /><span className="sm mut">ยังไม่มีการเปลี่ยนแปลงตั้งแต่เริ่มใช้แอป</span></> : hist.map((c) => (
            <div key={c.id} style={{ marginTop: 8 }}><span className="sm">{thDate(c.on)} · {c.title}: {changeText(c, today)}</span> <Chip tone="info">เหตุผล: {c.reason || 'ไม่ระบุ'}</Chip></div>
          ))}
        </div>
        {allergies.length ? <AllergyBlock items={allergies} /> : <div className="card" style={{ padding: '12px 16px' }}><b>ประวัติแพ้ยา</b><br /><span className="sm mut">ยังไม่มีบันทึกแพ้ยา</span></div>}
      </Body>
      <Footer><Button icon="share" onClick={() => go(`/share?p=${id}`)}>แชร์สรุปนี้</Button></Footer>
    </Screen>
  );
}
