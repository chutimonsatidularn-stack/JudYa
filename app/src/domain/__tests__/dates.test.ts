import { describe, expect, it } from 'vitest';
import { todayBangkok, thaiDateLabel } from '../dates';

describe('dates (DS-14)', () => {
  it('uses the Thai calendar day at any device timezone', () => {
    expect(todayBangkok(new Date('2026-10-08T16:59:59Z'))).toBe('2026-10-08'); // 23:59 in Bangkok
    expect(todayBangkok(new Date('2026-10-08T17:00:00Z'))).toBe('2026-10-09'); // midnight in Bangkok
  });
  it('writes the label with the Buddhist year', () => {
    expect(thaiDateLabel('2026-10-08')).toBe('พฤ. 8 ต.ค. 2569');
    expect(thaiDateLabel('2027-01-01')).toBe('ศ. 1 ม.ค. 2570');
  });
});
