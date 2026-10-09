import { useRef, useState } from 'react';
import { Header, Body, Screen } from '../ui/Shell';
import { Button, Card, Note, Pill, Sheet, Stepper } from '../ui/components';
import { Icon } from '../ui/Icon';
import { SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { backupName, countsOf, deleteAllData, exportBackup, parseBackup, REMINDER_MAX, REMINDER_MIN, setReminderDays, type Counts } from '../domain/settings';
import type { AppData } from '../domain/schema';

const baht = (n: number) => `${n.toLocaleString('th-TH')} บาท`;
const countText = (c: Counts) => `สมาชิก ${c.persons} · ยา ${c.assignments} · แพ้ยา ${c.allergies} · ร้านยา ${c.pharmacies}`;

/** 14 Settings: pharmacies, reminder days, backup / restore / delete all (UI-7, D-3) */
export function Settings() {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [incoming, setIncoming] = useState<AppData | null>(null);
  const [problem, setProblem] = useState('');
  const [wipe, setWipe] = useState(false);
  const [ack, setAck] = useState(false);
  const close = () => { setIncoming(null); setWipe(false); setAck(false); };

  const backup = () => {
    try {
      const url = URL.createObjectURL(new Blob([exportBackup(d)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = backupName(todayBangkok()); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say('บันทึกไฟล์สำรองแล้ว เก็บไว้ในที่ปลอดภัย');
    } catch { say('สำรองข้อมูลไม่สำเร็จ'); }
  };
  const pick = async (f: File | undefined) => {
    if (!f) return;
    setProblem('');
    const r = parseBackup(await f.text(), f.size);
    if (r.ok) setIncoming(r.data); else setProblem(r.message);
  };
  const restore = () => { if (incoming && update(() => incoming)) { close(); say('นำเข้าข้อมูลแล้ว'); go('/'); } };
  const clear = () => { if (update(() => deleteAllData())) { close(); say('ลบข้อมูลทั้งหมดแล้ว'); go('/'); } };
  const days = d.settings.reminderDays;

  return (
    <Screen nav>
      <Header title="ตั้งค่า" pill={<Pill icon="plus" onClick={() => go('/pharmacy/new')}>เพิ่มร้าน</Pill>} />
      <Body gap={12}>
        <SectionTitle title="ร้านยาของฉัน" />
        {d.pharmacies.length === 0 ? (
          <Note icon="info">ยังไม่มีร้านยา เพิ่มร้านที่ซื้อประจำ แล้วใส่ราคาในหน้าแก้ไขยา แอปจะช่วยเทียบว่าร้านไหนรวมค่าส่งแล้วถูกกว่า</Note>
        ) : (
          <div className="card" style={{ padding: '4px 16px' }}>
            {d.pharmacies.map((p) => (
              <div className="li" key={p.id}>
                <span className="disc"><Icon name="store" size={22} /></span>
                <span className="grow">
                  <b>{p.name}</b>
                  {p.note && <><br /><span className="mut sm">{p.note}</span></>}
                  <br /><span className="mut sm">{p.phone ? `โทร ${p.phone}` : 'ยังไม่มีเบอร์โทร'}</span>
                  <br /><span className="mut sm">{p.shippingFee == null ? 'ยังไม่ระบุค่าส่ง' : p.shippingFee === 0 ? 'รับที่ร้าน ไม่มีค่าส่ง' : `ค่าส่ง ${baht(p.shippingFee)}`}{p.freeShippingOver != null && p.shippingFee !== 0 ? ` · ฟรีเมื่อซื้อครบ ${baht(p.freeShippingOver)}` : ''}</span>
                </span>
                <button type="button" className="ib" aria-label={`แก้ไข ${p.name}`} onClick={() => go(`/pharmacy/${p.id}`)}><Icon name="edit" size={20} /></button>
              </div>
            ))}
          </div>
        )}
        <Card>
          <div className="dr" style={{ padding: 0 }}>
            <span className="grow"><b>สั่งล่วงหน้าตั้งต้น</b><br /><span className="mut sm">เตือนซื้อเมื่อเหลือไม่เกิน {days} วัน ใช้กับทุกคน</span></span>
            <Stepper label="จำนวนวัน" value={days} minusDisabled={days <= REMINDER_MIN} plusDisabled={days >= REMINDER_MAX} onMinus={() => update((x) => setReminderDays(x, days - 1))} onPlus={() => update((x) => setReminderDays(x, days + 1))} />
            <span>วัน</span>
          </div>
        </Card>
        <SectionTitle title="ข้อมูลของฉัน" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="s" icon="down" onClick={backup}>สำรอง</Button>
          <Button variant="s" icon="up" onClick={() => file.current?.click()}>นำเข้า</Button>
        </div>
        <input ref={file} type="file" accept="application/json,.json" hidden aria-label="เลือกไฟล์สำรอง" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
        {problem && <Note tone="danger" icon="alert">{problem} ข้อมูลเดิมยังอยู่ครบ</Note>}
        <Button variant="d" onClick={() => setWipe(true)}>ลบข้อมูลทั้งหมด</Button>
        <p className="mut sm">ข้อมูลเก็บในเครื่องนี้เท่านั้น JudYa รุ่นทดลอง 0.7</p>
      </Body>

      <Sheet open={!!incoming} onClose={close} label="นำเข้าข้อมูล">
        <h2 style={{ margin: '4px 0 8px' }}>นำเข้าข้อมูลจากไฟล์?</h2>
        {incoming && <>
          <div className="card" style={{ marginBottom: 8 }}><b>ในไฟล์</b><br /><span className="sm">{countText(countsOf(incoming))}</span></div>
          <div className="card"><b>ที่จะถูกแทนที่ (ข้อมูลในเครื่องตอนนี้)</b><br /><span className="sm">{countText(countsOf(d))}</span></div>
        </>}
        <Note tone="caution" icon="alert">ข้อมูลในเครื่องตอนนี้จะหายทั้งหมดและถูกแทนด้วยข้อมูลในไฟล์ ถ้าไม่แน่ใจ ให้กดสำรองก่อน</Note>
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span className="sm">ฉันเข้าใจ</span></button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <Button variant="d" disabled={!ack} onClick={restore}>แทนที่ด้วยข้อมูลในไฟล์</Button>
          <Button variant="s" onClick={close}>ยกเลิก</Button>
        </div>
      </Sheet>

      <Sheet open={wipe} onClose={close} label="ลบข้อมูลทั้งหมด">
        <h2 style={{ margin: '4px 0 8px' }}>ลบข้อมูลทั้งหมด?</h2>
        <Note tone="danger" icon="alert">สมาชิก ยา ประวัติ แพ้ยา และร้านยาทั้งหมดในเครื่องนี้จะถูกลบ เอากลับไม่ได้ ถ้ามีไฟล์สำรอง นำเข้ากลับมาได้</Note>
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span className="sm">ฉันเข้าใจ</span></button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <Button variant="d" disabled={!ack} onClick={clear}>ลบทั้งหมด</Button>
          <Button variant="s" onClick={close}>ยกเลิก</Button>
        </div>
      </Sheet>
    </Screen>
  );
}
