import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { requireAdmin } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';
import { logActivity } from '@/lib/activity-log';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const payment = await Payment.findById(params.id);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending payments can be rejected' }, { status: 400 });
    }

    payment.status = 'failed';
    await payment.save();

    await logActivity({
      userId: admin.id,
      action: 'rejected',
      entityType: 'Payment',
      entityId: params.id,
      description: `Rejected a ${payment.method.replace('_', ' ')} payment of ${payment.amount} PKR`,
    });

    await notifyUser({
      userId: payment.customer.toString(),
      type: 'payment_success',
      title: 'Payment could not be verified',
      message: "We couldn't verify your payment submission. Please try again or contact us for help.",
    });

    return NextResponse.json(payment);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/payments/[id]/reject error:', err);
    return NextResponse.json({ error: 'Could not reject payment' }, { status: 500 });
  }
}
