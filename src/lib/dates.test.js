import { describe, expect, it } from 'vitest';
import { daysBetween, formatThaiDate, todayString } from './dates.js';

describe('daysBetween', () => {
  it('วันเดียวกันเป็น 0', () => {
    expect(daysBetween('2026-10-13', '2026-10-13')).toBe(0);
  });
  it('ข้ามเดือน', () => {
    expect(daysBetween('2026-01-30', '2026-02-02')).toBe(3);
  });
  it('ข้ามปี', () => {
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
  });
  it('ติดลบเมื่อปลายทางอยู่ก่อน', () => {
    expect(daysBetween('2026-10-13', '2026-10-10')).toBe(-3);
  });
  it('ปีอธิกสุรทิน', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
  });
});

describe('formatThaiDate', () => {
  it('แสดงเป็น พ.ศ.', () => {
    expect(formatThaiDate('2026-10-13')).toBe('13 ต.ค. 2569');
  });
  it('วันที่หลักเดียวไม่เติมศูนย์', () => {
    expect(formatThaiDate('2026-01-05')).toBe('5 ม.ค. 2569');
  });
});

describe('todayString', () => {
  it('จัดรูปแบบ YYYY-MM-DD ตามเวลาท้องถิ่น', () => {
    expect(todayString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
