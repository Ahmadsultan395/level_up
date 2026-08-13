import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { VisibilityStatus } from '@/types/common';

interface IWorkingHours {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  isOff: boolean;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breaks: { startTime: string; endTime: string }[];
}

interface IVacation {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface IBarber extends Document {
  name: string;
  slug: string;
  bio: string;
  imageUrl?: string;
  imagePublicId?: string;
  gallery: { url: string; publicId: string; status: VisibilityStatus }[];
  specialties: string[];
  experienceYears: number;
  services: Types.ObjectId[];
  workingHours: IWorkingHours[];
  vacations: IVacation[];
  ratingAvg: number;
  ratingCount: number;
  socialLinks: { platform: string; url: string }[];
  status: VisibilityStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkingHoursSchema = new Schema<IWorkingHours>(
  {
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true,
    },
    isOff: { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
    breaks: [{ startTime: String, endTime: String }],
  },
  { _id: false }
);

const VacationSchema = new Schema<IVacation>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
  },
  { _id: false }
);

const BarberSchema = new Schema<IBarber>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    bio: { type: String, required: true },
    imageUrl: String,
    imagePublicId: String,
    gallery: [
      {
        url: String,
        publicId: String,
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      },
    ],
    specialties: [String],
    experienceYears: { type: Number, default: 0 },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    workingHours: [WorkingHoursSchema],
    vacations: [VacationSchema],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    socialLinks: [{ platform: String, url: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BarberSchema.index({ name: 'text', bio: 'text', specialties: 'text' });

export const Barber: Model<IBarber> = models.Barber || model<IBarber>('Barber', BarberSchema);
