import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  author: Types.ObjectId;
  category?: Types.ObjectId;
  tags: string[];
  status: VisibilityStatus;
  publishedAt?: Date;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImageUrl: String,
    coverImagePublicId: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: { type: [String], index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

export const Blog: Model<IBlog> = models.Blog || model<IBlog>('Blog', BlogSchema);
