'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAdminGenerals, fetchAdminSkills, fetchPendingSuggestionsCount } from '@/lib/adminApi';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminDashboard() {
  usePageTitle('Bảng điều khiển', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ generals: 0, skills: 0, pendingSuggestions: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [generals, skills, pendingSuggestions] = await Promise.all([
          fetchAdminGenerals(),
          fetchAdminSkills(),
          fetchPendingSuggestionsCount().catch(() => 0),
        ]);
        setStats({
          generals: generals.length,
          skills: skills.length,
          pendingSuggestions,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-header mb-8">Bảng điều khiển</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Generals Card */}
          <Link href="/admin/generals" className="block group">
            <div className="card-interactive p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--accent-light)] to-transparent rounded-bl-full" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-[var(--accent-light)] rounded-lg">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-[var(--accent)]">
                  {loadingStats ? <span className="shimmer inline-block w-12 h-8 rounded" /> : stats.generals}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">Võ tướng</h2>
              <p className="text-[var(--text-tertiary)] text-sm">
                Quản lý hồ sơ, hình ảnh và binh chủng
              </p>
            </div>
          </Link>

          {/* Skills Card */}
          <Link href="/admin/skills" className="block group">
            <div className="card-interactive p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-red-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-[var(--accent)]">
                  {loadingStats ? <span className="shimmer inline-block w-12 h-8 rounded" /> : stats.skills}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">Chiến pháp</h2>
              <p className="text-[var(--text-tertiary)] text-sm">
                Quản lý chiến pháp, hiệu ứng và binh chủng
              </p>
            </div>
          </Link>

          {/* Suggestions Card */}
          <Link href="/admin/suggestions" className="block group">
            <div className="card-interactive p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-purple-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-[var(--accent)]">
                  {loadingStats ? <span className="shimmer inline-block w-12 h-8 rounded" /> : stats.pendingSuggestions}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">Đề xuất</h2>
              <p className="text-[var(--text-tertiary)] text-sm">
                Xem xét đề xuất từ cộng đồng
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/generals/new" className="btn-primary text-center">
              + Thêm võ tướng
            </Link>
            <Link href="/admin/skills/new" className="btn-primary text-center">
              + Thêm chiến pháp
            </Link>
            <Link href="/admin/generals/import" className="btn-ghost text-center">
              Import tướng
            </Link>
            <Link href="/admin/skills/mass-edit" className="btn-ghost text-center">
              Sửa nhanh chiến pháp
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
