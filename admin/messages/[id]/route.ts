import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
import { requireAdmin } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const message = await ContactMessage.findById(params.id);
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    return NextResponse.json(message);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/messages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load message' }, { status: 500 });
  }
}

const updateSchema = z.object({ status: z.enum(['new', 'replied', 'resolved', 'archived']) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const message = await ContactMessage.findByIdAndUpdate(params.id, parsed.data, { new: true });
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

    return NextResponse.json(message);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/messages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const message = await ContactMessage.findByIdAndDelete(params.id);
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    return NextResponse.json({ message: 'Message deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/messages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
