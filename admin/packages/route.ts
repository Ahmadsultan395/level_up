import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { packageSchema } from '@/validations/package';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Package, query, {
      filterFields: ['status', 'featured'],
      searchFields: ['name', 'description'],
      defaultSortBy: 'order',
      populate: 'services',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/packages error:', err);
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = packageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    let slug = slugify(parsed.data.name);
    const existing = await Package.countDocuments({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    if (existing > 0) slug = `${slug}-${existing + 1}`;

    const pkg = await Package.create({ ...parsed.data, slug });
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/packages error:', err);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
