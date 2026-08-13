import type { Metadata } from 'next';
import { NewsletterTable } from '@/components/admin/NewsletterTable';

export const metadata: Metadata = { title: 'Newsletter | Admin' };

export default function AdminNewsletterPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Newsletter</h1>
      <p className="mt-1 text-text-secondary">Manage subscribers and send bulk emails.</p>
      <div className="mt-8">
        <NewsletterTable />
      </div>
    </div>
  );
}
