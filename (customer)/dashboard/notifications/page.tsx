import type { Metadata } from 'next';
import { NotificationsList } from '@/components/customer/NotificationsList';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Notifications</h1>
      <p className="mt-1 text-text-secondary">Updates about your bookings and account.</p>

      <div className="mt-8">
        <NotificationsList />
      </div>
    </div>
  );
}
