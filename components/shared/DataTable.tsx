'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { _id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;

  // Selection / bulk actions
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (ids: string[]) => void;
  bulkActions?: ReactNode;

  // Pagination
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Optional toolbar (search + filters), rendered above the table
  toolbar?: ReactNode;
}

/**
 * The single reusable table used across the whole app — admin lists,
 * customer dashboard lists, and any public listing rendered as a table.
 * Every list in the spec (Barbers, Customers, Appointments, Services,
 * Reviews, Invoices, Messages, etc.) should render through this component
 * so pagination/search/filter/sort/bulk-action behavior is identical
 * everywhere.
 */
export function DataTable<T extends { _id: string }>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Once records are added, they will show up here.',
  sortBy,
  sortOrder,
  onSort,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  bulkActions,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  toolbar,
}: DataTableProps<T>) {
  const allIds = data.map((row) => row._id);
  const allSelected = selectable && allIds.length > 0 && allIds.every((id) => selectedIds?.has(id));
  const someSelected = selectable && (selectedIds?.size ?? 0) > 0;

  return (
    <div className="w-full">
      {toolbar && (
        <div className="mb-4 flex flex-wrap items-end gap-3">{toolbar}</div>
      )}

      {someSelected && bulkActions && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-gold/40 bg-gold/10 px-4 py-2">
          <span className="text-sm text-text-primary">{selectedIds?.size} selected</span>
          <div className="flex gap-2">{bulkActions}</div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={() => onToggleSelectAll?.(allIds)}
                    aria-label="Select all rows"
                    className="h-4 w-4 accent-[var(--color-gold)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 font-medium text-text-secondary', col.className)}>
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      {col.header}
                      {sortBy === col.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-4">
                  <SkeletonTable rows={pageSize > 8 ? 8 : pageSize} cols={columns.length} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-4">
                  <ErrorState onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-4">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row._id} className="transition-colors hover:bg-bg-elevated/60">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selectedIds?.has(row._id)}
                        onChange={() => onToggleSelect?.(row._id)}
                        aria-label="Select row"
                        className="h-4 w-4 accent-[var(--color-gold)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-text-primary', col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
