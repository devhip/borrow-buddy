import { validateLoan } from './loanRules.js'
import { STORAGE_KEY } from './storage.js'

// คีย์ที่บอกว่าเจ้าของตัดสินใจเรื่องการย้ายข้อมูลเดิมแล้ว (นำเข้าหรือไม่นำเข้า)
export const MIGRATED_KEY = 'borrow-buddy:legacy-imported'

const BROKEN_WARNING = 'ข้อมูลเดิมในเบราว์เซอร์นี้อ่านไม่ได้ จึงไม่นำเข้า และข้อมูลเดิมยังอยู่ครบ'

export function isLegacyImported(storage = globalThis.localStorage) {
  try {
    return storage.getItem(MIGRATED_KEY) === '1'
  } catch {
    return false
  }
}

export function markLegacyImported(storage = globalThis.localStorage) {
  try {
    storage.setItem(MIGRATED_KEY, '1')
  } catch {
    // ถ้าบันทึกไม่ได้ แผงจะถามอีกครั้งตอนเปิดหน้าใหม่ ไม่ทำให้แอปพัง
  }
}

// อ่าน Loan เวอร์ชัน 1 (ฟิลด์ item, borrower, lentDate) แล้วแปลงเป็นรูปแบบปัจจุบัน
// คืน { loans, skipped, warning }: loans = ที่ผ่านการตรวจ, skipped = รายการที่ข้าม พร้อมเหตุผลภาษาไทย
export function readLegacyLoans(storage = globalThis.localStorage) {
  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { loans: [], skipped: [], warning: BROKEN_WARNING }
  }
  if (!raw) return { loans: [], skipped: [], warning: null }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return { loans: [], skipped: [], warning: BROKEN_WARNING }
  }
  if (!Array.isArray(data)) return { loans: [], skipped: [], warning: BROKEN_WARNING }

  const loans = []
  const skipped = []
  data.forEach((old, index) => {
    const loan = {
      friendName: old?.borrower ?? '',
      itemName: old?.item ?? '',
      borrowedDate: old?.lentDate ?? '',
      dueDate: old?.dueDate ?? '',
      returnedDate: old?.returnedDate || null,
    }
    const errors = validateLoan(loan)
    if (errors.length > 0) {
      skipped.push({ index, label: `${loan.itemName || '-'} (${loan.friendName || '-'})`, errors })
    } else {
      loans.push(loan)
    }
  })
  return { loans, skipped, warning: null }
}
