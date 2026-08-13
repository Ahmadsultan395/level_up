'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Trash2, Check, X, Plus, Star, Camera, Loader2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { ApproveRejectActions } from '@/components/shared/ApproveRejectActions';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';

interface TestimonialRow {
  _id: string;
  name: string;
  message: string;
  photoUrl?: string;
  source: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive';
  featured: boolean;
}

const MODERATION_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export function TestimonialsModerationTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<TestimonialRow>({
    endpoint: '/api/admin/testimonials',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const result = await uploadFile(file, 'testimonials');
      setPhoto({ url: result.url, publicId: result.publicId });
    } catch {
      toast.error('Could not upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function addTestimonial() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, photoUrl: photo?.url, photoPublicId: photo?.publicId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Testimonial added');
      setName('');
      setMessage('');
      setPhoto(null);
      setShowAddForm(false);
      refetch();
    } catch {
      toast.error('Could not add testimonial');
    } finally {
      setIsSaving(false);
    }
  }

  async function bulkAction(action: 'approve' | 'reject' | 'delete') {
    if (action === 'delete' && !confirm(`Delete ${table.selectedIds.size} testimonial(s)?`)) return;
    const res = await fetch('/api/admin/testimonials/bulk', {
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

  async function toggleFeatured(id: string, featured: boolean) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !featured }),
    });
    refetch();
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  const columns: DataTableColumn<TestimonialRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
            {t.photoUrl ? (
              <Image src={t.photoUrl} alt={t.name} fill className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-text-muted">{t.name[0]?.toUpperCase()}</span>
            )}
          </div>
          {t.name}
        </div>
      ),
    },
    { key: 'message', header: 'Message', className: 'max-w-xs truncate' },
    { key: 'source', header: 'Source', render: (t) => <span className="capitalize">{t.source.replace('_', ' ')}</span> },
    {
      key: 'featured',
      header: 'Featured',
      render: (t) => (
        <button onClick={() => toggleFeatured(t._id, t.featured)} aria-label="Toggle featured">
          <Star className={`h-4 w-4 ${t.featured ? 'fill-gold text-gold' : 'text-border'}`} />
        </button>
      ),
    },
    {
      key: 'moderation',
      header: 'Moderation',
      render: (t) => (
        <ApproveRejectActions id={t._id} moderationStatus={t.moderationStatus} endpoint={`/api/admin/testimonials/${t._id}`} onChanged={refetch} />
      ),
    },
    {
      key: 'status',
      header: 'Visible',
      render: (t) =>
        t.moderationStatus === 'approved' ? (
          <StatusToggle id={t._id} status={t.status} endpoint={`/api/admin/testimonials/${t._id}`} onChanged={refetch} />
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <Button variant="ghost" size="sm" onClick={() => deleteOne(t._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      {showAddForm && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-bg-secondary">
                {photo && <Image src={photo.url} alt="" fill className="object-cover" />}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
                >
                  {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin text-text-primary" /> : <Camera className="h-4 w-4 text-text-primary" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <p className="text-xs text-text-muted">Optional customer photo</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Testimonial message"
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
            <Button size="sm" isLoading={isSaving} onClick={addTestimonial}>
              Save Testimonial
            </Button>
          </CardBody>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No testimonials yet"
        emptyDescription="Add one manually, or wait for customer submissions."
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
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search testimonials..." className="min-w-[16rem] flex-1" />
            <FilterSelect
              label="Moderation"
              value={table.filters.moderationStatus || ''}
              onChange={(v) => table.setFilter('moderationStatus', v || null)}
              options={MODERATION_OPTIONS}
              allLabel="All"
            />
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowAddForm((v) => !v)}>
              <Plus className="h-4 w-4" /> Add Testimonial
            </Button>
          </>
        }
      />
    </div>
  );
}
