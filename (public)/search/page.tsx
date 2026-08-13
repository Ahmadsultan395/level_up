import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/public/SearchResults';
import { SkeletonTable } from '@/components/shared/States';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search services, packages, barbers, and articles.',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Find what you need</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Search</h1>

      <div className="mt-10">
        <Suspense fallback={<SkeletonTable rows={4} cols={1} />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
