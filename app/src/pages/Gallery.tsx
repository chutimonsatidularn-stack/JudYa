// Component gallery: every building block in one page, to check the look against docs/design/screens (not part of the product;
// remove before release — see HANDOFF).
import { useState } from 'react';
import { AllergyBlock, Avatar, Banner, Button, Card, Chip, ChipGroup, DateInput, Field, NumberInput, Note, Pill, ProgressBar, Select, Sheet, StockChip, Stepper, SummaryCard, Switch, TapCard, TextInput, Timeline, Toast } from '../ui/components';
import { AVATARS } from '../ui/avatars';
import { Body, Header, Screen } from '../ui/Shell';

export function Gallery() {
  const [chip, setChip] = useState<'พ่อ' | 'แม่' | 'ฉัน'>('พ่อ');
  const [multi, setMulti] = useState<string[]>(['ผื่น/ลมพิษ']);
  const [sw, setSw] = useState(true);
  const [n, setN] = useState(1);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState('');
  const [sel, setSel] = useState('เม็ด');
  const H = ({ children }: { children: string }) => <div className="sec"><h2>{children}</h2></div>;
  return (
    <Screen nav>
      <Header title="ชุดคอมโพเนนต์" sub="ไว้เทียบกับภาพที่อนุมัติ" back="/" pill={<Pill icon="plus">เพิ่ม</Pill>} />
      <Body>
        <H>ปุ่ม</H>
        <Button icon="bag">เตรียมสั่งยา</Button><Button variant="s">ย้อนกลับ</Button><Button variant="d">หยุดใช้ยา</Button><Button disabled>ตรวจสอบก่อนบันทึก</Button>
        <p className="mut cap" style={{ textAlign: 'center' }}>เลือกเหตุผลก่อนบันทึก</p>
        <H>ป้ายสถานะ</H>
        <div className="chips"><StockChip days={5} lowDays={7} /><StockChip days={30} lowDays={7} /><StockChip days={null} lowDays={7} /><Chip tone="info" icon="pill">ทานวันนี้ 2</Chip><Chip tone="rest" icon="moon">พักวันนี้</Chip></div>
        <H>การ์ด</H>
        <TapCard icon="pill" title="ต้องทานยา 2 คน" text="คุณพ่อ และ ฉัน" tone="today" />
        <TapCard icon="alert" title="Losartan 50 mg" text="คุณพ่อ · เหลือ 5 วัน" tone="buy" />
        <Banner title="ยาใกล้หมด 2 รายการ" text="Losartan ของคุณพ่อ เหลือ 5 วัน" />
        <SummaryCard label="ความคืบหน้าการจัดยา">จัดแล้ว 0 จาก 3 รายการ · เหลืออีก 3</SummaryCard>
        <Card><b>Vitamin D</b> 1,000 IU<br /><span className="mut sm">เหลือ 20 เม็ด · พอทานอีก 70 วัน</span><ProgressBar percent={70} /></Card>
        <Note>ข้อมูลเก็บในเครื่องนี้เท่านั้น</Note><Note tone="caution" icon="moon"><b>พักวันนี้</b> Calcium</Note>
        <AllergyBlock items={[{ id: 'a1', drug: 'Penicillin', symptoms: ['ผื่น/ลมพิษ'], recordedOn: '8 ต.ค. 2569' }]} onEdit={() => {}} onDelete={() => {}} />
        <H>ฟอร์ม</H>
        <Field label="ตัวยาสามัญ (ชื่อสามัญ)" hint="เช่น Paracetamol">{(id) => <TextInput id={id} placeholder="Vitamin D" />}</Field>
        <Field label="ปีเกิด พ.ศ." error="ปีเกิดไม่ถูกต้อง (พ.ศ. 2400–2569)">{(id) => <TextInput id={id} defaultValue="1999" />}</Field>
        <Field label="รูปแบบยา">{(id) => <Select id={id} value={sel} onChange={setSel} options={['เม็ด', 'แคปซูล', { group: 'ตรงกับขนาดบรรจุ', items: ['ขวด', 'กล่อง'] }]} />}</Field>
        <Field label="จำนวนที่เหลือ">{(id) => <NumberInput id={id} value="20" onChange={() => {}} unit="เม็ด" />}</Field>
        <Field label="วันหมดอายุ">{(id) => <DateInput id={id} />}</Field>
        <Stepper label="เช้า" value={n} onMinus={() => setN(Math.max(0, n - 0.5))} onPlus={() => setN(n + 0.5)} />
        <ChipGroup label="เจ้าของยา" options={['พ่อ', 'แม่', 'ฉัน'] as const} value={chip} onChange={setChip} />
        <ChipGroup label="อาการ" multiple options={['ผื่น/ลมพิษ', 'คัน', 'หายใจลำบาก']} value={multi} onChange={(v) => setMulti(multi.includes(v) ? multi.filter((x) => x !== v) : [...multi, v])} />
        <Card className="x"><Switch checked={sw} onChange={setSw} title="คุณแม่จัดยาทานเอง" text="เราดูแลแค่สต๊อกและซื้อยาให้" /></Card>
        <H>รูปโปรไฟล์ (20 แบบ)</H>
        <div className="chips">{AVATARS.map((a) => <Avatar key={a.id} avatarId={a.id} size="lg" />)}</div>
        <div className="chips"><Avatar avatarId="zzz" /><Avatar avatarId="profile-11" size="xl" /></div>
        <H>ไทม์ไลน์ ชีต และข้อความแจ้ง</H>
        <Timeline items={[{ id: '1', title: '15 ส.ค. 2569 · ปรับโดส', text: 'เช้า 1 เม็ด → 1½ เม็ด' }, { id: '2', title: '2 ก.ค. 2569 · หยุดใช้ยา', text: 'เหตุผล: แพ้ยา', stop: true }]} />
        <Button variant="s" onClick={() => setSheet(true)}>เปิดชีต</Button><Button variant="s" onClick={() => setToast('บันทึกแล้ว')}>แสดงข้อความ</Button>
      </Body>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="ยืนยัน"><b style={{ fontSize: 20 }}>ยืนยันการเปลี่ยนตาราง</b><Button onClick={() => setSheet(false)}>ยืนยันและบันทึก</Button><Button variant="s" onClick={() => setSheet(false)}>กลับไปแก้ไข</Button></Sheet>
      <Toast message={toast} />
    </Screen>
  );
}
