import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { getSiteSettings } from '@/models/SiteSettings';
import { ManualPaymentForm } from '@/components/customer/ManualPaymentForm';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Payment' };

interface Props {
  params: { id: string };
}

export default async function PaymentPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/dashboard/book/payment/${params.id}`);

  await connectDB();
  const appointment = await Appointment.findOne({ _id: params.id, customer: user.id })
    .populate('barber', 'name')
    .populate('services', 'name')
    .populate('package', 'name')
    .lean();

  if (!appointment) notFound();

  // Already paid — send them straight to the confirmation page instead of re-charging.
  if (appointment.status !== 'pending') {
    redirect(`/dashboard/book/confirmation/${appointment._id}`);
  }

  const settings = await getSiteSettings();
  const barber = appointment.barber as unknown as { name: string };
  const services = appointment.services as unknown as { name: string }[];
  const pkg = appointment.package as unknown as { name: string } | undefined;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Almost done</p>
      <h1 className="mt-2 font-display text-3xl text-text-primary">Complete Your Payment</h1>

      <div className="mt-6 rounded-lg border border-border p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-text-muted">{pkg ? 'Package' : 'Services'}</span>
          <span className="text-text-primary">{pkg ? pkg.name : services.map((s) => s.name).join(', ')}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-text-muted">Barber</span>
          <span className="text-text-primary">{barber.name}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-text-muted">Date &amp; Time</span>
          <span className="text-text-primary">
            {formatDate(appointment.date)} at {appointment.startTime}
          </span>
        </div>
        <div className="flex justify-between py-1 font-medium">
          <span className="text-text-primary">Subtotal</span>
          <span className="text-gold">{formatCurrency(appointment.totalPrice)}</span>
        </div>
      </div>

      <div className="mt-8">
        <ManualPaymentForm
          appointmentId={appointment._id.toString()}
          methods={{
            bankAccountTitle: settings.bankAccountTitle,
            bankAccountNumber: settings.bankAccountNumber,
            bankName: settings.bankName,
            easypaisaNumber: settings.easypaisaNumber,
            jazzcashNumber: settings.jazzcashNumber,
            paymentInstructions: settings.paymentInstructions,
          }}
        />
      </div>
    </div>
  );
}
