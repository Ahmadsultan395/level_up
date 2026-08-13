import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['approve', 'reject', 'delete']),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const { ids, action } = parsed.data;

    if (action === 'delete') {
      await Testimonial.deleteMany({ _id: { $in: ids } });
    } else {
      await Testimonial.updateMany(
        { _id: { $in: ids } },
        { moderationStatus: action === 'approve' ? 'approved' : 'rejected', status: action === 'approve' ? 'active' : 'inactive' }
      );
    }

    return NextResponse.json({ message: `${ids.length} testimonial(s) updated` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/testimonials/bulk error:', err);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
