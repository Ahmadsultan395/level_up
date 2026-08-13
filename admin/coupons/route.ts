import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';
import { requireAdmin } from '@/lib/session';
import { logActivity } from '@/lib/activity-log';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Coupon, query, {
      filterFields: ['status', 'type'],
      searchFields: ['code'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/coupons error:', err);
    return NextResponse.json({ error: 'Failed to load coupons' }, { status: 500 });
  }
}

const createSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minSpend: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  perUserLimit: z.number().positive().default(1),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const code = parsed.data.code.toUpperCase();
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }

    const coupon = await Coupon.create({
      ...parsed.data,
      code,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    });

    await logActivity({
      userId: admin.id,
      action: 'created',
      entityType: 'Coupon',
      entityId: coupon._id.toString(),
      description: `Created coupon "${coupon.code}"`,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/coupons error:', err);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
