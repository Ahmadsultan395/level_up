import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { requireAdmin } from '@/lib/session';

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  roleOrTitle: z.string().max(100).optional(),
  message: z.string().min(10).max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  rejectReason: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  featured: z.boolean().optional(),
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
    const testimonial = await Testimonial.findById(params.id);
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

    Object.assign(testimonial, parsed.data);
    if (parsed.data.moderationStatus) {
      testimonial.status = parsed.data.moderationStatus === 'approved' ? 'active' : 'inactive';
    }
    await testimonial.save();

    return NextResponse.json(testimonial);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/testimonials/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const testimonial = await Testimonial.findByIdAndDelete(params.id);
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    return NextResponse.json({ message: 'Testimonial deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/testimonials/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
