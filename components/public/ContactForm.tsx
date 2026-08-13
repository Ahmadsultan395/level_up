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
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Please write at least 10 characters'),
});
type ContactInput = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(schema) });

  async function onSubmit(values: ContactInput) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error || 'Something went wrong.');
      return;
    }

    toast.success("Message sent! We'll be in touch soon.");
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
              <label className="mb-1.5 block text-sm text-text-secondary">Subject</label>
              <Input {...register('subject')} error={errors.subject?.message} placeholder="How can we help?" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Message</label>
            <textarea
              {...register('message')}
              rows={5}
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
              placeholder="Tell us more..."
            />
            {errors.message && <p className="mt-1 text-xs text-status-danger">{errors.message.message}</p>}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Send Message
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
