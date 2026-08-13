import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { Appointment } from '@/models/Appointment';
import { requireAdmin } from '@/lib/session';
import { barberSchema } from '@/validations/barber';
import { logActivity } from '@/lib/activity-log';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const barber = await Barber.findById(params.id).populate('services');
    if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    return NextResponse.json(barber);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/barbers/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load barber' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();

    // Allow partial updates (e.g. StatusToggle sends just { status }) while
    // still validating full-form submissions against the complete schema.
    const parsed = barberSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const barber = await Barber.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 });

    return NextResponse.json(barber);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/barbers/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update barber' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const futureAppointments = await Appointment.countDocuments({
      barber: params.id,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (futureAppointments > 0) {
      return NextResponse.json(
        { error: 'This barber has upcoming appointments. Deactivate instead of deleting, or reassign appointments first.' },
        { status: 409 }
      );
    }

    const barber = await Barber.findByIdAndDelete(params.id);
    if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 });

    await logActivity({
      userId: admin.id,
      action: 'deleted',
      entityType: 'Barber',
      entityId: params.id,
      description: `Deleted barber "${barber.name}"`,
    });

    return NextResponse.json({ message: 'Barber deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/barbers/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete barber' }, { status: 500 });
  }
}
