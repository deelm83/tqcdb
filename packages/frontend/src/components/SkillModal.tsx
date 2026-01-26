'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';
import { Skill } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';

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

// Skill type left border colors for header
const typeHeaderBorders: Record<SkillTypeId, string> = {
  command: 'border-l-yellow-500',
  active: 'border-l-red-500',
  assault: 'border-l-orange-500',
  passive: 'border-l-blue-500',
  formation: 'border-l-purple-500',
  troop: 'border-l-green-500',
  internal: 'border-l-cyan-500',
  unknown: 'border-l-gray-400',
};

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
      parts.push(<span key={match.index} className="text-[var(--accent)] font-semibold">{matchedText}</span>);
    } else if (match[2]) {
      parts.push(<span key={match.index} className="text-blue-600">{matchedText}</span>);
    } else if (match[3]) {
      parts.push(<span key={match.index} className="text-[var(--accent-dim)]">{matchedText}</span>);
    } else if (match[4]) {
      parts.push(<span key={match.index} className="text-green-600">{matchedText}</span>);
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface SkillModalProps {
  skill: Skill;
  generalsByName: Record<string, { id: number; vi: string }>;
  onClose: () => void;
}

export default function SkillModal({ skill, generalsByName, onClose }: SkillModalProps) {
  const typeId = skill.type.id as SkillTypeId;
  const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;
  const headerBorder = typeHeaderBorders[typeId] || typeHeaderBorders.unknown;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'modalFadeIn 0.2s ease' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)]"
        style={{ animation: 'modalSlideUp 0.3s ease' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-tertiary)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header with type color left border */}
        <div className={`px-6 py-5 border-l-4 ${headerBorder} border-b border-[var(--border)]`}>
          <h2 className="text-xl font-bold text-[var(--text-primary)] pr-8">
            {skill.name}
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`pill ${typeColor.text}`}>{typeName.vi}</span>
            {skill.quality && (
              <span className={`pill ${qualityColors[skill.quality]}`}>{skill.quality}</span>
            )}
            {skill.trigger_rate && (
              <span className="pill text-[var(--accent)] font-bold">{skill.trigger_rate}%</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Effect */}
          {skill.effect && (
            <div>
              <div className="text-[13px] text-[var(--accent)] font-semibold mb-3">Hiệu ứng</div>
              <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {highlightEffectText(skill.effect || '')}
              </div>
            </div>
          )}

          {/* Target */}
          {skill.target && (
            <div className="flex items-start gap-3">
              <span className="text-[13px] text-[var(--text-tertiary)] min-w-[80px]">Mục tiêu</span>
              <span className="text-[15px] text-[var(--text-secondary)]">{TARGET_LABELS[skill.target] || skill.target}</span>
            </div>
          )}

          {/* Army Types */}
          {skill.army_types && skill.army_types.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--text-tertiary)] min-w-[80px]">Binh chủng</span>
              <div className="flex gap-2">
                {skill.army_types.map((army) => (
                  <ArmyIcon key={army} type={army as ArmyIconType} size={22} />
                ))}
              </div>
            </div>
          )}

          {/* Acquisition */}
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-[13px] text-[var(--accent)] font-semibold mb-4">Nguồn gốc</div>
            <div className="space-y-3">
              {/* Innate */}
              {skill.innate_to && skill.innate_to.length > 0 && (
                <div className="text-[13px]">
                  <span className="text-[var(--accent)]">Sở hữu: </span>
                  <span className="text-[var(--text-secondary)]">
                    {skill.innate_to.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link href={`/generals/${general.id}`} className="text-[var(--accent-dim)] hover:text-[var(--accent)]">
                              {general.vi}
                            </Link>
                          ) : (
                            <span>{name}</span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}

              {/* Inherited */}
              {skill.inheritance_from && skill.inheritance_from.length > 0 && (
                <div className="text-[13px]">
                  <span className="text-[var(--accent-dim)]">Truyền thừa: </span>
                  <span className="text-[var(--text-secondary)]">
                    {skill.inheritance_from.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link href={`/generals/${general.id}`} className="text-[var(--accent-dim)] hover:text-[var(--accent)]">
                              {general.vi}
                            </Link>
                          ) : (
                            <span>{name}</span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}

              {/* Exchange */}
              {skill.acquisition_type === 'exchange' && (
                <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] text-blue-600 font-semibold">Đổi chiến pháp</span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {skill.exchange_type === 'exact'
                        ? `${skill.exchange_generals?.length || 0} võ tướng`
                        : `${skill.exchange_count || skill.exchange_generals?.length || 0} võ tướng`}
                    </span>
                  </div>
                  {skill.exchange_generals && skill.exchange_generals.length > 0 && (
                    <div className="text-[13px] text-[var(--text-secondary)]">
                      {skill.exchange_type === 'any' && <span className="text-[var(--text-tertiary)] mr-1">Từ:</span>}
                      {skill.exchange_generals.map((name, idx) => {
                        const general = generalsByName[name];
                        const separator = skill.exchange_type === 'exact' ? ' / ' : ', ';
                        return (
                          <span key={name}>
                            {idx > 0 && <span className="text-[var(--text-tertiary)]">{separator}</span>}
                            {general ? (
                              <Link href={`/generals/${general.id}`} className="text-[var(--accent-dim)] hover:text-[var(--accent)]">
                                {general.vi}
                              </Link>
                            ) : (
                              <span>{name}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Unknown */}
              {!skill.innate_to?.length && !skill.inheritance_from?.length && skill.acquisition_type !== 'exchange' && (
                <span className="text-[13px] text-[var(--text-tertiary)]">Chưa rõ</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
