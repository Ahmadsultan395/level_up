import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { requireAdmin } from '@/lib/session';

const updateSchema = z.object({
  question: z.string().min(5).max(300).optional(),
  answer: z.string().min(5).max(1000).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const faq = await Faq.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

    return NextResponse.json(faq);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/faqs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const faq = await Faq.findByIdAndDelete(params.id);
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    return NextResponse.json({ message: 'FAQ deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/faqs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
