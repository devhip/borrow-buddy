import { CONFIG_ERROR_MESSAGE, getSupabase } from './supabaseClient.js'

export const SESSION_EXPIRED_MESSAGE = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
const LOAD_FAILED_MESSAGE = 'โหลดรายการไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่'
const SAVE_FAILED_MESSAGE = 'บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่ ข้อมูลที่กรอกยังอยู่'

// แปลงชื่อฟิลด์ camelCase (ใช้ในแอป) เป็น snake_case (ตารางใน Supabase)
// ไม่ส่ง id และ owner_id: id สร้างโดยฐานข้อมูล owner_id ตั้งอัตโนมัติจาก auth.uid()
export function toRow(loan) {
  return {
    friend_name: loan.friendName,
    item_name: loan.itemName,
    borrowed_date: loan.borrowedDate,
    due_date: loan.dueDate,
    returned_date: loan.returnedDate ?? null,
  }
}

export function fromRow(row) {
  return {
    id: row.id,
    friendName: row.friend_name,
    itemName: row.item_name,
    borrowedDate: row.borrowed_date,
    dueDate: row.due_date,
    returnedDate: row.returned_date ?? null,
  }
}

// แปลง error ของ Supabase เป็นผลลัพธ์ที่แอปใช้ได้: ข้อความไทย และ sessionExpired เมื่อไม่มีสิทธิ์/เซสชันหมด
function failure(err, fallback) {
  if (err?.message === CONFIG_ERROR_MESSAGE) return { error: CONFIG_ERROR_MESSAGE }
  if (err?.status === 401 || err?.code === 'PGRST301') {
    return { error: SESSION_EXPIRED_MESSAGE, sessionExpired: true }
  }
  return { error: fallback }
}

// รันคำสั่ง Supabase หนึ่งครั้ง คืน { data } หรือ { error, sessionExpired? }
async function run(fallback, task) {
  try {
    const { data, error } = await task(getSupabase())
    if (error) return failure(error, fallback)
    return { data }
  } catch (err) {
    return failure(err, fallback)
  }
}

export async function fetchLoans() {
  const result = await run(LOAD_FAILED_MESSAGE, (db) =>
    db.from('loans').select('*').order('due_date', { ascending: true }),
  )
  if (result.error) return { ...result, loans: [] }
  return { loans: result.data.map(fromRow) }
}

export async function createLoan(loan) {
  const result = await run(SAVE_FAILED_MESSAGE, (db) =>
    db.from('loans').insert(toRow(loan)).select().single(),
  )
  if (result.error) return result
  return { loan: fromRow(result.data) }
}

// นำเข้าหลายรายการพร้อมกัน: ล้มเหลวทั้งชุดหรือสำเร็จทั้งชุด
export async function createLoans(loans) {
  if (loans.length === 0) return { loans: [] }
  const result = await run(SAVE_FAILED_MESSAGE, (db) =>
    db.from('loans').insert(loans.map(toRow)).select(),
  )
  if (result.error) return { ...result, loans: [] }
  return { loans: result.data.map(fromRow) }
}

export async function updateLoan(loan) {
  const result = await run(SAVE_FAILED_MESSAGE, (db) =>
    db.from('loans').update(toRow(loan)).eq('id', loan.id).select().single(),
  )
  if (result.error) return result
  return { loan: fromRow(result.data) }
}
