'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { uploadFile } from '@/lib/upload-client';

interface MyGalleryItem {
  _id: string;
  title?: string;
  imageUrl: string;
  moderationStatus: string;
  createdAt: string;
}

export function MyGallery() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<MyGalleryItem>({
    endpoint: '/api/customers/me/gallery',
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
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: result.url, imagePublicId: result.publicId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Photo submitted for review!');
      refetch();
    } catch {
      toast.error('Could not upload photo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Share your look</p>
            <p className="text-sm text-text-muted">Photos are reviewed before appearing in our public gallery.</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <Button isLoading={isUploading} onClick={() => fileInputRef.current?.click()}>
              {!isUploading && <Upload className="h-4 w-4" />} Upload Photo
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={3} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No photos yet" description="Upload your first photo above." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {data.map((img) => (
              <div key={img._id} className="relative aspect-square overflow-hidden rounded-lg bg-bg-secondary">
                <Image src={img.imageUrl} alt={img.title || 'Your photo'} fill className="object-cover" />
                <div className="absolute bottom-2 left-2">
                  <Badge status={img.moderationStatus} />
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
        />
      )}
    </div>
  );
}
