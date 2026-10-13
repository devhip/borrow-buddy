import { isValidLoan } from './loans.js';

export const STORAGE_KEY = 'borrow-buddy:loans';

export function loadLoans(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter(isValidLoan) : [];
  } catch {
    return [];
  }
}

// คืน true เมื่อบันทึกสำเร็จ
export function saveLoans(loans, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(loans));
    return true;
  } catch {
    return false;
  }
}

export const exportLoans = (loans) => JSON.stringify(loans, null, 2);

// แปลงข้อความ JSON ที่นำเข้า ถ้าไม่ถูกต้องจะ throw
export function parseImport(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data) || !data.every(isValidLoan)) throw new Error('invalid backup file');
  return data.map((l) => ({ ...l, note: l.note || '', returnedDate: l.returnedDate || null }));
}
