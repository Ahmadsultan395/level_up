import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { ModerationStatus, VisibilityStatus } from '@/types/common';

export interface ITestimonial extends Document {
  name: string;
  roleOrTitle?: string;
  photoUrl?: string;
  photoPublicId?: string;
  message: string;
  rating?: number;
  source: 'website_form' | 'admin_added';
  moderationStatus: ModerationStatus;
  rejectReason?: string;
  status: VisibilityStatus;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    roleOrTitle: String,
    photoUrl: String,
    photoPublicId: String,
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    source: { type: String, enum: ['website_form', 'admin_added'], default: 'admin_added' },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectReason: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TestimonialSchema.index({ name: 'text', message: 'text' });

export const Testimonial: Model<ITestimonial> =
  models.Testimonial || model<ITestimonial>('Testimonial', TestimonialSchema);
