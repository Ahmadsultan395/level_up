import type { Metadata } from 'next';
import { ReviewsGrid } from '@/components/public/ReviewsGrid';

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'What our clients say about their visits.',
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Client feedback</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Reviews</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Real reviews from customers after their appointment.
      </p>

      <div className="mt-10">
        <ReviewsGrid />
      </div>
    </div>
  );
}
