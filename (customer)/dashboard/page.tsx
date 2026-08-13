import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus, Star, Bell } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Notification } from '@/models/Notification';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/States';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  await connectDB();

  const [upcoming, stats, unreadCount] = await Promise.all([
    Appointment.find({ customer: user!.id, status: { $in: ['pending', 'confirmed'] } })
      .sort({ date: 1 })
      .limit(3)
      .populate('barber', 'name imageUrl')
      .lean(),
    Appointment.aggregate([
      { $match: { customer: user!.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Notification.countDocuments({ user: user!.id, isRead: false }),
  ]);

  const completedCount = stats.find((s) => s._id === 'completed')?.count || 0;
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Welcome back, {user!.name.split(' ')[0]}</h1>
      <p className="mt-1 text-text-secondary">Here&apos;s what&apos;s happening with your account.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-text-muted">Total Appointments</p>
            <p className="mt-1 font-display text-2xl text-text-primary">{totalCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-text-muted">Completed Visits</p>
            <p className="mt-1 font-display text-2xl text-text-primary">{completedCount}</p>
          </CardBody>
        </Card>
        <Link href="/dashboard/notifications">
          <Card className="transition-colors hover:border-gold">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">Unread Notifications</p>
                <p className="mt-1 font-display text-2xl text-text-primary">{unreadCount}</p>
              </div>
              <Bell className="h-5 w-5 text-gold" />
            </CardBody>
          </Card>
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">Upcoming Appointments</h2>
        <Link href="/dashboard/book">
          <Button size="sm">
            <CalendarPlus className="h-4 w-4" /> New Booking
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="Ready for your next visit?"
            action={
              <Link href="/dashboard/book">
                <Button size="sm">Book Now</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <Card key={appt._id.toString()}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {formatDate(appt.date)} at {appt.startTime}
                    </p>
                    <p className="mt-0.5 text-sm text-text-muted">
                      with {(appt.barber as unknown as { name: string }).name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-gold">{formatCurrency(appt.totalPrice)}</span>
                    <Badge status={appt.status} />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/dashboard/reviews">
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4" /> Leave a Review
          </Button>
        </Link>
      </div>
    </div>
  );
}
