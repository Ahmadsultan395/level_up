import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Create Account' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === 'customer' ? '/dashboard' : '/admin');
  }

  return <RegisterForm />;
}
