'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  position: z.string().min(2, 'Position is required'),
  message: z.string().min(10, 'Tell us a bit about yourself'),
  resumeUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});
type ApplyInput = z.infer<typeof schema>;

export function CareerApplyForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyInput>({ resolver: zodResolver(schema) });

  async function onSubmit(values: ApplyInput) {
    const res = await fetch('/api/careers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error || 'Something went wrong.');
      return;
    }

    toast.success("Application received! We'll be in touch.");
    reset();
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Name</label>
              <Input {...register('name')} error={errors.name?.message} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
              <Input {...register('email')} type="email" error={errors.email?.message} placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Phone <span className="text-text-muted">(optional)</span>
              </label>
              <Input {...register('phone')} type="tel" placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Position</label>
              <Input {...register('position')} error={errors.position?.message} placeholder="e.g. Master Barber" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Resume link <span className="text-text-muted">(optional)</span>
            </label>
            <Input {...register('resumeUrl')} error={errors.resumeUrl?.message} placeholder="https://..." />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Tell us about yourself</label>
            <textarea
              {...register('message')}
              rows={5}
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
              placeholder="Experience, availability, why you'd like to join..."
            />
            {errors.message && <p className="mt-1 text-xs text-status-danger">{errors.message.message}</p>}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Submit Application
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
