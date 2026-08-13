import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/public/GalleryGrid';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A look at our work.',
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Our work</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Gallery</h1>
      <p className="mt-3 max-w-xl text-text-secondary">A look at the cuts, styles, and craft we&apos;re proud of.</p>

      <div className="mt-10">
        <GalleryGrid />
      </div>
    </div>
  );
}
