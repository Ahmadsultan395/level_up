import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { requireUser } from '@/lib/session';
import { notifyUser } from '@/lib/notifications';

async function getAppointmentOr404(id: string) {
  await connectDB();
  return Appointment.findById(id)
    .populate('barber', 'name slug imageUrl')
    .populate('services', 'name price durationMinutes')
    .populate('package', 'name price durationMinutes')
    .populate('customer', 'name email');
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const appointment = await getAppointmentOr404(params.id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const isOwner = appointment.customer._id.toString() === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/appointments/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load appointment' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  cancelReason: z.string().max(500).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const appointment = await getAppointmentOr404(params.id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const isOwner = appointment.customer._id.toString() === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Customers may only cancel their own upcoming appointment — every other
    // status transition (confirm, in-progress, completed, no-show) is admin-only
    // and is wired up fully in the Admin Panel (Step 14).
    if (!isAdmin) {
      if (parsed.data.status !== 'cancelled') {
        return NextResponse.json({ error: 'You can only cancel an appointment.' }, { status: 403 });
      }
      if (!['pending', 'confirmed'].includes(appointment.status)) {
        return NextResponse.json({ error: 'This appointment can no longer be cancelled.' }, { status: 400 });
      }
    }

    if (parsed.data.status) appointment.status = parsed.data.status;
    if (parsed.data.cancelReason) appointment.cancelReason = parsed.data.cancelReason;
    await appointment.save();

    if (parsed.data.status === 'cancelled') {
      await notifyUser({
        userId: appointment.customer._id.toString(),
        type: 'booking_cancelled',
        title: 'Appointment cancelled',
        message: `Your appointment on ${appointment.date.toDateString()} at ${appointment.startTime} has been cancelled.`,
        relatedId: appointment._id.toString(),
      });
    }

    return NextResponse.json(appointment);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/appointments/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
