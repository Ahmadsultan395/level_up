import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Package, query, {
      baseFilter: { status: 'active' },
      searchFields: ['name', 'description'],
      defaultSortBy: 'order',
      populate: 'services',
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/packages error:', err);
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
  }
}
