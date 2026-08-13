import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { serviceSchema } from '@/validations/service';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Service, query, {
      filterFields: ['status', 'category', 'featured'],
      searchFields: ['name', 'description'],
      defaultSortBy: 'order',
      populate: 'category',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/services error:', err);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    let slug = slugify(parsed.data.name);
    const existing = await Service.countDocuments({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    if (existing > 0) slug = `${slug}-${existing + 1}`;

    const service = await Service.create({ ...parsed.data, slug });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/services error:', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
