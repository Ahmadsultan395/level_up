import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IBeforeAfter extends Document {
  title?: string;
  beforeImageUrl: string;
  beforeImagePublicId: string;
  afterImageUrl: string;
  afterImagePublicId: string;
  barber?: Types.ObjectId;
  service?: Types.ObjectId;
  status: VisibilityStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BeforeAfterSchema = new Schema<IBeforeAfter>(
  {
    title: String,
    beforeImageUrl: { type: String, required: true },
    beforeImagePublicId: { type: String, required: true },
    afterImageUrl: { type: String, required: true },
    afterImagePublicId: { type: String, required: true },
    barber: { type: Schema.Types.ObjectId, ref: 'Barber', index: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BeforeAfter: Model<IBeforeAfter> =
  models.BeforeAfter || model<IBeforeAfter>('BeforeAfter', BeforeAfterSchema);
