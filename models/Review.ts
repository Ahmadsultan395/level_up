import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { ModerationStatus, VisibilityStatus } from '@/types/common';

export interface IReview extends Document {
  customer: Types.ObjectId;
  barber?: Types.ObjectId;
  appointment?: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  images: { url: string; publicId: string }[];
  adminReply?: string;
  moderationStatus: ModerationStatus; // pending -> approved/rejected
  rejectReason?: string;
  status: VisibilityStatus; // active/inactive toggle, only meaningful once approved
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    barber: { type: Schema.Types.ObjectId, ref: 'Barber', index: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ url: String, publicId: String }],
    adminReply: String,
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectReason: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ comment: 'text' });

export const Review: Model<IReview> = models.Review || model<IReview>('Review', ReviewSchema);
