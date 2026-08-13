'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { AppointmentCard, type AppointmentItem } from '@/components/customer/AppointmentCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
];

interface AppointmentsListProps {
  statusFilter?: string[]; // when provided, base filter restricts to these statuses (e.g. history = completed/cancelled)
  emptyTitle: string;
  emptyDescription: string;
}

export function AppointmentsList({ statusFilter, emptyTitle, emptyDescription }: AppointmentsListProps) {
  const table = useDataTable({ defaultPageSize: 8 });
  const { data, pagination, isLoading, error, refetch } = useListData<AppointmentItem>({
    endpoint: '/api/appointments',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: {
      ...table.filters,
      ...(statusFilter ? { statusIn: statusFilter.join(',') } : {}),
    },
  });

  const visibleOptions = statusFilter ? STATUS_OPTIONS.filter((o) => statusFilter.includes(o.value)) : STATUS_OPTIONS;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search appointments..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Status"
          value={table.filters.status || ''}
          onChange={(v) => table.setFilter('status', v || null)}
          options={visibleOptions}
          allLabel="All statuses"
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <SkeletonTable rows={3} cols={1} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          data.map((appt) => <AppointmentCard key={appt._id} appointment={appt} onCancelled={refetch} />)
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
        />
      )}
    </div>
  );
}
