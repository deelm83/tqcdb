'use client';

import Link from 'next/link';
import { General } from '@/types/general';
import { factionNames, FactionId } from '@/lib/generals';

// Faction colors - subtle, elegant
const factionStyles: Record<FactionId, {
  text: string;
  bar: string;
}> = {
  wei: {
    text: 'text-blue-400',
    bar: 'bg-blue-500',
  },
  shu: {
    text: 'text-green-400',
    bar: 'bg-green-500',
  },
  wu: {
    text: 'text-red-400',
    bar: 'bg-red-500',
  },
  qun: {
    text: 'text-yellow-400',
    bar: 'bg-yellow-500',
  },
};

interface GeneralCardProps {
  general: General;
  index: number;
}

export default function GeneralCard({ general, index }: GeneralCardProps) {
  const factionId = general.faction_id as FactionId;
  const factionName = factionNames[factionId] || factionNames.qun;
  const styles = factionStyles[factionId] || factionStyles.qun;

  return (
    <Link href={`/generals/${general.slug || general.id}`} className="block group">
      <div className="card overflow-hidden relative">
        {/* Faction bar at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${styles.bar} z-10`} />

        {/* Portrait */}
        <div className="relative aspect-[2.5/3.5]">
          <img
            src={general.image || '/images/general-placeholder.svg'}
            alt={general.name.vi}
            className="w-full h-full object-cover object-top"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Cost badge - gold coin style */}
          <div className="absolute top-2 left-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-gold-bright)] to-[var(--accent-gold)] flex items-center justify-center shadow-lg">
              <span className="text-[13px] font-bold text-[var(--bg)]">{general.cost}</span>
            </div>
          </div>

          {/* Name section */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-8 pb-2 px-2">
            {/* Name */}
            <h3 className="text-[14px] font-semibold text-white text-center truncate group-hover:text-[var(--accent-gold)] transition-colors">
              {general.name.vi}
            </h3>

            {/* Faction name */}
            <div className={`text-[10px] font-medium uppercase tracking-wider text-center ${styles.text}`}>
              {factionName.vi}
            </div>
          </div>
        </div>

        {/* Hover border effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-[var(--accent-gold)]" />
      </div>
    </Link>
  );
}
