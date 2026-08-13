'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { FilterSelect } from '@/components/shared/Filters';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentItem {
  _id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Partially Refunded', value: 'partially_refunded' },
];

export function PaymentsTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<PaymentItem>({
    endpoint: '/api/payments',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const columns: DataTableColumn<PaymentItem>[] = [
    { key: 'createdAt', header: 'Date', sortable: true, render: (p) => formatDate(p.createdAt) },
    { key: 'method', header: 'Method', render: (p) => <span className="capitalize">{p.method}</span> },
    { key: 'amount', header: 'Amount', sortable: true, render: (p) => formatCurrency(p.amount, p.currency) },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No payments yet"
      emptyDescription="Payments you make will appear here."
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
        <FilterSelect
          label="Status"
          value={table.filters.status || ''}
          onChange={(v) => table.setFilter('status', v || null)}
          options={STATUS_OPTIONS}
          allLabel="All statuses"
        />
      }
    />
  );
}
