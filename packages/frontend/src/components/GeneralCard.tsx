'use client';

import { useState } from 'react';
import Link from 'next/link';
import { General } from '@/lib/api';
import { factionNames, FactionId } from '@/lib/generals';

// Faction colors - subtle, elegant
const factionStyles: Record<FactionId, {
  text: string;
  dot: string;
}> = {
  wei: {
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  shu: {
    text: 'text-green-600',
    dot: 'bg-green-500',
  },
  wu: {
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
  qun: {
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },
};

interface GeneralCardProps {
  general: General;
  index: number;
}

export default function GeneralCard({ general, index }: GeneralCardProps) {
  const factionId = general.faction_id as FactionId;
  const styles = factionStyles[factionId] || factionStyles.qun;
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageSrc = general.image || '/images/general-placeholder.svg';

  return (
    <Link href={`/generals/${general.slug || general.id}`} className="block group">
      <div
        className="relative aspect-[7/10] rounded-lg overflow-hidden shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:shadow-[var(--shadow-lg)] group-hover:scale-[1.03]"
      >
        {/* Shimmer placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        {/* Actual image */}
        <img
          src={imageSrc}
          alt={general.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Cost badge - top right */}
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[15px] font-bold text-white bg-black/60 backdrop-blur-sm rounded-md w-7 h-7 flex items-center justify-center border border-white/10">
            {general.cost}
          </span>
        </div>

        {/* Faction dot - top left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`w-2.5 h-2.5 rounded-full block ${styles.dot} shadow-[0_0_6px_rgba(255,255,255,0.3)]`} />
        </div>

        {/* Bottom gradient overlay with name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-2.5 px-2.5">
          <div className="text-[12px] font-semibold text-white/90 leading-tight truncate">
            {general.name}
          </div>
        </div>

        {/* Hover border */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg border-2 border-[var(--accent)]" />
      </div>
    </Link>
  );
}
