import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { Service } from '@/models/Service';
import { requireAdmin } from '@/lib/session';
import { categorySchema } from '@/validations/category';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/categories/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load category' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const category = await Category.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    return NextResponse.json(category);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/categories/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const inUse = await Service.countDocuments({ category: params.id });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `This category is used by ${inUse} service(s). Reassign them first, or deactivate instead.` },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/categories/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
