import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/session';
import { logActivity } from '@/lib/activity-log';

const updateSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  role: z.enum(['customer', 'admin', 'superadmin']).optional(),
  permissions: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const actor = await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    if (parsed.data.role && actor.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only a superadmin can change roles' }, { status: 403 });
    }
    if (params.id === actor.id && parsed.data.role && parsed.data.role !== 'superadmin') {
      return NextResponse.json({ error: 'You cannot demote your own account' }, { status: 400 });
    }
    if (params.id === actor.id && parsed.data.status === 'inactive') {
      return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(params.id, parsed.data, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await logActivity({
      userId: actor.id,
      action: parsed.data.role ? 'role_changed' : parsed.data.status === 'inactive' ? 'deactivated' : 'updated',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `Updated ${user.email}${parsed.data.role ? ` → role: ${parsed.data.role}` : ''}${parsed.data.status ? ` → status: ${parsed.data.status}` : ''}`,
    });

    return NextResponse.json(user);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/users/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
