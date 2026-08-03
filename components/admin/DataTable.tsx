"use client";

import { ReactNode, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { Pagination } from "@/components/common/EmptyState";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  search: string;
  onSearch: (v: string) => void;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  onEdit?: (row: T) => void;
  onDelete: (row: T) => void;
  emptyTitle?: string;
  rowKey: (row: T) => string;
}

export default function DataTable<T>({
  columns, rows, loading, search, onSearch, page, pages, onPageChange, onEdit, onDelete, emptyTitle = "No records found", rowKey
}: DataTableProps<T>) {
  const [confirmRow, setConfirmRow] = useState<T | null>(null);

  return (
    <div>
      <div className="mb-4 relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-full border border-dark-100 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-dark-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-dark-100 bg-dark-50/50 text-xs uppercase tracking-wide text-dark-300">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-5 py-3.5 font-semibold">{col.header}</th>
              ))}
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-dark-100 last:border-0">
                  <td colSpan={columns.length + 1} className="px-5 py-4"><Skeleton className="h-6 w-full" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-10">
                  <EmptyState title={emptyTitle} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-dark-100 last:border-0 hover:bg-dark-50/30">
                  {columns.map((col) => (
                    <td key={col.header} className="px-5 py-3.5">{col.render(row)}</td>
                  ))}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="rounded-lg p-2 text-dark-300 hover:bg-primary/10 hover:text-primary-700">
                          <Pencil size={15} />
                        </button>
                      )}
                      <button onClick={() => setConfirmRow(row)} className="rounded-lg p-2 text-dark-300 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={onPageChange} />

      {confirmRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="font-display text-lg font-bold text-dark">Delete this record?</h3>
            <p className="mt-1 text-sm text-dark-300">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfirmRow(null)}>Cancel</Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(confirmRow);
                  setConfirmRow(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
