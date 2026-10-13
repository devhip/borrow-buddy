import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, exportLoans, loadLoans, parseImport, saveLoans } from './storage.js';

const sample = {
  id: 'a1',
  item: 'ร่ม',
  note: '',
  borrower: 'น้อง',
  lentDate: '2026-10-01',
  dueDate: '2026-10-05',
  returnedDate: null
};

const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v; }
  };
};

describe('storage', () => {
  it('บันทึกแล้วโหลดกลับมาได้ที่ key เดิม', () => {
    const s = fakeStorage();
    expect(saveLoans([sample], s)).toBe(true);
    expect(s.getItem(STORAGE_KEY)).toBe(JSON.stringify([sample]));
    expect(loadLoans(s)).toEqual([sample]);
  });
  it('ข้อมูลเสียหายโหลดเป็นอาร์เรย์ว่าง', () => {
    expect(loadLoans(fakeStorage({ [STORAGE_KEY]: '{oops' }))).toEqual([]);
  });
  it('กรองรายการที่ไม่ถูกต้องออก', () => {
    const s = fakeStorage({ [STORAGE_KEY]: JSON.stringify([sample, { id: 1 }]) });
    expect(loadLoans(s)).toEqual([sample]);
  });
  it('บันทึกไม่สำเร็จคืน false', () => {
    const broken = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect(saveLoans([sample], broken)).toBe(false);
  });
});

describe('parseImport', () => {
  it('นำเข้าไฟล์ที่ส่งออกมาได้', () => {
    expect(parseImport(exportLoans([sample]))).toEqual([sample]);
  });
  it('ปฏิเสธไฟล์ที่ไม่ใช่อาร์เรย์หรือมีรายการเสีย', () => {
    expect(() => parseImport('{"a":1}')).toThrow();
    expect(() => parseImport(JSON.stringify([sample, { id: 'x' }]))).toThrow();
    expect(() => parseImport('ไม่ใช่ json')).toThrow();
  });
});
