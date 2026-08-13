import type { Metadata } from 'next';
import { AdminInvoicesTable } from '@/components/admin/AdminInvoicesTable';

export const metadata: Metadata = { title: 'Invoices | Admin' };

export default function AdminInvoicesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Invoices</h1>
      <p className="mt-1 text-text-secondary">View, download, and void invoices.</p>
      <div className="mt-8">
        <AdminInvoicesTable />
      </div>
    </div>
  );
}
