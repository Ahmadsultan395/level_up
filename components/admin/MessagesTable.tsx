'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface MessageRow {
  _id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Replied', value: 'replied' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Archived', value: 'archived' },
];

export function MessagesTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<MessageRow>({
    endpoint: '/api/admin/messages',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function deleteOne(id: string) {
    if (!confirm('Delete this message?')) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete message');
    toast.success('Deleted');
    refetch();
  }

  const columns: DataTableColumn<MessageRow>[] = [
    {
      key: 'name',
      header: 'From',
      sortable: true,
      render: (m) => (
        <Link href={`/admin/messages/${m._id}`} className="hover:text-gold">
          {m.name} <span className="text-text-muted">({m.email})</span>
        </Link>
      ),
    },
    { key: 'subject', header: 'Subject', className: 'max-w-xs truncate' },
    { key: 'createdAt', header: 'Date', sortable: true, render: (m) => formatDate(m.createdAt) },
    { key: 'status', header: 'Status', render: (m) => <Badge status={m.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <Button variant="ghost" size="sm" onClick={() => deleteOne(m._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
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
      emptyTitle="No messages yet"
      emptyDescription="Contact form submissions will appear here."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search messages..." className="min-w-[16rem] flex-1" />
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
