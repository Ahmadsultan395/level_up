'use client';

import toast from 'react-hot-toast';
import { Download, Ban } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  issuedAt: string;
  customer?: { name: string };
}

const STATUS_OPTIONS = [
  { label: 'Issued', value: 'issued' },
  { label: 'Paid', value: 'paid' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Void', value: 'void' },
];

export function AdminInvoicesTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<InvoiceRow>({
    endpoint: '/api/invoices',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function voidInvoice(id: string) {
    if (!confirm('Void this invoice? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'void' }),
    });
    if (!res.ok) return toast.error('Could not void invoice');
    toast.success('Invoice voided');
    refetch();
  }

  const columns: DataTableColumn<InvoiceRow>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true },
    { key: 'customer', header: 'Customer', render: (i) => i.customer?.name || '—' },
    { key: 'issuedAt', header: 'Date', sortable: true, render: (i) => formatDate(i.issuedAt) },
    { key: 'total', header: 'Total', sortable: true, render: (i) => formatCurrency(i.total) },
    { key: 'status', header: 'Status', render: (i) => <Badge status={i.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (i) => (
        <div className="flex gap-1">
          <a href={`/api/invoices/${i._id}/download`}>
            <Button variant="ghost" size="sm">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </a>
          {i.status !== 'void' && (
            <Button variant="ghost" size="sm" onClick={() => voidInvoice(i._id)}>
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
      emptyDescription="Invoices are generated after a successful payment."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search invoice #..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
        </>
      }
    />
  );
}
