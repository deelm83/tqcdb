'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { factionNames, factionColors, troopTypeNames, gradeColors, FactionId, Grade } from '@/lib/generals';
import { skillTypeNames, skillTypeColors, qualityColors, SkillTypeId } from '@/lib/skills';
import { fetchGeneral, General } from '@/lib/api';
import { TroopType } from '@/types/general';
import { TroopIcon, ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUser } from '@/contexts/UserContext';
import SuggestEditButton from '@/components/SuggestEditButton';
import SuggestEditModal from '@/components/SuggestEditModal';
import LoginModal from '@/components/LoginModal';

const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];

// Stats configuration
const STAT_KEYS = ['attack', 'command', 'intelligence', 'politics', 'speed', 'charm'] as const;
type StatKey = typeof STAT_KEYS[number];

const STAT_LABELS: Record<StatKey, string> = {
  attack: 'Võ lực',
  command: 'Thống suất',
  intelligence: 'Trí lực',
  politics: 'Chính trị',
  speed: 'Tốc độ',
  charm: 'Mị lực',
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

// Milestone levels that give 10 extra points each (at level 10, 20, 30, 40)
const MILESTONE_LEVELS = [10, 20, 30, 40];

// Advanced Stats Calculator Component
function StatsCalculator({ general }: { general: General }) {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [level, setLevel] = useState(50);
  const [stars, setStars] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hasCollectiveCard, setHasCollectiveCard] = useState(false);
  const [extraPoints, setExtraPoints] = useState<Record<StatKey, number>>({
    attack: 0,
    command: 0,
    intelligence: 0,
    politics: 0,
    speed: 0,
    charm: 0,
  });

  // Calculate total extra points available
  const totalExtraPoints = useMemo(() => {
    const milestonePts = MILESTONE_LEVELS.filter(m => level >= m).length * 10;
    const starPts = stars * 10;
    const animatedPts = isAnimated ? 10 : 0;
    const cardPts = hasCollectiveCard ? 10 : 0;
    return milestonePts + starPts + animatedPts + cardPts;
  }, [level, stars, isAnimated, hasCollectiveCard]);

  // Calculate used extra points
  const usedExtraPoints = useMemo(() => {
    return Object.values(extraPoints).reduce((sum, pts) => sum + pts, 0);
  }, [extraPoints]);

  // Remaining points to distribute
  const remainingPoints = totalExtraPoints - usedExtraPoints;

  // Calculate final stats
  const calculatedStats = useMemo(() => {
    const stats: Record<StatKey, { base: number; growth: number; final: number }> = {
      attack: { base: general.base_attack || 0, growth: general.growth_attack || 0, final: 0 },
      command: { base: general.base_command || 0, growth: general.growth_command || 0, final: 0 },
      intelligence: { base: general.base_intelligence || 0, growth: general.growth_intelligence || 0, final: 0 },
      politics: { base: general.base_politics || 0, growth: general.growth_politics || 0, final: 0 },
      speed: { base: general.base_speed || 0, growth: general.growth_speed || 0, final: 0 },
      charm: { base: general.base_charm || 0, growth: general.growth_charm || 0, final: 0 },
    };

    for (const key of STAT_KEYS) {
      const { base, growth } = stats[key];
      // Final = base + growth * (level - 1) + extra points
      stats[key].final = Math.round((base + growth * (level - 1) + extraPoints[key]) * 100) / 100;
    }

    return stats;
  }, [general, level, extraPoints]);

  // Reset extra points when total changes
  useEffect(() => {
    if (usedExtraPoints > totalExtraPoints) {
      setExtraPoints({ attack: 0, command: 0, intelligence: 0, politics: 0, speed: 0, charm: 0 });
    }
  }, [totalExtraPoints, usedExtraPoints]);

  const adjustPoints = (stat: StatKey, delta: number) => {
    const newValue = extraPoints[stat] + delta;
    if (newValue < 0) return;
    if (delta > 0 && remainingPoints < delta) return;
    setExtraPoints(prev => ({ ...prev, [stat]: newValue }));
  };

  // Simple view
  if (!isAdvanced) {
    return (
      <div className="card-gold p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold">
            Chỉ số
          </div>
          <button
            onClick={() => setIsAdvanced(true)}
            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors uppercase tracking-wider"
          >
            Nâng cao →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {STAT_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded border border-[var(--border)]">
              <span className="text-[12px] text-[var(--text-secondary)]">{STAT_LABELS[key]}</span>
              <div className="text-right">
                <span className="text-[15px] font-bold text-[var(--text-primary)]">
                  {calculatedStats[key].base || '-'}
                </span>
                {calculatedStats[key].growth > 0 && (
                  <span className="text-[11px] text-green-400 ml-1">
                    +{calculatedStats[key].growth}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Advanced view
  return (
    <div className="card-gold p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold">
          Tính chỉ số
        </div>
        <button
          onClick={() => setIsAdvanced(false)}
          className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Controls - Compact row */}
      <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-[var(--border)]">
        {/* Level */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-tertiary)]">Cấp</span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={level}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setLevel(Math.min(50, Math.max(1, val)));
              }}
              className="w-8 h-6 text-[12px] text-center font-bold text-[var(--accent-gold)] bg-transparent border-b border-[var(--border)] focus:border-[var(--accent-gold)] outline-none"
            />
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-tertiary)]">Hột</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStars(stars >= s ? s - 1 : s)}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  stars >= s
                    ? 'bg-red-500 border-red-500'
                    : 'bg-transparent border-[var(--border)] hover:border-[var(--text-tertiary)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Animated Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[11px] text-[var(--text-tertiary)]">Hình động</span>
          <button
            onClick={() => setIsAnimated(!isAnimated)}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              isAnimated ? 'bg-[var(--accent-gold)]' : 'bg-[var(--border)]'
            }`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              isAnimated ? 'left-4' : 'left-0.5'
            }`} />
          </button>
        </label>

        {/* Collective Card Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[11px] text-[var(--text-tertiary)]">Thẻ sưu tầm</span>
          <button
            onClick={() => setHasCollectiveCard(!hasCollectiveCard)}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              hasCollectiveCard ? 'bg-[var(--accent-gold)]' : 'bg-[var(--border)]'
            }`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              hasCollectiveCard ? 'left-4' : 'left-0.5'
            }`} />
          </button>
        </label>

        {/* Remaining Points */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-[var(--text-tertiary)]">Điểm tự do</span>
          <span className={`text-[13px] font-bold ${remainingPoints > 0 ? 'text-green-400' : 'text-[var(--text-primary)]'}`}>
            {remainingPoints}/{totalExtraPoints}
          </span>
        </div>
      </div>

      {/* Stats - Compact grid */}
      <div className="grid grid-cols-3 gap-2">
        {STAT_KEYS.map((key) => (
          <div key={key} className="bg-[var(--bg-tertiary)] rounded px-2 py-2 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--text-tertiary)]">{STAT_LABELS[key]}</span>
              <span className="text-[14px] font-bold text-[var(--accent-gold)]">
                {Math.round(calculatedStats[key].final)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[var(--text-tertiary)]">
                {calculatedStats[key].base}+{calculatedStats[key].growth}/lv
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustPoints(key, -10)}
                  disabled={extraPoints[key] < 10}
                  className="w-5 h-5 rounded text-[11px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-30"
                >
                  -
                </button>
                <span className="text-[11px] font-semibold text-green-400 w-6 text-center">
                  +{extraPoints[key]}
                </span>
                <button
                  onClick={() => adjustPoints(key, 10)}
                  disabled={remainingPoints < 10}
                  className="w-5 h-5 rounded text-[11px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Highlight special patterns in effect text
function highlightEffectText(text: string): React.ReactNode {
  if (!text) return null;

  const pattern = /(\d+(?:\.\d+)?%\s*[→→]\s*\d+(?:\.\d+)?%)|(\d+-\d+)|(\d+(?:\.\d+)?%)|(\d+\s*hiệp)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matchedText = match[0];

    if (match[1]) {
      parts.push(<span key={match.index} className="text-[var(--accent-gold)] font-semibold">{matchedText}</span>);
    } else if (match[2]) {
      parts.push(<span key={match.index} className="text-blue-400">{matchedText}</span>);
    } else if (match[3]) {
      parts.push(<span key={match.index} className="text-[var(--accent-gold-dim)]">{matchedText}</span>);
    } else if (match[4]) {
      parts.push(<span key={match.index} className="text-green-400">{matchedText}</span>);
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Skill Card Component
function SkillCard({
  title,
  skill,
}: {
  title: string;
  skill: General['innate_skill'];
}) {
  if (!skill) return null;

  const typeId = (skill.type?.id || 'unknown') as SkillTypeId;
  const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  return (
    <div className="card-gold p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold">{title}</div>
        <div className="flex gap-2">
          <span className={`pill ${typeColor.text}`}>{typeName.vi}</span>
          {skill.quality && (
            <span className={`pill ${qualityColors[skill.quality]}`}>{skill.quality}</span>
          )}
          {skill.trigger_rate && (
            <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[12px] font-bold border border-amber-500/30">
              {skill.trigger_rate}%
            </span>
          )}
        </div>
      </div>

      {/* Skill Name */}
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        {skill.name}
      </h3>

      {/* Effect Description */}
      {skill.effect && (
        <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">
          {highlightEffectText(skill.effect || '')}
        </div>
      )}

      {/* Target */}
      {(skill.target) && (
        <div className="flex items-start gap-3 text-[13px] mb-3">
          <span className="text-[var(--accent-gold-dim)] uppercase tracking-wider">Mục tiêu:</span>
          <span className="text-[var(--text-secondary)]">{TARGET_LABELS[skill.target] || skill.target}</span>
        </div>
      )}

      {/* Army Types */}
      {skill.army_types && skill.army_types.length > 0 && (
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-[var(--accent-gold-dim)] uppercase tracking-wider">Binh chủng:</span>
          <div className="flex gap-2">
            {skill.army_types.map((army) => (
              <ArmyIcon key={army} type={army as ArmyIconType} size={20} />
            ))}
          </div>
        </div>
      )}

      {/* No details */}
      {!skill.effect && (
        <div className="text-[13px] text-[var(--text-tertiary)] italic">Chưa có thông tin</div>
      )}
    </div>
  );
}

export default function GeneralDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [general, setGeneral] = useState<General | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useUser();

  const handleSuggestClick = () => {
    if (user) {
      setShowSuggestModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  usePageTitle(general?.name || 'Võ tướng');

  useEffect(() => {
    async function loadGeneral() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGeneral(id);
        setGeneral(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tìm thấy võ tướng');
      } finally {
        setLoading(false);
      }
    }

    loadGeneral();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="h-4 w-32 bg-[var(--bg-secondary)] mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-[2.5/3.5] bg-[var(--bg-secondary)] animate-pulse" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-12 bg-[var(--bg-secondary)] w-64 animate-pulse" />
            <div className="h-8 bg-[var(--bg-secondary)] w-32 animate-pulse" />
            <div className="h-32 bg-[var(--bg-secondary)] animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !general) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)] mb-4">Không tìm thấy võ tướng</p>
          <Link href="/generals" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)]">
            ← Quay lại
          </Link>
        </div>
      </main>
    );
  }

  const factionId = general.faction_id as FactionId;
  const factionName = factionNames[factionId] || factionNames.qun;
  const factionColor = factionColors[factionId] || factionColors.qun;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/generals" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] text-[13px] transition-colors uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Võ tướng
        </Link>
        <SuggestEditButton onClick={handleSuggestClick} />
      </div>

      {/* Header */}
      <div className="card-gold p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: Name, Faction, Cost */}
          <div className="flex items-center gap-4 flex-1">
            {/* Cost Seal */}
            <div className="cost-seal flex-shrink-0">
              <div className="cost-seal-inner">
                <span>{general.cost}</span>
              </div>
            </div>

            <div>
              {/* Name */}
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">
                {general.name}
              </h1>
              {/* Faction */}
              <div className={`text-[13px] font-semibold uppercase tracking-wider mt-1 ${factionColor.text}`}>
                {factionName.vi}
              </div>
            </div>
          </div>

          {/* Divider - vertical on desktop */}
          <div className="hidden md:block w-px h-16 bg-[var(--border)]" />
          <div className="md:hidden border-t border-[var(--border)]" />

          {/* Right: Army Types */}
          <div className="flex gap-2 flex-wrap">
            {troopTypes.map(type => {
              const grade = general.troop_compatibility?.[type]?.grade as Grade;
              const gradeStyle = gradeColors[grade] || { text: 'text-[var(--text-tertiary)]', border: 'border-[var(--border)]', color: '#5c574f' };
              return (
                <div
                  key={type}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-tertiary)] border ${gradeStyle.border}`}
                >
                  <TroopIcon
                    type={type}
                    size={18}
                    style={{ color: gradeStyle.color }}
                  />
                  <span className={`text-[11px] uppercase ${gradeStyle.text}`}>
                    {troopTypeNames[type].vi}
                  </span>
                  <span className={`text-[13px] font-bold ${gradeStyle.text}`}>
                    {grade || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Portrait Card - Left Side */}
        <div className="md:w-72 flex-shrink-0">
          {/* Portrait */}
          <div className="card overflow-hidden">
            <div className="relative aspect-[7/10]">
              <img
                src={general.image_full || general.image || '/images/general-placeholder.svg'}
                alt={general.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Details Section - Right Side */}
        <div className="flex-1 space-y-4">
          {/* Stats Calculator */}
          <StatsCalculator general={general} />

          {/* Innate Skill */}
          {general.innate_skill && (
            <SkillCard title="Chiến pháp tự mang" skill={general.innate_skill} />
          )}

          {/* Inherited Skill */}
          {general.inherited_skill && (
            <SkillCard title="Chiến pháp kế thừa" skill={general.inherited_skill} />
          )}
        </div>
      </div>

      {/* Suggest Edit Modal */}
      {showSuggestModal && (
        <SuggestEditModal
          isOpen={showSuggestModal}
          onClose={() => setShowSuggestModal(false)}
          entityType="general"
          entity={general}
          onSuccess={() => {
            // Could show a success toast here
            alert('Đề xuất của bạn đã được gửi thành công!');
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
