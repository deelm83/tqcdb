'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchSuggestions, type Suggestion } from '@/lib/adminApi';
import { usePageTitle } from '@/hooks/usePageTitle';

type StatusFilter = 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
type EntityTypeFilter = 'all' | 'general' | 'skill';

function AdminSuggestionsContent() {
  usePageTitle('Đề xuất chỉnh sửa', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Read filters from URL
  const search = searchParams.get('q') || '';
  const selectedStatus = (searchParams.get('status') || 'all') as StatusFilter;
  const selectedEntityType = (searchParams.get('entityType') || 'all') as EntityTypeFilter;

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
    updateFilters({ q: value || null });
  }, [updateFilters]);

  const setSelectedStatus = useCallback((value: StatusFilter) => {
    updateFilters({ status: value === 'all' ? null : value });
  }, [updateFilters]);

  const setSelectedEntityType = useCallback((value: EntityTypeFilter) => {
    updateFilters({ entityType: value === 'all' ? null : value });
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    router.replace('', { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const params: Parameters<typeof fetchSuggestions>[0] = {
          limit: 50,
          offset: 0,
        };

        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }

        if (selectedEntityType !== 'all') {
          params.entityType = selectedEntityType;
        }

        const data = await fetchSuggestions(params);
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadSuggestions();
    }
  }, [isAuthenticated, selectedStatus, selectedEntityType]);

  // Filter by search query (client-side)
  const filteredSuggestions = suggestions.filter((s) => {
    if (search) {
      const searchLower = search.toLowerCase();
      // Search in entity_id, user name, and changes
      const changesText = Object.keys(s.changes).join(' ').toLowerCase();
      return (
        s.entity_id.toLowerCase().includes(searchLower) ||
        s.user.display_name.toLowerCase().includes(searchLower) ||
        changesText.includes(searchLower)
      );
    }
    return true;
  });

  const hasFilters = search || selectedStatus !== 'all' || selectedEntityType !== 'all';

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Check if selected suggestions are for same entity
  const selectedSuggestions = suggestions.filter(s => selectedIds.includes(s.id));
  const canSummarize = selectedSuggestions.length > 1 &&
    selectedSuggestions.every(s =>
      s.entity_type === selectedSuggestions[0].entity_type &&
      s.entity_id === selectedSuggestions[0].entity_id
    );

  const handleSummarize = () => {
    if (canSummarize && selectedIds.length > 0) {
      router.push(`/admin/suggestions/summarize?ids=${selectedIds.join(',')}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Chờ duyệt</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">Đã chấp nhận</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-full">Đã từ chối</span>;
      default:
        return null;
    }
  };

  const getEntityTypeBadge = (type: string) => {
    switch (type) {
      case 'general':
        return <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">Võ tướng</span>;
      case 'skill':
        return <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-full">Chiến pháp</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const pendingCount = suggestions.filter(s => s.status === 'PENDING').length;
  const acceptedCount = suggestions.filter(s => s.status === 'ACCEPTED').length;
  const rejectedCount = suggestions.filter(s => s.status === 'REJECTED').length;

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--accent)]">Đề xuất chỉnh sửa</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-tertiary)]">Tổng cộng:</span>
            <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">{pendingCount} chờ duyệt</span>
            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded">{acceptedCount} đã chấp nhận</span>
            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded">{rejectedCount} đã từ chối</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="ACCEPTED">Đã chấp nhận</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value as EntityTypeFilter)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-lg focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">Tất cả loại</option>
              <option value="general">Võ tướng</option>
              <option value="skill">Chiến pháp</option>
            </select>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-lg placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              onClick={handleSummarize}
              disabled={!canSummarize}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                canSummarize
                  ? 'bg-[#5865F2] text-white hover:bg-[#4752C4]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Tổng hợp
            </button>
          </div>

          {hasFilters && (
            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Bulk select info */}
        {selectedIds.length > 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-4 flex items-center justify-between">
            <span>
              Đã chọn <strong>{selectedIds.length}</strong> đề xuất
              {canSummarize && ' cho cùng một đối tượng'}
            </span>
            {canSummarize && (
              <button
                onClick={handleSummarize}
                className="px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Tổng hợp đề xuất
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-[var(--text-secondary)] py-8">
            <span className="spinner mr-2" />
            Đang tải...
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/suggestions/${suggestion.id}`)}
              >
                <div className="flex items-start gap-4">
                  {suggestion.status === 'PENDING' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(suggestion.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(suggestion.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg)]"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(suggestion.status)}
                      {getEntityTypeBadge(suggestion.entity_type)}
                      <span className="text-[var(--text-tertiary)] text-sm">
                        {formatTimeAgo(suggestion.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                      {suggestion.entity_id}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[var(--text-tertiary)]">
                        Người gửi: <span className="text-[var(--text-primary)]">{suggestion.user.display_name}</span>
                      </span>
                      <span className="text-[var(--text-tertiary)]">
                        Thay đổi: <span className="text-[var(--accent)]">{Object.keys(suggestion.changes).join(', ')}</span>
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}

            {filteredSuggestions.length === 0 && (
              <div className="text-center text-[var(--text-secondary)] py-8">
                Không tìm thấy đề xuất nào
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminSuggestionsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] shimmer mb-6" />
          <div className="card p-4 mb-6 space-y-4">
            <div className="h-10 bg-[var(--bg-secondary)] shimmer" />
          </div>
        </div>
      </main>
    }>
      <AdminSuggestionsContent />
    </Suspense>
  );
}
