'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createSkill, processSkillImage, fetchAdminGenerals } from '@/lib/adminApi';
import { showToast } from '@/components/Toast';
import Link from 'next/link';
import { General } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';
import { usePageTitle } from '@/hooks/usePageTitle';

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

const QUALITIES = ['S', 'A', 'B', 'C'];

const ARMY_TYPES: ArmyIconType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];
const ARMY_TYPE_LABELS: Record<ArmyIconType, string> = {
  cavalry: 'Kỵ',
  shield: 'Thuẫn',
  archer: 'Cung',
  spear: 'Thương',
  siege: 'Khí',
};

const TARGET_OPTIONS = [
  // Allies
  { id: 'self', label: 'Bản thân', category: 'ally' },
  { id: 'ally_1', label: '1 đồng minh', category: 'ally' },
  { id: 'ally_2', label: '2 đồng minh', category: 'ally' },
  { id: 'ally_all', label: 'Tất cả quân ta', category: 'ally' },
  { id: 'ally_1_2', label: '1-2 đồng minh', category: 'ally' },
  { id: 'ally_2_3', label: '2-3 đồng minh', category: 'ally' },
  // Enemies
  { id: 'enemy_1', label: '1 địch', category: 'enemy' },
  { id: 'enemy_2', label: '2 địch', category: 'enemy' },
  { id: 'enemy_all', label: 'Tất cả địch', category: 'enemy' },
  { id: 'enemy_1_2', label: '1-2 địch', category: 'enemy' },
  { id: 'enemy_2_3', label: '2-3 địch', category: 'enemy' },
];

// Normalize Vietnamese text by removing diacritics
function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function NewSkillPage() {
  usePageTitle('Thêm chiến pháp', true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [processingImage, setProcessingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [generals, setGenerals] = useState<General[]>([]);
  const [generalSearch, setGeneralSearch] = useState('');

  const [form, setForm] = useState({
    slug: '',
    name: '',
    typeId: '',
    typeName: '',
    quality: '',
    triggerRate: 0,
    sourceType: '',
    wikiUrl: '',
    effect: '',
    target: '',
    armyTypes: [] as string[],
    innateToGenerals: [] as string[],
    inheritanceFromGenerals: [] as string[],
    innateGeneralIds: [] as string[],
    inheritGeneralIds: [] as string[],
    acquisitionType: '' as string,
    exchangeType: '' as string,
    exchangeGenerals: [] as string[],
    exchangeGeneralIds: [] as string[],
    exchangeCount: 0,
  });
  const [innateSearch, setInnateSearch] = useState('');
  const [inheritSearch, setInheritSearch] = useState('');

  // Load generals for the picker
  useEffect(() => {
    async function loadGenerals() {
      try {
        const data = await fetchAdminGenerals();
        setGenerals(data);
      } catch (err) {
        console.error('Failed to load generals:', err);
      }
    }
    if (isAuthenticated) {
      loadGenerals();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  const handleTypeChange = (typeId: string) => {
    const typeInfo = SKILL_TYPES.find((t) => t.id === typeId);
    setForm((prev) => ({
      ...prev,
      typeId,
      typeName: typeInfo?.nameVi || '',
    }));
  };

  const handleArmyTypeToggle = (armyType: string) => {
    setForm((prev) => ({
      ...prev,
      armyTypes: prev.armyTypes.includes(armyType)
        ? prev.armyTypes.filter((t) => t !== armyType)
        : [...prev.armyTypes, armyType],
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh', 'error');
      return;
    }

    setProcessingImage(true);
    setError('');

    try {
      const result = await processSkillImage(file);
      if (result.success && result.data) {
        const data = result.data;
        // Update form with extracted data
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          typeId: data.type?.id || prev.typeId,
          typeName: data.type?.name || prev.typeName,
          quality: data.quality || prev.quality,
          triggerRate: data.trigger_rate ?? prev.triggerRate,
          effect: data.effect || prev.effect,
          target: data.target || prev.target,
          armyTypes: data.army_types?.length ? data.army_types : prev.armyTypes,
          innateToGenerals: data.innate_to?.length ? data.innate_to : prev.innateToGenerals,
          inheritanceFromGenerals: data.inheritance_from?.length ? data.inheritance_from : prev.inheritanceFromGenerals,
        }));
        showToast('Đã trích xuất thông tin từ ảnh thành công', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xử lý ảnh');
      showToast('Không thể xử lý ảnh', 'error');
    } finally {
      setProcessingImage(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const result = await createSkill({
        slug: form.slug || undefined,
        name: form.name,
        type: { id: form.typeId, name: form.typeName },
        quality: form.quality || undefined,
        trigger_rate: form.triggerRate || undefined,
        source_type: form.sourceType || undefined,
        wiki_url: form.wikiUrl || undefined,
        effect: form.effect || undefined,
        target: form.target || undefined,
        army_types: form.armyTypes,
        innate_to: form.innateToGenerals,
        inheritance_from: form.inheritanceFromGenerals,
        innate_general_ids: form.innateGeneralIds,
        inherit_general_ids: form.inheritGeneralIds,
        acquisition_type: form.acquisitionType || undefined,
        exchange_type: form.exchangeType || undefined,
        exchange_generals: form.exchangeGenerals,
        exchange_general_ids: form.exchangeGeneralIds,
        exchange_count: form.exchangeCount || undefined,
      } as any);

      showToast('Đã tạo chiến pháp thành công', 'success');
      router.push(`/admin/skills/${result.skill.slug || result.skill.id}`);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo chiến pháp');
      setSaving(false);
    }
  };

  const currentType = SKILL_TYPES.find(t => t.id === form.typeId);
  const qualityColors: Record<string, string> = {
    S: 'bg-[var(--accent)] text-[var(--text-primary)]',
    A: 'bg-red-600 text-[var(--text-primary)]',
    B: 'bg-violet-600 text-[var(--text-primary)]',
    C: 'bg-gray-600 text-[var(--text-primary)]',
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/skills"
            className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách
          </Link>
          <span className="text-[var(--text-tertiary)]">|</span>
          <span className="text-[var(--text-tertiary)] text-sm">Thêm chiến pháp mới</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Skill Title - Display (only if name exists) */}
          {(form.name || form.quality || currentType) && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-2">
                {form.quality && (
                  <span className={`w-8 h-8 rounded font-bold text-sm flex items-center justify-center ${qualityColors[form.quality]}`}>
                    {form.quality}
                  </span>
                )}
                {currentType && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${currentType.color}`}>
                    {currentType.nameVi}
                  </span>
                )}
                {form.triggerRate > 0 && (
                  <span className="text-[var(--accent)] text-sm font-medium">{form.triggerRate}%</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[var(--accent)]">{form.name || 'Chiến pháp mới'}</h1>
            </div>
          )}

          {/* Basic Info Form */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-[var(--accent)] mb-4">Thông tin cơ bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Loại *</label>
                <select
                  value={form.typeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  required
                >
                  <option value="">Chọn loại</option>
                  {SKILL_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.nameVi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phẩm chất</label>
                <div className="flex items-center gap-2">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, quality: prev.quality === q ? '' : q }))}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        form.quality === q
                          ? qualityColors[q]
                          : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tỷ lệ kích hoạt (%)</label>
                <input
                  type="number"
                  value={form.triggerRate || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, triggerRate: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="tự động tạo nếu để trống"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Binh chủng</label>
                <div className="flex flex-wrap gap-2">
                  {ARMY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleArmyTypeToggle(type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        form.armyTypes.includes(type)
                          ? 'bg-[var(--accent-dim)]/30 border-[var(--accent)] text-[var(--accent)]'
                          : 'bg-[var(--bg)]/50 border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
                      }`}
                    >
                      <ArmyIcon type={type} size={20} className={form.armyTypes.includes(type) ? 'opacity-100' : 'opacity-50'} />
                      <span>{ARMY_TYPE_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column - Effect & Target */}
            <div className="lg:col-span-2 space-y-5">
              {/* Effect */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[var(--accent)] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hiệu ứng
                </h2>

                <div className="space-y-3">
                  <div>
                    <textarea
                      value={form.effect}
                      onChange={(e) => setForm((prev) => ({ ...prev, effect: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm h-28 focus:border-[var(--accent)] focus:outline-none transition-colors"
                      placeholder="Mô tả hiệu ứng..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Mục tiêu:</label>
                    <select
                      value={form.target}
                      onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
                      className="flex-1 max-w-xs px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:border-[var(--accent)] focus:outline-none"
                    >
                      <option value="">Chọn mục tiêu</option>
                      <optgroup label="Đồng minh">
                        {TARGET_OPTIONS.filter(t => t.category === 'ally').map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Địch">
                        {TARGET_OPTIONS.filter(t => t.category === 'enemy').map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* Acquisition */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[var(--accent)] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cách sở hữu
                </h2>

                <div className="space-y-4">
                  {/* Acquisition Type Tabs */}
                  <div className="flex gap-2 p-1 bg-[var(--bg)]/50 rounded-lg">
                    {[
                      { id: 'innate', label: 'Tự mang', icon: '★' },
                      { id: 'inherit', label: 'Kế thừa', icon: '↓' },
                      { id: 'exchange', label: 'Đổi tướng', icon: '⇄' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          acquisitionType: prev.acquisitionType === type.id ? '' : type.id,
                          exchangeType: type.id !== 'exchange' ? '' : prev.exchangeType,
                        }))}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          form.acquisitionType === type.id
                            ? 'bg-[var(--accent-dim)] text-white shadow-sm'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Innate */}
                  {form.acquisitionType === 'innate' && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                        Tướng tự mang (1 tướng)
                      </label>
                      {form.innateGeneralIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {form.innateGeneralIds.map(gId => {
                            const general = generals.find(g => g.id === gId);
                            return (
                              <span
                                key={gId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--accent-dim)]/30 border border-[var(--accent)] rounded-full text-sm text-[var(--accent)]"
                              >
                                {general?.name || gId}
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, innateGeneralIds: [] }))}
                                  className="text-[var(--accent)] hover:text-[var(--text-primary)] ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={innateSearch}
                            onChange={(e) => setInnateSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm"
                            placeholder="Tìm tướng..."
                          />
                          {innateSearch && (
                            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl">
                              {generals
                                .filter(g => normalizeVietnamese(g.name).includes(normalizeVietnamese(innateSearch)))
                                .slice(0, 15)
                                .map(g => (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => {
                                      setForm(prev => ({ ...prev, innateGeneralIds: [g.id] }));
                                      setInnateSearch('');
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm border-b border-[var(--border)]/50 last:border-0"
                                  >
                                    {g.name}
                                  </button>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inherit */}
                  {form.acquisitionType === 'inherit' && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                        Tướng có thể truyền thừa
                      </label>
                      {form.inheritGeneralIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {form.inheritGeneralIds.map(gId => {
                            const general = generals.find(g => g.id === gId);
                            return (
                              <span
                                key={gId}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-900/50 border border-emerald-700/50 rounded-full text-xs text-emerald-200"
                              >
                                {general?.name || gId}
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    inheritGeneralIds: prev.inheritGeneralIds.filter(id => id !== gId)
                                  }))}
                                  className="text-emerald-400 hover:text-[var(--text-primary)]"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={inheritSearch}
                          onChange={(e) => setInheritSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm"
                          placeholder="Tìm tướng để thêm..."
                        />
                        {inheritSearch && (
                          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl">
                            {generals
                              .filter(g =>
                                !form.inheritGeneralIds.includes(g.id) &&
                                normalizeVietnamese(g.name).includes(normalizeVietnamese(inheritSearch))
                              )
                              .slice(0, 15)
                              .map(g => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, inheritGeneralIds: [...prev.inheritGeneralIds, g.id] }));
                                    setInheritSearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm border-b border-[var(--border)]/50 last:border-0"
                                >
                                  {g.name}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Exchange */}
                  {form.acquisitionType === 'exchange' && (
                    <div className="pt-2 space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, exchangeType: 'exact' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            form.exchangeType === 'exact'
                              ? 'bg-cyan-700 text-[var(--text-primary)]'
                              : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          Chính xác
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, exchangeType: 'any' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            form.exchangeType === 'any'
                              ? 'bg-cyan-700 text-[var(--text-primary)]'
                              : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          Tùy chọn
                        </button>
                        {form.exchangeType === 'any' && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-xs text-[var(--text-tertiary)]">Số lượng:</span>
                            <input
                              type="number"
                              value={form.exchangeCount || ''}
                              onChange={(e) => setForm((prev) => ({ ...prev, exchangeCount: parseInt(e.target.value) || 0 }))}
                              className="w-14 px-2 py-1 bg-[var(--bg)]/50 border border-[var(--border)] rounded text-sm text-[var(--text-primary)] text-center"
                              min={1}
                              placeholder="3"
                            />
                          </div>
                        )}
                      </div>

                      {form.exchangeGeneralIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.exchangeGeneralIds.map(gId => {
                            const general = generals.find(g => g.id === gId);
                            return (
                              <span
                                key={gId}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/50 border border-cyan-700/50 rounded-full text-xs text-cyan-200"
                              >
                                {general?.name || gId}
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    exchangeGeneralIds: prev.exchangeGeneralIds.filter(id => id !== gId)
                                  }))}
                                  className="text-cyan-400 hover:text-[var(--text-primary)]"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="relative">
                        <input
                          type="text"
                          value={generalSearch}
                          onChange={(e) => setGeneralSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm"
                          placeholder="Tìm tướng để thêm..."
                        />
                        {generalSearch && (
                          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl">
                            {generals
                              .filter(g =>
                                !form.exchangeGeneralIds.includes(g.id) &&
                                normalizeVietnamese(g.name).includes(normalizeVietnamese(generalSearch))
                              )
                              .slice(0, 15)
                              .map(g => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, exchangeGeneralIds: [...prev.exchangeGeneralIds, g.id] }));
                                    setGeneralSearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm border-b border-[var(--border)]/50 last:border-0"
                                >
                                  {g.name}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Image Upload & Meta */}
            <div className="space-y-5">
              {/* Image Upload */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-[var(--accent)] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Trích xuất từ ảnh
                </h2>

                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    dragActive
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-light)]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    {processingImage ? (
                      <div className="py-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
                        <p className="text-[var(--accent)] text-sm">Đang xử lý...</p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-[var(--text-tertiary)] text-xs mb-2">
                          Kéo thả ảnh hoặc
                        </p>
                        <label className="cursor-pointer">
                          <span className="px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded text-xs transition-colors">
                            Chọn ảnh
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-[var(--accent-dim)] hover:bg-[var(--accent)] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang tạo...' : 'Tạo chiến pháp'}
                </button>
                <Link
                  href="/admin/skills"
                  className="block w-full px-4 py-2 text-center border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-sm"
                >
                  Hủy
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
