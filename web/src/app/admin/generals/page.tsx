'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAdminGenerals, deleteGeneral } from '@/lib/adminApi';
import { General } from '@/lib/api';
import { FactionId, TroopType } from '@/types/general';
import { factionNames, troopTypeNames } from '@/lib/generals';
import { TroopIcon } from '@/components/icons/TroopIcons';

const factions: FactionId[] = ['wei', 'shu', 'wu', 'qun'];
const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];
const costOptions = [1, 2, 3, 4, 5, 6, 7];

export default function AdminGeneralsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [generals, setGenerals] = useState<General[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFactions, setSelectedFactions] = useState<FactionId[]>([]);
  const [selectedCost, setSelectedCost] = useState<number | null>(null);
  const [selectedTroops, setSelectedTroops] = useState<TroopType[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const toggleFaction = (faction: FactionId) => {
    if (selectedFactions.includes(faction)) {
      setSelectedFactions(selectedFactions.filter(f => f !== faction));
    } else {
      setSelectedFactions([...selectedFactions, faction]);
    }
  };

  const toggleTroop = (troop: TroopType) => {
    if (selectedTroops.includes(troop)) {
      setSelectedTroops(selectedTroops.filter(t => t !== troop));
    } else {
      setSelectedTroops([...selectedTroops, troop]);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedFactions([]);
    setSelectedCost(null);
    setSelectedTroops([]);
  };

  const filteredGenerals = generals.filter((g) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        g.name.vi.toLowerCase().includes(searchLower) ||
        g.name.cn.toLowerCase().includes(searchLower) ||
        g.slug.toLowerCase().includes(searchLower);
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

    return true;
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-amber-100">Tướng ({filteredGenerals.length})</h1>
          <Link
            href="/admin/generals/new"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors"
          >
            + Thêm tướng
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-4 mb-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm tướng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Faction Filter */}
            <div>
              <h3 className="text-sm font-medium text-amber-400 mb-2">Phe</h3>
              <div className="flex flex-wrap gap-2">
                {factions.map(faction => {
                  const isSelected = selectedFactions.includes(faction);
                  return (
                    <button
                      key={faction}
                      onClick={() => toggleFaction(faction)}
                      className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                        isSelected
                          ? 'bg-amber-700/50 border-amber-600 text-amber-100'
                          : 'border-stone-600 text-stone-400 hover:border-stone-500'
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
              <h3 className="text-sm font-medium text-amber-400 mb-2">Phí</h3>
              <div className="flex flex-wrap gap-2">
                {costOptions.map(cost => {
                  const isSelected = selectedCost === cost;
                  return (
                    <button
                      key={cost}
                      onClick={() => setSelectedCost(selectedCost === cost ? null : cost)}
                      className={`w-8 h-8 rounded text-sm font-bold border transition-colors ${
                        isSelected
                          ? 'bg-amber-700 border-amber-600 text-white'
                          : 'border-stone-600 text-stone-400 hover:border-stone-500'
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
              <h3 className="text-sm font-medium text-amber-400 mb-2">Binh chủng (S/A)</h3>
              <div className="flex flex-wrap gap-2">
                {troopTypes.map(type => {
                  const isSelected = selectedTroops.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTroop(type)}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded border transition-colors ${
                        isSelected
                          ? 'bg-amber-700/50 border-amber-600 text-amber-100'
                          : 'border-stone-600 text-stone-400 hover:border-stone-500'
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
          <div className="mt-4 pt-3 border-t border-stone-700 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-stone-400 py-8">Đang tải...</div>
        ) : (
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Ảnh</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Phe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Phí</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700">
                {filteredGenerals.map((general) => (
                  <tr key={general.slug} className="hover:bg-stone-700/30">
                    <td className="px-4 py-3">
                      {general.image ? (
                        <img
                          src={general.image}
                          alt={general.name.vi}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-stone-700 rounded flex items-center justify-center text-stone-500 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{general.name.vi}</td>
                    <td className="px-4 py-3 text-stone-400">
                      {factionNames[general.faction_id as FactionId]?.vi || general.faction_id}
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{general.cost}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/generals/${general.slug}`}
                          className="px-3 py-1 text-sm text-amber-400 hover:text-amber-300 border border-amber-700 rounded hover:border-amber-600 transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(general.slug, general.name.vi)}
                          disabled={deleting === general.slug}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-700 rounded hover:border-red-600 transition-colors disabled:opacity-50"
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
              <div className="text-center text-stone-400 py-8">
                Không tìm thấy tướng
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
