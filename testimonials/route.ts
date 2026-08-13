import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Testimonial, query, {
      baseFilter: { status: 'active', moderationStatus: 'approved' },
      searchFields: ['name', 'message'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/testimonials error:', err);
    return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 });
  }
}

const submitTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  roleOrTitle: z.string().max(100).optional(),
  message: z.string().min(10, 'Please write at least 10 characters').max(1000),
  rating: z.number().min(1).max(5).optional(),
});

/** Public testimonial submissions land as Pending and never show until an admin approves them. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = submitTestimonialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    await Testimonial.create({
      ...parsed.data,
      source: 'website_form',
      moderationStatus: 'pending',
      status: 'inactive',
    });

    return NextResponse.json({ message: 'Thank you! Your testimonial is pending review.' }, { status: 201 });
  } catch (err) {
    console.error('POST /api/testimonials error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
