import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { AppointmentDetailPanel } from '@/components/admin/AppointmentDetailPanel';

export const metadata: Metadata = { title: 'Appointment | Admin' };

export default async function AdminAppointmentDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const appointment = await Appointment.findById(params.id)
    .populate('customer', 'name email phone')
    .populate('barber', 'name')
    .populate('services', 'name price')
    .populate('package', 'name price')
    .lean();

  if (!appointment) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin/appointments" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Appointments
      </Link>

      <div className="mt-6">
        <AppointmentDetailPanel
          appointment={{
            _id: appointment._id.toString(),
            date: appointment.date.toISOString(),
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            totalPrice: appointment.totalPrice,
            notes: appointment.notes,
            cancelReason: appointment.cancelReason,
            customer: appointment.customer as unknown as { name: string; email: string; phone?: string },
            barber: appointment.barber as unknown as { name: string },
            services: appointment.services as unknown as { name: string; price: number }[],
            package: appointment.package as unknown as { name: string; price: number } | undefined,
            invoice: appointment.invoice?.toString(),
          }}
        />
      </div>
    </div>
  );
}
