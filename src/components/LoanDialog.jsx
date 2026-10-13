import { useEffect, useRef, useState } from 'react';
import { validateLoan } from '../lib/loans.js';

const input = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5';
const label = 'mb-1 mt-3.5 block text-sm font-medium';

function Field({ id, text, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// loan = null คือเพิ่มใหม่ ถ้าเป็นอ็อบเจกต์คือแก้ไข (ให้ parent ใส่ key เพื่อรีเซ็ตฟอร์ม)
export default function LoanDialog({ loan, today, onSave, onClose }) {
  const ref = useRef(null);
  const [values, setValues] = useState({
    item: loan?.item ?? '',
    note: loan?.note ?? '',
    borrower: loan?.borrower ?? '',
    lentDate: loan?.lentDate ?? today,
    dueDate: loan?.dueDate ?? ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const trimmed = {
      ...values,
      item: values.item.trim(),
      note: values.note.trim(),
      borrower: values.borrower.trim()
    };
    const found = validateLoan(trimmed);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(trimmed);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(480px,calc(100%-32px))] rounded-2xl p-6 shadow-2xl backdrop:bg-gray-900/45"
    >
      <form onSubmit={submit} noValidate>
        <h2 className="mb-2 text-xl font-semibold">{loan ? 'แก้ไขรายการยืม' : 'เพิ่มรายการยืม'}</h2>

        <Field id="f-item" text="ชื่อของ" required error={errors.item}>
          <input id="f-item" className={input} maxLength={100} autoComplete="off" autoFocus value={values.item} onChange={set('item')} />
        </Field>
        <Field id="f-note" text="หมายเหตุ">
          <input id="f-note" className={input} maxLength={200} autoComplete="off" value={values.note} onChange={set('note')} />
        </Field>
        <Field id="f-borrower" text="ชื่อผู้ยืม" required error={errors.borrower}>
          <input id="f-borrower" className={input} maxLength={100} autoComplete="off" value={values.borrower} onChange={set('borrower')} />
        </Field>

        <div className="grid gap-x-3 sm:grid-cols-2">
          <Field id="f-lent" text="วันที่ยืม" required error={errors.lentDate}>
            <input id="f-lent" type="date" className={input} value={values.lentDate} onChange={set('lentDate')} />
          </Field>
          <Field id="f-due" text="วันกำหนดคืน" required error={errors.dueDate}>
            <input id="f-due" type="date" className={input} value={values.dueDate} onChange={set('dueDate')} />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => ref.current.close()} className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 hover:bg-gray-100">
            ยกเลิก
          </button>
          <button type="submit" className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700">
            บันทึก
          </button>
        </div>
      </form>
    </dialog>
  );
}
