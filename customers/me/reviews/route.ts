import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { requireUser } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Review, query, {
      baseFilter: { customer: user.id },
      filterFields: ['moderationStatus'],
      defaultSortBy: 'createdAt',
      populate: [{ path: 'barber', select: 'name slug' }],
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/customers/me/reviews error:', err);
    return NextResponse.json({ error: 'Failed to load your reviews' }, { status: 500 });
  }
}
