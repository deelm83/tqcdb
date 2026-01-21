'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAdminGenerals, deleteGeneral, updateGeneral } from '@/lib/adminApi';
import { General } from '@/lib/api';

type StatusFilter = 'all' | 'needs_update' | 'complete';
import { FactionId, TroopType } from '@/types/general';
import { factionNames, troopTypeNames } from '@/lib/generals';
import { TroopIcon } from '@/components/icons/TroopIcons';
import { usePageTitle } from '@/hooks/usePageTitle';

const factions: FactionId[] = ['wei', 'shu', 'wu', 'qun'];
const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];
const costOptions = [1, 2, 3, 4, 5, 6, 7];

// Remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function AdminGeneralsContent() {
  usePageTitle('Võ tướng', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [generals, setGenerals] = useState<General[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  // Read filters from URL
  const searchFromUrl = searchParams.get('q') || '';
  const [search, setSearchInput] = useState(searchFromUrl);

  // Sync local search state with URL when URL changes externally
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);
  const selectedFactions = (searchParams.get('factions')?.split(',').filter(Boolean) || []) as FactionId[];
  const selectedCost = searchParams.get('cost') ? Number(searchParams.get('cost')) : null;
  const selectedTroops = (searchParams.get('troops')?.split(',').filter(Boolean) || []) as TroopType[];
  const selectedStatus = (searchParams.get('status') || 'all') as StatusFilter;

  // Update URL with new filters
  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '', { scroll: false });
  }, [searchParams, router]);

  const setSearch = useCallback((value: string) => {
    setSearchInput(value);
    updateFilters({ q: value || null });
  }, [updateFilters]);

  const setSelectedStatus = useCallback((value: StatusFilter) => {
    updateFilters({ status: value === 'all' ? null : value });
  }, [updateFilters]);

  const setSelectedCost = useCallback((value: number | null) => {
    updateFilters({ cost: value !== null ? String(value) : null });
  }, [updateFilters]);

  const toggleFaction = useCallback((faction: FactionId) => {
    const newFactions = selectedFactions.includes(faction)
      ? selectedFactions.filter(f => f !== faction)
      : [...selectedFactions, faction];
    updateFilters({ factions: newFactions.length > 0 ? newFactions.join(',') : null });
  }, [selectedFactions, updateFilters]);

  const toggleTroop = useCallback((troop: TroopType) => {
    const newTroops = selectedTroops.includes(troop)
      ? selectedTroops.filter(t => t !== troop)
      : [...selectedTroops, troop];
    updateFilters({ troops: newTroops.length > 0 ? newTroops.join(',') : null });
  }, [selectedTroops, updateFilters]);

  const clearFilters = useCallback(() => {
    router.replace('', { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadGenerals() {
      try {
        const data = await fetchAdminGenerals();
        setGenerals(data);
      } catch (error) {
        console.error('Error loading generals:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadGenerals();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) {
      return;
    }

    setDeleting(id);
    try {
      await deleteGeneral(id);
      setGenerals((prev) => prev.filter((g) => g.slug !== id && g.id !== id));
    } catch (error) {
      alert('Không thể xóa tướng');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (general: General) => {
    const newStatus = general.status === 'complete' ? 'needs_update' : 'complete';
    setTogglingStatus(general.id);
    try {
      await updateGeneral(general.slug || general.id, { status: newStatus });
      setGenerals((prev) =>
        prev.map((g) => (g.id === general.id ? { ...g, status: newStatus } : g))
      );
    } catch (error) {
      alert('Không thể cập nhật trạng thái');
      console.error(error);
    } finally {
      setTogglingStatus(null);
    }
  };

  const filteredGenerals = [...generals]
    .sort((a, b) => b.cost - a.cost)
    .filter((g) => {
    // Search filter
    if (search) {
      const searchNormalized = removeVietnameseDiacritics(search);
      const matchesSearch =
        removeVietnameseDiacritics(g.name).includes(searchNormalized) ||
        removeVietnameseDiacritics(g.slug).includes(searchNormalized);
      if (!matchesSearch) return false;
    }

    // Faction filter
    if (selectedFactions.length > 0 && !selectedFactions.includes(g.faction_id as FactionId)) {
      return false;
    }

    // Cost filter
    if (selectedCost !== null && g.cost !== selectedCost) {
      return false;
    }

    // Troop filter
    if (selectedTroops.length > 0) {
      const troopGrades: Record<TroopType, string | undefined> = {
        cavalry: g.troop_compatibility?.cavalry?.grade,
        shield: g.troop_compatibility?.shield?.grade,
        archer: g.troop_compatibility?.archer?.grade,
        spear: g.troop_compatibility?.spear?.grade,
        siege: g.troop_compatibility?.siege?.grade,
      };
      const hasMatchingTroop = selectedTroops.some(troop =>
        troopGrades[troop] && ['S', 'A'].includes(troopGrades[troop]!)
      );
      if (!hasMatchingTroop) return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && g.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const hasFilters = search || selectedFactions.length > 0 || selectedCost !== null || selectedTroops.length > 0 || selectedStatus !== 'all';

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">Võ tướng ({filteredGenerals.length})</h1>
          <Link href="/admin/generals/new" className="btn-primary">
            + Thêm võ tướng
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm võ tướng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-gold)]"
            />
          </div>

          {/* Status filter row */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-[var(--accent-gold-dim)]">Trạng thái:</span>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 text-sm border transition-all ${
                selectedStatus === 'all'
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                  : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedStatus('needs_update')}
              className={`px-3 py-1.5 text-sm border transition-all ${
                selectedStatus === 'needs_update'
                  ? 'bg-orange-600/20 border-orange-600 text-orange-400'
                  : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Cần cập nhật
            </button>
            <button
              onClick={() => setSelectedStatus('complete')}
              className={`px-3 py-1.5 text-sm border transition-all ${
                selectedStatus === 'complete'
                  ? 'bg-green-600/20 border-green-600 text-green-400'
                  : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Hoàn thành
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Faction Filter */}
            <div>
              <h3 className="text-sm font-medium text-[var(--accent-gold-dim)] mb-2">Thế lực</h3>
              <div className="flex flex-wrap gap-2">
                {factions.map(faction => {
                  const isSelected = selectedFactions.includes(faction);
                  return (
                    <button
                      key={faction}
                      onClick={() => toggleFaction(faction)}
                      className={`px-3 py-1.5 text-sm border transition-colors ${
                        isSelected
                          ? 'bg-[var(--bg-tertiary)] border-[var(--accent-gold-dim)] text-[var(--accent-gold)]'
                          : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
                      }`}
                    >
                      {factionNames[faction].vi}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cost Filter */}
            <div>
              <h3 className="text-sm font-medium text-[var(--accent-gold-dim)] mb-2">COST</h3>
              <div className="flex flex-wrap gap-2">
                {costOptions.map(cost => {
                  const isSelected = selectedCost === cost;
                  return (
                    <button
                      key={cost}
                      onClick={() => setSelectedCost(selectedCost === cost ? null : cost)}
                      className={`w-8 h-8 text-sm font-bold border transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-[var(--bg)]'
                          : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
                      }`}
                    >
                      {cost}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Troop Filter */}
            <div>
              <h3 className="text-sm font-medium text-[var(--accent-gold-dim)] mb-2">Binh chủng (S/A)</h3>
              <div className="flex flex-wrap gap-2">
                {troopTypes.map(type => {
                  const isSelected = selectedTroops.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTroop(type)}
                      className={`flex items-center gap-1 px-2 py-1.5 border transition-colors ${
                        isSelected
                          ? 'bg-[var(--bg-tertiary)] border-[var(--accent-gold-dim)] text-[var(--accent-gold)]'
                          : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
                      }`}
                    >
                      <TroopIcon type={type} size={16} />
                      <span className="text-xs">{troopTypeNames[type].vi}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-[var(--text-secondary)] py-8">Đang tải...</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Ảnh</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Thế lực</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">COST</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[var(--text-tertiary)]">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-tertiary)]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredGenerals.map((general) => (
                  <tr key={general.slug} className="hover:bg-[var(--bg-tertiary)]">
                    <td className="px-4 py-3">
                      {general.image ? (
                        <img
                          src={general.image}
                          alt={general.name}
                          className="w-10 h-10 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{general.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {factionNames[general.faction_id as FactionId]?.vi || general.faction_id}
                    </td>
                    <td className="px-4 py-3 text-[var(--accent-gold)] font-bold">{general.cost}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(general)}
                        disabled={togglingStatus === general.id}
                        className={`px-2 py-1 text-xs font-medium transition-all ${
                          general.status === 'complete'
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30'
                        } disabled:opacity-50`}
                      >
                        {togglingStatus === general.id ? '...' : general.status === 'complete' ? '✓ OK' : '⚠ Cần cập nhật'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/generals/${general.slug}`}
                          className="px-3 py-1 text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)] border border-[var(--accent-gold-dim)] hover:border-[var(--accent-gold)] transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(general.slug, general.name)}
                          disabled={deleting === general.slug}
                          className="px-3 py-1 text-sm text-[var(--accent-red-bright)] hover:text-red-400 border border-[var(--accent-red)] hover:border-[var(--accent-red-bright)] transition-colors disabled:opacity-50"
                        >
                          {deleting === general.slug ? '...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredGenerals.length === 0 && (
              <div className="text-center text-[var(--text-secondary)] py-8">
                Không tìm thấy võ tướng
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminGeneralsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] animate-pulse mb-6" />
          <div className="card p-4 mb-6 space-y-4">
            <div className="h-10 bg-[var(--bg-secondary)] animate-pulse" />
            <div className="h-20 bg-[var(--bg-secondary)] animate-pulse" />
          </div>
        </div>
      </main>
    }>
      <AdminGeneralsContent />
    </Suspense>
  );
}
