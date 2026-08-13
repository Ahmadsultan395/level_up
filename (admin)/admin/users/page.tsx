import type { Metadata } from 'next';
import { UsersTable } from '@/components/admin/UsersTable';

export const metadata: Metadata = { title: 'Users & Roles | Admin' };

export default function AdminUsersPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Users &amp; Roles</h1>
      <p className="mt-1 text-text-secondary">
        Manage customer accounts and admin access. Only superadmins can create admins or change roles.
      </p>
      <div className="mt-8">
        <UsersTable />
      </div>
    </div>
  );
}
