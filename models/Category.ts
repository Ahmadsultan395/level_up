import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  type: 'service' | 'blog' | 'gallery'; // which module this category applies to
  status: VisibilityStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    imageUrl: String,
    imagePublicId: String,
    type: { type: String, enum: ['service', 'blog', 'gallery'], default: 'service', index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ name: 'text', description: 'text' });

export const Category: Model<ICategory> = models.Category || model<ICategory>('Category', CategorySchema);
