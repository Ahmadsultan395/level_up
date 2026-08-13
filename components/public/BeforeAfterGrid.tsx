'use client';

import { useEffect, useState } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import type { IBeforeAfter } from '@/models/BeforeAfter';

interface BarberOption {
  _id: string;
  name: string;
}

export function BeforeAfterGrid() {
  const table = useDataTable({ defaultPageSize: 8 });
  const { data, pagination, isLoading, error, refetch } = useListData<IBeforeAfter & { _id: string }>({
    endpoint: '/api/before-after',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [barbers, setBarbers] = useState<BarberOption[]>([]);

  useEffect(() => {
    fetch('/api/barbers?pageSize=100')
      .then((res) => res.json())
      .then((body) => setBarbers((body.data || []).map((b: { _id: string; name: string }) => ({ _id: b._id, name: b.name }))))
      .catch(() => setBarbers([]));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Barber"
          value={table.filters.barber || ''}
          onChange={(v) => table.setFilter('barber', v || null)}
          options={barbers.map((b) => ({ label: b.name, value: b._id }))}
          allLabel="All barbers"
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={2} cols={2} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No transformations found" description="Try a different search term or barber filter." />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {data.map((item) => (
              <BeforeAfterSlider
                key={item._id}
                beforeUrl={item.beforeImageUrl}
                afterUrl={item.afterImageUrl}
                title={item.title}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && data.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          pageSizeOptions={[8, 16, 32]}
        />
      )}
    </div>
  );
}
