'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect, DateRangeFilter } from '@/components/shared/Filters';
import { Lightbox } from '@/components/shared/Lightbox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentRow {
  _id: string;
  amount: number;
  currency: string;
  method: string;
  referenceNumber?: string;
  screenshotUrl?: string;
  status: string;
  refundedAmount: number;
  createdAt: string;
  customer?: { name: string; email: string };
}

const STATUS_OPTIONS = [
  { label: 'Pending Confirmation', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Partially Refunded', value: 'partially_refunded' },
];
const METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'EasyPaisa', value: 'easypaisa' },
  { label: 'JazzCash', value: 'jazzcash' },
];

export function AdminPaymentsTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<PaymentRow>({
    endpoint: '/api/payments',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: { ...table.filters, dateField: 'createdAt' },
  });

  const [busyId, setBusyId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  async function confirmPayment(id: string) {
    if (!confirm('Confirm that this payment (cash/transfer) has actually been received?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/confirm`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not confirm payment');
        return;
      }
      toast.success('Payment confirmed — invoice generated, appointment confirmed');
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function rejectPayment(id: string) {
    if (!confirm('Reject this payment? The customer will be notified to try again.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not reject payment');
        return;
      }
      toast.success('Payment rejected');
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function refund(id: string) {
    if (!confirm('Record a full refund for this payment? (You still need to physically return the money.)')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/refund`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Refund failed');
        return;
      }
      toast.success('Refund recorded');
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  const columns: DataTableColumn<PaymentRow>[] = [
    { key: 'createdAt', header: 'Date', sortable: true, render: (p) => formatDate(p.createdAt) },
    { key: 'customer', header: 'Customer', render: (p) => p.customer?.name || '—' },
    { key: 'method', header: 'Method', render: (p) => <span className="capitalize">{p.method.replace('_', ' ')}</span> },
    { key: 'referenceNumber', header: 'Reference', render: (p) => p.referenceNumber || '—' },
    {
      key: 'screenshotUrl',
      header: 'Proof',
      render: (p) =>
        p.screenshotUrl ? (
          <button type="button" onClick={() => setLightboxUrl(p.screenshotUrl!)} className="block">
            <Image
              src={p.screenshotUrl}
              alt="Payment proof"
              width={40}
              height={40}
              className="rounded object-cover hover:ring-2 hover:ring-gold"
            />
          </button>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    { key: 'amount', header: 'Amount', sortable: true, render: (p) => formatCurrency(p.amount, p.currency) },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex gap-1">
          {p.status === 'pending' && (
            <>
              <Button variant="secondary" size="sm" isLoading={busyId === p._id} onClick={() => confirmPayment(p._id)}>
                <CheckCircle className="h-3.5 w-3.5" /> Confirm
              </Button>
              <Button variant="danger" size="sm" isLoading={busyId === p._id} onClick={() => rejectPayment(p._id)}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          {(p.status === 'paid' || p.status === 'partially_refunded') && (
            <Button variant="ghost" size="sm" isLoading={busyId === p._id} onClick={() => refund(p._id)}>
              <RotateCcw className="h-3.5 w-3.5" /> Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No payments yet"
      emptyDescription="Payments customers submit (cash / bank transfer / EasyPaisa / JazzCash) will appear here for confirmation."
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
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search..." className="min-w-[14rem]" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <FilterSelect
            label="Method"
            value={table.filters.method || ''}
            onChange={(v) => table.setFilter('method', v || null)}
            options={METHOD_OPTIONS}
            allLabel="All methods"
          />
          <DateRangeFilter
            from={table.filters.dateFrom || ''}
            to={table.filters.dateTo || ''}
            onChange={(from, to) => {
              table.setFilter('dateFrom', from || null);
              table.setFilter('dateTo', to || null);
            }}
          />
        </>
      }
      />

      {lightboxUrl && (
        <Lightbox
          images={[{ url: lightboxUrl, title: 'Payment proof' }]}
          index={0}
          onClose={() => setLightboxUrl(null)}
          onNavigate={() => {}}
        />
      )}
    </>
  );
}
