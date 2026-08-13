import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { Appointment } from '@/models/Appointment';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { requireUser } from '@/lib/session';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Review, query, {
      baseFilter: { status: 'active', moderationStatus: 'approved' },
      filterFields: ['barber', 'rating'],
      searchFields: ['comment'],
      defaultSortBy: 'createdAt',
      populate: [
        { path: 'customer', select: 'name avatarUrl' },
        { path: 'barber', select: 'name slug' },
      ],
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

const submitReviewSchema = z.object({
  appointmentId: z.string().min(1).optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Please write at least 5 characters').max(1000),
  images: z.array(z.object({ url: z.string().url(), publicId: z.string() })).max(5).optional(),
});

/** If tied to an appointment, it must be the customer's own completed one, reviewed once. Otherwise a general review is allowed. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = submitReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();

    let barberId: string | undefined;

    if (parsed.data.appointmentId) {
      const appointment = await Appointment.findOne({ _id: parsed.data.appointmentId, customer: user.id });
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      if (appointment.status !== 'completed') {
        return NextResponse.json({ error: 'You can only review a completed appointment.' }, { status: 400 });
      }
      const existing = await Review.findOne({ appointment: appointment._id });
      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this appointment.' }, { status: 409 });
      }
      barberId = appointment.barber.toString();
    }

    const review = await Review.create({
      customer: user.id,
      barber: barberId,
      appointment: parsed.data.appointmentId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      images: parsed.data.images || [],
      moderationStatus: 'pending',
      status: 'inactive',
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
