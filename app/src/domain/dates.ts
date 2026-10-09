// Calendar dates in Asia/Bangkok (DS-14). `now` is a parameter so tests never depend on the clock.
import { dow, parseDate } from './calc';

/** Today's calendar date in Thailand as 'YYYY-MM-DD', whatever timezone the phone is set to. */
export const todayBangkok = (now: Date = new Date()): string => new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10);

const DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
/** 'พฤ. 8 ต.ค. 2569' (Buddhist year) */
export const thaiDateLabel = (iso: string): string => { const { y, m, d } = parseDate(iso); return `${DAYS_SHORT[dow(iso)]} ${d} ${MONTHS_SHORT[m - 1]} ${y + 543}`; };
