'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminFormations, deleteAdminFormation, updateAdminFormation, AdminFormation } from '@/lib/adminApi';

const armyTypeLabels: Record<string, string> = {
  CAVALRY: 'Kỵ',
  SHIELD: 'Khiên',
  ARCHER: 'Cung',
  SPEAR: 'Thương',
  SIEGE: 'Xe',
};

const armyTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  CAVALRY: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  SHIELD: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  ARCHER: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  SPEAR: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  SIEGE: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
};

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<AdminFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [armyTypeFilter, setArmyTypeFilter] = useState('');
  const [curatedFilter, setCuratedFilter] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadFormations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAdminFormations({
          search: searchQuery || undefined,
          armyType: armyTypeFilter || undefined,
          curated: curatedFilter || undefined,
          sort: sortBy,
          page: currentPage,
          limit: 20,
        });

        setFormations(response.formations);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        console.error('Error loading formations:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách đội hình');
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, [searchQuery, armyTypeFilter, curatedFilter, sortBy, currentPage, refreshTrigger]);

  const refreshFormations = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đội hình này?')) {
      return;
    }

    try {
      await deleteAdminFormation(id);
      refreshFormations();
    } catch (err) {
      console.error('Error deleting formation:', err);
      alert(err instanceof Error ? err.message : 'Không thể xóa đội hình');
    }
  };

  const handleToggleCurated = async (formation: AdminFormation) => {
    try {
      await updateAdminFormation(formation.id, {
        isCurated: !formation.isCurated,
      });
      refreshFormations();
    } catch (err) {
      console.error('Error toggling curated status:', err);
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  const handleTogglePublic = async (formation: AdminFormation) => {
    try {
      await updateAdminFormation(formation.id, {
        isPublic: !formation.isPublic,
      });
      refreshFormations();
    } catch (err) {
      console.error('Error toggling public status:', err);
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Quản lý Đội hình</h1>
        <Link
          href="/admin/formations/new"
          className="btn-primary"
        >
          + Tạo đội hình đề xuất
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tên đội hình hoặc tướng..."
              className="input w-full"
            />
          </div>

          {/* Army Type Filter */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Binh chủng</label>
            <select
              value={armyTypeFilter}
              onChange={(e) => {
                setArmyTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            >
              <option value="">Tất cả</option>
              <option value="CAVALRY">Kỵ</option>
              <option value="SHIELD">Khiên</option>
              <option value="ARCHER">Cung</option>
              <option value="SPEAR">Thương</option>
              <option value="SIEGE">Xe</option>
            </select>
          </div>

          {/* Curated Filter */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Loại</label>
            <select
              value={curatedFilter}
              onChange={(e) => {
                setCuratedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            >
              <option value="">Tất cả</option>
              <option value="true">Chỉ đề xuất</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="input w-full"
            >
              <option value="rank">Xếp hạng</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          Đang tải...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-red-500/10 border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Formations List */}
      {!loading && !error && (
        <>
          {formations.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              Không tìm thấy đội hình nào
            </div>
          ) : (
            <div className="space-y-4">
              {formations.map((formation) => {
                const armyColors = armyTypeColors[formation.armyType] || armyTypeColors.CAVALRY;

                return (
                  <div key={formation.id} className="card p-4">
                    <div className="flex gap-4">
                      {/* General Previews */}
                      <div className="flex gap-2">
                        {formation.generals.slice(0, 3).map((gen, idx) => (
                          <div key={idx} className="w-16">
                            <div className="aspect-[7/10] rounded overflow-hidden bg-[var(--bg-secondary)] relative">
                              {gen.general.image ? (
                                <Image
                                  src={gen.general.image}
                                  alt={gen.general.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                                  ?
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Formation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1 truncate">
                              {formation.name}
                            </h3>
                            {formation.description && (
                              <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                                {formation.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-0.5 text-xs font-medium border ${armyColors.bg} ${armyColors.text} ${armyColors.border}`}>
                                {armyTypeLabels[formation.armyType] || formation.armyType}
                              </span>
                              <span className="text-sm text-[var(--text-secondary)]">
                                COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold">{formation.totalCost}</span>
                              </span>
                              {formation.isCurated && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]">
                                  Đề xuất
                                </span>
                              )}
                              {!formation.isPublic && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500">
                                  Riêng tư
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                              <span>Điểm: {formation.rankScore}</span>
                              <span>Votes: {formation.voteCount}</span>
                              {formation.user && (
                                <span>Tạo bởi: {formation.user.displayName}</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/formations/${formation.id}`}
                              className="text-sm text-blue-400 hover:text-blue-300"
                              target="_blank"
                            >
                              Xem
                            </Link>
                            <button
                              onClick={() => handleToggleCurated(formation)}
                              className="text-sm text-[var(--accent)] hover:text-[var(--accent)]/80"
                            >
                              {formation.isCurated ? 'Bỏ đề xuất' : 'Đánh dấu đề xuất'}
                            </button>
                            <button
                              onClick={() => handleTogglePublic(formation)}
                              className="text-sm text-green-400 hover:text-green-300"
                            >
                              {formation.isPublic ? 'Ẩn' : 'Công khai'}
                            </button>
                            <button
                              onClick={() => handleDelete(formation.id)}
                              className="text-sm text-red-400 hover:text-red-300"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              <span className="text-[var(--text-secondary)]">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
