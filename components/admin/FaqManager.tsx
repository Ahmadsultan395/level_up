'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

interface FaqRow {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  status: 'active' | 'inactive';
  order: number;
}

export function FaqManager() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<FaqRow>({
    endpoint: '/api/admin/faqs',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setCategory('');
    setOrder(0);
    setShowForm(true);
  }

  function openEdit(faq: FaqRow) {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || '');
    setOrder(faq.order);
    setShowForm(true);
  }

  async function save() {
    setIsSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/faqs/${editingId}` : '/api/admin/faqs', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category: category || undefined, order }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'FAQ updated' : 'FAQ added');
      setShowForm(false);
      refetch();
    } catch {
      toast.error('Could not save FAQ');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} FAQ(s)?`)) return;
    const res = await fetch('/api/admin/faqs/bulk', {
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

  const columns: DataTableColumn<FaqRow>[] = [
    { key: 'question', header: 'Question', sortable: true, className: 'max-w-sm' },
    { key: 'category', header: 'Category', render: (f) => f.category || '—' },
    { key: 'order', header: 'Order', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (f) => <StatusToggle id={f._id} status={f.status} endpoint={`/api/admin/faqs/${f._id}`} onChanged={refetch} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (f) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteOne(f._id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {showForm && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Answer"
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" />
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} placeholder="Display order" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} onClick={save}>
                Save
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
        emptyTitle="No FAQs yet"
        emptyDescription="Add your first frequently asked question."
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
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search FAQs..." className="min-w-[16rem] flex-1" />
            <Button size="sm" onClick={openNew} className="ml-auto">
              <Plus className="h-4 w-4" /> Add FAQ
            </Button>
          </>
        }
      />
    </div>
  );
}
