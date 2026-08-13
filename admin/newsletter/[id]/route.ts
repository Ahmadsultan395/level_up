import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';
import { requireAdmin } from '@/lib/session';

const updateSchema = z.object({ status: z.enum(['subscribed', 'unsubscribed']) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(params.id, parsed.data, { new: true });
    if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });

    return NextResponse.json(subscriber);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/newsletter/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(params.id);
    if (!subscriber) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    return NextResponse.json({ message: 'Subscriber removed' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/newsletter/[id] error:', err);
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 });
  }
}
