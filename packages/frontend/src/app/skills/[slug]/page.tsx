'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkillTypeId, skillTypeNames } from '@/lib/skills';
import { fetchSkill, fetchGeneralsMap, Skill } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';

// Skill type colors
const skillTypeStyles: Record<SkillTypeId, { bg: string; text: string; border: string; gradient: string }> = {
  command: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', gradient: 'from-yellow-950/50' },
  active: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', gradient: 'from-red-950/50' },
  assault: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', gradient: 'from-orange-950/50' },
  passive: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', gradient: 'from-blue-950/50' },
  formation: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', gradient: 'from-purple-950/50' },
  troop: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', gradient: 'from-green-950/50' },
  internal: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500', gradient: 'from-cyan-950/50' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500', gradient: 'from-gray-950/50' },
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
      parts.push(
        <span key={match.index} className="text-amber-400 font-semibold">
          {matchedText}
        </span>
      );
    } else if (match[2]) {
      parts.push(
        <span key={match.index} className="text-cyan-400 font-medium">
          {matchedText}
        </span>
      );
    } else if (match[3]) {
      parts.push(
        <span key={match.index} className="text-amber-300">
          {matchedText}
        </span>
      );
    } else if (match[4]) {
      parts.push(
        <span key={match.index} className="text-green-400">
          {matchedText}
        </span>
      );
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function SkillDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [generalsByName, setGeneralsByName] = useState<Record<string, { id: string; vi: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [skillData, generalsMap] = await Promise.all([
          fetchSkill(slug),
          fetchGeneralsMap(),
        ]);
        setSkill(skillData);
        setGeneralsByName(generalsMap as any);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tìm thấy chiến pháp');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="h-4 bg-[#2a3548] rounded w-32 mb-6 animate-pulse" />
          <div className="h-64 bg-[#1a2130] rounded-xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-12 rounded-xl border border-[#2a3548] bg-[#1a2130]">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-[#e8dcc8] mb-3">Không tìm thấy chiến pháp</h1>
          <Link href="/skills" className="text-[#d4a74a] hover:text-[#f0c96e] transition-colors">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const typeId = (skill.type?.id || 'unknown') as SkillTypeId;
  const styles = skillTypeStyles[typeId] || skillTypeStyles.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${styles.gradient} to-[#0a0e14]`}>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/skills" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#d4a74a] text-sm transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách chiến pháp
          </Link>
        </div>

        {/* Skill Card */}
        <div className="relative rounded-2xl border border-[#2a3548] bg-gradient-to-br from-[#1a2130] to-[#0a0e14] overflow-hidden shadow-2xl">
          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#d4a74a]/50" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#d4a74a]/50" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#d4a74a]/50" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#d4a74a]/50" />

          {/* Header */}
          <div className={`px-6 py-5 bg-gradient-to-r ${styles.bg} border-b border-[#2a3548]/50`}>
            <div className="flex items-center justify-between gap-4">
              <h1
                className="text-3xl text-[#f0c96e]"
                style={{
                  fontFamily: 'var(--font-great-vibes), cursive',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {skill.name.vi || skill.name.cn}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-end">
                <span className={`px-3 py-1 rounded text-sm font-medium border ${styles.bg} ${styles.text} ${styles.border}/40`}>
                  {typeName.vi}
                </span>
                {skill.quality && (
                  <span className={`px-3 py-1 rounded text-sm font-bold bg-[#1e2636] border border-[#2a3548] ${qualityStyles[skill.quality] || 'text-gray-400'}`}>
                    {skill.quality}
                  </span>
                )}
                {skill.trigger_rate && (
                  <span className="px-3 py-1 rounded text-sm bg-amber-900/30 border border-amber-500/40 font-semibold">
                    <span className="text-amber-400">{skill.trigger_rate}%</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Effect */}
            {(skill.effect?.vi || skill.effect?.cn) && (
              <div className="p-5 bg-[#0a0e14]/50 rounded-xl border border-[#2a3548]/50">
                <div className="text-xs text-[#d4a74a] uppercase tracking-wider mb-3">Hiệu ứng</div>
                <div className="text-base text-[#b8a990] leading-relaxed">
                  {highlightEffectText(skill.effect.vi || skill.effect.cn || '')}
                </div>
              </div>
            )}

            {/* Target */}
            {(skill.target_vi || skill.target) && (
              <div className="flex items-start gap-3">
                <span className="text-[#6b7280] min-w-[100px]">Mục tiêu:</span>
                <span className="text-[#b8a990]">{skill.target_vi || skill.target}</span>
              </div>
            )}

            {/* Army Types */}
            {skill.army_types && skill.army_types.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[#6b7280] min-w-[100px]">Binh chủng:</span>
                <div className="flex gap-2">
                  {skill.army_types.map((army) => (
                    <ArmyIcon
                      key={army}
                      type={army as ArmyIconType}
                      size={28}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Acquisition */}
            <div className="pt-5 border-t border-[#2a3548]/50">
              <div className="text-xs text-[#d4a74a] uppercase tracking-wider mb-4">Cách nhận</div>
              <div className="space-y-3">
                {/* Innate */}
                {skill.innate_to && skill.innate_to.length > 0 && (
                  <div>
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
                  <div>
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
                {/* Exchange */}
                {skill.acquisition_type === 'exchange' && (
                  <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-700/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-cyan-400 font-medium">Đổi tướng</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                        {skill.exchange_type === 'exact'
                          ? `${skill.exchange_generals?.length || 0} tướng`
                          : `${skill.exchange_count || skill.exchange_generals?.length || 0} tướng`
                        }
                      </span>
                    </div>
                    {skill.exchange_generals && skill.exchange_generals.length > 0 && (
                      <div className="text-[#b8a990]">
                        {skill.exchange_type === 'any' && (
                          <span className="text-cyan-300 mr-2">Chọn từ các tướng:</span>
                        )}
                        {skill.exchange_generals.map((name, idx) => {
                          const general = generalsByName[name];
                          const separator = skill.exchange_type === 'exact' ? ' / ' : ', ';
                          return (
                            <span key={name}>
                              {idx > 0 && <span className="text-[#6b7280]">{separator}</span>}
                              {general ? (
                                <Link
                                  href={`/generals/${general.id}`}
                                  className="text-[#d4a74a] hover:text-[#f0c96e] hover:underline"
                                >
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
                  <span className="text-[#6b7280]">Chưa rõ</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
