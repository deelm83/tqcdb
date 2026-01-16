'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { factionNames, troopTypeNames, FactionId, Grade } from '@/lib/generals';
import { skillTypeNames, armyTypeNames, SkillTypeId, ArmyType } from '@/lib/skills';
import { fetchGeneral, General } from '@/lib/api';
import { TroopType } from '@/types/general';
import { TroopIcon, ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';

const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];

// Faction styling
const factionStyles: Record<FactionId, { gradient: string; border: string; text: string; badge: string; bg: string }> = {
  wei: {
    gradient: 'from-blue-500/30 to-blue-900/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    badge: 'bg-gradient-to-r from-blue-900 to-blue-800 text-blue-200 border-blue-400/50',
    bg: 'from-blue-950/50 to-[#0a0e14]',
  },
  shu: {
    gradient: 'from-green-500/30 to-green-900/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    badge: 'bg-gradient-to-r from-green-900 to-green-800 text-green-200 border-green-400/50',
    bg: 'from-green-950/50 to-[#0a0e14]',
  },
  wu: {
    gradient: 'from-red-500/30 to-red-900/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    badge: 'bg-gradient-to-r from-red-900 to-red-800 text-red-200 border-red-400/50',
    bg: 'from-red-950/50 to-[#0a0e14]',
  },
  qun: {
    gradient: 'from-amber-500/30 to-amber-900/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    badge: 'bg-gradient-to-r from-amber-900 to-amber-800 text-amber-200 border-amber-400/50',
    bg: 'from-amber-950/50 to-[#0a0e14]',
  },
};

// Grade colors
const gradeStyles: Record<Grade, string> = {
  S: 'text-amber-400 font-bold text-xl',
  A: 'text-purple-400 font-semibold text-lg',
  B: 'text-sky-300 text-lg',
  C: 'text-cyan-400 text-lg',
};

// Skill type colors
const skillTypeStyles: Record<SkillTypeId, { bg: string; text: string; border: string }> = {
  command: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  active: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  assault: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  passive: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
  formation: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  troop: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
  internal: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40' },
};

// Quality colors
const qualityStyles: Record<string, string> = {
  S: 'text-amber-400',
  A: 'text-red-400',
  B: 'text-violet-400',
};

// Highlight special patterns in effect text
function highlightEffectText(text: string): React.ReactNode {
  if (!text) return null;

  // Combined regex to match different patterns
  // 1. Range with arrow: "37.5%→75%" or "39%→42%"
  // 2. Number ranges: "1-2", "2-3" (for targets)
  // 3. Percentages: "40%", "3%"
  // 4. Duration: "1 hiệp", "2 hiệp"
  const pattern = /(\d+(?:\.\d+)?%\s*[→→]\s*\d+(?:\.\d+)?%)|(\d+-\d+)|(\d+(?:\.\d+)?%)|(\d+\s*hiệp)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matchedText = match[0];

    // Style based on match type
    if (match[1]) {
      // Range with arrow - most prominent highlight
      parts.push(
        <span key={match.index} className="text-amber-400 font-semibold">
          {matchedText}
        </span>
      );
    } else if (match[2]) {
      // Number range like 1-2
      parts.push(
        <span key={match.index} className="text-cyan-400 font-medium">
          {matchedText}
        </span>
      );
    } else if (match[3]) {
      // Single percentage
      parts.push(
        <span key={match.index} className="text-amber-300">
          {matchedText}
        </span>
      );
    } else if (match[4]) {
      // Duration
      parts.push(
        <span key={match.index} className="text-green-400">
          {matchedText}
        </span>
      );
    }

    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Skill Card Component
function SkillCard({
  title,
  skill,
  accentColor,
  icon,
}: {
  title: string;
  skill: General['innate_skill'];
  accentColor: string;
  icon: string;
}) {
  if (!skill) return null;

  const typeId = (skill.type?.id || 'unknown') as SkillTypeId;
  const typeColors = skillTypeStyles[typeId] || skillTypeStyles.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  return (
    <div className="relative rounded-xl border border-[#2a3548] bg-gradient-to-br from-[#1a2130] to-[#12171f] overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#d4a74a]/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#d4a74a]/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#d4a74a]/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#d4a74a]/40" />

      {/* Header */}
      <div className={`px-5 py-3 bg-gradient-to-r ${accentColor} border-b border-[#2a3548]/50`}>
        <h2 className="text-sm font-semibold text-[#d4a74a] flex items-center gap-2 uppercase tracking-wider">
          <span>{icon}</span>
          {title}
        </h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Skill Name and Badges */}
        <div className="flex items-center justify-between gap-4">
          <div
            className="text-2xl text-[#f0c96e]"
            style={{
              fontFamily: 'var(--font-great-vibes), cursive',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {skill.name.vi || skill.name.cn}
          </div>

          {/* Type and Quality badges */}
          <div className="flex flex-wrap gap-2 justify-end">
            <span className={`px-3 py-1 rounded text-xs font-medium border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
              {typeName.vi}
            </span>
            {skill.quality && (
              <span className={`px-3 py-1 rounded text-xs font-bold bg-[#1e2636] border border-[#2a3548] ${qualityStyles[skill.quality] || 'text-gray-400'}`}>
                {skill.quality}
              </span>
            )}
            {skill.trigger_rate && (
              <span className="px-3 py-1 rounded text-xs bg-amber-900/30 border border-amber-500/40 text-amber-300 font-semibold">
                <span className="text-amber-400">{skill.trigger_rate}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Effect Description */}
        {skill.effect && (
          <div className="p-4 bg-[#0a0e14]/50 rounded-lg border border-[#2a3548]/50">
            <div className="text-xs text-[#d4a74a] uppercase tracking-wider mb-2">Hiệu ứng</div>
            <div className="text-sm text-[#b8a990] leading-relaxed">
              {highlightEffectText(skill.effect.vi || skill.effect.cn || '')}
            </div>
          </div>
        )}

        {/* Target */}
        {(skill.target_vi || skill.target) && (
          <div className="flex items-start gap-3 text-sm">
            <span className="text-[#6b7280] min-w-[80px]">Mục tiêu:</span>
            <span className="text-[#b8a990]">{skill.target_vi || skill.target}</span>
          </div>
        )}

        {/* Army Types */}
        {skill.army_types && skill.army_types.length > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#6b7280]">Binh chủng:</span>
            <div className="flex gap-2">
              {skill.army_types.map((army) => (
                <ArmyIcon
                  key={army}
                  type={army as ArmyIconType}
                  size={24}
                />
              ))}
            </div>
          </div>
        )}

        {/* No details */}
        {!skill.effect && (
          <div className="text-sm text-[#6b7280] italic">
            Chưa có thông tin chi tiết
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneralDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [general, setGeneral] = useState<General | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGeneral() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGeneral(id);
        setGeneral(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tìm thấy tướng');
      } finally {
        setLoading(false);
      }
    }

    loadGeneral();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="h-4 bg-[#2a3548] rounded w-32 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-[2.5/3.5] bg-[#1a2130] rounded-xl animate-pulse" />
            <div className="md:col-span-2 space-y-4">
              <div className="h-12 bg-[#2a3548] rounded w-64 animate-pulse" />
              <div className="h-8 bg-[#2a3548] rounded w-32 animate-pulse" />
              <div className="h-32 bg-[#1a2130] rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !general) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-12 rounded-xl border border-[#2a3548] bg-[#1a2130]">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-[#e8dcc8] mb-3">Không tìm thấy tướng</h1>
          <Link href="/generals" className="text-[#d4a74a] hover:text-[#f0c96e] transition-colors">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const factionId = general.faction_id as FactionId;
  const styles = factionStyles[factionId] || factionStyles.qun;
  const factionName = factionNames[factionId] || factionNames.qun;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${styles.bg}`}>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/generals" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#d4a74a] text-sm transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách tướng
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Portrait Card - Left Side */}
          <div className="md:w-64 flex-shrink-0 space-y-4 sticky top-24 self-start">
            <div className={`relative rounded-2xl border-2 ${styles.border} overflow-hidden bg-gradient-to-br from-[#1a2130] to-[#0a0e14] aspect-[2.5/3.5]`}>
              {/* Corner decorations */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-[#d4a74a]/50 z-10" />
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-[#d4a74a]/50 z-10" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-[#d4a74a]/50 z-10" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-[#d4a74a]/50 z-10" />

              {/* Cost badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#d4a74a]/30 rounded-full blur-md" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f0c96e] via-[#d4a74a] to-[#8b6914] rounded-full shadow-lg" />
                  <div className="absolute inset-1 border-2 border-[#0a0e14]/30 rounded-full" />
                  <span className="relative text-xl font-black text-[#0a0e14]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
                    {general.cost}
                  </span>
                </div>
              </div>

              {/* Faction badge */}
              <div className="absolute top-4 -right-1 z-20">
                <div className={`px-2 py-1 ${styles.badge} text-xs font-bold tracking-wider shadow-lg border-l`}>
                  {factionName.vi}
                </div>
              </div>

              {/* Image */}
              <div className="absolute inset-3">
                <img
                  src={general.image_full || general.image || '/images/general-placeholder.svg'}
                  alt={general.name.vi}
                  className="w-full h-full object-cover object-top rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
              </div>

              {/* Name plate */}
              <div className="absolute bottom-4 left-3 right-3 z-10">
                <div className="relative bg-gradient-to-r from-[#1a1510] via-[#2a2015] to-[#1a1510] border border-[#d4a74a]/40 rounded px-2 py-2">
                  <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-[#d4a74a]" />
                  <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-[#d4a74a]" />
                  <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-[#d4a74a]" />
                  <div className="absolute -bottom-px -right-px w-2 h-2 border-r border-b border-[#d4a74a]" />
                  <h1
                    className="text-2xl font-bold text-[#f0c96e] text-center"
                    style={{
                      fontFamily: 'var(--font-great-vibes), cursive',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                    }}
                  >
                    {general.name.vi}
                  </h1>
                </div>
              </div>
            </div>

            {/* Troop Compatibility */}
            <div className="rounded-xl border border-[#2a3548] bg-gradient-to-br from-[#1a2130] to-[#12171f] overflow-hidden">
              <div className="px-3 py-2 border-b border-[#2a3548]/50">
                <h2 className="text-xs font-semibold text-[#d4a74a] flex items-center gap-2 uppercase tracking-wider">
                  <TroopIcon type="shield" size={14} className="text-[#d4a74a]" />
                  Binh Chủng
                </h2>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-5 gap-1">
                  {troopTypes.map(type => {
                    const grade = general.troop_compatibility?.[type]?.grade as Grade;
                    const isHighGrade = grade === 'S' || grade === 'A';
                    return (
                      <div
                        key={type}
                        className={`flex flex-col items-center p-1 rounded-lg transition-all ${isHighGrade ? 'bg-[#d4a74a]/10 border border-[#d4a74a]/30' : 'bg-[#0a0e14]/30'}`}
                      >
                        <TroopIcon
                          type={type}
                          size={16}
                          className={isHighGrade ? 'text-[#d4a74a]' : 'text-[#4a5568]'}
                        />
                        <span className="text-[8px] text-[#6b7280] mt-0.5">{troopTypeNames[type].vi}</span>
                        <span className={`text-xs ${gradeStyles[grade] || 'text-[#4a5568]'}`}>
                          {grade || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section - Right Side */}
          <div className="flex-1 space-y-6">
            {/* Innate Skill */}
            {general.innate_skill && (
              <SkillCard
                title="Chiến Pháp Tự Mang"
                skill={general.innate_skill}
                accentColor="from-orange-500/20 to-transparent"
                icon="⚔️"
              />
            )}

            {/* Inherited Skill */}
            {general.inherited_skill && (
              <SkillCard
                title="Chiến Pháp Kế Thừa"
                skill={general.inherited_skill}
                accentColor="from-purple-500/20 to-transparent"
                icon="📜"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
