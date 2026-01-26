'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminSkills, fetchAdminGenerals, updateSkill, deleteSkill } from '@/lib/adminApi';
import { showToast } from '@/components/Toast';
import Link from 'next/link';
import { General, Skill } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';

const TARGET_OPTIONS = [
  { id: '', label: 'Chưa chọn' },
  { id: 'self', label: 'Bản thân' },
  { id: 'ally_1', label: '1 đồng minh' },
  { id: 'ally_2', label: '2 đồng minh' },
  { id: 'ally_all', label: 'Tất cả quân ta' },
  { id: 'ally_1_2', label: '1-2 đồng minh' },
  { id: 'ally_2_3', label: '2-3 đồng minh' },
  { id: 'enemy_1', label: '1 địch' },
  { id: 'enemy_2', label: '2 địch' },
  { id: 'enemy_all', label: 'Tất cả địch' },
  { id: 'enemy_1_2', label: '1-2 địch' },
  { id: 'enemy_2_3', label: '2-3 địch' },
];

const SKILL_TYPES = [
  { id: 'command', nameVi: 'Chỉ Huy', color: 'bg-yellow-600/30 text-yellow-300 border-yellow-600/50' },
  { id: 'active', nameVi: 'Chủ Động', color: 'bg-red-600/30 text-red-300 border-red-600/50' },
  { id: 'passive', nameVi: 'Bị Động', color: 'bg-green-600/30 text-green-300 border-green-600/50' },
  { id: 'pursuit', nameVi: 'Truy Kích', color: 'bg-cyan-600/30 text-cyan-300 border-cyan-600/50' },
  { id: 'assault', nameVi: 'Đột Kích', color: 'bg-orange-600/30 text-orange-300 border-orange-600/50' },
  { id: 'formation', nameVi: 'Pháp Trận', color: 'bg-purple-600/30 text-purple-300 border-purple-600/50' },
  { id: 'troop', nameVi: 'Binh Chủng', color: 'bg-blue-600/30 text-blue-300 border-blue-600/50' },
  { id: 'internal', nameVi: 'Nội Chính', color: 'bg-teal-600/30 text-teal-300 border-teal-600/50' },
];

function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

interface SkillEdit {
  id: number;
  slug: string;
  name: string;
  typeId: string;
  typeName: string;
  triggerRate: number | null;
  target: string;
  acquisitionType: string;
  innateGeneralIds: string[];
  inheritGeneralIds: string[];
  exchangeGeneralIds: string[];
  exchangeCount: number;
  screenshots: string[];
  status: string;
  saving: boolean;
  changed: boolean;
}

const ITEMS_PER_PAGE = 20;

export default function MassEditSkillsPage() {
  usePageTitle('Sửa nhanh chiến pháp', true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [skills, setSkills] = useState<SkillEdit[]>([]);
  const [generals, setGenerals] = useState<General[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [skillsData, generalsData] = await Promise.all([
          fetchAdminSkills(),
          fetchAdminGenerals(),
        ]);

        // Filter only needs_update and sort alphabetically
        const sortedSkills = skillsData
          .filter((s: any) => s.status === 'needs_update')
          .map((s: any) => ({
            id: s.id,
            slug: s.slug || '',
            name: s.name || '',
            typeId: s.type?.id || '',
            typeName: s.type?.name || '',
            triggerRate: s.trigger_rate ?? null,
            target: s.target || '',
            acquisitionType: s.acquisition_type || '',
            innateGeneralIds: s.innate_general_ids || [],
            inheritGeneralIds: s.inherit_general_ids || [],
            exchangeGeneralIds: s.exchange_general_ids || [],
            exchangeCount: s.exchange_count || 0,
            screenshots: s.screenshots || [],
            status: s.status || 'needs_update',
            saving: false,
            changed: false,
          }))
          .sort((a: SkillEdit, b: SkillEdit) =>
            normalizeVietnamese(a.name).localeCompare(normalizeVietnamese(b.name))
          );
        setSkills(sortedSkills);
        setGenerals(generalsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const updateSkillField = useCallback((id: number, field: keyof SkillEdit, value: any) => {
    setSkills(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value, changed: true } : s
    ));
  }, []);

  const saveSkill = useCallback(async (skill: SkillEdit, markDone: boolean = false) => {
    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, saving: true } : s));

    try {
      await updateSkill(String(skill.id), {
        name: skill.name,
        type: skill.typeId ? { id: skill.typeId, name: skill.typeName } : undefined,
        trigger_rate: skill.triggerRate ?? undefined,
        target: skill.target || null,
        acquisition_type: skill.acquisitionType || null,
        innate_general_ids: skill.innateGeneralIds,
        inherit_general_ids: skill.inheritGeneralIds,
        exchange_general_ids: skill.exchangeGeneralIds,
        exchange_count: skill.exchangeCount || null,
        status: markDone ? 'complete' : undefined,
      } as any);

      if (markDone) {
        // Remove from list when marked done
        setSkills(prev => prev.filter(s => s.id !== skill.id));
        showToast('Đã lưu và đánh dấu hoàn thành', 'success');
      } else {
        setSkills(prev => prev.map(s =>
          s.id === skill.id ? { ...s, saving: false, changed: false } : s
        ));
        showToast('Đã lưu', 'success');
      }
    } catch (err: any) {
      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, saving: false } : s));
      showToast(err.message || 'Lỗi khi lưu', 'error');
    }
  }, []);

  const handleDeleteSkill = useCallback(async (skill: SkillEdit) => {
    if (!confirm(`Xóa chiến pháp "${skill.name}"?`)) return;

    try {
      await deleteSkill(String(skill.id));
      setSkills(prev => prev.filter(s => s.id !== skill.id));
      showToast('Đã xóa', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa', 'error');
    }
  }, []);

  // Filter only - sorting is done once on load to keep order stable during editing
  const filteredSkills = skills
    .filter(s => !searchQuery || normalizeVietnamese(s.name).includes(normalizeVietnamese(searchQuery)));

  const totalPages = Math.ceil(filteredSkills.length / ITEMS_PER_PAGE);
  const paginatedSkills = filteredSkills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/skills"
              className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </Link>
            <h1 className="text-xl font-bold text-[var(--accent)]">Sửa nhanh chiến pháp</h1>
          </div>
          <div className="text-sm text-[var(--text-tertiary)]">
            {filteredSkills.length > 0 ? (
              <>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSkills.length)} / {filteredSkills.length} chiến pháp
              </>
            ) : (
              '0 chiến pháp'
            )}
          </div>
        </div>

        {/* Search and Pagination */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên..."
            className="flex-1 min-w-[200px] max-w-md px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-tertiary)] text-[var(--text-secondary)] rounded text-sm transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and neighbors
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="text-[var(--text-tertiary)] px-1">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-tertiary)] text-[var(--text-secondary)] rounded text-sm transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-[var(--text-tertiary)] py-8">Đang tải...</div>
        ) : (
          <div className="space-y-3">
            {paginatedSkills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                generals={generals}
                onUpdate={updateSkillField}
                onSave={saveSkill}
                onDelete={handleDeleteSkill}
                onImageClick={setModalImage}
              />
            ))}
          </div>
        )}

        {/* Image Modal */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setModalImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setModalImage(null)}
                className="absolute -top-10 right-0 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={modalImage}
                alt="Screenshot"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

interface SkillRowProps {
  skill: SkillEdit;
  generals: General[];
  onUpdate: (id: number, field: keyof SkillEdit, value: any) => void;
  onSave: (skill: SkillEdit, markDone?: boolean) => void;
  onDelete: (skill: SkillEdit) => void;
  onImageClick: (url: string) => void;
}

function SkillRow({ skill, generals, onUpdate, onSave, onDelete, onImageClick }: SkillRowProps) {
  const [generalSearch, setGeneralSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState<'innate' | 'inherit' | 'exchange' | null>(null);

  const getGeneralName = (id: string) => {
    const general = generals.find(g => g.id === id);
    return general?.name || id;
  };

  const filteredGenerals = generals.filter(g =>
    normalizeVietnamese(g.name).includes(normalizeVietnamese(generalSearch))
  );

  const addGeneral = (type: 'innate' | 'inherit' | 'exchange', generalId: string) => {
    const field = type === 'innate' ? 'innateGeneralIds' : type === 'inherit' ? 'inheritGeneralIds' : 'exchangeGeneralIds';
    const current = skill[field] as string[];
    if (!current.includes(generalId)) {
      onUpdate(skill.id, field, [...current, generalId]);
      // Also update acquisition type
      onUpdate(skill.id, 'acquisitionType', type);
    }
    setGeneralSearch('');
    setShowDropdown(null);
  };

  const removeGeneral = (type: 'innate' | 'inherit' | 'exchange', generalId: string) => {
    const field = type === 'innate' ? 'innateGeneralIds' : type === 'inherit' ? 'inheritGeneralIds' : 'exchangeGeneralIds';
    const current = skill[field] as string[];
    onUpdate(skill.id, field, current.filter(id => id !== generalId));
  };

  return (
    <div className={`bg-[var(--bg-secondary)] border rounded-lg p-4 ${skill.changed ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
      <div className="flex flex-col gap-3">
        {/* Top row: Screenshot + Actions */}
        <div className="flex gap-4">
          {/* Screenshot - wider for horizontal images */}
          <div className="flex-1">
            {skill.screenshots.length > 0 ? (
              <div
                className="relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--accent)] transition-all bg-[var(--bg)]"
                onClick={() => onImageClick(`/images/skills/${skill.screenshots[0]}`)}
              >
                <img
                  src={`/images/skills/${skill.screenshots[0]}`}
                  alt={skill.name}
                  className="w-full h-auto max-h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {skill.screenshots.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-xs text-[var(--text-secondary)] px-1.5 py-0.5 rounded">
                    +{skill.screenshots.length - 1} ảnh
                  </div>
                )}
              </div>
            ) : (
              <div className="h-24 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--text-tertiary)] text-xs">
                No image
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            <button
              onClick={() => onSave(skill, true)}
              disabled={skill.saving}
              className="px-4 py-2 rounded text-sm font-medium transition-all bg-green-600 hover:bg-green-500 text-[var(--text-primary)] disabled:opacity-50"
            >
              {skill.saving ? '...' : 'Lưu & Xong'}
            </button>
            <button
              onClick={() => onSave(skill, false)}
              disabled={skill.saving || !skill.changed}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                skill.changed
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
              }`}
            >
              {skill.saving ? '...' : 'Lưu'}
            </button>
            <Link
              href={`/admin/skills/${skill.slug || skill.id}`}
              className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded text-sm text-center transition-colors"
            >
              Chi tiết
            </Link>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-3">
          {/* Name */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-tertiary)] w-16">Tên:</label>
            <input
              type="text"
              value={skill.name}
              onChange={(e) => onUpdate(skill.id, 'name', e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Skill Type */}
          <div className="flex items-start gap-2">
            <label className="text-xs text-[var(--text-tertiary)] w-16 pt-1.5">Loại:</label>
            <div className="flex flex-wrap gap-1">
              {SKILL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    onUpdate(skill.id, 'typeId', type.id);
                    onUpdate(skill.id, 'typeName', type.nameVi);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                    skill.typeId === type.id
                      ? type.color
                      : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] border-[var(--border)] hover:border-[var(--border-light)]'
                  }`}
                >
                  {type.nameVi}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Rate */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-tertiary)] w-16">Tỉ lệ:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={skill.triggerRate ?? ''}
              onChange={(e) => onUpdate(skill.id, 'triggerRate', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="%"
              className="w-20 px-3 py-1.5 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none text-center"
            />
            <span className="text-xs text-[var(--text-tertiary)]">%</span>
          </div>

          {/* Target */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-tertiary)] w-16">Mục tiêu:</label>
            <select
              value={skill.target}
              onChange={(e) => onUpdate(skill.id, 'target', e.target.value)}
              className="flex-1 max-w-xs px-3 py-1.5 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              {TARGET_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Acquisition Type */}
          <div className="flex items-start gap-2">
            <label className="text-xs text-[var(--text-tertiary)] w-16 pt-1.5">Nguồn:</label>
            <div className="flex-1">
              {/* Type Tabs */}
              <div className="flex gap-1 mb-2">
                {[
                  { id: 'innate', label: 'Tự mang', icon: '★' },
                  { id: 'inherit', label: 'Kế thừa', icon: '↓' },
                  { id: 'exchange', label: 'Đổi tướng', icon: '⇄' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => onUpdate(skill.id, 'acquisitionType', skill.acquisitionType === type.id ? '' : type.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      skill.acquisitionType === type.id
                        ? 'bg-[var(--accent-dim)] text-white'
                        : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Generals for selected type */}
              {skill.acquisitionType && (
                <div className="relative">
                  {/* Selected generals */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {(skill.acquisitionType === 'innate' ? skill.innateGeneralIds :
                      skill.acquisitionType === 'inherit' ? skill.inheritGeneralIds :
                      skill.exchangeGeneralIds).map(gId => (
                      <span
                        key={gId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-dim)]/30 border border-[var(--accent)] rounded text-xs text-[var(--accent)]"
                      >
                        {getGeneralName(gId)}
                        <button
                          type="button"
                          onClick={() => removeGeneral(skill.acquisitionType as any, gId)}
                          className="text-[var(--accent)] hover:text-[var(--text-primary)]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add general */}
                  <div className="relative">
                    <input
                      type="text"
                      value={showDropdown === skill.acquisitionType ? generalSearch : ''}
                      onChange={(e) => {
                        setGeneralSearch(e.target.value);
                        setShowDropdown(skill.acquisitionType as any);
                      }}
                      onFocus={() => setShowDropdown(skill.acquisitionType as any)}
                      placeholder="Thêm tướng..."
                      className="w-48 px-2 py-1 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-[var(--text-primary)] text-xs focus:border-[var(--accent)] focus:outline-none"
                    />
                    {showDropdown === skill.acquisitionType && generalSearch && (
                      <div className="absolute z-20 mt-1 w-48 max-h-40 overflow-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded shadow-xl">
                        {filteredGenerals.slice(0, 10).map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => addGeneral(skill.acquisitionType as any, g.id)}
                            className="w-full px-2 py-1.5 text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border-b border-[var(--border)]/50 last:border-0"
                          >
                            {g.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exchange count */}
                  {skill.acquisitionType === 'exchange' && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[var(--text-tertiary)]">Số lượng:</span>
                      <input
                        type="number"
                        value={skill.exchangeCount || ''}
                        onChange={(e) => onUpdate(skill.id, 'exchangeCount', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-sm text-[var(--text-primary)] text-center"
                        min={1}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
