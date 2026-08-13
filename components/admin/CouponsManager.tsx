'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface CouponRow {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  status: 'active' | 'inactive';
}

export function CouponsManager() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<CouponRow>({
    endpoint: '/api/admin/coupons',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minSpend, setMinSpend] = useState(0);
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!code || value <= 0) {
      toast.error('Enter a code and a valid value');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value,
          minSpend,
          usageLimit: usageLimit || undefined,
          perUserLimit,
          expiresAt: expiresAt || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not create coupon');
        return;
      }
      toast.success('Coupon created');
      setCode('');
      setValue(10);
      setMinSpend(0);
      setUsageLimit('');
      setExpiresAt('');
      setShowForm(false);
      refetch();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this coupon?')) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} coupon(s)?`)) return;
    const res = await fetch('/api/admin/coupons/bulk', {
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

  const columns: DataTableColumn<CouponRow>[] = [
    { key: 'code', header: 'Code', sortable: true, render: (c) => <code className="font-mono text-sm">{c.code}</code> },
    { key: 'discount', header: 'Discount', render: (c) => (c.type === 'percentage' ? `${c.value}%` : `$${c.value}`) },
    { key: 'usage', header: 'Usage', render: (c) => `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ''}` },
    { key: 'expiresAt', header: 'Expires', render: (c) => (c.expiresAt ? formatDate(c.expiresAt) : 'Never') },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusToggle id={c._id} status={c.status} endpoint={`/api/admin/coupons/${c._id}`} onChanged={refetch} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <Button variant="ghost" size="sm" onClick={() => deleteOne(c._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      {showForm && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE20" />
              <Select value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} placeholder="Value" />
              <Input type="number" min={0} value={minSpend} onChange={(e) => setMinSpend(Number(e.target.value))} placeholder="Min spend" />
              <Input type="number" min={1} value={perUserLimit} onChange={(e) => setPerUserLimit(Number(e.target.value))} placeholder="Per-customer limit" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                placeholder="Total usage limit (optional)"
              />
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} onClick={save}>
                Create Coupon
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
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
        emptyTitle="No coupons yet"
        emptyDescription="Create discount codes for your customers."
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
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search coupon codes..." className="min-w-[16rem] flex-1" />
            <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto">
              <Plus className="h-4 w-4" /> New Coupon
            </Button>
          </>
        }
      />
    </div>
  );
}
