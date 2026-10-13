import { formatThaiDate } from '../lib/dates.js';
import { isReturned, overdueDays } from '../lib/loans.js';

const BADGE = {
  overdue: 'bg-red-100 text-red-600',
  ok: 'bg-green-100 text-green-700'
};

function Badge({ kind, children }) {
  return <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[kind]}`}>{children}</span>;
}

const btn = 'cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-100';

export default function LoanCard({ loan, today, onReturn, onUndoReturn, onEdit, onRemove }) {
  const returned = isReturned(loan);
  const late = overdueDays(loan, today) > 0;

  return (
    <li className={`rounded-2xl border bg-white p-4 shadow-sm ${late ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="break-words text-lg font-semibold">{loan.item}</h3>
          {loan.note && <p className="mt-0.5 break-words text-sm text-gray-500">{loan.note}</p>}
        </div>
        {returned ? <Badge kind="ok">คืนแล้ว</Badge> : late && <Badge kind="overdue">เกินกำหนด {overdueDays(loan, today)} วัน</Badge>}
      </div>

      <div className="mt-2.5 grid gap-0.5 text-sm text-gray-500">
        <span>ผู้ยืม: {loan.borrower}</span>
        <span>ยืมเมื่อ {formatThaiDate(loan.lentDate)}</span>
        <span>กำหนดคืน {formatThaiDate(loan.dueDate)}</span>
        {returned && <span>คืนเมื่อ {formatThaiDate(loan.returnedDate)}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {returned ? (
          <button type="button" className={btn} onClick={() => onUndoReturn(loan.id)}>ยกเลิกการคืน</button>
        ) : (
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            onClick={() => onReturn(loan.id)}
          >
            คืนแล้ว
          </button>
        )}
        <button type="button" className={btn} onClick={() => onEdit(loan)}>แก้ไข</button>
        <button type="button" className={`${btn} text-red-600`} onClick={() => onRemove(loan)}>ลบ</button>
      </div>
    </li>
  );
}
