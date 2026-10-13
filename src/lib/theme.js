export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const THEME_STORAGE_KEY = 'borrow-buddy:theme'

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

// ค่าที่บันทึกไว้มาก่อน ถ้าไม่มีหรือไม่ถูกต้องใช้ค่าตามระบบ (prefersDark)
// เรียกโดยไม่ส่ง stored จะอ่านจาก localStorage เอง
export function getInitialTheme(stored = readStoredTheme(), prefersDark = false) {
  if (stored === THEME.LIGHT || stored === THEME.DARK) return stored
  return prefersDark ? THEME.DARK : THEME.LIGHT
}

// บันทึกไม่สำเร็จ (เช่น storage ถูกปิด) ก็ยังใช้ธีมในหน้าปัจจุบันได้
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ไม่ต้องทำอะไร ธีมยังใช้ได้จนกว่าจะปิดหน้า
  }
}

export function toggleTheme(theme) {
  return theme === THEME.DARK ? THEME.LIGHT : THEME.DARK
}
