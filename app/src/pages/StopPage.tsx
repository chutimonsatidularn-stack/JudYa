import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, ChipGroup, Field, Note } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { newId, SEVERE, SYMPTOMS } from '../domain/actions';
import { STOP_REASONS, stopMedication, stopValid } from '../domain/medicine';
import { todayBangkok } from '../domain/dates';
import { medOf, personById } from '../domain/selectors';

/** 09d Stop a medicine (DA-6, DA-7): reason required; "แพ้ยา" also needs a symptom and creates an allergy record */
export function StopPage({ id }: { id: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const [reason, setReason] = useState(''), [symptoms, setSymptoms] = useState<string[]>([]), [note, setNote] = useState(''), [ack, setAck] = useState(false);
  const a = d.assignments.find((q) => q.id === id), med = a && medOf(d, a), owner = a && a.owner.kind === 'person' ? personById(d, a.owner.personId) : undefined;
  if (!a || !med || !a.active || a.owner.kind !== 'person') return <Screen><Header title="หยุดใช้ยา" back="/medicines" /><Body><Note icon="info">ไม่พบยานี้ หรือยานี้หยุดใช้แล้ว</Note></Body></Screen>;
  const allergic = reason === 'แพ้ยา', severe = symptoms.some((s) => (SEVERE as readonly string[]).includes(s)), ok = stopValid(reason, symptoms) && ack;
  const hint = !reason ? 'เลือกเหตุผลก่อน' : allergic && !symptoms.length ? 'เลือกอาการอย่างน้อย 1 อย่าง' : !ack ? 'ติ๊กยืนยันก่อน' : '';
  const confirm = () => {
    if (!ok) return;
    if (update((cur) => stopMedication(cur, id, { reason, note, symptoms }, todayBangkok(), { dc: newId('dc'), allergy: newId('al') }, new Date().toISOString()))) {
      say(allergic ? 'ย้ายไปยาที่หยุดแล้ว และขึ้นเตือนแพ้ยาในโปรไฟล์' : 'ย้ายไปยาที่หยุดแล้ว'); go(`/member/${a.owner.kind === 'person' ? a.owner.personId : ''}`);
    }
  };
  return (
    <Screen>
      <Header title="หยุดใช้ยา" sub={`${med.generic} ${med.strength} · ${owner?.name ?? ''}`} back={`/medicine/${id}/dose`} />
      <Body gap={14}>
        <Note tone="caution" icon="alert">“ยาที่หยุดแล้ว” จะย้ายไปอยู่ในรายการยาที่หยุดแล้ว ประวัติไม่ถูกลบ และไม่นับในการจัดยาหรือเตือนซื้อ</Note>
        <Field label="เหตุผลที่หยุด">{(fid) => <div className="inp"><span className="selw full"><select id={fid} value={reason} onChange={(e) => setReason(e.target.value)}><option value="">เลือกเหตุผล…</option>{STOP_REASONS.map((r) => <option key={r}>{r}</option>)}</select><Icon name="caret" size={18} /></span></div>}</Field>
        {allergic && <>
          <div className="fld"><span>อาการที่เกิดขึ้น (เลือกได้หลายอย่าง)</span><ChipGroup label="อาการแพ้ยา" multiple options={SYMPTOMS} value={symptoms as (typeof SYMPTOMS)[number][]} onChange={(s) => setSymptoms(symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s])} /></div>
          {severe && <Note tone="danger" icon="alert"><b style={{ color: 'var(--dngink)' }}>อาการรุนแรง</b> ถ้าเกิดอีก ให้ไปโรงพยาบาลหรือโทร 1669 ทันที</Note>}
          <Note icon="info">จะขึ้นกรอบเตือนแพ้ยาในโปรไฟล์ของ{owner?.name} และในสรุปที่แชร์ให้แพทย์</Note>
        </>}
        <Field label="รายละเอียดเพิ่มเติม (ไม่บังคับ)">{(fid) => <textarea id={fid} className="ta rbx" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น หมอสั่งหยุดหลังตรวจเลือด" />}</Field>
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span>ฉันยืนยันว่าจะหยุดใช้ยาตัวนี้</span></button>
      </Body>
      <Footer><Button variant="d" disabled={!ok} onClick={confirm}>ยืนยันหยุดใช้ยา</Button>{hint && <p className="mut cap" style={{ textAlign: 'center' }}>{hint}</p>}</Footer>
    </Screen>
  );
}
