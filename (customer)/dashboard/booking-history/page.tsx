import type { Metadata } from 'next';
import { AppointmentsList } from '@/components/customer/AppointmentsList';

export const metadata: Metadata = { title: 'Booking History' };

export default function BookingHistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Booking History</h1>
      <p className="mt-1 text-text-secondary">Past appointments, completed or otherwise.</p>

      <div className="mt-8">
        <AppointmentsList
          statusFilter={['completed', 'cancelled', 'no_show']}
          emptyTitle="No past appointments yet"
          emptyDescription="Your appointment history will appear here after your first visit."
        />
      </div>
    </div>
  );
}
