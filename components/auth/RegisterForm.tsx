'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '@/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setFormError(null);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await res.json();

    if (!res.ok) {
      setFormError(body.error);
      toast.error(body.error);
      return;
    }

    // Auto sign-in right after registration
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.success('Account created — please log in.');
      router.push('/login');
      return;
    }

    toast.success('Account created!');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Create your account</h1>
          <p className="mt-1 text-sm text-text-muted">Book appointments and track your history.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-text-secondary">
              Full name
            </label>
            <Input id="name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-text-secondary">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm text-text-secondary">
              Phone <span className="text-text-muted">(optional)</span>
            </label>
            <Input id="phone" type="tel" placeholder="+1 555 000 0000" error={errors.phone?.message} {...register('phone')} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-text-secondary">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-text-secondary">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {formError && <p className="text-sm text-status-danger">{formError}</p>}

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:text-gold-bright">
            Log in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
