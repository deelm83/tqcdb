'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLineups, deleteLineup, type LineUpSummary } from '@/lib/lineupsApi';

export default function LineupsPage() {
  const router = useRouter();
  const [lineups, setLineups] = useState<LineUpSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadLineups();
  }, []);

  async function loadLineups() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLineups();
      setLineups(data.lineups);
    } catch (err) {
      console.error('Error loading lineups:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách dàn trận');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa dàn trận "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLineup(id);
      setLineups(lineups.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting lineup:', err);
      alert(err instanceof Error ? err.message : 'Không thể xóa dàn trận');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-gold)] border-t-transparent"></div>
            <p className="text-[var(--text-secondary)]">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded border border-red-500/20 bg-red-500/10 p-6">
          <h3 className="mb-2 font-semibold text-red-400">Lỗi</h3>
          <p className="text-sm text-red-300">{error}</p>
          {error.includes('đăng nhập') && (
            <Link
              href="/auth/login"
              className="mt-4 inline-block rounded bg-[var(--accent-gold)] px-6 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/80"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dàn Trận của tôi</h1>
        <Link
          href="/lineups/create"
          className="rounded bg-[var(--accent-gold)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/80"
        >
          + Tạo Dàn Trận
        </Link>
      </div>

      {/* Empty state */}
      {lineups.length === 0 && (
        <div className="rounded border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-[var(--text-secondary)]">Chưa có dàn trận nào</h3>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Tạo dàn trận để quản lý nhiều đội hình cho trận chiến
          </p>
          <Link
            href="/lineups/create"
            className="inline-block rounded bg-[var(--accent-gold)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/80"
          >
            Tạo Dàn Trận Đầu Tiên
          </Link>
        </div>
      )}

      {/* Line-ups list */}
      <div className="space-y-4">
        {lineups.map((lineup) => (
          <div
            key={lineup.id}
            className="rounded border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-6 transition-colors hover:border-[var(--border)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">{lineup.name}</h2>
                <div className="mb-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <span>{lineup.formationCount} đội hình</span>
                  <span>•</span>
                  <span>Cập nhật: {formatDate(lineup.updatedAt)}</span>
                </div>

                {/* Conflict indicators */}
                <div className="flex flex-wrap gap-2">
                  {lineup.generalConflicts > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {lineup.generalConflicts} xung đột võ tướng
                    </span>
                  )}
                  {lineup.unresolvedSkillConflicts > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lineup.unresolvedSkillConflicts} xung đột chiến pháp
                    </span>
                  )}
                  {lineup.skillConflicts > 0 && lineup.unresolvedSkillConflicts === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {lineup.skillConflicts} xung đột đã giải quyết
                    </span>
                  )}
                  {lineup.generalConflicts === 0 && lineup.skillConflicts === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Không có xung đột
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/lineups/${lineup.id}`)}
                  className="rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  Xem
                </button>
                <button
                  onClick={() => handleDelete(lineup.id, lineup.name)}
                  disabled={deletingId === lineup.id}
                  className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId === lineup.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
