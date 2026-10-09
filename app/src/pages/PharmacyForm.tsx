import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Field, Sheet, TextInput } from '../ui/components';
import { useRouter } from '../router';
import { useStore } from '../store';
import { newId } from '../domain/actions';
import { deletePharmacy, emptyPharmacyForm, formFromPharmacy, pharmacyError, phoneOk, priceRowsOf, savePharmacy, type PharmacyForm as Form } from '../domain/settings';

/** 14b Add / edit a pharmacy; edit mode can also delete it (UI-7a) */
export function PharmacyForm({ id }: { id: string | null }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const p = id ? d.pharmacies.find((x) => x.id === id) : undefined;
  const [f, setF] = useState<Form>(() => (p ? formFromPharmacy(p) : emptyPharmacyForm()));
  const [ask, setAsk] = useState(false);
  if (id && !p) return <Screen><Header title="แก้ไขร้านยา" back="/settings" /><Body><p className="mut">ไม่พบร้านนี้</p></Body></Screen>;
  const set = (o: Partial<Form>) => setF({ ...f, ...o });
  const err = pharmacyError(d, f), badTel = !phoneOk(f.phone);
  const save = () => { if (!err && update((x) => savePharmacy(x, f, newId('ph')))) { say('บันทึกร้านยาแล้ว'); go('/settings'); } };
  const rows = id ? priceRowsOf(d, id) : 0;
  const remove = () => { if (id && update((x) => deletePharmacy(x, id))) { setAsk(false); say(`ลบ${f.name.trim()}แล้ว`); go('/settings'); } };
  return (
    <Screen>
      <Header title={id ? 'แก้ไขร้านยา' : 'เพิ่มร้านยา'} back="/settings" />
      <Body>
        <Field label="ชื่อร้าน">{(fid) => <TextInput id={fid} maxLength={40} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="เช่น ร้านยาสุขใจ" />}</Field>
        <Field label="รายละเอียด (ไม่บังคับ)">{(fid) => <TextInput id={fid} maxLength={50} value={f.note} onChange={(e) => set({ note: e.target.value })} placeholder="เช่น ใกล้บ้าน หน้าตลาด" />}</Field>
        <Field label="เบอร์โทรร้านยา (ไม่บังคับ)" hint="ถ้ามีเบอร์ จะมีปุ่มโทรสั่งยาในหน้าสั่งยา" error={badTel ? 'เบอร์โทรไม่ถูกต้อง ใส่ตัวเลขและขีดเท่านั้น' : undefined}>
          {(fid) => <TextInput id={fid} inputMode="tel" maxLength={14} value={f.phone} aria-invalid={badTel || undefined} onChange={(e) => set({ phone: e.target.value })} placeholder="เช่น 02-123-4567" />}
        </Field>
        <Field label="ค่าส่ง (ไม่บังคับ)" hint="ถ้ารับที่ร้านเอง ใส่ 0 ถ้าไม่ใส่ แอปจะเทียบร้านนี้ไม่ได้">
          {(fid) => <div className="inp"><input id={fid} className="bare" inputMode="numeric" maxLength={5} value={f.shipping} placeholder="ไม่ระบุ" onChange={(e) => set({ shipping: e.target.value })} /><span className="unit">บาท</span></div>}
        </Field>
        <Field label="ส่งฟรีเมื่อซื้อครบ (ไม่บังคับ)">
          {(fid) => <div className="inp"><input id={fid} className="bare" inputMode="numeric" maxLength={5} value={f.freeOver} placeholder="ไม่มี" onChange={(e) => set({ freeOver: e.target.value })} /><span className="unit">บาท</span></div>}
        </Field>
        {id && <><div className="hr" /><Button variant="d" onClick={() => setAsk(true)}>ลบร้านนี้</Button></>}
      </Body>
      <Footer>
        <Button disabled={!!err} onClick={save}>บันทึกร้านยา</Button>
        {err && <p className="mut cap" style={{ textAlign: 'center' }}>{err}</p>}
      </Footer>
      <Sheet open={ask} onClose={() => setAsk(false)} label="ลบร้านยา">
        <h2 style={{ margin: '4px 0 8px' }}>ลบ{f.name.trim()}?</h2>
        <p className="sm">{rows ? `ราคาที่ใส่ไว้ของร้านนี้ ${rows} รายการจะถูกลบด้วย` : 'ร้านนี้ยังไม่มีราคาที่ใส่ไว้'} ยาและประวัติอื่นไม่เปลี่ยน ลบแล้วเอากลับไม่ได้</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <Button variant="d" onClick={remove}>ลบร้านนี้</Button>
          <Button variant="s" onClick={() => setAsk(false)}>ยกเลิก</Button>
        </div>
      </Sheet>
    </Screen>
  );
}
