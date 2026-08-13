import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { confirmManualPayment } from '@/lib/manual-payment';
import { logActivity } from '@/lib/activity-log';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { payment, invoice } = await confirmManualPayment(params.id, admin.id);

    await logActivity({
      userId: admin.id,
      action: 'confirmed',
      entityType: 'Payment',
      entityId: params.id,
      description: `Confirmed ${payment.method.replace('_', ' ')} payment of ${payment.amount} PKR${invoice ? ` (Invoice ${invoice.invoiceNumber})` : ''}`,
    });

    return NextResponse.json({ payment, invoiceId: invoice?._id.toString() });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/payments/[id]/confirm error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Could not confirm payment' }, { status: 500 });
  }
}
