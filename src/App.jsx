import { useEffect, useState } from 'react';
import BackupBar from './components/BackupBar.jsx';
import LoanDialog from './components/LoanDialog.jsx';
import LoanList from './components/LoanList.jsx';
import SearchBar from './components/SearchBar.jsx';
import Tabs from './components/Tabs.jsx';
import { todayString } from './lib/dates.js';
import { isReturned, visibleLoans } from './lib/loans.js';
import { exportLoans, loadLoans, parseImport, saveLoans } from './lib/storage.js';

// วันนี้ (ตามปฏิทิน) อัปเดตทุกนาทีและเมื่อกลับมาโฟกัสหน้า เพื่อให้สถานะเกินกำหนดถูกต้องเมื่อเปิดหน้าทิ้งข้ามเที่ยงคืน
function useToday() {
  const [today, setToday] = useState(todayString);
  useEffect(() => {
    const refresh = () => setToday(todayString());
    const timer = setInterval(refresh, 60 * 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return today;
}

export default function App() {
  const today = useToday();
  const [loans, setLoans] = useState(loadLoans);
  const [tab, setTab] = useState('outstanding');
  const [query, setQuery] = useState('');
  // undefined = ปิด, null = เพิ่มใหม่, อ็อบเจกต์ = แก้ไขรายการนั้น
  const [dialogLoan, setDialogLoan] = useState(undefined);

  useEffect(() => {
    if (!saveLoans(loans)) alert('ไม่สามารถบันทึกข้อมูลลงเบราว์เซอร์ได้ กรุณาส่งออกไฟล์สำรองไว้ก่อน');
  }, [loans]);

  const shown = visibleLoans(loans, tab, query, today);
  const outstanding = loans.filter((l) => !isReturned(l)).length;
  const counts = { outstanding, history: loans.length - outstanding };

  const updateLoan = (id, changes) =>
    setLoans((all) => all.map((l) => (l.id === id ? { ...l, ...changes } : l)));

  const markReturned = (id) => updateLoan(id, { returnedDate: today });
  const undoReturn = (id) => updateLoan(id, { returnedDate: null });

  const removeLoan = (loan) => {
    const msg = `ลบรายการ "${loan.item}" ของ ${loan.borrower} ใช่หรือไม่?\nใช้เฉพาะกรณีบันทึกผิด หากเพื่อนคืนของแล้วให้กด "คืนแล้ว" แทน`;
    if (confirm(msg)) setLoans((all) => all.filter((l) => l.id !== loan.id));
  };

  const saveDialog = (values) => {
    if (dialogLoan) updateLoan(dialogLoan.id, values);
    else setLoans((all) => [...all, { id: crypto.randomUUID(), ...values, returnedDate: null }]);
    setDialogLoan(undefined);
  };

  const importBackup = (text) => {
    try {
      const data = parseImport(text);
      if (!confirm(`นำเข้า ${data.length} รายการ และแทนที่ข้อมูลปัจจุบันทั้งหมดใช่หรือไม่?`)) return;
      setLoans(data);
    } catch {
      alert('ไฟล์ไม่ถูกต้อง ไม่สามารถนำเข้าได้');
    }
  };

  const exportBackup = () => {
    const url = URL.createObjectURL(new Blob([exportLoans(loans)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrow-buddy-${today}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
      <header>
        <h1 className="text-3xl font-bold">Borrow Buddy</h1>
        <p className="mb-5 mt-1 text-gray-500">บันทึกของที่ให้เพื่อนยืม</p>
      </header>

      <SearchBar query={query} onQueryChange={setQuery} onAdd={() => setDialogLoan(null)} />
      <Tabs tab={tab} counts={counts} onChange={setTab} />
      <LoanList
        loans={shown}
        tab={tab}
        query={query}
        today={today}
        onReturn={markReturned}
        onUndoReturn={undoReturn}
        onEdit={setDialogLoan}
        onRemove={removeLoan}
      />
      <BackupBar onExport={exportBackup} onImport={importBackup} />

      {dialogLoan !== undefined && (
        <LoanDialog
          key={dialogLoan?.id ?? 'new'}
          loan={dialogLoan}
          today={today}
          onSave={saveDialog}
          onClose={() => setDialogLoan(undefined)}
        />
      )}
    </main>
  );
}
