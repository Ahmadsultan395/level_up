import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { GalleryImage } from '@/models/GalleryImage';
import { requireAdmin } from '@/lib/session';
import { deleteImage } from '@/lib/cloudinary';
import { notifyUser } from '@/lib/notifications';

const updateSchema = z.object({
  title: z.string().max(150).optional(),
  category: z.string().optional(),
  moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
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
    const image = await GalleryImage.findById(params.id);
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    Object.assign(image, parsed.data);
    if (parsed.data.moderationStatus) {
      image.status = parsed.data.moderationStatus === 'approved' ? 'active' : 'inactive';
    }
    await image.save();

    if (image.submittedByUser && (parsed.data.moderationStatus === 'approved' || parsed.data.moderationStatus === 'rejected')) {
      await notifyUser({
        userId: image.submittedByUser.toString(),
        type: 'review_received',
        title: parsed.data.moderationStatus === 'approved' ? 'Your photo was approved' : 'Your photo was not approved',
        message:
          parsed.data.moderationStatus === 'approved'
            ? 'Your submitted photo is now live in our gallery.'
            : 'Your recent photo submission was not approved.',
      });
    }

    return NextResponse.json(image);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/gallery/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const image = await GalleryImage.findByIdAndDelete(params.id);
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    try {
      await deleteImage(image.imagePublicId);
    } catch (cloudErr) {
      console.warn('Cloudinary cleanup failed (non-fatal):', cloudErr);
    }

    return NextResponse.json({ message: 'Image deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/gallery/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
