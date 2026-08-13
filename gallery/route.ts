import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { GalleryImage } from '@/models/GalleryImage';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { requireUser } from '@/lib/session';

export async function GET(req: Request) {
  try {
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(GalleryImage, query, {
      baseFilter: { status: 'active', moderationStatus: 'approved' },
      filterFields: ['category'],
      searchFields: ['title'],
      defaultSortBy: 'order',
      populate: 'category',
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/gallery error:', err);
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}

const submitSchema = z.object({
  title: z.string().max(150).optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
});

/** Customer-submitted gallery photos land as Pending/Inactive until an admin approves them. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const image = await GalleryImage.create({
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      imagePublicId: parsed.data.imagePublicId,
      uploadedBy: 'customer',
      submittedByUser: user.id,
      moderationStatus: 'pending',
      status: 'inactive',
    });

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/gallery error:', err);
    return NextResponse.json({ error: 'Failed to submit photo' }, { status: 500 });
  }
}
