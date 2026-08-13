import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';
import type { PaymentStatus } from '@/types/common';

export interface IPayment extends Document {
  customer: Types.ObjectId;
  appointment?: Types.ObjectId;
  invoice?: Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
  status: PaymentStatus;
  referenceNumber?: string; // transaction ID the customer entered for bank/EasyPaisa/JazzCash
  screenshotUrl?: string; // payment proof screenshot uploaded by the customer
  screenshotPublicId?: string;
  confirmedBy?: Types.ObjectId; // admin who verified receipt
  refundedAmount: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    method: { type: String, enum: ['cash', 'bank_transfer', 'easypaisa', 'jazzcash'], default: 'cash' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    referenceNumber: { type: String, index: true },
    screenshotUrl: String,
    screenshotPublicId: String,
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    refundedAmount: { type: Number, default: 0 },
    paidAt: Date,
  },
  { timestamps: true }
);

/** Finance rule (spec section 9): a Payment only becomes "paid" — and an
 * Invoice only gets created — once an admin has manually verified receipt
 * (cash handed over, or bank/EasyPaisa transfer confirmed). See
 * src/lib/manual-payment.ts for the confirmation flow itself; this stub is
 * kept only so older imports don't break. */

export const Payment: Model<IPayment> = models.Payment || model<IPayment>('Payment', PaymentSchema);
