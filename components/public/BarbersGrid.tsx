'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { BarberCard } from '@/components/shared/BarberCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import type { IBarber } from '@/models/Barber';

export function BarbersGrid() {
  const table = useDataTable({ defaultPageSize: 8 });
  const { data, pagination, isLoading, error, refetch } = useListData<IBarber & { _id: string }>({
    endpoint: '/api/barbers',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  return (
    <div>
      <SearchInput
        value={table.search}
        onChange={table.setSearch}
        placeholder="Search barbers by name or specialty..."
        className="max-w-md"
      />

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={2} cols={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No barbers found" description="Try a different search term." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((barber) => (
              <BarberCard key={barber._id} barber={barber} />
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
