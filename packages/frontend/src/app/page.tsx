'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchGenerals, fetchSkills, General, Skill } from '@/lib/api';
import { factionNames, FactionId, factionColors } from '@/lib/generals';
import { qualityColors } from '@/lib/skills';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('Trang chủ');
  const [search, setSearch] = useState('');
  const [generals, setGenerals] = useState<General[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setGenerals([]);
      setSkills([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const [generalsData, skillsData] = await Promise.all([
          fetchGenerals({ search }),
          fetchSkills(search),
        ]);
        setGenerals(generalsData.slice(0, 5));
        setSkills(skillsData.slice(0, 5));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  const totalResults = generals.length + skills.length;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className={`transition-all duration-500 ease-out ${hasSearched ? 'pt-16 pb-8' : 'min-h-screen flex items-center justify-center'}`}>
        <div className="w-full max-w-2xl mx-auto px-6">
          {/* Logo */}
          {!hasSearched && (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-wider text-[var(--accent-gold)] mb-3">
                TAMQUOC.GG
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent-gold-dim)]" />
                <span className="text-[var(--text-tertiary)] text-xs uppercase tracking-[0.3em]">Cơ sở dữ liệu</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent-gold-dim)]" />
              </div>
              <p className="text-[var(--text-secondary)]">
                Tam Quốc Chí Chiến Lược
              </p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {loading ? (
                <div className="spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm võ tướng và chiến pháp..."
              className="w-full h-14 pl-12 pr-4 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-gold)] focus:outline-none"
            />
          </div>

          {/* Quick Links */}
          {!hasSearched && (
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/generals" className="btn-primary">
                Xem võ tướng
              </Link>
              <Link href="/skills" className="btn-secondary">
                Xem chiến pháp
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {hasSearched && (
        <section className="max-w-2xl mx-auto px-6 pb-16 animate-in">
          <div className="text-[13px] text-[var(--text-tertiary)] mb-6 uppercase tracking-wider">
            {loading ? 'Đang tìm...' : `${totalResults} kết quả`}
          </div>

          {/* Officers */}
          {generals.length > 0 && (
            <div className="mb-10">
              <h2 className="section-header">Võ tướng</h2>
              <div className="space-y-2">
                {generals.map((general) => {
                  const factionId = general.faction_id as FactionId;
                  return (
                    <Link
                      key={general.id}
                      href={`/generals/${general.slug || general.id}`}
                      className="card flex items-center gap-4 p-4"
                    >
                      <div className="w-12 h-12 overflow-hidden bg-[var(--bg-tertiary)] flex-shrink-0">
                        <img
                          src={general.image || '/images/general-placeholder.svg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-medium text-[var(--text-primary)]">
                          {general.name.vi}
                        </div>
                        <div className="text-[13px] text-[var(--text-secondary)]">
                          <span className={factionColors[factionId]?.text}>{factionNames[factionId]?.vi}</span>
                          <span className="mx-2 text-[var(--text-tertiary)]">·</span>
                          <span>Cost {general.cost}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-[var(--accent-gold-dim)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
              {generals.length >= 5 && (
                <Link
                  href={`/generals?search=${encodeURIComponent(search)}`}
                  className="inline-block mt-4 text-[13px] text-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)]"
                >
                  Xem tất cả võ tướng →
                </Link>
              )}
            </div>
          )}

          {/* Tactics */}
          {skills.length > 0 && (
            <div className="mb-10">
              <h2 className="section-header">Chiến pháp</h2>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <Link
                    key={skill.name.cn}
                    href={`/skills?skill=${encodeURIComponent(skill.slug || skill.id.toString())}`}
                    className="card flex items-center justify-between p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-[var(--text-primary)]">
                        {skill.name.vi || skill.name.cn}
                      </div>
                      <div className="text-[13px] text-[var(--text-secondary)]">
                        {skill.type?.name?.vi}
                        {skill.trigger_rate && (
                          <>
                            <span className="mx-2 text-[var(--text-tertiary)]">·</span>
                            <span>{skill.trigger_rate}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[13px] font-semibold ${skill.quality ? qualityColors[skill.quality] : 'text-[var(--text-tertiary)]'}`}>
                        {skill.quality || '-'}
                      </span>
                      <svg className="w-5 h-5 text-[var(--accent-gold-dim)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
              {skills.length >= 5 && (
                <Link
                  href={`/skills?search=${encodeURIComponent(search)}`}
                  className="inline-block mt-4 text-[13px] text-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)]"
                >
                  Xem tất cả chiến pháp →
                </Link>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && totalResults === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--text-secondary)]">Không tìm thấy kết quả</p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-2">Thử từ khóa khác</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
