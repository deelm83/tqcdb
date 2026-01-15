'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchGenerals, fetchSkills, General, Skill } from '@/lib/api';
import { factionNames, FactionId } from '@/lib/generals';

export default function Home() {
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
        setGenerals(generalsData.slice(0, 10));
        setSkills(skillsData.slice(0, 10));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const totalResults = generals.length + skills.length;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section */}
      <div className={`relative transition-all duration-500 ${hasSearched ? '' : 'flex-1 flex flex-col justify-center'}`}>
        {/* Background Image - Only show when not searching */}
        {!hasSearched && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/home-banner.png"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/70 to-[#0a0e14]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14]/60 via-transparent to-[#0a0e14]/60" />
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4 py-12">

          {/* Title - only show when not searching */}
          {!hasSearched && (
            <div className="text-center mb-10">
              <h1
                className="text-5xl md:text-6xl text-[#f0c96e] mb-4"
                style={{
                  fontFamily: 'var(--font-great-vibes), cursive',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                }}
              >
                Tam Quốc Chí
              </h1>
              <p className="text-[#b8a990] text-lg tracking-widest uppercase">
                Chiến Lược Database
              </p>
            </div>
          )}

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d4a74a]/30 via-[#f0c96e]/30 to-[#d4a74a]/30 rounded-full blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm tướng hoặc chiến pháp..."
                  className="w-full px-6 py-4 rounded-full bg-[#1a2130]/90 backdrop-blur-sm border-2 border-[#2a3548] text-[#e8dcc8] placeholder-[#6b7280] focus:outline-none focus:border-[#d4a74a] transition-all text-lg shadow-2xl"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-[#d4a74a]/30 border-t-[#d4a74a] rounded-full animate-spin block" />
                  ) : (
                    <svg className="w-6 h-6 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - only show when not searching */}
          {!hasSearched && (
            <div className="flex justify-center gap-6">
              <Link
                href="/generals"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1a2130]/80 border border-[#2a3548] hover:border-[#d4a74a]/50 hover:bg-[#1a2130] transition-all text-[#b8a990] hover:text-[#f0c96e]"
              >
                <span>⚔️</span>
                <span>Danh sách tướng</span>
              </Link>
              <Link
                href="/skills"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1a2130]/80 border border-[#2a3548] hover:border-[#d4a74a]/50 hover:bg-[#1a2130] transition-all text-[#b8a990] hover:text-[#f0c96e]"
              >
                <span>📜</span>
                <span>Chiến pháp</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 pb-8">
          <div className="text-sm text-[#6b7280] mb-6">
            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalResults} kết quả`}
          </div>

          {/* Generals Results */}
          {generals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#d4a74a] mb-4 flex items-center gap-2">
                <span>⚔️</span>
                <span>Tướng</span>
                <span className="text-sm font-normal text-[#6b7280]">({generals.length})</span>
              </h2>
              <div className="grid gap-3">
                {generals.map((general) => {
                  const factionId = general.faction_id as FactionId;
                  const factionName = factionNames[factionId]?.vi || '';
                  return (
                    <Link
                      key={general.id}
                      href={`/generals/${general.slug || general.id}`}
                      className="block p-4 rounded-xl bg-gradient-to-r from-[#1a2130] to-[#12171f] border border-[#2a3548] hover:border-[#6b5a3e] hover:shadow-lg hover:shadow-[#d4a74a]/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-[#2a3548] flex-shrink-0 border border-[#3a4558] group-hover:border-[#6b5a3e] transition-colors">
                          <img
                            src={general.image || '/images/general-placeholder.svg'}
                            alt={general.name.vi}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#e8dcc8] group-hover:text-[#f0c96e] transition-colors text-lg">
                            {general.name.vi}
                          </div>
                          <div className="text-sm text-[#6b7280]">
                            {factionName} · Cost {general.cost}
                          </div>
                        </div>
                        <div className="text-[#6b7280] group-hover:text-[#d4a74a] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {generals.length >= 10 && (
                <Link
                  href={`/generals?search=${encodeURIComponent(search)}`}
                  className="block text-center mt-4 text-sm text-[#a67c32] hover:text-[#f0c96e] transition-colors"
                >
                  Xem thêm kết quả tướng →
                </Link>
              )}
            </div>
          )}

          {/* Skills Results */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#d4a74a] mb-4 flex items-center gap-2">
                <span>📜</span>
                <span>Chiến Pháp</span>
                <span className="text-sm font-normal text-[#6b7280]">({skills.length})</span>
              </h2>
              <div className="grid gap-3">
                {skills.map((skill) => (
                  <Link
                    key={skill.name.cn}
                    href={`/skills?skill=${encodeURIComponent(skill.slug || skill.id.toString())}`}
                    className="block p-4 rounded-xl bg-gradient-to-r from-[#1a2130] to-[#12171f] border border-[#2a3548] hover:border-[#6b5a3e] hover:shadow-lg hover:shadow-[#d4a74a]/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#e8dcc8] group-hover:text-[#f0c96e] transition-colors text-lg">
                          {skill.name.vi || skill.name.cn}
                        </div>
                        <div className="text-sm text-[#6b7280]">
                          {skill.type?.name?.vi || skill.type?.id} {skill.quality && `· ${skill.quality}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {skill.trigger_rate && (
                          <span className="text-sm text-[#b8a990] bg-[#2a3548] px-3 py-1 rounded-full">
                            {skill.trigger_rate}%
                          </span>
                        )}
                        <div className="text-[#6b7280] group-hover:text-[#d4a74a] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {skills.length >= 10 && (
                <Link
                  href={`/skills?search=${encodeURIComponent(search)}`}
                  className="block text-center mt-4 text-sm text-[#a67c32] hover:text-[#f0c96e] transition-colors"
                >
                  Xem thêm kết quả chiến pháp →
                </Link>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && totalResults === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-semibold text-[#e8dcc8] mb-3">Không tìm thấy kết quả</h3>
              <p className="text-[#6b7280]">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
