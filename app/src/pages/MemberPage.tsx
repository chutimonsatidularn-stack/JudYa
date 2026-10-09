import { useState } from 'react';
import { Header, Body, Screen } from '../ui/Shell';
import { AllergyBlock, Avatar, Button, Chip, Note, Pill, Switch } from '../ui/components';
import { Icon } from '../ui/Icon';
import { MedCard, SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { assignmentsOfPerson, dueToday, personById, stoppedOfPerson, medOf } from '../domain/selectors';
import { ageFromBirthYear, deleteAllergy, setSelfManaged } from '../domain/actions';
import { thDate } from '../domain/format';

/** 07b Member page (MB-3): profile · self-manage · allergies · 4 tiles · medicines · stopped medicines */
export function MemberPage({ id }: { id: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const today = todayBangkok(), p = personById(d, id);
  if (!p || p.removed) return <Screen><Header title="ไม่พบสมาชิก" back="/members" /><Body><Note icon="info">ไม่พบสมาชิกคนนี้ อาจถูกนำออกจากรายชื่อแล้ว</Note></Body></Screen>;
  const meds = assignmentsOfPerson(d, id), stopped = stoppedOfPerson(d, id), allergies = d.allergies.filter((a) => a.personId === id);
  const due = dueToday(d, id, today).length;
  const age = ageFromBirthYear(p.birthYear, today);
  return (
    <Screen>
      <Header title={p.name} sub={`ยา ${meds.length} รายการ`} back="/members" pill={<Pill icon="plus" onClick={() => go(`/medicine/new?owner=${id}`)}>เพิ่มยา</Pill>} />
      <Body gap={14}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
          <Avatar avatarId={p.avatarId} size="xl" />
          <span className="grow"><b style={{ fontSize: 22 }}>{p.name}</b><br /><span style={{ marginTop: 6, display: 'inline-block' }}>{p.selfManaged ? <Chip tone="info" icon="info">จัดยาเอง</Chip> : <Chip tone="ok" icon="check">เราจัดยาให้</Chip>}</span></span>
          <Pill icon="edit" onClick={() => go(`/member/${id}/avatar`)} aria-label={`เปลี่ยนรูปโปรไฟล์ของ${p.name}`}>เปลี่ยนรูป</Pill>
        </div>
        <button type="button" className="card tap" onClick={() => go(`/member/${id}/edit`)}>
          <span className="disc"><Icon name="user" size={22} /></span>
          <span className="grow"><b>ข้อมูลสมาชิก</b><br /><span className="mut sm">{[p.relationship, age != null ? `อายุประมาณ ${age} ปี` : ''].filter(Boolean).join(' · ') || 'ยังไม่ระบุความสัมพันธ์และปีเกิด'}</span></span>
          <Icon name="chev" size={20} />
        </button>
        <div className="card" style={{ padding: '4px 16px' }}>
          <Switch checked={p.selfManaged} onChange={(v) => update((x) => setSelfManaged(x, id, v))} title={`${p.name}จัดยาทานเอง`} text="เราดูแลแค่สต๊อกและซื้อยาให้ ไม่ขึ้นรายการจัดยาประจำวัน" />
        </div>
        {allergies.length > 0
          ? <AllergyBlock items={allergies.map((a) => ({ ...a, recordedOn: thDate(a.recordedOn) }))} onEdit={(aid) => go(`/member/${id}/allergy/${aid}`)} onDelete={(aid) => setConfirmDel(aid)} />
          : <Note icon="info">ยังไม่มีบันทึกแพ้ยา เพิ่มได้ที่ปุ่มด้านล่าง หรือตอนหยุดยาด้วยเหตุผล “แพ้ยา”</Note>}
        {confirmDel && (
          <div className="card" style={{ border: '2px solid var(--dng)' }} role="alertdialog" aria-label="ยืนยันการลบ">
            <span className="sm"><b>ลบรายการนี้ใช่ไหม?</b> ถ้าลบ จะไม่ขึ้นเตือนแพ้ยานี้อีก</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button variant="d" style={{ flex: 1, height: 44 }} onClick={() => { update((x) => deleteAllergy(x, confirmDel)); setConfirmDel(null); say('ลบรายการแพ้ยาแล้ว'); }}>ยืนยันลบ</Button>
              <Button variant="s" style={{ flex: 1, height: 44 }} onClick={() => setConfirmDel(null)}>ยกเลิก</Button>
            </div>
          </div>
        )}
        <Button variant="s" icon="plus" onClick={() => go(`/member/${id}/allergy`)}>เพิ่มแพ้ยา</Button>
        <div className="tiles">
          {p.selfManaged
            ? <button type="button" className="tile" onClick={() => say(`${p.name}จัดยาเอง ไม่ต้องจัดให้`)}><span className="disc"><Icon name="pill" size={22} /></span><b>จัดยาเอง</b><span className="mut sm">เราดูแลแค่สต๊อก</span></button>
            : <button type="button" className="tile" onClick={() => go(`/today/${id}`)}><span className="disc"><Icon name="pill" size={22} /></span><b>จัดยาวันนี้</b><span className="mut sm">{due ? `ทานวันนี้ ${due} ตัว` : 'พักวันนี้'}</span></button>}
          <button type="button" className="tile" onClick={() => go(`/order?of=${id}`)}><span className="disc"><Icon name="bag" size={22} /></span><b>สั่งยา</b><span className="mut sm">เทียบราคาร้านยา</span></button>
          <button type="button" className="tile" onClick={() => go('/share')}><span className="disc"><Icon name="share" size={22} /></span><b>แชร์ให้แพทย์</b><span className="mut sm">เลือกข้อมูลที่ส่ง</span></button>
          <button type="button" className="tile" onClick={() => go(`/doctor/${id}`)}><span className="disc"><Icon name="hist" size={22} /></span><b>สรุปพบแพทย์</b><span className="mut sm">ยา ประวัติ แพ้ยา</span></button>
        </div>
        <SectionTitle title="รายการยา" />
        {meds.length === 0 ? <p className="mut" style={{ padding: '8px 0' }}>ยังไม่มียาของ{p.name} กด เพิ่มยา มุมขวาบน</p> : meds.map((a) => <MedCard key={a.id} d={d} a={a} today={today} onClick={() => go(`/medicine/${a.id}`)} />)}
        {stopped.length > 0 && <>
          <SectionTitle title="ยาที่หยุดแล้ว" />
          <div className="card" style={{ padding: '4px 16px' }}>
            {stopped.map((a) => <button key={a.id} type="button" className="li" style={{ width: '100%' }} onClick={() => go(`/medicine/${a.id}/history`)}><span className="grow"><b>{medOf(d, a)?.generic}</b> <span className="mut sm">{medOf(d, a)?.strength}</span><br /><span className="mut cap">หยุดเมื่อ {a.stopped ? thDate(a.stopped.on) : ''} · {a.stopped?.reason}</span></span><Icon name="chev" size={20} /></button>)}
          </div>
        </>}
      </Body>
    </Screen>
  );
}
