import type { Metadata } from 'next';
import { BarbersTable } from '@/components/admin/BarbersTable';

export const metadata: Metadata = { title: 'Barbers | Admin' };

export default function AdminBarbersPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Barbers</h1>
      <p className="mt-1 text-text-secondary">Manage your team, schedules, and availability.</p>

      <div className="mt-8">
        <BarbersTable />
      </div>
    </div>
  );
}
