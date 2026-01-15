'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkillTypeId, skillTypeNames } from '@/lib/skills';
import { fetchSkills, fetchSkillTypeCounts, fetchGeneralsMap, fetchSkill, Skill } from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import SkillModal from '@/components/SkillModal';

const skillTypes: (SkillTypeId | 'all')[] = ['all', 'command', 'active', 'assault', 'passive', 'formation', 'troop', 'internal', 'unknown'];

// Skill type colors with full styling
const skillTypeStyles: Record<SkillTypeId | 'all', { bg: string; text: string; border: string }> = {
  all: { bg: 'bg-[#d4a74a]/20', text: 'text-[#d4a74a]', border: 'border-[#d4a74a]' },
  command: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  active: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  assault: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  passive: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  formation: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  troop: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  internal: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
};

// Quality colors
const qualityStyles: Record<string, string> = {
  S: 'text-amber-400 font-bold',
  A: 'text-red-400 font-semibold',
  B: 'text-violet-400',
};

export default function SkillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skillParam = searchParams.get('skill');

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<SkillTypeId | 'all'>('all');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ all: 0 });
  const [generalsByName, setGeneralsByName] = useState<Record<string, { id: number; vi: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSkill, setModalSkill] = useState<Skill | null>(null);

  // Find the selected skill for modal (by slug, id, or name)
  const selectedSkillFromList = skillParam
    ? allSkills.find(s =>
        s.slug === skillParam ||
        s.id?.toString() === skillParam ||
        s.name.cn === skillParam ||
        s.name.vi === skillParam
      )
    : null;

  // Use either the skill from list or the directly fetched skill
  const selectedSkill = selectedSkillFromList || modalSkill;

  // Fetch skills from API
  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchSkills(
          search || undefined,
          activeTab !== 'all' ? activeTab : undefined
        );
        setSkills(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadSkills, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  // Fetch type counts, generals map, and all skills once
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [counts, generalsMap, allSkillsData] = await Promise.all([
          fetchSkillTypeCounts(),
          fetchGeneralsMap(),
          fetchSkills() // Fetch all skills for modal lookup
        ]);
        setTypeCounts(counts);
        setGeneralsByName(generalsMap);
        setAllSkills(allSkillsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch skill directly if skillParam is set but not found in allSkills
  useEffect(() => {
    if (!skillParam) {
      setModalSkill(null);
      return;
    }

    if (selectedSkillFromList) {
      // Found in list, no need to fetch
      setModalSkill(null);
      return;
    }

    // Not found in list (or list not loaded yet), fetch directly
    fetchSkill(skillParam)
      .then(setModalSkill)
      .catch(() => setModalSkill(null));
  }, [skillParam, selectedSkillFromList]);

  const openSkillModal = (skill: Skill) => {
    // Use slug if available, otherwise use id
    const identifier = skill.slug || skill.id.toString();
    router.push(`/skills?skill=${encodeURIComponent(identifier)}`, { scroll: false });
  };

  const closeSkillModal = () => {
    router.push('/skills', { scroll: false });
  };

  const getTabName = (type: SkillTypeId | 'all') => {
    if (type === 'all') return 'Tất cả';
    return skillTypeNames[type]?.vi || type;
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#e8dcc8] mb-1">Chiến Pháp</h1>
          <p className="text-sm text-[#6b7280]">Danh sách các chiến pháp trong Tam Quốc Chí Chiến Lược</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Main Card */}
        <div className="tk-card overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-[#2a3548] bg-gradient-to-r from-[#1a2130] to-[#12171f]">
            <nav className="flex overflow-x-auto scrollbar-thin" aria-label="Tabs">
              {skillTypes.map(type => {
                const isActive = activeTab === type;
                const count = typeCounts[type] || 0;
                const styles = skillTypeStyles[type];

                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? `${styles.border} ${styles.text} bg-[#1e2636]/50`
                        : 'border-transparent text-[#6b7280] hover:text-[#b8a990] hover:bg-[#1e2636]/30'
                    }`}
                  >
                    {getTabName(type)}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${isActive ? 'bg-[#1e2636]' : 'bg-[#1a2130]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Results Count */}
          <div className="px-5 py-3 text-sm text-[#b8a990] bg-[#1a2130] border-b border-[#2a3548]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#d4a74a]/30 border-t-[#d4a74a] rounded-full animate-spin" />
                Đang tải...
              </span>
            ) : (
              <span>
                Hiển thị <span className="text-[#d4a74a] font-semibold">{skills.length}</span> chiến pháp
              </span>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="m-4 px-5 py-4 rounded-lg bg-gradient-to-r from-[#5c1a24]/30 to-transparent border border-[#8b2635]">
              <div className="flex items-center gap-3">
                <span className="text-[#c44052] text-xl">⚠️</span>
                <span className="text-[#e8dcc8]">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="divide-y divide-[#2a3548]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center px-5 py-4">
                  <div className="flex-1 h-5 bg-[#2a3548] rounded animate-pulse" />
                  <div className="w-20 h-6 bg-[#2a3548] rounded mx-4 animate-pulse" />
                  <div className="w-10 h-5 bg-[#2a3548] rounded mx-4 animate-pulse" />
                  <div className="w-12 h-5 bg-[#2a3548] rounded mx-4 animate-pulse" />
                  <div className="w-20 h-5 bg-[#2a3548] rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Skills List */}
          {!loading && (
            <div className="divide-y divide-[#2a3548]">
              {/* Header */}
              <div className="hidden md:flex items-center px-5 py-3 bg-[#1a2130] text-xs font-medium text-[#d4a74a] uppercase tracking-wider">
                <div className="flex-1 min-w-[200px]">Tên</div>
                <div className="w-24 text-center">Loại</div>
                <div className="w-16 text-center">Phẩm</div>
                <div className="w-16 text-center">Tỉ lệ</div>
                <div className="w-24 text-right">Nguồn</div>
              </div>

              {skills.map((skill, index) => {
                const typeId = skill.type.id as SkillTypeId;
                const styles = skillTypeStyles[typeId] || skillTypeStyles.unknown;
                const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

                return (
                  <button
                    key={index}
                    onClick={() => openSkillModal(skill)}
                    className="w-full text-left hover:bg-[#1e2636]/50 focus:outline-none focus:bg-[#1e2636]/50 transition-colors group"
                  >
                    <div className="flex flex-wrap md:flex-nowrap items-center px-5 py-4 gap-2 md:gap-0">
                      {/* Name */}
                      <span className="flex-1 font-medium text-[#e8dcc8] min-w-[200px] group-hover:text-[#f0c96e] transition-colors">
                        {skill.name.vi}
                      </span>

                      {/* Type */}
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}/40 w-24 text-center`}>
                        {typeName.vi}
                      </span>

                      {/* Quality */}
                      <span className={`w-16 text-center ${skill.quality ? qualityStyles[skill.quality] : 'text-gray-500'}`}>
                        {skill.quality || '-'}
                      </span>

                      {/* Rate */}
                      <span className="text-[#b8a990] w-16 text-center">
                        {skill.trigger_rate ? `${skill.trigger_rate}%` : '-'}
                      </span>

                      {/* Source */}
                      <span className="text-sm text-[#6b7280] w-24 text-right">
                        {skill.source_type === 'innate' ? 'Tự mang' : skill.source_type === 'inherited' ? 'Truyền thừa' : '-'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && skills.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-[#e8dcc8] mb-2">Không tìm thấy chiến pháp</h3>
              <p className="text-[#6b7280]">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </main>

      {/* Skill Modal */}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          generalsByName={generalsByName}
          onClose={closeSkillModal}
        />
      )}
    </div>
  );
}
