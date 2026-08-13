import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { categorySchema } from '@/validations/category';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Category, query, {
      filterFields: ['status', 'type'],
      searchFields: ['name', 'description'],
      defaultSortBy: 'order',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    let slug = slugify(parsed.data.name);
    const existing = await Category.countDocuments({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    if (existing > 0) slug = `${slug}-${existing + 1}`;

    const category = await Category.create({ ...parsed.data, slug });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
