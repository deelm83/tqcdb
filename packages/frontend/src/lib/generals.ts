import { General, FactionId, TroopType, Grade } from '@/types/general';
import generalsData from '@/data/generals/all_generals.json';

// Re-export types
export type { FactionId, TroopType, Grade } from '@/types/general';

export const generals: General[] = generalsData as General[];

export interface FilterOptions {
  search: string;
  factions: FactionId[];
  minCost: number;
  maxCost: number;
  selectedTroops: TroopType[];
}

const gradeOrder: Record<Grade, number> = {
  'S': 4,
  'A': 3,
  'B': 2,
  'C': 1,
};

export function gradeValue(grade: string | undefined): number {
  return gradeOrder[grade as Grade] || 0;
}

export function filterGenerals(generals: General[], filters: FilterOptions): General[] {
  return generals.filter(general => {
    // Search filter (Vietnamese only)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const nameVi = general.name.vi.toLowerCase();
      if (!nameVi.includes(search)) {
        return false;
      }
    }

    // Faction filter
    if (filters.factions.length > 0) {
      if (!filters.factions.includes(general.faction_id as FactionId)) {
        return false;
      }
    }

    // Cost filter
    const cost = general.cost || 0;
    if (cost < filters.minCost || cost > filters.maxCost) {
      return false;
    }

    // Troop filters (must have A or S grade for selected troop types)
    for (const troopType of filters.selectedTroops) {
      const troopGrade = general.troop_compatibility?.[troopType]?.grade;
      if (!troopGrade || (troopGrade !== 'S' && troopGrade !== 'A')) {
        return false;
      }
    }

    return true;
  });
}

// Faction colors - TW3K inspired
export const factionColors: Record<FactionId, { text: string }> = {
  wei: { text: 'text-blue-600' },
  shu: { text: 'text-green-600' },
  wu: { text: 'text-red-600' },
  qun: { text: 'text-amber-600' },
};

export const factionNames: Record<FactionId, { cn: string; vi: string; en: string }> = {
  wei: { cn: '魏', vi: 'Ngụy', en: 'Wei' },
  shu: { cn: '蜀', vi: 'Thục', en: 'Shu' },
  wu: { cn: '吴', vi: 'Ngô', en: 'Wu' },
  qun: { cn: '群', vi: 'Quần', en: 'Qun' },
};

// Grade colors - S orange, A purple, B light blue, C light cyan
export const gradeColors: Record<Grade, { text: string; border: string; color: string }> = {
  'S': { text: 'text-orange-400', border: 'border-orange-400', color: '#fb923c' },
  'A': { text: 'text-purple-400', border: 'border-purple-400', color: '#c084fc' },
  'B': { text: 'text-sky-400', border: 'border-sky-400', color: '#38bdf8' },
  'C': { text: 'text-cyan-300', border: 'border-cyan-300', color: '#67e8f9' },
};

export const troopTypeNames: Record<TroopType, { cn: string; vi: string; en: string }> = {
  cavalry: { cn: '骑兵', vi: 'Kỵ', en: 'Cav' },
  shield: { cn: '盾兵', vi: 'Khiên', en: 'Shd' },
  archer: { cn: '弓兵', vi: 'Cung', en: 'Arc' },
  spear: { cn: '枪兵', vi: 'Thương', en: 'Spr' },
  siege: { cn: '器械', vi: 'Xe', en: 'Sig' },
};

// Map of general Chinese names to their info for quick lookup
// Using array index as ID since the detail page uses index-based routing
export const generalsByName: Record<string, { id: number; vi: string }> = {};
generals.forEach((g, index) => {
  if (g.name?.cn) {
    generalsByName[g.name.cn] = {
      id: index,
      vi: g.name.vi,
    };
  }
});
