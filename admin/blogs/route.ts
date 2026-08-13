import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { blogSchema } from '@/validations/blog';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Blog, query, {
      filterFields: ['status', 'category'],
      searchFields: ['title', 'excerpt', 'tags'],
      defaultSortBy: 'createdAt',
      populate: [{ path: 'category', select: 'name' }, { path: 'author', select: 'name' }],
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/blogs error:', err);
    return NextResponse.json({ error: 'Failed to load blog posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    let slug = slugify(parsed.data.title);
    const existing = await Blog.countDocuments({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    if (existing > 0) slug = `${slug}-${existing + 1}`;

    const blog = await Blog.create({
      ...parsed.data,
      slug,
      author: admin.id,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/blogs error:', err);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
