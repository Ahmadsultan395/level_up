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

interface TemplateRow {
  _id: string;
  name: string;
  key: string;
  subject: string;
  status: 'active' | 'inactive';
}

export function EmailTemplatesManager() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<TemplateRow>({
    endpoint: '/api/admin/email-templates',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  function openNew() {
    setEditingId(null);
    setName('');
    setKey('');
    setSubject('');
    setBody('');
    setShowForm(true);
  }

  async function openEdit(id: string) {
    setEditingId(id);
    setShowForm(true);
    setIsLoadingTemplate(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`);
      const template = await res.json();
      if (!res.ok) throw new Error();
      setName(template.name);
      setKey(template.key);
      setSubject(template.subject);
      setBody(template.body);
    } catch {
      toast.error('Could not load template');
      setShowForm(false);
    } finally {
      setIsLoadingTemplate(false);
    }
  }

  async function save() {
    if (!name || !subject || !body || (!editingId && !key)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/email-templates/${editingId}` : '/api/admin/email-templates', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { name, subject, body } : { name, key, subject, body }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Could not save template');
        return;
      }
      toast.success(editingId ? 'Template updated' : 'Template created');
      setShowForm(false);
      refetch();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this template?')) return;
    const res = await fetch(`/api/admin/email-templates/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  async function bulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} template(s)?`)) return;
    const res = await fetch('/api/admin/email-templates/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(table.selectedIds), action }),
    });
    const result = await res.json();
    if (!res.ok) return toast.error(result.error || 'Bulk action failed');
    toast.success(result.message);
    table.clearSelection();
    refetch();
  }

  const columns: DataTableColumn<TemplateRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'key', header: 'Key', render: (t) => <code className="text-xs text-text-muted">{t.key}</code> },
    { key: 'subject', header: 'Subject', className: 'max-w-xs truncate' },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusToggle id={t._id} status={t.status} endpoint={`/api/admin/email-templates/${t._id}`} onChanged={refetch} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(t._id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteOne(t._id)}>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="key_like_this"
                disabled={!!editingId}
              />
            </div>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={isLoadingTemplate ? 'Loading...' : 'Email body — use {{variableName}} for dynamic content'}
              disabled={isLoadingTemplate}
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} disabled={isLoadingTemplate} onClick={save}>
                Save Template
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
        emptyTitle="No email templates yet"
        emptyDescription="Create templates for booking confirmations, reminders, and more."
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
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search templates..." className="min-w-[16rem] flex-1" />
            <Button size="sm" onClick={openNew} className="ml-auto">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </>
        }
      />
    </div>
  );
}
