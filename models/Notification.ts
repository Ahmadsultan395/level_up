import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_cancelled'
  | 'payment_success'
  | 'appointment_reminder'
  | 'appointment_completed'
  | 'review_received'
  | 'newsletter'
  | 'admin_announcement';

export interface INotification extends Document {
  user?: Types.ObjectId; // undefined = broadcast to all (e.g. admin announcement)
  type: NotificationType;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'in_app';
  isRead: boolean;
  relatedId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: [
        'booking_confirmation',
        'booking_cancelled',
        'payment_success',
        'appointment_reminder',
        'appointment_completed',
        'review_received',
        'newsletter',
        'admin_announcement',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ['email', 'sms', 'in_app'], default: 'in_app' },
    isRead: { type: Boolean, default: false, index: true },
    relatedId: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  models.Notification || model<INotification>('Notification', NotificationSchema);
