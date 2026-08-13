import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { barberSchema } from '@/validations/barber';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-log';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Barber, query, {
      filterFields: ['status'],
      searchFields: ['name', 'bio'],
      defaultSortBy: 'createdAt',
      populate: 'services',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/barbers error:', err);
    return NextResponse.json({ error: 'Failed to load barbers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = barberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();

    let slug = slugify(parsed.data.name);
    const existing = await Barber.countDocuments({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    if (existing > 0) slug = `${slug}-${existing + 1}`;

    const barber = await Barber.create({ ...parsed.data, slug });
    await logActivity({
      userId: admin.id,
      action: 'created',
      entityType: 'Barber',
      entityId: barber._id.toString(),
      description: `Added barber "${barber.name}"`,
    });
    return NextResponse.json(barber, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/barbers error:', err);
    return NextResponse.json({ error: 'Failed to create barber' }, { status: 500 });
  }
}
