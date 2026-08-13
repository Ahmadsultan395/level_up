'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { DateRangeFilter } from '@/components/shared/Filters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseRow {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

export function ExpensesManager() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<ExpenseRow>({
    endpoint: '/api/admin/expenses',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: { ...table.filters, dateField: 'date' },
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!title || !category || amount <= 0) {
      toast.error('Please fill in title, category, and a valid amount');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, amount, date, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success('Expense added');
      setTitle('');
      setCategory('');
      setAmount(0);
      setNotes('');
      setShowForm(false);
      refetch();
    } catch {
      toast.error('Could not add expense');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this expense?')) return;
    const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${table.selectedIds.size} expense(s)?`)) return;
    const res = await fetch('/api/admin/expenses/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(table.selectedIds), action: 'delete' }),
    });
    const body = await res.json();
    if (!res.ok) return toast.error(body.error || 'Bulk delete failed');
    toast.success(body.message);
    table.clearSelection();
    refetch();
  }

  const totalOnPage = data.reduce((sum, e) => sum + e.amount, 0);

  const columns: DataTableColumn<ExpenseRow>[] = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'date', header: 'Date', sortable: true, render: (e) => formatDate(e.date) },
    { key: 'amount', header: 'Amount', sortable: true, render: (e) => formatCurrency(e.amount) },
    {
      key: 'actions',
      header: 'Actions',
      render: (e) => (
        <Button variant="ghost" size="sm" onClick={() => deleteOne(e._id)}>
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
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Supplies)" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />
            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} onClick={save}>
                Save Expense
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {data.length > 0 && (
        <p className="mb-3 text-sm text-text-muted">
          Total this page: <span className="text-text-primary">{formatCurrency(totalOnPage)}</span>
        </p>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No expenses recorded"
        emptyDescription="Track your business costs here."
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
          <Button size="sm" variant="danger" onClick={bulkDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        }
        toolbar={
          <>
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search expenses..." className="min-w-[14rem]" />
            <DateRangeFilter
              from={table.filters.dateFrom || ''}
              to={table.filters.dateTo || ''}
              onChange={(from, to) => {
                table.setFilter('dateFrom', from || null);
                table.setFilter('dateTo', to || null);
              }}
            />
            <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </>
        }
      />
    </div>
  );
}
