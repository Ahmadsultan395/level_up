import { Schema, model, models, type Model, type Document, type Types } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  category: string;
  amount: number;
  date: Date;
  notes?: string;
  receiptUrl?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    notes: String,
    receiptUrl: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ title: 'text', category: 'text', notes: 'text' });

export const Expense: Model<IExpense> = models.Expense || model<IExpense>('Expense', ExpenseSchema);
