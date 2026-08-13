import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireUser } from '@/lib/session';
import { hashPassword, comparePassword } from '@/lib/password';
import { changePasswordSchema } from '@/validations/auth';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const profile = await User.findById(user.id).select('+password');
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isValid = await comparePassword(parsed.data.currentPassword, profile.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    profile.password = await hashPassword(parsed.data.newPassword);
    await profile.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/customers/me/change-password error:', err);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
