import type { Metadata } from 'next';
import { PaymentsTable } from '@/components/customer/PaymentsTable';

export const metadata: Metadata = { title: 'Payments' };

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Payments</h1>
      <p className="mt-1 text-text-secondary">Your payment history.</p>

      <div className="mt-8">
        <PaymentsTable />
      </div>
    </div>
  );
}
