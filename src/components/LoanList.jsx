import LoanCard from './LoanCard.jsx';

function emptyMessage(tab, query) {
  if (query.trim()) return 'ไม่พบรายการที่ค้นหา';
  return tab === 'outstanding' ? 'ไม่มีของที่ถูกยืมอยู่ตอนนี้' : 'ยังไม่มีประวัติการคืน';
}

export default function LoanList({ loans, tab, query, today, ...actions }) {
  if (loans.length === 0) {
    return <p className="py-8 text-center text-gray-500">{emptyMessage(tab, query)}</p>;
  }
  return (
    <ul className="grid gap-3">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} today={today} {...actions} />
      ))}
    </ul>
  );
}
