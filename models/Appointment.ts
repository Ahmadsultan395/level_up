import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { AppointmentStatus } from '@/types/common';

export interface IAppointment extends Document {
  customer: Types.ObjectId;
  barber: Types.ObjectId;
  services: Types.ObjectId[];
  package?: Types.ObjectId;
  date: Date; // calendar date, time-stripped
  startTime: string; // "14:30"
  endTime: string; // "15:15"
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  invoice?: Types.ObjectId;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    barber: { type: Schema.Types.ObjectId, ref: 'Barber', required: true, index: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    package: { type: Schema.Types.ObjectId, ref: 'Package' },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
    notes: String,
    cancelReason: String,
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    reminderSentAt: Date,
  },
  { timestamps: true }
);

// Prevent double-booking: no two non-cancelled appointments for the same
// barber on the same date + overlapping startTime.
AppointmentSchema.index({ barber: 1, date: 1, startTime: 1 });

export const Appointment: Model<IAppointment> =
  models.Appointment || model<IAppointment>('Appointment', AppointmentSchema);
