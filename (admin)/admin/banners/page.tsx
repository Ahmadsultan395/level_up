import type { Metadata } from 'next';
import { BannerManager } from '@/components/admin/BannerManager';

export const metadata: Metadata = { title: 'Banners | Admin' };

export default function AdminBannersPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Banners</h1>
      <p className="mt-1 text-text-secondary">Manage hero and promotional banners.</p>
      <div className="mt-8">
        <BannerManager />
      </div>
    </div>
  );
}
