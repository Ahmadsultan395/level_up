import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { MessageStatus } from '@/types/common';

interface IReply {
  message: string;
  repliedBy: string; // admin name
  repliedAt: Date;
}

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'replied', 'resolved', 'archived'], default: 'new', index: true },
    replies: [
      {
        message: String,
        repliedBy: String,
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ContactMessageSchema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });

export const ContactMessage: Model<IContactMessage> =
  models.ContactMessage || model<IContactMessage>('ContactMessage', ContactMessageSchema);
