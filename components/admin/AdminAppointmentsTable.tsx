'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect, DateRangeFilter } from '@/components/shared/Filters';
import { AppointmentStatusSelect } from '@/components/admin/AppointmentStatusSelect';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AppointmentRow {
  _id: string;
  date: string;
  startTime: string;
  status: string;
  totalPrice: number;
  customer: { name: string; email: string };
  barber: { name: string };
  services: { name: string }[];
  package?: { name: string };
}

interface BarberOption {
  _id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
];

export function AdminAppointmentsTable() {
  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<AppointmentRow>({
    endpoint: '/api/appointments',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: { ...table.filters, dateField: 'date' },
  });

  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  useEffect(() => {
    fetch('/api/admin/barbers?pageSize=100')
      .then((res) => res.json())
      .then((body) => setBarbers((body.data || []).map((b: { _id: string; name: string }) => ({ _id: b._id, name: b.name }))))
      .catch(() => setBarbers([]));
  }, []);

  const columns: DataTableColumn<AppointmentRow>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      sortable: true,
      render: (a) => (
        <Link href={`/admin/appointments/${a._id}`} className="hover:text-gold">
          {formatDate(a.date)} at {a.startTime}
        </Link>
      ),
    },
    { key: 'customer', header: 'Customer', render: (a) => a.customer?.name || '—' },
    { key: 'barber', header: 'Barber', render: (a) => a.barber?.name || '—' },
    {
      key: 'service',
      header: 'Service / Package',
      render: (a) => (a.package ? a.package.name : a.services.map((s) => s.name).join(', ')),
    },
    { key: 'totalPrice', header: 'Price', sortable: true, render: (a) => formatCurrency(a.totalPrice) },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <AppointmentStatusSelect id={a._id} status={a.status} onChanged={refetch} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No appointments found"
      emptyDescription="Try a different search term or filter."
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      pageSize={pagination.pageSize}
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      sortBy={table.sortBy}
      sortOrder={table.sortOrder}
      onSort={table.setSort}
      toolbar={
        <>
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search notes..." className="min-w-[14rem]" />
          <FilterSelect
            label="Status"
            value={table.filters.status || ''}
            onChange={(v) => table.setFilter('status', v || null)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <FilterSelect
            label="Barber"
            value={table.filters.barber || ''}
            onChange={(v) => table.setFilter('barber', v || null)}
            options={barbers.map((b) => ({ label: b.name, value: b._id }))}
            allLabel="All barbers"
          />
          <DateRangeFilter
            from={table.filters.dateFrom || ''}
            to={table.filters.dateTo || ''}
            onChange={(from, to) => {
              table.setFilter('dateFrom', from || null);
              table.setFilter('dateTo', to || null);
            }}
          />
        </>
      }
    />
  );
}
