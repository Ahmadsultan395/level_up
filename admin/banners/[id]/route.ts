import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { requireAdmin } from '@/lib/session';
import { deleteImage } from '@/lib/cloudinary';

const updateSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  subtitle: z.string().max(300).optional(),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().max(300).optional(),
  position: z.enum(['hero', 'homepage_secondary', 'services_page', 'promo']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startsAt !== undefined) updates.startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined;
    if (parsed.data.endsAt !== undefined) updates.endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined;

    const banner = await Banner.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

    return NextResponse.json(banner);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/banners/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const banner = await Banner.findByIdAndDelete(params.id);
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

    try {
      await deleteImage(banner.imagePublicId);
    } catch (cloudErr) {
      console.warn('Cloudinary cleanup failed (non-fatal):', cloudErr);
    }

    return NextResponse.json({ message: 'Banner deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/banners/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
