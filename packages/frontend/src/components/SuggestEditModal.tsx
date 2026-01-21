'use client';

import React, { useState, useEffect } from 'react';
import { General, Skill } from '@/lib/api';
import { factionNames, troopTypeNames } from '@/lib/generals';
import { skillTypeNames } from '@/lib/skills';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SuggestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'general' | 'skill';
  entity: General | Skill;
  onSuccess?: () => void;
}

// Type guard to check if entity is General
function isGeneral(entity: General | Skill): entity is General {
  return 'faction_id' in entity;
}

// Type guard to check if entity is Skill
function isSkill(entity: General | Skill): entity is Skill {
  return 'type' in entity && !('faction_id' in entity);
}

const GRADES = ['S', 'A', 'B', 'C', 'D'];
const FACTIONS = [
  { id: 'wei', name: 'Ngụy' },
  { id: 'shu', name: 'Thục' },
  { id: 'wu', name: 'Ngô' },
  { id: 'qun', name: 'Quần' },
];

const QUALITIES = ['S', 'A', 'B'];

const SKILL_TYPES = [
  { id: 'command', name: 'Chỉ huy' },
  { id: 'active', name: 'Chủ động' },
  { id: 'assault', name: 'Tấn công' },
  { id: 'passive', name: 'Bị động' },
  { id: 'formation', name: 'Trận pháp' },
  { id: 'troop', name: 'Binh chủng' },
  { id: 'internal', name: 'Nội chính' },
];

const TARGETS = [
  { id: 'self', name: 'Bản thân' },
  { id: 'ally_1', name: 'Quân ta (1 người)' },
  { id: 'ally_2', name: 'Quân ta (2 người)' },
  { id: 'ally_1_2', name: 'Quân ta (1-2 người)' },
  { id: 'ally_2_3', name: 'Quân ta (2-3 người)' },
  { id: 'ally_all', name: 'Toàn thể quân ta' },
  { id: 'enemy_1', name: 'Quân địch (1 người)' },
  { id: 'enemy_2', name: 'Quân địch (2 người)' },
  { id: 'enemy_1_2', name: 'Quân địch (1-2 người)' },
  { id: 'enemy_2_3', name: 'Quân địch (2-3 người)' },
  { id: 'enemy_all', name: 'Toàn thể quân địch' },
];

export default function SuggestEditModal({
  isOpen,
  onClose,
  entityType,
  entity,
  onSuccess,
}: SuggestEditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with current values
  useEffect(() => {
    if (isOpen) {
      if (isGeneral(entity)) {
        setFormData({
          name: entity.name,
          faction_id: entity.faction_id,
          cost: entity.cost,
          rarity: entity.rarity || '',
          base_attack: entity.base_attack || 0,
          growth_attack: entity.growth_attack || 0,
          base_command: entity.base_command || 0,
          growth_command: entity.growth_command || 0,
          base_intelligence: entity.base_intelligence || 0,
          growth_intelligence: entity.growth_intelligence || 0,
          base_politics: entity.base_politics || 0,
          growth_politics: entity.growth_politics || 0,
          base_speed: entity.base_speed || 0,
          growth_speed: entity.growth_speed || 0,
          base_charm: entity.base_charm || 0,
          growth_charm: entity.growth_charm || 0,
          troop_cavalry: entity.troop_compatibility?.cavalry?.grade || '',
          troop_shield: entity.troop_compatibility?.shield?.grade || '',
          troop_archer: entity.troop_compatibility?.archer?.grade || '',
          troop_spear: entity.troop_compatibility?.spear?.grade || '',
          troop_siege: entity.troop_compatibility?.siege?.grade || '',
        });
      } else if (isSkill(entity)) {
        setFormData({
          name: entity.name,
          type: entity.type?.id || 'unknown',
          quality: entity.quality || '',
          trigger_rate: entity.trigger_rate || 0,
          effect: entity.effect || '',
          target: entity.target || '',
          army_types: entity.army_types?.join(',') || '',
        });
      }
      setReason('');
      setError(null);
    }
  }, [isOpen, entity]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = () => {
    const changes: Record<string, { old: any; new: any }> = {};

    if (isGeneral(entity)) {
      const general = entity;

      if (formData.name !== general.name) {
        changes.name = { old: general.name, new: formData.name };
      }
      if (formData.faction_id !== general.faction_id) {
        changes.faction_id = { old: general.faction_id, new: formData.faction_id };
      }
      if (formData.cost !== general.cost) {
        changes.cost = { old: general.cost, new: formData.cost };
      }
      if (formData.rarity !== (general.rarity || '')) {
        changes.rarity = { old: general.rarity || '', new: formData.rarity };
      }

      // Stats
      const statFields = [
        'base_attack', 'growth_attack',
        'base_command', 'growth_command',
        'base_intelligence', 'growth_intelligence',
        'base_politics', 'growth_politics',
        'base_speed', 'growth_speed',
        'base_charm', 'growth_charm',
      ];

      for (const field of statFields) {
        const oldValue = (general as any)[field] || 0;
        const newValue = parseFloat(formData[field]) || 0;
        if (newValue !== oldValue) {
          changes[field] = { old: oldValue, new: newValue };
        }
      }

      // Troop compatibility
      const troops = ['cavalry', 'shield', 'archer', 'spear', 'siege'];
      for (const troop of troops) {
        const fieldName = `troop_${troop}`;
        const oldValue = general.troop_compatibility?.[troop as 'cavalry' | 'shield' | 'archer' | 'spear' | 'siege']?.grade || '';
        const newValue = formData[fieldName];
        if (newValue !== oldValue) {
          changes[fieldName] = { old: oldValue, new: newValue };
        }
      }
    } else if (isSkill(entity)) {
      const skill = entity;

      if (formData.name !== skill.name) {
        changes.name = { old: skill.name, new: formData.name };
      }
      if (formData.type !== (skill.type?.id || 'unknown')) {
        changes.type = { old: skill.type?.id || 'unknown', new: formData.type };
      }
      if (formData.quality !== (skill.quality || '')) {
        changes.quality = { old: skill.quality || '', new: formData.quality };
      }
      if (parseFloat(formData.trigger_rate) !== (skill.trigger_rate || 0)) {
        changes.trigger_rate = { old: skill.trigger_rate || 0, new: parseFloat(formData.trigger_rate) };
      }
      if (formData.effect !== (skill.effect || '')) {
        changes.effect = { old: skill.effect || '', new: formData.effect };
      }
      if (formData.target !== (skill.target || '')) {
        changes.target = { old: skill.target || '', new: formData.target };
      }
      if (formData.army_types !== (skill.army_types?.join(',') || '')) {
        changes.army_types = { old: skill.army_types?.join(',') || '', new: formData.army_types };
      }
    }

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const changes = getChangedFields();

    if (Object.keys(changes).length === 0) {
      setError('Không có thay đổi nào để gửi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send JSON request
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId: entity.id.toString(),
          changes,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Không thể gửi đề xuất');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changedFields = getChangedFields();
  const changedCount = Object.keys(changedFields).length;

  const isFieldChanged = (field: string): boolean => {
    return field in changedFields;
  };

  const getOldValue = (field: string): any => {
    return changedFields[field]?.old;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-[#252542] border border-[#3a3a5c] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a5c]">
            <h2 className="text-xl font-bold text-[#d4af37]">
              Đề xuất chỉnh sửa: {entity.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info banner */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-sm">
              <p className="text-blue-300">
                Chỉ những trường bạn thay đổi sẽ được gửi đi. Các trường không thay đổi sẽ giữ nguyên.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-sm">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* General Fields */}
            {isGeneral(entity) && (
              <>
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tên võ tướng</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('name')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      />
                      {isFieldChanged('name') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('name')}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Phe</label>
                      <select
                        value={formData.faction_id}
                        onChange={(e) => handleFieldChange('faction_id', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('faction_id')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      >
                        {FACTIONS.map((faction) => (
                          <option key={faction.id} value={faction.id}>
                            {faction.name}
                          </option>
                        ))}
                      </select>
                      {isFieldChanged('faction_id') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {factionNames[getOldValue('faction_id') as keyof typeof factionNames]?.vi}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Cost</label>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => handleFieldChange('cost', parseInt(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('cost')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      />
                      {isFieldChanged('cost') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('cost')}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Độ hiếm</label>
                      <select
                        value={formData.rarity}
                        onChange={(e) => handleFieldChange('rarity', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('rarity')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      >
                        <option value="">Chọn độ hiếm</option>
                        {GRADES.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                      {isFieldChanged('rarity') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('rarity') || '(trống)'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Chỉ số
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { base: 'base_attack', growth: 'growth_attack', label: 'Võ lực' },
                      { base: 'base_command', growth: 'growth_command', label: 'Thống suất' },
                      { base: 'base_intelligence', growth: 'growth_intelligence', label: 'Trí lực' },
                      { base: 'base_politics', growth: 'growth_politics', label: 'Chính trị' },
                      { base: 'base_speed', growth: 'growth_speed', label: 'Tốc độ' },
                      { base: 'base_charm', growth: 'growth_charm', label: 'Mị lực' },
                    ].map(({ base, growth, label }) => (
                      <div key={base} className="space-y-2">
                        <label className="block text-sm text-gray-400">{label}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              value={formData[base]}
                              onChange={(e) => handleFieldChange(base, e.target.value)}
                              placeholder="Cơ bản"
                              className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none text-sm ${
                                isFieldChanged(base)
                                  ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                                  : 'border-[#3a3a5c] focus:border-[#d4af37]'
                              }`}
                            />
                            {isFieldChanged(base) && (
                              <p className="text-xs text-[#d4af37] mt-1">
                                Từ: {getOldValue(base)}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              value={formData[growth]}
                              onChange={(e) => handleFieldChange(growth, e.target.value)}
                              placeholder="Tăng trưởng"
                              className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none text-sm ${
                                isFieldChanged(growth)
                                  ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                                  : 'border-[#3a3a5c] focus:border-[#d4af37]'
                              }`}
                            />
                            {isFieldChanged(growth) && (
                              <p className="text-xs text-[#d4af37] mt-1">
                                Từ: {getOldValue(growth)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Troop Compatibility Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Tương thích binh chủng
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {['cavalry', 'shield', 'archer', 'spear', 'siege'].map((troop) => {
                      const fieldName = `troop_${troop}`;
                      return (
                        <div key={troop}>
                          <label className="block text-sm text-gray-400 mb-1 text-center">
                            {troopTypeNames[troop as keyof typeof troopTypeNames].vi}
                          </label>
                          <select
                            value={formData[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                            className={`w-full px-2 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none text-sm ${
                              isFieldChanged(fieldName)
                                ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                                : 'border-[#3a3a5c] focus:border-[#d4af37]'
                            }`}
                          >
                            <option value="">-</option>
                            {GRADES.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                          {isFieldChanged(fieldName) && (
                            <p className="text-xs text-[#d4af37] mt-1 text-center">
                              Từ: {getOldValue(fieldName) || '-'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </>
            )}

            {/* Skill Fields */}
            {isSkill(entity) && (
              <>
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tên chiến pháp</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('name')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      />
                      {isFieldChanged('name') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('name')}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Loại</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('type')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      >
                        {SKILL_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {isFieldChanged('type') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {skillTypeNames[getOldValue('type') as keyof typeof skillTypeNames]?.vi}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Chất lượng</label>
                      <select
                        value={formData.quality}
                        onChange={(e) => handleFieldChange('quality', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('quality')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      >
                        <option value="">Chọn chất lượng</option>
                        {QUALITIES.map((quality) => (
                          <option key={quality} value={quality}>
                            {quality}
                          </option>
                        ))}
                      </select>
                      {isFieldChanged('quality') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('quality') || '(trống)'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tỷ lệ kích hoạt (%)</label>
                      <input
                        type="number"
                        value={formData.trigger_rate}
                        onChange={(e) => handleFieldChange('trigger_rate', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                          isFieldChanged('trigger_rate')
                            ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                            : 'border-[#3a3a5c] focus:border-[#d4af37]'
                        }`}
                      />
                      {isFieldChanged('trigger_rate') && (
                        <p className="text-xs text-[#d4af37] mt-1">
                          Đã thay đổi từ: {getOldValue('trigger_rate')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Effect Section */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hiệu ứng</label>
                  <textarea
                    rows={4}
                    value={formData.effect}
                    onChange={(e) => handleFieldChange('effect', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none resize-none ${
                      isFieldChanged('effect')
                        ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                        : 'border-[#3a3a5c] focus:border-[#d4af37]'
                    }`}
                  />
                  {isFieldChanged('effect') && (
                    <p className="text-xs text-[#d4af37] mt-1">
                      Đã thay đổi từ: {getOldValue('effect') || '(trống)'}
                    </p>
                  )}
                </div>

                {/* Target and Army Types */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Mục tiêu</label>
                    <select
                      value={formData.target}
                      onChange={(e) => handleFieldChange('target', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                        isFieldChanged('target')
                          ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                          : 'border-[#3a3a5c] focus:border-[#d4af37]'
                      }`}
                    >
                      <option value="">Chọn mục tiêu</option>
                      {TARGETS.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.name}
                        </option>
                      ))}
                    </select>
                    {isFieldChanged('target') && (
                      <p className="text-xs text-[#d4af37] mt-1">
                        Đã thay đổi từ: {getOldValue('target') || '(trống)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Binh chủng (phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formData.army_types}
                      onChange={(e) => handleFieldChange('army_types', e.target.value)}
                      placeholder="cavalry,shield,archer"
                      className={`w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border text-[#e0e0e0] focus:outline-none ${
                        isFieldChanged('army_types')
                          ? 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
                          : 'border-[#3a3a5c] focus:border-[#d4af37]'
                      }`}
                    />
                    {isFieldChanged('army_types') && (
                      <p className="text-xs text-[#d4af37] mt-1">
                        Đã thay đổi từ: {getOldValue('army_types') || '(trống)'}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Lý do thay đổi (tùy chọn)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Giải thích lý do bạn muốn thay đổi thông tin này..."
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#3a3a5c] text-[#e0e0e0] focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#3a3a5c] bg-[#1a1a2e]/50">
            <p className="text-sm text-gray-400">
              {changedCount > 0 ? (
                <>
                  <span className="text-[#d4af37] font-medium">{changedCount}</span> trường đã thay đổi
                </>
              ) : (
                'Chưa có thay đổi'
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || changedCount === 0}
                className="px-6 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#c9a432] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đề xuất'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
