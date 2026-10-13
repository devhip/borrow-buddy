# Design: Borrow Buddy (React + Vite)

สถานะ: ย้ายเสร็จและปรับตาม Tasks.md แล้ว (เทสต์ 28 เคสผ่าน, build และ preview ตอบกลับปกติ) เหลือให้ผู้ใช้ตรวจด้วยมือในเบราว์เซอร์ (T1/T2)

## 1. เป้าหมายและขอบเขต
- เปลี่ยนจาก vanilla JS เป็น React + Vite โดย**พฤติกรรมเหมือนเดิมทุกอย่าง**
- ขอบเขตฟีเจอร์ยึด `borrow-buddy/CONTEXT.md` ไม่เพิ่มฟีเจอร์ใหม่ (ไม่ทำ dark mode, sync แท็บ, undo toast)
- สิ่งที่เพิ่มในรอบนี้มีอย่างเดียวคือทดสอบกฎโดเมนด้วย Vitest

## 2. สแตก
| ส่วน | เลือกใช้ |
|---|---|
| ภาษา | JavaScript เท่านั้น (ไม่ใช้ TypeScript) |
| UI | React 19 + Vite 8 |
| CSS | Tailwind CSS 4 ผ่านปลั๊กอิน `@tailwindcss/vite` |
| State | `useState` ใน `App` ส่งต่อด้วย props (ไม่ใช้ Context/Redux/Zustand) |
| ทดสอบ | Vitest 5 (`environment: node`) |
| เก็บข้อมูล | localStorage |

## 3. โครงสร้างไฟล์ (`borrow-buddy/`)
```
borrow-buddy/
├─ CONTEXT.md                 ขอบเขตและศัพท์ (ไม่แก้)
├─ index.html, package.json, vite.config.js
└─ src/
   ├─ main.jsx, App.jsx, index.css
   ├─ components/  Tabs, SearchBar, LoanList, LoanCard, LoanDialog, BackupBar (.jsx)
   └─ lib/         dates.js, loans.js, storage.js  + dates/loans/storage .test.js
```
คอมโพเนนต์ทำหน้าที่แสดงผล ส่วนกฎโดเมนทั้งหมดเป็นฟังก์ชันบริสุทธิ์ใน `src/lib/` (รับ `today` เป็นพารามิเตอร์ เพื่อให้ทดสอบได้โดยไม่ต้องพึ่งเวลาจริง)

## 4. โมเดลข้อมูล
`{ id, item, note, borrower, lentDate, dueDate, returnedDate }`
- วันที่เป็นสตริง `YYYY-MM-DD` และ `returnedDate` เป็น `null` เมื่อยังไม่คืน
- เก็บที่ key `borrow-buddy:loans` เหมือนเวอร์ชันเดิมทุกประการ ข้อมูลที่มีอยู่จึงไม่หาย

## 5. State และการไหลของข้อมูล
- `App` ถือ `loans`, `tab` (`outstanding` | `history`), `query` และ `dialogLoan`
  - `dialogLoan`: `undefined` = ปิด, `null` = เพิ่มใหม่, อ็อบเจกต์ = แก้ไขรายการนั้น
- ฟังก์ชันใน `App`: `saveDialog` (เพิ่ม/แก้ไข), `removeLoan` (ยืนยันก่อนลบ), `markReturned`, `undoReturn`, `importBackup`, `exportBackup` ส่งลงคอมโพเนนต์ผ่าน props
- `today` มาจาก hook `useToday` ใน `App.jsx` คำนวณใหม่ทุกนาทีและเมื่อกลับมาโฟกัสหน้า เพื่อให้สถานะเกินกำหนดถูกต้องเมื่อเปิดหน้าทิ้งข้ามเที่ยงคืน
- โหลด localStorage ครั้งเดียวตอนเริ่ม และบันทึกด้วย `useEffect` เมื่อ `loans` เปลี่ยน ถ้าบันทึกไม่สำเร็จจะแจ้งเตือนให้ส่งออกไฟล์สำรอง
- `LoanDialog` ได้ `key` ตามรายการ เพื่อให้ฟอร์มรีเซ็ตทุกครั้งที่เปิด

## 6. ตรรกะใน `src/lib/`
| ไฟล์ | ฟังก์ชัน |
|---|---|
| `dates.js` | `isDateString`, `todayString`, `daysBetween` (นับวันตามปฏิทิน ไม่สนเวลา), `formatThaiDate` (พ.ศ.) |
| `loans.js` | `isReturned`, `overdueDays`, `isValidLoan`, `validateLoan` (วันกำหนดคืนต้องไม่ก่อนวันที่ยืม), `visibleLoans(loans, tab, query, today)` |
| `storage.js` | `loadLoans`, `saveLoans` (คืน true/false), `exportLoans`, `parseImport` (ไฟล์ผิดรูปแบบจะ throw) |

กฎการเรียง: แท็บ "ยังไม่คืน" เกินกำหนดก่อน แล้วตามวันกำหนดคืนใกล้สุด / แท็บ "ประวัติ" ตามวันที่คืนล่าสุดก่อน การค้นหาครอบคลุมชื่อผู้ยืม ชื่อของ และหมายเหตุ

## 7. ดีไซน์ UI
- หน้าเดียว 2 แท็บ มีตัวเลขจำนวนกำกับ ปุ่ม "+ เพิ่มรายการยืม" ช่องค้นหา และแถบสำรองข้อมูลด้านล่าง
- ป้ายสถานะตรงกับ `CONTEXT.md`: เกินกำหนด = แดง พร้อมจำนวนวัน (การ์ดขอบแดง), คืนแล้ว = เขียว รายการที่ยังไม่เกินกำหนดไม่มีป้าย
- ฟอร์มเพิ่ม/แก้ไขใช้ `<dialog>` เนทีฟ (ปิดด้วย Esc ได้) ข้อความและวันที่เป็นภาษาไทย พ.ศ.
- ใช้ Tailwind utility class ฟอนต์ Noto Sans Thai โหลดจาก Google Fonts ใน `index.html` (ต้องต่ออินเทอร์เน็ต ถ้าไม่มีจะใช้ฟอนต์ระบบแทน)
- การเข้าถึง: แท็บใช้ `role=tab`/`tabpanel` พร้อม `aria-controls`/`aria-labelledby` และ `aria-selected`, ฟอร์มโฟกัสช่องแรกเมื่อเปิด, ช่องค้นหามี `aria-label`

## 8. การทดสอบ (Vitest, 28 เคส)
- `dates.test.js`: นับวัน (วันเดียวกัน, ข้ามเดือน, ข้ามปี, ปีอธิกสุรทิน, ติดลบ), รูปแบบ พ.ศ., `todayString`
- `loans.test.js`: ครบกำหนดวันนี้ไม่ถือว่าเกินกำหนด, คืนแล้วไม่เกินกำหนด, ตรวจฟอร์ม, การเรียงและค้นหา, ไม่แก้อาร์เรย์ต้นฉบับ, `isValidLoan`
- `storage.test.js`: บันทึก/โหลดที่ key เดิม, ข้อมูลเสียหาย, กรองรายการไม่ถูกต้อง, บันทึกล้มเหลว, นำเข้า/ส่งออก
- ยังไม่มีเทสต์ของคอมโพเนนต์ (UI) ตรวจด้วยมือเท่านั้น

## 9. คำสั่งที่ใช้
```
npm run dev     # เปิดดูตอนพัฒนา
npm test        # รันเทสต์
npm run build   # สร้างไฟล์ใช้งานจริงที่ dist/
```

## 10. สถานะงานตาม Tasks.md
- ทำแล้ว: T3 (ตัดป้ายเหลือง), T4 (ระบุหลักการชื่อผู้ยืมใน CONTEXT.md), T5 (อัปเดตวันที่อัตโนมัติ), T6 (โหลดฟอนต์), T7 (git init, `.gitignore`, commit แรก), T9 (ARIA ของแท็บ), T10 (build และ preview ตอบ 200), T11 (README), T12 (เอกสารนี้)
- ข้ามตามที่ผู้ใช้เลือก: T8 (เทสต์คอมโพเนนต์)
- ค้าง (ต้องให้ผู้ใช้ตรวจเอง): T1 ตรวจด้วยมือตามรายการใน Tasks.md และ T2 ตรวจว่าข้อมูลเดิมไม่หาย

## 11. ความเสี่ยง
- ไฟล์เวอร์ชัน vanilla เดิมที่ลบไปไม่อยู่ใน git (มีสำเนาแค่ใน scratchpad ชั่วคราว) ย้อนกลับได้ยาก
- ข้อมูลอยู่ในเบราว์เซอร์เครื่องเดียว หากล้างข้อมูลเบราว์เซอร์โดยไม่ได้สำรองจะหาย
- ไม่มีเทสต์ UI การแก้คอมโพเนนต์ในอนาคตจึงอาศัยการตรวจด้วยมือ
