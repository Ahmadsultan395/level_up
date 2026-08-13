import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  imagePublicId: string;
  ctaText?: string;
  ctaLink?: string;
  position: 'hero' | 'homepage_secondary' | 'services_page' | 'promo';
  status: VisibilityStatus;
  order: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: String,
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    ctaText: String,
    ctaLink: String,
    position: {
      type: String,
      enum: ['hero', 'homepage_secondary', 'services_page', 'promo'],
      default: 'hero',
      index: true,
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

export const Banner: Model<IBanner> = models.Banner || model<IBanner>('Banner', BannerSchema);
