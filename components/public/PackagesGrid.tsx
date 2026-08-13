'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { PackageCard } from '@/components/shared/PackageCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import type { IPackage } from '@/models/Package';
import type { IService } from '@/models/Service';

type PackageWithServices = IPackage & { _id: string; services: (IService & { _id: string })[] };

export function PackagesGrid() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<PackageWithServices>({
    endpoint: '/api/packages',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  return (
    <div>
      <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search packages..." className="max-w-md" />

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={3} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No packages found" description="Try a different search term." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
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
          pageSizeOptions={[9, 18, 36]}
        />
      )}
    </div>
  );
}
