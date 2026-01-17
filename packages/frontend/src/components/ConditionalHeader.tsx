'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BackToTop from './BackToTop';

export function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return <Header />;
}

export function ConditionalBackToTop() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return <BackToTop />;
}
