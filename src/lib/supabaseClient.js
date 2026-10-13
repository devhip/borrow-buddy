import { createClient } from '@supabase/supabase-js'

export const CONFIG_ERROR_MESSAGE =
  'ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase กรุณาตั้ง VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY ในไฟล์ .env'

let client = null

// สร้าง client ครั้งเดียวจาก env ถ้า env ขาดจะ throw ข้อความภาษาไทย
export function getSupabase() {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error(CONFIG_ERROR_MESSAGE)
  client = createClient(url, key)
  return client
}
