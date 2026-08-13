import type { Metadata } from 'next';
import { TestimonialsModerationTable } from '@/components/admin/TestimonialsModerationTable';

export const metadata: Metadata = { title: 'Testimonials | Admin' };

export default function AdminTestimonialsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Testimonials</h1>
      <p className="mt-1 text-text-secondary">Approve, feature, or add testimonials.</p>
      <div className="mt-8">
        <TestimonialsModerationTable />
      </div>
    </div>
  );
}
