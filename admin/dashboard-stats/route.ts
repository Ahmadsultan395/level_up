import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getAdminDashboardStats } from '@/lib/queries/admin';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/dashboard-stats error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
