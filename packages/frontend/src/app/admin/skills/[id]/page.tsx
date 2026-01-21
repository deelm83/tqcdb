'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminSkill, updateSkill, processSkillImage, fetchAdminGenerals, uploadSkillImage, deleteSkill } from '@/lib/adminApi';
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

export default function EditSkillPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
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
    status: 'needs_update' as string,
    updatedAt: null as string | null,
    screenshots: [] as string[],
  });
  const [innateSearch, setInnateSearch] = useState('');
  const [inheritSearch, setInheritSearch] = useState('');

  usePageTitle(form.name ? `Sửa: ${form.name}` : 'Sửa chiến pháp', true);
  const [uploadedImages, setUploadedImages] = useState<{file: File, url: string}[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

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

  useEffect(() => {
    async function loadSkill() {
      try {
        const data = await fetchAdminSkill(id);
        setForm({
          slug: data.slug || '',
          name: data.name || '',
          typeId: data.type?.id || '',
          typeName: data.type?.name || '',
          quality: data.quality || '',
          triggerRate: data.trigger_rate || 0,
          sourceType: data.source_type || '',
          wikiUrl: data.wiki_url || '',
          effect: data.effect || '',
          target: data.target || '',
          armyTypes: data.army_types || [],
          innateToGenerals: data.innate_to || [],
          inheritanceFromGenerals: data.inheritance_from || [],
          innateGeneralIds: data.innate_general_ids || [],
          inheritGeneralIds: data.inherit_general_ids || [],
          acquisitionType: data.acquisition_type || '',
          exchangeType: data.exchange_type || '',
          exchangeGenerals: data.exchange_generals || [],
          exchangeGeneralIds: data.exchange_general_ids || [],
          exchangeCount: data.exchange_count || 0,
          status: data.status || 'needs_update',
          updatedAt: data.updated_at || null,
          screenshots: data.screenshots || [],
        });
      } catch (err) {
        setError('Không thể tải chiến pháp');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && id) {
      loadSkill();
    }
  }, [isAuthenticated, id]);

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

  // Add images to the list (no extraction)
  const handleAddImages = useCallback((files: FileList | File[]) => {
    const newImages: {file: File, url: string}[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          url: URL.createObjectURL(file)
        });
      }
    }
    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);
      showToast(`Đã thêm ${newImages.length} ảnh`, 'success');
    }
  }, []);

  // Extract from all images (both uploaded and existing screenshots)
  const handleExtractFromAllImages = useCallback(async () => {
    const imagesToProcess: {file: File, name: string}[] = [];

    // Add uploaded images
    for (const img of uploadedImages) {
      imagesToProcess.push({ file: img.file, name: img.file.name });
    }

    // Add existing screenshots from DB
    for (const screenshot of form.screenshots) {
      try {
        const response = await fetch(`/images/skills/${screenshot}`);
        const blob = await response.blob();
        const file = new File([blob], screenshot, { type: blob.type });
        imagesToProcess.push({ file, name: screenshot });
      } catch (err) {
        console.error(`Failed to load screenshot: ${screenshot}`);
      }
    }

    if (imagesToProcess.length === 0) {
      showToast('Không có ảnh để trích xuất', 'error');
      return;
    }

    setProcessingImage(true);
    setError('');

    try {
      let extractedCount = 0;
      for (const img of imagesToProcess) {
        const result = await processSkillImage(img.file);
        if (result.success && result.data) {
          const data = result.data as any;
          // Helper to safely extract string value (handles legacy {cn, vi} objects)
          const toStr = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return val.vi || val.cn || '';
            return String(val);
          };
          // Merge extracted data (only fill empty fields or append arrays)
          setForm((prev) => ({
            ...prev,
            name: prev.name || toStr(data.name),
            typeId: prev.typeId || toStr(data.type?.id),
            typeName: prev.typeName || toStr(data.type?.name),
            quality: prev.quality || toStr(data.quality),
            triggerRate: prev.triggerRate || (typeof data.trigger_rate === 'number' ? data.trigger_rate : 0),
            effect: prev.effect || toStr(data.effect),
            target: prev.target || toStr(data.target),
            armyTypes: prev.armyTypes.length > 0 ? prev.armyTypes : (data.army_types || []),
            innateToGenerals: prev.innateToGenerals.length > 0 ? prev.innateToGenerals : (data.innate_to || []),
            inheritanceFromGenerals: prev.inheritanceFromGenerals.length > 0 ? prev.inheritanceFromGenerals : (data.inheritance_from || []),
          }));
          extractedCount++;
        }
      }
      showToast(`Đã trích xuất từ ${extractedCount}/${imagesToProcess.length} ảnh`, 'success');
    } catch (err: any) {
      setError(err.message || 'Không thể xử lý ảnh');
      showToast('Lỗi khi trích xuất', 'error');
    } finally {
      setProcessingImage(false);
    }
  }, [uploadedImages, form.screenshots]);

  // Legacy function for compatibility
  const handleImageUpload = useCallback(async (file: File) => {
    handleAddImages([file]);
  }, [handleAddImages]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddImages(e.dataTransfer.files);
    }
  }, [handleAddImages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files);
    }
    e.target.value = '';
  }, [handleAddImages]);

  const removeUploadedImage = useCallback((index: number) => {
    setUploadedImages(prev => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const saveSkill = async (statusOverride?: string): Promise<boolean> => {
    setError('');
    setSaving(true);

    const statusToSave = statusOverride || form.status;

    try {
      // Upload new images first
      const newScreenshots: string[] = [];
      for (const img of uploadedImages) {
        try {
          const result = await uploadSkillImage(id, img.file);
          newScreenshots.push(result.filename);
        } catch (err) {
          console.error('Failed to upload image:', err);
        }
      }

      // Combine existing screenshots with newly uploaded ones
      const allScreenshots = [...form.screenshots, ...newScreenshots];

      await updateSkill(id, {
        slug: form.slug || undefined,
        name: form.name,
        type: { id: form.typeId, name: form.typeName },
        quality: form.quality || null,
        trigger_rate: form.triggerRate || null,
        source_type: form.sourceType || null,
        wiki_url: form.wikiUrl || null,
        effect: form.effect || null,
        target: form.target || null,
        army_types: form.armyTypes,
        innate_to: form.innateToGenerals,
        inheritance_from: form.inheritanceFromGenerals,
        innate_general_ids: form.innateGeneralIds,
        inherit_general_ids: form.inheritGeneralIds,
        acquisition_type: form.acquisitionType || null,
        exchange_type: form.exchangeType || null,
        exchange_generals: form.exchangeGenerals,
        exchange_general_ids: form.exchangeGeneralIds,
        exchange_count: form.exchangeCount || null,
        status: statusToSave,
        screenshots: allScreenshots,
      } as any);

      // Clear uploaded images after successful save
      uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
      setUploadedImages([]);

      showToast(statusOverride === 'complete' ? 'Đã lưu và đánh dấu hoàn thành' : 'Đã cập nhật chiến pháp thành công', 'success');

      // Reload the skill data to ensure form shows the latest saved data
      const data = await fetchAdminSkill(id);
      setForm({
        slug: data.slug || '',
        name: data.name || '',
        typeId: data.type?.id || '',
        typeName: data.type?.name || '',
        quality: data.quality || '',
        triggerRate: data.trigger_rate || 0,
        sourceType: data.source_type || '',
        wikiUrl: data.wiki_url || '',
        effect: data.effect || '',
        target: data.target || '',
        armyTypes: data.army_types || [],
        innateToGenerals: data.innate_to || [],
        inheritanceFromGenerals: data.inheritance_from || [],
        innateGeneralIds: data.innate_general_ids || [],
        inheritGeneralIds: data.inherit_general_ids || [],
        acquisitionType: data.acquisition_type || '',
        exchangeType: data.exchange_type || '',
        exchangeGenerals: data.exchange_generals || [],
        exchangeGeneralIds: data.exchange_general_ids || [],
        exchangeCount: data.exchange_count || 0,
        status: data.status || 'needs_update',
        updatedAt: data.updated_at || null,
        screenshots: data.screenshots || [],
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật chiến pháp');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSkill();
  };

  const handleSaveAndComplete = async () => {
    const success = await saveSkill('complete');
    if (success) {
      router.push('/admin/skills');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa chiến pháp "${form.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await deleteSkill(id as string);
      showToast('Đã xóa chiến pháp', 'success');
      router.push('/admin/skills');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa', 'error');
    }
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

  const currentType = SKILL_TYPES.find(t => t.id === form.typeId);
  const qualityColors: Record<string, string> = {
    S: 'bg-amber-600 text-white',
    A: 'bg-red-600 text-white',
    B: 'bg-violet-600 text-white',
    C: 'bg-stone-600 text-white',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/skills"
            className="flex items-center gap-1 text-stone-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách
          </Link>
          <span className="text-stone-600">|</span>
          <a
            href={`/skills/${form.slug || id}`}
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
                <span className="text-amber-400 text-sm font-medium">{form.triggerRate}%</span>
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-amber-100">{form.name || 'Chiến pháp mới'}</h1>
              {form.updatedAt && (
                <span className="text-xs text-stone-500">
                  Cập nhật: {new Date(form.updatedAt).toLocaleString('vi-VN')}
                </span>
              )}
            </div>
          </div>

          {/* 2. IMAGE AREA */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ảnh tham khảo
                {(form.screenshots.length + uploadedImages.length) > 0 && (
                  <span className="text-stone-400 font-normal">
                    ({form.screenshots.length} đã lưu{uploadedImages.length > 0 && `, ${uploadedImages.length} mới`})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {(form.screenshots.length + uploadedImages.length) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Xóa tất cả ảnh?')) {
                        uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
                        setUploadedImages([]);
                        setForm(prev => ({ ...prev, screenshots: [] }));
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Xóa tất cả
                  </button>
                )}
                <label className="cursor-pointer px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white rounded text-xs transition-colors">
                  + Thêm ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Images display */}
            {(form.screenshots.length + uploadedImages.length) > 0 ? (
              <div
                className={`flex gap-4 overflow-x-auto pb-3 ${dragActive ? 'ring-2 ring-amber-500 rounded-lg p-2' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Existing screenshots from DB */}
                {form.screenshots.map((screenshot, index) => (
                  <div key={`db-${index}`} className="relative group flex-shrink-0">
                    <img
                      src={`/images/skills/${screenshot}`}
                      alt={`Screenshot ${index + 1}`}
                      className="h-72 w-auto rounded-lg border-2 border-stone-600 cursor-pointer hover:border-amber-500 transition-all"
                      style={{ minWidth: '180px', objectFit: 'contain', backgroundColor: '#1c1917' }}
                      onClick={() => window.open(`/images/skills/${screenshot}`, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-600/80 text-white text-xs rounded">
                      Đã lưu
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== index) }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Newly uploaded images */}
                {uploadedImages.map((img, index) => (
                  <div key={`new-${index}`} className="relative group flex-shrink-0">
                    <img
                      src={img.url}
                      alt={`New ${index + 1}`}
                      className="h-72 w-auto rounded-lg border-2 border-amber-500 cursor-pointer hover:border-amber-400 transition-all"
                      style={{ minWidth: '180px', objectFit: 'contain', backgroundColor: '#1c1917' }}
                      onClick={() => window.open(img.url, '_blank')}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600/80 text-white text-xs rounded">
                      Mới
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-amber-500 bg-amber-900/20' : 'border-stone-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <p className="text-stone-500">Kéo thả ảnh vào đây hoặc click "Thêm ảnh" ở trên</p>
              </div>
            )}

            {/* Extract button */}
            {(form.screenshots.length + uploadedImages.length) > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExtractFromAllImages}
                  disabled={processingImage}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Trích xuất từ {form.screenshots.length + uploadedImages.length} ảnh
                    </>
                  )}
                </button>
                <span className="text-xs text-stone-500">
                  Tự động điền thông tin từ tất cả ảnh
                </span>
              </div>
            )}
          </div>

          {/* 3. Basic Info Form */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5">
            <h2 className="text-base font-semibold text-amber-100 mb-4">Thông tin cơ bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                <label className="block text-sm font-medium text-stone-300 mb-1">Loại *</label>
                <select
                  value={form.typeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">Chọn loại</option>
                  {SKILL_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.nameVi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Phẩm chất</label>
                <div className="flex items-center gap-2">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, quality: prev.quality === q ? '' : q }))}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        form.quality === q
                          ? qualityColors[q]
                          : 'bg-stone-700/50 text-stone-500 hover:bg-stone-700 border border-stone-600'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Tỷ lệ kích hoạt (%)</label>
                <input
                  type="number"
                  value={form.triggerRate || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, triggerRate: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  placeholder="tự động tạo nếu để trống"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-300 mb-1">Binh chủng</label>
                <div className="flex flex-wrap gap-2">
                  {ARMY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleArmyTypeToggle(type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                        form.armyTypes.includes(type)
                          ? 'bg-amber-700/50 border-amber-600 text-amber-200'
                          : 'bg-stone-900/50 border-stone-600 text-stone-400 hover:border-stone-500'
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

          {/* 4. MAIN CONTENT */}
          <div className="space-y-5">
              {/* Effect */}
              <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5">
                <h2 className="text-base font-semibold text-amber-100 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hiệu ứng
                </h2>

                <div className="space-y-3">
                  <div>
                    <textarea
                      value={form.effect}
                      onChange={(e) => setForm((prev) => ({ ...prev, effect: e.target.value }))}
                      className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm h-28 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="Mô tả hiệu ứng..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-stone-300">Mục tiêu:</label>
                    <select
                      value={form.target}
                      onChange={(e) => setForm((prev) => ({ ...prev, target: e.target.value }))}
                      className="flex-1 max-w-xs px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
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
              <div className="bg-stone-800/80 border border-amber-900/30 rounded-xl p-5">
                <h2 className="text-base font-semibold text-amber-100 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cách sở hữu
                </h2>

                <div className="space-y-4">
                  {/* Acquisition Type Tabs */}
                  <div className="flex gap-2 p-1 bg-stone-900/50 rounded-lg">
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
                            ? 'bg-amber-700 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white hover:bg-stone-800'
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
                      <label className="block text-xs font-medium text-stone-400 mb-2">
                        Tướng tự mang (1 tướng)
                      </label>
                      {form.innateGeneralIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {form.innateGeneralIds.map(gId => {
                            const general = generals.find(g => g.id === gId);
                            return (
                              <span
                                key={gId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-900/50 border border-amber-700/50 rounded-full text-sm text-amber-200"
                              >
                                {general?.name || gId}
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, innateGeneralIds: [] }))}
                                  className="text-amber-400 hover:text-white ml-1"
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
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm"
                            placeholder="Tìm tướng..."
                          />
                          {innateSearch && (
                            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-stone-800 border border-stone-600 rounded-lg shadow-xl">
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
                                    className="w-full px-3 py-2 text-left hover:bg-stone-700 text-stone-200 text-sm border-b border-stone-700/50 last:border-0"
                                  >
                                    {g.name}
                                  </button>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      )}
                      {form.innateToGenerals.length > 0 && form.innateGeneralIds.length === 0 && (
                        <div className="mt-2 px-2 py-1 bg-amber-900/20 border border-amber-700/30 rounded text-xs text-amber-300">
                          Dữ liệu cũ: {form.innateToGenerals.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inherit */}
                  {form.acquisitionType === 'inherit' && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-stone-400 mb-2">
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
                                  className="text-emerald-400 hover:text-white"
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
                          className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm"
                          placeholder="Tìm tướng để thêm..."
                        />
                        {inheritSearch && (
                          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-stone-800 border border-stone-600 rounded-lg shadow-xl">
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
                                  className="w-full px-3 py-2 text-left hover:bg-stone-700 text-stone-200 text-sm border-b border-stone-700/50 last:border-0"
                                >
                                  {g.name}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                      {form.inheritanceFromGenerals.length > 0 && form.inheritGeneralIds.length === 0 && (
                        <div className="mt-2 px-2 py-1 bg-amber-900/20 border border-amber-700/30 rounded text-xs text-amber-300">
                          Dữ liệu cũ: {form.inheritanceFromGenerals.join(', ')}
                        </div>
                      )}
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
                              ? 'bg-cyan-700 text-white'
                              : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                          }`}
                        >
                          Chính xác
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, exchangeType: 'any' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            form.exchangeType === 'any'
                              ? 'bg-cyan-700 text-white'
                              : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                          }`}
                        >
                          Tùy chọn
                        </button>
                        {form.exchangeType === 'any' && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-xs text-stone-500">Số lượng:</span>
                            <input
                              type="number"
                              value={form.exchangeCount || ''}
                              onChange={(e) => setForm((prev) => ({ ...prev, exchangeCount: parseInt(e.target.value) || 0 }))}
                              className="w-14 px-2 py-1 bg-stone-900/50 border border-stone-600 rounded text-sm text-white text-center"
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
                                  className="text-cyan-400 hover:text-white"
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
                          className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white text-sm"
                          placeholder="Tìm tướng để thêm..."
                        />
                        {generalSearch && (
                          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-stone-800 border border-stone-600 rounded-lg shadow-xl">
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
                                  className="w-full px-3 py-2 text-left hover:bg-stone-700 text-stone-200 text-sm border-b border-stone-700/50 last:border-0"
                                >
                                  {g.name}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                      {form.exchangeGenerals.length > 0 && form.exchangeGeneralIds.length === 0 && (
                        <div className="px-2 py-1 bg-amber-900/20 border border-amber-700/30 rounded text-xs text-amber-300">
                          Dữ liệu cũ: {form.exchangeGenerals.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* 5. BUTTONS */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors text-sm"
            >
              Xóa
            </button>
            <Link
              href="/admin/skills"
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
      </div>
    </main>
  );
}
