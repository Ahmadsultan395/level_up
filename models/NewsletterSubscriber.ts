import { Schema, model, models, type Model, type Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  status: 'subscribed' | 'unsubscribed';
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed', index: true },
    source: String,
  },
  { timestamps: true }
);

export const NewsletterSubscriber: Model<INewsletterSubscriber> =
  models.NewsletterSubscriber || model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
