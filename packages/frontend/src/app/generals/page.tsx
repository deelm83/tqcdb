'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FactionId } from '@/lib/generals';
import { TroopType } from '@/types/general';
import { fetchGenerals, General } from '@/lib/api';
import GeneralCard from '@/components/GeneralCard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import { usePageTitle } from '@/hooks/usePageTitle';

function GeneralsContent() {
  usePageTitle('Võ tướng');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [generals, setGenerals] = useState<General[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read filters from URL
  const search = searchParams.get('q') || '';
  const selectedFactions = (searchParams.get('factions')?.split(',').filter(Boolean) || []) as FactionId[];
  const selectedCost = searchParams.get('cost') ? Number(searchParams.get('cost')) : null;
  const selectedTroops = (searchParams.get('troops')?.split(',').filter(Boolean) || []) as TroopType[];

  // Update URL with new filters
  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '', { scroll: false });
  }, [searchParams, router]);

  const setSearch = useCallback((value: string) => {
    updateFilters({ q: value || null });
  }, [updateFilters]);

  const setSelectedFactions = useCallback((factions: FactionId[]) => {
    updateFilters({ factions: factions.length > 0 ? factions.join(',') : null });
  }, [updateFilters]);

  const setSelectedCost = useCallback((cost: number | null) => {
    updateFilters({ cost: cost !== null ? String(cost) : null });
  }, [updateFilters]);

  const setSelectedTroops = useCallback((troops: TroopType[]) => {
    updateFilters({ troops: troops.length > 0 ? troops.join(',') : null });
  }, [updateFilters]);

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
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadGenerals, 300);
    return () => clearTimeout(timer);
  }, [search, selectedFactions, selectedCost, selectedTroops]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">Võ tướng</h1>
        <p className="text-[var(--text-secondary)] mt-1">Danh sách võ tướng trong Tam Quốc Chí Chiến Lược</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm võ tướng..." />
        <FilterPanel
          selectedFactions={selectedFactions}
          onFactionChange={setSelectedFactions}
          selectedCost={selectedCost}
          onCostChange={setSelectedCost}
          selectedTroops={selectedTroops}
          onTroopChange={setSelectedTroops}
        />
      </div>

      {/* Results Count */}
      <div className="mb-6 text-[13px] text-[var(--text-tertiary)] uppercase tracking-wider">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner" />
            Đang tải...
          </span>
        ) : (
          <span>{generals.length} võ tướng</span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card-red p-4 mb-6">
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card aspect-[7/10] animate-pulse" />
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
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)]">Không tìm thấy võ tướng</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-2">Thử thay đổi bộ lọc</p>
        </div>
      )}
    </main>
  );
}

export default function GeneralsPage() {
  return (
    <Suspense fallback={
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-32 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="h-4 w-64 bg-[var(--bg-secondary)] animate-pulse mt-2" />
        </div>
        <div className="space-y-4 mb-8">
          <div className="h-12 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="h-24 bg-[var(--bg-secondary)] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card aspect-[7/10] animate-pulse" />
          ))}
        </div>
      </main>
    }>
      <GeneralsContent />
    </Suspense>
  );
}
