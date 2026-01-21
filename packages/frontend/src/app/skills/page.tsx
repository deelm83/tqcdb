'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';
import { fetchSkills, fetchSkillTypeCounts, fetchGeneralsMap, fetchSkill, Skill } from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import SkillModal from '@/components/SkillModal';
import { usePageTitle } from '@/hooks/usePageTitle';

const skillTypes: (SkillTypeId | 'all')[] = ['all', 'command', 'active', 'assault', 'passive', 'formation', 'troop', 'internal', 'unknown'];

function SkillsContent() {
  usePageTitle('Chiến pháp');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL
  const search = searchParams.get('q') || '';
  const activeTab = (searchParams.get('type') || 'all') as SkillTypeId | 'all';
  const skillParam = searchParams.get('skill');

  const [skills, setSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ all: 0 });
  const [generalsByName, setGeneralsByName] = useState<Record<string, { id: number; vi: string }>>({});
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalSkill, setModalSkill] = useState<Skill | null>(null);
  const hasLoadedOnce = useRef(false);

  // Update URL with new filters
  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'type' && value === 'all')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '/skills', { scroll: false });
  }, [searchParams, router]);

  const setSearch = useCallback((value: string) => {
    updateFilters({ q: value || null });
  }, [updateFilters]);

  const setActiveTab = useCallback((value: SkillTypeId | 'all') => {
    updateFilters({ type: value === 'all' ? null : value });
  }, [updateFilters]);

  const selectedSkillFromList = skillParam
    ? allSkills.find(s =>
        s.slug === skillParam ||
        s.id?.toString() === skillParam ||
        s.name === skillParam
      )
    : null;

  const selectedSkill = selectedSkillFromList || modalSkill;

  useEffect(() => {
    async function loadSkills() {
      try {
        // Only show full loading on initial load, use refetching for subsequent loads
        if (!hasLoadedOnce.current) {
          setLoading(true);
        } else {
          setIsRefetching(true);
        }
        setError(null);

        const data = await fetchSkills(
          search || undefined,
          activeTab !== 'all' ? activeTab : undefined
        );
        setSkills(data);
        hasLoadedOnce.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        setIsRefetching(false);
      }
    }

    const timer = setTimeout(loadSkills, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [counts, generalsMap, allSkillsData] = await Promise.all([
          fetchSkillTypeCounts(),
          fetchGeneralsMap(),
          fetchSkills()
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

  useEffect(() => {
    if (!skillParam) {
      setModalSkill(null);
      return;
    }

    if (selectedSkillFromList) {
      setModalSkill(null);
      return;
    }

    fetchSkill(skillParam)
      .then(setModalSkill)
      .catch(() => setModalSkill(null));
  }, [skillParam, selectedSkillFromList]);

  const openSkillModal = (skill: Skill) => {
    const identifier = skill.slug || skill.id.toString();
    const params = new URLSearchParams(searchParams.toString());
    params.set('skill', identifier);
    router.push(`/skills?${params.toString()}`, { scroll: false });
  };

  const closeSkillModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('skill');
    const queryString = params.toString();
    router.push(queryString ? `/skills?${queryString}` : '/skills', { scroll: false });
  };

  const getTabName = (type: SkillTypeId | 'all') => {
    if (type === 'all') return 'Tất cả';
    return skillTypeNames[type]?.vi || type;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">Chiến pháp</h1>
        <p className="text-[var(--text-secondary)] mt-1">Danh sách chiến pháp trong Tam Quốc Chí Chiến Lược</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm chiến pháp..." />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {skillTypes.map(type => {
          const isActive = activeTab === type;
          const count = typeCounts[type] || 0;
          const colorClass = type === 'all' ? 'text-[var(--accent-gold)]' : skillTypeColors[type]?.text || 'text-[var(--text-tertiary)]';

          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1.5 text-[13px] font-medium whitespace-nowrap border transition-all ${colorClass} ${
                isActive
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)]'
                  : 'opacity-50 border-[var(--border)] hover:opacity-80 hover:border-[var(--border-light)]'
              }`}
            >
              {getTabName(type)}
              <span className={`ml-2 ${isActive ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="mb-6 text-[13px] text-[var(--text-tertiary)] uppercase tracking-wider">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner" />
            Đang tải...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {skills.length} chiến pháp
            {isRefetching && <span className="spinner" />}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card-red p-4 mb-6">
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      )}

      {/* Skills List */}
      {!loading && skills.length > 0 && (
        <div className={`space-y-2 transition-opacity duration-200 ${isRefetching ? 'opacity-60' : 'opacity-100'}`}>
          {skills.map((skill, index) => {
            const typeId = skill.type.id as SkillTypeId;
            const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
            const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

            return (
              <button
                key={index}
                onClick={() => openSkillModal(skill)}
                className="w-full card flex items-center justify-between p-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[var(--text-primary)]">
                    {skill.name}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[13px] ${typeColor.text}`}>{typeName.vi}</span>
                    {skill.trigger_rate && (
                      <span className="text-[13px] text-[var(--text-tertiary)]">{skill.trigger_rate}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {skill.quality && (
                    <span className={`text-[14px] font-bold ${qualityColors[skill.quality]}`}>
                      {skill.quality}
                    </span>
                  )}
                  <svg className="w-5 h-5 text-[var(--accent-gold-dim)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && skills.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)]">Không tìm thấy chiến pháp</p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-2">Thử thay đổi bộ lọc</p>
        </div>
      )}

      {/* Skill Modal */}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          generalsByName={generalsByName}
          onClose={closeSkillModal}
        />
      )}
    </>
  );
}

export default function SkillsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <Suspense fallback={
        <div className="space-y-4">
          <div className="h-8 w-32 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="h-12 bg-[var(--bg-secondary)] animate-pulse" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <SkillsContent />
      </Suspense>
    </main>
  );
}
