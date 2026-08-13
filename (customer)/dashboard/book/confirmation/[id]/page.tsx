import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Download } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Booking Confirmed' };

interface Props {
  params: { id: string };
}

export default async function BookingConfirmationPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  await connectDB();
  const appointment = await Appointment.findOne({ _id: params.id, customer: user.id })
    .populate('barber', 'name')
    .populate('services', 'name')
    .populate('package', 'name')
    .lean();

  if (!appointment) notFound();

  const barber = appointment.barber as unknown as { name: string };
  const services = appointment.services as unknown as { name: string }[];
  const pkg = appointment.package as unknown as { name: string } | undefined;

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-successBg text-status-success">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-5 font-display text-3xl text-text-primary">
        {appointment.status === 'confirmed' ? 'Appointment Confirmed!' : 'Booking Received!'}
      </h1>
      <p className="mt-2 text-text-secondary">
        {appointment.status === 'confirmed'
          ? "Your payment was successful and your appointment is confirmed. We've emailed your invoice."
          : "We've sent a confirmation to your email. Complete payment to confirm your appointment."}
      </p>

      <Card className="mt-8 text-left">
        <CardBody className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Status</span>
            <Badge status={appointment.status} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Barber</span>
            <span className="text-text-primary">{barber.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{pkg ? 'Package' : 'Services'}</span>
            <span className="text-text-primary">{pkg ? pkg.name : services.map((s) => s.name).join(', ')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Date &amp; Time</span>
            <span className="text-text-primary">
              {formatDate(appointment.date)} at {appointment.startTime}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <span className="font-medium text-text-primary">Total</span>
            <span className="font-display text-gold">{formatCurrency(appointment.totalPrice)}</span>
          </div>
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {appointment.invoice && (
          <a href={`/api/invoices/${appointment.invoice.toString()}/download`}>
            <Button variant="secondary">
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
          </a>
        )}
        <Link href="/dashboard/appointments">
          <Button variant="secondary">View My Appointments</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
