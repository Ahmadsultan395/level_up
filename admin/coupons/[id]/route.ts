import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';
import { requireAdmin } from '@/lib/session';

const updateSchema = z.object({
  value: z.number().positive().optional(),
  minSpend: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  perUserLimit: z.number().positive().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
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
    if (parsed.data.expiresAt !== undefined) updates.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined;

    const coupon = await Coupon.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

    return NextResponse.json(coupon);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/coupons/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ message: 'Coupon deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/coupons/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
