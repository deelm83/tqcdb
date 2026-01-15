export interface LocalizedText {
  cn: string;
  vi: string;
}

export interface TroopGrade {
  grade: string;
  name: LocalizedText;
}

export interface TroopCompatibility {
  cavalry?: TroopGrade;
  shield?: TroopGrade;
  archer?: TroopGrade;
  spear?: TroopGrade;
  siege?: TroopGrade;
  navy?: TroopGrade;
}

export interface SkillType {
  id: string;
  name: LocalizedText;
}

export interface Skill {
  name: LocalizedText;
  type: SkillType;
}

export interface Stat {
  name: LocalizedText;
  base: number;
  growth: number;
  max: number | null;
}

export interface Stats {
  strength?: Stat;
  intelligence?: Stat;
  command?: Stat;
  speed?: Stat;
  politics?: Stat;
  charm?: Stat;
}

export interface Faction {
  id: string;
  name: LocalizedText;
}

export interface General {
  id: string;
  slug?: string;
  name: LocalizedText;
  faction_id: string;
  faction?: Faction;
  wiki_url: string;
  image?: string;
  cost?: number;
  tags?: {
    cn: string[];
    vi: string[];
  };
  bonds?: {
    cn: string[];
    vi: string[];
  };
  recruitable?: boolean;
  innate_skill?: Skill;
  inherited_skill?: Skill;
  troop_compatibility?: TroopCompatibility;
  stats?: Stats;
}

export type FactionId = 'wei' | 'shu' | 'wu' | 'qun';
export type TroopType = 'cavalry' | 'shield' | 'archer' | 'spear' | 'siege';
export type Grade = 'S' | 'A' | 'B' | 'C';
