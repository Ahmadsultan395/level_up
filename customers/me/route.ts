import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const profile = await User.findById(user.id).select('-password');
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/customers/me error:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
  avatarPublicId: z.string().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  smsNotificationsEnabled: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const profile = await User.findByIdAndUpdate(user.id, parsed.data, { new: true }).select('-password');
    return NextResponse.json(profile);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('PATCH /api/customers/me error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
