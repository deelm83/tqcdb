'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkillTypeId, skillTypeNames } from '@/lib/skills';
import { fetchSkill, fetchGeneralsMap, Skill } from '@/lib/api';
import { ArmyIcon, ArmyIconType } from '@/components/icons/TroopIcons';
import { useUser } from '@/contexts/UserContext';
import SuggestEditButton from '@/components/SuggestEditButton';
import SuggestEditModal from '@/components/SuggestEditModal';
import LoginModal from '@/components/LoginModal';

// Skill type colors
const skillTypeStyles: Record<SkillTypeId, { bg: string; text: string; border: string }> = {
  command: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', border: 'border-yellow-500' },
  active: { bg: 'bg-red-500/20', text: 'text-red-600', border: 'border-red-500' },
  assault: { bg: 'bg-orange-500/20', text: 'text-orange-600', border: 'border-orange-500' },
  passive: { bg: 'bg-blue-500/20', text: 'text-blue-600', border: 'border-blue-500' },
  formation: { bg: 'bg-purple-500/20', text: 'text-purple-600', border: 'border-purple-500' },
  troop: { bg: 'bg-green-500/20', text: 'text-green-600', border: 'border-green-500' },
  internal: { bg: 'bg-cyan-500/20', text: 'text-cyan-600', border: 'border-cyan-500' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-600', border: 'border-gray-500' },
};

// Quality colors
const qualityStyles: Record<string, string> = {
  S: 'text-[var(--accent)] font-bold',
  A: 'text-[var(--accent-dim)] font-semibold',
  B: 'text-blue-600',
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
        <span key={match.index} className="text-[var(--accent)] font-semibold">
          {matchedText}
        </span>
      );
    } else if (match[2]) {
      parts.push(
        <span key={match.index} className="text-cyan-600 font-medium">
          {matchedText}
        </span>
      );
    } else if (match[3]) {
      parts.push(
        <span key={match.index} className="text-[var(--accent)]">
          {matchedText}
        </span>
      );
    } else if (match[4]) {
      parts.push(
        <span key={match.index} className="text-green-600">
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
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-32 mb-6 shimmer" />
          <div className="h-64 bg-[var(--bg-secondary)] rounded-xl shimmer" />
        </main>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-12 card">
          <div className="text-4xl mb-4">
            <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-3">Không tìm thấy chiến pháp</h1>
          <Link href="/skills" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
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
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb and Actions */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/skills" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--accent)] text-sm transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Danh sách chiến pháp
          </Link>
          <SuggestEditButton onClick={handleSuggestClick} />
        </div>

        {/* Skill Card */}
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 ${styles.bg} border-b border-[var(--border)]/50`}>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-[var(--accent)]">
                {skill.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-end">
                <span className={`px-3 py-1 rounded text-sm font-medium border ${styles.bg} ${styles.text} ${styles.border}/40`}>
                  {typeName.vi}
                </span>
                {skill.quality && (
                  <span className={`px-3 py-1 rounded text-sm font-bold bg-[var(--bg-elevated)] border border-[var(--border)] ${qualityStyles[skill.quality] || 'text-[var(--text-tertiary)]'}`}>
                    {skill.quality}
                  </span>
                )}
                {skill.trigger_rate && (
                  <span className="px-3 py-1 rounded text-sm bg-[var(--accent)]/15 border border-[var(--accent)]/30 font-semibold">
                    <span className="text-[var(--accent)]">{skill.trigger_rate}%</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Effect */}
            {skill.effect && (
              <div className="p-5 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]/50">
                <div className="text-xs text-[var(--accent)] mb-3 font-medium">Hiệu ứng</div>
                <div className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {highlightEffectText(skill.effect || '')}
                </div>
              </div>
            )}

            {/* Target */}
            {skill.target && (
              <div className="flex items-start gap-3">
                <span className="text-[var(--text-tertiary)] min-w-[100px]">Mục tiêu:</span>
                <span className="text-[var(--text-secondary)]">{TARGET_LABELS[skill.target] || skill.target}</span>
              </div>
            )}

            {/* Army Types */}
            {skill.army_types && skill.army_types.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-tertiary)] min-w-[100px]">Binh chủng:</span>
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
            <div className="pt-5 border-t border-[var(--border)]/50">
              <div className="text-xs text-[var(--accent)] mb-4 font-medium">Cách nhận</div>
              <div className="space-y-3">
                {/* Innate */}
                {skill.innate_to && skill.innate_to.length > 0 && (
                  <div>
                    <span className="text-orange-600 font-medium">Tự mang: </span>
                    <span className="text-[var(--text-secondary)]">
                      {skill.innate_to.map((name, idx) => {
                        const general = generalsByName[name];
                        return (
                          <span key={name}>
                            {idx > 0 && ', '}
                            {general ? (
                              <Link
                                href={`/generals/${general.id}`}
                                className="text-[var(--accent)] hover:text-[var(--accent)] hover:underline"
                              >
                                {general.vi}
                              </Link>
                            ) : (
                              <span className="text-red-600">{name}</span>
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
                    <span className="text-purple-600 font-medium">Truyền thừa từ: </span>
                    <span className="text-[var(--text-secondary)]">
                      {skill.inheritance_from.map((name, idx) => {
                        const general = generalsByName[name];
                        return (
                          <span key={name}>
                            {idx > 0 && ', '}
                            {general ? (
                              <Link
                                href={`/generals/${general.id}`}
                                className="text-[var(--accent)] hover:text-[var(--accent)] hover:underline"
                              >
                                {general.vi}
                              </Link>
                            ) : (
                              <span className="text-red-600">{name}</span>
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
                      <span className="px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-600 border border-cyan-700/50">
                        {skill.exchange_type === 'exact'
                          ? `${skill.exchange_generals?.length || 0} tướng`
                          : `${skill.exchange_count || skill.exchange_generals?.length || 0} tướng`
                        }
                      </span>
                    </div>
                    {skill.exchange_generals && skill.exchange_generals.length > 0 && (
                      <div className="text-[var(--text-secondary)]">
                        {skill.exchange_type === 'any' && (
                          <span className="text-cyan-600 mr-2">Chọn từ các tướng:</span>
                        )}
                        {skill.exchange_generals.map((name, idx) => {
                          const general = generalsByName[name];
                          const separator = skill.exchange_type === 'exact' ? ' / ' : ', ';
                          return (
                            <span key={name}>
                              {idx > 0 && <span className="text-[var(--text-tertiary)]">{separator}</span>}
                              {general ? (
                                <Link
                                  href={`/generals/${general.id}`}
                                  className="text-[var(--accent)] hover:text-[var(--accent)] hover:underline"
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
                  <span className="text-[var(--text-tertiary)]">Chưa rõ</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggest Edit Modal */}
        {showSuggestModal && skill && (
          <SuggestEditModal
            isOpen={showSuggestModal}
            onClose={() => setShowSuggestModal(false)}
            entityType="skill"
            entity={skill}
            onSuccess={() => {
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
    </div>
  );
}
