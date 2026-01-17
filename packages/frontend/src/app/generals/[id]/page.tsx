'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { factionNames, factionColors, troopTypeNames, gradeColors, FactionId, Grade } from '@/lib/generals';
import { skillTypeNames, skillTypeColors, qualityColors, SkillTypeId } from '@/lib/skills';
import { fetchGeneral, General } from '@/lib/api';
import { TroopType } from '@/types/general';
import { TroopIcon, ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';
import { usePageTitle } from '@/hooks/usePageTitle';

const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];

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
            <span className="pill text-[var(--text-secondary)]">{skill.trigger_rate}%</span>
          )}
        </div>
      </div>

      {/* Skill Name */}
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        {skill.name.vi || skill.name.cn}
      </h3>

      {/* Effect Description */}
      {skill.effect && (
        <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4">
          {highlightEffectText(skill.effect.vi || skill.effect.cn || '')}
        </div>
      )}

      {/* Target */}
      {(skill.target_vi || skill.target) && (
        <div className="flex items-start gap-3 text-[13px] mb-3">
          <span className="text-[var(--accent-gold-dim)] uppercase tracking-wider">Mục tiêu:</span>
          <span className="text-[var(--text-secondary)]">{skill.target_vi || skill.target}</span>
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

  usePageTitle(general?.name?.vi || 'Võ tướng');

  useEffect(() => {
    async function loadGeneral() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGeneral(id);
        setGeneral(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Officer not found');
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
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/generals" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] text-[13px] transition-colors uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Võ tướng
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Portrait Card - Left Side */}
        <div className="md:w-72 flex-shrink-0 space-y-4">
          {/* Portrait */}
          <div className="card overflow-hidden">
            <div className="relative aspect-[2.5/3.5]">
              <img
                src={general.image_full || general.image || '/images/general-placeholder.svg'}
                alt={general.name.vi}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Cost badge */}
              <div className="absolute top-4 left-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-gold-bright)] to-[var(--accent-gold)] flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-[var(--bg)]">{general.cost}</span>
                </div>
              </div>

              {/* Faction badge */}
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 bg-black/70 ${factionColor.text} text-[12px] font-semibold uppercase tracking-wider`}>
                  {factionName.vi}
                </div>
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{general.name.vi}</h1>
              </div>
            </div>
          </div>

          {/* Troop Compatibility */}
          <div className="card-gold p-4">
            <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold mb-4">Tương thích binh chủng</div>
            <div className="grid grid-cols-5 gap-2">
              {troopTypes.map(type => {
                const grade = general.troop_compatibility?.[type]?.grade as Grade;
                const isHighGrade = grade === 'S' || grade === 'A';
                return (
                  <div key={type} className="flex flex-col items-center">
                    <TroopIcon
                      type={type}
                      size={22}
                      className={isHighGrade ? 'text-[var(--accent-gold)]' : 'text-[var(--text-tertiary)]'}
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] mt-1 uppercase">{troopTypeNames[type].en}</span>
                    <span className={`text-[14px] font-bold ${gradeColors[grade] || 'text-[var(--text-tertiary)]'}`}>
                      {grade || '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details Section - Right Side */}
        <div className="flex-1 space-y-4">
          {/* Innate Skill */}
          {general.innate_skill && (
            <SkillCard title="Innate Tactic" skill={general.innate_skill} />
          )}

          {/* Inherited Skill */}
          {general.inherited_skill && (
            <SkillCard title="Inherited Tactic" skill={general.inherited_skill} />
          )}
        </div>
      </div>
    </main>
  );
}
