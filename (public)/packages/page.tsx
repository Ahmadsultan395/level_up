import type { Metadata } from 'next';
import { PackagesGrid } from '@/components/public/PackagesGrid';

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Bundled service packages at a better price.',
};

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Bundle & save</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Packages</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Combine our most popular services into one seamless appointment.
      </p>

      <div className="mt-10">
        <PackagesGrid />
      </div>
    </div>
  );
}
