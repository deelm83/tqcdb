import { useEffect } from 'react';

export function usePageTitle(title: string, isAdmin: boolean = false) {
  useEffect(() => {
    const prefix = isAdmin ? 'Admin - ' : '';
    const suffix = ' | tamquoc.gg';
    document.title = prefix + title + suffix;
  }, [title, isAdmin]);
}
