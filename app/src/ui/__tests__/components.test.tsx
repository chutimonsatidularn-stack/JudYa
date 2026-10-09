import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AllergyBlock, Avatar, Button, ChipGroup, Field, Note, StockChip, Switch, TextInput } from '../components';
import { AVATARS, getAvatar } from '../avatars';

describe('components (UX-2, SEC-1)', () => {
  it('a disabled button cannot be pressed', () => {
    const f = vi.fn(); render(<Button disabled onClick={f}>บันทึก</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก' })); expect(f).not.toHaveBeenCalled();
  });
  it('chip group marks the chosen chip with aria-pressed AND a check icon (never colour alone)', () => {
    const f = vi.fn(); const { container } = render(<ChipGroup label="เจ้าของยา" options={['พ่อ', 'แม่'] as const} value="พ่อ" onChange={f} />);
    expect(screen.getByRole('button', { name: 'พ่อ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'แม่' })).toHaveAttribute('aria-pressed', 'false');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'แม่' })); expect(f).toHaveBeenCalledWith('แม่');
  });
  it('switch has role=switch and toggles', () => {
    const f = vi.fn(); render(<Switch checked={false} onChange={f} title="จัดยาทานเอง" />);
    const s = screen.getByRole('switch'); expect(s).toHaveAttribute('aria-checked', 'false'); fireEvent.click(s); expect(f).toHaveBeenCalledWith(true);
  });
  it('stock chip always has a word and an icon', () => {
    const { container, rerender } = render(<StockChip days={3} lowDays={7} />);
    expect(screen.getByText('ใกล้หมด')).toBeInTheDocument(); expect(container.querySelector('svg')).not.toBeNull();
    rerender(<StockChip days={null} lowDays={7} />); expect(screen.getByText('ยังไม่ทราบ')).toBeInTheDocument();
  });
  it('field links its label to the input and announces errors', () => {
    render(<Field label="ชื่อ" error="ใส่ชื่อก่อน">{(id) => <TextInput id={id} />}</Field>);
    expect(screen.getByLabelText('ชื่อ')).toBeInTheDocument(); expect(screen.getByRole('alert')).toHaveTextContent('ใส่ชื่อก่อน');
  });
  it('avatar: all 20 icons resolve; unknown id falls back to profile-01', () => {
    expect(AVATARS).toHaveLength(20); expect(AVATARS.every((a) => a.src && a.alt)).toBe(true);
    expect(getAvatar('zzz').id).toBe('profile-01'); expect(getAvatar(undefined).id).toBe('profile-01');
    render(<Avatar avatarId="zzz" />); expect(screen.getByRole('img')).toHaveAttribute('alt', getAvatar('profile-01').alt);
  });
  it('user text is shown as plain text, never as HTML (AC-U2)', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const { container } = render(<><Note>{evil}</Note><AllergyBlock items={[{ id: '1', drug: evil, symptoms: [evil], note: evil, recordedOn: '2026-01-01' }]} /></>);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(evil);
  });
});
