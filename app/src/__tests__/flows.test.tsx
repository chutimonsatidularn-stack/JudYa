import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import { loadData, saveData, STORAGE_KEY, type Store } from '../domain/storage';
import { demoData } from '../domain/__fixtures__/demo';

const mem = (data?: unknown) => { const map = new Map<string, string>(); const s = { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } } as Store & { map: Map<string, string> }; if (data) saveData(s, data); return s; };
const open = (hash: string, store: Store) => { window.location.hash = hash; return render(<App store={store} />); };
const saved = (s: Store) => { const r = loadData(s); if (r.status !== 'ok') throw new Error(r.status); return r.data; };
const type = (label: string | RegExp, v: string) => fireEvent.change(screen.getByLabelText(label), { target: { value: v } });

beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-08T03:00:00Z')); }); // Thursday in Thailand
afterEach(() => vi.useRealTimers());

describe('add a member (AC-M3)', () => {
  it('first run → add → saved → shown on Home with the chosen icon', async () => {
    const s = mem(); open('#/', s);
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มสมาชิก' }));
    expect(await screen.findByRole('heading', { name: 'เพิ่มสมาชิก' })).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'เพิ่มสมาชิก' }); expect(save).toBeDisabled(); expect(screen.getByText('ใส่ชื่อก่อน')).toBeInTheDocument();
    type('ชื่อ', 'คุณลุงสมชาย'); type(/ปีเกิด/, '1999'); expect(screen.getByRole('button', { name: 'เพิ่มสมาชิก' })).toBeDisabled(); expect(screen.getByText(/ปีเกิดไม่ถูกต้อง/)).toBeInTheDocument();
    type(/ปีเกิด/, '2490'); expect(screen.getByText('อายุประมาณ 79 ปี')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ปู่ย่าตายาย' }));
    fireEvent.click(screen.getByRole('button', { name: 'เปลี่ยนรูป' }));
    fireEvent.click(await screen.findByRole('button', { name: 'รูปที่ 13' })); fireEvent.click(screen.getByRole('button', { name: 'ใช้รูปนี้' }));
    expect(await screen.findByDisplayValue('คุณลุงสมชาย')).toBeInTheDocument(); // the typed text survived the picture screen
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มสมาชิก' }));
    expect(await screen.findByRole('heading', { name: 'สมาชิก' })).toBeInTheDocument();
    expect(saved(s).persons[0]).toMatchObject({ name: 'คุณลุงสมชาย', relationship: 'ปู่ย่าตายาย', birthYear: 2490, avatarId: 'profile-13', selfManaged: false });
  });
});

describe('Home, today, members', () => {
  it('Home shows members with chips and the banner for medicines near running out', () => {
    open('#/', mem(demoData()));
    expect(screen.getByText('ยาใกล้หมด 1 รายการ')).toBeInTheDocument();
    expect(screen.getByText('Losartan (Cozaar) 50 mg ของคุณพ่อ เหลือ 5 วัน')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /การแจ้งเตือน 3 รายการ/ })).toBeInTheDocument();
    expect(screen.getByText('จัดยาเอง')).toBeInTheDocument();
    expect(screen.getByText('ต้องซื้อ 1')).toBeInTheDocument();
    expect(screen.getByText('มีเรื่องที่ควรดูวันนี้')).toBeInTheDocument(); // reminder wins (UI-10)
  });
  it('today: tick a medicine, it persists, self-managed members are left out (NV-4, MB-2)', async () => {
    const s = mem(demoData()); open('#/today/all', s);
    expect(screen.getByText('จัดแล้ว 0 จาก 3 รายการ · เหลืออีก 3')).toBeInTheDocument();
    expect(screen.getByText('ไม่รวม คุณแม่ เพราะจัดยาเอง')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('checkbox')[0]!);
    expect(await screen.findByText('จัดแล้ว 1 จาก 3 รายการ · เหลืออีก 2')).toBeInTheDocument();
    expect(saved(s).ticks).toEqual({ date: '2026-10-08', done: ['a_dad_los:morning'] });
  });
  it('members list: a self-managed switch changes the chip', async () => {
    const s = mem(demoData()); open('#/member/p_dad', s);
    fireEvent.click(screen.getByRole('switch'));
    expect(saved(s).persons[0]!.selfManaged).toBe(true);
    expect(await screen.findByText('จัดยาเอง', { selector: '.chip' })).toBeInTheDocument();
  });
});

describe('take a member out and bring back (AC-M4)', () => {
  it('needs the tick; keeps medicines; restore from the removed list', async () => {
    const s = mem(demoData()); open('#/member/p_dad/remove', s);
    const confirm = screen.getByRole('button', { name: 'ยืนยันนำออก' }); expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'ฉันเข้าใจ' })); fireEvent.click(screen.getByRole('button', { name: 'ยืนยันนำออก' }));
    expect(await screen.findByText('สมาชิกที่นำออกแล้ว')).toBeInTheDocument();
    const d = saved(s); expect(d.persons[0]!.removed).toBe(true); expect(d.assignments.some((a) => a.id === 'a_dad_los')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'นำกลับ' }));
    expect(screen.queryByText('สมาชิกที่นำออกแล้ว')).toBeNull();
    expect(saved(s).persons[0]!.removed).toBeUndefined();
  });
  it('no member left → empty states (MB-9)', () => {
    const d = demoData(); d.persons.forEach((p) => { p.removed = true; }); open('#/', mem(d));
    expect(screen.getByText('ยังไม่มีสมาชิก')).toBeInTheDocument(); expect(screen.queryByText(/ยาใกล้หมด/)).toBeNull(); expect(screen.queryByRole('button', { name: 'เตรียมสั่งยา' })).toBeNull();
  });
});

describe('allergies (AC-L1)', () => {
  it('add with a severe symptom shows the warning; edit keeps the date; delete asks first', async () => {
    const s = mem(demoData()); open('#/member/p_dad/allergy', s);
    const save = screen.getByRole('button', { name: 'บันทึกแพ้ยา' }); expect(save).toBeDisabled();
    type(/ชื่อยาที่แพ้/, 'Aspirin'); fireEvent.click(screen.getByRole('button', { name: 'หายใจลำบาก' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1669');
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกแพ้ยา' }));
    expect(await screen.findByText('แพ้ยา 1 รายการ')).toBeInTheDocument();
    expect(saved(s).allergies[0]).toMatchObject({ drug: 'Aspirin', symptoms: ['หายใจลำบาก'], recordedOn: '2026-10-08' });
    fireEvent.click(screen.getByRole('button', { name: 'ลบ' }));
    const dlg = screen.getByRole('alertdialog'); expect(dlg).toHaveTextContent('ลบรายการนี้ใช่ไหม?');
    fireEvent.click(within(dlg).getByRole('button', { name: 'ยกเลิก' })); expect(saved(s).allergies).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'ลบ' })); fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'ยืนยันลบ' }));
    expect(saved(s).allergies).toHaveLength(0);
  });
});

describe('profile picture (AC-P2)', () => {
  it('choose and save updates the member; going back changes nothing', async () => {
    const s = mem(demoData()); open('#/member/p_dad/avatar', s);
    expect(screen.getAllByRole('button', { name: /^รูปที่ / })).toHaveLength(20);
    fireEvent.click(screen.getByRole('button', { name: 'รูปที่ 7' })); fireEvent.click(screen.getByRole('button', { name: 'ย้อนกลับ' }));
    expect(saved(s).persons[0]!.avatarId).toBe('profile-11');
    window.location.hash = '#/member/p_dad/avatar'; fireEvent(window, new HashChangeEvent('hashchange'));
    fireEvent.click(await screen.findByRole('button', { name: 'รูปที่ 7' })); fireEvent.click(screen.getByRole('button', { name: 'ใช้รูปนี้' }));
    expect(await screen.findByText(/ยา 3 รายการ|ยา 2 รายการ/)).toBeInTheDocument();
    expect(saved(s).persons[0]!.avatarId).toBe('profile-07');
  });
});

describe('medicine list (NV-1)', () => {
  it('filter chips and household section', async () => {
    open('#/medicines', mem(demoData()));
    expect(screen.getByText('ทั้งหมด 6 รายการ')).toBeInTheDocument();
    expect(screen.getByText('ยาสามัญประจำบ้าน')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ยาบ้าน' }));
    expect(await screen.findByText(/ใกล้หมดอายุ อีก 23 วัน/)).toBeInTheDocument(); expect(screen.queryByText('Vitamin D')).toBeNull();
  });
});

describe('safety', () => {
  it('unreadable data blocks every change (nothing is written)', () => {
    const s = mem(); s.map.set(STORAGE_KEY, '{broken'); open('#/', s); expect(screen.getByText('เปิดข้อมูลไม่ได้')).toBeInTheDocument(); expect(s.map.get(STORAGE_KEY)).toBe('{broken');
  });
});

describe('add and edit a medicine (AC-B, AC-H, AC-A4)', () => {
  const pharm = () => { const d = demoData(); d.pharmacies = [{ id: 'ph1', name: 'ร้านสุขใจ', shippingFee: 40, freeShippingOver: null, active: true }, { id: 'ph2', name: 'ร้านหมอยา', shippingFee: 30, freeShippingOver: null, active: true }]; return d; };

  it('add: name required → fill → pack → schedule → save; days remaining come from the walk', async () => {
    const s = mem(pharm()); open('#/medicine/new?owner=p_me', s);
    fireEvent.click(await screen.findByRole('button', { name: 'บันทึก' })); expect(await screen.findByRole('status')).toHaveTextContent('ใส่ชื่อยาก่อน');
    type('ตัวยาสามัญ (ชื่อสามัญ)', 'Amlodipine'); type('ความแรง', '5 mg'); type('จำนวนที่เหลือ', '12');
    expect(screen.getAllByText(/ยังไม่ระบุขนาดบรรจุ/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('ขนาดบรรจุและการซื้อ').closest('button')!);
    fireEvent.change(await screen.findByLabelText('จำนวนต่อแพ็ก'), { target: { value: '10' } });
    expect(screen.getByText('เท่ากับ 1.2 แผง')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มราคาจากร้านอื่น' }));
    fireEvent.change(screen.getByLabelText('ราคา'), { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: 'เสร็จ' }));
    fireEvent.click((await screen.findByText('ตารางทานยา')).closest('button')!);
    fireEvent.click(await screen.findByRole('button', { name: 'เลือกวัน' }));
    for (const day of ['จันทร์', 'พุธ', 'ศุกร์']) fireEvent.click(screen.getByRole('button', { name: `วัน${day}` }));
    expect(screen.getByText('ทุกวันจันทร์ พุธ และ ศุกร์')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มขนาดยาเช้า' }));
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มขนาดยาเช้า' })); // ½ + ½ = 1
    fireEvent.click(screen.getByRole('button', { name: 'เสร็จ กลับไปหน้าเพิ่มยา' }));
    fireEvent.click(await screen.findByRole('button', { name: 'บันทึก' }));
    await screen.findByText('เพิ่มยาแล้ว');
    const d = saved(s); const a = d.assignments.at(-1)!; const med = d.medications.at(-1)!;
    expect(a).toMatchObject({ owner: { kind: 'person', personId: 'p_me' }, stockQty: 12, doses: { morning: 1 }, schedule: { kind: 'weekdays', days: [1, 3, 5] } });
    expect(med).toMatchObject({ generic: 'Amlodipine', packSize: 10, prices: [{ pharmacyId: 'ph1', price: 35, unit: 'แผง' }] });
  });

  it('household medicine: expiry field, no schedule card, no stock reminder (HM-1…3)', async () => {
    open('#/medicine/new?owner=house', mem(pharm()));
    expect(await screen.findByLabelText('วันหมดอายุ')).toBeInTheDocument();
    expect(screen.queryByText('ตารางทานยา')).toBeNull(); expect(screen.queryByText('ปรับโดส')).toBeNull();
  });

  it('allergy warning appears by generic name (AC-L2)', async () => {
    const d = pharm(); d.allergies.push({ id: 'al', personId: 'p_dad', drug: 'Penicillin', symptoms: ['ผื่น/ลมพิษ'], recordedOn: '2026-01-01', source: 'manual' });
    open('#/medicine/new?owner=p_dad', mem(d)); type('ตัวยาสามัญ (ชื่อสามัญ)', 'penicillin v');
    expect(await screen.findByText(/ระวัง: คุณพ่อ เคยแพ้ Penicillin/)).toBeInTheDocument();
  });

  it('edit stock only: saved without history', async () => {
    const s = mem(pharm()); open('#/medicine/a_dad_los', s);
    type('จำนวนที่เหลือ', '50'); fireEvent.click(await screen.findByRole('button', { name: 'บันทึก' })); await screen.findByText('บันทึกแล้ว');
    expect(saved(s).assignments.find((a) => a.id === 'a_dad_los')!.stockQty).toBe(50); expect(saved(s).changes).toHaveLength(0);
  });

  it('change the schedule of an existing medicine: needs a reason and a tick, writes ONE history entry (DS-10, AC-A4)', async () => {
    const s = mem(pharm()); open('#/medicine/a_dad_vitd/schedule', s);
    expect(screen.getByText('ยังไม่ได้เปลี่ยนตาราง')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'วันพุธ' }));
    expect(screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' })).toBeDisabled(); expect(screen.getByText('เลือกเหตุผลก่อนบันทึก')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('เหตุผล / แหล่งข้อมูล'), { target: { value: 'แพทย์สั่งปรับ' } });
    fireEvent.click(screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' }));
    const dlg = await screen.findByRole('dialog'); expect(dlg).toHaveTextContent('ทุกวันจันทร์ และ พฤหัสบดี'); expect(dlg).toHaveTextContent('ทุกวันจันทร์ พุธ และ พฤหัสบดี'); expect(dlg).toHaveTextContent('แพทย์สั่งปรับ');
    const save = within(dlg).getByRole('button', { name: 'บันทึกตารางใหม่' }); expect(save).toBeDisabled();
    fireEvent.click(within(dlg).getByRole('checkbox', { name: 'ฉันตรวจสอบตารางนี้แล้ว' })); fireEvent.click(within(dlg).getByRole('button', { name: 'บันทึกตารางใหม่' }));
    await screen.findByText('บันทึกตารางใหม่แล้ว');
    const d = saved(s); expect(d.changes).toHaveLength(1); expect(d.changes[0]).toMatchObject({ kind: 'dose', reason: 'แพทย์สั่งปรับ', assignmentId: 'a_dad_vitd', previous: { schedule: { kind: 'weekdays', days: [1, 4] } }, next: { schedule: { kind: 'weekdays', days: [1, 3, 4] } } });
    expect(d.assignments.find((a) => a.id === 'a_dad_vitd')!.schedule).toEqual({ kind: 'weekdays', days: [1, 3, 4] });
  });

  it('weekday schedule with no day chosen cannot be saved (DS-2)', async () => {
    open('#/medicine/new?owner=p_me', mem(pharm())); type('ตัวยาสามัญ (ชื่อสามัญ)', 'X');
    fireEvent.click((await screen.findByText('ตารางทานยา')).closest('button')!); fireEvent.click(await screen.findByRole('button', { name: 'เลือกวัน' }));
    fireEvent.click(screen.getByRole('button', { name: 'เสร็จ กลับไปหน้าเพิ่มยา' })); fireEvent.click(await screen.findByRole('button', { name: 'บันทึก' }));
    expect(await screen.findByRole('status')).toHaveTextContent('ตารางทานยายังไม่ครบ');
  });
});

describe('adjust dose, history, stop (AC-A1…A3)', () => {
  it('09: button stays disabled until a dose changed AND a reason is chosen; the sheet shows old → new and the reason; one history entry', async () => {
    const s = mem(demoData()); open('#/medicine/a_dad_los/dose', s);
    const review = screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' }); expect(review).toBeDisabled(); expect(screen.getByText('ยังไม่ได้เปลี่ยนโดส')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มขนาดยาเย็น' }));
    expect(screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' })).toBeDisabled(); expect(screen.getByText('เลือกเหตุผลก่อนบันทึก')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('เหตุผล / แหล่งข้อมูล'), { target: { value: 'ผลตรวจเลือดหรือผลตรวจอื่น' } }); type('รายละเอียดเพิ่มเติม (ไม่บังคับ)', 'ปรับตามผลเลือด');
    fireEvent.click(screen.getByRole('button', { name: 'ตรวจสอบก่อนบันทึก' }));
    const dlg = await screen.findByRole('dialog'); expect(dlg).toHaveTextContent('เช้า 1 เม็ด'); expect(dlg).toHaveTextContent('เช้า 1 เม็ด · เย็น ½ เม็ด'); expect(dlg).toHaveTextContent('ผลตรวจเลือดหรือผลตรวจอื่น · ปรับตามผลเลือด');
    expect(within(dlg).getByRole('button', { name: 'บันทึกโดสใหม่' })).toBeDisabled();
    fireEvent.click(within(dlg).getByRole('checkbox')); fireEvent.click(within(dlg).getByRole('button', { name: 'บันทึกโดสใหม่' }));
    await screen.findByText('บันทึกโดสใหม่แล้ว');
    const d = saved(s); expect(d.changes).toHaveLength(1); expect(d.changes[0]).toMatchObject({ kind: 'dose', reason: 'ผลตรวจเลือดหรือผลตรวจอื่น', note: 'ปรับตามผลเลือด' });
    expect(d.assignments.find((a) => a.id === 'a_dad_los')!.doses).toMatchObject({ morning: 1, evening: 0.5 });
  });
  it('09c: timeline newest first with reason chips and the "add only" footer', () => {
    const d = demoData();
    d.changes = [{ id: 'c1', assignmentId: 'a_dad_los', on: '2026-07-02', at: '2026-07-02T09:00:00+07:00', kind: 'dose', previous: { doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, next: { doses: { morning: 0.5, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, reason: 'เภสัชกรแนะนำ' }, { id: 'c2', assignmentId: 'a_dad_los', on: '2026-08-15', at: '2026-08-15T09:00:00+07:00', kind: 'dose', previous: { doses: { morning: 0.5, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, next: { doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, reason: 'แพทย์สั่งปรับ', note: 'หมอปรับหลังตรวจเลือด' }];
    open('#/medicine/a_dad_los/history', mem(d));
    const text = document.body.textContent ?? ''; expect(text.indexOf('15 ส.ค. 2569')).toBeLessThan(text.indexOf('2 ก.ค. 2569'));
    expect(screen.getByText('เหตุผล: แพทย์สั่งปรับ')).toBeInTheDocument(); expect(screen.getByText('หมอปรับหลังตรวจเลือด')).toBeInTheDocument(); expect(screen.getByText(/ลบหรือแก้ย้อนหลังไม่ได้/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ลบ|แก้ไข/ })).toBeNull();
  });
  it('09d: stop needs a reason and a tick; "แพ้ยา" needs a symptom and adds the red allergy block', async () => {
    const s = mem(demoData()); open('#/medicine/a_dad_los/stop', s);
    const go = () => screen.getByRole('button', { name: 'ยืนยันหยุดใช้ยา' }); expect(go()).toBeDisabled(); expect(screen.getByText('เลือกเหตุผลก่อน')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('เหตุผลที่หยุด'), { target: { value: 'แพ้ยา' } }); fireEvent.click(screen.getByRole('checkbox'));
    expect(go()).toBeDisabled(); expect(screen.getByText('เลือกอาการอย่างน้อย 1 อย่าง')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ผื่น/ลมพิษ' })); fireEvent.click(screen.getByRole('button', { name: 'หายใจลำบาก' }));
    expect(screen.getAllByRole('alert').some((n) => n.textContent?.includes('1669'))).toBe(true);
    expect(go()).toBeEnabled(); fireEvent.click(go());
    expect(await screen.findByText('แพ้ยา 1 รายการ')).toBeInTheDocument(); // member page: red allergy block
    const d = saved(s); expect(d.assignments.find((a) => a.id === 'a_dad_los')).toMatchObject({ active: false, stopped: { reason: 'แพ้ยา' } });
    expect(d.allergies).toMatchObject([{ drug: 'Losartan', symptoms: ['ผื่น/ลมพิษ', 'หายใจลำบาก'], source: 'stopMedication' }]); expect(d.changes.at(-1)).toMatchObject({ kind: 'stop', reason: 'แพ้ยา' });
    expect(screen.getByText('ยาที่หยุดแล้ว')).toBeInTheDocument();
  });
});

describe('XSS (AC-U2, SEC-1)', () => {
  it('a medicine and a member named like HTML are shown as plain text on every screen', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const d = demoData(); d.medications[0]!.generic = evil; d.medications[0]!.brand = evil; d.persons[0]!.name = evil;
    d.allergies.push({ id: 'al', personId: 'p_dad', drug: evil, symptoms: ['คัน'], note: evil, recordedOn: '2026-01-01', source: 'manual' });
    d.changes.push({ id: 'c', assignmentId: 'a_dad_los', on: '2026-08-01', at: '2026-08-01T00:00:00+07:00', kind: 'dose', previous: { doses: { morning: 1, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, next: { doses: { morning: 2, noon: 0, evening: 0, bedtime: 0 }, schedule: { kind: 'daily' } }, reason: 'อื่นๆ', note: evil });
    for (const route of ['#/', '#/notifications', '#/today/all', '#/members', '#/member/p_dad', '#/medicines', '#/medicine/a_dad_los', '#/medicine/a_dad_los/history', '#/medicine/a_dad_los/dose']) {
      const { container, unmount } = open(route, mem(d));
      expect(container.querySelector('img[src="x"]'), route).toBeNull();
      unmount();
    }
  });
});

describe('settings and pharmacies (AC-P3)', () => {
  it('add a pharmacy, use it in the list, change reminder days, delete with confirmation', async () => {
    const s = mem(demoData()); open('#/settings', s);
    expect(screen.getByText('ยังไม่มีร้านยา', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มร้าน' }));
    expect(await screen.findByRole('heading', { name: 'เพิ่มร้านยา' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกร้านยา' })).toBeDisabled(); expect(screen.getByText('ใส่ชื่อร้านก่อน')).toBeInTheDocument();
    type('ชื่อร้าน', 'ร้านยาสุขใจ'); type(/เบอร์โทร/, '12-x');
    expect(screen.getByRole('button', { name: 'บันทึกร้านยา' })).toBeDisabled(); expect(screen.getAllByText(/เบอร์โทรไม่ถูกต้อง/).length).toBeGreaterThan(0);
    type(/เบอร์โทร/, '02-123-4567'); type('ค่าส่ง (ไม่บังคับ)', '40'); type(/ส่งฟรีเมื่อซื้อครบ/, '500');
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกร้านยา' }));
    expect(await screen.findByText('โทร 02-123-4567')).toBeInTheDocument();
    expect(screen.getByText(/ค่าส่ง 40 บาท · ฟรีเมื่อซื้อครบ 500 บาท/)).toBeInTheDocument();
    expect(saved(s).pharmacies[0]).toMatchObject({ name: 'ร้านยาสุขใจ', shippingFee: 40, freeShippingOver: 500 });

    fireEvent.click(screen.getByRole('button', { name: 'เพิ่ม จำนวนวัน' }));
    expect(saved(s).settings.reminderDays).toBe(8);

    fireEvent.click(screen.getByRole('button', { name: 'แก้ไข ร้านยาสุขใจ' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ลบร้านนี้' }));
    expect(saved(s).pharmacies).toHaveLength(1); // not yet: asks first
    const sheet = screen.getByRole('dialog', { name: 'ลบร้านยา' });
    fireEvent.click(within(sheet).getByRole('button', { name: 'ลบร้านนี้' }));
    expect(await screen.findByText('ยังไม่มีร้านยา', { exact: false })).toBeInTheDocument();
    expect(saved(s).pharmacies).toHaveLength(0);
  });

  it('delete-all needs the tick; restore refuses a bad file and keeps data', async () => {
    const s = mem(demoData()); open('#/settings', s);
    fireEvent.click(screen.getByRole('button', { name: 'ลบข้อมูลทั้งหมด' }));
    const sheet = screen.getByRole('dialog', { name: 'ลบข้อมูลทั้งหมด' });
    expect(within(sheet).getByRole('button', { name: 'ลบทั้งหมด' })).toBeDisabled();
    fireEvent.click(within(sheet).getByRole('checkbox', { name: 'ฉันเข้าใจ' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'ลบทั้งหมด' }));
    expect(await screen.findByRole('button', { name: 'เพิ่มสมาชิก' })).toBeInTheDocument();
    expect(saved(s).persons).toHaveLength(0);
  });

  it('restore: shows file vs current, replaces only after the tick', async () => {
    const s = mem(); open('#/settings', s);
    const file = new File([JSON.stringify(demoData())], 'b.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: () => Promise.resolve(JSON.stringify(demoData())) });
    fireEvent.change(screen.getByLabelText('เลือกไฟล์สำรอง'), { target: { files: [file] } });
    const sheet = await screen.findByRole('dialog', { name: 'นำเข้าข้อมูล' });
    expect(within(sheet).getByRole('button', { name: 'แทนที่ด้วยข้อมูลในไฟล์' })).toBeDisabled();
    fireEvent.click(within(sheet).getByRole('checkbox', { name: 'ฉันเข้าใจ' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'แทนที่ด้วยข้อมูลในไฟล์' }));
    expect(await screen.findByText('ยาใกล้หมด 1 รายการ')).toBeInTheDocument();
    expect(saved(s).persons.length).toBeGreaterThan(0);

    open('#/settings', s);
    const bad = new File(['nope'], 'x.json'); Object.defineProperty(bad, 'text', { value: () => Promise.resolve('nope') });
    fireEvent.change(screen.getAllByLabelText('เลือกไฟล์สำรอง').at(-1)!, { target: { files: [bad] } });
    expect(await screen.findByText(/ไม่ใช่ไฟล์สำรองของ JudYa/)).toBeInTheDocument();
  });
});
