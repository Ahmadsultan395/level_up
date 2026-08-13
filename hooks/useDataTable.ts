'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface UseDataTableOptions {
  defaultPageSize?: number;
  /** Namespaces all URL params (e.g. "svc_page" instead of "page") so multiple
   *  independent tables can live on the same page without colliding. */
  paramPrefix?: string;
}

/**
 * Drives every list/table in the app (admin tables, customer dashboard
 * lists, public listing pages). Keeps page, pageSize, search, filters, and
 * sort in the URL so views are shareable/bookmarkable/back-button-safe,
 * and exposes a `selectedIds` set for bulk actions.
 */
export function useDataTable(options: UseDataTableOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const prefix = options.paramPrefix ? `${options.paramPrefix}_` : '';
  const k = useCallback((key: string) => `${prefix}${key}`, [prefix]);

  const page = Number(searchParams.get(k('page'))) || 1;
  const pageSize = Number(searchParams.get(k('pageSize'))) || options.defaultPageSize || 10;
  const search = searchParams.get(k('search')) || '';
  const sortBy = searchParams.get(k('sortBy')) || '';
  const sortOrder = (searchParams.get(k('sortOrder')) as 'asc' | 'desc') || 'desc';

  const reservedKeys = useMemo(
    () => new Set([k('page'), k('pageSize'), k('search'), k('sortBy'), k('sortOrder')]),
    [k]
  );

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!reservedKeys.has(key) && (!prefix || key.startsWith(prefix))) {
        result[prefix ? key.slice(prefix.length) : key] = value;
      }
    });
    return result;
  }, [searchParams, reservedKeys, prefix]);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        const paramKey = k(key);
        if (value === null || value === undefined || value === '' || value === 'all') {
          params.delete(paramKey);
        } else {
          params.set(paramKey, String(value));
        }
      }
      if (resetPage) params.set(k('page'), '1');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, k]
  );

  const setPage = useCallback((newPage: number) => updateParams({ page: newPage }, false), [updateParams]);
  const setPageSize = useCallback((size: number) => updateParams({ pageSize: size }), [updateParams]);
  const setSearch = useCallback((term: string) => updateParams({ search: term }), [updateParams]);
  const setFilter = useCallback((key: string, value: string | null) => updateParams({ [key]: value }), [updateParams]);
  const setSort = useCallback(
    (field: string) => {
      const nextOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
      updateParams({ sortBy: field, sortOrder: nextOrder }, false);
    },
    [sortBy, sortOrder, updateParams]
  );
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    Array.from(params.keys()).forEach((key) => {
      if (!prefix || key.startsWith(prefix)) params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, prefix]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    filters,
    isPending,
    selectedIds,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    setSort,
    clearFilters,
    toggleSelected,
    toggleSelectAll,
    clearSelection,
  };
}
