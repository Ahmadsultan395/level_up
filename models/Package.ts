import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IPackage extends Document {
  name: string;
  slug: string;
  description: string;
  services: Types.ObjectId[];
  price: number;
  discountPrice?: number;
  durationMinutes: number;
  imageUrl?: string;
  imagePublicId?: string;
  status: VisibilityStatus;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5 },
    imageUrl: String,
    imagePublicId: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PackageSchema.index({ name: 'text', description: 'text' });

export const Package: Model<IPackage> = models.Package || model<IPackage>('Package', PackageSchema);
