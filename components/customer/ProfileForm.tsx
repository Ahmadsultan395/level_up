'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Camera, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
});
type ProfileInput = z.infer<typeof schema>;

interface ProfileFormProps {
  profile: { name: string; email: string; phone?: string; avatarUrl?: string };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, phone: profile.phone || '' },
  });

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const result = await uploadFile(file, 'customers');
      await fetch('/api/customers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: result.url, avatarPublicId: result.publicId }),
      });
      setAvatarUrl(result.url);
      toast.success('Photo updated');
    } catch {
      toast.error('Could not upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function onSubmit(values: ProfileInput) {
    const res = await fetch('/api/customers/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error('Could not update profile');
      return;
    }

    toast.success('Profile updated');
  }

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-bg-secondary">
            {avatarUrl && <Image src={avatarUrl} alt={profile.name} fill className="object-cover" />}
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
            >
              {isUploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin text-text-primary" /> : <Camera className="h-5 w-5 text-text-primary" />}
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{profile.name}</p>
            <p className="text-sm text-text-muted">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Full name</label>
            <Input {...register('name')} error={errors.name?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Phone <span className="text-text-muted">(optional)</span>
            </label>
            <Input {...register('phone')} type="tel" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
            <Input value={profile.email} disabled />
            <p className="mt-1 text-xs text-text-muted">Contact support to change your email address.</p>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
