'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import UserMenu from './UserMenu';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const publicNavItems = [
  { href: '/generals', label: 'Võ tướng' },
  { href: '/skills', label: 'Chiến pháp' },
  { href: '/formations', label: 'Đội Hình' },
];

const authenticatedNavItems = [
  { href: '/lineups', label: 'Dàn Trận' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, checkAuth } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Combine nav items based on auth status
  const navItems = user
    ? [...publicNavItems, ...authenticatedNavItems]
    : publicNavItems;

  const handleDevLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user-auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: 'Dev User' })
      });
      if (res.ok) {
        await checkAuth();
      }
    } catch {
      console.error('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (pathname === '/') return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--accent-gold)] font-semibold tracking-wide hover:text-[var(--accent-gold-bright)] transition-colors"
          >
            TAMQUOC.GG
          </Link>

          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[13px] font-medium uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[var(--accent-gold)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Auth section */}
            {!isLoading && (
              <div className="ml-2">
                {user ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={handleDevLogin}
                    disabled={isLoggingIn}
                    className="px-4 py-1.5 text-sm font-medium bg-[var(--accent-gold)] text-black rounded hover:bg-[var(--accent-gold-bright)] transition-colors disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
