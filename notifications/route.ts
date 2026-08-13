import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { requireUser } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();
    const searchParamsObj = new URL(req.url).searchParams;
    const query = parseListQuery(searchParamsObj);

    const baseFilter: Record<string, unknown> = { user: user.id };
    const isReadParam = searchParamsObj.get('isRead');
    if (isReadParam === 'true' || isReadParam === 'false') {
      baseFilter.isRead = isReadParam === 'true';
    }

    const result = await buildListResponse(Notification, query, {
      baseFilter,
      filterFields: ['type'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/notifications error:', err);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}
