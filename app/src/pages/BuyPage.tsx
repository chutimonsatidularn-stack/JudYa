import { Header, Body, Screen } from '../ui/Shell';
import { Button, Field, Note, Pill, Select } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { useMedDraft } from './medicine-shared';
import { isHouse } from '../domain/medicine';
import { BASE_UNITS, equivalence, PACK_UNITS, unitGroups } from '../domain/units';

/** 08d Pack & buying: pack size of THIS brand, refill cycle, lead days, price per pharmacy (BR-3, PR-1) */
export function BuyPage({ k }: { k: string }) {
  const { go } = useRouter();
  const { data: d } = useStore();
  const { x, set } = useMedDraft(k);
  if (!x) return <Screen><Header title="การซื้อยา" back={`/medicine/${k}`} /><Body><p className="mut">กำลังเปิด…</p></Body></Screen>;
  const house = isHouse(x);
  const ps = x.packSize.trim() === '' ? null : Number(x.packSize);
  const eq = equivalence({ qty: x.stockQty.trim() === '' ? null : Number(x.stockQty), unit: x.stockUnit, base: x.baseUnit, pack: x.packUnit, packSize: ps });
  const cust = !['30', '60', '90'].includes(x.cycle) || x.cycle === '';
  const used = x.prices.map((r) => r.pharmacyId), free = d.pharmacies.filter((p) => p.active && !used.includes(p.id));
  const setRow = (i: number, o: Partial<(typeof x.prices)[number]>) => set({ prices: x.prices.map((r, j) => (i === j ? { ...r, ...o } : r)) });
  const groups = unitGroups(x.baseUnit, x.packUnit);
  const sub = `${x.generic} ${x.strength}${x.brand ? ` · ${x.brand}` : ''}`.trim();
  return (
    <Screen>
      <Header title="การซื้อยา" sub={sub} back={`/medicine/${k}`} pill={<Pill onClick={() => go(`/medicine/${k}`)}>เสร็จ</Pill>} />
      <Body>
        <div className="fld"><span>ขนาดต่อแพ็ก/กล่อง (ถ้ามี) ของยี่ห้อนี้</span>
          <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><b style={{ width: 30 }}>1</b><div className="grow"><Select value={x.packUnit} onChange={(v) => set({ packUnit: v })} options={[...PACK_UNITS]} label="หน่วยของแพ็ก" /></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><b style={{ width: 30 }}>มี</b>
              <div className="inp grow"><input className="bare" type="number" inputMode="numeric" min={1} max={1000} aria-label="จำนวนต่อแพ็ก" placeholder="ไม่ระบุ" value={x.packSize} onChange={(e) => set({ packSize: e.target.value })} />
                <span className="selw"><select aria-label="หน่วยของจำนวนต่อแพ็ก" value={x.baseUnit} onChange={(e) => set({ baseUnit: e.target.value })}>{BASE_UNITS.map((u) => <option key={u}>{u}</option>)}</select><Icon name="caret" size={18} /></span></div></div>
          </div>
          <span className="hx">ใช้ปัดจำนวนซื้อให้เป็นแพ็กเต็ม แต่ละยี่ห้อไม่เท่ากัน พิมพ์เองได้</span></div>
        {eq && <Note tone={eq.kind === 'warn' ? 'caution' : 'info'} icon={eq.kind === 'warn' ? 'alert' : 'info'}>{eq.text}</Note>}
        {!house && <>
          <div className="fld"><span>กำหนดการเติมยา (ซื้อให้พอใช้)</span>
            <div className="chips tight" role="group" aria-label="รอบการเติมยา">
              {[30, 60, 90].map((n) => { const on = !cust && x.cycle === String(n); return <button key={n} type="button" className={`sch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => set({ cycle: String(n) })}>ทุก {n} วัน</button>; })}
              <button type="button" className={`sch${cust ? ' on' : ''}`} aria-pressed={cust} onClick={() => set({ cycle: cust ? x.cycle : '45' })}>กำหนดเอง</button></div>
            {cust && <div className="inp"><span className="unit">ทุก</span><input className="bare" type="number" inputMode="numeric" min={1} max={365} aria-label="เติมยาทุกกี่วัน" style={{ textAlign: 'center' }} value={x.cycle} onChange={(e) => set({ cycle: e.target.value })} /><span className="unit">วัน</span></div>}</div>
          <Field label="ต้องสั่งล่วงหน้า (วัน)" hint={'ใช้คำนวณ "วันที่ควรสั่ง" = วันที่ยาหมด − จำนวนวันนี้'}>{(id) => <div className="inp"><input id={id} className="bare" type="number" inputMode="numeric" min={0} max={90} value={x.lead} onChange={(e) => set({ lead: e.target.value })} /><span className="unit">วัน</span></div>}</Field>
        </>}
        <div className="sec" style={{ marginTop: 4 }}><h2>ราคายาแต่ละร้าน</h2></div>
        <span className="hx" style={{ marginTop: -10 }}>ใส่ราคาร้านที่สั่งประจำ 2–3 ร้าน เลือกหน่วยของราคาเอง แอปจะเทียบให้ตอนสั่งยาว่าร้านไหนรวมค่าส่งถูกกว่า</span>
        {x.prices.map((r, i) => {
          const bad = r.unit !== x.baseUnit && r.unit !== x.packUnit;
          return (
            <div key={r.pharmacyId} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="grow"><Select value={r.pharmacyId} onChange={(v) => setRow(i, { pharmacyId: v })} label="ร้านยา" options={d.pharmacies.filter((p) => p.id === r.pharmacyId || !used.includes(p.id)).map((p) => ({ value: p.id, label: p.name }))} /></div>
                <button type="button" className="ib" aria-label="ลบราคาร้านนี้" onClick={() => set({ prices: x.prices.filter((_, j) => j !== i) })}><Icon name="x" size={20} /></button>
              </div>
              <div className="inp"><span className="unit">฿</span><input className="bare" type="number" inputMode="decimal" min={0} step={0.01} aria-label="ราคา" placeholder="ราคา" value={r.price} onChange={(e) => setRow(i, { price: e.target.value })} /><span className="unit">ต่อ</span>
                <span className="selw"><select aria-label="หน่วยของราคา" value={r.unit} onChange={(e) => setRow(i, { unit: e.target.value })}>{groups.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((u) => <option key={u}>{u}</option>)}</optgroup>)}</select><Icon name="caret" size={18} /></span></div>
              {bad && <span className="hx" style={{ color: 'var(--warnink)' }}>หน่วยราคาไม่ตรงกับขนาดบรรจุ แอปจะยังเทียบราคาร้านนี้ไม่ได้</span>}
            </div>
          );
        })}
        <Button variant="s" icon="plus" disabled={!free.length} onClick={() => { const f = free[0]; if (f) set({ prices: [...x.prices, { pharmacyId: f.id, price: '', unit: x.packSize ? x.packUnit : x.baseUnit }] }); }}>เพิ่มราคาจากร้านอื่น</Button>
        {!free.length && <span className="hx">{d.pharmacies.filter((p) => p.active).length === 0 ? 'ยังไม่มีร้านยา เพิ่มร้านที่หน้าตั้งค่า' : 'ใส่ครบทุกร้านที่มีแล้ว เพิ่มร้านใหม่ได้ที่ตั้งค่า'}</span>}
        <Note>ข้อมูลทั้งหมดบันทึกเมื่อกด <b>บันทึก</b> ที่หน้าแก้ไขยา</Note>
      </Body>
    </Screen>
  );
}
