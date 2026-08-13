'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface PackageRow {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  durationMinutes: number;
  featured: boolean;
  status: 'active' | 'inactive';
  services: { _id: string; name: string }[];
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function PackagesTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<PackageRow>({
    endpoint: '/api/admin/packages',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} package(s)?`)) return;
    const res = await fetch('/api/admin/packages/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(table.selectedIds), action }),
    });
    const body = await res.json();
    if (!res.ok) return toast.error(body.error || 'Bulk action failed');
    toast.success(body.message);
    table.clearSelection();
    refetch();
  }

  const columns: DataTableColumn<PackageRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (p) => (
        <Link href={`/admin/packages/${p._id}`} className="hover:text-gold">
          {p.name} {p.featured && <span className="ml-1 text-xs text-gold">★</span>}
        </Link>
      ),
    },
    { key: 'services', header: 'Services', render: (p) => `${p.services.length} included` },
    { key: 'durationMinutes', header: 'Duration', render: (p) => `${p.durationMinutes} min` },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (p) => (p.discountPrice ? `${formatCurrency(p.discountPrice)} (was ${formatCurrency(p.price)})` : formatCurrency(p.price)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusToggle id={p._id} status={p.status} endpoint={`/api/admin/packages/${p._id}`} onChanged={refetch} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No packages yet"
      emptyDescription="Bundle services into a package to get started."
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      pageSize={pagination.pageSize}
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      sortBy={table.sortBy}
      sortOrder={table.sortOrder}
      onSort={table.setSort}
      selectable
      selectedIds={table.selectedIds}
      onToggleSelect={table.toggleSelected}
      onToggleSelectAll={table.toggleSelectAll}
      bulkActions={
        <>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('activate')}>
            <CheckCircle className="h-3.5 w-3.5" /> Activate
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('deactivate')}>
            <XCircle className="h-3.5 w-3.5" /> Deactivate
          </Button>
          <Button size="sm" variant="danger" onClick={() => bulkAction('delete')}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </>
      }
      toolbar={
        <>
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search packages..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <Link href="/admin/packages/new" className="ml-auto">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Package
            </Button>
          </Link>
        </>
      }
    />
  );
}
