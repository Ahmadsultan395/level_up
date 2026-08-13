import type { Metadata } from 'next';
import { CouponsManager } from '@/components/admin/CouponsManager';

export const metadata: Metadata = { title: 'Coupons | Admin' };

export default function AdminCouponsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Coupons</h1>
      <p className="mt-1 text-text-secondary">Create and manage discount codes.</p>
      <div className="mt-8">
        <CouponsManager />
      </div>
    </div>
  );
}
