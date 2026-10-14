import { describe, expect, it } from 'vitest'
import { formatThaiDate, toIsoDate } from './dateFormat.js'

describe('formatThaiDate', () => {
  it('แปลง YYYY-MM-DD (ค.ศ.) เป็น พ.ศ. แบบ "24 ก.ย. 2569"', () => {
    expect(formatThaiDate('2026-09-24')).toBe('24 ก.ย. 2569')
  })

  it('ตัดเลข 0 นำหน้าของวันออก', () => {
    expect(formatThaiDate('2026-01-05')).toBe('5 ม.ค. 2569')
  })

  it('ครอบคลุมทุกเดือน', () => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    months.forEach((name, i) => {
      const mm = String(i + 1).padStart(2, '0')
      expect(formatThaiDate(`2026-${mm}-15`)).toBe(`15 ${name} 2569`)
    })
  })

  it('รูปแบบผิดหรือค่าว่างคืนสตริงว่าง', () => {
    expect(formatThaiDate('24/09/2026')).toBe('')
    expect(formatThaiDate('2026-13-01')).toBe('')
    expect(formatThaiDate('')).toBe('')
    expect(formatThaiDate(null)).toBe('')
    expect(formatThaiDate(undefined)).toBe('')
  })
})

describe('toIsoDate', () => {
  it('แปลง Date เป็น YYYY-MM-DD ตามวันที่ท้องถิ่น', () => {
    expect(toIsoDate(new Date(2026, 8, 24))).toBe('2026-09-24')
  })

  it('เติมเลข 0 ให้เดือนและวันที่เป็นหลักเดียว', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('ผลลัพธ์กลับมาแปลงเป็น พ.ศ. ได้ถูกต้อง', () => {
    expect(formatThaiDate(toIsoDate(new Date(2026, 8, 24)))).toBe('24 ก.ย. 2569')
  })
})
