import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Invoice } from '@/models/Invoice';
import { requireAdmin } from '@/lib/session';

const schema = z.object({ status: z.enum(['issued', 'paid', 'refunded', 'void']) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const invoice = await Invoice.findByIdAndUpdate(params.id, parsed.data, { new: true });
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    return NextResponse.json(invoice);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/invoices/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
