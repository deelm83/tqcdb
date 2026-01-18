'use client';

import { useEffect } from 'react';

export function usePageTitle(title: string, _isAdmin?: boolean) {
  useEffect(() => {
    document.title = title ? `${title} | TQC Wiki` : 'TQC Wiki';
  }, [title]);
}
