'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { Lightbox } from '@/components/shared/Lightbox';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import type { IGalleryImage } from '@/models/GalleryImage';

interface CategoryOption {
  _id: string;
  name: string;
}

export function GalleryGrid() {
  const table = useDataTable({ defaultPageSize: 12 });
  const { data, pagination, isLoading, error, refetch } = useListData<IGalleryImage & { _id: string }>({
    endpoint: '/api/gallery',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/categories?type=gallery')
      .then((res) => res.json())
      .then((body) => setCategories(body.data || []))
      .catch(() => setCategories([]));
  }, []);

  const lightboxImages = data.map((img) => ({ url: img.imageUrl, title: img.title }));

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search gallery..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Category"
          value={table.filters.category || ''}
          onChange={(v) => table.setFilter('category', v || null)}
          options={categories.map((c) => ({ label: c.name, value: c._id }))}
          allLabel="All categories"
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={3} cols={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No photos found" description="Try a different search term or category filter." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((img, i) => (
              <button
                key={img._id}
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-square overflow-hidden rounded-md bg-bg-secondary"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title || 'Gallery photo'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
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

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
