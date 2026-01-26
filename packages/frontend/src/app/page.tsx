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
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Hero */}
      <section className={`relative transition-all duration-500 ease-out ${hasSearched ? 'pt-16 pb-8 bg-[var(--bg)]' : 'min-h-screen flex items-center justify-center bg-[#F5F0E8]'}`}>
        {/* Background image — only on landing */}
        {!hasSearched && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src="/images/home-bg-light.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            {/* Warm wash overlay to blend with parchment bg */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0E8]/60 via-transparent to-[#F5F0E8]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#F5F0E8_75%)]" />
          </div>
        )}

        <div className="relative w-full max-w-2xl mx-auto px-6">
          {/* Logo & Branding */}
          {!hasSearched && (
            <div className="text-center mb-14">
              {/* Main Logo */}
              <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-[var(--accent)] mb-4">
                TAMQUOC.GG
              </h1>

              {/* Decorative line */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-px bg-[#1C1917]/15" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50" />
                <div className="w-12 h-px bg-[#1C1917]/15" />
              </div>

              {/* Subtitle */}
              <p className="text-[#44403C] text-lg">
                Cơ sở dữ liệu — Tam Quốc Chí Chiến Lược
              </p>
            </div>
          )}

          {/* Search */}
          <div className="relative group">
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[var(--accent)] ${hasSearched ? 'text-[var(--text-tertiary)]' : 'text-[#78716C]'}`}>
              {loading ? (
                <div className="spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              className={`w-full h-16 pl-14 pr-6 rounded-2xl text-lg focus:outline-none transition-all ${
                hasSearched
                  ? 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(185,28,28,0.1)]'
                  : 'bg-white/70 border border-[#1C1917]/10 text-[var(--text-primary)] placeholder-[#78716C] backdrop-blur-sm shadow-[var(--shadow-md)] focus:border-[var(--accent)] focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(185,28,28,0.1)]'
              }`}
            />
          </div>

          {/* Quick Links */}
          {!hasSearched && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link href="/generals" className="btn-primary !py-3 !px-8 !text-[14px] !rounded-xl !shadow-md">
                Xem võ tướng
              </Link>
              <Link href="/skills" className="btn-secondary !py-3 !px-8 !text-[14px] !rounded-xl">
                Xem chiến pháp
              </Link>
              <Link href="/formations" className="btn-ghost !py-3 !px-8 !text-[14px] !rounded-xl !bg-white/40 !border-[#1C1917]/10 hover:!bg-white/60">
                Đội hình
              </Link>
            </div>
          )}

          {/* Feature highlights */}
          {!hasSearched && (
            <div className="grid grid-cols-3 gap-4 mt-16 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">500+</div>
                <div className="text-[12px] text-[#78716C] mt-1">Võ tướng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">400+</div>
                <div className="text-[12px] text-[#78716C] mt-1">Chiến pháp</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">100+</div>
                <div className="text-[12px] text-[#78716C] mt-1">Đội hình</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {hasSearched && (
        <section className="max-w-2xl mx-auto px-6 pb-16 animate-in">
          <div className="text-[13px] text-[var(--text-tertiary)] mb-6 font-medium">
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
                      className="card-interactive flex items-center gap-4 p-4"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <div className="absolute inset-0 shimmer" />
                        <img
                          src={general.image || '/images/general-placeholder.svg'}
                          alt=""
                          className="relative w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--text-primary)]">
                          {general.name}
                        </div>
                        <div className="text-[13px] text-[var(--text-secondary)]">
                          <span className={factionColors[factionId]?.text}>{factionNames[factionId]?.vi}</span>
                          <span className="mx-2 text-[var(--text-tertiary)]">·</span>
                          <span>Cost {general.cost}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
              {generals.length >= 5 && (
                <Link
                  href={`/generals?q=${encodeURIComponent(search)}`}
                  className="inline-block mt-4 text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
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
                    key={skill.name}
                    href={`/skills?skill=${encodeURIComponent(skill.slug || skill.id.toString())}`}
                    className="card-interactive flex items-center justify-between p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {skill.name}
                      </div>
                      <div className="text-[13px] text-[var(--text-secondary)]">
                        {skill.type?.name}
                        {skill.trigger_rate && (
                          <>
                            <span className="mx-2 text-[var(--text-tertiary)]">·</span>
                            <span>{skill.trigger_rate}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[13px] font-bold ${skill.quality ? qualityColors[skill.quality] : 'text-[var(--text-tertiary)]'}`}>
                        {skill.quality || '-'}
                      </span>
                      <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
              {skills.length >= 5 && (
                <Link
                  href={`/skills?q=${encodeURIComponent(search)}`}
                  className="inline-block mt-4 text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
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

      {/* Footer */}
      {!hasSearched && (
        <footer className="pb-8 bg-[#F5F0E8]">
          <div className="max-w-2xl mx-auto px-6">
            <div className="h-px bg-[#1C1917]/10 mb-6" />
            <p className="text-center text-[12px] text-[#78716C]">
              tamquoc.gg — Cơ sở dữ liệu Tam Quốc Chí Chiến Lược
            </p>
          </div>
        </footer>
      )}
    </main>
  );
}
