'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAdminSkills, deleteSkill, updateSkill } from '@/lib/adminApi';
import { Skill } from '@/lib/api';

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
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-amber-100">Chiến pháp ({filteredSkills.length})</h1>
          <Link
            href="/admin/skills/new"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors"
          >
            + Thêm chiến pháp
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-4 mb-6 space-y-4">
          {/* Search and Quality row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm chiến pháp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 bg-stone-900/50 border border-stone-600 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Phẩm:</span>
              {QUALITIES.map(quality => {
                const isSelected = selectedQuality === quality;
                return (
                  <button
                    key={quality}
                    onClick={() => setSelectedQuality(selectedQuality === quality ? null : quality)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                      isSelected
                        ? quality === 'S' ? 'bg-amber-600 text-white' :
                          quality === 'A' ? 'bg-red-600 text-white' :
                          quality === 'B' ? 'bg-violet-600 text-white' :
                          'bg-stone-600 text-white'
                        : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                    }`}
                  >
                    {quality}
                  </button>
                );
              })}
              <span className="text-xs text-stone-500 ml-2">Trạng thái:</span>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-stone-600 text-white'
                    : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedStatus('needs_update')}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedStatus === 'needs_update'
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                }`}
              >
                Cần cập nhật
              </button>
              <button
                onClick={() => setSelectedStatus('complete')}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedStatus === 'complete'
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'
                }`}
              >
                Hoàn thành
              </button>
              {(selectedType || selectedQuality || search || selectedStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="ml-2 px-2 py-1 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                >
                  ✕ Xóa
                </button>
              )}
            </div>
          </div>

          {/* Type Filter - horizontal scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-stone-500 flex-shrink-0">Loại:</span>
            {SKILL_TYPES.map(type => {
              const isSelected = selectedType === type.id;
              const colorClass =
                type.id === 'command' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50' :
                type.id === 'active' ? 'bg-red-600/20 text-red-400 border-red-600/50' :
                type.id === 'passive' ? 'bg-green-600/20 text-green-400 border-green-600/50' :
                type.id === 'pursuit' ? 'bg-cyan-600/20 text-cyan-400 border-cyan-600/50' :
                type.id === 'assault' ? 'bg-orange-600/20 text-orange-400 border-orange-600/50' :
                type.id === 'internal' ? 'bg-purple-600/20 text-purple-400 border-purple-600/50' :
                type.id === 'troop' ? 'bg-blue-600/20 text-blue-400 border-blue-600/50' :
                'bg-stone-600/20 text-stone-400 border-stone-600/50';
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex-shrink-0 ${
                    isSelected
                      ? colorClass + ' ring-1 ring-offset-1 ring-offset-stone-800'
                      : 'bg-stone-700/30 text-stone-400 border-stone-600/30 hover:bg-stone-700/50'
                  }`}
                >
                  {type.nameVi}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-stone-400 py-8">Đang tải...</div>
        ) : (
          <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Phẩm chất</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-400">Tỷ lệ kích hoạt</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-stone-700/30">
                    <td className="px-4 py-3 font-medium text-white">
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
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        skill.type.id === 'command' ? 'bg-yellow-600/30 text-yellow-300' :
                        skill.type.id === 'active' ? 'bg-red-600/30 text-red-300' :
                        skill.type.id === 'passive' ? 'bg-green-600/30 text-green-300' :
                        skill.type.id === 'pursuit' ? 'bg-cyan-600/30 text-cyan-300' :
                        skill.type.id === 'assault' ? 'bg-orange-600/30 text-orange-300' :
                        skill.type.id === 'internal' ? 'bg-purple-600/30 text-purple-300' :
                        skill.type.id === 'troop' ? 'bg-blue-600/30 text-blue-300' :
                        'bg-stone-600/30 text-stone-300'
                      }`}>
                        {skill.type.name?.vi || skill.type.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                        skill.quality === 'S' ? 'bg-amber-600/40 text-amber-300' :
                        skill.quality === 'A' ? 'bg-red-600/40 text-red-300' :
                        skill.quality === 'B' ? 'bg-violet-600/40 text-violet-300' :
                        skill.quality === 'C' ? 'bg-stone-600/40 text-stone-300' :
                        'text-stone-500'
                      }`}>
                        {skill.quality || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-400">{skill.trigger_rate ? `${skill.trigger_rate}%` : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {skill.status !== 'complete' && (
                          <button
                            onClick={() => handleToggleStatus(skill)}
                            disabled={togglingStatus === skill.id}
                            className="px-3 py-1 text-sm text-green-400 hover:text-green-300 border border-green-700 rounded hover:border-green-600 transition-colors disabled:opacity-50"
                          >
                            {togglingStatus === skill.id ? '...' : 'Done'}
                          </button>
                        )}
                        <Link
                          href={`/admin/skills/${skill.slug || skill.id}`}
                          className="px-3 py-1 text-sm text-amber-400 hover:text-amber-300 border border-amber-700 rounded hover:border-amber-600 transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(skill.id, skill.slug, skill.name.vi)}
                          disabled={deleting === skill.id}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-700 rounded hover:border-red-600 transition-colors disabled:opacity-50"
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
              <div className="text-center text-stone-400 py-8">
                Không tìm thấy chiến pháp
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
