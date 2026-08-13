import type { Metadata } from 'next';
import { FaqManager } from '@/components/admin/FaqManager';

export const metadata: Metadata = { title: 'FAQs | Admin' };

export default function AdminFaqsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">FAQs</h1>
      <p className="mt-1 text-text-secondary">Manage frequently asked questions.</p>
      <div className="mt-8">
        <FaqManager />
      </div>
    </div>
  );
}
