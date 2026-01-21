'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getFormation, Formation } from '@/lib/formationsApi';
import { useUser } from '@/contexts/UserContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import FormationCanvas from '@/components/formations/FormationCanvas';
import ShareButton from '@/components/formations/ShareButton';
import VoteButtons from '@/components/formations/VoteButtons';

const armyTypeLabels: Record<string, string> = {
  CAVALRY: 'Kỵ',
  SHIELD: 'Khiên',
  ARCHER: 'Cung',
  SPEAR: 'Thương',
  SIEGE: 'Xe',
};

const armyTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  CAVALRY: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  SHIELD: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  ARCHER: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  SPEAR: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  SIEGE: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
};

export default function FormationDetailPage() {
  const params = useParams();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankScore, setRankScore] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState<number | null>(null);

  usePageTitle(formation ? (formation.name || formation.generals?.[0]?.generalName || 'Đội Hình') : 'Đội Hình');

  useEffect(() => {
    async function loadFormation() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFormation(Number(params.id));
        setFormation(data);
        // Calculate rank score from upvotes/downvotes
        const calculatedRankScore = (data.upvotes || 0) - (data.downvotes || 0);
        const calculatedVoteCount = (data.upvotes || 0) + (data.downvotes || 0);
        setRankScore(calculatedRankScore);
        setVoteCount(calculatedVoteCount);
        setUserVote(data.userVote || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadFormation();
    }
  }, [params.id]);

  const handleVoteSuccess = (newRankScore: number, newVoteCount: number, newUserVote: number) => {
    setRankScore(newRankScore);
    setVoteCount(newVoteCount);
    setUserVote(newUserVote);
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="card p-8 animate-pulse">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] mb-4" />
          <div className="h-64 bg-[var(--bg-secondary)]" />
        </div>
      </main>
    );
  }

  if (error || !formation) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="card-red p-4">
          <span className="text-red-400">{error || 'Không tìm thấy đội hình'}</span>
        </div>
      </main>
    );
  }

  const armyColors = armyTypeColors[formation.armyType] || armyTypeColors.CAVALRY;
  const generals = formation.generals.sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Hidden Canvas for Export */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <FormationCanvas formation={formation} />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back and Actions */}
        <div className="mb-6 flex items-center justify-between">
        <Link
          href="/formations"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Link>
        <div className="flex items-center gap-3">
          <ShareButton formation={formation} />
        </div>
      </div>

      {/* Formation Canvas */}
      <div className="card-gold p-6 mb-6">
        {/* Generals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {generals.map((gen, idx) => (
            <div key={idx} className="card p-4">
              {/* Role Label */}
              <div className={`text-[13px] mb-3 uppercase tracking-wider text-center ${idx === 0 ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`}>
                {idx === 0 ? 'Chủ Tướng' : 'Phó Tướng'}
              </div>
              {/* General Image */}
              <div className="aspect-[7/10] rounded overflow-hidden bg-[var(--bg-secondary)] mb-3">
                {gen.generalImage ? (
                  <img
                    src={gen.generalImage}
                    alt={gen.generalName || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                    Chưa có võ tướng
                  </div>
                )}
              </div>

              {/* General Info */}
              {gen.generalName && (
                <div className="text-center mb-3">
                  <h3 className="font-serif font-semibold text-[17px] text-[var(--text-primary)]">
                    {gen.generalName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {gen.generalGrade && (
                      <span className={`text-[13px] font-bold ${
                        gen.generalGrade === 'S' ? 'text-orange-400' :
                        gen.generalGrade === 'A' ? 'text-purple-400' :
                        gen.generalGrade === 'B' ? 'text-sky-400' :
                        'text-cyan-300'
                      }`}>
                        [{gen.generalGrade}]
                      </span>
                    )}
                    {gen.generalCost !== undefined && (
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold">{gen.generalCost}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-3">
                {/* Innate Skill */}
                {gen.innateSkillName && (
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="text-[11px] text-[var(--text-tertiary)] mb-1 uppercase">Tự mang:</div>
                    <div className="text-[13px] text-[var(--text-primary)]">{gen.innateSkillName}</div>
                  </div>
                )}

                {/* Skill 1 */}
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="text-[11px] text-[var(--text-tertiary)] mb-1 uppercase">Chiến pháp 1:</div>
                  {gen.skill1Name ? (
                    <div className="text-[13px] text-[var(--text-primary)]">{gen.skill1Name}</div>
                  ) : (
                    <div className="text-[13px] text-[var(--text-tertiary)] italic">Trống</div>
                  )}
                </div>

                {/* Skill 2 */}
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="text-[11px] text-[var(--text-tertiary)] mb-1 uppercase">Chiến pháp 2:</div>
                  {gen.skill2Name ? (
                    <div className="text-[13px] text-[var(--text-primary)]">{gen.skill2Name}</div>
                  ) : (
                    <div className="text-[13px] text-[var(--text-tertiary)] italic">Trống</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Army Type and Total Cost */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1.5 text-[13px] font-medium border ${armyColors.bg} ${armyColors.text} ${armyColors.border}`}>
            {armyTypeLabels[formation.armyType] || formation.armyType}
          </span>
          <span className="text-[15px] text-[var(--text-secondary)]">
            Tổng COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold text-[var(--text-primary)] text-[17px]">{formation.totalCost}</span>
          </span>
        </div>
      </div>

      {/* Formation Details */}
      <div className="card p-6 mb-6">
        {(formation.name || formation.generals?.[0]?.generalName) && (
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">
            {formation.name || formation.generals?.[0]?.generalName}
          </h2>
        )}
        {formation.description && (
          <p className="text-[var(--text-secondary)] mb-4 whitespace-pre-wrap">{formation.description}</p>
        )}
        <div className="text-[13px] text-[var(--text-tertiary)] flex items-center gap-4">
          <span>Tạo bởi: {formation.username || 'Ẩn danh'}</span>
          <span>|</span>
          <span>Ngày tạo: {new Date(formation.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Voting (for curated formations) */}
      {formation.isCurated && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bình chọn</h3>
            {formation.rank && (
              <div className="text-[var(--accent-gold)] font-bold text-[18px]">
                Vị trí: #{formation.rank}
              </div>
            )}
          </div>

          <VoteButtons
            formationId={formation.id}
            initialRankScore={rankScore}
            initialVoteCount={voteCount}
            initialUserVote={userVote}
            isCurated={formation.isCurated}
            onVoteSuccess={handleVoteSuccess}
          />
        </div>
      )}
      </main>
    </>
  );
}
