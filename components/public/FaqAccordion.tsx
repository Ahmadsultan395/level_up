'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { cn } from '@/lib/utils';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
}

export function FaqAccordion() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<FaqItem>({
    endpoint: '/api/faqs',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/faqs?pageSize=100')
      .then((res) => res.json())
      .then((body) => {
        const cats = Array.from(
          new Set((body.data || []).map((f: FaqItem) => f.category).filter(Boolean))
        ) as string[];
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search FAQs..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Category"
          value={table.filters.category || ''}
          onChange={(v) => table.setFilter('category', v || null)}
          options={categories.map((c) => ({ label: c, value: c }))}
          allLabel="All categories"
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={5} cols={1} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No FAQs found" description="Try a different search term or category filter." />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {data.map((faq) => {
              const isOpen = openId === faq._id;
              return (
                <div key={faq._id}>
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq._id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-text-primary">{faq.question}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  {isOpen && <div className="px-5 pb-4 text-sm text-text-secondary">{faq.answer}</div>}
                </div>
              );
            })}
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
