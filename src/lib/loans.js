import { daysBetween, isDateString } from './dates.js';

export const isReturned = (loan) => Boolean(loan.returnedDate);

// จำนวนวันที่เกินกำหนด (0 ถ้าคืนแล้วหรือยังไม่เลยกำหนด)
export const overdueDays = (loan, today) =>
  isReturned(loan) ? 0 : Math.max(0, daysBetween(loan.dueDate, today));

export function isValidLoan(l) {
  return Boolean(
    l && typeof l === 'object' &&
    typeof l.id === 'string' &&
    typeof l.item === 'string' && l.item.trim() !== '' &&
    typeof l.borrower === 'string' && l.borrower.trim() !== '' &&
    (l.note === undefined || typeof l.note === 'string') &&
    isDateString(l.lentDate) && isDateString(l.dueDate) &&
    (l.returnedDate === null || l.returnedDate === undefined || isDateString(l.returnedDate))
  );
}

// คืนค่า object ข้อผิดพลาดต่อช่อง (ว่าง = ผ่าน)
export function validateLoan(values) {
  const errors = {};
  if (!values.item) errors.item = 'กรุณากรอกชื่อของ';
  if (!values.borrower) errors.borrower = 'กรุณากรอกชื่อผู้ยืม';
  if (!isDateString(values.lentDate)) errors.lentDate = 'กรุณาเลือกวันที่ยืม';
  if (!isDateString(values.dueDate)) errors.dueDate = 'กรุณาเลือกวันกำหนดคืน';
  else if (isDateString(values.lentDate) && values.dueDate < values.lentDate) {
    errors.dueDate = 'วันกำหนดคืนต้องไม่ก่อนวันที่ยืม';
  }
  return errors;
}

// กรองตามแท็บและคำค้น แล้วเรียงลำดับ
export function visibleLoans(loans, tab, query, today) {
  const q = query.trim().toLowerCase();
  const wantReturned = tab === 'history';
  const matches = loans.filter((l) => {
    if (isReturned(l) !== wantReturned) return false;
    if (!q) return true;
    return (
      l.item.toLowerCase().includes(q) ||
      l.borrower.toLowerCase().includes(q) ||
      (l.note || '').toLowerCase().includes(q)
    );
  });

  if (wantReturned) {
    return matches.sort((a, b) => b.returnedDate.localeCompare(a.returnedDate));
  }
  return matches.sort((a, b) => {
    const oa = overdueDays(a, today) > 0 ? 0 : 1;
    const ob = overdueDays(b, today) > 0 ? 0 : 1;
    return oa - ob || a.dueDate.localeCompare(b.dueDate);
  });
}
