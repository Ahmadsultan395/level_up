'use client';

import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { label: 'Booking Confirmation', value: 'booking_confirmation' },
  { label: 'Booking Cancelled', value: 'booking_cancelled' },
  { label: 'Payment Success', value: 'payment_success' },
  { label: 'Appointment Reminder', value: 'appointment_reminder' },
  { label: 'Appointment Completed', value: 'appointment_completed' },
  { label: 'Review Received', value: 'review_received' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Announcement', value: 'admin_announcement' },
];

const READ_OPTIONS = [
  { label: 'Unread', value: 'false' },
  { label: 'Read', value: 'true' },
];

export function NotificationsList() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<NotificationItem>({
    endpoint: '/api/notifications',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    refetch();
  }

  async function markAllRead() {
    const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    if (res.ok) {
      toast.success('All caught up!');
      refetch();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Type"
            value={table.filters.type || ''}
            onChange={(v) => table.setFilter('type', v || null)}
            options={TYPE_OPTIONS}
            allLabel="All types"
          />
          <FilterSelect
            label="Status"
            value={table.filters.isRead || ''}
            onChange={(v) => table.setFilter('isRead', v || null)}
            options={READ_OPTIONS}
            allLabel="All"
          />
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <SkeletonTable rows={4} cols={1} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up." />
        ) : (
          data.map((n) => (
            <Card key={n._id} className={cn(!n.isRead && 'border-gold/40')}>
              <CardBody className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{n.title}</p>
                    <p className="mt-0.5 text-sm text-text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {!isLoading && !error && data.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      )}
    </div>
  );
}
