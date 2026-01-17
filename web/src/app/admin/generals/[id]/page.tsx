'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminGeneral, updateGeneral, uploadGeneralImage, fetchSkillsList, SkillOption } from '@/lib/adminApi';
import { showToast } from '@/components/Toast';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

const FACTIONS = [
  { id: 'wei', name: 'Ngụy' },
  { id: 'shu', name: 'Thục' },
  { id: 'wu', name: 'Ngô' },
  { id: 'qun', name: 'Quần' },
];

const GRADES = ['S', 'A', 'B', 'C', 'D'];

export default function EditGeneralPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    nameCn: '',
    nameVi: '',
    factionId: '',
    cost: 0,
    wikiUrl: '',
    image: '',
    imageFull: '',
    tagsCn: [] as string[],
    tagsVi: [] as string[],
    cavalryGrade: '',
    shieldGrade: '',
    archerGrade: '',
    spearGrade: '',
    siegeGrade: '',
    innateSkillId: null as number | null,
    inheritedSkillId: null as number | null,
    status: 'needs_update' as string,
  });

  usePageTitle(form.nameVi ? `Sửa: ${form.nameVi}` : 'Sửa võ tướng', true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<SkillOption[]>([]);

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
        setForm({
          slug: generalData.slug || '',
          nameCn: generalData.name?.cn || '',
          nameVi: generalData.name?.vi || '',
          factionId: generalData.faction_id || '',
          cost: generalData.cost || 0,
          wikiUrl: generalData.wiki_url || '',
          image: generalData.image || '',
          imageFull: generalData.image_full || '',
          tagsCn: generalData.tags?.cn || [],
          tagsVi: generalData.tags?.vi || [],
          cavalryGrade: generalData.troop_compatibility?.cavalry?.grade || '',
          shieldGrade: generalData.troop_compatibility?.shield?.grade || '',
          archerGrade: generalData.troop_compatibility?.archer?.grade || '',
          spearGrade: generalData.troop_compatibility?.spear?.grade || '',
          siegeGrade: generalData.troop_compatibility?.siege?.grade || '',
          innateSkillId: generalData.innate_skill_id || null,
          inheritedSkillId: generalData.inherited_skill_id || null,
          status: generalData.status || 'needs_update',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await updateGeneral(id, {
        slug: form.slug,
        name: { cn: form.nameCn, vi: form.nameVi },
        faction_id: form.factionId,
        cost: form.cost,
        wiki_url: form.wikiUrl,
        image: form.image,
        image_full: form.imageFull,
        tags: { cn: form.tagsCn, vi: form.tagsVi },
        troop_compatibility: {
          cavalry: { grade: form.cavalryGrade },
          shield: { grade: form.shieldGrade },
          archer: { grade: form.archerGrade },
          spear: { grade: form.spearGrade },
          siege: { grade: form.siegeGrade },
        },
        innate_skill_id: form.innateSkillId,
        inherited_skill_id: form.inheritedSkillId,
        status: form.status,
      } as any);
      showToast('Đã cập nhật tướng thành công', 'success');
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật tướng');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await uploadGeneralImage(id, file);
      setForm((prev) => ({ ...prev, image: result.image }));
      showToast('Đã tải ảnh lên thành công', 'success');
    } catch (err: any) {
      setError(err.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-amber-100">Chỉnh sửa tướng</h1>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, status: prev.status === 'complete' ? 'needs_update' : 'complete' }))}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                form.status === 'complete'
                  ? 'bg-green-600/30 text-green-300 hover:bg-green-600/50'
                  : 'bg-orange-600/30 text-orange-300 hover:bg-orange-600/50'
              }`}
            >
              {form.status === 'complete' ? '✓ Hoàn thành' : '⚠ Cần cập nhật'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/generals"
              className="text-stone-400 hover:text-white text-sm"
            >
              ← Danh sách
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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-100 mb-4">Thông tin cơ bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Phe</label>
                <select
                  value={form.factionId}
                  onChange={(e) => setForm((prev) => ({ ...prev, factionId: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                >
                  <option value="">Chọn phe</option>
                  {FACTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Tên (CN)</label>
                <input
                  type="text"
                  value={form.nameCn}
                  onChange={(e) => setForm((prev) => ({ ...prev, nameCn: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Tên (VI)</label>
                <input
                  type="text"
                  value={form.nameVi}
                  onChange={(e) => setForm((prev) => ({ ...prev, nameVi: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Phí</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm((prev) => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Wiki URL</label>
                <input
                  type="url"
                  value={form.wikiUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, wikiUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-100 mb-4">Hình ảnh</h2>

            <div className="flex items-start gap-6">
              {form.image ? (
                <img
                  src={form.image}
                  alt={form.nameVi}
                  className="w-32 h-32 object-cover rounded-lg border border-stone-600"
                />
              ) : (
                <div className="w-32 h-32 bg-stone-700 rounded-lg flex items-center justify-center text-stone-500">
                  Chưa có ảnh
                </div>
              )}

              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-300 mb-1">Tải ảnh mới</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-amber-700 file:text-white hover:file:bg-amber-600"
                />
                {uploading && <p className="mt-2 text-sm text-stone-400">Đang tải...</p>}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-stone-300 mb-1">URL ảnh (thủ công)</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white text-sm"
                    placeholder="/images/generals/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Troop Compatibility */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-100 mb-4">Tương thích binh chủng</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'cavalryGrade', label: 'Kỵ binh' },
                { key: 'shieldGrade', label: 'Thuẫn binh' },
                { key: 'archerGrade', label: 'Cung binh' },
                { key: 'spearGrade', label: 'Thương binh' },
                { key: 'siegeGrade', label: 'Công thành' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-stone-300 mb-1">{label}</label>
                  <select
                    value={(form as any)[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                  >
                    <option value="">-</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-100 mb-4">Chiến pháp</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Chiến pháp tự mang</label>
                <select
                  value={form.innateSkillId || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, innateSkillId: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                >
                  <option value="">-- Không có --</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name.vi} ({skill.name.cn}) {skill.quality ? `[${skill.quality}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Chiến pháp kế thừa</label>
                <select
                  value={form.inheritedSkillId || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, inheritedSkillId: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                >
                  <option value="">-- Không có --</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name.vi} ({skill.name.cn}) {skill.quality ? `[${skill.quality}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-100 mb-4">Nhãn</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Nhãn (CN) - phân cách bởi dấu phẩy</label>
                <input
                  type="text"
                  value={form.tagsCn.join(', ')}
                  onChange={(e) => setForm((prev) => ({ ...prev, tagsCn: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Nhãn (VI) - phân cách bởi dấu phẩy</label>
                <input
                  type="text"
                  value={form.tagsVi.join(', ')}
                  onChange={(e) => setForm((prev) => ({ ...prev, tagsVi: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 bg-stone-900/50 border border-stone-600 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/generals"
              className="px-6 py-2 border border-stone-600 text-stone-300 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
