'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { changePasswordSchema, type ChangePasswordInput } from '@/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    const res = await fetch('/api/customers/me/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json();

    if (!res.ok) {
      toast.error(body.error || 'Could not change password');
      return;
    }

    toast.success('Password changed successfully');
    reset();
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Current password</label>
            <Input type="password" {...register('currentPassword')} error={errors.currentPassword?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">New password</label>
            <Input type="password" {...register('newPassword')} error={errors.newPassword?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Confirm new password</label>
            <Input type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Update Password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
