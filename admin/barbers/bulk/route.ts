import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { Appointment } from '@/models/Appointment';
import { requireAdmin } from '@/lib/session';

const schema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['activate', 'deactivate', 'delete']),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const { ids, action } = parsed.data;

    if (action === 'activate' || action === 'deactivate') {
      await Barber.updateMany({ _id: { $in: ids } }, { status: action === 'activate' ? 'active' : 'inactive' });
      return NextResponse.json({ message: `${ids.length} barber(s) updated` });
    }

    // delete
    const blocked = await Appointment.distinct('barber', {
      barber: { $in: ids },
      status: { $in: ['pending', 'confirmed'] },
    });
    const deletable = ids.filter((id) => !blocked.map(String).includes(id));

    if (deletable.length > 0) {
      await Barber.deleteMany({ _id: { $in: deletable } });
    }

    if (blocked.length > 0) {
      return NextResponse.json({
        message: `${deletable.length} deleted, ${blocked.length} skipped (have upcoming appointments)`,
      });
    }

    return NextResponse.json({ message: `${deletable.length} barber(s) deleted` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/barbers/bulk error:', err);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
