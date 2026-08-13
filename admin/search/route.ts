import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { User } from '@/models/User';
import { Appointment } from '@/models/Appointment';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Invoice } from '@/models/Invoice';
import { Barber } from '@/models/Barber';
import { Blog } from '@/models/Blog';
import { ContactMessage } from '@/models/ContactMessage';

const LIMIT = 5;

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const q = new URL(req.url).searchParams.get('q') || '';
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ data: {} });
    }

    const rx = { $regex: q, $options: 'i' };

    const [customers, appointments, services, packages, invoices, barbers, blogs, messages] = await Promise.all([
      User.find({ role: 'customer', $or: [{ name: rx }, { email: rx }] })
        .select('name email')
        .limit(LIMIT)
        .lean(),
      Appointment.find({ notes: rx })
        .select('date startTime status')
        .populate('customer', 'name')
        .limit(LIMIT)
        .lean(),
      Service.find({ $or: [{ name: rx }, { description: rx }] })
        .select('name slug')
        .limit(LIMIT)
        .lean(),
      Package.find({ $or: [{ name: rx }, { description: rx }] })
        .select('name slug')
        .limit(LIMIT)
        .lean(),
      Invoice.find({ invoiceNumber: rx })
        .select('invoiceNumber total status')
        .limit(LIMIT)
        .lean(),
      Barber.find({ $or: [{ name: rx }, { bio: rx }] })
        .select('name slug')
        .limit(LIMIT)
        .lean(),
      Blog.find({ title: rx })
        .select('title slug')
        .limit(LIMIT)
        .lean(),
      ContactMessage.find({ $or: [{ name: rx }, { email: rx }, { subject: rx }] })
        .select('name subject status')
        .limit(LIMIT)
        .lean(),
    ]);

    return NextResponse.json({
      data: { customers, appointments, services, packages, invoices, barbers, blogs, messages },
    });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
