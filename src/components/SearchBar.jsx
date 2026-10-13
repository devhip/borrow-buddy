export default function SearchBar({ query, onQueryChange, onAdd }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="ค้นหาชื่อผู้ยืมหรือชื่อของ"
        aria-label="ค้นหา"
        className="min-w-48 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
      />
      <button
        type="button"
        onClick={onAdd}
        className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
      >
        + เพิ่มรายการยืม
      </button>
    </div>
  );
}
