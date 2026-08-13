import type { Metadata } from 'next';
import { AdminGalleryGrid } from '@/components/admin/AdminGalleryGrid';

export const metadata: Metadata = { title: 'Gallery | Admin' };

export default function AdminGalleryPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Gallery</h1>
      <p className="mt-1 text-text-secondary">Manage photos, including customer submissions.</p>
      <div className="mt-8">
        <AdminGalleryGrid />
      </div>
    </div>
  );
}
