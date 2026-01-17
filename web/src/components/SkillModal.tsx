'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';
import { Skill } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';

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

interface SkillModalProps {
  skill: Skill;
  generalsByName: Record<string, { id: number; vi: string }>;
  onClose: () => void;
}

export default function SkillModal({ skill, generalsByName, onClose }: SkillModalProps) {
  const typeId = skill.type.id as SkillTypeId;
  const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border)]">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] pr-8">
            {skill.name.vi || skill.name.cn}
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`pill ${typeColor.text}`}>{typeName.vi}</span>
            {skill.quality && (
              <span className={`pill ${qualityColors[skill.quality]}`}>{skill.quality}</span>
            )}
            {skill.trigger_rate && (
              <span className="pill text-[var(--text-secondary)]">{skill.trigger_rate}%</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Effect */}
          {(skill.effect?.vi || skill.effect?.cn) && (
            <div>
              <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold mb-3">Hiệu ứng</div>
              <div className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {highlightEffectText(skill.effect.vi || skill.effect.cn || '')}
              </div>
            </div>
          )}

          {/* Target */}
          {(skill.target_vi || skill.target) && (
            <div className="flex items-start gap-3">
              <span className="text-[13px] text-[var(--accent-gold-dim)] min-w-[80px] uppercase tracking-wider">Mục tiêu</span>
              <span className="text-[15px] text-[var(--text-secondary)]">{skill.target_vi || skill.target}</span>
            </div>
          )}

          {/* Army Types */}
          {skill.army_types && skill.army_types.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--accent-gold-dim)] min-w-[80px] uppercase tracking-wider">Binh chủng</span>
              <div className="flex gap-2">
                {skill.army_types.map((army) => (
                  <ArmyIcon key={army} type={army as ArmyIconType} size={22} />
                ))}
              </div>
            </div>
          )}

          {/* Acquisition */}
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="text-[11px] text-[var(--accent-gold)] uppercase tracking-widest font-semibold mb-4">Nguồn gốc</div>
            <div className="space-y-3">
              {/* Innate */}
              {skill.innate_to && skill.innate_to.length > 0 && (
                <div className="text-[13px]">
                  <span className="text-[var(--accent-gold)]">Sở hữu: </span>
                  <span className="text-[var(--text-secondary)]">
                    {skill.innate_to.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link href={`/generals/${general.id}`} className="text-[var(--accent-gold-dim)] hover:text-[var(--accent-gold)]">
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
                  <span className="text-[var(--accent-red-bright)]">Truyền thừa: </span>
                  <span className="text-[var(--text-secondary)]">
                    {skill.inheritance_from.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link href={`/generals/${general.id}`} className="text-[var(--accent-gold-dim)] hover:text-[var(--accent-gold)]">
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
                <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] text-blue-400 font-semibold uppercase tracking-wider">Đổi chiến pháp</span>
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
                              <Link href={`/generals/${general.id}`} className="text-[var(--accent-gold-dim)] hover:text-[var(--accent-gold)]">
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
