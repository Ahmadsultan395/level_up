'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, Trash2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface SubscriberRow {
  _id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: 'Subscribed', value: 'subscribed' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
];

export function NewsletterTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<SubscriberRow>({
    endpoint: '/api/admin/newsletter',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function sendNewsletter(toSelectedOnly: boolean) {
    if (!subject || !body) {
      toast.error('Subject and message are required');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          ids: toSelectedOnly ? Array.from(table.selectedIds) : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Could not send newsletter');
        return;
      }
      toast.success(result.message);
      setShowComposer(false);
      setSubject('');
      setBody('');
      table.clearSelection();
    } finally {
      setIsSending(false);
    }
  }

  async function removeOne(id: string) {
    if (!confirm('Remove this subscriber?')) return;
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not remove subscriber');
    toast.success('Removed');
    refetch();
  }

  const columns: DataTableColumn<SubscriberRow>[] = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status', render: (s) => <Badge status={s.status === 'subscribed' ? 'active' : 'inactive'} /> },
    { key: 'createdAt', header: 'Subscribed', sortable: true, render: (s) => formatDate(s.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <Button variant="ghost" size="sm" onClick={() => removeOne(s._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      {showComposer && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Message"
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" isLoading={isSending} onClick={() => sendNewsletter(false)}>
                <Send className="h-3.5 w-3.5" /> Send to All Subscribed
              </Button>
              {table.selectedIds.size > 0 && (
                <Button size="sm" variant="secondary" isLoading={isSending} onClick={() => sendNewsletter(true)}>
                  Send to Selected ({table.selectedIds.size})
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No subscribers yet"
        emptyDescription="Subscribers from the website footer will appear here."
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
          <Button size="sm" onClick={() => setShowComposer(true)}>
            <Send className="h-3.5 w-3.5" /> Email Selected
          </Button>
        }
        toolbar={
          <>
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search by email..." className="min-w-[16rem] flex-1" />
            <FilterSelect
              label="Status"
              value={table.filters.status || ''}
              onChange={(v) => table.setFilter('status', v || null)}
              options={STATUS_OPTIONS}
              allLabel="All"
            />
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowComposer(true)}>
              <Send className="h-4 w-4" /> Compose Newsletter
            </Button>
          </>
        }
      />
    </div>
  );
}
