import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Testimonial, query, {
      filterFields: ['moderationStatus', 'status', 'source'],
      searchFields: ['name', 'message'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/testimonials error:', err);
    return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(100),
  roleOrTitle: z.string().max(100).optional(),
  photoUrl: z.string().url().optional(),
  photoPublicId: z.string().optional(),
  message: z.string().min(10).max(1000),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

/** Admin-added testimonials are auto-approved and active immediately. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const testimonial = await Testimonial.create({
      ...parsed.data,
      source: 'admin_added',
      moderationStatus: 'approved',
      status: 'active',
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/testimonials error:', err);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
