import type { Metadata } from 'next';
import { ReportsView } from '@/components/admin/ReportsView';

export const metadata: Metadata = { title: 'Reports | Admin' };

export default function AdminReportsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Reports</h1>
      <p className="mt-1 text-text-secondary">Revenue, appointments, and growth at a glance.</p>
      <div className="mt-8">
        <ReportsView />
      </div>
    </div>
  );
}
