'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminGeneral, updateGeneral, uploadGeneralImage, fetchSkillsList, SkillOption, deleteGeneral } from '@/lib/adminApi';
import { General, fetchSkill, Skill } from '@/lib/api';
import { showToast } from '@/components/Toast';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';
import ImageCropModal from '@/components/ImageCropModal';
import { createImageUrl, revokeImageUrl } from '@/lib/imageCrop';

const FACTIONS = [
  { id: 'wei', name: 'Ngụy', color: 'bg-blue-600 text-white border-blue-600', inactiveColor: 'bg-stone-800/50 text-stone-500 border-stone-700/30' },
  { id: 'shu', name: 'Thục', color: 'bg-green-600 text-white border-green-600', inactiveColor: 'bg-stone-800/50 text-stone-500 border-stone-700/30' },
  { id: 'wu', name: 'Ngô', color: 'bg-red-600 text-white border-red-600', inactiveColor: 'bg-stone-800/50 text-stone-500 border-stone-700/30' },
  { id: 'qun', name: 'Quần', color: 'bg-yellow-600 text-white border-yellow-600', inactiveColor: 'bg-stone-800/50 text-stone-500 border-stone-700/30' },
];

const COSTS = [3, 4, 5, 6, 7];

const GRADES = ['S', 'A', 'B', 'C'];
const GRADE_COLORS: Record<string, string> = {
  S: 'bg-amber-600 text-white',
  A: 'bg-violet-600 text-white',
  B: 'bg-sky-600 text-white',
  C: 'bg-cyan-600 text-white',
  D: 'bg-stone-600 text-white',
};

const SKILL_TYPE_COLORS: Record<string, string> = {
  command: 'bg-yellow-600/30 text-yellow-300',
  active: 'bg-red-600/30 text-red-300',
  passive: 'bg-green-600/30 text-green-300',
  pursuit: 'bg-cyan-600/30 text-cyan-300',
  assault: 'bg-orange-600/30 text-orange-300',
  formation: 'bg-purple-600/30 text-purple-300',
  troop: 'bg-blue-600/30 text-blue-300',
  internal: 'bg-teal-600/30 text-teal-300',
};

const SKILL_TYPE_NAMES: Record<string, string> = {
  command: 'Chỉ Huy',
  active: 'Chủ Động',
  passive: 'Bị Động',
  pursuit: 'Truy Kích',
  assault: 'Đột Kích',
  formation: 'Pháp Trận',
  troop: 'Binh Chủng',
  internal: 'Nội Chính',
};

const TARGET_LABELS: Record<string, string> = {
  self: 'Bản thân',
  toi: 'Bản thân',
  ally_1: 'Quân ta (1 người)',
  ally_2: 'Quân ta (2 người)',
  ally_1_2: 'Quân ta (1-2 người)',
  ally_2_3: 'Quân ta (2-3 người)',
  ally_all: 'Toàn thể quân ta',
  enemy_1: 'Quân địch (1 người)',
  enemy_2: 'Quân địch (2 người)',
  enemy_1_2: 'Quân địch (1-2 người)',
  enemy_2_3: 'Quân địch (2-3 người)',
  enemy_all: 'Toàn thể quân địch',
};

// Normalize Vietnamese text by removing diacritics
function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Skill Search Dropdown Component - defined outside to prevent re-creation on every render
function SkillSearchDropdown({
  search,
  setSearch,
  onSelect,
  skills,
}: {
  search: string;
  setSearch: (v: string) => void;
  onSelect: (skill: SkillOption) => void;
  skills: SkillOption[];
}) {
  const results = skills
    .filter(s => {
      if (!search) return false;
      const normalized = normalizeVietnamese(search);
      return normalizeVietnamese(s.name).includes(normalized);
    })
    .slice(0, 10);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
        placeholder="Tìm chiến pháp..."
      />
      {search && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-stone-800 border border-stone-600 rounded-lg shadow-xl">
          {results.map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => {
                onSelect(skill);
                setSearch('');
              }}
              className="w-full px-3 py-2 text-left hover:bg-stone-700 flex items-center gap-3 border-b border-stone-700/50 last:border-0"
            >
              {skill.quality && (
                <span className={`w-6 h-6 rounded font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                  skill.quality === 'S' ? 'bg-amber-600 text-white' :
                  skill.quality === 'A' ? 'bg-violet-600 text-white' :
                  skill.quality === 'B' ? 'bg-sky-600 text-white' : 'bg-cyan-600 text-white'
                }`}>
                  {skill.quality}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm">{skill.name}</span>
                {skill.type_id && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${SKILL_TYPE_COLORS[skill.type_id] || 'bg-stone-600/30 text-stone-300'}`}>
                    {SKILL_TYPE_NAMES[skill.type_id] || skill.type_id}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {search && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full bg-stone-800 border border-stone-600 rounded-lg shadow-xl p-3 text-center text-stone-400 text-sm">
          Không tìm thấy chiến pháp
        </div>
      )}
    </div>
  );
}

export default function EditGeneralPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    factionId: '',
    cost: 0,
    wikiUrl: '',
    image: '',
    imageFull: '',
    tags: [] as string[],
    cavalryGrade: '',
    shieldGrade: '',
    archerGrade: '',
    spearGrade: '',
    siegeGrade: '',
    innateSkillId: null as number | null,
    inheritedSkillId: null as number | null,
    status: 'needs_update' as string,
    // Base stats
    baseAttack: null as number | null,
    baseCharm: null as number | null,
    baseCommand: null as number | null,
    baseIntelligence: null as number | null,
    basePolitics: null as number | null,
    baseSpeed: null as number | null,
    // Growth stats
    growthAttack: null as number | null,
    growthCharm: null as number | null,
    growthCommand: null as number | null,
    growthIntelligence: null as number | null,
    growthPolitics: null as number | null,
    growthSpeed: null as number | null,
  });

  usePageTitle(form.name ? `Sửa: ${form.name}` : 'Sửa võ tướng', true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [innateSearch, setInnateSearch] = useState('');
  const [inheritSearch, setInheritSearch] = useState('');
  const [innateSkillData, setInnateSkillData] = useState<General['innate_skill'] | null>(null);
  const [inheritedSkillData, setInheritedSkillData] = useState<General['inherited_skill'] | null>(null);

  // Image crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [generalData, skillsData] = await Promise.all([
          fetchAdminGeneral(id),
          fetchSkillsList(),
        ]);

        setSkills(skillsData);

        // Set skill data - use full data from general if available, otherwise fetch from API
        if (generalData.innate_skill) {
          setInnateSkillData(generalData.innate_skill);
        } else if (generalData.innate_skill_id) {
          try {
            const fullSkill = await fetchSkill(String(generalData.innate_skill_id));
            setInnateSkillData({
              name: fullSkill.name,
              type: fullSkill.type,
              quality: fullSkill.quality,
              trigger_rate: fullSkill.trigger_rate,
              effect: fullSkill.effect,
              target: fullSkill.target,
              army_types: fullSkill.army_types,
            });
          } catch {
            // Fallback to basic info from skills list
            const skill = skillsData.find(s => s.id === generalData.innate_skill_id);
            if (skill) {
              setInnateSkillData({
                name: skill.name,
                type: skill.type_id ? { id: skill.type_id, name: SKILL_TYPE_NAMES[skill.type_id] || '' } : undefined,
                quality: skill.quality || undefined,
              });
            }
          }
        }

        if (generalData.inherited_skill) {
          setInheritedSkillData(generalData.inherited_skill);
        } else if (generalData.inherited_skill_id) {
          try {
            const fullSkill = await fetchSkill(String(generalData.inherited_skill_id));
            setInheritedSkillData({
              name: fullSkill.name,
              type: fullSkill.type,
              quality: fullSkill.quality,
              trigger_rate: fullSkill.trigger_rate,
              effect: fullSkill.effect,
              target: fullSkill.target,
              army_types: fullSkill.army_types,
            });
          } catch {
            // Fallback to basic info from skills list
            const skill = skillsData.find(s => s.id === generalData.inherited_skill_id);
            if (skill) {
              setInheritedSkillData({
                name: skill.name,
                type: skill.type_id ? { id: skill.type_id, name: SKILL_TYPE_NAMES[skill.type_id] || '' } : undefined,
                quality: skill.quality || undefined,
              });
            }
          }
        }

        setForm({
          slug: generalData.slug || '',
          name: generalData.name || '',
          factionId: generalData.faction_id || '',
          cost: generalData.cost || 0,
          wikiUrl: generalData.wiki_url || '',
          image: generalData.image || '',
          imageFull: generalData.image_full || '',
          tags: generalData.tags || [],
          cavalryGrade: generalData.troop_compatibility?.cavalry?.grade || '',
          shieldGrade: generalData.troop_compatibility?.shield?.grade || '',
          archerGrade: generalData.troop_compatibility?.archer?.grade || '',
          spearGrade: generalData.troop_compatibility?.spear?.grade || '',
          siegeGrade: generalData.troop_compatibility?.siege?.grade || '',
          innateSkillId: generalData.innate_skill_id || null,
          inheritedSkillId: generalData.inherited_skill_id || null,
          status: generalData.status || 'needs_update',
          // Base stats
          baseAttack: generalData.base_attack ?? null,
          baseCharm: generalData.base_charm ?? null,
          baseCommand: generalData.base_command ?? null,
          baseIntelligence: generalData.base_intelligence ?? null,
          basePolitics: generalData.base_politics ?? null,
          baseSpeed: generalData.base_speed ?? null,
          // Growth stats
          growthAttack: generalData.growth_attack ?? null,
          growthCharm: generalData.growth_charm ?? null,
          growthCommand: generalData.growth_command ?? null,
          growthIntelligence: generalData.growth_intelligence ?? null,
          growthPolitics: generalData.growth_politics ?? null,
          growthSpeed: generalData.growth_speed ?? null,
        });
      } catch (err) {
        setError('Không thể tải thông tin tướng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && id) {
      loadData();
    }
  }, [isAuthenticated, id]);

  const saveGeneral = async (statusOverride?: string): Promise<boolean> => {
    setError('');
    setSaving(true);

    const statusToSave = statusOverride || form.status;

    try {
      await updateGeneral(id, {
        slug: form.slug,
        name: form.name,
        faction_id: form.factionId,
        cost: form.cost,
        wiki_url: form.wikiUrl,
        image: form.image,
        image_full: form.imageFull,
        tags: form.tags,
        troop_compatibility: {
          cavalry: { grade: form.cavalryGrade },
          shield: { grade: form.shieldGrade },
          archer: { grade: form.archerGrade },
          spear: { grade: form.spearGrade },
          siege: { grade: form.siegeGrade },
        },
        innate_skill_id: form.innateSkillId,
        inherited_skill_id: form.inheritedSkillId,
        status: statusToSave,
        // Base stats
        base_attack: form.baseAttack,
        base_charm: form.baseCharm,
        base_command: form.baseCommand,
        base_intelligence: form.baseIntelligence,
        base_politics: form.basePolitics,
        base_speed: form.baseSpeed,
        // Growth stats
        growth_attack: form.growthAttack,
        growth_charm: form.growthCharm,
        growth_command: form.growthCommand,
        growth_intelligence: form.growthIntelligence,
        growth_politics: form.growthPolitics,
        growth_speed: form.growthSpeed,
      } as any);
      showToast(statusOverride === 'complete' ? 'Đã lưu và đánh dấu hoàn thành' : 'Đã cập nhật tướng thành công', 'success');

      if (statusOverride) {
        setForm((prev) => ({ ...prev, status: statusOverride }));
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật tướng');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGeneral();
  };

  const handleSaveAndComplete = async () => {
    const success = await saveGeneral('complete');
    if (success) {
      router.push('/admin/generals');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa võ tướng "${form.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await deleteGeneral(id as string);
      showToast('Đã xóa võ tướng', 'success');
      router.push('/admin/generals');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa', 'error');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create object URL for the selected file and open crop modal
    const imageUrl = createImageUrl(file);
    setCropImageUrl(imageUrl);
    setCropModalOpen(true);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRecrop = () => {
    if (!form.image) return;
    setCropImageUrl(form.image);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (blob: Blob) => {
    setCropModalOpen(false);

    // Clean up the object URL if it was from a file selection
    if (cropImageUrl && cropImageUrl.startsWith('blob:')) {
      revokeImageUrl(cropImageUrl);
    }
    setCropImageUrl(null);

    setUploading(true);
    setError('');

    try {
      // Convert blob to File for upload
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      const result = await uploadGeneralImage(id, file);
      setForm((prev) => ({ ...prev, image: result.image }));
      showToast('Đã tải ảnh lên thành công', 'success');
    } catch (err: any) {
      setError(err.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);

    // Clean up the object URL if it was from a file selection
    if (cropImageUrl && cropImageUrl.startsWith('blob:')) {
      revokeImageUrl(cropImageUrl);
    }
    setCropImageUrl(null);
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-stone-400 py-8">Đang tải...</div>
        </div>
      </main>
    );
  }

  const currentFaction = FACTIONS.find(f => f.id === form.factionId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/generals"
            className="flex items-center gap-1 text-stone-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách
          </Link>
          <span className="text-stone-600">|</span>
          <a
            href={`/generals/${form.slug || id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
          >
            Xem trang công khai
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. TITLE / INFO */}
          <div className="bg-stone-800/90 border border-amber-900/40 rounded-xl p-5 mb-5">
            {/* Title row with badges */}
            <div className="flex items-center gap-3 mb-4">
              {currentFaction && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentFaction.color}`}>
                  {currentFaction.name}
                </span>
              )}
              {form.cost > 0 && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-600 text-white">
                  COST {form.cost}
                </span>
              )}
              {/* Status toggle */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: prev.status === 'complete' ? 'needs_update' : 'complete' }))}
                className={`ml-auto px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  form.status === 'complete'
                    ? 'bg-green-600/30 text-green-300 hover:bg-green-600/50'
                    : 'bg-orange-600/30 text-orange-300 hover:bg-orange-600/50'
                }`}
              >
                {form.status === 'complete' ? '✓ Hoàn thành' : '⚠ Cần cập nhật'}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-amber-100">{form.name || 'Tướng mới'}</h1>
          </div>

          {/* 2. IMAGE AREA */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-amber-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hình ảnh
            </h2>

            <div className="flex items-start gap-6">
              {form.image ? (
                <div className="relative group">
                  <img
                    src={form.image}
                    alt={form.name}
                    className="max-w-48 max-h-48 object-contain rounded-lg border-2 border-stone-600"
                  />
                  <button
                    type="button"
                    onClick={handleRecrop}
                    disabled={uploading}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900/90 hover:bg-stone-800 text-stone-200 rounded text-xs font-medium transition-colors opacity-0 group-hover:opacity-100 border border-stone-600"
                  >
                    ✂️ Cắt lại
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-stone-700 rounded-lg flex items-center justify-center text-stone-500 border-2 border-dashed border-stone-600">
                  Chưa có ảnh
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Tải ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {form.image && (
                    <button
                      type="button"
                      onClick={handleRecrop}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✂️ Cắt lại
                    </button>
                  )}
                  {uploading && <span className="ml-3 text-sm text-stone-400">Đang tải...</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">URL ảnh (thủ công)</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="/images/generals/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Basic Info Form */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-amber-100 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {/* Name and Slug in same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Tên *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="tự động"
                  />
                </div>
              </div>

              {/* Faction and Cost in same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Phe</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FACTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, factionId: prev.factionId === f.id ? '' : f.id }))}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                          form.factionId === f.id
                            ? f.color
                            : f.inactiveColor + ' hover:text-stone-300'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Phí (COST)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COSTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, cost: prev.cost === c ? 0 : c }))}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                          form.cost === c
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800/50 text-stone-500 border border-stone-700/30 hover:text-stone-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Troop Compatibility */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-amber-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Tương thích binh chủng
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'cavalryGrade', label: 'Kỵ binh', icon: '🐴' },
                { key: 'shieldGrade', label: 'Thuẫn binh', icon: '🛡️' },
                { key: 'archerGrade', label: 'Cung binh', icon: '🏹' },
                { key: 'spearGrade', label: 'Thương binh', icon: '🔱' },
                { key: 'siegeGrade', label: 'Công thành', icon: '⚙️' },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-stone-300 mb-2">{icon} {label}</label>
                  <div className="flex gap-1">
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, [key]: (prev as any)[key] === g ? '' : g }))}
                        className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                          (form as any)[key] === g
                            ? GRADE_COLORS[g]
                            : 'bg-stone-700/50 text-stone-500 hover:bg-stone-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Combined Stats Section */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-amber-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Chỉ số
            </h2>

            {/* Stats Table */}
            <div className="overflow-hidden rounded-lg border border-stone-600">
              {/* Table Header */}
              <div className="grid grid-cols-[140px_1fr_1fr] border-b border-stone-600">
                <div className="px-3 py-2.5 text-sm font-semibold text-stone-300 bg-stone-900">
                  Chỉ số
                </div>
                <div className="px-3 py-2.5 text-sm font-semibold text-center text-blue-200 bg-blue-900/50 border-l border-stone-600">
                  Cơ bản
                </div>
                <div className="px-3 py-2.5 text-sm font-semibold text-center text-green-200 bg-green-900/50 border-l border-stone-600">
                  Tăng trưởng
                </div>
              </div>

              {/* Table Body */}
              {[
                { baseKey: 'baseAttack', growthKey: 'growthAttack', label: 'Võ lực', icon: '⚔️' },
                { baseKey: 'baseCommand', growthKey: 'growthCommand', label: 'Thống suất', icon: '🎖️' },
                { baseKey: 'baseIntelligence', growthKey: 'growthIntelligence', label: 'Trí lực', icon: '🧠' },
                { baseKey: 'basePolitics', growthKey: 'growthPolitics', label: 'Chính trị', icon: '📜' },
                { baseKey: 'baseCharm', growthKey: 'growthCharm', label: 'Mị lực', icon: '✨' },
                { baseKey: 'baseSpeed', growthKey: 'growthSpeed', label: 'Tốc độ', icon: '🏃' },
              ].map(({ baseKey, growthKey, label, icon }, index) => (
                <div
                  key={baseKey}
                  className={`grid grid-cols-[140px_1fr_1fr] ${index < 5 ? 'border-b border-stone-700' : ''}`}
                >
                  {/* Stat Label */}
                  <div className={`px-3 py-2 text-sm font-medium text-stone-300 flex items-center gap-2 ${index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-800/60'}`}>
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                  {/* Base Input */}
                  <div className={`px-2 py-1.5 border-l border-stone-600 ${index % 2 === 0 ? 'bg-blue-900/30' : 'bg-blue-900/20'}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={(form as any)[baseKey] ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [baseKey]: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                      className="w-full px-2 py-1.5 bg-stone-900 border border-blue-800/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none text-center"
                      placeholder="0.00"
                    />
                  </div>
                  {/* Growth Input */}
                  <div className={`px-2 py-1.5 border-l border-stone-600 ${index % 2 === 0 ? 'bg-green-900/30' : 'bg-green-900/20'}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={(form as any)[growthKey] ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [growthKey]: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                      className="w-full px-2 py-1.5 bg-stone-900 border border-green-800/50 rounded text-white text-sm focus:border-green-500 focus:outline-none text-center"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Innate Skill */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Chiến pháp tự mang
              </h2>
              {innateSkillData && form.innateSkillId && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/skills/${form.innateSkillId}`}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Sửa chiến pháp
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, innateSkillId: null }));
                      setInnateSkillData(null);
                    }}
                    className="text-xs text-stone-400 hover:text-red-400 transition-colors"
                  >
                    Xóa liên kết
                  </button>
                </div>
              )}
            </div>

            {innateSkillData ? (
              <div className="bg-stone-900/50 border border-stone-600 rounded-lg p-4">
                {/* Header with badges */}
                <div className="flex items-center gap-2 mb-3">
                  {innateSkillData.quality && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      innateSkillData.quality === 'S' ? 'bg-amber-600 text-white' :
                      innateSkillData.quality === 'A' ? 'bg-violet-600 text-white' :
                      innateSkillData.quality === 'B' ? 'bg-sky-600 text-white' : 'bg-cyan-600 text-white'
                    }`}>
                      {innateSkillData.quality}
                    </span>
                  )}
                  {innateSkillData.type?.id && (
                    <span className={`px-2 py-0.5 rounded text-xs ${SKILL_TYPE_COLORS[innateSkillData.type.id] || 'bg-stone-600/30 text-stone-300'}`}>
                      {innateSkillData.type.name || SKILL_TYPE_NAMES[innateSkillData.type.id] || innateSkillData.type.id}
                    </span>
                  )}
                  {innateSkillData.trigger_rate && (
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {innateSkillData.trigger_rate}%
                    </span>
                  )}
                </div>

                {/* Skill name */}
                <h3 className="text-lg font-bold text-white mb-2">
                  {innateSkillData.name}
                </h3>

                {/* Effect */}
                {innateSkillData.effect && (
                  <p className="text-sm text-stone-300 leading-relaxed mb-3">
                    {innateSkillData.effect}
                  </p>
                )}

                {/* Target */}
                {innateSkillData.target && (
                  <div className="text-xs text-stone-400">
                    <span className="text-amber-500/70">Mục tiêu:</span>{' '}
                    {TARGET_LABELS[innateSkillData.target] || innateSkillData.target}
                  </div>
                )}

                {!innateSkillData.effect && (
                  <p className="text-sm text-stone-500 italic">Chưa có thông tin chi tiết</p>
                )}
              </div>
            ) : (
              <div>
                <SkillSearchDropdown
                  search={innateSearch}
                  setSearch={setInnateSearch}
                  skills={skills}
                  onSelect={async (skill) => {
                    setForm((prev) => ({ ...prev, innateSkillId: skill.id }));
                    // Fetch full skill details
                    try {
                      const fullSkill = await fetchSkill(String(skill.id));
                      setInnateSkillData({
                        name: fullSkill.name,
                        type: fullSkill.type,
                        quality: fullSkill.quality,
                        trigger_rate: fullSkill.trigger_rate,
                        effect: fullSkill.effect,
                        target: fullSkill.target,
                        army_types: fullSkill.army_types,
                      });
                    } catch {
                      // Fallback to basic info
                      setInnateSkillData({
                        name: skill.name,
                        type: skill.type_id ? { id: skill.type_id, name: SKILL_TYPE_NAMES[skill.type_id] || '' } : undefined,
                        quality: skill.quality || undefined,
                      });
                    }
                  }}
                />
                {!innateSearch && (
                  <p className="mt-3 text-sm text-stone-500 italic">Chưa chọn chiến pháp</p>
                )}
              </div>
            )}
          </div>

          {/* 6. Inherited Skill */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Chiến pháp kế thừa
              </h2>
              {inheritedSkillData && form.inheritedSkillId && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/skills/${form.inheritedSkillId}`}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Sửa chiến pháp
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, inheritedSkillId: null }));
                      setInheritedSkillData(null);
                    }}
                    className="text-xs text-stone-400 hover:text-red-400 transition-colors"
                  >
                    Xóa liên kết
                  </button>
                </div>
              )}
            </div>

            {inheritedSkillData ? (
              <div className="bg-stone-900/50 border border-stone-600 rounded-lg p-4">
                {/* Header with badges */}
                <div className="flex items-center gap-2 mb-3">
                  {inheritedSkillData.quality && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      inheritedSkillData.quality === 'S' ? 'bg-amber-600 text-white' :
                      inheritedSkillData.quality === 'A' ? 'bg-violet-600 text-white' :
                      inheritedSkillData.quality === 'B' ? 'bg-sky-600 text-white' : 'bg-cyan-600 text-white'
                    }`}>
                      {inheritedSkillData.quality}
                    </span>
                  )}
                  {inheritedSkillData.type?.id && (
                    <span className={`px-2 py-0.5 rounded text-xs ${SKILL_TYPE_COLORS[inheritedSkillData.type.id] || 'bg-stone-600/30 text-stone-300'}`}>
                      {inheritedSkillData.type.name || SKILL_TYPE_NAMES[inheritedSkillData.type.id] || inheritedSkillData.type.id}
                    </span>
                  )}
                  {inheritedSkillData.trigger_rate && (
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {inheritedSkillData.trigger_rate}%
                    </span>
                  )}
                </div>

                {/* Skill name */}
                <h3 className="text-lg font-bold text-white mb-2">
                  {inheritedSkillData.name}
                </h3>

                {/* Effect */}
                {inheritedSkillData.effect && (
                  <p className="text-sm text-stone-300 leading-relaxed mb-3">
                    {inheritedSkillData.effect}
                  </p>
                )}

                {/* Target */}
                {inheritedSkillData.target && (
                  <div className="text-xs text-stone-400">
                    <span className="text-amber-500/70">Mục tiêu:</span>{' '}
                    {TARGET_LABELS[inheritedSkillData.target] || inheritedSkillData.target}
                  </div>
                )}

                {!inheritedSkillData.effect && (
                  <p className="text-sm text-stone-500 italic">Chưa có thông tin chi tiết</p>
                )}
              </div>
            ) : (
              <div>
                <SkillSearchDropdown
                  search={inheritSearch}
                  setSearch={setInheritSearch}
                  skills={skills}
                  onSelect={async (skill) => {
                    setForm((prev) => ({ ...prev, inheritedSkillId: skill.id }));
                    // Fetch full skill details
                    try {
                      const fullSkill = await fetchSkill(String(skill.id));
                      setInheritedSkillData({
                        name: fullSkill.name,
                        type: fullSkill.type,
                        quality: fullSkill.quality,
                        trigger_rate: fullSkill.trigger_rate,
                        effect: fullSkill.effect,
                        target: fullSkill.target,
                        army_types: fullSkill.army_types,
                      });
                    } catch {
                      // Fallback to basic info
                      setInheritedSkillData({
                        name: skill.name,
                        type: skill.type_id ? { id: skill.type_id, name: SKILL_TYPE_NAMES[skill.type_id] || '' } : undefined,
                        quality: skill.quality || undefined,
                      });
                    }
                  }}
                />
                {!inheritSearch && (
                  <p className="mt-3 text-sm text-stone-500 italic">Chưa chọn chiến pháp</p>
                )}
              </div>
            )}
          </div>

          {/* 7. BUTTONS */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors text-sm"
            >
              Xóa
            </button>
            <Link
              href="/admin/generals"
              className="px-4 py-2 border border-stone-600 text-stone-300 rounded-lg hover:bg-stone-700 transition-colors text-sm"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={handleSaveAndComplete}
              disabled={saving || form.status === 'complete'}
              className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? 'Đang lưu...' : 'Lưu & Hoàn thành'}
            </button>
          </div>
        </form>

        {/* Image Crop Modal */}
        {cropModalOpen && cropImageUrl && (
          <ImageCropModal
            imageSrc={cropImageUrl}
            onComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    </main>
  );
}
