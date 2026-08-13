import type { Metadata } from 'next';
import { ExpensesManager } from '@/components/admin/ExpensesManager';

export const metadata: Metadata = { title: 'Expenses | Admin' };

export default function AdminExpensesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Expenses</h1>
      <p className="mt-1 text-text-secondary">Track business costs for accurate profit reporting.</p>
      <div className="mt-8">
        <ExpensesManager />
      </div>
    </div>
  );
}
