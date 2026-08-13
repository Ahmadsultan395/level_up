import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { Appointment } from '@/models/Appointment';
import { requireAdmin } from '@/lib/session';
import { packageSchema } from '@/validations/package';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const pkg = await Package.findById(params.id).populate('services');
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/packages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load package' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = packageSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const pkg = await Package.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    return NextResponse.json(pkg);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/packages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const upcoming = await Appointment.countDocuments({ package: params.id, status: { $in: ['pending', 'confirmed'] } });
    if (upcoming > 0) {
      return NextResponse.json({ error: 'This package has upcoming appointments. Deactivate instead.' }, { status: 409 });
    }

    const pkg = await Package.findByIdAndDelete(params.id);
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    return NextResponse.json({ message: 'Package deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/packages/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
