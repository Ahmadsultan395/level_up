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
import { formatDate } from '@/lib/utils';

interface BlogRow {
  _id: string;
  title: string;
  status: 'active' | 'inactive';
  publishedAt?: string;
  views: number;
  category?: { name: string };
  author?: { name: string };
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function BlogsTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<BlogRow>({
    endpoint: '/api/admin/blogs',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} post(s)?`)) return;
    const res = await fetch('/api/admin/blogs/bulk', {
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

  const columns: DataTableColumn<BlogRow>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (b) => (
        <Link href={`/admin/blogs/${b._id}`} className="hover:text-gold">
          {b.title}
        </Link>
      ),
    },
    { key: 'category', header: 'Category', render: (b) => b.category?.name || '—' },
    { key: 'author', header: 'Author', render: (b) => b.author?.name || '—' },
    { key: 'publishedAt', header: 'Published', sortable: true, render: (b) => (b.publishedAt ? formatDate(b.publishedAt) : 'Draft') },
    { key: 'views', header: 'Views', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <StatusToggle id={b._id} status={b.status} endpoint={`/api/admin/blogs/${b._id}`} onChanged={refetch} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No blog posts yet"
      emptyDescription="Write your first article."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search posts..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <Link href="/admin/blogs/new" className="ml-auto">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </Link>
        </>
      }
    />
  );
}
