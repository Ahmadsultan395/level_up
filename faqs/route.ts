import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Faq, query, {
      baseFilter: { status: 'active' },
      filterFields: ['category'],
      searchFields: ['question', 'answer'],
      defaultSortBy: 'order',
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/faqs error:', err);
    return NextResponse.json({ error: 'Failed to load FAQs' }, { status: 500 });
  }
}
