import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(NewsletterSubscriber, query, {
      filterFields: ['status'],
      searchFields: ['email'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/newsletter error:', err);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}
