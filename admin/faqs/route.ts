import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Faq, query, {
      filterFields: ['status', 'category'],
      searchFields: ['question', 'answer'],
      defaultSortBy: 'order',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/faqs error:', err);
    return NextResponse.json({ error: 'Failed to load FAQs' }, { status: 500 });
  }
}

const createSchema = z.object({
  question: z.string().min(5, 'Question is required').max(300),
  answer: z.string().min(5, 'Answer is required').max(1000),
  category: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().default(0),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const faq = await Faq.create(parsed.data);
    return NextResponse.json(faq, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/faqs error:', err);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
