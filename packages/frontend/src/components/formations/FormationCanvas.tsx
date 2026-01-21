'use client';

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

interface FormationCanvasProps {
  formation: Formation;
}

export default function FormationCanvas({ formation }: FormationCanvasProps) {
  const armyColors = armyTypeColors[formation.armyType] || armyTypeColors.CAVALRY;
  const generals = formation.generals.sort((a, b) => a.position - b.position);

  const getGradeColor = (grade: string | undefined) => {
    switch (grade) {
      case 'S': return 'text-orange-400';
      case 'A': return 'text-purple-400';
      case 'B': return 'text-sky-400';
      case 'C': return 'text-cyan-300';
      default: return 'text-[#888]';
    }
  };

  return (
    <div
      id="formation-canvas"
      className="w-[700px] bg-[#1a1a1a] p-3 rounded-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 text-[12px] font-semibold rounded ${armyColors.bg} ${armyColors.text} border ${armyColors.border}`}>
          {armyTypeLabels[formation.armyType]}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#666]">COST</span>
          <span className="text-[16px] font-bold text-[#d4af37]">{formation.totalCost}</span>
        </div>
      </div>

      {/* Generals */}
      <div className="grid grid-cols-3 gap-2">
        {generals.map((gen, idx) => (
          <div
            key={idx}
            className={`bg-[#222] rounded overflow-hidden ${
              idx === 0 ? 'ring-2 ring-[#d4af37]' : 'border border-[#333]'
            }`}
          >
            {/* Image - cropped bottom 1/5 */}
            <div className="relative aspect-[7/8] bg-[#181818] overflow-hidden">
              {gen.generalImage ? (
                <img
                  src={gen.generalImage}
                  alt={gen.generalName || ''}
                  className="w-full h-[125%] object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#444] text-[12px]">
                  Trống
                </div>
              )}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#d4af37] text-black text-[9px] font-bold rounded">
                  CHỦ TƯỚNG
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-2.5">
              <div className="text-[13px] font-bold text-white text-center mb-1">
                {gen.generalName || '—'}
              </div>

              <div className="text-[11px] text-[#888] text-center mb-2 pb-2 border-b border-[#333]">
                <span>COST </span>
                <span className="text-white font-semibold">{gen.generalCost ?? '—'}</span>
                <span className="mx-2 text-[#444]">|</span>
                <span className={`font-semibold ${getGradeColor(gen.generalGrade)}`}>
                  {armyTypeLabels[formation.armyType]} [{gen.generalGrade || '—'}]
                </span>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <div className={`text-[13px] text-center py-1.5 px-2 rounded font-bold ${
                  gen.innateSkillName ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#555] bg-[#1a1a1a]'
                }`}>
                  {gen.innateSkillName || '—'}
                </div>
                <div className={`text-[13px] text-center py-1.5 px-2 rounded font-bold ${
                  gen.skill1Name ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#555] bg-[#1a1a1a]'
                }`}>
                  {gen.skill1Name || '—'}
                </div>
                <div className={`text-[13px] text-center py-1.5 px-2 rounded font-bold ${
                  gen.skill2Name ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#555] bg-[#1a1a1a]'
                }`}>
                  {gen.skill2Name || '—'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
