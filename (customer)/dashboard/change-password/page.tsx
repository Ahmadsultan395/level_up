import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/components/customer/ChangePasswordForm';

export const metadata: Metadata = { title: 'Change Password' };

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Change Password</h1>
      <p className="mt-1 text-text-secondary">Keep your account secure.</p>

      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
