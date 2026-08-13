import type { Metadata } from 'next';
import { InvoicesTable } from '@/components/customer/InvoicesTable';

export const metadata: Metadata = { title: 'Invoices' };

export default function InvoicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Invoices</h1>
      <p className="mt-1 text-text-secondary">Download invoices for your past payments.</p>

      <div className="mt-8">
        <InvoicesTable />
      </div>
    </div>
  );
}
