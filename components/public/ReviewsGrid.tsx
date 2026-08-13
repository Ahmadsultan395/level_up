'use client';

import { useEffect, useState } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';

interface ReviewItem {
  _id: string;
  rating: number;
  comment: string;
  images: { url: string; publicId: string }[];
  adminReply?: string;
  createdAt: string;
  customer: { name: string; avatarUrl?: string };
  barber?: { name: string; slug: string };
}

interface BarberOption {
  _id: string;
  name: string;
}

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((r) => ({ label: `${r} stars`, value: String(r) }));

export function ReviewsGrid() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<ReviewItem>({
    endpoint: '/api/reviews',
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
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search reviews..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Rating"
          value={table.filters.rating || ''}
          onChange={(v) => table.setFilter('rating', v || null)}
          options={RATING_OPTIONS}
          allLabel="All ratings"
        />
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
          <SkeletonTable rows={3} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No reviews found" description="Try a different search term or filter." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((review) => (
              <ReviewCard key={review._id} review={review} />
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
