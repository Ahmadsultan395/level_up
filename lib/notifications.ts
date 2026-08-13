import { connectDB } from '@/lib/db';
import { Notification, type NotificationType } from '@/models/Notification';
import { sendEmail } from '@/lib/email';
import { User } from '@/models/User';
import type { Types } from 'mongoose';

interface NotifyArgs {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  sendEmailToo?: boolean;
}

/** Creates an in-app notification, and optionally emails the user the same content. */
export async function notifyUser({ userId, type, title, message, relatedId, sendEmailToo = true }: NotifyArgs) {
  await connectDB();

  await Notification.create({
    user: userId,
    type,
    title,
    message,
    channel: 'in_app',
    relatedId,
  });

  if (sendEmailToo) {
    const user = await User.findById(userId).select('email name');
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `<p>Hi ${user.name},</p><p>${message}</p>`,
        });
      } catch (err) {
        // A failed notification email must never fail the action it's
        // attached to (booking, status change, etc.) — log and move on.
        console.error(`notifyUser: failed to email ${user.email}:`, err);
      }
    }
  }
}
