import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/session';
import { validateCoupon } from '@/lib/coupons';

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal, user.id);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/coupons/validate error:', err);
    return NextResponse.json({ error: 'Could not validate coupon' }, { status: 500 });
  }
}
