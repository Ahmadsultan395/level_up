import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review } from '@/models/Review';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Review, query, {
      filterFields: ['moderationStatus', 'status', 'barber', 'rating'],
      searchFields: ['comment'],
      defaultSortBy: 'createdAt',
      populate: [
        { path: 'customer', select: 'name email' },
        { path: 'barber', select: 'name' },
      ],
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/reviews error:', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
