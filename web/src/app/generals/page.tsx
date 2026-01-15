'use client';

import { useState, useEffect } from 'react';
import { FactionId } from '@/lib/generals';
import { TroopType } from '@/types/general';
import { fetchGenerals, General } from '@/lib/api';
import GeneralCard from '@/components/GeneralCard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';

export default function GeneralsPage() {
  const [search, setSearch] = useState('');
  const [selectedFactions, setSelectedFactions] = useState<FactionId[]>([]);
  const [selectedCost, setSelectedCost] = useState<number | null>(null);
  const [selectedTroops, setSelectedTroops] = useState<TroopType[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [generals, setGenerals] = useState<General[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGenerals() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchGenerals({
          search: search || undefined,
          factions: selectedFactions.length > 0 ? selectedFactions : undefined,
          costs: selectedCost !== null ? [selectedCost] : undefined,
          cavalry: selectedTroops.includes('cavalry'),
          shield: selectedTroops.includes('shield'),
          archer: selectedTroops.includes('archer'),
          spear: selectedTroops.includes('spear'),
          siege: selectedTroops.includes('siege'),
        });

        setGenerals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadGenerals, 300);
    return () => clearTimeout(timer);
  }, [search, selectedFactions, selectedCost, selectedTroops]);

  return (
    <div className="min-h-screen relative">
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#e8dcc8] tracking-wide">Danh Sách Tướng</h1>
          <p className="text-sm text-[#6b7280] mt-1">Khám phá các vị tướng trong Tam Quốc Chí Chiến Lược</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 flex items-center gap-2 text-sm text-[#b8a990] hover:text-[#f0c96e] transition-colors group"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="group-hover:underline">{showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}</span>
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel
              selectedFactions={selectedFactions}
              onFactionChange={setSelectedFactions}
              selectedCost={selectedCost}
              onCostChange={setSelectedCost}
              selectedTroops={selectedTroops}
              onTroopChange={setSelectedTroops}
            />
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-[#b8a990]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#d4a74a]/30 border-t-[#d4a74a] rounded-full animate-spin" />
                Đang tải...
              </span>
            ) : (
              <span>
                Hiển thị <span className="text-[#d4a74a] font-semibold">{generals.length}</span> tướng
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="tk-card-gold border-[#8b2635] bg-gradient-to-r from-[#5c1a24]/20 to-transparent px-5 py-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[#c44052] text-xl">⚠️</span>
              <span className="text-[#e8dcc8]">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2.5/3.5] rounded-xl bg-[#1a2130] border border-[#2a3548] animate-pulse">
                <div className="h-full flex flex-col justify-end p-3">
                  <div className="h-4 bg-[#2a3548] rounded w-3/4 mx-auto mb-2" />
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-6 h-8 bg-[#2a3548] rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generals Grid */}
        {!loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {generals.map((general, index) => (
              <GeneralCard key={general.id} general={general as any} index={general.index ?? index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && generals.length === 0 && !error && (
          <div className="tk-card-gold text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-[#e8dcc8] mb-2">Không tìm thấy tướng</h3>
            <p className="text-[#6b7280]">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </main>
    </div>
  );
}
