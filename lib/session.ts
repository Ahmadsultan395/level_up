import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Throws if there is no logged-in user. Use at the top of any protected API route. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError('You must be logged in.', 401);
  }
  return user;
}

/** Throws unless the logged-in user is admin or superadmin. Use in every /api/admin-facing route. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthError('You do not have permission to perform this action.', 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
