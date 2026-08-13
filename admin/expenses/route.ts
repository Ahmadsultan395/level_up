import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(Expense, query, {
      filterFields: ['category'],
      searchFields: ['title', 'category', 'notes'],
      defaultSortBy: 'date',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/expenses error:', err);
    return NextResponse.json({ error: 'Failed to load expenses' }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  amount: z.number().positive(),
  date: z.string().min(1),
  notes: z.string().max(500).optional(),
  receiptUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const expense = await Expense.create({
      ...parsed.data,
      date: new Date(parsed.data.date),
      createdBy: admin.id,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/expenses error:', err);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
