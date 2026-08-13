import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Service, query, {
      baseFilter: { status: 'active' },
      filterFields: ['category'],
      searchFields: ['name', 'description'],
      defaultSortBy: 'order',
      populate: 'category',
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/services error:', err);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}
