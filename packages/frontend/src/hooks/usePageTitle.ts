'use client';

import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | TQC Wiki` : 'TQC Wiki';
  }, [title]);
}
