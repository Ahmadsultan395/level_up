import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Model } from 'mongoose';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(['activate', 'deactivate', 'delete']),
});

interface BulkOptions<T> {
  /** Return a count of blocking references for the ids about to be deleted; those ids are skipped. */
  getDeleteBlockers?: (ids: string[]) => Promise<string[]>; // returns the subset of ids that are blocked
  entityLabel: string; // e.g. "service", "category"
}

/** Builds a POST handler for /api/admin/<module>/bulk — activate/deactivate/delete with optional delete-guard. */
export function createBulkHandler<T>(model: Model<T>, options: BulkOptions<T>) {
  return async function POST(req: Request) {
    try {
      await requireAdmin();
      const body = await req.json();
      const parsed = bulkSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
      }

      await connectDB();
      const { ids, action } = parsed.data;

      if (action === 'activate' || action === 'deactivate') {
        await model.updateMany({ _id: { $in: ids } }, { status: action === 'activate' ? 'active' : 'inactive' } as never);
        return NextResponse.json({ message: `${ids.length} ${options.entityLabel}(s) updated` });
      }

      const blocked = options.getDeleteBlockers ? await options.getDeleteBlockers(ids) : [];
      const deletable = ids.filter((id) => !blocked.includes(id));

      if (deletable.length > 0) {
        await model.deleteMany({ _id: { $in: deletable } });
      }

      if (blocked.length > 0) {
        return NextResponse.json({
          message: `${deletable.length} deleted, ${blocked.length} skipped (still in use)`,
        });
      }

      return NextResponse.json({ message: `${deletable.length} ${options.entityLabel}(s) deleted` });
    } catch (err) {
      if ((err as { status?: number }).status) {
        return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
      }
      console.error('Bulk action error:', err);
      return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
  };
}
