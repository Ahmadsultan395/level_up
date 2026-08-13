import type { DefaultSession } from 'next-auth';

type Role = 'customer' | 'admin' | 'superadmin';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      avatarUrl?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    avatarUrl?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    avatarUrl?: string;
  }
}
