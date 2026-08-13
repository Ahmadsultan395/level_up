import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { BeforeAfter } from '@/models/BeforeAfter';
import { requireAdmin } from '@/lib/session';
import { deleteImage } from '@/lib/cloudinary';

const updateSchema = z.object({
  title: z.string().max(150).optional(),
  barber: z.string().optional(),
  service: z.string().optional(),
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
    const item = await BeforeAfter.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!item) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    return NextResponse.json(item);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/before-after/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const item = await BeforeAfter.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    try {
      await deleteImage(item.beforeImagePublicId);
      await deleteImage(item.afterImagePublicId);
    } catch (cloudErr) {
      console.warn('Cloudinary cleanup failed (non-fatal):', cloudErr);
    }

    return NextResponse.json({ message: 'Entry deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/before-after/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
