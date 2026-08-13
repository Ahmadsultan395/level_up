import type { Metadata } from 'next';
import { AdminAppointmentsTable } from '@/components/admin/AdminAppointmentsTable';

export const metadata: Metadata = { title: 'Appointments | Admin' };

export default function AdminAppointmentsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Appointments</h1>
      <p className="mt-1 text-text-secondary">View and manage every booking.</p>
      <div className="mt-8">
        <AdminAppointmentsTable />
      </div>
    </div>
  );
}
