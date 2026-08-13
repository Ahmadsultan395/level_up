import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Log In' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === 'customer' ? '/dashboard' : '/admin');
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
