'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createGeneral } from '@/lib/adminApi';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

const FACTIONS = [
  { id: 'wei', name: 'Ngụy' },
  { id: 'shu', name: 'Thục' },
  { id: 'wu', name: 'Ngô' },
  { id: 'qun', name: 'Quần' },
];

const GRADES = ['S', 'A', 'B', 'C', 'D'];

export default function NewGeneralPage() {
  usePageTitle('Thêm võ tướng', true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    slug: '',
    name: '',
    factionId: '',
    cost: 3,
    wikiUrl: '',
    image: '',
    imageFull: '',
    tags: [] as string[],
    cavalryGrade: '',
    shieldGrade: '',
    archerGrade: '',
    spearGrade: '',
    siegeGrade: '',
    innateSkillName: '',
    inheritedSkillName: '',
  });

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const result = await createGeneral({
        slug: form.slug || undefined,
        name: form.name,
        faction_id: form.factionId,
        cost: form.cost,
        wiki_url: form.wikiUrl || undefined,
        image: form.image || undefined,
        image_full: form.imageFull || undefined,
        tags: form.tags,
        troop_compatibility: {
          cavalry: { grade: form.cavalryGrade },
          shield: { grade: form.shieldGrade },
          archer: { grade: form.archerGrade },
          spear: { grade: form.spearGrade },
          siege: { grade: form.siegeGrade },
        },
        innate_skill_name: form.innateSkillName || undefined,
        inherited_skill_name: form.inheritedSkillName || undefined,
      } as any);

      router.push(`/admin/generals/${result.general.slug || result.general.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create general');
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--accent)]">New General</h1>
          <Link
            href="/admin/generals"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
          >
            Back to list
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Slug <span className="text-[var(--text-tertiary)]">(auto-generated if empty)</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                  placeholder="truong-phi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Faction *</label>
                <select
                  value={form.factionId}
                  onChange={(e) => setForm((prev) => ({ ...prev, factionId: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                  required
                >
                  <option value="">Select faction</option>
                  {FACTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cost</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm((prev) => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                  min={1}
                  max={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Wiki URL</label>
                <input
                  type="url"
                  value={form.wikiUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, wikiUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">Image</h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-4">
              You can upload an image after creating the general.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Image URL</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                placeholder="/images/generals/..."
              />
            </div>
          </div>

          {/* Troop Compatibility */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">Troop Compatibility</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'cavalryGrade', label: 'Cavalry' },
                { key: 'shieldGrade', label: 'Shield' },
                { key: 'archerGrade', label: 'Archer' },
                { key: 'spearGrade', label: 'Spear' },
                { key: 'siegeGrade', label: 'Siege' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>
                  <select
                    value={(form as any)[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                  >
                    <option value="">-</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">Skills</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Innate Skill Name</label>
                <input
                  type="text"
                  value={form.innateSkillName}
                  onChange={(e) => setForm((prev) => ({ ...prev, innateSkillName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Inherited Skill Name</label>
                <input
                  type="text"
                  value={form.inheritedSkillName}
                  onChange={(e) => setForm((prev) => ({ ...prev, inheritedSkillName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">Tags</h2>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tags (phân cách bởi dấu phẩy)</label>
              <input
                type="text"
                value={form.tags.join(', ')}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/generals"
              className="px-6 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[var(--accent-dim)] hover:bg-[var(--accent)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create General'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
