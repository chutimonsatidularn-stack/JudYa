import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Intro, INTRO_KEY } from '../pages/Intro';
import { saveData, type Store } from '../domain/storage';
import { emptyData } from '../domain/storage';

const mem = () => { const map = new Map<string, string>(); return { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } } as Store & { map: Map<string, string> }; };
afterEach(() => vi.useRealTimers());

describe('splash and welcome (01, 02)', () => {
  it('first start: splash moves on by itself, welcome → start remembers it and shows the app', () => {
    vi.useFakeTimers(); const s = mem();
    render(<Intro store={s}><p>แอป</p></Intro>);
    expect(screen.getByRole('button', { name: 'เริ่มต้น' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2300); });
    expect(screen.getByRole('heading').textContent).toBe('ดูแลยาของคนที่คุณรักได้ในที่เดียว'); expect(screen.getByText('เช็คสต๊อกยา')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มใช้งาน' }));
    expect(screen.getByText('แอป')).toBeInTheDocument(); expect(s.map.get(INTRO_KEY)).toBe('1');
  });
  it('tap skips the splash; the backup button goes to Settings', () => {
    const s = mem(); render(<Intro store={s}><p>แอป</p></Intro>);
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มต้น' }));
    fireEvent.click(screen.getByRole('button', { name: 'ฉันมีไฟล์สำรองข้อมูล' }));
    expect(window.location.hash).toBe('#/settings'); expect(screen.getByText('แอป')).toBeInTheDocument();
  });
  it('not shown again once seen, or when data already exists', () => {
    const seen = mem(); seen.setItem(INTRO_KEY, '1'); render(<Intro store={seen}><p>แอป1</p></Intro>); expect(screen.getByText('แอป1')).toBeInTheDocument();
    const has = mem(); saveData(has, emptyData()); render(<Intro store={has}><p>แอป2</p></Intro>); expect(screen.getByText('แอป2')).toBeInTheDocument();
  });
});
