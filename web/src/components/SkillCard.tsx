'use client';

import { Skill, SkillTypeId, skillTypeNames, skillTypeColors, qualityColors } from '@/lib/skills';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const typeId = skill.type.id as SkillTypeId;
  const colors = skillTypeColors[typeId] || skillTypeColors.unknown;
  const typeName = skillTypeNames[typeId] || skillTypeNames.unknown;

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{skill.name.vi}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
          {typeName.vi}
        </span>
      </div>

      {/* Quality & Trigger Rate */}
      <div className="flex items-center gap-3 text-sm mb-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Quality:</span>
          <span className={`font-bold ${qualityColors[skill.quality] || 'text-gray-500'}`}>
            {skill.quality}
          </span>
        </div>
        {skill.trigger_rate && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Rate:</span>
            <span className="font-medium text-gray-900">{skill.trigger_rate}%</span>
          </div>
        )}
      </div>

      {/* Source Type */}
      <div className="text-xs text-gray-500">
        {skill.source_type === 'innate' ? 'Tự mang' : skill.source_type === 'inherited' ? 'Truyền thừa' : ''}
      </div>
    </div>
  );
}
