const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DAY_MS = 24 * 60 * 60 * 1000;

export const isDateString = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function todayString(now = new Date()) {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

function toUtcDay(str) {
  const [y, m, d] = str.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// จำนวนวันตามปฏิทินจาก a ถึง b (บวกเมื่อ b อยู่หลัง a) ไม่สนใจเวลา
export const daysBetween = (a, b) => Math.round((toUtcDay(b) - toUtcDay(a)) / DAY_MS);

// 2026-10-13 -> "13 ต.ค. 2569"
export function formatThaiDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}
