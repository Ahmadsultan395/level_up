import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { ModerationStatus, VisibilityStatus } from '@/types/common';

export interface IGalleryImage extends Document {
  title?: string;
  imageUrl: string;
  imagePublicId: string;
  category?: Types.ObjectId;
  uploadedBy: 'admin' | 'customer';
  submittedByUser?: Types.ObjectId; // set when uploadedBy === 'customer'
  moderationStatus: ModerationStatus; // relevant when uploadedBy === 'customer'
  status: VisibilityStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: String,
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    uploadedBy: { type: String, enum: ['admin', 'customer'], default: 'admin' },
    submittedByUser: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ title: 'text' });

export const GalleryImage: Model<IGalleryImage> =
  models.GalleryImage || model<IGalleryImage>('GalleryImage', GalleryImageSchema);
