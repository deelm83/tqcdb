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

// Faction button colors with proper styling
const factionButtonStyles: Record<FactionId, { active: string; inactive: string }> = {
  wei: {
    active: 'bg-gradient-to-r from-blue-500/30 to-blue-600/20 text-blue-300 border-blue-500/60 shadow-lg shadow-blue-500/20',
    inactive: 'text-blue-400/70 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50',
  },
  shu: {
    active: 'bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-300 border-green-500/60 shadow-lg shadow-green-500/20',
    inactive: 'text-green-400/70 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50',
  },
  wu: {
    active: 'bg-gradient-to-r from-red-500/30 to-red-600/20 text-red-300 border-red-500/60 shadow-lg shadow-red-500/20',
    inactive: 'text-red-400/70 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50',
  },
  qun: {
    active: 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/20',
    inactive: 'text-amber-400/70 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50',
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
    // Single select: click same to deselect, click different to select
    onCostChange(selectedCost === cost ? null : cost);
  };

  const toggleTroop = (troop: TroopType) => {
    if (selectedTroops.includes(troop)) {
      onTroopChange(selectedTroops.filter(t => t !== troop));
    } else {
      onTroopChange([...selectedTroops, troop]);
    }
  };

  return (
    <div className="rounded-lg border border-[#2a3548] bg-gradient-to-b from-[#1a2130] to-[#12171f] p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Faction Filter */}
        <div>
          <h3 className="text-sm font-medium text-[#d4a74a] mb-3 flex items-center gap-2">
            Phe
          </h3>
          <div className="flex flex-wrap gap-2">
            {factions.map(faction => {
              const isSelected = selectedFactions.includes(faction);
              const styles = factionButtonStyles[faction];
              return (
                <button
                  key={faction}
                  onClick={() => toggleFaction(faction)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
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
        <div>
          <h3 className="text-sm font-medium text-[#d4a74a] mb-3 flex items-center gap-2">
            Cost
          </h3>
          <div className="flex flex-wrap gap-2">
            {costOptions.map(cost => {
              const isSelected = selectedCost === cost;
              return (
                <button
                  key={cost}
                  onClick={() => toggleCost(cost)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#f0c96e] to-[#a67c32] text-[#0a0e14] border-[#f0c96e] shadow-lg shadow-[#d4a74a]/20'
                      : 'bg-[#1a2130] text-[#b8a990] border-[#2a3548] hover:border-[#6b5a3e] hover:text-[#e8dcc8]'
                  }`}
                >
                  {cost}
                </button>
              );
            })}
          </div>
        </div>

        {/* Troop Filters */}
        <div>
          <h3 className="text-sm font-medium text-[#d4a74a] mb-3 flex items-center gap-2">
            Binh chủng
          </h3>
          <div className="flex flex-wrap gap-2">
            {troopTypes.map(type => {
              const isSelected = selectedTroops.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleTroop(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#d4a74a]/15 border-[#d4a74a]/50 text-[#e8dcc8]'
                      : 'border-[#2a3548] text-[#b8a990] hover:bg-[#1e2636] hover:border-[#6b5a3e] hover:text-[#e8dcc8]'
                  }`}
                >
                  <TroopIcon
                    type={type}
                    size={18}
                    className={isSelected ? 'text-[#d4a74a]' : 'text-[#6b7280]'}
                  />
                  <span className="text-sm">
                    {troopTypeNames[type].vi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider and Clear Button */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#3a4558] to-transparent mt-5 mb-4" />
      <div className="flex justify-end">
        <button
          onClick={() => {
            onFactionChange([]);
            onCostChange(null);
            onTroopChange([]);
          }}
          className="text-sm text-[#a67c32] hover:text-[#f0c96e] transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}
