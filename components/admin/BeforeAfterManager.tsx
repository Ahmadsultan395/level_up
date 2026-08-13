'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';

interface Row {
  _id: string;
  title?: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  status: 'active' | 'inactive';
  barber?: { name: string };
}

interface BarberOption {
  _id: string;
  name: string;
}

export function BeforeAfterManager() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<Row>({
    endpoint: '/api/admin/before-after',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  useEffect(() => {
    fetch('/api/admin/barbers?pageSize=100')
      .then((res) => res.json())
      .then((body) => setBarbers((body.data || []).map((b: { _id: string; name: string }) => ({ _id: b._id, name: b.name }))))
      .catch(() => setBarbers([]));
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [barberId, setBarberId] = useState('');
  const [beforeImg, setBeforeImg] = useState<{ url: string; publicId: string } | null>(null);
  const [afterImg, setAfterImg] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File, which: 'before' | 'after') {
    const setLoading = which === 'before' ? setIsUploadingBefore : setIsUploadingAfter;
    const setImg = which === 'before' ? setBeforeImg : setAfterImg;
    setLoading(true);
    try {
      const result = await uploadFile(file, 'beforeAfter');
      setImg({ url: result.url, publicId: result.publicId });
    } catch {
      toast.error('Could not upload image');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!beforeImg || !afterImg) {
      toast.error('Upload both before and after photos');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/before-after', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          barber: barberId || undefined,
          beforeImageUrl: beforeImg.url,
          beforeImagePublicId: beforeImg.publicId,
          afterImageUrl: afterImg.url,
          afterImagePublicId: afterImg.publicId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Added');
      setTitle('');
      setBarberId('');
      setBeforeImg(null);
      setAfterImg(null);
      setShowForm(false);
      refetch();
    } catch {
      toast.error('Could not save');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this before/after entry?')) return;
    const res = await fetch(`/api/admin/before-after/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete');
    toast.success('Deleted');
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Barber"
          value={table.filters.barber || ''}
          onChange={(v) => table.setFilter('barber', v || null)}
          options={barbers.map((b) => ({ label: b.name, value: b._id }))}
          allLabel="All barbers"
        />
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm text-text-secondary">Before Photo</p>
                {beforeImg ? (
                  <div className="relative aspect-square w-32 overflow-hidden rounded-md bg-bg-secondary">
                    <Image src={beforeImg.url} alt="Before" fill className="object-cover" />
                    <button onClick={() => setBeforeImg(null)} className="absolute right-1 top-1 rounded-full bg-bg-overlay p-1">
                      <X className="h-3 w-3 text-text-primary" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => beforeInputRef.current?.click()}
                    className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-gold"
                  >
                    {isUploadingBefore ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  </button>
                )}
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'before')}
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm text-text-secondary">After Photo</p>
                {afterImg ? (
                  <div className="relative aspect-square w-32 overflow-hidden rounded-md bg-bg-secondary">
                    <Image src={afterImg.url} alt="After" fill className="object-cover" />
                    <button onClick={() => setAfterImg(null)} className="absolute right-1 top-1 rounded-full bg-bg-overlay p-1">
                      <X className="h-3 w-3 text-text-primary" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => afterInputRef.current?.click()}
                    className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-gold"
                  >
                    {isUploadingAfter ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  </button>
                )}
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'after')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
              <Select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                <option value="">No barber assigned</option>
                {barbers.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            <Button size="sm" isLoading={isSaving} onClick={save}>
              Save Entry
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="mt-6">
        {isLoading ? (
          <SkeletonTable rows={2} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No entries yet" description="Add your first before/after transformation." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <Card key={item._id}>
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative aspect-square bg-bg-secondary">
                    <Image src={item.beforeImageUrl} alt="Before" fill className="object-cover" sizes="200px" />
                  </div>
                  <div className="relative aspect-square bg-bg-secondary">
                    <Image src={item.afterImageUrl} alt="After" fill className="object-cover" sizes="200px" />
                  </div>
                </div>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-primary">{item.title || 'Untitled'}</p>
                    {item.barber && <p className="text-xs text-text-muted">{item.barber.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusToggle id={item._id} status={item.status} endpoint={`/api/admin/before-after/${item._id}`} onChanged={refetch} />
                    <button onClick={() => deleteOne(item._id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-text-muted hover:text-status-danger" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
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
