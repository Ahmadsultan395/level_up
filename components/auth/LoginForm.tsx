'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    const result = await signIn('credentials', {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setFormError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success('Welcome back!');
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Log in to manage your appointments.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-text-secondary">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-text-secondary">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          </div>

          {formError && <p className="text-sm text-status-danger">{formError}</p>}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-gold hover:text-gold-bright">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
