import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { Barber } from '@/models/Barber';
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

    const affected = await Review.find({ _id: { $in: ids } }).select('barber');
    const barberIds = Array.from(new Set(affected.map((r) => r.barber?.toString()).filter(Boolean)));

    if (action === 'delete') {
      await Review.deleteMany({ _id: { $in: ids } });
    } else {
      await Review.updateMany(
        { _id: { $in: ids } },
        { moderationStatus: action === 'approve' ? 'approved' : 'rejected', status: action === 'approve' ? 'active' : 'inactive' }
      );
    }

    for (const barberId of barberIds) {
      if (!barberId) continue;
      const stats = await Review.aggregate([
        { $match: { barber: barberId, moderationStatus: 'approved', status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await Barber.findByIdAndUpdate(barberId, { ratingAvg: stats[0]?.avg || 0, ratingCount: stats[0]?.count || 0 });
    }

    return NextResponse.json({ message: `${ids.length} review(s) updated` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/reviews/bulk error:', err);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
