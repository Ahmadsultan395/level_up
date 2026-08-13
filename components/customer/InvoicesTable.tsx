'use client';

import { Download } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { FilterSelect } from '@/components/shared/Filters';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  issuedAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Issued', value: 'issued' },
  { label: 'Paid', value: 'paid' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Void', value: 'void' },
];

export function InvoicesTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<InvoiceItem>({
    endpoint: '/api/invoices',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const columns: DataTableColumn<InvoiceItem>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true },
    { key: 'issuedAt', header: 'Date', sortable: true, render: (i) => formatDate(i.issuedAt) },
    { key: 'total', header: 'Total', sortable: true, render: (i) => formatCurrency(i.total) },
    { key: 'status', header: 'Status', render: (i) => <Badge status={i.status} /> },
    {
      key: 'download',
      header: '',
      render: (i) => (
        <a href={`/api/invoices/${i._id}/download`}>
          <Button variant="ghost" size="sm">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </a>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No invoices yet"
      emptyDescription="Invoices are generated automatically after a successful payment."
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
