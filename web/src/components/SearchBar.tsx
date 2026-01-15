'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4a74a]/20 via-[#6b5a3e]/20 to-[#d4a74a]/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm kiếm tướng..."
          className="w-full px-4 py-3 pl-11 bg-gradient-to-b from-[#1e2636] to-[#1a2130] border border-[#2a3548] rounded-lg text-[#e8dcc8] placeholder-[#6b7280] focus:border-[#6b5a3e] focus:ring-2 focus:ring-[#d4a74a]/20 outline-none transition-all duration-200"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg
            className="w-5 h-5 text-[#6b7280] group-focus-within:text-[#d4a74a] transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#e8dcc8] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
