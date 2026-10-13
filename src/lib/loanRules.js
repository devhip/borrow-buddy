import { daysBetween, isDateString } from './dates.js'

// สถานะของ Loan (ค่าเดียวกับ class ใน App.css)
export const STATUS = {
  OVERDUE: 'overdue',
  OUTSTANDING: 'outstanding',
  RETURNED: 'returned',
}

export const STATUS_LABEL = {
  [STATUS.OVERDUE]: 'เกินกำหนด',
  [STATUS.OUTSTANDING]: 'ยังไม่คืน',
  [STATUS.RETURNED]: 'คืนแล้ว',
}

// today เป็นสตริง 'YYYY-MM-DD' ที่ส่งเข้ามาเสมอ ฟังก์ชันนี้ไม่เรียกเวลาจริงข้างใน
export function getLoanStatus(loan, today) {
  if (loan.returnedDate) return STATUS.RETURNED
  return loan.dueDate < today ? STATUS.OVERDUE : STATUS.OUTSTANDING
}

// จำนวนวันที่เกินกำหนด (0 ถ้าคืนแล้วหรือยังไม่เลยกำหนด)
export function getDaysOverdue(loan, today) {
  if (getLoanStatus(loan, today) !== STATUS.OVERDUE) return 0
  return daysBetween(loan.dueDate, today)
}

// คืนรายการข้อความผิดพลาดภาษาไทย (อาร์เรย์ว่าง = ผ่าน)
export function validateLoan(loan) {
  const errors = []
  if (!loan.friendName?.trim()) errors.push('กรุณากรอกชื่อเพื่อน')
  if (!loan.itemName?.trim()) errors.push('กรุณากรอกชื่อของ')
  if (!isDateString(loan.borrowedDate)) errors.push('กรุณาเลือกวันที่ยืม')
  if (!isDateString(loan.dueDate)) {
    errors.push('กรุณาเลือกวันกำหนดคืน')
  } else if (isDateString(loan.borrowedDate) && loan.dueDate < loan.borrowedDate) {
    errors.push('วันกำหนดคืนต้องไม่ก่อนวันที่ยืม')
  }
  if (loan.returnedDate != null) {
    if (!isDateString(loan.returnedDate)) {
      errors.push('วันที่คืนจริงไม่ถูกต้อง')
    } else if (isDateString(loan.borrowedDate) && loan.returnedDate < loan.borrowedDate) {
      errors.push('วันที่คืนจริงต้องไม่ก่อนวันที่ยืม')
    }
  }
  return errors
}

// จัดกลุ่ม เกินกำหนด → ยังไม่คืน → คืนแล้ว และเรียงตามกำหนดคืนใกล้สุดในแต่ละกลุ่ม
export function groupLoans(loans, today) {
  const groups = { [STATUS.OVERDUE]: [], [STATUS.OUTSTANDING]: [], [STATUS.RETURNED]: [] }
  for (const loan of loans) groups[getLoanStatus(loan, today)].push(loan)
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }
  return groups
}

// กรองตามชื่อเพื่อน (ไม่สนตัวพิมพ์เล็ก-ใหญ่ และตัดช่องว่างหัวท้าย)
export function filterLoansByFriend(loans, query) {
  const q = query.trim().toLowerCase()
  if (!q) return loans
  return loans.filter((loan) => loan.friendName.toLowerCase().includes(q))
}

// กดคืนแล้ว: ค่าเริ่มต้นเป็นวันนี้ และแก้ย้อนหลังได้ด้วย returnedDate
export function markReturned(loan, today, returnedDate = today) {
  return { ...loan, returnedDate }
}

export function unmarkReturned(loan) {
  return { ...loan, returnedDate: null }
}
