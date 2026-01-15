'use client';

import Link from 'next/link';
import { General } from '@/types/general';
import { factionNames, FactionId } from '@/lib/generals';

interface GeneralCardProps {
  general: General;
  index: number;
}

// Faction styling with colors and gradients
const factionStyles: Record<FactionId, {
  gradient: string;
  border: string;
  text: string;
  glow: string;
  badge: string;
  bg: string;
}> = {
  wei: {
    gradient: 'from-blue-500/25 to-blue-900/15',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30',
    badge: 'bg-gradient-to-r from-blue-900 to-blue-800 text-blue-200 border-blue-400/50',
    bg: 'bg-gradient-to-br from-blue-950/40 to-[#12171f]',
  },
  shu: {
    gradient: 'from-green-500/25 to-green-900/15',
    border: 'border-green-500/50',
    text: 'text-green-400',
    glow: 'shadow-green-500/30',
    badge: 'bg-gradient-to-r from-green-900 to-green-800 text-green-200 border-green-400/50',
    bg: 'bg-gradient-to-br from-green-950/40 to-[#12171f]',
  },
  wu: {
    gradient: 'from-red-500/25 to-red-900/15',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/30',
    badge: 'bg-gradient-to-r from-red-900 to-red-800 text-red-200 border-red-400/50',
    bg: 'bg-gradient-to-br from-red-950/40 to-[#12171f]',
  },
  qun: {
    gradient: 'from-amber-500/25 to-amber-900/15',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30',
    badge: 'bg-gradient-to-r from-amber-900 to-amber-800 text-amber-200 border-amber-400/50',
    bg: 'bg-gradient-to-br from-amber-950/40 to-[#12171f]',
  },
};

export default function GeneralCard({ general, index }: GeneralCardProps) {
  const factionId = general.faction_id as FactionId;
  const styles = factionStyles[factionId] || factionStyles.qun;
  const factionName = factionNames[factionId] || factionNames.qun;

  return (
    <Link href={`/generals/${general.slug || general.id}`} className="block group">
      <div className={`relative overflow-hidden rounded-xl border-2 ${styles.border} ${styles.bg} transition-all duration-300 hover:shadow-xl hover:${styles.glow} hover:scale-[1.02] aspect-[2.5/3.5]`}>
        {/* Card frame decoration - top corners */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-l-2 border-t-2 border-[#d4a74a]/40 rounded-tl" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-r-2 border-t-2 border-[#d4a74a]/40 rounded-tr" />
        {/* Card frame decoration - bottom corners */}
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-l-2 border-b-2 border-[#d4a74a]/40 rounded-bl" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-r-2 border-b-2 border-[#d4a74a]/40 rounded-br" />

        {/* Cost badge - top left corner - styled like a seal */}
        <div className="absolute top-2 left-2 z-10">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-[#d4a74a]/30 rounded-full blur-md" />
            {/* Badge background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0c96e] via-[#d4a74a] to-[#8b6914] rounded-full shadow-lg" />
            {/* Inner ring */}
            <div className="absolute inset-1 border-2 border-[#0a0e14]/30 rounded-full" />
            {/* Cost number */}
            <span className="relative text-xl font-black text-[#0a0e14] drop-shadow-sm" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>
              {general.cost}
            </span>
          </div>
        </div>

        {/* Faction badge - banner ribbon style */}
        <div className="absolute top-3 -right-1 z-10">
          <div className={`relative px-3 py-1 ${styles.badge} text-[10px] font-bold tracking-wider shadow-lg`}>
            {/* Ribbon fold effect */}
            <div className="absolute -bottom-1 right-0 w-1 h-1 bg-black/40" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
            <span>{factionName.vi}</span>
          </div>
        </div>

        {/* Portrait - takes most of the card */}
        <div className="absolute inset-0 p-2">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <img
              src={general.image || '/images/general-placeholder.svg'}
              alt={general.name.vi}
              className="w-full h-full object-cover object-top"
            />
            {/* Gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>
        </div>

        {/* Bottom info section - name plate */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="relative bg-gradient-to-r from-[#1a1510] via-[#2a2015] to-[#1a1510] border border-[#d4a74a]/40 rounded px-2 py-2">
            {/* Corner decorations */}
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-[#d4a74a]" />
            <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-[#d4a74a]" />
            <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-[#d4a74a]" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-r border-b border-[#d4a74a]" />

            {/* Name with calligraphic style */}
            <h3
              className="text-xl text-[#f0c96e] group-hover:text-[#fff] transition-colors text-center truncate"
              style={{
                fontFamily: 'var(--font-great-vibes), cursive',
                textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {general.name.vi}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
