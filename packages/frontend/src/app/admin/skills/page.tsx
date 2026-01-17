'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAdminSkills, deleteSkill, updateSkill } from '@/lib/adminApi';
import { Skill } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';

type StatusFilter = 'all' | 'needs_update' | 'complete';

const SKILL_TYPES = [
  { id: 'command', nameVi: 'Chỉ Huy' },
  { id: 'active', nameVi: 'Chủ Động' },
  { id: 'passive', nameVi: 'Bị Động' },
  { id: 'pursuit', nameVi: 'Truy Kích' },
  { id: 'assault', nameVi: 'Đột Kích' },
  { id: 'internal', nameVi: 'Nội Chính' },
  { id: 'troop', nameVi: 'Binh Chủng' },
];

const QUALITIES = ['S', 'A', 'B', 'C'];

// Remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function AdminSkillsPage() {
  usePageTitle('Chiến pháp', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await fetchAdminSkills();
        setSkills(data);
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadSkills();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: number, slug: string | undefined, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) {
      return;
    }

    setDeleting(id);
    try {
      await deleteSkill(slug || String(id));
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert('Không thể xóa chiến pháp');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (skill: Skill) => {
    const newStatus = skill.status === 'complete' ? 'needs_update' : 'complete';
    setTogglingStatus(skill.id);
    try {
      await updateSkill(skill.slug || String(skill.id), { status: newStatus });
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, status: newStatus } : s))
      );
    } catch (error) {
      alert('Không thể cập nhật trạng thái');
      console.error(error);
    } finally {
      setTogglingStatus(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType(null);
    setSelectedQuality(null);
    setSelectedStatus('all');
  };

  const filteredSkills = skills.filter((s) => {
    // Search filter (diacritics-insensitive)
    if (search) {
      const searchNormalized = removeVietnameseDiacritics(search);
      const matchesSearch =
        removeVietnameseDiacritics(s.name.vi).includes(searchNormalized) ||
        removeVietnameseDiacritics(s.name.cn).includes(searchNormalized) ||
        (s.slug && s.slug.toLowerCase().includes(searchNormalized));
      if (!matchesSearch) return false;
    }

    // Type filter
    if (selectedType && s.type.id !== selectedType) {
      return false;
    }

    // Quality filter
    if (selectedQuality && s.quality !== selectedQuality) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && s.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">Chiến pháp ({filteredSkills.length})</h1>
          <Link href="/admin/skills/new" className="btn-primary">
            + Thêm chiến pháp
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 space-y-4">
          {/* Search and Quality row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm chiến pháp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-gold)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">Phẩm:</span>
              {QUALITIES.map(quality => {
                const isSelected = selectedQuality === quality;
                return (
                  <button
                    key={quality}
                    onClick={() => setSelectedQuality(selectedQuality === quality ? null : quality)}
                    className={`w-8 h-8 text-xs font-bold transition-all ${
                      isSelected
                        ? quality === 'S' ? 'bg-[var(--accent-gold)] text-[var(--bg)]' :
                          quality === 'A' ? 'bg-[var(--accent-red-bright)] text-white' :
                          quality === 'B' ? 'bg-blue-500 text-white' :
                          'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {quality}
                  </button>
                );
              })}
              <span className="text-xs text-[var(--text-tertiary)] ml-2">Trạng thái:</span>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2 py-1 text-xs border transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                    : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedStatus('needs_update')}
                className={`px-2 py-1 text-xs border transition-all ${
                  selectedStatus === 'needs_update'
                    ? 'bg-orange-600/20 border-orange-600 text-orange-400'
                    : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Cần cập nhật
              </button>
              <button
                onClick={() => setSelectedStatus('complete')}
                className={`px-2 py-1 text-xs border transition-all ${
                  selectedStatus === 'complete'
                    ? 'bg-green-600/20 border-green-600 text-green-400'
                    : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Hoàn thành
              </button>
              {(selectedType || selectedQuality || search || selectedStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="ml-2 px-2 py-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  ✕ Xóa
                </button>
              )}
            </div>
          </div>

          {/* Type Filter - horizontal scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Loại:</span>
            {SKILL_TYPES.map(type => {
              const isSelected = selectedType === type.id;
              const colorClass =
                type.id === 'command' ? 'text-yellow-400 border-yellow-600/50' :
                type.id === 'active' ? 'text-red-400 border-red-600/50' :
                type.id === 'passive' ? 'text-blue-400 border-blue-600/50' :
                type.id === 'pursuit' ? 'text-cyan-400 border-cyan-600/50' :
                type.id === 'assault' ? 'text-orange-400 border-orange-600/50' :
                type.id === 'internal' ? 'text-purple-400 border-purple-600/50' :
                type.id === 'troop' ? 'text-green-400 border-green-600/50' :
                'text-[var(--text-tertiary)] border-[var(--border)]';
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                  className={`px-3 py-1 text-xs font-medium border transition-all flex-shrink-0 ${
                    isSelected
                      ? colorClass + ' bg-[var(--bg-tertiary)]'
                      : 'text-[var(--text-tertiary)] border-[var(--border)] hover:border-[var(--border-light)]'
                  }`}
                >
                  {type.nameVi}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[var(--text-secondary)] py-8">Đang tải...</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Phẩm chất</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Tỷ lệ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-tertiary)]">Cập nhật</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-tertiary)]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-[var(--bg-tertiary)]">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        {skill.status === 'complete' ? (
                          <span className="text-green-500 flex-shrink-0" title="Hoàn thành">✓</span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="Cần cập nhật"></span>
                        )}
                        {skill.name.vi}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-bold ${
                        skill.type.id === 'command' ? 'text-yellow-400' :
                        skill.type.id === 'active' ? 'text-red-400' :
                        skill.type.id === 'passive' ? 'text-blue-400' :
                        skill.type.id === 'pursuit' ? 'text-cyan-400' :
                        skill.type.id === 'assault' ? 'text-orange-400' :
                        skill.type.id === 'internal' ? 'text-purple-400' :
                        skill.type.id === 'troop' ? 'text-green-400' :
                        'text-[var(--text-tertiary)]'
                      }`}>
                        {skill.type.name?.vi || skill.type.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${
                        skill.quality === 'S' ? 'text-[var(--accent-gold)]' :
                        skill.quality === 'A' ? 'text-[var(--accent-red-bright)]' :
                        skill.quality === 'B' ? 'text-blue-400' :
                        skill.quality === 'C' ? 'text-[var(--text-tertiary)]' :
                        'text-[var(--text-tertiary)]'
                      }`}>
                        {skill.quality || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--accent-gold)]">{skill.trigger_rate ? `${skill.trigger_rate}%` : '-'}</td>
                    <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs">
                      {(skill as any).updated_at ? new Date((skill as any).updated_at).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {skill.status !== 'complete' && (
                          <button
                            onClick={() => handleToggleStatus(skill)}
                            disabled={togglingStatus === skill.id}
                            className="px-3 py-1 text-sm text-green-400 hover:text-green-300 border border-green-700 hover:border-green-600 transition-colors disabled:opacity-50"
                          >
                            {togglingStatus === skill.id ? '...' : 'Done'}
                          </button>
                        )}
                        <Link
                          href={`/admin/skills/${skill.slug || skill.id}`}
                          className="px-3 py-1 text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)] border border-[var(--accent-gold-dim)] hover:border-[var(--accent-gold)] transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(skill.id, skill.slug, skill.name.vi)}
                          disabled={deleting === skill.id}
                          className="px-3 py-1 text-sm text-[var(--accent-red-bright)] hover:text-red-400 border border-[var(--accent-red)] hover:border-[var(--accent-red-bright)] transition-colors disabled:opacity-50"
                        >
                          {deleting === skill.id ? '...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSkills.length === 0 && (
              <div className="text-center text-[var(--text-secondary)] py-8">
                Không tìm thấy chiến pháp
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
