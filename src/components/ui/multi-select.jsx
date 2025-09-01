import React from "react";

// Simple multi-select dropdown with checkboxes
export default function MultiSelect({ options, value, onChange, placeholder = "Pilih user..." }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="w-full min-h-[40px] px-3 py-2 border rounded bg-white cursor-pointer flex items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            filteredOptions
              .filter((opt) => value.includes(opt.value))
              .map((opt) => (
                <span key={opt.value} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {opt.label}
                  <span
                    className="ml-1 cursor-pointer text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((v) => v !== opt.value));
                    }}
                  >
                    ×
                  </span>
                </span>
              ))
          )}
        </div>
        <span className="ml-2 text-gray-400">▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-64 overflow-auto">
          <div className="p-2 border-b">
            <input type="text" className="w-full px-2 py-1 border rounded text-sm" placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">Tidak ada user ditemukan</div>
            ) : (
              filteredOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={value.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...value, opt.value]);
                      } else {
                        onChange(value.filter((v) => v !== opt.value));
                      }
                    }}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
