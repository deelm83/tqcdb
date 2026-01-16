'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { SkillTypeId, skillTypeNames, armyTypeNames, ArmyType } from '@/lib/skills';
import { Skill } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';

// Skill type colors
const skillTypeStyles: Record<SkillTypeId, { bg: string; text: string; border: string }> = {
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

interface SkillModalProps {
  skill: Skill;
  generalsByName: Record<string, { id: number; vi: string }>;
  onClose: () => void;
}

export default function SkillModal({ skill, generalsByName, onClose }: SkillModalProps) {
  const typeId = skill.type.id as SkillTypeId;
  const styles = skillTypeStyles[typeId] || skillTypeStyles.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2a3548] bg-gradient-to-br from-[#1a2130] to-[#0a0e14] shadow-2xl">
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#d4a74a]/50" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#d4a74a]/50" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#d4a74a]/50" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#d4a74a]/50" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1e2636] text-[#6b7280] hover:text-[#e8dcc8] hover:bg-[#2a3548] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`px-6 py-5 bg-gradient-to-r ${styles.bg} border-b border-[#2a3548]/50`}>
          <div className="flex items-center justify-between gap-4 pr-8">
            <h2
              className="text-2xl text-[#f0c96e]"
              style={{
                fontFamily: 'var(--font-great-vibes), cursive',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              {skill.name.vi || skill.name.cn}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-end">
              <span className={`px-3 py-1 rounded text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}/40`}>
                {typeName.vi}
              </span>
              {skill.quality && (
                <span className={`px-3 py-1 rounded text-xs font-bold bg-[#1e2636] border border-[#2a3548] ${qualityStyles[skill.quality] || 'text-gray-400'}`}>
                  {skill.quality}
                </span>
              )}
              {skill.trigger_rate && (
                <span className="px-3 py-1 rounded text-xs bg-[#1e2636] border border-[#2a3548] text-[#b8a990]">
                  Tỉ lệ: {skill.trigger_rate}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Effect */}
          {(skill.effect?.vi || skill.effect?.cn) && (
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
              <span className="text-[#6b7280] min-w-[100px]">Mục tiêu:</span>
              <span className="text-[#b8a990]">{skill.target_vi || skill.target}</span>
            </div>
          )}

          {/* Army Types */}
          {skill.army_types && skill.army_types.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#6b7280] min-w-[100px]">Binh chủng:</span>
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

          {/* Acquisition */}
          <div className="pt-4 border-t border-[#2a3548]/50">
            <div className="text-xs text-[#d4a74a] uppercase tracking-wider mb-3">Cách nhận</div>
            <div className="space-y-3">
              {/* Innate */}
              {skill.innate_to && skill.innate_to.length > 0 && (
                <div className="text-sm">
                  <span className="text-orange-400 font-medium">Tự mang: </span>
                  <span className="text-[#b8a990]">
                    {skill.innate_to.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link
                              href={`/generals/${general.id}`}
                              className="text-[#d4a74a] hover:text-[#f0c96e] hover:underline"
                            >
                              {general.vi}
                            </Link>
                          ) : (
                            <span className="text-red-400">{name}</span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}
              {/* Inherited */}
              {skill.inheritance_from && skill.inheritance_from.length > 0 && (
                <div className="text-sm">
                  <span className="text-purple-400 font-medium">Truyền thừa từ: </span>
                  <span className="text-[#b8a990]">
                    {skill.inheritance_from.map((name, idx) => {
                      const general = generalsByName[name];
                      return (
                        <span key={name}>
                          {idx > 0 && ', '}
                          {general ? (
                            <Link
                              href={`/generals/${general.id}`}
                              className="text-[#d4a74a] hover:text-[#f0c96e] hover:underline"
                            >
                              {general.vi}
                            </Link>
                          ) : (
                            <span className="text-red-400">{name}</span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}
              {/* Unknown */}
              {!skill.innate_to?.length && !skill.inheritance_from?.length && (
                <span className="text-sm text-[#6b7280]">Chưa rõ</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
