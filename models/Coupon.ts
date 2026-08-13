import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  usageLimit?: number; // total redemptions allowed, undefined = unlimited
  usedCount: number;
  perUserLimit: number;
  expiresAt?: Date;
  status: VisibilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    expiresAt: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> = models.Coupon || model<ICoupon>('Coupon', CouponSchema);
