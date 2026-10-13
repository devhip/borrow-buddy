import { STATUS, STATUS_LABEL } from './loanRules.js'

// แท็บพิเศษสำหรับฟอร์มเพิ่ม/แก้ไขการยืม
export const ADD_TAB = 'add'

const TAB_ORDER = [STATUS.OVERDUE, STATUS.OUTSTANDING, STATUS.RETURNED]

// แท็บแรกที่มี Loan ตามลำดับ เกินกำหนด → ยังไม่คืน → คืนแล้ว ถ้าไม่มีเลยใช้ ยังไม่คืน
export function pickDefaultTab(groups) {
  return TAB_ORDER.find((status) => groups[status].length > 0) ?? STATUS.OUTSTANDING
}

const EMPTY_MESSAGE = {
  [STATUS.OVERDUE]: 'ไม่มีรายการเกินกำหนด',
  [STATUS.OUTSTANDING]: 'ไม่มีรายการที่ยังไม่คืน',
  [STATUS.RETURNED]: 'ยังไม่มีรายการที่คืนแล้ว',
}

// ข้อความเมื่อแท็บว่าง (ถ้ากำลังค้นหาอยู่ใช้ข้อความบอกว่าไม่พบ)
export function getEmptyMessage(tab, isSearching) {
  if (isSearching) return 'ไม่พบรายการที่ตรงกับคำค้นหา'
  return EMPTY_MESSAGE[tab] ?? `ไม่มีรายการ${STATUS_LABEL[tab] ?? ''}`
}
