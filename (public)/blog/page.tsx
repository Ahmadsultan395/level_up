import type { Metadata } from 'next';
import { BlogsGrid } from '@/components/public/BlogsGrid';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Grooming tips, style guides, and news from the shop.',
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">The journal</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Blog</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Grooming tips, style guides, and news from the shop.
      </p>

      <div className="mt-10">
        <BlogsGrid />
      </div>
    </div>
  );
}
