import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/session';
import { hashPassword } from '@/lib/password';
import { parseListQuery, buildListResponse } from '@/lib/list-query';
import { logActivity } from '@/lib/activity-log';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(User, query, {
      filterFields: ['role', 'status'],
      searchFields: ['name', 'email', 'phone'],
      defaultSortBy: 'createdAt',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

const createAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'superadmin']).default('admin'),
});

/** Only superadmins may create additional admin accounts. */
export async function POST(req: Request) {
  try {
    const actor = await requireAdmin();
    if (actor.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only a superadmin can create admin accounts' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashed = await hashPassword(parsed.data.password);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
      emailVerified: true,
    });

    await logActivity({
      userId: actor.id,
      action: 'created',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `Created ${parsed.data.role} account for ${user.email}`,
    });

    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/users error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
