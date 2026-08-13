'use client';

import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/Button';

interface BarberRow {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  experienceYears: number;
  ratingAvg: number;
  ratingCount: number;
  services: { _id: string; name: string }[];
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function BarbersTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<BarberRow>({
    endpoint: '/api/admin/barbers',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} barber(s)? This cannot be undone.`)) return;

    const res = await fetch('/api/admin/barbers/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(table.selectedIds), action }),
    });
    const body = await res.json();

    if (!res.ok) {
      toast.error(body.error || 'Bulk action failed');
      return;
    }

    toast.success(body.message);
    table.clearSelection();
    refetch();
  }

  const columns: DataTableColumn<BarberRow>[] = [
    {
      key: 'name',
      header: 'Barber',
      sortable: true,
      render: (b) => (
        <Link href={`/admin/barbers/${b._id}`} className="flex items-center gap-3 hover:text-gold">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
            {b.imageUrl && <Image src={b.imageUrl} alt={b.name} fill className="object-cover" />}
          </div>
          <span>{b.name}</span>
        </Link>
      ),
    },
    {
      key: 'services',
      header: 'Services',
      render: (b) => <span className="text-text-muted">{b.services.length}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (b) => (b.ratingCount > 0 ? `${b.ratingAvg.toFixed(1)} (${b.ratingCount})` : '—'),
    },
    { key: 'experienceYears', header: 'Experience', sortable: true, render: (b) => `${b.experienceYears} yrs` },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <StatusToggle id={b._id} status={b.status} endpoint={`/api/admin/barbers/${b._id}`} onChanged={refetch} />
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
      emptyTitle="No barbers yet"
      emptyDescription="Add your first barber to get started."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search barbers..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <Link href="/admin/barbers/new" className="ml-auto">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Barber
            </Button>
          </Link>
        </>
      }
    />
  );
}
