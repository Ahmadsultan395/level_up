import type { Metadata } from 'next';
import { ActivityLogsTable } from '@/components/admin/ActivityLogsTable';

export const metadata: Metadata = { title: 'Activity Logs | Admin' };

export default function AdminActivityLogsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Activity Logs</h1>
      <p className="mt-1 text-text-secondary">Audit trail of admin actions.</p>
      <div className="mt-8">
        <ActivityLogsTable />
      </div>
    </div>
  );
}
