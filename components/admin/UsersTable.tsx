'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin';
  status: 'active' | 'inactive';
  createdAt: string;
}

const ROLE_OPTIONS = [
  { label: 'Customer', value: 'customer' },
  { label: 'Admin', value: 'admin' },
  { label: 'Superadmin', value: 'superadmin' },
];

export function UsersTable() {
  const { data: session } = useSession();
  const isSuperadmin = session?.user.role === 'superadmin';

  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<UserRow>({
    endpoint: '/api/admin/users',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
  const [isSaving, setIsSaving] = useState(false);

  async function createAdmin() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not create account');
        return;
      }
      toast.success('Admin account created');
      setName('');
      setEmail('');
      setPassword('');
      setShowForm(false);
      refetch();
    } finally {
      setIsSaving(false);
    }
  }

  async function changeRole(id: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error || 'Could not change role');
      return;
    }
    toast.success('Role updated');
    refetch();
  }

  const columns: DataTableColumn<UserRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u) =>
        isSuperadmin && u._id !== session?.user.id ? (
          <Select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} className="h-8 w-32 text-xs">
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        ) : (
          <Badge tone="neutral" className="capitalize">
            {u.role}
          </Badge>
        ),
    },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (u) => formatDate(u.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (u) =>
        u._id === session?.user.id ? (
          <span className="text-xs text-text-muted">You</span>
        ) : (
          <StatusToggle id={u._id} status={u.status} endpoint={`/api/admin/users/${u._id}`} onChanged={refetch} />
        ),
    },
  ];

  return (
    <div>
      {isSuperadmin && showForm && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Temporary password" />
              <Select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} onClick={createAdmin}>
                Create Account
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No users found"
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
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search users..." className="min-w-[16rem] flex-1" />
            <FilterSelect
              label="Role"
              value={table.filters.role || ''}
              onChange={(v) => table.setFilter('role', v || null)}
              options={ROLE_OPTIONS}
              allLabel="All roles"
            />
            {isSuperadmin && (
              <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto">
                <Plus className="h-4 w-4" /> Add Admin
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
