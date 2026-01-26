'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import UserMenu from './UserMenu';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const publicNavItems = [
  { href: '/generals', label: 'Vo tuong', viLabel: 'Võ tướng' },
  { href: '/skills', label: 'Chien phap', viLabel: 'Chiến pháp' },
  { href: '/formations', label: 'Doi hinh', viLabel: 'Đội Hình' },
];

const authenticatedNavItems = [
  { href: '/lineups', label: 'Dan tran', viLabel: 'Dàn Trận' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, checkAuth } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-[var(--accent)] text-lg font-bold tracking-wide hover:opacity-80 transition-opacity"
        >
          TAMQUOC.GG
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[14px] font-medium transition-colors py-1 ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.viLabel}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-[var(--accent)]" />
                )}
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
                  className="btn-primary !py-1.5 !px-4 !text-[12px]"
                >
                  {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-secondary)] animate-in">
          <div className="px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-[14px] font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {item.viLabel}
                </Link>
              );
            })}

            {/* Mobile auth */}
            {!isLoading && !user && (
              <div className="pt-3 mt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => { handleDevLogin(); setMobileOpen(false); }}
                  disabled={isLoggingIn}
                  className="btn-primary w-full !text-[13px]"
                >
                  {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
