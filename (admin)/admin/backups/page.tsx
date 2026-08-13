import type { Metadata } from 'next';
import { DatabaseBackup } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { BackupExportButton } from '@/components/admin/BackupExportButton';

export const metadata: Metadata = { title: 'Backups | Admin' };

export default function AdminBackupsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Backups</h1>
      <p className="mt-1 text-text-secondary">Download a full data export for safekeeping.</p>

      <Card className="mt-8">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <DatabaseBackup className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg text-text-primary">Manual Data Export</p>
              <p className="text-sm text-text-muted">Users, bookings, invoices, payments, reviews, and settings</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            This downloads a JSON snapshot of your core business data (customer accounts, barbers,
            services, appointments, invoices, payments, reviews, testimonials, coupons, and site
            settings — password hashes excluded). Store it somewhere secure.
          </p>
          <p className="text-sm text-text-muted">
            For fully automated, scheduled backups of your MongoDB database, use your database
            provider&apos;s built-in backup feature (e.g. MongoDB Atlas continuous backups) — that
            runs independently of this application and doesn&apos;t rely on someone remembering to
            click a button.
          </p>
          <BackupExportButton />
        </CardBody>
      </Card>
    </div>
  );
}
