import type { Metadata } from 'next';
import { ReviewsModerationTable } from '@/components/admin/ReviewsModerationTable';

export const metadata: Metadata = { title: 'Reviews | Admin' };

export default function AdminReviewsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Reviews</h1>
      <p className="mt-1 text-text-secondary">Approve, reject, and manage customer reviews.</p>
      <div className="mt-8">
        <ReviewsModerationTable />
      </div>
    </div>
  );
}
