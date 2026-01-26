'use client';

import { useState } from 'react';
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

const factionDotColors: Record<FactionId, string> = {
  wei: 'bg-blue-500',
  shu: 'bg-green-500',
  wu: 'bg-red-500',
  qun: 'bg-amber-500',
};

export default function FilterPanel({
  selectedFactions,
  onFactionChange,
  selectedCost,
  onCostChange,
  selectedTroops,
  onTroopChange,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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

  // Collect active filter labels for pills
  const activeFilterLabels: { label: string; onRemove: () => void }[] = [];
  selectedFactions.forEach(f => {
    activeFilterLabels.push({
      label: factionNames[f].vi,
      onRemove: () => onFactionChange(selectedFactions.filter(x => x !== f)),
    });
  });
  if (selectedCost !== null) {
    activeFilterLabels.push({
      label: `Cost ${selectedCost}`,
      onRemove: () => onCostChange(null),
    });
  }
  selectedTroops.forEach(t => {
    activeFilterLabels.push({
      label: troopTypeNames[t].vi,
      onRemove: () => onTroopChange(selectedTroops.filter(x => x !== t)),
    });
  });

  return (
    <div className="space-y-3">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors font-medium"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        Bộ lọc
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
            {activeFilterLabels.length}
          </span>
        )}
      </button>

      {/* Collapsible Filters */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-wrap items-center gap-6">
          {/* Faction Filter */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[var(--text-secondary)] font-medium">Thế lực</span>
            <div className="flex gap-1.5">
              {factions.map(faction => {
                const isSelected = selectedFactions.includes(faction);
                const colorClass = factionColors[faction].text;
                return (
                  <button
                    key={faction}
                    onClick={() => toggleFaction(faction)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border rounded-md transition-all ${colorClass} ${
                      isSelected
                        ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)]'
                        : 'opacity-60 border-[var(--border)] hover:opacity-100 hover:border-[var(--border-light)]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${factionDotColors[faction]}`} />
                    {factionNames[faction].vi}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost Filter */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[var(--text-secondary)] font-medium">Cost</span>
            <div className="flex gap-1">
              {costOptions.map(cost => {
                const isSelected = selectedCost === cost;
                return (
                  <button
                    key={cost}
                    onClick={() => toggleCost(cost)}
                    className={`w-8 h-8 text-[13px] font-semibold border rounded-md transition-all ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)]'
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
            <span className="text-[13px] text-[var(--text-secondary)] font-medium">Binh chủng</span>
            <div className="flex gap-1.5">
              {troopTypes.map(type => {
                const isSelected = selectedTroops.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleTroop(type)}
                    title={troopTypeNames[type].vi}
                    className={`w-9 h-9 flex items-center justify-center border rounded-md transition-all ${
                      isSelected
                        ? 'bg-[var(--bg-tertiary)] border-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--border-light)]'
                    }`}
                  >
                    <TroopIcon
                      type={type}
                      size={18}
                      className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}
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
              className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && activeFilterLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterLabels.map((filter, idx) => (
            <button
              key={idx}
              onClick={filter.onRemove}
              className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-full text-[12px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors group"
            >
              {filter.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50 group-hover:opacity-100">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
