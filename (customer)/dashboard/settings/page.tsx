import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { SettingsForm } from '@/components/customer/SettingsForm';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  await connectDB();
  const profile = await User.findById(user!.id).lean();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Settings</h1>
      <p className="mt-1 text-text-secondary">Manage your account preferences.</p>

      <div className="mt-8">
        <SettingsForm
          initial={{
            emailNotificationsEnabled: profile!.emailNotificationsEnabled,
            smsNotificationsEnabled: profile!.smsNotificationsEnabled,
          }}
        />
      </div>
    </div>
  );
}
