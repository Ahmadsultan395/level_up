import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { logActivity } from '@/lib/activity-log';
import { User } from '@/models/User';
import { Barber } from '@/models/Barber';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Category } from '@/models/Category';
import { Appointment } from '@/models/Appointment';
import { Invoice } from '@/models/Invoice';
import { Payment } from '@/models/Payment';
import { Review } from '@/models/Review';
import { Testimonial } from '@/models/Testimonial';
import { Coupon } from '@/models/Coupon';
import { SiteSettings } from '@/models/SiteSettings';

/**
 * On-demand data export ("Backups"). This environment has no scheduler
 * for automated nightly dumps, so this provides an admin-triggered JSON
 * snapshot of core collections (excluding sensitive fields like password
 * hashes) that can be stored externally as a manual backup.
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const [users, barbers, services, packages, categories, appointments, invoices, payments, reviews, testimonials, coupons, settings] =
      await Promise.all([
        User.find().select('-password').lean(),
        Barber.find().lean(),
        Service.find().lean(),
        Package.find().lean(),
        Category.find().lean(),
        Appointment.find().lean(),
        Invoice.find().lean(),
        Payment.find().lean(),
        Review.find().lean(),
        Testimonial.find().lean(),
        Coupon.find().lean(),
        SiteSettings.find().lean(),
      ]);

    await logActivity({
      userId: admin.id,
      action: 'exported',
      entityType: 'Backup',
      description: 'Downloaded a full data export',
    });

    const snapshot = {
      exportedAt: new Date().toISOString(),
      collections: { users, barbers, services, packages, categories, appointments, invoices, payments, reviews, testimonials, coupons, settings },
    };

    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/backups/export error:', err);
    return NextResponse.json({ error: 'Backup export failed' }, { status: 500 });
  }
}
