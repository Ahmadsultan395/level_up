'use client';

import { useEffect, useState } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { BlogCard } from '@/components/shared/BlogCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  publishedAt?: string;
  views: number;
  category?: { name: string };
}

interface CategoryOption {
  _id: string;
  name: string;
}

export function BlogsGrid() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<BlogItem>({
    endpoint: '/api/blogs',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch('/api/categories?type=blog')
      .then((res) => res.json())
      .then((body) => setCategories(body.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search articles..." className="min-w-[16rem] flex-1" />
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
          <SkeletonTable rows={3} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No articles found" description="Try a different search term or category filter." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
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
          pageSizeOptions={[9, 18, 36]}
        />
      )}
    </div>
  );
}
