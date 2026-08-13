import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { Barber } from '@/models/Barber';
import { requireAdmin } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';
import { logActivity } from '@/lib/activity-log';

const updateSchema = z.object({
  moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  rejectReason: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  adminReply: z.string().max(1000).optional(),
});

/** Recomputes a barber's average rating from their approved+active reviews. */
async function recomputeBarberRating(barberId: string) {
  const stats = await Review.aggregate([
    { $match: { barber: barberId, moderationStatus: 'approved', status: 'active' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Barber.findByIdAndUpdate(barberId, {
    ratingAvg: stats[0]?.avg || 0,
    ratingCount: stats[0]?.count || 0,
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    if (parsed.data.moderationStatus) {
      review.moderationStatus = parsed.data.moderationStatus;
      // Approving makes it live by default; rejecting/pending keeps it hidden.
      review.status = parsed.data.moderationStatus === 'approved' ? 'active' : 'inactive';
      if (parsed.data.rejectReason) review.rejectReason = parsed.data.rejectReason;
    }
    if (parsed.data.status) review.status = parsed.data.status;
    if (parsed.data.adminReply !== undefined) review.adminReply = parsed.data.adminReply;

    await review.save();

    if (review.barber) await recomputeBarberRating(review.barber.toString());

    if (parsed.data.moderationStatus === 'approved' || parsed.data.moderationStatus === 'rejected') {
      await logActivity({
        userId: admin.id,
        action: parsed.data.moderationStatus,
        entityType: 'Review',
        entityId: review._id.toString(),
        description: `${parsed.data.moderationStatus === 'approved' ? 'Approved' : 'Rejected'} a review`,
      });
      await notifyUser({
        userId: review.customer.toString(),
        type: 'review_received',
        title: parsed.data.moderationStatus === 'approved' ? 'Your review was approved' : 'Your review was not approved',
        message:
          parsed.data.moderationStatus === 'approved'
            ? 'Thanks for your feedback — your review is now live.'
            : 'Your recent review submission was not approved for publication.',
      });
    }

    return NextResponse.json(review);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/reviews/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const review = await Review.findByIdAndDelete(params.id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    if (review.barber) await recomputeBarberRating(review.barber.toString());
    return NextResponse.json({ message: 'Review deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/reviews/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
