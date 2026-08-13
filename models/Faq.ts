import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IFaq extends Document {
  question: string;
  answer: string;
  category?: string;
  status: VisibilityStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FaqSchema.index({ question: 'text', answer: 'text' });

export const Faq: Model<IFaq> = models.Faq || model<IFaq>('Faq', FaqSchema);
