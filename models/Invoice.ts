import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';

interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: Types.ObjectId;
  appointment?: Types.ObjectId;
  payment?: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  total: number;
  status: 'issued' | 'paid' | 'refunded' | 'void';
  pdfUrl?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    items: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['issued', 'paid', 'refunded', 'void'], default: 'issued', index: true },
    pdfUrl: String,
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceNumber: 'text' });

export const Invoice: Model<IInvoice> = models.Invoice || model<IInvoice>('Invoice', InvoiceSchema);
