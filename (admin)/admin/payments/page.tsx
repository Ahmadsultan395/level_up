import type { Metadata } from 'next';
import { AdminPaymentsTable } from '@/components/admin/AdminPaymentsTable';

export const metadata: Metadata = { title: 'Payments | Admin' };

export default function AdminPaymentsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Payments</h1>
      <p className="mt-1 text-text-secondary">View all payments and issue refunds.</p>
      <div className="mt-8">
        <AdminPaymentsTable />
      </div>
    </div>
  );
}
