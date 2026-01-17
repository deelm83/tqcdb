'use client';

import { FactionId, TroopType } from '@/types/general';
import { factionNames, factionColors, troopTypeNames } from '@/lib/generals';
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
    <div className="flex flex-wrap items-center gap-6">
      {/* Faction Filter */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-[var(--accent-gold-dim)] uppercase tracking-wider font-semibold">Thế lực</span>
        <div className="flex gap-1">
          {factions.map(faction => {
            const isSelected = selectedFactions.includes(faction);
            const colorClass = factionColors[faction].text;
            return (
              <button
                key={faction}
                onClick={() => toggleFaction(faction)}
                className={`px-3 py-1.5 text-[13px] font-medium border transition-all ${colorClass} ${
                  isSelected
                    ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)]'
                    : 'opacity-50 border-[var(--border)] hover:opacity-80 hover:border-[var(--border-light)]'
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
        <span className="text-[11px] text-[var(--accent-gold-dim)] uppercase tracking-wider font-semibold">Cost</span>
        <div className="flex gap-1">
          {costOptions.map(cost => {
            const isSelected = selectedCost === cost;
            return (
              <button
                key={cost}
                onClick={() => toggleCost(cost)}
                className={`w-8 h-8 text-[13px] font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[var(--accent-gold)] text-[var(--bg)] border-[var(--accent-gold)]'
                    : 'border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-light)]'
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
        <span className="text-[11px] text-[var(--accent-gold-dim)] uppercase tracking-wider font-semibold">Binh chủng</span>
        <div className="flex gap-1">
          {troopTypes.map(type => {
            const isSelected = selectedTroops.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleTroop(type)}
                title={troopTypeNames[type].en}
                className={`w-9 h-9 flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-[var(--bg-tertiary)] border-[var(--accent-gold-dim)]'
                    : 'border-[var(--border)] hover:border-[var(--border-light)]'
                }`}
              >
                <TroopIcon
                  type={type}
                  size={18}
                  className={isSelected ? 'text-[var(--accent-gold)]' : 'text-[var(--text-tertiary)]'}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            onFactionChange([]);
            onCostChange(null);
            onTroopChange([]);
          }}
          className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors uppercase tracking-wider"
        >
          Xóa
        </button>
      )}
    </div>
  );
}
