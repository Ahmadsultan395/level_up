'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, Trash2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { ApproveRejectActions } from '@/components/shared/ApproveRejectActions';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { Button } from '@/components/ui/Button';
import { uploadFile } from '@/lib/upload-client';

interface GalleryRow {
  _id: string;
  title?: string;
  imageUrl: string;
  uploadedBy: 'admin' | 'customer';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive';
}

const MODERATION_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];
const SOURCE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Customer', value: 'customer' },
];

export function AdminGalleryGrid() {
  const table = useDataTable({ defaultPageSize: 12 });
  const { data, pagination, isLoading, error, refetch } = useListData<GalleryRow>({
    endpoint: '/api/admin/gallery',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'gallery');
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: result.url, imagePublicId: result.publicId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Photo added');
      refetch();
    } catch {
      toast.error('Could not upload photo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this photo?')) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete photo');
    toast.success('Photo deleted');
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search gallery..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Moderation"
          value={table.filters.moderationStatus || ''}
          onChange={(v) => table.setFilter('moderationStatus', v || null)}
          options={MODERATION_OPTIONS}
          allLabel="All"
        />
        <FilterSelect
          label="Source"
          value={table.filters.uploadedBy || ''}
          onChange={(v) => table.setFilter('uploadedBy', v || null)}
          options={SOURCE_OPTIONS}
          allLabel="All"
        />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button size="sm" isLoading={isUploading} onClick={() => fileInputRef.current?.click()}>
          {!isUploading && <Upload className="h-4 w-4" />} Upload Photo
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonTable rows={3} cols={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No photos yet" description="Upload one to get started." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((img) => (
              <div key={img._id} className="overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-square bg-bg-secondary">
                  <Image src={img.imageUrl} alt={img.title || 'Gallery photo'} fill className="object-cover" sizes="300px" />
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize text-text-muted">{img.uploadedBy}</span>
                    <button onClick={() => deleteOne(img._id)} aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-text-muted hover:text-status-danger" />
                    </button>
                  </div>
                  <ApproveRejectActions
                    id={img._id}
                    moderationStatus={img.moderationStatus}
                    endpoint={`/api/admin/gallery/${img._id}`}
                    onChanged={refetch}
                  />
                  {img.moderationStatus === 'approved' && (
                    <StatusToggle id={img._id} status={img.status} endpoint={`/api/admin/gallery/${img._id}`} onChanged={refetch} />
                  )}
                </div>
              </div>
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
          pageSizeOptions={[12, 24, 48]}
        />
      )}
    </div>
  );
}
