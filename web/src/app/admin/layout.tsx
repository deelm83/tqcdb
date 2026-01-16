'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastContainer } from '@/components/Toast';
import Link from 'next/link';

function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Show loading state
  if (isLoading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <div className="text-amber-100">Đang tải...</div>
      </div>
    );
  }

  // Don't show navigation on login page
  if (isLoginPage) {
    return null;
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b-2 border-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            {/* Logo & Admin Badge */}
            <Link href="/admin" className="flex items-center gap-2 px-3 py-1 mr-4">
              <span className="text-lg font-bold text-white">Tam Quốc Chí</span>
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">ADMIN</span>
            </Link>

            {/* Nav Links */}
            <Link
              href="/admin/generals"
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                pathname.startsWith('/admin/generals')
                  ? 'bg-white/20 text-white'
                  : 'text-red-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tướng
            </Link>
            <Link
              href="/admin/skills"
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                pathname.startsWith('/admin/skills')
                  ? 'bg-white/20 text-white'
                  : 'text-red-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Chiến Pháp
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-200 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Xem trang
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-700/50 hover:bg-red-700 text-white rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminNavigation />
      <ToastContainer />
      {children}
    </AuthProvider>
  );
}
