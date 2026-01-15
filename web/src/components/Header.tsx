'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/generals', label: 'Tướng', icon: '⚔️' },
  { href: '/skills', label: 'Chiến Pháp', icon: '📜' },
];

export default function Header() {
  const pathname = usePathname();

  // Hide header on home page
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Main header */}
      <div className="bg-gradient-to-b from-[#12171f] to-[#0a0e14] border-b border-[#2a3548]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="group">
              <img
                src="/images/logo.svg"
                alt="Tam Quốc Chí Database"
                className="h-12 group-hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-b from-[#d4a74a]/20 to-[#a67c32]/10 text-[#f0c96e]'
                        : 'text-[#b8a990] hover:text-[#e8dcc8] hover:bg-[#1e2636]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#d4a74a] to-transparent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Decorative gold line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#6b5a3e] to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4a74a]/50 to-transparent" />
    </header>
  );
}
