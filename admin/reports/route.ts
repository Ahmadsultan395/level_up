import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { Invoice } from '@/models/Invoice';
import { Appointment } from '@/models/Appointment';
import { Expense } from '@/models/Expense';
import { User } from '@/models/User';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const searchParams = new URL(req.url).searchParams;
    const from = searchParams.get('from')
      ? new Date(searchParams.get('from') as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = searchParams.get('to') ? new Date(searchParams.get('to') as string) : new Date();
    to.setHours(23, 59, 59, 999);

    const [
      revenueByDay,
      appointmentsCount,
      completedCount,
      cancelledCount,
      newCustomersCount,
      expensesAgg,
      topServices,
      topBarbers,
      newsletterGrowth,
    ] = await Promise.all([
      Invoice.aggregate([
        { $match: { issuedAt: { $gte: from, $lte: to }, status: { $in: ['paid', 'issued'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$issuedAt' } }, total: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.countDocuments({ date: { $gte: from, $lte: to } }),
      Appointment.countDocuments({ date: { $gte: from, $lte: to }, status: 'completed' }),
      Appointment.countDocuments({ date: { $gte: from, $lte: to }, status: 'cancelled' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: from, $lte: to } }),
      Expense.aggregate([
        { $match: { date: { $gte: from, $lte: to } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Appointment.aggregate([
        { $match: { date: { $gte: from, $lte: to } } },
        { $unwind: '$services' },
        { $group: { _id: '$services', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' },
        { $project: { name: '$service.name', count: 1 } },
      ]),
      Appointment.aggregate([
        { $match: { date: { $gte: from, $lte: to }, status: 'completed' } },
        { $group: { _id: '$barber', revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'barbers', localField: '_id', foreignField: '_id', as: 'barber' } },
        { $unwind: '$barber' },
        { $project: { name: '$barber.name', revenue: 1, count: 1 } },
      ]),
      NewsletterSubscriber.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    ]);

    const totalRevenue = revenueByDay.reduce((sum, d) => sum + d.total, 0);
    const totalExpenses = expensesAgg[0]?.total || 0;

    return NextResponse.json({
      range: { from: from.toISOString(), to: to.toISOString() },
      revenueByDay: revenueByDay.map((d) => ({ date: d._id, total: d.total })),
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      appointmentsCount,
      completedCount,
      cancelledCount,
      newCustomersCount,
      topServices,
      topBarbers,
      newsletterGrowth,
    });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/reports error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
