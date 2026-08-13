import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Invoice } from '@/models/Invoice';
import { requireUser } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    const result = await buildListResponse(Invoice, query, {
      baseFilter: isAdmin ? {} : { customer: user.id },
      filterFields: ['status', ...(isAdmin ? ['customer'] : [])],
      searchFields: ['invoiceNumber'],
      defaultSortBy: 'issuedAt',
      populate: isAdmin ? [{ path: 'customer', select: 'name email' }] : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/invoices error:', err);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}
