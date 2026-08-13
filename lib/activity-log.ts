import { connectDB } from '@/lib/db';
import { ActivityLog } from '@/models/ActivityLog';

interface LogActivityArgs {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  meta?: Record<string, unknown>;
}

/**
 * Records an admin action to the audit trail (spec: Activity Logs).
 * Best-effort — a logging failure should never break the action it's
 * describing, so errors are swallowed after being logged to the console.
 */
export async function logActivity({ userId, action, entityType, entityId, description, meta }: LogActivityArgs) {
  try {
    await connectDB();
    await ActivityLog.create({ user: userId, action, entityType, entityId, description, meta });
  } catch (err) {
    console.error('Failed to record activity log:', err);
  }
}
