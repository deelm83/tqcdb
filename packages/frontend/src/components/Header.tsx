'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/generals', label: 'Võ tướng' },
  { href: '/skills', label: 'Chiến pháp' },
];

export default function Header() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
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
        </div>
      </nav>
    </header>
  );
}
