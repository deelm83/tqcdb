'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminFormation } from '@/lib/adminApi';
import { fetchAdminGenerals } from '@/lib/adminApi';
import { fetchSkillsList } from '@/lib/adminApi';
import type { General } from '@/lib/api';
import type { SkillOption } from '@/lib/adminApi';

const armyTypeLabels: Record<string, string> = {
  CAVALRY: 'Kỵ',
  SHIELD: 'Khiên',
  ARCHER: 'Cung',
  SPEAR: 'Thương',
  SIEGE: 'Xe',
};

interface FormationGeneral {
  generalId: string;
  position: number;
  skill1Id?: number;
  skill2Id?: number;
}

export default function NewAdminFormationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [armyType, setArmyType] = useState<string>('CAVALRY');
  const [isCurated, setIsCurated] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [generals, setGenerals] = useState<FormationGeneral[]>([]);

  const [availableGenerals, setAvailableGenerals] = useState<General[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load generals and skills
  useEffect(() => {
    const loadData = async () => {
      try {
        const [generalsData, skillsData] = await Promise.all([
          fetchAdminGenerals(),
          fetchSkillsList(),
        ]);
        setAvailableGenerals(generalsData);
        setAvailableSkills(skillsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addGeneral = () => {
    if (generals.length >= 3) {
      alert('Chỉ có thể thêm tối đa 3 tướng');
      return;
    }
    const newPosition = generals.length + 1;
    setGenerals([...generals, { generalId: '', position: newPosition }]);
  };

  const removeGeneral = (index: number) => {
    const newGenerals = generals.filter((_, i) => i !== index);
    // Reposition
    const reindexed = newGenerals.map((g, i) => ({ ...g, position: i + 1 }));
    setGenerals(reindexed);
  };

  const updateGeneral = (index: number, field: keyof FormationGeneral, value: string | number) => {
    const newGenerals = [...generals];
    if (field === 'generalId') {
      newGenerals[index].generalId = value as string;
    } else if (field === 'skill1Id' || field === 'skill2Id') {
      newGenerals[index][field] = value ? Number(value) : undefined;
    }
    setGenerals(newGenerals);
  };

  const calculateTotalCost = () => {
    return generals.reduce((sum, gen) => {
      const general = availableGenerals.find((g) => g.id === gen.generalId);
      return sum + (general?.cost || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập tên đội hình');
      return;
    }

    if (!armyType) {
      alert('Vui lòng chọn binh chủng');
      return;
    }

    if (generals.length === 0) {
      alert('Vui lòng thêm ít nhất 1 tướng');
      return;
    }

    if (generals.some((g) => !g.generalId)) {
      alert('Vui lòng chọn tướng cho tất cả các vị trí');
      return;
    }

    const totalCost = calculateTotalCost();
    if (totalCost > 21) {
      alert(`Tổng COST vượt quá 21. COST hiện tại: ${totalCost}`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createAdminFormation({
        name: name.trim(),
        description: description.trim() || undefined,
        armyType,
        isCurated,
        isPublic,
        generals: generals.map((g) => ({
          generalId: g.generalId,
          position: g.position,
          skill1Id: g.skill1Id,
          skill2Id: g.skill2Id,
        })),
      });

      router.push('/admin/formations');
    } catch (err) {
      console.error('Error creating formation:', err);
      setError(err instanceof Error ? err.message : 'Không thể tạo đội hình');
      setSaving(false);
    }
  };

  const totalCost = calculateTotalCost();
  const costWarning = totalCost > 21;

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tạo đội hình đề xuất</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Hủy
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Basic Info */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Thông tin cơ bản</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Tên đội hình <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="VD: Thục Hán Tam Kiệt"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Mô tả về đội hình..."
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Binh chủng <span className="text-red-400">*</span>
              </label>
              <select
                value={armyType}
                onChange={(e) => setArmyType(e.target.value)}
                className="input w-full"
                required
              >
                {Object.entries(armyTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCurated}
                  onChange={(e) => setIsCurated(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[var(--text-secondary)]">Đánh dấu là đội hình đề xuất</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[var(--text-secondary)]">Công khai</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cost Indicator */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Tổng COST:</span>
            <span className={`text-2xl font-bold ${
              costWarning ? 'text-red-400' : totalCost === 21 ? 'text-[var(--accent)]' : 'text-green-400'
            }`} style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }}>
              {totalCost} / 21
            </span>
          </div>
          {costWarning && (
            <div className="text-sm text-red-400 mt-2">
              Vượt quá giới hạn! Vui lòng giảm COST.
            </div>
          )}
        </div>

        {/* Generals */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Võ tướng</h2>
            <button
              type="button"
              onClick={addGeneral}
              className="btn-secondary text-sm"
              disabled={generals.length >= 3}
            >
              + Thêm tướng
            </button>
          </div>

          {generals.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
              Chưa có tướng nào. Nhấn &quot;Thêm tướng&quot; để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {generals.map((gen, index) => {
                const selectedGeneral = availableGenerals.find((g) => g.id === gen.generalId);

                return (
                  <div key={index} className="border border-[var(--border)] p-4 rounded">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-[var(--text-primary)]">Vị trí {gen.position}</h3>
                      <button
                        type="button"
                        onClick={() => removeGeneral(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* General Selection */}
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">
                          Võ tướng <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={gen.generalId}
                          onChange={(e) => updateGeneral(index, 'generalId', e.target.value)}
                          className="input w-full"
                          required
                        >
                          <option value="">-- Chọn tướng --</option>
                          {availableGenerals.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} (COST: {g.cost})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Show innate skill if general selected */}
                      {selectedGeneral?.innate_skill && (
                        <div className="text-sm text-[var(--text-tertiary)]">
                          Tự mang: {selectedGeneral.innate_skill.name}
                        </div>
                      )}

                      {/* Skill 1 */}
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Chiến pháp 1</label>
                        <select
                          value={gen.skill1Id || ''}
                          onChange={(e) => updateGeneral(index, 'skill1Id', e.target.value)}
                          className="input w-full"
                        >
                          <option value="">-- Không chọn --</option>
                          {availableSkills.map((s) => (
                            <option key={s.id} value={s.id}>
                              [{s.quality}] {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Skill 2 */}
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Chiến pháp 2</label>
                        <select
                          value={gen.skill2Id || ''}
                          onChange={(e) => updateGeneral(index, 'skill2Id', e.target.value)}
                          className="input w-full"
                        >
                          <option value="">-- Không chọn --</option>
                          {availableSkills.map((s) => (
                            <option key={s.id} value={s.id}>
                              [{s.quality}] {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="card p-4 bg-red-500/10 border-red-500/30 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || costWarning}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : 'Tạo đội hình'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={saving}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
