import { Schema, model, models, type Model, type Document } from 'mongoose';

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // hashed
  phone?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  role: UserRole;
  status: 'active' | 'inactive'; // admin can block a customer account
  permissions: string[]; // fine-grained permissions for admin sub-roles (Step 19)
  favoriteServices: Schema.Types.ObjectId[]; // customer wishlist (spec: Wishlist/Favorites, optional)
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    avatarUrl: String,
    avatarPublicId: String,
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer', index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    permissions: { type: [String], default: [] },
    favoriteServices: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    emailNotificationsEnabled: { type: Boolean, default: true },
    smsNotificationsEnabled: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Text index to support the global search + admin customer search (spec section 14, 17)
UserSchema.index({ name: 'text', email: 'text', phone: 'text' });

export const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);
