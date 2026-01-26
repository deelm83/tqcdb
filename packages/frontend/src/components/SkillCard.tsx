'use client';

import { Skill } from '@/lib/skills';
import { SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';

// Skill type accent bar colors
const typeBarColors: Record<SkillTypeId, string> = {
  command: 'bg-yellow-500',
  active: 'bg-red-500',
  assault: 'bg-orange-500',
  passive: 'bg-blue-500',
  formation: 'bg-purple-500',
  troop: 'bg-green-500',
  internal: 'bg-cyan-500',
  unknown: 'bg-gray-400',
};

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const typeId = skill.type.id as SkillTypeId;
  const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;
  const barColor = typeBarColors[typeId] || typeBarColors.unknown;

  return (
    <div className="card relative overflow-hidden p-4 pl-5">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barColor}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--text-primary)]">{skill.name.vi}</h3>
        </div>
        <span className={`pill ${typeColor.text} !text-[10px]`}>
          {typeName.vi}
        </span>
      </div>

      {/* Quality & Trigger Rate */}
      <div className="flex items-center gap-3 text-[13px] mb-2">
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-tertiary)]">Phẩm chất:</span>
          <span className={`font-semibold ${skill.quality ? qualityColors[skill.quality] : 'text-[var(--text-tertiary)]'}`}>
            {skill.quality || '-'}
          </span>
        </div>
        {skill.trigger_rate && (
          <div className="flex items-center gap-1">
            <span className="text-[var(--text-tertiary)]">Xác suất:</span>
            <span className="text-[var(--text-secondary)]">{skill.trigger_rate}%</span>
          </div>
        )}
      </div>

      {/* Source Type */}
      <div className="text-[11px] text-[var(--text-tertiary)]">
        {skill.source_type === 'innate' ? 'Chiến pháp tự mang' : skill.source_type === 'inherited' ? 'Chiến pháp kế thừa' : ''}
      </div>
    </div>
  );
}
