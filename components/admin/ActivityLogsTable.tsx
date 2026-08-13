'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { formatDate } from '@/lib/utils';

interface LogRow {
  _id: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const ENTITY_OPTIONS = [
  { label: 'Barber', value: 'Barber' },
  { label: 'User', value: 'User' },
  { label: 'Coupon', value: 'Coupon' },
  { label: 'Review', value: 'Review' },
];

export function ActivityLogsTable() {
  const table = useDataTable({ defaultPageSize: 15 });
  const { data, pagination, isLoading, error, refetch } = useListData<LogRow>({
    endpoint: '/api/admin/activity-logs',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const columns: DataTableColumn<LogRow>[] = [
    { key: 'createdAt', header: 'When', sortable: true, render: (l) => formatDate(l.createdAt) },
    { key: 'user', header: 'Admin', render: (l) => l.user?.name || 'System' },
    { key: 'action', header: 'Action', render: (l) => <span className="capitalize">{l.action.replace('_', ' ')}</span> },
    { key: 'entityType', header: 'Entity' },
    { key: 'description', header: 'Description', className: 'max-w-md' },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No activity recorded yet"
      emptyDescription="Admin actions like creating barbers, changing roles, and moderating content will appear here."
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      pageSize={pagination.pageSize}
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      sortBy={table.sortBy}
      sortOrder={table.sortOrder}
      onSort={table.setSort}
      toolbar={
        <>
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search activity..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Entity"
            value={table.filters.entityType || ''}
            onChange={(v) => table.setFilter('entityType', v || null)}
            options={ENTITY_OPTIONS}
            allLabel="All"
          />
        </>
      }
    />
  );
}
