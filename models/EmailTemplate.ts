import { Schema, model, models, type Model, type Document } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

export interface IEmailTemplate extends Document {
  name: string;
  key: string; // e.g. "booking_confirmation" — used by code to look up the template
  subject: string;
  body: string; // HTML, supports {{variables}}
  availableVariables: string[];
  status: VisibilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    availableVariables: [String],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const EmailTemplate: Model<IEmailTemplate> =
  models.EmailTemplate || model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
