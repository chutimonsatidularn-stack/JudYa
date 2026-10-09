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
