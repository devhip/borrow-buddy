import { useRef } from 'react';

const btn = 'cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 hover:bg-gray-100';

export default function BackupBar({ onExport, onImport }) {
  const fileRef = useRef(null);

  const pick = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) onImport(await file.text());
  };

  return (
    <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
      <button type="button" className={btn} onClick={onExport}>ส่งออกไฟล์สำรอง</button>
      <button type="button" className={btn} onClick={() => fileRef.current.click()}>นำเข้าไฟล์สำรอง</button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={pick} />
      <p className="mt-1 basis-full text-sm text-gray-500">
        ข้อมูลเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น ควรส่งออกไฟล์สำรองไว้เป็นระยะ
      </p>
    </footer>
  );
}
