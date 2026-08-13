'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PaginatedResponse } from '@/types/common';

interface UseListDataArgs {
  endpoint: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string>;
}

/**
 * Fetches a paginated list from any `/api/...` route built with
 * `buildListResponse` (src/lib/list-query.ts). Pair with `useDataTable`
 * for full pagination + search + filter + sort wiring in ~3 lines per page:
 *
 *   const table = useDataTable();
 *   const { data, pagination, isLoading, error, refetch } = useListData({ endpoint: '/api/admin/barbers', ...table });
 *   <DataTable data={data} ... />
 */
export function useListData<T>({ endpoint, page, pageSize, search, sortBy, sortOrder, filters }: UseListDataArgs) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(sortBy ? { sortBy, sortOrder } : {}),
        ...filters,
      });

      try {
        const res = await fetch(`${endpoint}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load data');
        const body: PaginatedResponse<T> = await res.json();
        setData(body.data);
        setPagination(body.pagination);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not load this list. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [endpoint, page, pageSize, search, sortBy, sortOrder, JSON.stringify(filters), refetchIndex]);

  return { data, pagination, isLoading, error, refetch };
}
