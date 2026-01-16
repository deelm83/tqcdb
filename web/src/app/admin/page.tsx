'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAdminGenerals, fetchAdminSkills } from '@/lib/adminApi';

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ generals: 0, skills: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [generals, skills] = await Promise.all([
          fetchAdminGenerals(),
          fetchAdminSkills(),
        ]);
        setStats({ generals: generals.length, skills: skills.length });
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
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-amber-100 mb-8">Bảng điều khiển</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generals Card */}
          <Link href="/admin/generals" className="block">
            <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6 hover:border-amber-700/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-100">Tướng</h2>
                <span className="text-3xl font-bold text-amber-400">
                  {loadingStats ? '...' : stats.generals}
                </span>
              </div>
              <p className="text-stone-400 text-sm">
                Quản lý hồ sơ tướng, hình ảnh và tương thích binh chủng
              </p>
            </div>
          </Link>

          {/* Skills Card */}
          <Link href="/admin/skills" className="block">
            <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-6 hover:border-amber-700/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-100">Chiến pháp</h2>
                <span className="text-3xl font-bold text-amber-400">
                  {loadingStats ? '...' : stats.skills}
                </span>
              </div>
              <p className="text-stone-400 text-sm">
                Quản lý chi tiết chiến pháp, hiệu ứng và tương thích binh chủng
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-stone-800/50 border border-stone-700 rounded-lg">
          <h3 className="text-amber-100 font-medium mb-2">Thao tác nhanh</h3>
          <div className="flex gap-4">
            <Link
              href="/admin/generals/new"
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors"
            >
              + Thêm tướng
            </Link>
            <Link
              href="/admin/skills/new"
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors"
            >
              + Thêm chiến pháp
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
