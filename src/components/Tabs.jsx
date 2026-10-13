const TABS = [
  { id: 'outstanding', label: 'ยังไม่คืน' },
  { id: 'history', label: 'ประวัติ' }
];

export default function Tabs({ tab, counts, onChange }) {
  return (
    <div className="mb-4 flex gap-2 border-b border-gray-200" role="tablist">
      {TABS.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            aria-controls="tabpanel"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`-mb-px cursor-pointer border-b-[3px] px-4 py-2.5 ${
              active ? 'border-blue-600 font-semibold text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}{' '}
            <span className="inline-block min-w-6 rounded-full bg-gray-200 px-1.5 text-center text-xs text-gray-800">
              {counts[t.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
