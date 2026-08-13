import type { Metadata } from 'next';
import { WishlistGrid } from '@/components/customer/WishlistGrid';

export const metadata: Metadata = { title: 'Wishlist' };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Wishlist</h1>
      <p className="mt-1 text-text-secondary">Services you&apos;ve saved for later.</p>

      <div className="mt-8">
        <WishlistGrid />
      </div>
    </div>
  );
}
