'use client';

import { useState, useEffect, Suspense, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFormations, Formation, ArmyType } from '@/lib/formationsApi';
import FormationCard from '@/components/formations/FormationCard';
import SearchBar from '@/components/SearchBar';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUser } from '@/contexts/UserContext';

type TabType = 'community' | 'curated' | 'mine';
type SortType = 'rank' | 'newest' | 'oldest';

const armyTypes: ArmyType[] = ['CAVALRY', 'SHIELD', 'ARCHER', 'SPEAR', 'SIEGE'];

const armyTypeLabels: Record<ArmyType, string> = {
  CAVALRY: 'Kỵ',
  SHIELD: 'Khiên',
  ARCHER: 'Cung',
  SPEAR: 'Thương',
  SIEGE: 'Xe',
};

const armyTypeColors: Record<ArmyType, { bg: string; text: string; border: string }> = {
  CAVALRY: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  SHIELD: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  ARCHER: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  SPEAR: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  SIEGE: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
};

function FormationsContent() {
  usePageTitle('Đội Hình');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const hasLoadedOnce = useRef(false);

  // Read filters from URL
  const search = searchParams.get('q') || '';
  const tab = (searchParams.get('tab') || 'community') as TabType;
  const armyTypeParam = searchParams.get('armyType') || '';
  const sort = (searchParams.get('sort') || 'newest') as SortType;
  const page = Number(searchParams.get('page')) || 1;

  const selectedArmyType = useMemo(() =>
    armyTypeParam ? (armyTypeParam as ArmyType) : undefined,
    [armyTypeParam]
  );

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

    // Reset page when filters change (except when page itself is being updated)
    if (!updates.page && params.has('page')) {
      params.set('page', '1');
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '', { scroll: false });
  }, [searchParams, router]);

  const setSearch = useCallback((value: string) => {
    updateFilters({ q: value || null });
  }, [updateFilters]);

  const setTab = useCallback((value: TabType) => {
    updateFilters({ tab: value === 'community' ? null : value });
  }, [updateFilters]);

  const setArmyType = useCallback((value: ArmyType | undefined) => {
    updateFilters({ armyType: value || null });
  }, [updateFilters]);

  const setSort = useCallback((value: SortType) => {
    updateFilters({ sort: value === 'newest' ? null : value });
  }, [updateFilters]);

  const setPage = useCallback((value: number) => {
    updateFilters({ page: value === 1 ? null : String(value) });
  }, [updateFilters]);

  useEffect(() => {
    // Redirect to login if trying to access "Của tôi" tab without being logged in
    if (tab === 'mine' && !user) {
      updateFilters({ tab: null });
      return;
    }

    async function loadFormations() {
      try {
        if (!hasLoadedOnce.current) {
          setLoading(true);
        } else {
          setIsRefetching(true);
        }
        setError(null);

        const response = await getFormations({
          search: search || undefined,
          armyType: selectedArmyType,
          sort,
          tab,
          page,
          limit: 12,
        });

        setFormations(response.formations);
        setTotal(response.total);
        setTotalPages(response.totalPages);
        hasLoadedOnce.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
        setIsRefetching(false);
      }
    }

    const timer = setTimeout(loadFormations, 300);
    return () => clearTimeout(timer);
  }, [search, tab, selectedArmyType, sort, page, user, updateFilters]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">Đội Hình</h1>
          <p className="text-[var(--text-secondary)] mt-1">Khám phá và tạo đội hình trong Tam Quốc Chí Chiến Lược</p>
        </div>
        <Link
          href="/formations/create"
          className="px-4 py-2 bg-[var(--accent-gold)] text-black font-medium rounded hover:bg-[var(--accent-gold-bright)] transition-colors"
        >
          + Tạo mới
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm kiếm võ tướng..." />
      </div>

      {/* Army Type Filter */}
      <div className="mb-4">
        <div className="text-[13px] text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Lọc:</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setArmyType(undefined)}
            className={`px-3 py-1.5 text-[13px] font-medium border transition-colors ${
              !selectedArmyType
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
            }`}
          >
            Tất cả
          </button>
          {armyTypes.map((type) => {
            const colors = armyTypeColors[type];
            const isActive = selectedArmyType === type;
            return (
              <button
                key={type}
                onClick={() => setArmyType(type)}
                className={`px-3 py-1.5 text-[13px] font-medium border transition-colors ${colors.text} ${
                  isActive
                    ? `${colors.bg} ${colors.border}`
                    : 'border-[var(--border)] opacity-60 hover:opacity-100'
                }`}
              >
                {armyTypeLabels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <div className="text-[13px] text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Sắp xếp:</div>
        <div className="flex gap-2">
          {tab === 'curated' && (
            <button
              onClick={() => setSort('rank')}
              className={`px-3 py-1.5 text-[13px] font-medium border transition-colors ${
                sort === 'rank'
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
              }`}
            >
              Xếp hạng
            </button>
          )}
          <button
            onClick={() => setSort('newest')}
            className={`px-3 py-1.5 text-[13px] font-medium border transition-colors ${
              sort === 'newest'
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
            }`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setSort('oldest')}
            className={`px-3 py-1.5 text-[13px] font-medium border transition-colors ${
              sort === 'oldest'
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
            }`}
          >
            Cũ nhất
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <div className="flex gap-6">
          <button
            onClick={() => setTab('community')}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
              tab === 'community'
                ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Cộng đồng
          </button>
          <button
            onClick={() => setTab('curated')}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
              tab === 'curated'
                ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Đề xuất
          </button>
          {user && (
            <button
              onClick={() => setTab('mine')}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
                tab === 'mine'
                  ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Của tôi
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-[13px] text-[var(--text-tertiary)] uppercase tracking-wider">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner" />
            Đang tải...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {total} đội hình
            {isRefetching && <span className="spinner" />}
          </span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card p-4 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Formations Grid */}
      {!loading && formations.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${isRefetching ? 'opacity-60' : 'opacity-100'}`}>
          {formations.map((formation) => (
            <FormationCard key={formation.id} formation={formation} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && formations.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)]">Không tìm thấy đội hình</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-2">Thử thay đổi bộ lọc</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-[13px] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹ Trước
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            // Show first, last, current, and adjacent pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-[13px] border transition-colors ${
                    page === pageNum
                      ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return <span key={pageNum} className="px-2 text-[var(--text-tertiary)]">...</span>;
            }
            return null;
          })}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-[13px] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tiếp ›
          </button>
        </div>
      )}
    </main>
  );
}

export default function FormationsPage() {
  return (
    <Suspense fallback={
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-32 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="h-4 w-64 bg-[var(--bg-secondary)] animate-pulse mt-2" />
        </div>
        <div className="space-y-4 mb-8">
          <div className="h-12 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="h-10 bg-[var(--bg-secondary)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 h-64 animate-pulse" />
          ))}
        </div>
      </main>
    }>
      <FormationsContent />
    </Suspense>
  );
}
