# Design: ย้าย Borrow Buddy ไป React + Vite

สถานะ: แผนก่อนปรับปรุงรอบใหม่ (ยังไม่ลงมือย้าย)

## 1. เป้าหมายและขอบเขต
- เปลี่ยนเทคโนโลยีจาก vanilla JS (`index.html`, `style.css`, `app.js`) เป็น React + Vite โดย**พฤติกรรมเหมือนเดิมทุกอย่าง**
- ขอบเขตฟีเจอร์ยึด `borrow-buddy/CONTEXT.md` ไม่เพิ่มฟีเจอร์ใหม่ (ไม่ทำ dark mode, sync แท็บ, undo toast)
- สิ่งเดียวที่เพิ่มในรอบนี้คือการทดสอบกฎโดเมนด้วย Vitest

## 2. สแตก
| ส่วน | เลือกใช้ |
|---|---|
| ภาษา | JavaScript เท่านั้น (ไม่ใช้ TypeScript) |
| UI | React + Vite |
| CSS | Tailwind CSS ผ่านปลั๊กอิน `@tailwindcss/vite` |
| State | `useState` ใน `App` ส่งต่อด้วย props (ไม่ใช้ Context/Redux/Zustand) |
| ทดสอบ | Vitest |
| เก็บข้อมูล | localStorage เหมือนเดิม |

## 3. โครงสร้างไฟล์ (ใน `borrow-buddy/`)
```
borrow-buddy/
├─ CONTEXT.md            (คงเดิม)
├─ index.html            (ของ Vite)
├─ package.json, vite.config.js
└─ src/
   ├─ main.jsx, App.jsx, index.css
   ├─ components/  Tabs, SearchBar, LoanList, LoanCard, LoanDialog, BackupBar (.jsx)
   └─ lib/         dates.js, loans.js, storage.js  + *.test.js
```
คอมโพเนนต์เน้นแสดงผล ส่วนกฎโดเมนทั้งหมดเป็นฟังก์ชันบริสุทธิ์ใน `src/lib/` เพื่อทดสอบง่าย

## 4. โมเดลข้อมูล
`{ id, item, note, borrower, lentDate, dueDate, returnedDate }` วันที่เป็นสตริง `YYYY-MM-DD` `returnedDate` เป็น `null` เมื่อยังไม่คืน
เก็บที่ key `borrow-buddy:loans` **เหมือนเดิมทุกประการ** เพื่อให้ข้อมูลที่มีอยู่ไม่หาย

## 5. State และการไหลของข้อมูล
- `App` ถือ `loans`, `tab` (`outstanding` | `history`), `query`
- ฟังก์ชันใน `App`: `addLoan`, `editLoan`, `removeLoan` (ยืนยันก่อนลบ), `markReturned`, `undoReturn` ส่งลง `LoanList`/`LoanCard`/`LoanDialog` ผ่าน props
- บันทึก localStorage ด้วย `useEffect` เมื่อ `loans` เปลี่ยน อ่านครั้งเดียวตอนเริ่ม (ครอบ try/catch)

## 6. ตรรกะที่ย้ายจาก `app.js` (แยกเป็นฟังก์ชันบริสุทธิ์)
| ไฟล์ใหม่ | ฟังก์ชัน |
|---|---|
| `dates.js` | `todayString`, `daysBetween` (นับวันตามปฏิทิน ไม่สนเวลา), `formatThaiDate` (พ.ศ.) |
| `loans.js` | `isValidLoan`, `validateLoan` (วันกำหนดคืนต้องไม่ก่อนวันที่ยืม), `overdueDays`, `visibleLoans` (กรอง/ค้นหา/เรียง: เกินกำหนดก่อน แล้วตามวันกำหนดคืน; ประวัติเรียงตามวันที่คืนล่าสุด) |
| `storage.js` | `loadLoans`, `saveLoans`, `exportLoans`, `parseImport` |

## 7. ดีไซน์ UI
- หน้าตาเหมือนเดิม: หน้าเดียว 2 แท็บ ปุ่ม "+ เพิ่มรายการยืม" ช่องค้นหา และแถบสำรองข้อมูลด้านล่าง
- ป้ายสถานะ: เกินกำหนด = แดง, ใกล้ครบ (≤ 3 วัน) = เหลือง, ปกติ/คืนแล้ว = เขียว
- ฟอร์มเพิ่ม/แก้ไขใช้ `<dialog>` เดิม ข้อความและวันที่เป็นภาษาไทย พ.ศ.
- ใช้ Tailwind utility class แทน `style.css`

## 8. แผนทดสอบ (Vitest)
- `daysBetween`/`overdueDays`: ข้ามเดือน ข้ามปี วันนี้พอดี ไม่ถือว่าเกินกำหนด
- `formatThaiDate`: เช่น `2026-10-13` → `13 ต.ค. 2569`
- `visibleLoans`: เกินกำหนดอยู่บนสุด, ค้นหาทั้งชื่อผู้ยืม/ของ/หมายเหตุ, ประวัติเรียงตามวันที่คืน
- `validateLoan`: ขาดชื่อของ/ผู้ยืม, วันกำหนดคืนก่อนวันที่ยืม
- `parseImport`: ไฟล์ผิดรูปแบบต้องถูกปฏิเสธ

## 9. ขั้นตอนย้าย
1. สร้าง Vite + React + Tailwind + Vitest ใน `borrow-buddy/`
2. ลบ `index.html`, `style.css`, `app.js` เดิม (ผู้ใช้อนุญาตแล้ว ลบเฉพาะ 3 ไฟล์นี้ ห้ามแตะ `CONTEXT.md`)
3. ย้ายตรรกะเป็น `src/lib/` พร้อมเขียนเทสต์
4. สร้างคอมโพเนนต์และเชื่อมกับ `App`
5. ตรวจเทียบพฤติกรรมเดิมตาม `CONTEXT.md` ทีละข้อ

## 10. ความเสี่ยง
- เปลี่ยน key หรือรูปแบบข้อมูลใน localStorage จะทำให้ข้อมูลเดิมหาย → ใช้ค่าเดิม
- Tailwind v4 กับ Vite ต้องใช้เวอร์ชันที่เข้ากัน → ตรวจตอนติดตั้ง
- ลบไฟล์เก่าแล้วย้อนกลับยาก (ไม่มี git) → แนะนำสำรองโฟลเดอร์ก่อนลงมือ
