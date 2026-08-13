'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Trash2, Check, X } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { ApproveRejectActions } from '@/components/shared/ApproveRejectActions';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface ReviewRow {
  _id: string;
  rating: number;
  comment: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive';
  createdAt: string;
  customer: { name: string };
  barber?: { name: string };
}

const MODERATION_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export function ReviewsModerationTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<ReviewRow>({
    endpoint: '/api/admin/reviews',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function bulkAction(action: 'approve' | 'reject' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} review(s)?`)) return;
    const res = await fetch('/api/admin/reviews/bulk', {
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

  async function deleteOne(id: string) {
    if (!confirm('Delete this review?')) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete review');
    toast.success('Review deleted');
    refetch();
  }

  const columns: DataTableColumn<ReviewRow>[] = [
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'barber', header: 'Barber', render: (r) => r.barber?.name || '—' },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-0.5 text-gold">
          {r.rating} <Star className="h-3.5 w-3.5 fill-current" />
        </span>
      ),
    },
    { key: 'comment', header: 'Comment', className: 'max-w-xs truncate' },
    { key: 'createdAt', header: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) },
    {
      key: 'moderation',
      header: 'Moderation',
      render: (r) => (
        <ApproveRejectActions
          id={r._id}
          moderationStatus={r.moderationStatus}
          endpoint={`/api/admin/reviews/${r._id}`}
          onChanged={refetch}
        />
      ),
    },
    {
      key: 'status',
      header: 'Visible',
      render: (r) =>
        r.moderationStatus === 'approved' ? (
          <StatusToggle id={r._id} status={r.status} endpoint={`/api/admin/reviews/${r._id}`} onChanged={refetch} />
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => deleteOne(r._id)}>
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
      emptyTitle="No reviews yet"
      emptyDescription="Customer reviews will appear here for moderation."
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
          <Button size="sm" variant="secondary" onClick={() => bulkAction('approve')}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('reject')}>
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
          <Button size="sm" variant="danger" onClick={() => bulkAction('delete')}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </>
      }
      toolbar={
        <>
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search reviews..." className="min-w-[16rem] flex-1" />
          <FilterSelect
            label="Moderation"
            value={table.filters.moderationStatus || ''}
            onChange={(v) => table.setFilter('moderationStatus', v || null)}
            options={MODERATION_OPTIONS}
            allLabel="All"
          />
        </>
      }
    />
  );
}
