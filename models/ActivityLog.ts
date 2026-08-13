import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: string; // e.g. "created", "updated", "deleted", "approved", "rejected", "activated", "deactivated"
  entityType: string; // e.g. "Barber", "Service", "Appointment"
  entityId?: Types.ObjectId;
  description: string;
  meta?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: Schema.Types.ObjectId,
    description: { type: String, required: true },
    meta: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ description: 'text' });

export const ActivityLog: Model<IActivityLog> =
  models.ActivityLog || model<IActivityLog>('ActivityLog', ActivityLogSchema);
