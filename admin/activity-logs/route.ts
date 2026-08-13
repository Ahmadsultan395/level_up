import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ActivityLog } from '@/models/ActivityLog';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(ActivityLog, query, {
      filterFields: ['action', 'entityType', 'user'],
      searchFields: ['description'],
      defaultSortBy: 'createdAt',
      populate: [{ path: 'user', select: 'name email' }],
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/activity-logs error:', err);
    return NextResponse.json({ error: 'Failed to load activity logs' }, { status: 500 });
  }
}
