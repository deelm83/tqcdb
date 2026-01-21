'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { use } from 'react';
import {
  getLineup,
  updateLineup,
  resolveSkillConflict,
  unresolveSkillConflict,
  type LineUpDetail,
} from '@/lib/lineupsApi';
import ConflictIndicator from '@/components/lineups/ConflictIndicator';

export default function LineupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [lineup, setLineup] = useState<LineUpDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadLineup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLineup(resolvedParams.id);
      setLineup(data);
      setEditedName(data.name);
    } catch (err) {
      console.error('Error loading lineup:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dàn trận');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadLineup();
  }, [loadLineup]);

  async function handleResolveSkill(skillId: number) {
    if (!lineup) return;

    try {
      await resolveSkillConflict(lineup.id, skillId);
      // Reload to get updated data
      await loadLineup();
    } catch (err) {
      console.error('Error resolving skill conflict:', err);
      alert(err instanceof Error ? err.message : 'Không thể giải quyết xung đột');
    }
  }

  async function handleUnresolveSkill(skillId: number) {
    if (!lineup) return;

    try {
      await unresolveSkillConflict(lineup.id, skillId);
      // Reload to get updated data
      await loadLineup();
    } catch (err) {
      console.error('Error unresolving skill conflict:', err);
      alert(err instanceof Error ? err.message : 'Không thể bỏ đánh dấu giải quyết');
    }
  }

  async function handleSaveName() {
    if (!lineup || editedName === lineup.name) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      await updateLineup(lineup.id, { name: editedName });
      setIsEditing(false);
      await loadLineup();
    } catch (err) {
      console.error('Error updating lineup name:', err);
      alert(err instanceof Error ? err.message : 'Không thể cập nhật tên');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getArmyTypeLabel(armyType: string): string {
    const map: Record<string, string> = {
      CAVALRY: 'Kỵ',
      cavalry: 'Kỵ',
      SHIELD: 'Khiên',
      shield: 'Khiên',
      ARCHER: 'Cung',
      archer: 'Cung',
      SPEAR: 'Thương',
      spear: 'Thương',
      SIEGE: 'Xe',
      siege: 'Xe',
    };
    return map[armyType] || armyType;
  }

  function getArmyTypeBadgeClass(armyType: string): string {
    const map: Record<string, string> = {
      CAVALRY: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      cavalry: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      SHIELD: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
      shield: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
      ARCHER: 'border-green-500/30 bg-green-500/10 text-green-400',
      archer: 'border-green-500/30 bg-green-500/10 text-green-400',
      SPEAR: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      spear: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      SIEGE: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      siege: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    };
    return map[armyType] || 'border-gray-500/30 bg-gray-500/10 text-gray-400';
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

  if (error || !lineup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded border border-red-500/20 bg-red-500/10 p-6">
          <h3 className="mb-2 font-semibold text-red-400">Lỗi</h3>
          <p className="text-sm text-red-300">{error || 'Không tìm thấy dàn trận'}</p>
          <Link
            href="/lineups"
            className="mt-4 inline-block rounded bg-[var(--bg-tertiary)] px-6 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const hasGeneralConflicts = lineup.generalConflicts.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/lineups"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>

        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex flex-1 items-center gap-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving || !editedName.trim()}
                className="rounded bg-[var(--accent-gold)] px-6 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/80 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setEditedName(lineup.name);
                  setIsEditing(false);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-6 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                Hủy
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">{lineup.name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-6 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                Sửa tên
              </button>
            </>
          )}
        </div>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cập nhật: {formatDate(lineup.updatedAt)}
        </p>
      </div>

      {/* Conflict Detection Panel */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Kiểm tra xung đột</h2>
        <ConflictIndicator
          generalConflicts={lineup.generalConflicts}
          skillConflicts={lineup.skillConflicts}
          onResolveSkill={handleResolveSkill}
          onUnresolveSkill={handleUnresolveSkill}
        />
      </div>

      {/* Formations */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          Các đội hình ({lineup.formations.length})
        </h2>
        <div className="space-y-4">
          {lineup.formations.map((formation, index) => {
            // Check if this formation has any conflicts
            const formationGeneralConflicts = lineup.generalConflicts.filter(gc =>
              gc.formationIds.includes(formation.id)
            );
            const formationSkillConflicts = lineup.skillConflicts.filter(sc =>
              sc.formationIds.includes(formation.id)
            );

            return (
              <div
                key={formation.id}
                className="rounded border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
                      Đội {index + 1}: {formation.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <span className={`rounded-full border px-3 py-1 text-xs ${getArmyTypeBadgeClass(formation.armyType)}`}>
                        {getArmyTypeLabel(formation.armyType)}
                      </span>
                      <span>COST: {formation.totalCost}</span>
                    </div>
                  </div>
                </div>

                {/* Generals grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {formation.generals.map((fg) => {
                    const hasConflict = formationGeneralConflicts.some(
                      gc => gc.generalId === fg.general.id
                    );

                    return (
                      <div
                        key={fg.id}
                        className={`rounded border ${
                          hasConflict
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)]/30'
                        } p-4`}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          {fg.general.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fg.general.image}
                              alt={fg.general.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-serif font-semibold text-[var(--text-primary)]">{fg.general.name}</p>
                              {hasConflict && (
                                <span className="text-xs text-red-400">⚠️</span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">COST: {fg.general.cost}</p>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2 text-sm">
                          {fg.skill1 && (
                            <div className="text-[var(--text-primary)]">
                              <span className="text-[var(--text-muted)]">Chiến pháp 1:</span> {fg.skill1.name}
                            </div>
                          )}
                          {fg.skill2 && (
                            <div className="text-[var(--text-primary)]">
                              <span className="text-[var(--text-muted)]">Chiến pháp 2:</span> {fg.skill2.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formation-specific conflicts */}
                {(formationGeneralConflicts.length > 0 || formationSkillConflicts.length > 0) && (
                  <div className="mt-4 rounded border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="text-xs text-yellow-300">
                      Đội hình này có {formationGeneralConflicts.length} xung đột võ tướng
                      {formationSkillConflicts.length > 0 && ` và ${formationSkillConflicts.length} xung đột chiến pháp`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning if has conflicts */}
      {hasGeneralConflicts && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            ⚠️ Dàn trận có xung đột võ tướng. Hãy xóa hoặc thay thế các võ tướng trùng lặp giữa các đội hình.
          </p>
        </div>
      )}
    </div>
  );
}
