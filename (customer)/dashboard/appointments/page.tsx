import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import { AppointmentsList } from '@/components/customer/AppointmentsList';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Appointments' };

export default function AppointmentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-text-primary">Appointments</h1>
          <p className="mt-1 text-text-secondary">Your upcoming and active bookings.</p>
        </div>
        <Link href="/dashboard/book">
          <Button size="sm">
            <CalendarPlus className="h-4 w-4" /> New Booking
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <AppointmentsList
          statusFilter={['pending', 'confirmed', 'in_progress']}
          emptyTitle="No active appointments"
          emptyDescription="Book your next visit whenever you're ready."
        />
      </div>
    </div>
  );
}
