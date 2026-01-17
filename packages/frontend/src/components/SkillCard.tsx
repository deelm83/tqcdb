'use client';

import { Skill } from '@/lib/skills';
import { SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const typeId = skill.type.id as SkillTypeId;
  const typeColor = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-[var(--text-primary)]">{skill.name.vi}</h3>
        </div>
        <span className={`pill ${typeColor.text}`}>
          {typeName.vi}
        </span>
      </div>

      {/* Quality & Trigger Rate */}
      <div className="flex items-center gap-3 text-[13px] mb-2">
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-tertiary)]">Quality:</span>
          <span className={`font-medium ${skill.quality ? qualityColors[skill.quality] : 'text-[var(--text-tertiary)]'}`}>
            {skill.quality || '-'}
          </span>
        </div>
        {skill.trigger_rate && (
          <div className="flex items-center gap-1">
            <span className="text-[var(--text-tertiary)]">Rate:</span>
            <span className="text-[var(--text-secondary)]">{skill.trigger_rate}%</span>
          </div>
        )}
      </div>

      {/* Source Type */}
      <div className="text-[11px] text-[var(--text-tertiary)]">
        {skill.source_type === 'innate' ? 'Innate' : skill.source_type === 'inherited' ? 'Inherited' : ''}
      </div>
    </div>
  );
}
