'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

/**
 * Standard pagination control used by every list/table in the app. Shows
 * item count, page-size selector, and windowed page numbers so it stays
 * readable even with hundreds of pages.
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pageNumbers = getPageWindow(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">
        {totalItems === 0 ? 'No results' : `Showing ${from}–${to} of ${totalItems}`}
      </p>

      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-bg-primary px-2 py-1 text-sm text-text-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((n, i) =>
            n === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-text-muted">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n as number)}
                aria-current={page === n ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-8 rounded-md px-2 text-sm transition-colors',
                  page === n
                    ? 'bg-gold text-text-inverse'
                    : 'text-text-secondary hover:bg-bg-elevated'
                )}
              >
                {n}
              </button>
            )
          )}

          <Button
            variant="ghost"
            size="sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
