'use client';

import { FactionId, TroopType } from '@/types/general';
import { factionNames, troopTypeNames } from '@/lib/generals';
import { TroopIcon } from './icons/TroopIcons';

interface FilterPanelProps {
  selectedFactions: FactionId[];
  onFactionChange: (factions: FactionId[]) => void;
  selectedCost: number | null;
  onCostChange: (cost: number | null) => void;
  selectedTroops: TroopType[];
  onTroopChange: (troops: TroopType[]) => void;
}

const factions: FactionId[] = ['wei', 'shu', 'wu', 'qun'];
const troopTypes: TroopType[] = ['cavalry', 'shield', 'archer', 'spear', 'siege'];

// Faction button colors
const factionStyles: Record<FactionId, { active: string; inactive: string }> = {
  wei: {
    active: 'bg-blue-500/25 text-blue-300 border-blue-500/50',
    inactive: 'text-blue-400/60 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40',
  },
  shu: {
    active: 'bg-green-500/25 text-green-300 border-green-500/50',
    inactive: 'text-green-400/60 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40',
  },
  wu: {
    active: 'bg-red-500/25 text-red-300 border-red-500/50',
    inactive: 'text-red-400/60 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40',
  },
  qun: {
    active: 'bg-amber-500/25 text-amber-300 border-amber-500/50',
    inactive: 'text-amber-400/60 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40',
  },
};

const costOptions = [1, 2, 3, 4, 5, 6, 7];

export default function FilterPanel({
  selectedFactions,
  onFactionChange,
  selectedCost,
  onCostChange,
  selectedTroops,
  onTroopChange,
}: FilterPanelProps) {
  const toggleFaction = (faction: FactionId) => {
    if (selectedFactions.includes(faction)) {
      onFactionChange(selectedFactions.filter(f => f !== faction));
    } else {
      onFactionChange([...selectedFactions, faction]);
    }
  };

  const toggleCost = (cost: number) => {
    onCostChange(selectedCost === cost ? null : cost);
  };

  const toggleTroop = (troop: TroopType) => {
    if (selectedTroops.includes(troop)) {
      onTroopChange(selectedTroops.filter(t => t !== troop));
    } else {
      onTroopChange([...selectedTroops, troop]);
    }
  };

  const hasActiveFilters = selectedFactions.length > 0 || selectedCost !== null || selectedTroops.length > 0;

  return (
    <div className="rounded-lg border border-[#2a3548] bg-[#1a2130]/80 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Left side filters */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {/* Faction Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280] uppercase tracking-wide min-w-[32px]">Phe</span>
            <div className="flex gap-1.5">
              {factions.map(faction => {
                const isSelected = selectedFactions.includes(faction);
                const styles = factionStyles[faction];
                return (
                  <button
                    key={faction}
                    onClick={() => toggleFaction(faction)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                      isSelected ? styles.active : styles.inactive
                    }`}
                  >
                    {factionNames[faction].vi}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280] uppercase tracking-wide min-w-[32px]">Cost</span>
            <div className="flex gap-1.5">
              {costOptions.map(cost => {
                const isSelected = selectedCost === cost;
                return (
                  <button
                    key={cost}
                    onClick={() => toggleCost(cost)}
                    className={`w-8 h-8 rounded-md text-sm font-bold border transition-all ${
                      isSelected
                        ? 'bg-[#d4a74a] text-[#0a0e14] border-[#d4a74a]'
                        : 'bg-[#12171f] text-[#6b7280] border-[#2a3548] hover:border-[#6b5a3e] hover:text-[#b8a990]'
                    }`}
                  >
                    {cost}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Troop Filters */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280] uppercase tracking-wide min-w-[32px]">Binh</span>
            <div className="flex gap-1.5">
              {troopTypes.map(type => {
                const isSelected = selectedTroops.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleTroop(type)}
                    title={troopTypeNames[type].vi}
                    className={`w-9 h-9 flex items-center justify-center rounded-md border transition-all ${
                      isSelected
                        ? 'bg-[#d4a74a]/20 border-[#d4a74a]/50'
                        : 'border-[#2a3548] hover:bg-[#1e2636] hover:border-[#3a4558]'
                    }`}
                  >
                    <TroopIcon
                      type={type}
                      size={20}
                      className={isSelected ? 'text-[#d4a74a]' : 'text-[#6b7280]'}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clear Button - right side */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onFactionChange([]);
              onCostChange(null);
              onTroopChange([]);
            }}
            className="text-sm text-[#6b7280] hover:text-[#d4a74a] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
