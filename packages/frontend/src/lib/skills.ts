import skillsData from '@/data/skills/all_skills.json';

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
  formation: { cn: '阵法', vi: 'Pháp trận' },
  troop: { cn: '兵种', vi: 'Binh chủng' },
  internal: { cn: '内政', vi: 'Nội chính' },
  unknown: { cn: '未知', vi: 'Khác' },
};

// Skill type colors - TW3K inspired
export const skillTypeColors: Record<SkillTypeId, { text: string }> = {
  command: { text: 'text-yellow-400' },
  active: { text: 'text-red-400' },
  assault: { text: 'text-orange-400' },
  passive: { text: 'text-blue-400' },
  formation: { text: 'text-purple-400' },
  troop: { text: 'text-green-400' },
  internal: { text: 'text-cyan-400' },
  unknown: { text: 'text-[var(--text-tertiary)]' },
};

// Quality colors - gold for S, red for A
export const qualityColors: Record<string, string> = {
  S: 'text-[var(--accent-gold)]',
  A: 'text-[var(--accent-red-bright)]',
  B: 'text-blue-400',
  C: 'text-[var(--text-tertiary)]',
};

// Map of skill Chinese names to full skill data for quick lookup
export const skillsByName: Record<string, Skill> = {};
for (const skill of skills) {
  if (skill.name?.cn) {
    skillsByName[skill.name.cn] = skill;
  }
}
