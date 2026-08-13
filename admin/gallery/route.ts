import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { GalleryImage } from '@/models/GalleryImage';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(GalleryImage, query, {
      filterFields: ['moderationStatus', 'status', 'uploadedBy', 'category'],
      searchFields: ['title'],
      defaultSortBy: 'createdAt',
      populate: 'category',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/gallery error:', err);
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().max(150).optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  category: z.string().optional(),
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
    const image = await GalleryImage.create({
      ...parsed.data,
      uploadedBy: 'admin',
      moderationStatus: 'approved',
      status: 'active',
    });

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/gallery error:', err);
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}
