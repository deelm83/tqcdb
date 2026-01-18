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
      <div
        className="relative aspect-[7/10] rounded-lg overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${general.image || '/images/general-placeholder.svg'})` }}
      >
        {/* Faction bar at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${styles.bar} z-10`} />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Hover border effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-[var(--accent-gold)] rounded-lg" />
      </div>
    </Link>
  );
}
