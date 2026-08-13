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

interface CategoryRow {
  _id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  order: number;
}

const TYPE_OPTIONS = [
  { label: 'Service', value: 'service' },
  { label: 'Blog', value: 'blog' },
  { label: 'Gallery', value: 'gallery' },
];
const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function CategoriesTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<CategoryRow>({
    endpoint: '/api/admin/categories',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} categorie(s)?`)) return;
    const res = await fetch('/api/admin/categories/bulk', {
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

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c) => (
        <Link href={`/admin/categories/${c._id}`} className="hover:text-gold">
          {c.name}
        </Link>
      ),
    },
    { key: 'type', header: 'Type', render: (c) => <span className="capitalize">{c.type}</span> },
    { key: 'order', header: 'Order', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusToggle id={c._id} status={c.status} endpoint={`/api/admin/categories/${c._id}`} onChanged={refetch} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No categories yet"
      emptyDescription="Add a category to organize services, blogs, or gallery items."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search categories..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Type"
            value={table.filters.type || ''}
            onChange={(v) => table.setFilter('type', v || null)}
            options={TYPE_OPTIONS}
            allLabel="All types"
          />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <Link href="/admin/categories/new" className="ml-auto">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </Link>
        </>
      }
    />
  );
}
