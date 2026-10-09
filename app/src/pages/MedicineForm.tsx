import { Header, Body, Screen } from '../ui/Shell';
import { Field, Note, Pill, Select, TextInput, DateInput } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { useDraft } from '../draft';
import { useMedDraft } from './medicine-shared';
import { allergyWarnings, buySummary, HOUSE, isHouse, isNewDraft, medError, saveMedicine } from '../domain/medicine';
import { equivalence, FORMS, formUnits, unitGroups, type FormName } from '../domain/units';
import { members } from '../domain/selectors';
import { newId } from '../domain/actions';
import { scheduleDoseText } from '../domain/format';
import { todayBangkok } from '../domain/dates';

/** 08 Add / edit medicine — core fields on this page; pack & buying (08d) and the schedule (08c) are one tap away with a one-line summary (BR-7) */
export function MedicineForm({ k }: { k: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const { setMed } = useDraft();
  const { x, set } = useMedDraft(k);
  const today = todayBangkok();
  if (!x) return <Screen><Header title="แก้ไขยา" back="/medicines" /><Body><p className="mut">กำลังเปิด…</p></Body></Screen>;
  const isNew = isNewDraft(x), house = isHouse(x), ppl = members(d);
  const owners: [string, string][] = [...ppl.map((p) => [p.id, p.name] as [string, string]), [HOUSE, 'ยาสามัญประจำบ้าน']];
  const warns = allergyWarnings(d, x), eq = equivalence({ qty: x.stockQty.trim() === '' ? null : Number(x.stockQty), unit: x.stockUnit, base: x.baseUnit, pack: x.packUnit, packSize: x.packSize.trim() === '' ? null : Number(x.packSize) });
  const setForm = (f: string) => { const u = formUnits(f); set({ form: f as FormName, baseUnit: u.base, packUnit: u.pack, stockUnit: x.stockUnit === x.baseUnit || x.stockUnit === x.packUnit ? (x.stockUnit === x.packUnit && x.stockUnit !== x.baseUnit ? u.pack : u.base) : x.stockUnit }); };
  const setOwner = (o: string) => set({ owner: o, ...(o !== HOUSE && house ? { schedule: { kind: 'daily' as const } } : {}) });
  const leave = () => { setMed(null); go(x.from); };
  const save = () => {
    const e = medError(x); if (e) { say(e); return; }
    const r = saveMedicine(d, x, { med: newId('m'), asg: newId('a') });
    if (update(() => r.data)) { say(isNew ? 'เพิ่มยาแล้ว' : 'บันทึกแล้ว'); setMed(null); go(isNew ? `/medicine/${r.assignmentId}` : x.from); }
  };
  const unitOpts = unitGroups(x.baseUnit, x.packUnit);
  return (
    <Screen>
      <Header title={isNew ? 'เพิ่มยา' : 'แก้ไขยา'} back={leave} pill={<Pill onClick={save}>บันทึก</Pill>} />
      <Body>
        <Field label="ตัวยาสามัญ (ชื่อสามัญ)">{(id) => <TextInput id={id} maxLength={40} value={x.generic} onChange={(e) => set({ generic: e.target.value })} placeholder="เช่น Losartan" />}</Field>
        <Field label="ยี่ห้อ (ถ้ามี)" hint="ยาตัวเดียวกันคนละยี่ห้อ ขนาดแพ็กและราคาต่างกัน ให้เพิ่มเป็นรายการแยก">{(id) => <TextInput id={id} maxLength={40} value={x.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="เช่น Cozaar" />}</Field>
        <Field label="ความแรง">{(id) => <TextInput id={id} maxLength={20} value={x.strength} onChange={(e) => set({ strength: e.target.value })} placeholder="เช่น 50 mg" />}</Field>
        <div className="fld"><span>ยานี้ของใคร</span><div className="chips" role="group" aria-label="เจ้าของยา">
          {owners.map(([id, label]) => <button key={id} type="button" className={`sch${x.owner === id ? ' on' : ''}`} aria-pressed={x.owner === id} onClick={() => setOwner(id)}>{x.owner === id && <Icon name="check" size={16} />}{label}</button>)}</div>
          {house && <span className="hx">ยาที่ใช้ได้กับทุกคน เช่น พาราเซตามอล ไม่มีตารางทานประจำ ใช้เมื่อมีอาการ</span>}</div>
        {warns.length > 0 && <Note tone="danger" icon="alert"><b style={{ color: 'var(--dngink)' }}>ระวัง: {warns.map((w) => `${w.person} เคยแพ้ ${w.drug}`).join(', ')}</b><br />อาการที่เคยเกิด: {warns[0]!.symptoms.join(', ')}</Note>}
        <Field label="รูปแบบยา">{(id) => <Select id={id} value={x.form} onChange={setForm} options={FORMS.map((f) => f.name)} />}</Field>
        <Field label="จำนวนที่เหลือ" hint="หน่วยเปลี่ยนตามรูปแบบยาให้เอง และเลือกเปลี่ยนเองได้">{(id) => (
          <div className="inp">
            <input id={id} className="bare" type="number" inputMode="decimal" min={0} max={9999} step={0.25} value={x.stockQty} onChange={(e) => set({ stockQty: e.target.value })} />
            <span className="selw"><select aria-label="หน่วยของจำนวนที่เหลือ" value={x.stockUnit} onChange={(e) => set({ stockUnit: e.target.value })}>{unitOpts.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((u) => <option key={u}>{u}</option>)}</optgroup>)}</select><Icon name="caret" size={18} /></span>
          </div>)}</Field>
        {eq && <Note tone={eq.kind === 'warn' ? 'caution' : 'info'} icon={eq.kind === 'warn' ? 'alert' : 'info'}>{eq.text}</Note>}
        {house && <Field label="วันหมดอายุ" hint="ยาสามัญประจำบ้านเตือนตามวันหมดอายุ ก่อนหมดอายุ 30 วัน">{(id) => <DateInput id={id} value={x.expiry} onChange={(e) => set({ expiry: e.target.value })} />}</Field>}
        <button type="button" className="card tap" onClick={() => go(`/medicine/${k}/buy`)}><span className="disc"><Icon name="bag" size={22} /></span><span className="grow"><b>ขนาดบรรจุและการซื้อ</b><br /><span className="mut sm">{buySummary(x)}</span></span><Icon name="chev" size={20} /></button>
        {!house && <button type="button" className="card tap" onClick={() => go(`/medicine/${k}/schedule`)}><span className="disc"><Icon name="cal" size={22} /></span><span className="grow"><b>ตารางทานยา</b><br /><span className="mut sm">{scheduleDoseText(x.schedule, x.doses, x.baseUnit, today)}</span></span><Icon name="chev" size={20} /></button>}
        {!house && !isNew && <button type="button" className="card tap" onClick={() => go(`/medicine/${k}/dose`)}><span className="disc"><Icon name="pill" size={22} /></span><span className="grow"><b>ปรับโดส</b><br /><span className="mut sm">เมื่อแพทย์สั่ง พร้อมเหตุผลและประวัติ หรือหยุดใช้ยา</span></span><Icon name="chev" size={20} /></button>}
      </Body>
    </Screen>
  );
}
