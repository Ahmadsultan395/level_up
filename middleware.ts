import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin panel: only admin / superadmin roles allowed
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin' && token?.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, req.url));
      }
    }

    // Customer dashboard: any authenticated user allowed
    return NextResponse.next();
  },
  {
    callbacks: {
      // Just require *a* valid token here; role-specific checks happen above.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
