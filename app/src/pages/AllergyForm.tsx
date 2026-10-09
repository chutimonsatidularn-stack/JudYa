import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, ChipGroup, Note, Field, TextInput } from '../ui/components';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { allergyValid, newId, saveAllergy, SEVERE, SYMPTOMS } from '../domain/actions';
import { personById } from '../domain/selectors';

/** 07d Allergy form (AL-1…AL-5): add (also for drugs never used) or edit; the original date is kept on edit */
export function AllergyForm({ personId, allergyId }: { personId: string; allergyId?: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const p = personById(d, personId), old = allergyId ? d.allergies.find((a) => a.id === allergyId && a.personId === personId) : undefined;
  const [f, setF] = useState({ drug: old?.drug ?? '', symptoms: (old?.symptoms ?? []) as string[], note: old?.note ?? '' });
  if (!p) return <Screen><Header title="บันทึกแพ้ยา" back="/members" /><Body><Note icon="info">ไม่พบสมาชิกคนนี้</Note></Body></Screen>;
  const severe = f.symptoms.some((s) => (SEVERE as readonly string[]).includes(s)), ok = allergyValid(f);
  const save = () => { if (ok && update((x) => saveAllergy(x, personId, f, todayBangkok(), newId('al'), old?.id))) { say(old ? 'แก้ไขรายการแพ้ยาแล้ว' : 'บันทึกแพ้ยาแล้ว'); go(`/member/${personId}`); } };
  return (
    <Screen>
      <Header title={old ? 'แก้ไขแพ้ยา' : 'บันทึกแพ้ยา'} sub={p.name} back={`/member/${personId}`} />
      <Body gap={14}>
        <Field label="ชื่อยาที่แพ้ (ชื่อสามัญหรือยี่ห้อ)">{(id) => <TextInput id={id} maxLength={40} value={f.drug} onChange={(e) => setF({ ...f, drug: e.target.value })} placeholder="เช่น Penicillin" />}</Field>
        <div className="fld"><span>อาการที่เกิดขึ้น (เลือกได้หลายอย่าง)</span>
          <ChipGroup label="อาการแพ้ยา" multiple options={SYMPTOMS} value={f.symptoms as (typeof SYMPTOMS)[number][]} onChange={(s) => setF({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s] })} /></div>
        {severe && <Note tone="danger" icon="alert"><b style={{ color: 'var(--dngink)' }}>อาการรุนแรง</b> ถ้าเกิดอีก ให้ไปโรงพยาบาลหรือโทร 1669 ทันที</Note>}
        <Field label="รายละเอียดเพิ่มเติม (ไม่บังคับ)">{(id) => <textarea id={id} className="ta rbx" maxLength={200} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="เช่น เกิดหลังทานยา 2 วัน" />}</Field>
        <Note icon="info">จะขึ้นกรอบเตือนแพ้ยาในโปรไฟล์ของ{p.name}และในสรุปที่แชร์ให้แพทย์ ถ้าเพิ่มยาที่ชื่อตรงกัน แอปจะเตือนทันที</Note>
      </Body>
      <Footer>
        <Button disabled={!ok} onClick={save}>{old ? 'บันทึกการแก้ไข' : 'บันทึกแพ้ยา'}</Button>
        {!ok && <p className="mut cap" style={{ textAlign: 'center' }}>{!f.drug.trim() ? 'ใส่ชื่อยาก่อน' : 'เลือกอาการอย่างน้อย 1 อย่าง'}</p>}
      </Footer>
    </Screen>
  );
}
