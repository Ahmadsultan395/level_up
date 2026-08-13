import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(ContactMessage, query, {
      filterFields: ['status'],
      searchFields: ['name', 'email', 'subject', 'message'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/messages error:', err);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
