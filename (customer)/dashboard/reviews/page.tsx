import type { Metadata } from 'next';
import { MyReviews } from '@/components/customer/MyReviews';

export const metadata: Metadata = { title: 'My Reviews' };

export default function DashboardReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Reviews</h1>
      <p className="mt-1 text-text-secondary">Share feedback on your completed visits.</p>

      <div className="mt-8">
        <MyReviews />
      </div>
    </div>
  );
}
