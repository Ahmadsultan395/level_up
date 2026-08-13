import type { Metadata } from 'next';
import { MyGallery } from '@/components/customer/MyGallery';

export const metadata: Metadata = { title: 'My Gallery' };

export default function DashboardGalleryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Gallery</h1>
      <p className="mt-1 text-text-secondary">Share your look — photos are reviewed before going public.</p>

      <div className="mt-8">
        <MyGallery />
      </div>
    </div>
  );
}
