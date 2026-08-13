import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingWizard } from '@/components/customer/BookingWizard';
import { SkeletonTable } from '@/components/shared/States';

export const metadata: Metadata = { title: 'Book an Appointment' };

export default function BookPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">New appointment</p>
      <h1 className="mt-2 font-display text-3xl text-text-primary">Book an Appointment</h1>

      <div className="mt-10">
        <Suspense fallback={<SkeletonTable rows={3} cols={1} />}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
