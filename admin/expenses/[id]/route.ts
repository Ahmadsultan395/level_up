import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { requireAdmin } from '@/lib/session';

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  category: z.string().min(2).max(100).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) updates.date = new Date(parsed.data.date);

    const expense = await Expense.findByIdAndUpdate(params.id, updates, { new: true, runValidators: true });
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

    return NextResponse.json(expense);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/expenses/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const expense = await Expense.findByIdAndDelete(params.id);
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/expenses/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
