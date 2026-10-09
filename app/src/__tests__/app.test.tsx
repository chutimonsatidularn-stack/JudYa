import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { STORAGE_KEY, type Store } from '../domain/storage';

const mem = (init: Record<string, string> = {}) => { const map = new Map(Object.entries(init)); return { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } } as Store & { map: Map<string, string> }; };

describe('app shell', () => {
  it('first run: empty Home with a clear next step, nothing is written yet', () => {
    window.location.hash = '#/'; const s = mem(); render(<App store={s} />);
    expect(screen.getByText('ยังไม่มีสมาชิก')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เพิ่มสมาชิก' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'เมนูหลัก' }).querySelectorAll('button')).toHaveLength(4);
    expect(s.map.size).toBe(0);
  });
  it('bottom nav moves between tabs', async () => {
    window.location.hash = '#/'; render(<App store={mem()} />);
    fireEvent.click(screen.getByRole('button', { name: 'แชร์' }));
    expect(window.location.hash).toBe('#/share'); expect(await screen.findByRole('heading', { name: 'แชร์ข้อมูลยา' })).toBeInTheDocument();
  });
  it('unreadable saved data: shows the problem, does not touch the data (SEC-2)', () => {
    window.location.hash = '#/'; const bad = '{broken'; const s = mem({ [STORAGE_KEY]: bad }); render(<App store={s} />);
    expect(screen.getByText('เปิดข้อมูลไม่ได้')).toBeInTheDocument(); expect(s.map.get(STORAGE_KEY)).toBe(bad);
  });
  it('old app data under medmate.v1 is ignored and untouched', () => {
    window.location.hash = '#/'; const old = JSON.stringify({ version: 1, persons: [{ id: 'x' }] }); const s = mem({ 'medmate.v1': old }); render(<App store={s} />);
    expect(screen.getByText('ยังไม่มีสมาชิก')).toBeInTheDocument(); expect(s.map.get('medmate.v1')).toBe(old);
  });
});
