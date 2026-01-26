'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLineup } from '@/lib/lineupsApi';
import { getFormations, Formation } from '@/lib/formationsApi';

export default function CreateLineupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [availableFormations, setAvailableFormations] = useState<Formation[]>([]);
  const [selectedFormationIds, setSelectedFormationIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generalConflicts, setGeneralConflicts] = useState<string[]>([]);

  useEffect(() => {
    loadUserFormations();
  }, []);

  useEffect(() => {
    // Check for general conflicts when selection changes
    const selectedFormations = availableFormations.filter(f =>
      selectedFormationIds.includes(f.id)
    );

    const generalUsage = new Map<string, number>();
    selectedFormations.forEach(formation => {
      formation.generals.forEach(fg => {
        const count = generalUsage.get(fg.generalId) || 0;
        generalUsage.set(fg.generalId, count + 1);
      });
    });

    const conflicts = Array.from(generalUsage.entries())
      .filter(([, count]) => count > 1)
      .map(([generalId]) => generalId);

    setGeneralConflicts(conflicts);
  }, [selectedFormationIds, availableFormations]);

  async function loadUserFormations() {
    try {
      setLoading(true);
      setError(null);
      // Load user's formations
      const response = await getFormations({ tab: 'mine', limit: 100 });
      setAvailableFormations(response.formations);
    } catch (err) {
      console.error('Error loading formations:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đội hình');
    } finally {
      setLoading(false);
    }
  }

  function toggleFormation(formationId: number) {
    if (selectedFormationIds.includes(formationId)) {
      setSelectedFormationIds(selectedFormationIds.filter(id => id !== formationId));
    } else {
      setSelectedFormationIds([...selectedFormationIds, formationId]);
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      alert('Vui lòng nhập tên dàn trận');
      return;
    }

    if (selectedFormationIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 đội hình');
      return;
    }

    if (generalConflicts.length > 0) {
      alert('Có xung đột võ tướng. Vui lòng bỏ chọn các đội hình có võ tướng trùng lặp.');
      return;
    }

    try {
      setCreating(true);
      const result = await createLineup({
        name: name.trim(),
        formationIds: selectedFormationIds.map(id => String(id)),
      });

      // Navigate to the created lineup
      router.push(`/lineups/${result.id}`);
    } catch (err) {
      console.error('Error creating lineup:', err);
      alert(err instanceof Error ? err.message : 'Không thể tạo dàn trận');
    } finally {
      setCreating(false);
    }
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

  function isFormationConflicted(formation: Formation): boolean {
    return formation.generals.some(fg => generalConflicts.includes(fg.generalId));
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"></div>
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

        <h1 className="mb-6 text-3xl font-bold text-[var(--text-primary)]">Tạo Dàn Trận</h1>

        {/* Name input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Tên dàn trận <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Dàn trận PVP Season 3"
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {/* Selection info */}
        <div className="mb-4 flex items-center justify-between rounded border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              Đã chọn: <span className="font-semibold text-[var(--text-primary)]">{selectedFormationIds.length}</span> đội hình
            </p>
            {generalConflicts.length > 0 && (
              <p className="mt-1 text-xs text-red-400">
                ⚠️ {generalConflicts.length} xung đột võ tướng
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/lineups')}
              className="rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-6 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || selectedFormationIds.length === 0 || generalConflicts.length > 0}
              className="rounded bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Đang tạo...' : 'Tạo Dàn Trận'}
            </button>
          </div>
        </div>
      </div>

      {/* Formations list */}
      {availableFormations.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-[var(--text-secondary)]">Chưa có đội hình nào</h3>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Bạn cần tạo đội hình trước khi tạo dàn trận
          </p>
          <Link
            href="/formations/create"
            className="inline-block rounded bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Tạo Đội Hình
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Chọn đội hình ({availableFormations.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableFormations.map((formation) => {
              const isSelected = selectedFormationIds.includes(formation.id);
              const isConflicted = isFormationConflicted(formation);

              return (
                <button
                  key={formation.id}
                  onClick={() => toggleFormation(formation.id)}
                  disabled={!isSelected && isConflicted}
                  className={`rounded border p-4 text-left transition-all ${
                    isSelected
                      ? isConflicted
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : isConflicted
                      ? 'border-red-500/30 bg-red-500/5 opacity-50 cursor-not-allowed'
                      : 'border-[var(--border)] bg-[var(--bg-secondary)]/50 hover:border-[var(--border)]'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-[var(--text-primary)]">{formation.name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${getArmyTypeBadgeClass(formation.armyType)}`}>
                          {getArmyTypeLabel(formation.armyType)}
                        </span>
                        <span className="text-[var(--text-secondary)]">COST: {formation.totalCost}</span>
                      </div>
                    </div>
                    <div className={`rounded-full border-2 p-0.5 ${isSelected ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                      {isSelected && (
                        <svg className="h-5 w-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Generals preview */}
                  <div className="flex gap-2">
                    {formation.generals.slice(0, 3).map((fg, idx) => (
                      <div key={fg.generalId || idx} className="flex-1">
                        {fg.generalImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fg.generalImage}
                            alt={fg.generalName || ''}
                            className="h-12 w-full rounded object-cover"
                          />
                        )}
                        <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{fg.generalName || 'Trống'}</p>
                      </div>
                    ))}
                  </div>

                  {isConflicted && (
                    <p className="mt-2 text-xs text-red-400">
                      ⚠️ Có xung đột với đội hình đã chọn
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
