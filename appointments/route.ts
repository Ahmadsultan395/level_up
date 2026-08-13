import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Barber } from '@/models/Barber';
import { isSlotAvailable, timeToMinutes, minutesToTime } from '@/lib/booking';
import { requireUser } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

const createAppointmentSchema = z.object({
  barberId: z.string().min(1, 'Barber is required'),
  serviceIds: z.array(z.string()).default([]),
  packageId: z.string().optional(),
  date: z.string().min(1, 'Date is required'), // "YYYY-MM-DD"
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(500).optional(),
}).refine((data) => data.serviceIds.length > 0 || data.packageId, {
  message: 'Select at least one service or a package',
  path: ['serviceIds'],
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const { barberId, serviceIds, packageId, date, startTime, notes } = parsed.data;

    const barber = await Barber.findOne({ _id: barberId, status: 'active' });
    if (!barber) {
      return NextResponse.json({ error: 'Barber not found or unavailable' }, { status: 404 });
    }

    // Compute duration + price from either the package or the selected services
    let durationMinutes = 0;
    let totalPrice = 0;
    let resolvedServiceIds: string[] = serviceIds;

    if (packageId) {
      const pkg = await Package.findOne({ _id: packageId, status: 'active' }).populate('services');
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found or unavailable' }, { status: 404 });
      }
      durationMinutes = pkg.durationMinutes;
      totalPrice = pkg.discountPrice ?? pkg.price;
      resolvedServiceIds = pkg.services.map((s) => s._id.toString());
    } else {
      const services = await Service.find({ _id: { $in: serviceIds }, status: 'active' });
      if (services.length !== serviceIds.length) {
        return NextResponse.json({ error: 'One or more selected services are unavailable' }, { status: 404 });
      }
      durationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
      totalPrice = services.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
    }

    // Re-check availability at write time to prevent double-booking races
    const available = await isSlotAvailable(barberId, date, startTime, durationMinutes);
    if (!available) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another.' },
        { status: 409 }
      );
    }

    const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);

    const appointment = await Appointment.create({
      customer: user.id,
      barber: barberId,
      services: resolvedServiceIds,
      package: packageId,
      date: new Date(`${date}T00:00:00`),
      startTime,
      endTime,
      durationMinutes,
      totalPrice,
      status: 'pending',
      notes,
    });

    await notifyUser({
      userId: user.id,
      type: 'booking_confirmation',
      title: 'Booking received',
      message: `Your appointment with ${barber.name} on ${date} at ${startTime} has been received and is pending confirmation.`,
      relatedId: appointment._id.toString(),
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in to book an appointment.' }, { status: 401 });
    }
    console.error('POST /api/appointments error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    const statusIn = new URL(req.url).searchParams.get('statusIn');
    const baseFilter: Record<string, unknown> = isAdmin ? {} : { customer: user.id };
    if (statusIn) {
      baseFilter.status = { $in: statusIn.split(',') };
    }

    const result = await buildListResponse(Appointment, query, {
      baseFilter,
      filterFields: ['status', 'barber', ...(isAdmin ? ['customer'] : [])],
      searchFields: ['notes'],
      defaultSortBy: 'date',
      populate: [
        { path: 'barber', select: 'name slug imageUrl' },
        { path: 'services', select: 'name' },
        { path: 'package', select: 'name' },
        ...(isAdmin ? [{ path: 'customer', select: 'name email' }] : []),
      ],
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/appointments error:', err);
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 });
  }
}
