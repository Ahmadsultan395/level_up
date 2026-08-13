import type { Metadata } from 'next';
import { MessagesTable } from '@/components/admin/MessagesTable';

export const metadata: Metadata = { title: 'Messages | Admin' };

export default function AdminMessagesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Contact Messages</h1>
      <p className="mt-1 text-text-secondary">View and reply to messages from the contact form.</p>
      <div className="mt-8">
        <MessagesTable />
      </div>
    </div>
  );
}
