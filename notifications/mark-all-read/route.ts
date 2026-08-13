import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { requireUser } from '@/lib/session';

export async function POST() {
  try {
    const user = await requireUser();
    await connectDB();
    await Notification.updateMany({ user: user.id, isRead: false }, { isRead: true });
    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/notifications/mark-all-read error:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
