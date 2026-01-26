'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createFormation, ArmyType, CreateFormationData, Formation } from '@/lib/formationsApi';
import { fetchGenerals, fetchSkills, General, Skill } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import ExportPreviewModal from '@/components/formations/ExportPreviewModal';

const armyTypes: ArmyType[] = ['CAVALRY', 'SHIELD', 'ARCHER', 'SPEAR', 'SIEGE'];

const armyTypeLabels: Record<ArmyType, string> = {
  CAVALRY: 'Kỵ',
  SHIELD: 'Khiên',
  ARCHER: 'Cung',
  SPEAR: 'Thương',
  SIEGE: 'Xe',
};

// SVG icons for army types
const ArmyTypeIcon = ({ type, className = 'w-4 h-4' }: { type: ArmyType; className?: string }) => {
  switch (type) {
    case 'CAVALRY':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.2 6c-.6-.6-1.4-1-2.2-1h-3.5c-.4 0-.8.1-1.1.3l-1.9 1.2c-.3.2-.6.3-1 .3H8c-1.7 0-3.2.7-4.2 1.7L2 10.3c-.3.3-.3.7-.1 1l1.6 2.4c.1.2.3.3.6.4l1.9.2v3.7c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-2h8v2c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-4.5c1-.5 2-1.5 2-3V7c0-.4-.3-.7-.6-.9-.1-.1-.1-.1-.2-.1zM19 11c0 .6-.4 1-1 1h-1v-2h1c.6 0 1 .4 1 1z"/>
        </svg>
      );
    case 'SHIELD':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      );
    case 'ARCHER':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.36 6l.08.39.32 1.61h5.74v7h-4.23l-.08-.39-.32-1.61H7v-7h5.36M14 4H5v12h7l1 5h2v-5h5V6h-5l-1-5h-2v3z"/>
        </svg>
      );
    case 'SPEAR':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.78 3.75L17.6 5.93l.71.71 2.17-2.18-.7-.71M6 7v2h5v2h2V9h5V7H6m0 6v2h5v2h2v-2h5v-2H6z"/>
        </svg>
      );
    case 'SIEGE':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 4h-1V2h-2v2h-2V2h-2v2H9V2H7v2H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H6V8h12v12zm-8-6H8v-4h2v4zm4 0h-2V8h2v6zm4 0h-2V6h2v8z"/>
        </svg>
      );
  }
};

const factionColors: Record<string, string> = {
  wei: 'text-blue-600',
  shu: 'text-green-600',
  wu: 'text-red-600',
  qun: 'text-amber-600',
};

const factionLabels: Record<string, string> = {
  wei: 'Ngụy',
  shu: 'Thục',
  wu: 'Ngô',
  qun: 'Quần',
};

// Map army type to troop_compatibility key
const armyTypeToTroopKey: Record<ArmyType, string> = {
  CAVALRY: 'cavalry',
  SHIELD: 'shield',
  ARCHER: 'archer',
  SPEAR: 'spear',
  SIEGE: 'siege',
};

// Remove Vietnamese diacritics for search
const removeDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

interface FormationGeneralSlot {
  general: General | null;
  skill1: Skill | null;
  skill2: Skill | null;
}

export default function FormationCreatePage() {
  usePageTitle('Tạo Đội Hình');
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [armyType, setArmyType] = useState<ArmyType>('CAVALRY');
  const [slots, setSlots] = useState<FormationGeneralSlot[]>([
    { general: null, skill1: null, skill2: null },
    { general: null, skill1: null, skill2: null },
    { general: null, skill1: null, skill2: null },
  ]);

  const [allGenerals, setAllGenerals] = useState<General[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [generalSearch, setGeneralSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [skillGradeFilter, setSkillGradeFilter] = useState<string>('all');

  const [showGeneralPicker, setShowGeneralPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [currentSkillSlot, setCurrentSkillSlot] = useState<'skill1' | 'skill2'>('skill1');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [previewFormation, setPreviewFormation] = useState<Formation | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [generals, skills] = await Promise.all([
          fetchGenerals(),
          fetchSkills(),
        ]);
        setAllGenerals(generals);
        setAllSkills(skills);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);


  const totalCost = slots.reduce((sum, slot) => {
    return sum + (slot.general?.cost || 0);
  }, 0);

  const costColor = totalCost > 21 ? 'text-red-600' : totalCost === 21 ? 'text-amber-600' : 'text-[var(--text-primary)]';

  // Get army grade for a general based on selected army type
  const getArmyGrade = (general: General): string | undefined => {
    if (!general.troop_compatibility) return undefined;
    const troopKey = armyTypeToTroopKey[armyType];
    const compat = general.troop_compatibility[troopKey as keyof typeof general.troop_compatibility];
    return compat?.grade;
  };

  const getGradeColor = (grade: string | undefined): string => {
    if (!grade) return 'text-[var(--text-tertiary)]';
    switch (grade) {
      case 'S': return 'text-orange-600';
      case 'A': return 'text-purple-600';
      case 'B': return 'text-sky-600';
      case 'C': return 'text-cyan-600';
      default: return 'text-[var(--text-tertiary)]';
    }
  };

  const openGeneralPicker = (slotIndex: number) => {
    setCurrentSlotIndex(slotIndex);
    setShowGeneralPicker(true);
  };

  const selectGeneral = (general: General) => {
    const newSlots = [...slots];
    newSlots[currentSlotIndex].general = general;
    setSlots(newSlots);
    setShowGeneralPicker(false);
    setGeneralSearch('');
  };

  const removeGeneral = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = { general: null, skill1: null, skill2: null };
    setSlots(newSlots);
  };

  const openSkillPicker = (slotIndex: number, skillSlot: 'skill1' | 'skill2') => {
    if (!slots[slotIndex].general) return;
    setCurrentSlotIndex(slotIndex);
    setCurrentSkillSlot(skillSlot);
    setShowSkillPicker(true);
  };

  const selectSkill = (skill: Skill) => {
    const newSlots = [...slots];
    newSlots[currentSlotIndex][currentSkillSlot] = skill;
    setSlots(newSlots);
    setShowSkillPicker(false);
    setSkillSearch('');
    setSkillGradeFilter('all');
  };

  const removeSkill = (slotIndex: number, skillSlot: 'skill1' | 'skill2') => {
    const newSlots = [...slots];
    newSlots[slotIndex][skillSlot] = null;
    setSlots(newSlots);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const newSlots = [...slots];
      const temp = newSlots[draggedIndex];
      newSlots[draggedIndex] = newSlots[index];
      newSlots[index] = temp;
      setSlots(newSlots);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handlePreview = () => {
    const generals = slots
      .map((slot, index) => {
        if (!slot.general) return null;

        const grade = getArmyGrade(slot.general);

        return {
          generalId: slot.general.id,
          generalName: slot.general.name,
          generalImage: slot.general.image,
          generalCost: slot.general.cost,
          generalGrade: grade,
          innateSkillName: slot.general.innate_skill?.name || slot.general.innate_skill_name,
          skill1Id: slot.skill1?.id || null,
          skill1Name: slot.skill1?.name || null,
          skill2Id: slot.skill2?.id || null,
          skill2Name: slot.skill2?.name || null,
          position: index,
        };
      })
      .filter(Boolean) as Formation['generals'];

    if (generals.length === 0) {
      alert('Vui lòng chọn ít nhất một võ tướng');
      return;
    }

    const tempFormation: Formation = {
      id: 0,
      name: name.trim(),
      description: description.trim() || undefined,
      armyType,
      totalCost,
      userId: user ? parseInt(user.id) : 0,
      username: user?.displayName || 'Ẩn danh',
      isCurated: false,
      upvotes: 0,
      downvotes: 0,
      generals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPreviewFormation(tempFormation);
    setShowExportPreview(true);
  };

  const handleSave = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để lưu đội hình');
      return;
    }

    if (totalCost > 21) {
      alert('Tổng COST không được vượt quá 21');
      return;
    }

    const generals = slots
      .map((slot, index) => {
        if (!slot.general) return null;
        return {
          generalId: slot.general.id,
          position: index,
          skill1Id: slot.skill1?.id || null,
          skill2Id: slot.skill2?.id || null,
        };
      })
      .filter(Boolean) as CreateFormationData['generals'];

    if (generals.length === 0) {
      alert('Vui lòng chọn ít nhất một võ tướng');
      return;
    }

    setSaving(true);
    try {
      const formation = await createFormation({
        name: name.trim(),
        description: description.trim() || undefined,
        armyType,
        generals,
      });
      router.push(`/formations/${formation.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể tạo đội hình');
    } finally {
      setSaving(false);
    }
  };

  const filteredGenerals = allGenerals.filter((g) => {
    const searchNorm = removeDiacritics(generalSearch.toLowerCase());
    const nameNorm = removeDiacritics(g.name.toLowerCase());
    return nameNorm.includes(searchNorm);
  });

  // Get all selected skill IDs to prevent duplicates
  const selectedSkillIds = new Set(
    slots.flatMap((slot) => [slot.skill1?.id, slot.skill2?.id].filter(Boolean))
  );

  const filteredSkills = allSkills.filter((s) => {
    const searchNorm = removeDiacritics(skillSearch.toLowerCase());
    const nameNorm = removeDiacritics(s.name.toLowerCase());
    const matchesSearch = nameNorm.includes(searchNorm);
    const matchesGrade = skillGradeFilter === 'all' || s.quality === skillGradeFilter;
    const notAlreadySelected = !selectedSkillIds.has(s.id);

    // Only allow skills that can be obtained through inherit or exchange
    // - Exchange skills: acquisition_type === 'exchange'
    // - Inherit skills: has inheritance_from or inherit_general_ids
    // - Innate-only skills are NOT allowed (unless they can also be inherited)
    const canInherit = (s.inheritance_from && s.inheritance_from.length > 0) ||
                       (s.inherit_general_ids && s.inherit_general_ids.length > 0);
    const canExchange = s.acquisition_type === 'exchange';
    const isObtainable = canInherit || canExchange;

    return matchesSearch && matchesGrade && notAlreadySelected && isObtainable;
  });

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="card p-8 shimmer">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] mb-4" />
          <div className="h-64 bg-[var(--bg-secondary)]" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--accent)] ">Tạo Đội Hình</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)] hover:text-[var(--text-primary)] transition-colors"
            >
              Hủy
            </button>
            {!user && (
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors"
              >
                Xem trước & Lưu ảnh
              </button>
            )}
            {user && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Army Type Selector and Cost - aligned with generals grid */}
        <div className="lg:col-span-3 flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {armyTypes.map((type) => {
              const isActive = armyType === type;
              return (
                <button
                  key={type}
                  onClick={() => setArmyType(type)}
                  className={`px-3 py-1.5 text-[13px] font-medium border transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--bg-tertiary)] border-[var(--accent)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <ArmyTypeIcon type={type} className="w-4 h-4" />
                  {armyTypeLabels[type]}
                </button>
              );
            })}
          </div>
          <div className={`text-[15px] font-medium ${costColor}`}>
            COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold">{totalCost}</span>
          </div>
        </div>
        {/* Left: Generals (3 columns) */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={`card p-4 transition-all ${
                  slot.general ? 'cursor-grab active:cursor-grabbing' : ''
                } ${dragOverIndex === idx ? 'ring-2 ring-[var(--accent)] scale-[1.02]' : ''} ${
                  draggedIndex === idx ? 'opacity-50' : ''
                }`}
                draggable={!!slot.general}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
              >
                <div className={`text-[13px] mb-3  ${idx === 0 ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                  {idx === 0 ? 'Chủ Tướng' : 'Phó Tướng'}
                </div>

                {/* General */}
                {slot.general ? (
                  <div>
                    {/* General Image with Remove Button */}
                    <div className="relative mb-3">
                      <div className="aspect-[7/10] rounded overflow-hidden bg-[var(--bg-secondary)]">
                        <img
                          src={slot.general.image || '/images/general-placeholder.svg'}
                          alt={slot.general.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Remove button - top right */}
                      <button
                        onClick={() => removeGeneral(idx)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/70 hover:bg-red-500/80 text-white/70 hover:text-white rounded-full transition-colors"
                        title="Xóa võ tướng"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* General Info */}
                    <div className="text-center mb-3">
                      <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                        {slot.general.name}
                      </div>
                      {/* Faction */}
                      {slot.general.faction_id && (
                        <div className={`text-[12px] ${factionColors[slot.general.faction_id] || 'text-[var(--text-tertiary)]'}`}>
                          {factionLabels[slot.general.faction_id] || slot.general.faction_id}
                        </div>
                      )}
                      {/* Cost and Army Grade */}
                      <div className="flex items-center justify-center gap-3 mt-1">
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          COST: <span style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }} className="font-bold">{slot.general.cost}</span>
                        </span>
                        <span className={`text-[13px] font-bold ${getGradeColor(getArmyGrade(slot.general))}`}>
                          {armyTypeLabels[armyType]} [{getArmyGrade(slot.general) || '-'}]
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2 border-t border-[var(--border)] pt-3">
                      {/* Innate Skill - Read only, same style as other skills */}
                      {(slot.general.innate_skill?.name || slot.general.innate_skill_name) ? (
                        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-3 py-2 rounded">
                          <span className="text-[13px] text-[var(--text-primary)] font-medium">
                            {slot.general.innate_skill?.name || slot.general.innate_skill_name}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-2 rounded">
                          <span className="text-[13px] text-[var(--text-tertiary)]">Chưa có</span>
                        </div>
                      )}

                      {/* Skill 1 */}
                      {slot.skill1 ? (
                        <div className="flex items-center justify-between bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-3 py-2 rounded">
                          <span className="text-[13px] text-[var(--text-primary)] font-medium truncate">{slot.skill1.name}</span>
                          <button
                            onClick={() => removeSkill(idx, 'skill1')}
                            className="ml-2 text-[var(--text-tertiary)] hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSkillPicker(idx, 'skill1')}
                          className="w-full px-3 py-2 text-[13px] border-2 border-dashed border-[var(--accent)]/30 text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors rounded"
                        >
                          + Chiến pháp
                        </button>
                      )}

                      {/* Skill 2 */}
                      {slot.skill2 ? (
                        <div className="flex items-center justify-between bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-3 py-2 rounded">
                          <span className="text-[13px] text-[var(--text-primary)] font-medium truncate">{slot.skill2.name}</span>
                          <button
                            onClick={() => removeSkill(idx, 'skill2')}
                            className="ml-2 text-[var(--text-tertiary)] hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSkillPicker(idx, 'skill2')}
                          className="w-full px-3 py-2 text-[13px] border-2 border-dashed border-[var(--accent)]/30 text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors rounded"
                        >
                          + Chiến pháp
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openGeneralPicker(idx)}
                    className="aspect-[7/10] w-full rounded border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="text-[var(--text-tertiary)] text-[24px] mb-2">+</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">Thêm võ tướng</div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Name & Description (1 column) */}
        <div className="space-y-4">
          <div className="card p-4">
            <label className="block text-[12px] text-[var(--text-tertiary)] mb-1 ">
              Tên đội hình
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Thục Hán Tam Kiệt"
              className="w-full px-3 py-2 text-[14px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="card p-4">
            <label className="block text-[12px] text-[var(--text-tertiary)] mb-1 ">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về đội hình..."
              rows={4}
              className="w-full px-3 py-2 text-[14px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>

        </div>
      </div>

      {/* General Picker Modal */}
      {showGeneralPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg)] border border-[var(--border)] max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Chọn Võ Tướng</h3>
              <button
                onClick={() => setShowGeneralPicker(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-[var(--border)]">
              <input
                type="text"
                value={generalSearch}
                onChange={(e) => setGeneralSearch(e.target.value)}
                placeholder="Tìm kiếm võ tướng..."
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {filteredGenerals.map((general) => {
                  const grade = getArmyGrade(general);
                  return (
                    <button
                      key={general.id}
                      onClick={() => selectGeneral(general)}
                      className="group text-left"
                    >
                      <div className="aspect-[7/10] rounded overflow-hidden bg-[var(--bg-secondary)] border-2 border-transparent group-hover:border-[var(--accent)] transition-colors">
                        <img
                          src={general.image || '/images/general-placeholder.svg'}
                          alt={general.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[11px] text-center text-[var(--text-secondary)] mt-1 truncate">
                        {general.name}
                      </div>
                      <div className="text-[11px] text-center flex items-center justify-center gap-2">
                        <span className="text-[var(--text-tertiary)]">COST: {general.cost}</span>
                        <span className={`font-bold ${getGradeColor(grade)}`}>{armyTypeLabels[armyType]} [{grade || '-'}]</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Picker Modal */}
      {showSkillPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg)] border border-[var(--border)] max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                Chọn Chiến Pháp cho {slots[currentSlotIndex].general?.name}
              </h3>
              <button
                onClick={() => setShowSkillPicker(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-[var(--border)] space-y-3">
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Tìm kiếm chiến pháp..."
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />

              <div className="flex gap-2">
                <span className="text-[13px] text-[var(--text-secondary)]">Lọc:</span>
                {['all', 'S', 'A', 'B', 'C'].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSkillGradeFilter(grade)}
                    className={`px-2 py-1 text-[13px] font-medium border transition-colors ${
                      skillGradeFilter === grade
                        ? 'bg-[var(--bg-tertiary)] border-[var(--border-light)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-light)]'
                    }`}
                  >
                    {grade === 'all' ? 'Tất cả' : grade}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => selectSkill(skill)}
                    className="w-full card p-3 text-left hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--text-primary)]">{skill.name}</div>
                        {skill.effect && (
                          <div className="text-[13px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                            {skill.effect}
                          </div>
                        )}
                      </div>
                      {skill.quality && (
                        <span className={`ml-3 text-[14px] font-bold ${getGradeColor(skill.quality)}`}>
                          [{skill.quality}]
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showExportPreview && previewFormation && (
        <ExportPreviewModal
          formation={previewFormation}
          onClose={() => setShowExportPreview(false)}
        />
      )}
    </main>
  );
}
