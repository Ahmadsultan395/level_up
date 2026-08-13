import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryImage } from '@/models/GalleryImage';
import { requireUser } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(GalleryImage, query, {
      baseFilter: { uploadedBy: 'customer', submittedByUser: user.id },
      filterFields: ['moderationStatus'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/customers/me/gallery error:', err);
    return NextResponse.json({ error: 'Failed to load your photos' }, { status: 500 });
  }
}
