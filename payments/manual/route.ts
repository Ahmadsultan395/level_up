import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Payment } from '@/models/Payment';
import { requireUser } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/models/SiteSettings';

const schema = z.object({
  appointmentId: z.string().min(1),
  method: z.enum(['cash', 'bank_transfer', 'easypaisa', 'jazzcash']),
  referenceNumber: z.string().max(100).optional(),
  screenshotUrl: z.string().url().optional(),
  screenshotPublicId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const appointment = await Appointment.findOne({ _id: parsed.data.appointmentId, customer: user.id });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (appointment.status !== 'pending') {
      return NextResponse.json({ error: 'This appointment is not awaiting payment.' }, { status: 400 });
    }

    if (parsed.data.method !== 'cash' && !parsed.data.referenceNumber && !parsed.data.screenshotUrl) {
      return NextResponse.json(
        { error: 'Please enter a transaction reference or upload a payment screenshot.' },
        { status: 400 }
      );
    }

    // Reuse an existing pending payment for this appointment if one exists, else create one.
    const payment = await Payment.findOneAndUpdate(
      { appointment: appointment._id, status: 'pending' },
      {
        customer: user.id,
        appointment: appointment._id,
        amount: appointment.totalPrice,
        currency: 'PKR',
        method: parsed.data.method,
        referenceNumber: parsed.data.referenceNumber,
        screenshotUrl: parsed.data.screenshotUrl,
        screenshotPublicId: parsed.data.screenshotPublicId,
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    await notifyUser({
      userId: user.id,
      type: 'payment_success',
      title: 'Payment submitted — awaiting confirmation',
      message:
        parsed.data.method === 'cash'
          ? "We've noted that you'll pay in person. Your appointment stays pending until our team confirms."
          : `We've received your ${parsed.data.method.replace('_', ' ')} reference (${parsed.data.referenceNumber}). We'll confirm it shortly and update your appointment.`,
      sendEmailToo: false,
    });

    // Notify the shop's admin inbox so a human can verify the transfer/cash.
    const [settings, admin] = await Promise.all([getSiteSettings(), User.findOne({ role: { $in: ['admin', 'superadmin'] } }).select('email')]);
    if (admin?.email) {
      await sendEmail({
        to: admin.email,
        subject: `Payment to confirm — ${parsed.data.method.replace('_', ' ')}`,
        html: `<p>A customer submitted a ${parsed.data.method.replace('_', ' ')} payment for appointment ${appointment._id}.</p>
               <p>Amount: ${appointment.totalPrice} PKR</p>
               ${parsed.data.referenceNumber ? `<p>Reference: ${parsed.data.referenceNumber}</p>` : ''}
               ${parsed.data.screenshotUrl ? `<p>Screenshot attached — review it in the Admin Panel.</p>` : ''}
               <p>Please verify and confirm it from the Admin Panel → Payments.</p>`,
      });
    }
    void settings;

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/payments/manual error:', err);
    return NextResponse.json({ error: 'Could not submit payment' }, { status: 500 });
  }
}
