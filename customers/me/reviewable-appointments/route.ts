import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Review } from '@/models/Review';
import { requireUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const completed = await Appointment.find({ customer: user.id, status: 'completed' })
      .populate('barber', 'name slug imageUrl')
      .sort({ date: -1 })
      .lean();

    const reviewed = await Review.find({ customer: user.id }).select('appointment').lean();
    const reviewedIds = new Set(reviewed.map((r) => r.appointment?.toString()));

    const reviewable = completed.filter((a) => !reviewedIds.has(a._id.toString()));

    return NextResponse.json({ data: reviewable });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/customers/me/reviewable-appointments error:', err);
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 });
  }
}
