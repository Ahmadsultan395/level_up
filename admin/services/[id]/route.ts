import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Appointment } from '@/models/Appointment';
import { requireAdmin } from '@/lib/session';
import { serviceSchema } from '@/validations/service';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const service = await Service.findById(params.id).populate('category');
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    return NextResponse.json(service);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/services/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load service' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = serviceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const service = await Service.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    return NextResponse.json(service);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/services/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const [inPackages, upcomingAppointments] = await Promise.all([
      Package.countDocuments({ services: params.id }),
      Appointment.countDocuments({ services: params.id, status: { $in: ['pending', 'confirmed'] } }),
    ]);

    if (inPackages > 0 || upcomingAppointments > 0) {
      return NextResponse.json(
        { error: 'This service is used by a package or has upcoming appointments. Deactivate instead.' },
        { status: 409 }
      );
    }

    const service = await Service.findByIdAndDelete(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    return NextResponse.json({ message: 'Service deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/services/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
