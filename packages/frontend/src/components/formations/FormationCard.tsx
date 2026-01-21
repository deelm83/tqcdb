'use client';

import Link from 'next/link';
import { Formation } from '@/lib/formationsApi';

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

interface FormationCardProps {
  formation: Formation;
}

export default function FormationCard({ formation }: FormationCardProps) {
  const armyColors = armyTypeColors[formation.armyType] || armyTypeColors.CAVALRY;

  // Get up to 3 generals
  const displayGenerals = formation.generals
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  return (
    <Link href={`/formations/${formation.id}`} className="block">
      <div className="card p-4 hover:border-[var(--accent-gold)] transition-colors h-full flex flex-col">
        {/* General Avatars */}
        <div className="flex gap-2 mb-3">
          {displayGenerals.map((gen, idx) => (
            <div key={idx} className="flex-1 min-w-0">
              <div className="aspect-[7/10] rounded overflow-hidden bg-[var(--bg-secondary)]">
                {gen.generalImage ? (
                  <img
                    src={gen.generalImage}
                    alt={gen.generalName || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                    ?
                  </div>
                )}
              </div>
              {gen.generalGrade && (
                <div className="text-center mt-1">
                  <span className={`text-[11px] font-bold ${
                    gen.generalGrade === 'S' ? 'text-orange-400' :
                    gen.generalGrade === 'A' ? 'text-purple-400' :
                    gen.generalGrade === 'B' ? 'text-sky-400' :
                    'text-cyan-300'
                  }`}>
                    [{gen.generalGrade}]
                  </span>
                </div>
              )}
              {gen.generalName && (
                <div className="text-[11px] text-center text-[var(--text-secondary)] mt-0.5 truncate">
                  {gen.generalName}
                </div>
              )}
            </div>
          ))}
          {/* Empty slots */}
          {[...Array(Math.max(0, 3 - displayGenerals.length))].map((_, idx) => (
            <div key={`empty-${idx}`} className="flex-1 min-w-0">
              <div className="aspect-[7/10] rounded border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] opacity-30" />
            </div>
          ))}
        </div>

        {/* Formation Name */}
        <h3 className="font-semibold text-[15px] text-[var(--text-primary)] mb-2 line-clamp-2 min-h-[2.5rem]">
          {formation.name || formation.generals?.[0]?.generalName || 'Đội Hình'}
        </h3>

        {/* Army Type and Cost */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-[11px] font-medium border ${armyColors.bg} ${armyColors.text} ${armyColors.border}`}>
            {armyTypeLabels[formation.armyType] || formation.armyType}
          </span>
          <span className="text-[13px] text-[var(--text-secondary)]">
            COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold">{formation.totalCost}</span>
          </span>
        </div>

        {/* Votes and Rank (for curated) */}
        <div className="flex items-center justify-between text-[13px] mt-auto">
          <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {formation.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              {formation.downvotes}
            </span>
          </div>
          {formation.isCurated && formation.rank && (
            <span className="text-[var(--accent-gold)] font-bold">
              #{formation.rank}
            </span>
          )}
        </div>

        {/* Created By */}
        <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
          Tạo bởi: {formation.username || 'Ẩn danh'}
        </div>
      </div>
    </Link>
  );
}
