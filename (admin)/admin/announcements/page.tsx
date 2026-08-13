import type { Metadata } from 'next';
import { AnnouncementComposer } from '@/components/admin/AnnouncementComposer';

export const metadata: Metadata = { title: 'Announcements | Admin' };

export default function AdminAnnouncementsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Announcements</h1>
      <p className="mt-1 text-text-secondary">Broadcast a message to every active customer.</p>
      <div className="mt-8">
        <AnnouncementComposer />
      </div>
    </div>
  );
}
