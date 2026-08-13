import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, DollarSign, Users, Scissors, AlertCircle, MessageSquare } from 'lucide-react';
import { getAdminDashboardStats, getTodayAppointments } from '@/lib/queries/admin';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/States';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const [stats, todayAppointments] = await Promise.all([getAdminDashboardStats(), getTodayAppointments()]);

  const statCards = [
    { label: "Today's Appointments", value: stats.appointmentsToday, icon: CalendarClock },
    { label: 'Revenue This Month', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users },
    { label: 'Active Barbers', value: stats.activeBarbers, icon: Scissors },
  ];

  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Admin Dashboard</h1>
      <p className="mt-1 text-text-secondary">An overview of what&apos;s happening today.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">{card.label}</p>
                <p className="mt-1 font-display text-2xl text-text-primary">{card.value}</p>
              </div>
              <card.icon className="h-6 w-6 text-gold" />
            </CardBody>
          </Card>
        ))}
      </div>

      {(stats.pendingModeration > 0 || stats.pendingAppointments > 0 || stats.newMessages > 0) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.pendingAppointments > 0 && (
            <Link href="/admin/appointments?status=pending">
              <Card className="border-status-warning/40 transition-colors hover:border-status-warning">
                <CardBody className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-status-warning" />
                  <div>
                    <p className="text-sm text-text-primary">{stats.pendingAppointments} appointments awaiting confirmation</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          )}
          {stats.pendingModeration > 0 && (
            <Link
              href={
                stats.pendingReviews > 0
                  ? '/admin/reviews'
                  : stats.pendingTestimonials > 0
                    ? '/admin/testimonials'
                    : '/admin/gallery'
              }
            >
              <Card className="border-status-pending/40 transition-colors hover:border-status-pending">
                <CardBody className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-status-pending" />
                  <p className="text-sm text-text-primary">{stats.pendingModeration} items awaiting moderation</p>
                </CardBody>
              </Card>
            </Link>
          )}
          {stats.newMessages > 0 && (
            <Link href="/admin/messages?status=new">
              <Card className="border-status-info/40 transition-colors hover:border-status-info">
                <CardBody className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-status-info" />
                  <p className="text-sm text-text-primary">{stats.newMessages} new contact messages</p>
                </CardBody>
              </Card>
            </Link>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl text-text-primary">Today&apos;s Schedule</h2>
        <div className="mt-4">
          {todayAppointments.length === 0 ? (
            <EmptyState title="No appointments today" description="Enjoy the quiet." />
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((appt) => (
                <Card key={appt._id.toString()}>
                  <CardBody className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {appt.startTime} — {(appt.customer as unknown as { name: string }).name}
                      </p>
                      <p className="text-xs text-text-muted">with {(appt.barber as unknown as { name: string }).name}</p>
                    </div>
                    <Badge status={appt.status} />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Link href="/admin/barbers" className="text-sm text-gold hover:text-gold-bright">
          Manage Barbers →
        </Link>
      </div>
    </div>
  );
}
