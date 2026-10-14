import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ db: null }))

vi.mock('./supabaseClient.js', () => ({
  CONFIG_ERROR_MESSAGE: 'CONFIG_MISSING',
  getSupabase: () => {
    if (!state.db) throw new Error('CONFIG_MISSING')
    return state.db
  },
}))

import * as repo from './loanRepo.js'

// จำลอง query builder ของ Supabase: ทุกเมธอดคืนตัวเอง และ await แล้วได้ผลลัพธ์ที่กำหนด
function query(result, calls) {
  const q = {
    select: (...a) => (calls.push(['select', ...a]), q),
    insert: (...a) => (calls.push(['insert', ...a]), q),
    update: (...a) => (calls.push(['update', ...a]), q),
    eq: (...a) => (calls.push(['eq', ...a]), q),
    order: (...a) => (calls.push(['order', ...a]), q),
    single: () => (calls.push(['single']), q),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  return q
}

function fakeDb(result) {
  const calls = []
  return {
    calls,
    from: (table) => (calls.push(['from', table]), query(result, calls)),
  }
}

const sampleLoan = {
  id: 'L1',
  friendName: 'มิ้นท์',
  itemName: 'ร่ม',
  borrowedDate: '2026-10-01',
  dueDate: '2026-10-10',
  returnedDate: null,
}

const sampleRow = {
  id: 'L1',
  friend_name: 'มิ้นท์',
  item_name: 'ร่ม',
  borrowed_date: '2026-10-01',
  due_date: '2026-10-10',
  returned_date: null,
}

beforeEach(() => {
  state.db = null
})

describe('toRow / fromRow', () => {
  it('แปลง camelCase เป็น snake_case และไม่ส่ง id กับ owner_id', () => {
    const row = repo.toRow({ ...sampleLoan, ownerId: 'U1' })
    expect(row).toEqual({
      friend_name: 'มิ้นท์',
      item_name: 'ร่ม',
      borrowed_date: '2026-10-01',
      due_date: '2026-10-10',
      returned_date: null,
    })
    expect(row).not.toHaveProperty('id')
    expect(row).not.toHaveProperty('owner_id')
  })

  it('returnedDate ที่ไม่ได้ส่งมาจะเป็น null', () => {
    const { returnedDate: _returnedDate, ...rest } = sampleLoan
    expect(repo.toRow(rest).returned_date).toBeNull()
  })

  it('แปลงกลับเป็น camelCase และ returned_date ว่างเป็น null', () => {
    expect(repo.fromRow(sampleRow)).toEqual(sampleLoan)
    expect(repo.fromRow({ ...sampleRow, returned_date: undefined }).returnedDate).toBeNull()
  })
})

describe('fetchLoans', () => {
  it('สำเร็จ: คืนรายการที่แปลงแล้วและเรียงตามวันกำหนดคืน', async () => {
    const db = fakeDb({ data: [sampleRow], error: null })
    state.db = db
    const result = await repo.fetchLoans()
    expect(result.loans).toEqual([sampleLoan])
    expect(result.error).toBeUndefined()
    expect(db.calls).toContainEqual(['order', 'due_date', { ascending: true }])
  })

  it('ออฟไลน์ (fetch ล้มเหลว): คืนข้อความไทย ไม่ใช่เซสชันหมดอายุ', async () => {
    state.db = { from: () => { throw new TypeError('Failed to fetch') } }
    const result = await repo.fetchLoans()
    expect(result.loans).toEqual([])
    expect(result.error).toMatch(/โหลดรายการไม่สำเร็จ/)
    expect(result.sessionExpired).toBeUndefined()
  })

  it('status 401 เป็นเซสชันหมดอายุ', async () => {
    state.db = fakeDb({ data: null, error: { status: 401, message: 'JWT expired' } })
    const result = await repo.fetchLoans()
    expect(result.sessionExpired).toBe(true)
    expect(result.error).toBe(repo.SESSION_EXPIRED_MESSAGE)
  })

  it('รหัส PGRST301 เป็นเซสชันหมดอายุ', async () => {
    state.db = fakeDb({ data: null, error: { code: 'PGRST301', message: 'denied' } })
    const result = await repo.fetchLoans()
    expect(result.sessionExpired).toBe(true)
  })

  it('ยังไม่ได้ตั้งค่า env: คืนข้อความตั้งค่า ไม่พัง', async () => {
    state.db = null
    const result = await repo.fetchLoans()
    expect(result.error).toBe('CONFIG_MISSING')
    expect(result.loans).toEqual([])
  })
})

describe('createLoan / updateLoan', () => {
  it('createLoan สำเร็จ: คืนรายการที่สร้าง', async () => {
    state.db = fakeDb({ data: sampleRow, error: null })
    const result = await repo.createLoan(sampleLoan)
    expect(result.loan).toEqual(sampleLoan)
  })

  it('createLoan ออฟไลน์: ไม่คืนรายการและบอกว่าข้อมูลที่กรอกยังอยู่', async () => {
    state.db = { from: () => { throw new TypeError('Failed to fetch') } }
    const result = await repo.createLoan(sampleLoan)
    expect(result.loan).toBeUndefined()
    expect(result.error).toMatch(/ข้อมูลที่กรอกยังอยู่/)
  })

  it('updateLoan ส่ง eq(id) และคืนรายการที่แก้แล้ว', async () => {
    const db = fakeDb({ data: { ...sampleRow, returned_date: '2026-10-05' }, error: null })
    state.db = db
    const result = await repo.updateLoan({ ...sampleLoan, returnedDate: '2026-10-05' })
    expect(db.calls).toContainEqual(['eq', 'id', 'L1'])
    expect(result.loan.returnedDate).toBe('2026-10-05')
  })

  it('updateLoan เจอ 401: แจ้งเซสชันหมดอายุ', async () => {
    state.db = fakeDb({ data: null, error: { status: 401 } })
    const result = await repo.updateLoan(sampleLoan)
    expect(result.sessionExpired).toBe(true)
  })
})

describe('ข้อจำกัดของกติกา', () => {
  it('ไม่มีฟังก์ชันลบ Loan ใน loanRepo', () => {
    expect(Object.keys(repo)).not.toContain('deleteLoan')
    expect(Object.keys(repo).some((k) => /delete|remove/i.test(k))).toBe(false)
  })
})
