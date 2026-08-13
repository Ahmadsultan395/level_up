import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';
import { requireAdmin } from '@/lib/session';
import { blogSchema } from '@/validations/blog';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const blog = await Blog.findById(params.id).populate('category').populate('author', 'name');
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/blogs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load blog post' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = blogSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.publishedAt !== undefined) {
      updates.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined;
    }

    const blog = await Blog.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    return NextResponse.json(blog);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/blogs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const blog = await Blog.findByIdAndDelete(params.id);
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json({ message: 'Blog post deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/blogs/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
