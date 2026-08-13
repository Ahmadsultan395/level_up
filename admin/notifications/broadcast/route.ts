import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { requireAdmin } from '@/lib/session';
import { sendEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity-log';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  message: z.string().min(2, 'Message must be at least 2 characters').max(1000),
  sendEmailToo: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const customers = await User.find({ role: 'customer', status: 'active' }).select('_id email name emailNotificationsEnabled');

    // Broadcast: one Notification per customer (relatedId omitted; user field set per recipient)
    await Notification.insertMany(
      customers.map((c) => ({
        user: c._id,
        type: 'admin_announcement',
        title: parsed.data.title,
        message: parsed.data.message,
        channel: 'in_app',
      }))
    );

    let emailsSent = 0;
    if (parsed.data.sendEmailToo) {
      for (const c of customers) {
        if (!c.emailNotificationsEnabled) continue;
        try {
          await sendEmail({ to: c.email, subject: parsed.data.title, html: `<p>${parsed.data.message.replace(/\n/g, '<br/>')}</p>` });
          emailsSent++;
        } catch (err) {
          console.warn(`Announcement email failed for ${c.email}:`, err);
        }
      }
    }

    await logActivity({
      userId: admin.id,
      action: 'broadcast',
      entityType: 'Notification',
      description: `Sent announcement "${parsed.data.title}" to ${customers.length} customers`,
    });

    return NextResponse.json({ message: `Sent to ${customers.length} customers${parsed.data.sendEmailToo ? ` (${emailsSent} emails)` : ''}` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/notifications/broadcast error:', err);
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
}
