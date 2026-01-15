import skillsData from '../../../data/skills/all_skills.json';

export interface Skill {
  name: {
    cn: string;
    vi: string;
  };
  type: {
    id: string;
    name: {
      cn: string;
      vi: string;
    };
  };
  quality: string;
  trigger_rate: number | null;
  source_type: string;
  wiki_url?: string;
  effect?: {
    cn: string;
    vi?: string;
  };
  target_vi?: string;
  army_types?: string[];
  inheritance_from?: string[];
  innate_to?: string[];
  acquisition?: string[];
  target?: string;
  associated_generals?: string[];
}

export type ArmyType = 'cavalry' | 'shield' | 'archer' | 'spear' | 'siege';

export const armyTypeNames: Record<ArmyType, { cn: string; vi: string }> = {
  cavalry: { cn: '骑兵', vi: 'Kỵ binh' },
  shield: { cn: '盾兵', vi: 'Thuẫn binh' },
  archer: { cn: '弓兵', vi: 'Cung binh' },
  spear: { cn: '枪兵', vi: 'Thương binh' },
  siege: { cn: '器械', vi: 'Công thành' },
};

export const skills: Skill[] = skillsData as Skill[];

export type SkillTypeId = 'command' | 'active' | 'assault' | 'passive' | 'formation' | 'troop' | 'internal' | 'unknown';

export const skillTypeNames: Record<SkillTypeId, { cn: string; vi: string }> = {
  command: { cn: '指挥', vi: 'Chỉ huy' },
  active: { cn: '主动', vi: 'Chủ động' },
  assault: { cn: '突击', vi: 'Đột kích' },
  passive: { cn: '被动', vi: 'Bị động' },
  formation: { cn: '阵法', vi: 'Trận pháp' },
  troop: { cn: '兵种', vi: 'Binh chủng' },
  internal: { cn: '内政', vi: 'Nội chính' },
  unknown: { cn: '未知', vi: 'Khác' },
};

export const skillTypeColors: Record<SkillTypeId, { bg: string; text: string; border: string }> = {
  command: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  active: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  assault: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  passive: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  formation: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  troop: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  internal: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  unknown: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export const qualityColors: Record<string, string> = {
  S: 'text-orange-500',
  A: 'text-purple-500',
  B: 'text-blue-500',
  C: 'text-gray-500',
};

// Map of skill Chinese names to full skill data for quick lookup
export const skillsByName: Record<string, Skill> = {};
for (const skill of skills) {
  if (skill.name?.cn) {
    skillsByName[skill.name.cn] = skill;
  }
}
