import type { Metadata } from 'next';
import { EmailTemplatesManager } from '@/components/admin/EmailTemplatesManager';

export const metadata: Metadata = { title: 'Email Templates | Admin' };

export default function AdminEmailTemplatesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Email Templates</h1>
      <p className="mt-1 text-text-secondary">Edit transactional email content.</p>
      <div className="mt-8">
        <EmailTemplatesManager />
      </div>
    </div>
  );
}
