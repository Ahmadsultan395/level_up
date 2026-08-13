import type { Metadata } from 'next';
import { TestimonialsGrid } from '@/components/public/TestimonialsGrid';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Stories from our happy clients.',
};

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Kind words</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Testimonials</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Stories from the people who trust us with their style.
      </p>

      <div className="mt-10">
        <TestimonialsGrid />
      </div>
    </div>
  );
}
