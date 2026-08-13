import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Banner, query, {
      filterFields: ['status', 'position'],
      searchFields: ['title', 'subtitle'],
      defaultSortBy: 'order',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/banners error:', err);
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(2).max(150),
  subtitle: z.string().max(300).optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().max(300).optional(),
  position: z.enum(['hero', 'homepage_secondary', 'services_page', 'promo']).default('hero'),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().default(0),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
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
    const banner = await Banner.create({
      ...parsed.data,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/banners error:', err);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
