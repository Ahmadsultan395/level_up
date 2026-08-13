import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { BeforeAfter } from '@/models/BeforeAfter';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(BeforeAfter, query, {
      filterFields: ['status', 'barber'],
      searchFields: ['title'],
      defaultSortBy: 'order',
      populate: 'barber',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/before-after error:', err);
    return NextResponse.json({ error: 'Failed to load before/after gallery' }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().max(150).optional(),
  beforeImageUrl: z.string().url(),
  beforeImagePublicId: z.string().min(1),
  afterImageUrl: z.string().url(),
  afterImagePublicId: z.string().min(1),
  barber: z.string().optional(),
  service: z.string().optional(),
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
    const item = await BeforeAfter.create(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/before-after error:', err);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
