import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Invoice } from '@/models/Invoice';
import { requireAdmin } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';
import { logActivity } from '@/lib/activity-log';

const schema = z.object({
  amount: z.number().positive().optional(), // omit for full refund
  reason: z.string().max(300).optional(),
});

/**
 * Records a refund against a manually-paid Payment. Since there's no
 * payment gateway involved, the admin physically returns the cash or sends
 * the money back (bank transfer/EasyPaisa/JazzCash) themselves — this
 * endpoint just updates the finance records to reflect that, per the spec's
 * "refunds update finance reports automatically" rule.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const payment = await Payment.findById(params.id);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.status !== 'paid' && payment.status !== 'partially_refunded') {
      return NextResponse.json({ error: 'Only paid payments can be refunded' }, { status: 400 });
    }

    const refundAmount = parsed.data.amount ?? payment.amount - payment.refundedAmount;
    if (refundAmount <= 0 || refundAmount > payment.amount - payment.refundedAmount) {
      return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 });
    }

    payment.refundedAmount += refundAmount;
    payment.status = payment.refundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    await payment.save();

    if (payment.invoice) {
      await Invoice.findByIdAndUpdate(payment.invoice, {
        status: payment.status === 'refunded' ? 'refunded' : 'issued',
      });
    }

    await logActivity({
      userId: admin.id,
      action: 'refunded',
      entityType: 'Payment',
      entityId: params.id,
      description: `Recorded a refund of ${refundAmount} ${payment.currency}${parsed.data.reason ? ` — ${parsed.data.reason}` : ''}`,
    });

    await notifyUser({
      userId: payment.customer.toString(),
      type: 'payment_success',
      title: 'Refund recorded',
      message: `A refund of ${refundAmount} ${payment.currency} has been recorded for your payment. Please contact us if you have questions about receiving it.`,
    });

    return NextResponse.json(payment);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/payments/[id]/refund error:', err);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}

