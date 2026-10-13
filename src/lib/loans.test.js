import { describe, expect, it } from 'vitest';
import { isValidLoan, overdueDays, validateLoan, visibleLoans } from './loans.js';

const TODAY = '2026-10-13';
const loan = (over = {}) => ({
  id: crypto.randomUUID(),
  item: 'หนังสือ',
  note: '',
  borrower: 'สมชาย',
  lentDate: '2026-10-01',
  dueDate: '2026-10-20',
  returnedDate: null,
  ...over
});

describe('overdueDays', () => {
  it('ครบกำหนดวันนี้ยังไม่ถือว่าเกินกำหนด', () => {
    expect(overdueDays(loan({ dueDate: TODAY }), TODAY)).toBe(0);
  });
  it('เลยกำหนด 3 วัน', () => {
    expect(overdueDays(loan({ dueDate: '2026-10-10' }), TODAY)).toBe(3);
  });
  it('คืนแล้วไม่เกินกำหนด', () => {
    expect(overdueDays(loan({ dueDate: '2026-10-10', returnedDate: '2026-10-11' }), TODAY)).toBe(0);
  });
});

describe('validateLoan', () => {
  const ok = { item: 'ร่ม', borrower: 'น้อง', lentDate: '2026-10-01', dueDate: '2026-10-05' };
  it('ข้อมูลถูกต้องไม่มีข้อผิดพลาด', () => {
    expect(validateLoan(ok)).toEqual({});
  });
  it('ขาดชื่อของและผู้ยืม', () => {
    const e = validateLoan({ ...ok, item: '', borrower: '' });
    expect(e.item).toBeTruthy();
    expect(e.borrower).toBeTruthy();
  });
  it('วันกำหนดคืนก่อนวันที่ยืมไม่ผ่าน', () => {
    expect(validateLoan({ ...ok, dueDate: '2026-09-30' }).dueDate).toBeTruthy();
  });
  it('วันกำหนดคืนเท่ากับวันที่ยืมผ่าน', () => {
    expect(validateLoan({ ...ok, dueDate: '2026-10-01' })).toEqual({});
  });
  it('ไม่กรอกวัน', () => {
    const e = validateLoan({ ...ok, lentDate: '', dueDate: '' });
    expect(e.lentDate).toBeTruthy();
    expect(e.dueDate).toBeTruthy();
  });
});

describe('visibleLoans', () => {
  const late = loan({ item: 'A', dueDate: '2026-10-05' });
  const soon = loan({ item: 'B', dueDate: '2026-10-14' });
  const later = loan({ item: 'C', dueDate: '2026-10-30' });
  const doneOld = loan({ item: 'D', returnedDate: '2026-10-02' });
  const doneNew = loan({ item: 'E', returnedDate: '2026-10-12' });
  const all = [later, doneOld, soon, late, doneNew];

  it('แท็บยังไม่คืนเรียงเกินกำหนดก่อน แล้วตามวันกำหนดคืน', () => {
    expect(visibleLoans(all, 'outstanding', '', TODAY).map((l) => l.item)).toEqual(['A', 'B', 'C']);
  });
  it('แท็บประวัติเรียงตามวันที่คืนล่าสุดก่อน', () => {
    expect(visibleLoans(all, 'history', '', TODAY).map((l) => l.item)).toEqual(['E', 'D']);
  });
  it('ค้นหาตามชื่อผู้ยืม ชื่อของ และหมายเหตุ (ไม่สนตัวพิมพ์)', () => {
    const list = [loan({ item: 'Charger', borrower: 'Anan' }), loan({ item: 'ร่ม', note: 'สีฟ้า', borrower: 'บี' })];
    expect(visibleLoans(list, 'outstanding', 'charg', TODAY)).toHaveLength(1);
    expect(visibleLoans(list, 'outstanding', 'ANAN', TODAY)).toHaveLength(1);
    expect(visibleLoans(list, 'outstanding', 'สีฟ้า', TODAY)).toHaveLength(1);
    expect(visibleLoans(list, 'outstanding', 'ไม่มี', TODAY)).toHaveLength(0);
  });
  it('ไม่แก้ไขอาร์เรย์ต้นฉบับ', () => {
    const copy = [...all];
    visibleLoans(all, 'outstanding', '', TODAY);
    expect(all).toEqual(copy);
  });
});

describe('isValidLoan', () => {
  it('ยอมรับรายการที่ถูกต้อง', () => {
    expect(isValidLoan(loan())).toBe(true);
  });
  it('ปฏิเสธข้อมูลผิดรูปแบบ', () => {
    expect(isValidLoan(null)).toBe(false);
    expect(isValidLoan(loan({ item: '  ' }))).toBe(false);
    expect(isValidLoan(loan({ dueDate: 'พรุ่งนี้' }))).toBe(false);
    expect(isValidLoan(loan({ id: 5 }))).toBe(false);
  });
});
