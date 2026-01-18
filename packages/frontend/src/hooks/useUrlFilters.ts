'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type FilterValue = string | string[] | number | null;

interface UseUrlFiltersOptions {
  defaultValues?: Record<string, FilterValue>;
}

export function useUrlFilters<T extends Record<string, FilterValue>>(
  options: UseUrlFiltersOptions = {}
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { defaultValues = {} } = options;

  // Parse current filters from URL
  const filters = useMemo(() => {
    const result: Record<string, FilterValue> = { ...defaultValues };

    searchParams.forEach((value, key) => {
      // Handle array values (comma-separated)
      if (value.includes(',')) {
        result[key] = value.split(',');
      } else if (value === '') {
        result[key] = null;
      } else if (!isNaN(Number(value)) && key !== 'search' && key !== 'q') {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    });

    return result as T;
  }, [searchParams, defaultValues]);

  // Update a single filter
  const setFilter = useCallback(
    (key: string, value: FilterValue) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Update multiple filters at once
  const setFilters = useCallback(
    (newFilters: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Toggle a value in an array filter
  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const current = filters[key];
      const currentArray = Array.isArray(current) ? current : current ? [current] : [];

      if (currentArray.includes(value)) {
        setFilter(key, currentArray.filter(v => v !== value));
      } else {
        setFilter(key, [...currentArray, value]);
      }
    },
    [filters, setFilter]
  );

  // Get filter value with proper typing
  const getFilter = useCallback(
    <K extends keyof T>(key: K, defaultValue?: T[K]): T[K] => {
      const value = filters[key as string];
      if (value === undefined || value === null) {
        return defaultValue as T[K];
      }
      return value as T[K];
    },
    [filters]
  );

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    toggleArrayFilter,
    getFilter,
  };
}
