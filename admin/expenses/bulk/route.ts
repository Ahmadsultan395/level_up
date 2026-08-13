import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { requireAdmin } from '@/lib/session';

const schema = z.object({ ids: z.array(z.string()).min(1), action: z.literal('delete') });

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    await Expense.deleteMany({ _id: { $in: parsed.data.ids } });
    return NextResponse.json({ message: `${parsed.data.ids.length} expense(s) deleted` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/expenses/bulk error:', err);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
