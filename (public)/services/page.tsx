import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ServicesGrid } from '@/components/public/ServicesGrid';
import { SkeletonTable } from '@/components/shared/States';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Browse our full menu of barbering services.',
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">What we offer</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Our Services</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Every service is performed by a licensed master barber. Prices include consultation.
      </p>

      <div className="mt-10">
        <Suspense fallback={<SkeletonTable rows={3} cols={3} />}>
          <ServicesGrid />
        </Suspense>
      </div>
    </div>
  );
}
