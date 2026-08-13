import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { ProfileForm } from '@/components/customer/ProfileForm';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  await connectDB();
  const profile = await User.findById(user!.id).lean();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Profile</h1>
      <p className="mt-1 text-text-secondary">Manage your personal information.</p>

      <div className="mt-8">
        <ProfileForm
          profile={{
            name: profile!.name,
            email: profile!.email,
            phone: profile!.phone,
            avatarUrl: profile!.avatarUrl,
          }}
        />
      </div>
    </div>
  );
}
