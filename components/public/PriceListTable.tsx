'use client';

import { useEffect, useState } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { formatCurrency } from '@/lib/utils';

interface PriceListItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  durationMinutes: number;
}

interface CategoryOption {
  _id: string;
  name: string;
}

interface PriceListTableProps {
  endpoint: string;
  /** Namespaces this table's URL params so two PriceListTables can live on one page */
  paramPrefix: string;
  categoryType?: 'service';
}

export function PriceListTable({ endpoint, paramPrefix, categoryType }: PriceListTableProps) {
  const table = useDataTable({ defaultPageSize: 10, paramPrefix });
  const { data, pagination, isLoading, error, refetch } = useListData<PriceListItem>({
    endpoint,
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    if (!categoryType) return;
    fetch(`/api/categories?type=${categoryType}`)
      .then((res) => res.json())
      .then((body) => setCategories(body.data || []))
      .catch(() => setCategories([]));
  }, [categoryType]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search..." className="min-w-[14rem] flex-1" />
        {categoryType && (
          <FilterSelect
            label="Category"
            value={table.filters.category || ''}
            onChange={(v) => table.setFilter('category', v || null)}
            options={categories.map((c) => ({ label: c.name, value: c._id }))}
            allLabel="All categories"
          />
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={3} />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState onRetry={refetch} />
          </div>
        ) : data.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nothing found" description="Try a different search term or filter." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Duration</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3">
                    <p className="text-text-primary">{item.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{item.description}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{item.durationMinutes} min</td>
                  <td className="px-4 py-3 text-right font-display text-gold">
                    {item.discountPrice ? (
                      <>
                        <span className="mr-1.5 text-xs text-text-muted line-through">
                          {formatCurrency(item.price)}
                        </span>
                        {formatCurrency(item.discountPrice)}
                      </>
                    ) : (
                      formatCurrency(item.price)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
